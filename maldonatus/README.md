# Maldonatus, *Commentarii in quatuor Evangelistas* (Mussiponti 1596–97): reader

A static reader for the Google Vision OCR of Juan Maldonado S.J.'s commentary on the Gospels (first edition, 2 vols folio). The scans are BSB/MDZ [bsb11059226](https://www.digitale-sammlungen.de/en/view/bsb11059226) (tom. I) and [bsb11059227](https://www.digitale-sammlungen.de/en/view/bsb11059227) (tom. II). The look follows the aquinas.cc front end in `../aquinas-rip`.

**Status: proof.** The reader covers tom. I, images 0020–0103: Matthew 1–6, plus the opening of chapter 7 on the last page. The column map (`reader/data/colmap.json`) already covers every image of both volumes.

## Open it

The reader loads JSON with `fetch`, so it has to be served over HTTP. Serve from the repository root, because the reader uses the fonts and images in `aquinas-rip/`:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/maldonatus/reader/.

- **Diplomatic / Normalized** (top right) switches the text view:
  - Diplomatic keeps the printed lines and the OCR spelling, with the long s read as f.
  - Normalized runs the lines together as paragraphs, joins hyphenated words, and restores the long s.
- **Ambiguous words** are dotted-underlined in normalized view.
- **Log** lists every long-s decision and shows the column map for both volumes.
- **Links:** each page header links to the MDZ viewer page (`scan ↗`) and to the full IIIF image (`jpg`).
- **Deep links** look like `#1-0039a0.12` (tom. I, image 0039, column a, block 0, line 12).
- **Minion Pro** is not in git. Put licensed `minionpro*.woff2` files in `aquinas-rip/webfonts/` to use it; otherwise the reader falls back to Palatino or Book Antiqua.

## What the pipeline does (`pipeline/`)

Each MDZ image is a single printed page. The book numbers **columns**, two per page, and these are the numbers in the running head. The word boxes show what Vision did wrong and how each problem is fixed:

1. **Columns fused across the gutter** (`layout.py`). Vision read across the gutter, interleaving the two columns' lines and fusing words (`Dretátur` = gutter letter D + `retátur`).
   - The gutter is the minimum of the word-x histogram. On mixed pages it is found again from the two-column bands alone.
   - Words crossing the gutter are split proportionally by character width.
   - The block edges come from the justified line starts and ends, not from the histogram, because notes sit right against the text.
2. **Reading order** (`layout.py`). Each page is cut into horizontal bands: two-column commentary, full-width chapter text (the Vulgate text with its drop cap), and centered headings (`CAPVT IIII.`). Then:
   - The reading order is: running head, then each band in turn, column a before column b.
   - The section letters A–H in the gutter become anchored marks.
   - Notes in the outer strips are grouped and anchored to the nearest body line on their side.
   - The signature or catchword row at the foot becomes `foot`.
3. **Normalization** (`normalize.py`, `longs.py`, `align.py`). The normalized view is built from the diplomatic text in steps, each logged by rule (see the Log page):
   - **Long s:** every lowercase, non-final `f` is tried as `s` against the Hunspell Latin dictionary (npm `dictionary-la`, GPL-2, fetched, not vendored).
   - **Abbreviations:** Vision reads the printer's nasal tilde as an acute accent (or ä/ö/ü). These expand to whichever of +n / +m gives a Latin word: `nó` → non, `tépus` → tempus, `Euágelifta` → Euangelista. Where both are Latin, it's m before p/b/m and at the end of a word, n elsewhere. Grave accents (`quòd`, `à`) are real and stay.
   - **Signs:** `ę` → æ, `q;` → que, `b'` → bus.
   - **OCR fixes:** a non-word becomes a word through one typical Vision confusion (n/u, c/e, rn/m, ff read as fl, a lost tilde, a doubled syllable), but only if the result occurs at least twice elsewhere in the book's 2.3 million words. Words the book itself uses four or more times are never "corrected" (names the dictionary lacks, such as Gregorius and Galilea), and neither are abbreviated names or roman numerals.
   - **Word splits:** run-together pairs are split (`quodpepererit` → quod pepererit) when both halves are common in the book.
   - **Vulgate:** lemmas are matched against the Clementine Vulgate (`pipeline/vulgate_gospels.json`, the Gospels from npm `@bible-api/bible-api-version-vulgate`, MIT-0). This confirms or supplies verse numbers and restores lost or misread drop caps (`VM ergo` → CVM ergo, `TTENDITE` → ATTENDITE, `RIDENS` → VIDENS).
   - **AI pass:** words the rules cannot settle (`fit`/`sit`, `fi`/`si`, `folum`/`solum`, `Fn`/`In`…) are written to `pipeline/ai-queue.json` with their allowed readings, and stay as printed until `ai_pass.py` has run (see below).
4. **Column numbers** (`build.py`). Head numbers are accepted when they continue the sequence, or when the next page confirms a jump; otherwise they are inferred. A page that is mostly full-width text carries a single column number. MDZ's labels give page numbers that do not match: image 0021 is labeled "11" but holds columns 12–13.

Structure: `CAPVT n` starts the chapter text and `IN CAPVT …` starts the commentary. Lemmas are paragraph-initial phrases closed by `)`, with an optional verse number (`2. Qui natus eft)`). Verse numbers are only accepted if they increase within the chapter and stay within its length.

### AI pass (needs a Claude API key)

`pipeline/ai_pass.py` sends each page's doubtful words to Claude Haiku 5.5. For each word the model must answer with one of the listed readings or "unsure", which is enforced with structured output; "unsure" leaves the printed form. For Matthew 1–6 that's 84 requests for 2,029 words, about 4 cents.

```bash
pip install anthropic
export ANTHROPIC_API_KEY=...
python3 maldonatus/pipeline/ai_pass.py --dry-run                          # counts and a sample request
python3 maldonatus/pipeline/ai_pass.py --compare claude-opus-5-5 --sample 12   # agreement check first
python3 maldonatus/pipeline/ai_pass.py                                    # writes pipeline/ai-decisions.json
```

Then rebuild (below): `build.py` applies `ai-decisions.json` when it exists. In a cloud session, the key goes in the environment's settings as the `ANTHROPIC_API_KEY` environment variable, and a new session picks it up.

### Rebuild

```bash
npm pack dictionary-la && tar xzf dictionary-la-*.tgz          # Hunspell Latin -> package/index.{aff,dic}
sudo apt-get install -y hunspell
python3 maldonatus/pipeline/build.py --data PATH/TO/OCR-PACK --dict package/index --out maldonatus/reader/data
```

`PATH/TO/OCR-PACK` holds the `*_words.json.gz` files and the two `*.index.tsv` files from the OCR pack, which isn't committed. `--range 1:0020-0103` (the default) sets which images become reader pages.

## Known limits of this proof

- **Missing characters:** Vision dropped a few line-initial letters in column b on some pages (`ertit` for Vertit), and letters under drop caps. They are missing from the OCR itself and can't be recovered from the boxes.
- **Truncated notes:** marginal notes are only as complete as the OCR. Several are cut off where they meet the text block.
- **Missing verse numbers:** some lemmas lose their verse number to OCR errors, so they are listed under the previous verse.
- **Unsettled words:** until the AI pass runs, the ambiguous long-s words (`fit`, `fi`, `folum`, `fine`, `fuam`…) stay as printed, dotted-underlined.
- **Systematic OCR errors:** errors that recur across the book (`Deide`, `cu`, `Romanoru`) look like real words to the corpus guard, so they aren't fixed.
