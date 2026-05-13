---
title: "arXiv 每日速递 2026-05-14"
date: "2026-05-14"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-14

## 今日总结

今天三篇值得细读：一篇用 CLM 暂时替换 MLM 来改善 encoder continued pretraining，对我们做 Cangjie 等低资源语言的 pretraining 几乎是直接送菜；一篇用 100 题 / 4577 实例 benchmark 系统拷问 LLM 生成组合优化求解器的真实能力，得出"让 LLM 形式化建模、别让它自作主张写启发式"的强结论；还有一篇把 hallucination detection 从 step 级粒度推到 token 级，用 0.6B 检测器干翻 QwQ-32B critic，验证了"专门训练的小模型 > 通用大模型"在评估器场景的可行性。三篇都贴在我们已有研究主线上——continued pretraining、LLM × code 边界、small-model evaluator——不是看热闹，是直接能搬。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [A Causal Language Modeling Detour Improves Encoder Continued Pretraining](http://arxiv.org/abs/2605.12438) | continued pretraining | CLM 短暂替换 MLM，下游 +1.2-2.8pp，效果来自低层表征重塑 | ⭐⭐⭐ |
| [Formalize, Don't Optimize: The Heuristic Trap in LLM-Generated Combinatorial Solvers](http://arxiv.org/abs/2605.12421) | LLM × code, benchmark | 100 题组合优化 benchmark，LLM 当 modeler 比当 optimizer 强 | ⭐⭐⭐ |
| [Scalable Token-Level Hallucination Detection in LLMs](http://arxiv.org/abs/2605.12384) | LLM evaluation, small model | 0.6B token 级检测器超越 QwQ-32B critic，免去 step segmentation | ⭐⭐ |

## 今日主题：让 LLM 老实做边界内的事，把判断交给专门训练的小模型

今天这几篇看似领域各异，但骨子里在讲同一件事：**LLM 不是万能解题机器，而是流水线里的一个组件**——关键是搞清它擅长什么、不擅长什么，然后把它放对位置。

CLM detour 那篇是"训练阶段的边界"：encoder 的下游能力，原来卡在低层（layer 0-7）从 MLM 拿到的信号太稀疏，临时切换到 CLM 给低层做密集监督，再 decay 回 MLM——relative routing of supervision，不是堆数据堆算力。Formalize, Don't Optimize 那篇是"推理阶段的边界"：让 LLM 写 OR-Tools 约束建模没问题，让它"顺便优化一下搜索"就翻车（中位数加速 1.03-1.12×，但长尾里大量退化）。TokenHD 那篇是"评估的边界"：让 32B 通用大模型做 critic 远不如训一个 0.6B 专门干 token 级 hallucination 检测的小模型。

对我们最直接的启发是：**continued pretraining、agent 边际价值、小模型 evaluator** 这三条主线，今天都拿到了新的实验证据和方法工具。下面分别拆开来看。

---

### A Causal Language Modeling Detour Improves Encoder Continued Pretraining

> **推荐理由**：你正在做 Cangjie / ArkTS 等低资源语言的 continued pretraining，这篇论文对 encoder 类模型给了一个"几乎零成本"的训练秘方，并且把 mechanistic 解释做到了层级粒度——这是我们之前缺的工具

📌 **论文信息**：Rian Touchent, Eric de la Clergerie | [arXiv:2605.12438](http://arxiv.org/abs/2605.12438) | cs.CL

![Figure 1: CLM detour pipeline (a) 预训练 encoder 先做 CLM 再做 MLM decay，对比标准 MLM baseline；(b) 冻结实验，证明 CLM 的增益来自低层 (0-7) 的表征重塑](https://arxiv.org/html/2605.12438v1/x3.png)

#### TL;DR
在 MLM continued pretraining 中段，临时切到 CLM 跑一段，再用 MLM 短期 decay 回来——同等算力同等数据下，下游任务稳定提升 1.2-2.8pp（French 生物医学）/ 0.3-0.8pp（English）。增益的本质：CLM 的 dense supervision 把低层（0-7）的表征改造了 5-44 倍于 noise baseline 的幅度。

#### 问题是什么？
encoder 模型（BERT、ModernBERT 这类）做 domain adaptation 的标准操作是继续 MLM——也就是把目标领域的语料喂进去，继续做 token 掩码预测。但 MLM 的监督信号有个固有问题：**每个 token 只有 15% 的位置参与 loss 计算**，剩下 85% 都是"白看不学"。对于低资源领域（biomedical、code、minority language），这种稀疏监督让 encoder 的低层表征改不动多少——就像考试一半题目都被打码，老师只能从露出来的一小部分判断你哪里没掌握。

这跟我们做 Cangjie 这类新生语言的 continued pretraining 撞了正脸：corpus 本来就小，再被 MLM 的稀疏监督打折，低层语法层面的迁移效果会很弱。

#### 他们怎么做的？

**核心 Insight**：在 continued pretraining 中段做一次"绕道"——先 CLM 几个 epoch，再短期 MLM decay 回来。CLM 是 next-token prediction，每个位置都参与 loss（dense supervision），用这个密集信号去改造 encoder 的低层。

具体方法流程：
1. **MLM warmup**（与 baseline 相同）：encoder 先按标准 MLM 在领域语料上预训练若干 step
2. **CLM detour**：切换 head 和 attention mask 到 causal 模式，跑同样数量的 step——同一份数据、同一份算力，只是监督密度变了
3. **MLM decay**：再切回 MLM 跑短期 fine-tune，让模型重新适应双向上下文用法

**跟之前方法的本质区别**：之前的 continued pretraining 工作把"加数据 / 加 step / 调 mask 比例"作为主要旋钮，没人想过**临时换 objective**。这个 detour 本质是用 CLM 的 dense gradient 给低层"加一道猛火"，再用 MLM decay 把表征"调回 encoder 该有的样子"。冻结实验是这篇最漂亮的部分：冻结低层（0-7）让 CLM 完全失效，冻结中层不影响——说明所有增益都来自低层的表征重塑。

#### 关键结果

| Benchmark | 语言 | 模型规模 | MLM Baseline | CLM Detour | 提升 |
|-----------|------|---------|------|------|------|
| 8 French biomedical tasks (平均) | FR | Base | — | — | +1.2-2.8pp |
| 11 English biomedical tasks (平均) | EN | Base/Large | — | — | +0.3-0.8pp |
| CKA divergence (低层 vs noise baseline) | — | — | 1× | 5-44× | — |

**结果解读**：
- 提升主要来自**低层语义重塑**——CKA 分析显示 CLM 在 layer 0-7 引发 5-44× 于 noise 的表征变化，layer 8 之上没差别
- French 受益更大（+1.2-2.8pp）因为 ModernCamemBERT base 本身在 biomedical 上 fitting 不充分，低层信号补充更明显
- 增益**穿透**了后续 MLM decay 阶段——也就是说不是 "CLM 临时占了 head 的便宜"，而是真正改变了 encoder 内部表征

#### 局限性与开放问题

- **局限 1**：只在 ModernBERT 一种架构 + biomedical 一个领域验证，是否泛化到 code / legal 等领域，是否对老式 BERT 也奏效——都没答案。我猜 code 领域可能更大收益，因为 code corpus 里 token 之间的 causal 依赖比自然语言更强
- **局限 2**：CLM 和 MLM 的最优时长配比（论文只试了几个点）和 model size 怎么 scale，缺系统性的 ablation。如果训练预算紧（我们 Cangjie 项目就是这样），需要先做 pilot
- **开放问题**：CLM detour 的低层重塑效应，跟 RoBERTa 时代发现的"dynamic masking 提升表征"是否同源？两者都在给低层增密信号，可能是同一个底层机理的不同切面

#### 💡 对我们的启发

1. **直接可用的技术点**：Cangjie continued pretraining 实验里加一个 ablation arm——`MLM-only` vs `MLM → CLM → MLM decay`，看 ArkUI / Cangjie 代码补全任务的 pass@1 是否随之提升。如果我们的 base 是 encoder-decoder 或 decoder-only，可以把这个 detour 改造成"短期换 objective"思路：比如 decoder-only 上插入一段 FIM（fill-in-the-middle）做 detour
2. **具体实验想法（1-2 周可验证）**：
   - 输入：现有 Cangjie corpus（已经 tokenize 好），按 80/10/10 划分
   - 做什么：跑两组对照——`MLM-only continued pretraining` 和 `MLM → CLM → MLM decay`，预算相同
   - 预期观察：下游 Cangjie 代码补全 / API 调用预测的 pass@1 应该 +0.5-2pp；同时做 layer-wise CKA 分析，看是否复现低层 5×+ 的表征变化模式。如果复现不了，说明 code corpus 里 MLM 的稀疏问题没自然语言严重
3. **研究趋势判断**：mechanistic 解释 + 训练 recipe 改进是当下顶会的"双 buff"组合。光提一个 trick 没意思，要附 layer-wise 冻结 / CKA 这种内部分析。我们之后写 paper 时记得这个范式

---

### Formalize, Don't Optimize: The Heuristic Trap in LLM-Generated Combinatorial Solvers

> **推荐理由**：这篇直接对应你那条"LLM 的边际价值实证量化"主线，做的是 LLM 写求解器场景下"哪些子任务该让 LLM 做、哪些该交给传统方法"的精细切分

📌 **论文信息**：Haoyu Wang, Yuliang Song, Tao Li, Zhiwei Deng, Yaqing Wang | [arXiv:2605.12421](http://arxiv.org/abs/2605.12421) | cs.AI

![Figure 1: Solution provided（虚线）vs verified correct（实线）by paradigm and prompt——Python+OR-Tools 在尾部 256s 处稳定最高，Python native 实线-虚线 gap 最大，启发式 prompt 没有稳定提升](https://arxiv.org/html/2605.12421v1/fig/fig3_provided_vs_correct_all.png)

#### TL;DR
作者建了 100 题 / 4577 实例的 CP-SynC-XL benchmark，对比三种"让 LLM 写组合优化求解器"的范式：纯 Python 算法、Python + OR-Tools、MiniZinc + OR-Tools。结论：**Python + OR-Tools 正确率最高**；**让 LLM 顺便优化启发式搜索几乎全是负收益**——中位加速 1.03-1.12×，但长尾里大量正确率崩盘。给 LLM 用于 NP-hard 求解器一个清晰的"职责边界"。

#### 问题是什么？
现在很多 neuro-symbolic 系统让 LLM 把自然语言描述的组合优化问题翻译成可执行求解器代码。但有两个未解决的设计问题：
1. **表征该用哪种**：LLM 直接写算法（Python search）、写约束规划 API（OR-Tools）、还是写声明式建模语言（MiniZinc）？
2. **该不该让 LLM 优化搜索**：给 LLM prompt 说"也优化一下搜索性能"，到底加分还是减分？

之前的工作各做各的，没有统一 benchmark 横向对比。结果就是每个 paper 都在自己的数据集上自吹自擂，practitioner 不知道选哪条路。

#### 他们怎么做的？

**核心 Insight**：把"求解器构造"拆成两个正交维度——表征（representation）和启发式（heuristic）——分别评估。LLM 的真实价值在"形式化建模"，不在"算法发明"。

具体方法流程：
1. **建 benchmark**：CP-SynC-XL，100 个组合优化问题，4577 个实例，覆盖 scheduling、packing、graph coloring 等
2. **三种表征 × 两种 prompt** 全因子对比：
   - 表征：Python native / Python + OR-Tools / MiniZinc + OR-Tools
   - prompt：baseline（"写一个 solver"）vs heuristic-enabled（"写一个 solver，并优化搜索性能"）
3. **配对 code-level audit**：手工查那些被启发式 prompt 拖垮的实例，归类失败模式

**跟之前方法的本质区别**：之前 LLM × OR-Tools 的工作通常只比"正确率高低"，不区分"表征贡献"和"启发式贡献"。这篇拆出两个维度，再用 code audit 把"为什么 heuristic prompt 退化"归到了三类具体陷阱：

- 用 local approximation 替换完全搜索（Python native）
- 注入未验证的搜索 bound（Python + OR-Tools）
- 加冗余声明式机器，反而 over-constrain 模型（MiniZinc + OR-Tools）

#### 关键结果

| 范式 | 正确率（实例覆盖） | Schema-valid 但 verify 失败率 | 启发式 prompt 的中位加速 |
|------|------------------|---------------------------|----------------------|
| Python native | 中 | **最高**（多） | 部分加速，长尾多崩盘 |
| Python + OR-Tools | **最高** | 低 | 1.03-1.12×，bimodal |
| MiniZinc + OR-Tools | 中-低 | 低 | 1.03-1.12×，bimodal |

![Figure 3: Five-way outcome decomposition by paradigm and prompt，每个 LLM 一面板——correct / suboptimal / UNSAT / invalid / no solution in 256s](https://arxiv.org/html/2605.12421v1/fig/fig4_outcomes.png)

**结果解读**：
- **Python native** 把 schema 对的代码返回率刷得很高，但 verify 一过就大量翻车——"看起来能跑，跑不对"是 LLM 写算法的标志性病征
- **Python + OR-Tools** 之所以赢 MiniZinc + OR-Tools（即便后端是同一个 OR-Tools），是因为 Python wrapper API 对 LLM 的训练分布更友好——MiniZinc DSL 出现频次太低
- **启发式 prompt 是分布退化**：1.03-1.12× 的中位加速看似温和，但分布是 bimodal——一部分实例 2-5× 加速，另一部分直接 timeout，平均下来正确率净下降

#### 局限性与开放问题

- **局限 1**：所有评估在 256s timeout 下做，时间预算放宽到 1h 后结论可能变化——长 tail timeout 的 case 也许只是收敛慢，不是真错
- **局限 2**：100 题的问题分布是否代表"真实世界"组合优化场景，存疑——industry 里很多场景是 MILP / SAT / scheduling，不一定 fully covered。如果偏 SAT-heavy 的话，MiniZinc 的劣势可能被夸大
- **开放问题**：LLM 写约束建模的天花板在哪？是不是 fine-tune 一个 small model 专门做 NL → MiniZinc 翻译就能彻底解决？

#### 💡 对我们的启发

1. **直接可用的技术点**：你之前做的"agent 工作流单个设计动作的边际价值量化"是一回事。这篇给了一个非常清晰的范式：拆维度（表征 / 启发式）+ 配对 code audit 归类失败模式。我们在 SWE-bench trace 分析里，可以借鉴这种"prompt 设计单独消融 + 失败 case 归类"的两件套
2. **具体实验想法（1-2 周可验证）**：
   - 输入：SWE-bench 的 OpenHands 公开 trace（已有数据）
   - 做什么：把 trace 里的 "agent self-critique" 这一动作单独剥离，按"无 critique / 标准 critique / 启发式 critique（带具体建议）"三种 setting 重放，记录 patch verify 成功率
   - 预期观察：是不是 "启发式 critique" 也会出现这里看到的 bimodal 分布——一部分实例显著提升，另一部分崩盘？如果是，能写一篇"Critique Trap in Coding Agents"
3. **研究趋势判断**：CP-SynC-XL 这种"维度切分 + code audit"的 benchmark 设计，是 2026 年 LLM × code 评估的方向。我们的下一篇 paper 可以考虑放弃 end-to-end pass@k 这种粗粒度指标，做 process quality 分维度评估

---

### Scalable Token-Level Hallucination Detection in Large Language Models

> **推荐理由**：把 hallucination detection 推到 token 级是评估方法论的硬骨头；更有意思的是 0.6B 小检测器把 32B 大 critic 干翻——这是我们做 LLM-based 评估系统时强力的反例和方法借鉴

📌 **论文信息**：Rui Min, Tianyu Pang, Chao Du, Minhao Cheng, Yi R. Fung | [arXiv:2605.12384](http://arxiv.org/abs/2605.12384) | cs.CL

![Figure 1: TokenHD 的 token 级检测机制示意——detector 直接在 free-form 文本上识别 hallucination，颜色深浅表示预测的 hallucination 概率，不需要预先做 step segmentation](https://arxiv.org/html/2605.12384v1/x1.png)

#### TL;DR
现有 hallucination detection 基本停留在 step 级——把 reasoning 切成步骤再判定每一步。这粒度太粗且依赖切分质量。TokenHD 训了一个 token-level 检测器：直接在自由文本上工作，无需 step segmentation。**0.6B 模型干过 QwQ-32B 通用大 critic**，0.6B → 8B 扩展时性能稳定 scale。

#### 问题是什么？
LLM 经常在 reasoning 链路中间编造事实或逻辑错误，但表面 fluent。要做有用的 detector 有两难：
- **粒度太粗**：step 级检测得先把答案切步骤，切错了就全错。Reasoning 风格千差万别，统一 step 切分 brittle
- **大 critic 贵又烂**：用 GPT-4 或 QwQ-32B 当 critic 看上去合理，但通用模型不为这个任务优化，准确率天花板很低，成本还高

#### 他们怎么做的？

**核心 Insight**：与其用通用大模型做通用 critic，不如建一个专门的 token-level 训练 pipeline——data engine 大规模合成 token 级 hallucination 标注，再用 importance-weighted 训练目标对小模型微调。专门 > 通用，在评估器这个场景被反复验证。

具体方法流程：
1. **可扩展 data engine**：合成大规模 token 级 hallucination 标注。具体方法是构造"已知 ground truth 的 reasoning trace"再注入扰动作为 hallucination 标签
2. **Importance-weighted 训练**：不同 token 对最终 verdict 贡献不同，用重要性加权稳定训练
3. **直接 free-form 推理**：detector 直接吃自由文本，不需要预先 step segmentation 或文本格式化

**跟之前方法的本质区别**：之前的 hallucination detection 要么靠 LLM-as-a-judge（贵且粒度粗），要么靠 token logit / entropy（要求 white-box，且只对生成模型本身管用，不能跨模型用）。TokenHD 把它变成一个**有监督的小模型分类任务**，跨模型、跨任务都能用。

#### 关键结果

![Figure 2: 三个 STEM benchmark 上 S_incor 性能对比——backbone (Qwen3-1.7/8B)、critic (GPT-4.1, o4-mini)、TokenHD 检测器 (1.7/8B)](https://arxiv.org/html/2605.12384v1/x2.png)

| 模型 | 模型规模 | hallucination detection（S_incor 平均） |
|------|---------|----------------------------------------|
| QwQ-32B (critic) | 32B | 较低 |
| GPT-4.1 (critic) | — | 中等 |
| TokenHD-0.6B | **0.6B** | **超过 QwQ-32B** |
| TokenHD-8B | 8B | 稳定继续提升 |

**结果解读**：
- 0.6B 训过的检测器 > 32B 通用 critic，这印证了"专门小模型 + 监督数据 > 通用大模型 + zero-shot"的旧规律——但用 token 级粒度证明这点是新的
- 0.6B → 8B 稳定 scale（不是 plateau），说明 token-level signal 还有上升空间，没到容量饱和
- 跨域泛化也做了，作者说 reasonable 但 cross-domain 还有提升空间——这是一个老问题，本文没特别突破

#### 局限性与开放问题

- **局限 1**：data engine 合成的 hallucination 标注 vs 真实 LLM 自然产生的 hallucination 分布差异，论文没仔细分析。合成数据上学到的 pattern 可能在野外 distribution shift 下退化
- **局限 2**：评估只在 STEM reasoning benchmark 上做，code reasoning（最关心的）没单独测——code hallucination 的 surface 形态（变量名拼错 vs API 调用错误 vs 逻辑错误）和数学链路里的 hallucination 形态可能差别大
- **开放问题**：token 级 hallucination probability 能不能直接用做 RL reward 信号？理论上比 step 级 reward 密度高得多

#### 💡 对我们的启发

1. **直接可用的技术点**：你做 LLM × SE benchmark 时，把"agent trace 里哪些 token 是 hallucination"作为一个评估维度直接挪过来。比如 SWE-bench OpenHands trace 里，agent 生成 fake test、fake API 调用、wrong import 的位置，能不能用类似 TokenHD 的小检测器自动定位？
2. **具体实验想法（1-2 周可验证）**：
   - 输入：几千条 SWE-bench 公开 trace（有 ground truth verdict）
   - 做什么：训一个 0.6B 的 code-hallucination detector，标注粒度到 line 级（token 太细，line 是更适合 code 的单元），对比 GPT-4 critic
   - 预期观察：line-level detector 应该跟通用 critic 在 line-level F1 上接近或超过，成本降一个量级以上。这是一个独立的小 paper 工作（"Line-Level Hallucination Detection in Coding Agent Traces"）
3. **研究趋势判断**：评估器（critic / verifier / reward model）的"专门化 + 小型化"是接下来 1-2 年的强方向，对应你"small / local LLM for code"主线很好的进入点。商业 API critic 用不起、用不快、accuracy 还不一定够——专门训的 0.6B 评估器就是答案

---

## 方法对比

| 维度 | CLM Detour | Formalize, Don't Optimize | TokenHD |
|------|-----------|--------------------------|---------|
| 核心方法 | continued pretraining 中段切 objective | LLM 当 modeler 而非 optimizer | 训练 token 级专门检测器 |
| LLM 角色 | 被训练的对象 | code generator | 被评估的对象 + 评估器 |
| 数据需求 | 同等领域 corpus | 4577 个组合优化实例 | 合成 token 级 hallucination 标注 |
| 计算开销 | 与 baseline 同（只是换 objective） | 推理时 256s timeout | 训练专门 detector |
| 可迁移到 SE | ⭐⭐⭐（Cangjie pretraining 直接借鉴） | ⭐⭐⭐（trace 维度切分思路） | ⭐⭐（小模型评估器） |
| 主要局限 | 只验证 encoder + biomedical | 100 题 benchmark 代表性 | 合成 vs 真实 hallucination 分布差 |

## 今日笔记的三个 take-away

1. **训练 recipe 的小改动 + mechanistic 解释 = 顶会模板**：CLM detour 没堆数据没堆算力，就换个 objective + 用 CKA / 冻结 ablation 把 "why" 解释清楚，论文就立住了。我们写 paper 时该学这个范式
2. **拆维度做 benchmark > 端到端比指标**：Formalize 那篇把 representation × heuristic 两个轴拆开，得到了"该让 LLM 干啥不该让它干啥"的指导性结论，比"我们的方法比 baseline 好 X 个点"有价值得多
3. **专门 0.6B > 通用 32B（评估器场景）**：这个反复出现的规律值得我们押注。下一篇 paper 思考能不能做"code-specific token-level critic"
