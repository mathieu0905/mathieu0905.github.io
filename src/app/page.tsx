import Image from "next/image";
import Link from "next/link";
import { FaEnvelope, FaGithub, FaGoogleScholar, FaAward, FaFileLines, FaUsers } from "react-icons/fa6";
import { AboutResearchDirections } from "./components/AboutResearchDirections";
import { ResearchCards } from "./components/ResearchCard";
import { acceptedPapers, acceptedPapers2025, papers } from "@/data/papers";
import { news } from "@/data/news";
import { collaborators } from "@/data/collaborators";

function pdfHref(pdfFile?: string) {
  if (!pdfFile) return undefined;
  return `/papers/${encodeURIComponent(pdfFile)}`;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <header className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-lg opacity-30 scale-110" />
              <Image
                src="/avatar.jpg"
                alt="Zhihao Lin"
                width={160}
                height={160}
                className="relative rounded-full ring-4 ring-white dark:ring-gray-700 shadow-lg"
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                林智灏 (Zhihao Lin)
              </h1>
              <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-3">
                Ph.D. Student @ Beihang University
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                SMAT Laboratory | AI for Software Engineering
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
                <a href="mailto:mathieulin@buaa.edu.cn" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors" aria-label="Email">
                  <FaEnvelope className="text-xl text-gray-700 dark:text-gray-300" />
                </a>
                <a href="https://github.com/mathieu0905" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="GitHub">
                  <FaGithub className="text-xl text-gray-700 dark:text-gray-300" />
                </a>
                <a href="https://scholar.google.co.uk/citations?user=iPrIsSUAAAAJ" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors" aria-label="Google Scholar">
                  <FaGoogleScholar className="text-xl text-gray-700 dark:text-gray-300" />
                </a>
                <Link
                  href="/papers"
                  className="px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Paper PDFs
                </Link>
                <Link
                  href="/blog"
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Blog
                </Link>
                <Link
                  href="/zh"
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  中文
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 2025 Year in Review */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-3xl">🎉</span> 2025 Year in Review
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <FaFileLines className="text-3xl mb-2 opacity-80" />
              <div className="text-4xl font-bold">{acceptedPapers2025.length}</div>
              <div className="text-blue-100">Papers Accepted in 2025</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <FaAward className="text-3xl mb-2 opacity-80" />
              <div className="text-4xl font-bold">
                {new Set(acceptedPapers2025.map((p) => p.venue).filter(Boolean)).size}
              </div>
              <div className="text-purple-100">Venues Covered</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <FaUsers className="text-3xl mb-2 opacity-80" />
              <div className="text-4xl font-bold">6</div>
              <div className="text-green-100">Research Directions</div>
            </div>
          </div>
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Publication Highlights</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {acceptedPapers2025.map((p) => (
                    <li key={p.id} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="min-w-0">
                        <span className="font-medium">{p.title}</span>
                        {(p.venue || p.year) && (
                          <span className="text-gray-500 dark:text-gray-400"> — {[p.venue, p.year].filter(Boolean).join(" ")}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <Link href="/papers" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Browse PDFs →
                  </Link>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Research Focus (2025)</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>AI for Software Engineering with LLM-centered tooling</li>
                  <li>Program repair & OpenHarmony ecosystem analysis</li>
                  <li>Static analysis + agentic workflows for debugging</li>
                  <li>LLM security evaluation and robustness</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Collaboration & Community</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>Ongoing collaboration with Huawei</li>
                  <li>Ongoing collaboration with Singapore Management University (SMU)</li>
                  <li>Building research artifacts for reproducibility (datasets/tools)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* About Me - Full Width */}
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About Me</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                I am a first-year Ph.D. student at <strong className="text-gray-900 dark:text-white">Beihang University</strong>,
                working in the <strong className="text-gray-900 dark:text-white">SMAT Laboratory</strong> under the supervision of
                Prof. <strong className="text-gray-900 dark:text-white">Li Li (黎立)</strong>.
              </p>
              <p>
                My research focuses on <strong className="text-blue-600 dark:text-blue-400">AI for Software Engineering (AI4SE)</strong>,
                combining Large Language Models (LLMs) with static analysis techniques to solve complex problems in software engineering.
              </p>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Research Directions</h3>

                <AboutResearchDirections />
              </div>

              <p className="mt-4">
                I collaborate closely with researchers from <strong className="text-gray-900 dark:text-white">Huawei</strong> and
                <strong className="text-gray-900 dark:text-white"> Singapore Management University (SMU)</strong>.
                My work has been published at top SE venues including <strong className="text-gray-900 dark:text-white">ICSE</strong>,
                <strong className="text-gray-900 dark:text-white"> FSE</strong>, and <strong className="text-gray-900 dark:text-white">TOSEM</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Research Interests Tags */}
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Research Interests</h2>
            <div className="flex flex-wrap gap-2">
              {["Program Repair", "LLM Security", "Static Analysis", "Code Generation", "OpenHarmony", "Jailbreak Defense", "Knowledge Graph", "Prompt Engineering", "Low-resource Languages"].map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Ongoing Research */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔬</span> Research Directions
          </h2>
          <ResearchCards />
        </section>

        {/* Timeline News */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What&apos;s New</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="space-y-4">
              {news.map((item) => {
                if (item.type === "other") {
                  return (
                    <div key={`${item.type}-${item.date}-${item.title}`} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-20 text-sm font-mono text-blue-600 dark:text-blue-400">{item.date}</div>
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                      <div className="min-w-0">
                        <div className="text-gray-700 dark:text-gray-300">{item.title}</div>
                        {item.detail && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.detail}</div>}
                      </div>
                    </div>
                  );
                }

                const paper = papers.find((p) => p.id === item.paperId);
                if (!paper) return null;

                return (
                  <div key={`${item.type}-${item.date}-${item.paperId}`} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-20 text-sm font-mono text-blue-600 dark:text-blue-400">{item.date}</div>
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div className="min-w-0">
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{paper.title}</span>
                        {paper.venue && paper.year && <span className="text-gray-500 dark:text-gray-400"> — accepted at {paper.venue} {paper.year}</span>}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {paper.authors && paper.authors.length > 0 ? paper.authors.join(", ") : "Authors: (to be added)"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Publications */}
        <section className="mb-8">
          <div className="flex items-end justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Accepted Papers (PDF)</h2>
            <Link href="/papers" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {acceptedPapers.map((paper) => {
              const href = pdfHref(paper.pdfFile);
              return (
                <div key={paper.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{paper.title}</h3>
                      {(paper.venue || paper.year) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{[paper.venue, paper.year].filter(Boolean).join(" ")}</p>
                      )}
                    </div>
                    {href ? (
                      <a
                        href={href}
                        className="flex-shrink-0 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        PDF
                      </a>
                    ) : (
                      <span className="flex-shrink-0 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                        No PDF
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Collaborations */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Collaborations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                  H
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Huawei</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">OpenHarmony / mobile app reliability</div>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">People</div>
                <ul className="space-y-1">
                  {collaborators
                    .filter((c) => c.org === "Huawei")
                    .map((c) => (
                      <li key={c.name} className="flex items-center justify-between gap-3">
                        <span>• {c.name}</span>
                        {c.links && c.links.length > 0 && (
                          <span className="flex flex-wrap gap-2">
                            {c.links.map((l) => (
                              <a key={l.href} href={l.href} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                {l.label}
                              </a>
                            ))}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
                <div className="font-semibold text-gray-900 dark:text-white mt-4 mb-2">Topics</div>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• OpenHarmony defect detection & repair</li>
                  <li>• UI performance (rendering) analysis</li>
                  <li>• Tooling feedback loop with practitioners</li>
                </ul>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  S
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Singapore Management University (SMU)</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">AI for software engineering</div>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">People</div>
                <ul className="space-y-1">
                  {collaborators
                    .filter((c) => c.org === "SMU")
                    .map((c) => (
                      <li key={c.name} className="flex items-center justify-between gap-3">
                        <span>• {c.name}</span>
                        {c.links && c.links.length > 0 && (
                          <span className="flex flex-wrap gap-2">
                            {c.links.map((l) => (
                              <a key={l.href} href={l.href} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                {l.label}
                              </a>
                            ))}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
                <div className="font-semibold text-gray-900 dark:text-white mt-4 mb-2">Topics</div>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• LLM-based agents for code analysis</li>
                  <li>• Program analysis + learning hybrid methods</li>
                  <li>• Robust evaluation and benchmarks</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
          <p>&copy; 2024-2025 Zhihao Lin | Built with Next.js & Tailwind CSS</p>
        </footer>
      </main>
    </div>
  );
}
