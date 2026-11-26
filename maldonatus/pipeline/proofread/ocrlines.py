#!/usr/bin/env python3
"""OCR lines with stable IDs and pixel boxes, from the Vision word pack.

The IDs are the same ones build.py gives reader lines (``0050a2.12`` = image
0050, column a, band 2, line 12), so a model answer keyed by these IDs maps
straight back onto the reader's table of contents. Marginal notes get
``<img>mL<k>`` / ``<img>mR<k>``, gutter letters ``<img>g<k>``, the running head
``<img>h``, the foot ``<img>z<k>``.

    from ocrlines import load_pack, page_lines
    pack = load_pack()                    # {image: page} for tom. I
    pl = page_lines(pack["0050"])          # dict, see page_lines()
    python3 ocrlines.py 0050               # print the lines
"""
import gzip
import json
import os
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import layout  # noqa: E402
from config import CFG  # noqa: E402


def load_pack(path=None):
    d = json.load(gzip.open(path or CFG.words))
    return {p["image"]: p for p in d["pages"]}


def _box(words):
    return [min(w[1] for w in words), min(w[2] for w in words), max(w[3] for w in words), max(w[4] for w in words)]


def page_lines(page):
    """Return {"img", "size", "frame", "regions": {region: [line, ...]}, "lines": {id: line}}.

    A line is {"id", "region", "text", "box": [x0,y0,x1,y1], "words": [[t,x0,y0,x1,y1],...]}.
    Regions: head, full (full-width text and headings, in bands), col_a, col_b,
    margin_left, margin_right, gutter, foot. Each two-column band contributes to
    col_a and col_b in reading order (band by band)."""
    k = page["image"]
    W, H = page["width"], page["height"]
    r = layout.analyse(page)
    regions = {x: [] for x in ("head", "full", "col_a", "col_b", "margin_left", "margin_right", "gutter", "foot")}
    out = {"img": k, "size": [W, H], "frame": r.get("frame"), "regions": regions, "lines": {}, "bands": []}

    def add(region, lid, words, text=None):
        if not words:
            return
        L = {"id": lid, "region": region, "text": text if text is not None else layout.join_tokens(words),
             "box": _box(words), "words": [list(w) for w in words]}
        regions[region].append(L)
        out["lines"][lid] = L

    if r["kind"] != "page":                       # plain page: one column of lines
        for i, L in enumerate(layout.group_lines([list(w) for w in page["words"] if w[0].strip()])):
            add("full", f"{k}x{i}", L["words"])
        return out
    if r.get("head_words"):
        add("head", f"{k}h", r["head_words"])
    for bi, blk in enumerate(r["blocks"]):
        ys = [L["y"] for c in blk["cols"] for L in c]
        out["bands"].append({"kind": blk["kind"], "y0": min(ys) if ys else 0, "y1": max(ys) if ys else 0})
        for ci, col in enumerate(blk["cols"]):
            if blk["kind"] == "two":
                region, letter = ("col_a", "a") if ci == 0 else ("col_b", "b")
            else:
                region, letter = ("head", "h") if blk["kind"] == "head" else ("full", "f")
            for i, L in enumerate(col):
                add(region, f"{k}{letter}{bi}.{i}", L["words"])
    # notes, in build.py's order (sorted by side then y) -> reader ids <img>n<j>
    side_n = {"left": 0, "right": 0, "gutter": 0}
    for j, n in enumerate(sorted(r["notes"], key=lambda n: (n["side"], n["y"]))):
        side = n["side"]
        if side == "gutter":
            ws = [w for w in page["words"] if w[0] == n["text"][0] and abs((w[2] + w[4]) / 2 - n["y"]) < 3]
            lid = f"{k}g{side_n['gutter']}"
            add("gutter", lid, ws[:1] or [[n["text"][0], 0, n["y"] - 20, 0, n["y"] + 20]], n["text"][0])
        else:
            for li, L in enumerate(n["lines"]):
                lid = f"{k}m{side[0].upper()}{side_n[side]}"
                add("margin_" + side, lid, L["words"])
                side_n[side] += 1
            continue
        side_n[side] += 1
    for i, t in enumerate(r.get("foot") or []):
        regions["foot"].append({"id": f"{k}z{i}", "region": "foot", "text": t, "box": None, "words": []})
        out["lines"][f"{k}z{i}"] = regions["foot"][-1]
    return out


def column_boxes(pl, pad=24):
    """Pixel boxes of each text region (for crops): {region: [x0,y0,x1,y1]}."""
    W, H = pl["size"]
    res = {}
    for rg, lines in pl["regions"].items():
        bx = [L["box"] for L in lines if L.get("box") and L["box"][2] > L["box"][0]]
        if not bx:
            continue
        x0 = min(b[0] for b in bx); y0 = min(b[1] for b in bx); x1 = max(b[2] for b in bx); y1 = max(b[3] for b in bx)
        if rg in ("col_a", "col_b") and pl.get("frame"):
            left, gutter, right = pl["frame"]
            if gutter:
                x0, x1 = (min(x0, left), max(x1, gutter)) if rg == "col_a" else (min(x0, gutter), max(x1, right))
        res[rg] = [max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)]
    return res


def line_height(pl):
    hs = [L["box"][3] - L["box"][1] for L in pl["lines"].values() if L.get("box") and L["words"]]
    return statistics.median(hs) if hs else 40


if __name__ == "__main__":
    pack = load_pack()
    for img in sys.argv[1:]:
        pl = page_lines(pack[img])
        for rg, ls in pl["regions"].items():
            for L in ls:
                print(f"{L['id']:>12} {rg:<12} {L['box']} {L['text']}")
