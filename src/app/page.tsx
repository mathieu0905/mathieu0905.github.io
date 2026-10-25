import Image from "next/image";
import Link from "next/link";
import { FaEnvelope, FaGithub, FaGoogleScholar } from "react-icons/fa6";
import { acceptedPapers, papers } from "@/data/papers";
import { sortedNews } from "@/data/news";
import { collaborators, type CollaboratorOrg } from "@/data/collaborators";
import { AboutResearchDirectionsZh } from "./components/AboutResearchDirectionsZh";
import { ResearchCards } from "./components/ResearchCard";

function pdfHref(pdfFile?: string) {
  if (!pdfFile) return undefined;
  if (/^https?:\/\//i.test(pdfFile)) return pdfFile;
  return `/papers/${encodeURIComponent(pdfFile)}`;
}

const collaborationGroups: {
  org: CollaboratorOrg;
  name: string;
  subtitle: string;
  topics: string[];
}[] = [
  {
    org: "Huawei",
    name: "华为",
    subtitle: "OpenHarmony / 移动应用质量",
    topics: ["OpenHarmony 应用修复", "Phantom Rendering / UI 性能分析", "Cangjie 低资源语言微调"],
  },
  {
    org: "BTH",
    name: "Blekinge Institute of Technology (BTH)",
    subtitle: "LLM 代码理解 / AI4SE 评估",
    topics: ["LLM 代码理解与语义评估", "MazeBreaker 自适应评测", "AI4SE 开源生态与实证研究"],
  },
  {
    org: "SMU",
    name: "Singapore Management University (SMU)",
    subtitle: "LLM Agent / 执行效率",
    topics: ["LLM 编程智能体", "执行成本与延迟优化", "代码生成与程序修复评估"],
  },
];

const researchTags = [
  "代码智能体",
  "程序修复",
  "执行反馈",
  "仓库级基准",
  "变更影响分析",
  "原子提交",
  "OpenHarmony",
  "静态分析",
  "代码理解",
  "低资源语言",
];

const openSourceTools = [
  {
    name: "HapRay",
    href: "https://gitcode.com/SMAT/ArkAnalyzer-HapRay",
    description: "OpenHarmony 应用性能分析工具，用于检测 UI 中的 Phantom Rendering 问题。",
    meta: "FSE 2026 · GitCode",
  },
  {
    name: "HomeCheck",
    href: "https://gitcode.com/openharmony-sig/homecheck",
    description: "OpenHarmony 静态检查与自动修复工具，HapRepair 的核心模块。",
    meta: "FSE Industry 2025 · GitCode",
  },
  {
    name: "HomeTrans",
    href: "https://gitcode.com/SMAT/HomeTrans",
    description: "Android → OpenHarmony 应用迁移工具，辅助应用进入鸿蒙生态。",
    meta: "迁移工具 · GitCode",
  },
  {
    name: "ResearchClaw",
    href: "https://github.com/Noietch/ResearchClaw",
    description: "AI 驱动的科研桌面应用：文献管理、智能阅读笔记与 Research Idea 生成。",
    meta: "Electron + TypeScript · GitHub",
  },
  {
    name: "SkillLens",
    href: "https://github.com/mathieu0905/skilllens",
    description: "面向 Codex / Claude Code 的 SKILL 覆盖分析与优化框架。",
    meta: "Agent Skills · GitHub",
  },
];

const timeline = [
  {
    period: "2023 年底",
    body: "大四期间开始接触科研，加入 SMAT 实验室。",
  },
  {
    period: "2023.11",
    body: (
      <>
        第一篇论文投稿 ——{" "}
        <a
          href="https://arxiv.org/abs/2305.12138"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[color:var(--accent)] hover:underline"
        >
          开源 AI 软件工程工具的机遇与挑战
        </a>
        ，系统梳理 AI4SE 领域的开源生态现状。
      </>
    ),
  },
  {
    period: "2024",
    body: (
      <>
        第一篇论文被 <span className="font-medium text-[color:var(--ink)]">TOSEM</span> 接收 ——{" "}
        <a href="/papers/fse_2030.pdf" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">
          Open-Source AI-based SE Tools
        </a>
        ，覆盖 100+ 开源工具的全景式综述。
      </>
    ),
  },
  {
    period: "2024.09",
    body: "本科毕业，正式开始硕博连读；同期开启与华为、BTH 和 SMU 的合作研究。",
  },
  {
    period: "2025.03",
    body: "HapRepair 被 FSE Industry 2025 接收 —— 面向 OpenHarmony 生态的自动修复，从论文走向工程落地。",
  },
  {
    period: "2025.06",
    body: "MazeBreaker 被 ICSE 2026 接收 —— 用多智能体强化学习做自适应安全评估。",
  },
  {
    period: "2025 – 2026",
    body: "研究全面推进：Phantom Rendering（FSE 2026）、Cangjie 微调（EMSE 2026），以及围绕仓库级兼容性维护、变更影响分析与 OpenHarmony 迁移的多个在投工作。",
  },
];

const featuredWorks = [
  {
    title: "To Run or Not to Run",
    venue: "ISSTA 2026",
    topic: "程序修复",
    summary: "系统分析 LLM 程序修复智能体中的代码执行成本与收益，说明执行反馈应被当作有成本的资源，而不是默认动作。",
  },
  {
    title: "CodeAnchor",
    venue: "ISSTA 2026",
    topic: "Code Agent",
    summary: "研究轻量静态结构如何作为确定性锚点，提升代码智能体在真实仓库中的定位稳定性、复现性与导航效率。",
  },
  {
    title: "Phantom Rendering Detection",
    venue: "FSE 2026",
    topic: "性能分析",
    summary: "识别和分析 UI 中不必要的渲染计算，帮助开发者发现隐藏的性能瓶颈，提升移动应用流畅度。",
  },
  {
    title: "MazeBreaker",
    venue: "ICSE 2026",
    topic: "LLM 安全",
    summary: "提出多智能体强化学习框架，动态评估 LLM 安全防线的越狱漏洞，揭示现有防御机制的系统性弱点。",
  },
];

export default function Home() {
  return (
    <div className="site-shell">
      <main className="site-container py-16 pb-24 sm:py-20">
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                              */}
        {/* ------------------------------------------------------------------ */}
        <header className="border-b border-[color:var(--rule)] pb-12">
          <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-start sm:gap-9">
            <Image
              src="/avatar.jpg"
              alt="Zhihao Lin"
              width={120}
              height={120}
              className="h-[120px] w-[120px] flex-shrink-0 rounded-full object-cover object-top ring-1 ring-[color:var(--rule)]"
              priority
            />
            <div className="min-w-0">
              <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-[color:var(--ink)] sm:text-[2.35rem]">
                林智灏 <span className="text-[color:var(--ink-faint)]">Zhihao Lin</span>
              </h1>
              <p className="mt-2.5 text-[color:var(--ink-soft)]">
                北京航空航天大学 · SMAT 实验室 · 博士研究生
              </p>
              <p className="mt-1 text-[color:var(--ink-soft)]">
                研究方向：<span className="text-[color:var(--ink)]">AI for Software Engineering</span>
              </p>
              <div className="mt-5 flex items-center gap-4">
                <a
                  href="mailto:mathieulin@buaa.edu.cn"
                  className="text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
                  aria-label="Email"
                  title="mathieulin@buaa.edu.cn"
                >
                  <FaEnvelope size={17} />
                </a>
                <a
                  href="https://github.com/mathieu0905"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <FaGithub size={17} />
                </a>
                <a
                  href="https://scholar.google.co.uk/citations?user=iPrIsSUAAAAJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
                  aria-label="Google Scholar"
                  title="Google Scholar"
                >
                  <FaGoogleScholar size={17} />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* About                                                               */}
        {/* ------------------------------------------------------------------ */}
        <section id="about" className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">关于我</h2>
          <div className="space-y-5 leading-[1.85] text-[color:var(--ink-soft)]">
            <p>
              我是<a href="https://www.buaa.edu.cn/" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">北京航空航天大学</a>博士生，隶属于 SMAT 实验室，导师为
              <a href="https://scholar.google.com/citations?user=zuUsFkgAAAAJ" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">黎立</a>教授，
              副导师为<a href="https://scholar.google.com/citations?user=2emq9AoAAAAJ" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">周鸣一</a>。
            </p>

            <p>
              研究聚焦于 <span className="font-medium text-[color:var(--ink)]">AI for Software Engineering (AI4SE)</span>，
              将大语言模型、程序分析与可验证的软件工程环境结合，构建更可靠的代码智能体与生态工具链。
              工作横跨执行反馈、仓库级基准、变更影响分析、OpenHarmony 生态质量保障与低资源编程语言支持，
              但都围绕同一个核心：<em className="not-italic text-[color:var(--ink)]">让 AI 真正可靠地服务于软件工程实践</em>。
            </p>

            <div className="border-l-2 border-[color:var(--rule)] pl-5">
              <h3 className="mb-2 font-medium text-[color:var(--ink)]">研究动机</h3>
              <p>
                大语言模型已经展现出很强的代码生成能力，但真实软件工程并不只需要「写出补丁」：
                agent 还要理解仓库、选择证据、控制执行成本、维护变更历史，并在特定生态中经得起验证。
                我关注的核心问题是：<em className="not-italic text-[color:var(--ink)]">如何把 LLM 的生成能力、程序分析的确定性与真实软件工程环境结合起来，构建可靠的代码智能体与生态工具链？</em>
              </p>
              <p className="mt-3">
                在代码智能体场景中，分析执行反馈何时值得使用（<Link href="/papers/issta2026-to-run-or-not-to-run.pdf" className="text-[color:var(--accent)] hover:underline">To Run or Not to Run</Link>），
                并用轻量静态结构提升仓库导航稳定性（<Link href="/papers/issta2026-codeanchor.pdf" className="text-[color:var(--accent)] hover:underline">CodeAnchor</Link>）；
                在 OpenHarmony 生态中，把领域规则、静态分析、LLM 与真实反馈结合起来做修复、迁移和性能分析（<a href="https://doi.org/10.1145/3696630.3728556" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">HapRepair</a>、
                <Link href="/papers/hapray_fse.pdf" className="text-[color:var(--accent)] hover:underline">Phantom Rendering Detection</Link>）；
                在评估层面，系统分析 LLM 究竟理解了什么代码知识，以及 AI4SE 工具应该如何被可靠衡量。
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-[color:var(--ink)]">教育背景</h3>
              <dl className="space-y-2.5 text-sm">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="w-28 flex-shrink-0 text-[color:var(--ink-faint)]">2024 – 至今</dt>
                  <dd className="text-[color:var(--ink-soft)]">北京航空航天大学 · 计算机科学与技术 · 硕博连读</dd>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="w-28 flex-shrink-0 text-[color:var(--ink-faint)]">2019 – 2024</dt>
                  <dd className="text-[color:var(--ink-soft)]">北京航空航天大学 · 软件工程 · 本科</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* News                                                                */}
        {/* ------------------------------------------------------------------ */}
        <section id="news" className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">最新动态</h2>
          <ul className="space-y-3.5 text-sm">
            {sortedNews.slice(0, 9).map((item) => {
              if (item.type === "other") {
                return (
                  <li key={`${item.type}-${item.date}-${item.title.zh}`} className="flex gap-5">
                    <time className="w-20 flex-shrink-0 font-mono text-xs leading-6 text-[color:var(--ink-faint)]">
                      {item.date}
                    </time>
                    <div className="min-w-0 leading-6">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[color:var(--ink)] hover:text-[color:var(--accent)]">
                          {item.title.zh}
                        </a>
                      ) : (
                        <span className="text-[color:var(--ink)]">{item.title.zh}</span>
                      )}
                      {item.detail && (
                        <span className="ml-2 text-[color:var(--ink-faint)]">— {item.detail.zh}</span>
                      )}
                    </div>
                  </li>
                );
              }

              const paper = papers.find((p) => p.id === item.paperId);
              if (!paper) return null;
              const href = pdfHref(paper.pdfFile);

              return (
                <li key={`${item.type}-${item.date}-${item.paperId}`} className="flex gap-5">
                  <time className="w-20 flex-shrink-0 font-mono text-xs leading-6 text-[color:var(--ink-faint)]">
                    {item.date}
                  </time>
                  <div className="min-w-0 leading-6">
                    {href ? (
                      <a href={href} className="text-[color:var(--ink)] hover:text-[color:var(--accent)]">
                        {paper.title}
                      </a>
                    ) : (
                      <span className="text-[color:var(--ink)]">{paper.title}</span>
                    )}
                    {paper.venue && paper.year && (
                      <span className="ml-2 text-[color:var(--ink-faint)]">— {paper.venue} {paper.year}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Featured work                                                       */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">代表性工作</h2>
          <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {featuredWorks.map((work) => (
              <article key={work.title}>
                <div className="mb-1.5 flex items-center gap-2 text-xs text-[color:var(--ink-faint)]">
                  <span className="font-medium text-[color:var(--accent)]">{work.venue}</span>
                  <span aria-hidden="true">·</span>
                  <span>{work.topic}</span>
                </div>
                <h3 className="font-medium text-[color:var(--ink)]">{work.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink-soft)]">{work.summary}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Timeline                                                            */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">科研历程</h2>
          <ol className="space-y-4 text-sm">
            {timeline.map((entry) => (
              <li key={entry.period} className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                <span className="w-28 flex-shrink-0 font-mono text-xs leading-6 text-[color:var(--ink-faint)]">
                  {entry.period}
                </span>
                <span className="leading-6 text-[color:var(--ink-soft)]">{entry.body}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Research directions                                                 */}
        {/* ------------------------------------------------------------------ */}
        <section id="research" className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">研究方向</h2>
          <p className="mb-5 text-sm leading-relaxed text-[color:var(--ink-soft)]">
            四条主线共享同一个问题：如何让代码智能体在真实软件工程环境中既可靠又可验证。点击展开细节。
          </p>
          <AboutResearchDirectionsZh />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Research cards + tags                                               */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">研究主题</h2>
          <div className="mb-8 flex flex-wrap gap-2">
            {researchTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[color:var(--rule)] px-3 py-1 text-xs text-[color:var(--ink-soft)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <ResearchCards locale="zh" />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Publications                                                        */}
        {/* ------------------------------------------------------------------ */}
        <section id="publications" className="border-b border-[color:var(--rule)] py-10">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="section-label mb-0 flex-1">已接收论文</h2>
            <Link
              href="/papers"
              className="flex-shrink-0 text-xs text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
            >
              全部论文 →
            </Link>
          </div>
          <ul className="divide-y divide-[color:var(--rule)]">
            {acceptedPapers.map((paper) => {
              const href = pdfHref(paper.pdfFile);
              return (
                <li key={paper.id} className="flex items-baseline gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[color:var(--ink)]">{paper.title}</span>
                    {(paper.venue || paper.year) && (
                      <span className="ml-2 text-xs text-[color:var(--ink-faint)]">
                        {[paper.venue, paper.year].filter(Boolean).join(" ")}
                      </span>
                    )}
                  </div>
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
                </li>
              );
            })}
          </ul>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Open source                                                         */}
        {/* ------------------------------------------------------------------ */}
        <section id="tools" className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">开源工具</h2>
          <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {openSourceTools.map((tool) => (
              <a key={tool.name} href={tool.href} target="_blank" rel="noopener noreferrer" className="group block">
                <h3 className="font-medium text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent)]">
                  {tool.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink-soft)]">{tool.description}</p>
                <p className="mt-1.5 text-xs text-[color:var(--ink-faint)]">{tool.meta}</p>
              </a>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Collaboration                                                       */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">合作</h2>
          <div className="space-y-9">
            {collaborationGroups.map((group) => {
              const people = collaborators.filter((c) => c.org === group.org);
              return (
                <div key={group.org}>
                  <div className="mb-3">
                    <h3 className="font-medium text-[color:var(--ink)]">{group.name}</h3>
                    <p className="text-xs text-[color:var(--ink-faint)]">{group.subtitle}</p>
                  </div>
                  <div className="space-y-4">
                    {people.map((person) => (
                      <div key={person.name} className="text-sm">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <span className="font-medium text-[color:var(--ink)]">{person.name}</span>
                          {person.role && <span className="text-xs text-[color:var(--ink-faint)]">{person.role.zh}</span>}
                          {person.links?.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[color:var(--accent)] hover:underline"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                        {person.acknowledgement && (
                          <p className="mt-1 text-xs leading-relaxed text-[color:var(--ink-faint)]">
                            {person.acknowledgement.zh}
                          </p>
                        )}
                        {person.works && person.works.length > 0 && (
                          <ul className="mt-1.5 space-y-1 text-[color:var(--ink-soft)]">
                            {person.works.map((work) => (
                              <li key={work.zh} className="flex gap-2 leading-6">
                                <span className="text-[color:var(--ink-faint)]" aria-hidden="true">–</span>
                                <span>{work.zh}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[color:var(--ink-faint)]">
                    合作主题：{group.topics.join("、")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Beyond research                                                     */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">科研之外</h2>
          <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">
            平时喜欢运动，是陈奕迅和张敬轩的忠实歌迷，也爱玩 NBA 2K、FIFA 等体育类电子游戏。
            相信好的研究和好的生活一样，需要节奏感。
          </p>
        </section>

        <footer className="pt-10 text-xs text-[color:var(--ink-faint)]">
          <p>© 2024–2025 Zhihao Lin · Built with Next.js &amp; Tailwind CSS</p>
        </footer>
      </main>
    </div>
  );
}
