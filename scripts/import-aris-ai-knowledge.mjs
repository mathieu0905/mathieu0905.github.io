import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const sourceRoot = process.env.ARIS_SOURCE || "/tmp/ARIS-in-AI-Offer";
const projectRoot = process.cwd();
const manifestPath = path.join(sourceRoot, "tools/tutorials_render_manifest.json");
const contentRoot = path.join(projectRoot, "src/content/ai-knowledge");
const tutorialRoot = path.join(contentRoot, "tutorials");
const publicRoot = path.join(projectRoot, "public/ai-knowledge");

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ARIS source file: ${filePath}`);
  }
}

function slugFromMarkdownPath(mdPath) {
  const fileName = path.basename(mdPath, ".md");
  return fileName.replace(/_tutorial(_en)?$/, "").replaceAll("_", "-");
}

function copyFileEnsuringDir(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

assertExists(manifestPath);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

fs.rmSync(tutorialRoot, { recursive: true, force: true });
fs.mkdirSync(path.join(tutorialRoot, "zh"), { recursive: true });
fs.mkdirSync(path.join(tutorialRoot, "en"), { recursive: true });

const tutorials = [];

for (const [htmlPath, entry] of Object.entries(manifest)) {
  if (!htmlPath.startsWith("docs/tutorials/") || !htmlPath.endsWith(".html")) {
    continue;
  }

  const lang = entry.lang === "en" ? "en" : "zh";
  const mdPath = entry.md;
  const sourceFile = path.join(sourceRoot, mdPath);
  assertExists(sourceFile);

  const slug = slugFromMarkdownPath(mdPath);
  const targetFile = path.join(tutorialRoot, lang, `${slug}.md`);
  copyFileEnsuringDir(sourceFile, targetFile);

  tutorials.push({
    slug,
    lang,
    sourceMarkdown: mdPath,
    sourceHtml: htmlPath,
    title: entry.title,
  });
}

const codeSource = path.join(sourceRoot, "docs/tutorials/code");
if (fs.existsSync(codeSource)) {
  const codeTarget = path.join(publicRoot, "code");
  fs.rmSync(codeTarget, { recursive: true, force: true });
  fs.cpSync(codeSource, codeTarget, { recursive: true });
}

copyFileEnsuringDir(
  path.join(sourceRoot, "LICENSE"),
  path.join(contentRoot, "ARIS_LICENSE.txt"),
);

let commit = "unknown";
try {
  commit = execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
} catch {
  // Keep the import usable from a source tarball.
}

const sourceMeta = {
  name: "ARIS-in-AI-Offer",
  repo: "https://github.com/wanshuiyin/ARIS-in-AI-Offer",
  site: "https://wanshuiyin.github.io/ARIS-in-AI-Offer",
  author: "Ruofeng Yang (杨若峰)",
  license: "MIT",
  commit,
  importedTutorials: tutorials.length,
};

fs.writeFileSync(
  path.join(contentRoot, "source-meta.json"),
  `${JSON.stringify(sourceMeta, null, 2)}\n`,
  "utf8",
);

console.log(`Imported ${tutorials.length} ARIS tutorial markdown files from ${commit}.`);
