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
    outcomes: "Expected Outcomes",
    relatedPubs: "Related Publications",
    close: "Close",
  },
  zh: {
    methods: "个方法",
    moreDetails: "更多详情",
    clickDetails: "点击查看详情 →",
    highlights: "亮点",
    methodsTitle: "方法",
    outcomes: "预期成果",
    relatedPubs: "相关发表",
    close: "关闭",
  },
};

export const researchProjects: ResearchProject[] = [
  {
    id: "llm-code-understanding",
    title: "LLM Code Understanding",
    summary: "Investigating how LLMs comprehend code syntax and semantics for improved code analysis tasks.",
    highlights: [
      "What LLMs capture: syntax, flow cues, API intent",
      "How to evaluate: benchmarks + probing + task metrics",
    ],
    methods: ["Benchmark design", "Representation probing", "Agent-based evaluation"],
    outcomes: ["Datasets & evaluation suites", "Insights for SE tool building"],
    detail: `This direction studies how Large Language Models represent and reason about code structure and semantics, and how that impacts downstream SE tasks.

Key Research Questions:
• How do LLMs internally represent code syntax (AST, control flow)?
• What semantic information do LLMs capture from code context?
• How can we design better benchmarks to evaluate code understanding?

What we do (typical workflow):
• Design benchmarks that isolate specific capabilities (e.g., data-flow, API intent, invariants)
• Probe model representations and behaviors across tasks and prompts
• Build agent-based evaluations that simulate realistic tool usage

What you can expect to see:
• Curated datasets + evaluation suites
• Failure mode analysis to guide safer & more reliable SE tools`,
    tags: [{ label: "Code Intelligence", color: "blue" }],
    borderColor: "border-blue-500",
  },
  {
    id: "code-localization",
    title: "Intelligent Code Localization",
    summary: "Enhancing bug localization accuracy by integrating static analysis with LLM-based agents.",
    highlights: [
      "Hybrid signal: static facts (graphs/flows) + LLM exploration",
      "Goal: shrink search space and speed up debugging",
    ],
    methods: ["Static analysis (call/data flow)", "Agentic search", "Ranking & reranking"],
    outcomes: ["Reusable localization pipeline", "Case studies on large codebases"],
    detail: `Accurate fault localization is critical for efficient debugging. This project combines the strengths of traditional static analysis with modern LLM capabilities to reduce the search space in large codebases.

Research Focus:
• Integrating program analysis techniques (call graphs, data flow) with LLM reasoning
• Designing agent-based approaches for iterative code exploration
• Improving localization precision in large-scale codebases

How it works (high-level):
• Build a lightweight program slice / dependency view from static analysis
• Let an agent iteratively inspect candidates, ask targeted questions, and update hypotheses
• Rank suspicious entities (files/functions/lines) with explainable evidence

End goal:
• A practical pipeline that improves debugging speed and consistency on real projects`,
    tags: [{ label: "Fault Localization", color: "purple" }],
    borderColor: "border-purple-500",
  },
  {
    id: "openharmony-defect",
    title: "OpenHarmony Defect Detection",
    summary: "Extending automated repair tools with new defect detection capabilities for the OpenHarmony ecosystem.",
    highlights: [
      "Build on HapRepair for OpenHarmony app quality",
      "Defect detection rules for ArkTS/HarmonyOS APIs",
    ],
    methods: ["Rule mining", "Static analysis", "Repair & validation loops"],
    outcomes: ["Tooling for OpenHarmony ecosystem", "Engineering feedback from practice"],
    detail: `Building on our FSE 2025 work (HapRepair), we extend the line of work toward proactive defect detection and ecosystem-specific analysis for OpenHarmony applications.

Current Progress:
• Core repair framework published at FSE Industry 2025
• Developing new static analysis rules for OpenHarmony-specific defects
• Preparing journal extension for TOSEM

Why OpenHarmony is special:
• ArkTS language features and HarmonyOS API patterns
• App framework constraints and platform-specific lifecycle rules

What we build:
• Defect checkers and repair hints grounded in platform semantics
• Tooling that is easy to integrate into real engineering workflows`,
    tags: [
      { label: "Program Repair", color: "green" },
      { label: "Journal Extension", color: "yellow" },
    ],
    borderColor: "border-green-500",
    status: "Extending to TOSEM",
    relatedPapers: ["HapRepair (FSE Industry 2025)"],
  },
  {
    id: "change-impact",
    title: "Change Impact Analysis",
    summary: "Leveraging code knowledge graphs to analyze and predict the impact of code changes across large codebases.",
    highlights: [
      "Model dependencies beyond files: symbols, calls, data edges",
      "Predict ripple effects before merge / review",
    ],
    methods: ["Code knowledge graphs", "Graph traversal & learning", "Impact queries"],
    outcomes: ["Explainable impact reports", "Signals for CI/review prioritization"],
    detail: `Understanding how code changes propagate through a codebase is essential for safe software evolution.

Research Approach:
• Building unified code knowledge graphs that capture structural and semantic relationships
• Developing algorithms to trace change impact across module boundaries
• Evaluating on real-world large-scale software systems

This work aims to help developers understand the ripple effects of their changes before committing, reducing regression bugs and improving code review efficiency.`,
    tags: [{ label: "Impact Analysis", color: "orange" }],
    borderColor: "border-orange-500",
  },
  {
    id: "codebase-health",
    title: "Codebase Health Management",
    summary: "Exploring structured approaches to maintain codebase quality during iterative development.",
    highlights: [
      "Detect redundancy, dead code, and risky drift early",
      "Make maintenance measurable and automatable",
    ],
    methods: ["Static analysis", "Mining software repositories", "Quality dashboards"],
    outcomes: ["Health signals & alerts", "Maintenance recommendations"],
    detail: `As codebases evolve, technical debt accumulates. This research explores automated approaches to maintain code health.

Key Ideas:
• Treating codebases as structured databases for systematic analysis
• Identifying and removing dead/redundant code during development
• Balancing new feature development with codebase maintenance

We are developing techniques that integrate seamlessly into the development workflow, helping teams maintain high code quality without sacrificing velocity.`,
    tags: [{ label: "Code Quality", color: "pink" }],
    borderColor: "border-pink-500",
  },
  {
    id: "prompt-robustness",
    title: "Prompt Robustness",
    summary: "Addressing prompt degradation issues caused by model updates and temporal drift.",
    highlights: [
      "Detect when prompts silently degrade after model updates",
      "Automate prompt adaptation to keep behavior stable",
    ],
    methods: ["Regression testing for prompts", "Drift detection", "Prompt rewriting strategies"],
    outcomes: ["Stability benchmarks", "Tooling for prompt maintenance"],
    detail: `LLM-based tools often suffer from "prompt drift" - prompts that worked well with one model version may degrade with updates.

Research Problem:
• Model updates can silently break existing prompt-based applications
• Manual prompt tuning is time-consuming and doesn't scale
• Need automated approaches to maintain prompt effectiveness

We are investigating techniques to automatically detect and adapt prompts when model behavior changes, ensuring stable performance across model versions.`,
    tags: [{ label: "Prompt Engineering", color: "cyan" }],
    borderColor: "border-cyan-500",
  },
];

