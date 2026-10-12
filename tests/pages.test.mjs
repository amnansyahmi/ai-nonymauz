import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { products, productPages, productPath } from "../products.js";
const routes = ["/", ...products.map((p) => productPath(p.id))];
test("production renderer resolves locally without CDN or bare package imports", async () => {
  const { logoGeometry, startRibbon } = await import("../dist/background.js");
  assert.equal(typeof startRibbon, "function");
  const geometry = logoGeometry();
  assert.ok(geometry.getAttribute("position").count > 0);
  geometry.dispose();
  const html = await readFile("dist/index.html", "utf8");
  assert.ok(html.includes('src="/assets/brand/ai-emblem.webp"'));
});
test("brand icons retain transparency and correct install-icon dimensions", async () => {
  const emblem = await readFile("dist/assets/brand/ai-emblem.webp");
  assert.equal(emblem.toString("ascii", 0, 4), "RIFF");
  assert.equal(emblem.toString("ascii", 8, 12), "WEBP");
  assert.ok(emblem.includes(Buffer.from("ALPH")), "emblem must retain its transparent background");
  for (const [name, size] of [["favicon.png", 96], ["apple-touch-icon.png", 180]]) {
    const png = await readFile(`dist/assets/brand/${name}`);
    assert.equal(png.toString("ascii", 12, 16), "IHDR");
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
    assert.equal(png[25], 6, "icon must use RGBA");
  }
});
for (const route of routes)
  test(`generated page ${route} has valid local destinations and unique landmarks`, async () => {
    const html = await readFile(`dist${route}index.html`, "utf8");
    assert.ok(!html.includes("{{"));
    assert.equal((html.match(/<main\b/g) || []).length, 1);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
    assert.equal(ids.length, new Set(ids).size, "IDs must be unique");
    for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (href.startsWith("#")) {
        assert.ok(ids.includes(href.slice(1)), `missing anchor ${href}`);
        continue;
      }
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const pathname = href.split("#")[0];
      const target = `dist${pathname}${pathname.endsWith("/") ? "index.html" : ""}`;
      assert.ok((await stat(target)).isFile(), `missing ${target}`);
    }
    assert.ok(html.includes(`https://ai-nonymauz.my${route}`));
    assert.ok(html.includes('id="finder-dialog"'));
    assert.ok(html.includes('id="brief-dialog"'));
    assert.ok(html.includes("Interactive demo"));
    assert.ok(html.includes('/assets/brand/favicon.png'));
    assert.ok(html.includes('/assets/brand/apple-touch-icon.png'));
    assert.ok(html.includes('/assets/brand/ai-emblem.webp'));
    assert.ok(!html.includes('/assets/mark.svg'));
    assert.ok(!html.includes('/assets/logo-sculpture.svg'));
  });
test("every product has a complete page definition and an HTTPS app destination", () => {
  for (const p of products) {
    assert.ok(productPages[p.id]);
    assert.equal(productPages[p.id].steps.length, 3);
    assert.equal(new URL(p.url).protocol, "https:");
  }
});
test("sitemap includes the home page and all seven products", async () => {
  const xml = await readFile("dist/sitemap.xml", "utf8");
  assert.equal((xml.match(/<loc>/g) || []).length, 8);
  for (const route of routes)
    assert.ok(xml.includes(`https://ai-nonymauz.my${route}`));
});
