#!/usr/bin/env python3
"""Build the static reader data for Maldonatus, Commentarii in quatuor
Evangelistas (Mussiponti 1596-97) from the Google Vision OCR pack.

    python3 maldonatus/pipeline/build.py --data DIR --dict DICTBASE \
        --out maldonatus/reader/data [--range 1:0020-0103]

DIR holds bsb11059226_words.json.gz, bsb11059227_words.json.gz and the two
*.index.tsv files from the OCR pack. DICTBASE is the path of the Hunspell
Latin dictionary without extension (npm `dictionary-la`: index.aff/index.dic):

    npm pack dictionary-la && tar xzf dictionary-la-*.tgz   # -> package/index
"""

import argparse
import collections
import gzip
import json
import os
import re
import statistics
import sys

sys.path.insert(0, os.path.dirname(__file__))
import layout  # noqa: E402
from normalize import Normalizer  # noqa: E402
from align import align_book  # noqa: E402

VOLS = {
    1: {"bsb": "bsb11059226", "year": 1596, "words": "bsb11059226_words.json.gz",
        "index": "maldonatus_evangelia_tom1_1596.index.tsv"},
    2: {"bsb": "bsb11059227", "year": 1597, "words": "bsb11059227_words.json.gz",
        "index": "maldonatus_evangelia_tom2_1597.index.tsv"},
}
ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50}
ORD = {"PRIMVM": 1, "SECVNDVM": 2, "TERTIVM": 3, "QVARTVM": 4, "QVINTVM": 5, "SEXTVM": 6,
       "SEPTIMVM": 7, "OCTAVVM": 8, "NONVM": 9, "DECIMVM": 10}
VERSES = {"Matthew": [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34,
                      46, 46, 39, 51, 46, 75, 66, 20]}
HYPH = re.compile(r"[-=¬]$")


def roman(s):
    s = s.upper().replace(".", "").strip()
    if s in ORD:
        return ORD[s]
    if not s or any(c not in ROMAN for c in s):
        return None
    v = 0
    for a, b in zip(s, s[1:] + " "):
        v += -ROMAN[a] if b in ROMAN and ROMAN[b] > ROMAN[a] else ROMAN[a]
    return v


# ---------------------------------------------------------------- column map

def head_numbers(res):
    """Printed column numbers read from the running head: (left, right)."""
    hw = res.get("head_words") or []
    if not hw:
        return None, None
    g = res["frame"][1] or (res["frame"][0] + res["frame"][2]) / 2
    nums = [(w, int(w[0])) for w in hw if re.fullmatch(r"\d{1,4}", w[0])]
    left = [n for w, n in nums if w[3] < g and w is hw[0]]
    right = [n for w, n in nums if w[1] > g and w is hw[-1]]
    return (left[0] if left else None), (right[0] if right else None)


def column_map(results):
    """Assign printed column numbers to every text image. Numbers read from the
    running head are accepted when they continue the sequence (or when the
    next image confirms a jump); otherwise the number is inferred."""
    imgs = [k for k in results if results[k]["kind"] == "page"]
    ocr = {k: head_numbers(results[k]) for k in imgs}
    ncol = {k: results[k]["ncols"] for k in imgs}
    out, prev = {}, None
    for i, k in enumerate(imgs):
        l, r = ocr[k]
        if ncol[k] == 1 and l is None:
            l, r = r, None  # single-column page: its one number may sit at either end of the head
        nxt = ocr[imgs[i + 1]][0] if i + 1 < len(imgs) else None
        if prev is None:
            # start at the first image whose head numbers are self-consistent
            if l is not None and (r == l + 1 or (nxt is not None and nxt == l + ncol[k])):
                prev = l - 1
            else:
                continue
        exp = prev + 1
        if l == exp:
            start, src = l, "printed"
        elif l is not None and nxt is not None and nxt == l + ncol[k]:
            start, src = l, "printed-jump"
        elif r is not None and ncol[k] == 2 and nxt is not None and nxt == r + 1 and r - 1 != exp:
            start, src = r - 1, "printed-jump"
        else:
            start, src = exp, "inferred"
        nums = list(range(start, start + ncol[k]))
        srcs = [src] + (["printed" if r == start + 1 else ("inferred" if src == "inferred" or r is None else "printed-conflict")] if ncol[k] == 2 else [])
        if src == "printed" and ncol[k] == 2 and r is None:
            srcs[1] = "inferred"
        out[k] = {"cols": nums, "src": srcs, "ocr": [l, r]}
        prev = nums[-1]
    return out


