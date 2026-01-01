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
        id: "apr",
        icon: "🔧",
        title: "Automated Program Repair",
        summary: "Exploring LLM-based code localization and repair, impact analysis using code knowledge graphs.",
        cardClassName: "bg-blue-50 dark:bg-blue-900/30",
        detail:
          "This direction targets practical, end-to-end debugging and repair workflows. We combine static analysis signals with LLM reasoning (often via agents) to localize faults, propose patches, and validate fixes efficiently.",
        focus: [
          "Fault localization with hybrid signals (static + LLM/agents)",
          "Patch generation with constraints (compilation/tests/semantics)",
          "Change impact analysis using code knowledge graphs",
          "Evaluation on real projects and reproducible pipelines",
        ],
        methods: ["Static analysis (call/data flow, slicing)", "Agentic search and iterative refinement", "Knowledge graph construction + queries"],
        outputs: ["Repair/localization artifacts", "Benchmarks + ablation studies", "Tooling that integrates with developer workflows"],
        related: [{ label: "Accepted paper PDFs", href: "/papers" }],
      },
      {
        id: "llm-security",
        icon: "🛡️",
        title: "LLM Security & Optimization",
        summary: "Jailbreaking defense mechanisms and prompt optimization techniques for safer AI systems.",
        cardClassName: "bg-purple-50 dark:bg-purple-900/30",
        detail:
          "This direction studies how to evaluate and improve the robustness of LLM-based systems under adversarial or shifting conditions, including jailbreak attempts and prompt drift.",
        focus: [
          "Jailbreak evaluation (adaptive/iterative attacks)",
          "Defense mechanisms and measurement (safety vs utility)",
          "Prompt robustness under model updates and drift",
          "Optimization strategies for stable, safer behavior",
        ],
        methods: ["Multi-agent evaluation", "Adversarial testing harnesses", "Regression testing for prompts"],
        outputs: ["Robustness benchmarks", "Defense/mitigation insights", "Practical guidelines for safe deployment"],
        related: [{ label: "Accepted paper PDFs", href: "/papers" }],
      },
      {
        id: "domain-se",
        icon: "📱",
        title: "Domain-Specific SE",
        summary: "OpenHarmony ecosystem app repair, low-resource language LLM applications (e.g., Cangjie).",
        cardClassName: "bg-green-50 dark:bg-green-900/30",
        detail:
          "This direction focuses on domain constraints and ecosystem-specific semantics. We build analysis and repair techniques tailored to OpenHarmony apps, and explore LLM applications in low-resource language settings.",
        focus: [
          "OpenHarmony app quality: defects, patterns, and repair",
          "Ecosystem-aware static rules (ArkTS/HarmonyOS APIs)",
          "Low-resource language scenarios (e.g., Cangjie) as applied settings",
          "Human-in-the-loop feedback with practitioners",
        ],
        methods: ["Domain rule mining", "Ecosystem-aware static analysis", "Tool evaluation with industry feedback"],
        outputs: ["Ecosystem-specific tooling", "Actionable rules and repair hints", "Reusable datasets (when possible)"],
        related: [{ label: "Accepted paper PDFs", href: "/papers" }],
      },
    ],
    []
  );

  const [selected, setSelected] = useState<Direction | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-4">
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
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Links</h4>
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