export const researchProjectsZh: ResearchProject[] = [
  {
    id: "llm-code-understanding",
    title: "LLM 代码理解",
    summary: "研究大语言模型如何理解代码语法和语义，以改进代码分析任务。",
    highlights: [
      "LLM 捕获的内容：语法、控制流、API 意图",
      "评估方式：基准测试 + 探针分析 + 任务指标",
    ],
    methods: ["基准设计", "表示探针", "基于 Agent 的评估"],
    outcomes: ["数据集与评估套件", "SE 工具构建的洞察"],
    detail: `该方向研究大语言模型如何表示和推理代码结构与语义，以及这如何影响下游软件工程任务。

核心研究问题：
• LLM 如何内部表示代码语法（AST、控制流）？
• LLM 从代码上下文中捕获了哪些语义信息？
• 如何设计更好的基准来评估代码理解能力？

典型工作流程：
• 设计隔离特定能力的基准（如数据流、API 意图、不变量）
• 跨任务和提示探测模型表示和行为
• 构建模拟真实工具使用的 Agent 评估

预期产出：
• 精选数据集 + 评估套件
• 失败模式分析，指导更安全可靠的 SE 工具`,
    tags: [{ label: "代码智能", color: "blue" }],
    borderColor: "border-blue-500",
  },
  {
    id: "code-localization",
    title: "智能代码定位",
    summary: "通过整合静态分析与基于 LLM 的 Agent 来提高缺陷定位准确性。",
    highlights: [
      "混合信号：静态事实（图/流）+ LLM 探索",
      "目标：缩小搜索空间，加速调试",
    ],
    methods: ["静态分析（调用/数据流）", "Agent 搜索", "排序与重排序"],
    outcomes: ["可复用的定位流程", "大型代码库案例研究"],
    detail: `准确的故障定位对高效调试至关重要。该项目结合传统静态分析与现代 LLM 能力，减少大型代码库中的搜索空间。

研究重点：
• 将程序分析技术（调用图、数据流）与 LLM 推理相结合
• 设计基于 Agent 的迭代代码探索方法
• 提高大规模代码库中的定位精度

工作原理：
• 从静态分析构建轻量级程序切片/依赖视图
• 让 Agent 迭代检查候选项，提出针对性问题，更新假设
• 用可解释的证据对可疑实体（文件/函数/行）进行排序

最终目标：
• 一个实用的流程，提高真实项目的调试速度和一致性`,
    tags: [{ label: "故障定位", color: "purple" }],
    borderColor: "border-purple-500",
  },
  {
    id: "openharmony-defect",
    title: "OpenHarmony 缺陷检测",
    summary: "为 OpenHarmony 生态系统扩展自动修复工具的缺陷检测能力。",
    highlights: [
      "基于 HapRepair 提升 OpenHarmony 应用质量",
      "针对 ArkTS/HarmonyOS API 的缺陷检测规则",
    ],
    methods: ["规则挖掘", "静态分析", "修复与验证循环"],
    outcomes: ["OpenHarmony 生态工具", "来自实践的工程反馈"],
    detail: `基于我们的 FSE 2025 工作（HapRepair），我们将研究扩展到 OpenHarmony 应用的主动缺陷检测和生态特定分析。

当前进展：
• 核心修复框架已发表于 FSE Industry 2025
• 正在开发针对 OpenHarmony 特定缺陷的新静态分析规则
• 准备 TOSEM 期刊扩展

OpenHarmony 的特殊性：
• ArkTS 语言特性和 HarmonyOS API 模式
• 应用框架约束和平台特定的生命周期规则

我们构建的内容：
• 基于平台语义的缺陷检查器和修复提示
• 易于集成到实际工程流程的工具`,
    tags: [
      { label: "程序修复", color: "green" },
      { label: "期刊扩展", color: "yellow" },
    ],
    borderColor: "border-green-500",
    status: "扩展至 TOSEM",
    relatedPapers: ["HapRepair (FSE Industry 2025)"],
  },
  {
    id: "change-impact",
    title: "变更影响分析",
    summary: "利用代码知识图谱分析和预测代码变更在大型代码库中的影响。",
    highlights: [
      "建模超越文件的依赖：符号、调用、数据边",
      "在合并/审查前预测连锁反应",
    ],
    methods: ["代码知识图谱", "图遍历与学习", "影响查询"],
    outcomes: ["可解释的影响报告", "CI/审查优先级信号"],
    detail: `理解代码变更如何在代码库中传播对安全的软件演进至关重要。

研究方法：
• 构建统一的代码知识图谱，捕获结构和语义关系
• 开发跨模块边界追踪变更影响的算法
• 在真实世界的大规模软件系统上评估

该工作旨在帮助开发者在提交前理解其变更的连锁效应，减少回归缺陷并提高代码审查效率。`,
    tags: [{ label: "影响分析", color: "orange" }],
    borderColor: "border-orange-500",
  },
  {
    id: "codebase-health",
    title: "代码库健康管理",
    summary: "探索在迭代开发过程中维护代码库质量的结构化方法。",
    highlights: [
      "及早检测冗余、死代码和风险漂移",
      "使维护可度量、可自动化",
    ],
    methods: ["静态分析", "软件仓库挖掘", "质量仪表板"],
    outcomes: ["健康信号与告警", "维护建议"],
    detail: `随着代码库演进，技术债务不断累积。该研究探索自动化方法来维护代码健康。

核心思路：
• 将代码库视为结构化数据库进行系统分析
• 在开发过程中识别和移除死代码/冗余代码
• 平衡新功能开发与代码库维护

我们正在开发无缝集成到开发流程的技术，帮助团队在不牺牲速度的情况下保持高代码质量。`,
    tags: [{ label: "代码质量", color: "pink" }],
    borderColor: "border-pink-500",
  },
  {
    id: "prompt-robustness",
    title: "提示词鲁棒性",
    summary: "解决模型更新和时间漂移导致的提示词退化问题。",
    highlights: [
      "检测模型更新后提示词的静默退化",
      "自动化提示词适配以保持行为稳定",
    ],
    methods: ["提示词回归测试", "漂移检测", "提示词重写策略"],
    outcomes: ["稳定性基准", "提示词维护工具"],
    detail: `基于 LLM 的工具经常遭受"提示词漂移"——在一个模型版本上运行良好的提示词可能在更新后退化。

研究问题：
• 模型更新可能静默破坏现有的基于提示词的应用
• 手动提示词调优耗时且不可扩展
• 需要自动化方法来维护提示词有效性

我们正在研究当模型行为变化时自动检测和适配提示词的技术，确保跨模型版本的稳定性能。`,
    tags: [{ label: "提示词工程", color: "cyan" }],
    borderColor: "border-cyan-500",
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
