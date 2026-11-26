#!/usr/bin/env python3
"""Merge Sonnet proofread JSON (raw/NNNN.json) into reader page data + review queue.
   python3 merge.py [--data OUTDIR]  (reads old reader data from the repo checkout, writes to OUTDIR)"""
import json, os, re, sys, gzip, difflib, unicodedata, subprocess, collections, html
from PIL import Image
OUT = "/workspace/maldonatus-proofread"
REPO = "/workspace/ok-maldonatus/maldonatus/reader/data/"
OLDPAGES = "/workspace/maldonatus-proofread/old-pages/"      # pristine copies of the pre-merge page data
SCANS = "/home/box/commentaria/maldonatus-evangelia/scans/bsb11059226_tom1_1596/"
WORDS = "/workspace/maldonatus-pack/bsb11059226_tom1_1596_words.json.gz"
DICT = "/workspace/dictla/package/index"
CROPS = "/workspace/maldonatus-review-crops/"
SCRIPT = {"greek": re.compile(r"[\u0370-\u03ff\u1f00-\u1fff]"), "hebrew": re.compile(r"[\u0590-\u05ff]"),
          "other_script": re.compile(r"[\u0400-\u04ff\u0600-\u06ff\u0700-\u074f\u0900-\u097f]")}
RUN = {"greek": re.compile(r"[\u0370-\u03ff\u1f00-\u1fff][\u0370-\u03ff\u1f00-\u1fff\s·,;:'’ʼ᾿῾.\-]*[\u0370-\u03ff\u1f00-\u1fff]|[\u0370-\u03ff\u1f00-\u1fff]"),
       "hebrew": re.compile(r"[\u0590-\u05ff][\u0590-\u05ff\s\-]*[\u0590-\u05ff]|[\u0590-\u05ff]"),
       "other_script": re.compile(r"[\u0400-\u04ff\u0600-\u06ff][\u0400-\u04ff\u0600-\u06ff\s]*[\u0400-\u04ff\u0600-\u06ff]|[\u0400-\u04ff\u0600-\u06ff]")}

def key(s):
    s = unicodedata.normalize("NFD", s.lower().replace("ſ", "s").replace("ʃ", "s"))
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z\u0370-\u03ff\u0590-\u05ff0-9]", "", s).replace("f", "s")

def clean_reason(r): return re.sub(r"[()<>\"&]", "", r).strip()[:60]

def script_of(s):
    for k, rx in SCRIPT.items():
        if rx.search(s): return k
    return None

def blocks_of(raw):
    r = json.loads(raw["text"]); return r

# ---------------------------------------------------------------- alignment old line ids -> new lines
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
            sm = difflib.SequenceMatcher(None, ko[i - 1], kn[j - 1], autojunk=False) if ko[i - 1] and kn[j - 1] else None
            s = sm.ratio() if sm else 0.0
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

# ---------------------------------------------------------------- hunspell
def hunspell(words):
    ws = sorted(set(words))
    if not ws: return set()
    r = subprocess.run(["hunspell", "-d", DICT, "-l"], input="\n".join(ws), capture_output=True, text=True)
    return set(r.stdout.split())

def norm_tokens(s): return re.findall(r"[A-Za-zÀ-ÿĀ-žæœÆŒ]+", s)

