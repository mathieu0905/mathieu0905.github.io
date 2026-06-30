"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface Direction {
  id: string;
  icon: string;
  title: string;
  summary: string;
  cardClassName: string;
  detail: string;
  focus: string[];
  methods: string[];
  outputs: string[];
  related?: { label: string; href: string }[];
}

export function AboutResearchDirections() {
  const directions = useMemo<Direction[]>(
    () => [
      {
        id: "coding-agent-change",
        icon: "⚙️",
        title: "Coding Agents for Software Change",
        summary: "Execution feedback, static anchors, impact relations, and change-history quality for repository-level agents.",
        cardClassName: "bg-blue-50 dark:bg-blue-900/30",
        detail:
          "This direction studies coding agents as software-change systems rather than only patch generators. I measure how execution, repository structure, impact relations, and commit organization affect reliability and maintainability.",
        focus: [
          "When execution feedback is worth its cost",
          "How static structure stabilizes repository navigation",
          "How agents reason about change impact and patch history",
          "Process quality beyond final test passing",
        ],
        methods: ["Agent trace analysis", "Controlled ablations", "Repository mining", "Static-analysis signals"],
        outputs: ["Design guidelines", "Process-quality metrics", "Benchmarks for agent behavior"],
        related: [
          { label: "CodeAnchor (ISSTA 2026)", href: "/papers/issta2026-codeanchor.pdf" },
          { label: "To Run or Not to Run (ISSTA 2026)", href: "/papers/issta2026-to-run-or-not-to-run.pdf" },
        ],
      },
      {
        id: "repo-scale-envs",
        icon: "🧪",
        title: "Repo-Scale Benchmarks & SWE Environments",
        summary: "Low-leakage, execution-backed tasks for repair, migration, compatibility rescue, and domain-specific SWE agents.",
        cardClassName: "bg-purple-50 dark:bg-purple-900/30",
        detail:
          "This direction turns realistic software evolution into verifiable environments. The goal is to evaluate agents under source-only checks, runtime constraints, scenario validation, and domain-specific execution feedback.",
        focus: [
          "Whole-repository tasks beyond file-level benchmarks",
          "Compatibility and ecosystem-drift repair",
          "OpenHarmony-style domain SWE environments",
          "Verifier and leakage-control protocol design",
        ],
        methods: ["Benchmark construction", "Execution harnesses", "Source-only validation", "Failure taxonomy"],
        outputs: ["Repo-scale task suites", "Verifier protocols", "Evidence for agent training"],
        related: [
          { label: "To Run or Not to Run (ISSTA 2026)", href: "/papers/issta2026-to-run-or-not-to-run.pdf" },
          { label: "HapRepair (FSE Industry 2025)", href: "https://doi.org/10.1145/3696630.3728556" },
        ],
      },
      {
        id: "openharmony-toolchains",
        icon: "📱",
        title: "OpenHarmony & Emerging-Language Toolchains",
        summary: "Ecosystem-aware repair, migration, performance analysis, and program-analysis infrastructure for ArkTS and Cangjie.",
        cardClassName: "bg-green-50 dark:bg-green-900/30",
        detail:
          "This direction builds tools for ecosystems where general-purpose SE techniques are not enough. OpenHarmony, ArkTS, and Cangjie require domain rules, executable feedback, and platform-aware evaluation.",
        focus: [
          "OpenHarmony app repair and quality assurance",
          "Android-to-OpenHarmony migration",
          "ArkUI performance and rendered-state evaluation",
          "LLM-assisted analysis for emerging languages",
        ],
        methods: ["Domain rule mining", "ArkTS static analysis", "LLM adaptation", "Rendered UI evaluation"],
        outputs: ["OpenHarmony tools", "Migration workflows", "Domain datasets and cases"],
        related: [
          { label: "Phantom Rendering Detection (FSE 2026)", href: "/papers/hapray_fse.pdf" },
          { label: "HapRepair (FSE Industry 2025)", href: "https://doi.org/10.1145/3696630.3728556" },
          { label: "Cangjie Fine-tuning (EMSE 2026)", href: "https://link.springer.com/article/10.1007/s10664-026-10878-4" },
        ],
      },
      {
        id: "measurement",
        icon: "📊",
        title: "Code Understanding & AI4SE Measurement",
        summary: "Capability probes and evaluation protocols for LLM code understanding, AI4SE tools, and LLM-in-the-loop systems.",
        cardClassName: "bg-cyan-50 dark:bg-cyan-900/30",
        detail:
          "This direction provides the measurement layer for the rest of my research: what LLMs understand about code, how AI4SE tools fail, and what evidence is needed before we trust a result.",
        focus: [
          "Syntax, static-behavior, and dynamic-behavior evaluation",
          "Tool-ecosystem surveys and failure-mode analysis",
          "Human-audited and leakage-aware evaluation",
          "Robustness measurement from completed safety work",
        ],
        methods: ["Capability probing", "Empirical surveys", "Human-audited evaluation", "Benchmark critique"],
        outputs: ["Capability maps", "Evaluation protocols", "AI4SE tool guidelines"],
        related: [
          { label: "Exploring Code Analysis (TOSEM 2026)", href: "https://dl.acm.org/doi/10.1145/3818607" },
          { label: "Open-Source AI-based SE Tools (TOSEM 2024)", href: "/papers/fse_2030.pdf" },
          { label: "MazeBreaker (ICSE 2026)", href: "/papers/ICSE_2026.pdf" },
        ],
      },
    ],
    []
  );

  const [selected, setSelected] = useState<Direction | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {directions.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelected(d)}
            className={`text-left p-4 rounded-xl ${d.cardClassName} hover:shadow-md transition-shadow`}
          >
            <div className="text-2xl mb-2">{d.icon}</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{d.title}</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{d.summary}</p>
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">Click for details →</div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{selected.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selected.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{selected.detail}</p>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Focus</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {selected.focus.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Methods</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {selected.methods.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Outputs</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {selected.outputs.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selected.related && selected.related.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Representative Works</h4>
                  <div className="flex flex-wrap gap-3">
                    {selected.related.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
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
