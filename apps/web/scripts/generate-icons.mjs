import { access, cp, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicIconsDir = path.join(rootDir, "public", "icons");
const sourceIconPath = path.join(publicIconsDir, "logo-n.png");
const targetFileNames = [
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "pwa-192x192.png",
  "pwa-512x512.png",
];

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

await mkdir(publicIconsDir, { recursive: true });

if (!(await fileExists(sourceIconPath))) {
  throw new Error(`No se encontró el logo fuente: ${sourceIconPath}`);
}

const existingTargets = await Promise.all(
  targetFileNames.map((fileName) => fileExists(path.join(publicIconsDir, fileName))),
);

if (existingTargets.every(Boolean)) {
  process.exit(0);
}

const targets = [
  { fileName: "favicon-16x16.png", size: 16 },
  { fileName: "favicon-32x32.png", size: 32 },
  { fileName: "apple-touch-icon.png", size: 180 },
  { fileName: "pwa-192x192.png", size: 192 },
  { fileName: "pwa-512x512.png", size: 512 },
];

try {
  execFileSync("sips", ["--help"], { stdio: "ignore" });
} catch {
  throw new Error(
    "La generación de iconos requiere 'sips' en macOS. Los iconos ya generados deben estar comprometidos en public/icons para builds CI/Vercel.",
  );
}

for (const { fileName, size } of targets) {
  const outputPath = path.join(publicIconsDir, fileName);

  await cp(sourceIconPath, outputPath);
  execFileSync("sips", ["-z", String(size), String(size), outputPath, "--out", outputPath], {
    stdio: "ignore",
  });
}

const favicon32Path = path.join(publicIconsDir, "favicon-32x32.png");
const faviconIcoPath = path.join(publicIconsDir, "favicon.ico");

const icoBuffer = await pngToIco([favicon32Path]);
await writeFile(faviconIcoPath, icoBuffer);
