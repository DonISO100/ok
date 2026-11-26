"""Long-s restoration (diplomatic -> normalized).

Vision reads the long s (ſ) of the 1596 type as f. For each token containing
a non-final lowercase f we try every f->s substitution and look the variants
up in the Hunspell Latin dictionary (npm `dictionary-la`, GPL-2; fetched by
build.py, not vendored):

* f-form not Latin, exactly one s-variant Latin  -> swap (e.g. eft -> est)
* f-form Latin and some s-variant Latin too       -> ambiguous, keep, log
                                                    (fit/sit, fuit/suit, fi/si)
* f-form not Latin, several s-variants Latin      -> ambiguous, keep, log
* nothing Latin                                   -> keep (OCR noise, names)

Capital F is never varied (there is no capital long s) and neither is a
word-final f (long s is never final). Lookup keys expand the printer's
abbreviation marks, which Vision reads as acute accents (Euágelium =
Euangelium, vocauerút = vocauerunt), and write out æ/œ/ę, so the decision is
made on the full form while the output keeps the printed spelling.
"""

import itertools
import re
import subprocess
import unicodedata

WORD = re.compile(r"[A-Za-zÀ-ÿĀ-žęæœÆŒ]+")
ACUTE = {"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "ä": "a", "ö": "o", "ü": "u", "à": "a", "è": "e", "ì": "i", "ò": "o", "ù": "u"}
MAXF = 6


def lookup_keys(word):
    """Spellings to try in the dictionary for one printed word."""
    w = word.replace("æ", "ae").replace("Æ", "Ae").replace("œ", "oe").replace("Œ", "Oe").replace("ę", "ae")
    slots = []
    for ch in w:
        lo = ch.lower()
        if lo in ACUTE:
            base = ACUTE[lo] if ch == lo else ACUTE[lo].upper()
            # an accent may be a real accent (à, è) or a nasal-abbreviation mark
            slots.append([base, base + "n", base + "m"])
        else:
            slots.append([unicodedata.normalize("NFC", ch)])
    n = sum(len(s) > 1 for s in slots)
    if n > 3:  # too many marks: plain form only
        keys = ["".join(s[0] for s in slots)]
    else:
        keys = ["".join(p) for p in itertools.product(*slots)]
    # printed u/v, i/j: initial v before a consonant is the vowel (vnum = unum)
    extra = []
    for k in keys:
        if len(k) > 1 and k[0] in "vV" and k[1].lower() not in "aeiouy":
            extra.append(("u" if k[0] == "v" else "U") + k[1:])
        if "j" in k:
            extra.append(k.replace("j", "i"))
    return keys + extra


def f_positions(word):
    return [i for i, c in enumerate(word) if c == "f" and i < len(word) - 1]


def variants(word):
    pos = f_positions(word)[:MAXF]
    out = []
    for r in range(1, len(pos) + 1):
        for comb in itertools.combinations(pos, r):
            chars = list(word)
            for i in comb:
                chars[i] = "s"
            out.append("".join(chars))
    return out


class LongS:
    def __init__(self, dic_base):
        self.dic = dic_base
        self.ok = {}
        self.log = {}  # word -> {"variants": [...], "count": n, "where": [...]}
        self.swaps = {}

    def _check(self, keys):
        todo = sorted({k for k in keys if k not in self.ok})
        if not todo:
            return
        bad = set(subprocess.run(["hunspell", "-d", self.dic, "-l"], input="\n".join(todo),
                                 capture_output=True, text=True).stdout.split())
        for k in todo:
            self.ok[k] = k not in bad

    def is_latin(self, word):
        return any(self.ok.get(k) for k in lookup_keys(word))

    def prepare(self, words):
        keys = []
        for w in set(words):
            if not f_positions(w):
                continue
            for v in [w] + variants(w):
                keys += lookup_keys(v)
        self._check(keys)

    def decide(self, word):
        """Return (normalized_word, status) with status in
        {'keep', 'swap', 'ambiguous'}."""
        if not f_positions(word):
            return word, "keep"
        orig = self.is_latin(word)
        good = [v for v in variants(word) if self.is_latin(v)]
        if not good:
            return word, "keep"
        if orig or len(good) > 1:
            return word, "ambiguous"
        return good[0], "swap"

    def normalize_token(self, tok, where=None):
        def rep(m):
            w = m.group(0)
            new, st = self.decide(w)
            if st == "swap":
                self.swaps[(w, new)] = self.swaps.get((w, new), 0) + 1
            elif st == "ambiguous":
                e = self.log.setdefault(w, {"variants": [v for v in variants(w) if self.is_latin(v)],
                                            "f_form_is_latin": self.is_latin(w), "count": 0, "where": []})
                e["count"] += 1
                if where and len(e["where"]) < 8:
                    e["where"].append(where)
            return new
        return WORD.sub(rep, tok)
