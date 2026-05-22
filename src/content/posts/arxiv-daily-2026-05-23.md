---
title: "arXiv 每日速递 2026-05-23"
date: "2026-05-23"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-23

## 今日总结

今天有 4 篇能直接为 AI Coding Agent 这条线提供"基础设施级"启发的工作。MOSS 把 agent 的"自演化"从 prompt / skill 层下沉到**源码层**，DeltaBox 把 SWE-bench 风格搜索的 sandbox checkpoint/rollback 从秒级压到 14ms，State Distribution 的概念框架把 SFT/RL/Distillation 重新统一在"被监督的状态分布"这个轴上，AMEL 用 75898 次 API 调用实证了 LLM-as-judge 的"上下文极性偏置"。从 runtime 到 evolution，再到 training 与 evaluation，今天像是被精心拼好的 agent stack 半张地图。

> ⚠️ 今日所有论文的 ar5iv HTML 渲染暂未生成（5/21 当天上传，ar5iv 普遍 12-72h 滞后），所有图片站点 307 重定向。本期跳过配图，全部用文字+表格还原。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [MOSS: Self-Evolution through Source-Level Rewriting](http://arxiv.org/abs/2605.22794v1) | agent self-evolution | 把 agent 演化从 text-mutable artifact 下沉到 source-level，OpenClaw 4 任务均分 0.25→0.61 | ⭐⭐⭐ |
| [DeltaBox: Millisecond-Level Sandbox C/R](http://arxiv.org/abs/2605.22781v1) | agent infra | OS 层 DeltaState 抽象，SWE-bench 上 checkpoint 14ms / rollback 5ms | ⭐⭐⭐ |
| [Post-Training is About States, Not Tokens](http://arxiv.org/abs/2605.22731v1) | post-training methodology | 用 state distribution 视角统一 SFT/RL/OPD，OPD 学生超越其退化 SFT 教师 | ⭐⭐⭐ |
| [AMEL: Accumulated Message Effects on LLM Judgments](http://arxiv.org/abs/2605.22714v1) | LLM-as-judge methodology | 75898 calls × 11 models 实证：历史极性使后续判分系统性漂移（d=-0.17），且对**高不确定项**漂移翻倍 | ⭐⭐⭐ |

## 今日主题：把 Agent Stack 当作工程问题，每一层都该被实证审视

今天这 4 篇放在一起，不是巧合，而是一个完整 stack 的 4 个面：**(1) 运行时**（DeltaBox 把 sandbox C/R 当 OS 问题解）、**(2) 演化层**（MOSS 主张 text-mutable artifact 的演化范围根本不够，必须能写自己的源码）、**(3) 训练层**（State Distribution 重新理解 SFT/RL/Distillation 的真正差别）、**(4) 评估层**（AMEL 把"LLM 当评委到底有多脏"按 75898 次 API 调用钉死在桌面上）。

把它们叠起来读，会得到一个有意思的判断：**2026 年的 agent 论文已经在主动祛魅"框架/范式"的论述，转向"我究竟在哪一层做了多少 marginal value"。** MOSS 直接说"text-mutable scope 物理上无法触达 routing/hook ordering/dispatch 这类 bug"，DeltaBox 直接说"existing sandboxes duplicate the entire state, hundreds of ms latency"，AMEL 直接说"scaling helps but does not solve it (Haiku -0.22 → Opus -0.17)"。这是非常对林智灏胃口的写作姿态：**先量化边界，再谈贡献。** 我们自己做 agent marginal value 实证时可以直接 fork 这种叙事 template。

另一个共同点：**4 篇都把"被忽视的层"明确命名出来**——MOSS 命名 "source-level adaptation"、DeltaBox 命名 "DeltaState/DeltaFS/DeltaCR"、State paper 命名 "state distribution"、AMEL 命名 "AMEL"。这其实是一个**写好 SE 论文的微观技巧**：当你的贡献是把一个隐藏维度暴露出来，先给它一个名字，再用一组对比/消融把它的份量量化。这是我们写 Agent Marginal Value 论文时可以直接借的范式。

---

### MOSS: Self-Evolution through Source-Level Rewriting in Autonomous Agent Systems

> **推荐理由**：跟我们 agent marginal value 的研究主线高度重叠。它对 self-evolving agent 现状的批评（"text-mutable scope 撑不起 structural failure"）正好是我们后续做 agent failure mode taxonomy 时可以直接引用的 motivation。

📌 **论文信息**：Qianshu Cai, Yonggang Zhang, Xianzhang Jia, Wei Xue, Jun Song | [arXiv:2605.22794](http://arxiv.org/abs/2605.22794v1) | cs.AI, cs.LG

#### TL;DR
现有 self-evolving agent 都只能改 skill 文件、prompt、memory schema、workflow graph 这些"text-mutable artifact"，但 routing / hook ordering / state invariants 这类核心 bug 存活在源码里，永远改不到。MOSS 让 agent 直接重写自己的源码，在 OpenClaw 上把 4 任务均分从 0.25 拉到 0.61，**一个 cycle、无人介入**。

#### 问题是什么？
作者把 self-evolving agent 一刀切开了一个我之前没看清的分界面：**演化可达性（reachability）**。当前所有 self-evolution 工作（无论是 Reflexion、Voyager、SkillSet、还是各路 workflow-as-DAG 的方案）演化的对象都是**纯文本 artifact**——skill 文件、prompt、memory schema、workflow graph。这个 scope 看上去很广，其实有一类故障是它**物理上不可达**的：

- **Routing bug**：消息到底走哪条 dispatch chain，是在 code 里 if-else 决定的，prompt 改不动它。
- **Hook ordering**：哪些中间件先跑、哪些后跑，是在 harness 的 init 顺序里决定的，skill 文件改不动它。
- **State invariant**：agent 内部的 state machine 校验、不变量检查，是在 method body 里写的，memory schema 改不动它。

作者说："an entire class of structural failure is physically unreachable from the text layer." 这是一个**很硬的诊断**，比"prompt engineering 不够通用"更具体、更可证伪。

#### 他们怎么做的？

**核心 Insight**：把演化粒度从"text artifact"换成"source code"——源码层演化是 Turing-complete 的，是 text-mutable scope 的严格超集，并且生效是确定性的（不像 prompt 改动还要靠 base model 服从），也不受长上下文漂移影响。

具体流程：
1. **失败证据自动批处理**：每一轮演化都锚定在一组自动 curated 的 production failure batch 上（不是 self-imagined task）。
2. **多阶段确定性 pipeline**：MOSS 自己只负责阶段编排和裁决，**真正的代码修改外包给一个可插拔的 coding-agent CLI**——非常聪明的解耦，意味着可以挂任何 SOTA coding agent 上去做底层 implement。
3. **Ephemeral trial worker 验证**：候选 image 在临时 worker 里 replay 同一批失败用例，过了才进入推广。
4. **In-place container swap + health-probe rollback**：推广是 user-consent 门控的，配合 health probe 自动回滚。

**跟之前方法的本质区别**：传统 self-evolution 改的是"agent 表现层的可配置项"，MOSS 改的是"agent 的执行基质本身"。前者像调一个程序的配置文件，后者像让程序自己提 PR。

#### 关键结果

| Setup | Mean Score (4 tasks) |
|-------|---------------------|
| MOSS before evolution | 0.25 |
| MOSS after **single** evolution cycle | **0.61** |

**结果解读**：
- 单 cycle 拉 +0.36 是非常激进的——说明被 evolve 掉的不是某一个小 prompt，而是某个 routing / dispatch 层的核心错误。
- 但这也意味着 base agent 在 OpenClaw 上**确实有大量 structural bug 留在源码里**，这一点反过来是对当前 agent 工程实践的批评。
- 论文没给在更成熟的 SWE-bench / Aider 上的结果，这是一个明显的 baseline gap。

#### 局限性与开放问题

- **OpenClaw 太陌生**：4 任务的均分本身基线 0.25 偏低，意味着初始 agent 留下了大量 trivial 修复空间。要让这个数据有说服力，应该在 SWE-bench Verified 或者 Aider Polyglot 这种已被反复验证的 benchmark 上重做。
- **Coding agent CLI 黑盒**：核心代码修改外包给"a pluggable external coding-agent CLI"，但没说在主实验里用了谁——如果用的是 SOTA 商业 coding agent，那 MOSS 真正的边际贡献需要通过 ablation 拆出来（"换成 weaker CLI 还能涨多少"）。
- **演化的安全边界**：让 agent 改自己的源码是一个很大的攻击面，论文只提到了 health probe rollback，但没讨论防止**恶意自我演化**（如 prompt injection 诱导 agent 修改 dispatch 层暴露 RCE）的机制。

#### 💡 对我们的启发

1. **直接可用的技术点**：MOSS 把 "演化是从哪个 layer 发起的" 单独命名出来当贡献——这正是我们 SWE-bench agent trace 分析想做的"边际价值定位"：每个 agent design action 实际作用在 stack 的哪一层。我们可以在自己的 trace taxonomy 里加上 "Layer of Effect" 这一维（prompt / skill / workflow / source-level），统计公开 trace 里到底有多少修复是因为改对了对应 layer。
2. **具体实验想法（1-2 周）**：拿 OpenHands 和 SWE-agent 在 SWE-bench 上的公开 trace，对每个失败 trajectory 标注"如果 agent 改的不是 prompt 而是 harness 的某行代码会不会修好"。这个标注可以用静态分析 + LLM-as-classifier 半自动化做。预期发现：相当一部分 routing-level failure 是 text-mutable scope 永远修不掉的，这就是 MOSS 论点的可证伪 evidence。
3. **研究趋势判断**：从 MOSS 开始，agent 的"自治范围"会再扩一档——下一个研究热点会是 **"agent 修改自己的 sandbox 配置"** 和 **"agent 修改自己的训练数据流水线"**。这两件事对 program repair 研究都意味着新的研究问题：agent 改 harness 源码本身就是一个 program repair 任务，但是**带有 self-referential 风险**。

---

### DeltaBox: Scaling Stateful AI Agents with Millisecond-Level Sandbox Checkpoint/Rollback

> **推荐理由**：直接面向 SWE-bench 评测场景的 agent runtime。我们之前在做 agent trace 分析时低估了 sandbox C/R 的开销，这篇把它从秒级压到 14ms，对 test-time tree search / RL training 的算力账本是一次重新洗牌。

📌 **论文信息**：Yunpeng Dong, Jingkai He, Yuze Hou, Dong Du, Zhonghu Xu | [arXiv:2605.22781](http://arxiv.org/abs/2605.22781v1) | cs.OS, cs.AI

#### TL;DR
LLM agent 做 tree search 或 RL 时要不停 checkpoint/rollback 整个 sandbox（文件系统 + 进程状态），现有方案要复制全量状态，单次延迟数百毫秒到秒级。DeltaBox 在 OS 层引入 DeltaState 抽象，**只复制相邻 checkpoint 间的 delta**，把 checkpoint 压到 14ms、rollback 压到 5ms。

#### 问题是什么？
test-time 树搜索（包括 SWE-bench 上越来越流行的 best-of-N + verify pipeline）和 agent RL training 都需要 agent 频繁回退到分支点重新 explore。但回退要么靠"replay 整条 trajectory"——慢且非确定，要么靠"复制整个 sandbox"——前者实操不可行，后者每次几百毫秒到几秒。

为什么搞不定？**现有 sandbox C/R 把 sandbox 当成黑盒**，每次都是全量 dump 全量 restore。问题是 agent 的相邻 checkpoint 之间真正变化的状态其实非常少——可能就改了几个文件、几行内存。但 OS 没有把"只 dump delta"作为 first-class 操作暴露出来，所以应用层只能复用整体快照机制。

#### 他们怎么做的？

**核心 Insight**：subsequent checkpoint 之间 99% 状态是不变的，把 C/R 重新定义成 **change-based transactional operation**，而不是 full duplication。

具体方法：
1. **DeltaFS（文件系统侧）**：把文件状态组织成 layered overlay。Checkpoint 时把当前 writable layer 冻结，再插一个新的可写 layer。所有文件更新降级成 copy-on-write，rollback 就是简单的 layer 切换。
2. **DeltaCR（进程状态侧）**：进程状态用 incremental dump，rollback 直接 `fork()` 一个冷冻的 template 进程，绕过传统 CRIU 风格的恢复 pipeline。
3. **整合**：上面两件事被封装在一个新的 OS-level abstraction "DeltaState" 之下，对 agent runtime 暴露简单的 checkpoint() / rollback() 接口。

**跟之前方法的本质区别**：传统方案是"在应用层模拟事务"，DeltaBox 是"让 OS 原生提供事务"。这是把一个**长期被 agent 框架层错误背锅的性能问题**还给 OS 层去解。

#### 关键结果

| 指标 | DeltaBox | 传统全量 C/R | 提升倍数 |
|------|---------|-------------|---------|
| Checkpoint latency | **14ms** | 数百 ms ~ 数 s | ~10x – 100x |
| Rollback latency | **5ms** | 数百 ms ~ 数 s | ~50x – 200x |

**结果解读**：
- 14ms 这个数字意味着在固定时间预算下，agent 能 explore 的节点数多一到两个数量级——对 best-of-N 类 pipeline 是直接的算力多产。
- 没看到论文给出 SWE-bench 端到端 pass@1 的对比（"more nodes explored" → "更高 pass rate" 不是线性映射），这一步需要 follow-up 实验。

#### 局限性与开放问题

- **生态绑定**：DeltaFS/DeltaCR 需要 kernel 层改动或 LSM 配合，OS-level abstraction 的部署门槛比应用层方案高很多。论文没讨论用户态实现的可行性（比如基于 FUSE + criu 的退化版本能不能也拿到大头收益）。
- **内存语义边界**：incremental dump 只能 capture 已经 commit 到 mmap / heap 的状态，对**纯进程内 in-memory cache**（比如 LLM 客户端的连接池）行为是否安全没说。
- **agent 自身代码不应该 mutable**：DeltaBox 假设 sandbox 内部跑的是"工作 process"，但 MOSS 那篇要让 agent 改自己源码——这两个工作放一起会出现"sandbox 的可执行代码本身也是被频繁 checkpoint 的对象"，是否会引入额外开销值得探索。

#### 💡 对我们的启发

1. **直接可用的技术点**：我们做 agent trace 分析时一直默认 "agent 重跑同一 task 的 cost 主要来自 LLM token"——DeltaBox 提醒我们另一个隐藏成本是 **sandbox setup**。在做 marginal value 量化时（比如评估 "tangled patch splitting" 这个 action 是否值得保留），如果 sandbox C/R 占用了实验时间的相当比例，量化结论会被掩盖。我们应该把 sandbox C/R cost 作为单独的一项 marginal cost 来记账。
2. **具体实验想法**：拿一个公开 SWE-bench agent trace（OpenHands），手动算每条 trace 上花在 sandbox setup vs LLM inference 的时间分布。如果 sandbox 是显著 bottleneck，跑一遍 DeltaBox 风格的 C/R 看 pass@k 在固定时间预算下能涨多少。预期：在 best-of-32 这种 setup 下 pass@1 涨幅大于 1-2pp。
3. **研究趋势判断**：agent infra 在 2026 年开始走"OS 化"——把 agent 当成 OS 上的一类新型工作负载来设计原生抽象。这意味着我们做 ArkTS / HarmonyOS 工具链时，**应该开始考虑 agent runtime 这一类负载在 HarmonyOS 上的原生支持**，这是一条潜在的差异化研究线。

---

### Post-Training is About States, Not Tokens: A State Distribution View of SFT, RL, and On-Policy Distillation

> **推荐理由**：这是今天最理论但最有方法论价值的一篇。它给"SFT vs RL vs on-policy distillation"提供了一个统一的 lens——**training 的差别不是 loss 形式，而是被监督的 state 分布**。我们做 small/local code LLM 微调时，可以直接借这个 lens 重新审视 fine-tuning protocol。

📌 **论文信息**：Dong Nie | [arXiv:2605.22731](http://arxiv.org/abs/2605.22731v1) | cs.LG, cs.AI

#### TL;DR
我们一直把 SFT、RL、distillation 的差别讲在 loss function 上（MLE vs policy gradient vs forward/reverse KL）。这篇论文论证：**真正决定行为的不是 loss，而是这些 loss 作用在哪些 state（prompt + 已生成 prefix）上**。SFT 在固定 dataset state 上学，RL 和 on-policy distillation 在 learner 当前诱导的 state 上学。通过 Qwen3-0.6B 在 GSM8K 上的小规模对照，得到 3 个反直觉的现象。

#### 问题是什么？
post-training 的对比通常是这样的："SFT 容易过拟合、RL 难训练、distillation 介于两者之间"——但这种描述把所有原因都归在了**目标函数形式**上。结果是 ablation 经常做不出干净的因果：你把 forward KL 换成 reverse KL，性能确实变了，但变化里到底有多少是 loss 形式贡献的、有多少是因为换了 loss 顺带也换了**被监督的 state distribution**？没人拆得开。

作者主张这个混淆是真问题：autoregressive policy 下"state = prompt + generated prefix"，**SFT 永远只看 dataset 给的 state，RL 和 OPD 看 learner 自己生成出来的 state**——这是结构性的差别，不是 loss 形式差别。

#### 他们怎么做的？

**核心 Insight**：把 post-training reformulate 成 **state-distribution shaping**——监督的强度、方向、loss 形式都是 second-order 选择，第一序的设计选择是"我们要在哪个 state 分布上撒监督信号"。

实验设计：在 Qwen3-0.6B-Base 上跑 GSM8K，用 TruthfulQA 和 MMLU 做 retention evaluation，对照：

1. **Mild SFT**：温和的 SFT，看 GSM8K 提升 vs forgetting。
2. **Stress SFT**：高强度 SFT，看 forgetting 是否爆发。
3. **OPD from degraded SFT teacher**：让 OPD 学生**用一个被 SFT 跑坏的 teacher 做唯一监督源**，看学生能不能反超 teacher。
4. **Lightweight on-policy RL**：轻量 RL，看 retention 是否保住。

**跟之前方法的本质区别**：传统视角是"SFT/RL/Distillation 是不同的范式"，State view 是"它们是同一件事——shaping state distribution——的不同实现"。

#### 关键结果

| Setup | GSM8K | TruthfulQA / MMLU 保持 |
|-------|-------|----------------------|
| Mild SFT | 提升 | 保持良好 |
| Stress SFT | 提升 | 显著遗忘 |
| OPD（基于退化 teacher） | **超越** teacher | 同时**改善** TruthfulQA + MMLU |
| Lightweight on-policy RL | 提升 | 几乎不遗忘 |

**结果解读**：
- 第三行是最反直觉的：**学生用一个被 SFT 跑坏的 teacher 做唯一监督源，反而在 teacher 已经掉分的 retention metric 上变好了**。作者的解释是：OPD 的监督发生在**学生自己生成的 state**上，teacher 的退化不会传染所有 state，只会在它已经偏差的 state 上传染。on-policy 的 state distribution 起到了一个"隐式过滤器"的作用。
- 第四行印证了 on-policy 的 retention friendliness——RL 不容易 forgetting，不是因为 reward signal 神奇，而是因为它**没有把监督强加在 learner 不会经过的 state 上**。

#### 局限性与开放问题

- **规模太小**：Qwen3-0.6B 是 sanity check 规模。OPD 在 6B / 13B 规模下、面对更复杂的 teacher（多目标 reward model）时是否还能拿到这种"OPD 超越退化 teacher" 的现象，需要复现。
- **state distribution 还没被量化**：作者论证 state 是 first-order 因素，但没有给出"两个 protocol 的 state distribution 差异度"的 metric。如果有了这种 metric，可以做更干净的归因。
- **只在 GSM8K 上验证**：代码生成、tool use 这些 stateful 任务上 state distribution 的设计选择空间更大，但论文没涉及。

#### 💡 对我们的启发

1. **直接可用的技术点**：我们做 small/local code LLM（DeepSeek-Coder / Qwen-Coder 7B-14B）做特定任务 fine-tuning 时，应该把 state distribution 当成一个**显式的设计变量**而不是默认副产品。具体来说：当我们 SFT 一个 patch generation 模型时，dataset 给的 state 是"完整 buggy file + cursor"，但 inference 时 agent 实际经过的 state 包括"agent 自己的部分 patch 中间状态"——这两个 distribution 的 mismatch 可能是我们模型在 agent loop 里掉点的关键原因。
2. **具体实验想法**：在 SWE-bench Lite 上，对同一个 base model，分别用 (A) 静态 patch dataset SFT、(B) on-policy distillation from teacher、(C) static SFT + 少量 on-policy reweight 三种方案做对比，**测的不只是 pass@1，还要测 retention（HumanEval / MBPP 上的退化）**。预期：on-policy variant 在 agent loop 中提升更大且 retention 不掉。这是一个比 1-2 周稍久的实验，但是非常 publishable 的 ablation。
3. **研究趋势判断**：2026 年开始 post-training 的方法论会进入"二阶维度"——大家不再争"哪个 loss 更好"，而是争"在哪个 state 分布上撒 loss 更好"。这是一个对**实证派研究者非常友好的趋势**：因为它把方法对比的复杂度还原到了"distribution 怎么构造"这种可以被实验直接量化的层面。

---

### AMEL: Accumulated Message Effects on LLM Judgments

> **推荐理由**：直接打到我们做 evaluation methodology / LLM-as-judge 的方法论痛点。75898 次 API 调用 × 11 个模型 × 4 个 provider 的实证规模，结论非常可移植——而且给的"fresh context per item" 修复建议我们立刻就能用上。

📌 **论文信息**：Sid-ali Temkit | [arXiv:2605.22714](http://arxiv.org/abs/2605.22714v1) | cs.AI, cs.CL, cs.LG

#### TL;DR
你拿 LLM 当 batch 评委时，对话历史里前几条判分的极性（偏积极还是偏消极）会**系统性地**漂移之后的判分。75898 次 API 调用、11 个模型的实证：负面历史比正面历史造成的偏置大 1.62 倍，并且在模型"原本就不确定"的 item 上偏置翻倍。Scaling 能减半但消不掉，position 不重要（前 5 条和后 50 条效果一样）。**最简单的修复就是每个 item 一个 fresh context**。

#### 问题是什么？
我们以及任何做 SE evaluation 的人，都越来越多地把 LLM 当批量评委用——review code、给 patch 打分、给 agent trace 评等级。一个非常常见的实操是：**为了省 token，把多个 item 串在同一段对话里**。这种做法的隐性假设是 "判分是 stateless 的，前面打了什么分不影响后面"。

但这个假设从来没人系统验证过。AMEL 直接把它放在显微镜下：如果前面塞了一连串积极评价的历史，那么对同一个测试 item，新加进去的判分会不会偏积极？反之亦然。

#### 他们怎么做的？

**核心 Insight**：把"polarity contamination"当成一个可以被实验量化的偏置项 d，跑大规模 paired test（同一个 item 分别放在 isolation / positive-history / negative-history 三种 context 下）。

具体方法：
1. **构造 paired test**：同一组 item，独立呈现 vs 接在 positive-saturated history 后 vs 接在 negative-saturated history 后。
2. **大规模 sweep**：11 个模型（OpenAI 4 个、Anthropic 几个、Google Gemini、4 个开源），总共 75898 次 API call。
3. **拆解机制**：进一步测 baseline entropy 影响（high-entropy item 是否漂移更大）、context length 影响（5 turn vs 50 turn）、positivity-negativity 不对称、token-level vs semantic-level 拆解。

**跟之前方法的本质区别**：之前 LLM-as-judge bias 大多在测 "position bias"（哪个候选放在前面）或 "verbosity bias"（哪个候选更长），AMEL 测的是**评委对话历史本身的极性**——是一个被忽视的、与 batch evaluation 紧密耦合的偏置维度。

#### 关键结果

| 现象 | 数值 |
|------|------|
| Overall AMEL effect size | d = **-0.17**, p < 10⁻⁴⁶ |
| 高不确定项（high-entropy baseline） | d = **-0.34**（偏置翻倍）|
| 低不确定项（deterministic baseline） | d = -0.15 |
| 负面 vs 正面历史不对称 | 负面诱导 **1.62×** 偏置（p < 10⁻³⁹）|
| 5-turn 历史 vs 50-turn 历史 | 偏置**相同**（context length 不重要）|
| Anthropic Haiku → Opus | d 从 -0.22 改善到 -0.17（scaling 不解决）|
| OpenAI Nano → GPT-5.2 | d 从 -0.34 改善到 -0.17 |

**结果解读**：
- "5 turn 和 50 turn 效果一样"是非常强的现象——说明这不是常规的 long-context degradation，而是一种结构性的 polarity contagion。
- "高不确定 item 上偏置翻倍" 是对我们最痛的：评估 agent trace 时，最需要 LLM judge 帮忙的恰好就是那些边界 case；而正是这些 case，AMEL 偏置最大。
- "scaling 不消除" 直接打死了"我用更大的 model 当 judge 就稳"这个朴素信念。

#### 局限性与开放问题

- **只测了"打分"任务**，没测 "ranking / pairwise compare"。我们 SE 评估更多用 pairwise（McNemar / Gwet AC1），AMEL 的偏置在 pairwise 下的具体表现是 open question。
- **没给 mitigation 的方法学评估**：作者只给了"fresh context per item" 这种偏极端的建议。在我们 reality 里，每条都开新 context 成本太高，"balanced batching" 到底要怎么 balance 才有效，论文没给方法 prescription。
- **未对齐 SE evaluation 实践**：作者 prompt 是 "evaluate / moderate / score" 的 generic 形式。在 SE 场景里，judge 会同时看 patch + test result + commit message，输入更结构化，AMEL 效应可能不同。

#### 💡 对我们的启发

1. **直接可用的技术点**：我们以前的所有 LLM-as-judge 实验（包括 SWE-bench agent trace 标注、benchmark 合理性的 LLM 评估），**默认都用了 batch context**——立刻要复盘是否需要改成 per-item fresh context，或至少做一个 sanity check（同一批 item 用 fresh vs batched 各跑一次，看 Gwet AC1 一致性）。这个 cost 不高，结果可能非常打脸。
2. **具体实验想法（1 周内）**：在我们已有的 agent marginal value 实证数据集上，取一个 LLM judge 评分子集，重新用 fresh-context-per-item 跑一遍。比较：(A) 整体分数分布是否漂移，(B) 与人类裁决的 Cohen κ 是否提升，(C) 高不确定项（人类裁决一致性低的）漂移最大与否（呼应 AMEL 的 high-entropy 发现）。这个实验**直接可以做成我们论文的一节** "evaluation methodology robustness check"。
3. **研究趋势判断**：LLM-as-judge 的 method paper 在 2026 年大概率会爆——AMEL 是其中一个早期信号。我们如果想抢这个 niche，可以从 **SE 评估 specific 的 judge bias taxonomy** 角度切入（patch 评分的 verbosity bias、test result presence bias、commit message tone bias 等）。这类工作的 benchmark / dataset 投入成本不高，但方法论冲击力可以做得很大。

---

## 方法对比

> 4 篇里 MOSS 和 DeltaBox 都属于 "agent stack 基础设施"，并且互相是邻居——一个解 "agent 能改什么"，一个解 "agent 改之前怎么便宜地试错"。值得拉出来横评。

| 维度 | MOSS | DeltaBox |
|------|------|----------|
| 解决层 | agent 演化范围（source code level） | agent 运行时（OS-level sandbox C/R） |
| 核心抽象 | source-level self-rewrite + ephemeral trial workers | DeltaState（DeltaFS + DeltaCR） |
| 关键 KPI | OpenClaw 4-task 均分 0.25→0.61 | checkpoint 14ms / rollback 5ms |
| 与 SWE-bench 关联 | 间接（OpenClaw 是新 benchmark） | 直接（在 SWE-bench 上 benchmark）|
| 部署成本 | 中（需要 trial worker + 自动批 failure curation）| 高（需要 OS-level mechanism）|
| 适用场景 | structural bug 占比高的 production agent | 高频 tree search / RL training |
| 主要局限 | OpenClaw 太陌生，coding agent CLI 黑盒 | OS 改动门槛高，端到端 pass rate 未验证 |
| 写作风格 | 强论证 + 概念命名（"text-mutable scope"） | 强工程数据 + OS 抽象命名（"DeltaState"） |

两篇的共同写作 pattern——**"先命名一个被忽视的层 + 给出该层的可测 KPI"**——是我们近期在写 ArkTS phantom rendering 那篇时也用了的模板。今天再次被验证为 2026 年 AI infra 论文的主流叙事范式。
