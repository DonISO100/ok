#!/usr/bin/env python3
"""Sonnet full-page proofread via the Message Batches API, with flags.
  python3 proofread2.py submit 0021 0050     -> submits a batch, prints id (saved in batches.json)
  python3 proofread2.py submit-range 0020 0103 [--skip 0021,0050]
  python3 proofread2.py collect BATCH_ID
"""
import anthropic, base64, io, json, os, sys, time
from PIL import Image
OUT = "/workspace/maldonatus-proofread"
SCANS = "/home/box/commentaria/maldonatus-evangelia/scans/bsb11059226_tom1_1596/"
PAGES = "/workspace/ok-maldonatus/maldonatus/reader/data/pages/"
MODEL = "claude-sonnet-5-5"
PRICE_BATCH = (1.0, 5.0)

SYSTEM = """You are a meticulous paleographer-proofreader transcribing a printed Latin book: Juan Maldonado S.J., \
Commentarii in quatuor Evangelistas (Pont-à-Mousson, 1596), folio, set in roman and italic type of the period.

You are given (1) an overview of one printed page, (2) the same page as three full-width horizontal bands at \
near-native resolution (consecutive bands overlap by a strip: lines in the overlap appear twice, transcribe them \
once), and (3) the existing machine OCR of the page, which is poor (long s read as f, tildes read as accents, many \
letter errors, dropped letters). Treat the OCR only as a hint. The IMAGE is the authority.

TRANSCRIBE what is printed. Never invent text and never smooth the author's Latin or spelling. A later, stronger \
reviewer will check everything you flag, so FLAG instead of guessing.

Rules for characters
- Long s: diplomatic version writes ſ; normalized version writes s.
- Nasal tilde: a wavy bar over a vowel (ã ẽ ĩ õ ũ, also over q etc.) marks an omitted m or n. Keep it as a tilde \
in the diplomatic text (nõ, tẽpus, cõtra). NEVER turn a tilde into an acute accent. Straight accents in this book \
(à, è, ù, quòd, tantùm, an acute on a monosyllable) are real printed accents: keep them as printed. In the \
normalized version expand tilde words (nõ -> non, tẽpus -> tempus, cõtra -> contra); also ꝑ -> per, q; -> que, b; -> bus.
- Drop caps: the large initial letter belongs to its word and MUST be transcribed (the OCR usually loses it). \
Write the whole word, e.g. a drop-cap E followed by printed capital Vangelium gives EVangelium; a drop-cap I \
followed by N diebus gives IN diebus.
- Keep u/v and i/j exactly as printed, in both versions. Keep punctuation exactly as printed AND keep the space \
that follows it as printed (write 'opus, quod' not 'opus,quod'; but a printed '.' or ')' directly attached to the \
next word with no gap stays attached).
- Greek, Hebrew and any other non-Latin script: give your BEST ATTEMPT in the original script (never [?] for \
these), and flag it with type greek / hebrew / other_script. Greek may carry accents and breathings.
- A Latin word you really cannot read at all: write [?] (or a partial reading like Euang[?]) and flag it.

Output structure, in reading order. ONE BLOCK PER PRINTED PARAGRAPH (not per column):
- region 'head': the running head (page numbers and 'IN MATTH. CAP. I.').
- region 'full': full-width lines (headings like CAPVT III. and the Vulgate chapter text under them).
- region 'col_a' (left commentary column) then 'col_b' (right column): paragraphs, each starting at an indent or \
after a short last line. A paragraph that continues from the previous column or page is simply its own block. \
A commentary paragraph usually opens with a lemma: the quoted Gospel phrase closed by ')' (maybe with a verse \
number): kind 'lemma' and copy the lemma phrase into 'lemma' (empty string otherwise).
- region 'margin_left' / 'margin_right': marginal notes (scripture references, small type) as kind 'note', and \
the section letters A, B, C... printed in the gutter as kind 'letter'. For every note and letter set \
'margin_anchor' to the first 3-4 words of the printed text line beside it (empty string for other blocks).
- region 'foot': signature / catchword.
Each block: 'lines' = the diplomatic text, one array item per printed line, keeping end-of-line hyphens as \
printed; 'normalized' = the same paragraph as running text (hyphenated words joined across lines, long s as s, \
abbreviations/tildes expanded, same u/v and i/j).

FLAGS. For each block list in 'flags' EVERY word or short phrase you are not sure of:
- type 'unsure': a letter or word you could not read with confidence in the scan (blur, ink spots, worn type), \
including any word where the correct reading is a guess;
- type 'ocr_copy': a word you kept as the OCR had it but could not verify in the scan, or where the scan seems to \
show something else; also any word that is not a plausible Latin word, abbreviation or proper name (whatever the \
cause);
- type 'greek' / 'hebrew' / 'other_script': every such word or run, always, however sure you are;
- type 'unreadable_note': a marginal note you could read only partly.
Each flag: 'word' = the word exactly as in your diplomatic text (for scripts: the whole run), 'normalized_word' = \
the same in your normalized text, 'reason' = a few words (e.g. 'ink blot over 2nd letter', 'long s vs f', \
'drop cap partly cut', 'worn Greek'), 'line' = the 1-based printed line within the block that holds it, \
'y_pct' = the approximate vertical position of that printed line as a percent (0-100) of the TOTAL page height from \
the top. When in doubt, flag: a wrong guess is worse than a flag."""

