---
title: "代码基模与 Agentic Training 前沿：从 GLM-5.2、DeepSeek-V4 到 SWE Agent RL"
date: "2026-06-27"
description: "一份面向基模组备战的详细阅读笔记：补齐 ML/训练地基，梳理 GLM-5.2、DeepSeek-V4、IQuest-Coder、Qwen3-Coder、Kimi K2，以及 SWE-Gym、DeepSWE、Agent-RLVR 等 agentic code training 论文。"
tags: ["大模型", "代码模型", "Agentic Training", "SWE Agent", "论文阅读"]
coverColor: "from-slate-900 to-blue-600"
---

这篇文章不是普通的“模型新闻汇总”。它更像我给自己准备的一份基模组备战笔记：我已经有比较强的软件工程和代码智能体研究经历，真正需要补的是两件事。

第一，补齐模型训练的共同语言。面试官问 loss、optimizer、attention、long context、SFT、RLVR、显存和训练事故时，不能只靠“我做过 benchmark”来回答。

第二，理解前沿代码模型到底怎么从“会写代码”走向“能做工程”。现在的关键词已经不是 HumanEval，而是 repo-level context、tool-use、execution feedback、verifier、trajectory data、long-horizon RL 和 inference-time scaling。

所以我把阅读范围分成两层：

- **模型报告层**：GLM-5/5.2、DeepSeek-V4、IQuest-Coder-V1、Qwen3-Coder、Kimi K2。
- **Agent 训练层**：SWE-Gym、SWE-smith、SWE-Dev、Agent-RLVR、RAGEN、DeepSWE，以及长上下文多轮 SWE-RL。

我关心的不是谁榜单最高，而是每篇报告/论文回答了训练闭环里的哪一环：数据从哪里来，环境怎么跑，reward/verifier 怎么设计，长上下文和工具调用成本如何控制，以及这些东西怎样和我的 CodeAnchor、To Run or Not to Run、RepoRescue、AtomicCommitBench、SWE-OpenHarmony 连接起来。

## 0. 先定一个判断：代码基模正在从 code generation 走向 agentic engineering

过去两年，代码模型的竞争焦点已经发生了变化。

早期代码模型最容易展示的是单函数生成：HumanEval、MBPP、LeetCode-style problems。这类任务非常重要，因为它们干净、可验证、便于快速迭代。但它们也有明显局限：真实软件工程不是给一个函数签名写实现，而是在一个已有仓库里读代码、定位问题、理解依赖、修改多个文件、运行测试、分析日志、回滚错误路径，最后给出可验证 patch。

因此，前沿模型报告里的语言开始变化：

- GLM-5 把目标写成从 **vibe coding** 走向 **agentic engineering**。
- GLM-5.2 强调 solid **1M-token context**、复杂系统工程和 flexible reasoning effort。
- DeepSeek-V4 把重点放在 million-token context 的高效推理，尤其是压缩/稀疏注意力。
- IQuest-Coder-V1 直接提出 **code-flow multi-stage training**，并把 repo-scale、agentic trajectories、reasoning RL 放进训练管线。
- Qwen3-Coder 强调 **agentic coding in the world**，并明确讨论 20,000 个并行环境上的 long-horizon RL。
- Kimi K2 把大规模 MoE、optimizer stability、agentic data synthesis 和 joint RL 放在同一个训练叙事里。

这说明一件事：代码模型不是只比“生成一段正确代码”的能力，而是在比“能不能作为一个长期工作的工程 agent”。这对软件工程背景的人反而是机会，因为 agentic engineering 的难点很多不是传统 NLP 问题，而是真实工程任务、执行环境、工具反馈、测试信号、仓库结构和评测协议。

我的简历里最该被翻译成训练语言的部分是：

| SE 说法 | 基模组说法 |
|---|---|
| CodeAnchor | repo-level structural retrieval / deterministic context anchoring / long-context noise reduction |
| To Run or Not to Run | execution feedback scheduling / verifier cost-benefit / agent environment budget |
| RepoRescue | dependency drift repair environment / realistic repository-level training tasks |
| AtomicCommitBench | patch-intent reconstruction / commit trajectory modeling / ordered code-change data |
| Chain-Tracking | causal credit assignment over CI, execution logs, and patch actions |
| SWE-OpenHarmony / HomeTrans | domain-specific coding environments / low-leakage agentic benchmark generation |

