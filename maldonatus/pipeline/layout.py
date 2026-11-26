"""Page-layout reconstruction from Google Vision word boxes.

Each MDZ image of the Maldonatus folio is one printed page with two numbered
columns (the book numbers columns, not pages), a running head carrying the two
column numbers, section letters (A-D) in the gutter between the columns, and
marginal notes in a narrow strip outside the text block. Vision reads across
the gutter, fusing the end of a column-a word with the start of a column-b
word ("difpoteft") and interleaving the lines of the two columns.

This module finds the text block and the gutter from the x-histogram of the
word boxes, splits words that cross the gutter or a block edge at character
level, and rebuilds head, column a, column b, gutter letters and marginal
notes as separate, ordered line streams.
"""

import re
import statistics

PUNCT = re.compile(r"^[.,;:!?)\]’'·]+$")
OPEN = re.compile(r"^[(\[]+$")
BIN = 10


def histogram(words, width):
    h = [0] * (width // BIN + 2)
    for _, x0, _, x1, _ in words:
        for b in range(max(0, x0 // BIN), min(len(h) - 1, x1 // BIN) + 1):
            h[b] += 1
    return h


def smooth(h, k=2):
    return [sum(h[max(0, i - k):i + k + 1]) / (min(len(h), i + k + 1) - max(0, i - k)) for i in range(len(h))]


def find_frame(page):
    """Return (left, gutter, right) x-positions of the text block, or None for
    pages that are not two-column text (title page, plates, blanks)."""
    words, width = page["words"], page["width"]
    if len(words) < 150:
        return None
    h = smooth(histogram(words, width), 1)
    p90 = sorted(h)[int(len(h) * 0.9)]
    thr = 0.45 * p90
    dense = [i for i, c in enumerate(h) if c >= thr]
    left, right = dense[0] * BIN, (dense[-1] + 1) * BIN
    w = right - left
    lo, hi = (left + int(0.38 * w)) // BIN, (left + int(0.62 * w)) // BIN
    hs = smooth(histogram(words, width), 2)
    mn = min(hs[lo:hi + 1])
    run = [i for i in range(lo, hi + 1) if hs[i] <= mn + 0.5]
    # take the longest contiguous run at the minimum, its centre is the gutter
    best, cur = [], []
    for i in run:
        if cur and i != cur[-1] + 1:
            best, cur = max(best, cur, key=len), []
        cur.append(i)
    best = max(best, cur, key=len)
    gutter = (best[0] + best[-1] + 1) * BIN // 2
    # Even when the minimum is shallow (a page that is mostly full-width
    # chapter text) keep it: find_bands decides row by row.
    return left, gutter, right


def split_word(word, x):
    """Split a fused word at image x, proportionally by character width.
    Returns (left_part, right_part); either may be None."""
    t, x0, y0, x1, y1 = word
    n = len(t)
    if x <= x0 or x >= x1 or n < 2:
        return (word, None) if (x0 + x1) / 2 < x else (None, word)
    cw = (x1 - x0) / n
    k = round((x - x0) / cw)
    if k <= 0:
        return None, word
    if k >= n:
        return word, None
    xs = round(x0 + k * cw)
    return [t[:k], x0, y0, xs, y1], [t[k:], xs, y0, x1, y1]


def group_lines(words, tol=0.5):
    """Cluster words into lines by vertical centre; returns lists sorted by x."""
    if not words:
        return []
    hmed = statistics.median(w[4] - w[2] for w in words) or 40
    lines = []
    for w in sorted(words, key=lambda w: ((w[2] + w[4]) / 2, w[1])):
        yc = (w[2] + w[4]) / 2
        if lines and abs(yc - lines[-1]["yc"]) < tol * hmed:
            L = lines[-1]
            L["w"].append(w)
            L["yc"] = sum((v[2] + v[4]) / 2 for v in L["w"]) / len(L["w"])
        else:
            lines.append({"yc": yc, "w": [w]})
    out = []
    for L in lines:
        ws = sorted(L["w"], key=lambda w: w[1])
        out.append({
            "y": round(L["yc"]),
            "x0": ws[0][1], "x1": max(w[3] for w in ws),
            "words": ws,
        })
    return out


def join_tokens(ws):
    s = ""
    for i, w in enumerate(ws):
        t = w[0]
        if i == 0:
            s = t
        elif PUNCT.match(t) or OPEN.match(ws[i - 1][0]) or (t == "-" and w[1] - ws[i - 1][3] < 15):
            s += t
        else:
            s += " " + t
    return s


def is_letter(w, gutter, hmed):
    xc = (w[1] + w[3]) / 2
    return abs(xc - gutter) < 1.6 * hmed and (w[3] - w[1]) < 1.6 * hmed and re.fullmatch(r"[A-H]\.?", w[0])


def find_bands(words, gutter, left, right, hmed, height):
    """Split the text block vertically into bands: 'two' (two columns), 'full'
    (full-width text, e.g. the Vulgate chapter text) and 'head' (a centred
    heading such as CAPVT IIII.). Returns [(y0, y1, kind)]."""
    rows = group_lines(words)
    if not rows:
        return []
    w = right - left

    def crosses(r):
        return any(x[1] < gutter - 10 and x[3] > gutter + 10 and not is_letter(x, gutter, hmed) for x in r["words"])

    def column_line(r):
        """True if one side of the gutter holds an ordinary justified line
        (four or more words reaching that column's outer edge), i.e. the row
        is two column lines side by side, not a centred heading."""
        lw = [x for x in r["words"] if x[3] <= gutter]
        rw = [x for x in r["words"] if x[1] >= gutter]
        if len(lw) >= 4 and min(x[1] for x in lw) < left + hmed:
            return True
        if len(rw) >= 4 and max(x[3] for x in rw) > right - hmed:
            return True
        return False

    def heading(r):
        if column_line(r):
            return False
        txt = "".join(x[0] for x in r["words"])
        letters = [c for c in txt if c.isalpha()]
        up = sum(c.isupper() for c in letters) / max(1, len(letters))
        centred = r["x0"] > left + 0.12 * w and r["x1"] < right - 0.12 * w
        cw = [x for x in r["words"] if re.match(r"CAP(VT)?\b|CAP\.", x[0].upper())]
        if cw and len(r["words"]) <= 14 and abs((cw[0][1] + cw[0][3]) / 2 - gutter) < 0.3 * w \
                and re.search(r"CAP(VT)?\s*\.?\s*([IVXL]+|[A-Z]+VM)\b", join_tokens(r["words"]).upper()):
            return True
        near = [x for x in r["words"] if abs((x[1] + x[3]) / 2 - gutter) < 0.25 * w]
        both = any(x[3] <= gutter for x in near) and any(x[1] >= gutter for x in near)
        return centred and (crosses(r) or both) and up >= 0.6 and len(letters) >= 4

    def evidence(r):
        """+1 full-width, -1 two-column, judged by the gap at the gutter."""
        ws = [x for x in r["words"] if not is_letter(x, gutter, hmed)]
        if crosses(r):
            return 1
        lw = [x for x in ws if x[3] <= gutter]
        rw = [x for x in ws if x[1] >= gutter]
        if not lw or not rw:
            return -1
        gap = min(x[1] for x in rw) - max(x[3] for x in lw)
        return 1 if gap < 0.75 * hmed else -1

    flags = ["head" if heading(r) else evidence(r) for r in rows]
    kinds = []
    for i, f in enumerate(flags):
        if f == "head":
            kinds.append("head")
            continue
        win = [flags[j] for j in range(max(0, i - 2), min(len(flags), i + 3)) if flags[j] != "head"]
        kinds.append("full" if sum(win) > 0 else "two")
    # merge consecutive rows of the same kind into bands
    bands = []
    for r, k in zip(rows, kinds):
        y0 = min(x[2] for x in r["words"])
        y1 = max(x[4] for x in r["words"])
        if bands and bands[-1][2] == k and k != "head":
            bands[-1][1] = y1
        else:
            bands.append([y0, y1, k])
    # a lone 'full' row inside two-column text is a fused line, not a band
    for i, b in enumerate(bands):
        if b[2] == "full" and sum(1 for r, k in zip(rows, kinds) if b[0] <= r["y"] <= b[1]) < 2:
            b[2] = "two"
    # a short two-column stretch next to full-width text is a drop-cap
    # indent (or the last lines of the chapter text), not real columns
    def nrows(b):
        return sum(1 for r in rows if b[0] <= r["y"] <= b[1])
    for i, b in enumerate(bands):
        nb = [bands[j][2] for j in (i - 1, i + 1) if 0 <= j < len(bands)]
        if b[2] == "two" and "full" in nb and nrows(b) <= 4:
            b[2] = "full"
    out = []
    for b in bands:
        if out and out[-1][2] == b[2] and b[2] != "head":
            out[-1][1] = b[1]
        else:
            out.append(list(b))
    # boundaries halfway between bands
    for i in range(len(out) - 1):
        mid = (out[i][1] + out[i + 1][0]) // 2
        out[i][1], out[i + 1][0] = mid, mid
    out[0][0], out[-1][1] = 0, height
    return [tuple(b) for b in out]


def analyse(page):
    """Rebuild one page: running head, bands of two-column / full-width text
    and headings, gutter letters, marginal notes, footer."""
    frame = find_frame(page)
    words = [list(w) for w in page["words"] if w[0].strip()]
    if frame is None:
        lines = group_lines(words)
        return {"kind": "plain", "lines": [join_tokens(L["words"]) for L in lines], "frame": None}
    left, gutter, right = frame
    hmed = statistics.median(w[4] - w[2] for w in words)

    # 1. running head
    rows = group_lines(words)
    head_words = []
    for r in rows[:3]:
        txt = join_tokens(r["words"])
        if r["y"] < 0.12 * page["height"] and (re.search(r"MALDON|MATTH|MARC|LVC|IOAN|PRÆ|PRAE|EVANG|CAP|COMMENT", txt.upper())
                                               or len(r["words"]) <= 8):
            head_words = r["words"]
            break
    hid = {id(w) for w in head_words}
    rest = [w for w in words if id(w) not in hid]
    stats = {"gutter_splits": [], "edge_splits": 0}

    def cut(ws, x, record=None):
        out = []
        for w in ws:
            if w[1] < x - 6 and w[3] > x + 6 and len(w[0]) >= 2:
                a, b = split_word(w, x)
                if a and b and record is not None:
                    record.append([w[0], a[0], b[0]])
                out += [p for p in (a, b) if p]
            else:
                out.append(w)
        return out

    # 2. justified block edges from flush lines (see module docstring)
    def flush(lo, hi, attr, fn):
        ws = [w for w in rest if lo <= (w[1] + w[3]) / 2 <= hi]
        ls = [L for L in group_lines(ws) if len(L["words"]) >= 4]
        return int(statistics.median(L[attr] for L in ls)) if ls else fn
    if gutter:
        left = flush(left, gutter, "x0", left)
        right = flush(gutter, right, "x1", right)
    else:
        left = flush(left, right, "x0", left)
        right = flush(left, right, "x1", right)
    # split only words with a substantial piece outside the edge (a fused
    # note); full-width chapter text is set a little wider than the columns
    def cut_edge(ws, x, side):
        out = []
        for w in ws:
            outside = (x - w[1]) if side == "L" else (w[3] - x)
            inside = (w[3] - x) if side == "L" else (x - w[1])
            if outside >= hmed and inside > 6:
                out += [p for p in split_word(w, x) if p]
            else:
                out.append(w)
        return out
    n0 = len(rest)
    rest = cut_edge(rest, left - 3, "L")
    rest = cut_edge(rest, right + 6, "R")
    stats["edge_splits"] = len(rest) - n0

    # 3. margins out, then bands
    mL = [w for w in rest if w[3] <= left + 2 and w[1] < left - 8]
    mR = [w for w in rest if w[1] >= right + 6]
    mid = {id(w) for w in mL + mR}
    body = [w for w in rest if id(w) not in mid]
    bands = find_bands(body, gutter, left, right, hmed, page["height"])
    # On mixed pages the whole-page histogram minimum is unreliable: re-find
    # the gutter from the two-column bands alone, then re-band once.
    two = [w for w in body if any(k == "two" and y0 <= (w[2] + w[4]) / 2 < y1 for y0, y1, k in bands)]
    if two and len(two) < 0.9 * len(body):
        g2 = find_frame({"words": two, "width": page["width"]}) if len(two) >= 150 else None
        if g2 and abs(g2[1] - gutter) > 15:
            gutter = g2[1]
            bands = find_bands(body, gutter, left, right, hmed, page["height"])

    blocks, letters = [], []
    for y0, y1, kind in bands:
        bw = [w for w in body if y0 <= (w[2] + w[4]) / 2 < y1]
        if not bw:
            continue
        if kind == "two":
            bw = cut(bw, gutter, stats["gutter_splits"])
            a, b = [], []
            for w in bw:
                xc = (w[1] + w[3]) / 2
                if is_letter(w, gutter, hmed):
                    letters.append(w)
                elif xc < gutter:
                    a.append(w)
                else:
                    b.append(w)
            blocks.append({"kind": "two", "cols": [group_lines(a), group_lines(b)]})
        else:
            blocks.append({"kind": kind, "cols": [group_lines(bw)]})

    # 4. footer: signature / catchword row well below the last body line
    foot = []
    if blocks:
        for c in blocks[-1]["cols"]:
            if len(c) >= 3:
                gap = c[-1]["y"] - c[-2]["y"]
                pitch = statistics.median(c[i + 1]["y"] - c[i]["y"] for i in range(len(c) - 1))
                if gap > 1.8 * pitch and len(c[-1]["words"]) <= 3:
                    foot.append(c.pop())

    # 5. marginal notes, anchored to the nearest body line on that side
    def side_lines(side):
        out = []
        for bi, b in enumerate(blocks):
            ci = 0 if (side == "left" or b["kind"] != "two") else 1
            for li, L in enumerate(b["cols"][ci]):
                out.append((L["y"], bi, ci, li))
        return out
    notes = []
    for side, ws in (("left", mL), ("right", mR)):
        cur = None
        for L in group_lines(ws):
            if cur and L["y"] - cur["lines"][-1]["y"] < 1.9 * hmed:
                cur["lines"].append(L)
            else:
                cur = {"side": side, "lines": [L]}
                notes.append(cur)
    for n in notes:
        y = n["lines"][0]["y"]
        cands = side_lines(n["side"])
        n["anchor"] = min(cands, key=lambda c: abs(c[0] - y))[1:] if cands else None
        n["text"] = [join_tokens(L["words"]) for L in n["lines"]]
        n["y"] = y
    for w in letters:
        y = (w[2] + w[4]) / 2
        cands = side_lines("left")
        notes.append({"side": "gutter", "kind": "letter", "y": round(y), "text": [w[0]],
                      "anchor": min(cands, key=lambda c: abs(c[0] - y))[1:] if cands else None})

    return {
        "kind": "page",
        "frame": [left, gutter, right],
        # the printer gives a page two column numbers only when it is mainly
        # set in two columns; a page of full-width chapter text gets one
        "ncols": 2 if sum(max(len(c) for c in b["cols"]) for b in blocks if b["kind"] == "two")
                      >= 0.3 * sum(max(len(c) for c in b["cols"]) for b in blocks) else 1,
        "head": join_tokens(head_words) if head_words else "",
        "head_words": head_words,
        "blocks": blocks,
        "notes": notes,
        "foot": [join_tokens(L["words"]) for L in foot],
        "stats": stats,
        "hmed": hmed,
    }
