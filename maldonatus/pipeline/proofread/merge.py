#!/usr/bin/env python3
"""Merge proofread answers into reader data, the review queue and the reports.

  python3 merge.py                 # all pages of the toc
  python3 merge.py --no-decisions  # ignore pipeline/review-decisions.json

For each page the source is, in order of preference:
  1. proofread/raw3/NNNN.json   line-ID proofread (prompt v3), if it passed validation;
  2. proofread/raw/NNNN.json    full-page proofread (prompt v2);
  3. the pre-proofread reader page (commit b7ccb18), when 1-2 fail the completeness check.

Steps per page (no API calls):
  - completeness check (page level: model said partial, too few lines or words against the
    OCR, stop reason; block level: normalized text much shorter or longer than the printed
    lines). Failing pages fall back to the old page and are listed for a rerun; blocks with
    a truncated normalized text get one rebuilt from the diplomatic lines.
  - fixes.fix_block on every block (symbols, tildes, spaces);
  - flags re-anchored to the line that really holds the word;
  - every line tied to its OCR line (exact for v3, aligned for v2) for pixel boxes; flag
    boxes snap to the OCR word, crops are cut per column;
  - chapter text scored against the Vulgate; differences become `vulgate_diff` flags;
  - v3 lines the model marked "check"/"unsure" become `line_unsure` flags;
  - Opus decisions (review-decisions.json, from opus_review.py) are applied.
Writes reader/data/pages, reader/data/toc.json, pipeline/review-queue.json,
proofread/reports/completeness.json and proofread/reports/merge-summary.json.
"""
import argparse
import collections
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from config import CFG, REPO  # noqa: E402
from fixes import fix_block, normalize_lines, Lexicon, key as fkey  # noqa: E402
from adapt3 import to_blocks  # noqa: E402
import vulgate  # noqa: E402

SCRIPT = {"greek": re.compile(r"[Ͱ-Ͽἀ-῿]"), "hebrew": re.compile(r"[֐-׿]"),
          "other_script": re.compile(r"[Ѐ-ӿ؀-ۿ܀-ݏऀ-ॿ]")}
RUN = {"greek": re.compile(r"[Ͱ-Ͽἀ-῿][Ͱ-Ͽἀ-῿\s·,;:'’ʼ᾿῾.\-]*[Ͱ-Ͽἀ-῿]|[Ͱ-Ͽἀ-῿]"),
       "hebrew": re.compile(r"[֐-׿][֐-׿\s\-]*[֐-׿]|[֐-׿]"),
       "other_script": re.compile(r"[Ѐ-ӿ؀-ۿ][Ѐ-ӿ؀-ۿ\s]*[Ѐ-ӿ؀-ۿ]|[Ѐ-ӿ؀-ۿ]")}
# text lost: these phrases in the model's page notes make the page fall back
PARTIAL = re.compile(r"\b(partial transcription|transcription is partial|only the head|only the first|rest of the page|"
                     r"remaining (text|lines|col)|truncat\w* (the|this|at)|not included)", re.I)
# something left out that is not body text (gutter letters, show-through, marks): a warning
NOT_TRANSCRIBED = re.compile(r"\b(not transcribed|omitted|illegible|ignored)", re.I)
COUNT = collections.Counter()
LEX = None


def key(s):
    s = unicodedata.normalize("NFD", s.lower().replace("ſ", "s").replace("ʃ", "s"))
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-zͰ-Ͽ֐-׿0-9]", "", s).replace("f", "s")


def clean_reason(r):
    return re.sub(r"[()<>\"&]", "", r or "").strip()[:80]


def script_of(s):
    for k, rx in SCRIPT.items():
        if rx.search(s):
            return k
    return None


# ---------------------------------------------------------------- old reader data (pre-proofread)
def old_data():
    """Export the reader data of CFG.base_commit (pages, toc, colmap, norm-log) once into the work dir."""
    d = os.path.join(CFG.work, f"old-reader-{CFG.base_commit}")
    if os.path.exists(os.path.join(d, "toc.json")):
        return d
    os.makedirs(os.path.join(d, "pages"), exist_ok=True)
    ls = subprocess.run(["git", "-C", REPO, "ls-tree", "-r", "--name-only", CFG.base_commit, "maldonatus/reader/data"],
                        capture_output=True, text=True, check=True).stdout.split()
    for p in ls:
        out = os.path.join(d, p.split("maldonatus/reader/data/", 1)[1])
        os.makedirs(os.path.dirname(out), exist_ok=True)
        blob = subprocess.run(["git", "-C", REPO, "show", f"{CFG.base_commit}:{p}"], capture_output=True, check=True).stdout
        open(out, "wb").write(blob)
    return d


