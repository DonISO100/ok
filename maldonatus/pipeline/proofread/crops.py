#!/usr/bin/env python3
"""Cut a crop of the scan for each review item: the item's column, from 1.6 lines above
to 1.6 lines below the flagged line (crop_box in review-queue.json, set by merge.py
from the OCR word boxes). The flagged word is outlined. For looking at flags by eye;
opus_review.py cuts its own crops from the same boxes.

  python3 crops.py [--pages 0050,0051] [--out DIR]     # default DIR: $MALD_WORK/review-crops
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from config import CFG  # noqa: E402
from pages import parse_pages  # noqa: E402


def crop(im, it, outline=True, max_w=1600):
    from PIL import ImageDraw
    x0, y0, x1, y1 = it["crop_box"]
    c = im.crop((x0, y0, x1, y1)).convert("RGB")
    if outline and it.get("bbox") and it.get("bbox_source") == "ocr-word":
        bx = it["bbox"]
        ImageDraw.Draw(c).rectangle((bx[0] - x0 - 4, bx[1] - y0 - 4, bx[2] - x0 + 4, bx[3] - y0 + 4), outline=(220, 40, 40), width=3)
    if c.width > max_w:
        c = c.resize((max_w, int(c.height * max_w / c.width)))
    return c


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", default="")
    ap.add_argument("--out", default=os.path.join(CFG.work, "review-crops"))
    a = ap.parse_args()
    from PIL import Image
    q = json.load(open(CFG.queue))
    want = set(parse_pages(a.pages)) if a.pages else None
    os.makedirs(a.out, exist_ok=True)
    cur, im, n = None, None, 0
    for it in q:
        if not it.get("crop_box") or (want and it["img"] not in want):
            continue
        if it["img"] != cur:
            cur, im = it["img"], Image.open(CFG.scan(it["img"]))
        crop(im, it).save(os.path.join(a.out, it["id"] + ".jpg"), quality=82); n += 1
    print(n, "crops in", a.out)


if __name__ == "__main__":
    main()
