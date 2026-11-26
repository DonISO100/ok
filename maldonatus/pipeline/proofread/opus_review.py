#!/usr/bin/env python3
"""Opus review of the flagged words in pipeline/review-queue.json (Message Batches API).

Each request covers up to 20 flags of one page. Each flag comes with a crop of its
column, from 1.6 lines above to 1.6 lines below the line (merge.py's crop_box, from the
OCR word boxes), the flagged word outlined in red, the line and its neighbours as
transcribed, and the reason it was flagged. Opus answers per flag: confirm (the
transcription is right), correct (with the right reading, diplomatic and normalized),
unreadable, or not_found (the word is not in the crop).

  python3 opus_review.py run                       # every open flag
  python3 opus_review.py run --pages 0050-0060 --types unsure,ocr_copy
  python3 opus_review.py run --dry-run             # build requests and crops, estimate cost, call nothing
  python3 opus_review.py collect BATCH_ID          # resume
Decisions go to pipeline/review-decisions.json (merged with earlier ones); then merge.py
runs and applies them to the reader data (corrections replace the word, confirmed flags
disappear, unreadable ones stay marked as reviewed).
Options: --model (default claude-opus-5-5), --effort (default medium), --per-request 20,
--limit N (first N flags only), --include-reviewed, --no-merge.
"""
import argparse
import base64
import collections
import io
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from config import CFG  # noqa: E402
from pages import parse_pages  # noqa: E402
from fixes import SYMBOLS  # noqa: E402
import batchlib  # noqa: E402

MODEL = "claude-opus-5-5"
SYMBOL_TABLE = "\n".join(f"  {s:<14} {what}  (normalized: {norm})" for s, what, norm in SYMBOLS)

SYSTEM = f"""You are an expert in early modern Latin printing reviewing doubtful readings in a transcription of \
Juan Maldonado S.J., Commentarii in quatuor Evangelistas (Pont-à-Mousson, 1596). For each flagged word you get a \
crop of the scan (the flagged word is outlined in red when its position is known), the line as transcribed with \
the lines before and after, and why it was flagged. The SCAN is the authority.

Answer for every flag id:
- verdict "confirm": the transcribed word is exactly what is printed (diplomatic) and the normalized form is right;
- verdict "correct": give the printed word in "diplomatic" and its expanded form in "normalized";
- verdict "unreadable": the print is too damaged to read with confidence (give your best guess in note);
- verdict "not_found": the word is not in the crop.
"diplomatic" and "normalized" replace exactly the flagged word (keep any punctuation that belongs to it). \
For confirm, repeat the transcribed forms.

Diplomatic conventions: long s ſ; nasal tilde as a tilde (nõ, tẽpus; an acute on a final vowel is almost always \
this tilde, while grave accents à quòd tantùm and the acute before an enclitic ideóque are real); u/v and i/j as \
printed; only these abbreviation signs:
{SYMBOL_TABLE}
Normalized: s for ſ, every abbreviation expanded (nõ -> non, q; -> que, ꝰ -> us), same u/v and i/j.
Greek and Hebrew: correct accents, breathings and letters against the scan; normalized = the same run.
Flags of type vulgate_diff: the chapter text differs from the Clementine Vulgate there; the print may really \
differ (the author's text, a misprint): read the scan, do not just copy the Vulgate.
Flags of type line_unsure: the whole line is in question; give the corrected whole line in diplomatic and \
normalized (or confirm)."""

SCHEMA = {"type": "object", "properties": {"items": {"type": "array", "items": {"type": "object", "properties": {
    "id": {"type": "string"},
    "verdict": {"type": "string", "enum": ["confirm", "correct", "unreadable", "not_found"]},
    "diplomatic": {"type": "string"}, "normalized": {"type": "string"}, "note": {"type": "string"}},
    "required": ["id", "verdict", "diplomatic", "normalized", "note"], "additionalProperties": False}}},
    "required": ["items"], "additionalProperties": False}


def b64(im):
    b = io.BytesIO(); im.save(b, "JPEG", quality=88); return base64.b64encode(b.getvalue()).decode()


def item_text(it):
    t = (f"Flag {it['id']} ({it['type']}): word «{it['word']}» (normalized «{it['normalized_word']}»). "
         f"Reason: {it['reason'] or '-'}.\n")
    if it.get("prev_line"):
        t += f"  line before: {it['prev_line']}\n"
    t += f"  LINE:        {it['line_text']}\n"
    if it.get("next_line"):
        t += f"  line after:  {it['next_line']}\n"
    if it.get("bbox_source") in ("approx-y", "none") or not it.get("crop_box"):
        t += "  (position approximate: look for the word in the crop)\n"
    return t


