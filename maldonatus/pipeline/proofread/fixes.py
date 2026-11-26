#!/usr/bin/env python3
"""Deterministic clean-up of model transcriptions (no API calls).

Applied by merge.py to every block before it becomes reader data:

1. symbols   one allowed character per abbreviation sign (SYMBOLS below), in
             both the diplomatic lines and the normalized text;
2. tildes    an acute on a vowel in the diplomatic text becomes a tilde when the
             normalized text shows that vowel followed by an m/n
             (nó -> nõ when normalized "non"; tamé -> tamẽ for "tamen");
3. spaces    a , ; or : glued to the next word in the diplomatic text gets its
             space back (digits on both sides, as in "5,3", and the signs q; b;
             stay glued);
   tildes, dictionary fallback: an acute the normalized text did not expand
             (it kept "nó" too) becomes a tilde in both texts when the expansion
             is a Hunspell Latin word (m before p/b/m and at word end, n elsewhere);
4. normalized text: a glued , ; : gets its space, leftover signs are expanded.

    python3 fixes.py            # report what would change on proofread/raw (dry, prints counts)
"""
import difflib
import os
import re
import subprocess
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- symbol inventory
# The ONLY abbreviation signs allowed in the diplomatic text. The prompt (v3)
# lists the same table, so model output and clean-up agree.
SYMBOLS = [
    ("ſ", "long s", "s"),
    ("ã ẽ ĩ õ ũ (and n̄/m̄ style bars written as the tilde)", "nasal tilde: omitted m or n", "am/an, em/en, ..."),
    ("ꝰ", "-us (superscript 9-shaped sign: Christꝰ, eiꝰ, omnibꝰ)", "us"),
    ("q;", "-que (q with semicolon-shaped sign: atq;, itaq;)", "que"),
    ("b;", "-bus when printed with the semicolon-shaped sign", "bus"),
    ("ꝑ", "per (p with bar through the descender)", "per"),
    ("ꝓ", "pro (p with flourish)", "pro"),
    ("ę", "e caudata (e with hook) = æ", "æ"),
    ("æ œ Æ Œ", "ligatures, as printed", "same"),
    ("&", "et, as printed", "&"),
]

# variant -> canonical (diplomatic)
_VARIANT = {
    "⁹": "ꝰ", "ᵒ": "ꝰ", "ᵛ": "ꝰ", "˚": "ꝰ", "ᵉ": "ꝰ", "͗": "ꝰ", "ʔ": "ꝰ",
    "ẹ": "ę", "ȩ": "ę",
    "ʒ": "z", "ʓ": "z", "ꝛ": "r", "ɜ": "3",
    "ủ": "ũ", "ế": "ẽ", "ỉ": "ĩ", "ả": "ã", "ỏ": "õ",
    "⟨": "", "⟩": "", "‏": "", "‎": "", "ͅ": "",
}
_COMB_BAR = "̅"          # combining overline: printed like the tilde
_TILDE = {"a": "ã", "e": "ẽ", "i": "ĩ", "o": "õ", "u": "ũ", "A": "Ã", "E": "Ẽ", "I": "Ĩ", "O": "Õ", "U": "Ũ"}
_ACUTE = {"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U"}
_GREEK = re.compile(r"[Ͱ-Ͽἀ-῿]")


def canon_dipl(s):
    """Map symbol variants to the canonical inventory (diplomatic text)."""
    if _GREEK.search(s):                       # leave Greek runs alone; fix only the Latin around them
        return re.sub(r"[^Ͱ-Ͽἀ-῿\s]+", lambda m: canon_dipl(m.group(0)), s)
    s = unicodedata.normalize("NFC", s)
    out = []
    for i, ch in enumerate(s):
        if ch == "’" and i > 0 and s[i - 1].isalpha() and (i + 1 == len(s) or not s[i + 1].isalpha()):
            out.append("ꝰ"); continue
        out.append(_VARIANT.get(ch, ch))
    s = "".join(out)
    s = re.sub(r"ç(?=[A-Za-zſ])", "c", s)          # çapitalis -> capitalis
    s = s.replace("ç", "ę")                          # naturç -> naturę (word-final hook)
    s = re.sub("([aeiouAEIOU])" + _COMB_BAR, lambda m: _TILDE[m.group(1)], s)
    s = re.sub("([qQ])́", r"\1", s)        # q́ue -> que
    return unicodedata.normalize("NFC", s)