FLAG = {"type": "object", "properties": {
    "word": {"type": "string"}, "normalized_word": {"type": "string"}, "reason": {"type": "string"},
    "type": {"type": "string", "enum": ["unsure", "ocr_copy", "greek", "hebrew", "other_script", "unreadable_note"]},
    "line": {"type": "integer"}, "y_pct": {"type": "number"}},
    "required": ["word", "normalized_word", "reason", "type", "line", "y_pct"], "additionalProperties": False}
BLOCK = {"type": "object", "properties": {
    "kind": {"type": "string", "enum": ["heading", "lemma", "text", "note", "letter", "foot"]},
    "lemma": {"type": "string"}, "margin_anchor": {"type": "string"},
    "lines": {"type": "array", "items": {"type": "string"}}, "normalized": {"type": "string"},
    "flags": {"type": "array", "items": FLAG}},
    "required": ["kind", "lemma", "margin_anchor", "lines", "normalized", "flags"], "additionalProperties": False}
SCHEMA = {"type": "object", "properties": {
    "regions": {"type": "array", "items": {"type": "object", "properties": {
        "region": {"type": "string", "enum": ["head", "full", "col_a", "col_b", "margin_left", "margin_right", "foot"]},
        "blocks": {"type": "array", "items": BLOCK}},
        "required": ["region", "blocks"], "additionalProperties": False}},
    "page_notes": {"type": "string"}},
    "required": ["regions", "page_notes"], "additionalProperties": False}

def b64(im, q=88):
    b = io.BytesIO(); im.save(b, "JPEG", quality=q); return base64.b64encode(b.getvalue()).decode()

def images(img):
    im = Image.open(f"{SCANS}{img}.jpg").convert("RGB")
    W, H = im.size
    over = im.copy(); over.thumbnail((1200, 1800))
    parts = [("Overview of the whole page (low resolution, for layout only)", over)]
    n, ov = 3, 140; step = H / n
    for i in range(n):
        y0 = max(0, int(i * step) - (ov if i else 0)); y1 = min(H, int((i + 1) * step) + (ov if i < n - 1 else 0))
        parts.append((f"Band {i+1} of {n}: from {100*y0/H:.0f}% to {100*y1/H:.0f}% of the total page height, full width", im.crop((0, y0, W, y1))))
    return parts

def old_text(img):
    d = json.load(open(f"{PAGES}tom1-{img}.json"))
    out = [f"[head] {d['head']}"]
    for g in d["columns"]:
        for c in g["cols"]:
            lab = {"head": "head", "full": "full width"}.get(g["t"]) or f"column {c.get('n')}"
            out.append(f"--- {lab} ---"); out += [L["d"] for L in c["lines"]]
    return "\n".join(out)

def request(img):
    content = []
    for label, im in images(img):
        content.append({"type": "text", "text": label})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64(im)}})
    content.append({"type": "text", "text": "Existing machine OCR of this page (poor; use only as a hint):\n\n" + old_text(img) +
                    "\n\nTranscribe the page now as JSON, flagging everything you are unsure of."})
    return {"custom_id": f"img{img}", "params": {"model": MODEL, "max_tokens": 16000, "system": SYSTEM,
            "output_config": {"effort": "medium", "format": {"type": "json_schema", "schema": SCHEMA}},
            "messages": [{"role": "user", "content": content}]}}

def reg(bid, imgs):
    p = f"{OUT}/batches.json"; d = json.load(open(p)) if os.path.exists(p) else {}
    d[bid] = imgs; json.dump(d, open(p, "w"))

def submit(imgs):
    c = anthropic.Anthropic()
    reqs = [request(i) for i in imgs]
    mb = sum(len(json.dumps(r)) for r in reqs) / 1e6
    print(f"{len(reqs)} requests, {mb:.1f} MB")
    b = c.messages.batches.create(requests=reqs)
    reg(b.id, imgs); print("batch", b.id, b.processing_status)

def collect(bid):
    c = anthropic.Anthropic()
    b = c.messages.batches.retrieve(bid); print(b.processing_status, b.request_counts)
    if b.processing_status != "ended": return False
    os.makedirs(f"{OUT}/raw", exist_ok=True); tin = tout = 0; bad = []
    for r in c.messages.batches.results(bid):
        img = r.custom_id[3:]
        if r.result.type != "succeeded":
            bad.append((img, r.result.type)); continue
        m = r.result.message; u = m.usage; tin += u.input_tokens; tout += u.output_tokens
        txt = next(x.text for x in m.content if x.type == "text")
        json.dump({"img": img, "stop": m.stop_reason, "in": u.input_tokens, "out": u.output_tokens, "text": txt},
                  open(f"{OUT}/raw/{img}.json", "w"))
        if m.stop_reason != "end_turn": bad.append((img, m.stop_reason))
    cost = tin / 1e6 * PRICE_BATCH[0] + tout / 1e6 * PRICE_BATCH[1]
    print(f"tokens in {tin} out {tout} cost ${cost:.3f}; problems {bad}")
    json.dump({"in": tin, "out": tout, "cost": cost, "bad": bad}, open(f"{OUT}/raw/_usage_{bid}.json", "w"))
    return True

if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "submit": submit(a[1:])
    elif a[0] == "submit-range":
        skip = set(a[a.index("--skip") + 1].split(",")) if "--skip" in a else set()
        L = [f"{i:04d}" for i in range(int(a[1]), int(a[2]) + 1) if f"{i:04d}" not in skip]
        for k in range(0, len(L), 28): submit(L[k:k + 28])   # 256 MB batch limit
    elif a[0] == "collect": sys.exit(0 if collect(a[1]) else 3)
