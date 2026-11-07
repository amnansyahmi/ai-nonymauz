import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import chatHandler from "../api/chat.js";
const root = resolve(process.argv[2] || ".");
const mime = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain",
  ".png": "image/png",
  ".webp": "image/webp",
  ".xml": "application/xml",
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/api/chat" || url.pathname === "/api/chat/") return await chatHandler(req, res);
    let file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const content = await readFile(file);
    const type = mime[extname(file)] || "application/octet-stream";
    const headers = {
      "Content-Type": /^(text\/|application\/xml|image\/svg)/.test(type) ? `${type}; charset=utf-8` : type,
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
    };
    // Single byte ranges, as browsers request them to seek within video (Vercel does the same).
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (range && (range[1] || range[2])) {
      const size = content.length;
      const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start >= size || start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${size}` }).end();
        return;
      }
      res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
      res.end(content.subarray(start, end + 1));
      return;
    }
    res.writeHead(200, { ...headers, "Content-Length": content.length });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(Number(process.env.PORT || 4173), "0.0.0.0", () =>
  console.log(`Landing page: http://localhost:${process.env.PORT || 4173}`),
);
