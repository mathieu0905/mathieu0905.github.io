import Image from "next/image";
import Link from "next/link";
import { FaEnvelope, FaGithub, FaGoogleScholar } from "react-icons/fa6";
import { AboutResearchDirections } from "../components/AboutResearchDirections";
import { ResearchCards } from "../components/ResearchCard";
import { acceptedPapers, papers } from "@/data/papers";
import { sortedNews } from "@/data/news";
import { collaborators, type CollaboratorOrg } from "@/data/collaborators";

export const metadata = {
  title: "Zhihao Lin - Academic Homepage",
};

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
    name: "Huawei",
    subtitle: "OpenHarmony / mobile app quality",
    topics: ["OpenHarmony app repair", "Phantom Rendering / UI performance analysis", "Cangjie low-resource language fine-tuning"],
  },
  {
    org: "BTH",
    name: "Blekinge Institute of Technology (BTH)",
    subtitle: "LLM code understanding / AI4SE evaluation",
    topics: ["LLM code understanding and semantic evaluation", "MazeBreaker adaptive evaluation", "AI4SE open-source ecosystem studies"],
  },
  {
    org: "SMU",
    name: "Singapore Management University (SMU)",
    subtitle: "LLM agents / execution efficiency",
    topics: ["LLM coding agents", "Execution cost and latency optimization", "Code generation and repair evaluation"],
  },
];

const researchTags = [
  "Coding Agents",
  "Program Repair",
  "Execution Feedback",
  "Repo-Scale Benchmarks",
  "Change Impact Analysis",
  "Atomic Commits",
  "OpenHarmony",
  "Static Analysis",
  "Code Understanding",
  "Low-resource Languages",
];

const openSourceTools = [
  {
    name: "HapRay",
    href: "https://gitcode.com/SMAT/ArkAnalyzer-HapRay",
    description: "Performance analysis tool for OpenHarmony apps, detecting Phantom Rendering issues in UI.",
    meta: "FSE 2026 · GitCode",
  },
  {
    name: "HomeCheck",
    href: "https://gitcode.com/openharmony-sig/homecheck",
    description: "Static checker and auto-repair tool for OpenHarmony apps; core module of HapRepair.",
    meta: "FSE Industry 2025 · GitCode",
  },
  {
    name: "HomeTrans",
    href: "https://gitcode.com/SMAT/HomeTrans",
    description: "Android → OpenHarmony migration tool, helping apps enter the HarmonyOS ecosystem.",
    meta: "Migration tool · GitCode",
  },
  {
    name: "ResearchClaw",
    href: "https://github.com/Noietch/ResearchClaw",
    description: "AI-powered research desktop app: literature management, smart reading notes, and idea generation.",
    meta: "Electron + TypeScript · GitHub",
  },
  {
    name: "SkillLens",
    href: "https://github.com/mathieu0905/skilllens",
    description: "SKILL coverage and optimization framework for Codex / Claude Code agent traces.",
    meta: "Agent Skills · GitHub",
  },
];

const featuredWorks = [
  {
    title: "To Run or Not to Run",
    venue: "ISSTA 2026",
    topic: "Program Repair",
    summary: "Analyzes the cost and benefit of code execution in LLM-based repair, arguing that execution feedback is a costly resource rather than a default action.",
  },
  {
    title: "CodeAnchor",
    venue: "ISSTA 2026",
    topic: "Code Agents",
    summary: "Studies how lightweight static structure acts as deterministic anchors, improving localization stability, reproducibility, and navigation efficiency in real repositories.",
  },
  {
    title: "Phantom Rendering Detection",
    venue: "FSE 2026",
    topic: "Performance",
    summary: "Identifies unnecessary UI computations so developers can find hidden performance bottlenecks and improve mobile app smoothness.",
  },
  {
    title: "MazeBreaker",
    venue: "ICSE 2026",
    topic: "LLM Security",
    summary: "Proposes a multi-agent reinforcement learning framework that dynamically evaluates jailbreak vulnerabilities in LLM safety defenses.",
  },
];

