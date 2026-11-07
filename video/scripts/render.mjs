// Renders every composed walkthrough and writes web-ready MP4s and WebP posters
// into the site's assets/walkthroughs/. Run `npm run render` (it composes first).
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { devices } from "../lib/devices.mjs";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, "..", "assets", "walkthroughs");
const wanted = process.argv.slice(2);
const bin = join(root, "node_modules", ".bin", "hyperframes");
await mkdir(join(root, "out"), { recursive: true });

for (const name of await readdir(join(root, "compositions"))) {
  const dir = join(root, "compositions", name);
  const meta = JSON.parse(await readFile(join(dir, "story.json"), "utf8"));
  if (wanted.length && !wanted.includes(meta.id)) continue;
  const master = join(root, "out", `${name}.mp4`);
  const video = join(assets, `${name}.mp4`), poster = join(assets, `${name}.webp`);
  console.log(`Rendering ${name}…`);
  await run(bin, ["render", dir, "-o", master, "--fps", "30", "--quality", "delivery", "--quiet"], { maxBuffer: 1 << 26 });
  // Muted, inline, looping web video: no audio track, moov atom first for fast start.
  await run("ffmpeg", ["-v", "error", "-y", "-i", master, "-an", "-c:v", "libx264", "-preset", "veryfast",
    "-crf", String(devices[meta.device].crf), "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", video]);
  // The first frame is the loop's resting state, so it doubles as the poster.
  await run("ffmpeg", ["-v", "error", "-y", "-i", master, "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", poster]);
  const kb = async (file) => `${Math.round((await stat(file)).size / 1024)} KB`;
  console.log(`  ${name}.mp4 ${await kb(video)}, poster ${await kb(poster)}`);
}
