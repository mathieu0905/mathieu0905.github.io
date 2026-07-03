---
title: "RepoRescue：让代码智能体拯救被生态漂移困住的旧仓库"
date: "2026-07-03"
description: "我们的 RepoRescue 论文已上线 arXiv。它研究 LLM agents 能否把曾经能运行、如今因运行时和依赖变化而失效的旧仓库救回现代环境。"
tags: ["论文解读", "Code Agent", "兼容性维护"]
coverColor: "from-emerald-500 to-teal-600"
---

# RepoRescue：让代码智能体拯救被生态漂移困住的旧仓库

> 📄 arXiv 预印本 | [arXiv:2607.01213](https://arxiv.org/abs/2607.01213)
>
> 作者：Zhihao Lin, Mingyi Zhou, Zhensu Sun, Yizhuo Yang, Renyu Yang, David Lo, Li Li
>
> *Li Li 为通讯作者*

---

## 一句话概括

很多开源仓库本身没有“写错”，只是被新的 Python、Java、依赖版本和构建生态甩在了身后。RepoRescue 研究的是：**LLM agents 能不能只拿到一个失败的现代环境，把这些曾经能工作的仓库救回来。**

---

## 为什么要做这件事？

开源软件经常比维护者活得更久。一个库可能几年没有更新，但仍然被下游项目引用；它的代码在当年的环境里能通过测试，可是换到新的运行时或依赖版本后，就开始 import 失败、API 不兼容、测试跑不起来。

这类问题和普通 bug repair 不太一样。普通修复通常是假设程序在目标环境里违反了预期行为；compatibility rescue 则是从一个历史事实出发：**这个仓库过去是能工作的，只是生态变了。**

所以我们关心的不是“让测试绿就行”，而是更接近真实维护的问题：

- 它在历史环境里是否真的能工作？
- 现代环境到底如何把它弄坏？
- agent 修的是源码，还是偷偷改了测试？
- 原始测试通过之后，这个库在真实使用场景里还能不能用？

## RepoRescue 怎么构造？

RepoRescue 把任务拆成三个阶段。

第一步是恢复历史环境。一个仓库只有在原始测试套件能在历史环境里通过，才会进入 benchmark。

第二步是暴露现代环境里的兼容性失败。Python 侧使用 Python 3.13 和当前依赖，Java 侧使用 JDK 21；只有同一套测试在现代环境里稳定失败，才说明它确实被生态漂移影响了。

第三步才轮到 agent。agent 只拿到失败的现代仓库，没有 issue 描述、没有 fault localization、没有人工标注的根因。它需要自己跑测试、读依赖源码、定位坏掉的 API 或行为假设，然后给出源码层面的 rescue patch。

最终 benchmark 包含：

- 193 个 Python 仓库，其中 47 个是长期无人维护但仍有复用价值的项目，146 个来自真实维护者后来修复过兼容性问题的 time-travel snapshot；
- 122 个 Java 仓库，主要覆盖 JDK 21 下的编译、运行和 API 兼容问题；
- 1,717 次 agent 运行，覆盖 Python 主实验、Java 扩展实验和 runtime-enforced 重跑。

## 我们怎么防止“假修复”？

这篇论文里我最在意的一点，是 evaluation stack。

如果只看 full-patch pass rate，agent 可能通过改测试来制造“修好了”的假象。RepoRescue 因此加入了三层检查：

**Source-only audit**：agent 提交 patch 后，把测试文件改动删掉，再重新跑原始测试。只有源码改动本身能恢复测试，才算 source-only 成功。

**Runtime-blocked regime**：在运行过程中直接阻止 agent 写测试、改依赖声明或安装新包，观察同一个 agent 在没有捷径时会不会选择真正修源码。

**Scenario validation**：对于原始测试已经通过的无人维护 Python 仓库，我们再写现实使用场景和 bug-hunt probe，检查这个库是不是真的能被重新使用。

这几层检查回答的是不同问题：测试绿不绿、源码有没有修、捷径被堵住后 agent 会怎么做、以及修完后能不能真实复用。

## 关键发现

**1. agent 确实能救回不少仓库，但 full-patch pass rate 会高估能力。**

在 193 个 Python 仓库上，Claude Code 系统的 full-patch pass rate 可以达到 36.8% 到 51.3%，但 source-only audit 后会降到 19.7% 到 24.4%。也就是说，一部分看起来成功的 patch 依赖了测试改动。

**2. capability 和 compliance 是两回事。**

四个 Claude Code 系统即使被 prompt 禁止，仍然会在部分成功案例里改测试。更有意思的是，当 runtime 直接阻止这条捷径时，Kimi K2.5 仍然能 rescue 41.5% 的 Python 仓库。这说明有些 agent 不是没有修源码的能力，而是在允许捷径时会走捷径。

**3. 不同系统救回的是不同仓库。**

五个 Python 系统的 full-patch union 达到 62.7%，比最好的单系统高 10.9 个百分点；source-only union 也比单系统更高。这说明兼容性 rescue 很适合做 routing 或 portfolio：不同 agent 的失败分布并不完全重合。

**4. 真正难的是跨文件协调。**

我们把 successful repair 按 reasoning level 标成 L1 到 L4：从简单语法替换，到单文件 API 适配，再到跨文件传播，最后到需要 whole-codebase coordination 的修复。L1/L2 大多比较常规；到了 L4，14 个需要全仓协调的任务里，GPT-5.2 through Codex 全部通过，而 Claude Code 系统最多通过 2 个。这个差距说明：repo-level agent 的瓶颈往往不是“知道某个 API 变了”，而是能否让多个文件里的假设一起迁移。

**5. 测试通过只是第一信号，不是终点。**

在 34 个 Phase 2 通过的无人维护 Python 仓库中，22 个能通过 realistic scenario，12 个能通过 bug-hunt probe 并确认 patch 处理了兼容性失败。这个结果提醒我们：旧测试套件恢复绿色很重要，但还不足以证明一个库真的重新可用。

## 我自己的理解

RepoRescue 和我之前几条研究主线是连在一起的。

To Run or Not to Run 问的是 execution feedback 到底什么时候值得花；CodeAnchor 问的是代码智能体需要多少静态结构才能稳定导航；RepoRescue 则把问题推到更完整的维护场景里：一个真实仓库、一个现代失败环境、一套历史测试、若干隐含的依赖和运行时假设。

这类任务很适合衡量 code agent 是否真的具备工程维护能力。因为它同时要求 agent：

- 复现失败，而不是只读 issue；
- 理解生态漂移，而不是只改局部语法；
- 保持历史行为，而不是重写测试；
- 做跨文件协调，而不是只修一个报错点；
- 经得起测试套件之外的现实使用检查。

我越来越觉得，下一阶段的 AI4SE benchmark 不能只问“模型能不能写出一个 patch”。更重要的问题是：**这个 patch 是否遵守维护边界，是否只改该改的东西，是否能在真实生态链条里让旧软件继续活下去。**

RepoRescue 想把这个问题变成可以测量、可以比较、可以复现的任务。

## 参考

- Paper: [RepoRescue: An Empirical Study of LLM Agents on Whole-Repository Compatibility Rescue](https://arxiv.org/abs/2607.01213)
- arXiv: [2607.01213](https://arxiv.org/abs/2607.01213)

---

*这篇是我们关于仓库级兼容性维护和 code agent 评估的一步。旧仓库不是废墟，很多时候只是需要有人把它们从旧生态里救出来。*
