# AI-Nonymauz

A static product experience for People, KretivOS, PowerOS, Restu.ai, FlowTrack, AI-Nonymauz Cloud, and SecureIntelligence.

## Develop

Node.js 22 or later:

```sh
npm ci
npm run dev
```

The development command builds the pages and serves `dist/` at `http://localhost:4173`. Rebuild after changing a template or module. `PORT` changes the server port.

```sh
npm run check
npm run build
npm test
npm start
```

Vercel uses the static build settings in `vercel.json`. All runtime assets, including the font and vector emblem, are served locally. esbuild bundles Motion’s mini API and the hero lifecycle; there are no CDN requests or WebGL dependencies. Linkedom is a development-only dependency used for DOM interaction tests.

## Experience

- A clean vector rendition of the supplied cyan/blue/violet Ai logo across the header, footer, favicon, Apple touch icon and hero. CSS provides the slow spin, floating motion and breathing orbit on touch and desktop; pointer tilt is an optional desktop enhancement.
- One compact People device slideshow on the home and product pages, using genuine captures inside phone/laptop frames. Arrows, dots, keyboard and horizontal swipes switch slides; The slideshow autoplays when visible and switches screens every four seconds, with a progress bar and playing/paused text; desktop captures also scan within the frame.
- Motion transitions for device slides, dialogs and section entries, with native scrolling and reduced-motion support. The landing page does not include duplicate full-size workspaces.
- Working approvals, validated expense entry and budget recalculation, and task movement via buttons or drag and drop. All use fictional demo data.
- Smaller interactive concepts for Restu.ai, PowerOS, AI Cloud, and SecureIntelligence. AI replies are explicitly scripted, and the security demo does not scan anything.
- Motion pause/reduced-motion support. Playback suspends for focus, gestures, dialogs, hidden tabs and offscreen previews, then resumes when appropriate. An explicit Pause remains paused until the user resumes it.
- A filterable directory and seven static, shareable `/systems/{id}/` product pages with unique metadata, a sitemap, and a 404 page. Legacy `?system=...` links redirect to the corresponding page.
- A two-question system finder with an explained recommendation, back navigation, and app/product links.
- Native modal dialogs with focus restoration, phone bottom-sheet styling, drag-handle dismissal, and background scroll locking.
- A browser-local project-brief Markdown download, including goal, audience, timeline, and optional budget.
- People previews include overview, employee directory and a phone-only leave planner. Interactive product demos remain on the individual product pages; other product interfaces are clearly labelled illustrations.

## Source map

- `products.js`: public product registry, destinations, page content.
- `lib/pages.js` and `index.html`: static page templates.
- `lib/demo-views.js`, `lib/demos.js`, `lib/demo-state.js`: demo markup, interactions, validated state helpers.
- `app.js`: navigation, system finder, dialogs, motion coordination, brief download.
- `lib/transitions.js`: Motion mini transitions and shared motion controls.
- `lib/captures.js`: real capture metadata, device mockup slideshow, swipe intent, playback and lifecycle controls.
- `background.js`: hero animation lifecycle and optional desktop pointer tilt.
- `styles.css`: responsive styles and design tokens.
- `scripts/build.mjs`: static pages, metadata, sitemap, assets.
- `tests/`: state, DOM interaction, motion lifecycle and generated-page checks.

These systems have separate accounts and configurations. The landing page does not connect accounts or call backend AI APIs. See `docs/DESIGN.md`, `docs/VERIFICATION.md`, and `assets/products/README.md`.
