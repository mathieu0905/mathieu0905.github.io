import Link from "next/link";
import { acceptedPapers, manuscriptPapers } from "@/data/papers";

function pdfHref(pdfFile?: string) {
  if (!pdfFile) return undefined;
  return `/papers/${encodeURIComponent(pdfFile)}`;
}

export default function PapersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Paper PDFs</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Local copies synced from <code className="font-mono">/mypaper</code>.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ← Home
              </Link>
              <Link
                href="/zh/papers"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                中文
              </Link>
            </div>
          </div>
        </header>

        {acceptedPapers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Accepted</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {acceptedPapers.map((paper) => {
                const href = pdfHref(paper.pdfFile);
                return (
                  <div key={paper.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{paper.title}</h3>
                        {(paper.venue || paper.year) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {[paper.venue, paper.year].filter(Boolean).join(" ")}
                          </p>
                        )}
                        {paper.tags && paper.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {paper.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    {href && (
                      <a
                        href={href}
                          className="flex-shrink-0 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manuscripts (Short Intro)</h2>
          <div className="space-y-3">
            {manuscriptPapers.map((paper) => {
              return (
                <div
                  key={paper.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{paper.title}</h3>
                    {(paper.venue || paper.year) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {[paper.venue, paper.year].filter(Boolean).join(" ")}
                      </p>
                    )}
                    {paper.abstract && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{paper.abstract}</p>}
                  </div>
                  <span className="flex-shrink-0 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                    Intro
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