这篇文章后面的所有阅读，都会围绕这个翻译表展开。

## 1. 地基：面试里必须能讲清楚的训练概念

我不需要把自己包装成已经训过千卡 pretrain 的人。但如果目标是基模组，就必须能和训练同学正常对话。最低要求是：看到一个训练现象，能说出可能机制和排查路径。

### 1.1 Next-token loss 与 perplexity

大模型预训练的核心目标通常是 next-token prediction。给定上下文 token 序列，模型输出 vocabulary logits，softmax 后得到下一个 token 的概率分布。cross entropy loss 本质上就是最小化真实 token 的 negative log likelihood。

如果 loss 是 `L`，perplexity 通常可以理解成 `exp(L)`。它表示模型平均每一步面对多少“有效候选”。loss 越低，模型越能把概率分配给真实文本。

但这里有个很重要的面试点：**pretraining loss 下降，不等于 SWE-bench resolved rate 一定上升。**

原因是 LM loss 是 token-level objective，而 SWE-bench 是一个长程 agent task。中间隔着：

- 仓库理解和检索；
- 多文件定位；
- patch planning；
- 工具调用；
- 执行反馈；
- 测试日志理解；
- 失败后的策略修正；
- 最终 patch 是否通过隐藏测试。

所以代码基模的训练目标会从单纯 token likelihood 逐步扩展到 SFT、preference learning、verifier reranking、RLVR 和 test-time scaling。

### 1.2 AdamW、warmup 与 loss spike

Adam 维护梯度的一阶矩和二阶矩，用自适应步长稳定训练。AdamW 的关键是把 weight decay 从梯度更新里解耦出来，避免正则项被 Adam 的自适应学习率扭曲。

大模型训练通常需要 warmup。直觉是：训练初期参数还没有进入稳定区域，梯度方向和尺度都很不可靠，如果一开始学习率太大，很容易造成 loss spike 甚至发散。warmup 让学习率从小逐渐升到目标值，后续再用 cosine decay 或 linear decay 慢慢减小更新幅度。

如果面试官问 “loss spike 怎么排查”，我会按四类说：

1. **优化问题**：learning rate、warmup、gradient clipping、batch size、optimizer hyperparameters。
2. **数据问题**：异常 batch、重复/污染数据、过长 sequence、坏样本、分布突变。
3. **数值问题**：fp16 overflow、bf16/fp32 cast、loss scaling、NaN/Inf。
4. **系统问题**：并行通信、optimizer state、checkpoint resume、不同 rank 数据不一致。

这个回答比“调小学习率试试”更像训练组语言。

### 1.3 Attention、KV cache 和长上下文

Transformer decoder 的核心是 causal self-attention。每个 token 生成 Query，历史 token 提供 Key 和 Value。attention score 大致是 `QK^T / sqrt(d)`，softmax 后对 Value 加权求和。causal mask 保证当前位置不能看未来。

推理时，历史 token 的 K/V 可以缓存起来，这就是 KV cache。每生成一个新 token，只需要计算新 token 的 Q/K/V，并和历史 K/V 做 attention。问题是：context 越长，KV cache 越大；上下文到 128K、1M 之后，显存和带宽压力会非常明显。

因此 GQA、MLA、稀疏注意力、压缩注意力、IndexShare、DSA 这些技术，本质上都在回答同一个问题：**长上下文 agent 到底怎样才能算得起？**

这和代码 agent 非常相关。一个真实 SWE agent 的上下文可能包括：

- issue description；
- 仓库文件；
- 搜索结果；
- 多轮工具调用；
- 测试输出；
- failed logs；
- 自己的反思和修改历史。

所以长上下文不是“能塞 1M token 就结束了”。真正的问题是：关键信息能不能被模型找到，KV 和 attention 成本能不能承受，无关上下文会不会降低定位能力。

CodeAnchor 正好可以被解释成这条线上的工作：在长上下文时代，静态结构不只是程序分析技巧，而是帮助模型降低上下文噪声、稳定定位路径的 deterministic anchors。

