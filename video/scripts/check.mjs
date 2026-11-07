// Runs HyperFrames' own gate (lint, runtime, layout) on every composed walkthrough.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bin = join(root, "node_modules", ".bin", "hyperframes");
let failed = false;
for (const name of await readdir(join(root, "compositions"))) {
  try {
    await run(bin, ["validate", join(root, "compositions", name)], { maxBuffer: 1 << 26 });
    console.log(`✓ ${name}`);
  } catch (error) {
    failed = true;
    console.error(`✗ ${name}\n${error.stdout || ""}${error.stderr || error.message}`);
  }
}
process.exit(failed ? 1 : 0);