const timeline = [
  {
    period: "Late 2023",
    body: "Started research as an undergraduate and joined the SMAT Laboratory.",
  },
  {
    period: "2023.11",
    body: (
      <>
        First submission —{" "}
        <a href="https://arxiv.org/abs/2305.12138" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">
          Open-Source AI-based SE Tools
        </a>
        , a survey of the AI4SE open-source ecosystem.
      </>
    ),
  },
  {
    period: "2024",
    body: (
      <>
        First paper accepted at <span className="font-medium text-[color:var(--ink)]">TOSEM</span> — a panoramic survey covering 100+ open-source tools.
      </>
    ),
  },
  {
    period: "2024.09",
    body: "Graduated and began the combined M.S.–Ph.D. program; started collaborations with Huawei, BTH, and SMU.",
  },
  {
    period: "2025.03",
    body: "HapRepair accepted at FSE Industry 2025 — automated repair for the OpenHarmony ecosystem, from paper to engineering.",
  },
  {
    period: "2025.06",
    body: "MazeBreaker accepted at ICSE 2026 — adaptive security evaluation with multi-agent reinforcement learning.",
  },
  {
    period: "2025 – 2026",
    body: "Research expands: Phantom Rendering (FSE 2026), Cangjie fine-tuning (EMSE 2026), and several submissions on repository-scale compatibility maintenance, change impact analysis, and OpenHarmony migration.",
  },
];

