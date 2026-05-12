import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicIconsDir = path.join(rootDir, "public", "icons");

await mkdir(publicIconsDir, { recursive: true });

const favicon32Path = path.join(publicIconsDir, "favicon-32x32.png");
const faviconIcoPath = path.join(publicIconsDir, "favicon.ico");

const icoBuffer = await pngToIco([favicon32Path]);
await writeFile(faviconIcoPath, icoBuffer);
