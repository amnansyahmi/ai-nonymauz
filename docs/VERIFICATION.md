# Verification — product experience redesign

## Completed

- JavaScript syntax checks for source, scripts, and tests.
- Production build of the home page, seven product pages, sitemap, robots.txt, and 404 page.
- 34 automated tests passing with Node's test runner and Linkedom (DOM simulation):
  - expense decimal totals, invalid/negative/excessive input, HTML escaping;
  - all seven system finder outcomes and invalid goal combinations;
  - finite bevelled logo geometry and normals; complete-turn camera projection at phone, narrow tablet, and desktop aspect ratios, including tilt and float;
  - bundled production renderer loads without CDN or bare package imports; matching local SVG asset is referenced;
  - independent approval state, reset, and preserved hero-tab/mode state;
  - direct workflow steps, opt-in playback to completion, cancellation on product switch, dialogs, pause, reduced motion, and hidden tabs without automatic resumption;
  - horizontal gesture intent, vertical/form gesture isolation, and wrapping previous/next navigation;
  - capture screen/device selection, phone-only fallback and preferred-device restoration, enlargement source and focus restoration;
  - expense form updates, over-budget handling, meter clamping;
  - task movement, column counts, completion state, and reset;
  - finder back navigation, dialog closure, saved scroll restoration;
  - directory filters, menu state, motion pause;
  - brief validation and downloaded content;
  - Restu, operations, scripted chat, and security demo interactions;
  - all generated pages: unique IDs, one main/H1, local link/asset resolution, canonical metadata, shared dialogs;
  - complete product definitions and sitemap coverage.
- Source screenshots visually inspected, including added People dashboard desktop/phone and employee-directory phone captures. Existing captures: People employee directory explicitly marked as demo/sample data, and the mobile leave screen. Converted to WebP without altering their content.
- Responsive CSS rules reviewed; `git diff --check` passes. New JavaScript follows the existing module structure. DOM interaction tests execute the production app bundle.

## Verification limits

The disappearing hero came from a 15-element rotation matrix in the old raw-WebGL code: matrix multiplication produced non-finite coordinates, but the renderer still hid the SVG fallback. Three.js now owns these matrices. Readiness requires a rendered triangle count and a healthy GL context; failure restores the SVG. The geometry projection regression test covers the invalid-coordinate failure but does not establish GPU output.

This session does not have the supported control-browser skill. No preview server, browser renderer, or browser screenshot run was used. DOM tests do not establish visual layout, actual WebGL shader rendering, native dialog focus containment, iOS scroll behaviour, touch dragging, or real download behaviour. Desktop and phone visual acceptance remains to be checked in a browser.

Vercel project-detail access returned HTTP 403 for the target team; release status is checked through the repository's deployment/status integration where available.

## Browser acceptance checklist

Check home and all seven product pages at 1440, 768, 390, and 320px. Verify no page-level horizontal overflow; all text/buttons fit; the 3D mark is visible; selecting a hero product changes its colour; the SVG fallback works with WebGL disabled; reduced motion/pause/hidden-tab/offscreen behaviour works. Exercise all demos, finder/back navigation, expense errors, brief download, screenshot enlargement, mobile menu, and dialog scrolling. Test Escape, keyboard-only use, pinch zoom, and bottom-sheet close/handle gesture. Follow every product's external app link.


## New browser acceptance cases

At 320, 390, 768, and 1440px: use product tabs, previous/next controls, and phone surface swipes; ensure a vertical swipe scrolls the page and inputs/task buttons do not switch products. Change between Try and Workflow after editing a demo and verify the edits remain. Run each tour once, interrupt with a product switch, a dialog, pause/reduced motion, hidden tab, or scrolling out of view. Ensure manual steps still work with motion disabled.

On home and People detail pages, switch gallery screens/devices, test the phone-only leave-planner screen, and enlarge both tall and phone captures. Check readable full-image scrolling, sticky close control, Escape, background scroll locking and focus restoration. Check rapid product/image switching for animation races and no horizontal page overflow. New visual layout, GPU, touch, and Web Animations behaviour still requires browser acceptance; these were not exercised by DOM simulation.