def build(img, raw, ocrpage, oldpage, vol=1):
    r = blocks_of(raw); H = ocrpage["height"]; W = ocrpage["width"]
    owords = [w for w in ocrpage["words"] if w[0].strip()]
    pg = {k: oldpage[k] for k in ("vol", "img", "bsb", "seq", "mdz", "cols", "colsrc", "size")}
    pg["head"] = pg["headN"] = oldpage["head"]; pg["foot"] = []; pg["proof"] = "sonnet-5-5"
    groups, notes, queue = [], [], []
    counters = collections.Counter(); newlines = []   # (line id, text)
    two = None
    def new_id(letter): counters[letter] += 1; return f"{img}{letter}{counters[letter] - 1}"
    allflags = []
    for reg in r["regions"]:
        rg = reg["region"]
        if rg == "head":
            b = reg["blocks"][0] if reg["blocks"] else None
            if b: pg["head"] = " ".join(b["lines"]); pg["headN"] = b["normalized"] or pg["head"]
            continue
        if rg == "foot":
            for b in reg["blocks"]: pg["foot"].append(" ".join(b["lines"]))
            continue
        if rg in ("margin_left", "margin_right"):
            for b in reg["blocks"]:
                kind = "letter" if b["kind"] == "letter" else "note"
                notes.append({"kind": kind, "side": "gutter" if kind == "letter" else ("left" if rg == "margin_left" else "right"),
                              "d": b["lines"], "n": [b["normalized"]] if kind == "note" else b["lines"], "hint": b["margin_anchor"],
                              "flags": [{"i": 0, "d": f["word"], "n": f["normalized_word"] or f["word"], "t": f["type"],
                                         "r": clean_reason(f["reason"]), "y": f["y_pct"]} for f in b["flags"]]})
            continue
        letter = {"full": "f", "col_a": "a", "col_b": "b"}[rg]
        if rg == "full":
            two = None
            grp = groups[-1] if groups and groups[-1]["t"] == "full" else None
            if not grp: grp = {"t": "full", "cols": [{"lines": []}]}; groups.append(grp)
            col = grp["cols"][0]
        else:
            if two is None or (rg == "col_a" and two["cols"][0]["lines"] and False):
                cs = pg["cols"] if pg["cols"] else [None, None]
                two = {"t": "two", "cols": [{"n": cs[0] if len(cs) > 0 else None, "lines": []}, {"n": cs[1] if len(cs) > 1 else None, "lines": []}]}
                groups.append(two)
            col = two["cols"][0 if rg == "col_a" else 1]
        for b in reg["blocks"]:
            bid = new_id(letter)
            L = {"id": bid, "d": " ".join(b["lines"]), "dl": b["lines"], "n": b["normalized"], "p": 1}
            if b["kind"] == "lemma": L["lem"] = 1
            if b["kind"] == "heading": L["h"] = "comm" if re.search(r"\bIN\s+CAP", b["lines"][0] if b["lines"] else "", re.I) else "text"
            fl = []
            for f in b["flags"]:
                fl.append({"i": max(0, f["line"] - 1), "d": f["word"], "n": f["normalized_word"] or f["word"], "t": f["type"],
                           "r": clean_reason(f["reason"]), "y": f["y_pct"]})
            # deterministic script flags
            have = {x["d"] for x in fl}
            for li, line in enumerate(b["lines"]):
                for t, rx in RUN.items():
                    for m in rx.finditer(line):
                        run = m.group(0).strip()
                        if run and not any(run in h or h in run for h in have if script_of(h)):
                            fl.append({"i": li, "d": run, "n": run, "t": t, "r": "auto: non-Latin script", "y": None, "auto": 1}); have.add(run)
            for li, line in enumerate(b["lines"]):
                if "[?]" in line and not any(x["i"] == li for x in fl):
                    fl.append({"i": li, "d": "[?]", "n": "[?]", "t": "unsure", "r": "unreadable", "y": None, "auto": 1})
            # a flag reported as script by model must carry the script type
            for x in fl:
                s = script_of(x["d"])
                if s and x["t"] not in ("greek", "hebrew", "other_script"): x["t"] = s
            L["fl"] = fl
            L["_ocrk"] = None
            col["lines"].append(L)
            for li, line in enumerate(b["lines"]): newlines.append((f"{bid}.{li}", line))
            allflags.append((L, rg))
    pg["columns"] = groups
    # auto ocr_copy: plain-letter diplomatic word identical to an OCR word and not a dictionary word
    okeys = {key(w[0]) for w in owords}
    toks = {}
    for L, rg in allflags:
        if L.get("h") or True:
            for li, line in enumerate(L["dl"]):
                prevh = li > 0 and L["dl"][li - 1].rstrip().endswith("-")
                for m_ in re.finditer(r"[A-Za-zæœÆŒſ]{4,}", line):
                    t = m_.group(0)
                    if t[0].isupper() or t.upper() == t: continue
                    if line.rstrip().endswith("-") and m_.end() >= len(line.rstrip()) - 1: continue   # hyphen fragment
                    if prevh and m_.start() == 0: continue
                    if t[-1] in "qb" or COUNT[key(t)] >= 4: continue          # abbreviation / recurring spelling
                    if key(t) in okeys:
                        w_ = t.replace("ſ", "s").replace("v", "u").replace("j", "i").replace("æ", "ae").replace("œ", "oe")
                        toks.setdefault(w_, []).append((L, li, t))
    bad = hunspell(list(toks))
    for w, occ in toks.items():
        if w in bad:
            for L, li, t in occ:
                if any(x["i"] == li and (x["d"] == t or t in x["d"]) for x in L["fl"]): continue
                L["fl"].append({"i": li, "d": t, "n": w, "t": "ocr_copy", "r": "auto: not in dictionary and identical to OCR", "y": None, "auto": 1})
    for L, rg in allflags: L.pop("_ocrk", None)
    # notes anchors: nearest printed line by prefix similarity
    for k, n in enumerate(notes):
        hint = key(n.pop("hint", ""))
        best, bs = None, 0.0
        if hint:
            for lid, t in newlines:
                s = difflib.SequenceMatcher(None, hint, key(t)[:len(hint)], autojunk=False).ratio()
                if s > bs: best, bs = lid, s
        n["id"] = f"{img}n{k}"; n["anchor"] = best if bs >= 0.55 else (newlines[0][0] if newlines else None)
        n["fl"] = n.pop("flags")
    pg["notes"] = [n for n in notes if n["anchor"]]
    # old line id -> new line id
    oldlines = []
    for g in oldpage["columns"]:
        for c in g["cols"]:
            for L in c["lines"]: oldlines.append((L["id"], L["d"]))
    idmap = align(oldlines, newlines)
    # review items
    items = []
    ow_keys = [(w, key(w[0])) for w in owords]
    for L, rg in allflags:
        for f in L["fl"]:
            items.append(review_item(img, L, rg, f, ow_keys, W, H))
    for n in pg["notes"]:
        for f in n["fl"]:
            items.append(review_item(img, {"id": n["id"], "dl": n["d"], "n": " ".join(n["n"])}, "margin_" + n["side"], f, ow_keys, W, H))
    return pg, idmap, items