def requests_for(items, model, effort, per):
    from PIL import Image
    from crops import crop
    by = collections.defaultdict(list)
    for it in items:
        by[it["img"]].append(it)
    reqs, est_in = [], 0
    for img, its in sorted(by.items()):
        im = Image.open(CFG.scan(img))
        for k in range(0, len(its), per):
            part = its[k:k + per]
            content = []
            for it in part:
                if it.get("crop_box"):
                    c = crop(im, it, max_w=1400)
                    content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64(c)}})
                    est_in += batchlib.image_tokens(*c.size)
                content.append({"type": "text", "text": item_text(it)})
                est_in += len(item_text(it)) // 3
            content.append({"type": "text", "text": f"Answer for all {len(part)} flags of this request, by id."})
            reqs.append({"custom_id": f"rv-{img}-{k // per:02d}", "params": {
                "model": model, "max_tokens": 16000, "system": SYSTEM,
                "output_config": {"effort": effort, "format": {"type": "json_schema", "schema": SCHEMA}},
                "messages": [{"role": "user", "content": content}]}})
            est_in += len(SYSTEM) // 3
    return reqs, est_in


def collect(batch_ids, model, queue_ids):
    dec = json.load(open(CFG.decisions)) if os.path.exists(CFG.decisions) else {}
    tin = tout = 0
    got = collections.Counter(); bad = []
    for bid in batch_ids:
        for cid, r in batchlib.results(bid):
            if not r["ok"]:
                bad.append((cid, r["error"])); continue
            tin += r["in"]; tout += r["out"]
            try:
                ans = json.loads(r["text"])
            except ValueError:
                bad.append((cid, "invalid JSON")); continue
            for x in ans.get("items", []):
                if x["id"] not in queue_ids:
                    continue
                dec[x["id"]] = {**x, "model": r.get("model"), "item": queue_ids[x["id"]]}
                got[x["verdict"]] += 1
    json.dump(dec, open(CFG.decisions, "w"), ensure_ascii=False, indent=1)
    print(f"decisions: {dict(got)}; failed requests: {bad or 'none'}")
    print(f"tokens in {tin:,} out {tout:,}: ${batchlib.cost(model, tin, tout):.2f}")
    return bad


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["run", "collect"])
    ap.add_argument("batch", nargs="*")
    ap.add_argument("--pages", default="")
    ap.add_argument("--types", default="", help="comma list, e.g. unsure,ocr_copy,greek,hebrew,vulgate_diff,line_unsure")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--effort", default="medium", choices=["low", "medium", "high", "xhigh", "max"])
    ap.add_argument("--per-request", type=int, default=20)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--include-reviewed", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-merge", action="store_true")
    a = ap.parse_args()
    q = json.load(open(CFG.queue))
    qids = {it["id"]: {k: it[k] for k in ("img", "block", "line", "word", "type")} for it in q}
    if a.cmd == "collect":
        batchlib.wait(a.batch)
        collect(a.batch, a.model, qids)
    else:
        done = json.load(open(CFG.decisions)) if os.path.exists(CFG.decisions) else {}
        items = [it for it in q if (a.include_reviewed or (not it.get("reviewed") and it["id"] not in done))]
        if a.pages:
            want = set(parse_pages(a.pages)); items = [it for it in items if it["img"] in want]
        if a.types:
            want = set(a.types.split(",")); items = [it for it in items if it["type"] in want]
        if a.limit:
            items = items[:a.limit]
        if not items:
            sys.exit("no open flags match")
        reqs, est_in = requests_for(items, a.model, a.effort, a.per_request)
        est_out = 350 * len(items)          # answer + thinking per flag at medium effort (a guess)
        print(f"{len(items)} flags in {len(reqs)} requests ({collections.Counter(i['type'] for i in items)})")
        print(f"estimated ${batchlib.cost(a.model, est_in, est_out):.2f} ({a.model} batch, ~{est_in:,} in / ~{est_out:,} out)")
        if a.dry_run:
            d = os.path.join(CFG.work, "dryrun-review"); os.makedirs(d, exist_ok=True)
            s = json.loads(json.dumps(reqs[0]))
            for c in s["params"]["messages"][0]["content"]:
                if c["type"] == "image":
                    c["source"]["data"] = f"<{len(c['source']['data']) // 1024} KB base64>"
            json.dump(s, open(os.path.join(d, "sample-request.json"), "w"), ensure_ascii=False, indent=1)
            print(f"dry run: no API call. Sample request in {d}")
            return
        ids = batchlib.submit(reqs, "opus_review")
        batchlib.wait(ids)
        collect(ids, a.model, qids)
    if not a.no_merge:
        subprocess.run([sys.executable, os.path.join(HERE, "merge.py")], check=True)


if __name__ == "__main__":
    main()
