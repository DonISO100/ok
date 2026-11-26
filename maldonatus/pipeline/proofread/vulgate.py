#!/usr/bin/env python3
"""Score transcribed chapter text against the Clementine Vulgate (free accuracy check).

Each chapter opens with the Vulgate text set full width; we know what it should
say. Words are compared after period-spelling folding (quattuor/quatuor,
exs/ex, ti/ci before a vowel, doubled consonants, ae/e, y/i, final m/n), so the
book's own spelling is not counted. What remains is split into:
  split    the same letters, different word division (re liquit, auditaest)
  variant  a proper name spelled differently (Iosaphat / Iosophat); not counted
  error    a different word (Piogenies for Progenies, dicit for didicit)
  missing  a Vulgate word the page lacks in mid-text (a dropped word)
  edge     a word cut at a page or block edge (re- | liquit); not counted

    python3 vulgate.py                 # score proofread/raw (v2) and raw3 (v3), all pages
    python3 vulgate.py --pages 0038,0050 --src raw3
Writes proofread/reports/vulgate-<src>.json and prints a summary.
"""
import argparse
import difflib
import json
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from config import CFG  # noqa: E402

_BOOK = None
_LEX = None


def fold(w):
    """Spelling-neutral key."""
    w = w.lower().replace("ſ", "s").replace("ꝰ", "us").replace("&", "et")
    w = w.replace("æ", "e").replace("œ", "e").replace("ę", "e").replace("ae", "e").replace("oe", "e")
    w = unicodedata.normalize("NFD", w)
    w = "".join(c for c in w if not unicodedata.combining(c))
    w = w.replace("j", "i").replace("v", "u").replace("y", "i").replace("k", "c")
    w = re.sub(r"[^a-z]", "", w)
    w = w.replace("exs", "ex").replace("quatt", "quat").replace("mpt", "mt").replace("nct", "nt").replace("hier", "ier")
    w = re.sub(r"ti(?=[aeiou])", "ci", w)
    w = re.sub(r"h", "", w)
    w = re.sub(r"(.)\1", r"\1", w)
    w = re.sub(r"m$", "n", w)
    return w


def words(text):
    text = text.replace("&", " et ")
    return [w for w in re.findall(r"[^\s,;:.?!()\[\]·]+", text) if re.search(r"[A-Za-zÀ-ÿſæœ]", w)]


def book():
    global _BOOK
    if _BOOK is None:
        v = json.load(open(CFG.vulgate, encoding="utf-8"))["books"]
        mt = v.get("Matthew") or v[next(iter(v))]
        toks = []
        for ci, ch in enumerate(mt):
            for vi, verse in enumerate(ch):
                for w in words(verse):
                    toks.append((w, ci + 1, vi + 1))
        _BOOK = toks
    return _BOOK


_NAMES = None


def names():
    """Fold keys of proper names: words the Vulgate capitalizes in mid-sentence."""
    global _NAMES
    if _NAMES is None:
        v = json.load(open(CFG.vulgate, encoding="utf-8"))["books"]
        _NAMES = set()
        for bk in v.values():
            for ch in bk:
                for verse in ch:
                    raw = verse.split()
                    for prev, w in zip(raw, raw[1:]):
                        if w[:1].isupper() and not re.search(r"[.:;?!]$", prev):
                            _NAMES.add(fold(w))
    return _NAMES


def chapter_segments(page):
    """Chapter-text segments of a page in regions/blocks form: [((region index, block index), normalized text)]."""
    out = []
    for ri, r in enumerate(page["regions"]):
        if r["region"] != "full":
            continue
        for bi, b in enumerate(r["blocks"]):
            if b.get("kind") == "text" and len(words(b.get("normalized", ""))) >= 8:
                out.append(((ri, bi), b["normalized"]))
    return out


