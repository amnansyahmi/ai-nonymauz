# Verification — responsive device preview

## Completed

- JavaScript syntax checks and production build of home, seven product pages, sitemap and 404.
- 35 automated tests passing with Node and Linkedom. DOM interaction tests execute the production app bundle; product demo fixtures come from generated product-page markup.
- Checks cover:
  - removal of the duplicate hero demo and oversized raw gallery; one home device presentation;
  - arrow/dot wrapping, correct real image selection, and hiding the laptop on the phone-only leave slide;
  - viewport-triggered autoplay, four-second advancement, progress/playing state and explicit pause persistence;
  - late play-toggle focus and mouse hover do not undo playback; other focus/dialog suspension, resumption and manual interval resets;
  - global pause/reduced motion, hidden tabs and offscreen suspension/resumption; explicit pause prevents automatic restart;
  - secondary touch events preserve the primary gesture and permit playback to resume;
  - keyboard controls and horizontal/vertical/cancelled touch-gesture intent;
  - independent approvals/reset, expense totals/validation/HTML escaping, Kanban movement and counts;
  - finder outcomes/back navigation, menu/filter state, dialog scroll restoration and downloaded brief;
  - remaining Restu/operations/scripted chat/security demos;
  - finite Three.js geometry and full-turn camera projection at phone, tablet and desktop aspect ratios;
  - Ai face texture UV bounds, transparent local brand assets, correct favicon/Apple icon dimensions and new branding on every generated page;
  - locally resolving renderer bundle, generated landmarks/IDs/links/assets, product definitions and sitemap.
- The real People source captures were visually inspected in the earlier capture work; this feedback's iPhone screenshot was inspected before redesign.
- Responsive CSS constraints reviewed and git diff --check passes.

## Limits

The supported control-browser skill is unavailable. No preview server, browser rendering or new browser screenshot was used. DOM simulation does not establish visual layout, GPU output, touch-event delivery, Web Animations output or native dialog behaviour. Desktop/iPhone visual acceptance is outstanding.

## Browser acceptance

At 320, 390, 768 and 1440px, verify contained laptop/phone frames with no page overflow, legible controls and stable stage height between paired-device and phone-only slides. Confirm that no oversized gallery or “A little look inside” section remains. Check real captures sit within the frames and the tall dashboard scans inside the laptop only during requested playback.

Scroll the preview into view: verify autoplay, a visible progress bar, playing status and screen changes every four seconds without clicking. Pause explicitly and verify it remains paused after leaving/re-entering the viewport or hiding/showing the tab. Resume with the toggle. Move the mouse over the mockup and verify playback continues. Test Safari click/focus ordering on the toggle. Use arrows, dots, keyboard and a horizontal swipe; a vertical swipe must scroll normally. Play/pause, interact with controls, focus the carousel, open a dialog, hide the tab, scroll offscreen and change reduced-motion preferences. Ensure temporary suspension resumes automatically, while an explicit user pause persists. Manual navigation remains available in both states. Check pause holds the current screenshot position, browser Back restores functional controls, and rapid changes do not leave blank/stale captures.

Verify the spinning Ai logo/transparent image fallback, individual product demos, menus, finder and brief download. The device preview is an animated slideshow of screenshots, not a live video recording.
