"use client";

import { useState } from "react";

interface ResearchProject {
  id: string;
  title: string;
  summary: string;
  detail: string;
  highlights?: string[];
  methods?: string[];
  outcomes?: string[];
  tags: { label: string; color: string }[];
  borderColor: string;
  status?: string;
  relatedPapers?: string[];
}

const uiText = {
  en: {
    methods: "methods",
    moreDetails: "More details",
    clickDetails: "Click for details →",
    highlights: "Highlights",
    methodsTitle: "Methods",
    outcomes: "Outputs",
    relatedPubs: "Representative Works",
    close: "Close",
  },
  zh: {
    methods: "个方法",
    moreDetails: "更多详情",
    clickDetails: "点击查看详情 →",
    highlights: "亮点",
    methodsTitle: "方法",
    outcomes: "产出",
    relatedPubs: "代表性工作",
    close: "关闭",
  },
};

export const researchProjects: ResearchProject[] = [
  {
    id: "coding-agent-change",
    title: "Coding Agents for Software Change",
    summary: "Measuring how coding agents choose context, execution, repository relations, and history organization when making real code changes.",
    highlights: [
      "Execution, static anchors, impact relations, and commit structure are measurable design choices",
      "Process quality matters alongside final patch correctness",
    ],
    methods: ["Agent trace analysis", "Controlled experiments", "Repository mining", "Static-analysis signals"],
    outcomes: ["Agent design guidelines", "Process-quality metrics", "Reusable benchmarks"],
    detail: `This is the center of my current work. Instead of treating a coding agent as a monolithic black box, I study the decisions around it: which context it sees, when it executes code, how it traces change impact, and whether the final patch leaves a maintainable history.

Published and mature work in this line includes:
• CodeAnchor studies whether lightweight static structure can discipline repository navigation.
• To Run or Not to Run studies when code execution is worth its cost in LLM-based repair.
• EAGER explores execution latency in LLM code generation.

Several current submissions extend the same question to commit-time change impact and atomic change history. I keep those unpublished systems off the public list, but they shape the line: reliable agents should gather evidence, spend execution budget carefully, and leave software changes that humans and future agents can inspect.`,
    tags: [
      { label: "Code Agents", color: "blue" },
      { label: "Program Repair", color: "green" },
    ],
    borderColor: "border-blue-500",
    relatedPapers: ["CodeAnchor (ISSTA 2026)", "To Run or Not to Run (ISSTA 2026)", "EAGER (manuscript)"],
  },
  {
    id: "repo-scale-verifiable-environments",
    title: "Repository-Scale Benchmarks and Verifiable SWE Environments",
    summary: "Building low-leakage, execution-backed tasks where agents must repair, migrate, or rescue real repositories under observable constraints.",
    highlights: [
      "Whole-repository tasks expose failures that file-level benchmarks miss",
      "Source-only checks, runtime blocking, and scenario validation make evaluation harder to game",
    ],
    methods: ["Benchmark construction", "Execution harnesses", "Source-only validation", "Failure taxonomy"],
    outcomes: ["Repo-scale task suites", "Verifier protocols", "Evidence for agent training and evaluation"],
    detail: `This line turns realistic software evolution into measurable environments. The goal is not only to ask whether an agent can produce a passing patch, but whether it can operate under constraints that resemble reuse: source code should be repaired instead of tests edited, compatibility should survive ecosystem drift, and domain tasks should be executable enough to support future training and evaluation.

It is informed by ongoing work on compatibility rescue, low-leakage SWE-style environments, and OpenHarmony task construction. Those submissions are not listed here by title before publication, but the public through-line connects to To Run or Not to Run, CodeAnchor, HapRepair, and HomeTrans: all of them ask what evidence, execution, and domain constraints are needed before we trust an automated software change.`,
    tags: [
      { label: "Benchmarks", color: "purple" },
      { label: "Verifiable SWE", color: "orange" },
    ],
    borderColor: "border-purple-500",
    relatedPapers: ["To Run or Not to Run (ISSTA 2026)", "CodeAnchor (ISSTA 2026)", "HapRepair (FSE Industry 2025)", "HomeTrans (tool)"],
  },
  {
    id: "openharmony-toolchains",
    title: "OpenHarmony and Emerging-Language Toolchains",
    summary: "Building ecosystem-aware analysis, repair, migration, performance, and program-analysis infrastructure for OpenHarmony, ArkTS, and Cangjie.",
    highlights: [
      "From app repair and UI performance to Android migration and OpenHarmony-specific static analysis",
      "Emerging ecosystems make domain knowledge, executable feedback, and low-resource adaptation central",
    ],
    methods: ["Domain rule mining", "ArkTS static analysis", "LLM adaptation", "Rendered UI evaluation"],
    outcomes: ["OpenHarmony tools", "Domain datasets", "Migration and quality workflows"],
    detail: `This line focuses on domains where general-purpose SE techniques are not enough. OpenHarmony, ArkTS, and Cangjie introduce ecosystem-specific APIs, framework rules, migration needs, low-resource language challenges, and static-analysis gaps.

Representative works form a coherent tool-oriented thread:
• HapRepair repairs OpenHarmony apps with domain rules and LLM guidance.
• Phantom Rendering Detection identifies unnecessary UI computations.
• Cangjie fine-tuning studies LLM adaptation for a low-resource programming language.
• HomeTrans supports Android-to-OpenHarmony migration.

Current work also extends this line toward state-grounded UI migration, OpenHarmony SWE environments, and LLM-guided program analysis. The emphasis is on research that can survive contact with real ecosystems: precise enough for papers, but useful enough to become tools.`,
    tags: [
      { label: "OpenHarmony", color: "green" },
      { label: "Domain SE", color: "yellow" },
    ],
    borderColor: "border-green-500",
    relatedPapers: ["HapRepair (FSE Industry 2025)", "Phantom Rendering Detection (FSE 2026)", "Cangjie Fine-tuning (EMSE 2026)", "HomeTrans (tool)"],
  },
  {
    id: "code-understanding-ai4se-measurement",
    title: "Code Understanding, Program Analysis, and AI4SE Measurement",
    summary: "Evaluating what LLMs understand about code and designing measurement protocols for AI-based SE tools and LLM-in-the-loop systems.",
    highlights: [
      "Capability claims should be tied to syntax, static behavior, dynamic behavior, and tool failure modes",
      "Evaluation protocols need human audit, leakage control, and failure-mode analysis",
    ],
    methods: ["Capability probing", "Empirical surveys", "Human-audited evaluation", "Benchmark critique"],
    outcomes: ["Capability maps", "Evaluation protocols", "Guidelines for AI4SE tools"],
    detail: `This line studies the foundations underneath LLM-based software engineering tools. Before using LLMs as programmers, reviewers, analyzers, or agents, we need to know what they actually understand about code and how to evaluate that understanding.

The work is grounded in:
• Exploring Code Analysis, which evaluates LLMs across syntax, static behavior, and dynamic behavior.
• Open-Source AI-based SE Tools, which surveys the AI4SE tool ecosystem and its practical challenges.
• MazeBreaker, a completed adaptive-evaluation thread that informs how I think about robustness measurement, even though LLM safety is no longer my main forward direction.

This direction provides the measurement layer for the rest of my research: it helps explain why certain agent designs work, where they fail, and what evidence is needed for reliable claims.`,
    tags: [
      { label: "Code Intelligence", color: "cyan" },
      { label: "Evaluation", color: "orange" },
    ],
    borderColor: "border-cyan-500",
    relatedPapers: ["Exploring Code Analysis (TOSEM 2026)", "Open-Source AI-based SE Tools (TOSEM 2024)", "MazeBreaker (ICSE 2026)"],
  },
];

