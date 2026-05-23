---
title: "arXiv 每日速递 2026-05-24"
date: "2026-05-24"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-24

## 今日总结

今天 50 篇里能"打到林智灏研究主线"的论文密度不高，但巧的是有 3 篇恰好可以串成一条主题：**当 LLM 已经 work，我们要怎么诚实地测量它到底贡献了多少**。VPO 把"训练分布多样性"作为 test-time pass@k 的隐性瓶颈拎出来量化；FAME 走到了 cs.SE 唯二的论文之一，主张"LLM 只用一次离线、推理全部交给小模型"，用 76× annotation 削减证明这是真的可以；而 Erdős/OEIS 那篇则把 frontier LLM 直接放到了**未解的数学开放问题**上，给出了一个非常残酷的分母——9/353 和 44/492。三篇风格各异，但共同点是都不写"我们提出了一个新框架"，而是先量边界、再讲贡献。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Vector Policy Optimization](http://arxiv.org/abs/2605.22817v1) | RL post-training / pass@k | 把 GRPO 的标量 advantage 换成向量回报上的多样性训练，pass@k / best@k 一律不输 GRPO 且预算越大优势越大 | ⭐⭐⭐ |
| [FAME: Failure-Aware MoE for Log Anomaly Detection](http://arxiv.org/abs/2605.22779v1) | cs.SE / label efficiency | LLM 只用 1 次离线划分 failure domain，下游纯走小模型 router + experts，BGL F1=98.16，标注成本降 76× | ⭐⭐⭐ |
| [Advancing Mathematics Research with AI-Driven Formal Proof Search](http://arxiv.org/abs/2605.22763v1) | agent autonomy / formal verification | 自主 agent 在 353 个 Erdős open problems 上解出 9 个、492 个 OEIS conjectures 解出 44 个，单题成本几百美元 | ⭐⭐⭐ |

## 今日主题：LLM 的边际价值到底有多大？

这 3 篇放在一起读会发现，**2026 年的好论文越来越少在"我们提出了新框架"那条传送带上**，而是更愿意先回答一个尴尬的小问题：**如果只看我加的这个组件，它的边际收益是多少？**

- VPO 不是又一个 RLHF/DPO 变种，它直接挑战"标量回报的 RL 后训练 → 低熵分布 → test-time search 失败"这条隐性的训练–推理脱钩链条，再把它量化成 pass@k 曲线上的差距；
- FAME 反其道而行之——LLM 在它的 pipeline 里**全程只调用一次**，剩下都交给小模型，这是一个"边际价值最小化"的极端实验：先承认 LLM 贵且过载，再去看哪一块真的非它不可；
- Erdős/OEIS 那篇则是另一个极端——给 LLM agent 几百美元预算、几百道**真正未解**的数学问题，看它最多能解几道。这才是 agent autonomy 边际价值的诚实测量。

这种"先量化边界、再叙事"的写作姿态非常对林智灏胃口。我们在做 Agent Marginal Value 那条主线时，可以直接把这 3 篇当作叙事 template：**先把分母写大、再把分子量小，让读者第一时间知道你的方法在什么范围内 work、在什么范围内还没解决**。这跟"先讲方法、最后塞一张性能对比表"的传统写法是相反的姿态。

另一个共同点：3 篇都明确**承认 LLM 不是免费的**。VPO 警告 test-time search 预算变大会指数级放大训练分布缺多样性的代价；FAME 在 abstract 第二句话就写"applying LLMs to every line is too costly for continuous monitoring"；Erdős 论文把每道题的成本钉在"几百美元"。我们之前批判过的"动不动几千美元跑 SWE-bench 端到端"那种风格，正在被这一批论文逐渐边缘化——**经济性正在变成方法论本身的一部分**。

---

### Vector Policy Optimization: Training for Diversity Improves Test-Time Search

> **推荐理由**：直接挑战"标量 reward 的 RL post-training 会让 LLM 分布塌缩、推理时 search 失效"——这恰好是我们在做 agent test-time scaling 实证时绕不开的"为什么 best@k 提升远不如纸面预期"的根因。

📌 **论文信息**：Ryan Bahlous-Boldi, Isha Puri, Idan Shenfeld, Akarsh Kumar, Mehul Damani | [arXiv:2605.22817](http://arxiv.org/abs/2605.22817v1) | cs.LG, cs.AI, cs.CL, cs.NE

> *ar5iv 暂无该论文 HTML 版本，本文不含原图。*

#### TL;DR

GRPO/PPO 这类 RL 后训练优化的是**一个标量 reward**，结果是 LLM 输出分布越训越窄，到了 test-time search（pass@k / best@k / evolutionary search）时根本拿不出多样性。VPO 直接把 advantage estimator 从标量改成**向量**，每个 sample 在向量回报空间里 specialize 到不同的 trade-off，**drop-in 替换 GRPO 即可**，pass@k 曲线随 k 增大持续拉开差距。

#### 问题是什么？

我们已经习惯了一个"测试时多采几个、挑最好的"的范式——pass@k、best@k、AlphaEvolve 风格的 inference-time search，都假设模型能在同一个 prompt 上**生成多种不同质量的解**。但实际跑过 GRPO 之后再做 pass@k 的人都知道：**k=1 提升很明显，k=8 之后曲线就上不去了**。

之前的解读是"模型不够强"，但 VPO 把矛头指向训练目标本身。GRPO 优化的是 group-relative scalar advantage，它会奖励"接近 group 平均最优的方向"，对那些虽然 reward 没最高但行为路径完全不同的 rollout，advantage 是负的——一通训练下来，分布的熵就被压扁了。这其实是一个**post-training 与 inference-time scaling 范式之间的隐性矛盾**：我们训练的时候追求一个最优解，但部署的时候希望同一个 prompt 能出多种不同的解。

#### 他们怎么做的？

**核心 Insight**：reward 在实际任务里**本来就是向量**——code generation 有 per-test-case correctness（每个测试用例一个维度）、对话有不同的用户 persona、RL 任务有不同的 reward model。GRPO 一开始就把它压成标量了，而 VPO 直接保留这个向量，让不同的 rollout specialize 到向量回报空间的不同 trade-off。

具体流程：

1. **每个 prompt 的 group rollouts 给的是向量 reward**（不是 sum 后的标量）。
2. **advantage 在向量空间里算**：每个 rollout 选一个"它最强"的方向，advantage 高的就是"在这个方向上比 group 均值好"的那些 sample。
3. **训练目标变成"让 group 内的 K 个 rollout 分别占据不同 reward 维度"**——也就是显式鼓励 diversity 而不是只鼓励单点最优。

**和 GRPO 的本质区别**：GRPO 训练后所有 rollout 都在追同一个"最优策略均值"；VPO 训练后 K 个 rollout 各自占据 reward 空间的一个角，**完全不需要在 inference 时再做 diversity 采样的 hack**（temperature scaling、nucleus sampling 这些都是隐式补救）。

#### 关键结果

| 任务 | 评估指标 | VPO | GRPO | 备注 |
|------|---------|-----|------|------|
| Code (per-testcase reward) | pass@k 趋势 | 持平或更优 | 基线 | k=1 持平，k 越大差距越大 |
| Evolutionary search | 可解题数 | 解出 GRPO 解不出的 | — | "unlock problems GRPO models cannot solve at all" |
| 多 reward model 场景 | best@k | 持平或更优 | 基线 | 训练预算相同 |

**结果解读**：

- 最关键的不是绝对数字，而是 **k 越大、差距越大**——这意味着"训练分布多样性"和"推理时 search 预算"之间存在乘积关系。我们做 agent test-time scaling 时遇到的"加预算却不见提升"，可能根本不是 search 算法的问题，而是被训练目标在源头压扁了。
- "unlock problems GRPO cannot solve at all" 这条比 pass@k 更猛——证明这不是连续指标的提升，而是**离散的能力解锁**。
- VPO 是 drop-in 替换 GRPO advantage estimator，不需要额外训练时间、额外 reward model，**几乎是免费午餐**。

#### 局限性与开放问题

- **局限 1**：方法严重依赖"reward 天然是向量"的假设。code 任务有 per-testcase reward，对话有 multi-persona，但很多 SE 任务（program repair pass/fail、bug localization rank）reward 本身就是标量，要怎么人造一组有意义的向量维度？论文没给系统答案。
- **局限 2**：所有实验跑在 4 个任务上，规模和模型架构都比较窄，没看到 7B–30B 跨越式的 scaling。在小模型上（DeepSeek-Coder 6.7B 这种）训练 diversity 会不会因为模型容量不够直接 collapse 到 GRPO？
- **开放问题**：如果训练时就鼓励多样性，是否会和 deterministic 任务（如单测试用例的 bug fix）的 outcome correctness 冲突？论文没回答"diversity 训练后单 rollout 质量是否下降"。

#### 💡 对我们的启发

1. **直接可用的方法点**：我们之前在 Agent Marginal Value 实证里，看到 test execution 这种动作的边际收益反直觉地小（只 1.25pp）。VPO 提供了一个**新的解释维度**——可能不是动作本身没用，而是 base 模型的输出分布已经被 RLHF 压扁，导致 test execution 这种"提供候选"的动作没有真正多样的候选可挑。可以做一个对照实验：用未经 GRPO/RLHF 的 base model 重新跑 agent trace，看 test execution 的边际收益曲线会不会显著变陡。
2. **具体实验想法**：拿一个 SWE-bench Verified 的子集（~50 instance），分别用 ① GRPO 训过的 Coder 模型、② base 模型，都用同一套 agent harness 跑 k=1, 4, 16 三个采样预算。预期会观察到：base 模型在 k=16 时 pass@k 拉开差距更大，证明"分布多样性 × search 预算"是相乘关系。这个实验 1-2 周可以跑完，结论对我们论文非常有用——它把"agent 动作的边际价值"和"base 模型的训练分布"耦合起来了，让我们的故事更厚。
3. **趋势判断**：post-training 那条主线开始有人意识到"训练目标 vs 推理范式"的脱钩问题，这跟"agent marginal value 量化"是同一种学术姿态——**先承认范式之间存在脱钩，再用数据钉死它**。未来 12 个月这条线会越来越热，我们站位很好。

---

### FAME: Failure-Aware Mixture-of-Experts for Message-Level Log Anomaly Detection

> **推荐理由**：cs.SE 唯二的论文之一，且写法非常"我们的胃口"——LLM 只用一次离线，剩下交给小模型，用 76× annotation 削减证明这是真的可以。是 small-LLM-for-SE + label efficiency 的标准 case study。

📌 **论文信息**：Huanchi Wang, Zihang Huang, Yifang Tian, Kristina Dzeparoska, Hans-Arno Jacobsen | [arXiv:2605.22779](http://arxiv.org/abs/2605.22779v1) | cs.SE, cs.LG

> *ar5iv 暂无该论文 HTML 版本，本文不含原图。*

#### TL;DR

日志异常检测从 session-level 走向 **message-level**（每一行日志而不是一段窗口）会面临三个困难：同一个 template 既可能是正常也可能是异常、跨子系统失败模式异质、人工标注 line-level 成本太高。FAME 的方案是：**LLM 只调用一次离线**，让它对 template 做 K 个样本标注 + 自动 partition 进 failure domain；下游就是一个 router + domain experts 的轻量模型，可以本地部署。BGL 上 F1=98.16，对标 baseline 的标注成本降低 76×。

#### 问题是什么？

工业系统每天产几百万行日志，session-level 检测扔出来一个 alert 说"这一段 1000 行里有异常"，运维要逐行翻——这不解决问题。**走到 line-level 才有真用**，但 line-level 标注就是地狱：

- 同一个日志 template（同 EventID）可能在正常和异常上下文里都出现；
- 不同子系统失败模式完全不同，一个统一模型 capacity 不够；
- 人工标到每一行不可行。

直接的反应是"那就用 LLM 当 detector 跑全量"。但 abstract 里那句 "applying them to every line is too costly for continuous monitoring" 把这条路给堵了——这是一个**经济性约束驱动的方法学论文**，而不是"LLM 能不能 work"的论文。

#### 他们怎么做的？

**核心 Insight**：LLM 不是 detector，是 **schema designer**——只用它一次，让它给 templates 做 failure-domain partition；剩下的 detection 工作交给本地小模型。

具体流程：

1. **每个 template 最多标 K 个 line（K=100）**：用这 K 个 line 推 binary normal/anomaly indicator 和代表性样本，这是论文里**唯一**的人工 + LLM 介入点。
2. **LLM 提议 partition**：把所有 template 划分成若干 failure domain（不同子系统失败模式）。
3. **Certification step**：在训练前先验证 partition proposal 的合理性，过不去就重新 partition——这是论文里很关键但 abstract 一笔带过的设计。
4. **训练 lightweight router + domain experts**：router 决定一条日志属于哪个 domain，expert 给出 normal/anomaly + failure-domain label。
5. **部署只跑 router + experts，不再调用 LLM**。

**和现有方法的本质区别**：现有 LLM-based 日志检测要么"LLM 全程在线"（贵），要么"LLM 蒸馏成小模型"（信息丢失）。FAME 把 LLM 的角色限定在"一次性、离线、做结构设计"——这是一个**职责切分**的设计哲学，跟林智灏在 program repair 上"静态分析做定位、LLM 只做修复"是同一个味道。

#### 关键结果

| 数据集 | 指标 | FAME (K=100) | 备注 |
|--------|------|-------------|------|
| BGL | F1 | 98.16 | 标注成本相比逐行降低 76× |
| BGL | unseen-EventID recall | 86.3% | 对未见 template 也能 detect |
| Thunderbird | F1 | 99.95 | recall=1.0（perfect recall） |

**结果解读**：

- 98.16 已经是非常高的 F1，但更值得注意的是 **76× 标注效率**——这才是这篇论文真正的工业相关性。在我们做 OpenHarmony / Cangjie 这种新生态时，标注预算是硬约束，类似的"LLM 一次性设计 + 小模型部署"模板可以直接借。
- "86.3% on unseen EventIDs" 是被低估的指标。它说明 failure domain 这个抽象层确实**比 template 本身更稳定**——新出现的 template 也能映射到已知 failure domain。这对持续运营场景比 F1=98 更有价值。
- 但 BGL 和 Thunderbird 都是**经典 benchmark，且有大量已发表方法刷过**——98+/99+ 的 F1 已经不能拉开 baseline 差距。论文真正的 sell point 不是 F1，是**成本曲线**。

#### 局限性与开放问题

- **局限 1**：partition certification step 在 abstract 只有一句话，但这是整套 pipeline 的核心 gating——如果 LLM 给的 partition 质量差，certification 通不过就要重做。重做几次？人是否要介入？论文有没有报告 partition 失败率？这是个隐藏的成本黑洞。
- **局限 2**：BGL/Thunderbird 都是 HPC 日志，模板分布相对稳定。在 microservices / mobile crash log 这种 template 演化非常快（每个 release 几百个新 template）的场景下，"LLM 只用一次"的假设会不会被 template drift 打破？需要重新调用 LLM 的频率才是真实成本。
- **开放问题**：K 的选择。论文报告 K=100，但工业上一个有 10000+ template 的系统就要 1M 行 LLM 标注——还是不便宜。K 是否可以做到 10？

#### 💡 对我们的启发

1. **直接可用的设计哲学**：我们在 HomeCheck 上对 ArkTS 项目做静态分析 + 修复时，**"LLM 一次性离线设计 schema，小模型在线 detect"** 这个模板可以直接 borrow。例如：让 LLM 离线对 ArkTS 项目的 lint rule violation 做 failure-domain partition（rendering bug / lifecycle bug / state management bug），下游 IDE 集成只跑轻量 router + 小专家模型。这能解决"每次 lint 都调 LLM 太贵"和"全靠规则覆盖不全"的两难。
2. **具体实验想法**：选 50 个 ArkTS 开源仓库，统计它们的 lint warning 在 LLM-driven failure domain 上的聚类质量。具体做法：(a) 用 GPT-4 对每条 lint warning 做 1-shot 分类，得到 ~5 个 failure domain；(b) 训一个轻量 router（DistilBERT 或更小）；(c) 评估 router 在 hold-out warnings 上的分类准确率 + LLM 调用成本。预期 router 准确率 > 90%、LLM 调用成本下降 50×+。这个实验 2 周内可以做完，结果可以直接写进 HomeCheck 后续论文。
3. **趋势判断**：cs.SE 的"label efficiency / cost-aware LLM × SE"会成为 2026 年新的小赛道。之前的论文倾向"LLM 全在线 + bench 刷分"，现在开始关心"我每个推理 token 的真实生产成本"。我们在 agent marginal value 主线里可以提前埋这个角度——把每个 agent 动作的成本（dollar/run）和它的边际收益一起报告，会让我们论文的"工业感"明显加分。

---

### Advancing Mathematics Research with AI-Driven Formal Proof Search

> **推荐理由**：第一次大规模评测 LLM agent 解**真正未解的数学开放问题**的能力——9/353 个 Erdős、44/492 个 OEIS。这种"先把分母写大、再把分子量小"的诚实评估姿态，正是我们做 agent marginal value 时该学的写法。

📌 **论文信息**：George Tsoukalas, Anton Kovsharov, Sergey Shirobokov, Anja Surina, Moritz Firsching | [arXiv:2605.22763](http://arxiv.org/abs/2605.22763v1) | cs.AI

> *ar5iv 暂无该论文 HTML 版本，本文不含原图。*

#### TL;DR

把 LLM + Lean 组合成 agent，让它自主搜索数学**开放问题**的形式化证明。最强 agent 自主解出了 **9/353 个 Erdős open problems**（每题成本几百美元）和 **44/492 个 OEIS conjectures**，并已在组合数学、优化、图论、代数几何、量子光学多个领域被实际部署。一个 baseline agent（LLM 生成 + Lean 验证简单交替）也复现了 Erdős 的成功，但在最难的题上贵得多。

#### 问题是什么？

LLM 数学推理 benchmark（MATH、AIME、IMO）已经被刷到天花板，但**这些题都是有解的、有 ground truth 的**。"LLM 真的能做研究数学"的能力测量一直是空白——你怎么测一个模型解决"人类还没解决的问题"的能力？

答案是用**形式化证明**：在 Lean 这类 proof assistant 里，证明对就是对，错就是错，不存在 reward hacking。配上 Erdős / OEIS 这种公开的"未解清单"，就有了一个**不可造假、不可记忆**的 benchmark——记忆没用，因为这些题本来就没有公开解。

但成本是关键约束：一道开放问题要让 agent 跑多久？花多少钱？解出一题的边际成本是多少？这论文整套实验在意的是这件事。

#### 他们怎么做的？

**核心 Insight**：把"agent 设计"和"问题难度"解耦——先在简单 agent（LLM 生成 + Lean 验证交替）上跑，看哪些题被解了；然后只在**剩下的硬题**上启用更复杂的 agent，统计"额外的 agent 复杂度换来了多少额外的题"。这是非常干净的 ablation 设计。

具体方法（论文 abstract 给的非常压缩，我按合理推测展开）：

1. **题库**：353 个 Erdős open problems + 492 个 OEIS conjectures，全部形式化成 Lean statement。
2. **Baseline agent**：纯交替循环——LLM 生成 Lean proof 候选 → Lean 验证 → 反馈错误 → 继续生成。
3. **Capable agent**：在 baseline 上加了更复杂的设计（论文里说要看正文细节，abstract 里没展开），用于处理 baseline 解不动的题。
4. **关键指标**：解出题数 / 单题成本 / agent 复杂度三个维度同时报告。

**和现有 LLM 数学 benchmark 的本质区别**：
- 这不是 MATH/AIME 那种"有答案的题"，而是**真正未解的开放问题**——记忆数据集为零，泛化能力直接暴露。
- 不是 leaderboard，而是 **field deployment**——9 个 Erdős 题被解出后这套 agent 进入了组合数学、量子光学等真实研究组。
- 报告了**单题成本**（几百美元），让 "agent autonomy" 这个概念第一次有了经济单位。

#### 关键结果

| 任务集 | 解出 / 总数 | 通过率 | 单题成本 |
|--------|------------|-------|---------|
| Erdős open problems | 9 / 353 | 2.5% | 几百美元（capable agent） |
| OEIS conjectures | 44 / 492 | 8.9% | 未单独报告 |

**结果解读**：

- 2.5% 听起来很低，但要记住分母是**真正未解的研究问题**——这是第一个有可比意义的非零数字。把它跟之前那些"在 MATH 上 90%+"的 paper 放一起，会让"LLM 在数学上很强"这个叙事彻底瘦身。
- **44 个 OEIS conjectures** 已经是数学社区可见的成果——这些工作的可信度不取决于 paper，取决于 Lean。这是 evaluation methodology 的胜利。
- baseline agent **也解出了 Erdős 题**，只是在最难的题上更贵——这意味着"复杂的 agent 设计"在大部分题上是过度工程。这跟我们之前的 marginal value 实证（test execution 只贡献 1.25pp）是同一种结论：**简单 baseline 比想象的强，复杂 agent 的边际收益比想象的小**。

#### 局限性与开放问题

- **局限 1**：评测题库严重 biased towards 组合 / 代数类——这些问题天然适合 Lean 形式化。对几何、分析、概率类问题，能不能形式化都是问题，更别说 agent 自主求解。论文里"deployed in combinatorics, optimization, graph theory, algebraic geometry, quantum optics" 这个列表其实暴露了它**没有覆盖的领域**。
- **局限 2**：单题成本几百美元 ✕ 几百题 = 几十万美元级别的实验预算。学术圈很难复现，这种 evaluation methodology 客观上把社区拉向"只有大组才能做"。这个反过来会拖慢方法学迭代。
- **开放问题**：baseline agent 和 capable agent 的具体差距是什么？哪一类题需要 capable agent？这才是真正有学术价值的细分，但 abstract 没告诉我们。

#### 💡 对我们的启发

1. **直接可用的评测哲学**：我们一直担心 SWE-bench 这种 benchmark 已经被刷到 saturation 且有 contamination。Erdős/OEIS 这套思路给了一个非常干净的 SE 类比——能否构造一个 **"未解的 GitHub issue + 形式化验证"** 的 benchmark？例如选 100 个 still-open 的 GitHub issue（开了 > 6 个月没人解），让 agent 去解，正确性靠现有 test suite + 人工 review。这种 benchmark 一旦建起来，contamination 风险接近零（issue 还没人解过、也没 PR），而且是 **rolling benchmark**——题库每月都在涨。
2. **具体实验想法**：用一个周末搭一个 mini-pilot：从 numpy / scipy 选 20 个标记为 `help wanted` 且 > 90 天没动的 issue，跑 OpenHands / Aider agent，看能解几个。即使 0/20，这个零分本身就是论文素材——它建立了一个新的、没被刷过的分母。我们 Agent Marginal Value 论文里加一节"open-issue benchmark"会让方法学贡献立刻区别于其他 marginal value 论文。
3. **趋势判断**：当 leaderboard benchmark 被刷穿之后，**"真正未解 + 形式化验证"** 会成为新的 evaluation 范式。Erdős/OEIS 是数学侧的 instance，SE 侧很可能是 unsolved GitHub issue + 自动化 test。谁先做出这套 benchmark，谁就拥有了下一轮 evaluation methodology 的话语权。

---

## 方法对比

| 维度 | VPO | FAME | Formal Proof Search |
|------|-----|------|---------------------|
| 核心方法 | 向量 advantage 替代标量 advantage | LLM 一次离线 + 小模型在线 | LLM 生成 + Lean 验证交替 |
| LLM 角色 | RL 后训练的 policy | 离线 schema designer | 在线 proof generator |
| 推理成本 | 同 GRPO | 几乎零 LLM 调用 | 几百美元/题（高） |
| 评估方式 | pass@k / best@k | F1 + annotation cost | 解出题数 / 单题成本 |
| 主要局限 | reward 必须天然向量化 | LLM partition 失败时未量化 | 题库领域 bias 严重 |
| 对我们的迁移点 | 解释"agent 动作边际收益小"的可能根因 | "LLM 设计 + 小模型部署" 适用于 HomeCheck | "未解题 benchmark" 范式可平移到 SE |

---

今天的 3 篇都在用各自的方式回答"LLM 的边际价值到底有多大"——分别从 **训练分布**、**推理成本**、**真正未解的开放问题** 三个维度。这种姿态比"我们提出了新框架"健康得多，也是我们 Agent Marginal Value 这条主线该一直坚持的写作哲学：**先把分母写大、再把分子量小**。