USED = set()
COUNT = collections.Counter()
def review_item(img, L, rg, f, ow_keys, W, H):
    word = f["d"]; sc = script_of(word)
    bbox, how = None, "none"
    y = f.get("y")
    cand = []
    for w, k in ow_keys:
        cy = (w[2] + w[4]) / 2 / H * 100
        if y is not None and abs(cy - y) > 5: continue
        cx = (w[1] + w[3]) / 2 / W
        if rg == "col_a" and cx > 0.56: continue
        if rg == "col_b" and cx < 0.44: continue
        if sc:
            if script_of(w[0]) == sc: cand.append((1.0 - (abs(cy - y) / 10 if y is not None else 0), w))
        else:
            kw = key(word)
            if not kw or not k: continue
            s = difflib.SequenceMatcher(None, kw, k, autojunk=False).ratio()
            if s >= 0.6: cand.append((s - (abs(cy - y) / 40 if y is not None else 0), w))
    if cand:
        cand.sort(key=lambda t: -t[0])
        fresh = [c for c in cand if (img, c[1][1], c[1][2]) not in USED] if f.get("y") is None else cand
        w = (fresh or cand)[0][1]; USED.add((img, w[1], w[2])); bbox = [w[1], w[2], w[3], w[4]]; how = "ocr-word"
        if sc:   # union of neighbouring same-script words on that line
            ys = (w[2] + w[4]) / 2
            same = [c[1] for c in cand if abs((c[1][2] + c[1][4]) / 2 - ys) < (w[4] - w[2])]
            bbox = [min(s[1] for s in same), min(s[2] for s in same), max(s[3] for s in same), max(s[4] for s in same)]
    elif y is not None:
        x0, x1 = {"col_a": (0.05, 0.54), "col_b": (0.46, 0.95)}.get(rg, (0.05, 0.95))
        bbox = [int(x0 * W), int((y - 0.9) / 100 * H), int(x1 * W), int((y + 0.9) / 100 * H)]; how = "approx-y"
    lines = L.get("dl") or []
    li = min(f["i"], max(0, len(lines) - 1))
    return {"img": img, "block": L["id"], "line": li, "region": rg, "type": f["t"], "word": word, "normalized_word": f["n"],
            "reason": f["r"], "auto": bool(f.get("auto")), "line_text": lines[li] if lines else "",
            "prev_line": lines[li - 1] if li > 0 else "", "next_line": lines[li + 1] if li + 1 < len(lines) else "",
            "sonnet_best": word, "bbox": bbox, "bbox_source": how, "page_wh": [W, H]}

