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

export function AboutResearchDirectionsZh() {
  const directions = useMemo<Direction[]>(
    () => [
      {
        id: "coding-agent-change",
        icon: "⚙️",
        title: "代码智能体与软件变更过程",
        summary: "研究执行反馈、静态锚点、影响关系和变更历史质量如何影响仓库级代码智能体。",
        cardClassName: "bg-blue-50 dark:bg-blue-900/30",
        detail:
          "这条主线把代码智能体看作真实的软件变更系统，而不只是补丁生成器。我关注执行、仓库结构、影响关系和提交组织方式如何影响 agent 的可靠性与可维护性。",
        focus: [
          "执行反馈什么时候值得使用",
          "静态结构如何稳定仓库导航",
          "agent 如何理解变更影响与补丁历史",
          "最终测试通过之外的过程质量",
        ],
        methods: ["Agent 轨迹分析", "受控消融实验", "软件仓库挖掘", "静态分析信号"],
        outputs: ["代码智能体设计原则", "过程质量度量", "agent 行为基准"],
        related: [
          { label: "CodeAnchor (ISSTA 2026)", href: "/papers/issta2026-codeanchor.pdf" },
          { label: "To Run or Not to Run (ISSTA 2026)", href: "/papers/issta2026-to-run-or-not-to-run.pdf" },
        ],
      },
      {
        id: "repo-scale-envs",
        icon: "🧪",
        title: "仓库级基准与可验证 SWE 环境",
        summary: "构建低泄漏、可执行的真实软件工程任务，覆盖修复、迁移、兼容性维护和领域化 SWE agent。",
        cardClassName: "bg-purple-50 dark:bg-purple-900/30",
        detail:
          "这条主线把真实软件演化问题转化成可验证环境，让 agent 在 source-only 检查、运行时约束、场景验证和领域执行反馈下接受评估。",
        focus: [
          "超越文件级 benchmark 的仓库级任务",
          "兼容性维护与生态漂移修复",
          "OpenHarmony 风格的领域 SWE 环境",
          "verifier 与泄漏控制协议设计",
        ],
        methods: ["基准构建", "执行环境设计", "source-only 验证", "失败模式分类"],
        outputs: ["仓库级任务集", "验证协议", "agent 训练与评估证据"],
        related: [
          { label: "To Run or Not to Run (ISSTA 2026)", href: "/papers/issta2026-to-run-or-not-to-run.pdf" },
          { label: "HapRepair (FSE Industry 2025)", href: "https://doi.org/10.1145/3696630.3728556" },
        ],
      },
      {
        id: "openharmony-toolchains",
        icon: "📱",
        title: "OpenHarmony 与新生语言工具链",
        summary: "面向 ArkTS 和 Cangjie 构建生态感知的修复、迁移、性能分析和程序分析基础设施。",
        cardClassName: "bg-green-50 dark:bg-green-900/30",
        detail:
          "这条主线服务于通用软件工程技术不够用的新生生态。OpenHarmony、ArkTS 和 Cangjie 需要领域规则、可执行反馈和平台感知的评估方式。",
        focus: [
          "OpenHarmony 应用修复与质量保障",
          "Android 到 OpenHarmony 迁移",
          "ArkUI 性能与渲染状态评估",
          "面向新生语言的 LLM 辅助分析",
        ],
        methods: ["领域规则挖掘", "ArkTS 静态分析", "LLM 适配", "渲染/UI 评估"],
        outputs: ["OpenHarmony 工具链", "迁移流程", "领域数据与案例"],
        related: [
          { label: "Phantom Rendering Detection (FSE 2026)", href: "/papers/hapray_fse.pdf" },
          { label: "HapRepair (FSE Industry 2025)", href: "https://doi.org/10.1145/3696630.3728556" },
          { label: "Cangjie Fine-tuning (EMSE 2026)", href: "https://link.springer.com/article/10.1007/s10664-026-10878-4" },
        ],
      },
      {
        id: "measurement",
        icon: "📊",
        title: "代码理解与 AI4SE 度量",
        summary: "为 LLM 代码理解、AI4SE 工具和 LLM-in-the-loop 系统设计能力探针与评测协议。",
        cardClassName: "bg-cyan-50 dark:bg-cyan-900/30",
        detail:
          "这条主线为其他工作提供测量层：LLM 到底理解了什么代码知识，AI4SE 工具会怎样失败，以及什么证据才足以支撑一个可靠结论。",
        focus: [
          "语法、静态行为与动态行为评估",
          "工具生态调研与失败模式分析",
          "人工审计和泄漏感知评估",
          "来自已完成安全工作的鲁棒性度量经验",
        ],
        methods: ["能力探针", "工具生态实证研究", "人工审计评估", "基准批判"],
        outputs: ["能力图谱", "评估协议", "AI4SE 工具设计建议"],
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
              了解详情
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
                关闭
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-[1.8] text-[color:var(--ink-soft)]">{selected.detail}</p>

              <div className="mt-6 grid gap-6 border-t border-[color:var(--rule)] pt-5 sm:grid-cols-3">
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--ink-faint)]">关注点</h4>
                  <ul className="space-y-1.5 text-sm text-[color:var(--ink-soft)]">
                    {selected.focus.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--ink-faint)]">方法</h4>
                  <ul className="space-y-1.5 text-sm text-[color:var(--ink-soft)]">
                    {selected.methods.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--ink-faint)]">产出</h4>
                  <ul className="space-y-1.5 text-sm text-[color:var(--ink-soft)]">
                    {selected.outputs.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selected.related && selected.related.length > 0 && (
                <div className="mt-5 border-t border-[color:var(--rule)] pt-4">
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--ink-faint)]">代表性工作</h4>
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