### 1.4 SFT、DPO、RLVR 与代码 verifier

SFT 教模型模仿高质量示范。对聊天模型来说，它学习 instruction-following；对 code agent 来说，它可以学习如何读文件、用工具、编辑 patch、解释日志。

但 SFT 有两个问题：

- 它依赖 teacher trajectory 的质量；
- 它优化的是模仿，不直接优化最终任务成功。

DPO 通过 chosen/rejected pair 直接优化偏好，不需要显式 reward model。代码任务里，chosen/rejected 可以来自 pass/fail patch、好/坏 trajectory、简洁/冗长工具使用路径。

RLVR 更适合代码场景，因为代码任务有天然 verifier：unit tests、编译、静态检查、lint、runtime behavior。问题在于 SWE agent 的 reward 很稀疏：一次最终测试通过只告诉你 episode 成功了，但不告诉你中间哪一步真正有贡献。环境还贵，每次 rollout 都要启动容器、安装依赖、运行测试。

这就是我自己的 To Run or Not to Run 可以接入的地方：execution feedback 不是免费的，每次运行测试都要消耗时间和计算；在 agentic training/inference 中，反馈调度本身就是策略问题。

## 2. 模型报告：前沿代码基模怎么变强

### 2.1 GLM-5 / GLM-5.2：从 vibe coding 到 agentic engineering

