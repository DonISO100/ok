#!/usr/bin/env python3
"""Line-ID proofread (prompt v3) through the Message Batches API.

The model gets each OCR line with its ID and returns one corrected line per ID,
so every line keeps its pixel box, nothing can silently go missing, and the
reader's table of contents maps across exactly. Images are the text regions at
full scan resolution: each column, the full-width bands, the margins and the
gutter, cut into tiles under the 2576 px / 3.75 MP limit, plus a small overview.

  python3 proofread3.py run --pages 0032,0065,0063            # submit, wait, collect, validate, merge, score
  python3 proofread3.py run --pages 0032,0065,0063 --dry-run  # build everything, call nothing
  python3 proofread3.py collect BATCH_ID                      # resume a run whose batch was submitted
Options: --model (default claude-sonnet-5-5), --effort (default medium), --retries N (default 1:
pages that fail the completeness check are resubmitted once), --no-merge.

Needs ANTHROPIC_API_KEY (not for --dry-run), the scans (MALD_SCANS), the OCR word
pack (MALD_PACK) and, for the merge, the Hunspell dictionary (MALD_DICT). See config.py.
"""
import argparse
import base64
import io
import json
import math
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from config import CFG  # noqa: E402
from pages import parse_pages  # noqa: E402
from adapt3 import SCHEMA3, coverage  # noqa: E402
from fixes import SYMBOLS  # noqa: E402
import batchlib  # noqa: E402

PROMPT_VERSION = "v3"
MODEL = "claude-sonnet-5-5"
TILE_H = 1800                 # tile height in scan pixels (columns are ~1300 px wide)
MAX_EDGE = 2576

SYMBOL_TABLE = "\n".join(f"  {s:<14} {what}  (normalized: {norm})" for s, what, norm in SYMBOLS)

