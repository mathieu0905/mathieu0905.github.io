import Link from "next/link";
import { acceptedPapers, manuscriptPapers } from "@/data/papers";

function pdfHref(pdfFile?: string) {
  if (!pdfFile) return undefined;
  return `/papers/${encodeURIComponent(pdfFile)}`;
}

export default function PapersPageZh() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">论文 PDF</h1>
              <p className="text-gray-600 dark:text-gray-400">
                本页展示本地同步的论文 PDF（来源 <code className="font-mono">/mypaper</code>）。
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/zh"
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ← 主页
              </Link>
              <Link
                href="/papers"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                EN
              </Link>
            </div>
          </div>
        </header>

        {acceptedPapers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">已接收论文</h2>
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
                        {paper.authors && paper.authors.length > 0 && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{paper.authors.join(", ")}</p>
                        )}
                      </div>
                      {href ? (
                        <a
                          href={href}
                          className="flex-shrink-0 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          下载
                        </a>
                      ) : (
                        <span className="flex-shrink-0 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                          无 PDF
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">其他论文（简介）</h2>
          <div className="space-y-3">
            {manuscriptPapers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{paper.title}</h3>
                  {(paper.venue || paper.year) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{[paper.venue, paper.year].filter(Boolean).join(" ")}</p>
                  )}
                  {paper.abstract && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{paper.abstract}</p>}
                </div>
                <span className="flex-shrink-0 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                  简介
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

