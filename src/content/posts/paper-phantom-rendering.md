---
title: "Phantom Rendering：揪出 UI 中看不见的性能杀手"
date: "2026-06-22"
description: "我们系统刻画了 Phantom Rendering：移动应用在 UI 线程做了大量计算，却没有产生可见渲染输出。论文发表于 PACMSE/FSE 2026，并开源了 HapPRDetection。"
tags: ["论文解读", "性能分析", "UI"]
coverColor: "from-orange-500 to-amber-600"
---

# Phantom Rendering：揪出 UI 中看不见的性能杀手

> 📄 发表于 **PACMSE / FSE 2026** | [PDF](/papers/hapray_fse.pdf) | [Code](https://github.com/SMAT-Lab/PhantomRendering.git)
>
> 作者：Zhihao Lin, Mingyi Zhou, Bo Sun, Han Hu, Gang Fan, Li Li
>
> DOI：[10.1145/3797101](https://doi.org/10.1145/3797101)

---

## 一句话概括

我们发现移动应用中存在一种容易被忽略的性能浪费：App 在 UI 线程做了大量布局、状态更新和交互相关计算，但这些计算最终没有产生对应的可见渲染输出。

---

## 什么是 Phantom Rendering？

移动端 UI 通常不是“一条线程从计算到上屏”这么简单。现代平台普遍采用双线程渲染架构：UI 线程负责响应交互、执行业务逻辑、计算布局和生成渲染树；Render Thread 或系统渲染服务负责真正把结果画到屏幕上。

**Phantom Rendering（幽灵渲染）**指的就是这两件事之间发生了脱节：

- UI 线程持续执行比较重的 UI 相关计算；
- 系统最终没有产生对应的可见渲染输出；
- 这些计算不会一定表现为明显卡顿，却会消耗 CPU、带来发热和电量浪费。

一个直观例子是：动画组件已经不在当前可见页面上了，但它背后的状态更新和布局逻辑还在继续跑。Render Service 可能正确地跳过了绘制，但 UI 线程前面已经把计算成本花掉了。我们关心的不是“系统跳过绘制”本身，而是“跳过绘制之前是否发生了大量本不该发生的计算”。

## 为什么之前没人关注这个？

传统移动端性能分析很擅长告诉你“哪里慢”：FPS、jank、frame drop、启动时间、CPU 使用率、温度、电量等指标都能暴露症状。但 Phantom Rendering 更像是一种**隐性的性能税**：

- 它未必直接造成用户可感知的卡顿；
- 普通 profiler 能看到 CPU 在忙，却很难判断这些计算是否真的产生了视觉价值；
- 真机环境里通常没有“正常实现”和“异常实现”的 baseline 可供比较；
- 根因往往落在函数级代码，而不是单纯的某个页面或某一帧。

所以问题不只是“检测到 CPU 高”，而是要回答一个更难的问题：**这部分 UI 计算到底有没有换来用户能看到的东西？**

## 我们怎么检测的？

我们提出了 **HapPRDetection**，核心思路是把低层硬件计数和高层 UI 行为对齐起来：一边看 UI 线程到底花了多少计算，一边看 Render Service 是否产生了对应的视觉输出。

### 关键指标：CPU Retired Instructions

论文里没有只看 CPU 使用率，而是使用 **CPU Retired Instructions** 作为更细粒度的计算成本指标。它表示已经完成执行并从处理器流水线退休的 CPU 指令数。

相比“CPU 占用率”，这个指标更适合做函数级归因：我们可以知道某个函数、某个线程、某个过程到底消耗了多少实际指令，从而把性能浪费定位到可修改的代码位置。

### 检测流程

HapPRDetection 由四个模块组成：

1. **Scripts Generation Module（SGM）**：生成可复现实验脚本，覆盖常见交互路径；
2. **Random Click Module（RCM）**：用随机交互补充真实用户行为里的复杂和不可预测场景；
3. **Performance Exploration Module（PEM）**：同步采集 CPU Retired Instructions、UI 事件、UI 状态和渲染输出；
4. **Issue Detection Module（IDM）**：通过差分分析和层级归因，判断哪些函数在 Phantom Rendering 期间贡献了额外计算。

### 两个核心算法直觉

**差分分析**：对齐 UI doFrame 和 Render Service doRender。当 UI 线程发生了显著计算，但没有对应视觉输出时，这一帧就可能是 Phantom Rendering。算法进一步比较 phantom 场景和 normal 场景中的指令差异，量化“多花掉的计算”。

**层级归因**：从进程、线程、文件一路追到函数符号，把“这个场景有浪费”变成“这个函数贡献了多少 wasted instructions”。这也是工具对开发者真正有用的部分：它不只是报一个性能分数，而是给出可以修的代码位置。

## 实验怎么做？

我们在 OpenHarmony 上评估了下载量排名靠前的 22 个真实应用，覆盖 12 类应用和 193 个测试步骤。测试同时包含自动脚本和人工真实交互：

- 自动脚本负责稳定复现主要场景；
- 人工交互负责捕捉滚动、搜索、消息、导航等更接近真实使用的复杂行为；
- 所有测试使用 HiPerf / HiProfiler 等系统工具采集性能数据。

论文还设计了 4 个受控场景来验证问题本身，包括图片浏览、点赞交互、图片缩放和评论滚动。异常实现会故意触发大量无可见输出的 UI 计算，用来验证现有工具只能看到 CPU、温度、内存等症状，却无法自动识别“这些计算为什么浪费”。

## 关键发现

**1. Phantom Rendering 在真实应用里确实存在。**

在 193 个测试步骤中，我们发现 19 个测试用例存在 Phantom Rendering，覆盖 8 个应用。最严重的场景中，Phantom Rendering rate 达到约 40%。

**2. 问题最容易出现在动态交互里。**

内容滚动、实时数据更新、复杂动画、手势操作等场景最容易触发问题。静态内容展示和可预测交互通常浪费较少。

**3. 浪费可以非常可观。**

所有测试中共检测到约 20.2B wasted CPU Retired Instructions。严重场景平均 Phantom Rendering rate 为 18.3%，每个 case 平均浪费约 1.25B 条 CPU 指令；低影响场景平均只有 0.3%，每个 case 约 0.036B。两者相差约 35 倍。

**4. 方法稳定，且能定位到函数。**

在重复测试中，HapPRDetection 达到 94.4% 的检测一致性；在构造了 ground truth 的受控 demo 中，函数级根因归因达到 100% precision。对真实商业应用，我们也通过屏幕录制、trace 对齐和开发者确认来验证报告的问题。

## 这篇工作对开发者有什么意义？

我觉得 Phantom Rendering 的价值不在于又发明了一个性能名词，而在于它把一个模糊问题变成了可测、可定位、可进入开发流程的问题。

以前开发者可能只能看到：

- 某个页面 CPU 偏高；
- 某个操作发热；
- 某些用户反馈耗电；
- profiler 里有一堆 call stack，但不知道哪些是“有用计算”。

HapPRDetection 想给出的答案更接近：

- 哪些交互触发了 Phantom Rendering；
- 哪些帧发生了“计算发生但无可见输出”；
- 哪些函数贡献了主要 wasted instructions；
- 这些问题是否可以进入 CI/CD，在开发阶段持续防止回归。

## 一点个人感受

这篇工作最让我喜欢的一点，是它没有停在“这个 App 很耗电”这种宏观观察上，而是往下追到了函数级的计算浪费。UI 性能问题往往很难写论文，因为它们既工程、又系统、又和真实交互强相关；如果只看 FPS，故事会很浅；如果只看 trace，开发者又很难行动。

Phantom Rendering 这个命名，本质上是在给一个长期存在但不太好描述的问题找边界：**不是所有没有上屏的计算都是 bug，但持续、昂贵、无视觉产出的 UI 计算应该被看见。**

这也是我对工具类研究越来越强的一个感受：好的工具不只是“能检测”，还要把开发者从一团性能现象里带到一个可以动手修的位置。

## 参考

- Paper: [Phantom Rendering Detection: Identifying and Analyzing Unnecessary UI Computations](/papers/hapray_fse.pdf)
- Code and data: [SMAT-Lab/PhantomRendering](https://github.com/SMAT-Lab/PhantomRendering.git)
- DOI: [10.1145/3797101](https://doi.org/10.1145/3797101)

---

*感谢华为团队在真实应用场景和系统分析上的支持，也感谢共同作者们把这个“不太容易被看见”的问题一路磨成了可以测量、可以定位、可以复现的研究。*
