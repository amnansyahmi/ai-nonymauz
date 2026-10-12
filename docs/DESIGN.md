# AI-Nonymauz product experience

## Direction

Warm white, navy and blue; Archivo for the interface and system serif italics for occasional emphasis. The landing page uses the spinning N brand mark, an open product directory, one compact device-led preview and a quiet closing section. Each product has an accent colour and an individual detail page.

Visitor progression: introduction → system directory → People device slideshow → wedding planning → shared design principles → FAQ → system finder/project brief.

## Device presentation

The oversized screenshot gallery and “A little look inside” workspace section have been removed. The three large duplicate People/FlowTrack/KretivOS workspaces are no longer embedded in the landing page; all individual product pages retain their interactive demos.

People uses one reusable slideshow on the landing and People detail pages. Actual interface captures sit inside CSS laptop/phone silhouettes. Desktop shows the paired devices; mobile uses a small laptop behind the main phone. The fixed-height, clipped stage prevents tall screenshots from stretching the page. The leave slide contains only a phone because no matching desktop capture exists. The same image is never presented as a different device's interface.

Arrows, dots, keyboard navigation and horizontal swipes select slides. Vertical page scrolling and pinch zoom remain native. Play slideshow is optional, advances immediately when requested, then advances every 4 seconds with a visible progress bar and playing/paused text; desktop captures gently scan from top to bottom within the laptop screen. Pause holds the current screen position. Selection, focus on other controls, pointer presses, dialogs, hidden tabs, global motion pause/reduction, and leaving the viewport stop playback. Focus on the play/pause toggle and mouse hover over the mockup do not cancel an explicit playback request. It does not resume automatically. Live announcements are suppressed during automatic playback. See assets/products/README.md for capture provenance.

This is a slideshow of actual screenshots, not a live product recording or a fabricated video. No recording asset is available. The hardware frames are native HTML/CSS and remain sharp at any display density.

## Animation and performance

Three.js renders a locally bundled, bevelled N brand mark with studio lighting, a slow full turn and desktop pointer tilt. Healthy-frame validation controls the SVG fallback; context loss/restoration and page teardown are handled. Pixel density and frame rate are capped; motion suspends offscreen, in hidden tabs, behind dialogs and when paused/reduced.

Motion's locally bundled mini API animates device slide changes, dialogs and section entries. Content is never hidden in advance. There is no scroll hijacking, page-wide scroll loop, CDN dependency, or multiple animation engines writing the same property. CSS owns the device scan and button states; Motion animates the stage.

## Product functionality

Seven static product pages retain descriptions, feature lists, three-step workflows, interactive sample demos, current app destinations, availability notes and related products. Demo approvals, validated expenses and task movements work with fictional data. The system finder covers all seven systems and explains its recommendation. The project brief downloads locally and is not submitted.

## Integrity and accessibility

No invented customers, testimonials, adoption metrics, shared-account claims, prices or integrations. Cloud demo replies are scripted and security steps are illustrative. Device previews use sample captures and separately captured device sessions. Screenshots are not claims that the current live deployment was inspected.

Semantic landmarks, one H1 per page, native links/buttons, visible focus, labelled controls and keyboard alternatives to gestures. Device controls have 44px targets. Native dialogs retain focus restoration, phone bottom-sheet styling and background scroll locking. Essential content is independent of animation support.
