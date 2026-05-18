---
title: "arXiv 每日速递 2026-05-19"
date: "2026-05-19"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-19

## 今日总结

今天的 cs.SE / cs.AI 列表里没有什么"全新方法"，但有 4 篇都在干同一件事——**戳破默认假设**。Compound agent 该堆 deliberation 还是该清结构？Layer pruning 的两种"等价"测试到底等不等价？LLM program synthesis 给分数好还是给反例好？修架构债的人是不是引入者真的不重要？这四篇用真实数据回答了这些"大家以为答案是显然的"问题，结论清一色反直觉。对一个把"LLM 边际价值实证量化"当主线的人来说，今天值得花两个小时仔细读。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Context, Reasoning, and Hierarchy](https://arxiv.org/abs/2605.16205) | Agent 边际价值实证 | 3,475 episodes 对照实验：状态抽象 +76% RPTS，"deliberation cascade" 反而最差 | ⭐⭐⭐⭐⭐ |
| [Property-Guided LLM Program Synthesis](https://arxiv.org/abs/2605.16142) | Program synthesis / repair | 用 counterexample 替代 score 反馈，候选数减少 7×，零 search 解题率反升 | ⭐⭐⭐⭐ |
| [Layer Equivalence Is Not a Property of Layers Alone](https://arxiv.org/abs/2605.16234) | 评估方法论批判 | Replacement vs Interchange 两个看似等价的 swap-KL 探针，给出几倍差距的剪枝结论 | ⭐⭐⭐⭐ |
| [Non-Self-Fixed Architecture TD](https://arxiv.org/abs/2605.16133) | SE 实证 / 工程质量 | Apache 大规模生命周期挖掘：架构债不是自己修的，时间到位会显著拉长 | ⭐⭐⭐ |

## 今日主题：方法论的"反默认"，比方法本身更值钱

今天这 4 篇可以串成一条主线：**当一个领域开始成熟，最有价值的论文不是"再提一个新方法"，而是把社区默认的评估方式/直觉信念压上对照实验，然后告诉你"它其实站不住"**。

第一篇直接对 compound agent 设计三大旋钮（context / reasoning / hierarchy）做 token-level cost accounting，发现"加更多思考"在所有 5 个 model family 上都比"光做 hierarchy"差——他们造了一个新词叫 *deliberation cascade*，这是一种系统性反直觉发现，正好就是博主在做"agent trace 大规模事后分析"的那个套路。第三篇更狠：去年大家都用"layer swap KL"评剪枝候选层，但作者发现这个名字下其实藏着两个不同协议，跨模型甚至能给出几倍差距的剪枝结论——一句话翻译就是"**你测的方法决定了你的发现**"。第二篇换了一个角度：与其用 score 反馈反复采样，不如把"性质"形式化，让 verifier 直接吐 counterexample，从而把 LLM 调用量压一个数量级。第四篇是纯 SE 实证，但拿到的结论同样"反默认"——架构债的修复人不是无关紧要的，谁来修和"修多久"高度耦合。

把这四篇放在一起看，你会发现一个隐含信号：**LLM × SE 这个交叉领域正在从"看 pass@1 涨没涨"过渡到"看你声称的因果信号到底有没有被 confound"**。这是博主自己研究路线（边际价值量化、benchmark 合理性、评估方法论）正在变得越来越主流的证据。

---

### Context, Reasoning, and Hierarchy: A Cost-Performance Study of Compound LLM Agent Design in an Adversarial POMDP

> **推荐理由**：这就是博主"agent 边际价值量化"主线的同代工作——3,475 episodes、5 个 model family、12 配置 × token 级核算，几乎是博主想做的实验的模板。结论"deliberation cascade"还反直觉。必读。

📌 **论文信息**：Igor Bogdanov, Chung-Horng Lung, Thomas Kunz, Jie Gao, Adrian Taylor | [arXiv:2605.16205](https://arxiv.org/abs/2605.16205) | cs.AI, cs.CL, cs.LG, cs.MA, eess.SY

#### TL;DR

把 compound LLM agent 拆成三个独立旋钮（输入表示、思考工具、层级分解），跨 6 个模型 12 个配置在 CybORG CAGE-2 网络防御任务上做对照。最大发现：**deliberation 工具放进 hierarchy 里反而比"只用 hierarchy"差 3.4 倍**，token 还多花 1.8–2.7 倍。

#### 问题是什么？

现在做 compound agent 的研究有一个尴尬现象——堆设计可以无限堆。你可以加 self-questioning、self-critique、self-improvement、CoT、把任务再拆成 sub-agents、给每个 sub-agent 套上不同 prompt……结果是论文越写越复杂、推理成本越涨越凶，但**没有人能告诉你哪个设计选项是真的有用、哪个是只是看着像有用**。

CAGE-2 这个 POMDP 测试场景里 reward 一直是非正的，所有 agent 都在失败缓解模式。这意味着差异不是来自"谁能赢"，而是"谁失败得不那么惨"——这种环境对暴露"deliberation 是不是真在帮忙"特别敏感。

#### 他们怎么做的？

**核心 Insight**：把 agent 设计正交化，每个设计选项独立可关——这样才能把"加了 X 的版本"和"没加 X 的版本"严格 1:1 对照，再配合 token-level 成本核算算出 *Return Per Token Spent (RPTS)*，而不是只看 absolute return。

具体流程：
1. **Context 维度**：raw observations vs 一个 deterministic state-tracking layer（把历史 observation 压缩成结构化状态）。这一对照检查"程序化结构注入"的价值。
2. **Deliberation 维度**：开/关 self-questioning、self-critique、self-improvement 三种工具，外加可选 CoT。检查"让 LLM 自己再想想"的真实回报。
3. **Hierarchy 维度**：单一 ReAct vs 委派给专门 sub-agent。检查任务分解的价值。
4. 用 token 计费按每个 episode 算 RPTS，避免只看 absolute return 被高 token 的方案"砸赢"。

**跟之前方法的本质区别**：之前的 compound agent 论文几乎都把这些设计当成"打包配方"，不做正交切分；他们这次把每根线都单独拽，这才让 *deliberation cascade* 这种"组合起来反而更差"的负向交互作用第一次被定量观测到。

#### 关键结果

| 设计选项 | 结果 | 解读 |
|---------|------|------|
| 程序化状态抽象 vs raw observation | 平均 return 最多提升 **76%** | Context engineering 是单位 token 回报最高的设计动作 |
| Hierarchy + deliberation 工具 | 比纯 hierarchy 差最多 **3.4×** | 即著名的 deliberation cascade |
| Hierarchy + deliberation 的 token 开销 | 多花 **1.8–2.7×** tokens | 更贵 + 更差，纯负向 |
| 5 个 model family | 全部观察到 cascade | 不是单模型 artifact |

**结果解读**：这个论文最大的看点不是"做对照实验"——而是"对照实验拿到的结论恰好是社区直觉的反面"。大家普遍相信"让 agent 多想想总没错"，可一旦放进 hierarchy 内部，这种额外 deliberation 反而引入 noise、token 也炸。这种发现只有用 RPTS 这种"成本归一化"指标才能稳定看到，单看 absolute return 一不小心就会被 deliberation 配置里"偶尔赢一次"的高方差骗过去。

#### 局限性与开放问题

- **局限 1**：CAGE-2 是一个高度对抗的 POMDP 网络防御任务，return 全是负的。这个任务结构很特殊——deliberation cascade 在 SWE-bench、HumanEval 这种"正向 reward 占主导"的代码任务里会不会同样出现？仍是开放的。
- **局限 2**：所有评估都基于 30-step horizon。在更长的 trajectory（比如真实 SWE-bench 上动辄上百步）里，deliberation 的"摊销价值"可能更高。
- **开放问题**：他们提出了"程序化基础设施 > 更深 per-agent 思考"的设计原则，但**没有给出何时去 deliberation 是有益的边界条件**。SE 任务里我们经验上知道 self-critique 在 patch 验证阶段往往有用，这与 CAGE-2 的发现存在张力。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主之前做的 agent trace 边际价值分析（比如 test execution 只贡献 1.25pp）和这篇方法骨架几乎完全一样——**正交切分 + 成本归一化指标**。可以直接借鉴他们的 RPTS 公式（return ÷ 总 token），把现有的 SWE-bench trace 分析里"不同设计动作的边际收益"重新算一遍 token 归一化版本。
2. **具体实验想法（1-2 周内可验证）**：在 SWE-bench Verified 公开 trace 上挑两组——同模型同 harness 但一个开 self-critique 一个不开。算 (a) absolute pass@1 提升 (b) Cost-Per-Solve 反向指标。**假设**：如果在 SE 场景能复现 deliberation cascade，那 self-critique 应该 pass@1 上看着略涨但 Cost-Per-Solve 反而恶化；如果 SE 场景反过来，那 deliberation cascade 是网络防御任务的局部现象，需要写一篇"SE 任务里 deliberation 的边界条件"论文。无论结果哪一边，都是发表点。
3. **研究趋势判断**：从 2025 下半年开始，compound agent 的"加东西就涨"叙事正在退潮，2026 这一年会有大量"减东西反而涨"的论文出来。博主把研究主线压在"边际价值实证"是踩在节奏上的——下一步应该多储备 *负向发现*（哪些组件其实没用甚至有害），这是当下最缺、也最容易出影响力的论文角度。

---

### Property-Guided LLM Program Synthesis for Planning

> **推荐理由**：用 counterexample 替代 score 反馈做 program repair——这正是博主"静态信号驱动迭代修复"+"职责切分哲学"思路的另一个领域落地。方法可以直接迁移到 dependency / compatibility repair。

📌 **论文信息**：Augusto B. Corrêa, André G. Pereira, Jendrik Seipp | [arXiv:2605.16142](https://arxiv.org/abs/2605.16142) | cs.AI, cs.LG

#### TL;DR

不要再让 LLM "看分数猜哪里错了"——把"程序应当满足的性质"形式化，verifier 一旦发现违反就吐出一个具体反例给 LLM 看。结果是程序生成数减少 7×、零搜索解题率反升、计算量降几个数量级。

#### 问题是什么？

LLM program synthesis 现在的主流套路：让 LLM 写一个候选程序、给它打分（pass 多少 test、reward 多少）、重新采样、再打分。问题是**分数本身告诉不了 LLM 任何"哪里错"**——它只告诉 LLM "更好" 或 "更差"。这就像你跟一个学生说"你这次考了 73 分"——他没法据此修改具体的某一道题。

结果是大量 LLM 调用浪费在"无效采样"上：模型反复重写整个程序，连续生成 100 个全部失败，仅仅因为它每次都触碰同一个 corner case 而模型根本不知道这个 corner case 长什么样。

#### 他们怎么做的？

**核心 Insight**：把"程序质量"从"标量分数"升级成"可形式化检验的性质"。一旦违反，**返回的不是分数变化，而是具体的反例输入**——这个反例直接告诉 LLM "你写的程序在这个状态下不满足某个约束"，于是下一次修复有具体抓手。

具体流程：
1. **形式化目标**：在 PDDL planning 域里，他们要 LLM 合成一个 heuristic function $h$，要求"每个可达状态都有一个严格改善后继"（直接 heuristic 性质）。这是一个可验证的全称命题。
2. **counterexample-guided repair loop**：LLM 生成一个候选 → verifier 在训练集上检查性质 → 找到第一个违反样例 → 把这个具体状态/路径打回给 LLM 让它修。
3. **早停**：性质一旦违反就立即停止评估，不再继续浪费 tokens。
4. 训练集和测试集是 out-of-distribution 的（不同问题分布），所以是真泛化。

**跟之前方法的本质区别**：以前的 score-based 范式是 RL 思路（采样 + reward），这里走 verification 思路（候选 + counterexample）。结果是 sample efficiency 一下子上去了——因为每次反馈不是 1 bit（更好/更差），而是高信息量的具体反例。

#### 关键结果

| 指标 | Score-based baseline | Property-guided | 倍数 |
|------|---------------------|-----------------|------|
| 平均每个 domain 生成程序数 | 强基线 N | N / **7** | 7× 减少 |
| 零搜索就能 hill-climb 到目标的测试任务比例 | 较低 | "virtually all" | 显著提升 |
| 评估候选所需计算 | baseline | **几个数量级**更少 | early-stop 的功劳 |
| Out-of-distribution test set | 仍能泛化 | 性质几乎在所有任务上成立 | — |

**结果解读**：7× 数减少 + 早停带来的"几个数量级"计算节省，意味着这个范式的成本曲线和 score-based 完全不在一个量级上。最有意思的是 zero-search 解题——说明合成出来的 heuristic 本身就是 *direct*（每步都严格改善），这是性质驱动反馈带来的"质量"提升，不只是"数量"减少。

#### 局限性与开放问题

- **局限 1**：依赖"可形式化的性质"。Planning 域里这个性质恰好是全称命题（每个状态有改善后继），可以用 planner reachability 来 verify。但**真实 SE 任务里多数性质不可形式化**——比如"这个 patch 真的修了 bug"在没有 oracle test 的情况下根本无法 verify。
- **局限 2**：counterexample 是"第一个违反样例"，没有 prioritize 反例信息量。某些反例可能比另一些反例更具有 diagnostic value（覆盖更多隐藏 bug），但他们没做这块。
- **开放问题**：这个方法的 sweet spot 是"性质便宜可验证 + 程序难写"。在 dependency repair 这类问题里，"性质"可以是"upgraded API 不破坏现有 test"——这正好是博主一直在做的方向，相关度极高。

#### 💡 对我们的启发

1. **直接可用的技术点**：把博主"compatibility repair"路线里的反馈机制升级——目前如果用 score-based（pass@1 / test 通过率）来 guide LLM 改 patch，可以改成 *property-guided*：每个 dependency upgrade 对应若干 invariant（"原版 API 调用点在新版本仍能 type check / 仍能跑通这个 micro test"），违反时把违反样例当反例打回 LLM。
2. **具体实验想法**：拿博主已有的 Python compatibility repair benchmark，复制两条 pipeline——(a) 原 LLM repair 用 "test 通过数" 做反馈、(b) 改造成 property-guided："仅在第一个违反 invariant 处 early-stop 并返回具体 callsite + 失败 trace 给 LLM"。**假设**：在同 LLM budget 下，property-guided 的 fix rate 应当显著高于 score-guided，差距主要来自"减少无效 retry"。如果差距 > 5pp 这就是一篇直接可投的论文。
3. **研究趋势判断**：2026 LLM × SE 一个明显的方向是"verifier 不再是 oracle 而是 active feedback source"。把 static analyzer / type checker / runtime trace 都当成 verifier 接 LLM 上去（不是只用来打分，而是用来吐反例），这个方向今年应该会出 5–10 篇 SE 顶会论文。博主有静态分析基础（HomeCheck），完全占位优势。

---

### Layer Equivalence Is Not a Property of Layers Alone: How You Test Redundancy Changes What You Find

> **推荐理由**：评估方法论批判教科书级别的范例——揭示两个"看似等价"的 swap-KL 协议其实给出几倍差距的剪枝结论。和博主"benchmark 合理性"主线高度对位。

📌 **论文信息**：Gabriel Garcia | [arXiv:2605.16234](https://arxiv.org/abs/2605.16234) | cs.LG, cs.AI, cs.CL

#### TL;DR

社区在测 transformer layer "等不等价" 时混用两个不同协议——*replacement*（A 替换 B 的位置）和 *interchange*（A 和 B 互换位置）。两个都是 swap-KL，名字也都听起来一样，但在 Qwen3-8B 上 interchange 的"安全剪枝预算"是 replacement 的几倍。**你换个协议，被认为冗余的层就完全换一批。**

#### 问题是什么？

模型压缩里有一类工作叫 *layer pruning*——找到"冗余"的 transformer layer 直接干掉。判断冗余的方法一般是 swap layer 然后看输出 KL：KL 小就说明这层可有可无。问题是这一套"swap 测试"在不同论文里实际指代两个不同操作：

- **Replacement**：把第 i 层的输出函数直接换成第 j 层的（i 位置变成 j 的行为）
- **Interchange**：把第 i 层和第 j 层的位置整个调换（看看交换后还能不能跑）

两者听起来都叫"看看这两层能不能互相替代"，但数学上不等价——而社区基本不区分。

#### 他们怎么做的？

**核心 Insight**：分别测两个协议、跨多个 checkpoint 和模型规模，看它们的 swap-KL 差值（"协议 gap"）。

具体方法：
1. **训练轨迹分析**：在 Pythia 410M / 1.4B 的训练 checkpoint 上跑两个协议，发现 gap 从初始化到收敛是单调拉开的——**模型越成熟，两个协议越不一致**。
2. **大模型横向**：在 Qwen3-8B 和 Llama-3.1-8B 上用同一份 WikiText-2 contract，观察"哪些层可以剪"。
3. **不只看 KL 还看实际 pruning 后果**：因为 KL 小不见得 pruning 安全，反过来也成立。

**跟之前方法的本质区别**：之前的工作选一个协议就报结果，没人去做 cross-protocol 对照。他们做了，然后发现两个协议的发现"不可互换"——不是"差一点"，而是 *several-fold*。

#### 关键结果

| 模型 | 现象 | 影响 |
|------|------|------|
| Pythia 410M / 1.4B | Replacement-interchange gap **从训练初期到收敛单调拉开** | 模型越收敛，两个协议越不一致 |
| Qwen3-8B | 同样 layer budget 下，interchange-guided 剪枝**比 replacement-guided 安全好几倍** | 选错协议直接选错剪的层 |
| Llama-3.1-8B | 两个协议给的剪枝代价持平，**即使 interchange KL 更低** | 揭示"低 KL"≠"低 pruning cost" |

**结果解读**：最让人警醒的是 Llama-3.1-8B 那条——interchange KL 更低，按"小 KL = 冗余"的逻辑应该剪 interchange-recommended 层，但实际 pruning 代价两边持平。这说明 swap-KL 这个 metric 本身和"删了之后还能用"是有间接关系的（且 model-dependent），这一条戳破了过去几年好几篇压缩论文的隐含假设。作者给出的实操建议简洁：**剪之前两个 KL 都算一次**，diagnose-only，零成本。

#### 局限性与开放问题

- **局限 1**：只测了三个模型家族（Pythia / Qwen3 / Llama-3.1），没有覆盖 MoE、reasoning model 这些结构差异更大的家族。
- **局限 2**：用的是 WikiText-2 的固定 contract，对长序列和 code-domain 是否成立未知——SE 任务里我们最关心的恰恰是 code domain。
- **开放问题**：作者只给出了"protocol gap 客观存在"的诊断，**没有给出何时该选哪个协议**。这是后续论文的天然 follow-up。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主的"benchmark 合理性"和"评估方法论批判"路线里，这种"两个协议听起来一样但其实不一样"的分析模板完全可以迁移到 SWE-bench 上。比如同一个 task 的"resolved" 在不同 harness 下定义就不一样（test 全过 vs test 通过率 ≥ X），这正是另一个"protocol gap"，但目前没有人量化。
2. **具体实验想法**：在 SWE-bench Verified 上取 5 个公开 trace（OpenHands、Aider、SWE-agent 等），对同一组任务计算两种 "resolved" 定义下的 pass rate——(a) 全部 hidden test 通过 (b) 全部 hidden test 通过且无 regression on 已有 test。**假设**：两种定义会在 ~5–15% 的任务上给出不同答案，且差异分布在不同 agent 上不一致。如果差异 > 10%，就可以写一篇"SWE-bench resolved 定义协议 gap"的方法论论文。
3. **研究趋势判断**：2026 的 LLM 评估论文越来越多在做"我们以为在测同一个东西其实在测两个东西"——这是领域成熟的信号。博主已经在做这一类（Cohen κ / Gwet AC1 一致性分析），可以再上一层：**把"评估协议 gap"作为一个独立的 contribution 类别去攻**。

---

### The Dangers of Non-Self-Fixed Architecture Technical Debt and Its Impact on Time-to-Fix

> **推荐理由**：纯 cs.SE 实证、Apache 大规模生命周期挖掘——和博主"被忽视的工程质量维度"主线对位。方法（survival analysis）也很值得借鉴。

📌 **论文信息**：Edi Sutoyo, Paris Avgeriou, Andrea Capiluppi | [arXiv:2605.16133](https://arxiv.org/abs/2605.16133) | cs.SE

#### TL;DR

挖了大批 Apache 项目的 Jira + git history，发现：**架构债如果不是引入者本人来修，时间到位会显著拉长**——尤其在多人共同修改 ATD 受影响文件的情况下。换言之，"谁修"对"修多久"是一个被严重低估的预测因子。

#### 问题是什么？

Technical Debt 研究有大量论文在算"多少 ATD"、"哪些项目 ATD 多"，但**"谁来修"这个变量基本没人正面研究过**。直觉上你可能觉得这无所谓——反正最后能修就行。但作者的猜想是：**架构债涉及大量隐性设计 rationale，引入者本人是 rationale 最完整的载体**；换人修就要付一笔信息检索成本，这个成本和 time-to-fix 强耦合。

#### 他们怎么做的？

**核心 Insight**：架构债的修复责任归属不是一个 nominal feature，而是一个能预测修复时长的因果信号。

具体方法：
1. **数据集构建**：从 Jira issue + git commit 两边重建 ATD 生命周期，对每个 ATD item 标注"引入者" + "修复者"，区分 *self-fixed* / *non-self-fixed*。
2. **三个研究问题**：(a) self-fixed 占比多少？(b) self-fixed vs non-self-fixed 修复时长差异显著吗？(c) 哪些 code change / collaboration metrics 影响修复速度？
3. **统计方法**：描述统计 + 非参数检验 + **survival analysis**（这一点很关键，因为 ATD 寿命数据是右截尾的）。

**跟之前方法的本质区别**：之前的 ATD 研究几乎都是横截面分析（这个项目有多少 debt），他们走的是 *lifecycle* 视角——把每个 debt item 当成一个事件序列来 fit 生存模型。

#### 关键结果

| 维度 | 发现 |
|------|------|
| Self-fixed vs Non-self-fixed ATD 修复时长 | **分布显著不同**，non-self-fixed 拉长尾巴 |
| 多人共同修改 ATD 文件 vs 单人 | Non-self-fixed 在多人协作下**更倾向于长期不被解决** |
| Survival analysis 风险比 | Non-self-fixed 显著 hazard ratio < 1（即"更慢被修") |
| 行动建议 | 谁引入 ATD 谁参与修复 + 修复时显式记录 design rationale |

**结果解读**：survival analysis 这个工具用得很对——它告诉你的不是"平均拖多久"，而是"在任意时间点，这个 debt 还没被修的概率"。这种 framing 对 SE 实证的好处是：**它直接对应到工程师每天感受到的"这个 issue 堆在 backlog 里多久了"**，是个能落地的指标。

#### 局限性与开放问题

- **局限 1**：仅在 Apache 开源项目上做。Apache 的 governance 风格强调代码 review 和 paper trail，封闭企业项目（信息不对称更大、人员流动率不同）结论可能不同。
- **局限 2**：ATD 的识别依赖 Jira 标签，**漏报严重**——没被标为 ATD 但实际是的，不进数据集。
- **开放问题**：他们给的建议是"让引入者参与修复"或"显式记录 rationale"，但**没有评估 rationale 文档是不是真的能让 non-self-fixed 修得更快**。这是一个天然的 follow-up：做一个对照——有 design rationale 的 ATD vs 没有的 ATD，看 hazard ratio 差距。

#### 💡 对我们的启发

1. **直接可用的技术点**：survival analysis 这个工具博主可以直接迁移到自己的 agent trace 分析。比如分析 SWE-bench 上的某些任务"在多少步内被解决"，可以拟合一个 Kaplan-Meier 曲线，按 model / agent harness 分组——比单看 pass@1 信息量大得多，因为它顺便回答"这个 agent 在哪个步骤区段失败最多"。
2. **具体实验想法**：博主一直在做"tangled commit / atomic commit"——这正是 ATD 修复相关的工程质量维度。可以做一个 small-scale 实证：从 SWE-bench Verified 公开 trace 中挑出 agent 生成的 patch，按 "atomic / tangled" 标签 + "引入者参与状态"分类，然后看哪个分类下 patch 的 reviewer-accept 率高。**假设**：tangled patch 更倾向于在 reviewer 处被打回，且打回时间更长——这是 ATD 论文方法论的 SE × agent 版本。
3. **研究趋势判断**：cs.SE 里"用现代统计方法（survival analysis、Bayesian、multi-level model）重新做 mining studies"正变成一条 underexploited 主线。博主之前用过 McNemar / TOST，再加 survival analysis 就足够完整地把"agent 工程质量维度"的方法论工具箱搭起来。

---

## 方法对比

| 维度 | Compound Agent Cost-Performance | Property-Guided Synthesis | Layer Equivalence Protocols | Non-Self-Fixed ATD |
|------|--------------------------------|---------------------------|------------------------------|---------------------|
| 核心方法 | 正交切分 + RPTS 成本归一 | counterexample 替代 score 反馈 | 跨协议 swap-KL 对照 | survival analysis on ATD lifecycle |
| 数据需求 | 3,475 episodes 多 model | PDDL planning 域 + verifier | Pythia/Qwen3/Llama 训练 checkpoint | Apache 大型 OSS 项目 Jira + git |
| 计算开销 | 中（多模型多配置） | 极低（counterexample early-stop） | 低（只需 forward pass） | 极低（统计分析） |
| 适用场景 | 任何 compound agent design ablation | 可形式化性质的程序合成 | 模型压缩 / 剪枝 / 等价分析 | 任何有 issue tracker + VCS 的项目 |
| 主要局限 | CAGE-2 任务结构特殊 | 性质必须可形式化 | 只覆盖 dense decoder LLM | 仅 Apache 治理风格 |
| 对博主借鉴价值 | RPTS 公式可直接迁移到 SWE-bench 分析 | property-guided 反馈可改 compatibility repair | "评估协议 gap"模板可迁移到 SWE-bench resolved 定义 | survival analysis 可融入 agent 工程质量维度研究 |