def score_page(page, flagged=None):
    """Returns {"words", "matched", "split", "errors": [{got, expected, ref, chapter, verse, flagged}]}."""
    flagged = flagged or set()
    segs = chapter_segments(page)
    got = []
    for ref, t in segs:
        for w in words(t):
            got.append((w, ref))
    res = {"words": len(got), "matched": 0, "split": 0, "errors": []}
    if not got:
        return res
    B = book()
    gk = [fold(w) for w, _ in got]
    bk = [fold(w) for w, _, _ in B]
    # locate the page's stretch of the book first (cheap), then align within it
    sm0 = difflib.SequenceMatcher(None, gk, bk, autojunk=False)
    m = max(sm0.get_matching_blocks(), key=lambda x: x.size)
    lo = max(0, m.b - m.a - 200); hi = min(len(bk), m.b + (len(gk) - m.a) + 200)
    sm = difflib.SequenceMatcher(None, gk, bk[lo:hi], autojunk=False)
    def err(kind, gi, bj, gtext=None, etext=None):
        x = {"kind": kind, "got": gtext if gtext is not None else (got[gi][0] if gi is not None else ""),
             "expected": etext if etext is not None else (B[bj][0] if bj is not None else ""),
             "ref": got[gi][1] if gi is not None else None,
             "chapter": B[bj][1] if bj is not None else None, "verse": B[bj][2] if bj is not None else None}
        if kind == "error":
            x["flagged"] = gi is not None and fold(got[gi][0]) in flagged
        res["errors"].append(x)
        if kind == "split":
            res["split"] += 1

    def fk(i):
        return gk[i].rstrip("-")

    ops = sm.get_opcodes()
    for n, (op, a1, a2, b1, b2) in enumerate(ops):
        b1 += lo; b2 += lo
        if op == "equal":
            res["matched"] += a2 - a1
            continue
        if op == "insert":
            inner = 0 < n < len(ops) - 1
            if inner and b2 - b1 <= 3:                  # Vulgate words the page lacks, mid-stretch: dropped
                for j in range(b1, b2):
                    err("missing", None, j)
            continue
        if op == "delete" and a2 - a1 > 6:
            continue                                    # a stretch not in the Vulgate (heading, page furniture)
        i, j = a1, b1
        while i < a2:
            if j < b2 and gk[i] == bk[j]:
                res["matched"] += 1; i += 1; j += 1; continue
            if j < b2 and i + 1 < a2 and gk[i].rstrip("-") + gk[i + 1] == bk[j]:
                err("split", i, j, got[i][0] + " " + got[i + 1][0]); i += 2; j += 1; continue
            if j + 1 < b2 and gk[i] == bk[j] + bk[j + 1]:
                err("split", i, j, None, B[j][0] + " " + B[j + 1][0]); i += 1; j += 2; continue
            if gk[i] and got[i][0].endswith("-") or (i == 0 and got[i][0][:1].islower() and op != "equal"):
                err("edge", i, j if j < b2 else None); i += 1; j += 1; continue   # hyphen fragment at a block/page edge
            if j < b2 and bk[j] in names() and difflib.SequenceMatcher(None, gk[i], bk[j]).ratio() >= 0.8:
                err("variant", i, j); i += 1; j += 1; continue   # spelling of a name (Iosaphat / Iosophat)
            err("error", i, j if j < b2 else None); i += 1; j += 1
        while j < b2 and op == "replace" and b2 - b1 <= 3:
            err("missing", None, j); j += 1
    return res


def load_page(src, img):
    """Page in regions/blocks form from raw (v2) or raw3 (v3, adapted)."""
    p = os.path.join(CFG.raw2 if src == "raw" else CFG.raw3, f"{img}.json")
    if not os.path.exists(p):
        return None
    J = json.load(open(p))
    d = json.loads(J["text"]) if "text" in J else J
    if src == "raw3":
        from adapt3 import to_blocks
        d = to_blocks(d)
    return d


def flagged_words(page):
    return {fold(f.get("normalized_word") or f["word"]) for r in page["regions"] for b in r["blocks"] for f in b.get("flags", [])}


def summary(scores):
    w = sum(s["words"] for s in scores.values())
    e = [x for s in scores.values() for x in s["errors"] if x["kind"] in ("error", "missing")]
    sp = sum(s["split"] for s in scores.values())
    fl = sum(1 for x in e if x.get("flagged"))
    return {"pages_with_text": sum(1 for s in scores.values() if s["words"]), "words": w, "errors": len(e),
            "split": sp, "error_rate": round(len(e) / w, 4) if w else None, "errors_flagged": fl}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="both", choices=["raw", "raw3", "both"])
    ap.add_argument("--pages", default="0020-0103")
    a = ap.parse_args()
    from pages import parse_pages
    os.makedirs(CFG.reports, exist_ok=True)
    for src in (["raw", "raw3"] if a.src == "both" else [a.src]):
        scores = {}
        for img in parse_pages(a.pages):
            pg = load_page(src, img)
            if pg is None:
                continue
            fixed = fix_page(pg)
            scores[img] = score_page(fixed, flagged_words(fixed))
        if not scores:
            continue
        json.dump({"summary": summary(scores), "pages": scores}, open(os.path.join(CFG.reports, f"vulgate-{src}.json"), "w"),
                  ensure_ascii=False, indent=1)
        print(src, summary(scores))
        for img, s in scores.items():
            for x in s["errors"]:
                if x["kind"] not in ("variant", "edge"):
                    print(f"  {img} {x['chapter']}:{x['verse']}  {x['kind']:<7} {x['got']!r} -> {x['expected']!r}{'  (flagged)' if x.get('flagged') else ''}")


def fix_page(pg):
    """Apply fixes.fix_block (without dictionary) so the score reflects what the reader shows."""
    from fixes import fix_block, Lexicon
    global _LEX
    if _LEX is None:
        _LEX = Lexicon()
    for r in pg["regions"]:
        for b in r["blocks"]:
            b["lines"], b["normalized"], _ = fix_block(b["lines"], b.get("normalized", ""), _LEX if _LEX.ok else None)
    return pg


if __name__ == "__main__":
    main()
