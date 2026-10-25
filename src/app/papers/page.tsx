import { acceptedPapers, manuscriptPapers } from "@/data/papers";

function pdfHref(pdfFile?: string) {
  if (!pdfFile) return undefined;
  if (/^https?:\/\//i.test(pdfFile)) return pdfFile;
  return `/papers/${encodeURIComponent(pdfFile)}`;
}

export default function PapersPage() {
  return (
    <div className="site-shell">
      <main className="site-container py-14 pb-24">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-[2rem]">论文</h1>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
            已发表与在投工作的本地 PDF 归档。
          </p>
        </header>

        {acceptedPapers.length > 0 && (
          <section className="border-b border-[color:var(--rule)] pb-12">
            <h2 className="section-label">已接收</h2>
            <ul className="divide-y divide-[color:var(--rule)]">
              {acceptedPapers.map((paper) => {
                const href = pdfHref(paper.pdfFile);
                return (
                  <li key={paper.id} className="py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-medium leading-snug text-[color:var(--ink)]">{paper.title}</h3>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs text-[color:var(--accent)] hover:underline"
                        >
                          PDF
                        </a>
                      ) : (
                        <span className="flex-shrink-0 text-xs text-[color:var(--ink-faint)]">—</span>
                      )}
                    </div>
                    {(paper.venue || paper.year) && (
                      <p className="mt-1 text-xs text-[color:var(--ink-faint)]">
                        {[paper.venue, paper.year].filter(Boolean).join(" ")}
                      </p>
                    )}
                    {paper.tags && paper.tags.length > 0 && (
                      <p className="mt-1.5 text-xs text-[color:var(--ink-faint)]">
                        {paper.tags.map((tag) => `#${tag}`).join(" ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="pt-12">
          <h2 className="section-label">在投与预印本</h2>
          <ul className="divide-y divide-[color:var(--rule)]">
            {manuscriptPapers.map((paper) => {
              const href = pdfHref(paper.pdfFile);
              return (
                <li key={paper.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-medium leading-snug text-[color:var(--ink)]">{paper.title}</h3>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-xs text-[color:var(--accent)] hover:underline"
                      >
                        预印本
                      </a>
                    ) : (
                      <span className="flex-shrink-0 text-xs text-[color:var(--ink-faint)]">—</span>
                    )}
                  </div>
                  {(paper.venue || paper.year) && (
                    <p className="mt-1 text-xs text-[color:var(--ink-faint)]">
                      {[paper.venue, paper.year].filter(Boolean).join(" ")}
                    </p>
                  )}
                  {paper.abstract && (
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">{paper.abstract}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