def canon_norm(s):
    """Normalized text: expand any sign left over, canonical ligatures, spaces after , ; :"""
    s = canon_dipl(s)
    s = s.replace("ſ", "s").replace("ꝰ", "us").replace("ꝑ", "per").replace("ꝓ", "pro")
    s = s.replace("ę", "æ").replace("Ę", "Æ")
    s = re.sub(r"\b([A-Za-z]+)q;", r"\1que", s)
    s = re.sub(r"(?<=[,;:])(?=[A-Za-zÀ-ÿĀ-žæœÆŒ&Ͱ-Ͽἀ-῿֐-׿])", " ", s)
    s = re.sub(r"  +", " ", s)
    return s


# ---------------------------------------------------------------- tokens and keys
def key(t):
    t = t.replace("ſ", "s").replace("ꝰ", "us").replace("ꝑ", "per").replace("ꝓ", "pro")
    t = t.replace("æ", "ae").replace("œ", "oe").replace("ę", "ae").replace("Æ", "ae").replace("Œ", "oe")
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = t.replace("j", "i").replace("v", "u")
    return re.sub(r"[^a-z0-9Ͱ-Ͽ֐-׿]", "", t)


def _dipl_tokens(lines):
    """Diplomatic tokens with positions. A line-final hyphenated piece is joined
    with the first token of the next line into one logical token with two parts.
    Tokens are also split after a glued , ; : so each word is its own token.
    Returns [ {"parts": [(li, start, end)], "text": str, "glue_before": bool} ]."""
    toks = []
    pend = None
    for li, line in enumerate(lines):
        ms = list(re.finditer(r"\S+", line))
        for mi, m in enumerate(ms):
            # split at glued punctuation
            pieces = []
            st = m.start()
            for sm in re.finditer(r"[,;:](?=[^\s,;:])", m.group(0)):
                cut = m.start() + sm.end()
                left, right = line[st:cut], line[cut:m.end()]
                if re.search(r"\d[,;:]$", left) and re.match(r"\d", right):
                    continue                    # 5,3 stays glued
                if re.search(r"[qb];$", left):  # q; b; are signs, not punctuation
                    continue
                pieces.append((st, cut)); st = cut
            pieces.append((st, m.end()))
            for pi, (a, b) in enumerate(pieces):
                part = (li, a, b)
                if pend is not None and mi == 0 and pi == 0:
                    pend["parts"].append(part); pend["text"] += line[a:b]; pend = None
                    continue
                tok = {"parts": [part], "text": line[a:b], "glue_before": pi > 0}
                toks.append(tok)
            last = ms[-1] if mi == len(ms) - 1 else None
            if last is not None and re.search(r"[A-Za-zſæœęꝰ̃]-$", line[pieces[-1][0]:pieces[-1][1]]) and li + 1 < len(lines):
                pend = toks[-1]; pend["text"] = pend["text"][:-1]
    return toks


def _pairs(dk, nk):
    """Align two key lists; return list of (i, j) index pairs."""
    sm = difflib.SequenceMatcher(None, dk, nk, autojunk=False)
    out = []
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op == "equal" or (op == "replace" and a2 - a1 == b2 - b1):
            out += list(zip(range(a1, a2), range(b1, b2)))
        elif op == "replace":                  # unequal: pair by best similarity, in order
            j = b1
            for i in range(a1, a2):
                best, bj = 0.0, None
                for jj in range(j, b2):
                    r = difflib.SequenceMatcher(None, dk[i], nk[jj]).ratio()
                    if r > best: best, bj = r, jj
                if bj is not None and best >= 0.5:
                    out.append((i, bj)); j = bj + 1
    return out