export const researchProjectsZh: ResearchProject[] = [
  {
    id: "coding-agent-change",
    title: "代码智能体与软件变更过程",
    summary: "研究代码智能体在真实修改中如何选择上下文、执行反馈、仓库关系证据与提交组织方式。",
    highlights: [
      "执行、静态锚点、影响关系和提交结构都是可量化的设计选择",
      "除了最终补丁是否通过，还要评估 agent 留下的过程质量",
    ],
    methods: ["Agent 轨迹分析", "受控实验", "软件仓库挖掘", "静态分析信号"],
    outcomes: ["代码智能体设计原则", "过程质量度量", "可复用基准"],
    detail: `这是我目前最核心的一条研究主线。它不把代码智能体当成一个不可拆的黑盒，而是研究它周围那些真正决定可靠性的动作：看什么上下文、什么时候执行代码、如何追踪变更影响、最终补丁是否留下可维护的历史。

已经成熟或公开的代表性工作包括：
• CodeAnchor 研究轻量静态结构能否约束和稳定 agent 的仓库导航。
• To Run or Not to Run 研究 LLM 程序修复中执行反馈的成本与收益。
• EAGER 研究 LLM 代码生成中的执行延迟隐藏。

几篇正在投稿的工作会把这条线继续推进到提交时变更影响分析和原子化变更历史重构。主页暂时不直接挂未公开系统标题，但它们已经塑造了这条主线：可靠 agent 不只是会改代码，还应该会收集证据、控制执行预算，并留下人和后续 agent 都能理解的修改过程。`,
    tags: [
      { label: "代码智能体", color: "blue" },
      { label: "程序修复", color: "green" },
    ],
    borderColor: "border-blue-500",
    relatedPapers: ["CodeAnchor (ISSTA 2026)", "To Run or Not to Run (ISSTA 2026)", "EAGER (manuscript)"],
  },
  {
    id: "repo-scale-verifiable-environments",
    title: "仓库级基准与可验证 SWE 环境",
    summary: "构建低泄漏、可执行、有约束的真实软件工程任务，让 agent 在仓库级修复、迁移和兼容性维护中接受评估。",
    highlights: [
      "仓库级任务能暴露文件级 benchmark 看不到的失败模式",
      "source-only 检查、运行时阻断和场景验证可以减少指标投机",
    ],
    methods: ["基准构建", "执行环境设计", "source-only 验证", "失败模式分类"],
    outcomes: ["仓库级任务集", "验证协议", "agent 训练与评估证据"],
    detail: `这条主线把真实软件演化问题转化成可度量的环境。它不只问 agent 能不能给出一个通过测试的补丁，还问它能不能在接近真实复用的约束下工作：应该修源码而不是改测试，兼容性应该经得起生态漂移，领域任务也应该足够可执行，未来能支撑训练和评估。

这条线受到正在进行的兼容性救援、低泄漏 SWE-style 环境和 OpenHarmony 任务构建工作的影响。未发表投稿暂时不在主页列标题，但它们和 To Run or Not to Run、CodeAnchor、HapRepair、HomeTrans 的共同点很清楚：在相信一个自动软件变更之前，我们需要知道它用了什么证据、怎样执行验证、受到了哪些领域约束。`,
    tags: [
      { label: "仓库级基准", color: "purple" },
      { label: "可验证 SWE", color: "orange" },
    ],
    borderColor: "border-purple-500",
    relatedPapers: ["To Run or Not to Run (ISSTA 2026)", "CodeAnchor (ISSTA 2026)", "HapRepair (FSE Industry 2025)", "HomeTrans (工具)"],
  },
  {
    id: "openharmony-toolchains",
    title: "OpenHarmony 与新生语言工具链",
    summary: "面向 OpenHarmony、ArkTS 和 Cangjie 构建生态感知的分析、修复、迁移、性能和程序分析基础设施。",
    highlights: [
      "从应用修复、UI 性能到 Android 迁移和 OpenHarmony 静态分析",
      "新生生态让领域知识、可执行反馈和低资源语言适配变得格外关键",
    ],
    methods: ["领域规则挖掘", "ArkTS 静态分析", "LLM 适配", "渲染/UI 评估"],
    outcomes: ["OpenHarmony 工具链", "领域数据集", "迁移与质量保障流程"],
    detail: `这条主线关注通用软件工程技术不够用的场景。OpenHarmony、ArkTS 和 Cangjie 带来了生态特定 API、框架规则、迁移需求、低资源语言挑战和静态分析缺口。

代表性工作形成了一条比较清晰的工具线：
• HapRepair 用领域规则和 LLM 引导修复 OpenHarmony 应用。
• Phantom Rendering Detection 检测 UI 中不必要的渲染计算。
• Cangjie 微调研究低资源编程语言场景下的 LLM 适配。
• HomeTrans 支持 Android 到 OpenHarmony 的应用迁移。

当前工作还会继续延伸到状态感知 UI 迁移、OpenHarmony SWE 环境和 LLM 辅助程序分析。这条主线强调能经得起真实生态检验的研究：既能写成论文，也能沉淀为工具。`,
    tags: [
      { label: "OpenHarmony", color: "green" },
      { label: "生态工具链", color: "yellow" },
    ],
    borderColor: "border-green-500",
    relatedPapers: ["HapRepair (FSE Industry 2025)", "Phantom Rendering Detection (FSE 2026)", "Cangjie Fine-tuning (EMSE 2026)", "HomeTrans (工具)"],
  },
  {
    id: "code-understanding-ai4se-measurement",
    title: "代码理解、程序分析与 AI4SE 度量",
    summary: "评估 LLM 到底理解了什么代码知识，并为 AI 软件工程工具和 LLM-in-the-loop 系统设计更可靠的评测协议。",
    highlights: [
      "能力声明应该落到语法、静态行为、动态行为和工具失败模式上",
      "评测协议需要人工审计、泄漏控制和失败模式分析",
    ],
    methods: ["能力探针", "工具生态实证研究", "人工审计评估", "基准批判"],
    outcomes: ["能力图谱", "评估协议", "AI4SE 工具设计建议"],
    detail: `这条主线研究 LLM 软件工程工具的基础问题：在把 LLM 当作程序员、审查者、分析器或智能体之前，我们需要知道它到底理解了什么代码知识，以及如何评价这种理解。

这里对应三条已有工作线：
• Exploring Code Analysis 从语法、静态行为、动态行为三个层面评估 LLM 的代码理解。
• Open-Source AI-based SE Tools 梳理 AI4SE 开源工具生态和实际挑战。
• MazeBreaker 是一条已经完成的自适应评估工作，它影响了我对鲁棒性度量的理解，但 LLM 安全不再是我后续的主要推进方向。

这条主线为其他工作提供测量层：它解释为什么某些 agent 设计有效、在哪里会失败、什么证据才足以支撑可靠结论。`,
    tags: [
      { label: "代码理解", color: "cyan" },
      { label: "评估", color: "orange" },
    ],
    borderColor: "border-cyan-500",
    relatedPapers: ["Exploring Code Analysis (TOSEM 2026)", "Open-Source AI-based SE Tools (TOSEM 2024)", "MazeBreaker (ICSE 2026)"],
  },
];

