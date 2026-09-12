# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static single-page website for The Craft Hub at the Lion Brewery, Rochester. Plain HTML, CSS and JS with GSAP 3 + ScrollTrigger loaded from CDN. No package manager, bundler, linter, or test suite. The Python-style `.gitignore` is legacy; there is no Python code.

## Run

```sh
python3 serve.py 3000
```

Use `serve.py`, not `python3 -m http.server`: the built-in server ignores Range requests, and without byte ranges browsers cannot seek, so scrubbed videos stay on frame 0 (WebM cues sit at the end of the file). Production hosts serve ranges by default. Visual checks are done by screenshotting through Playwright with the Chrome channel (Chromium lacks H.264); a throwaway script lives outside the repo, not committed.

## Architecture

- `index.html` holds every section in page order. Sections with `data-chapter` are pinned film chapters; each has one `video[data-scrub]`, a `.chapter__rail` progress line, and `.step` blocks that take equal slices of the scroll range. `data-length` is the pin length in viewport-height percent.
- `js/site.js` has three motion systems: the hero (the word LION is a `mix-blend-mode: multiply` mask over a looping film; scroll scales the word from the centre of the letter I until the film fills the viewport), `setupChapter` (scrubs `video.currentTime` and steps the copy), and `ScrollTrigger.batch` reveals. Everything pins the section itself (`pin: true`), never an inner element, because the outer section must own the pin spacer. Do not add `will-change: transform` to the hero word: at 24x scale Chrome keeps a partial raster of the layer and the letters come back clipped when scrolling to the top.
- Below 861px the header nav collapses behind `.nav-toggle` and becomes a fixed full-screen panel; `setupNav` in `js/site.js` owns its state and listens for a `nav:close` event, which the modal opener dispatches. Test any header change at 390, 768 and 834px as well as desktop.
- `css/site.css` defines the tokens in `:root` (peat, cask, copper, hop, foam, slate; Archivo display at `font-stretch` 110–125% paired with Newsreader). `html.no-motion` is set by JS for `prefers-reduced-motion` or when GSAP fails to load and unpins every chapter into a stacked layout, so any new chapter needs a matching `no-motion` rule.
- Video roles are fixed by their footage: `2` casks (hero), `4` lager pour (Lion's Lager; `3.mp4` is the unused 4K master), `1` can packing (Journey). Do not swap them without re-writing the step copy.
- `deploy/.htaccess` is the Hostinger (Apache/LiteSpeed) config bundled into the deploy zip; the README has the zip recipe. `dist/` is build output and ignored.
- Design decisions and the palette rationale are in `docs/superpowers/specs/2026-09-12-crafthub-redesign-design.md`. Nothing visual is carried over from the previous site at thecrafthubco.com.

## Constraints

- Photographs are placeholders (`.ph` blocks with a label); only the three videos are real assets.
- The registry form lives in the `#registryModal` dialog; every `[data-open-registry]` button opens it. It has no backend and builds a `mailto:` to thecrafthubco@gmail.com.
- Every `<video>` lists a `.webm` (VP9) source first and the `.mp4` second; keep both in sync when replacing footage. The README has the encode command (keyframe every 12 frames for scrubbing).
