---
title: "arXiv 每日速递 2026-06-01"
date: "2026-06-01"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-06-01

## 今日总结

今天这批论文（5 月 28 日放出的一大波）里，真正能打到我们研究主线的不是某个 SOTA 数字，而是一条贯穿始终的暗线：**我们用来判断"对不对"的那个信号，本身靠谱吗？** 一篇 N=1 的物理学家监督 Claude Code 的实录，赤裸裸地展示了 oracle test 全绿但根因没解决；一篇 SoundnessBench 证明 12 个前沿 LLM 当 reviewer 时系统性地"过度乐观"；一篇 Self-Trained Verification 直接把"verifier 是瓶颈"当成核心命题来攻；一篇 MIRA 则把"评判标准"本身（rubric）变成可发现、可蒸馏的对象。把它们摆在一起读，你会发现整个 AI4SE / agent 领域正在从"造更强的 generator"转向"修更可信的 evaluator/verifier"——这恰好是边际价值量化哲学最该插手的战场。今天值得深读。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Physics Is All You Need?](http://arxiv.org/abs/2605.30353) | coding agent / supervision | N=1 实录：oracle test 抓不到的 3 类失败都是"用症状缓解冒充根因解决" | ⭐⭐⭐ |
| [SoundnessBench](http://arxiv.org/abs/2605.30329) | LLM-as-judge / benchmark | 12 个前沿模型当 reviewer 普遍"乐观偏置"，不适合做第一道门 | ⭐⭐⭐ |
| [Self-Trained Verification (STV)](http://arxiv.org/abs/2605.30290) | verification / self-improve | 让模型模仿"看过参考答案的自己"来训 verifier，科学推理 1.5%→21% | ⭐⭐⭐ |
| [MIRA](http://arxiv.org/abs/2605.30288) | data selection / code | 自锚定 rubric 发现 + 蒸馏给小 scorer，code mid-training 用一半 token 追平全量 | ⭐⭐ |

## 今日主题：当 generator 已经够强，瓶颈搬到了 verifier 上

这四篇论文表面上风马牛不相及——一篇是物理软件开发日志，一篇是审稿 benchmark，一篇是数学推理的强化学习，一篇是预训练数据筛选。但它们其实在回答同一个问题的四个侧面：**在 LLM 已经能"做出东西"的时代，我们凭什么相信它做对了？**

第一篇给出了最具体、最扎心的现场证据：当一个 coding agent 在 57 个 session 里对着 oracle test 反复迭代，它会把"让测试变绿"误认为"把问题解决"，结果花了 33 个 session 在一个根本表达不了目标物理的代码架构里调系数。oracle test 是我们 program repair / agent 评估里最信赖的信号，但它有系统性盲区——而且盲区不是随机的，是"症状 vs 根因"这条清晰的断层线。第二篇把镜头拉到"用 LLM 当裁判"这个更宏观的层面，发现裁判本身有方向性偏差（乐观）。第三篇承认 verifier 是瓶颈后，提出了一个聪明的不对称性：模型独立时抓不到自己的错，但给它看参考答案它就能抓到——于是把这个"信息更充分的自己"蒸馏出来当 verifier。第四篇则更上游，连"什么算高质量数据"这个评判标准（rubric）都不再手工写死，而是让模型自己从每个数据源里发现、再蒸馏成可扩展的打分器。

把这条线连起来，对我们的启发是直接的：我们一直在做的"agent 单个设计动作的边际价值量化"（比如测出 test execution 只贡献 1.25pp），本质上就是在拆解"这些验证/反馈信号到底贡献了多少真实价值"。今天这四篇等于从四个方向告诉我们——**验证信号的可靠性，是下一个值得系统量化的金矿**。oracle test 在什么情况下骗人？LLM judge 的偏置有多大、能不能校准掉？self-verifier 的增益是真的还是分数膨胀？这些问题都长得像我们已经在做的事。

---

### Physics Is All You Need? A Case Study in Physicist-Supervised AI Development of Scientific Software

> **推荐理由**：这是我见过的对"coding agent 在 oracle test 下会怎样失败"最诚实、最细颗粒度的实证记录，直接对应你做 agent 边际价值 / process quality vs outcome correctness 的研究哲学。

📌 **论文信息**：Nhat-Minh Nguyen | [arXiv:2605.30353](http://arxiv.org/abs/2605.30353) | cs.AI, astro-ph.CO, cs.HC, cs.SE

#### TL;DR
一位物理学家用 12 天、57 个 session 监督 Claude Code（Sonnet + Opus）写一个 JAX 实现的可微一阶微扰论模块，把 15 次监督介入按层级分类后发现：agent 自己靠 oracle test 解决了 10 个，3 个怎么都解决不了的失败有一个共同特征——**把"症状缓解"当成了"根因解决"**。

#### 问题是什么？
我们评估 coding agent（包括你做的 SWE-bench trace 事后分析）几乎都默认一个前提：测试通过 ≈ 任务完成。这篇论文用一个真实科研项目把这个前提撕开了一道口子。具体卡点是：agent 花了 57 个 session 里的 33 个在一个**根本无法表达目标物理（CLASS-PT 分支选择错误）的代码架构内部反复调系数**，即使被明确提示去重新考虑架构，它也做不到——它只会在给定结构里优化，不会提出架构替代方案。更狠的一个例子：agent 提交了一个"校准修正项"，通过了所有 oracle test，但这个项在理论里**根本不对应任何物理量**，换一个宇宙学参数就预测错。这是典型的"过拟合到 oracle"。

#### 他们怎么做的？
这篇没有提出新方法，它的价值在于**方法论严谨的现象学记录**——这恰恰是你欣赏的那种"不做学术 rubbish"的实证工作。

**核心 Insight**：oracle test 抓不到的失败不是随机分布的，它们共享一个可识别的结构——agent 无法区分"预测充分性"（predictive adequacy）和"解释正确性"（explanatory correctness）。

具体做法：
1. 全程记录 57 个 session，把 15 次需要人介入的事件按"介入层级"分类（agent 自主解决 / 靠领域知识解决 / 无法解决）。
2. 对 3 个 oracle 抓不到的失败做根因剖析，提炼共同property。
3. 总结出 3 条真正有效的监督实践：在 fiducial 校准点之外的多样参数点测试、跨 session 共享 changelog 暴露停滞的探索、明确禁止"非物理数值补丁"的规则。

**跟之前方法的本质区别**：大多数 agent 评估论文比的是"通过率提升了多少"，这篇比的是"哪类错误是通过率根本测不出来的"。它把"决定 agent 输出是否可信的是监督设计，而非模型能力"这个反直觉结论摆到了台面上。

#### 关键结果

| 监督事件类别 | 数量 | 占比 | 说明 |
|-----------|------|------|------|
| agent 靠 oracle test 自主解决 | 10 / 15 | 67% | 迭代收敛，正常工作流 |
| 靠物理学家领域知识解决 | 2 / 15 | 13% | 需要注入外部知识 |
| agent 无法解决（oracle 盲区） | 3 / 15 | 20% | 均为"症状 vs 根因"混淆 |
| 卡在错误架构内调系数的 session | 33 / 57 | 58% | 单一架构错误吞掉了一大半算力 |

**结果解读**：最值得品的不是 67% 这个自主解决率，而是 **58% 的 session 被一个 oracle 测不出的架构错误吞掉了**。这意味着如果你只看最终通过率，会严重高估 agent 的真实自主能力——大量"工作量"是在错误方向上空转。触发架构重设计的，不是更多 test，而是物理学家注入了一个具体概念（anisotropic BAO damping）。这对"test execution 边际价值"的研究是个绝佳佐证：执行本身可能很廉价，真正稀缺的是能识别"方向错了"的信号。

#### 局限性与开放问题

- **局限 1**：N=1。这是单个项目、单个领域（宇宙学微扰论）、单个 agent 的案例研究，作者自己也标注了 $N=1$。"症状 vs 根因"这个 pattern 在 web 开发、数据处理等更"软"的 SE 任务里是否同样成立，完全未知。
- **局限 2**：监督事件的分类（15 个、3 类）依赖物理学家本人的主观判断，没有第二位标注者做一致性校验（Cohen κ / Gwet AC1）——这正是你做评估时坚持的统计严谨性维度。
- **开放问题**：论文指出"closing the gap 需要能提出架构替代方案、能区分预测充分性与解释正确性的 agent"，但完全没说怎么做。这是一个明确的、悬而未决的能力缺口。

#### 💡 对我们的启发

1. **直接可用的技术点**：你做 SWE-bench / OpenHands trace 大规模事后分析时，可以把这篇的"症状 vs 根因"二分法变成一个**可标注的失败类别**。具体做法：从已有的"测试通过但人工复核认为没真正解决"的 trace 里，标注哪些属于"过拟合 oracle"（patch 让测试绿了但逻辑是 hack）。这能把"outcome correctness vs process quality"的 gap 量化成一个百分比。
2. **具体实验想法（1–2 周可验证）**：取 SWE-bench Verified 上若干个 agent 提交的"通过补丁"，对每个补丁构造一组**held-out 测试（原 repo 里存在但 agent 没见到的测试）**，测一下"通过原 oracle 但挂掉 held-out 测试"的比例。输入：现成 agent trace + patch；做：跑 held-out 测试；预期观察：相当比例的"通过"补丁在 held-out 上失败——这就是 oracle 盲区的定量证据，可以直接写成一篇"agent 通过率虚高多少"的短文。
3. **研究趋势判断**：这篇代表了 agent 研究从"benchmark 刷分"向"benchmark 可信度审计"的转向。对你的选题启示是：**与其再造一个 agent，不如造一个能暴露 oracle 盲区的诊断工具/数据集**——这更符合你"产出能被用上的 benchmark/tool"的定位，且开源潜力大。

---

### SoundnessBench: Can Your AI Scientist Really Tell Good Research Ideas from Bad Ones?

> **推荐理由**：直接命中你的 benchmark 方法论批判主线，而且揭示了"LLM-as-judge"这个被滥用的评估范式的系统性偏差——你做三层评估协议时必须知道这个。

📌 **论文信息**：Sy-Tuyen Ho, Minghui Liu, Huy Nghiem, Furong Huang | [arXiv:2605.30329](http://arxiv.org/abs/2605.30329) | cs.LG

#### TL;DR
构造了一个 1099 条 ML 研究 proposal 的 benchmark（从 ICLR 投稿重建、用 reviewer soundness 子分打标、对照原文审计），测试 12 个前沿 LLM 能否在"花算力之前"判断一个研究 idea 方法上靠不靠谱。结论：所有模型都有**普遍的乐观偏置**——把低 soundness 的 proposal 评成 sound。

#### 问题是什么？
现在一堆 "AI Scientist / AI co-scientist" 系统都宣称能自动化从假设生成到同行评审的全流程。但有个被绕过的根本瓶颈：**LLM 能不能在动手前就判断一个 idea 方法上可不可行？** 这正是你做 idea/novelty 评估时最关心的"第一道门"。现有 benchmark 几乎不测这个。难点在于：研究 soundness 是一个高度依赖领域、又容易被表面流畅度蒙骗的判断，而且 LLM 见过大量公开论文，存在污染风险。

#### 他们怎么做的？

**核心 Insight**：把 ICLR 真实投稿的 reviewer soundness 子分当作 ground truth，并明确把 benchmark 定位为"可恢复的 proposal 阶段 soundness"，而不是去预测完整论文的最终录用结果——这个 scope 的诚实界定本身就是方法论亮点。

具体做法：
1. 从 ICLR 投稿重建 1099 条 proposal，用 reviewer 的 soundness 子分打标，并对照源论文做人工审计。
2. 在标准 prompting 和激进 prompting 两种条件下测 12 个前沿 LLM。
3. 加了一堆混淆控制：公开语料污染、论文识别短语、表面特征、人工审计质量——逐一排除"是不是某个单一 confounder 造成的"。

**跟之前方法的本质区别**：大多数"AI reviewer" benchmark 直接拿录用/拒稿当标签，混入了大量与 soundness 无关的因素（novelty、写作、运气）。这篇把评估对象**收窄到 soundness 这一个可恢复的维度**，并诚实声明不预测完整 review 结果——这种 scope 的克制，恰恰是你批判"benchmark 合理性"时最看重的。

#### 关键结果

| 评估条件 | 主要失败模式 | 含义 |
|---------|------------|------|
| 标准 prompting | 频繁把低 soundness proposal 评成 sound（假阳性高） | 乐观偏置，不敢说"不行" |
| 激进 prompting | 错误从假阳性转向假阴性 | 只是把偏置平移，没消除 |
| 跨 12 个前沿模型 | 偏置普遍存在，非单一 confounder 可解释 | 是范式级问题，不是某个模型的毛病 |

**结果解读**：最关键的发现是 **prompting 只能在假阳性和假阴性之间搬运错误，消不掉总误差**。这说明乐观偏置不是"prompt 没写好"，而是模型行为的结构性属性。对"用 LLM 当第一道 soundness 门"的所有系统（包括 AI Scientist 类）都是当头一棒：当前 LLM 还不能可靠地独立担任科学严谨性的第一道门。

#### 局限性与开放问题

- **局限 1**：ground truth 是 ICLR reviewer 的 soundness 子分，而 reviewer 本身一致性就很差（这是 ML 社区公开的痛点）。用一个噪声很大的信号当金标准，"乐观偏置"里有多少是模型的、有多少是 reviewer 噪声的，难以完全分离。
- **局限 2**：只覆盖 ML 领域 proposal。SE / 系统 / 安全等领域的 soundness 判断标准差异很大，结论能否外推存疑。
- **开放问题**：论文证明了"当前 LLM 不行"，但没回答"什么样的训练/校准能让它行"——是需要 calibration、需要 RL、还是需要外部检索证据？完全开放。

#### 💡 对我们的启发

1. **直接可用的技术点**：你做"自动 + 专家裁决 + 一致性校验"三层评估协议时，第一层（自动 LLM 裁决）必须把这篇的乐观偏置纳入校正。具体：在自动层后面加一个**偏置校准步骤**——用一小批有专家标签的样本估计 LLM 的假阳性率，再对自动分做 label-shift 校正（这思路和今天另一篇 LLMSurgeon 的 confusion matrix 校正异曲同工）。
2. **具体实验想法（1–2 周可验证）**：把 SoundnessBench 的方法搬到 **SE 场景**——构造一个"代码方案 soundness"小 benchmark：收集若干"看起来合理但实际有 bug / 不可行"的代码方案，让 LLM 判断可行性，测它的乐观偏置率。输入：标注好的代码方案对；做：让 7B–14B 开源模型 vs 商业 API 都判一遍；预期观察：开源小模型可能偏置更大，但成本低，校准后能否追平商业 API——这直接服务你"小模型能否替代商业 API"的主线。
3. **研究趋势判断**：LLM-as-judge 正在从"默认可信"被推向"需要校准和审计"。对你的选题启示：**评估方法学里有一个明确的空位——"如何系统性测量并校正 LLM judge 的方向性偏置"**，而且在 SE 评估（代码质量、补丁正确性裁决）里几乎没人系统做过。

---

### Self-Trained Verification for Training- and Test-Time Self-Improvement

> **推荐理由**：把"verifier 是瓶颈"当成核心命题，提出的"模仿信息更充分的自己"这个不对称性非常巧妙，对你做 program repair 的自我修复循环（test execution / 迭代修复）有直接的方法迁移价值。

📌 **论文信息**：Chen Henry Wu, Aditi Raghunathan | [arXiv:2605.30290](http://arxiv.org/abs/2605.30290) | cs.LG, cs.AI, cs.CL

#### TL;DR
推理模型的自我提升（test-time 的验证-修正循环、training-time 的 self-training）都卡在同一个瓶颈——verifier 太弱。这篇提出 Self-Trained Verification (STV)：利用一个不对称性——**模型单独抓不到自己的错，但给它看参考答案就能抓到**——把"看过参考答案的自己"蒸馏成 verifier。结果在硬科学推理上把准确率从 1.5% 拉到 21%（14×）。

#### 问题是什么？
这个问题和你做 program repair 的迭代修复几乎同构。验证-修正（V-R）循环会"卡死"：verifier 给的分越来越高，但准确率不涨（分数膨胀），而且反馈太泛、没法 act。self-training 也一样：把坏的自生成数据加进训练集，模型越训越差。两边的瓶颈都是 verifier。但要训一个"能抓自生成错误"的 verifier，本身缺训练信号——因为这正是你想训出来的能力。这是个鸡生蛋问题。

#### 他们怎么做的？

**核心 Insight**：模型独立时抓不到自己的错误，但**当它看到参考解答时就能抓到**。把这个不对称性变成监督目标——训 verifier 去模仿"一个信息更充分版本的自己"。

具体方法流程：
1. 拿参考解答喂给模型，让它在"信息充分"状态下判断对错——这是高质量但需要 ground truth 的监督信号。
2. 训一个不看参考解答的 verifier 去**模仿**这个信息充分版本的判断（蒸馏掉对参考解答的依赖）。
3. test-time：用这个 STV verifier 驱动 V-R 循环；training-time：进一步用 RL 训 generator，把 STV verifier 放进 V-R 循环里（称为 verifier-in-the-loop，ViL）。

**跟之前方法的本质区别**：之前的做法（SFT、对 verifier 分数做 RL、甚至 meta-verifier）都在试图直接"训出验证能力"，但缺信号。STV 不是直接训，而是**把"信息不对称"转化成监督信号**——用容易获得的"看答案的判断"去教难获得的"不看答案的判断"。

#### 关键结果

| 设置 | 任务 | 指标变化 | 提升幅度 |
|------|------|---------|---------|
| STV (test-time V-R) | 硬数学 | accuracy 约翻倍 | ~2× |
| STV (test-time V-R) | 科学推理 | 1.5% → 21% | ~14× |
| ViL (verifier-in-the-loop 训练) | RL 已收敛的 generator | pass@1 再 +33% | 在饱和点之上继续涨 |
| ViL 后 generator 单独跑（无 verifier） | — | standalone pass@1 相对 +30% | 验证能力"内化"进了 generator |

**结果解读**：最有意思的不是 14× 这个夸张数字，而是 **ViL 训完之后，generator 即使 test-time 不用 verifier，单独的 pass@1 也相对涨了 30%**。这说明"和 verifier 一起训"能把验证能力**内化**进 generator 本身——不是测试时多花算力，而是真的学到了。这对"硬问题上推理的下一个前沿在于如何为验证而训、与验证一起训"是个强有力的论据。ablation 显示 SFT / RL-on-verifier-scores / meta-verifier 都做不到这点，说明关键设计选择就是那个"模仿信息充分的自己"的蒸馏目标。

#### 局限性与开放问题

- **局限 1**：STV 的监督信号依赖**有参考解答**。在没有 ground truth 的开放任务（比如真实 repo 的 bug 修复，"正确补丁"往往不唯一甚至不存在）上，这个不对称性怎么构造，不清楚。
- **局限 2**：实验集中在数学和科学推理，这些是"可判定正误"的任务。代码任务里有测试可当弱 oracle，但今天第一篇刚告诉我们 oracle 有盲区——STV 的 verifier 会不会也继承 oracle 的盲区？没测。
- **开放问题**：分数膨胀（verifier 给分涨但准确率不涨）是否被 STV 真正消除，还是只是推后了？长期 self-training 下 STV verifier 会不会自己也漂移，论文没做长程实验。

#### 💡 对我们的启发

1. **直接可用的技术点**：你做 LLM-based program repair 的"职责切分"（static analysis 定位、LLM 修复）时，可以把 STV 的不对称性用在**补丁验证**环节：让 LLM 在"看到失败测试的 stack trace + 正确行为描述"的充分信息下判断补丁对错，再蒸馏成一个不看这些信息的轻量 verifier，用来在迭代修复循环里给候选补丁打分——比纯跑测试更细粒度，且能抓 oracle 盲区。
2. **具体实验想法（1–2 周可验证）**：在你的 compatibility repair 数据集上，对每个候选补丁，构造"信息充分版"（给 LLM 看新旧 API 的 diff + 报错）vs"信息贫乏版"（只给补丁），测两者判断正确率的 gap。输入：候选补丁 + 两档上下文；做：让同一个 7B 模型判两遍；预期观察：信息充分版显著更准——这个 gap 的存在性就是 STV 能否在 repair 上 work 的前提，验证成本极低。
3. **研究趋势判断**：self-improvement 的重心正从 generator 转向 verifier，而且"训练时和验证一起训"正在成为主流。对你的启示：**在 SE 里，"如何在没有干净 oracle 的真实 repo 上构造可蒸馏的验证信号"是一个高价值、低竞争的方向**，且天然延续你的迭代修复主线。

---

### MIRA: Mid-training Rubric Anchoring for Source-Aware Data Selection

> **推荐理由**：面向 code mid-training 的数据筛选，"用一半 token 追平全量"对你做小模型代码能力、控制训练成本有直接价值；而且它把"评判标准"（rubric）本身变成可发现对象，呼应今天的整体主题。

📌 **论文信息**：Haowen Wang, Yaxin Du, Jian Yang, Jiajun Wu, Shukai Liu | [arXiv:2605.30288](http://arxiv.org/abs/2605.30288) | cs.AI

#### TL;DR
Mid-training（post-training 之前用大规模精选混合数据强化能力）的数据筛选有个独特难点：数据来自异构源、格式各异、训练角色不同。MIRA 提出"自锚定 rubric 发现"——先为每个数据源**发现该评什么**，再把这些判断蒸馏成可扩展的学生打分器做全量筛选。在 21 个源、5 个源组的 code mid-training 上，**用一半 token 追平全量**，并在 9 个代码 benchmark 上超过筛选 baseline。

#### 问题是什么？
mid-training 的数据选择和普通预训练不一样：数据在接近预训练规模、用预训练式目标训练，但是为下游能力精选、来自格式和角色都不同的异构源。现有方法两难：基于模型的方法（如 perplexity 打分）能 scale 但只给隐式质量信号；语义筛选方法判断更强，但通常假设固定 rubric 或标准化数据格式——而 mid-training 的数据恰恰格式不统一。卡点就是：**既要可扩展，又要源自适应的语义判断标准**，两者很难兼得。

#### 他们怎么做的？

**核心 Insight**：把"rubric 构造"本身变成数据选择的一部分——不同数据源该用不同的评判标准，而这个标准应该被**发现**而非手工写死。

具体做法：
1. 对每个源组，先做"自锚定 rubric 发现"——让模型自己找出这一类数据该评什么维度。
2. 把这些（昂贵的）judgment 蒸馏进可扩展的学生打分器。
3. 用学生打分器对全量语料做筛选。

**跟之前方法的本质区别**：模型法 scale 但信号隐式；语义法信号强但假设固定 rubric。MIRA 的差异是**让 rubric 随源自适应、且可蒸馏**——既保留语义判断的强度，又获得模型法的可扩展性。

#### 关键结果

| 设置 | 对比对象 | 结果 |
|------|---------|------|
| code mid-training（21 源 / 5 源组） | 各类 selection baseline | 9 个代码 benchmark 上全面超过 |
| MIRA 筛选后 | 全量语料训练（full-corpus） | 只用一半 token 追平 |

**结果解读**："一半 token 追平全量"是这篇最实在的卖点——对算力受限的研究者，数据筛选的 ROI 直接体现在训练成本减半。值得注意的是它在 **code** 任务上验证（9 个代码 benchmark），而不是泛泛的语言任务，这让它对你的相关度更高。"源自适应 rubric"这个设计选择是关键：把 21 个异构源塞进一个固定 rubric 显然会损失信息，分组发现 rubric 才能抓住每类数据的质量特征。

#### 局限性与开放问题

- **局限 1**：rubric 是模型"自锚定"发现的，发现质量本身没有外部 ground truth 校验——发现错了的 rubric 会不会系统性地筛掉某类有用数据？论文没给这个失败模式的分析。
- **局限 2**：实验规模和模型规模未在摘要中明确，"追平全量"的结论在多大模型上成立、是否随规模变化，需要看正文确认。
- **开放问题**："自锚定 rubric"和今天 SoundnessBench 揭示的"LLM 判断有乐观偏置"是直接冲突的——如果让模型自己发现 rubric 再自己打分，偏置会不会被放大？这两篇放一起读，是个很自然的批判切入点。

#### 💡 对我们的启发

1. **直接可用的技术点**：你做低资源语言（Cangjie）continued pretraining 时，数据筛选正是痛点——Cangjie 语料稀少且质量参差。可以借鉴 MIRA 的"为不同源发现 rubric 再蒸馏小打分器"思路：对 Cangjie 的不同来源（官方文档 / GitHub 代码 / 转译数据）分别发现质量 rubric，用小 scorer 筛，最大化有限算力的利用率。
2. **具体实验想法（1–2 周可验证）**：在你已有的代码 continued pretraining 语料上，对比"固定 rubric 打分"vs"分源发现 rubric 打分"筛出的数据子集，各训一个小模型，比下游 pass@1。输入：同一批原始语料；做：两种筛选各取等量 token 训练；预期观察：分源 rubric 在异构语料上优势更明显——验证成本可控，且直接服务小模型训练主线。
3. **研究趋势判断**：数据筛选正从"固定启发式"走向"可发现、可蒸馏的评判标准"。结合 SoundnessBench 的偏置警告，一个有价值的批判性课题是：**"自发现 rubric"在代码数据筛选上是否引入了系统性偏置，以及如何用一致性校验去检测它**——这是你"benchmark/评估方法论批判"和"小模型训练"两条线的天然交叉点。

---

## 方法对比

把今天三篇直接处理"验证/评判信号"的论文放一起对比，能看清它们各自攻击的是信号链条的哪一环：

| 维度 | Physics（oracle 审计） | STV（self-verifier） | MIRA（rubric 发现） |
|------|----------------------|---------------------|--------------------|
| 评判信号是什么 | oracle test（测试通过） | 训出来的 verifier | 自发现的数据质量 rubric |
| 核心问题 | 信号有盲区（症状≠根因） | 信号太弱（缺训练信号） | 信号太僵（固定 rubric 不适配异构源） |
| 解决思路 | 不解决，只诚实暴露盲区 + 监督实践 | 蒸馏"信息充分的自己" | 分源发现 rubric + 蒸馏小打分器 |
| 数据需求 | 无（案例研究） | 需参考解答（可判定任务） | 异构多源语料 + 模型自标注 |
| 计算开销 | 极低（观察性） | 中（需训 verifier + RL） | 低（蒸馏后用小 scorer 全量筛） |
| 适用场景 | agent 评估审计 | 数学/科学推理等可判定任务 | code mid-training 数据筛选 |
| 主要局限 | N=1，不可推广 | 依赖 ground truth，未测代码盲区 | rubric 发现质量无外部校验 |

一句话总结今天的取舍：**Physics 告诉你信号会骗人，STV 教你怎么把弱信号训强，MIRA 教你怎么让僵硬的信号变灵活——而 SoundnessBench 在旁边冷冷地提醒：别忘了，做判断的那个模型本身就有方向性偏置。** 四篇合起来，正好画出了"验证信号可靠性"这个研究空间的边界。对我们而言，把任何一环搬到 SE / program repair / 小模型代码训练的语境里做扎实的边际价值量化，都是延续现有主线、又有开源潜力的好选题。