# ---------------------------------------------------------------- alignment old line ids -> new lines (v2)
def align(old, new):
    """old, new: lists of (id, text). Needleman-Wunsch on fuzzy line similarity. returns {old id: new id}"""
    ko = [key(t) for _, t in old]; kn = [key(t) for _, t in new]
    n, m = len(old), len(new); G = -0.35
    S = [[0.0] * (m + 1) for _ in range(n + 1)]; P = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1): S[i][0] = i * G; P[i][0] = 1
    for j in range(1, m + 1): S[0][j] = j * G; P[0][j] = 2
    sim = {}
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s = difflib.SequenceMatcher(None, ko[i - 1], kn[j - 1], autojunk=False).ratio() if ko[i - 1] and kn[j - 1] else 0.0
            sim[i, j] = s
            c = [(S[i - 1][j - 1] + (s - 0.45) * 2, 0), (S[i - 1][j] + G, 1), (S[i][j - 1] + G, 2)]
            S[i][j], P[i][j] = max(c)
    i, j, out = n, m, {}
    while i > 0 or j > 0:
        p = P[i][j]
        if i > 0 and j > 0 and p == 0:
            if sim[i, j] >= 0.5: out[old[i - 1][0]] = new[j - 1][0]
            i -= 1; j -= 1
        elif i > 0 and (p == 1 or j == 0): i -= 1
        else: j -= 1
    return out


# ---------------------------------------------------------------- completeness (step 2)
def completeness(img, page, meta, pl):
    """Page-level problems make the page fall back; block-level ones rebuild normalized text."""
    probs, warns, blocks = [], [], []
    if meta.get("stop") not in (None, "end_turn"):
        probs.append(f"stop reason {meta.get('stop')}")
    if PARTIAL.search(page.get("page_notes", "")):
        probs.append("model notes: " + page["page_notes"][:140])
    if meta.get("valid") is False:
        probs.append("v3 validation: " + "; ".join(meta.get("problems") or [])[:200])
    body = ("full", "col_a", "col_b")
    ocr_lines = sum(len(pl["regions"][r]) for r in body)
    ocr_words = sum(len(L["text"].split()) for r in body for L in pl["regions"][r])
    new_lines = sum(len(b["lines"]) for r in page["regions"] if r["region"] in body for b in r["blocks"])
    new_words = sum(len(" ".join(b["lines"]).split()) for r in page["regions"] if r["region"] in body for b in r["blocks"])
    # OCR counts include noise lines (show-through, ornaments), so only a large shortfall is
    # a truncation; a moderate one is reported for a look
    for what, got, ocrn, floor in (("body lines", new_lines, ocr_lines, 20), ("body words", new_words, ocr_words, 150)):
        if ocrn >= floor and got < 0.6 * ocrn:
            probs.append(f"{got} {what} for {ocrn} in the OCR")
        elif ocrn >= floor and got < 0.85 * ocrn:
            warns.append(f"{got} {what} for {ocrn} in the OCR (OCR noise, or text missing?)")
    if NOT_TRANSCRIBED.search(page.get("page_notes", "")):
        warns.append("model notes: " + page["page_notes"][:160])
    for ri, r in enumerate(page["regions"]):
        for bi, b in enumerate(r["blocks"]):
            dl = re.sub(r"-\s+", "", " ".join(b["lines"]))
            nd, nn = len(dl.split()), len((b.get("normalized") or "").split())
            if nd >= 15 and not (0.8 * nd <= nn <= 1.3 * nd):
                blocks.append({"region": r["region"], "ri": ri, "block": bi, "printed_words": nd, "normalized_words": nn})
    if pl["regions"]["gutter"] and not any(b.get("kind") == "letter" for r in page["regions"] for b in r["blocks"]):
        warns.append(f"{len(pl['regions']['gutter'])} gutter letters in the OCR, none in the answer")
    status = "incomplete" if probs else ("normalized_rebuilt" if blocks else ("check" if warns else "ok"))
    return {"status": status, "problems": probs, "blocks": blocks, "warnings": warns,
            "ocr_body_lines": ocr_lines, "body_lines": new_lines, "ocr_body_words": ocr_words, "body_words": new_words}


