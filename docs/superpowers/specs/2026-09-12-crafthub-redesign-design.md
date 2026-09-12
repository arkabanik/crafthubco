# The Craft Hub at the Lion Brewery — website redesign

Date: 2026-09-12. Status: implemented in this session (autonomous run; decisions below were made without a live approval loop and are recorded so they can be challenged).

## Subject and job

The Craft Hub is a pre-opening community regeneration of Rochester's Victorian Lion Brewery (Medway, Kent): local brewing and distilling, workshops, skill-sharing, events. One product exists today, Lion's Lager (4.4%). The page has a single job: make the project feel inevitable and premium, and get visitors onto the early registry.

Content is taken from the live holding page (copy, principles, stages, product, contact, idea-board examples). Nothing visual is carried over: no colours, fonts, or layout from the existing site.

## Approach chosen

Static single-page site: `index.html`, `css/site.css`, `js/site.js`, GSAP 3 + ScrollTrigger from CDN. No build step. Serve with `python3 -m http.server`.

Alternatives considered:
- Astro/Vite project: better asset pipeline, but adds tooling to an empty Python repo for a one-page site. Rejected.
- Autoplaying looped videos with parallax only: smoother and cheaper, but the brief asks for the videos *to be* the scroll motion. Rejected in favour of scrubbing.

## Video chapters (the scroll motion)

| File | Length | Footage | Role |
|------|--------|---------|------|
| `2.mp4` | 12.9 s | Hand resting on oak casks, warm amber | Hero. Autoplays muted loop, seen only through the letters LION. Scrolling scales the letter mask up until the film fills the viewport, then the headline arrives. |
| `4.mp4` | 12.0 s, 2048×1080, 6.5 MB | Lager poured into a glass on black | "Lion's Lager" chapter. Pinned; `currentTime` is scrubbed by scroll so the pint pours as you scroll. Black footage merges with the page ground. Replaced the 64 MB 4K `3.mp4` on 2026-09-12; `3.mp4` stays in the repo unused. |
| `1.mp4` | 6.2 s | Cans being packed into a case, cool steel | "The Journey" chapter. Pinned; scrubbed across the three development stages (planning, partnerships, testing events). |

Scrub uses `scrub: 0.8` for smoothing. Videos are `muted playsinline preload="auto"` and unlocked with a play/pause on first touch for iOS. `prefers-reduced-motion` disables pinning and scrubbing; videos sit as still frames.

Known risk: the supplied encodes have sparse keyframes, which makes scrubbing step on some machines. Re-encoding with a keyframe every frame is the fix; the command is in the README.

## Design tokens

Palette (brewery materials, not a default dark theme):
- Peat `#0F1210` ground
- Cask `#1A1D18` raised panels
- Copper `#C98A4B` accent: kettles, rules, active states
- Hop `#8FA27A` secondary: labels, ticks
- Foam `#EDE6D6` primary text
- Slate `#7C837C` muted text

Type (brief: bold sans paired with a complementary serif):
- Display: Archivo, variable, width 125, weight 800–900. Wide, poster-like, Victorian-industrial.
- Body and editorial: Newsreader 400/500 plus italic for pull quotes.
- Utility: Archivo width 100, weight 600, tracked caps for eyebrows and data.

Layout: 12-column fluid grid, max 1440px, generous vertical rhythm (section padding 20–28vh). Left-aligned editorial blocks offset against full-bleed video chapters.

Signature: the LION letter-mask hero. The video is only visible through the word; scroll opens the word into the film. It embodies "We're bringing the Lion back" literally.

## Page order

1. Header: wordmark, anchors (Vision, Craft, Lager, Journey, Skills), "Join the registry".
2. Hero: LION mask reveal, then headline "We're bringing the Lion back." and eyebrow "Rochester · Medway · Est. 2026".
3. Vision: "A historic place with a new purpose" editorial block with placeholder image.
4. The Craft: scrubbed chapter, five principles.
5. Lion's Lager: product feature with placeholder can, ABV, description.
6. The Journey: scrubbed chapter, three stages.
7. Skills: skill-sharing intro plus idea-board cards (four examples from the live site).
8. Registry: first name, email, interest checkboxes, consent copy. Submits via `mailto:` to thecrafthubco@gmail.com (no backend exists).
9. Footer: contact, socials, company line, privacy note.

Images other than the videos are CSS/SVG placeholders labelled with what should go there.

## Quality floor

Responsive to 360px. Visible focus rings. Reduced motion respected. Semantic landmarks and headings. No console errors.