def main():
    out = sys.argv[sys.argv.index("--data") + 1] if "--data" in sys.argv else OUT + "/out"
    os.makedirs(out + "/pages", exist_ok=True); os.makedirs(CROPS, exist_ok=True)
    ocr = {p["image"]: p for p in json.load(gzip.open(WORDS))["pages"]}
    for fn in os.listdir(OUT + "/raw"):
        if fn.startswith("_"): continue
        for reg in json.loads(json.load(open(f"{OUT}/raw/{fn}"))["text"])["regions"]:
            for b in reg["blocks"]:
                for line in b["lines"]:
                    for t in re.findall(r"[A-Za-zæœÆŒſ]{4,}", line): COUNT[key(t)] += 1
    toc = json.load(open(OLDPAGES + "toc.json"))
    allitems, idmaps, stats = [], {}, collections.Counter()
    pages = {}
    for p in toc["pages"]:
        img = p["img"]
        rawp = f"{OUT}/raw/{img}.json"
        if not os.path.exists(rawp): print("missing", img); continue
        oldp = json.load(open(f"{OLDPAGES}pages/tom1-{img}.json"))
        pg, idmap, items = build(img, json.load(open(rawp)), ocr[img], oldp)
        json.dump(pg, open(f"{out}/pages/tom1-{img}.json", "w"), ensure_ascii=False, separators=(",", ":"))
        pages[img] = pg; idmaps.update(idmap); allitems += items
        stats["pages"] += 1; stats["blocks"] += sum(len(c["lines"]) for g in pg["columns"] for c in g["cols"])
    # nonword auto flags: normalized word identical to the OCR word and failing the dictionary
    # (computed on blocks; added as ocr_copy flags in the queue only)
    # ---- toc: remap line ids, refresh lemma texts
    lineinfo = {}
    for pg in pages.values():
        for g in pg["columns"]:
            for c in g["cols"]:
                for L in c["lines"]:
                    for i, t in enumerate(L["dl"]): lineinfo[f"{L['id']}.{i}"] = (L, i)
    def remap(i):
        if i is None: return None
        return idmap_all.get(i)
    idmap_all = idmaps
    miss = 0
    def fixlem(l):
        nonlocal miss
        new = remap(l["id"])
        if not new: miss += 1; return False
        L, i = lineinfo[new]; l["id"] = new
        if i == 0 and L.get("lem"):
            cut = lambda s: s[:s.find(")") + 1] if ")" in s[:120] else s[:60]
            l["d"] = cut(L["d"]); l["n"] = cut(L["n"])
        return True
    for bk in toc["books"]:
        for ch in bk["chapters"]:
            for k in ("start", "text", "comm"):
                if ch.get(k): ch[k] = remap(ch[k]) or ch[k] if remap(ch[k]) else None
            for v in ch.get("verses", []):
                v["lemmas"] = [l for l in v["lemmas"] if fixlem(l)]
    json.dump(toc, open(out + "/toc.json", "w"), ensure_ascii=False, separators=(",", ":"))
    for f in ("colmap.json", "norm-log.json"):
        if not os.path.exists(f"{out}/{f}"): open(f"{out}/{f}", "w").write(open(OLDPAGES + f).read())
    json.dump(allitems, open(f"{OUT}/review-queue.json", "w"), ensure_ascii=False, indent=0)
    print(dict(stats), "toc ids lost:", miss, "items:", len(allitems), collections.Counter(i["type"] for i in allitems))

if __name__ == "__main__": main()
