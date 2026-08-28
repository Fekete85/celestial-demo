/* Copies what nginx serves into html/.
 *
 * The page, the star catalogues and the deployment config live in this repo.
 * The library does not: it is an npm dependency, so this demo is a genuine
 * consumer of the published package rather than a copy that can drift from it.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const HERE = import.meta.dirname;
const OUT = path.join(HERE, "html");

const require_ = createRequire(import.meta.url);
let pkgDir;
try {
  pkgDir = path.dirname(require_.resolve("celestial-chart/package.json"));
} catch {
  console.error("celestial-chart is not installed — run `npm install` first.");
  process.exit(1);
}

const bundle = path.join(pkgDir, "build/celestial.min.js");
if (!fs.existsSync(bundle)) {
  console.error(
    "celestial-chart is installed but not built.\n" +
    "npm runs the package's `prepare` script for git dependencies; if it was\n" +
    "skipped, run `npm rebuild celestial-chart` or reinstall.");
  process.exit(1);
}

fs.copyFileSync(bundle, path.join(OUT, "celestial.min.js"));
fs.copyFileSync(path.join(pkgDir, "celestial.css"), path.join(OUT, "celestial.css"));

// celestial.css refers to images/dtpick.png for the date picker.
fs.rmSync(path.join(OUT, "images"), { recursive: true, force: true });
fs.cpSync(path.join(pkgDir, "images"), path.join(OUT, "images"), { recursive: true });

const version = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8")).version;
const page = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
if (!page.includes(`celestial-chart <span>${version}</span>`)) {
  console.warn(`WARNING: the page does not show version ${version} — update html/index.html.`);
}

const dataBytes = fs.readdirSync(path.join(OUT, "data"))
  .reduce((n, f) => n + fs.statSync(path.join(OUT, "data", f)).size, 0);
console.log(`html/ ready: celestial-chart ${version}, bundle ` +
  `${(fs.statSync(path.join(OUT, "celestial.min.js")).size / 1024).toFixed(0)} KB, ` +
  `data ${(dataBytes / 1024 / 1024).toFixed(1)} MB`);
