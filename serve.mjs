/* Serves html/ for local work. The data is loaded with fetch, which the browser
 * refuses on file://, so a real HTTP server is needed even to look at the page. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "html");
const PORT = Number(process.argv[2]) || 8080;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
                ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };

http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(ROOT, rel === "/" ? "index.html" : rel);
  // Never serve outside html/, whatever the path contains.
  if (!path.resolve(file).startsWith(path.resolve(ROOT))) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, body) => {
    if (err) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  });
}).listen(PORT, "127.0.0.1", () => console.log(`http://127.0.0.1:${PORT}/`));
