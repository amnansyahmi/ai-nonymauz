# Verification — responsive device preview

## Completed

- JavaScript syntax checks and production build of home, seven product pages, sitemap and 404.
- 32 automated tests passing with Node and Linkedom. DOM interaction tests execute the production app bundle; product demo fixtures come from generated product-page markup.
- Checks cover:
  - removal of the duplicate hero demo and oversized raw gallery; one home device presentation;
  - arrow/dot wrapping, correct real image selection, and hiding the laptop on the phone-only leave slide;
  - opt-in slideshow playback, pause, manual selection/focus/dialog cancellation;
  - global pause, reduced-motion and hidden-tab cancellation without automatic restart;
  - keyboard controls and horizontal/vertical/cancelled touch-gesture intent;
  - independent approvals/reset, expense totals/validation/HTML escaping, Kanban movement and counts;
  - finder outcomes/back navigation, menu/filter state, dialog scroll restoration and downloaded brief;
  - remaining Restu/operations/scripted chat/security demos;
  - finite Three.js geometry and full-turn camera projection at phone, tablet and desktop aspect ratios;
  - locally resolving renderer bundle, generated landmarks/IDs/links/assets, product definitions and sitemap.
- The real People source captures were visually inspected in the earlier capture work; this feedback's iPhone screenshot was inspected before redesign.
- Responsive CSS constraints reviewed and git diff --check passes.

## Limits

The supported control-browser skill is unavailable. No preview server, browser rendering or new browser screenshot was used. DOM simulation does not establish visual layout, GPU output, touch-event delivery, Web Animations output or native dialog behaviour. Desktop/iPhone visual acceptance is outstanding.

## Browser acceptance

At 320, 390, 768 and 1440px, verify contained laptop/phone frames with no page overflow, legible controls and stable stage height between paired-device and phone-only slides. Confirm that no oversized gallery or “A little look inside” section remains. Check real captures sit within the frames and the tall dashboard scans inside the laptop only during requested playback.

Use arrows, dots, keyboard and a horizontal swipe; a vertical swipe must scroll normally. Play/pause, interact with controls, focus the carousel, open a dialog, hide the tab, scroll offscreen and change reduced-motion preferences. Ensure playback stops and stays stopped while manual navigation remains available. Check pause holds the current screenshot position, browser Back restores functional controls, and rapid changes do not leave blank/stale captures.

Verify the spinning logo/SVG fallback, individual product demos, menus, finder and brief download. The device preview is an animated slideshow of screenshots, not a live video recording.
