# Landing page verification

Verified locally on 11 October 2026 using Node.js 24 and Chromium via Playwright. Production deployment has not been verified.

## Automated checks

- `npm run check` passes JavaScript syntax checks.
- `npm run build` creates the complete static output.
- Chromium loaded local HTML, styles, modules, icons, and the self-hosted font without page errors or failing asset responses.
- No horizontal page overflow at 320, 375, 390, 768, 1024, and 1440 pixels.
- All seven products render; work, life, and development filters return 3, 2, and 2 products respectively.
- All three hero previews update their displayed content and pressed state.
- Product details open with the expected destination; the background stays fixed, Escape dismisses the dialog, and focus returns to its trigger.
- `?system=restu` opens the matching product; closing removes the query parameter.
- Mobile navigation opens and closes after a section link is selected.
- FAQ disclosures open normally.
- A completed project brief produces `ai-nonymauz-project-brief.md` through the browser download flow.
- Reduced-motion preference disables the hero animation.

## Visual review

### 3D background update — 12 October 2026

The hero globe/cube and brand torus backgrounds were checked in Chromium on desktop and phone. Canvas pixel snapshots confirm the geometry changes over time, pauses and resumes through the visible control, freezes for reduced-motion preferences, and suspends while a dialog is open or the scene is off screen. Returning to the scene resumes rendering. The original six responsive widths and complete interaction checks still pass, with no page errors or failed local assets. See the [updated hero](screenshots/3d-hero.webp).

Reviewed [desktop](screenshots/desktop.webp), [phone](screenshots/mobile.webp), and [phone dialog](screenshots/mobile-dialog.webp) screenshots. An overflow caused by a decorative orbit was fixed, and featured product artwork now fills its allocated height.

## Boundaries

Product URLs were taken from repository homepage metadata on the same date. Their individual login, AI, database, and production workflows were not tested as part of this landing-page change. Hero and catalogue visuals are illustrative and contain fictional records.

The landing page has no API, credentials, database, analytics, or form-submission endpoint. Vercel security headers are declared in `vercel.json`; the local static server verifies rendering and interactions, not Vercel's deployment behaviour.
