import Image from "next/image";
import Link from "next/link";
import { FaEnvelope, FaGithub, FaGoogleScholar } from "react-icons/fa6";
import { acceptedPapers, papers } from "@/data/papers";
import { news } from "@/data/news";
import { collaborators } from "@/data/collaborators";
import { AboutResearchDirectionsZh } from "./components/AboutResearchDirectionsZh";
import { ResearchCards } from "./components/ResearchCard";

function pdfHref(pdfFile?: string) {
  if (!pdfFile) return undefined;
  return `/papers/${encodeURIComponent(pdfFile)}`;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <main className="max-w-7xl mx-auto px-6 py-12">
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
              <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-3">北航博士生 | 北航 SMAT 实验室</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">研究方向：AI for Software Engineering</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a
                  href="mailto:mathieulin@buaa.edu.cn"
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  aria-label="Email"
                >
                  <FaEnvelope className="text-xl text-gray-700 dark:text-gray-300" />
                </a>
                <a
                  href="https://github.com/mathieu0905"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="GitHub"
                >
                  <FaGithub className="text-xl text-gray-700 dark:text-gray-300" />
                </a>
                <a
                  href="https://scholar.google.co.uk/citations?user=iPrIsSUAAAAJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                  aria-label="Google Scholar"
                >
                  <FaGoogleScholar className="text-xl text-gray-700 dark:text-gray-300" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* 最新动态 */}
        <section id="news" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">最新动态</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="space-y-4">
              {news.map((item) => {
                if (item.type === "other") {
                  return (
                    <div key={`${item.type}-${item.date}-${item.title}`} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-20 text-sm font-mono text-blue-600 dark:text-blue-400">{item.date}</div>
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                      <div className="min-w-0">
                        <div className="text-gray-700 dark:text-gray-300">
                          {item.link ? (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{item.title}</a>
                          ) : (
                            item.title
                          )}
                        </div>
                        {item.detail && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.detail}</div>}
                      </div>
                    </div>
                  );
                }

                const paper = papers.find((p) => p.id === item.paperId);
                if (!paper) return null;

                const href = pdfHref(paper.pdfFile);

                return (
                  <div key={`${item.type}-${item.date}-${item.paperId}`} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-20 text-sm font-mono text-blue-600 dark:text-blue-400">{item.date}</div>
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div className="min-w-0">
                      <div className="text-gray-700 dark:text-gray-300">
                        {href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{paper.title}</a>
                        ) : (
                          <span className="font-medium">{paper.title}</span>
                        )}
                        {paper.venue && paper.year && <span className="text-gray-500 dark:text-gray-400"> — 已接收于 {paper.venue} {paper.year}</span>}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {paper.authors && paper.authors.length > 0 ? paper.authors.join(", ") : "作者信息待补充"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 关于我 */}
        <section id="about" className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">关于我</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              {/* 基本信息 */}
              <p>
                我是<strong className="text-gray-900 dark:text-white">北京航空航天大学</strong>博士生，隶属于
                <strong className="text-gray-900 dark:text-white"> SMAT 实验室</strong>，导师为
                <a href="https://scholar.google.com/citations?user=zuUsFkgAAAAJ" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">黎立</a>教授，副导师为
                <a href="https://scholar.google.com/citations?user=2emq9AoAAAAJ" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">周鸣一</a>。
              </p>

              {/* 教育背景 */}
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">教育背景</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold">博</div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">北京航空航天大学 · 硕博连读</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">2024 – 至今 · 计算机科学与技术 · SMAT 实验室</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-bold">本</div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">北京航空航天大学 · 软件工程</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">2019 – 2024 · 软件学院</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 研究概述 */}
              <p>
                研究聚焦于<strong className="text-blue-600 dark:text-blue-400">AI for Software Engineering (AI4SE)</strong>，将大语言模型（LLM）与程序分析技术结合，构建更可靠、更安全的软件工程智能工具。
                我的工作横跨多个子方向——从自动化程序修复到 LLM 安全评估，从领域特定的生态质量保障到低资源编程语言支持——始终围绕同一个核心：<em>让 AI 真正可靠地服务于软件工程实践</em>。
              </p>

              {/* 研究动机与愿景 */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">研究动机与愿景</h3>
                <p>
                  大语言模型展现了令人瞩目的代码生成能力，但其输出往往缺乏真实部署所需的可靠性与安全性保障。
                  我的研究围绕一个核心问题展开：<em>如何将 LLM 的生成能力与程序分析的严谨性结合，打造真正可信赖的软件工程工具？</em>
                </p>
                <p className="mt-2">
                  具体来说，这意味着：在<strong className="text-gray-900 dark:text-white">程序修复</strong>场景中，让 LLM 不仅能生成补丁，还能通过静态分析验证其正确性（如 <a href="/papers/_FSE_Industry2025__Learn_to_Repair_OpenHarmony_Apps.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">HapRepair</a>）；
                  在<strong className="text-gray-900 dark:text-white">安全</strong>场景中，系统性地评估和加固 LLM 的防御能力（如 <a href="/papers/ICSE_2026.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">MazeBreaker</a>）；
                  在<strong className="text-gray-900 dark:text-white">新兴生态</strong>中，弥合数据稀缺带来的工具缺口（如面向 Cangjie 语言的微调研究）。
                </p>
                <p className="mt-2">
                  长远愿景是<strong className="text-blue-600 dark:text-blue-400">构建高效可靠的智能体（Agent）</strong>——它不仅能生成代码，更能自主地理解代码库结构、定位缺陷、评估变更影响、生成可验证的修复方案，最终实现从「AI 辅助编码」到「AI 自主工程」的跨越。
                </p>
              </div>

              {/* 代表性工作 */}
              <div className="mt-6 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">代表性工作</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">ICSE 2026</span>
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded text-xs font-medium">LLM 安全</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">MazeBreaker</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">提出多智能体强化学习框架，动态评估 LLM 安全防线的越狱漏洞。通过多个 Agent 协作生成自适应攻击策略，揭示了现有防御机制的系统性弱点。</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-xs font-medium">FSE Industry 2025</span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">程序修复</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">HapRepair</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">面向 OpenHarmony 生态的自动化应用修复工具，结合领域规则挖掘与 LLM 补丁生成，在真实华为项目中验证了工程落地能力。</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">FSE 2026</span>
                      <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">性能分析</span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded text-xs font-bold">4, 4, 3 高分</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Phantom Rendering Detection</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">识别和分析 UI 中不必要的渲染计算，帮助开发者发现隐藏的性能瓶颈，提升移动应用的流畅度。审稿获得 4, 4, 3 的高分评价。</p>
                  </div>
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-300 rounded text-xs font-medium">EMSE 2026</span>
                      <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-300 rounded text-xs font-medium">低资源语言</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Cangjie 语言微调</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">探索低资源编程语言场景下的 LLM 有效微调策略，以华为仓颉语言为案例，为新兴语言生态的工具链建设提供了可行路径。</p>
                  </div>
                </div>
              </div>

              {/* 科研时间线 */}
              <div className="mt-6 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">科研历程</h3>
                <div className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-700 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-gray-400" />
                    <div className="text-sm font-mono text-blue-600 dark:text-blue-400">2023 年底</div>
                    <div>大四期间开始接触科研，加入 SMAT 实验室</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-blue-500" />
                    <div className="text-sm font-mono text-blue-600 dark:text-blue-400">2023.11</div>
                    <div>第一篇论文投稿 — <a href="https://arxiv.org/abs/2305.12138" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">开源 AI 软件工程工具的机遇与挑战</a>，系统梳理了 AI4SE 领域的开源生态现状</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-green-500" />
                    <div className="text-sm font-mono text-blue-600 dark:text-blue-400">2024</div>
                    <div>第一篇论文被 <strong className="text-gray-900 dark:text-white">TOSEM</strong> 接收 — <a href="/papers/fse_2030.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Open-Source AI-based SE Tools</a>，这是一篇覆盖 100+ 开源工具的全景式综述</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-purple-500" />
                    <div className="text-sm font-mono text-blue-600 dark:text-blue-400">2024.09</div>
                    <div>本科毕业，正式开始硕博连读；同时开启与<strong className="text-gray-900 dark:text-white">华为</strong>和 <strong className="text-gray-900 dark:text-white">SMU</strong> 的合作研究</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-orange-500" />
                    <div className="text-sm font-mono text-blue-600 dark:text-blue-400">2025.03</div>
                    <div><strong className="text-gray-900 dark:text-white">HapRepair</strong> 被 FSE Industry 2025 接收 — 面向 OpenHarmony 生态的自动修复，实现从论文到工程落地</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-red-500" />
                    <div className="text-sm font-mono text-blue-600 dark:text-blue-400">2025.06</div>
                    <div><strong className="text-gray-900 dark:text-white">MazeBreaker</strong> 被 ICSE 2026 接收 — 多智能体强化学习越狱框架，向 LLM 安全方向发力</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-cyan-500" />
                    <div className="text-sm font-mono text-blue-600 dark:text-blue-400">2025–2026</div>
                    <div>研究全面铺开：Phantom Rendering（FSE 2026）、Cangjie 微调（EMSE 2026），以及多个在投稿件涵盖代码理解、Agent 推理、变更影响分析等方向</div>
                  </div>
                </div>
              </div>

              {/* 合作与发表 */}
              <p className="mt-4">
                我与<strong className="text-gray-900 dark:text-white">华为</strong>（OpenHarmony 生态质量、UI 性能分析）和<strong className="text-gray-900 dark:text-white">新加坡管理大学（SMU）</strong>（LLM Agent、程序分析）保持紧密合作。
                迄今已在 <strong className="text-gray-900 dark:text-white">ICSE</strong>、<strong className="text-gray-900 dark:text-white">FSE</strong>、<strong className="text-gray-900 dark:text-white">TOSEM</strong>、<strong className="text-gray-900 dark:text-white">EMSE</strong> 等软件工程顶级会议和期刊发表论文，另有多篇工作在投。
              </p>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">研究方向（可点击展开）</h3>
                <AboutResearchDirectionsZh />
              </div>

              {/* 个人兴趣 */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">科研之外</h3>
                <p>
                  平时喜欢运动，是<strong className="text-gray-900 dark:text-white">陈奕迅</strong>和<strong className="text-gray-900 dark:text-white">张敬轩</strong>的忠实歌迷，也爱玩 NBA 2K、FIFA 等体育类电子游戏。
                  相信好的研究和好的生活一样，需要节奏感。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 研究兴趣 */}
        <section id="research" className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">研究兴趣</h2>
            <div className="flex flex-wrap gap-2">
              {["程序修复", "LLM 安全", "静态分析", "代码生成", "OpenHarmony", "越狱防御", "知识图谱", "提示工程", "低资源语言"].map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 研究方向 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔬</span> 研究方向
          </h2>
          <ResearchCards locale="zh" />
        </section>

        {/* 开源工具 */}
        <section id="tools" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">开源工具</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://github.com/ArkAnalyzer-HapRay"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔍</span>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">HapRay</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">OpenHarmony 应用性能分析工具，用于检测 UI 中的 Phantom Rendering（幽灵渲染）问题。</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">FSE 2026</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">GitHub</span>
              </div>
            </a>
            <a
              href="https://gitcode.com/openharmony-sig/homecheck"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔧</span>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">HomeCheck</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">OpenHarmony 应用静态检查与自动修复工具，HapRepair 的核心模块，支持规则驱动的缺陷检测。</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs font-medium">FSE Industry 2025</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">GitCode</span>
              </div>
            </a>
            <a
              href="https://gitcode.com/ArkAnalyzer/HomeTrans"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔄</span>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">HomeTrans</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Android → OpenHarmony 应用迁移工具，辅助开发者将安卓应用自动转换为鸿蒙生态。</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">迁移工具</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">GitCode</span>
              </div>
            </a>
            <a
              href="https://github.com/Noietch/ResearchClaw"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📚</span>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">ResearchClaw</h3>
                <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">⭐ 59</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">AI 驱动的科研桌面应用，集文献管理、智能阅读笔记、Research Idea 生成于一体，支持 arXiv 论文发现、PDF AI 对话、语义搜索与引用网络。</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">Electron + TypeScript</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">GitHub</span>
              </div>
            </a>
          </div>
        </section>

        {/* 已接收论文 */}
        <section id="publications" className="mb-8">
          <div className="flex items-end justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">已接收论文（PDF）</h2>
            <Link href="/papers" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              查看全部 →
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
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        PDF
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

        {/* 合作 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">合作</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                  H
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Huawei</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">OpenHarmony / 移动应用质量</div>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">相关人员</div>
                <ul className="space-y-1">
                  {collaborators
                    .filter((c) => c.org === "Huawei")
                    .map((c) => (
                      <li key={c.name} className="flex items-center justify-between gap-3">
                        <span>• {c.name}</span>
                        {c.links && c.links.length > 0 && (
                          <span className="flex flex-wrap gap-2">
                            {c.links.map((l) => (
                              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                {l.label}
                              </a>
                            ))}
                          </span>
                        )}
                      </li>
                    ))}
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
                  <div className="text-sm text-gray-500 dark:text-gray-400">AI for SE</div>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">相关人员</div>
                <ul className="space-y-1">
                  {collaborators
                    .filter((c) => c.org === "SMU")
                    .map((c) => (
                      <li key={c.name} className="flex items-center justify-between gap-3">
                        <span>• {c.name}</span>
                        {c.links && c.links.length > 0 && (
                          <span className="flex flex-wrap gap-2">
                            {c.links.map((l) => (
                              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                {l.label}
                              </a>
                            ))}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
          <p>&copy; 2024-2025 Zhihao Lin | 使用 Next.js & Tailwind CSS 构建</p>
        </footer>
      </main>
    </div>
  );
}