SYSTEM = f"""You are a meticulous paleographer-proofreader. You correct the machine OCR of a printed Latin \
book, line by line: Juan Maldonado S.J., Commentarii in quatuor Evangelistas (Pont-à-Mousson, 1596), folio, \
roman and italic type, two columns of commentary with marginal references, chapters opening with the Vulgate \
text set full width.

INPUT
- A small overview of the page (layout only).
- The text regions at full resolution: each column, each full-width band, the left and right margins and \
the gutter between the columns, as numbered tiles. Consecutive tiles of a region overlap a little; each \
tile lists the OCR line IDs it shows.
- The OCR, one line per ID, grouped by region: "[0050a2.12] text". IDs follow reading order.

THE IMAGE IS THE AUTHORITY. The OCR is poor (long s read as f, tildes read as acute accents, dropped and \
wrong letters, lost drop caps). Correct each line to exactly what is printed. Never invent text, never \
modernize or smooth the author's Latin.

OUTPUT: one entry in "lines" for EVERY printed line, in reading order:
- "id": the OCR line ID you are correcting. Return every OCR ID exactly once, either in "lines" or in \
"dropped" (with a reason) when it is not text of this page (show-through from the other side, a stain, a \
stray mark). Never skip a line and never stop early: a partial answer is useless.
- A printed line the OCR missed entirely: id "+" followed by the ID of the line before it ("+0050a2.12"; \
a second one "++0050a2.12"). If the OCR fused two printed lines into one ID, return the first under that ID \
and the second as "+ID". If it split one printed line into two IDs, return the whole line under the first \
and put the second in "dropped" with reason "merged into <id>".
- "region": head, full, col_a, col_b, margin_left, margin_right, gutter (the section letters A B C... \
printed between the columns) or foot (signature, catchword). Keep each ID in its OCR region unless the \
image clearly shows otherwise.
- "text": the line exactly as printed (diplomatic), keeping end-of-line hyphens and the line break.
- "conf": "sure" if every letter is clearly legible and checked against the image; "check" if the line has \
a doubtful spot; "unsure" if a substantial part is hard to read. Be honest: lines marked sure must be right.
- "flags": every word you are not sure of (see FLAGS).

CHARACTERS (diplomatic text)
- Long s is ſ. Keep u/v and i/j exactly as printed.
- Nasal tilde: a wavy or straight bar over a vowel marks an omitted m or n; write it as a tilde: nõ, tẽpus, \
cõtra, Euãgeliũ. RULE: an acute accent on the last vowel of a word of two or more syllables, or on \
the vowel before m/n-less endings, is almost always this tilde (nó = nõ, tamé = tamẽ, etiá = etiã, \
Chriſtú = Chriſtũ). The book's real accents are grave (à, è, quòd, tantùm, ſanè) and the acute on the \
syllable before an enclitic (ideóque, quámque, pleríque): keep those as printed.
- Abbreviation signs: use ONLY these characters, nothing else (no ⁹ ᵒ ʒ ç ẹ or other look-alikes):
{SYMBOL_TABLE}
- z is z (not ʒ). A printed r is r.
- Punctuation as printed, with the space that follows it as printed: "opus, quod" (comma, space); a \
reference like "Matth.5.3." stays as printed.
- Drop caps: the large initial belongs to its word and must be written (EVangelium, IN diebus).
- Greek, Hebrew and any other script: your best reading in that script (never [?]) and always a flag.
- A Latin word you cannot read: [?] for the unreadable part (Euang[?]) and a flag.

PARAGRAPHS (required, and the page is incomplete without them): list EVERY printed paragraph of the page, each body line in \
exactly one paragraph, in "paragraphs" by their first and last line IDs (a paragraph \
starts at an indent or after a short last line; a paragraph continuing from the previous column or page \
is its own paragraph). Kinds: heading (running head, CAPVT III., IN CAPVT III.), lemma (a commentary \
paragraph opening with the quoted Gospel phrase closed by ")", copied into "lemma"), text, note (marginal \
note), letter (gutter letter), foot. "normalized" is the whole paragraph as running text: hyphenated words \
joined, ſ as s, every abbreviation expanded (nõ -> non, tẽpus -> tempus, q; -> que, ꝰ -> us, ꝑ -> per, \
ę -> æ), the same u/v and i/j, one space after each punctuation mark. Write the whole paragraph: never \
shorten or summarize it.

FLAGS (per line): "word" exactly as in your text, "normalized_word" as in the normalized text, "reason" in \
a few words, "type":
- unsure: a letter or word not read with confidence (blur, ink, worn type, long s vs f);
- ocr_copy: kept as the OCR had it without being able to verify it, or not a plausible Latin word, \
abbreviation or name;
- greek / hebrew / other_script: every such run, always;
- unreadable_note: a marginal note read only in part.
When in doubt, flag: a wrong guess is worse than a flag."""


def b64(im, q=90):
    b = io.BytesIO(); im.save(b, "JPEG", quality=q); return base64.b64encode(b.getvalue()).decode()


def _fit(im):
    w, h = im.size
    s = min(1.0, MAX_EDGE / max(w, h), (3.7e6 / (w * h)) ** 0.5)
    return im if s >= 1.0 else im.resize((int(w * s), int(h * s)))


