"""Align lemmas (and chapter openings) with the Clementine Vulgate.

The lemmas quote the Vulgate verse they comment on, so each lemma is matched
against the verses of its chapter. A match confirms or corrects the verse
number OCR read, assigns one where OCR lost it, and restores drop-cap
initials that Vision missed (VM ergo -> CVM ergo, TTENDITE -> ATTENDITE,
VNC Iesus -> TVNC Iesus).
"""

import re

from normalize import vkey

TOK = re.compile(r"[A-Za-zÀ-ÿĀ-žęæœÆŒ]+")


def toks(text):
    return [vkey(t) for t in TOK.findall(text)]


def near(a, b):
    """Token match tolerant of one OCR slip and of a lost first letter."""
    if a == b:
        return True
    if len(a) >= 4 and len(b) >= 4:
        if abs(len(a) - len(b)) <= 1 and sum(x != y for x, y in zip(a, b)) <= 1:
            return True
    if len(a) >= 2 and len(b) - len(a) in (1, 2) and b.endswith(a):
        return True  # drop cap lost
    return False


def score(lemma_toks, verse_toks):
    if not lemma_toks:
        return 0.0
    hit = sum(1 for t in lemma_toks if any(near(t, v) for v in verse_toks))
    return hit / len(lemma_toks)


def best_verse(lemma_text, verses):
    lt = [t for t in toks(lemma_text) if len(t) >= 2]
    scores = [score(lt, toks(v)) for v in verses]
    if not scores:
        return None, 0.0, scores
    b = max(range(len(scores)), key=lambda i: (scores[i], -i))
    return b + 1, scores[b], scores


def restore_initial(word, verse_text):
    """If `word` (all caps, a drop-cap word) is the tail of a Vulgate word in
    the verse, return that word in the print's capitals (U -> V)."""
    if not re.fullmatch(r"[A-ZÆ]{2,}", word):
        return None
    k = vkey(word)
    for w in TOK.findall(verse_text):
        vw = vkey(w)
        lost = len(vw) - len(k) in (1, 2) and vw.endswith(k)           # VM -> CVM
        misread = len(k) >= 4 and len(vw) == len(k) and vw[1:] == k[1:] and vw[0] != k[0]  # RIDENS -> VIDENS
        if lost or misread:
            return w.upper().replace("U", "V").replace("J", "I")
    return None


def align_book(book, lines, vulgate_chapters, decisions_log):
    """book: the tree built by build.py; lines: id -> line dict;
    vulgate_chapters: list of chapters (lists of verse strings)."""
    for ch in book["chapters"]:
        if ch["n"] - 1 >= len(vulgate_chapters):
            continue
        verses = vulgate_chapters[ch["n"] - 1]
        # chapter text: drop cap of verse 1
        if ch.get("text"):
            first = lines.get(ch.get("text_first"))
            if first:
                for cand in TOK.findall(first["n"])[:4]:
                    rep = restore_initial(cand, verses[0])
                    if rep:
                        first["n"] = first["n"].replace(cand, rep, 1)
                        first.setdefault("c", []).append([cand, rep, "dropcap"])
                        decisions_log.append(["dropcap", cand, rep, first["id"]])
                        break
        lemmas = [(v["v"], l) for v in ch["verses"] for l in v["lemmas"]]
        last = 0
        out = []
        for vn, lem in lemmas:
            text = re.sub(r"^\s*(\d{1,2}|[Il])\s*[.,]\s*", "", lem["n"])
            b, s, scores = best_verse(text, verses)
            src = "printed" if vn else None
            if vn and vn <= len(verses) and scores[vn - 1] >= 0.5:
                v = vn
            elif b and b >= last and (s >= 0.7 or (s >= 0.5 and b <= last + 2)):
                v, src = b, "vulgate"
            elif vn:
                v = vn
            else:
                v = last or 0
                src = "inherited"
            # drop cap at the start of the lemma
            m, rep = None, None
            for mm in re.finditer(r"[A-ZÆ]{2,}", text[:20]):
                r_ = restore_initial(mm.group(0), verses[v - 1]) if v else None
                if r_:
                    m, rep = mm, r_
                    break
            if m:
                if rep:
                    L = lines.get(lem["id"])
                    g = m.group(0)
                    if L is not None and g in L["n"]:
                        L["n"] = L["n"].replace(g, rep, 1)
                        L.setdefault("c", []).append([g, rep, "dropcap"])
                    lem["n"] = lem["n"].replace(g, rep, 1)
                    decisions_log.append(["dropcap", g, rep, lem["id"]])
            lem["vsrc"] = src
            lem["score"] = round(s, 2)
            last = max(last, v)
            out.append((v, lem))
        # regroup by verse, keeping text order
        groups = []
        for v, lem in out:
            if groups and groups[-1]["v"] == v:
                groups[-1]["lemmas"].append(lem)
            else:
                groups.append({"v": v, "lemmas": [lem]})
        ch["verses"] = groups
        for g in groups:
            if g["v"] and g["v"] <= len(verses):
                g["vulgate"] = verses[g["v"] - 1]
