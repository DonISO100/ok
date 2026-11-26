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


## Full-page proofread (Sonnet 5.5) and review queue

Reader data for Matthew 1-6 (images 0020-0103) comes from a full-page proofread: Claude Sonnet 5.5 read each scan with the old OCR as a hint, through the Message Batches API (`proofread/raw/NNNN.json`, prompt v2). Since then the answers go through deterministic clean-up and checks (no API calls), a line-ID proofread (prompt v3) is ready to run, and an Opus review of the flags is ready to run.

### What runs without an API key

`python3 maldonatus/pipeline/proofread/merge.py` rebuilds `reader/data/pages`, `reader/data/toc.json`, `pipeline/review-queue.json` and the reports from whatever answers are present:

- **Source per page:** `proofread/raw3/` (v3) if it passed validation, else `proofread/raw/` (v2), else the pre-proofread page (commit `b7ccb18`, exported automatically).
- **Completeness check** (`reports/completeness.json`): a page falls back to the old data when the model said it stopped early, or the body has under 60% of the OCR's lines or words. Pages from 60-85% are listed under `check` (usually OCR noise). A paragraph whose normalized text is under 80% or over 130% of the printed words gets a normalized text rebuilt from the diplomatic lines (`nfb` on the block). Pages under `rerun` need a new proofread. Currently 0032 and 0065 are truncated and fall back; 0063 (two paragraphs) and 0060 (one note) have rebuilt normalized text.
- **Text fixes** (`fixes.py`), on every block:
  - symbol variants are mapped to one sign each (`⁹ ᵒ` → `ꝰ`, `ç ẹ` → `ę`, `ʒ` → `z` …);
  - an acute is turned into a tilde where the normalized text shows the m/n (`nó` → `nõ`), or, failing that, where the Hunspell dictionary knows the expansion. Real accents before an enclitic (`ideóque`, `quámque`) are left alone;
  - the space after `, ; :` is restored (not between digits, not in `q;`).

  On the v2 data: 716 + 322 tildes, about 3,270 spaces in the diplomatic text and 2,540 in the normalized text, 164 symbols.
- **Flags:** each flag is re-anchored to the line that holds the word. Lines are tied to OCR lines (exactly for v3, by alignment for v2), so a flag's `bbox` snaps to the OCR word box (`ocr-word`) or line (`ocr-line`), and its `crop_box` is the column from 1.6 lines above to 1.6 below. Review items have stable ids (`img-hash`).
- **Vulgate check** (`vulgate.py`): the chapter text is scored against the Clementine Vulgate after spelling folding. Differences become `vulgate_diff` flags. On v2: 12 real errors in 2,994 words (0.4%), only 2 of them flagged by Sonnet (`Piogenies`, `dicit` for didicit, `ſinibus`, `auditaeſt` …).
- **Opus decisions** in `pipeline/review-decisions.json` are applied: corrections replace the word in the diplomatic and normalized text, confirmed flags disappear, unreadable ones stay marked `reviewed`.

### Data files the scripts need (on the machine that runs them)

| What | Default location | Override |
|---|---|---|
| Tom. I scans, one JPEG per image (`0020.jpg` … at full size, BSB bsb11059226) | `~/maldonatus-scans/bsb11059226_tom1_1596/` | `MALD_SCANS` |
| OCR word pack `bsb11059226_tom1_1596_words.json.gz` (Google Drive, file id `1TId3Wt8VKmiTvn8KyxFaMpCxfjtP_1D1`) | `~/maldonatus-pack/` | `MALD_PACK` |
| Hunspell + Latin dictionary (`npm pack dictionary-la && tar xzf dictionary-la-*.tgz`, then the `package/index` base path; `apt-get install hunspell`) | `~/dictla/package/index` | `MALD_DICT` |
| Work dir (batch ids, dry-run output, crops, old reader export) | `~/maldonatus-work/` | `MALD_WORK` |
| Python packages: `anthropic`, `Pillow` | | |