GLM-5 技术报告的标题就是 [GLM-5: from Vibe Coding to Agentic Engineering](https://arxiv.org/abs/2602.15763)。这句话很适合当作整篇笔记的主线。

公开材料里，GLM-5 的几个核心点是：

- 模型从 GLM-4.5 的 355B total / 32B active 扩到 **744B total / 40B active**。
- 预训练数据从 23T tokens 扩到 **28.5T tokens**。
- 引入 DeepSeek Sparse Attention (DSA)，降低长上下文训练和推理成本。
- 使用名为 **slime** 的异步 RL 基础设施，将 generation 与 training decouple，提高 post-training throughput。
- 目标场景不只是 coding benchmark，而是 complex systems engineering 和 long-horizon agentic tasks。

GLM-5.2 在 GLM-5 系列基础上进一步强调：

- **solid 1M-token context**；
- stronger coding with flexible effort；
- IndexShare：每四个 sparse attention layers 复用同一个 indexer，在 1M context 下减少 per-token FLOPs；
- 改进 MTP layer 做 speculative decoding，提高 accepted length。

我读 GLM-5/5.2 时最关心三件事。

第一，长上下文能力和 agentic engineering 是绑定的。复杂工程任务需要长会话和长证据链，但长上下文如果没有高效 attention/serving 机制，就会变成成本黑洞。

第二，RL infra 变成核心竞争力。传统 SFT 可以离线做，但 agentic RL 需要大量 rollout、环境交互和反馈收集。slime 的意义不是一个框架名字，而是说明训练瓶颈已经变成“如何高吞吐地收集和利用 agent 轨迹”。

第三，benchmark 也在变化。Terminal-Bench、SWE-bench Pro、Vending Bench 这类任务都在逼模型处理长期目标、工具调用、资源管理和现实约束。

对我的启发是：如果面试代码基模或 agentic training 相关岗位，不能只讲“我做了 SWE-bench 实验”。更好的说法是：

> 我的工作关注 agentic engineering 里的反馈预算、结构上下文和仓库级任务构造；这些正是长上下文代码基模和异步 agent RL 需要的任务侧基础设施。

### 2.2 DeepSeek-V4：1M context 的经济性

DeepSeek-V4 公开报告的标题是 [Towards Highly Efficient Million-Token Context Intelligence](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash/blob/main/DeepSeek_V4.pdf)。我会把它放在 GLM-5.2 旁边读，因为两者都在强调 million-token context，但重点略有不同。

DeepSeek-V4 的公开材料给出的主线是：**百万 token 上下文必须在效率上成立。**

公开卡片/报告里几个值得记的点：

- DeepSeek-V4-Pro 是大规模 MoE，公开卡片显示 **1.6T total / 49B active**。
- DeepSeek-V4-Flash 是更轻的路线，公开卡片显示 **284B total / 13B active**。
- 两类模型都在超过 **32T tokens** 上预训练。
- 报告强调 hybrid attention：Compressed Sparse Attention (CSA) 与 Heavily Compressed Attention (HCA)，共同降低 1M context 成本。
- 报告还提到 mHC residual mapping 和 Muon optimizer，用于稳定性与收敛效率。
- NVIDIA NIM 的模型卡片提到 V4-Pro 在 1M context 下单 token inference FLOPs 约为 DeepSeek-V3.2 的 27%。

我读 DeepSeek-V4 时不会急着背 benchmark，而是抓三个训练/系统问题：

1. **历史信息怎么压缩？**  
   SWE agent 的历史包括文件、日志、命令、失败尝试。不是所有历史都需要同等精度地保留。

2. **KV cache 和 attention FLOPs 怎么控？**  
   一次 agent task 可能有几百轮工具调用，serving 成本会被放大。

3. **长上下文是否真的提升 resolved rate？**  
   如果无关文件和日志淹没了关键信息，1M context 也可能不如结构化 32K context。

这对 To Run or Not to Run 很有启发。执行反馈、长上下文、工具调用其实都可以被看成“昂贵但可能有用的资源”。好的 agent 不是无限运行、无限塞上下文，而是学会什么时候运行、保留什么证据、丢弃什么噪声。

### 2.3 IQuest-Coder-V1：最贴近目标组的 code-flow 训练路线

[IQuest-Coder-V1 Technical Report](https://arxiv.org/abs/2603.16733) 是这份清单里最需要精读的材料之一。它非常贴近代码基模和 agentic SWE 训练方向，也和我的经历最容易对齐。

报告介绍了 IQuest-Coder-V1 系列，包括 7B、14B、40B 和 40B-Loop。它最重要的概念是 **code-flow multi-stage training**：不只是让模型看静态代码，而是捕捉软件逻辑在训练 pipeline 不同阶段的动态演化。

报告中的训练路线可以粗略理解成：

1. **Initial pre-training**  
   数据包括 code facts、repository、completion data。

2. **Continual pre-training / mid-training**  
   加入 32K context 的 code understanding、reasoning、agentic trajectory 数据。

3. **Long-context repository training**  
   扩展到 128K repo-scale context。

4. **Post-training**  
   分成 thinking path 和 instruct path。thinking path 更偏 reasoning-driven RL，instruct path 更偏通用助手与指令能力。

我认为它对我的意义非常直接。

CodeAnchor 可以被放到 repo-scale context 的训练/推理问题里：模型不是缺上下文长度，而是缺可靠的结构锚点。

To Run or Not to Run 可以被放到 agentic trajectory 和 harness scheduling 里：模型什么时候需要执行，执行反馈何时带来净收益，都是 agentic training 需要回答的问题。

RepoRescue、AtomicCommitBench、SWE-OpenHarmony 可以被放到训练数据构造里：它们提供低泄漏、可执行、仓库级、带环境反馈的任务源。

如果面试官问 “你和基模训练有什么关系”，我应该直接答：

> IQuest-Coder 这类路线需要 repo-scale data、agentic trajectories、verifier 和 code-flow 任务构造。我过去做的不是外围应用，而是这些训练信号的来源和评测闭环。

### 2.4 Qwen3-Coder：代码 RL 与大规模并行环境

[Qwen3-Coder](https://qwenlm.github.io/blog/qwen3-coder/) 的官方博客标题是 Agentic Coding in the World。它给出了非常清楚的 code model scaling 叙事。

公开博客里，Qwen3-Coder-480B-A35B-Instruct 是一个 **480B total / 35B active** 的 MoE 模型，原生支持 256K context，并可通过 YaRN 扩展到 1M context。预训练使用 7.5T tokens，其中代码占比 70%。

更值得关注的是 post-training：

- 它强调 hard-to-solve but easy-to-verify 的 Code RL。
- 不只关注竞技编程，也关注更真实的 coding tasks。
- 构建了 **20,000 个并行环境** 支持 long-horizon RL。
- 还推出 Qwen Code 这类 CLI agent 工具，把模型能力释放到真实开发流程里。

这说明 code RL 的难点已经不是“有没有 reward”。代码任务当然有 reward：编译是否通过、测试是否通过、输出是否正确。但真正难的是：

- 任务是否足够难，能推动模型进步；
- 任务是否足够可验证，reward 不会乱；
- 环境是否能大规模并行；
- 失败轨迹如何过滤；
- rollout 成本如何控制；
- 训练后模型是否真的迁移到真实仓库。

这里和我的 OpenHarmony 方向连接很自然。Android 到 HarmonyOS 的迁移、OpenHarmony app 修复、UI 迁移、需求抽取和自动评测系统，本质上可以构造成领域化 SWE agent environment。它不是通用 benchmark 的替代，而是一个更干净、更可控、泄漏风险更低的训练/评测补充。

### 2.5 Kimi K2：优化器稳定性与 agentic data synthesis

[Kimi K2: Open Agentic Intelligence](https://arxiv.org/abs/2507.20534) 报告里，我最关注两个点。

第一是模型规模和 optimizer。Kimi K2 是 **1T total / 32B active** 的 MoE 模型。报告提出 MuonClip，在 Muon 基础上加入 QK-clip 来缓解训练不稳定，并报告在 15.5T tokens pretraining 中 zero loss spike。

这对训练基础很有价值：很多人读模型报告只看 benchmark，但 optimizer stability 是基模训练里非常硬的能力。loss spike、QK norm、attention logits、数值稳定性，这些都是训练组会关心的东西。

第二是 post-training。Kimi K2 报告强调大规模 agentic data synthesis 和 joint RL。在我看来，这代表一种趋势：真实环境数据太贵，单纯人工标注太慢，模型必须学会从合成但可验证的 agentic tasks 中提升。

这和 AtomicCommitBench、RepoRescue 这类想法很像。我们不一定能人工收集无限真实 issue，但可以构造可回放、可验证、结构清楚的工程任务，让模型学习变更顺序、依赖关系和修复路径。

## 3. SWE Agent 训练论文：从数据、环境到 RL

### 3.1 SWE-Gym：训练环境 + verifier 的标准起点

[SWE-Gym](https://arxiv.org/abs/2412.21139) 可以看作 SWE agent training 的一个标准起点。它提出了一个用于训练真实软件工程 agent 的环境，包含 2,438 个真实 Python task instances。每个实例有：

- codebase；
- executable runtime environment；
- unit tests；
- natural language task specification。

论文使用 SWE-Gym 训练 SWE agents，并在 SWE-Bench Verified/Lite 上报告最高 19% 的 absolute gains。同时它也探索 inference-time scaling 和 verifier。

我读 SWE-Gym 时关注三个问题。

第一，什么叫一个可训练的 SWE task？不是一段 prompt，而是 prompt + codebase + runtime + tests + stable evaluation。

第二，verifier 有双重身份。它既是评测器，也是训练和搜索信号。一个好的 verifier 可以用于 reranking、filtering、preference data，也可以进入 RL reward。

第三，任务污染非常关键。SWE-bench 类任务经常被模型训练数据污染，所以 repository split、commit time、issue leakage、test leakage 都必须被认真处理。

我的 RepoRescue 和 SWE-OpenHarmony 可以沿着这个方向讲：它们不是普通 benchmark，而是潜在的训练环境。

### 3.2 SWE-smith：规模化构造 SWE agent 数据

[SWE-smith](https://arxiv.org/abs/2504.21798) 处理的是另一个痛点：SWE agent 训练数据太少、构造太贵、环境太重。

论文指出，已有数据集通常只有几千个训练实例，来自很少的 GitHub repositories；构造过程需要大量人工，环境也可能占用 TB 级存储。这对大规模 agent training 来说显然不够。

SWE-smith 的价值在于把问题从“收集更多 issue”推进到“怎样规模化生成可验证软件工程任务”。这正是基模组会关心的方向，因为 RL/SFT 都需要足够多、足够干净、足够稳定的任务。

这里有一个容易被忽略的点：合成任务不是越多越好。如果任务带有强模板痕迹，模型会学会 exploit generation artifacts；如果测试太弱，reward 会被 hack；如果环境不可复现，训练信号会噪声很大。

所以我的 benchmark 经验应该这样表达：

> 我做 benchmark 不是只为了评测，而是在学习如何构造低泄漏、可执行、可回放、带 verifier 的 code tasks。这些任务可以进一步进入 SFT、DPO 或 RLVR。

### 3.3 SWE-Dev：训练 scaling 与 inference scaling

[SWE-Dev](https://arxiv.org/abs/2506.07636) 关注 training and inference scaling。论文使用合成测试用例和扩展 agent trajectories 来构建训练数据，并报告 7B 和 32B 模型在 SWE-bench Verified 上分别达到 23.4% 和 36.6%。

我觉得 SWE-Dev 值得读，是因为它把两个问题放在一起：

- 训练时如何构造更多高质量轨迹；
- 推理时如何通过更多交互预算提升成功率。

这和 To Run or Not to Run 非常贴。inference scaling 不是简单“给 agent 更多轮数”。更多轮数意味着更多执行、更多上下文、更高延迟、更高成本，也意味着更多走偏的机会。因此执行反馈应该被当成稀缺资源调度。

如果一个模型每轮都跑测试，它可能很贵；如果它从不跑测试，它可能缺少可靠反馈。中间的策略空间就是我的论文能接上的地方。

### 3.4 Agent-RLVR：为什么 agentic 环境里的 RLVR 更难

[Agent-RLVR](https://arxiv.org/abs/2506.11425) 的问题意识很清楚：RLVR 在数学和竞赛编程中很有效，因为答案相对容易验证；但迁移到 agentic environments 后，效果会明显下降。

原因包括：

- 任务是多步的，不是一问一答；
- 环境反馈会改变后续状态；
- reward 稀疏；
- frontier LLM 也会大量失败；
- 有效正样本少，训练信号弱；
- credit assignment 很难。

论文提出通过 guidance 和 environment rewards 来训练软件工程 agents。对我来说，最重要的不是具体算法细节，而是它确认了一件事：**可验证 reward 不等于容易训练。**

代码任务当然可以跑测试，但测试通过只是 episode-level signal。agent 中间读了哪个文件、哪次搜索有效、哪次执行有帮助、哪次修改是关键，都需要进一步分析。

CodeAnchor 可以作为 guidance：给模型更稳定的结构入口，降低 blind exploration。

Execution feedback 可以作为 environment reward/observation：告诉模型当前路径是否走通，但也要控制成本。

### 3.5 RAGEN：multi-turn agent RL 的训练病灶

[RAGEN](https://arxiv.org/abs/2504.20073) 讨论 multi-turn RL for LLM agents，提出 StarPO 框架和 RAGEN 系统。它适合用来理解 agent RL 为什么比单轮 RL 更麻烦。

单轮任务里，模型输出答案，环境给分。多轮 agent 里，模型会反复观察、思考、行动，环境状态也会被行动改变。一个错误动作可能污染后续状态；一个看似无用的动作可能后来变成关键信息来源。

这会带来几个训练病灶：

- trajectory 很长，credit assignment 难；
- environment feedback 有随机性；
- reward 可能鼓励冗长或投机动作；
- 模型可能陷入重复模式或 self-confirmation；
- 训练稳定性不只看 reward，还要看动作分布、长度分布和工具使用分布。

这和 MazeBreaker 也能对齐。MazeBreaker 虽然是安全红队方向，但本质上也涉及多智能体、多轮策略、动态环境反馈和攻击路径优化。把它放到 agent RL 语言里，会比单纯说“LLM 安全评测”更贴近基模组。

### 3.6 DeepSWE：非常工程化的 SWE RL recipe

[DeepSWE](https://www.together.ai/blog/deepswe) 是我认为最值得精读的 SWE agent RL 工程材料之一。它不是只说“我们做 RL 提升了”，而是把环境、动作、reward、rollout 系统和训练 trick 都讲得很具体。

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

DeepSWE 给我最大的启发是：SWE RL 是环境系统工程，不只是算法。

它会遇到非常具体的问题：

- 任务环境启动慢；
- dependency install 慢；
- test flaky；
- agent 轨迹超长；
- reward collapse；
- 成功样本稀少；
- 某些轨迹因为 timeout 变成无效训练信号；
- teacher trajectory 未必比 cold-start RL 更好。

这些问题和我的研究非常贴。To Run or Not to Run 可以解释为什么执行反馈要调度；Chain-Tracking 可以分析成功 patch 是否有因果链；RepoRescue 可以提供依赖漂移环境；CodeAnchor 可以降低探索空间。

一句话：DeepSWE 证明了 SWE agent RL 已经从“想法”进入“系统 recipe”阶段。

## 4. 把前沿材料压缩成一个训练闭环

读完这些材料，我会把 code model / SWE agent training 画成一个闭环：

1. **Base model pretraining**  
   自然语言、代码、数学、仓库、合成数据，目标是形成基础语言、推理和代码能力。

2. **Code/repo continual training**  
   加入 repository、completion、code facts、long-context repo data，让模型理解跨文件结构。

3. **SFT / trajectory imitation**  
   用高质量 tool-use trajectories 教模型怎样读仓库、查文件、编辑、运行测试、总结。

4. **Verifier / preference data**  
   用测试、编译、静态检查、人工偏好或强模型判断构造 chosen/rejected。

5. **RLVR / agent RL**  
   在可执行环境中 rollout，用环境 reward 优化策略。

6. **Inference-time scaling**  
   多样采样、rerank、verifier、更多交互预算、self-consistency、test-time compute。

7. **Failure analysis / data flywheel**  
   分析失败轨迹，构造新任务和新训练数据，进入下一轮。

我的简历可以对应到这个闭环的多个点：

- CodeAnchor：第 2、3、6 点，结构上下文与定位稳定性。
- To Run or Not to Run：第 4、5、6 点，执行反馈的收益、成本与调度。
- RepoRescue：第 5、7 点，真实依赖漂移环境和修复任务。
- AtomicCommitBench：第 3、4 点，变更意图和 patch trajectory 建模。
- Chain-Tracking：第 5、7 点，失败日志、测试行为和代码修改的因果链。
- SWE-OpenHarmony：第 2、5、7 点，领域代码环境和低泄漏任务生成。

这就是我在面试里应该坚持的定位：

> 我不是从零转 ML 的软工学生，而是已经站在 code agent training 的任务、数据、verifier 和反馈侧。现在我补齐训练基础，是为了把这些 SE 资产接到基模组的 pretraining、post-training 和 agent RL pipeline。

## 5. 面试复习路线：怎么把这些材料真正学会

我给自己定一个三周版本。

### 第 1 周：ML 与训练曲线

目标：能解释训练现象。

必须会讲：

- cross entropy / NLL / perplexity；
- backprop 和 gradient；
- batch size、gradient accumulation、learning rate；
- Adam / AdamW；
- warmup、cosine decay；
- gradient clipping；
- overfitting、validation loss、data leakage；
- loss spike 排查。

这一周的关键不是刷公式，而是能回答“训练出问题时你怎么看”。

### 第 2 周：Transformer、长上下文和训练系统

目标：能从 token 到 logits 讲完整个 decoder-only Transformer。

必须会讲：

- embedding、RoPE、causal attention、MLP、RMSNorm、residual；
- Q/K/V、MHA、GQA、MQA、MLA；
- KV cache 为什么加速，也为什么吃显存；
- long context 为什么贵；
- MoE 的 total params 和 active params；
- mixed precision；
- activation checkpointing；
- FSDP / ZeRO / tensor parallel / pipeline parallel。

这一周要能把 GLM-5.2 和 DeepSeek-V4 里的长上下文效率读懂。

### 第 3 周：Post-training 与 agentic SWE

目标：能把 SWE 任务讲成训练信号。

必须会讲：

- SFT 和 response masking；
- DPO、PPO、GRPO、RLVR 的区别；
- reward model 与 verifier；
- unit test as reward；
- reward hacking；
- trajectory-level credit assignment；
- environment rollout；
- inference-time scaling；
- SWE-bench resolved rate 和 pass@k。

这一周要精读 IQuest-Coder、SWE-Gym、Agent-RLVR、DeepSWE。

## 6. 一套我想背熟的回答

如果被问：“你的背景主要是软件工程，为什么适合基模组？”

我会这样答：

> 我过去做的是代码模型在真实软件工程场景里的任务侧闭环：仓库级代码理解、执行反馈、工具调用轨迹、verifier、benchmark 和低资源代码建模。现在代码基模的竞争已经从单函数生成走向 repo-level、tool-use、long-horizon agentic engineering，这些能力需要真实任务、可执行环境和可靠反馈信号。我正在补齐模型训练基础，这样可以把我的 SE 经验接到 code model 的 pretraining、post-training 和 agent RL pipeline 里。

如果被问：“你觉得 code agent training 最大难点是什么？”

我会答：

> 不是有没有测试 reward，而是 reward 是否稀疏、是否可靠、是否能归因。SWE agent 的 episode 很长，环境很贵，成功 patch 可能包含很多无关动作。训练系统需要解决任务构造、环境吞吐、trajectory filtering、verifier 质量和执行预算调度。我的 To Run or Not to Run 研究的就是执行反馈的成本收益边界，CodeAnchor 则是降低 repo navigation 探索难度。

如果被问：“长上下文是不是能解决 repo-level coding？”

我会答：

> 长上下文提高了上限，但不会自动解决 repo-level coding。1M context 会带来 KV cache、attention FLOPs、噪声和定位问题。真实代码任务需要把长上下文和结构检索、deterministic anchors、execution feedback、memory compression 结合起来。否则模型只是看到了更多 token，不代表找到了关键证据。

## 7. 必读清单

### 模型报告

| 材料 | 为什么读 | 链接 |
|---|---|---|
| GLM-5 / GLM-5.2 | agentic engineering、1M context、DSA/IndexShare、异步 RL infra | [GitHub](https://github.com/zai-org/GLM-5), [arXiv](https://arxiv.org/abs/2602.15763) |
| DeepSeek-V4 | million-token context、hybrid compressed attention、长上下文经济性 | [PDF](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash/blob/main/DeepSeek_V4.pdf) |
| IQuest-Coder-V1 | code-flow multi-stage training、repo-scale context、agentic trajectories | [arXiv](https://arxiv.org/abs/2603.16733) |
| Qwen3-Coder | 代码 RL、大规模并行环境、agentic coding | [Official Blog](https://qwenlm.github.io/blog/qwen3-coder/) |
| Kimi K2 | MoE、MuonClip、zero loss spike、agentic data synthesis、joint RL | [arXiv](https://arxiv.org/abs/2507.20534) |

### Agentic SWE 训练

| 材料 | 为什么读 | 链接 |
|---|---|---|
| SWE-Gym | 真实 SWE agent 训练环境、verifier、SWE-Bench gains | [arXiv](https://arxiv.org/abs/2412.21139) |
| SWE-smith | 规模化构造 SWE agent 数据 | [arXiv](https://arxiv.org/abs/2504.21798) |
| SWE-Dev | training scaling + inference scaling | [arXiv](https://arxiv.org/abs/2506.07636) |
| Agent-RLVR | agentic environment 中 RLVR 为什么难 | [arXiv](https://arxiv.org/abs/2506.11425) |
| RAGEN | multi-turn agent RL、trajectory-level optimization | [arXiv](https://arxiv.org/abs/2504.20073) |
| DeepSWE | SWE agent RL 工程 recipe、环境 rollout、GRPO++ | [Together AI](https://www.together.ai/blog/deepswe) |

## 8. 结语：补地基，不要丢掉自己的优势

我现在最不该做的是把自己伪装成一个普通 ML 学生，然后从头和别人比谁更懂经典机器学习。我的优势已经很清楚：代码智能体、执行反馈、仓库级任务、verifier、benchmark 和 OpenHarmony 工程场景。

真正需要补的是地基：

- 能讲清模型训练机制；
- 能读懂前沿技术报告；
- 能把 SE 任务翻译成训练信号；
- 能设计小规模 post-training / verifier / agent RL 实验；
- 能在面试里把自己的研究放到 code model training loop 里。

如果这层补牢，我的简历就不是“软工很强但模型薄”，而是：

> 一个已经掌握真实软件工程 agent 问题的人，正在把任务、数据、反馈和 verifier 接入下一代代码基模训练。

这才是最有竞争力的叙事。
