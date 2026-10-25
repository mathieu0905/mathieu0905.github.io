import { renderMarkdown } from "@/lib/markdown";

/**
 * Server component: Markdown is parsed, highlighted, and math-rendered at build
 * time. Emitting an HTML string (rather than an element tree) keeps the RSC
 * payload small and ships no Markdown/KaTeX/highlighter JS to the browser.
 */
export async function MarkdownRenderer({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: await renderMarkdown(content) }} />;
}
