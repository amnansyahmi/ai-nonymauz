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

Vercel uses the static build settings in `vercel.json`. All runtime assets, including the font and 3D renderer, are served locally. Linkedom is a development-only dependency used for DOM interaction tests; the browser runtime has no package dependencies.

## Experience

- A bevelled 3D ribbon monogram with lighting, product colour changes, subtle pointer response, static SVG fallback, and shared motion controls.
- Three switchable hero demos with preserved local state, plus full-size People, FlowTrack, and KretivOS showcases.
- Working approvals, validated expense entry and budget recalculation, and task movement via buttons or drag and drop. All use fictional demo data.
- Smaller interactive concepts for Restu.ai, PowerOS, AI Cloud, and SecureIntelligence. AI replies are explicitly scripted, and the security demo does not scan anything.
- Scroll-responsive presentation with native scrolling and reduced-motion support.
- A filterable directory and seven static, shareable `/systems/{id}/` product pages with unique metadata, a sitemap, and a 404 page. Legacy `?system=...` links redirect to the corresponding page.
- A two-question system finder with an explained recommendation, back navigation, and app/product links.
- Native modal dialogs with focus restoration, phone bottom-sheet styling, drag-handle dismissal, and background scroll locking.
- A browser-local project-brief Markdown download, including goal, audience, timeline, and optional budget.
- People desktop/mobile screenshots from the owner's HRMS demo workspace. Other previews are labelled illustrations.

## Source map

- `products.js`: public product registry, destinations, page content.
- `lib/pages.js` and `index.html`: static page templates.
- `lib/demo-views.js`, `lib/demos.js`, `lib/demo-state.js`: demo markup, interactions, validated state helpers.
- `app.js`: navigation, system finder, dialogs, previews, motion coordination, brief download.
- `background.js`: self-contained WebGL renderer and geometry.
- `styles.css`: responsive styles and design tokens.
- `scripts/build.mjs`: static pages, metadata, sitemap, assets.
- `tests/`: state, DOM interaction, geometry, and generated-page checks.

These systems have separate accounts and configurations. The landing page does not connect accounts or call backend AI APIs. See `docs/DESIGN.md`, `docs/VERIFICATION.md`, and `assets/products/README.md`.
