# The Craft Hub at the Lion Brewery

Single-page marketing site for The Craft Hub, a community regeneration of Rochester's historic Lion Brewery (Medway, Kent). Scroll-driven film chapters built with GSAP ScrollTrigger; no build step.

## Run locally

```sh
python3 serve.py 3000
```

Open http://localhost:3000. `serve.py` is the standard library server plus HTTP Range support. Browsers need byte ranges to seek inside a video, and Python's plain `http.server` ignores them, which leaves the scroll-scrubbed chapters stuck on their first frame. Any production host (Nginx, S3, Netlify, Vercel) serves ranges by default.

## Structure

- `index.html` — all content and section order
- `serve.py` — dev server with Range support (no dependencies)
- `css/site.css` — design tokens (`:root`), type, layout, chapters, reduced-motion fallbacks
- `js/site.js` — hero letter mask, video scrub chapters, reveals, registry form hand-off
- `assets/videos/` — `2` hero (casks), `4` lager pour, `1` packing line; each as `.webm` plus `.mp4` fallback
- `docs/superpowers/specs/` — design spec and decisions

## Video encoding

Each film ships as WebM (VP9, listed first) with an MP4 (H.264) fallback for browsers without VP9. Both are 720p, silent, and keyframed every 12 frames so `currentTime` scrubbing decodes quickly. To regenerate a WebM from its MP4:

```sh
ffmpeg -i assets/videos/2.mp4 -an -vf "scale=1280:-2" -c:v libvpx-vp9 -b:v 0 -crf 34 -g 12 -keyint_min 12 -row-mt 1 -deadline good -cpu-used 2 -pass 1 -f null /dev/null
ffmpeg -i assets/videos/2.mp4 -an -vf "scale=1280:-2" -c:v libvpx-vp9 -b:v 0 -crf 34 -g 12 -keyint_min 12 -row-mt 1 -deadline good -cpu-used 2 -pass 2 assets/videos/2.webm
```

Repeat for `1` and `4`. Raise `-crf` for smaller files, lower it for quality. `3.mp4` is the unused 4K master of the pour.

## Not yet in place

- The registry form opens in a modal from any "Join the registry" button and hands off to the visitor's email app; there is no backend or mailing-list integration.
- All photographs are labelled placeholders (`.ph` blocks) awaiting real imagery.

## Deploy to Hostinger

Build the zip (copies the page, CSS, JS, the six video files and `.htaccess`; leaves out the 4K master, docs and dev server):

```sh
rm -rf dist && mkdir -p dist/site/assets/videos dist/site/css dist/site/js
cp index.html dist/site/ && cp css/site.css dist/site/css/ && cp js/site.js dist/site/js/
for n in 1 2 4; do cp assets/videos/$n.webm assets/videos/$n.mp4 dist/site/assets/videos/; done
cp deploy/.htaccess dist/site/
(cd dist/site && zip -rX ../crafthub-site.zip . -x '*.DS_Store')
```

Then in hPanel open **Files → File Manager**, go to `public_html`, upload `dist/crafthub-site.zip`, and choose **Extract** so `index.html` sits directly inside `public_html`. The `.htaccess` sets video MIME types, caching and an HTTPS redirect; if you see a redirect loop before the SSL certificate is issued, remove the `mod_rewrite` block until it is.