# ---------------------------------------------------------------- structure

def paragraph_starts(col_lines, left, right, hmed):
    flags = []
    prev = None
    for L in col_lines:
        ind = L["x0"] - left
        indent = 0.6 * hmed < ind < 4 * hmed  # wider = beside a drop cap, not a paragraph
        short_prev = prev is not None and prev["x1"] < right - 3 * hmed and not HYPH.search(prev["words"][-1][0])
        flags.append(bool(indent or short_prev))
        prev = L
    return flags


LEMMA = re.compile(r"^\s*(?:(\d{1,2}|[Il])\s*[.,]\s*)?([^()]{2,90}?)\)")
CAP_TEXT = re.compile(r"\bCAPVT\s*\.?\s*([IVXL]+|[A-Z]+VM)\s*\.?", re.I)
CAP_COMM = re.compile(r"\bIN\s+CAP(?:VT)?\s*\.?\s*([IVXL]+|[A-Z]+VM)\s*\.?", re.I)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--dict", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--decisions", default=os.path.join(os.path.dirname(__file__), "ai-decisions.json"),
                    help="AI pass decisions (ai_pass.py); applied when the file exists")
    ap.add_argument("--range", default="1:0020-0103",
                    help="volume:first-last images to build as reader pages (proof: Matthew 1-6)")
    a = ap.parse_args()
    os.makedirs(os.path.join(a.out, "pages"), exist_ok=True)

    # ---- layout + column map for both volumes (task 4 covers the whole work)
    colmaps, results_by_vol, labels = {}, {}, {}
    corpus = collections.Counter()
    diag = {"gutter_splits": [], "edge_splits": 0}
    for v, meta in VOLS.items():
        path = os.path.join(a.data, meta["words"])
        if not os.path.exists(path):
            continue
        d = json.load(gzip.open(path))
        for p in d["pages"]:
            for w in p["words"]:
                for t in re.findall(r"[A-Za-zÀ-ÿĀ-žęæœÆŒ]+", w[0]):
                    corpus[Normalizer.printed_key(t)] += 1
        res = {}
        for p in d["pages"]:
            res[p["image"]] = layout.analyse(p)
            res[p["image"]]["size"] = [p["width"], p["height"]]
        results_by_vol[v] = res
        colmaps[v] = column_map(res)
        labels[v] = {}
        idx = os.path.join(a.data, meta["index"])
        if os.path.exists(idx):
            for row in open(idx, encoding="utf-8").read().splitlines()[1:]:
                img, lab, marker, _ = row.split("\t")
                labels[v][f"{int(img):04d}"] = lab
    colmap_out = {}
    for v, cm in colmaps.items():
        rows = []
        for k in sorted(results_by_vol[v]):
            r = results_by_vol[v][k]
            m = cm.get(k)
            rows.append({"img": k, "mdz": labels[v].get(k, ""), "cols": m["cols"] if m else [],
                         "src": m["src"] if m else [], "ocr": m["ocr"] if m else [],
                         "kind": r["kind"] if r["kind"] != "page" else ("2col" if r["ncols"] == 2 else "1col")})
        colmap_out[f"tom{v}"] = rows
    json.dump(colmap_out, open(os.path.join(a.out, "colmap.json"), "w"), ensure_ascii=False, separators=(",", ":"))

    # ---- reader pages
    vol, rng = a.range.split(":")
    vol = int(vol)
    first, last = rng.split("-")
    res = results_by_vol[vol]
    imgs = [k for k in sorted(res) if first <= k <= last]
    bsb = VOLS[vol]["bsb"]

    # stream of body lines in reading order: page by page, column a then b
    stream, pages = [], []
    for k in imgs:
        r = res[k]
        cm = colmaps[vol].get(k, {"cols": [], "src": []})
        pg = {"vol": vol, "img": k, "bsb": bsb, "seq": int(k), "mdz": labels[vol].get(k, ""),
              "cols": cm["cols"], "colsrc": cm["src"], "head": r.get("head", ""), "foot": r.get("foot", []),
              "size": r["size"], "columns": [], "notes": []}
        if r["kind"] != "page":
            pg["columns"] = [{"t": "plain", "cols": [{"n": None, "lines": [{"id": f"{k}x{i}", "d": t} for i, t in enumerate(r["lines"])]}]}]
            for L in pg["columns"][0]["cols"][0]["lines"]:
                stream.append((pg, L, None, "plain"))
            pages.append(pg)
            continue
        diag["gutter_splits"] += [[k] + s for s in r["stats"]["gutter_splits"]]
        diag["edge_splits"] += r["stats"]["edge_splits"]
        left, gutter, right = r["frame"]
        ids = {}
        nums = cm["cols"]
        for bi, blk in enumerate(r["blocks"]):
            out = {"t": blk["kind"], "cols": []}
            for ci, col in enumerate(blk["cols"]):
                if blk["kind"] == "two":
                    full = [L for L in col if len(L["words"]) >= 4]
                    lo = statistics.median(L["x0"] for L in full) if full and ci == 1 else left
                    hi = statistics.median(L["x1"] for L in full) if full and ci == 0 else right
                    if full and ci == 0:
                        lo = left
                    n = nums[ci] if ci < len(nums) else None
                else:
                    lo, hi = left, right
                    n = None
                pstart = paragraph_starts(col, lo, hi, r["hmed"])
                letter = "ab"[ci] if blk["kind"] == "two" else ("h" if blk["kind"] == "head" else "f")
                lines = []
                for i, L in enumerate(col):
                    lid = f"{k}{letter}{bi}.{i}"
                    obj = {"id": lid, "d": layout.join_tokens(L["words"])}
                    if pstart[i] or i == 0 and blk["kind"] == "head":
                        obj["p"] = 1
                    lines.append(obj)
                    ids[(bi, ci, i)] = lid
                    stream.append((pg, obj, L, blk["kind"]))
                out["cols"].append({"n": n, "lines": lines})
            pg["columns"].append(out)
        for j, n in enumerate(sorted(r["notes"], key=lambda n: (n["side"], n["y"]))):
            pg["notes"].append({"id": f"{k}n{j}", "kind": n.get("kind", "note"), "side": n["side"],
                                "anchor": ids.get(tuple(n["anchor"])) if n["anchor"] else None, "d": n["text"]})
        pages.append(pg)

    # ---- normalized text: dehyphenate across lines, then the rule-based
    # normalizer (normalize.py); words it cannot settle go to the AI queue
    vulg = json.load(open(os.path.join(os.path.dirname(__file__), "vulgate_gospels.json"), encoding="utf-8"))["books"]
    vwords = {w for bk in vulg.values() for c in bk for v in c for w in re.findall(r"[A-Za-zæœëÆ]+", v)}
    N = Normalizer(a.dict, vwords, corpus)
    decisions = {}
    if a.decisions and os.path.exists(a.decisions):
        decisions = {k: v["choice"] for k, v in json.load(open(a.decisions, encoding="utf-8")).items()
                     if v.get("choice") and not v.get("unsure")}
    WRE = r"[A-Za-zÀ-ÿĀ-žęæœÆŒ]+"

    # dehyphenated token lists per line
    carry = None
    for i, (pg, L, _, _) in enumerate(stream):
        parts = L["d"].split(" ")
        if carry is not None:
            parts = parts[1:]  # first token was joined onto the previous line
            carry = None
        if HYPH.search(L["d"]) and i + 1 < len(stream) and len(parts) and len(parts[-1]) > 1:
            nxt = stream[i + 1][1]["d"].split(" ", 1)[0]
            parts[-1] = parts[-1][:-1] + nxt
            carry = True
        L["_parts"] = parts
    words = set()
    for _, L, _, _ in stream:
        words.update(re.findall(WRE, Normalizer.pre(" ".join(L["_parts"]))))
    for pg in pages:
        for n in pg["notes"]:
            for t in n["d"]:
                words.update(re.findall(WRE, Normalizer.pre(t)))
        words.update(re.findall(WRE, pg["head"]))
    N.prepare(words)

    queue = {}
    for i, (pg, L, _, _) in enumerate(stream):
        text, ch, amb = N.line(" ".join(L.pop("_parts")), L["id"], decisions)
        L["n"] = text
        if ch:
            L["c"] = ch
        if amb:
            L["a"] = sorted({w for w, _ in amb})
            L["_amb"] = amb
    # AI queue: each doubtful word marked in its normalized line, with the
    # neighbouring lines as context
    for i, (pg, L, _, _) in enumerate(stream):
        for w, key in L.pop("_amb", []):
            nth = int(key.rsplit("|", 1)[1])
            hits = [m for m in re.finditer(r"(?<![A-Za-zÀ-ÿĀ-žęæœÆŒ])" + re.escape(w) + r"(?![A-Za-zÀ-ÿĀ-žęæœÆŒ])", L["n"])]
            marked = L["n"]
            if len(hits) >= nth:
                m = hits[nth - 1]
                marked = L["n"][:m.start()] + "⟦" + w + "⟧" + L["n"][m.end():]
            queue[key] = {"word": w, "rule": N.queue[w]["rule"], "options": N.queue[w]["options"],
                          "img": pg["img"], "line": L["id"], "text": marked,
                          "before": stream[i - 1][1]["n"] if i else "",
                          "after": stream[i + 1][1]["n"] if i + 1 < len(stream) else ""}
    for pg in pages:
        pg["headN"] = N.line(pg["head"], pg["img"] + "h")[0]
        for n in pg["notes"]:
            n["n"] = [N.line(s, n["id"])[0] for s in n["d"]]
            # junk: no Latin word of 3+ letters and no reference-like number
            toks = re.findall(WRE, " ".join(n["n"]))
            if n["kind"] == "note" and not re.search(r"\d", " ".join(n["d"])) and \
                    not any(len(t) >= 3 and N.latin(t) for t in toks):
                n["junk"] = 1

    # ---- book / chapter / verse / lemma tree
    book = {"title": "Evangelium secundum Matthæum", "key": "Matthew", "chapters": []}
    ch, mode, last_v = None, None, 0
    maxv = VERSES["Matthew"]
    for i, (pg, L, raw, bk) in enumerate(stream):
        t = L["d"]
        m = CAP_COMM.search(t) if bk == "head" or len(t) < 36 else CAP_COMM.match(t)
        if m and roman(m.group(1)):
            n = roman(m.group(1))
            if not ch or ch["n"] != n:
                ch = {"n": n, "start": L["id"], "img": pg["img"], "verses": []}
                book["chapters"].append(ch)
            ch["comm"] = L["id"]
            ch["commImg"] = pg["img"]
            mode, last_v = "comm", 0
            L["h"] = "comm"
            if i + 1 < len(stream):
                stream[i + 1][1]["p"] = 1  # first commentary line (beside a drop cap)
            continue
        m = CAP_TEXT.search(t) if bk == "head" else CAP_TEXT.match(t)
        if m and roman(m.group(1)) and (bk == "head" or len(t) < 40):
            n = roman(m.group(1))
            if not ch or n == ch["n"] + 1:
                ch = {"n": n, "start": L["id"], "img": pg["img"], "text": L["id"], "verses": []}
                if i + 1 < len(stream):
                    ch["text_first"] = stream[i + 1][1]["id"]
                book["chapters"].append(ch)
                mode = "text"
                L["h"] = "text"
            continue
        if mode != "comm" or not L.get("p") and not re.match(r"^\s*(\d{1,2}|[Il])\s*[.,]\s*\S", t):
            continue
        probe = t if ")" in t else t + " " + (stream[i + 1][1]["d"] if i + 1 < len(stream) else "")
        m = LEMMA.match(probe)
        if not m:
            continue
        lem = m.group(2).strip()
        if not re.search(r"[A-Za-z]{2}", lem) or len(lem.split()) > 14:
            continue
        v = (1 if m.group(1) in ("I", "l") else int(m.group(1))) if m.group(1) else None
        if v is not None:
            limit = maxv[ch["n"] - 1] if ch["n"] - 1 < len(maxv) else 99
            if not (last_v < v <= min(limit, last_v + 12)):
                if not L.get("p"):
                    continue  # a citation such as "22.42.Interrogati ..." at a line start
                v = None
        if v is not None:
            last_v = v
            ch["verses"].append({"v": v, "lemmas": []})
        elif not ch["verses"]:
            ch["verses"].append({"v": 0, "lemmas": []})
        lemma_n = N.line(lem, L["id"] + "lem")[0]
        ch["verses"][-1]["lemmas"].append({"id": L["id"], "img": pg["img"], "d": lem, "n": lemma_n})
        L["lem"] = 1
        if v is not None:
            L["v"] = v

    # ---- Vulgate alignment: verse numbers and drop-cap initials
    byid = {L["id"]: L for _, L, _, _ in stream}
    align_log = []
    align_book(book, byid, vulg["Matthew"], align_log)
    for c in book["chapters"]:
        for g in c["verses"]:
            for lem in g["lemmas"]:
                if g["v"]:
                    byid[lem["id"]]["v"] = g["v"]

    for pg in pages:
        json.dump(pg, open(os.path.join(a.out, "pages", f"tom{vol}-{pg['img']}.json"), "w"),
                  ensure_ascii=False, separators=(",", ":"))
    toc = {
        "work": "Ioannis Maldonati S.I. Commentarii in quatuor Evangelistas",
        "imprint": "Mussiponti, 1596–97",
        "scope": f"Proof: tom. {vol}, images {first}–{last} (Matthew 1–6)",
        "volumes": {str(v): {"bsb": VOLS[v]["bsb"], "year": VOLS[v]["year"]} for v in VOLS},
        "pages": [{"vol": p["vol"], "img": p["img"], "cols": p["cols"], "mdz": p["mdz"]} for p in pages],
        "books": [book],
    }
    json.dump(toc, open(os.path.join(a.out, "toc.json"), "w"), ensure_ascii=False, indent=1)
    by_rule = collections.Counter()
    rows = collections.defaultdict(int)
    for (rule, w, new), c in N.changes.items():
        by_rule[rule] += c
        rows[(rule, w, new)] += c
    qcount = collections.Counter(q["word"] for q in queue.values())
    qwhere = collections.defaultdict(list)
    for k, q in queue.items():
        if len(qwhere[q["word"]]) < 6:
            qwhere[q["word"]].append(q["line"])
    json.dump({"by_rule": by_rule,
               "changes": sorted(([r, w, n, c] for (r, w, n), c in rows.items()), key=lambda x: (x[0], -x[3])),
               "queue": sorted(([w, N.queue[w]["rule"], N.queue[w]["options"], c, qwhere[w]] for w, c in qcount.items()),
                               key=lambda x: -x[3]),
               "decided": len(decisions),
               "dropcaps": align_log,
               "gutter_splits": diag["gutter_splits"]},
              open(os.path.join(a.out, "norm-log.json"), "w"), ensure_ascii=False, indent=0)
    json.dump(queue, open(os.path.join(os.path.dirname(__file__), "ai-queue.json"), "w"), ensure_ascii=False, indent=0)
    nl = sum(1 for _ in stream)
    print(f"pages {len(pages)}  lines {nl}  chapters {[c['n'] for c in book['chapters']]}")
    for c in book["chapters"]:
        src = collections.Counter(l.get("vsrc") for v in c["verses"] for l in v["lemmas"])
        print(f"  cap {c['n']}: verses {[v['v'] for v in c['verses']]}  lemmas {sum(len(v['lemmas']) for v in c['verses'])} {dict(src)}")
    print("drop caps restored:", [(x[1], x[2]) for x in align_log])
    print("normalized by rule:", dict(by_rule))
    print(f"left for the AI pass: {len(queue)} occurrences ({len(qcount)} words); AI decisions applied: {len(decisions)}")
    print(f"gutter splits {len(diag['gutter_splits'])}, edge splits {diag['edge_splits']}")


if __name__ == "__main__":
    main()
