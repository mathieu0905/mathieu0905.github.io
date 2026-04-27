---
title: "arXiv 每日速递 2026-04-28"
date: "2026-04-28"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-04-28

## 今日总结

今天的 cs.SE 区域很"诚实"：四篇论文从四个不同角度同时拷问 AI4SE 的评估方法论——agent 烧钱到底烧在哪、benchmark 是不是真的"真"、形式验证能不能给开源小模型兜底、verifier warning 到底有没有用作 ML 特征。如果你跟我一样在做 agent trace 分析或 benchmark 批判，今天值得仔细读。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [How Do AI Agents Spend Your Money?](http://arxiv.org/abs/2604.22750v1) | agent 评估方法论 | 在 SWE-bench Verified 上系统分析 8 个前沿 LLM 的 token 消耗模式，揭示 stochasticity、accuracy-cost 非单调、自我预测失败 | ⭐⭐⭐ |
| [RealBench](http://arxiv.org/abs/2604.22659v1) | benchmark 设计 | 提出 repo-level + UML 系统设计的工业风格 benchmark，揭示策略选择跟仓库规模强相关 | ⭐⭐⭐ |
| [NL2VC: Dafny-Based Formal Verification](http://arxiv.org/abs/2604.22601v1) | program repair / verified code | 7 个开源权重 LLM + Dafny 形式验证 + uDebug 反 vacuous，signature + self-healing 把 0% 拉到 90% | ⭐⭐⭐ |
| [Verifier Warnings Do Not Improve Comprehensibility Prediction](http://arxiv.org/abs/2604.22653v1) | ML4SE 方法论批判 | 把 verifier warning sum 加进 ML 模型预测代码可理解性——结果毫无提升。诚实的负结果 | ⭐⭐ |

## 今日主题：AI4SE 的"诚实"日

如果你只读过这四篇的 abstract，你可能以为它们没什么共同点：一篇做 token 经济学、一篇做 benchmark、一篇做 verified code、一篇做 verifier warning。但把它们放在一起读，你会发现今天 arXiv 的 cs.SE 区有一个非常一致的暗流——**对当前 AI4SE 评估实践的不信任**，以及随之而来的多种修补尝试。

第一篇问"我们花的 token 钱到底买到了什么"——发现高 token 消耗不等于高 accuracy，accuracy 在中等成本就饱和，模型甚至无法预测自己要花多少 token；第二篇问"我们的 benchmark 是不是真的反映工业开发"——给 LLM 真实 UML 设计图后，性能差距巨大且生成策略要看仓库大小；第三篇问"开源小模型能不能用 verifier 兜底来生成正确代码"——signature + self-healing 把 GPT-OSS 120B 从 0% 拉到 81.82%；第四篇问"verifier warning 到底是不是 ML 模型预测代码可理解性的好特征"——做了认真的对照实验，结论是没什么用。

这四篇把 AI4SE 评估流水线的四个关键环节都钉在了显微镜下：**输入诚实性**（benchmark 真不真）、**过程诚实性**（agent 在干嘛、花了多少）、**输出诚实性**（verifier 给保证）、**统计诚实性**（特征到底有没有信息量）。这正是博主"边际价值量化"哲学最该关注的母题——**当 LLM 已经 work，到底是哪一部分在 work，是哪一部分在烧钱却没贡献**。

---

### How Do AI Agents Spend Your Money? Analyzing and Predicting Token Consumption in Agentic Coding Tasks

> **推荐理由**：这篇就是博主"agent 工作流单个设计动作边际价值量化"主线的同温层论文——大规模 SWE-bench Verified trace 分析，结论几乎全是反直觉的，是事后分析路线非常硬核的一个范本。

📌 **论文信息**：Longju Bai, Zhemin Huang, Xingyao Wang 等（密歇根 + Cognition Labs + Google） | [arXiv:2604.22750](http://arxiv.org/abs/2604.22750v1) | cs.CL / cs.SE / cs.HC

#### TL;DR
对 8 个前沿 LLM（GPT-5、Claude-Sonnet-4.5、Kimi-K2 等）在 SWE-bench Verified 上的 trajectory 做了系统的 token 消耗分析，发现 agentic coding 比 code chat 贵 1000×、运行间方差最高 30×、cost-accuracy 非单调、模型无法预测自己的 token 消耗。

#### 问题是什么？
所有人都在用 agent 写代码，但没人真知道这些 agent 是怎么花掉那一百万 token 的。具体来说有三个根本性盲区：

第一，agent task 跟普通 code chat 是同一个量级吗？直觉上"差不多"，实际上差 1000×——SWE-bench 上一个 trajectory 平均消耗百万级 token；第二，token 多 = 好结果吗？直觉上"应该是"，实际上 accuracy 在中等成本时就饱和甚至下降；第三，模型自己能预测要花多少 token 吗？这个问题之前几乎没人系统问过，因为大家觉得"差不多"——结果差得离谱。

这背后的关键障碍是：**单次跑实验太贵**，没人有钱在 SWE-bench 上把 8 个 frontier model 跑足够多的种子来量化方差。这篇是少数把这一步做扎实了的工作。

#### 他们怎么做的？

**核心 Insight**：把 agent token 消耗当作一个**有方差的随机过程**来研究，而不是一个常数——并且把 input token 与 output token 分离统计，发现 input token 才是大头。

具体方法流程：
1. 收集 8 个 frontier LLM 在 SWE-bench Verified 上的完整 trajectory（包括同任务多次运行以测方差）
2. 拆分 input vs output token、code reasoning vs code chat vs agentic coding 三种使用模式
3. 让模型自我预测 token 消耗（在执行前），对比真实消耗，计算 correlation 与 systematic bias
4. 用人类专家标注的 difficulty 跟实际 token cost 做相关性分析

**跟之前方法的本质区别**：以前 agent cost 研究要么是 case study，要么只看平均；这篇第一次同时给出了**方差结构**（同一个 task 跑两次能差 30×）、**accuracy-cost 曲线**（不是单调上升而是中段饱和）和**模型自我预测的失败**（最高 0.39 弱相关，且系统性低估）。

#### 关键结果

| 维度 | 发现 | 数值 |
|------|------|------|
| Agent vs code chat | token 消耗差 | 1000× |
| 同任务运行间方差 | 最大差距 | 30× |
| 同任务上 token 多消耗（Kimi-K2 / Claude-Sonnet-4.5 vs GPT-5） | 平均多消耗 | 1.5M+ tokens |
| 模型自我预测 token 消耗 | 相关性 | ≤ 0.39（系统性低估） |
| Human-rated difficulty vs 实际 token cost | 对齐度 | 弱相关 |

**结果解读**：最毒辣的发现是 accuracy 在 intermediate cost 就达到峰值，再加 token 反而饱和甚至下降——这跟工业界普遍信奉的"thinking tokens 越多越好"完全相反。再加上同任务 30× 方差，意味着大部分"我们的 agent 在 SWE-bench 提升 2pp"的论文如果不报方差，这个 2pp 很可能落在噪声里。这篇等于给整个 agent 评估社区扔了一颗"统计严谨性"炸弹。

#### 局限性与开放问题

- **局限 1**：只在 SWE-bench Verified 上做，没在更难的 SWE-bench Lite full 或 Multi-SWE-bench 上验证——而 verified 集已经被各家模型针对优化，分布偏简单。**30× 方差是不是在更难的子集上更夸张？没回答**
- **局限 2**：没区分 token 类型（agent reasoning vs tool call response vs file content read），而 input token 大头大概率是文件 context dump，这部分 cost 跟模型能力关系小。**结果说"input token 是大头"但没拆 input token 内部组成**
- **开放问题**：模型为什么无法预测自己的 token？是 calibration 问题还是根本性的不可观测？这个问题如果解决，下游可以做 token-budget-aware agent

#### 💡 对我们的启发

1. **直接可用**：博主在做 agent trace 事后分析时（OpenHands / SWE-bench / Aider），**必须在分析里加上 token 方差报告**——同任务多种子下的 token 分布。这篇给了一个明确的统计基线："如果你的方法宣称提升 X pp，先证明 X > intra-task token 方差能解释的范围"
2. **具体实验想法**：在博主已有的 agent trace 数据上，1-2 周内可以做一个小复现——挑 3-5 个 SWE-bench task，对每个 task 跑同一个 agent 5 次，统计 token / accuracy / step count 的方差，做一个 mini-version 报告。这比直接发"我们改进了 X pp"更值得发，因为能直接挑战领域内既有论文的统计严谨性
3. **研究趋势判断**：agent evaluation 的下一波焦点会从"acc vs SOTA"转移到"统计严谨性 + 经济学指标"。早布局这块（McNemar / TOST / variance reporting）的人能很快积累 methodology paper

---

### RealBench: A Repo-Level Code Generation Benchmark Aligned with Real-World Software Development Practices

> **推荐理由**：博主在做 OpenHarmony 工具链和 program repair 时，最痛的就是"现有 benchmark 跟真实工业开发差太远"——这篇直接把 UML 设计图灌进 benchmark，给我们提供了一个评估"工业级风格"代码生成的新参考点。

📌 **论文信息**：Jia Li, Hongyi Deng, Yiran Zhang 等 | [arXiv:2604.22659](http://arxiv.org/abs/2604.22659v1) | cs.SE

#### TL;DR
RealBench 是一个 repo-level code generation benchmark，每个样例同时包含自然语言需求 + UML 系统设计图（跟工业开发流程一致），评估 LLM 在"基于结构化设计写代码"这种真实场景下的能力。

#### 问题是什么？
HumanEval、EvoCodeBench 这类 benchmark 都假定输入是"一句自然语言描述"，但任何一个工业团队都不是这么做事的——你拿到的是一份 PRD + 一份 UML 类图 + 一份 sequence diagram，然后才开始写代码。所以 LLM 在这类 benchmark 上拿了 80% pass@1，并不意味着在工业里能拿 80%——可能连 30% 都没有，因为它需要的能力完全不一样。

更关键的问题是：当输入从"一句话"变成"UML 图 + 文档"时，LLM 是不是该一次性生成整个 repo，还是 module-by-module？现在没人系统回答过这个问题，但它直接决定了 agent 工作流要怎么设计。

#### 他们怎么做的？

**核心 Insight**：把 UML diagram 作为 first-class input 灌进 benchmark，并且**在 benchmark 内部对比"整 repo 一次性生成" vs "module-by-module"两种生成策略**——后者是这篇真正有意思的部分。

具体方法流程：
1. 收集真实 repo，反向构造每个 repo 对应的 UML 类图 + sequence diagram
2. 配对自然语言 requirement，让 LLM 既看到 NL 又看到 UML
3. 在 benchmark 上系统对比 LLM 一次性生成整个 repo vs 按 module 分阶段生成
4. 拆解错误模式：是没找到模块？模块创建错？模块内 grammar/logic 错？

**跟之前方法的本质区别**：HumanEval / MBPP / SWE-bench 都是"给问题求答案"，RealBench 是"给设计求实现"——更接近工业；而且这篇是少数显式做 generation strategy ablation 的 repo-level benchmark。

#### 关键结果

| 发现 | 描述 |
|------|------|
| LLM 在 repo-level 上的整体表现 | 显著比 function-level 差，模型间 gap 巨大 |
| LLM 找到 / 创建 UML 中模块的能力 | 强 |
| 模块内代码质量 | 弱（grammar / logic error 居多） |
| 小 repo 的最优策略 | 一次性生成整个 repo |
| 大/复杂 repo 的最优策略 | module-by-module |

**结果解读**：第三和第四第五条放在一起读特别有意义——LLM 知道要建什么模块（结构理解 OK），但写不好模块内部（细节实现差），而且这个"细节实现差"会随着 repo 变大而被放大，所以大 repo 必须分模块给。这个洞察对 agent 设计有很直接的影响：**对大 repo，agent 应该先做 architecture decomposition，再 per-module generation**——而不是直接喂全部 context 求一次性生成。

#### 局限性与开放问题

- **局限 1**：UML 图的构造是"反向"的（从代码反推回 UML），可能跟"前向工程"的 UML 在质量和粒度上有差异。一个老练的架构师画的 UML 比从 codebase 反推的更抽象 / 更省略实现细节，LLM 在前向 UML 上能不能 work 这篇没回答
- **局限 2**：评估模型生成的代码主要看"能不能跑、grammar 错不错"，没深入到"是否符合 UML 中标的设计意图"——如 `<<interface>>` 标记是不是真的实现成 interface
- **开放问题**：UML 是不是 LLM 最容易消化的设计表示？如果换成 ER diagram、sequence diagram、state diagram，结果会完全不同吗？这个问题对 LLM × SE 的输入表示选择有大意义

#### 💡 对我们的启发

1. **直接可用**：博主在做 Android → HarmonyOS migration 时，可以**模仿 RealBench 的"NL + 结构化设计图"输入范式**——给迁移 agent 不只是 Android 源码，还要给 ArkUI / ArkTS 的对应组件设计图。直觉上这能显著降低迁移难度
2. **具体实验想法**：1-2 周内可做的小实验——拿一个中等大小（10-30 文件）的 OpenHarmony repo，用 RealBench 的方法构造 UML 图，对比 7B–14B 开源模型在"只给 NL"vs"NL + UML"两种输入下的 pass rate。预期看到：模型规模越小，UML 提升越大（因为小模型更需要结构化提示来弥补推理缺陷）
3. **研究趋势判断**：repo-level benchmark 的下一波会从"input 复杂度"转向"output 工程质量"——比如生成代码的可维护性、模块边界清晰度、是否符合架构约束。早布局"工程质量评估"的人有红利

---

### From Natural Language to Verified Code: Toward AI Assisted Problem-to-Code Generation with Dafny-Based Formal Verification

> **推荐理由**：这篇直击博主"职责切分哲学"——LLM 负责生成 + 改，verifier 负责把关。而且用的是开源权重模型，跟博主的 small/local LLM 主线完全合拍。

📌 **论文信息**：Md Erfan, Md Kamal Hossain Chowdhury 等 | [arXiv:2604.22601](http://arxiv.org/abs/2604.22601v1) | cs.SE / cs.AI

#### TL;DR
NL2VC-60 数据集 + 三档 prompting（contextless / signature / self-healing）+ Dafny verifier + uDebug 反 vacuous verification。Gemma 4-31B 拿到 90.91% verification success，GPT-OSS 120B 从 0% 涨到 81.82%。开源模型 + verifier 已经能做高保证代码合成。

#### 问题是什么？
LLM 写代码的"幻觉"问题已经被研究透了，但解决方案大致两条路：一条是 RLHF / preference tuning（贵且不彻底），一条是用 formal verifier 给 LLM 兜底。后者一直有个核心 bug——**vacuous verification**：LLM 学会了一种"作弊"，把 specification 写得超弱（比如只要求 `result >= 0`），verifier 当然过，但代码完全没解决问题。

第二个核心障碍是：之前用 Dafny 的工作要么是 GPT-4 这种闭源大模型（成本高），要么是 contextless prompting（命中率几乎为零）。开源权重 + 实用 prompting strategy 的工业可用方案一直是空白。

#### 他们怎么做的？

**核心 Insight**：用 **uDebug** 强制 functional validation 来反 vacuous——specification 不能只通过 verifier，还得能在测试用例上跑出对的输出；同时设计三档 prompting，让 self-healing loop 把 verifier 的 error message 当成 LLM 的反馈信号。

具体方法流程：
1. 构造 NL2VC-60 数据集（60 个复杂算法问题），手工标注 gold spec
2. 三档 prompting：
   - Contextless：只给问题描述（baseline，几乎全 0%）
   - Signature：给函数签名 + spec 模板作为结构化锚点
   - Self-healing：把 Dafny verifier 的 error message 反馈给 LLM 让它修
3. 集成 uDebug 平台跑测试用例，过滤 vacuous specification
4. 在 7 个开源权重模型上跑：Gemma 4 系列、GPT-OSS 系列、Llama 系列

**跟之前方法的本质区别**：之前 LLM + verifier 的工作几乎都靠模型规模硬扛，这篇展示了**通过 prompting + functional validation 让中等规模开源模型也能做 verified code generation**——signature 提供结构、self-healing 提供反馈、uDebug 提供 ground truth。

#### 关键结果

| 模型 | Contextless | Signature + Self-Healing | 提升 |
|------|------------|--------------------------|------|
| Gemma 4-31B | 低 | 90.91% | 大幅 |
| GPT-OSS 120B | 0% | 81.82% | +81.82pp |
| 其他开源模型 | 接近零 | 显著提升 | — |

**结果解读**：GPT-OSS 120B 从 0% 跳到 81.82% 这件事的含义是巨大的——它说明对很多代码生成任务，模型本来就具备能力，只是没有被合适的 prompting 结构激活。signature 给了它"结构脚手架"，self-healing 给了它"试错通道"。这跟博主"预处理 / 静态分析 / rule-based filtering 把问题压到小模型能解的规模"哲学完全一致。

#### 局限性与开放问题

- **局限 1**：NL2VC-60 只有 60 个问题，全是经典算法（很可能在训练集里），所以"90.91%"在 truly novel problem 上未必能维持。**out-of-distribution 上的退化没测**
- **局限 2**：self-healing 的迭代次数没控制——一个 task 跑 20 轮 verifier feedback 才过，跟跑 1 轮就过，是同一回事吗？成本完全不同。**没报告 token 成本**
- **开放问题**：Dafny 是个非常学院派的 verifier，工业界谁都不用。能不能把这个 pipeline 移植到 Z3 / SMT-LIB / 甚至 type-checker 这类工业可用的 verifier？没人证明过

#### 💡 对我们的启发

1. **直接可用**：博主在做 program repair / compatibility migration 时，可以把 self-healing 改造成**编译器/静态分析器 feedback loop**——用 ArkTS 的 HomeCheck 或 Python 的 mypy/ruff 当 verifier，让 7B–14B 开源模型迭代修。本质上跟这篇一回事，只是把 Dafny 换成更工业的工具
2. **具体实验想法**：1-2 周内可做——拿 100 个真实 Python compatibility bug（比如 `numpy` 1.x → 2.x），让 DeepSeek-Coder 7B 在三档 prompting 下修：(a) 只给 buggy code，(b) 给 buggy code + 函数 signature + import context，(c) self-healing：把 mypy/pytest 错误反馈回 LLM。预期 (a) 接近 0，(b) 显著提升，(c) 接近闭源大模型
3. **研究趋势判断**：verified code generation 在 2025-2026 会有一波小高潮，但学术界做的 verifier（Dafny、F\*、Coq）跟工业要的 verifier（compiler、type-checker、static analyzer）有 gap。把 self-healing 思想搬到工业 verifier 上可能是博主能做出 ship-able tool 的方向

---

### Verifier Warnings Do Not Improve Comprehensibility Prediction

> **推荐理由**：诚实的负结果论文。博主"不做学术 rubbish"的哲学的最佳示范——花同等精力做 control-treatment experiment，得出"我们假设的特征没用"，然后老老实实发出来。这种工作的价值常被低估。

📌 **论文信息**：Nadeeshan De Silva, Martin Kellogg, Oscar Chaparro | [arXiv:2604.22653](http://arxiv.org/abs/2604.22653v1) | cs.SE

#### TL;DR
之前一篇 meta-analysis 发现 verifier warning 数量跟 code comprehensibility 有小幅相关。这篇基于此猜想：把 verifier warning sum 当 ML 特征，能否提升代码可理解性预测？做了对照实验——结论：没用。

#### 问题是什么？
"代码可理解性"是 SE 一个老话题。之前的 ML 模型用语法特征（行数、嵌套深度、Halstead）和 developer 特征（经验、领域）。最近有 meta-analysis 说 formal verifier 给出的 warning sum 跟人类标注的 comprehensibility 有相关性——这非常诱人，因为 verifier 能"看到"代码的语义复杂度，理论上是比纯语法特征更深的信号。

但"meta-analysis 上有相关性" ≠ "可作为 ML 特征提升预测"。前者是 aggregate level 的统计信号，后者要求在每条样本上有判别力。这篇就是去抓这个 gap。

#### 他们怎么做的？

**核心 Insight**：做严格的 control-treatment experiment——把现有最强的代码可理解性 ML 模型作为 baseline，唯一变量是是否加 verifier warning sum 这个特征。

具体方法流程：
1. 复现文献中的 baseline ML 模型（语法 + developer 特征）
2. 加 verifier warning sum 作为额外特征，重新训练
3. 同设置、同 split 比较两组在标准 metric 上的差异
4. 拆解：在 high warning vs low warning subgroup 上是否有差异

**跟之前方法的本质区别**：之前的工作都在"建立 verifier warning 跟 comprehensibility 的相关性"，没人去问"这个相关性有没有判别力作 ML 特征"。这是一个常见的 gap：correlation 不等于 information gain。

#### 关键结果

| 模型配置 | Comprehensibility 预测性能 |
|---------|------------------------|
| Baseline（syntactic + developer） | 文献既有水平 |
| + Verifier warning sum | 无显著差异 |

**结果解读**：负结果但很有价值。它告诉我们 verifier warning sum 的相关性大概率是 confounded by 语法复杂度——代码越复杂，warning 越多 + comprehensibility 越差，但 warning 没在语法特征之上提供 incremental information。换句话说，**它跟语法特征是冗余的**。

#### 局限性与开放问题

- **局限 1**：只用了 verifier warning **sum**，没用 warning 类型分布或 warning location feature。可能"warning 是哪种、在哪里"才有判别力，"加起来多少"确实是冗余特征
- **局限 2**：没测试不同的 verifier（用了一个或几个特定 verifier），不同 verifier 的 warning 信号性可能不同
- **开放问题**：什么样的 verifier 输出能给 ML 模型提供真正的 incremental information？这个问题很值得做下去——比如 SMT solver 的不可满足核心、abstract interpretation 的 widening point 数量

#### 💡 对我们的启发

1. **直接可用**：博主在做 ML4SE 时，**永远要做 ablation 验证特征的 incremental information，不要被相关性骗**。这篇的实验范式（baseline + 单变量 control-treatment）可以直接套用到博主的 patch quality / fault localization 工作里
2. **具体实验想法**：博主可以在 program repair 工作中复用这个方法论——比如"static analysis 的 warning 是不是 patch quality 的好特征"。一周可做：跑 100 个 patch 通过 ESLint/HomeCheck，把 warning sum 加进 patch quality 模型，做 control-treatment，看是否真的提供 incremental information
3. **研究趋势判断**：ML4SE 领域的 reproducibility crisis 正在浮现，越来越多的"X 跟 Y 相关"论文经不起严格 ablation。**做"诚实的负结果"在未来 2-3 年会越来越有价值**——不是噱头，而是因为这正是 LLM 时代评估方法论混乱的反弹

---

## 方法对比

下面把今天四篇按"AI4SE 评估流水线的不同环节"做一个交叉对比，方便看清楚博主的研究链条上每一篇能挂在哪：

| 维度 | Agent Token Spend | RealBench | NL2VC + Dafny | Verifier Warnings |
|------|------------------|-----------|---------------|-------------------|
| 关注的环节 | agent 过程效率 | benchmark 输入真实性 | 输出正确性保证 | ML 特征信息量 |
| 核心方法 | 大规模 trajectory 事后分析 | 真实 UML + repo 构造 | signature + self-healing + uDebug | control-treatment ablation |
| 数据需求 | 公开 trajectory（中等） | 反向构造 UML（重） | 60 个手工 spec（轻） | 既有 comprehensibility 数据集 |
| 计算开销 | 高（trajectory 重跑） | 中（生成评估） | 中（self-healing 迭代） | 低（特征对照） |
| 适用场景 | agent eval methodology | 工业风格 code gen | 高保证代码合成 | ML4SE 特征验证 |
| 主要局限 | 仅 SWE-bench Verified | UML 反向构造偏差 | 算法题、可能在训练集中 | 只测 warning sum |
| 与博主的接口 | trace 分析主线 | OpenHarmony benchmark | repair self-healing | 整体方法论批判 |

---

## 一句话收尾

如果今天只能记一件事：**当 LLM 已经"能用"，下一波研究的核心议题是"它到底为什么能用、贵在哪里、保证在哪里、特征有没有用"**。今天的四篇是这个议题的不同切片，正好与博主的 agent 边际价值 + 工具链主线高度重合。
