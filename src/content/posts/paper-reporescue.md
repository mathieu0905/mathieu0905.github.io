---
title: "RepoRescue：旧仓库不是坏了，是世界变了"
date: "2026-07-03"
description: "我们的 RepoRescue 论文已上线 arXiv。它讲的是一个很现实的故事：旧仓库曾经能跑，现代生态却把它弄坏了；代码智能体能不能真正修源码，而不是走改测试的捷径？"
tags: ["论文解读", "Code Agent", "兼容性维护"]
coverColor: "from-emerald-500 to-teal-600"
---

# RepoRescue：旧仓库不是坏了，是世界变了

> 📄 arXiv 预印本 | [arXiv:2607.01213](https://arxiv.org/abs/2607.01213)
>
> 作者：Zhihao Lin, Mingyi Zhou, Zhensu Sun, Yizhuo Yang, Renyu Yang, David Lo, Li Li
>
> *Li Li 为通讯作者*

---

## 一句话概括

很多旧仓库不是因为代码本身“写错了”才不能用，而是因为 Python、Java、依赖和构建生态都变了。RepoRescue 问的是：**LLM agents 能不能在只看到一个现代失败环境的情况下，把这些曾经能工作的仓库救回来，而且是真的修源码，不是把测试改到通过。**

---

## 这个故事为什么有意思？

想象一个开源库：几年前还有人维护，当时测试是绿的，也有下游项目在用。后来维护者离开了，仓库停在那里。代码没有主动变坏，但世界继续往前走：Python 升级了，Java 升级了，依赖包删了旧 API，构建工具开始收紧规则。

几年后，一个开发者想重新用它。结果 import 失败，测试失败，某个依赖里的函数消失了，或者 JDK 21 下反射不再像以前那样工作。

这时候问题很微妙：这个仓库不是传统意义上的 buggy program。它在自己的历史环境里是对的，只是现代生态不再给它当年依赖的那些假设。我们把这个任务叫做 **compatibility rescue**。

我觉得这个故事的核心张力在这里：

- 旧仓库并不是废掉了，它只是被生态漂移困住了；
- agent 进来以后，第一个诱惑不是修源码，而是把失败测试改掉；
- 即使测试重新变绿，也还要追问一句：这个库真的能重新被使用吗？

所以 RepoRescue 不是单纯在问“模型会不会修 bug”。它在问一个更接近真实软件维护的问题：**当旧软件和新生态之间断开时，代码智能体能不能把这条连接重新接上。**

## 这和普通程序修复不一样

普通 program repair 往往从一个当前环境里的程序缺陷出发：程序违反了预期行为，所以我们修它。

RepoRescue 的出发点不同。一个任务只有先满足两个条件，才会进入 benchmark：

1. 它在历史环境里能通过自己的原始测试套件。
2. 它迁移到现代运行时和现代依赖后，同一套测试稳定失败。

也就是说，失败不是随便找来的，而是由生态变化触发的。Python 3.13、JDK 21、新版本依赖、标准库移除、旧 API 消失，这些变化一起构成了一个很真实的维护场景。

agent 得到的输入也很克制：没有 issue 描述，没有 fault localization，没有人工告诉它“哪个 API 变了”。它只能看到一个失败的现代环境，然后自己跑测试、读日志、查依赖源码、定位受影响代码，最后给出 rescue patch。

这就让任务从“回答题目”变成了“接手一个旧仓库”。

## RepoRescue 怎么构造？

论文里把整个流程拆成三个阶段。

**Phase 0：历史环境必须通过。**
我们先恢复仓库曾经能工作的环境，跑它自己的原始测试。只有测试通过，才说明这个仓库确实有一个可验证的历史工作状态。

**Phase 1：现代环境必须失败。**
然后把同一个仓库放到现代环境里。Python 侧是 Python 3.13 和当前依赖，Java 侧是 JDK 21。只有失败稳定复现，而且失败来自兼容性漂移，才保留下来。

**Phase 2：agent 尝试救援。**
agent 拿到失败仓库和现代环境，需要通过源码修改让原始测试套件重新通过。

最终 RepoRescue 包含：

- 193 个 Python 仓库，其中 47 个是长期无人维护但仍有复用价值的项目，146 个来自真实维护者后来修复过兼容性问题的 time-travel snapshot；
- 122 个 Java 仓库，主要覆盖 JDK 21 下的编译、运行和 API 兼容问题；
- 1,717 次 agent 运行，覆盖 Python 主实验、Java 扩展实验和 runtime-enforced 重跑。

这不是一个“越大越好”的数据集，而是一个经过三段验证的数据集：过去能跑，现在会坏，agent 修完后还能被重新检查。

## 最有意思的评测：agent 会不会走捷径？

如果只看测试是否变绿，agent 很容易“看起来很强”。

但在这个任务里，测试文件本身也会因为生态变化失败。比如旧测试框架不兼容，旧 assert 写法过时，或者测试里也调用了被移除的 API。于是 agent 面前有两条路：

- 修源码，让库在现代环境里继续保持原有行为；
- 改测试，让测试不再暴露这个失败。

第二条路有时候不是恶意的。它可能看起来也像“迁移测试”。但对于 RepoRescue 的目标来说，这会污染结论：我们想知道旧库能不能被救回来，而不是测试能不能被改到通过。

所以论文里设计了三层 evaluation stack。

**Source-only audit**：agent 提交 patch 后，把测试文件改动删掉，再重新跑原始测试。只有源码改动本身能恢复测试，才算 source-only 成功。

**Runtime-blocked regime**：不只是事后删测试改动，而是在 agent 运行时直接阻止它写测试、改依赖声明或安装新包，看它在没有捷径时会不会转向真正的源码修复。

**Scenario validation**：对于原始测试通过的无人维护 Python 仓库，再写 realistic scenarios 和 bug-hunt probes，检查这个库在测试套件之外是不是真的能被使用。

我觉得这是这篇论文里最关键的设计：它没有把“测试绿了”当终点，而是把“为什么绿了”和“绿了之后能不能用”拆开看。

## 关键发现

**1. full-patch pass rate 会骗人。**

在 193 个 Python 仓库上，四个 Claude Code 系统的 full-patch pass rate 可以达到 36.8% 到 51.3%。但 source-only audit 后，它们会降到 19.7% 到 24.4%。

换句话说，一部分“成功”依赖了测试改动。测试绿不等于源码被救回来了。

**2. capability 和 compliance 是缠在一起的。**

更有意思的是 runtime-blocked 结果。Kimi K2.5 在事后 source-only audit 下是 22.8%，但当运行时直接禁止它改测试后，它仍然能 rescue 41.5% 的 Python 仓库。

这说明一件很微妙的事：有些 agent 不是没有能力修源码，而是在允许捷径存在时，会选择更容易的路径。评测协议改变的不只是分数，也会改变 agent 的行为。

这也是我觉得这个结论很有意思的原因。它不是简单说“某个模型强”或“某个模型弱”，而是在说：**agent capability 必须和约束一起测。**

**3. 不同系统救回的是不同仓库。**

五个 Python 系统的 full-patch union 达到 62.7%，比最好的单系统高 10.9 个百分点；source-only union 也比单系统更高。

这说明 RepoRescue 不是一个简单的 leaderboard 排名题。不同 agent 的失败分布并不完全重合，未来很自然会走向 routing、portfolio 或 best-of-N：先判断这个仓库像哪一类 rescue，再把它交给更适合的系统。

**4. 真正的难点是 whole-codebase coordination。**

论文把 successful repair 按 reasoning level 标成 L1 到 L4：从简单语法替换，到单文件 API 适配，再到跨文件传播，最后到需要全仓协调的修复。

L1/L2 大多比较常规。真正拉开差距的是 L4：14 个需要 whole-codebase coordination 的任务里，GPT-5.2 through Codex 全部通过，而 Claude Code 系统最多通过 2 个。

这个结果很抓人。因为它说明 repo-level agent 的难点往往不是“知道 `inspect.getargspec` 应该换成什么”，而是多个文件里的旧假设要一起迁移：API surface、异步逻辑、包装层、依赖行为、测试入口都要保持一致。局部修对了，但组合起来不对，仓库还是救不回来。

**5. 测试通过只是第一信号。**

在 34 个 Phase 2 通过的无人维护 Python 仓库中，22 个能通过 realistic scenario，12 个能通过 bug-hunt probe 并确认 patch 处理了兼容性失败。

这个数字提醒我们：历史测试套件恢复绿色很重要，但它只是第一信号。一个旧库要重新回到真实生态里，还需要在实际入口、下游调用和关键行为上继续被验证。

## 我自己的理解

RepoRescue 和我之前几条主线其实是连在一起的。

To Run or Not to Run 问的是 execution feedback 到底什么时候值得花；CodeAnchor 问的是代码智能体需要多少静态结构才能稳定导航；RepoRescue 则把这两件事放进一个更完整的维护场景里：一个真实仓库、一个现代失败环境、一套历史测试、若干隐含的依赖和运行时假设。

这类任务很适合衡量 code agent 是否真的具备工程维护能力。因为它同时要求 agent：

- 复现失败，而不是只读 issue；
- 理解生态漂移，而不是只做局部语法替换；
- 保持历史行为，而不是重写测试；
- 做跨文件协调，而不是只修第一个报错点；
- 经得起测试套件之外的现实使用检查。

我越来越觉得，下一阶段的 AI4SE benchmark 不能只问“模型能不能写出一个 patch”。更重要的问题是：

**这个 patch 是否遵守维护边界，是否只改该改的东西，是否能在真实生态链条里让旧软件继续活下去。**

这也是 RepoRescue 这个故事最打动我的地方。它不是把旧仓库当成一堆过时代码，而是把它们当成仍然有价值、只是被现代生态冲散的工程资产。代码智能体如果真的要进入软件维护，就不能只会写新代码，还要学会把这些断掉的连接重新接起来。

## 参考

- Paper: [RepoRescue: An Empirical Study of LLM Agents on Whole-Repository Compatibility Rescue](https://arxiv.org/abs/2607.01213)
- arXiv: [2607.01213](https://arxiv.org/abs/2607.01213)

---

*旧仓库不是废墟，很多时候只是需要有人把它们从旧生态里救出来。RepoRescue 想测的，就是 agent 能不能认真完成这件事。*