def _tilde_fix(dtext, ntext):
    """If dtext carries an acute that ntext shows as vowel+m/n, return dtext with tildes."""
    if not any(c in _ACUTE for c in dtext):
        return None
    nk = key(ntext)
    chars = list(dtext)
    changed = False
    for i, c in enumerate(chars):
        if c not in _ACUTE:
            continue
        v = _ACUTE[c]
        for nm in ("n", "m"):
            trial = "".join(chars[:i]) + v + nm + "".join(chars[i + 1:])
            if key(trial) == nk or (nk.startswith(key("".join(chars[:i]) + v + nm)) and len(nk) > len(key(dtext))):
                chars[i] = _TILDE[v]; changed = True
                break
    if not changed:
        return None
    out = "".join(chars)
    # whole-token check: every remaining difference must be explained
    return out


class Lexicon:
    """Hunspell Latin dictionary with a cache (one hunspell call per prime())."""
    def __init__(self, dict_base=None):
        import shutil
        from config import CFG
        self.base = dict_base or CFG.dict
        self.ok = shutil.which("hunspell") and os.path.exists(self.base + ".dic")
        self.cache = {}

    def prime(self, words):
        todo = sorted({w for w in words if w and w not in self.cache})
        if not todo:
            return
        if not self.ok:
            for w in todo: self.cache[w] = False
            return
        r = subprocess.run(["hunspell", "-d", self.base, "-l"], input="\n".join(todo), capture_output=True, text=True)
        bad = set(r.stdout.split())
        for w in todo: self.cache[w] = w not in bad

    def __call__(self, w):
        if w not in self.cache: self.prime([w])
        return self.cache[w]


def _plain(w):
    w = w.replace("ſ", "s").replace("ꝰ", "us").replace("ę", "ae").replace("æ", "ae").replace("œ", "oe")
    w = unicodedata.normalize("NFD", w)
    w = "".join(c for c in w if c not in "\u0300\u0301\u0303")
    return unicodedata.normalize("NFC", w).replace("j", "i").replace("v", "u").replace("V", "U")


def acute_candidates(word):
    """Expansions of a word with acute vowels read as tildes: [(tilde_form, expanded), ...]
    m before p/b/m and at the end of the word, n elsewhere first; both tried."""
    core = re.sub(r"[^\w\u0300-\u036fſꝰ]", "", word)
    idx = [i for i, c in enumerate(core) if c in _ACUTE]
    if not idx or len(core) < 2 or _GREEK.search(core):
        return []
    out = []
    for i in idx[:2]:
        # a printed accent on the syllable before an enclitic is real: ideóque, quámque, pleríque
        if re.fullmatch(r"[^aeiouAEIOU]*(que|q;|ue|ve|ne)", core[i + 1:]):
            continue
        v = _ACUTE[core[i]]
        nxt = core[i + 1:i + 2]
        order = ("m", "n") if (not nxt or nxt in "pbm") else ("n", "m")
        for nm in order:
            exp = core[:i] + v + nm + core[i + 1:]
            out.append((core[:i] + _TILDE[v] + core[i + 1:], exp))
    return out


def dictionary_tildes(lines, normalized, lex):
    """Acute words the alignment could not settle: tilde if the dictionary knows the expansion."""
    n = 0
    words = {m.group(0) for L in lines for m in re.finditer(r"[^\s,;:.()]*[áéíóúÁÉÍÓÚ][^\s,;:.()]*", L) if not m.group(0).endswith("-")}
    for w in sorted(words, key=len, reverse=True):
        cands = acute_candidates(w)
        lex.prime([_plain(e) for _, e in cands])
        hit = next(((t, e) for t, e in cands if lex(_plain(e))), None)
        if not hit:
            continue
        t, e = hit
        rx = re.compile(r"(?<![\w\u0300-\u036f])" + re.escape(w) + r"(?![\w\u0300-\u036f])")
        lines = [rx.sub(t, L) for L in lines]
        normalized = rx.sub(e.replace("ſ", "s"), normalized)
        n += 1
    return lines, normalized, n


