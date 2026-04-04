/**
 * Daily arXiv paper fetcher
 *
 * Only fetches papers from arXiv API and saves to a temp file.
 * The AI summarization is handled by Claude Code agent (CLI).
 *
 * Environment variables:
 *   ARXIV_CATEGORIES   — optional, comma-separated (default: cs.CL,cs.AI,cs.LG)
 *   ARXIV_MAX_RESULTS  — optional (default: 40)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const CATEGORIES = (process.env.ARXIV_CATEGORIES || "cs.SE,cs.CR,cs.CL,cs.AI,cs.LG,cs.PL")
  .split(",")
  .map((c) => c.trim());
const MAX_RESULTS = parseInt(process.env.ARXIV_MAX_RESULTS || "50", 10);

// ---------- arXiv API ----------

async function fetchArxivPapers() {
  const catQuery = CATEGORIES.map((c) => `cat:${c}`).join("+OR+");
  const url = `https://export.arxiv.org/api/query?search_query=${catQuery}&sortBy=submittedDate&sortOrder=descending&max_results=${MAX_RESULTS}`;

  console.log(`[arxiv] Fetching from: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`arXiv API error: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  return parseArxivXml(xml);
}

function parseArxivXml(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim() : "";
    };

    const id = get("id");
    const title = get("title").replace(/\s+/g, " ");
    const summary = get("summary").replace(/\s+/g, " ");
    const published = get("published");

    const authors = [];
    const authorRegex = /<author>\s*<name>([^<]+)<\/name>/g;
    let am;
    while ((am = authorRegex.exec(block)) !== null) {
      authors.push(am[1].trim());
    }

    const cats = [];
    const catRegex = /category[^>]*term="([^"]+)"/g;
    let cm;
    while ((cm = catRegex.exec(block)) !== null) {
      cats.push(cm[1]);
    }

    entries.push({ id, title, summary, published, authors: authors.slice(0, 5), categories: cats });
  }

  console.log(`[arxiv] Parsed ${entries.length} papers`);
  return entries;
}

// ---------- Format & Save ----------

function formatPapers(papers) {
  return papers
    .map(
      (p, i) =>
        `[${i + 1}] ${p.title}\n    Authors: ${p.authors.join(", ")}\n    Categories: ${p.categories.join(", ")}\n    Link: ${p.id}\n    Published: ${p.published}\n    Abstract: ${p.summary}`
    )
    .join("\n\n---\n\n");
}

async function main() {
  console.log("=== arXiv Daily Fetcher ===\n");

  const papers = await fetchArxivPapers();
  if (papers.length === 0) {
    console.log("No papers found. Exiting.");
    process.exit(0);
  }

  const output = formatPapers(papers);
  const outPath = path.join(REPO_ROOT, ".arxiv-today.txt");
  fs.writeFileSync(outPath, output, "utf-8");
  console.log(`[done] Saved ${papers.length} papers to ${outPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
