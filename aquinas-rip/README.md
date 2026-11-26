# aquinas.cc front-end rip

Static front-end of https://aquinas.cc (a Vite SPA): `index.html`, every JS/CSS chunk under `assets/` (including the 12 UI locale bundles), Font Awesome woff2 files, `img/` and `favicon.ico`. No text content: the app gets that from `/api/*`, which isn't included.

## Fonts
- **Font Awesome** (`assets/fa-*.woff2`): included.
- **Minion Pro** (`webfonts/minionpro{,-bold,-italic,-bolditalic}.woff2`): left out of git because it's a commercially licensed Adobe font. The CSS still points at `../webfonts/`, so drop your own licensed copies there.

## Run
```bash
python3 -m http.server --directory aquinas-rip 8765
```
Open http://localhost:8765/index.html. The shell loads, but pages stay empty until something answers `/api/init` and the other `/api/*` calls. The Alpheios reader is still loaded from cdn.jsdelivr.net.
