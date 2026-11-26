#!/usr/bin/env python3
"""Compare the v2 (full-page) and v3 (line-ID) proofreads of some pages.

  python3 compare.py --pages 0032,0065,0039,0043,0056,0072

Prints a table per page (lines, words, flags, lines marked check/unsure, Vulgate errors)
and writes proofread/reports/compare.html: for each page and region, the OCR line, the v2
reading and the v3 reading side by side, with the differences between v2 and v3 marked,
so one column can be checked against the scan by eye. Both versions go through fixes.py
first, as in the reader. No API calls.
"""
import argparse
import difflib
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from config import CFG  # noqa: E402
from pages import parse_pages  # noqa: E402
from adapt3 import to_blocks  # noqa: E402
from fixes import fix_block, Lexicon  # noqa: E402
import vulgate  # noqa: E402

LEX = None


def load(src, img):
    p = os.path.join(CFG.raw2 if src == "v2" else CFG.raw3, f"{img}.json")
    if not os.path.exists(p):
        return None
    J = json.load(open(p))
    d = json.loads(J["text"])
    pg = to_blocks(d) if src == "v3" else d
    for r in pg["regions"]:
        for b in r["blocks"]:
            b["lines"], b["normalized"], _ = fix_block(b["lines"], b.get("normalized", ""), LEX if LEX and LEX.ok else None)
    pg["_meta"] = {k: J.get(k) for k in ("in", "out", "stop", "valid", "problems")}
    return pg


def stats(pg):
    body = [b for r in pg["regions"] if r["region"] in ("full", "col_a", "col_b") for b in r["blocks"]]
    flags = [f for r in pg["regions"] for b in r["blocks"] for f in b.get("flags", [])]
    conf = [c for r in pg["regions"] for b in r["blocks"] for c in b.get("conf", [])]
    vs = vulgate.score_page(pg, vulgate.flagged_words(pg))
    errs = [e for e in vs["errors"] if e["kind"] in ("error", "missing")]
    return {"lines": sum(len(b["lines"]) for b in body), "words": sum(len(" ".join(b["lines"]).split()) for b in body),
            "flags": len(flags), "check": sum(c == "check" for c in conf), "unsure": sum(c == "unsure" for c in conf),
            "vulgate_words": vs["words"], "vulgate_errors": len(errs),
            "vulgate_flagged": sum(1 for e in errs if e.get("flagged")), "vulgate_list": errs,
            "tokens": pg["_meta"]}


def region_lines(pg):
    out = {}
    for r in pg["regions"]:
        for b in r["blocks"]:
            ids = b.get("line_ids") or [None] * len(b["lines"])
            out.setdefault(r["region"], []).extend(zip(ids, b["lines"]))
    return out


def diff_html(a, b):
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    x, y = [], []
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op == "equal":
            x.append(html.escape(a[a1:a2])); y.append(html.escape(b[b1:b2]))
        else:
            if a2 > a1: x.append(f"<del>{html.escape(a[a1:a2])}</del>")
            if b2 > b1: y.append(f"<ins>{html.escape(b[b1:b2])}</ins>")
    return "".join(x), "".join(y)


def page_html(img, pl, v2, v3):
    from merge import align
    rows = [f"<h2 id='p{img}'>{img}</h2>"]
    r2 = region_lines(v2) if v2 else {}
    r3 = region_lines(v3) if v3 else {}
    for rg in ("head", "full", "col_a", "col_b", "margin_left", "margin_right", "gutter", "foot"):
        ocr = [(L["id"], L["text"]) for L in pl["regions"].get(rg, [])]
        if not ocr and rg not in r2 and rg not in r3:
            continue
        v2l = r2.get(rg if rg != "gutter" else "margin_left", [])
        m2 = align(ocr, [(k, t) for k, (_, t) in enumerate(v2l)]) if ocr and v2l else {}
        v3by = {i: t for i, t in r3.get("margin_left" if rg == "gutter" else rg, []) if i}
        v3plus = {}
        for i, t in r3.get("margin_left" if rg == "gutter" else rg, []):
            if i and i.startswith("+"):
                v3plus.setdefault(i.lstrip("+"), []).append(t)
        rows.append(f"<h3>{rg}</h3><table><tr><th>id</th><th>OCR</th><th>v2</th><th>v3</th></tr>")
        for oid, ot in ocr:
            a = v2l[m2[oid]][1] if oid in m2 else ""
            b = v3by.get(oid, "")
            x, y = diff_html(a, b)
            cls = " class='d'" if a != b else ""
            rows.append(f"<tr{cls}><td>{oid}</td><td class='o'>{html.escape(ot)}</td><td>{x}</td><td>{y}</td></tr>")
            for t in v3plus.get(oid, []):
                rows.append(f"<tr class='d'><td>+ (v3 only)</td><td></td><td></td><td><ins>{html.escape(t)}</ins></td></tr>")
        rows.append("</table>")
    return "\n".join(rows)


CSS = """body{font:14px/1.4 Georgia,serif;margin:16px;background:#fff;color:#111}table{border-collapse:collapse;width:100%}
td,th{border-bottom:1px solid #ddd;padding:2px 6px;vertical-align:top}td:first-child{font:11px monospace;color:#777;white-space:nowrap}
td.o{color:#888;font-size:12px}tr.d{background:#fffbe6}del{background:#ffd6d6;text-decoration:none}ins{background:#d4f5d4;text-decoration:none}
@media (prefers-color-scheme:dark){body{background:#161616;color:#ddd}tr.d{background:#2a2614}del{background:#5a2323}ins{background:#1f4a1f}}"""


def main():
    global LEX
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", required=True)
    ap.add_argument("--out", default=os.path.join(CFG.reports, "compare.html"))
    a = ap.parse_args()
    from ocrlines import load_pack, page_lines
    LEX = Lexicon()
    pack = load_pack()
    parts, summary = [], {}
    print(f"{'page':<6}{'src':<4}{'lines':>6}{'words':>7}{'flags':>6}{'check':>6}{'unsure':>7}{'vulg.err':>9}{'(flagged)':>10}")
    for img in parse_pages(a.pages):
        v2, v3 = load("v2", img), load("v3", img)
        pl = page_lines(pack[img])
        ocrl = sum(len(pl["regions"][r]) for r in ("full", "col_a", "col_b"))
        summary[img] = {}
        for src, pg in (("v2", v2), ("v3", v3)):
            if not pg:
                continue
            s = stats(pg); summary[img][src] = {k: v for k, v in s.items() if k != "vulgate_list"}
            summary[img][src]["vulgate_list"] = [f"{e['got']} -> {e['expected']}" for e in s["vulgate_list"]]
            print(f"{img:<6}{src:<4}{s['lines']:>6}{s['words']:>7}{s['flags']:>6}{s['check']:>6}{s['unsure']:>7}"
                  f"{s['vulgate_errors']:>9}{s['vulgate_flagged']:>10}   (OCR body lines {ocrl})")
        parts.append(page_html(img, pl, v2, v3))
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    open(a.out, "w").write(f"<!doctype html><meta charset='utf-8'><meta name='viewport' content='width=device-width'>"
                           f"<title>Proofread v2 vs v3</title><style>{CSS}</style><h1>Proofread v2 vs v3</h1>"
                           f"<p>Differences between the two proofreads are marked: red in v2, green in v3. Check one "
                           f"column against the scan.</p>" + "\n".join(parts))
    json.dump(summary, open(os.path.splitext(a.out)[0] + ".json", "w"), ensure_ascii=False, indent=1)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