def tiles(pl, im):
    """[(label, PIL image)] for one page: overview + regions at full resolution."""
    from ocrlines import column_boxes, line_height
    W, H = im.size
    lh = line_height(pl)
    out = []
    ov = im.copy(); ov.thumbnail((900, 1400))
    out.append(("Overview of the whole page (low resolution, layout only)", ov))
    boxes = column_boxes(pl)
    regs = pl["regions"]

    def ids_in(region, y0, y1):
        ids = [L["id"] for L in regs.get(region, []) if L.get("box") and y0 <= (L["box"][1] + L["box"][3]) / 2 < y1]
        return f"OCR lines {ids[0]} to {ids[-1]}" if ids else "no OCR lines"

    def cut(region, box, title):
        x0, y0, x1, y1 = box
        n = max(1, math.ceil((y1 - y0) / TILE_H))
        step = (y1 - y0) / n
        ov_ = int(1.5 * lh)
        for i in range(n):
            a = int(y0 + i * step) - (ov_ if i else 0); b = int(y0 + (i + 1) * step) + (ov_ if i < n - 1 else 0)
            a, b = max(0, a), min(H, b)
            lab = f"{title}, tile {i + 1} of {n} (scan pixels x {x0}-{x1}, y {a}-{b}): {ids_in(region, a, b)}"
            out.append((lab, _fit(im.crop((x0, a, x1, b)))))

    # full-width bands: split the 'full' lines into runs separated by the two-column bands
    full = regs.get("full", [])
    runs, cur = [], []
    for L in full:
        if cur and L["box"][1] - cur[-1]["box"][3] > 4 * lh:
            runs.append(cur); cur = []
        cur.append(L)
    if cur:
        runs.append(cur)
    for k, run in enumerate(runs):
        bx = [min(L["box"][0] for L in run) - 30, min(L["box"][1] for L in run) - 30,
              max(L["box"][2] for L in run) + 30, max(L["box"][3] for L in run) + 30]
        bx = [max(0, bx[0]), max(0, bx[1]), min(W, bx[2]), min(H, bx[3])]
        cut("full", bx, f"Full-width band {k + 1}")
    for rg, title in (("head", "Running head"), ("col_a", "Left column (col_a)"), ("col_b", "Right column (col_b)")):
        if rg in boxes:
            cut(rg, boxes[rg], title)
    # margins and gutter: strips over the height of the text block, even where the OCR found nothing
    body = [boxes[r] for r in ("full", "col_a", "col_b") if r in boxes]
    if body:
        top = min(b[1] for b in body); bot = max(b[3] for b in body)
        left = min(b[0] for b in body); right = max(b[2] for b in body)
        if left > 80:
            cut("margin_left", [0, top, min(W, left + 40), bot], "Left margin strip")
        if W - right > 80:
            cut("margin_right", [max(0, right - 40), top, W, bot], "Right margin strip")
        if "col_a" in boxes and "col_b" in boxes:
            g = (boxes["col_a"][2] + boxes["col_b"][0]) // 2
            gt = min(boxes["col_a"][1], boxes["col_b"][1]); gb = max(boxes["col_a"][3], boxes["col_b"][3])
            cut("gutter", [max(0, g - 110), gt, min(W, g + 110), gb], "Gutter strip between the columns")
    return out


def ocr_text(pl):
    names = {"head": "running head", "full": "full-width text", "col_a": "left column (col_a)", "col_b": "right column (col_b)",
             "margin_left": "left margin", "margin_right": "right margin", "gutter": "gutter letters", "foot": "foot"}
    out = []
    for rg, ls in pl["regions"].items():
        if not ls:
            continue
        out.append(f"--- {names[rg]} ---")
        out += [f"[{L['id']}] {L['text']}" for L in ls]
    return "\n".join(out)


def body_ids(pl):
    return [L["id"] for rg, ls in pl["regions"].items() for L in ls]


def request(img, pl, im, model, effort, retry_note=None):
    content = []
    for label, t in tiles(pl, im):
        content.append({"type": "text", "text": label})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64(t)}})
    txt = ("Machine OCR of this page, one line per ID (poor; a hint only):\n\n" + ocr_text(pl) +
           "\n\nCorrect the page now as JSON: every OCR ID once (in lines or dropped), in reading order.")
    if retry_note:
        txt += "\n\n" + retry_note
    content.append({"type": "text", "text": txt})
    return {"custom_id": f"p3-{img}", "params": {
        "model": model, "max_tokens": 32000, "system": SYSTEM,
        "output_config": {"effort": effort, "format": {"type": "json_schema", "schema": SCHEMA3}},
        "messages": [{"role": "user", "content": content}]}}


def load_scan(img):
    from PIL import Image
    return Image.open(CFG.scan(img)).convert("L")


