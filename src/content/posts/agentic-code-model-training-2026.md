---
title: "代码基模与 Agentic Training 前沿：从 GLM-5.2、DeepSeek-V4 到 SWE Agent RL"
date: "2026-06-27"
description: "一份更像读论文现场的深度笔记：用 alphaXiv、论文图和官方技术报告，把代码基模、长上下文、verifier、SWE 环境和 agent RL 的训练闭环讲清楚。"
tags: ["大模型", "代码模型", "Agentic Training", "SWE Agent", "论文阅读"]
coverColor: "from-slate-900 to-blue-600"
---

这篇文章不是模型新闻列表，也不是为了证明我"懂很多新模型"。我真正想整理的是另一件事：代码基模正在从单函数 code generation，走到 repo-level、tool-use、long-horizon 的 agentic engineering。这个变化对软件工程研究者很实在，因为很多训练问题的源头不在模型结构，而在任务、数据、环境、verifier 和反馈预算。

我这次主要用 alphaXiv 的 paper/overview 页面复习论文，再对照 arXiv HTML 里的原图和官方技术报告页面。这样读起来比只看 PDF 更顺，图也更接近论文现场。下面每一节我都会尽量按同一个顺序写：

1. 这篇材料到底在解决什么问题。
2. 图里应该看哪几个细节。
3. 它的训练 recipe 或系统 recipe 是什么。
4. 我不完全买账或需要小心的地方。
5. 它怎么接回我的 CodeAnchor、To Run or Not to Run、RepoRescue、AtomicCommitBench、SWE-OpenHarmony 这些工作。

如果只想带走一句话，我会这样概括：现在的 code model 不只是在比谁会写函数，而是在比谁能在真实软件仓库里持续工作；而持续工作需要的不只是更大模型，还需要可执行环境、结构化上下文、稳定 verifier、可靠轨迹和能承担成本的训练系统。

## 1. 先把训练语言对齐

我先把最底层的几个概念放在前面。原因很简单：读 GLM-5、DeepSeek-V4、Kimi K2 这类报告时，如果 loss、perplexity、attention、KV cache、SFT、DPO、RLVR 这些词还只是"听过"，后面的模型报告很容易读成营销稿。

### 1.1 cross entropy、perplexity 和 pass rate 不是一回事

大模型预训练通常是 next-token prediction。给定上下文，模型输出 vocabulary logits，softmax 后得到下一个 token 的概率分布。对一个真实 token `y`，如果模型给它的概率是 `p(y)`，单点交叉熵就是：

```text
CE = -log p(y)
```

训练时会对大量位置取平均。loss 越低，说明模型越能把概率分给真实文本。perplexity 通常是 `exp(loss)`，直觉上可以理解成模型平均每一步面对的"有效候选数"。如果 loss 是 2，perplexity 大约是 7.39；如果 loss 是 1，perplexity 大约是 2.72。这个解释不完美，但面试里够用。

真正容易混的是另一件事：pretraining loss 下降，不等于 SWE-bench resolved rate 一定上升。

loss 是 token-level objective。SWE-bench resolved rate 是一个长程任务结果。中间隔着很多环节：找文件、理解 issue、定位 bug、编辑 patch、跑测试、读日志、修失败、避免破坏其它行为。一个模型可能在代码语料上 loss 更低，但在真实仓库里仍然不会用工具，或者会把上下文塞满却找不到关键文件。

所以我现在更喜欢把 code agent 成功率拆成：

- base model 懂不懂代码和自然语言；
- repo context 是否给对了；
- trajectory 是否教会模型用工具；
- verifier 是否可靠；
- execution feedback 是否值得花；
- 推理时是否有足够但不过量的 search/test budget。

这也是为什么我的 To Run or Not to Run 不能只叫"执行测试策略"。放到训练语言里，它是在问 execution feedback 作为 observation/reward 的边际收益。

### 1.2 attention 和长上下文：能塞进去，不代表能用出来

decoder-only Transformer 的 causal self-attention 可以粗略写成：

```text
softmax(QK^T / sqrt(d)) V
```

Query 表示当前位置要找什么，Key 表示历史 token 怎么被匹配，Value 是真正被聚合的信息。causal mask 保证模型预测当前 token 时不能看未来。

推理时，历史 token 的 Key/Value 会缓存下来，这就是 KV cache。它让自回归推理不用每一步重算所有历史 token，但代价是上下文越长，KV cache 越大。到了 128K、200K、1M context，问题就不只是"显存够不够"，还包括带宽、attention FLOPs、prefill 延迟、以及上下文里噪声太多时模型是否还能定位证据。

这点和代码任务非常贴。真实 SWE agent 的上下文可能包括 issue、repo 文件、搜索结果、测试输出、失败日志、之前的修改、自己的反思。1M context 的确提高上限，但如果没有结构检索、文件锚点、调用关系、测试相关性排序，它也可能只是把更多无关 token 放到模型面前。

