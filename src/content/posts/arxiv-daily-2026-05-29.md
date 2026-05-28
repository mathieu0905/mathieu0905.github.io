---
title: "arXiv 每日速递 2026-05-29"
date: "2026-05-29"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-29

## 今日总结

今天这批论文有一条非常贴合我们方法论主线的暗线：**当 LLM/agent 已经"看起来 work"之后，那些 benchmark、那些 ablation、那些显著性差异，到底测对了吗？** 四篇论文从四个不同角度逼问这件事：GSM-Symbolic 的统计再分析用 GLMM 推翻了"LLM 不会推理"的大半结论；LiveBrowseComp 证明 search agent 在 BrowseComp 上有 40%+ 的题靠"记忆 + 验证"而非"检索"答出来；LearnWeak 把小模型 computer-use agent 的失败按 planning vs execution 拆开做归因；Code RL 的 weight averaging 揭示一条 correctness-efficiency Pareto 前沿，证明 baseline 的"提升"可能只是沿曲线移动。一句话：今天值得花一上午精读，因为里头每一篇都在用"严肃的统计 / 严肃的归因 / 严肃的对照实验"做我们一直在主张的事。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [GSM-Symbolic Re-eval](http://arxiv.org/abs/2605.28700) | benchmark methodology | 用 GLMM 重做 GSM-Symbolic 的显著性分析，发现一半模型差异不显著，并找出"大整数分布偏移"这个被忽视的混淆变量 | ⭐⭐⭐ |
| [LiveBrowseComp](http://arxiv.org/abs/2605.28721) | agent benchmark critique | 三道诊断揭示 search agent 大量靠"内部知识"而非"检索"答题；新建只含 90 天内事实的 benchmark，所有 agent 闭卷 < 2% | ⭐⭐⭐ |
| [LearnWeak](http://arxiv.org/abs/2605.28775) | small agent specialization | 把 computer-use agent 失败拆成 planning vs execution，对应不同的训练数据生成与监督策略，OSWorld +11.1–11.6pp | ⭐⭐⭐ |
| [Code RL Weight Averaging](http://arxiv.org/abs/2605.28751) | code RL / Pareto | 用 nested unit-test coverage 训不同 checkpoint，揭示 correctness-efficiency 前沿，extrapolation 能延长前沿外推 | ⭐⭐ |

## 今日主题：当模型"看起来 work"，benchmark 还能信吗？

我们做 AI for SE，有个非常容易被忽视的陷阱：当一个 LLM 系统在某个 benchmark 上得到了亮眼的数字，**这个数字到底是模型能力的体现，还是 benchmark 自身的产物？** 今天这四篇论文，从四个完全不同的应用切面，集体回答了"我们其实没那么清楚自己在测什么"。

最赤裸的是 **GSM-Symbolic 的再分析**。原论文（Mirzadeh et al., 2025）扫了 25 个 LLM 在 GSM8K 模板变体上的性能跌幅，得出"LLM 没有真正的推理能力"这个广为流传的结论。新论文做了两件特别"我们风格"的事：第一，把 per-question 当作 random effect 放进 GLMM 里重做显著性分析，结果发现 20 个 open-weight 模型里只有一半在原 prompt 格式下有统计显著的跌幅；第二，他们发现 GSM-Symbolic 数据集里的整数分布相对 GSM-Base 有系统性偏移（K-S = 0.12，p < 0.001），控制了这个混淆变量之后，剩下的一半显著性又掉一半。**这是教科书级别的 benchmark 方法论再审视**——结论不是"GSM-Symbolic 是错的"，而是"原作者用的统计工具不够精细，导致把测量噪声当成了能力缺陷"。这跟我们一直主张的"benchmark 合理性 + 统计严谨性（McNemar、TOST、Gwet AC1）"是同一条线。

**LiveBrowseComp** 把同样的怀疑搬到了 agent 评测上。三道诊断很狠：(1) 把 agent 的工具拿掉，它居然还能答对 BrowseComp 上 44.5% 的题；(2) 它发的搜索 query 里超过一半是从内部假设出发的"验证型 query"，而不是从检索线索出发的"探索型 query"；(3) 当把答案支撑证据从检索结果里抹掉，agent 反而比闭卷 baseline 更差。结论是 **agent 在 BrowseComp 上的"搜索能力"在很大程度上是"内置知识"的产物**——这跟我们之前发现 SWE-bench agent 里 test execution 只贡献 1.25pp 是一个味道：当你看似在测一种能力，你测到的其实是另一种东西。

**LearnWeak** 切的是"为什么小模型 agent 在特定 domain 上不行"这个问题，做法也很合我们口味：与其抛一堆合成数据出去蛮训（论文坦白这种 naive 做法只带来边际收益），不如**用强 agent 作为参考，把弱 agent 的失败拆成 planning error 和 execution error 两类**，然后分别用 error-aware 的 loss 去监督。这本质上是 marginal value 思想在 agent training 上的应用——你不会在所有失败上都施加同样的梯度，因为 planning 和 execution 的边际产出曲线是不同的。

**Code RL Weight Averaging** 则把我们熟悉的 "code generation" 问题翻了个面：在竞赛编程的 RL 训练里，用不同 nested unit-test coverage 当 reward 训出的 checkpoint，线性插值能 trace 出一条 **correctness-efficiency Pareto 前沿**，而 extrapolation 还能把前沿往外推。论文里这个观察对我们的启发是——**"baseline 提升"很可能只是沿着这条前沿的滑动**，不是真正的能力扩张。这正是我们在做"agent 边际价值量化"时反复撞到的认识论问题。

把四篇连起来看，2026 年的 AI for SE 研究有一个越来越清晰的转向：**我们正在从"提出新方法、刷 SOTA"过渡到"重新检视已有 benchmark 和已有结论的可信度"**。这对我们手里那条"统计严谨 + 边际价值消融 + 公开 trace 的事后大规模分析"主线是非常正面的信号。

---

### The Importance of Being Statistically Earnest: A Critical Re-evaluation of GSM-Symbolic

> **推荐理由**：这是我们"benchmark 方法论批判 + 统计严谨性"主线的正面命中。它把 GLMM、random effect、K-S 检验等工具全套用上去，把"LLM 不会推理"这个 2025 年最广为流传的结论拆出了一半。如果我们要写一篇方法论批判论文，这就是范本。

📌 **论文信息**：Dominika A. Długosz, Arlindo Oliveira, Natalia Díaz Rodríguez | [arXiv:2605.28700](http://arxiv.org/abs/2605.28700) | cs.AI, cs.CL

![Figure：GSM-Symbolic 的 GLMM 复现分析。上半是 odds ratio 和置信区间（虚线为 OR=1 即无效应），下半是 20 个模型在 variant 上的性能跌幅与 p 值，阈值线为 α=0.05](https://arxiv.org/html/2605.28700v1/graphics/GSM_odds_ratios.png)

#### TL;DR
GSM-Symbolic 原论文用 25 个 LLM 在模板变体上的跌幅作为"LLM 不会推理"的证据；本文用 GLMM 加 per-question random effect 重做显著性检验，发现一半模型其实没有显著跌幅；再控制掉数据集里被忽视的"整数分布偏移"，剩下的显著性又掉一半。结论不是 LLM 在推理，而是**原论文的统计学不严谨**。

#### 问题是什么？
Mirzadeh et al. (2025) 的 GSM-Symbolic 是一个非常有影响力的结论：把 GSM8K 的题目用模板生成变体（换数字、换名字、换表述），25 个 LLM 全军都掉点，于是"LLM 没有真正的推理"成为去年最被引用的负面观察。但这里有个根本问题：**它做显著性的方式是 per-model 计算平均差异**，没有考虑同一道题在不同变体之间的相关性——这正是 GLMM 里 random effect 要处理的事。另一个被忽视的问题：GSM-Symbolic 的题目里出现的整数普遍比 GSM-Base 更大（数据集本身有 distribution shift），这会单独引入跌幅，跟"推理能力"完全无关。

#### 他们怎么做的？

**核心 Insight**：把每道题当成 random effect 放进 GLMM 里，重新算每个模型 base→variant 的跌幅是否显著；同时把"题目里最大整数"作为协变量加进去，控制掉数据集层面的混淆。

具体步骤：
1. 拿原论文公开的 20 个 open-weight 模型的回答数据，按 base–variant 配对组织
2. 用 Generalised Linear Mixed Model 拟合 `accuracy ~ variant + (1 | question)`，对每个模型分别估 odds ratio 和 p 值
3. 加上 K-S 检验比较 base 和 variant 的整数分布（D = 0.12, p < 0.001），证明 shift 存在
4. 在 GLMM 里把 `log(max_integer)` 当协变量加进去，重做显著性
5. 对剩下仍有显著跌幅的模型，做 model-specific 失败模式分析（variable binding 脆弱、算术失败、dual-task 干扰）

**跟之前方法的本质区别**：原论文用 paired-mean 差异 + 朴素 t 检验；本文用混合效应模型显式建模 question-level variance + 控制数据集变量。简单说就是从"agg 后再做统计"换成"在原始 trial 层做统计"。

#### 关键结果

| 分析层次 | 显示显著跌幅的模型 / 20 个 | 说明 |
|----------|--------------------------|------|
| 原论文方法（paired mean） | ~25 个全部跌幅 | 包含统计噪声 |
| 本文 GLMM | 10 / 20（50%） | 一半模型其实不显著 |
| 控制大整数效应后 | 约 5 / 20（25%） | 又掉一半 |
| K-S statistic（数据集偏移） | D = 0.12, p < 0.001 | 偏移确实存在 |

**结果解读**：
- 原论文 25 个模型"全军覆没"的图很震撼，但其中至少一半是 noise + 数据集偏移引入的，**不是推理能力的体现**
- 剩下真正显著的模型呈现的是 model-specific failure profile：variable binding fragility / 算术限制 / dual-task interference，这跟"统一缺乏推理"的叙事是矛盾的
- 这是一次成功的"用更精细的统计工具，把一个 sweeping claim 拆成 nuanced finding"的案例

#### 局限性与开放问题

- **局限 1**：再分析依赖原论文公开的回答 trace，无法覆盖那些只发了数字结论的模型。如果只有部分模型的 raw responses 可得，再分析的样本本身就有 selection bias
- **局限 2**：K-S statistic = 0.12 算"小到中"的 shift，作者断言"control 之后显著性又减半"是基于线性协变量校正——如果整数大小和推理难度的关系是非线性的（比如 ≤10 和 ≥100 是质变），线性控制可能反而低估或高估了这个效应
- **开放问题**：这种"用 GLMM 重做显著性"的方法学问题，**整个 LLM benchmark 文献到底有多少 SOTA claim 经不起这种检验？** 本文只做了 GSM-Symbolic 一个 case，缺一个 meta-analysis 告诉我们这个问题的规模

#### 💡 对我们的启发

1. **直接可用的技术点**：我们之前在写 marginal value 论文时用过 McNemar 和 Gwet AC1，但 **GLMM + per-question random effect** 这一招我们没系统用过。下次做 SWE-bench / OpenHands / Aider 的 trace 事后分析时，把每条 instance 当 random effect 放进 mixed model 里，应该能给我们"resolve 差异是否真的显著"提供一个更稳的统计 baseline，特别是在样本量小（< 100 instances）的实验里。

2. **具体实验想法**：选我们之前发现过"边际价值反直觉"的某个动作（比如 test execution 那 1.25pp），重新用 GLMM 跑一遍 paired analysis，同时把 patch 长度、文件数、bug 类别作为协变量控制掉，看看那个 1.25pp 是不是其实在统计上压根不显著——如果是，我们论文的 framing 可以从"贡献只有 1.25pp"升级到"在控制混淆变量后，这个动作根本没有统计显著贡献"，结论更强。1–2 周可以做完。

3. **研究趋势判断**：2026 年开始，**"statistically earnest"会成为 LLM benchmark 论文的新门槛**。简单算 mean + 报 95% CI 的论文会越来越被审稿人质疑。我们的工作流应该提前一步——在 paper 里默认报 GLMM、TOST 等价检验、bootstrap CI 这一套，反过来还能成为我们的差异化优势。

---

### LiveBrowseComp: Are Search Agents Searching, or Just Verifying What They Already Know?

> **推荐理由**：我们一直主张"agent 的边际能力到底是什么"这个 framing。这篇论文做的就是这件事的 search agent 版本——它没造新 agent，只做了三道诊断，结论就是"现在 agent 在 BrowseComp 上的表现 = 内置知识 + 一点点真检索"。方法论可以直接迁移到我们做 SWE-bench agent 行为分析。

📌 **论文信息**：HuiMing Fan, Xiao Wang, Zheng Chu, Qianyu Wang, Zhuoyao Wang | [arXiv:2605.28721](http://arxiv.org/abs/2605.28721) | cs.AI

![Figure 1：LiveBrowseComp 的设计动机。随着模型迭代，静态 benchmark 所需的知识被吸收进参数里，问题的有效难度随时间崩塌。用 90 天内的新事实构建 benchmark 才能避免这种侵蚀](https://arxiv.org/html/2605.28721v1/x1.png)

#### TL;DR
通过三道诊断发现 BrowseComp 上的 search agent 大量靠"内置知识 + 验证型 query"答题——agent 闭卷能答 44.5%；超过一半的 query 是从内部假设出发的；抹掉证据反而比闭卷更差。新建只含构建前 90 天事实的 LiveBrowseComp，所有 agent 闭卷 < 2%，搜索增益相对 BrowseComp 还要降 25–40 个百分点。

#### 问题是什么？
我们最近做"agent 边际价值"研究时反复撞到一个 epistemological 问题：当一个 agent 在 SWE-bench 上 resolve 了一个 issue，**它到底是靠"工具调用 + 信息整合"做对的，还是靠预训练里见过类似 commit 直接 recall 出来的？** 静态 benchmark 在反复被用做 evaluation 的过程中，知识必然渗到模型参数里——但 benchmark 的 evaluation 指标完全没法区分这两种情况。LiveBrowseComp 在 BrowseComp（一个流行的搜索 agent 评测）上做的事，正是我们一直想在 SWE-bench 上做的事。

#### 他们怎么做的？

**核心 Insight**：与其设计新的"高难度题目"逼 agent 表现差，不如**构造一个 agent 知识必然没见过的 benchmark**——就用过去 90 天才发生的、且不是 globally salient 的新闻/事实当题源。这一招的精妙在于它不要求 agent 变弱，而是让"预训练知识泄漏"这个混淆变量被釜底抽薪。

![Figure 2：BrowseComp 上的闭卷性能和工具增益。Left: pass@4 闭卷分数已经很高。Right: 工具调用的绝对增益。闭卷越强的模型，工具增益反而不一定大](https://arxiv.org/html/2605.28721v1/x2.png)

具体诊断 + 实验流程：
1. **诊断 A（闭卷测试）**：把工具完全拿掉，让 agent 强行回答 BrowseComp 的问题——结果 agent 闭卷能解 44.5% 的题，证明这些题在预训练里有覆盖
2. **诊断 B（query 行为分析）**：解析 agent 发出的所有 search query，发现 > 50% 不是从检索到的线索出发的，而是从模型内部 hypothesize 出来的"验证型 query"——它是在 search engine 上做 fact-check，而不是探索
3. **诊断 C（证据抹除）**：在工具返回里把"答案支撑证据"主动屏蔽，agent 的表现反而**低于闭卷 baseline**，说明现有 agent 不会从 partial / unsupporting 检索结果里恢复
4. **新建 benchmark**：人手撰写 335 道题，答案依赖构建前 90 天才发生的事实，从 6 个高频更新的来源里采，剔除掉 globally salient 事件
5. **重测**：所有评估的 agent 在 LiveBrowseComp 上闭卷 < 2%，搜索增益相对 BrowseComp 掉 25–40pp，原 BrowseComp 上的模型排名也不再 hold

**跟之前方法的本质区别**：之前的 search benchmark 做法是"找更难的题"，本文做的是"找 agent 知识无法覆盖的题"。这两件事完全不一样——前者还能被模型规模 scale up 掩盖，后者直接戳破"工具增益"的 measurement validity。

#### 关键结果

| Benchmark | Agent 闭卷准确率 | 工具增益 | 反映了什么 |
|-----------|----------------|---------|-----------|
| BrowseComp（旧） | 44.5% | 高 | 内置知识 + 验证 |
| BrowseComp（屏蔽证据）| 比闭卷更差 | 负 | agent 不会从弱证据恢复 |
| LiveBrowseComp（新） | < 2% | 比 BrowseComp 少 25–40pp | 真正测出"搜索能力" |
| 模型排名稳定性 | — | 不再 hold | 原排名靠内置知识 |

**结果解读**：
- BrowseComp 上"工具增益最大的模型"不一定是闭卷最弱的，这违反直觉——按理应该 closed-book 越差工具增益越大
- LiveBrowseComp 上所有模型 < 2%，说明现在的搜索 agent 一旦不能靠记忆，**真正"从零构造检索链"的能力非常弱**
- 这个发现颠覆了过去一年搜索 agent paper 的大量结论：很多论文报告的"我新 agent 比 baseline 强 5pp"可能只是"在 leakage 区间内移动"

#### 局限性与开放问题

- **局限 1**：335 道题的样本量对"all agents < 2%"这种极端结论支撑足够，但对模型之间的精细比较容易被噪声主导。如果 agent A 是 1.2%、agent B 是 1.8%，这个差异没什么 actionable 信息
- **局限 2**："90 天内的事实"这个边界本身是个 moving target——再过 6 个月，这批题又会被新一批模型的预训练吸收，benchmark 会自我过期。论文没讨论可持续的维护机制
- **开放问题**：这套 "knowledge cutoff-aware" benchmark 设计能不能搬到 code agent？比如用 90 天内才发布的 library 版本里的 bug，让 SWE-bench agent 修——预计同样会暴露 agent "真实工具使用能力"被严重高估的问题

#### 💡 对我们的启发

1. **直接可用的技术点**：诊断 A（闭卷测试）和诊断 C（证据抹除）几乎可以原样搬到 SWE-bench agent 行为分析里。在我们之前做的 trace 分析里，再加一道"把这个 issue 直接给 agent，不给任何工具、不给 repo 上下文"的测试，应该能直接揭示**哪些 resolve 是靠工具、哪些是靠 base model 已经见过相同的 commit**。这一步可以在两天内做完。

2. **具体实验想法**：拿 SWE-bench Lite 上某个 model 的 resolved instances，按 issue 创建日期 vs 模型 cutoff 切两半（cutoff 之前 vs 之后），分别看 resolve rate。如果"cutoff 之前"明显高于"cutoff 之后"，就是 leakage 的强证据——这能成为一篇 short paper 的核心 finding，标题可以叫 "SWE-bench resolve rate is partially leakage"。1 周可以做完。

3. **研究趋势判断**：**static benchmark 的可信度正在系统性地崩塌**。未来一年，"benchmark with temporal hold-out"会成为 high-quality eval 的标配。我们如果要做新的 SE benchmark（比如 OpenHarmony APR 数据集），从 day 1 就应该按时间分片，并且明确报每个分片相对模型 cutoff 的关系。

---

### LearnWeak: Automated Domain Specialization for Small Computer-Use Agents

> **推荐理由**：小模型 + agent specialization + error-aware loss，三件事都踩在我们当前关心的"小模型代码能力"和"agent 边际价值"主线上。最关键的是它显式区分了 planning error 和 execution error 两类失败——这跟我们想做的"SE 任务里 LLM 失败的细粒度归因"非常同构。

📌 **论文信息**：Suji Kim, Kangsan Kim, Sung Ju Hwang | [arXiv:2605.28775](http://arxiv.org/abs/2605.28775) | cs.LG, cs.AI, cs.CL

![Figure 2：LearnWeak 框架。LearnWeak-GEN 通过比较教师和学生的回答，总结学生弱点并基于弱点报告生成新任务；LearnWeak-DPO 用 step-wise preference supervision 和 error-aware optimization 微调学生模型](https://arxiv.org/html/2605.28775v1/x2.png)

#### TL;DR
小 computer-use agent 在特定软件 domain 上很弱，但 naive 合成数据收益微薄。LearnWeak 用强 agent 当 reference，识别学生 agent 的弱点、生成针对性任务，并用"区分 planning 和 execution"的 error-aware loss 监督——在 OSWorld 八个 domain 上平均提升 11.1–11.6pp。

#### 问题是什么？
工业部署 computer-use agent 的痛是：每个软件 domain（Excel、Chrome、VS Code、LibreOffice…）单独养一个大 agent 太贵，但单一通用小 agent 又在每个 domain 都有不均匀的弱点。一种 naive 的应对是"合成一堆 domain-specific 数据，然后蛮训"——但作者一上来就坦白这个做法**收益非常 marginal**。问题出在哪儿？合成数据**没有针对学生模型实际的失败模式**，反而把学生本来就 work 的地方反复"教一遍"，浪费 supervision 预算。这是非常典型的"在已经 work 的部分浪费 marginal value"的现象。

#### 他们怎么做的？

**核心 Insight**：specialization 不应该追求"覆盖所有 domain 任务"，而应该**精准地针对学生模型的弱点生成数据**，并且**把不同类型的失败用不同的 loss 区别对待**。

具体方法流程：
1. **LearnWeak-GEN**：拿一个强 reference agent 在 target domain 上跑任务，同时让小学生 agent 跑相同任务；用 GPT-style "weakness summarizer" 比较两者的轨迹和最终结果，输出一段"学生在哪种情景下卡住"的弱点报告
2. **基于弱点报告生成新任务**：用弱点报告作为 condition，配合 representative screenshots，生成针对学生短板的新任务集
3. **LearnWeak-DPO（error-aware）**：在 student rollout 上用 step-wise preference supervision；关键是把每一步失败归类为 planning error（想错下一步要做什么）或 execution error（动作 grounding 错误，比如点错按钮），两类失败对应的 DPO 信号分开优化
4. 迭代：specialization 完的学生再做新一轮 rollout，weakness summarizer 重新发现新弱点

**跟之前方法的本质区别**：以前的 autonomous trajectory generation 是"广撒网 + 平均监督"，本文是"按学生弱点定向生成 + 按错误类型分离监督"。这正是我们一直主张的"先做静态/外部归因，再针对性应用 LLM 监督"的职责切分哲学。

#### 关键结果

| Backbone | OSWorld 八个 domain 平均提升 | 相对 naive 数据合成 |
|---------|---------------------------|-------------------|
| EvoCUA-8B + LearnWeak | +11.6pp | 显著 |
| OpenCUA-7B + LearnWeak | +11.1pp | 显著 |

**结果解读**：
- 11pp 在 OSWorld 上是很大的提升，但更重要的是论文做了 ablation：去掉 error-aware loss、回到普通 DPO，提升立刻塌掉一大半——证明"分类失败 + 分别监督"才是 driving factor，不是数据合成本身
- naive 合成数据的 marginal contribution 被显式量化为"几乎没有"——这是一种我们很喜欢看到的"先 honest 报告 baseline 反直觉地弱"

#### 局限性与开放问题

- **局限 1**：planning 和 execution 的二分对 GUI agent 比较自然，但在 code agent / SWE agent 上，failure mode 的分类会复杂得多（mislocalization、wrong patch、broken test setup、tangled fix…），这个 binary 不够细
- **局限 2**：依赖一个强 reference agent 做 weakness 标注——这本身是个隐藏的预算项，不算在"annotation-free"里有点取巧
- **开放问题**：这套"按 student weakness 定向合成数据"的范式，对 fine-grained data efficiency 的影响曲线是什么？训到多少步开始 diminishing return？论文没做这个 scaling 分析

#### 💡 对我们的启发

1. **直接可用的技术点**：weakness summarizer + error-aware DPO 的思路可以直接套到我们的 program repair 工作上。具体可以这么搬：用一个强 model（Claude / GPT）当 reference，让 7B 代码小模型在我们之前的 APR benchmark 上跑——把失败按"localization error vs patch error vs test understanding error"分类，分别用不同 reward 信号在 DPO 里训。

2. **具体实验想法**：选一个 7B base coder（DeepSeek-Coder 或 Qwen-Coder），在我们手上的 OpenHarmony 兼容性修复数据集（~300 真实 bug）上做 LearnWeak 风格的 specialization。对照组：相同数量的 random synthetic patches。预期看到 error-aware specialization 显著优于 random synthesis，且失败归因可以反过来告诉我们"小模型在 Harmony 上的核心障碍是哪一类"。2–3 周可以做完，能成为我们小模型代码能力主线的一块。

3. **研究趋势判断**：**"按 failure mode 分类施加监督"会成为 agent training 的标配**。简单的"binary success/failure reward"已经不够用了，特别是在 multi-step agent 任务里。我们做 SWE-bench / OpenHands trace 分析的时候，应该重点提取这类细粒度的 failure mode 分类，可能直接成为下一代 agent training paper 的 input。

---

### Extrapolative Weight Averaging Reveals Correctness-Efficiency Frontiers in Code RL

> **推荐理由**：直接是 code RL 主线，而且揭示了一条非常重要的认识论现象——competitive programming 上"提升一点"可能只是沿 Pareto 前沿滑动，不是真正的能力增强。这对我们以后做 code benchmark / code RL 的 framing 有结构性影响。

📌 **论文信息**：Kunhao Zheng, Pierre Chambon, Juliette Decugis, Jonas Gehring, Taco Cohen | [arXiv:2605.28751](http://arxiv.org/abs/2605.28751) | cs.LG, cs.AI, cs.CL

#### TL;DR
在 competitive programming 的 RL 训练里，用 nested unit-test coverage 当不同 reward 训出的 checkpoint 之间，线性插值能 trace 出一条 **correctness-efficiency Pareto 前沿**；extrapolation 还能把这条前沿往外推，产生在 inference 时互补的 policy；ensembling 这些 extrapolated checkpoint 在 LCB/hard 上 pass@250 提升 3.3%。

#### 问题是什么？
在 code RL 里有两个相互拉扯的目标：correctness（pass 所有 unit test）和 efficiency（满足 time/memory limit）。常见做法是设一个 reward 一起优化两者，但很难 tune 到一个普适的 sweet spot——training 时 reward 设得"严"，hard 题上反复优化失败；设得"松"，简单题上效率退化。问题是：这两个目标之间到底存在什么样的 trade-off 结构？是 mutually exclusive 还是 jointly improvable？没有清晰答案，code RL 的方法学就一直在 ad-hoc 调参的水平上。

#### 他们怎么做的？

**核心 Insight**：不要事先 commit 到一个 reward，而是**用一组 nested unit-test coverage 当不同 reward 训出一组 checkpoint**，然后用线性插值 / 外推 trace 出整条 Pareto 前沿——这条曲线本身就是 trade-off 的可视化。

具体步骤：
1. 从同一个初始化出发，训多个 checkpoint：low-coverage reward（只 pass 小输入 test）、high-coverage reward（pass 全套包含大输入 test）
2. 在 hard 题上观察这条 coverage axis 的现象：high-coverage reward 减少了 optimization failures（efficiency 错误），但增加了 correctness failures，**净 solve rate 几乎不变**——这就是 frontier
3. 在两个 checkpoint 之间做 linear interpolation，recover 出整条 frontier
4. 做 extrapolation（超过两个 endpoint 的延长线），发现 extrapolated checkpoint 在某些 hard 题上反而能解出 original checkpoint 都解不了的题
5. 在三种 inference setting（pure reasoning / tool use / agentic coding）和两种规模（7B 和 32B）上验证 frontier 的稳定性
6. 用 extrapolated checkpoint 做 ensemble，在 LCB/hard 上 pass@250 比单 checkpoint 高 3.3%

**跟之前方法的本质区别**：之前的 code RL 都是"一个 reward + 训一个 checkpoint + 报数字"；本文是"一组 reward + 一组 checkpoint + 通过 weight space 操作 trace 整条 trade-off 曲线"。这是从 point estimation 到 curve estimation 的跃迁。

#### 关键结果

| 设置 | Baseline 单 checkpoint | Extrapolated Ensemble | 提升 |
|------|----------------------|---------------------|------|
| LCB/hard pass@250 | 基准 | +3.3% | 显著 |
| 7B 模型 frontier 形状 | 与 32B 一致 | 一致 | scale-invariant |
| Pure reasoning / tool use / agentic 三种设置 | 都呈现 frontier | 都能 extrapolate | 现象 robust |

**结果解读**：
- 3.3% 在 pass@250 这种高 sample 预算的设置上算大提升——尤其 ensemble 不增加任何额外 RL 训练成本
- 更重要的认识论发现：在 hard 题上 high-coverage reward 不会提 solve rate，**只是把 correctness/efficiency failure 之间互换**。这意味着很多 code RL paper 报"我新 reward 提了 1%"，**这个 1% 可能只是沿 frontier 移动**，不是新能力
- frontier 在 7B 和 32B、3 种 inference setting 上稳定存在，说明这不是某个模型的偶然现象

#### 局限性与开放问题

- **局限 1**：实验都在 competitive programming benchmark（LCB / hard 等），代码场景非常受限。在真实 SE 任务（修 bug、做 refactor）里，"correctness 和 efficiency"之间的 trade-off 不一定以同样形态存在
- **局限 2**：linear interpolation / extrapolation 是基于 weight space 的线性结构假设，对非线性的训练动力学（特别是 RL 后期 reward hacking 状态下）可能失效
- **开放问题**：这条 frontier 是 code 特有，还是普遍存在于"多个 conflicting reward"的 RL 任务？如果普遍存在，**很多近期 RLHF / RLVR paper 的 SOTA 数字可能都需要重新解读为"沿 frontier 的不同 operating point"**，而不是"绝对能力提升"

#### 💡 对我们的启发

1. **直接可用的技术点**：weight averaging 这个操作本身极其便宜——只要我们的 RL 实验里保留多个 checkpoint，事后做插值实验几乎零成本。下次做小模型代码 RL 训练（比如在 OpenHarmony 数据集上）时，应该默认保留 multi-reward checkpoint 做事后 frontier 分析。

2. **具体实验想法**：在我们之前发布过的小模型 APR 工作（如果有 RL 阶段）上，把 reward 拆成"功能正确"和"代码精简性"两个 axis 分别训 checkpoint，然后做插值，看看是否在 APR 这种"功能 + 工程质量"双轴任务里也存在 Pareto frontier。如果存在，这就是一篇非常 clean 的"程序修复里的 correctness-quality trade-off"短文。1 周可以做完。

3. **研究趋势判断**：**"刷 SOTA"这个 framing 越来越不可信**。未来 code RL / code agent 的论文需要默认报告整条 frontier，而不是单点 pass rate——只报单点会让所有 reviewer 怀疑你只是在沿前沿滑动。这点对我们将来投顶会的论文 framing 有结构性影响。

---

## 方法对比

| 维度 | GSM-Symbolic Re-eval | LiveBrowseComp |
|------|-------------------|---------------|
| 核心方法 | GLMM + 数据集协变量控制 | 时间窗口构造 benchmark + 闭卷诊断 |
| 攻击目标 | benchmark 上的统计结论 | benchmark 上的 measurement validity |
| 数据需求 | 现有 trace 即可 | 必须重新收集 90 天内事实 |
| 计算开销 | 极低 | 中（要重做整批 evaluation） |
| 适用场景 | 任何 paired evaluation | 任何"agent 工具增益"测量 |
| 主要局限 | 依赖原 trace 可得 | benchmark 会过期 |
| 与我们工作的契合 | 极高（统计严谨性主线） | 极高（agent marginal value 主线） |