The repository itself must be a git checkout (merge exports the old reader data from commit `b7ccb18`). Everything kept is written in the repository.

### Line-ID proofread (prompt v3): `proofread3.py`

The model gets every OCR line with its ID (`ocrlines.py`; the same IDs the reader used) and returns one corrected line per ID. It also gets the text regions at full resolution: each column, the full-width bands, the margins and the gutter, cut into tiles under the 2576 px limit, plus a small overview.

- **Output:** a line the OCR missed comes back as `+<id>`, and non-text OCR lines are listed as `dropped`. Each line carries `conf` (`sure` / `check` / `unsure`), and lines marked check/unsure become `line_unsure` flags.
- **Prompt:** it has the tilde rule and lists the one allowed character per abbreviation sign (`fixes.SYMBOLS`).
- **Validation:** pages that answer under 97% of the IDs, stop early, or truncate a normalized paragraph are resubmitted once (`--retries`).
- **Single command:** submit → wait → collect into `proofread/raw3/` → merge → Vulgate score → `compare.py`, which writes `reports/compare.html` (OCR | v2 | v3 per line, differences marked) and a per-page table.

```bash
export ANTHROPIC_API_KEY=...
python3 maldonatus/pipeline/proofread/proofread3.py run --pages 0032,0065,0063 --dry-run   # tiles + sample request in $MALD_WORK/dryrun3, cost estimate
python3 maldonatus/pipeline/proofread/proofread3.py run --pages 0032,0065,0063
python3 maldonatus/pipeline/proofread/proofread3.py collect msgbatch_...                   # resume after an interruption
```

Options: `--effort` (default `medium`, as v2), `--model` (default `claude-sonnet-5-5`), `--retries`, `--no-merge`.

### Opus flag review: `opus_review.py`

The script reads `pipeline/review-queue.json`. For each open flag it sends the crop (flagged word outlined) with the line, its neighbours and the reason, in batches of 20 per request to `claude-opus-5-5`. It writes `pipeline/review-decisions.json`, then runs the merge.

```bash
python3 maldonatus/pipeline/proofread/opus_review.py run --dry-run    # count, cost estimate, sample request
python3 maldonatus/pipeline/proofread/opus_review.py run
```

Options: `--pages`, `--types unsure,ocr_copy,…`, `--limit`, `--effort`, `--include-reviewed`. `crops.py` writes the same crops to `$MALD_WORK/review-crops/` for looking at flags by eye.

### Files

- `proofread/ocrlines.py`: OCR lines with IDs and boxes.
- `proofread/fixes.py`: text clean-up and the symbol inventory.
- `proofread/vulgate.py`: the Vulgate scorer.
- `proofread/adapt3.py`: the v3 schema and adapter.
- `proofread/batchlib.py`: batch submit/poll/collect.
- `proofread/merge.py`, `proofread3.py`, `opus_review.py`, `compare.py`, `crops.py`: the commands above.
- `proofread2.py`: the v2 script that produced `proofread/raw/` (kept for the record; its hard-coded paths are from the machine that ran it).
- `pipeline/review-queue.json`: one item per open flag. Fields:
  - `id` (stable), `img`, `block`, `line`, `region`;
  - `type`: `unsure`, `ocr_copy`, `greek`, `hebrew`, `other_script`, `unreadable_note`, `vulgate_diff`, `line_unsure`;
  - `word`, `normalized_word`, `reason`, `auto`;
  - `line_text`, `prev_line`, `next_line`;
  - `ocr_line`, `bbox` and `bbox_source` (`ocr-word`, `ocr-line`, `approx-y`), `crop_box`, `page_wh`;
  - `source` (`v2`/`v3`), `reviewed`.
- In the reader, flagged words are marked:
  - yellow: unsure, or the whole line is uncertain;
  - orange: maybe an OCR copy, or differs from the Vulgate;
  - purple: Greek/Hebrew.

  Hover a word for the reason.
