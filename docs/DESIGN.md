# AI-Nonymauz landing page

## Purpose

Introduce the owner's family of systems and help visitors choose a product by the job they need to do. The catalogue links to verified repository homepage destinations; SecureIntelligence points to its developer repository. It does not promise shared accounts, automatic data sync, fixed pricing, or unconfigured AI capabilities.

## Design direction

Cool white and navy, with a blue workspace stage as the main visual moment. A restrained header, left-aligned hero copy, and a hands-on product preview lead into the catalogue. Featured products have horizontal compositions; smaller systems use compact visual previews. These are explicitly illustrative UI samples with fictional records, not screenshots of production data.

Palette: paper `#FFFFFF`, ink `#18293B`, muted `#526376`, action blue `#214DD7`, wash `#F7F9FC`, navy `#152C46`. Each product has a quiet category-specific accent. Archivo is self-hosted under its SIL Open Font License; one variable family carries the entire type hierarchy.

UI/UX Pro Max was consulted using the query `software portfolio product showcase minimal` and its design-system and accessibility guidance. Its automatic brutalism/storytelling recommendation was reviewed and adapted: raw anti-design and scroll-driven storytelling do not fit a straightforward system directory. The final treatment keeps a coherent palette and typography while favouring readable product discovery and familiar interaction patterns.

The [Frontend Design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) guided the distinctive product-first visual direction, restrained motion, copy, and hierarchy. A single page-load animation introduces the hero; other movement follows user actions. SVG iconography is drawn locally; no emojis or external icon runtime is needed.

## Interactions

- Three hero previews switch on explicit user input; no automatic carousel.
- Catalogue filters expose their pressed state and announce result counts.
- Product details use native modal dialogs with scroll locking, Escape dismissal, focus restoration, and deep links such as `?system=people`.
- Mobile navigation exposes expanded state and closes after navigation.
- Native disclosure controls handle FAQs.
- A project brief downloads locally as Markdown. It validates the goal and audience and never submits or stores personal data.

## Implementation

The background uses perspective-projected 3D geometry: a rotating wireframe globe and translucent cube in the hero, and torus meshes around the brand marks. The locally drawn canvas scenes run at up to 30 frames per second, cap pixel density, and use fewer vertices on small screens. A visible pause control stops all scenes. Reduced-motion renders a static composition; offscreen scenes, hidden tabs, and open dialogs suspend the animation loop. Existing SVG/CSS circles remain as fallbacks if canvas is unavailable.

Dependency-free HTML, CSS, and ES modules; Node 22+ for the local server and static build. No database or AI secrets belong in the landing page. Production assets are served from the same origin, including the typeface. Vercel headers restrict script/style/connect sources and frame embedding.
