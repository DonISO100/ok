"""Rule-based normalization of the OCR text (diplomatic -> normalized).

Works word by word, in this order; every change is counted by rule, and every
word a rule cannot settle on its own is queued for the AI pass (ai_pass.py)
with the exact list of readings it may choose from:

  sigla    q; -> que, b' -> bus, ę -> æ              (deterministic)
  longs    f -> s where the dictionary decides        (longs.py)
  nasal    Vision reads the printer's nasal tilde as an acute (or ä/ö/ü):
           Euágelium -> Euangelium, nó -> non, tépus -> tempus
  ocr      one Vision confusion (n/u, c/e, rn/m, i/l, F/I at the start, ...)
           turns a non-word into a word
  split    a run-together pair becomes two words (totusdefcriberetur)

"Latin" means accepted by the Hunspell Latin dictionary or found in the
Vulgate Gospels (for proper names the dictionary lacks). The printed spelling
(u/v, i/j, æ, &) is otherwise kept.
"""

import collections
import itertools
import re
import unicodedata

from longs import LongS, lookup_keys, variants as f_variants

WORD = re.compile(r"[A-Za-zÀ-ÿĀ-žęæœÆŒ]+")
NASAL = {"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "ã": "a", "õ": "o", "ũ": "u", "ẽ": "e",
         "ä": "a", "ö": "o", "ü": "u",
         "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U"}
CONFUSIONS = [("fl", "ff"), ("n", "u"), ("u", "n"), ("c", "e"), ("rn", "m"), ("m", "rn"), ("i", "l"),
              ("l", "i"), ("ü", "ii"), ("h", "b"), ("b", "h"), ("cl", "d"), ("d", "cl")]
# short words that may stand on their own in a split (not fragments like ius, nos)
SHORT = {"est", "sed", "non", "qui", "quæ", "quod", "nos", "vos", "sibi", "eum", "eam", "hic", "hoc",
         "enim", "quia", "sit", "sunt", "esse", "inquit", "vero", "pro", "sub", "ita", "nec", "neque"}
INITIAL = [("F", "I"), ("f", "i"), ("l", "I"), ("1", "I")]


def vkey(w):
    """Spelling-insensitive key used for the Vulgate vocabulary."""
    w = w.replace("æ", "ae").replace("Æ", "Ae").replace("œ", "oe").replace("ę", "ae")
    w = unicodedata.normalize("NFD", w)
    w = "".join(c for c in w if unicodedata.category(c) != "Mn").lower()
    return w.replace("v", "u").replace("j", "i").replace("y", "i")


