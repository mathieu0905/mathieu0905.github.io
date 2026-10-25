import { unified, type Plugin } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import { refractor } from "refractor";
import { toHtml } from "hast-util-to-html";
import { visit } from "unist-util-visit";
import type { Root, Element, ElementContent } from "hast";

import python from "refractor/python";
import bash from "refractor/bash";
import javascript from "refractor/javascript";
import typescript from "refractor/typescript";
import jsxGrammar from "refractor/jsx";
import tsxGrammar from "refractor/tsx";
import json from "refractor/json";
import json5 from "refractor/json5";
import yaml from "refractor/yaml";
import toml from "refractor/toml";
import markdown from "refractor/markdown";
import css from "refractor/css";
import sql from "refractor/sql";
import diff from "refractor/diff";
import docker from "refractor/docker";
import java from "refractor/java";
import c from "refractor/c";
import cpp from "refractor/cpp";
import kotlin from "refractor/kotlin";
import rust from "refractor/rust";
import go from "refractor/go";
import swift from "refractor/swift";
import ini from "refractor/ini";
import scss from "refractor/scss";
import markup from "refractor/markup";

// Registered once per build process. Only grammars that actually appear in the
// content are bundled, which keeps the highlighting payload far below Prism's
// full 847 KB client bundle.
for (const grammar of [
  python,
  bash,
  javascript,
  typescript,
  jsxGrammar,
  tsxGrammar,
  json,
  json5,
  yaml,
  toml,
  markdown,
  css,
  sql,
  diff,
  docker,
  java,
  c,
  cpp,
  kotlin,
  rust,
  go,
  swift,
  ini,
  scss,
  markup,
]) {
  refractor.register(grammar);
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  yml: "yaml",
  jsonc: "json5",
  md: "markdown",
  dockerfile: "docker",
  html: "markup",
  xml: "markup",
  vue: "markup",
  h: "c",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  rs: "rust",
  golang: "go",
  kt: "kotlin",
  kts: "kotlin",
  "sh-session": "bash",
};

/** Languages that should render as plain, unhighlighted text. */
const PLAIN_LANGUAGES = new Set(["text", "txt", "plain", "plaintext", "output", "log", "", "none"]);

function resolveLanguage(raw: string): string | null {
  const normalized = raw.trim().toLowerCase();
  if (PLAIN_LANGUAGES.has(normalized)) return null;
  const resolved = LANGUAGE_ALIASES[normalized] ?? normalized;
  return refractor.registered(resolved) ? resolved : null;
}

/**
 * Adds syntax highlighting, lazy images wrapped in figures, and safe external
 * links. Runs at build time so no Markdown runtime ships to the browser.
 */
const rehypeEnhance: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node: Element) => {
    // --- code blocks -------------------------------------------------------
    if (node.tagName === "pre") {
      const code = node.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "code",
      );
      if (!code) return;

      const classes = Array.isArray(code.properties.className) ? code.properties.className : [];
      const languageClass = classes.find((value) => String(value).startsWith("language-"));
      const requested = languageClass ? String(languageClass).slice("language-".length) : "";
      const language = resolveLanguage(requested);
      const source = code.children
        .map((child) => (child.type === "text" ? child.value : ""))
        .join("");

      if (language) {
        code.children = refractor.highlight(source, language).children as ElementContent[];
      }

      code.properties.className = ["code-block", language ? `language-${language}` : "language-text"];
      node.properties.className = ["code-block-wrapper"];
      node.properties.dataLanguage = requested || "text";
      return;
    }

    // --- external links ----------------------------------------------------
    if (node.tagName === "a") {
      const href = typeof node.properties.href === "string" ? node.properties.href : "";
      if (/^https?:\/\//i.test(href)) {
        node.properties.target = "_blank";
        node.properties.rel = ["noopener", "noreferrer"];
      }
    }

    // --- images ------------------------------------------------------------
    if (node.tagName === "img") {
      node.properties.loading = "lazy";
      node.properties.decoding = "async";
      const className = Array.isArray(node.properties.className) ? node.properties.className : [];
      node.properties.className = [...className, "mx-auto", "max-w-full", "rounded-xl", "shadow-md"];
    }
  });

  // Wrap a paragraph that contains only an image in a <figure> with a caption.
  visit(tree, "element", (node: Element, index, parent) => {
    if (node.tagName !== "p" || index === undefined || !parent) return;
    const meaningful = node.children.filter(
      (child) => !(child.type === "text" && child.value.trim() === ""),
    );
    if (meaningful.length !== 1) return;
    const image = meaningful[0];
    if (image.type !== "element" || image.tagName !== "img") return;

    const alt = typeof image.properties.alt === "string" ? image.properties.alt : "";
    const figure: Element = {
      type: "element",
      tagName: "figure",
      properties: { className: ["markdown-figure"] },
      children: [image],
    };

    if (alt) {
      figure.children.push({
        type: "element",
        tagName: "figcaption",
        properties: { className: ["markdown-figcaption"] },
        children: [{ type: "text", value: alt }],
      });
    }

    parent.children[index] = figure;
  });
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // CommonMark requires whitespace or punctuation around `**`, so Chinese text
  // like **加粗**紧跟正文 silently loses its emphasis. This restores it.
  .use(remarkCjkFriendly)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeKatex, { strict: false, trust: false })
  .use(rehypeEnhance);

/**
 * Renders Markdown to an HTML string on the server. Producing a string rather
 * than a React element tree keeps the RSC payload small: the flight data holds
 * one string instead of a serialized element for every token span.
 */
export async function renderMarkdown(content: string): Promise<string> {
  const tree = await processor.run(processor.parse(content));
  return toHtml(tree as Root);
}
