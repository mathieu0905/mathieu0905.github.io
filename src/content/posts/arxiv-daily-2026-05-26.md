---
title: "arXiv 每日速递 2026-05-26"
date: "2026-05-26"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-26

## 今日总结

今天 (5/22 cutoff) 的论文流里出现了一个清晰的信号：**"agent skill" 正在从一个工程技巧上升为一个独立的研究对象**。SkillOpt 把 skill 当作 frozen agent 的 external state 来训练，OpenSkillEval 用 600+ 动态任务系统揭示了 "30 个流行开源 skill 中相当一部分根本不 work"，"From Raw Experience to Skill Consumption" 把 skill 的整个 lifecycle 拆开做实证分析。与此同时，Agentic Proving for Program Verification 在另一条线揭示了一个更尖锐的事实——Claude Code 在 CLEVER (Lean 4) 上已经做到 87.5% 验证、98.1% end-to-end，把 program verification benchmark 直接打爆了。这四篇论文共同传递的信号是：**在 agent capability 时代，"能力评估" 本身比 "能力提升" 更难**。这正是博主"边际价值实证量化 + benchmark 合理性"主线最关心的两个支点。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Agentic Proving for Program Verification](https://arxiv.org/abs/2605.23772) | program verification / benchmark | Claude Code 在 CLEVER 上 87.5% 验证 / 98.1% e2e，暴露 isomorphism scoring 失效 | ⭐⭐⭐ |
| [SkillOpt: Executive Strategy for Self-Evolving Agent Skills](https://arxiv.org/abs/2605.23904) | agent skill optimization | 把 skill 训练成 frozen agent 的 external state，6×7×3 网格全场最佳 | ⭐⭐⭐ |
| [From Raw Experience to Skill Consumption](https://arxiv.org/abs/2605.23899) | skill lifecycle empirics | 系统揭示 strong extractor ≠ strong consumer，negative transfer 非平凡 | ⭐⭐⭐ |
| [OpenSkillEval: Auditing the Open Skill Ecosystem](https://arxiv.org/abs/2605.23657) | skill ecosystem audit | 30 个开源 skill / 600+ 任务系统评估，popular 不等于有用 | ⭐⭐⭐ |
| [Strong Teacher Not Needed?](https://arxiv.org/abs/2605.23857) | distillation pretraining | 弱 teacher 也能 distill 出好 student，挑战 "更强 teacher 更好" | ⭐⭐ |

## 今日主题：Agent Skill 时代的"能力评估"危机

过去两年 agent 研究的"能力提升"叙事都在转向一个新的承载体：**skill**——结构化的、用自然语言写的、可复用的程序性知识（不是 weights，不是 prompt）。Claude Code 的 plugin/skill 生态、Codex 的 system prompt、各类 agent framework 的 playbook，都是同一种东西。

今天的四篇论文不约而同地在做同一件事：**把 skill 抽出来当作一个独立可研究的客体**。然后用边际价值方法论拷问它。

- SkillOpt 问的是：能不能像训练 weights 一样训练 skill？答案是能，且能赚到 +20pp 的 average lift。
- "From Raw Experience to Skill Consumption" 问的是：skill 真的总是有用吗？答案是不一定，存在 non-trivial negative transfer，且 extractor / consumer 各有强弱。
- OpenSkillEval 问的是：用户从 marketplace 拿到的开源 skill 真能涨点吗？答案触目惊心——很多流行 skill 实际上没有 outperform base agent。
- Agentic Proving 问的是：现在的 program verification benchmark 还够用吗？答案是 Claude Code 已经把它打爆了，连给分都不会给（isomorphism scoring 大量误判）。

放在一起，这就是当下 agent 研究最尖锐的一根刺：**模型 / agent / skill 的能力都在指数提升，但评估方法落在线性甚至常数复杂度上**。博主长期做的 "agent 边际价值量化" 和 "benchmark 合理性批判" 在今天这批论文里得到了多方向的回响——这也意味着，做"评估方法论"的窗口期可能比做"新 method"的窗口期更大。

---

### Agentic Proving for Program Verification

> **推荐理由**：直接评估 Claude Code 在 program verification 任务上的真实边际能力，且以非常具体的数据揭示了 isomorphism-based benchmark scoring 已经失效——这是博主"agent 边际价值 + benchmark 合理性"两条主线在同一篇论文里的交集。

📌 **论文信息**：Alessandro Sosso, Akhil Arora, Bas Spitters | [arXiv:2605.23772](https://arxiv.org/abs/2605.23772) | cs.AI, cs.LO, cs.PL, cs.SE

#### TL;DR
把 Claude Code 套进一个简洁的 agentic proving framework，丢进 CLEVER (Lean 4 verified code generation benchmark)，结果：spec 生成 98.8%、impl 验证 87.5%、end-to-end 98.1%。论文不只是报告"成功率高"，而是指出 isomorphism scoring 把大量正确 spec 判错——benchmark 自己已经撑不住模型的能力了。

#### 问题是什么？
CLEVER 是当前评估 verified code generation 的代表性 benchmark：给一个自然语言 spec，让模型生成 Lean 4 的 formal specification、实现代码，以及证明 implementation 满足 spec。这个三段式管线传统上被认为对 LLM 极不友好——需要严格的形式语义、与 Lean 4 compiler 交互、避开各种 tactic 陷阱。

但作者发现一个反差：业界普遍认为 LLM "做不了 verified codegen"，可是没人在 *最新的* agent 上认真跑过这个 benchmark。compile-in-the-loop + agentic retry 这种范式可能跟单次 generation 完全不是一个层次。问题不是 "LLM 能不能做"，而是 "我们的 benchmark 还能不能区分能做的 LLM"。

#### 他们怎么做的？
**核心 Insight**：用 tight compiler-in-the-loop agentic paradigm 去跑现有 benchmark，把"模型能力" 与"benchmark 鉴别力"分开测。

具体方法流程：
1. **Agentic 框架**：直接用 Claude Code，让它在 CLEVER 每个问题上跑 spec generation / impl verification / end-to-end 三种模式
2. **三阶段评分**：(a) spec 是否 arguably valid（人工 + isomorphism scoring 双轨）；(b) impl 是否能通过 ground-truth spec 的 verification；(c) end-to-end 是否成功
3. **失败分析**：人工 review 模型自己产生的 feedback，统计 "失败的根因"——结果发现 Claude 自己的诊断质量很高

**跟之前方法的本质区别**：之前 verified codegen 研究多数把 LLM 当成 *单次* generator，本文把它当成 *带 compiler feedback loop 的 agent*。两者根本不是一个 setup。

#### 关键结果

| 阶段 | Pass Rate | 备注 |
|-----------|------|---------|
| Spec 生成 (arguably valid) | 98.8% | 人工/语义合理 |
| Spec 生成 (isomorphism scoring) | 81.3% | 自动评分 |
| Implementation 验证 | 87.5% | 对 ground-truth spec |
| End-to-end (self-consistent) | 98.1% | 在 premises 一致的条目上 |

**结果解读**：
- 最值得注意的不是 98.1%，而是 98.8% vs 81.3% 之间的差距——大约 17.5 个百分点的 spec 是 "正确的但被 isomorphism scoring 判错"。这意味着 benchmark scoring 本身在制造假阴性，而且量级很大
- 87.5% 的 impl verification 对应一个事实：Claude Code 在 Lean 4 这种小众形式系统里，已经能跑通绝大多数 toy-to-medium 验证任务。前 verified codegen 圈子普遍认为的"非 ITP 专家不可能"假设可能要重写
- 论文还提供了 "Claude 自己审查自己的失败" 的高质量分析——agent 不仅在做，还在解释自己为什么没做对

#### 局限性与开放问题

- **局限 1**：CLEVER benchmark 的 proof obligation 在工业 verified codegen 标准下偏简单。这套结果不能直接外推到 seL4 / CompCert / 大型 dependently typed proof 的规模
- **局限 2**：只测了一个 agent（Claude Code）和一个 model。论文没有横向对比 Codex、OpenHands、Aider 等，所以"agentic paradigm 通杀"还是"Claude Code 特别强"分不开
- **开放问题**：isomorphism scoring 失效了，那应该用什么？论文呼吁 "bug-resilient evaluation methodologies" 但没给出建设性方案。这本身就是一个独立可发表的研究问题

#### 💡 对我们的启发

1. **直接可用的技术点**：博主在做 ArkTS / HarmonyOS 静态分析 + 修复时，可以借鉴本文的 "三阶段评分 + isomorphism 失效率"分析范式。我们的 HomeCheck 修复 pipeline 完全可以类比成 spec → impl → verification 三段，且我们也面临 "auto scorer 判错" 问题（auto + 专家裁决三层评估协议正是这个）。本文给出了一个具体可借鉴的 "scorer 失效率 = 17.5pp" 类指标
2. **具体实验想法**：用 Claude Code 跑一遍 SWE-bench-verified 中 program repair 子集，对比 "OpenHands 默认 framework / Aider / Claude Code 原生" 三种 agent harness，单变量只换 harness。预期观察：harness 之间差距 ≥ model 之间差距。如果成立，那就直接得到一个 LASER 级别的 finding——agent harness 的边际价值被低估
3. **研究趋势判断**：当模型变强，"benchmark 失效率"会成为下一个研究热点。"benchmark forensics"（评估评分系统本身）可能是博主未来 1-2 年里 high-leverage 的选题方向

---

### SkillOpt: Executive Strategy for Self-Evolving Agent Skills

> **推荐理由**：把 agent skill 当作"frozen agent 的 external state"，并用类似 weight optimizer 的纪律去训练它——这种"text-space optimizer"框架是博主"边际价值实证量化"哲学的天然延伸：每一个 edit 都必须严格改善 held-out validation 才被接受。

📌 **论文信息**：Yifan Yang, Ziyang Gong, Weiquan Huang, Qihao Yang, Ziwei Zhou | [arXiv:2605.23904](https://arxiv.org/abs/2605.23904) | cs.AI, cs.CL

#### TL;DR
SkillOpt 是一个文本空间的 skill optimizer。一个独立的 optimizer model 把 scored rollouts 转成 bounded add/delete/replace edits，在单份 skill document 上小步迭代，**仅当 held-out validation 严格改善才接受**。在 6 benchmark × 7 model × 3 harness (direct chat / Codex / Claude Code) 共 52 个 cell 上全场最佳或并列。

#### 问题是什么？
今天的 agent skill 普遍是手写的、一次性生成的，或者用粗放的 self-revise 流程演化出来的。这些方式都不像 deep learning optimizer——没有 controlled learning rate、没有 validation gate、没有 reject buffer。结果就是 skill 改了之后好不好都说不清，更不要说提供可复现的提升曲线。

作者的反例式问法非常有冲击力：**如果 weights 训练都要用 SGD + validation + 严格的 lr schedule，凭什么 skill 训练就可以随便改？**

#### 他们怎么做的？
**核心 Insight**：skill = frozen agent 的 external state。state 当然可以训练，关键是要把"训练 skill"做得像"训练 weights"一样有纪律。

具体方法流程：
1. **Edit 空间**：每次只允许 bounded add/delete/replace（限制 edit 幅度 = learning rate budget）
2. **接受准则**：只有当 edit 后 skill 在 held-out validation 集上 *严格* 优于当前 skill 才接受；否则丢进 rejected-edit buffer
3. **epoch-wise slow/meta update**：在多次小幅 edit 之后做一次 meta 调整，避免局部 oscillation

**跟之前方法的本质区别**：
- 不是 Trace2Skill / GEPA / TextGrad 那种 "全文重写 → 试一下 → 看 reward 是否高" 的方式，那是文本空间的 RL 但没有 validation discipline
- 不是 EvoSkill 的进化式 generation pool，没有"每一步要 strictly improve" 这个硬约束
- 推理时 zero overhead——skill 部署阶段不需要 SkillOpt 出现

#### 关键结果

| Setting | 提升 (vs no-skill) |
|-----------|------|
| GPT-5.5 direct chat | +23.5 pp |
| GPT-5.5 Codex agentic loop | +24.8 pp |
| GPT-5.5 Claude Code | +19.1 pp |
| 52 个 (model × benchmark × harness) cell | 全场 best or tied |

**结果解读**：
- 三个 harness 的提升幅度 (23.5 / 24.8 / 19.1) 几乎平起，说明 SkillOpt 学到的 skill 不依赖具体执行环境——这跟博主关心的 "agent 设计选择 vs harness 差异" 是同一个问题域
- transfer 实验里 skill 还能跨 model scale 和跨 harness 迁移，且不微调就能在邻近 benchmark 上用。这暗示 skill 学到的是 "task-level structural knowledge"，不是单纯的 prompt overfitting
- Codex agentic loop 收益最大 (+24.8)，超过 direct chat 和 Claude Code。一个可能的解释：Codex 的 default policy 较保守，skill 给它的 "agentic latitude" 提升更大

#### 局限性与开放问题

- **局限 1**：每个 edit 都要做 rollout + validation，离线优化阶段成本可能非常高。论文没给出明确的 "总优化成本 vs 单次推理成本" 比值，对资源紧张的研究者不友好
- **局限 2**：6 个 benchmark 主要是 reasoning / QA / commonsense，**没有正面对 SE 任务**（SWE-bench / HumanEval / LiveCodeBench）。"transfer to nearby math benchmark" 是 nice 但不充分
- **开放问题**：validation set 怎么选？论文承认 "validation 严格改善才 accept" 是关键纪律，但没讨论 "skill overfit 到 validation" 的风险。这跟 ML 里 "model 过拟合 hold-out" 是同构问题

#### 💡 对我们的启发

1. **直接可用的技术点**：博主在做 agent trace 分析时，可以把 SkillOpt 的 "rejected edit buffer + epoch-wise meta update" 这套 discipline 改造成一个 *观察工具*——给定一个公开 OpenHands / Aider 的 agent trace，回放 system prompt 的演化历史，统计 "实际接受的 prompt 修改中，有多少在 held-out 上 strictly improve 了"。这会是一个很有 trace forensics 味道的小研究
2. **具体实验想法**：1-2 周可验证的小实验——拿 Claude Code 在 SWE-bench 子集上跑 baseline，然后用 SkillOpt 训练一个 skill，看在 "test execution / structure injection / patch splitting" 三个 dimension 上 skill 学出来的内容跟博主 Triangulating LLM Progress 论文里量化的边际价值是否一致。如果 SkillOpt 自动学出 "structure injection 强相关"，那就有了"自动验证人工 ablation finding"的有趣闭环
3. **研究趋势判断**：skill 当成 first-class trainable object 这个范式如果站住，agent 研究的核心问题会从 "训更大模型" 转移到 "训更好的 external state"。这对小模型 + 强 skill 的路线（博主关心的 7B-14B 开源代码模型）是好消息——skill 训练成本远低于 fine-tuning

---

### From Raw Experience to Skill Consumption: A Systematic Study of Model-Generated Agent Skills

> **推荐理由**：这是一篇典型的"边际价值实证量化"论文——不告诉你 skill 一定有用，而是定量找出"什么时候 skill 反而有害"，并把 lifecycle 三个阶段（experience → extraction → consumption）拆开评估。这种"系统性证伪 + 拆解"是博主一贯偏好的研究范式。

📌 **论文信息**：Zisu Huang, Jingwen Xu, Yifan Yang, Ziyang Gong, Qihao Yang | [arXiv:2605.23899](https://arxiv.org/abs/2605.23899) | cs.AI

#### TL;DR
作者建了一个 utility-grounded 评估框架，覆盖 5 个 agentic 任务域，系统跑了多个 extractor × 多个 target agent 的网格。三大发现：(1) model-generated skill 平均有用，但**存在非平凡的 negative transfer**；(2) 一个模型可以是强的 extractor 但弱的 consumer，反之亦然；(3) 提出 meta-skill，指导 extractor 偏向真正与 utility 相关的特征，从而**减少 negative transfer**。

#### 问题是什么？
现在 "用 LLM 自己提取 skill 给自己用" 的论文越来越多，但读起来全是单点 success case。整个 skill lifecycle 包括三个阶段：experience generation → skill extraction → skill consumption。每个阶段都可能拖后腿，**但目前没有一个完整研究告诉你 skill 什么时候 work、什么时候不 work、关键变量是什么**。

更尖锐的：很多论文测的是 "skill 平均能不能涨点"，但没有给 "negative transfer 的频率和幅度"，导致读者无法判断在自己的场景里能不能用。

#### 他们怎么做的？
**核心 Insight**：把 skill lifecycle 当作一个独立可拆解的 pipeline，每个阶段做 controlled ablation，找出 utility 真正依赖的属性。

具体方法流程：
1. **实验网格**：跨 5 个领域，多个 extractor / consumer 组合
2. **正向研究**：测每个组合下 skill 是否提升了 task success rate
3. **负向研究**：定量统计 negative transfer 的比例和幅度
4. **机制分析**：dissect 每个 lifecycle 阶段，找出哪些 skill 特征跟 utility 实际相关
5. **干预**：把找到的属性编码进一个 meta-skill，让 extractor 用它来"提取更好的 skill"

**跟之前方法的本质区别**：之前的 skill 工作要么只测整体提升，要么只 ablate 一个变量。这篇是把整条 pipeline 都打开做 "因子分解"。

#### 关键结果

| 维度 | 主要发现 |
|------|---------|
| 平均效果 | model-generated skill 是正向的 |
| Negative transfer | **non-trivial 频率**，论文承认这是真问题 |
| Extractor / Consumer 解耦 | strong extractor ≠ strong consumer，强弱组合多样 |
| Model scale 相关性 | skill utility **独立于** model scale 和 baseline strength |
| Meta-skill 干预 | 跨域 consistently 提升 skill 质量、**显著减少 negative transfer** |

**结果解读**：
- "skill utility 与 model scale 不相关" 是非常反直觉的——这意味着小模型不一定提取不出好 skill，甚至可能更善于提炼"小模型听得懂的 skill"
- extractor / consumer 解耦更有意思：用 GPT-5.5 extract 给 Llama 用，可能比 Llama extract 给 Llama 用还好（具体数字论文应有，但 abstract 没给）
- meta-skill 这个干预层很巧妙——它不改 extractor 的 weights，只改"提取 skill 时关注的特征"，相当于把 lifecycle finding 反哺成可执行 prompt

#### 局限性与开放问题

- **局限 1**：5 个域全部是 agentic task，但论文 abstract 没披露具体是哪 5 个。如果都是 generic agentic benchmarks，对 SE 落地的可外推性需要存疑
- **局限 2**："negative transfer 非平凡" 的具体数字 (10%? 30%?) 没在 abstract 给出，需要读正文。但 abstract 选择强调 "non-trivial" 这个词，说明作者本身也认为这是真问题而不是偶发现象
- **开放问题**：strong extractor / weak consumer 这个 decoupling 的根因到底是什么？是 instruction following 能力？是 RL post-training 倾向？还是 base model 的 distribution？论文给了观察但没给机制

#### 💡 对我们的启发

1. **直接可用的技术点**：博主在做 agent trace 分析时，可以借鉴 "extractor / consumer 解耦评估"。在 SWE-bench 的 OpenHands trace 里，agent 自己写到 memory 的"经验"是 extraction，下一轮调用是 consumption。完全可以测这两端的强弱不一致——这又是一个非常 "agent marginal value" 风格的实证 finding
2. **具体实验想法**：拿 DeepSeek-Coder 7B 当 extractor，让它从 SWE-bench train split 自动提取 skill；然后让 DeepSeek-Coder 7B / Qwen-Coder 14B / Claude Code 三个 consumer 分别用这些 skill。预期观察：consumer 效果排序未必等于 base model 能力排序，可能某个中等模型反而是最强 consumer。如果能复现这个 finding，那对"小模型 + 自蒸馏 skill"的路线非常重要
3. **研究趋势判断**：skill 研究正在变得 lifecycle-aware。下一阶段最有价值的工作可能是 "skill 质量预测器"——给一个 skill document，不跑 rollout 就能预测它的 utility。这是博主"LLM 作为程序执行状态预测器"想法的天然延伸

---

### OpenSkillEval: Automatically Auditing the Open Skill Ecosystem for LLM Agents

> **推荐理由**：这是一篇敢于 "系统性证伪生态泡沫" 的论文——博主一贯反对学术 rubbish 和无落地价值的工作，这篇正面打了一拳：30 个流行开源 skill 在 600+ 任务上系统跑下来，**很多根本不 outperform base agent**。这种实证检查的稀缺性远高于"再发明一个 skill format"。

📌 **论文信息**：Jiahao Ying, Boxian Ai, Wei Tang, Siyuan Liu, Yixin Cao | [arXiv:2605.23657](https://arxiv.org/abs/2605.23657) | cs.CL

#### TL;DR
OpenSkillEval 是 skill 生态的自动审计框架。它做了三件事：(1) 不用 static benchmark，而是从 evolving real-world artifacts **自动构造** 600+ task instance，覆盖 PPT / 前端 / poster / 数据可视化 / 报告生成五类；(2) 收集 30 个 community-contributed 开源 skill；(3) 系统跑 SOTA 模型 × agent framework 网格。**核心发现：skill availability 不等于 effective skill usage**。

#### 问题是什么？
Claude Code skill marketplace、Codex Plugins、各种 open-source agent skill repo 在过去一年爆炸式增长。但有几个问题 *从来没人系统检查过*：
- 这些 skill 在不同 model + framework 组合下表现稳定吗？
- "starred 最多"的 skill 真的最强吗？
- 用了 skill 一定比 base agent 强吗？

业界做的 benchmark 普遍是 static（写好就不变了），而 skill 设计的任务在变。**Static benchmark 在 skill 时代不够用**——你不能用一份固定的 PPT 任务来测一个号称能生成各种 PPT 的 skill。

#### 他们怎么做的？
**核心 Insight**：要审计 skill 生态，benchmark 本身也必须是 dynamic 的，否则就是 "用一份固定考卷考一个号称什么都会的学生"。

具体方法流程：
1. **Dynamic task construction**：从 evolving real-world artifacts (实际的 PPT、前端项目、poster、可视化、报告) 自动构造任务实例，每天 / 每周可以更新
2. **Skill 收集**：聚合 30 个 community skill，统一接口
3. **统一执行**：在不同 SOTA model + agent framework 组合下跑 600+ task instance
4. **多维评分**：同一任务用 base agent + skill-augmented agent 对比，统计 win rate 和绝对质量

**跟之前方法的本质区别**：之前的 skill paper 测自己的 skill 在自己定义的 task 上的提升，OpenSkillEval 测 **别人写的 skill 在 OpenSkillEval 定义的 task 上的提升**——这种 "third-party benchmark" 是更可信的 ground truth。

#### 关键结果

| 发现 | 含义 |
|------|------|
| Skill availability ≠ effective skill usage | 装了 skill 不等于用对了 skill |
| Benefit 强依赖 underlying model + agent framework | skill 不是 universal upgrade |
| **Many publicly popular skills 不 consistently outperform base agents** | 生态存在虚胖 |
| Skill 选择需要"成本-性能权衡" 分析 | 不是 "更多 skill 更好" |

**结果解读**：
- 最重要的 finding 不是 "skill 不 work"，而是 "**popular ≠ useful**"。这跟 GitHub star、Hacker News 热度等社交信号长期被当成 quality proxy 的现象正面冲突
- 如果作者敢明确说 "30 个 popular skill 中有 X% 不 outperform base agent"，那这就是今年 agent skill 领域最 sobering 的一个结果。可惜 abstract 只给定性结论
- "benefit 依赖 model + framework" 跟 SkillOpt 的 transfer findings 形成了张力——SkillOpt 说 skill 能 transfer，OpenSkillEval 说很多 skill 在不同 framework 下不行。可能的统一解释：trained skill > human-written skill 在 transferability 上

#### 局限性与开放问题

- **局限 1**：5 类任务（PPT / 前端 / poster / 可视化 / 报告）全是 *generative output* 类，对 SE 任务覆盖几乎为零——code review、debugging、refactoring、program repair 这些博主真正关心的任务都没在内
- **局限 2**：dynamic benchmark 的可复现性怎么保证？同样的 prompt 在不同时间从 real-world artifacts 抽出来的任务可能不一样，论文需要给出明确的 versioning 协议，否则后续比较没法做
- **开放问题**：哪些 skill 特征预测它会 transfer / 不会 transfer？这是 [[paper-from-raw-experience-to-skill-consumption]] 没回答完的同一个问题。两篇论文的 finding 可以拼起来做下一步研究

#### 💡 对我们的启发

1. **直接可用的技术点**：博主可以直接借鉴 OpenSkillEval 的 "dynamic task construction from evolving artifacts" 思路，在 *SE 场景* 复制一遍。具体地：从 GitHub 最近一周的 commit 抽取真实 bug fix 作为 dynamic SWE-bench，每周更新。这跟 SWE-bench-live 之类已有工作可比较，但有 "动态 + 自动 + 开源" 三个优势
2. **具体实验想法**：1-2 周可验证——把 Claude Code 上 starred 前 20 的开源 skill 收集起来，在博主关心的 HomeCheck 修复任务 / Python 兼容性修复任务上跑一遍，看其中有多少真能 outperform "naked Claude Code"。**如果重复出 "popular ≠ useful" 的 finding**，那就是博主可发表的实证论文：以 SE 任务为载体，复制 OpenSkillEval 的 sobering 结论
3. **研究趋势判断**：skill 生态的"质量 vs 流行度"差距会越来越大。下一波最有价值的工作可能是 "skill quality predictor + skill marketplace ranking 改造"——这不是纯学术，是有工程落地空间的 (Claude Code / Codex 的 marketplace 都需要这种工具)

---

## 方法对比

把今天三篇直接聚焦 skill 的论文（SkillOpt / Lifecycle Study / OpenSkillEval）放在一起对比：

| 维度 | SkillOpt | Skill Lifecycle Study | OpenSkillEval |
|------|---------|---------|---------|
| 主要对象 | 单个 skill 文档 | model-generated skill 全生命周期 | community 开源 skill 生态 |
| 核心方法 | text-space optimizer + validation gate | factor decomposition + meta-skill 干预 | dynamic task + 第三方审计 |
| 数据需求 | scored rollouts | 5 域多 extractor / consumer 网格 | 600+ dynamic task instance + 30 公开 skill |
| 计算开销 | 高（每 edit 都要 rollout） | 中（grid evaluation） | 中-高（实时任务构造） |
| 适用场景 | 单 skill 优化、且能定义 validation | skill 内部机制理解 | skill marketplace 审计、选用决策 |
| 主要局限 | benchmark 偏 reasoning，无 SE 任务 | negative transfer 量化粒度不够 | 任务类型全是 generative output |
| 跟 agent marginal value 关系 | **直接对应**——每个 edit 是一个边际单位 | **直接对应**——拆解 lifecycle 每个阶段贡献 | **间接对应**——量化 "skill" 这个设计动作的真实边际价值 |

把 [Agentic Proving for Program Verification](https://arxiv.org/abs/2605.23772) 加进来，今天这 4 篇形成了一个**完整的 agent 评估方法论矩阵**：

- 横轴是 *评估对象*：模型 / agent (Agentic Proving)、单个 skill (SkillOpt)、skill 生命周期 (Lifecycle Study)、skill 生态 (OpenSkillEval)
- 纵轴都是同一个问题：**当能力快速提升时，我们怎么知道它真的提升了？**

这个矩阵的下一格——agent harness 的边际价值评估——目前还相对空白。**这是博主可以直接进场的位置**。
