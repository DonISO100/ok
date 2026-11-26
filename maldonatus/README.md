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
3. **Long s** (`longs.py`). Every lowercase, non-final `f` is tried as `s` against the Hunspell Latin dictionary (npm `dictionary-la`, GPL-2, fetched, not vendored):
   - The word is swapped when the f-form is not Latin and exactly one s-reading is.
   - It is left as printed and logged when both forms are Latin (`fit/sit`, `fi/si`, `fuit/suit`) or when several s-readings are.
   - The lookup expands the abbreviation marks Vision reads as acute accents (`Euágelium` = Euangelium) but leaves the printed form in the text.
4. **Column numbers** (`build.py`). Head numbers are accepted when they continue the sequence, or when the next page confirms a jump; otherwise they are inferred. A page that is mostly full-width text carries a single column number. MDZ's labels give page numbers that do not match: image 0021 is labeled "11" but holds columns 12–13.

Structure: `CAPVT n` starts the chapter text and `IN CAPVT …` starts the commentary. Lemmas are paragraph-initial phrases closed by `)`, with an optional verse number (`2. Qui natus eft)`). Verse numbers are only accepted if they increase within the chapter and stay within its length.

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
- **Unswapped long s:** the dictionary accepts some rare or archaic f-forms (`fuam`, `fatis`, `fiue`, `folum`), so those stay ambiguous and unswapped. They are listed in the log.
