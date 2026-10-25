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
      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {directions.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelected(d)}
            className="group block border-t border-[color:var(--rule)] pt-4 text-left"
          >
            <h4 className="font-medium text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent)]">
              {d.title}
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink-soft)]">{d.summary}</p>
            <span className="mt-2 inline-block text-xs text-[color:var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
              Learn more
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[color:var(--rule)] bg-[color:var(--paper-raised)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[color:var(--rule)] px-6 py-5">
              <h3 className="text-xl font-semibold text-[color:var(--ink)]">{selected.title}</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-shrink-0 text-xs text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-[1.8] text-[color:var(--ink-soft)]">{selected.detail}</p>

              <div className="mt-6 grid gap-6 border-t border-[color:var(--rule)] pt-5 sm:grid-cols-3">
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--ink-faint)]">Focus</h4>
                  <ul className="space-y-1.5 text-sm text-[color:var(--ink-soft)]">
                    {selected.focus.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--ink-faint)]">Methods</h4>
                  <ul className="space-y-1.5 text-sm text-[color:var(--ink-soft)]">
                    {selected.methods.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--ink-faint)]">Outputs</h4>
                  <ul className="space-y-1.5 text-sm text-[color:var(--ink-soft)]">
                    {selected.outputs.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selected.related && selected.related.length > 0 && (
                <div className="mt-5 border-t border-[color:var(--rule)] pt-4">
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--ink-faint)]">Representative Work</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                    {selected.related.map((link) => (
                      <Link key={link.href} href={link.href} className="text-[color:var(--accent)] hover:underline">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