def validate(img, ans, pl, stop):
    """Completeness of one v3 answer: returns (ok, problems)."""
    probs = []
    if stop != "end_turn":
        probs.append(f"stop_reason {stop}")
    cov, missing = coverage(ans, body_ids(pl))
    if cov < 0.97:
        probs.append(f"only {cov:.0%} of OCR line IDs answered; missing {len(missing)}: {', '.join(missing[:12])}")
    ids = [L["id"] for L in ans.get("lines", [])]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        probs.append(f"duplicate ids {sorted(dup)[:8]}")
    import re
    if re.search(r"\b(partial|not transcribed|truncat|omitted the rest|remaining (text|lines))", ans.get("page_notes", ""), re.I):
        probs.append("page notes say the answer is partial")
    pos = {L["id"]: k for k, L in enumerate(ans.get("lines", []))}
    # every body line must belong to a paragraph (a run on the real scans returned none at all for 4 of 7 pages)
    body = [k for k, L in enumerate(ans.get("lines", [])) if L["region"] in ("full", "col_a", "col_b")]
    cov = set()
    for p in ans.get("paragraphs", []):
        a0, z0 = pos.get(p["first"]), pos.get(p["last"])
        if a0 is not None and z0 is not None and z0 >= a0:
            cov |= {k for k in range(a0, z0 + 1) if ans["lines"][k]["region"] in ("full", "col_a", "col_b")}
    if body and len(cov & set(body)) < 0.8 * len(body):
        probs.append(f"paragraphs cover only {len(cov & set(body))} of {len(body)} body lines: list EVERY printed paragraph of the "
                     "page (first and last line ID, kind, normalized text) in \"paragraphs\"")
    for p in ans.get("paragraphs", []):
        a, z = pos.get(p["first"]), pos.get(p["last"])
        if a is None or z is None:
            continue
        if p.get("kind") == "note":
            continue                        # notes are full of abbreviations that expand: not a truncation signal
        # a paragraph can run on from the left column into the right one: count both regions
        regs = {p["region"], ans["lines"][z]["region"]}
        dl = " ".join(L["text"] for L in ans["lines"][a:z + 1] if L["region"] in regs)
        nd, nn = len(dl.split()), len(p.get("normalized", "").split())
        if nd >= 15 and not (0.8 * nd <= nn <= 1.3 * nd):
            probs.append(f"paragraph {p['first']}: normalized has {nn} words for {nd} printed")
    return (not probs), probs


def save_raw(img, r, extra=None):
    os.makedirs(CFG.raw3, exist_ok=True)
    rec = {"img": img, "prompt": PROMPT_VERSION, "model": r.get("model"), "stop": r.get("stop"), "in": r.get("in"),
           "out": r.get("out"), "text": r.get("text", "")}
    rec.update(extra or {})
    json.dump(rec, open(os.path.join(CFG.raw3, f"{img}.json"), "w"), ensure_ascii=False)


def collect(batch_ids, pack, model):
    """Collect results; returns ({img: problems} for failed pages, cost)."""
    from ocrlines import page_lines
    bad, tin, tout = {}, 0, 0
    for bid in batch_ids:
        for cid, r in batchlib.results(bid):
            img = cid.split("-", 1)[1]
            if not r["ok"]:
                bad[img] = [f"request {r['error']}"]; continue
            tin += r["in"]; tout += r["out"]
            try:
                ans = json.loads(r["text"])
            except ValueError:
                bad[img] = ["answer is not valid JSON"]; save_raw(img, r, {"valid": False}); continue
            ok, probs = validate(img, ans, page_lines(pack[img]), r["stop"])
            prev = os.path.join(CFG.raw3, f"{img}.json")
            if not ok and os.path.exists(prev) and json.load(open(prev)).get("valid"):
                print(f"  {img}: new answer incomplete, keeping the earlier valid one"); bad[img] = probs; continue
            save_raw(img, r, {"valid": ok, "problems": probs})
            print(f"  {img}: {'ok' if ok else 'INCOMPLETE: ' + '; '.join(probs)}")
            if not ok:
                bad[img] = probs
    c = batchlib.cost(model, tin, tout)
    print(f"tokens in {tin:,} out {tout:,}: ${c:.2f}")
    return bad, c


