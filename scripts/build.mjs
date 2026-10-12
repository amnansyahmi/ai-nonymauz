import { cp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { products, productPages, productPath } from "../products.js";
import { header, footer, dialogs, home, productPage } from "../lib/pages.js";
import { escapeHTML } from "../lib/ui.js";
import { build } from "esbuild";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of [
  "styles.css",
  "products.js",
  "assets",
  "lib",
])
  await cp(file, `dist/${file}`, { recursive: true });
// Bundle Motion and the lazy-loaded Three.js scene locally, without CDN calls.
await build({
  entryPoints: ["app.js", "background.js"], outdir: "dist",
  bundle: true, splitting: true, format: "esm", minify: true, target: "es2022",
  legalComments: "linked",
});
const template = await readFile("index.html", "utf8");
const render = (main, title, description, path) =>
  template.replace(
    /\{\{(TITLE|DESCRIPTION|CANONICAL|HEADER|MAIN|FOOTER|DIALOGS)\}\}/g,
    (_, key) =>
      ({
        TITLE: escapeHTML(title),
        DESCRIPTION: escapeHTML(description),
        CANONICAL: `https://ai-nonymauz.my${path}`,
        HEADER: header(),
        MAIN: main,
        FOOTER: footer(),
        DIALOGS: dialogs(),
      })[key],
  );
await writeFile(
  "dist/index.html",
  render(
    home(),
    "AI-Nonymauz — Less busywork. More possibility.",
    "Thoughtful systems for your team, business, finances, and everyday plans. Explore the AI-Nonymauz collection, built in Malaysia.",
    "/",
  ),
);
for (const p of products) {
  const path = productPath(p.id);
  await mkdir(`dist${path}`, { recursive: true });
  await writeFile(
    `dist${path}index.html`,
    render(
      productPage(p),
      `${p.name} — AI-Nonymauz`,
      productPages[p.id].summary,
      path,
    ),
  );
}
const urls = ["/", ...products.map((p) => productPath(p.id))];
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `<url><loc>https://ai-nonymauz.my${path}</loc></url>`).join("")}</urlset>`,
);
await writeFile(
  "dist/robots.txt",
  "User-agent: *\nAllow: /\nSitemap: https://ai-nonymauz.my/sitemap.xml\n",
);
await writeFile(
  "dist/404.html",
  render(
    '<main id="main" class="container product-hero"><p class="overline">404 / A LITTLE DETOUR</p><h1>This page has<br>moved on.</h1><p class="product-intro">There’s plenty more to explore in the collection.</p><a class="button button-primary" href="/">Back to our systems</a></main>',
    "Page not found — AI-Nonymauz",
    "Return to the AI-Nonymauz collection.",
    "/",
  ),
);
console.log("Built home, seven product pages, sitemap, and 404 in dist/.");
