import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceDir = path.resolve(repoRoot, "..", "mypaper");
const destDir = path.resolve(repoRoot, "public", "papers");
const papersTs = path.resolve(repoRoot, "src", "data", "papers.ts");

function isPdf(name) {
  return name.toLowerCase().endsWith(".pdf");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readWhitelist() {
  if (!fs.existsSync(papersTs)) {
    console.error(`[sync-papers] papers.ts not found: ${papersTs}`);
    process.exit(1);
  }
  const content = fs.readFileSync(papersTs, "utf8");
  const whitelist = new Set();
  const pattern = /pdfFile\s*:\s*"([^"]+\.pdf)"/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    whitelist.add(match[1]);
  }
  return whitelist;
}

if (!fs.existsSync(sourceDir)) {
  console.error(`[sync-papers] Source folder not found: ${sourceDir}`);
  console.error(`[sync-papers] Expected papers under ../mypaper (relative to the Next.js repo).`);
  process.exit(0);
}

const whitelist = readWhitelist();
if (whitelist.size === 0) {
  console.log("[sync-papers] No pdfFile entries found in papers.ts. Nothing to sync.");
  process.exit(0);
}

ensureDir(destDir);

const sourceFiles = fs
  .readdirSync(sourceDir)
  .filter(isPdf)
  .sort((a, b) => a.localeCompare(b));

let copied = 0;
let skippedNotWhitelisted = 0;
for (const filename of sourceFiles) {
  if (!whitelist.has(filename)) {
    skippedNotWhitelisted += 1;
    continue;
  }
  const from = path.join(sourceDir, filename);
  const to = path.join(destDir, filename);
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
  copied += 1;
}

let pruned = 0;
const destFiles = fs.existsSync(destDir) ? fs.readdirSync(destDir).filter(isPdf) : [];
for (const filename of destFiles) {
  if (!whitelist.has(filename)) {
    fs.unlinkSync(path.join(destDir, filename));
    pruned += 1;
  }
}

const missing = [...whitelist].filter(
  (name) => !sourceFiles.includes(name) && !fs.existsSync(path.join(destDir, name)),
);

console.log(
  `[sync-papers] Copied ${copied}, skipped ${skippedNotWhitelisted} (not in papers.ts whitelist), pruned ${pruned} stale PDF(s) from ${destDir}`,
);
if (missing.length > 0) {
  console.warn(`[sync-papers] ${missing.length} whitelisted PDF(s) declared in papers.ts but missing from source:`);
  for (const name of missing) console.warn(`  - ${name}`);
}