export default function Home() {
  return (
    <div className="site-shell">
      <main className="site-container pb-24 pt-16 sm:pt-20">
        {/* Header */}
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
                Zhihao Lin
              </h1>
              <p className="mt-2.5 text-[color:var(--ink-soft)]">
                Ph.D. Student · Beihang University · SMAT Laboratory
              </p>
              <p className="mt-1 text-[color:var(--ink-soft)]">
                Research: <span className="text-[color:var(--ink)]">AI for Software Engineering</span>
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

        {/* About */}
        <section id="about" className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">About</h2>
          <div className="space-y-5 leading-[1.85] text-[color:var(--ink-soft)]">
            <p>
              I am a Ph.D. student at{" "}
              <a href="https://www.buaa.edu.cn/" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">
                Beihang University
              </a>
              , working in the SMAT Laboratory under Prof.{" "}
              <a href="https://scholar.google.com/citations?user=zuUsFkgAAAAJ" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">
                Li Li
              </a>
              , co-supervised by{" "}
              <a href="https://scholar.google.com/citations?user=2emq9AoAAAAJ" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">
                Mingyi Zhou
              </a>
              .
            </p>

            <p>
              My research focuses on{" "}
              <span className="font-medium text-[color:var(--ink)]">AI for Software Engineering (AI4SE)</span>, combining
              large language models, program analysis, and verifiable software-engineering environments to build reliable
              coding agents and ecosystem toolchains. The work spans execution feedback, repository-scale benchmarks,
              change impact analysis, OpenHarmony quality assurance, and low-resource programming languages — all around
              one core question:{" "}
              <em className="not-italic text-[color:var(--ink)]">how to make AI genuinely reliable for software engineering practice</em>.
            </p>

            <div className="border-l-2 border-[color:var(--rule)] pl-5">
              <h3 className="mb-2 font-medium text-[color:var(--ink)]">Motivation</h3>
              <p>
                LLMs already generate code well, but real software engineering is not only about writing a patch: an agent
                must understand repositories, select evidence, control execution cost, maintain change history, and survive
                verification in a specific ecosystem. My central question is{" "}
                <em className="not-italic text-[color:var(--ink)]">
                  how to combine LLM generation, the determinism of program analysis, and real software-engineering
                  environments into reliable coding agents and ecosystem toolchains
                </em>.
              </p>
              <p className="mt-3">
                In coding agents, this means analyzing when execution feedback is worth its cost (
                <Link href="/papers/issta2026-to-run-or-not-to-run.pdf" className="text-[color:var(--accent)] hover:underline">
                  To Run or Not to Run
                </Link>
                ) and using lightweight static structure to stabilize repository navigation (
                <Link href="/papers/issta2026-codeanchor.pdf" className="text-[color:var(--accent)] hover:underline">
                  CodeAnchor
                </Link>
                ). In the OpenHarmony ecosystem, it means combining domain rules, static analysis, LLMs, and real feedback
                for repair, migration, and performance analysis (
                <a href="https://doi.org/10.1145/3696630.3728556" target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] hover:underline">
                  HapRepair
                </a>
                ,{" "}
                <Link href="/papers/hapray_fse.pdf" className="text-[color:var(--accent)] hover:underline">
                  Phantom Rendering Detection
                </Link>
                ). On the evaluation side, it means systematically examining what code knowledge LLMs actually understand
                and how AI4SE tools should be measured.
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-[color:var(--ink)]">Education</h3>
              <dl className="space-y-2.5 text-sm">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="w-28 flex-shrink-0 text-[color:var(--ink-faint)]">2024 – present</dt>
                  <dd className="text-[color:var(--ink-soft)]">Beihang University · Computer Science · M.S.–Ph.D. program</dd>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="w-28 flex-shrink-0 text-[color:var(--ink-faint)]">2019 – 2024</dt>
                  <dd className="text-[color:var(--ink-soft)]">Beihang University · Software Engineering · B.Eng.</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* News */}
        <section id="news" className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">News</h2>
          <ul className="space-y-3.5 text-sm">
            {sortedNews.slice(0, 9).map((item) => {
              if (item.type === "other") {
                return (
                  <li key={`${item.type}-${item.date}-${item.title.en}`} className="flex gap-5">
                    <time className="w-20 flex-shrink-0 font-mono text-xs leading-6 text-[color:var(--ink-faint)]">
                      {item.date}
                    </time>
                    <div className="min-w-0 leading-6">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[color:var(--ink)] hover:text-[color:var(--accent)]">
                          {item.title.en}
                          {item.link.startsWith("/blog/") && (
                            <span className="ml-1.5 text-xs text-[color:var(--ink-faint)]">(Chinese)</span>
                          )}
                        </a>
                      ) : (
                        <span className="text-[color:var(--ink)]">{item.title.en}</span>
                      )}
                      {item.detail && <span className="ml-2 text-[color:var(--ink-faint)]">— {item.detail.en}</span>}
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

        {/* Selected work */}
        <section className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">Selected Work</h2>
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

        {/* Timeline */}
        <section className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">Timeline</h2>
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

        {/* Research directions */}
        <section id="research" className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">Research Directions</h2>
          <p className="mb-5 text-sm leading-relaxed text-[color:var(--ink-soft)]">
            Four threads sharing one question: how to make coding agents both reliable and verifiable in real
            software-engineering environments. Click to expand.
          </p>
          <AboutResearchDirections />
        </section>

        {/* Research themes */}
        <section className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">Research Themes</h2>
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
          <ResearchCards />
        </section>

        {/* Publications */}
        <section id="publications" className="border-b border-[color:var(--rule)] py-10">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="section-label mb-0 flex-1">Accepted Papers</h2>
            <Link href="/en/papers" className="flex-shrink-0 text-xs text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]">
              All papers →
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
                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-xs text-[color:var(--accent)] hover:underline">
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

        {/* Open source */}
        <section id="tools" className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">Open Source</h2>
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

        {/* Collaborations */}
        <section className="border-b border-[color:var(--rule)] py-10">
          <h2 className="section-label">Collaborations</h2>
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
                          {person.role && <span className="text-xs text-[color:var(--ink-faint)]">{person.role.en}</span>}
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
                            {person.acknowledgement.en}
                          </p>
                        )}
                        {person.works && person.works.length > 0 && (
                          <ul className="mt-1.5 space-y-1 text-[color:var(--ink-soft)]">
                            {person.works.map((work) => (
                              <li key={work.en} className="flex gap-2 leading-6">
                                <span className="text-[color:var(--ink-faint)]" aria-hidden="true">–</span>
                                <span>{work.en}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[color:var(--ink-faint)]">
                    Topics: {group.topics.join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="pt-10 text-xs text-[color:var(--ink-faint)]">
          <p>© 2024–2025 Zhihao Lin · Built with Next.js &amp; Tailwind CSS</p>
        </footer>
      </main>
    </div>
  );
}
