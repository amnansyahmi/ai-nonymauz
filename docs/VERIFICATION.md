# Verification — product experience redesign

## Completed

- JavaScript syntax checks for source, scripts, and tests.
- Production build of the home page, seven product pages, sitemap, robots.txt, and 404 page.
- 26 automated tests passing with Node's test runner and Linkedom (DOM simulation):
  - expense decimal totals, invalid/negative/excessive input, HTML escaping;
  - all seven system finder outcomes and invalid goal combinations;
  - finite bevelled logo geometry and normals; complete-turn camera projection at phone, narrow tablet, and desktop aspect ratios, including tilt and float;
  - bundled production renderer loads without CDN or bare package imports; matching local SVG asset is referenced;
  - independent approval state, reset, and preserved hero-tab state;
  - expense form updates, over-budget handling, meter clamping;
  - task movement, column counts, completion state, and reset;
  - finder back navigation, dialog closure, saved scroll restoration;
  - directory filters, menu state, motion pause;
  - brief validation and downloaded content;
  - Restu, operations, scripted chat, and security demo interactions;
  - all generated pages: unique IDs, one main/H1, local link/asset resolution, canonical metadata, shared dialogs;
  - complete product definitions and sitemap coverage.
- Source screenshots visually inspected: People employee directory explicitly marked as demo/sample data, and the mobile leave screen. Converted to WebP without altering their content.
- CSS parsed and source formatted with Prettier; `git diff --check` passes.

## Verification limits

The disappearing hero came from a 15-element rotation matrix in the old raw-WebGL code: matrix multiplication produced non-finite coordinates, but the renderer still hid the SVG fallback. Three.js now owns these matrices. Readiness requires a rendered triangle count and a healthy GL context; failure restores the SVG. The geometry projection regression test covers the invalid-coordinate failure but does not establish GPU output.

This session does not have the supported control-browser skill. No preview server, browser renderer, or browser screenshot run was used. DOM tests do not establish visual layout, actual WebGL shader rendering, native dialog focus containment, iOS scroll behaviour, touch dragging, or real download behaviour. Desktop and phone visual acceptance remains to be checked in a browser.

Vercel project-detail access returned HTTP 403 for the target team; release status is checked through the repository's deployment/status integration where available.

## Browser acceptance checklist

Check home and all seven product pages at 1440, 768, 390, and 320px. Verify no page-level horizontal overflow; all text/buttons fit; the 3D mark is visible; selecting a hero product changes its colour; the SVG fallback works with WebGL disabled; reduced motion/pause/hidden-tab/offscreen behaviour works. Exercise all demos, finder/back navigation, expense errors, brief download, screenshot enlargement, mobile menu, and dialog scrolling. Test Escape, keyboard-only use, pinch zoom, and bottom-sheet close/handle gesture. Follow every product's external app link.
