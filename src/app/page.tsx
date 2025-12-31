import Image from "next/image";
import { FaEnvelope, FaGithub, FaGoogleScholar, FaAward, FaFileLines, FaUsers, FaCode } from "react-icons/fa6";

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
              </div>
            </div>
          </div>
        </header>

        {/* 2024-2025 Year in Review */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-3xl">🎉</span> 2024-2025 Year in Review
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <FaFileLines className="text-3xl mb-2 opacity-80" />
              <div className="text-4xl font-bold">5</div>
              <div className="text-blue-100">Papers Accepted</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <FaAward className="text-3xl mb-2 opacity-80" />
              <div className="text-4xl font-bold">3</div>
              <div className="text-purple-100">Top Venues (ICSE/FSE)</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <FaUsers className="text-3xl mb-2 opacity-80" />
              <div className="text-4xl font-bold">2</div>
              <div className="text-green-100">Industry Collaborations</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
              <FaCode className="text-3xl mb-2 opacity-80" />
              <div className="text-4xl font-bold">4</div>
              <div className="text-orange-100">Research Projects</div>
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

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <div className="text-2xl mb-2">🔧</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Automated Program Repair</h4>
                    <p className="text-sm">Exploring LLM-based code localization and repair, impact analysis using code knowledge graphs.</p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <div className="text-2xl mb-2">🛡️</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">LLM Security & Optimization</h4>
                    <p className="text-sm">Jailbreaking defense mechanisms and prompt optimization techniques for safer AI systems.</p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                    <div className="text-2xl mb-2">📱</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Domain-Specific SE</h4>
                    <p className="text-sm">OpenHarmony ecosystem app repair, low-resource language LLM applications (e.g., Cangjie).</p>
                  </div>
                </div>
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
            <span className="text-2xl">🔬</span> Ongoing Research
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">Code Intelligence</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">LLM Code Understanding</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Investigating how LLMs comprehend code syntax and semantics for improved code analysis tasks.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">Fault Localization</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Intelligent Code Localization</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enhancing bug localization accuracy by integrating static analysis with LLM-based agents.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">Program Repair</span>
                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-xs">Journal Extension</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">OpenHarmony Defect Detection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Extending automated repair tools with new defect detection capabilities for the OpenHarmony ecosystem.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-l-4 border-orange-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs">Impact Analysis</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Change Impact Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Leveraging code knowledge graphs to analyze and predict the impact of code changes across large codebases.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-l-4 border-pink-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded text-xs">Code Quality</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Codebase Health Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exploring structured approaches to maintain codebase quality during iterative development.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-l-4 border-cyan-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded text-xs">Prompt Engineering</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Prompt Robustness</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Addressing prompt degradation issues caused by model updates and temporal drift.</p>
            </div>
          </div>
        </section>

        {/* Timeline News */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What&apos;s New</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="space-y-4">
              {[
                { date: "2025.12", event: "Phantom Rendering Detection accepted at FSE 2026", type: "paper" },
                { date: "2025.10", event: "Cangjie fine-tuning paper accepted at Chinasoft 2025", type: "paper" },
                { date: "2025.06", event: "MazeBreaker accepted at ICSE 2026", type: "paper" },
                { date: "2025.03", event: "HapRepair accepted at FSE Industry 2025", type: "paper" },
                { date: "2024.12", event: "Open Source AI-based SE Tools accepted at TOSEM", type: "paper" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 text-sm font-mono text-blue-600 dark:text-blue-400">{item.date}</div>
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div className="text-gray-700 dark:text-gray-300">{item.event}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Publications */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Selected Publications</h2>
          <div className="space-y-4">
            {[
              { title: "MazeBreaker: Multi-Agent Reinforcement Learning for Dynamic Jailbreaking of LLM Security Defenses", venue: "ICSE 2026", tag: "LLM Security" },
              { title: "Phantom Rendering Detection: Identifying and Analyzing Unnecessary UI Computations", venue: "FSE 2026", tag: "Performance" },
              { title: "HapRepair: Learn to Repair OpenHarmony Apps", venue: "FSE Industry 2025", tag: "Program Repair" },
              { title: "Effective Fine-tuning for Low-resource Languages: A Case Study of Cangjie", venue: "Chinasoft 2025", tag: "LLM" },
              { title: "Open Source AI-based SE Tools: Opportunities and Challenges of Collaborative Software Learning", venue: "TOSEM 2024", tag: "Survey" },
            ].map((paper, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{paper.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{paper.venue}</p>
                  </div>
                  <span className="flex-shrink-0 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                    {paper.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Collaborations */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Collaborations</h2>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-md flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold">H</div>
              <span className="font-medium text-gray-900 dark:text-white">Huawei</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-md flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">S</div>
              <span className="font-medium text-gray-900 dark:text-white">Singapore Management University</span>
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
