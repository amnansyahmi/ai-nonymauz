// Generates one HyperFrames project per story and device under compositions/.
// Usage: node scripts/compose.mjs [storyId ...]
import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { stories } from "../stories/index.mjs";
import { devices } from "../lib/devices.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "..");
const wanted = process.argv.slice(2);
const selected = wanted.length ? stories.filter((s) => wanted.includes(s.id)) : stories;
if (wanted.length && selected.length !== wanted.length)
  throw new Error(`Unknown story in: ${wanted.join(", ")}`);

// The site stylesheet loads its font from /assets; compositions serve it beside the page.
const css = (await readFile(join(site, "styles.css"), "utf8")).replaceAll("/assets/archivo.woff2", "./archivo.woff2");
const runtime = await readFile(join(root, "lib/runtime.js"), "utf8");
const gsap = join(root, "node_modules/gsap/dist/gsap.min.js");

const page = (story, device) => {
  const { width, height, scale, input, cardWidth } = device;
  const inner = { width: width / scale, height: height / scale };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${width}, height=${height}">
<link rel="stylesheet" href="./styles.css">
<style>
  /* Only the paused timeline may move things: browser-clock motion is not seekable. */
  *, *::before, *::after { transition: none !important; animation: none !important; }
  html, body { margin: 0; width: ${width}px; height: ${height}px; overflow: hidden; background: var(--paper); }
  #main { position: relative; width: ${width}px; height: ${height}px; overflow: hidden; }
  .stage { position: absolute; inset: 0; }
  [data-cam] { position: absolute; left: 0; top: 0; width: ${inner.width}px; height: ${inner.height}px; will-change: transform; }
  .frame { position: absolute; inset: 0; display: grid; place-items: center; }
  .frame .demo-app { width: ${cardWidth}px; }
  [data-fx] { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
  [data-fx] > * { position: absolute; left: 0; top: 0; }
  .fx-stack { display: inline-grid; }
  .fx-stack > .fx-layer { grid-area: 1 / 1; font: inherit; color: inherit; letter-spacing: inherit; }
  .approve-slot { margin-left: auto; }
  .approve-slot .approve-button { margin-left: 0; width: 100%; }
  .fx-pointer { width: 20px; height: 20px; transform-origin: 5px 3px; filter: drop-shadow(0 2px 3px #0f1d2e40); }
  .fx-pointer svg { display: block; width: 100%; height: 100%; fill: #1b2b40; stroke: #fff; stroke-width: 1.6; stroke-linejoin: round; }
  .fx-touch { width: 30px; height: 30px; margin: -15px 0 0 -15px; border-radius: 50%; background: #1b2b4026; border: 2px solid #ffffffd9; box-shadow: 0 2px 8px #0f1d2e33; }
  .fx-ripple { width: 46px; height: 46px; border-radius: 50%; background: var(--blue, #3455db); }
  .fx-ring { border: 2px solid #3455db; border-radius: 8px; box-shadow: 0 0 0 4px #3455db1f; }
</style>
</head>
<body>
<div id="main" data-composition-id="main" data-start="0" data-duration="${story.duration}" data-width="${width}" data-height="${height}">
  <div id="walkthrough-stage" class="stage clip" data-start="0" data-duration="${story.duration}">
    <div data-cam>
      <div class="frame">${story.markup()}</div>
      <div data-fx></div>
    </div>
  </div>
</div>
<script src="./gsap.min.js"></script>
<script>${runtime}</script>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  const start = () => {
    const wt = Walkthrough.create(${JSON.stringify({ ...inner, scale, input, width, height })});
    ${story.script}
    // Hold the last frame to the full duration so the loop length is exact.
    tl.set({}, {}, ${story.duration});
  };
  window.__timelines["main"] = tl;
  // Measure only after the font has loaded, or every target position is off.
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
</script>
</body>
</html>`;
};

for (const story of selected)
  for (const [name, device] of Object.entries(devices)) {
    const dir = join(root, "compositions", `${story.id}-${name}`);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), page(story, device));
    await writeFile(join(dir, "styles.css"), css);
    await copyFile(join(site, "assets/archivo.woff2"), join(dir, "archivo.woff2"));
    await copyFile(gsap, join(dir, "gsap.min.js"));
    await writeFile(join(dir, "story.json"), JSON.stringify({ id: story.id, device: name, duration: story.duration, chapters: story.chapters }, null, 2));
    console.log(`Composed ${story.id}-${name}`);
  }
