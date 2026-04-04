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
        id: "apr",
        icon: "🔧",
        title: "自动化程序修复",
        summary: "探索基于 LLM 的故障定位与修复，以及基于代码知识图谱的影响分析。",
        cardClassName: "bg-blue-50 dark:bg-blue-900/30",
        detail:
          "该方向关注可落地的端到端调试与修复流程：结合静态分析信号与 LLM（常以 Agent 形式）推理，实现定位—补丁生成—验证闭环。",
        focus: ["混合信号的缺陷定位（静态分析 + LLM/Agent）", "带约束的补丁生成（可编译/测试/语义）", "基于代码知识图谱的变更影响分析", "在真实项目上系统评估与复现"],
        methods: ["静态分析（调用/数据流、切片等）", "Agent 式搜索与迭代改进", "知识图谱构建与查询"],
        outputs: ["定位/修复流程与工具原型", "基准数据与消融实验", "可集成到开发流程的工程化产物"],
        related: [{ label: "已接收论文 PDF", href: "/papers" }],
      },
      {
        id: "llm-security",
        icon: "🛡️",
        title: "LLM 安全与优化",
        summary: "研究越狱攻击/防御、提示词优化与鲁棒性评估，提升系统安全性与稳定性。",
        cardClassName: "bg-purple-50 dark:bg-purple-900/30",
        detail:
          "该方向研究如何在对抗场景与模型更新/漂移下，系统性评估并提升 LLM 应用的安全性、鲁棒性与可用性。",
        focus: ["越狱评估（自适应/迭代攻击）", "防御机制与度量（安全 vs 可用）", "提示词鲁棒性（模型更新导致的退化）", "稳定行为的优化策略"],
        methods: ["多智能体评测", "对抗测试框架", "提示词回归测试与自动修复"],
        outputs: ["鲁棒性/安全基准", "防御与缓解经验", "可落地的安全部署建议"],
        related: [{ label: "已接收论文 PDF", href: "/papers" }],
      },
      {
        id: "domain-se",
        icon: "📱",
        title: "领域软件工程",
        summary: "面向 OpenHarmony 生态的应用修复与质量保障；低资源语言场景（如 Cangjie）的 LLM 应用探索。",
        cardClassName: "bg-green-50 dark:bg-green-900/30",
        detail:
          "该方向强调领域约束与生态特性：面向 OpenHarmony 应用构建生态感知的分析/修复技术，并在低资源语言场景中探索 LLM 的可用性与工程化实践。",
        focus: ["OpenHarmony 应用缺陷与修复", "生态感知规则（ArkTS/HarmonyOS API）", "低资源语言（如 Cangjie）应用场景探索", "与工程实践结合的反馈闭环"],
        methods: ["领域规则挖掘", "生态感知静态分析", "与产业伙伴的评测与迭代"],
        outputs: ["面向生态的工具与规则", "可操作的修复建议", "可复用的数据与案例（在条件允许时）"],
        related: [{ label: "已接收论文 PDF", href: "/papers" }],
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
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">点击查看详情 →</div>
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
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">关注点</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {selected.focus.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">方法</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {selected.methods.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">产出</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {selected.outputs.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selected.related && selected.related.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">相关链接</h4>
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
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

