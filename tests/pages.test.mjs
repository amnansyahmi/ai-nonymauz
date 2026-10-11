import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { products, productPages, productPath } from "../products.js";
const routes = ["/", ...products.map((p) => productPath(p.id))];
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
