# Walkthrough recordings (HyperFrames)

Source for the demo recordings shown in the site's laptop and phone frames. Nothing in this folder ships to visitors: the site serves only the rendered MP4s and WebP posters in `../assets/walkthroughs/`.

Rendering uses [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache-2.0) for HTML-to-video and GSAP (free under its standard no-charge licence) for the paused timeline. Both are pinned to exact versions. No account, API key or paid service is needed. Everything runs locally with Chrome and FFmpeg.

## How it works

- `stories/` has one file per product. A story takes its markup from the site's own `lib/demo-views.js`, so the recording always matches the live demo, and scripts the cursor, taps, camera and state changes on a seekable timeline.
- `lib/runtime.js` has the browser-side helpers: measuring targets, camera push-in, pointer and touch indicators, highlight rings and stacked state swaps that never reflow the layout.
- `lib/devices.mjs` sets the output sizes: desktop is 1440×960 (1.5× density for retina laptops) and mobile is 390×740.
- `scripts/compose.mjs` writes one HyperFrames project per story and device into `compositions/` (generated and git-ignored).
- `scripts/render.mjs` renders each project, re-encodes it as muted, fast-start H.264, and writes the first frame as the poster. The last frame matches the first, so the loop has no seam.

## Commands

Node.js 22+ and FFmpeg are required.

```sh
cd video
npm ci
npx hyperframes telemetry disable   # optional; HyperFrames collects anonymous usage data by default
export HYPERFRAMES_BROWSER_PATH=/path/to/chrome   # if `npx hyperframes doctor` cannot find Chrome
npm run check     # compose + HyperFrames runtime validation
npm run render    # compose + render into ../assets/walkthroughs/
node scripts/render.mjs people   # re-render one story after composing
```

To check frames before a full render, run `npx hyperframes snapshot compositions/people-desktop --at 1,4.5,7`.

## Adding a product

1. Copy `stories/people.mjs`, change `id`, `markup` and the timeline script, and list the story in `stories/index.mjs`.
2. Add the chapter start times to that product's entry in `../lib/walkthroughs.js` as `times`. A test keeps the HRMS times and the story in sync. Copy that test for each new story.
3. Run `npm run render`, then `npm test` from the repository root. The recordings are kept to under 160 KB each and 600 KB in total.

HyperFrames ships agent skills (`npx hyperframes skills update`). Installing them is optional and is a step for whoever maintains this folder.