class Normalizer:
    def __init__(self, dic_base, vulgate_words=(), corpus=None):
        self.ls = LongS(dic_base)
        # printed-form frequencies over both volumes (see printed_key)
        self.corpus = corpus or collections.Counter()
        self.vocab = {vkey(w) for w in vulgate_words}
        self.table = {}        # printed word -> (normalized, rule or None)
        self.queue = {}        # printed word -> {"rule", "options"}
        self.counts = collections.Counter()
        self.changes = collections.Counter()   # (rule, printed, normalized) -> n

    # ------------------------------------------------------------ lexicon
    def _check(self, words):
        keys = []
        for w in words:
            keys += lookup_keys(w)
        self.ls._check(keys)

    def latin(self, w):
        if not w:
            return False
        return self.ls.is_latin(w) or vkey(w) in self.vocab

    @staticmethod
    def printed_key(w):
        """How a normalized word would look in the print as OCR'd: long s as
        f (never word-final), æ/ę unified. Used to check that a proposed fix
        is attested elsewhere in the book."""
        w = w.replace("ę", "æ")
        return "".join("f" if c == "s" and i < len(w) - 1 else c for i, c in enumerate(w))

    def attested(self, w, n=2):
        return self.corpus.get(self.printed_key(w), 0) >= n or vkey(w) in self.vocab

    # ------------------------------------------------------------ stages
    @staticmethod
    def sigla(w):
        w2 = w.replace("ę", "æ")
        return w2

    @staticmethod
    def nasal_options(w):
        idx = [i for i, c in enumerate(w) if c in NASAL]
        if not idx or len(idx) > 3:
            return []
        slots = []
        for i, c in enumerate(w):
            if i in idx:
                b = NASAL[c]
                slots.append([b + "n", b + "m"] if c.lower() not in "äöü" else [b + "n", b + "m", b])
            else:
                slots.append([c])
        return ["".join(p) for p in itertools.product(*slots)]

    @staticmethod
    def phonotactic(w):
        """The single expansion a compositor's tilde most likely stands for:
        m before p/b/m and at the end of a word, n elsewhere."""
        out = []
        for i, c in enumerate(w):
            if c in NASAL:
                nxt = w[i + 1:i + 2].lower()
                b = NASAL[c]
                out.append(b + ("m" if nxt in ("p", "b", "m", "") else "n"))
            else:
                out.append(c)
        return "".join(out)

    @staticmethod
    def ocr_options(w):
        out = set()
        for a, b in CONFUSIONS:
            for m in re.finditer(re.escape(a), w):
                out.add(w[:m.start()] + b + w[m.end():])
        for a, b in INITIAL:
            if w.startswith(a):
                out.add(b + w[len(a):])
        # a doubled chunk (loquereretur -> loqueretur)
        for k in (2, 3):
            for i in range(len(w) - 2 * k + 1):
                if w[i:i + k] == w[i + k:i + 2 * k]:
                    out.add(w[:i + k] + w[i + 2 * k:])
        # a nasal tilde Vision missed altogether: Deide -> Deinde, eode -> eodem
        for i, c in enumerate(w):
            if c.lower() in "aeiou":
                out.add(w[:i + 1] + "n" + w[i + 1:])
                if i == len(w) - 1:
                    out.add(w + "m")
        out.discard(w)
        return sorted(out)

    @staticmethod
    def split_options(w):
        return [(w[:i], w[i:]) for i in range(3, len(w) - 2)]

    def prepare(self, words):
        """Decide every distinct printed word, batching dictionary lookups."""
        words = sorted({w for w in words if WORD.fullmatch(w)})
        stage = {w: self.sigla(w) for w in words}
        # long s (dictionary lookups batched inside LongS.prepare)
        self.ls.prepare(set(stage.values()))
        after_s, amb_s = {}, {}
        for w, s in stage.items():
            new, st = self.ls.decide(s)
            after_s[w] = new
            if st == "ambiguous":
                amb_s[w] = [s] + [v for v in f_variants(s) if self.latin(v)]
        # nasal expansions
        cand = []
        for w, s in after_s.items():
            cand += self.nasal_options(s)
        self._check(cand)
        after_n, amb_n = {}, {}
        for w, s in after_s.items():
            opts = self.nasal_options(s)
            if not opts:
                after_n[w] = (s, None)
                continue
            good = [o for o in opts if self.latin(o)]
            ph = self.phonotactic(s)
            if len(good) == 1:
                after_n[w] = (good[0], "nasal")
            elif ph in good:
                after_n[w] = (ph, "nasal")
            elif good:
                after_n[w] = (s, None)
                amb_n[w] = good
            else:
                after_n[w] = (s, None)
        self._check([s for s, _ in after_n.values()] + list(after_s.values()))
        # OCR confusions and run-together words, only for non-words
        def fixable(w, s):
            if self.latin(s) or w in amb_s or w in amb_n:
                return False
            if any(c in NASAL for c in s):          # an unexpanded mark: leave it
                return False
            if re.fullmatch(r"[IVXLCDM]+", s):       # roman numeral
                return False
            if self.corpus.get(self.printed_key(w), 0) >= 4:
                return False                         # the book uses it: a word the dictionary lacks
            if s[:1].isupper() and len(s) <= 6 and not (len(s) == 2 and s[0] == "F"):
                return False                         # abbreviated name (Ioan, Deut, Marc, Bafil)
            return len(s) >= 4 or (len(s) == 2 and s[0] == "F")
        nonw = [w for w, (s, _) in after_n.items() if fixable(w, s)]
        cand = []
        for w in nonw:
            s = after_n[w][0]
            for o in self.ocr_options(s):
                cand += [o] + f_variants(o)[:8]
            if len(s) >= 7:
                for a, b in self.split_options(s):
                    cand += [a, b] + f_variants(a)[:4] + f_variants(b)[:4]
        self._check(cand)

        def best_form(x):
            if self.latin(x):
                return x
            for v in f_variants(x)[:8]:
                if self.latin(v):
                    return v
            return None

        for w in words:
            s, rule = after_n[w]
            if w in amb_s:
                self.table[w] = (w, None)
                self.queue[w] = {"rule": "longs", "options": amb_s[w]}
                continue
            if w in amb_n:
                self.table[w] = (after_s[w], "longs" if after_s[w] != stage[w] else None)
                self.queue[w] = {"rule": "nasal", "options": [after_s[w]] + amb_n[w]}
                continue
            if w in nonw:
                need = 2 if len(s) >= 5 else 40       # 4-letter fixes only to common words (eins -> eius)
                fixes = sorted({f for f in (best_form(o) for o in self.ocr_options(s)) if f and self.attested(f, need)})
                if len(fixes) == 1:
                    self.table[w] = (fixes[0], "ocr")
                    continue
                if 1 < len(fixes) <= 4:
                    self.table[w] = (s, rule or ("longs" if s != w else None))
                    self.queue[w] = {"rule": "ocr", "options": [s] + fixes}
                    continue
                if len(s) >= 7:
                    sp = []
                    for a, b in self.split_options(s):
                        fa, fb = best_form(a), best_form(b)
                        if fa and fb and min(len(fa), len(fb)) >= 3 and self.attested(fa, 8) and self.attested(fb, 8) \
                                and (len(fa) >= 4 or fa.lower() in SHORT) and (len(fb) >= 4 or fb.lower() in SHORT):
                            sp.append(fa + " " + fb)
                    if len(sp) == 1:
                        self.table[w] = (sp[0], "split")
                        continue
                    if 1 <= len(sp) <= 4:
                        self.table[w] = (s, rule)
                        self.queue[w] = {"rule": "split", "options": [s] + sp}
                        continue
            changed = s != w
            self.table[w] = (s, rule or ("longs" if after_s[w] != stage[w] else ("sigla" if changed else None)))

    # ------------------------------------------------------------ text
    @staticmethod
    def pre(text):
        """Deterministic sigla: q; -> que (certaq; Neq;), b' -> bus (quib')."""
        t = re.sub(r"(?<=[A-Za-zæ])q;", "que", text)
        return re.sub(r"(?<=[A-Za-z])b'", "bus", t)

    def word(self, w, decisions=None, key=None):
        """Normalize one printed word. Returns (text, rule, ambiguous?)."""
        if w not in self.table:
            return w, None, False
        if w in self.queue and decisions is not None and key in decisions:
            ch = decisions[key]
            if ch in self.queue[w]["options"]:
                if ch != w:
                    self.changes[("ai", w, ch)] += 1
                return ch, "ai" if ch != w else None, False
        new, rule = self.table[w]
        if rule:
            self.changes[(rule, w, new)] += 1
        return new, rule, w in self.queue

    def line(self, text, lid, decisions=None):
        """Normalize a line of printed text. Returns (text, changes, ambiguous)
        where changes are [printed, normalized, rule] and ambiguous are
        [printed, occurrence-key] for words left for the AI pass."""
        changes, amb = [], []
        seen = collections.Counter()

        def rep(m):
            w = m.group(0)
            seen[w] += 1
            key = f"{lid}|{w}|{seen[w]}"
            new, rule, a = self.word(w, decisions, key)
            if rule:
                changes.append([w, new, rule])
            if a:
                amb.append([w, key])
            return new
        t = WORD.sub(rep, self.pre(text))
        t = re.sub(r"([.;:?!])(?=[A-ZÆ])", r"\1 ", t)  # spacing after punctuation
        t = re.sub(r"([,;:])(?=[a-zæ])", r"\1 ", t)
        t = re.sub(r"\s{2,}", " ", t)
        return t, changes, amb