CodeAnchor 在这个语境下就不是传统静态分析的小工具。它更像 deterministic anchors：在长上下文里给模型一组稳定的结构入口，减少盲搜。

### 1.3 SFT、DPO、RLVR：代码任务为什么适合做 verifier

SFT 教模型模仿高质量示范。对 code agent 来说，示范不是一句答案，而是 observation-action 轨迹：搜索、打开文件、编辑、运行测试、读日志、提交 patch。

DPO 用 chosen/rejected pair 调偏好。代码里 chosen/rejected 很自然：通过测试、改动小、解释清楚的 patch 可以是 chosen；失败、删测试、过度修改、引入回归的 patch 可以是 rejected。

RLVR 更吸引人，因为代码任务有天然 verifier：unit tests、编译、lint、静态检查、运行输出。问题也在这里。SWE agent 的 reward 往往很稀疏：最后通过是 1，不通过是 0。它不告诉你哪次搜索有效，哪次测试值得跑，哪次修改只是碰巧没炸。环境还很贵，每次 rollout 都要容器、依赖、测试和超时控制。

我读下面这些论文时，一直用这个问题做尺子：它们是在改模型，还是在改训练信号？是在扩大上下文，还是在提高上下文信噪比？是在增加 rollout，还是在让每一次 rollout 更值钱？

## 2. GLM-5 / GLM-5.2：agentic engineering 不是一句口号

