---
title: "OpenHarmony Bench：能编译，不等于真的完成了应用需求"
date: "2026-08-17"
description: "我在实习期间参与的 OpenHarmony Bench 技术报告已上线 arXiv。它用可构建、可安装、可交互验证的 ArkTS 应用，评估 coding agents 是否真的完成了端到端需求。"
tags: ["我的论文", "Code Agent", "OpenHarmony", "ArkTS", "Benchmark"]
category: "research"
coverColor: "from-cyan-500 to-blue-700"
---

# OpenHarmony Bench：能编译，不等于真的完成了应用需求

> 📄 技术报告 | [arXiv:2608.16022](https://arxiv.org/abs/2608.16022) | [项目网站](https://bench.matrix.openharmony.cn/)
>
> 这份技术报告是我在实习期间参与的一项合作工作。

---

## 一句话概括

OpenHarmony Bench 不只检查 agent 交出的 ArkTS 项目能不能编译，还会安装并运行应用，用可执行 UI 测试确认需求是否真的发生。它要测的是完整的应用交付，而不是一段局部代码看起来是否合理。

## 为什么需要应用级 benchmark？

函数级代码生成通常有清楚的输入输出，仓库级修复 benchmark 则多从 issue 和测试出发。但移动应用开发还有另一层复杂性：一次看似局部的需求，可能同时牵动页面路由、UI 状态、数据持久化、资源文件、构建配置和平台 API。

这类任务最容易制造一种假象：项目已经编译成功，agent 似乎完成了工作；真正打开应用以后，按钮没有反应、状态没有保存、页面没有跳转，或者某个交互路径根本走不通。

OpenHarmony Bench 因此把交付边界放在完整 ArkTS 应用上。agent 需要修改一个可运行项目，评测端随后构建、安装、启动应用，再通过 Hypium 驱动界面并检查用户可观察的行为。

## 153 个任务从哪里来？

当前 v1.0 快照包含 42 个仓库、153 个顶层任务和 242 个 Feature points（F-points），任务分成三类：

- **new-feature**：32 个自然语言功能需求，考察 agent 能否在已有项目中完成增量开发；
- **spec-driven**：50 个结构化规格任务，共包含 139 个 F-points，强调多个交互和状态条件必须同时满足；
- **bug-fix**：71 个来自真实 OpenHarmony 项目历史修复的缺陷任务，考察定位和修复能力。

这里的 F-point 是一个可执行的行为检查。每个检查都必须满足 fail-to-pass：在原始版本上失败，在参考实现或修复版本上通过。对于 spec-driven 任务，只要其中一个 F-point 没通过，整个顶层任务就不算完成。

这条 all-checks 规则很严格，但它接近真实需求验收：一个聊天输入框如果能展开，却不能发送消息，不能因为“四个场景做对了三个”就被当作已经交付。

## 评测如何运行？

报告把 DevEco Code 固定为 agent 框架，只替换底层模型。每个配置都运行完整的 153 个任务，并独立重复三次。一次任务大致经历六步：初始化干净工作区、执行 agent、记录 diff、第一次构建、有限次数的编译修复，以及最终的行为验证。

编译修复最多进行五轮，agent 只能看到构建日志，拿不到 Hypium 的隐藏检查、参考补丁或 oracle 结果。最终项目必须成功构建，并通过该任务的全部可执行检查，才计入 Task Completion。

因此，报告中的分数应理解为 **DevEco Code 与某个模型组成的配置**，而不是多个独立 coding-agent 框架之间的直接比较。

## 最值得记住的结果：build pass 远远不够

八个模型配置的平均 Final Build Success Rate 在 94.77% 到 100.00% 之间，已经接近饱和；平均 Task Completion 却只有 48.36% 到 58.39%。最高的整体结果来自 DevEco Code + GLM-5.2，平均完成率为 58.39%，三次运行的范围是 56.21% 到 60.78%。

这组数字揭示了 benchmark 最核心的判断：**项目能编译，只说明语法、类型和构建链路大体成立；它没有证明 UI 交互、状态迁移、持久化和平台集成真的正确。**

三类任务的难度也很不一样。bug-fix 的最高平均完成率达到 75.12%，new-feature 的最高结果是 63.54%；spec-driven 最难，所有配置都低于 35%。这并不只说明规格文本更长，也和它的 all-checks 计分方式有关：一个任务往往包含多个相互关联的行为，必须全部完成。

## 我怎么看这项工作？

我在 OpenHarmony 相关工作里越来越在意一个边界：编译成功和行为正确必须分开报告。

ArkTS 项目能构建当然重要，但用户最终接触的是应用行为。只看 build success，很容易把“代码形式上合法”误写成“需求已经实现”。OpenHarmony Bench 把安装、启动和 UI 行为验证纳入同一条流水线，让这个差距变成可以量化的结果。

它也补上了 OpenHarmony coding-agent 评测里较少被覆盖的一层。现有工作可以测函数生成、API 使用或局部修复，而这里关心的是 agent 能否在真实项目结构和平台运行时里完成一次应用级交付。对移动端和 GUI 软件来说，这个交付边界比只检查源码或最终 diff 更接近实际工程。

## 需要怎样理解这些结果？

这份报告给出的是一个有明确版本的评测快照，不应该把细小的排行榜差距解释得过重。

首先，所有实验都固定使用 DevEco Code，结论不能直接外推到其他 agent scaffold。其次，每个配置只有三次完整重复，报告给出的 min–max 是描述性范围，不是置信区间；相邻模型的范围重叠时，名次差异需要谨慎看待。最后，bug-fix 任务来自公开历史 PR，无法排除预训练暴露风险。

公开任务、参考解、测试和评测脚本有利于复现，也会随着时间增加污染和针对性优化的风险。因此，后续 leaderboard 应同时记录 benchmark 版本、任务快照、评测脚本、DevEco Code 版本、模型标识和运行环境，不能只留下一个百分比。

## 参考

- Technical report: [OpenHarmony Bench: Evaluating LLMs and Coding Agents on OpenHarmony App Development](https://arxiv.org/abs/2608.16022)
- Project website: [OpenHarmony Bench](https://bench.matrix.openharmony.cn/)
- arXiv: [2608.16022](https://arxiv.org/abs/2608.16022)

---

*能构建是交付的起点。对应用级 coding agent 来说，真正的终点是需求在设备上确实发生。*
