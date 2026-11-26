"""Prompt-v3 answer format (one corrected line per OCR line ID) and its adapter
to the regions/blocks form that merge.py and vulgate.py read.

v3 answer (enforced by SCHEMA3):
  lines:      every printed line, in reading order, each {id, region, text, conf, flags}
              id = the OCR line ID it corrects, or "+<id of the line before>" (one or more
              "+") for a printed line the OCR missed
  dropped:    OCR line IDs that are not text on the page (noise, show-through), with a reason
  paragraphs: {region, first, last, kind, lemma, normalized}: the printed paragraphs, by line IDs
  page_notes
"""
import re

REGIONS = ["head", "full", "col_a", "col_b", "margin_left", "margin_right", "gutter", "foot"]
FLAG_TYPES = ["unsure", "ocr_copy", "greek", "hebrew", "other_script", "unreadable_note"]

FLAG3 = {"type": "object", "properties": {
    "word": {"type": "string"}, "normalized_word": {"type": "string"}, "reason": {"type": "string"},
    "type": {"type": "string", "enum": FLAG_TYPES}},
    "required": ["word", "normalized_word", "reason", "type"], "additionalProperties": False}
LINE3 = {"type": "object", "properties": {
    "id": {"type": "string"},
    "region": {"type": "string", "enum": REGIONS},
    "text": {"type": "string"},
    "conf": {"type": "string", "enum": ["sure", "check", "unsure"]},
    "flags": {"type": "array", "items": FLAG3}},
    "required": ["id", "region", "text", "conf", "flags"], "additionalProperties": False}
PARA3 = {"type": "object", "properties": {
    "region": {"type": "string", "enum": REGIONS},
    "first": {"type": "string"}, "last": {"type": "string"},
    "kind": {"type": "string", "enum": ["heading", "lemma", "text", "note", "letter", "foot"]},
    "lemma": {"type": "string"}, "normalized": {"type": "string"}},
    "required": ["region", "first", "last", "kind", "lemma", "normalized"], "additionalProperties": False}
SCHEMA3 = {"type": "object", "properties": {
    "lines": {"type": "array", "items": LINE3},
    "dropped": {"type": "array", "items": {"type": "object", "properties": {
        "id": {"type": "string"}, "reason": {"type": "string"}},
        "required": ["id", "reason"], "additionalProperties": False}},
    "paragraphs": {"type": "array", "items": PARA3},
    "page_notes": {"type": "string"}},
    "required": ["lines", "dropped", "paragraphs", "page_notes"], "additionalProperties": False}

_REGION_V2 = {"gutter": "margin_left"}       # merge treats gutter letters as notes (kind letter)


def to_blocks(ans):
    """v3 answer -> {"regions": [{region, blocks: [{kind, lemma, margin_anchor, lines, normalized,
    flags, line_ids, conf}]}], "page_notes", "_v3": True}. Lines not covered by a paragraph become
    their own paragraph (normalized = the line with long s resolved)."""
    lines = ans.get("lines", [])
    pos = {L["id"]: k for k, L in enumerate(lines)}
    used = set()
    order = []                               # (position of first line, region, block)

    def add_block(region, kind, lemma, idxs, normalized):
        anchor = ""
        if region in ("margin_left", "margin_right", "gutter"):
            anchor = lines[idxs[0]]["id"]
        b = {"kind": kind if region != "gutter" else "letter", "lemma": lemma, "margin_anchor": anchor,
             "lines": [lines[k]["text"] for k in idxs], "line_ids": [lines[k]["id"] for k in idxs],
             "conf": [lines[k].get("conf", "sure") for k in idxs], "normalized": normalized, "flags": []}
        for li, k in enumerate(idxs):
            for f in lines[k].get("flags", []):
                b["flags"].append({**f, "line": li + 1, "y_pct": None})
        order.append((idxs[0], _REGION_V2.get(region, region), b))

    paras = sorted(ans.get("paragraphs", []), key=lambda p: pos.get(p["first"], 10 ** 6))
    for p in paras:
        a, z = pos.get(p["first"]), pos.get(p["last"])
        if a is None or z is None or z < a:
            continue
        idxs = [k for k in range(a, z + 1) if lines[k]["region"] == p["region"] and k not in used]
        if not idxs:
            continue
        used.update(idxs)
        rz = lines[z]["region"]
        body = ("full", "col_a", "col_b")
        if rz != p["region"] and p["region"] in body and rz in body:
            # a paragraph that runs on from the left column into the right one: one block per column,
            # the normalized words split where the printed words split
            more = [k for k in range(a, z + 1) if lines[k]["region"] == rz and k not in used]
            used.update(more)
            words = p.get("normalized", "").split()
            na = len(re.sub(r"-\s+", "", " ".join(lines[k]["text"] for k in idxs)).split())
            add_block(p["region"], p["kind"], p.get("lemma", ""), idxs, " ".join(words[:na]))
            add_block(rz, "text", "", more, " ".join(words[na:]))
            continue
        add_block(p["region"], p["kind"], p.get("lemma", ""), idxs, p.get("normalized", ""))
    for k, L in enumerate(lines):          # orphans
        if k in used:
            continue
        kind = {"head": "heading", "foot": "foot", "gutter": "letter"}.get(L["region"], "note" if L["region"].startswith("margin") else "text")
        add_block(L["region"], kind, "", [k], re.sub(r"ſ", "s", L["text"]))
    # runs of consecutive regions in reading order (full band, col a, col b, full band, ...)
    regions = []
    for _, rg, b in sorted(order, key=lambda t: t[0]):
        if regions and regions[-1]["region"] == rg:
            regions[-1]["blocks"].append(b)
        else:
            regions.append({"region": rg, "blocks": [b]})
    return {"regions": regions, "page_notes": ans.get("page_notes", ""), "_v3": True}


def coverage(ans, ocr_ids):
    """Share of OCR line IDs the answer accounts for (as a line or as dropped)."""
    got = {L["id"] for L in ans.get("lines", [])} | {d["id"] for d in ans.get("dropped", [])}
    ids = [i for i in ocr_ids]
    missing = [i for i in ids if i not in got]
    return (1 - len(missing) / len(ids)) if ids else 1.0, missing
