# AI-Nonymauz product experience

## Direction

Warm white, navy, and blue; Archivo for the interface and system serif italics for occasional emphasis. The composition uses a sculpted ribbon mark, an open product directory, alternating large demo showcases, and a quiet closing section. Each product has an accent colour and an individual detail page.

The visitor progression is introduction → switchable sample workspace → system directory → three playable workflows → wedding planning → shared design principles → FAQ → system finder/project brief.

## Seven improvements

1. **3D hero:** bevelled ribbon geometry forming an n. mark, rendered using local WebGL shaders. Diffuse/specular lighting, a soft CSS ground shadow, gentle movement, mouse response, and product palette interpolation. An inline SVG remains visible if WebGL is unavailable or the context is lost. The renderer loads after content, caps pixel density and frame rate, and suspends offscreen, behind dialogs, in hidden tabs, or when motion is paused/reduced.
2. **Playable demos:** approve requests and update pending counts; enter validated expenses and recalculate the budget; move project tasks using buttons or dragging. Each demo owns independent state. Hero tab changes preserve its existing state; Reset and reload restore sample data.
3. **Scroll presentation:** the hero workspace straightens as it enters view, and the larger demo scenes settle into position. Native page scrolling is preserved; no scroll lock or forced scene progression. Small screens and reduced-motion preferences use static transforms.
4. **Composition:** readable typography and deliberate spacing; a compact product directory replaces the repeated catalogue cards; product workflows have larger individual showcases.
5. **Product pages:** seven static pages with useful descriptions, a three-step walkthrough, interactive illustrations, app destinations, availability notes, and related products. The People page includes real repository screenshots of a demo workspace. Other pages show explicitly illustrative mobile workspaces, not invented screenshots.
6. **System finder:** goal-based routing covering all seven products, a plain-language reason, relevant features, and back navigation. It uses local rules, not an AI request.
7. **Mobile:** responsive demo layouts, stacked Kanban stages, touch controls, 16px expense inputs to avoid input-focus zoom, bottom-sheet dialogs, fixed-body background scroll locking, native focus containment, Escape/close/backdrop dismissal, and optional handle swipe dismissal. Pinch zoom remains available for accessibility.

## Integrity and accessibility

No invented customers, testimonials, adoption metrics, shared-account claims, prices, or cross-product integrations. All interactive demonstrations are labelled; cloud replies are scripted and security steps are illustrative. Product descriptions retain configuration/availability notes. The brief is downloaded locally, never submitted.

Semantic landmarks, one H1 per page, native links/buttons, wrapped input labels, live status messages, visible keyboard focus, and keyboard alternatives to dragging. The mobile menu and all toggles expose state. Motion is optional, and essential content never depends on the canvas or scroll animations.