GLM-5 的题目很直接：[GLM-5: from Vibe Coding to Agentic Engineering](https://www.alphaxiv.org/abs/2602.15763)。我喜欢这个题目，因为它把这两年代码模型的变化说得很白：从人类不断提示模型写一小段代码，变成模型自己读、改、跑、修、再验证。

![GLM-5 在 alphaXiv 上的论文页面截图。左侧能看到首页摘要和 Figure 1 的多任务结果，右侧是 alphaXiv 的辅助阅读区。](/images/blog/agentic-training/alphaxiv-glm5.jpg)

论文里几个数字值得记：

- GLM-5 是 744B total / 40B active 的 MoE，比 GLM-4.5 更大。
- 训练 token budget 到 28.5T。
- 用 DeepSeek Sparse Attention (DSA) 降低长上下文训练和推理成本。
- 继续使用 slime 作为 post-training / RL 基础设施，把 rollout serving 和 training 解耦。
- 任务覆盖 reasoning、coding、agentic、terminal 和 long-horizon 工程任务。

我不建议只背这些数字。更值得看的其实是 Figure 5，也就是训练管线。

![GLM-5 论文 Figure 5：从 base model training 到 SFT、reasoning RL、coding/agent RL、general RL 的整体训练管线。来源：arXiv HTML / alphaXiv 对应论文页面。](/images/blog/agentic-training/glm5-training-pipeline.png)

这张图的读法是：GLM-5 不是"预训练完再随便 SFT 一下"。它把 base training、mid/long-context training、SFT、reasoning RL、coding RL、agent RL、general RL 串成了一个多阶段过程。对 code agent 来说，后面的 RL 阶段不是锦上添花，而是在把模型从会回答题，推向会在环境里行动。

这里有两个细节我会在面试里主动说。

第一，DSA 的价值不是让论文多一个结构创新，而是让长上下文 agent 变得算得起。SWE agent 的一次任务可能不是一个 prompt，而是几十轮工具调用。如果每轮都带很长上下文，attention 成本和 KV cache 成本会直接变成 serving 成本。

第二，slime 这类异步 RL infra 说明了一个现实：agentic post-training 的瓶颈不只是算法。rollout 太慢、环境太贵、tail latency 太长，都会让训练吞吐掉下来。报告里提到 server-based rollouts、Prefill-Decode disaggregation、fault tolerance，我读到这里的感觉是：现在 code model 训练组越来越像半个系统组。

GLM-5.2 的 alphaXiv 页面 [GLM-5.2: Built for Long-Horizon Tasks](https://www.alphaxiv.org/abs/2026.glm-5-2) 又把这条线往长任务推进了一步。它强调 1M-token context、IndexShare、flexible reasoning effort 和 speculative decoding 相关优化。这个方向和 GLM-5 的关系很清楚：GLM-5 把 agentic engineering 作为目标，GLM-5.2 继续补长上下文和长程任务的系统能力。

![GLM-5.2 在 alphaXiv 上的页面截图。页面把 1M context、long-horizon tasks、IndexShare 和 agentic RL 放在同一条叙事里。](/images/blog/agentic-training/alphaxiv-glm52.png)

我会怎么把它接回自己的工作？CodeAnchor 可以接到 long-context repo understanding；To Run or Not to Run 可以接到 agent rollout 和执行反馈预算；RepoRescue/SWE-OpenHarmony 可以接到可执行环境构造。也就是说，我不是只做"应用层 benchmark"，而是在做 agentic engineering 需要的任务侧基础设施。

我也会保留一点警惕。模型报告里的 benchmark 很多，Terminal-Bench、Vending-Bench、SWE 相关任务都很热，但模型到底是不是学会了稳定工程推理，还要看任务是否泄漏、环境是否可复现、失败轨迹是否被分析。只看平均分，很容易把 agent 的偶然成功当成能力。

## 3. DeepSeek-V4：1M context 的问题是经济性

DeepSeek-V4 现在也可以直接从 alphaXiv 读：[DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence](https://www.alphaxiv.org/abs/deepseek-v4)。这比只看官方 release 更适合复习，因为 alphaXiv 的 `.md` 入口能把报告正文直接交给 AI 做二次提问。

![DeepSeek-V4 在 alphaXiv 上的技术报告页面截图。报告开头就把 1M context、CSA/HCA、mHC 和 Muon optimizer 放在一起。](/images/blog/agentic-training/alphaxiv-deepseek-v4.png)

报告开头列出的核心信息包括：

- DeepSeek-V4-Pro：1.6T total / 49B active parameters。
- DeepSeek-V4-Flash：284B total / 13B active parameters。
- 两个模型都面向 1M context。
- 架构上用 Compressed Sparse Attention (CSA) 和 Heavily Compressed Attention (HCA) 做 hybrid attention。
- 引入 Manifold-Constrained Hyper-Connections (mHC) 和 Muon optimizer。
- 报告称在 1M context 下，V4-Pro 的单 token inference FLOPs 约为 DeepSeek-V3.2 的 27%，KV cache 约为 10%。

我把它放在 GLM-5.2 后面读，是因为两者都在回答同一个问题：长上下文不是宣传口径，而是 agent serving 的成本问题。

对代码 agent 来说，1M context 至少会遇到四个问题。

第一，prefill 成本。把一个大仓库、日志、历史 action 全塞进去，第一步生成前就已经很贵。

第二，KV cache。多轮推理时，缓存越来越大，batching 和内存管理都会变难。

第三，证据定位。长上下文里有更多噪声，模型可能"看到了"关键文件，但 attention 没有落到那里。

第四，反馈预算。运行测试和保留日志都能提供信号，但它们也会继续拉长上下文。

这就是我觉得 DeepSeek-V4 对 SWE agent 的启发：它让"长上下文经济性"变成一个必须认真回答的问题。我的 To Run or Not to Run 可以翻译成同一类问题：什么时候值得花环境成本换 observation？什么时候继续把日志放进上下文反而降低信噪比？

DeepSeek-V4 也提醒我，不要把 1M context 讲成单纯的"能塞更多代码"。它真正关心的是每个历史 token 的表示成本、检索成本、cache 成本和服务吞吐。如果未来 code agent 每个任务都带着几十轮工具轨迹，那么上下文长度本身会变成训练和推理预算的一部分。

## 4. IQuest-Coder-V1：把 code model 训练写成 pipeline

[IQuest-Coder-V1 Technical Report](https://www.alphaxiv.org/abs/2603.16733) 是这份清单里最贴近代码基模训练的一篇。它不像有些模型报告那样只给 benchmark 表，而是明确提出 code-flow multi-stage training。

![IQuest-Coder-V1 论文 Figure 2：Code-Flow Training pipeline。图里能看到 pre-training、32K/128K mid-training、thinking/instruct 两条 post-training 路径。来源：arXiv HTML / alphaXiv。](/images/blog/agentic-training/iquest-codeflow-pipeline.png)

这张图值得慢慢看。它把训练分成几块：

- pre-training 和 high-quality annealing：代码、文档、仓库、completion、FIM、repo evolution data。
- 32K mid-training：加入 reasoning、agentic trajectories 和 code tasks。
- 128K mid-training：把 repo-scale context 放进训练。
- bifurcated post-training：thinking path 更偏 reasoning/RL，instruct path 更偏通用助手。
- LoopCoder：用 loop transformer 变体做部署 footprint 和模型容量之间的折中。

我最关心的是"32K 到 128K"这个变化。它不是简单把 context length 拉长，而是把训练分布从单文件/短任务推到 repository-level reasoning。真实仓库任务的证据分散在 issue、文件、调用链、配置、测试和历史修改里。模型如果只学过短上下文代码补全，很难在 repo-scale 任务里稳定导航。

IQuest 的 post-training 也很有意思。thinking path 和 instruct path 分开，说明代码模型已经不再是一个统一"会聊天的模型"就够了。你可以希望模型在复杂问题上显式推理，也可以希望它在工具场景里快速听指令，这两个目标可能需要不同的数据和 RL 配方。

这篇对我的简历映射非常直接：

- CodeAnchor：repo-scale context 里的结构锚点。
- AtomicCommitBench：commit/patch evolution data 的任务来源。
- RepoRescue：可执行仓库修复环境。
- To Run or Not to Run：agentic trajectories 里的 execution feedback scheduling。

我会这样解释自己和 IQuest 这条线的关系：IQuest 这种训练 pipeline 需要高质量 repo tasks、agent trajectories、verifier 和低泄漏评测。我过去做的 SE 工作，正好可以提供这些训练信号，而不是只在模型外面做 demo。

需要小心的是，报告里的 code-flow 说法很漂亮，但真正落地时最难的仍然是数据质量。repo evolution data 如果没有严格去重和泄漏控制，很容易把 benchmark 变成记忆题；agent trajectories 如果只是强模型的漂亮演示，也可能教会模型冗长、低效或不可复现的路径。

## 5. Qwen3-Coder：20,000 环境背后是 code RL 的工程问题

Qwen3-Coder 的官方博客 [Agentic Coding in the World](https://qwenlm.github.io/blog/qwen3-coder/) 给出的是开源 code model scaling 的另一条路线。

公开信息里最值得记的点：

- Qwen3-Coder-480B-A35B-Instruct 是 480B total / 35B active 的 MoE。
- 原生 256K context，可通过 YaRN 扩到 1M。
- pretraining 使用 7.5T tokens，其中代码占比约 70%。
- post-training 强调 hard-to-solve but easy-to-verify 的 Code RL。
- 构建了 20,000 个并行环境支持 long-horizon RL。

我没有使用那张官方网页截图，因为本地浏览器抓取时被页面弹窗挡住了。这里直接用官方链接，不把一张脏截图放进文章。

Qwen3-Coder 最值得读的不是 480B/35B 这个数字，而是"20,000 parallel environments"。这句话背后有一整套工程问题：环境怎么启动，依赖怎么装，测试怎么跑，失败怎么记录，超时怎么处理，rollout 怎么排队，reward 怎么回传，训练时如何避免环境吞吐成为瓶颈。

hard-to-solve but easy-to-verify 也很适合代码任务。题目难，模型需要探索；验证容易，测试/编译/运行可以给 reward。但 SWE 任务比竞赛题复杂，因为验证通常不完美。测试可能弱，环境可能 flaky，patch 可能过拟合，模型还可能学会删测试或绕过 harness。

这条线和我的 OpenHarmony 工作连接很自然。Android 到 HarmonyOS 迁移、OpenHarmony app 修复、UI 性能问题、依赖漂移修复，都可以构造成领域化可执行环境。它们不一定替代通用 SWE-bench，但可以提供低泄漏、可控、带 verifier 的训练/评测补充。

如果面试里问"代码任务为什么适合 RL"，我会答得更具体一点：不是因为代码有测试就万事大吉，而是因为测试让我们可以构造 verifiable reward；真正困难的是环境规模、reward 稀疏、测试质量和 trajectory filtering。

## 6. Kimi K2：我最想背的是 MuonClip，不是榜单

[Kimi K2: Open Agentic Intelligence](https://www.alphaxiv.org/abs/2507.20534) 很容易被读成又一个大 MoE 报告：1T total / 32B active，SWE-bench 分数，agentic intelligence。可我觉得最值得认真看的其实是 optimizer stability。

![Kimi K2 论文 Figure 2：MuonClip 通过 QK-Clip 控制 attention logits，避免 vanilla Muon 下 attention logits 快速变大带来的不稳定。来源：arXiv HTML / alphaXiv。](/images/blog/agentic-training/kimi-muonclip.png)

报告里说 Kimi K2 使用 MuonClip，在 15.5T token pretraining 中没有观察到 loss spike。这里的重点不是"zero loss spike"这句话有多好听，而是它把训练稳定性讲成了 attention dynamics 的问题。

Muon 本身是近来很受关注的优化器方向。Kimi K2 在它基础上加入 QK-Clip，控制 attention logits。图里左边显示 vanilla Muon 的 attention logits 很快冲到非常高的量级，右边显示 MuonClip 能把 logits 控在更稳定范围。对训练组来说，这比一个 benchmark 表更硬，因为 loss spike 往往不是一句"调小学习率"能解决的。

Kimi K2 的另一条线是 agentic data synthesis 和 joint RL。报告里提到工具使用数据、合成工具、agent/task 组合、以及后续 RL。我的理解是：真实 agent 交互数据太贵，人工标注太慢，所以模型团队会越来越依赖可验证的合成任务和可回放环境。

这和 AtomicCommitBench 的思路有点像。我们不一定能无限收集真实 issue，但可以构造带意图、顺序、patch、测试或验证信号的任务，让模型学习变更链路。难点是合成任务不能只有形式，它得保留软件工程里的因果结构。

我对 Kimi K2 的保留意见也很明确：agentic data synthesis 容易制造分布幻觉。如果工具、任务、轨迹都由模型合成，模型可能学会合成世界里的捷径，而不是真实 repo 里的工程约束。要缓解这个问题，就需要真实环境、真实测试、真实失败分析。这里正是 SE 研究能补进去的位置。

## 7. SWE-Gym：训练环境的起点不是 prompt，而是可执行实例

[SWE-Gym](https://www.alphaxiv.org/abs/2412.21139) 是我认为所有 SWE agent training 都应该先读的一篇。它回答一个很基本但经常被低估的问题：什么叫一个可训练的软件工程任务？

论文的答案不是"一个 issue prompt"。一个可训练的 SWE task 至少要有：

- natural language task specification；
- codebase；
- executable runtime environment；
- unit tests；
- gold patch 或可验证目标；
- agent 交互轨迹或可生成轨迹的环境。

SWE-Gym 包含 2,438 个真实 Python task instances。论文还做了 SWE-Gym Lite，用于更快原型验证。

![SWE-Gym 论文 Figure 1：训练时间 scaling 和 inference-time scaling 都能提升 SWE agent 表现。来源：arXiv HTML / alphaXiv。](/images/blog/agentic-training/swegym-scaling.png)

这张 Figure 1 很适合教学。上半部分说 training-time scaling：更多高质量训练轨迹能提高模型表现。下半部分说 inference-time scaling：推理时多采样、多 rollout、用 verifier 选解，也能提高 resolved rate。

但图里真正值得问的是：scaling 的资源从哪里来？

训练时间 scaling 需要任务和轨迹。轨迹从环境里跑出来，环境需要 Docker、依赖、测试和日志。inference-time scaling 需要多次尝试和 verifier。多次尝试会增加成本，verifier 质量又决定你选出来的是好 patch 还是碰巧过弱测试的 patch。

SWE-Gym 的贡献是把 SWE agent 从"prompting proprietary model"推进到"open-weight model 可以在公开环境里训练"。没有可执行环境，RLVR、DPO、verifier reranking 都会变成纸上谈兵。

我最警惕的点是污染和可复现。SWE-bench 系列任务已经非常有名，训练数据里是否见过相关 issue、patch、测试、讨论，都需要严肃处理。环境也可能因为依赖版本变化而不可复现。RepoRescue 在依赖漂移上的工作，可以很好地接到这个问题。

## 8. SWE-smith：数据规模不是抓更多 GitHub

[SWE-smith](https://www.alphaxiv.org/abs/2504.21798) 处理的是 SWE-Gym 之后的另一个痛点：真实 SWE agent 训练数据太少，构造太贵，环境太重。

论文构造了 50k+ task instances，来自 128 个 GitHub repositories。它还把存储问题讲得很具体：如果沿用 SWE-bench 那种 image-per-instance 思路，同样规模可能需要几十 TB 到上百 TB；SWE-smith 通过 repository-level environment 设计，把规模化变得更现实。

![SWE-smith 论文 Figure 2：从 codebase 出发，设置环境、生成 bug、验证测试失败/通过，再形成可训练的 SWE task。来源：arXiv HTML / alphaXiv。](/images/blog/agentic-training/swesmith-data-pipeline.png)

这张图是我最想拿来讲 benchmark-to-training 的。它不是从 issue 收集开始，而是从 codebase 开始，自动设置环境，再通过多种策略生成 bug，让原本通过的测试失败，然后再构造 agent 要修复的任务。

这里有一个值得记住的转变：benchmark 不只是评测终点，也可以是训练数据来源。一个 task instance 如果有环境、有 failing tests、有目标行为、有可验证修复，就可以进入 SFT、DPO、RLVR 或 verifier training。

但是 SWE-smith 也暴露出合成任务的老问题。合成 bug 如果太模板化，模型会学模板；测试如果太弱，模型会学 reward hacking；issue 描述如果由模型生成，可能和真实开发者提 issue 的风格不一样。规模化不等于真实，50k 也不自动等于高质量。

我会把自己的 benchmark 经验这样翻译给基模训练同学听：我关心的不是"又做了一个排行榜"，而是如何构造低泄漏、可执行、可回放、带 verifier 的 code tasks。这样的任务可以评测，也可以进入训练。

## 9. SWE-Dev：训练 scaling 和 inference scaling 要一起看

[SWE-Dev](https://www.alphaxiv.org/abs/2506.07636) 的标题是 Building Software Engineering Agents with Training and Inference Scaling。它把两个经常分开讨论的问题放到一起：训练时如何扩数据，推理时如何扩交互预算。

论文从大量 PyPI/GitHub 资源中筛选仓库和实例，构造 SWE-Dev 数据，并用合成测试用例和扩展 agent trajectories 做训练。它报告 7B 和 32B SWE-Dev 模型在 SWE-bench Verified 上分别达到 23.4% 和 36.6% resolved rate。

我读 SWE-Dev 时主要盯三件事。

第一，测试用例生成。SWE agent 的 reward 很依赖 tests。测试太弱，模型会过拟合；测试太强或不稳定，模型拿不到有效信号。测试生成不是辅助步骤，而是 verifier 质量的核心。

第二，trajectory expansion。扩轨迹并不是简单让模型多跑几次。要决定哪些轨迹可学、哪些失败轨迹可作为反例、哪些 observation 要 mask 掉、哪些工具调用只是噪声。

第三，inference budget。给 agent 更多轮数通常能提高上限，但也会放大成本和错误机会。更多交互不等于更好，尤其当模型会陷入重复搜索、不断运行同一组测试、或在错误文件里越改越远时。

这正好接到 To Run or Not to Run。执行反馈不是免费资源。一次测试运行可能带来强信号，也可能只是浪费时间、污染上下文、诱导模型在弱测试上过拟合。SWE-Dev 告诉我们 training scaling 和 inference scaling 都有用；我的问题是：预算该怎么花，什么时候该停？

## 10. Agent-RLVR：可验证 reward 不等于容易 RL

[Agent-RLVR](https://www.alphaxiv.org/abs/2506.11425) 的问题意识很直接：RLVR 在数学题、竞赛编程里有效，但到了 agentic environment，事情会难很多。

![Agent-RLVR 论文 Figure 1：左边是用 environment feedback 做 RLVR，右边是通过 agent guidance 降低探索难度。来源：arXiv HTML / alphaXiv。](/images/blog/agentic-training/agentrlvr-loop.png)

这张图可以分成两半看。

左边是训练 loop：policy 生成 trajectory，环境给 observation 和 reward，再用 DPO/RLVR 类方法更新模型。右边是 guidance：先收集环境信息，生成 guidance，把 agent 往更可能成功的方向引。

为什么需要 guidance？因为 SWE agent 的 reward 太稀疏。一个 episode 可能很长，最后失败就是 0。对模型来说，它不知道是搜索错了、文件读少了、patch 写错了、测试没跑、还是环境超时。正样本太少时，RL 很难学到东西。

论文里还包括 27 个 repos，593 个来自 SWE-Gym 的 problems 和 219 个自收集 problems。这个设置本身说明了一点：agent RL 的 task coverage 很难靠一个 benchmark 解决。真实训练需要多来源任务和环境。

我会把 Agent-RLVR 看成对 RLVR 乐观叙事的修正。代码任务有 verifier，所以适合 RL；但代码 agent 是长程交互，所以 RL 信号很稀疏。两句话都对，中间差的是 guidance、curriculum、trajectory filtering、verifier quality 和环境吞吐。

CodeAnchor 在这里可以被看成一种 guidance：不是直接告诉答案，而是给模型更稳定的结构入口。execution feedback 则是 environment observation/reward，但它也需要调度，否则会变成高成本噪声。

## 11. RAGEN：多轮 agent RL 最怕学出自我重复

[RAGEN](https://www.alphaxiv.org/abs/2504.20073) 不是专门写 SWE 的，但它对理解 agent RL 很有帮助。它研究 multi-turn RL for LLM agents，并提出 StarPO 框架。alphaXiv 的 overview 对这篇很适合做第一遍阅读，因为它把 StarPO、Echo Trap、multi-turn collapse 这些概念先拆开讲，再回到论文实验。

传统 RLHF 或数学题 RL 常常是单轮：给 prompt，模型输出答案，环境/标注器给分。agent 不一样。agent 会观察环境、思考、行动，再观察，再行动。每一步都可能改变后续状态。

RAGEN 的 StarPO 把 trajectory 写成 state、thinking、actions、reward 的链路。这个建模很适合拿来解释 SWE agent：repo 是 state，模型的分析是 thinking，search/edit/test 是 actions，测试结果或最终通过是 reward。

论文里让我印象最深的是训练崩塌和 Echo Trap 这类现象。模型在多轮 RL 中可能学会重复自己的推理、过度自信、动作分布变窄，最后 reward 可能短期上升但真实泛化变差。这个问题在 SWE 里也很容易出现：agent 反复 grep 同一个关键词，反复运行同一个测试，或者不断在错误文件上做小改。

这让我对 "just scale RL" 保持警惕。agent RL 不是只看最终 reward 曲线，还要看轨迹长度、工具调用分布、重复动作比例、测试运行次数、失败日志类型、patch diff 大小。这些恰好是软件工程研究者更敏感的地方。

MazeBreaker 也能接到这条线。它表面上是 LLM 安全和多智能体攻击，但放到 agent RL 语言里，它研究的是多轮策略、环境反馈和路径优化。这个翻译比单纯说"我做过安全评测"更有训练组语感。

## 12. DeepSWE：SWE RL 终于写成了工程 recipe

[DeepSWE](https://www.together.ai/blog/deepswe) 是我觉得最像工程 recipe 的一份材料。它不只说"RL 提升了 SWE-bench"，而是把环境、动作空间、reward、rollout 系统和训练 trick 都摆出来。

![DeepSWE 官方博客页面截图：这篇材料把 coding agent 的 RL 训练写成了比较具体的系统配方。](/images/blog/agentic-training/deepswe-official.jpg)

公开博客里的关键信息包括：

- 从 Qwen3-32B 出发；
- 使用 4.5K R2E-Gym tasks；
- 用 64 H100 训练 6 天；
- 动作空间包括 bash、search、file editor、finish/submit；
- reward 是稀疏 0/1：选定测试在时限内通过为 1，否则为 0；
- 使用 GRPO++；
- 通过 Kubernetes 管理大规模环境 rollout；
- 讨论 compact filtering、training-time scaling 和 hybrid test-time scaling；
- 报告 Pass@1 42.2%，hybrid test-time scaling 后 SWE-Bench Verified 约 59%。

这篇的价值在于它把 SWE RL 的麻烦讲得很具体。环境启动慢，依赖安装慢，测试 flaky，轨迹太长，成功样本少，超时样本多，reward collapse，teacher trajectory 未必好。每一个问题都不是抽象算法词，而是训练系统会真实遇到的工程事故。

我最想记住的是 compact filtering。长轨迹不一定更有价值。很多超长轨迹只是模型在迷路，或者在失败后不断补救。把这些样本直接喂给 RL，可能会强化坏习惯。这个判断和 To Run or Not to Run 很近：执行、搜索、编辑都应该被看成有成本的动作，而不是越多越好。

DeepSWE 也提醒我，SFT teacher trajectory 不一定总是好东西。强模型生成的轨迹可能很漂亮，但也可能冗长、依赖隐式知识、不适合小模型模仿。冷启动 RL 如果环境和 reward 做得好，反而可能学出更适合自身能力的策略。

如果要把我的研究接到 DeepSWE，我会这样说：

- CodeAnchor 降低 repo navigation 的探索空间。
- To Run or Not to Run 控制执行反馈预算。
- Chain-Tracking 帮助判断成功 patch 是否有因果链。
- RepoRescue 提供依赖漂移环境。
- SWE-OpenHarmony 提供垂域可执行任务。

这些不是模型外的"应用经验"，而是 SWE RL recipe 里会影响训练信号质量的部件。

## 13. 把这些论文压成一个训练闭环

读完上面这些材料，我会把 code model / SWE agent training 压成一个闭环：

| 阶段 | 在训练里做什么 | 对应材料 | 我的工作怎么接 |
|---|---|---|---|
| base pretraining | 学语言、代码、数学、基础推理 | GLM-5、Kimi K2、DeepSeek-V4 | 需要理解 loss、optimizer、data mixture |
| long-context / repo training | 学 repo-level 结构和长证据链 | GLM-5.2、IQuest-Coder、DeepSeek-V4 | CodeAnchor、AtomicCommitBench |
| SFT / trajectory imitation | 学工具使用和修复流程 | SWE-Gym、SWE-Dev、DeepSWE | 高质量 agent trajectories |
| verifier / preference | 用测试、编译、review 构造 chosen/rejected | SWE-Gym、Agent-RLVR | To Run、Chain-Tracking |
| RLVR / agent RL | 在环境里 rollout，按 reward 更新 | Agent-RLVR、RAGEN、DeepSWE | 可执行任务、反馈调度 |
| inference-time scaling | 多采样、多 rollout、verifier rerank | SWE-Gym、SWE-Dev、DeepSWE | 执行预算、停止策略 |
| failure flywheel | 分析失败，回流数据和环境 | SWE-smith、RAGEN | RepoRescue、SWE-OpenHarmony |

这个闭环比单独背每篇论文更有用。因为面试里真正有价值的问题通常不是"你读过哪篇"，而是"你知道这些东西怎样连起来吗"。

我会坚持一个定位：我不是把自己伪装成已经负责过千卡 pretraining 的人。更准确的说法是，我站在 code agent training 的任务与反馈侧，正在补齐训练侧共同语言。代码基模想做 agentic engineering，就必须有人把真实软件工程问题变成可训练、可验证、可复现的环境和数据。

## 14. 一些可以直接拿去用的回答

如果被问："为什么 pretraining loss 下降不等于 SWE-bench 提升？"

我会答：

> pretraining loss 是 token-level NLL，衡量模型对下一个 token 分布的拟合。SWE-bench 是长程 agent task，中间有 repo retrieval、bug localization、patch editing、test execution、log understanding 和 iterative repair。loss 更低能提高基础代码能力，但 resolved rate 还依赖工具使用、上下文组织、verifier 和反馈调度。

如果被问："1M context 能不能解决 repo-level coding？"

我会答：

> 1M context 提高上限，但不会自动解决 repo-level coding。长上下文带来 KV cache、prefill、attention FLOPs 和噪声问题。真实仓库任务需要结构检索、deterministic anchors、context compression 和 execution feedback。否则模型只是看到了更多 token，不代表找到了关键证据。

如果被问："SWE agent 为什么适合 RLVR？"

我会答：

> 因为代码任务有天然 verifier，比如 unit tests、编译和运行输出，可以把结果转成 reward 或 preference。但难点是 reward 稀疏、episode 长、环境贵、credit assignment 难。最终测试通过不能告诉模型哪一步有贡献，所以还需要 guidance、trajectory filtering、verifier 质量控制和执行预算调度。

如果被问："你的 SE 背景怎么接到 code model training？"

我会答：

> 我的研究集中在真实软件工程 agent 的任务侧闭环：仓库级上下文、执行反馈、benchmark、verifier、轨迹和低泄漏环境。现在 code model 从 HumanEval 走向 repo-level tool-use agent，这些能力需要真实任务和可靠反馈。我补齐训练基础后，可以把这些 SE 资产接到 post-training、RLVR、eval 和 data flywheel 里。

## 15. 我接下来会怎么复习

我会按三层复习，不再把论文当成孤立材料。

第一层是训练地基。能讲清 cross entropy、perplexity、AdamW、warmup、loss spike、attention、KV cache、MoE、FSDP/ZeRO、SFT、DPO、GRPO、RLVR。每个概念都要能说出一个代码 agent 场景里的例子。

第二层是模型报告。GLM-5/5.2 看 long-context agentic engineering 和 slime；DeepSeek-V4 看 1M context 的经济性；IQuest-Coder 看 code-flow multi-stage training；Qwen3-Coder 看大规模并行环境；Kimi K2 看 MuonClip 和 agentic data synthesis。

第三层是 SWE agent 训练。SWE-Gym 看可执行训练环境；SWE-smith 看规模化任务合成；SWE-Dev 看 training/inference scaling；Agent-RLVR 看 reward sparsity 和 guidance；RAGEN 看 multi-turn RL 的训练病灶；DeepSWE 看完整工程 recipe。

最后，我会把自己的工作统一翻译成训练语言：

- CodeAnchor：repo-level structural anchoring。
- To Run or Not to Run：execution feedback scheduling。
- RepoRescue：dependency-drift repair environment。
- AtomicCommitBench：patch-intent and commit trajectory data。
- Chain-Tracking：trajectory credit assignment over CI/log/code changes。
- SWE-OpenHarmony：domain-specific executable agent benchmark。

这不是为了把所有东西硬贴到大模型上，而是因为前沿代码基模确实在往这个方向走。真实软件工程越进入训练闭环，软件工程研究者越不应该只站在评测终点看热闹。

## 参考材料

alphaXiv 的 `.md` 入口很好用，适合直接喂给 AI 做逐段问答。我自己复习时会先看页面和图，再用 Markdown 入口追细节。

- GLM-5: [alphaXiv](https://www.alphaxiv.org/abs/2602.15763), [AI Markdown](https://www.alphaxiv.org/abs/2602.15763.md), [GitHub](https://github.com/zai-org/GLM-5)
- GLM-5.2: [alphaXiv](https://www.alphaxiv.org/abs/2026.glm-5-2), [AI Markdown](https://www.alphaxiv.org/abs/2026.glm-5-2.md), [official blog](https://z.ai/blog/glm-5.2)
- DeepSeek-V4: [alphaXiv](https://www.alphaxiv.org/abs/deepseek-v4), [AI Markdown](https://www.alphaxiv.org/abs/deepseek-v4.md), [official release](https://api-docs.deepseek.com/news/news260424)
- IQuest-Coder-V1: [alphaXiv](https://www.alphaxiv.org/abs/2603.16733), [AI Markdown](https://www.alphaxiv.org/abs/2603.16733.md)
- Qwen3-Coder: [official blog](https://qwenlm.github.io/blog/qwen3-coder/)
- Kimi K2: [alphaXiv](https://www.alphaxiv.org/abs/2507.20534), [AI Markdown](https://www.alphaxiv.org/abs/2507.20534.md)
- SWE-Gym: [alphaXiv](https://www.alphaxiv.org/abs/2412.21139), [AI Markdown](https://www.alphaxiv.org/abs/2412.21139.md)
- SWE-smith: [alphaXiv](https://www.alphaxiv.org/abs/2504.21798), [AI Markdown](https://www.alphaxiv.org/abs/2504.21798.md)
- SWE-Dev: [alphaXiv](https://www.alphaxiv.org/abs/2506.07636), [AI Markdown](https://www.alphaxiv.org/abs/2506.07636.md)
- Agent-RLVR: [alphaXiv](https://www.alphaxiv.org/abs/2506.11425), [AI Markdown](https://www.alphaxiv.org/abs/2506.11425.md)
- RAGEN: [alphaXiv](https://www.alphaxiv.org/abs/2504.20073), [AI Markdown](https://www.alphaxiv.org/abs/2504.20073.md)
- DeepSWE: [Together AI blog](https://www.together.ai/blog/deepswe)
