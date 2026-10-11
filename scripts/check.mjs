import { readdir, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
async function walk(dir) {
  for (const name of await readdir(dir)) {
    if ([".git", "dist", "node_modules"].includes(name)) continue;
    const path = `${dir}/${name}`;
    if ((await stat(path)).isDirectory()) await walk(path);
    else if (/\.(m?js)$/.test(path))
      execFileSync(process.execPath, ["--check", path], { stdio: "inherit" });
  }
}
await walk(".");
console.log("All JavaScript modules passed syntax checks.");
