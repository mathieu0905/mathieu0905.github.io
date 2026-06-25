---
title: "To Run or Not to Run：代码智能体到底要不要跑测试？"
date: "2026-06-25"
description: "我们系统分析 LLM 程序修复智能体中的代码执行成本与收益。论文大修后被 ISSTA 2026 正式接收。"
tags: ["论文解读", "程序修复", "Code Agent"]
coverColor: "from-rose-500 to-red-600"
---

# To Run or Not to Run：代码智能体到底要不要跑测试？

> 📄 发表于 **ISSTA 2026** | [PDF](/papers/issta2026-to-run-or-not-to-run.pdf)
>
> 作者信息待更新

---

## 一句话概括

LLM 程序修复智能体越来越依赖“生成补丁 - 运行测试 - 根据反馈再修”的循环，但代码执行并不总是划算。我们系统分析了执行在真实修复流程中的收益、成本和适用边界。

---

## 为什么这个问题重要？

现在的 coding agent 很自然地把执行当成默认能力：生成一个补丁，跑测试，看失败日志，再改一轮。这个闭环听起来很合理，也确实是很多系统的核心设计。

但执行不是免费的：

- 它会消耗大量 token，因为 agent 需要生成命令、读取日志、解释输出；
- 它会增加 wall-clock 延迟，因为测试、编译和环境准备都要等；
- 它要求维护可运行的仓库环境，而这在真实项目里经常很脆弱；
- 它可能让 agent 过度相信自己的 validation，而不是官方评测结果。

所以这篇论文问了一个很直接的问题：**在 LLM-based program repair 里，代码执行到底什么时候值得？**

## 我们做了什么？

论文分两阶段研究 execution behavior。

第一阶段，我们分析了 SWE-bench leaderboard 里的 7,745 条 agent traces，观察不同 agent 和模型到底怎样使用测试执行。

第二阶段，我们在 200 个 SWE-bench 实例上做了 3,000 次端到端修复实验，比较 Claude Code、Codex 和开源 OpenCode 在不同 execution paradigm 下的表现。

## 关键发现

**1. 执行被广泛使用，但行为差异很大。**

不同 agent 和模型都会跑测试，平均每个任务约 8.8 次执行；但具体频率差异很大，从每题 2 次到 19 次都有。

**2. 对强商业 agent，禁止执行未必显著降低修复率。**

在商业 agent + SOTA 模型上，`Prohibited` 和 `Unrestricted` 之间的 resolve-rate gap 只有约 1.25 个百分点，统计上不显著；OpenCode + Qwen2.5-Coder-32B 的对应差距也接近 0。

**3. 禁止执行能显著降低成本。**

在 Claude Code 上，`Prohibited` 可以节省 56-62% token 和 48-54% wall-clock time，同时省掉维护每个仓库测试环境的麻烦。

**4. 执行收益是集中的，不是均匀分布的。**

很多 case 一次 edit 就能完成；失败 case 中，相当一部分已经通过 agent 自己跑的 validation，却仍然没通过官方 evaluation。这说明当前 agent 往往把执行当默认动作，而不是一个需要决策的资源。

## 我自己的理解

这篇工作让我最喜欢的地方，是它没有简单地说“执行有用”或“执行没用”。更准确的结论是：**执行应该被当成有成本的资源，而不是 coding agent 的默认反射动作。**

未来更好的 agent 可能不是“能不能跑测试”，而是“什么时候值得跑，跑什么，跑到什么程度就该停”。

---

*大修后正式接收 ISSTA 2026。终于可以把这篇挂出来了。*
