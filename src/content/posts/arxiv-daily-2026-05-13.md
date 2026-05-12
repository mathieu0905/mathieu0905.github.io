---
title: "arXiv 每日速递 2026-05-13"
date: "2026-05-13"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-13

## 今日总结

今天这一批论文有一个明显的共同主旋律：**"on-the-fly agent loop"正在被 SE 化**。Shepherd 把 agent 执行 trace 形式化成 Git-like 数据结构、Engineering Robustness 这篇 position paper 直接喊出"AI 智能体在短路 SE 流程"、WildClawBench 强行把评估搬进真实 Docker harness，CppPerf 则把 C++ 性能修复变成可复现 benchmark——四篇论文在不同层面都在做同一件事：**给放飞自我的 agent 套上工程师的安全带**。如果你正在做 agent marginal value、agent evaluation methodology 或 program repair benchmark，今天的论文几乎可以打包当 related work 读。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Shepherd](https://arxiv.org/abs/2605.10913) | meta-agent runtime / execution trace | 把 agent runtime 形式化成 Lean-mechanized 模型，trace 用 Git 数据结构存，fork 比 Docker 快 5×，replay 95% 复用 prompt cache | ⭐⭐⭐ |
| [WildClawBench](https://arxiv.org/abs/2605.10912) | long-horizon agent benchmark | 60 个真实多模态任务，Docker + OpenClaw/Claude Code/Codex/Hermes 四种 harness，最强模型仅 62.2% | ⭐⭐⭐ |
| [CppPerf](https://arxiv.org/abs/2605.10890) | performance repair benchmark | 从 GitHub 自动挖 C++ 性能优化 commit，347 个可执行 patch，OpenHands 只能修 13.5% | ⭐⭐⭐ |
| [AI Workflow Store](https://arxiv.org/abs/2605.10907) | agent SE methodology (position) | 论证 on-the-fly agent 短路了 SE 流程，呼吁"AI Workflow Store"：硬化、可复用、可审计 workflow | ⭐⭐ |

## 今日主题：当 agent 撞上软件工程的墙

我们这一波研究者对 agent 的关注，已经从"agent 能做对吗"过渡到"agent 能被工程化吗"。今天这四篇论文从四个角度同时触碰到这堵墙：

第一，**trace 不是日志，是状态**。Shepherd 把 agent 每一次 tool 调用、每一次 filesystem mutation 都做成 Git-like 的 typed event，支持任意 commit 的 fork-and-replay。这跟博主一直在做的"公开 agent trace 大规模事后分析"哲学完全同源——但 Shepherd 把它从分析对象升级成了 first-class runtime primitive。

第二，**benchmark 在偷工减料**。WildClawBench 直白指出："short-horizon、mock service、final-answer check"这三件套已经支撑不住对 Claude Code 类 CLI agent 的真实评估。CppPerf 在 C++ 性能修复这个具体子领域里也喊出同样的话：竞赛题数据集 → 真实 GitHub commit。这两篇论文跟博主对"真实 vs 合成 benchmark 的偏差实证"的关切打在同一个鼓点上。

第三，**SE 流程被压缩成几秒的 LLM forward pass**。AI Workflow Store 这篇 position paper 把这种现象命名了——"on-the-fly synthesis"短路了迭代设计、严格测试、对抗性评估、分阶段部署。这跟博主"边际价值量化"思路的方向是同一个：当 agent 已经 work，你需要的不是更花哨的 prompt，而是 SE 学科 50 年沉淀下来的那套硬骨头。

四篇论文连起来读，其实在告诉做 AI4SE 的人一件事：**接下来值得做的不是 agent 框架，而是 agent 工程基础设施**——trace、benchmark、workflow store、可审计性。这跟博主"不做学术 rubbish，产出 benchmark / tool / guideline / dataset"的产出哲学完美对齐。

---

### Shepherd: A Runtime Substrate Empowering Meta-Agents with a Formalized Execution Trace

> **推荐理由**：把 agent execution trace 从"事后分析的日志"升级为"可 fork / replay 的 Git 数据结构"，这正是博主 marginal value 量化研究最缺的基础设施——它给"反事实重放"提供了形式化基底。

📌 **论文信息**：Simon Yu, Derek Chong, Ananjan Nandi, Dilara Soylu, Jiuding Sun | [arXiv:2605.10913](https://arxiv.org/abs/2605.10913) | cs.AI, cs.PL, cs.SE

#### TL;DR

把 agent 视为可被另一个 agent 操作的"目标进程"，每一次 agent-环境交互写入 typed event 形成 Git-like trace；fork 比 Docker 快 5 倍，replay 时 prompt cache 复用率 >95%，在 CooperBench pair coding 上把 pass rate 从 28.8% 拉到 54.7%。

#### 问题是什么？

现在你想做的事情有三类都被现有 agent runtime 卡死：

- **运行时干预**：你想在 agent 即将犯错时打断它、注入一个新提示，但典型 ReAct 框架根本没有"暂停-编辑-续跑"这个语义。
- **反事实 meta-optimization**：你想试三种 prompt、十种工具组合，看哪个更好。但每次重跑都要从 `git clone` 重新做起，状态/缓存全丢。
- **Tree-RL 训练**：你想在 trace 的某个分叉点拉 8 个 rollout 再选最好的回去训。但分支的成本就是把整个容器全复制一份。

本质问题：**agent runtime 没有把 "execution state" 当作一等公民**。状态散落在 LLM context、filesystem、subprocess、tool registry 里，谁都不能可靠地说"把整个 agent 在第 17 步的状态完整复制一份给我"。Shepherd 的答案是把 trace 升级成 Git 仓库。

#### 他们怎么做的？

**核心 Insight**：把 meta-agent 操作 target agent 这件事建模成一组**纯函数**，并在 Lean 里 mechanize 核心操作的语义；trace 设计成 typed event 链，支持任意祖先节点的 fork-and-replay。

具体方法流程：

1. **形式化建模**：用 functional programming model 描述 meta-agent → target-agent 的关系。trace 是不可变的 typed event 序列（tool 调用、文件写、subprocess 启动等），每个节点像 Git commit，有唯一哈希、有 parent 指针。
2. **底层快照**：fork 不靠 Docker，而是借助 OS 级 fork + CoW filesystem（论文报告 5× 快于 Docker，>95% prompt cache 复用）。这是让"分支探索"成本骤降的关键工程。
3. **三类应用串通**：runtime intervention（live supervisor）、counterfactual optimization（branch and pick best）、Tree-RL（fork rollouts at selected turns）共享同一套 trace primitive。

**跟之前方法的本质区别**：DSPy、AutoGen、OpenHands 之类把 agent 当一个"会调用工具的对话循环"——状态隐式藏在 chat history 里。Shepherd 把状态显式化为 Lean 中可推理的对象。这个差别类似 git 之于 zip 备份。

#### 关键结果

| 评估场景 | Baseline | Shepherd | 提升 |
|---------|----------|----------|------|
| CooperBench pair coding pass rate | 28.8% | 54.7% | +25.9pp |
| TerminalBench-2 (Tree-RL training) | 34.2% | 39.4% | +5.2pp |
| Branch exploration vs baselines (4 benchmarks) | — | 最高 +11pp | wall-clock −58% |
| Fork 速度 | Docker baseline | 5× faster | — |
| Prompt cache 复用率（replay 场景） | — | >95% | — |

**结果解读**：CooperBench 上 +25.9pp 这个数字非常猛——但要注意这是"加入 live supervisor"的设置，并不是 trace 本身的功劳，而是 trace 让 live supervisor 这种新机制变得可行。换句话说，提升真正来自的是 trace 解锁的**新设计空间**，而不是 trace 自身。这也意味着如果你只是想做事后分析，Shepherd 的工程价值要小一些；但如果你想做 counterfactual experiment 或 RL 训练，5× fork 速度和 95% cache 复用就是数量级差别。

#### 局限性与开放问题

- **局限 1**：CooperBench 是一个相对小众的 pair-coding benchmark；25.9pp 的提升在 SWE-bench Verified 上能否复现没有给出，这个差距可能很大。
- **局限 2**：Lean mechanization 听起来很正规，但实际验证范围有限——大部分操作（特别是涉及 LLM、subprocess、网络的）仍然只能用工程实现，形式化护栏其实是局部的。
- **开放问题**：当 trace 体量增大时，fork 5× 优势能否维持？论文没披露 CooperBench task 的平均 trace 大小。生产环境跑一个 8 小时的 deep research agent，trace 体量是 GB 级，CoW 优势可能被 page swap 抵消。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主之前"对 SWE-bench、OpenHands、Aider 日志做大规模事后分析"的范式，可以从只读分析升级为**可重放干预**。比如做"test execution 边际价值"这种实验时，可以在 Shepherd 上 fork agent 到"准备跑测试"的瞬间，一支不跑直接交 patch，另一支跑了再交，两个分支共享前面所有 cache。理论上这能把 ablation 的成本降一个数量级。

2. **具体实验想法（1–2 周可验证）**：拿 OpenHands 在 SWE-bench Verified 上的 100 个已公开 trajectory，用 Shepherd 复现到 "patch 提交前一刻"，然后在 fork 上做三种干预：(a) 删掉所有 test execution 步骤，(b) 删掉所有 file structure 注入，(c) 删掉所有 self-reflection。看每种干预对最终 pass rate 的影响。这个实验产出的就是博主一直在做的"agent design action 边际价值"曲线，但成本可能从几千美元降到几十美元。

3. **研究趋势判断**：execution trace 正在从"附属产物"变成"研究对象 + 工具"。今年明年的 AI4SE 大会上你应该看到一波基于公开 trace 的 ablation/marginal-value 论文。博主的"trace 大规模事后分析"路线只要再往前推半步，把"可干预 / 可分叉"加上，就能站在这个新生态的中心。

---

### WildClawBench: A Benchmark for Real-World, Long-Horizon Agent Evaluation

> **推荐理由**：博主"benchmark 合理性 + 真实 vs 合成偏差"的方法论关切，这篇直接动手做了一个 8 分钟、20 tool call、原生 CLI runtime 的 benchmark，对"agent 评估到底测到了什么"是一记重锤。

📌 **论文信息**：Shuangrui Ding, Xuanlang Dai, Long Xing, Shengyuan Ding, Ziyu Liu | [arXiv:2605.10912](https://arxiv.org/abs/2605.10912) | cs.CL

#### TL;DR

60 个人写的双语多模态任务，全部跑在真实 Docker 容器里、真实 CLI agent harness（OpenClaw、Claude Code、Codex、Hermes Agent）下；19 个 frontier 模型最强的 Claude Opus 4.7 也只到 62.2%，换 harness 同一个模型上下浮动 18pp。

#### 问题是什么？

主流 agent benchmark 现在已经普遍存在"合成失真"问题：

- **Sandbox 不像生产环境**：SWE-bench 跑在精心构造的 conda env 里，没有网络抖动、没有真实 OS quirk、没有交互式 prompt。
- **Mock service 把 IO 卷死**：很多 web agent benchmark 用 mock 服务回应，模型从未见过真实 API 错误。
- **Final-answer check**：只看最后一个字符串对不对，但实际过程可能搞坏了 filesystem 副作用。
- **Short-horizon**：大多 task 在 30 秒到 2 分钟内结束，跟生产里 Claude Code 用户 30 分钟一个 session 完全不是一个量级。

这造成了一个尴尬现实：所有 benchmark 都说 GPT-5/Claude 表现良好，但生产用户和 reviewer 实测都觉得 agent 经常"踩坑"。WildClawBench 要做的，是让 benchmark **跟用户实际体验对齐**。

#### 他们怎么做的？

**核心 Insight**：评估必须发生在**模型实际部署的那个 runtime 里**，并且任务必须长到能暴露长时序错误传播。

具体方法流程：

1. **真实 runtime**：60 个任务跑在可复现 Docker 容器里，容器里实际装了 OpenClaw / Claude Code / Codex / Hermes Agent 四种 CLI harness。同一个底层模型跑在不同 harness 上是独立打分。
2. **长时序 + 多模态**：每个 task 平均 8 分钟壁钟时间，>20 次 tool call，覆盖六大主题（视觉、网页、工具链、终端工作流等），双语（英文 + 中文）。
3. **三层混合评分**：deterministic rule check（命令成功、文件存在）+ environment auditing（真改了哪些 system state）+ LLM/VLM judge（语义正确性）。这套评分协议跟博主一直推崇的"自动 + 专家裁决 + 一致性校验"三层评估在哲学上完全对齐。

**跟之前方法的本质区别**：SWE-bench 评估"模型 + 一个固定 scaffold"的组合，scaffold 选择是隐式的；WildClawBench 把 harness 升级为评估的**显式自由变量**，让你能看到"harness 切换"本身能造成 18pp 的差距。

#### 关键结果

| 模型 + Harness | 总分 |
|---------------|------|
| Claude Opus 4.7 + OpenClaw（最强） | 62.2% |
| 其他所有 frontier 模型 | <60% |
| 同一模型切换 harness 差距 | 最高 18pp |

**结果解读**：18pp 的 harness 差异是真正应该让 agent 评估社区警觉的数字——它意味着如果你今天发一篇论文说"我们 agent 在 X benchmark 上达到 SOTA"，其中可能有 10pp+ 来自 scaffold 而非模型本身。这跟博主对"agent 设计动作边际价值"的关切是同一回事，只是换了个层次：scaffold 也是一个设计动作，它的边际价值可能比 prompt engineering 还大。

#### 局限性与开放问题

- **局限 1**：只有 60 个任务，统计功效偏弱。要做 McNemar 或 TOST 等价检验时，60 个样本对 18pp 差异是够的，但对 2–3pp 的细粒度差异就不够。
- **局限 2**："real-world"是模糊概念。论文里六大主题是研究者选的，跟工业生产环境里 Claude Code 用户实际任务分布有多少重叠不清楚。
- **开放问题**：harness 性能差异到底来自哪里？是 system prompt？是 tool schema？是 retry 策略？论文展示了差距但没拆解原因——这正是博主擅长做的"边际价值量化"切入口。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主"benchmark 合理性"研究里，可以借鉴 WildClawBench 的 **runtime + harness as variable** 这个评估设计。比如做 OpenHarmony 工具链评估时，把"评估 ArkTS LSP + LLM"做成显式正交因子，而不是糊在一起。

2. **具体实验想法（1–2 周可验证）**：拿一个固定模型（如 DeepSeek-V3 或 Qwen3-Coder-32B），在 SWE-bench Verified 上跑三套 harness：(a) OpenHands，(b) Aider，(c) 你自己 minimal scaffold。看三套之间 pass@1 的标准差有多大。预期：标准差 > 8pp。这个实验产出一篇"scaffold-induced variance: how much of agent SOTA is harness?"的方法论 paper，正好契合博主"benchmark 合理性"研究主线。

3. **研究趋势判断**：agent 评估正在从"看模型"转向"看 system"。未来一年应该会出现专门量化各种 scaffold 边际价值的论文。博主如果在这个时间点写一篇 "harness/scaffold 也是设计动作：在 OpenHarmony 工具链上的边际价值实证"，能直接卡在这个新方向的入口。

---

### CppPerf: An Automated Pipeline and Dataset for Performance-Improving C++ Commits

> **推荐理由**：博主一直在做的是 Python 兼容性修复和 ArkTS 修复，这篇把同一套思路（mining real GitHub patches + Docker reproducibility）推到 C++ 性能修复——方法论几乎可以直接挪用到 OpenHarmony / Cangjie 生态。

📌 **论文信息**：Tommy Ho, Khashayar Etemadi, Zhendong Su | [arXiv:2605.10890](https://arxiv.org/abs/2605.10890) | cs.SE

#### TL;DR

从 GitHub 自动挖 C++ 执行时间优化 commit，结合结构化 commit filter、LLM 分类器、容器化 build & test 流水线；产出 347 个真实 patch（39% 跨文件），来自 42 个成熟仓库；用 OpenHands 跑只能正确修 13.5%，说明 repo-level 真实性能 repair 远未解决。

#### 问题是什么？

性能修复 benchmark 一直被两个偏差污染：

- **竞赛题污染**：现有 C++ 性能 benchmark 大多来自 Codeforces/LeetCode 提交，那是单文件、小数据规模、有 oracle 输入的玩具。
- **语言偏差**：最近的 real-world performance benchmark 几乎全部是 Python（PerfBench）或 .NET，C++ 这种"实际系统软件最重要的性能优化场景"反而没有现代 benchmark。

但 C++ 性能修复的本质难点正是被语言/构建系统耦合放大的：跨文件的内联决策、模板特化、CMake 构建变体、ABI 兼容性。所有这些都不是 single-file Python script 里会出现的问题。

#### 他们怎么做的？

**核心 Insight**：要造出"工业级真实性能修复 benchmark"，必须把**整条 build & test 流水线容器化**，而不只是把 patch 文件存下来。

具体方法流程：

1. **CppPerf-Mine 管线**：(a) 结构化 commit filter（识别带性能关键词、影响热路径的 commit）；(b) LLM commit 分类器（区分真性能修复 vs 重构 / clean-up）；(c) 容器化 build & test stage（为每个 patch 产出可复现 Docker image）。
2. **CppPerf-DB 数据集**：347 个人工 verify 过的 patch，来自 42 个成熟 C++ 仓库；39% 多文件 patch（这是 repo-level repair 评估的关键）。
3. **Preliminary evaluation**：OpenHands 在 CppPerf-DB 上 13.5% 的修复成功率。

**跟之前方法的本质区别**：以前的 C++ perf benchmark = "compile + run + 比 runtime"；CppPerf 是 "build full image + run real test + 验证 perf regression test 通过"。前者像 unit test，后者像 integration test。

#### 关键结果

| 指标 | 数值 |
|------|------|
| Verified patches | 347 |
| 多文件 patch 比例 | 39% |
| 来源仓库 | 42 mature C++ repos |
| OpenHands 修复成功率 | 13.5% |
| 公开 Docker image / patch | 全部 |

**结果解读**：13.5% 这个数字非常说明问题。OpenHands 在 SWE-bench Verified 上能到 50%+ 量级，但在 CppPerf-DB 上掉到 13.5%——这个 40pp 的落差精确量化了 "Python single-file bug fix" 和 "C++ multi-file perf fix" 在 agent 视角下的本质难度差距。这个差距既来自 C++ 语言/工具链复杂度，也来自"性能"这个不可见但实际存在的 oracle。

#### 局限性与开放问题

- **局限 1**：347 个 patch 来自 42 个仓库，平均每个仓库 ~8 个 patch，仓库多样性其实有限——bench 可能过拟合到这几个仓库的代码风格。
- **局限 2**：性能 oracle 是 commit 时点的 perf test，而不是独立的 reproducible workload。如果原仓库 perf test 本身就脆弱（C++ 性能测试 noise 出名地大），benchmark 信号会被污染。
- **开放问题**：13.5% 的失败模式没拆解。是 build 失败？是性能没改善？是回归了正确性？这个失败分布对设计后续修复 agent 极其重要，但论文没给。

#### 💡 对我们的启发

1. **直接可用的技术点**：CppPerf-Mine 的"结构化 filter + LLM classifier + 容器化 build"这套三段式 pipeline，可以**1:1 复制到 ArkTS / Cangjie 仓库挖掘**上。博主之前做 Cangjie continued pretraining 时面临的核心问题就是"找不到高质量真实样本"。把同样的 pipeline 套到 OpenHarmony GitHub 镜像上，挖 ArkTS 性能修复 commit / Cangjie API 演化 commit，理论上能产出第一个 OpenHarmony 生态的真实 repo-level benchmark。

2. **具体实验想法（1–2 周可验证）**：在 OpenHarmony GitHub 上跑一个简化版 mining pipeline：(a) commit 消息含"性能"/"perf"/"optimize"/"卡顿"的 commit；(b) 用现成 LLM 二分类是不是真性能修复；(c) 在 DevEco Studio 容器里跑 build。先看挖出多少 candidate，验证 pipeline 在低资源生态下是否可行。这个 pilot 产出"OpenHarmonyPerf-Mini" 50 个 patch 的数据集 + pipeline 公开代码——直接打通博主 ArkUI phantom rendering 这条线和 LLM 性能修复这条线。

3. **研究趋势判断**：performance repair 正在从"对单文件 Python 优化"扩展到"对真实 C++/C++/Java/Rust 工程的优化"。OpenHarmony 这种新生语言生态如果有人率先做 perf benchmark，会成为整个生态的事实标准——而博主在 ArkTS / Cangjie 上的工具链积累恰好是别人没有的护城河。

---

### Engineering Robustness into Personal Agents with the AI Workflow Store

> **推荐理由**：这是一篇 position paper，但它精准命名了博主反复批评的现象——"on-the-fly agent loop 短路了 SE 流程"。读完会发现自己一直在做的"边际价值量化"研究，正是给这个 position 提供了实证支持。

📌 **论文信息**：Roxana Geambasu, Mariana Raykova, Pierre Tholoniat, Trishita Tiwari, Lillian Tsai | [arXiv:2605.10907](https://arxiv.org/abs/2605.10907) | cs.CR, cs.AI

#### TL;DR

主张当前 personal AI agent 的"几秒内合成 plan + 执行"主流范式，是在向用户交付"即兴 prototype"而非"production-grade system"；提议把成熟 SE 流程（迭代设计、严格测试、对抗评估、分阶段部署）拉进 agent loop，并在社区层面通过"AI Workflow Store"分摊严谨性的成本。

#### 问题是什么？

现在 personal agent 的主流范式是：

1. 用户给 prompt
2. agent 几秒内"合成"plan 和 tool chain
3. agent 立刻执行

这个范式有一个根本矛盾：现代软件能可靠运行靠的是 50 年 SE 沉淀的实践——iterative design、unit/integration/regression test、adversarial review、staged rollout、observability。而 agent 一秒合成的 plan，等于跳过了所有这些环节。结果是：agent 看起来 demo 很 cool，但用户在高风险场景里实际部署时会被坑得很惨——而且坑的方式是"不可预测、不可复现、不可审计"的。

作者把这个现象叫做 **flexibility-robustness tension**：on-the-fly 灵活性的代价就是 robustness 的全面缺失。

#### 他们怎么做的？

这是 position paper，不提供新方法，但提出几个关键 design principle：

**核心 Insight**：robustness 是社区可分摊的资产，不应该由每个 agent 在每次交互时重新发明。

具体主张：

1. **Workflow 不等于 Plan**：把"workflow"定义为"经过 SE 流程严格验证的、确定性约束的、可复用的 agent 程序"。它跟即兴合成的 plan 的差别，类似 git-tracked code 跟 ChatGPT 临时生成的 code。
2. **AI Workflow Store**：一个共享 registry，存放硬化过的 workflow。每个 workflow 都已经被 iterative design、adversarial eval、staged deployment 过滤过。agent 在面对用户请求时优先复用，而不是从零合成。
3. **成本分摊论**：单个 agent 不可能负担严谨 SE 流程的成本，但如果整个社区共享 workflow，分摊到每次调用的开销就可以接受。这跟开源软件的经济模型完全同构。

**跟之前方法的本质区别**：现有 agent infra（LangGraph、AutoGen、Crew）把 agent 当 "always synthesize"；workflow store 把 agent 重新定位为 "synthesize only when no hardened workflow exists; otherwise invoke"。

#### 关键结果

这是 position paper，**没有实验结果表**。但论文论证了几个值得关注的判断：

- on-the-fly agent 在高风险场景下不可避免地脆弱
- workflow 复用 + 社区共享是分摊 SE 成本的唯一可行路径
- 当前 agent infra 缺乏 workflow versioning、testing、staged rollout 的一等公民支持

#### 局限性与开放问题

- **局限 1**：position paper 没给量化实证。"on-the-fly 比 workflow 更脆弱"这个核心论点目前是直觉性的，等待实证支持——而这正是博主可以补的空缺。
- **局限 2**：workflow store 的治理模型没给清楚。谁能 publish？谁来 review？这跟传统软件包仓库（npm、PyPI）面临的同样治理问题，论文回避了。
- **开放问题**：workflow 的"硬化"成本到底有多高？如果硬化一个 workflow 比直接复用便宜的 prompt 贵 100×，分摊也救不回来。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主"agent 设计动作边际价值量化"研究产出的所有 ablation 表格（test execution +1.25pp、structure injection +X pp、self-reflection +Y pp 等），都是这篇 position paper 缺的 empirical 支持。换句话说：博主已有的工作是天然的"为什么 on-the-fly 不行"的实证基础。可以考虑把现有的几篇 marginal-value paper 串成一个 follow-up，主标题就是"Empirical Foundations for Hardened Agent Workflows: A Marginal Value Analysis"。

2. **具体实验想法（1–2 周可验证）**：拿一个固定 SE 任务（例如"修复 Python 3.8 → 3.12 兼容性问题"），分别测三种执行方式：(a) on-the-fly agent (OpenHands 默认)；(b) hardened workflow（手工设计的确定性 pipeline：static-analyze → LLM-fix → run-tests）；(c) hybrid（workflow 兜底 + agent 处理 fallback）。测三个维度：成功率、cost、variance。预期：hardened workflow 在 cost 和 variance 上碾压，agent 在 coverage 上略胜。这个实验直接给 AI Workflow Store 这篇 position 提供量化支撑。

3. **研究趋势判断**：未来一年 AI agent 社区会分裂成两派——"all-in agent synthesis"派 vs "agent 调用 hardened workflow"派。后者跟传统 SE 思路对接更紧，也更工业界友好。博主的研究哲学（"打成一片"+"产出 benchmark/tool/guideline"）天然站在后一派，这篇 position paper 提供了一个理论框架来包装现有工作。

---

## 方法对比

| 维度 | Shepherd | WildClawBench | CppPerf | AI Workflow Store |
|------|----------|---------------|---------|-------------------|
| 论文类型 | system | benchmark | benchmark | position |
| 核心贡献 | agent execution trace 形式化 + 高效 fork/replay | 真实 runtime / 真实 harness 的 60 任务 benchmark | 真实 C++ 性能修复 commit 容器化数据集 | 对 on-the-fly agent 范式的 SE 视角批判 |
| 解决的问题 | trace 不可分叉、不可重放 | benchmark 跟生产体验脱节 | C++ 性能 benchmark 全是玩具 | agent 短路了 SE 流程 |
| 实证 vs 主张 | 强实证（多 benchmark） | 强实证（19 模型 × 4 harness） | 强实证（OpenHands 13.5%） | 纯主张 |
| 数据需求 | 现成 agent + tasks | 60 个人工标注 task | GitHub commit mining | — |
| 计算开销 | 低（fork 比 Docker 快 5×） | 高（60 task × 多模型 × 4 harness） | 中（mining + Docker build） | — |
| 适用场景 | meta-agent 研究、ablation 实验、RL 训练 | 评估 CLI agent | 评估 perf repair agent | 思想框架 |
| 主要局限 | benchmark 偏窄、形式化范围有限 | 60 task 统计功效偏弱 | 仓库多样性不够 | 缺量化证据 |

---

今天的四篇论文加起来传达一个简单又重要的信号：**做 AI for SE 接下来最重要的事，不是再训一个更强的 coding LLM，而是给 agent 套上软件工程师的安全带——基础设施、benchmark、可审计性、可复用 workflow**。这跟博主"边际价值量化 + OpenHarmony 工具链 + benchmark 设计与方法论批判"三条主线完美交汇。如果说今年是 agent capability 大爆发的一年，那明年大概率就是 agent engineering 收紧的一年——而博主已经站在了这一波收紧的入口。
