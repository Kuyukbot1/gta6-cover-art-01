[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Kuyukbot1/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Kuyukbot1/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Neon Sunset Cover Maker

An entry for the [make.fun bounty](https://make.fun/bounty/gta6-cover-art-01).

An offline web app that turns your photo and a caption into multi-panel
sunset poster cover art — the white-guttered poster look with bold caption
lettering and a neon-sunset grade — exported as a PNG to share. Everything
runs in the browser from static files; photos never leave your machine.

## What it does

- **Any photo, several panels** — add your own photos, click a thumbnail to
  put it in the selected panel, click a panel in the preview to select it,
  drag it to reposition the photo, use the zoom slider to crop. One photo
  can fill every panel, or each panel can hold a different one.
- **Four layouts** — Hero + 3, a nine-panel grid with a title block in the
  middle, tilted snapshots, and a poster strip.
- **Five sunset grades** — Neon Sunset, Vice Nights, Golden Hour, Hot Pink,
  Mono Noir — each a warm wash and dusk tint over the photos.
- **Code-drawn title block** — a gradient sky, a slatted synthwave sun, a
  lit-window skyline, palm trees and halftone dots, all drawn in code; no
  artwork, logo or font taken from any game.
- **Fast export** — one click exports a PNG at 1080 × 1080, 1080 × 1350 or
  1920 × 1080, or all three at once. Undo and redo included.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with the vendored
make.fun library in `vendor/makefun-app.ts`.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the editor's styling
- `app/src/main.js` — wiring: photos, controls, drag-to-crop, export
- `app/src/cover.js` — the cover engine: panels, grades, title block
- `app/src/panels.js` — the four layout definitions
- `app/src/grades.js` — the five sunset grades
- `app/src/decor.js` — the code-drawn sun, skyline, palms, halftone, grain
- `app/src/shots.js` — fixed scenes for screenshots (`?shot=`)
- `app/samples/` — two sample photos made for make.fun with an image model,
  free to use
- `screenshots/` — the app with a photo loaded and covers it exported
- `shots.json` — the shot list used for the screenshots

## License

MIT — see `LICENSE`.
