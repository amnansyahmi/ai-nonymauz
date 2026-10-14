# AI-Nonymauz product experience

## Direction

Warm white, navy and blue; Archivo for the interface and system serif italics for occasional emphasis. The landing page uses the spinning N brand mark, an open product directory, one compact device-led preview and a quiet closing section. Each product has an accent colour and an individual detail page.

Visitor progression: introduction → system directory → People device slideshow → wedding planning → shared design principles → FAQ → system finder/project brief.

## Device presentation

The oversized screenshot gallery and “A little look inside” workspace section have been removed. The three large duplicate People/FlowTrack/Creative Business Workspace workspaces are no longer embedded in the landing page; all individual product pages retain their interactive demos.

People uses one reusable slideshow on the landing and People detail pages. Actual interface captures sit inside CSS laptop/phone silhouettes. Desktop shows the paired devices; mobile uses a small laptop behind the main phone. The fixed-height, clipped stage prevents tall screenshots from stretching the page. The leave slide contains only a phone because no matching desktop capture exists. The same image is never presented as a different device's interface.

Arrows, dots, keyboard navigation and horizontal swipes select slides. Vertical page scrolling and pinch zoom remain native. The slideshow starts automatically when it enters the viewport and advances every 4 seconds with a visible progress bar and playing/paused text; desktop captures gently scan from top to bottom within the laptop screen. Pause holds the current screen position. Focus on other controls, pointer gestures, dialogs, hidden tabs, global motion pause/reduction and leaving the viewport temporarily suspend playback. It resumes automatically when those conditions clear, while respecting reduced motion and global pause. Manual navigation resets the interval. Pressing Pause explicitly disables autoplay until the user resumes it. Focus on the toggle and mouse hover do not interrupt playback; secondary touch events do not strand the primary gesture state. Live announcements are suppressed during automatic playback. See assets/products/README.md for capture provenance.

This is a slideshow of actual screenshots, not a live product recording or a fabricated video. No recording asset is available. The hardware frames are native HTML/CSS and remain sharp at any display density.

## Animation and performance

The supplied Ai reference is redrawn as smooth Bézier paths in a locally served SVG, retaining its folded A, separate i and cyan/blue/violet palette. The vector is animated directly in CSS, with an automatic slow turn, vertical drift, soft shadow and breathing orbit. Motion starts without WebGL, mouse input or idle loading. Lifecycle code suspends it offscreen, in hidden tabs, behind dialogs and when paused/reduced; desktop pointer tilt is optional. Headers and favicons use the same vector; the Apple icon is rendered from it.

Device frames use a definite height and aspect ratio, with the screen absolutely inset, so intrinsic screenshot dimensions cannot stretch the phone in Safari. Mobile stages are 290–340px high and the phone occupies 86% of that height. Device floating and screenshot changes run automatically. Pointer-triggered focus does not leave the slideshow paused; keyboard focus still suspends it. Gestures released outside the stage and page restoration clear temporary input suspension.

Motion's locally bundled mini API animates device slide changes, dialogs and section entries. Content is never hidden in advance. There is no scroll hijacking, page-wide scroll loop, CDN dependency, or multiple animation engines writing the same property. CSS owns the device scan and button states; Motion animates the stage.

## Product functionality

Eleven static product pages retain descriptions, feature lists, three-step workflows, interactive sample demos, current app destinations, availability notes and related products. Demo approvals, validated expenses and task movements work with fictional data. The system finder covers all eleven systems and explains its recommendation. The project brief downloads locally and is not submitted.

## Integrity and accessibility

No invented customers, testimonials, adoption metrics, shared-account claims, prices or integrations. Cloud demo replies are scripted and security steps are illustrative. Device previews use sample captures and separately captured device sessions. Screenshots are not claims that the current live deployment was inspected.

Semantic landmarks, one H1 per page, native links/buttons, visible focus, labelled controls and keyboard alternatives to gestures. Device controls have 44px targets. Native dialogs retain focus restoration, phone bottom-sheet styling and background scroll locking. Essential content is independent of animation support.

## Product recordings and Games

The home page uses one selectable recording presentation instead of the former screenshot slideshow. Four product workflows have separate desktop and phone recordings, captured from the site's interactive fictional demos. They are labelled demo recordings, not live app sessions. Each MP4 is under 40 KB; posters are local WebP files. Screens remain inside compact laptop and phone frames, with product selection, chapter navigation and explicit play/pause. Lazy media loading, visibility checks and reduced-motion/static posters limit mobile work. Existing genuine HRMS screenshot captures remain available on its product page.

Availability labels describe the project stage, not a live uptime test. A dedicated Games section uses lightweight CSS illustrations for Tiny Tots and the in-development career-city concept.

## Chat workspace

A single responsive chat page offers streaming text, the backend-reported model, safe native Markdown nodes, bounded code/table scrolling and Copy/Stop/Retry. Catalog comparisons and the system finder work independently of model availability. Preparing a brief opens the existing local review/download form. Email delivery awaits service provisioning and a verified destination. No installable workspace or persistent chat history is introduced.
