---
title: "arXiv 每日速递 2026-05-11"
date: "2026-05-11"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-11

## 今日总结

今天的 arXiv 主旋律是「**别再信平均分**」——三篇看似无关的论文，从三个层面打了 LLM 评测体系的脸：Arena leaderboard 的全局排名在统计上不可区分（[6]）、Deep Research Agent 报告中 39–77% 的引用经不起 fact-check（[20]）、agentic 漏洞重建在 binary 层面 50% 找得到但 30% 输在 model reasoning 之前的 differ 环节（[37]）。第四篇 [7] 转到训练侧，论证了 SFT 用和 pretraining 同样的 optimizer 比 LoRA 还少遗忘——挑战了"小数据微调首选 LoRA"的直觉。对做 LLM × SE 实证评估的人来说，今天值得花时间读。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Cited but Not Verified](https://arxiv.org/abs/2605.06635) | Agent 评估方法论 | 14 个模型 × 3 维度的 citation fidelity benchmark；fact-check 准确率随 tool call 数量上升反而下降 42% | ⭐⭐⭐ |
| [Why Global LLM Leaderboards Are Misleading](https://arxiv.org/abs/2605.06656) | Benchmark 批判 | Arena 89K 投票分析：2/3 决定性投票互相抵消、top-50 模型统计不可区分；提出 (λ, ν)-portfolio | ⭐⭐⭐ |
| [Patch2Vuln](https://arxiv.org/abs/2605.06601) | Agentic 程序分析 | 从 ELF binary diff 重建 CVE 根因；10/20 定位、11/20 根因正确；6/20 输在 model 之前的 differ 环节 | ⭐⭐⭐ |
| [Optimizer-Model Consistency](https://arxiv.org/abs/2605.06654) | Fine-tuning 方法论 | SFT 与 pretraining 用同 optimizer 比 LoRA 更少遗忘；Muon 在 reasoning task 上意外更差 | ⭐⭐ |

## 今日主题：评测体系的脆弱性，与 agent 设计动作的边际价值

今天这四篇放在一起看，有一条非常清晰的主线：**当 LLM/agent 已经"work"，我们对它"到底有多 work、为什么 work"的测量正在失效**。

[6] 从社区最权威的 leaderboard 入手——Chatbot Arena 的全局 BT 排名，结果发现 top-50 模型之间 pairwise 胜率最大 0.53，几乎是抛硬币。问题不在数据少，而在评分系统把语言/任务/时间维度上的**异质群体**强行折叠成一个标量。同一天，[20] 把这种"分数好看但不可信"的现象推到了 Deep Research Agent 上：模型很会写带引用的报告（94% 链接可访问、80% 主题相关），但只有 39–77% 的引用真的支撑它声称的事实。更刺眼的是——**多调几次 retrieval tool 反而让 fact-check 准确率掉 42%**。

[37] 是另一个味道的"测量难题"：在 binary patch 上做 vulnerability reconstruction，作者诚实地报告了 10/20 的定位率，然后做了 oracle diagnostic——**6 个 fail case 是 differ 或 ranker 在 LLM 看到 prompt 之前就已经选错了函数**。这正是博主一直在做的"agent design action 边际价值量化"的标准动作：先把 stage-wise failure 拆开，再把锅按 stage 分。如果不这么拆，整篇文章读完只会留下"模型还不够强"的结论。

[7] 表面上是优化器论文，但底色一样：在 SFT 这种"小数据上做 fine-tuning"的场景，社区默认的 LoRA"高效又不遗忘"叙事被这篇直接挑战——**只要训练阶段一致地用 pretraining 同款 optimizer，full fine-tuning 反而遗忘得更少**。这是又一个反直觉的边际价值结论。

四篇合起来，相当于在告诉做实证评估的我们：**不要再把 agent / LLM 当 black box 来跑 end-to-end 平均分**——拆 stage、拆 subpopulation、拆引用的 fact-check 链条、拆 optimizer 与 weight 更新方向的耦合，才是这一波研究能产生真知识的地方。

---

### Cited but Not Verified: Parsing and Evaluating Source Attribution in LLM Deep Research Agents

> **推荐理由**：这是博主"agent 边际价值量化"主线下最容易迁移的一篇——它把"deep research agent 生成的引用"作为一个独立可测的输出维度，建立了 3 阶段 fact-check pipeline；同样的拆解思路完全可以挪到 SWE-bench / OpenHands trace 分析上做 patch citation / context source fidelity。

📌 **论文信息**：Onweller, Lumer, Huber et al. | [arXiv:2605.06635](https://arxiv.org/abs/2605.06635) | cs.CL

#### TL;DR
做了 14 个 LLM 在 Deep Research Agent 模式下的 citation fidelity benchmark。核心发现：链接可用率 >94%，相关性 >80%，但 fact-check 准确率只有 39–77%；并且 tool calls 从 2 涨到 150 时，fact-check 反而下降约 42%。"看起来引用充分"和"真的可靠"之间存在系统性 gap。

#### 问题是什么？

Deep Research Agent（你输入一个问题，它跑几十次搜索 + 阅读，吐出一份带 inline citation 的 Markdown 报告）已经是 ChatGPT / Perplexity / Gemini Deep Research 的标配。但**没有人系统验证这些引用是不是真的支撑它说的话**——

- 方案 A：信模型自己 self-cite，等于让被告自己签判决书；
- 方案 B：用 RAG 检索分数当 ground truth，但 retrieval relevance ≠ factual entailment；
- 方案 C：让 LLM-as-a-judge 验，但 judge 自己经常 hallucinate。

更糟的是，工业界目前把"引用数多"、"引用 URL 可访问"当成质量信号——这是个**测量 proxy 严重失真**的典型场景。

#### 他们怎么做的？

**核心 Insight**：把"评估引用"拆成 3 个**正交且可独立测量**的维度，并强制做"反向检索"——从生成的报告反向去拉真实 cited content，再做对齐判断，而不是只看 inline citation 字符串。

具体方法流程：

1. **AST parser 抽 citation**：用确定性的 Markdown AST parser 从报告里提取每条 inline citation，确保不会因为模型用不同 citation 格式（`[1]`、`[link]`、脚注）漏统计。这是 reproducible 评估的基础——很多前人工作输在 parser 自身就有偏差。
2. **三维独立评估**：
   - *Link Works*：URL 是否能访问；
   - *Relevant Content*：cited 页面跟引用上下文是否话题对齐；
   - *Fact Check*：引用上下文的具体 factual claim 是否能在 cited 页面里被证实。
3. **Rubric-based LLM-as-judge + human calibration**：每个维度有明确 rubric，并用人工标注校准 judge 的偏差，给出 judge 的 Cohen κ。

**跟之前方法的本质区别**：以往的 "citation accuracy" 评估常常只问"引用是否相关"（检索分数风格），这篇明确把 *relevance* 和 *factual entailment* 分开来度量——结果发现两者差出几十个百分点。这就是"测量维度选错了"的典型样本。

#### 关键结果

| 评估维度 | Frontier 模型 | 开源最优 | 业界中位 |
|---------|--------------|---------|---------|
| Link Works | >94% | ~90% | 部分 <50% one-shot |
| Relevant Content | >80% | ~75% | ~60% |
| Fact Check | 39–77% | 显著更低 | 大量 fail |

| Tool calls 数量 | 2 | 50 | 150 | Δ |
|----------------|---|----|-----|---|
| Fact Check 准确率（两个 frontier 模型均值） | 高 | 中 | 低 | ≈ **-42%** |

**结果解读**：

- "更多检索 ≠ 更可靠引用"——这是反 RAG 直觉的发现：当 agent 调用搜索更多次时，它倾向于堆砌"看起来相关"的链接，而不是更精确地引用。这暗示**当前 deep research agent 的 attribution 机制是 retrieval-grounded 而不是 evidence-grounded**。
- 14 个模型里只有 <50% 的开源模型能在 one-shot 下生成带引用的报告——意味着开源生态 Deep Research 能力还远未到 production-ready。
- Frontier 模型和开源模型在 Link Works 上几乎打平，但在 Fact Check 上差距撕开——**fact entailment 是真的 capability gap，不是 prompt 工程能拉平的**。

#### 局限性与开放问题

- **局限 1**：评估面向英文 Markdown 报告，对中文/多语种 deep research、对结构化引用（学术 BibTeX、专利引用）没覆盖。Cohen κ 和 judge calibration 的鲁棒性在跨语种上可能掉。
- **局限 2**：fact-check 用 LLM-as-judge，虽有 human calibration，但当 cited 网页本身就 hallucinate（如博客抄博客）时，对错判断仍取决于人工标注的边界。论文没披露对长 PDF / 多模态源的处理。
- **开放问题**：retrieval 多反而 fact-check 差——是 attention dilution、上下文 token budget 抢占、还是模型在 long context 下选择性偷懒？这个 mechanism 没回答。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主在做 agent trace 大规模事后分析（SWE-bench、OpenHands 日志）时，可以把这套 3 维 citation 评估**改造成 patch citation fidelity 评估**——agent 修 bug 时经常引用"this related issue / similar PR / API doc"，但**它真的看了这些链接里的内容、内容真的支撑它的修复策略吗？**这是个完全没人做过的 agent process quality 维度。
2. **具体实验想法**：拿现有 OpenHands 公开 trace（修同一批 SWE-bench-verified 任务的），从 trace 里抽出所有 agent 在 ReAct thought 里 cite 的 URL / file path / 行号，用类似 3 维评估：
   - 引用的 file / line 是否真的存在；
   - 引用的代码片段是否与 agent 当前要改的位置存在依赖关系（用静态分析判断）；
   - 引用的内容是否真的支持 agent 接下来的 patch 决策。
   预期发现：**fact-check 维度低分子样本和最终 patch 错误高度相关**，这就是一个新的 process-quality predictor。1–2 周可以做出 pilot。
3. **研究趋势判断**：deep research / coding agent 都在从"end-to-end 跑分"走向"中间步骤 attribution 评估"。博主未来选题里，agent 中间过程（plan、retrieval、tool call、self-reflection）的**事后可审计性度量**会成为顶会主线之一——比"端到端高几个点"更有方法论价值。

---

### Why Global LLM Leaderboards Are Misleading: Small Portfolios for Heterogeneous Supervised ML

> **推荐理由**：和博主"benchmark 合理性 + partition / ordering metrics + 统计严谨性"主线完全同频。本文用 89K Arena 投票实证，证明全局 Bradley-Terry 排名在 top-50 段位上几乎是噪声——这是当前所有"我们超过 GPT-x"宣称的统计基础。

📌 **论文信息**：Moondra, Chughtai, Lanka, Gupta | [arXiv:2605.06656](https://arxiv.org/abs/2605.06656) | cs.LG, cs.DM, math.OC

#### TL;DR
分析 Arena 52 个 LLM、116 种语言的 ~89K pairwise 投票：(1) 全局 BT 排名里 2/3 决定性投票被抵消；(2) top-50 模型 pairwise 胜率 ≤ 0.53；(3) 按语言分组后 ELO spread 涨 2 个数量级，说明"噪声"其实是结构化的 subpopulation 异质性；(4) 提出 (λ, ν)-portfolio：仅 5 个 distinct ranking 即可 cover 96% 投票。

#### 问题是什么？

社区现在把 Chatbot Arena 当事实标准 leaderboard：你说"我的模型超过 GPT-4o"基本指的是 BT 分数。但这个排名暗含一个**强统计假设**——所有用户对所有任务的"哪个回答更好"判断服从同一个 latent ranking。

问题是：

- 一个写中文古风诗的用户和一个写 Python pandas 代码的用户，对"好回答"的偏好是**正交甚至相反**的；
- 把所有他们的投票塞进一个 BT 模型，等于强行把多峰分布拟合成一个 scalar——你拟合得越好，损失的 signal 越多。

这篇论文的 contribution 不是"指出这个问题"——以前也有人喊——而是用 89K 真实投票**定量证明**这个问题严重到 top-50 全是 noise，并给出可行的替代方案。

#### 他们怎么做的？

**核心 Insight**：把 leaderboard 从"找全局最优模型"转换成 set cover 问题——找一个**小模型组合**（portfolio），让每个用户子群体都能在组合中找到对自己有效的模型。

具体方法流程：

1. **诊断阶段**：在 ~89K Arena 投票上拟合全局 BT，统计 top-k pairwise 胜率；按 (语言, 任务, 时间) 分组重新拟合，对比 ELO spread 变化——结果 spread 涨 2 个数量级，确认异质性主导。
2. **(λ, ν)-portfolio 形式化**：定义一个 portfolio 是"一组模型 + 路由策略"，要求覆盖至少 ν 比例的用户、且对每个被覆盖用户其预测误差 ≤ λ。问题归约到一个加权 set cover variant，作者用 VC 维给出近似保证。
3. **实证验证**：在 Arena 数据上 portfolio 只需 5 个 distinct BT ranking 就 cover >96% 投票（vs 全局排名 21%）；在 COMPAS 上证明 portfolio 还能用作 fairness blind spot detector。

**跟之前方法的本质区别**：以前的"多 leaderboard"分流是手动按 domain 切（HumanEval/MMLU/GSM8K），切完依然在每个 domain 内做 scalar 排名。这篇把"切法"作为优化变量本身——**让数据自己告诉你应该切成几片**，每片用什么模型组合。

#### 关键结果

| 指标 | 全局 BT 排名 | (λ, ν)-portfolio |
|------|------------|-----------------|
| Top-50 模型 pairwise 胜率上限 | 0.53（统计不可区分） | — |
| 决定性投票互相抵消比例 | ≈ 2/3 | — |
| 按语言分组后 ELO spread | 1x（baseline） | 100x |
| 覆盖投票比例（Arena） | 21%（top-6） | **>96%**（仅 5 distinct rankings） |
| Top-6 portfolio vs top-6 全局 | 1x | **2x 覆盖** |

**结果解读**：

- "2/3 投票互相抵消"是非常震撼的数字——意味着 leaderboard 上 60% 的 signal 是 sub-population 之间互投反对票产生的噪声。
- 按语言分组后 ELO spread 涨 2 个数量级，直接坐实了"语言/任务异质性是首要 confounder"。这给了博主未来做 partition metrics 论文一个很好的 reference 数字。
- COMPAS 实验值得单独看——把 portfolio 当 fairness blind spot detector，是个有意思的副产品：如果你的 portfolio 选模型时把某个少数群体的模型挤出去了，那这个群体就是被 leaderboard 系统性忽视的。

#### 局限性与开放问题

- **局限 1**：依赖 Arena 风格的 pairwise human feedback。SE 任务（如 SWE-bench）是 outcome-correctness（pass/fail），不是 pairwise preference——portfolio 形式化能否直接迁移到 binary outcome 上还得重新做。
- **局限 2**：portfolio 数量 5 是在 Arena 数据上的实证，没给出 portfolio size 与 ν 之间的理论 scaling law。换数据集得重新跑。
- **开放问题**："covered" 用户和"uncovered" 用户的 systematic 差异没深入分析——这正是 fairness 视角下最关键的部分（被踢出 portfolio 的是不是某个语言/职业群体？）。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主关心的"agent 设计动作边际价值"实验里，最大隐忧是**"对哪批任务"边际为正？对哪批为负？**——直接照搬本文的 (λ, ν)-portfolio 思路：把 SWE-bench tasks 当作"用户"，把 agent design choice 当作"模型"，找一个**最小 design 组合 portfolio**，使得每个 task family 都有一个 design 能 cover。这能把以前"test execution 平均贡献 1.25pp"这种全局结论拆出"在哪类 task 上贡献 +8pp、在哪类 -3pp"。
2. **具体实验想法**：拿 SWE-bench-verified 全集，按 task 的 (file 数量, 修改行数, 是否涉及 test) 切成 6–8 个 stratum，跑 4 个 agent 设计变体（with/without test exec × with/without structure injection）。在每个 stratum 上算独立 ELO 风格 ranking，看 ranking 之间的 Kendall tau；预期看到**至少 2 组 stratum 间排名颠倒**，这就是 design action 边际价值非均匀的实证。1 周可以跑完。
3. **研究趋势判断**：未来 1–2 年，"single benchmark → single leaderboard"的范式会被结构化、可路由的 portfolio benchmark 替代。博主的 OpenHarmony 工具链如果想做 evaluation methodology 论文，这个方向是大空地。

---

### Patch2Vuln: Agentic Reconstruction of Vulnerabilities from Linux Distribution Binary Patches

> **推荐理由**：这篇是博主"职责切分哲学"（static analysis 定位 + LLM 修复 / 推理）的镜像版——它做的是 binary diff 定位 + LLM 推理 root cause，并且**诚实地做了 stage-wise 失败归因**，10/20 定位、6/20 fail 在 model 之前。这个 oracle diagnostic 的做法值得抄。

📌 **论文信息**：David, Gervais | [arXiv:2605.06601](https://arxiv.org/abs/2605.06601) | cs.CR, cs.AI

#### TL;DR
给定一个 Ubuntu `.deb` 安全更新前后的 binary，让 offline agent 重建漏洞根因。在 25 对真实安全更新（20 正样本 + 5 negative control）上：10/20 定位到 verified security patch function，11/20 给出正确 root cause class。Oracle diagnostic 揭示 6/20 fail 是因为 binary differ / ranker 在 LLM 看到之前就已经选错函数；validation 阶段在 25 对里只产出 2 个 minimized differential，都来自 tcpdump，且没有任何 sanitizer / crash / memory corruption proof。

#### 问题是什么？

安全社区有个长期场景：CVE 公告往往滞后，攻击者从 binary patch diff 里反推漏洞细节（"1-day exploit"），防御者也想 ASAP 理解 patch 在堵什么。但现实约束是：

- 很多发行版（Ubuntu LTS、企业 RHEL）你能拿到的就是 `.deb` / `.rpm`，**源码 patch 和 advisory text 都不一定第一时间公开**；
- Binary diff（Ghidra/Ghidriff）能告诉你哪些函数变了，但**无法告诉你为什么变**——是优化、是 refactor、还是真的修了 use-after-free？

之前的工作要么直接喂源码给 LLM（不现实），要么完全靠人工二进制审计（不规模化）。这篇问的是：**只给 binary diff 证据，offline agent 能走多远？**

#### 他们怎么做的？

**核心 Insight**：把 binary patch 当作"local 可重放"的 evidence chain——不依赖任何在线 LLM API 或外部漏洞数据库，整个 pipeline 在本地 reproducible，结果可以独立 audit。

具体方法流程：

1. **ELF 抽取与差分**：从 `.deb` 包里抽 old/new ELF 对，用 Ghidra + Ghidriff 做函数级 diff，得到 changed function set。
2. **Ranker 打分**：对 changed function 按 "是否更可能跟安全相关" 打分（cycle complexity 变化、新增 bounds check、return-path 调整等），排出 top-K 候选。
3. **构造 dossier**：每个候选生成一个结构化档案：函数 disasm、call graph 周边、字符串引用、changed lines highlight。
4. **三阶段 agent**：
   - *Preliminary audit*：基于 dossier 输出初步假设；
   - *Bounded validation plan*：写一个 minimized PoC / differential plan，bounded 在不会跑挂沙箱的范围内；
   - *Final audit*：综合 validation 结果与初判，给最终 root-cause class。
5. **Oracle diagnostic**：对每个 fail case，作者人工逐个分析失败发生在哪一阶段——这是论文真正的方法学贡献。

**跟之前方法的本质区别**：之前 "LLM + binary diff" 论文大多只 report end-to-end 准确率。这篇做了**stage-wise failure attribution**——你能看到 fail 是 LLM 推理错了，还是 differ / ranker 先选错了候选。这就是博主一直在做的"agent design action 边际价值量化"的标准动作。

#### 关键结果

| 评估维度 | Patch2Vuln（n=20 security pairs） |
|---------|--------------------------------|
| Localized verified security patch function | **10/20 = 50%** |
| Accepted final root-cause class | **11/20 = 55%** |
| Fail 在 binary differ / ranker（model 之前） | 6/20 = **30%** |
| Fail 在 context export | 1/20 = 5% |
| Bounded validation 产生 minimized differential | 2/20（均为 tcpdump） |
| Crash / sanitizer / memory corruption proof | **0** |
| 5 个 negative control 全部分类为 unknown | ✓（无假阳性） |

**结果解读**：

- **30% 的失败发生在 LLM 之前**——这是这篇最有价值的数字：意味着如果只盯着模型 reasoning 做改进，最多救回 70% 的剩余空间；**给 differ 和 ranker 加 30% 的工程预算可能比换大模型更有回报**。
- Validation 阶段几乎全军覆没（2/20，且无任何 crash proof），暴露了一个深刻的悖论：**LLM 可以在 plausible 层面解释漏洞，但生成 executable PoC 仍是另一个数量级的难度**——这个发现对未来"LLM-as-fuzzer"工作是个冷水。
- Negative control 0 假阳性意味着 agent 至少不会无中生有，这点比某些 hallucination 严重的安全 LLM 工具好。

#### 局限性与开放问题

- **局限 1**：样本量极小（n=20 security + 5 control），单 distribution（Ubuntu）。Differ 失败率 30% 在更大样本上可能波动。
- **局限 2**：评估 ground truth 用 "private source patch + binary function" 人工裁决——这个 oracle 是否覆盖了 silent fix（patch 改了但 advisory 没说）需要额外检验。
- **开放问题**：30% 在 differ/ranker 失败是因为 Ghidra 反编译质量？还是 ranker feature set 错了？论文没拆。这就是博主可以接的下一篇——**把 ranker 替换成基于 control-flow / data-flow 改动的 ML ranker，看能不能把 30% 拉到 10% 以下**。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主做 Whole-repository compatibility repair 时，"哪些 file / function 是 candidate fix location" 的定位环节经常被 LLM 直接吞掉。完全可以照搬 Patch2Vuln 的 Oracle diagnostic 方法——**强制把定位、context selection、patch 生成、validation 四个 stage 拆开做失败归因**。这能直接产出一篇"Where do LLM-based repair agents really fail? A stage-wise analysis"论文。
2. **具体实验想法**：拿一个现成的 repair agent（如 SWE-agent / AutoCodeRover）的公开 trace，挑 50 个失败案例，按 4 阶段做 oracle diagnostic：
   - 真 fix 函数是否进了 retrieved context？
   - retrieved context 是否包含 fix 所需的 type / call site 信息？
   - LLM 给出的 patch 是否在 candidate location 上但写错？
   - Patch 写对但 test 失败？
   预期 distribution：≥ 40% 的失败在前两阶段（context selection），这就是博主"static analysis 做定位、LLM 只负责修复"哲学的实证依据。1–2 周做完。
3. **研究趋势判断**：未来 1 年，agent 论文的可发表门槛会从"end-to-end 高几个点"逐步升到"我能解释清楚 stage-wise 边际贡献"。Patch2Vuln 这种"50% 不算高，但每个失败都能溯源"的风格，比"我们到了 70%"但黑箱的论文更有引用潜力。

---

### Optimizer-Model Consistency: Full Finetuning with the Same Optimizer as Pretraining Forgets Less

> **推荐理由**：和博主"小模型代码能力 / continued pretraining / LoRA"主线相关。它给出了一个非常反直觉的实证：full fine-tuning + 同款 optimizer 比 LoRA 更不遗忘。如果想用 7B–14B 代码模型做 domain adaptation（如 Cangjie、ArkTS），这个结论可能改变你的 fine-tune 选型。

📌 **论文信息**：Liu, Wang, Zhang | [arXiv:2605.06654](https://arxiv.org/abs/2605.06654) | cs.LG, cs.AI, math.OC

#### TL;DR
论文观察到一个现象命名为 **optimizer-model consistency**：SFT 时如果使用和 pretraining 同样的 optimizer（AdamW → AdamW），learning-forgetting tradeoff 优于其他 optimizer，**也优于 LoRA**。具体对比 Muon 和 AdamW 在 pretraining + SFT 全链路里的表现，发现 Muon 在 reasoning task 上反而更差——可能因其偏向 rote memorization。

#### 问题是什么？

社区当前的 fine-tune 默认套路是：

- "小数据微调？上 LoRA，省显存又不遗忘"
- "想要全力？full fine-tune，但小心 catastrophic forgetting"
- "新 optimizer 更猛？换 Muon / Sophia / Lion"

但**几乎没人系统问过**：pretraining 用 AdamW、SFT 换 Lion，这两个阶段之间是否存在隐性失配？这种失配是否解释了 fine-tune 后模型在通用能力上的退化？

这篇的核心 thesis 是：是的，optimizer 在 pretraining 阶段已经在 weight landscape 上刻下了一个特定形状的"槽"，SFT 用不同 optimizer 等于在新的方向上推 weight，自然容易跌出原 landscape。

#### 他们怎么做的？

**核心 Insight**：optimizer 不是"中性更新工具"——它对 activation 起 implicit regularization 作用，决定了 pretrained checkpoint 周围的 loss landscape 形状。SFT 想最小化遗忘，必须**沿着同一 optimizer 雕刻出的方向**做 weight 更新。

具体方法流程：

1. **现象实验**：固定 pretrained model（AdamW 训出来的），SFT 阶段分别用 AdamW / Lion / Muon / LoRA，测试两个指标：new task accuracy、old task forgetting。
2. **机制分析**：从 activation regularization 视角理论分析——证明 same-optimizer 更新会保持 pretraining 时 activation pattern 的某些 invariant；不同 optimizer 则破坏这些 invariant。
3. **Muon 对比实验**：完整跑了 Muon 在 pretraining 和 SFT 全链路的 controlled comparison，发现 Muon 在 reasoning task 上意外更差。
4. **合成实验**：用一个小型语言建模 setup 隔离 Muon 的"rote memorization 偏好"——证明这种偏好在小数据 SFT 时反而成为劣势。

**跟之前方法的本质区别**：以前研究 fine-tuning forgetting 集中在 LoRA / adapter / regularization term；这篇直接把 optimizer 选择本身作为一个可优化的设计变量，并且**敢说 LoRA 不一定更好**——是当前 fine-tune 社区里少有的诚实对比。

#### 关键结果

| 设置（pretrain → SFT） | 新任务表现 | Old task 遗忘 |
|--------------------|-----------|-------------|
| AdamW → AdamW（一致） | 同或更高 | **最少** |
| AdamW → Lion | 中 | 多 |
| AdamW → Muon | 偏低（reasoning task） | 多 |
| AdamW → LoRA | 中 | 中等（多于 same-optimizer full FT） |

| Optimizer | 在 reasoning task 上的 SFT 表现 | 在 memorization task 上 |
|-----------|------------------------------|----------------------|
| AdamW | baseline | baseline |
| Muon | **更差** | 更好（rote memorization 倾向） |

**结果解读**：

- "Full FT 比 LoRA 更不遗忘"是反直觉的——传统理解是 LoRA 只动低秩子空间所以保留 base capability。这篇说明 LoRA 不动 base 也会因 inserted module 的 forward shift 改变 activation distribution。如果在 reasoning task 上要更好的 retention，**same-optimizer full FT 可能是更优选择**。
- Muon 的 rote memorization 倾向给了"为什么 Muon 在 pretraining 看起来很猛但 fine-tune 后效果不稳"一个机制性解释。
- 这意味着选 optimizer **不能跨阶段独立优化**——必须把 pretraining 和 SFT 当作一个 joint design problem。

#### 局限性与开放问题

- **局限 1**：实验主要在 reasoning task 上，对 code task（HumanEval / MBPP / SWE-bench）的迁移没有直接测——而这正是博主关心的。
- **局限 2**：对 LoRA 的对比可能 sensitive to LoRA rank 与 target module 选择，论文没披露完整 sweep。
- **开放问题**：如果 pretrained 时用 AdamW，能否在 SFT 阶段构造一个 "AdamW-aligned LoRA"（如锁定 LoRA 更新方向在 AdamW 二阶矩主方向上）拿到两边的好处？这是一个 1 个月内可以验证的小论文方向。

#### 💡 对我们的启发

1. **直接可用的技术点**：博主做 ArkTS / Cangjie 这类新语言 continued pretraining + transfer learning 时，**SFT 阶段默认应该和 base model（DeepSeek-Coder / Qwen-Coder）pretraining 同款 optimizer**，而不是直接套 LoRA。这能直接降低 catastrophic forgetting 风险。
2. **具体实验想法**：拿 DeepSeek-Coder-7B（AdamW pretrained）做一个 controlled comparison：在 ArkTS 小数据集上分别 SFT (a) LoRA + AdamW、(b) full FT + AdamW、(c) full FT + Lion。指标除了 ArkTS 任务，还要测 HumanEval / MBPP 的退化。预期看到 (b) 在 ArkTS 上比 (a) 高 3–5pp，且 HumanEval 退化最小。1 周可以跑完（7B 全 FT 在 8xA100 上可行）。这是博主"小模型代码能力"主线的直接补丁。
3. **研究趋势判断**：fine-tune 社区 2024–2025 的"LoRA 万能论"在 2026 会被更细粒度的"optimizer-aware fine-tune"取代。博主如果做新语言工具链，对这个 trend 提前下注会显著降低"模型变笨"的风险。

---

## 方法对比

今天前三篇都在做"系统性失败归因"，方法学上极具可比性。

| 维度 | Cited but Not Verified | LLM Leaderboard Portfolios | Patch2Vuln |
|------|---------------------|--------------------------|-----------|
| 评估对象 | Deep Research Agent 的 citation | LLM Arena 排名 | Agentic 二进制漏洞重建 |
| 拆解粒度 | 3 维（link / relevance / fact） | 多维 partition（语言/任务/时间） | 4 stage（differ / ranker / model / validation） |
| 是否做失败归因 | ✓（fact-check 随 tool call 数下降） | ✓（投票互相抵消、subpopulation 异质性） | ✓（30% fail 在 model 之前） |
| 用什么 ground truth | 人工 + judge calibration | 真实 pairwise 投票 | 人工裁决 + private patch oracle |
| 是否给出可执行 framework | ✓（reproducible AST parser + 3-D evaluator） | ✓（(λ, ν)-portfolio + set cover） | ✓（local resumable pipeline） |
| 主要局限 | 英文 + Markdown 报告限定 | pairwise preference 形式限定 | 样本 n=25，单 distribution |
| 对 SE 迁移性 | ★★★（agent trace 引用 fidelity） | ★★★（agent design 边际价值 portfolio） | ★★★（repair stage-wise failure） |

三篇放在一起读，方法论核心就两条：**(1) 在拆解维度上不要只看 end-to-end 平均分；(2) 在样本维度上承认 subpopulation 异质性**。任何一个想做 evaluation rigor 的 SE 论文都应该至少照镜子检查这两条是否做到。

---

如果今天只读一篇，推荐 **Cited but Not Verified**——它的"3 维 citation evaluation + 反向 fact-check"框架几乎可以直接搬到 coding agent trace 分析上，做出博主主线下一篇论文的方法学骨架。如果时间充裕，**Patch2Vuln 的 oracle diagnostic 章节**也强烈推荐细读，那是教科书级别的"agent 失败归因"写法。