const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", darkBg: "dark:bg-blue-900", darkText: "dark:text-blue-300" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", darkBg: "dark:bg-purple-900", darkText: "dark:text-purple-300" },
  green: { bg: "bg-green-100", text: "text-green-700", darkBg: "dark:bg-green-900", darkText: "dark:text-green-300" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700", darkBg: "dark:bg-yellow-900", darkText: "dark:text-yellow-300" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", darkBg: "dark:bg-orange-900", darkText: "dark:text-orange-300" },
  pink: { bg: "bg-pink-100", text: "text-pink-700", darkBg: "dark:bg-pink-900", darkText: "dark:text-pink-300" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-700", darkBg: "dark:bg-cyan-900", darkText: "dark:text-cyan-300" },
};

export function ResearchCards({ locale = "en" }: { locale?: "en" | "zh" }) {
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const projects = locale === "zh" ? researchProjectsZh : researchProjects;
  const t = uiText[locale];

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-l-4 ${project.borderColor} cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center gap-2 mb-2">
              {project.tags.map((tag) => {
                const colors = colorMap[tag.color];
                return (
                  <span
                    key={tag.label}
                    className={`px-2 py-0.5 ${colors.bg} ${colors.darkBg} ${colors.text} ${colors.darkText} rounded text-xs`}
                  >
                    {tag.label}
                  </span>
                );
              })}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{project.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{project.summary}</p>
            {project.highlights && project.highlights.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {project.highlights.slice(0, 2).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {project.relatedPapers && project.relatedPapers.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">{t.relatedPubs}</div>
                <div className="flex flex-wrap gap-1.5">
                  {project.relatedPapers.slice(0, 2).map((paper) => (
                    <span
                      key={paper}
                      className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[11px] text-gray-600 dark:text-gray-300"
                    >
                      {paper}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {project.methods?.length ? `${project.methods.length} ${t.methods}` : t.moreDetails}
              </span>
              <span className="text-xs text-blue-500">{t.clickDetails}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-6 border-b border-gray-200 dark:border-gray-700 border-l-4 ${selectedProject.borderColor} rounded-t-2xl`}>
              <div className="flex items-center gap-2 mb-3">
                {selectedProject.tags.map((tag) => {
                  const colors = colorMap[tag.color];
                  return (
                    <span
                      key={tag.label}
                      className={`px-2 py-0.5 ${colors.bg} ${colors.darkBg} ${colors.text} ${colors.darkText} rounded text-xs`}
                    >
                      {tag.label}
                    </span>
                  );
                })}
                {selectedProject.status && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                    {selectedProject.status}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProject.title}</h2>
            </div>
            <div className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                {selectedProject.detail.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
              {(selectedProject.highlights?.length || selectedProject.methods?.length || selectedProject.outcomes?.length) && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedProject.highlights?.length ? (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t.highlights}</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {selectedProject.highlights.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {selectedProject.methods?.length ? (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t.methodsTitle}</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {selectedProject.methods.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {selectedProject.outcomes?.length ? (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t.outcomes}</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {selectedProject.outcomes.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
              {selectedProject.relatedPapers && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t.relatedPubs}</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedProject.relatedPapers.map((paper) => (
                      <li key={paper}>• {paper}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
