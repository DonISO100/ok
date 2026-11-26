#!/usr/bin/env python3
"""Crop a strip of the scan around each review item (bbox +- ~1.2 lines), for the later Opus review."""
import json, os
from PIL import Image
Q = "/workspace/maldonatus-proofread/review-queue.json"; C = "/workspace/maldonatus-review-crops/"
S = "/home/box/commentaria/maldonatus-evangelia/scans/bsb11059226_tom1_1596/"
os.makedirs(C, exist_ok=True)
q = json.load(open(Q)); cache = {}; n = 0
for k, it in enumerate(q):
    it["id"] = f"{it['img']}-{k:04d}"
    if not it["bbox"]: it["crop"] = None; continue
    if it["img"] not in cache: cache = {it["img"]: Image.open(S + it["img"] + ".jpg").convert("RGB")}
    im = cache[it["img"]]; W, H = im.size
    x0, y0, x1, y1 = it["bbox"]; pad = max(70, (y1 - y0))
    # x range: the column (or whole text width) that holds the word
    rg = it["region"]; cx0, cx1 = {"col_a": (0.05, 0.54), "col_b": (0.46, 0.95)}.get(rg, (0.03, 0.97))
    if rg.startswith("margin"): cx0, cx1 = max(0, x0 / W - 0.08), min(1, x1 / W + 0.12)
    box = (int(cx0 * W), max(0, int(y0 - pad)), int(cx1 * W), min(H, int(y1 + pad)))
    c = im.crop(box)
    if c.width > 1300: c = c.resize((1300, int(c.height * 1300 / c.width)))
    p = C + it["id"] + ".jpg"; c.save(p, quality=80); it["crop"] = p; it["crop_box"] = list(box); n += 1
json.dump(q, open(Q, "w"), ensure_ascii=False, indent=0)
print(n, "crops;", sum(os.path.getsize(C + f) for f in os.listdir(C)) // 1024, "KB")
