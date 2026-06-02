---
title: "arXiv 每日速递 2026-06-03"
date: "2026-06-03"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-06-03

## 今日总结

今天这批 cs.AI / cs.SE 论文里藏着一条非常清晰的暗线：**agent 的评估正在集体逃离"outcome correctness"这个单一坐标系**。ClinEnv 直接量化了"结果对了但过程烂"的解耦现象，Monitoring Agentic Systems 论证在系统还不可靠时 task-level 错误根本测不出来、要先看结构性缺陷，AGENTCL 把"agent 到底学没学到可复用经验"做成了受控 benchmark，RASER 则从反方向问"额外的 retrieval 动作到底有没有边际价值"。四篇论文从评估、监控、记忆、成本四个切面，共同把矛头指向同一个判断：**当 LLM 已经能跑通任务，真正值钱的是去测量过程、结构和每个设计动作的真实贡献**——这正是博主一直在做的"边际价值量化"哲学的外延。今天值得深读。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [ClinEnv](http://arxiv.org/abs/2606.02568) | agent benchmark / process eval | 纵向住院仿真环境，把 outcome quality 和 process quality 拆开测，发现二者强解耦 | ⭐⭐⭐ |
| [Monitoring Agentic Systems Before They're Reliable](http://arxiv.org/abs/2606.02494) | agent 可观测性 / SE | 用 variance 当信号，按 within-run / cross-run / structural 三个 scope 分层定位故障，证明结构缺陷会掩盖 task-level 信号 | ⭐⭐⭐ |
| [AGENTCL](http://arxiv.org/abs/2606.02461) | continual learning eval | 用"受控可复用任务流 vs naive 流"严格评估 agent 记忆设计，含 coding 任务 | ⭐⭐⭐ |
| [RASER](http://arxiv.org/abs/2606.02488) | agent cost / 边际价值 | 不用额外 LLM 调用的廉价 router，只在一次性 RAG 不够时才升级检索，省一半 token | ⭐⭐⭐ |

## 今日主题：当"答对了"不再是 agent 评估的终点

如果把今天这四篇放在一起读，你会发现它们在攻击同一个盲点：**outcome-only evaluation 正在系统性地误导我们对 agent 的判断**。

ClinEnv 给了最锋利的实证：最强模型 decision F1 只有 0.31，而且"outcome quality is sharply decoupled from process quality"——模型能相对可靠地反推出院诊断（0.51 F1），却在真正需要主动决策的 management action 上崩到 0.17，并且越到 case 后期越喜欢发冗余 query。也就是说，只看最终答案，你会严重高估这个 agent 的临床能力。Monitoring Agentic Systems 从工程侧给出了同构的结论：当系统还处在"部分集成"的成熟度，**结构性缺陷会掩盖 task-level 错误信号**——他们注入的 task-level error 在 clean baseline 里根本区分不出来（"indistinguishable from clean baselines"），你必须换一个 scope（cross-run、structural）才能看见真正的问题。

AGENTCL 和 RASER 则从两个相反方向补全了这张图。AGENTCL 指出现有 continual learning benchmark 用的是 naive 任务流，"limited ability to distinguish memory designs"——你测不出一个记忆模块到底好不好，因为任务之间根本没有刻意构造的可复用结构；它的解法是构造"前面子解/证据/workflow 故意能被后面复用"的受控流。RASER 则把"边际价值"摆到了台面上：它的核心 observation 是**大量 multi-hop 问题其实一次 RAG 就答对了**，所以无脑给每个问题都加一轮检索是在烧钱——这跟博主之前测出"test execution 只贡献 1.25pp"的反直觉结论是同一种思维方式：先别假设某个设计动作有用，去测它真实的增量。

四篇论文的共同启示很硬核：**评估 agent 的下一个前沿，不是再刷一个 outcome 准确率，而是去测量过程质量、结构健康度、以及每个设计动作（额外检索、记忆写入、专家路由）的边际贡献**。对于做 agent marginal value 实证的人来说，这几乎是一份现成的方法论弹药库。

---

### ClinEnv: An Interactive Multi-Stage Long Horizon EHR Environment for Agents

> **推荐理由**：博主的核心研究哲学之一就是 "process quality vs outcome correctness"，这篇论文把这个解耦现象做成了一个可量化的纵向仿真环境，方法论可以直接迁移到 SWE agent 评估上。

📌 **论文信息**：Yuxing Lu, Yushuhong Lin, Wenqi Shi, J. Ben Tamo, Xukai Zhao 等 | [arXiv:2606.02568](http://arxiv.org/abs/2606.02568) | cs.AI, cs.CL, cs.MA

#### TL;DR
把"看病"建模成一连串不可逆的序贯决策，每一步 agent 必须先主动向四个专科 agent 查询信息再下医嘱，**同时给"决策对不对"和"信息收集得好不好"两个独立打分**——结果发现最强模型 decision F1 只有 0.31，而且 outcome 和 process 严重解耦。

#### 问题是什么？
现有的医疗 benchmark 基本都是"从枚举选项里选答案"，但真实临床不是选择题：医生是在不确定性下增量收集异质信息、然后做一连串不可逆的承诺（开药、做手术、下诊断）。这种 setting 下，一个 agent 哪怕最后诊断蒙对了，它在过程中可能问了一堆冗余问题、或者在关键的治疗决策上一塌糊涂——而 outcome-only 的评估完全看不见这些。卡点在于：**怎么把"过程"变成一个可以确定性打分的量**，而不是靠主观判断。

#### 他们怎么做的？

**核心 Insight**：把一次住院拆成有序的 decision stage 序列（他们叫 Longitudinal Inpatient Simulation），让"信息获取行为"和"决策行为"各自成为可测量的对象。

具体方法流程：
1. 把每个真实住院 case 自动构造成一个有序的 decision stage 序列——这一步把"长程、不可逆"这个临床本质 encode 进了环境结构里
2. 每个 stage，模型必须先主动 query 四个专科 agent（拿信息），再 commit 到 medication / procedure / diagnosis——这把"主动信息收集"变成了一个可观测的动作流
3. 用 ontology-grounded 的确定性匹配给"决策对不对"打分，同时统计 query 行为给"过程好不好"打分——两条评分线分开，才能看见解耦

**跟之前方法的本质区别**：不是"又一个医疗 QA benchmark"，而是把评估从"终态正确性"扩展到了"轨迹质量"。静态 benchmark 测不了主动 query 行为，现有交互式 benchmark 至少在某个维度上妥协；ClinEnv 的差异在于它让 process 和 outcome 都可确定性打分。

#### 关键结果

| 评估维度 | 指标 | 数值 | 解读 |
|-----------|------|---------|------|
| 整体决策能力 | decision F1（最强模型） | 0.31 | 离可用差得远 |
| 出院诊断（outcome 类） | F1 | 0.51 | 反推结果相对可靠 |
| Management action（process 类） | F1 | 0.17 | 真正的主动决策崩盘 |

**结果解读**：
- 提升/落差的来源非常明确——模型擅长"从已知信息反推一个标签"（诊断），但不擅长"在不确定下主动决定下一步做什么"（management）。这正是 outcome-only 评估会掩盖的能力鸿沟。
- 难度集中在 management decision 和 case 后期：随着 case 推进，模型还在持续发冗余 query，说明它没有有效地"消化"已收集的信息。
- 最关键的一句话：outcome quality 和 process quality "sharply decoupled"。这意味着**任何只报最终准确率的 agent 评估都可能在撒谎**。

#### 局限性与开放问题

- **局限 1**：ontology-grounded 匹配对"决策正确"的定义依赖于知识库的完备性，临床上很多决策是有多个合理选项的，硬匹配可能低估了模型的合理但非标准答案。
- **局限 2**：只测了七个模型，且都是通用 LLM，没有针对临床做过 SFT 的专科模型——0.31 这个数字到底是"任务太难"还是"模型没对齐"还分不清。
- **开放问题**：论文量化了 process-outcome 解耦，但没给出"怎么训练才能补上 process gap"——measurable 之后的 actionable 还是空白。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主做 SWE agent trace 的事后分析时，完全可以借用 ClinEnv 的"双评分线"设计——对 SWE-bench / OpenHands 的公开 trace，除了报 resolved rate（outcome），再构造一个 process 评分线：比如"是否在定位前先跑了测试""读了多少无关文件""重复编辑同一文件的次数"。把这两条线在同一批 trace 上对照，很可能复现出"resolved 但 process 烂"的解耦。
2. **具体实验想法**：拿一批 SWE-bench Verified 的成功 trace（resolved=True），用规则提取每条 trace 的"冗余动作率"（重复读文件、无效 grep、回滚编辑），然后看"冗余动作率"和"是否一次通过测试"的相关性。预期观察到：相当比例的 resolved case 其实过程很糟——这就是一个可以在 1-2 周内出结论的小实验，且直接延续博主"边际价值/过程质量"主线。
3. **研究趋势判断**：这篇是"agent 评估从 outcome 转向 process"趋势的医疗版样本。对博主的选题启示是——**SE 领域同样缺一个"process-aware 的 agent benchmark"**，谁先把 SWE agent 的 process quality 做成可确定性打分的协议，谁就占住了一个方法论高地。

---

### Monitoring Agentic Systems Before They're Reliable

> **推荐理由**：这是今天唯一的 cs.SE 主分类论文，直接讲"agentic system 在还不可靠时怎么监控"，用 variance 当信号、把故障按 scope 分层——这套思路和博主"用静态/结构信号驱动诊断"的方法论高度同源。

📌 **论文信息**：Marisa Ferrara Boston, Glen Hanson, Effi Georgala, JD Hudgens, Heather Frase | [arXiv:2606.02494](http://arxiv.org/abs/2606.02494) | cs.SE, cs.AI

#### TL;DR
当 agentic 系统刚进生产、还处在"部分集成"状态时，主导失败的是**结构性缺陷而不是 task-level 错误**，而且结构缺陷会掩盖 task-level 信号；论文提出用 variance（变异系数 CV）作为表征信号，按三个监控 scope 分层定位故障，再用改编自 FMEA 的严重度分类把人力集中到真正需要调查的 2%。

#### 问题是什么？
大家做 agent 监控时默认的是"测每个任务做得对不对"，但论文指出一个反直觉事实：**系统不可靠的早期阶段，task-level 监控根本无效**——因为结构性失败模式（集成 gap、stage 缺陷）会把 task-level 监控想捕捉的信号给 mask 掉。打个比方：你想测一个零件的精度，但整条流水线还在漏油，这时候测零件精度毫无意义，你得先发现漏油。卡点在于：怎么在 task-level 信号被污染的情况下，还能定位到"到底哪里坏了"。

#### 他们怎么做的？

**核心 Insight**：用 variance（同一行为跨多次运行的变异系数 CV）作为故障类型的指纹——不同 scope 的监控会暴露出特征性不同的 CV。

具体方法流程：
1. 把评估拆成三个维度（quality / suitability / efficiency）× 三个 scope（within-run / cross-run / structural）——这个二维网格让你能定位故障"长什么样"
2. 用 CV 当表征信号：within-run 监控暴露确定性的 stage 缺陷（CV=0.02，几乎不波动），cross-run 监控暴露随机的集成后果（CV=1.25），structural 监控以完美一致性（CV=0.00）锁定集成 gap
3. 把 findings 用改编自 FMEA 的严重度分类做路由，97% 自动 tracking，只把 2%（反映可变行为的）留给人工

**跟之前方法的本质区别**：传统监控假设"系统已经可靠、只需抓偶发 task error"，这篇反过来——**承认系统还不可靠，先用 variance 的形态把故障归类到 scope**，而不是一上来就测任务正确率。一句很有冲击力的结论：injected task-level errors 和 clean baseline 无法区分（"indistinguishable from clean baselines"）。

#### 关键结果

| 监控 scope | 暴露的故障类型 | 变异系数 CV | 含义 |
|-----------|--------------|-------------|------|
| within-run | 确定性 stage 缺陷 | 0.02 | 稳定可复现 |
| cross-run | 随机集成后果 | 1.25（L2 处 24%） | 高度波动 |
| structural | 集成 gap | 0.00 | 完美一致锁定 |

**结果解读**：
- 提升来自"换 scope"而不是"换更准的 task 监控"——CV 的形态本身就是诊断信息，这个 insight 很巧妙。
- 在 220 次运行、120 个 document bundle、带受控错误注入的合成 testbed 上验证；确定性 triage 把 97% findings 路由到自动跟踪，只留 2% 给人——这是一个非常实用的人力分配比例。
- 一句 takeaway 值得贴墙上："Deploy monitoring early: the first thing it finds is the most important thing to fix."

#### 局限性与开放问题

- **局限 1**：用的是合成 testbed + 受控错误注入，真实生产系统的故障分布是否真的呈现这么干净的 CV 分层（0.02 / 1.25 / 0.00）存疑。
- **局限 2**：CV 的具体校准是 domain-specific 的，论文自己承认 taxonomy 可迁移但"specific calibrations are domain-specific"——换到 SWE agent 场景，阈值要重新标定。
- **开放问题**：它告诉你"结构缺陷掩盖了 task 信号"，但当系统逐渐成熟、结构缺陷修完后，怎么平滑过渡到 task-level 监控？这个 maturity-staging 模型目前只有 Stage 1 的证据。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主做公开 agent trace 大规模事后分析时，CV 这个信号几乎是免费的——同一个 task 在多个 seed/多次 run 下的行为方差，本身就能区分"确定性卡点 vs 随机性卡点"。可以把 CV 作为 trace 分析的一个新特征列。
2. **具体实验想法**：拿 OpenHands 在 SWE-bench 上的多次重跑日志（同一 instance 多 seed），对每个 instance 算"动作序列的 CV"。预期观察到：低 CV 的 instance 是稳定失败（确定性缺陷，比如定位错），高 CV 的 instance 是 agent 在乱试（随机性）。这能给"哪些失败该归咎于 agent 设计、哪些该归咎于任务本身"提供一个量化切分——直接服务边际价值分析。
3. **研究趋势判断**：这代表"agent 可观测性"正在从"测准确率"走向"测行为统计量"。对博主的启示是，**variance/一致性这类统计信号（他本来就在用 κ / AC1 / McNemar）可以系统性地引入到 agent 行为分析里**，形成一套"统计严谨的 agent trace 诊断学"。

---

### AGENTCL: Toward Rigorous Evaluation of Continual Learning in Language Agents

> **推荐理由**：直击"现有 benchmark 测不出记忆设计好坏"这个评估方法论痛点，构造受控可复用任务流，且实验覆盖 coding 任务——和博主"benchmark 合理性批判 + 评估方法论"主线完全对齐。

📌 **论文信息**：Yiheng Shu, Bernal Jiménez Gutiérrez, Saisri Padmaja Jonnalagedda, Yuguang Yao, Huan Sun | [arXiv:2606.02461](http://arxiv.org/abs/2606.02461) | cs.AI, cs.CL

#### TL;DR
现有 continual learning benchmark 用的是 naive 任务流，根本区分不出不同记忆设计的优劣；AGENTCL 构造"前面的子解/证据/workflow 故意能被后面复用"的**受控 compositional 任务流**，并配套 MemProbe 探针，证明只有受控流才能清晰区分记忆设计的可塑性。

#### 问题是什么？
Agent 花大量推理时间解单个任务，但一个 episode 学到的经验经常在后续 episode 里被浪费。Continual learning 期望 agent 跨任务流积累可复用经验。问题是：现有 benchmark 要么测长上下文检索、要么用 naive 任务流（任务之间没有刻意构造的复用关系），导致**你根本看不出一个 agent 到底学到并复用了什么**。卡点在于：如果任务流里本来就没有"可复用结构"，那记忆模块好不好测出来的差异几乎是噪声。

#### 他们怎么做的？

**核心 Insight**：要测记忆，先得保证任务流里"有东西可记"——刻意构造 earlier sub-solution / evidence / workflow 在 later task 里可复用的 compositional stream，并和 naive stream 做对照。

具体方法流程：
1. 构造 controlled compositional stream：前面任务的子解、证据、workflow 被有意设计成后面任务能复用——这是"可复用性"的 ground truth
2. 用 naive stream（不保证复用性）做对照组——一对照就能看出哪种流才有区分力
3. 上 MemProbe 探针：存储 interactions / insights / skills，并在 consolidation 阶段过滤不可靠经验，用来诊断"记忆设计选择如何影响 continual learning"

**跟之前方法的本质区别**：之前的 lifelong benchmark 直接拿 naive 任务流测，AGENTCL 的差异是**把"任务流的可复用结构"本身当成实验变量来控制**——这是从"测模型"上升到"测 benchmark 是否有区分力"，方法论层次更高。

#### 关键结果

| 任务流类型 | 区分记忆设计的能力 | 现象 |
|-----------|------------------|------|
| naive stream | 弱 | "limited ability to distinguish memory designs"，还可能暴露 memory-induced degradation |
| controlled compositional stream | 强 | 更清晰地区分各设计的 plasticity |

**结果解读**：
- 核心发现不是"某个记忆模块最好"，而是"**naive benchmark 本身没有区分力**"——这是对一整类评估实践的釜底抽薪式批判。
- 实验覆盖 coding、deep research、language understanding/reasoning 三类任务，coding 在内说明结论对 SE agent 同样成立。
- naive 和 held-out setting 往往只有有限增益、甚至暴露记忆带来的退化，强调需要"平衡 plasticity 和稳定复用"的更强记忆设计。

#### 局限性与开放问题

- **局限 1**："可复用性"是人工构造进任务流的，这种刻意设计的复用结构和真实开发场景中自然出现的复用，分布可能有差距，结论的外推性需谨慎。
- **局限 2**：MemProbe 的"过滤不可靠经验"这一步本身引入了超参/启发式，论文里这部分对最终区分力的贡献没有完全 ablate 清楚。
- **开放问题**：它证明了 controlled stream 更有区分力，但"怎么自动化地为任意领域构造这种 compositional stream"还是手工活——这是规模化的瓶颈。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主做 benchmark 合理性批判时，AGENTCL 给了一个可复制的范式——**"对照组 benchmark"**：要论证某个评估维度有没有意义，构造一个"故意没有该结构"的对照 benchmark，看区分力是否消失。这可以直接用在 SWE agent 的记忆/经验复用评估上。
2. **具体实验想法**：选一组有依赖关系的 GitHub issue（同一仓库、后一个修复依赖前一个引入的 helper），构造成 compositional stream；再随机打乱成 naive stream。让带 memory 的 coding agent 分别跑两条流，对比"复用率"和"resolved rate"。预期观察到：只有 compositional stream 能拉开有记忆 vs 无记忆 agent 的差距——这就为"agent 记忆到底值多少边际价值"提供了一个干净的测量场。
3. **研究趋势判断**：这代表 evaluation methodology 正在从"造更大的 benchmark"转向"造更有区分力的 benchmark"。对博主"不做学术 rubbish、要产出真能被用上的 benchmark/guideline"的定位来说，这是一个非常对味的方向——**区分力（discriminative power）应该成为 benchmark 设计的一等公民指标**。

---

### RASER: Recoverability-Aware Selective Escalation Router for Multi-Hop Question Answering

> **推荐理由**：这篇是"边际价值量化"思维的纯正样本——先实证"很多问题其实一次 RAG 就够了"，再据此只在必要时升级检索，省一半 token。和博主测"test execution 只贡献 1.25pp"是同一种反直觉打法，且 budget-aware 契合资源约束。

📌 **论文信息**：Yuyang Li, Zihe Yan, Tobias Käfer | [arXiv:2606.02488](http://arxiv.org/abs/2606.02488) | cs.AI

#### TL;DR
多跳 QA 系统习惯给每个问题都加昂贵的多轮检索/分解，但论文的实证显示**大量多跳问题一次性 RAG 就答对了**，无脑升级是在烧 token；RASER 用一次 RAG 产出的六个特征训练一个不额外调 LLM 的廉价 router，只在该升级时升级，用 41–49% 的 token 守住和 SOTA 相当的 F1。

#### 问题是什么？
多跳 QA 的主流做法是"假设问题很难"——分解问题、跑多轮检索、过 bridge entity，每一步都靠重复的 LLM 调用来 rewrite/decompose，token 成本高，在预算紧的时候不划算。但论文的分析戳破了这个假设：**很多多跳问题，一次 one-shot RAG 已经答对了**，给它们再加检索纯属浪费。卡点在于：怎么在不再花一次 LLM 调用的前提下，判断"这个问题到底需不需要升级检索"。

#### 他们怎么做的？

**核心 Insight**：把"要不要升级检索"变成一个基于 one-shot RAG 自身廉价特征的路由决策，而不是再调一次 LLM 去判断。

具体方法流程：
1. 先跑 one-shot RAG，从这一次运行里抽取六个特征（recoverability 相关）——这一步零额外 LLM 成本
2. RASER-2：用这些特征决定 stop 还是 escalate 到额外检索动作 PRUNE——二选一的轻量门控
3. RASER-3：在 one-shot RAG / PRUNE / 迭代检索 IRCoT 三者间选择，显式加入 cost-accuracy trade-off——把成本摆进决策目标

**跟之前方法的本质区别**：SOTA 的自适应检索方法通常要再调一次 LLM 来决定路由，RASER 的差异是**路由决策本身不花 LLM 调用**——它复用了 one-shot RAG 已经产生的副产品特征。这是把"省钱"做进了机制设计，而不是事后优化。

#### 关键结果

| 方法 | F1 | Token 消耗（相对 always-prune） | 解读 |
|------|------|------|------|
| RASER-2 / RASER-3 | 与 SOTA 相当 | 41–49% | 守住准确率、砍掉一半成本 |
| always-prune baseline | 相当 | 100% | 无脑升级 |
| 迭代/分解检索 baseline | 相当或更低 | 更高 | 更贵还不更好 |

**结果解读**：
- 提升的本质不是"准确率更高"，而是"**在相同准确率下成本砍半**"——这正是边际价值视角下最有意义的结论：额外检索动作的边际贡献，对大部分问题其实是零甚至负。
- 跨六个 LLM、三个多跳 QA benchmark 验证，泛化性可以。
- 关键设计选择是"router 不调 LLM"——这个约束本身保证了节省是真实的，否则路由开销会把省下的 token 吃回去。

#### 局限性与开放问题

- **局限 1**：六个特征是针对多跳 QA 的 recoverability 设计的，换到别的 agent 任务（如 SWE）这套特征是否还有预测力未知。
- **局限 2**：router 用 oracle 式的"是否需要升级"标签训练，这个标签的获取在真实场景里本身有成本，论文里这部分的可扩展性讨论偏弱。
- **开放问题**：它解决了"要不要升级检索"，但没解决"升级到哪一级最优"的连续决策——RASER-3 只有三档，更细粒度的 cost-accuracy 前沿还没探。

#### 💡 对我们的启发

1. **直接可用的技术点**：这套"用一次廉价执行的副产品特征预测要不要加昂贵动作"的范式，几乎可以原样搬到 SWE agent 上——比如"要不要跑测试""要不要做额外的 static analysis 定位"，都可以先用一次廉价 pass 的特征训一个不调 LLM 的 router 来决定，避免每个 instance 都无脑全流程。
2. **具体实验想法**：在公开 SWE agent trace 上，统计"做了 test execution 的 instance"里，有多少其实不做也能 resolved。用一次廉价 localization pass 的特征（候选文件数、置信度、grep 命中分布）训一个 router 预测"这个 instance 需不需要跑测试"。预期观察到：相当比例的 instance 可以跳过昂贵动作而不掉 resolved rate——这直接量化了 test execution 的边际价值，呼应博主之前 1.25pp 的发现，并给出"什么时候它真的有用"的可操作判据。
3. **研究趋势判断**：这代表 agent 研究正在从"堆更多步骤"转向"selective / budget-aware 的步骤裁剪"。对博主"LLM/agent 边际价值的实证量化"主线，这是一个强力的同盟方向——**每个被默认加上的 agent 设计动作，都值得用一个 selective router 去问一句"它对哪些 case 真的有用"**。

---

## 方法对比

| 维度 | ClinEnv | Monitoring Agentic Systems | AGENTCL | RASER |
|------|---------|---------------------------|---------|-------|
| 攻击的盲点 | outcome 掩盖 process | 结构缺陷掩盖 task 信号 | naive 流没有区分力 | 默认升级浪费成本 |
| 核心方法 | 双评分线 + 纵向 stage 仿真 | CV 信号 × 三 scope 分层 | 受控 compositional 流 + 探针 | 廉价特征 router（不调 LLM） |
| 评估对象 | agent 的过程质量 | 系统的结构健康度 | benchmark 的区分力 | 每个检索动作的边际价值 |
| 数据/成本需求 | 真实住院 EHR，构造成本高 | 合成 testbed，220 runs | 需人工构造可复用任务流 | 仅 one-shot RAG 副产品，极省 |
| 主要局限 | 硬匹配可能低估合理决策 | CV 阈值 domain-specific | 人造复用结构外推性存疑 | oracle 标签获取有成本 |
| 对博主的迁移价值 | SWE trace 双评分线 | trace 的 variance 诊断学 | 对照组 benchmark 范式 | selective 边际价值 router |

四篇放在一起，恰好覆盖了"agent 评估超越 outcome"这条暗线的四个切面：**过程（ClinEnv）、结构（Monitoring）、benchmark 本身（AGENTCL）、单个动作的成本（RASER）**。对正在做 agent 边际价值量化的人来说，这是一份难得齐整的方法论拼图。
