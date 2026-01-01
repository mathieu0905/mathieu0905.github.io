import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceDir = path.resolve(repoRoot, "..", "mypaper");
const destDir = path.resolve(repoRoot, "public", "papers");

function isPdf(name) {
  return name.toLowerCase().endsWith(".pdf");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(sourceFile, destFile) {
  ensureDir(path.dirname(destFile));
  fs.copyFileSync(sourceFile, destFile);
}

if (!fs.existsSync(sourceDir)) {
  console.error(`[sync-papers] Source folder not found: ${sourceDir}`);
  console.error(`[sync-papers] Expected papers under ../mypaper (relative to the Next.js repo).`);
  process.exit(0);
}

ensureDir(destDir);

const sourceFiles = fs
  .readdirSync(sourceDir)
  .filter(isPdf)
  .sort((a, b) => a.localeCompare(b));

if (sourceFiles.length === 0) {
  console.log(`[sync-papers] No PDFs found in: ${sourceDir}`);
  process.exit(0);
}

let copied = 0;
for (const filename of sourceFiles) {
  const from = path.join(sourceDir, filename);
  const to = path.join(destDir, filename);
  copyFile(from, to);
  copied += 1;
}

console.log(`[sync-papers] Copied ${copied} PDF(s) to ${destDir}`);

