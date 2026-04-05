"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

const components: Components = {
  img({ src, alt, ...props }) {
    return (
      <figure className="my-6">
        <img
          src={src}
          alt={alt || ""}
          loading="lazy"
          className="rounded-xl shadow-md mx-auto max-w-full"
          {...props}
        />
        {alt && (
          <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const code = String(children).replace(/\n$/, "");

    if (match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          className="rounded-xl !my-4 text-sm"
        >
          {code}
        </SyntaxHighlighter>
      );
    }

    return (
      <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  a({ href, children, ...props }) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