def post(pages):
    """Merge into reader data, score against the Vulgate, write the v2/v3 comparison."""
    py = sys.executable
    subprocess.run([py, os.path.join(HERE, "merge.py")], check=True)
    subprocess.run([py, os.path.join(HERE, "vulgate.py"), "--src", "both"], check=False)
    subprocess.run([py, os.path.join(HERE, "compare.py"), "--pages", ",".join(pages)], check=False)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["run", "collect"])
    ap.add_argument("batch", nargs="*", help="batch id(s) for collect")
    ap.add_argument("--pages", default="")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--effort", default="medium", choices=["low", "medium", "high", "xhigh", "max"])
    ap.add_argument("--retries", type=int, default=1)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-merge", action="store_true")
    a = ap.parse_args()
    from ocrlines import load_pack, page_lines
    pack = load_pack()

    if a.cmd == "collect":
        reg = json.load(open(os.path.join(CFG.work, "batches.json")))
        batchlib.wait(a.batch)
        bad, _ = collect(a.batch, pack, a.model)
        pages = sorted({c.split("-", 1)[1] for b in a.batch for c in reg.get(b, {}).get("custom_ids", [])})
        if not a.no_merge:
            post(pages)
        sys.exit(1 if bad else 0)

    pages = parse_pages(a.pages)
    if not pages:
        sys.exit("--pages is required, e.g. --pages 0032,0065,0063 or 0020-0103")
    reqs, est_in = [], 0
    for img in pages:
        if img not in pack:
            sys.exit(f"image {img} is not in the OCR pack")
        pl = page_lines(pack[img])
        im = load_scan(img)
        r = request(img, pl, im, a.model, a.effort)
        reqs.append(r)
        n_img = sum(1 for c in r["params"]["messages"][0]["content"] if c["type"] == "image")
        toks = sum(batchlib.image_tokens(*t.size) for _, t in tiles(pl, im)) + len(SYSTEM) // 3 + len(ocr_text(pl)) // 3
        est_in += toks
        print(f"{img}: {len(body_ids(pl))} OCR lines, {n_img} images, ~{toks:,} input tokens")
    est_out = 11000 * len(pages)        # v2 averaged ~8,000 output tokens per page; v3 adds IDs and conf
    print(f"{len(pages)} pages: estimated ${batchlib.cost(a.model, est_in, est_out):.2f} "
          f"({a.model} batch, ~{est_in:,} in / ~{est_out:,} out; output is a guess)")
    if a.dry_run:
        d = os.path.join(CFG.work, "dryrun3")
        os.makedirs(d, exist_ok=True)
        for img in pages[:3]:
            pl = page_lines(pack[img]); im = load_scan(img)
            for k, (label, t) in enumerate(tiles(pl, im)):
                t.save(os.path.join(d, f"{img}-{k:02d}.jpg"), quality=85)
        sample = json.loads(json.dumps(reqs[0]))
        for c in sample["params"]["messages"][0]["content"]:
            if c["type"] == "image":
                c["source"]["data"] = f"<{len(c['source']['data']) // 1024} KB base64>"
        json.dump(sample, open(os.path.join(d, "sample-request.json"), "w"), ensure_ascii=False, indent=1)
        print(f"dry run: no API call. Sample request and tiles of the first pages in {d}")
        return
    ids = batchlib.submit(reqs, "proofread3")
    batchlib.wait(ids)
    bad, spent = collect(ids, pack, a.model)
    for attempt in range(a.retries):
        if not bad:
            break
        print(f"resubmitting {len(bad)} incomplete page(s): {', '.join(bad)}")
        rq = [request(img, page_lines(pack[img]), load_scan(img), a.model, a.effort,
                      "Your previous answer for this page was incomplete: " + "; ".join(p) +
                      ". Return the complete page this time.") for img, p in bad.items()]
        ids = batchlib.submit(rq, "proofread3-retry")
        batchlib.wait(ids)
        bad, c2 = collect(ids, pack, a.model)
        spent += c2
    print(f"total spent: ${spent:.2f}")
    if bad:
        print("still incomplete (merge keeps the previous data for these):", ", ".join(bad))
    if not a.no_merge:
        post(pages)


if __name__ == "__main__":
    main()
