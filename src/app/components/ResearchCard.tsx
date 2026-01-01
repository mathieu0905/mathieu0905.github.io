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

const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", darkBg: "dark:bg-blue-900", darkText: "dark:text-blue-300" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", darkBg: "dark:bg-purple-900", darkText: "dark:text-purple-300" },
  green: { bg: "bg-green-100", text: "text-green-700", darkBg: "dark:bg-green-900", darkText: "dark:text-green-300" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700", darkBg: "dark:bg-yellow-900", darkText: "dark:text-yellow-300" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", darkBg: "dark:bg-orange-900", darkText: "dark:text-orange-300" },
  pink: { bg: "bg-pink-100", text: "text-pink-700", darkBg: "dark:bg-pink-900", darkText: "dark:text-pink-300" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-700", darkBg: "dark:bg-cyan-900", darkText: "dark:text-cyan-300" },
};

export function ResearchCards() {
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {researchProjects.map((project) => (
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
                {project.methods?.length ? `${project.methods.length} methods` : "More details"}
              </span>
              <span className="text-xs text-blue-500">Click for details →</span>
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
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Highlights</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {selectedProject.highlights.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {selectedProject.methods?.length ? (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Methods</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {selectedProject.methods.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {selectedProject.outcomes?.length ? (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Expected Outcomes</h4>
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
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Related Publications</h4>
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
