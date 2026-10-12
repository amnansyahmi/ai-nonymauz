# AI-Nonymauz product experience

## Direction

Warm white, navy, and blue; Archivo for the interface and system serif italics for occasional emphasis. The composition uses a sculpted N brand mark, an open product directory, alternating large demo showcases, and a quiet closing section. Each product has an accent colour and an individual detail page.

The visitor progression is introduction → switchable sample workspace → system directory → three playable workflows → wedding planning → shared design principles → FAQ → system finder/project brief.

## Seven improvements

1. **3D hero:** the navigation's N + crossbar brand mark extruded as one bevelled piece in Three.js. Studio lighting, a soft CSS ground shadow, a full turn every 24 seconds, mouse tilt, and product palette interpolation. A matching local SVG rotates with CSS when WebGL is unavailable; it remains visible until a healthy frame draws triangles and returns after rendering failure or context loss. Context restoration rebuilds the scene; page exit disposes GPU resources and listeners. The renderer loads after content, caps pixel density and frame rate, and suspends offscreen, behind dialogs, in hidden tabs, or when motion is paused/reduced. Three.js is bundled locally using esbuild.
2. **Playable demos and workflows:** approve requests and update pending counts; enter validated expenses and recalculate the budget; move project tasks using buttons or dragging. Each demo owns independent state. Hero tab and mode changes preserve existing demo state; Reset and reload restore sample data. The separate guided mode walks through a leave request, a budget update, or a creative task. Step buttons allow direct navigation. Playback starts only on an explicit click, runs once, and stops on product/mode changes, motion pause/reduction, dialogs, hidden tabs, or leaving the section. Prev/next buttons and horizontal surface swipes switch products; form controls, task dragging and vertical scroll retain their own gestures.
3. **Motion and scroll presentation:** the hero workspace straightens as it enters view, and the larger demo scenes settle into position. Native page scrolling is preserved; no scroll lock or forced scene progression. Small screens and reduced-motion preferences use static scroll transforms. Motion’s locally bundled mini API handles short preview, scene, screenshot, dialog, and section-entry transitions. Content is never hidden in advance, and no animation depends on a CDN. CSS remains responsible for button states and the existing float effects.
4. **Composition:** readable typography and deliberate spacing; a compact product directory replaces the repeated catalogue cards; product workflows have larger individual showcases.
5. **Product pages:** seven static pages with useful descriptions, a three-step walkthrough, interactive illustrations, app destinations, availability notes, and related products. People has a reusable real capture gallery on the home and product pages, with overview, directory, and phone leave-planner views. Device preference is retained when switching screens; unavailable desktop shots are explicitly disabled. Enlargement shows the uncropped capture in a scrolling dialog with a sticky close control. Source captures are documented in assets/products/README.md. Other pages show explicitly illustrative mobile workspaces, not invented screenshots.
6. **System finder:** goal-based routing covering all seven products, a plain-language reason, relevant features, and back navigation. It uses local rules, not an AI request.
7. **Mobile:** responsive demo layouts, stacked Kanban stages, touch controls, 16px expense inputs to avoid input-focus zoom, bottom-sheet dialogs, fixed-body background scroll locking, native focus containment, Escape/close/backdrop dismissal, and optional handle swipe dismissal. Pinch zoom remains available for accessibility.

## Integrity and accessibility

No invented customers, testimonials, adoption metrics, shared-account claims, prices, or cross-product integrations. All interactive demonstrations are labelled; cloud replies are scripted and security steps are illustrative. Product descriptions retain configuration/availability notes. The brief is downloaded locally, never submitted.

Semantic landmarks, one H1 per page, native links/buttons, wrapped input labels, live status messages, visible keyboard focus, and keyboard alternatives to dragging. The mobile menu and all toggles expose state. Motion is optional, and essential content never depends on the canvas or scroll animations.


## Animation library choices

- **Three.js (implemented):** camera/matrix handling, bevelled geometry, lighting, and WebGL context restoration for the spinning logo. R3F is a React renderer; this site uses plain JavaScript.
- **Motion (implemented):** its mini JavaScript API adds brief native Web Animations transitions on active UI content, while CSS and native scroll transforms retain the surrounding layout. Motion and Three.js animate separate elements/properties.
- **GSAP:** useful for a coordinated timeline or pinned narrative, neither of which is needed for this focused hero fix.
- **Lenis:** smooth-scroll integration is possible, but native scrolling keeps the existing phone, anchor, and modal behaviour simple.

Avoid adding multiple engines to animate the same property. Essential content is visible before animation code loads.