# ---------------------------------------------------------------- flags
def anchor_flag(f, lines):
    """Find the line (and exact token) that holds a flagged word. Returns (line index or None, token)."""
    w = f["d"]
    if not w:
        return f["i"], w
    hits = [i for i, L in enumerate(lines) if w in L]
    if hits:
        return min(hits, key=lambda i: abs(i - f["i"])), w
    kw = fkey(w)
    if kw:
        best = None
        for i, L in enumerate(lines):
            for m in re.finditer(r"\S+", L):
                t = m.group(0).strip(",;:.()")
                kt = fkey(t)
                if not kt:
                    continue
                s = 1.0 if kt == kw else difflib.SequenceMatcher(None, kt, kw).ratio()
                if s >= 0.8 and (best is None or (s, -abs(i - f["i"])) > (best[0], -abs(best[1] - f["i"]))):
                    best = (s, i, t)
        if best:
            return best[1], best[2]
    return None, w


def stable_id(img, block, li, word, t):
    return f"{img}-" + hashlib.sha1(f"{block}|{li}|{word}|{t}".encode()).hexdigest()[:8]


# ---------------------------------------------------------------- page build
def build(img, page, ocrpage, oldpage, pl, v3, decisions, stats):
    from ocrlines import column_boxes, line_height
    H = ocrpage["height"]; W = ocrpage["width"]
    owords = [w for w in ocrpage["words"] if w[0].strip()]
    pg = {k: oldpage[k] for k in ("vol", "img", "bsb", "seq", "mdz", "cols", "colsrc", "size")}
    pg["head"] = pg["headN"] = oldpage["head"]; pg["foot"] = []
    groups, notes = [], []
    counters = collections.Counter(); newlines = []
    exact = {}                  # new line id -> OCR line id (v3)
    two = None
    rebuilt = {(x["ri"], x["block"]) for x in stats["completeness"].get("blocks", [])}

    def new_id(letter):
        counters[letter] += 1
        return f"{img}{letter}{counters[letter] - 1}"
    allflags = []
    for ri, reg in enumerate(page["regions"]):
        rg = reg["region"]
        for bi, b in enumerate(reg["blocks"]):
            lines, norm, st = fix_block(b["lines"], b.get("normalized", ""), LEX if LEX and LEX.ok else None)
            stats["fixes"].update(st)
            if (ri, bi) in rebuilt:
                norm = normalize_lines(lines, LEX); b["_nfb"] = True; stats["fixes"]["normalized_rebuilt"] += 1
            b["lines"], b["normalized"] = lines, norm
        if rg == "head":
            b = reg["blocks"][0] if reg["blocks"] else None
            if b:
                pg["head"] = " ".join(b["lines"]); pg["headN"] = b["normalized"] or pg["head"]
            continue
        if rg == "foot":
            for b in reg["blocks"]:
                pg["foot"].append(" ".join(b["lines"]))
            continue
        if rg in ("margin_left", "margin_right"):
            for b in reg["blocks"]:
                kind = "letter" if b["kind"] == "letter" else "note"
                n = {"kind": kind, "side": "gutter" if kind == "letter" else ("left" if rg == "margin_left" else "right"),
                     "d": b["lines"], "n": [b["normalized"]] if kind == "note" else b["lines"], "hint": b.get("margin_anchor", ""),
                     "ocr": (b.get("line_ids") or [None])[0],
                     "flags": [{"i": max(0, f["line"] - 1), "d": f["word"], "n": f.get("normalized_word") or f["word"], "t": f["type"],
                                "r": clean_reason(f["reason"]), "y": f.get("y_pct")} for f in b["flags"]]}
                notes.append(n)
            continue
        letter = {"full": "f", "col_a": "a", "col_b": "b"}[rg]
        if rg == "full":
            two = None
            grp = groups[-1] if groups and groups[-1]["t"] == "full" else None
            if not grp:
                grp = {"t": "full", "cols": [{"lines": []}]}; groups.append(grp)
            col = grp["cols"][0]
        else:
            if two is None:
                cs = pg["cols"] if pg["cols"] else [None, None]
                two = {"t": "two", "cols": [{"n": cs[0] if len(cs) > 0 else None, "lines": []}, {"n": cs[1] if len(cs) > 1 else None, "lines": []}]}
                groups.append(two)
            col = two["cols"][0 if rg == "col_a" else 1]
        for bi, b in enumerate(reg["blocks"]):
            bid = new_id(letter)
            L = {"id": bid, "d": " ".join(b["lines"]), "dl": b["lines"], "n": b["normalized"], "p": 1}
            if b.get("_nfb"):
                L["nfb"] = 1
            if b["kind"] == "lemma":
                L["lem"] = 1
            if b["kind"] == "heading":
                L["h"] = "comm" if re.search(r"\bIN\s+CAP", b["lines"][0] if b["lines"] else "", re.I) else "text"
            fl = [{"i": max(0, f["line"] - 1), "d": f["word"], "n": f.get("normalized_word") or f["word"], "t": f["type"],
                   "r": clean_reason(f["reason"]), "y": f.get("y_pct")} for f in b["flags"]]
            have = {x["d"] for x in fl}
            for li, line in enumerate(b["lines"]):
                for t, rx in RUN.items():
                    for m in rx.finditer(line):
                        run = m.group(0).strip()
                        if run and not any(run in h or h in run for h in have if script_of(h)):
                            fl.append({"i": li, "d": run, "n": run, "t": t, "r": "auto: non-Latin script", "y": None, "auto": 1}); have.add(run)
                if "[?]" in line and not any(x["i"] == li and "[?]" in x["d"] for x in fl):
                    m = re.search(r"\S*\[\?\]\S*", line)
                    fl.append({"i": li, "d": m.group(0) if m else "[?]", "n": "[?]", "t": "unsure", "r": "unreadable", "y": None, "auto": 1})
                if "�" in line:
                    fl.append({"i": li, "d": re.search(r"\S*�\S*", line).group(0), "n": "", "t": "unsure", "r": "auto: broken character", "y": None, "auto": 1})
            for li, c in enumerate(b.get("conf") or []):
                if c in ("check", "unsure"):
                    fl.append({"i": li, "d": b["lines"][li], "n": "", "t": "line_unsure", "r": f"model marked the line {c}", "y": None, "auto": 1})
            for x in fl:
                s = script_of(x["d"])
                if s and x["t"] not in ("greek", "hebrew", "other_script", "line_unsure"):
                    x["t"] = s
            # re-anchor flags to the line that holds the word
            for x in fl:
                if x["t"] == "line_unsure":
                    continue
                li, tok = anchor_flag(x, b["lines"])
                if li is None:
                    x["anchor"] = "none"; stats["flags"]["not_found"] += 1
                else:
                    if li != x["i"]:
                        stats["flags"]["moved"] += 1
                    x["i"], x["d"] = li, tok
            L["fl"] = fl
            col["lines"].append(L)
            for li, line in enumerate(b["lines"]):
                newlines.append((f"{bid}.{li}", line))
                if b.get("line_ids") and not b["line_ids"][li].startswith("+"):
                    exact[f"{bid}.{li}"] = b["line_ids"][li]
            allflags.append((L, rg, ri, bi))
    pg["columns"] = groups

    # auto ocr_copy: plain-letter diplomatic word identical to an OCR word and not a dictionary word
    if LEX is not None and LEX.ok:
        okeys = {key(w[0]) for w in owords}
        toks = {}
        for L, rg, _, _ in allflags:
            for li, line in enumerate(L["dl"]):
                prevh = li > 0 and L["dl"][li - 1].rstrip().endswith("-")
                for m_ in re.finditer(r"[A-Za-zæœÆŒſ]{4,}", line):
                    t = m_.group(0)
                    if t[0].isupper() or t.upper() == t:
                        continue
                    if line.rstrip().endswith("-") and m_.end() >= len(line.rstrip()) - 1:
                        continue
                    if prevh and m_.start() == 0:
                        continue
                    if t[-1] in "qb" or COUNT[key(t)] >= 4:
                        continue
                    if key(t) in okeys:
                        w_ = t.replace("ſ", "s").replace("v", "u").replace("j", "i").replace("æ", "ae").replace("œ", "oe")
                        toks.setdefault(w_, []).append((L, li, t))
        LEX.prime(list(toks))
        for w, occ in toks.items():
            if not LEX(w):
                for L, li, t in occ:
                    if any(x["i"] == li and (x["d"] == t or t in x["d"]) for x in L["fl"]):
                        continue
                    L["fl"].append({"i": li, "d": t, "n": w, "t": "ocr_copy", "r": "auto: not in dictionary and identical to OCR", "y": None, "auto": 1})

    # Vulgate check of the chapter text: differences become flags
    vpage = {"regions": [{"region": r["region"], "blocks": [{"kind": b["kind"], "normalized": b["normalized"]} for b in r["blocks"]]}
                         for r in page["regions"]]}
    bymap = {(ri, bi): L for L, rg, ri, bi in allflags}
    vs = vulgate.score_page(vpage, set())
    stats["vulgate"][img] = {"words": vs["words"], "errors": sum(1 for e in vs["errors"] if e["kind"] in ("error", "missing")),
                             "split": vs["split"]}
    for e in vs["errors"]:
        if e["kind"] not in ("error", "split") or not e.get("ref") or e["got"].endswith("-"):
            continue
        L = bymap.get(tuple(e["ref"]))
        if L is None:
            continue
        first = e["got"].split()[0]
        why = f"Vulgate {e['chapter']}:{e['verse']} has: {e['expected']}" if e.get("expected") else "word not in the Vulgate text here"
        x = {"i": 0, "d": first, "n": e["got"], "t": "vulgate_diff", "r": clean_reason(why),
             "y": None, "auto": 1}
        li, tok = anchor_flag(x, L["dl"])
        if li is None:
            continue
        x["i"], x["d"] = li, tok
        if not any(y["i"] == li and y["d"] == tok and y["t"] == "vulgate_diff" for y in L["fl"]):
            L["fl"].append(x)

    # notes: anchor to a body line (v3: by geometry from the OCR boxes; v2: by the model's hint)
    body_by_ocr = {o: n for n, o in exact.items()}
    for k, n in enumerate(notes):
        hint = key(n.pop("hint", "") or "")
        best = None
        ocr = n.pop("ocr", None)
        if ocr and ocr in pl["lines"] and pl["lines"][ocr].get("box"):
            y = (pl["lines"][ocr]["box"][1] + pl["lines"][ocr]["box"][3]) / 2
            side = "col_a" if n["side"] in ("left", "gutter") else "col_b"
            cands = [L for r in (side, "full") for L in pl["regions"][r] if L["id"] in body_by_ocr]
            if cands:
                best = body_by_ocr[min(cands, key=lambda L: abs((L["box"][1] + L["box"][3]) / 2 - y))["id"]]
        if best is None and hint:
            bs = 0.0
            for lid, t in newlines:
                s = difflib.SequenceMatcher(None, hint, key(t)[:len(hint)], autojunk=False).ratio()
                if s > bs:
                    best, bs = lid, s
            if bs < 0.55:
                best = None
        n["id"] = f"{img}n{k}"; n["anchor"] = best or (newlines[0][0] if newlines else None)
        n["fl"] = n.pop("flags")
    pg["notes"] = [n for n in notes if n["anchor"]]

    # old OCR line id -> new line id; new line -> OCR box
    if v3:
        idmap = {o: n for n, o in exact.items()}
    else:
        oldlines = [(L["id"], L["d"]) for g in oldpage["columns"] for c in g["cols"] for L in c["lines"]]
        idmap = align(oldlines, newlines)
    new2ocr = {n: o for o, n in idmap.items()}
    colbox = column_boxes(pl); lh = line_height(pl)

    # review items (stable ids); Opus decisions applied here
    items = []
    USED, SEEN = set(), set()

    def item(L, rg, f, ocr_id):
        lines = L.get("dl") or []
        li = min(f["i"], max(0, len(lines) - 1))
        word = f["d"]
        box, how = None, "none"
        oline = pl["lines"].get(ocr_id) if ocr_id else None
        if oline and oline.get("box") and oline["words"]:
            if f["t"] == "line_unsure":
                box, how = oline["box"], "ocr-line"
            else:
                kw = fkey(word); sc = script_of(word)
                cand = []
                for w in oline["words"]:
                    if sc:
                        if script_of(w[0]) == sc: cand.append((1.0, w))
                    elif kw and fkey(w[0]):
                        s = difflib.SequenceMatcher(None, kw, fkey(w[0]), autojunk=False).ratio()
                        if s >= 0.5: cand.append((s, w))
                cand.sort(key=lambda t: -t[0])
                fresh = [c for c in cand if (c[1][1], c[1][2]) not in USED]
                if fresh or cand:
                    w = (fresh or cand)[0][1]; USED.add((w[1], w[2]))
                    box, how = [w[1], w[2], w[3], w[4]], "ocr-word"
                    if sc:
                        same = [c[1] for c in cand]
                        box = [min(s[1] for s in same), min(s[2] for s in same), max(s[3] for s in same), max(s[4] for s in same)]
                else:
                    box, how = oline["box"], "ocr-line"
        elif f.get("y") is not None:
            x0, x1 = {"col_a": (0.05, 0.54), "col_b": (0.46, 0.95)}.get(rg, (0.05, 0.95))
            box = [int(x0 * W), int((f["y"] - 0.9) / 100 * H), int(x1 * W), int((f["y"] + 0.9) / 100 * H)]; how = "approx-y"
        crop = None
        if box:
            region = rg if rg in colbox else ("col_a" if rg == "margin_left" else "col_b" if rg == "margin_right" else "full")
            cx0, _, cx1, _ = colbox.get(region, [0, 0, W, H])
            if rg.startswith("margin"):
                cx0, cx1 = max(0, box[0] - 160), min(W, box[2] + 160)
            crop = [int(min(cx0, box[0])), int(max(0, box[1] - 1.6 * lh)), int(max(cx1, box[2])), int(min(H, box[3] + 1.6 * lh))]
        it = {"id": stable_id(img, L["id"], li, word, f["t"]), "img": img, "block": L["id"], "line": li, "region": rg,
              "type": f["t"], "word": word, "normalized_word": f["n"], "reason": f["r"], "auto": bool(f.get("auto")),
              "line_text": lines[li] if lines else "", "prev_line": lines[li - 1] if li > 0 else "",
              "next_line": lines[li + 1] if li + 1 < len(lines) else "", "sonnet_best": word,
              "ocr_line": ocr_id, "bbox": box, "bbox_source": how, "crop_box": crop, "page_wh": [W, H],
              "source": "v3" if v3 else "v2"}
        if f.get("anchor") == "none":
            it["anchor"] = "not found in the block"
        base, k = it["id"], 1
        while it["id"] in SEEN:
            k += 1; it["id"] = f"{base}-{k}"
        SEEN.add(it["id"])
        return it

    def apply_decision(L, f, it, is_note=False):
        d = decisions.get(it["id"])
        if not d:
            return "open"
        v = d.get("verdict")
        if v == "confirm":
            stats["decisions"]["confirm"] += 1
            return "drop"
        if v == "correct" and d.get("diplomatic") is not None:
            li = it["line"]
            dl = L["d"] if is_note else L["dl"]
            if 0 <= li < len(dl) and it["word"] and it["word"] in dl[li]:
                dl[li] = dl[li].replace(it["word"], d["diplomatic"], 1)
                if not is_note:
                    L["d"] = " ".join(dl)
                nw = it["normalized_word"] or ""
                if d.get("normalized") is not None:
                    if is_note:
                        L["n"] = [x.replace(nw, d["normalized"], 1) if nw else x for x in L["n"]]
                    elif nw and nw in L["n"]:
                        L["n"] = L["n"].replace(nw, d["normalized"], 1)
                stats["decisions"]["correct"] += 1
                return "drop"
            stats["decisions"]["stale"] += 1
            return "open"
        if v in ("unreadable", "not_found"):
            f["r"] = clean_reason(f"Opus: {v}. " + (d.get("note") or ""))
            stats["decisions"][v] += 1
            return "reviewed"
        return "open"

    for L, rg, _, _ in allflags:
        keep = []
        for f in L["fl"]:
            ocr_id = new2ocr.get(f"{L['id']}.{min(f['i'], len(L['dl']) - 1)}")
            it = item(L, rg, f, ocr_id)
            st = apply_decision(L, f, it)
            if st == "drop":
                continue
            if st == "reviewed":
                it["reviewed"] = True; it["reason"] = f["r"]
            keep.append(f); items.append(it)
        L["fl"] = keep
    for n in pg["notes"]:
        keep = []
        side = {"left": "margin_left", "right": "margin_right", "gutter": "gutter"}[n["side"]]
        for f in n["fl"]:
            pseudo = {"id": n["id"], "dl": n["d"], "n": " ".join(n["n"])}
            li = min(f["i"], len(n["d"]) - 1) if n["d"] else 0
            kt = key(n["d"][li]) if n["d"] else ""
            best, bs = None, 0.5
            for OL in pl["regions"].get(side, []):
                s_ = difflib.SequenceMatcher(None, kt, key(OL["text"]), autojunk=False).ratio() if kt else 0
                if s_ > bs:
                    best, bs = OL["id"], s_
            it = item(pseudo, "margin_" + n["side"], f, best)
            st = apply_decision(n, f, it, is_note=True)
            if st == "drop":
                continue
            if st == "reviewed":
                it["reviewed"] = True
            keep.append(f); items.append(it)
        n["fl"] = keep
    return pg, idmap, items