def fix_block(lines, normalized, lex=None):
    """Return (lines, normalized, stats). lex: a Lexicon for the dictionary fallback."""
    st = {"symbols": 0, "tildes": 0, "spaces": 0, "norm_spaces": 0}
    new = [canon_dipl(L) for L in lines]
    st["symbols"] = sum(a != b for a, b in zip(lines, new))
    n0 = normalized or ""
    norm = canon_norm(n0)
    st["norm_spaces"] = len(re.findall(r"[,;:](?=[A-Za-zÀ-ÿæœ&])", n0)) - len(re.findall(r"[,;:](?=[A-Za-zÀ-ÿæœ&])", norm))
    if not norm.strip():
        return new, norm, st
    toks = _dipl_tokens(new)
    ntoks = norm.split()
    dk = [key(t["text"]) for t in toks]
    nk = [key(t) for t in ntoks]
    pairs = _pairs(dk, nk)
    jmap = dict(pairs)
    edits = {}                              # (li) -> list of (start, end, replacement)
    for i, j in pairs:
        t = toks[i]
        fixed = _tilde_fix(t["text"], ntoks[j])
        if fixed and fixed != t["text"]:
            # write back into the parts, char for char (lengths are equal)
            k = 0
            for (li, a, b) in t["parts"]:
                seg = new[li][a:b]
                take = len(seg) - (1 if seg.endswith("-") and (li, a, b) != t["parts"][-1] else 0)
                rep = fixed[k:k + take] + seg[take:]
                k += take
                edits.setdefault(li, []).append((a, b, rep))
            st["tildes"] += 1
    for i, t in enumerate(toks):
        if not t["glue_before"] or i == 0:
            continue
        a, b = jmap.get(i - 1), jmap.get(i)
        if a is not None and b is not None and b == a + 1:   # separate words in the normalized text
            li, s, _ = t["parts"][0]
            edits.setdefault(li, []).append((s, s, " "))
            st["spaces"] += 1
    for li, es in edits.items():
        L = new[li]
        for a, b, rep in sorted(es, key=lambda e: (-e[0], -e[1])):
            L = L[:a] + rep + L[b:]
        new[li] = L
    if lex is not None:
        new, norm, k = dictionary_tildes(new, norm, lex)
        st["tildes_dict"] = k
    return new, norm, st


def normalize_lines(lines, lex=None):
    """Fallback normalized text built from the diplomatic lines (used when the model's
    normalized paragraph is missing or truncated): hyphens joined, long s, signs and
    tildes expanded (the dictionary picks m or n when it can)."""
    parts = []
    for i, L in enumerate(lines):
        L = L.rstrip()
        if re.search(r"[A-Za-zſ\u0303ꝰ]-$", L) and i + 1 < len(lines):
            parts.append(L[:-1])
        else:
            parts.append(L + " ")
    t = "".join(parts)

    def tilde(m):
        w = m.group(0)
        idx = [k for k, c in enumerate(w) if c in "ãẽĩõũÃẼĨÕŨ"]
        base = unicodedata.normalize("NFD", w)
        for k in reversed(idx):
            v = unicodedata.normalize("NFD", w[k])[0]
            nxt = w[k + 1:k + 2]
            order = ("m", "n") if (not nxt or nxt in "pbm") else ("n", "m")
            for nm in order:
                cand = w[:k] + v + nm + w[k + 1:]
                if lex is None or not lex.ok or lex(_plain(cand.replace("ſ", "s"))):
                    w = cand; break
            else:
                w = w[:k] + v + order[0] + w[k + 1:]
        return w
    t = re.sub(r"[\wſꝰ\u0303]*[ãẽĩõũÃẼĨÕŨ][\wſꝰ\u0303]*", tilde, t)
    t = re.sub(r"\b([A-Za-zſ]+)q;", r"\1que", t)
    t = re.sub(r"\b([A-Za-zſ]+)b;", r"\1bus", t)
    return canon_norm(t).strip()


if __name__ == "__main__":
    import glob, json, os, collections
    here = os.path.dirname(os.path.abspath(__file__))
    tot = collections.Counter(); lex = Lexicon()
    for f in sorted(glob.glob(os.path.join(here, "raw", "0*.json"))):
        d = json.loads(json.load(open(f))["text"])
        for r in d["regions"]:
            for b in r["blocks"]:
                _, _, s = fix_block(b["lines"], b["normalized"], lex)
                tot.update(s)
    print(dict(tot))
