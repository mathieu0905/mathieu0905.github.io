---
title: "arXiv 每日速递 2026-05-10"
date: "2026-05-10"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-10

## 今日总结

今天的 arXiv 一波"踩刹车"型论文集中出现：4 篇分别从**评估方法论**（Arena 排行榜其实是噪声混合）、**Agent 真实价值**（deep research 越搜越离谱、引用事实正确率最低 39%）、**漏洞重建 Agent**（25 个二进制 patch 只有一半被定位）、**SFT 优化器一致性**（同源 optimizer 才能少遗忘）四个角度，共同提醒一个不太悦耳的事实：**LLM 系统的"看起来 work"和"真的 work"之间，差着一整套 instrumental validity 链条**。这天应该深读——尤其对于做 marginal-value 实证的研究者。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Patch2Vuln](https://arxiv.org/abs/2605.06601) | agentic vulnerability reconstruction / repair | 25 个 Ubuntu deb pair，agent 只在 10/20 个安全 patch 上定位到正确函数；6 例败在二进制 differ 阶段 | ⭐⭐⭐ |
| [Why Global LLM Leaderboards Are Misleading](https://arxiv.org/abs/2605.06656) | LLM evaluation methodology | 89K Arena 投票里 2/3 互相抵消；Top-50 之间 pairwise 胜率 ≤ 0.53；提出 (λ,ν)-portfolio 替代单一榜单 | ⭐⭐⭐ |
| [Cited but Not Verified](https://arxiv.org/abs/2605.06635) | deep research agent eval | tool calls 从 2 → 150，事实正确率反而**下降 ~42pp**；强模型链接有效率 94%+，但事实正确率仅 39–77% | ⭐⭐⭐ |
| [Optimizer-Model Consistency](https://arxiv.org/abs/2605.06654) | SFT / fine-tuning methodology | 同源 optimizer 做全参 SFT 比 LoRA 更少遗忘；Muon 预训 + Muon SFT 在推理任务上反而更差 | ⭐⭐ |

## 今日主题：**"看起来 work" 和 "真的 work" 之间的诚实距离**

如果把今天这 4 篇论文摆在一起，你会发现它们其实在合谋写一篇大文章——**LLM 系统的评估正在迎来"全面祛魅"的一年**。

第一层祛魅来自宏观榜单：Arena 是公认最权威的 LLM 排行榜，但 [#6] 用 89K 投票直接拆穿——前 50 名之间 pairwise 胜率几乎全在 0.5 附近，"全球最强模型"这个概念在统计上根本不存在。第二层是 agent 评估：[#20] 把 deep research agent 报告里的引用一条条 AST 解析、回访、事实核对，发现**模型越努力（tool call 越多），事实正确率反而越低**——一个非常反直觉但很可能是真的现象。第三层是把"agent 真能做事吗"放在最务实的场景里：[#37] 让 agent 看二进制 patch 重建漏洞，结果一半左右案例败在 agent 推理之前的工具链阶段。第四层是基础训练动作：[#7] 提醒大家 SFT 时如果优化器和预训不一致，遗忘会更严重——LoRA 也没逃过。

这四篇论文一起指向同一个我们这个领域今年最重要的方法论转向：**不要再问"X 比 Y 好多少"，要问"在哪个子人群、哪个场景、扣除哪些工具链 artifact 之后，X 真的比 Y 好"**。这恰好是用户研究画像里的"边际价值量化"哲学——今天这 4 篇可以看作四个独立的实证案例库，正好补充我们已有的 agent trace 分析。

---

### Patch2Vuln: Agentic Reconstruction of Vulnerabilities from Linux Distribution Binary Patches

> **推荐理由**：这是今天最对你胃口的一篇。Agent + program repair 反向问题（patch → vulnerability），而且作者很诚实地把"agent 还没推理就已经失败"的样本单独算了——这种 oracle diagnostics 思路和你做边际价值分析时把"prerequisite failure"剔除的做法完全一致。

📌 **论文信息**：Isaac David, Arthur Gervais | [arXiv:2605.06601](https://arxiv.org/abs/2605.06601) | cs.CR, cs.AI

#### TL;DR
给 agent 看 Ubuntu 安全更新前后的 .deb 二进制 pair，让它逆推漏洞根因。在 25 个 pair（20 安全 + 5 negative control）上，agent 只在 10/20 个真安全 pair 中定位到正确函数，11/20 给出可接受的根因类别——但作者特别指出，其中 6 例失败发生在 agent 推理之前（二进制 differ / ranker 阶段），这把"模型本身能力"和"工具链能力"分得很清楚。

#### 问题是什么？
现实情况下，安全更新发布后，攻击者和防御者其实只能拿到**编译过的二进制包**，源码 patch 和 advisory 文本经常不可得（尤其是嵌入式 / 商业发行版）。把这种"binary-only"场景下的漏洞重建做成可复现 pipeline 是一件实操价值很高的事——但难点在于：

- 二进制 diff 噪声极大，编译器优化、内联、符号丢失都让 patch 看上去像 100 个函数都改了
- 根因往往不在最显眼的改动里，而在某个看似无关的边界条件
- agent 还要做"行为验证"（actually crash on old version, not on new），这一步对自动化框架要求很高

之前的工作要么纯静态二进制 diff（召回率低），要么端到端让 GPT-4 看汇编（成本高且不可复现）。本文走的是中间路线：**把工具链固定（Ghidra + Ghidriff），让本地小模型在固定的证据空间里做 audit**。

#### 他们怎么做的？
**核心 Insight**：把"agent 解 vuln"显式拆成 **extract → diff → rank → dossier → audit → validate** 六阶段 pipeline，每阶段都可单独审查、可恢复，agent 的角色被严格限制在 audit 和 validation plan 上。

具体方法流程：
1. **ELF pair 提取**：从 .deb 包里抽出 old/new ELF 二进制（解决多版本、多架构问题）
2. **结构化 diff**：用 Ghidra + Ghidriff 做函数级 diff，输出"哪些函数变了、变了多少"
3. **ranker**：基于改动密度、symbol 信息排序，输出 top-k 可疑函数
4. **dossier 构建**：对每个候选函数构造一个证据包（反编译代码 + diff + 上下文）
5. **agent audit**：本地模型读 dossier，写 preliminary audit + bounded validation plan + final audit
6. **行为验证**：runtime 跑 validation plan，看能否在 old 上触发异常、new 上不触发

**跟之前方法的本质区别**：不是"换个更大的模型"，而是把推理预算花在结构化证据上，**让 agent 在一个"已经被工具链筛过"的小空间里做决策**。这和你做 fault localization "静态分析做定位、LLM 只负责修复"的职责切分哲学几乎是镜像。

#### 关键结果

| 指标 | 数值 | 解读 |
|------|------|------|
| Localized correct security function | 10/20 | 只有一半安全 pair 真定位到了正确函数 |
| Accepted root-cause class | 11/20 | 类别正确率比函数定位略好（agent 善猜类别） |
| Pre-reasoning failures (差/排序漏函数) | 6/20 | **30% 的失败发生在 agent 推理之前** |
| Behavioral old/new differential | 2 (both tcpdump) | 真正复现到行为差异的极少 |
| Negative control 误报 | 0/5 | 5 个非安全 patch 全部正确归为 unknown |

**结果解读**：
- 真正震撼的不是 50% 的命中率，而是那 6 例 "agent 还没开始推理就死了"。如果把 binary differ 升级（更好的去优化、跨架构归一化），整个 pipeline 上限至少能再涨 20–30pp——这就是典型的 marginal value 分析视角。
- 行为验证只有 2 例成功，说明**"找到嫌疑函数"和"在 sandbox 里复现"之间还隔着一座山**——这是当前 agentic 漏洞研究最弱的一环，但也是最有价值的研究方向。
- 5 个 negative control 全部归为 unknown，说明 agent 至少没在乱讲——但也意味着它的 calibration 偏保守。

#### 局限性与开放问题

- **样本量太小**：25 个 pair 是论文级实验，不是工业落地证据。Ubuntu 一年发几千个 CVE patch，需要把 pipeline 跑到 1000+ 才能下结论
- **二进制 differ 是上限瓶颈**：作者自己也承认，6/20 失败发生在 ranker 之前；如果你 fork 这个工作，下一步该攻 differ，而不是换更大的 agent
- **行为验证缺失**：没有任何案例触发 sanitizer / memory corruption proof，这意味着它本质上还是"静态推断"工具，而非可信验证工具
- **开放问题**：agent 给出的 audit 是否对 human reviewer 真正有信息增益？还是只是把人类已经能猜到的信息复述一遍？（这其实是 agent marginal value 的核心问题）

#### 💡 对我们的启发

这篇是今天对你最直接可用的一篇：

1. **直接借鉴的设计点**：Patch2Vuln 的"oracle diagnostics"做法（把失败按阶段归因）——你现在做 agent trace 分析时，可以引入一个完全对应的 "stage-attributed failure" 框架。比如分析 SWE-bench 的 OpenHands trace 时，把失败拆成 "search/plan/edit/test" 四阶段，看每阶段对最终成败的边际影响。这是一个能让你下一篇 paper 立刻有 figure 的 idea。
2. **可以在 1-2 周内做的小实验**：拿 Ubuntu Security Notice 数据库随机抽 100 个 .deb pair，跑一次 Patch2Vuln 的 differ + ranker（不接 LLM，纯静态），统计 ranker top-5 命中率。这是一个零 LLM cost 的 baseline，如果命中率本身就低，整篇论文的上限就锁死了——这种 baseline-first 的实证思路完全契合你的研究哲学。
3. **趋势判断**：2026 年开始，"agent for security" 这个赛道会从"会写 PoC 吗"转向"能做证据驱动的根因分析吗"。前者炫技，后者才有产业价值——这一篇是这个转向的早期信号。

---

### Why Global LLM Leaderboards Are Misleading: Small Portfolios for Heterogeneous Supervised ML

> **推荐理由**：方法论批判。这是今天和你"benchmark 设计与方法论批判"主线最契合的一篇——Arena Bradley-Terry 排行榜其实是噪声，真实需要的是按子人群分组的 portfolio。这个思路完全可以挪到 SWE-bench / coding benchmark 上。

📌 **论文信息**：Jai Moondra, Ayela Chughtai, Bhargavi Lanka, Swati Gupta | [arXiv:2605.06656](https://arxiv.org/abs/2605.06656) | cs.LG, cs.DM, math.OC

#### TL;DR
分析 Arena 上 116 种语言、52 个 LLM 的 89K 对比投票，发现**全局 Bradley-Terry ranking 几乎不靠谱**：2/3 的"决定性投票"互相抵消，Top-50 模型之间 pairwise 胜率全 ≤ 0.53。但只要按语言分组，方差就能放大两个数量级。作者把这个观察形式化为 (λ, ν)-portfolio：用 set cover 的 VC dimension 做保证，结果发现 **5 个不同 BT ranking 就能覆盖 96% 的投票**——而单一全局排行只覆盖 21%。

#### 问题是什么？
LLM 排行榜（Chatbot Arena、LMSYS、HuggingFace 等）现在是工业界选模型、学术界选 baseline 的事实标准。但所有这些榜单都假设**用户偏好可以被一个全局序列化排序近似**。这个假设要是错了，整个"我们的模型在 Arena 上比 GPT-4 高 5 分"的论证就站不住脚。

之前批判 Arena 的工作大多停留在"数据有偏"层面，没有把"为什么全局排序本身就是错的"形式化出来。本文想问：**当用户偏好结构性异质（语言、任务、时间）时，单一 ranking 的信息丢失到底有多严重？能不能用一组小排行榜（portfolio）替代？**

#### 他们怎么做的？
**核心 Insight**：把"找最好的模型"重新表述为 **set cover 问题**——不再追求"对所有用户最优"，而是用 k 个模型组成一个 portfolio，使每个用户至少被其中一个覆盖。

具体方法流程：
1. 在 Arena 89K 投票上做"投票抵消分析"：决定性投票里有多少在另一对比中被反向消掉？答案是 2/3
2. 按 116 种语言分组重做 BT ranking：发现 ELO 方差比全局大两个数量级——**语言是最强的隐变量**
3. 形式化 (λ, ν)-portfolio：找一个最小模型集合 P，使得至少 ν 比例的用户能在 P 中找到一个错误率 ≤ λ 的模型
4. 用 set cover 的 VC dimension bound 给出泛化保证
5. 实证：5 个 BT ranking 覆盖 96% 投票（vs 全局 21%）；6 个模型的 portfolio 覆盖率是全局 Top-6 的 2 倍

**跟之前方法的本质区别**：不是"加数据加 judge 让排行榜更准"，而是**承认全局序就是错的，主动给出多元化的小排行榜组合**。这是从"unitary truth"到"plural truth"的认识论转变。

#### 关键结果

| 指标 | 全局 BT | (λ,ν)-portfolio | 提升 |
|------|---------|----------------|------|
| 投票覆盖率 (5 ranking) | 21% | 96% | +75pp |
| 6-模型集合覆盖率 | 1× | 2× | 翻倍 |
| Top-50 pairwise 胜率上界 | 0.53 | (按语言)显著 > 0.6 | 排序变得有意义 |
| 决定性投票互相抵消比例 | ~2/3 | 按语言分组后大幅下降 | — |

**结果解读**：
- "5 个 ranking 就能覆盖 96%" 这个数字是震撼性的——它说明 Arena 实质上是一个 5-modal 的偏好分布，强行压成一维肯定会掉信息
- 语言是最强的隐变量，但作者也提到任务和时间也有结构性影响——这暗示 portfolio 维度可能不止 5
- 一个反直觉点：portfolio 不是越大越好，而是要在 λ（错误率）和 ν（覆盖率）之间做 Pareto trade-off

#### 局限性与开放问题

- **portfolio 怎么部署**：现实里用户来一个 query，你怎么决定路由到哪个 ranking？论文形式化得很漂亮，但路由策略基本没讨论
- **VC dimension bound 太松**：实践中可能 5 个 ranking 已经够了，但 bound 给的覆盖率保证比观测值差很多
- **没和 Mixture-of-Judge 类工作比**：现在已经有一批工作用多个 judge 模型聚合，那条路线和 portfolio 路线本质区别是什么？没说清

#### 💡 对我们的启发

这篇对你做 benchmark 方法论是**一类新的工具**：

1. **直接可用的技术点**：把 (λ, ν)-portfolio 框架挪到 SWE-bench / RepoRescue 上。SWE-bench 现在用单一 resolved rate 排序，但其实**仓库 / 语言 / 任务难度等级**都可能是结构性异质来源。可以做一个实验：把 SWE-bench 的 trace 按仓库分组，重做 ranking，看看是否会产生类似 Arena 的 "全局排序 vs portfolio 大差异"现象。如果是，这本身就是一篇 SE eval methodology paper 的种子。
2. **具体实验想法**：拿你已经收集的 SWE-bench / RepoRescue agent trace（不需要重跑），分别按"项目、依赖类型、bug 类别"分组，统计每组上 Top-1 模型是否一致。如果一致性低于 50%，那"X 在 SWE-bench 上比 Y 高 X%" 这种说法就站不住。这是一个 1 周内能跑完的论文 idea。
3. **趋势判断**：2026 年的 LLM benchmark 论文会从"做更大更难的 benchmark"转向"做更细粒度的子人群分析"。Arena 的故事会在 SE 领域重演——你做这件事是有先发优势的。

---

### Cited but Not Verified: Parsing and Evaluating Source Attribution in LLM Deep Research Agents

> **推荐理由**：Agent 边际价值的反直觉实证。"tool call 越多事实正确率越低"完全契合你"边际价值反直觉"的研究哲学（test execution 只贡献 1.25pp 那种）。这是另一个独立的负边际样本。

📌 **论文信息**：Hailey Onweller, Elias Lumer, Austin Huber, Pia Ramchandani, Vamse Kumar Subbiah | [arXiv:2605.06635](https://arxiv.org/abs/2605.06635) | cs.CL

#### TL;DR
做一个**用 AST 解析 LLM deep research 报告里所有 inline citation** 的可复现框架，沿三个维度评估：链接是否真存在、内容是否相关、事实是否被来源支持。在 14 个 LLM 上跑出来的结论非常刺眼：链接有效率 94%+，相关性 80%+，但**事实正确率只有 39–77%**；而且 tool call 从 2 涨到 150 时，事实正确率**反降约 42pp**。

#### 问题是什么？
"Deep research agent"（如 OpenAI Deep Research、Perplexity Pro、Grok DeepSearch）现在能从几十到几百个网页里合成一份带引用的报告。表面看起来很专业，但用户根本没法验证这些引用——即使引用链接真的能打开。

之前评估这类系统的工作要么相信模型自报家门（self-cite），要么用 RAG faithfulness 评估（只看"有没有引用"，不看"引用的内容是否支持声明"）。**核心问题是没人闭环：把引用解析出来 → 真正回访那个 URL → 用源内容验证那个声明**。

#### 他们怎么做的？
**核心 Insight**：用一个**AST parser** 去解析 markdown 报告里的 inline citation，让评估变得可复现、可大规模化；再把"评估"显式拆成 link / relevance / fact 三个独立维度。

具体方法流程：
1. **AST 解析**：把每篇 LLM 报告解析为引用-claim pair 列表
2. **Link Works**：检查 URL 是否能访问（4xx/5xx 算失败）
3. **Relevant Content**：用 LLM-as-judge + 人类校准，判断引用页面与 claim 是否话题相关
4. **Fact Check**：把页面内容拉下来，rubric-based 判断是否真支持 claim
5. **Tool-call 消融**：固定模型，改变工具调用预算（2、10、50、150），看三个指标怎么变

**跟之前方法的本质区别**：之前的工作要么不闭环，要么只在合成数据上跑——本文是**真的在 14 个生产模型生成的报告上做了 fact-check 闭环**，而且数据规模够大可以做 ablation。

#### 关键结果

| 模型类别 | Link Works | Relevant | Fact Check |
|----------|-----------|----------|-----------|
| Frontier closed | 94%+ | 80%+ | 39–77% |
| Open-source | 多数无法在 1-shot 生成可解析报告 | — | — |
| Tool calls 2 → 150 | 略升 | 持平 | **−42pp** |

**结果解读**：
- "事实正确率最低 39%" 这件事——意味着差不多有六成引用，要么链接对应内容不支持 claim，要么直接是模型幻觉的。这对所有把 deep research agent 当生产力工具的人都是当头一棒
- "tool call 越多事实正确率反降"是本文最反直觉的发现：作者解释是模型在长 context 下更容易记错来源、混淆引用——这是个标准的 long-context faithfulness 失败模式
- 开源模型多数连 1-shot 生成可解析的引用报告都做不到——这是 open-source 阵营的硬伤

#### 局限性与开放问题

- **LLM-as-judge 校准争议**：fact check 用的是 rubric-based LLM judge，作者做了人类校准但没披露 inter-annotator 一致性 (Cohen κ / Gwet AC1)——这正是你做评估方法论时最关注的点
- **"事实正确"本身是连续谱**：一个 claim 可能"部分被支持"，rubric 二值化丢了信息
- **没有控制域**：deep research 任务覆盖太广，不同领域（金融 vs 医学 vs 历史）事实正确率应该差异巨大，但论文没切

#### 💡 对我们的启发

1. **直接可用的技术点**：把这套 AST citation parser 套到 **agentic SE benchmark** 上。比如 SWE-bench 上很多 agent 会引用 docstring / 之前的 commit / 测试错误信息——这些"代码内引用"都可以用类似框架做 fact-check。**"agent 的引用是真的吗"是 SE 领域几乎没人问的问题**。
2. **具体实验想法**：拿你已有的 OpenHands / Aider 公开 trace，把 agent 自己引用的 file path / function name / line number 提出来，对照 ground truth repo 验证有多少是幻觉。预期：和 deep research 类似，会有相当比例的"假引用"。这是一个**直接挪用本文方法到 SE 域**的快速胜利论文。
3. **趋势判断**：tool-call 边际效用拐点是 2026 年最有价值的研究方向之一。本文给出了一个 NLP 域的负边际证据，你在 SE 域做的 test-execution-only-1.25pp 是另一个。把这两个观察串起来，可能是一个 position paper 的种子。

---

### Optimizer-Model Consistency: Full Finetuning with the Same Optimizer as Pretraining Forgets Less

> **推荐理由**：你做小模型代码能力 / continued pretraining / LoRA 时，optimizer 选择经常是"默认 AdamW"。这篇给出了一个非常具体的观察：**用预训时的同款 optimizer 做 SFT 比 LoRA 更少遗忘**——直接挑战了 LoRA 的常见辩护"参数少所以遗忘少"。

📌 **论文信息**：Yuxing Liu, Jianyu Wang, Tong Zhang | [arXiv:2605.06654](https://arxiv.org/abs/2605.06654) | cs.LG, math.OC

#### TL;DR
观察到一个稳定现象：**SFT 用与预训相同的 optimizer 做 full finetuning，比换 optimizer 或者 LoRA 都更少遗忘**，且新任务性能不输。作者把这个现象命名为 optimizer-model consistency，并给了部分理论解释（optimizer 在 activation 上的 regularization 效应塑造了 loss landscape）。一个反直觉发现：Muon 全程使用时反而比 AdamW 在推理 SFT 上更差，因为 Muon 倾向"死记硬背"。

#### 问题是什么？
小模型 SFT 的常见知识：LoRA 比 full finetune 遗忘少（参数少 → 改动小）。但实践中很多人发现"LoRA 在某些任务上确实学不到新模式"。能不能既保留 full finetune 的表达力，又不遗忘？

之前的工作要么改 loss（regularization、KL 约束），要么改架构（adapter、prefix）。本文走第三条路：**改 optimizer**——把 SFT 阶段的 optimizer 跟预训时对齐。

#### 他们怎么做的？
**核心 Insight**：optimizer 不是"找最优解"的中性工具，它**在 activation 上施加了隐式 regularization**，从而塑造了模型在预训点附近的 loss landscape。如果 SFT 换了 optimizer，相当于换到一个不熟悉的 landscape，weight update 会无意中破坏预训时学到的结构。

具体方法流程：
1. 对照实验：固定模型和数据，分别用 AdamW、Muon、Lion、SGD 等 optimizer 做 SFT，测新任务性能 vs 旧任务遗忘
2. 理论分析：推导 optimizer 在 activation 上的 regularization 效应，给出 weight update 应该满足的结构约束
3. **特别比较 Muon vs AdamW**：发现 Muon 全程使用时在推理 SFT 上表现更差
4. 合成实验：在小数据 SFT 上证明 Muon 倾向 rote memorization，伤害了模式学习

#### 关键结果

| 设置 | 新任务性能 | 旧任务遗忘 | 解读 |
|------|-----------|-----------|------|
| 同 optimizer + Full SFT | 强 | 低 | 推荐配置 |
| 异 optimizer + Full SFT | 强 | 高 | 默认实践 |
| LoRA | 中等 | 中等 | 不如同源 full SFT |
| Muon 预训 + Muon SFT (推理) | **更差** | — | Muon 偏 memorization |
| Muon 预训 + AdamW SFT (推理) | 较好 | — | 反例 |

**结果解读**：
- "LoRA 不一定遗忘最少"是对默认实践的颠覆——之前社区接受的"参数少 → 遗忘少"在保持 optimizer 一致的前提下不成立
- Muon 那个反例特别有意思：Muon 在预训上很猛，但 SFT 时反而"过于专注于记住"，导致泛化变差——这给了 Muon 倡导者一个意外约束
- 现象在多个模型规模上都稳定，说明不是 small-model artifact

#### 局限性与开放问题

- **"forgets less" 的度量方式**：用通用 benchmark 测旧任务，但小模型在通用 benchmark 上波动本来就大，可能掩盖了真实差异
- **同 optimizer 在不同 SFT 阶段稳定吗**：reasoning SFT、coding SFT、long-context SFT 表现一致吗？只测了几个域
- **理论部分较粗**：activation regularization 的推导给出方向但没给出可量化预测——本质上还是经验观察 + 后验解释

#### 💡 对我们的启发

1. **直接可用的技术点**：你做 Cangjie 等低资源语言 continued pretraining 时，optimizer 选择是个"默认就用 AdamW"的盲点。本文意味着——**如果你 continued pretrain 用的是 AdamW，下游 SFT 也务必用 AdamW**，不要因为某些新论文吹 Muon / Sophia 就换。这是一个零成本的实践改动。
2. **具体实验想法**：在你的 OpenHarmony fine-tuning pipeline 上做一个对照——固定数据，分别用 (AdamW, AdamW)、(AdamW, Muon)、(LoRA) 三组 SFT 同一个代码模型，在 ArkTS bug fix 和通用 HumanEval 上各测一次。如果观察到本文同样模式，可以作为你 paper 的一个 ablation 单图。
3. **趋势判断**：2026 年小模型 SFT 的 marginal value 研究会比 RL 更工程实用——optimizer 选择、LR schedule、warmup 这些"老生常谈"的事其实没人系统量化过，每一个都可能是一篇 SE × ML methodology 论文的种子。

---

## 方法对比

把今天 4 篇论文放在同一张表里看，会发现它们其实是**"诚实地评估 LLM 系统"的四种切面**：

| 维度 | Patch2Vuln | Why Leaderboards Misleading | Cited but Not Verified | Optimizer Consistency |
|------|-----------|----------------------------|----------------------|---------------------|
| 评估对象 | agent (vuln 重建) | LLM 全局排行榜 | deep research agent | 训练阶段 (SFT) |
| 核心反直觉发现 | 30% 失败发生在推理之前 | Top-50 pairwise 胜率 ≤ 0.53 | tool call 越多事实越差 | LoRA 不一定遗忘最少 |
| 方法学贡献 | stage-attributed failure | (λ,ν)-portfolio set cover | 闭环 fact-check 框架 | optimizer regularization 视角 |
| 数据规模 | 25 pair（小） | 89K 投票（大） | 14 model 报告（中） | 多个模型 + 合成（中） |
| 主要局限 | 样本太少、行为验证缺失 | portfolio 路由没解决 | LLM-judge 一致性未披露 | "forgets less" 度量粗糙 |
| 给你的最大启发 | 静态分析 + agent 职责切分 | benchmark 子人群分析 | agent 引用 fact-check | 同源 optimizer 是免费午餐 |

**整体启示**：今天这 4 篇凑一起最大的信号是——**"LLM 系统看起来 work" 的方差，远大于"真的 work" 的方差**。我们这群做 SE 边际价值的，本质上就是在 SE 域内做这种祛魅工作；今天看到 NLP / 安全 / 训练 三个域同时在做类似事情，说明这条研究主线在 2026 年不会孤独。