def load_source(img):
    """(source name, page in regions/blocks form, meta) or (None, None, None)."""
    p3 = os.path.join(CFG.raw3, f"{img}.json")
    if os.path.exists(p3):
        J = json.load(open(p3))
        try:
            ans = json.loads(J["text"])
            meta = {"stop": J.get("stop"), "valid": J.get("valid", True), "problems": J.get("problems")}
            if meta["valid"] is not False:
                return "v3", to_blocks(ans), meta
        except ValueError:
            pass
    p2 = os.path.join(CFG.raw2, f"{img}.json")
    if os.path.exists(p2):
        J = json.load(open(p2))
        return "v2", json.loads(J["text"]), {"stop": J.get("stop")}
    return None, None, None


def main():
    global LEX
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-decisions", action="store_true")
    a = ap.parse_args()
    from ocrlines import load_pack, page_lines
    LEX = Lexicon()
    if not LEX.ok:
        print("warning: hunspell or the Latin dictionary not found (MALD_DICT); dictionary steps skipped")
    OLD = old_data()
    ocr = load_pack()
    decisions = {} if a.no_decisions or not os.path.exists(CFG.decisions) else json.load(open(CFG.decisions))
    toc = json.load(open(os.path.join(OLD, "toc.json")))
    srcs = {}
    for p in toc["pages"]:
        s, page, meta = load_source(p["img"])
        srcs[p["img"]] = (s, page, meta)
        if page:
            for reg in page["regions"]:
                for b in reg["blocks"]:
                    for line in b["lines"]:
                        for t in re.findall(r"[A-Za-zæœÆŒſ]{4,}", line):
                            COUNT[key(t)] += 1
    out = CFG.reader
    os.makedirs(out + "/pages", exist_ok=True)
    allitems, idmaps, pages = [], {}, {}
    stats = {"fixes": collections.Counter(), "flags": collections.Counter(), "decisions": collections.Counter(), "vulgate": {}}
    report = {}
    fallback = set()
    for p in toc["pages"]:
        img = p["img"]
        oldp = json.load(open(f"{OLD}/pages/tom1-{img}.json"))
        s, page, meta = srcs[img]
        pl = page_lines(ocr[img])
        if page is None:
            json.dump(oldp, open(f"{out}/pages/tom1-{img}.json", "w"), ensure_ascii=False, separators=(",", ":"))
            pages[img] = oldp; fallback.add(img); report[img] = {"source": "ocr", "status": "no proofread"}
            continue
        comp = completeness(img, page, meta, pl)
        comp["source"] = s
        report[img] = comp
        if comp["status"] == "incomplete" and s == "v3":          # try the v2 answer before falling back
            s2 = os.path.join(CFG.raw2, f"{img}.json")
            if os.path.exists(s2):
                J = json.load(open(s2)); page2 = json.loads(J["text"])
                c2 = completeness(img, page2, {"stop": J.get("stop")}, pl)
                if c2["status"] != "incomplete":
                    page, comp, s = page2, {**c2, "source": "v2", "v3_problems": comp["problems"]}, "v2"
                    report[img] = comp
        if comp["status"] == "incomplete":
            oldp = dict(oldp); oldp["proof"] = "ocr (proofread incomplete: rerun)"
            json.dump(oldp, open(f"{out}/pages/tom1-{img}.json", "w"), ensure_ascii=False, separators=(",", ":"))
            pages[img] = oldp; fallback.add(img)
            continue
        stats["completeness"] = comp
        pg, idmap, items = build(img, page, ocr[img], oldp, pl, s == "v3", decisions, stats)
        pg["proof"] = {"v3": "sonnet-5-5 line-ID proofread (v3)", "v2": "sonnet-5-5 full-page proofread (v2)"}[s]
        if comp["status"] == "normalized_rebuilt":
            pg["proof"] += "; some normalized paragraphs rebuilt from the diplomatic text"
        json.dump(pg, open(f"{out}/pages/tom1-{img}.json", "w"), ensure_ascii=False, separators=(",", ":"))
        pages[img] = pg; idmaps.update(idmap); allitems += items
    stats.pop("completeness", None)

    # toc: remap line ids, refresh lemma texts (fallback pages keep their ids)
    lineinfo = {}
    for img, pg in pages.items():
        for g in pg["columns"]:
            for c in g["cols"]:
                for L in c["lines"]:
                    if "dl" in L:
                        for i in range(len(L["dl"])):
                            lineinfo[f"{L['id']}.{i}"] = (L, i)
    for img in fallback:
        for g in pages[img]["columns"]:
            for c in g["cols"]:
                for L in c["lines"]:
                    idmaps[L["id"]] = L["id"]
    miss = 0

    def fixlem(l):
        nonlocal miss
        new = idmaps.get(l["id"])
        if not new:
            miss += 1; return False
        l["id"] = new
        if new in lineinfo:
            L, i = lineinfo[new]
            if i == 0 and L.get("lem"):
                cut = lambda s: s[:s.find(")") + 1] if ")" in s[:120] else s[:60]
                l["d"] = cut(L["d"]); l["n"] = cut(L["n"])
        return True
    for bk in toc["books"]:
        for ch in bk["chapters"]:
            for k in ("start", "text", "comm"):
                if ch.get(k):
                    ch[k] = idmaps.get(ch[k])
            for v in ch.get("verses", []):
                v["lemmas"] = [l for l in v["lemmas"] if fixlem(l)]
    json.dump(toc, open(out + "/toc.json", "w"), ensure_ascii=False, separators=(",", ":"))
    for f in ("colmap.json", "norm-log.json"):
        if not os.path.exists(f"{out}/{f}"):
            open(f"{out}/{f}", "w").write(open(os.path.join(OLD, f)).read())
    # keep earlier review state (reviewed flags stay marked)
    json.dump(allitems, open(CFG.queue, "w"), ensure_ascii=False, indent=0)
    os.makedirs(CFG.reports, exist_ok=True)
    rerun = sorted(i for i, r in report.items() if r.get("status") in ("incomplete", "normalized_rebuilt"))
    check = sorted(i for i, r in report.items() if r.get("status") == "check")
    json.dump({"rerun": rerun, "check": check, "pages": report}, open(os.path.join(CFG.reports, "completeness.json"), "w"), ensure_ascii=False, indent=1)
    vw = sum(v["words"] for v in stats["vulgate"].values()); ve = sum(v["errors"] for v in stats["vulgate"].values())
    summ = {"pages": len(pages), "sources": collections.Counter(r.get("source") for r in report.values()),
            "status": collections.Counter(r.get("status") for r in report.values()), "rerun": rerun, "check": check,
            "fixes": dict(stats["fixes"]), "flags": dict(stats["flags"]), "decisions_applied": dict(stats["decisions"]),
            "review_items": len(allitems), "review_open": sum(1 for i in allitems if not i.get("reviewed")),
            "review_types": collections.Counter(i["type"] for i in allitems),
            "bbox_source": collections.Counter(i["bbox_source"] for i in allitems),
            "vulgate": {"words": vw, "errors": ve, "rate": round(ve / vw, 4) if vw else None}, "toc_ids_lost": miss}
    json.dump(summ, open(os.path.join(CFG.reports, "merge-summary.json"), "w"), ensure_ascii=False, indent=1)
    for k, v in summ.items():
        print(f"{k}: {dict(v) if isinstance(v, collections.Counter) else v}")
    for img in rerun:
        r = report[img]
        print(f"  rerun {img}: {r['status']}: {'; '.join(r['problems']) or ', '.join(str(b) for b in r['blocks'])}"[:300])


if __name__ == "__main__":
    main()
