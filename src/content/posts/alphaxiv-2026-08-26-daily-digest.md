---
title: "从完成声明到证据责任：8 月 26 日 arXiv 的 Agent 可操作性、局部信用与可演化 Harness"
date: "2026-08-27"
description: "8 月 26 日的新论文把可靠 Agent 与 post-training 的重点推进到可重放证据、任务自适应 reward、局部信用和受验证的外部状态演化。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Post-Training", "RLHF", "RLVR", "软件演化", "程序修复"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-slate-950 via-cyan-950 to-amber-950"
---

2026 年 8 月 26 日这一批论文最值得读的地方，不是又出现了更多 Agent，而是“系统凭什么说自己做对了”开始被拆成可检查对象。coding-agent 线从仓库迁移、FPGA、Modelica、Android 一直走到发布 attestation：完成声明必须绑定候选、配置、工具状态和可重放证据。post-training 线则在修正同一个抽象错误——把整条轨迹的 outcome 平均广播到所有 token、步骤、工具与数据样本。两条线并不需要强行合并，但共同否定了只看最终成功率的评测方式。

本轮逐类核对 arXiv 官方 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG，并补充 cs.IR、cs.CV、cs.CR、cs.OS 的 `pastweek` 页面，九类页面均定位到 **Wed, 26 Aug 2026**。合并 New 与 Cross submissions 后得到 **500 篇唯一条目**，最终纳入 **94 篇实质相关或值得明确排除的论文**：coding-agent / software-change 52 篇，post-training 54 篇，其中 12 篇同时属于两条主线。29 篇强相关论文全部从 `https://arxiv.org/pdf/<id>` 下载，完成 `%PDF`、大于 20KB、`pdftotext -layout` 与首页渲染检查；45 篇中相关和 20 篇可留意项以官方摘要、元数据与必要的全文定位筛选。

## 今日脉络

第一条脉络是 **完成状态正在从一句话变成证据协议**。ECT 要求 claim receipt 与 closed replay，AFT-Bench 区分 callable 和 operable，FPGAgent 把 HLS 验证推进到真实板卡，Pufibara 把 simulation evidence 绑定到产生它的候选。共同判断是：一次调用返回成功、程序能编译或 Agent 说“done”，都不是足够的外部状态证明。

第二条脉络是 **credit assignment 必须对齐负责的工程单元**。STEP-KTODER 把 step 落到函数，Ockhamareto 落到单个测试块，CBPO 落到相同 prefix 后的局部决定，IAPO 落到多轮 influence graph。它们并非只追求更密的 reward，而是试图避免把正确部分一起惩罚、把无关步骤一起奖励。

第三条脉络是 **reward 本身必须被当作待审计系统**。RobustTests 从近正确错误代码构造诊断测试，AdaptRubric 为每个 GUI 任务重建判定标准，FARCA 给事实标签估计可靠性，RecurSE 甚至规定自我训练何时必须停止。更强的 optimizer 无法修复坏 rubric、坏 test 或会自我欺骗的 judge。

第四条脉络是 **权重之外的状态也在演化**。StarHarness 演化接口与 skills，SkillForge 持续验证技能，Recuris 把 working memory 和 experiential memory 耦合，CAFE 让 critic 追随 policy 的失败分布。可靠 Agent 的能力越来越像一个版本化系统属性，而不是模型 checkpoint 的单独分数。

## 强相关论文深读

### 1. From Traceability to Justifiability: Accountability Structures in Agentic Software Engineering

**论文信息**：*From Traceability to Justifiability: Accountability Structures in Agentic Software Engineering*；Azarang, Rashid；[arXiv:2608.23610](https://arxiv.org/abs/2608.23610)；Software Engineering (cs.SE)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：Agent 系统的发布记录往往能说明“部署了某个版本”，却不能证明“被评测的模型、提示、工具、检索与运行配置就是被部署的那一套”。

**为什么值得推荐、方法怎么工作**：这篇论文值得推荐，因为它把泛泛的 accountability 变成可否拒绝发布的结构性问题。作者先定义从 traceability、verifiability 到 justifiability 的 assurance ladder，再对 20 个 CI/CD 平台和 27 个模型服务或 Agent 平台做双轮文档审计，所有页面都按日期与内容哈希固定；随后从 30 个公开仓库的发布 exhaust 计算实际 assurance depth，并与工作流宣称的深度对照。Figure 1 统计默认记录能表达什么，Figure 2 则把每个仓库的声明与可验证实现画成有方向的落差。

**关键实验、局限与当天主题**：结果很尖锐：47 个平台中没有一个默认记录会为“模型版本、instructions、tools、retrieval、runtime”这个行为元组生成 content-addressed identity；27 个 Agent 平台里已有 16 个把不可变版本号当默认答案，却仍可能指向可变内容。30 个仓库中，15 个采用 attestation tooling，7 个只发布源码，导致声明的绑定在发布位置根本不可检查；可测的 7 个里有 5 个端到端成立。局限是调查来自公开文档与冻结样本，会随平台快速演化，而且“可证明同一性”不等于行为本身正确。它为当天主线提供了发布级结论：Agent 可靠性必须绑定完整行为配置，而不是只给模型或容器一个版本号。

### 2. Identifying Latent Declarative Representations of Code for Assisting Repository Migration

**论文信息**：*Identifying Latent Declarative Representations of Code for Assisting Repository Migration*；Surana, Shraddha, Srinivasan, Ashwin, Bain, Michael；[arXiv:2608.23619](https://arxiv.org/abs/2608.23619)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：ADFD-Migrate 用可检查的 annotated data-flow diagram 作为语义瓶颈，把百万行级 Fortran 仓库迁移从逐文件翻译改成“恢复计算意图—按依赖生成—对照结构与行为修复”。

**为什么值得推荐、方法怎么工作**：仓库迁移的难点不是语法替换，而是遗留代码把领域知识埋在控制流、数据存储与外部交互中。流程有三步：静态分析先生成 source profile，LLM 再推断包含 process、data store、external entity、flow 与 behavioral contract 的 ADFD；dependency-aware chunking 按过程依赖排序生成 Python；最后从目标代码恢复 target ADFD，与源图的差异驱动再生成。Figure 1 清楚展示两个诊断闭环：源 ADFD 先接受覆盖检查，目标代码再接受结构差异与行为 oracle 检查。

**关键实验、局限与当天主题**：f2x50 覆盖 50 个 Fortran 仓库，规模从 1.5K 到 1.6M LoC。382 个策划的 source-oracle probe 中，迁移结果通过 327 个（85.6%），40 个仓库通过全部已尝试 probe；更重要的是，方法把 382 个行为都暴露成可运行目标，而 direct 和 repository-context translation 只有 99、98 个，两个消融更低至 69、30 个。平均 migration outcome index 为 93.1%，在 47 个可比仓库上领先 direct 17–59 个百分点。风险是 oracle 只有 382 个、部分由作者策划，Fortran→Python 不能代表 UI、并发或平台 API 迁移，复合 outcome index 也会掩盖单项失败。但它证明了 inspectable semantic bottleneck 对仓库级迁移确有独立价值。

### 3. When May an Agent Stop? Evidence-Carrying Termination for Tool-Using LLMs

**论文信息**：*When May an Agent Stop? Evidence-Carrying Termination for Tool-Using LLMs*；Liu, Jason；[arXiv:2608.23623](https://arxiv.org/abs/2608.23623)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：Evidence-Carrying Termination 要求 Agent 在宣布 COMPLETE 前，为每个答案 claim 提供作用域内 receipt，并让确定性 replay 重建该值，从协议上阻止“看起来做完了”的提前终止。

**为什么值得推荐、方法怎么工作**：停止决策是工具 Agent 最容易被自然语言 critic 模糊处理的边界。ECT 把任务 contract、typed claim、trace receipt、scope check 与 closed replay 组成证书：第一步枚举回答必须覆盖的 slots；第二步检查每个 slot 是否绑定到有效、未越权且仍在作用域内的 trace；第三步重放声明的变换，只有所有 verifier 通过才允许 COMPLETE，否则继续、恢复或安全退出。Figure 1 是完整 gate，Table 1 列出 response loss、stale state、missing receipt 等八类受控 fault。

**关键实验、局限与当天主题**：锁定的静态研究中，48 个合成任务×6 类工具×8 fault 下，ECT 出现 0/288 次不安全完成，所检查的 termination-critic core 为 252/288。新的 576-trajectory 研究里，22 个 held-out cluster 上 ECT 为 0/66 premature unsupported termination，faithful controller 为 40/66；supported completion 是 97/132 对 92/132，并满足预设的 -10 点 non-inferiority margin。限制同样明确：任务是合成世界，contract 或 adapter 自己可能撒谎，closed transform 不覆盖任意语义推理，也不证明外部事实或总体安全。它的价值是给“完成”一个可审计的证据边界。

### 4. Callability Is Not Operability: Controlled Interface Interventions for LLM Agents

**论文信息**：*Callability Is Not Operability: Controlled Interface Interventions for LLM Agents*；Wang, Zihao；[arXiv:2608.23628](https://arxiv.org/abs/2608.23628)；Software Engineering (cs.SE)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：AFT-Bench 证明工具“可调用”远不等于 Agent “可继续安全操作”：丢失响应、提交未知或状态过期时，接口必须暴露生命周期、effect semantics 与 postcondition evidence。

**为什么值得推荐、方法怎么工作**：论文把 operability 定义为一个向量，而不是单一成功率：capability recall、recovery、effect safety、outcome verification 与 context cost 分开测量。实验把 task、backend、初始状态、fault、controller 与模型全部固定，只改变接口 treatment，因而能把效果归因给 selective discovery、resumable invocation、observable execution、structured output、idempotency/guarded write、durable recovery 和 postcondition verification。Figure 1 用两个底层历史产生同一可见 observation、却要求互斥安全动作的例子定义 operational ambiguity；Table 2 是配对机制比较。

**关键实验、局限与当天主题**：论文的关键不是某个综合分，而是多组机制级因果对照：选择性发现把大工具目录的上下文暴露压缩到任务相关能力；durable invocation state 能在进程状态丢失后继续同一逻辑调用；idempotency 与 guarded mutation 防止 response-loss 后重复外部效果；postcondition verification 能推翻错误的成功报告。作者还在持久 SQLite 环境复验 effect-safety。边界是 benchmark 仍是受控接口世界，真实 SaaS 的隐式副作用、授权漂移与跨系统事务更复杂，向量也需要部署者自己设权重。它把可靠 Agent 的问题从 prompt 技巧推进到 API 语义设计。

### 5. FPGAgent: An LLM-Assisted Framework for Autonomous HLS Code Generation and Verification in FPGA Environments

**论文信息**：*FPGAgent: An LLM-Assisted Framework for Autonomous HLS Code Generation and Verification in FPGA Environments*；Wang, Tianyu, Wang, Wenjie, Yao, Jianguo, Guan, Haibing, Li, Xijun；[arXiv:2608.23630](https://arxiv.org/abs/2608.23630)；Software Engineering (cs.SE)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：FPGAgent 把 HLS 代码生成一直验证到真实 FPGA board：能 simulation、能 synthesis 仍不够，place-and-route 与设备执行才是最终 oracle。

**为什么值得推荐、方法怎么工作**：方法面向一条长工具链建立三段闭环。首先，domain knowledge 与 evolutionary search 生成并优化 HLS kernel，编译日志反向指导多个候选方向；其次，Functional Reflection 自动生成 C++ validation program 和测试，Debug Assistant 定位功能错误并让 coder 修复；最后生成 host code，完成 Vitis 编译、链接、bitstream 与板级运行。Figure 2 连接 kernel implementation、functional reflection 和 host/board execution，Figure 3 展示测试生成、错误分析与 targeted repair。

**关键实验、局限与当天主题**：HLS-Eval 含 78 个跨领域任务，实验覆盖 5 个模型。相对 zero-shot，FPGAgent 平均提升 synthesizable rate 16.9 点、executability 26.7 点、functional correctness 30.6 点；Table 1 中 Gemini 3.1 Pro 的最终功能正确率达到 92.3%。这组结果揭示 simulation/synthesis 与部署可执行性之间的真实断层。局限是设备与工具链集中于特定 FPGA/Vitis 环境，pass@10 与进化搜索成本较高，板上可运行也未充分等价于时序、功耗或长期稳定性最优。它代表当天 coding-agent 线最硬的一类证据：复杂构建链必须走到硬件行为层。

### 6. Function-Level Execution Feedback for Code Preference Optimization

**论文信息**：*Function-Level Execution Feedback for Code Preference Optimization*；Nechnech, Idris, Kim, Sehwan, Seo, Jimin, Kim, Yeongoon, Oh, Minhae, Hong, Sangwoo, Lee, Jungwoo；[arXiv:2608.23632](https://arxiv.org/abs/2608.23632)；Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：STEP-KTODER 把代码 process supervision 的“step”定义为模块函数，并用自动生成的函数级测试标注局部正确性，避免 outcome failure 把整段程序都判坏。

**为什么值得推荐、方法怎么工作**：数学推理天然有步骤，代码却可以按行、状态、函数或测试事件切分。该框架先把参考解分解成多函数程序并为每个函数生成 local test；再从当前模型采样候选，分别得到函数标签与整程序 outcome；最后以 stepwise KTO 加 outcome KTO 联合训练，缺乏可信局部测试的函数通过 reliability mask 排除。Figure 1 给出数据管线与目标，Figure 2 的反例尤其重要：只有最后一函数错误时，outcome-only KTO 会惩罚所有正确函数，而 STEP-KTODER 只把负信号落到故障段。

**关键实验、局限与当天主题**：论文在 HumanEval(+)、MBPP(+)、BigCodeBench 与 LiveCodeBench 上一致超过 outcome-only KTO 和 DPO，并报告大多数问题具有接近完整的 validated-test availability。更有判断力的负结果是：LLM-as-a-judge 系统性过度预测函数失败，破坏正 step label，随后 preference optimization 反而退化。局限是程序被重写成可分解多函数结构，自动 local test 可能继承参考解偏差，且这些基准仍远小于真实仓库的跨文件状态。它直接支撑当天 post-training 主题：信用粒度必须与可执行程序单元对齐。

### 7. ToolRobustBench: Stage-Wise Perturbation Evaluation and Failure Diagnosis for Tool-Calling Agents

**论文信息**：*ToolRobustBench: Stage-Wise Perturbation Evaluation and Failure Diagnosis for Tool-Calling Agents*；Zheng, YiShan, Wu, Yuan, Chang, Yi；[arXiv:2608.23635](https://arxiv.org/abs/2608.23635)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：ToolRobustBench 不再只报告工具调用最终成功率，而按 interface、intent、observation 与 runtime 四类扰动定位故障最早发生在哪一阶段。

**为什么值得推荐、方法怎么工作**：作者把一次工具调用拆成 tool selection、schema grounding、argument binding、output/runtime handling 与 end-to-end success 五级，并为每级设计确定性 perturbation。第一步从 16 个本地工具构造可执行 anchor；第二步分别注入工具描述、用户意图、返回观察和运行环境扰动；第三步再混合两类扰动，检查 cascade 是否能由单项结果相加解释。Figure 1 把四个 family 对齐到调用管线，Table 3 则保存 earliest-failure attribution，而非只给一个最终分。

**关键实验、局限与当天主题**：主实验包含 15,456 个单 family 实例、7 个模型、14 个 subtype。清洁条件下表现虽高，但 observation/output 扰动成为最主要瓶颈；mixed-family 还出现显著非加性，说明单一 robustness 排名不能预测组合故障。优势是执行器确定、阶段标签可复查；不足是工具集合小而本地化，单次调用不能覆盖长事务、授权与恢复，扰动发生率也不是现实 prevalence。它值得推荐，因为可靠性分析终于能回答“失败从哪里开始并怎样扩散”，而不只是“最后没做成”。

### 8. Beyond Executable Models: The Pufibara Agent Harness and the Modelica Agent Workflow Benchmark for Physical System Modeling

**论文信息**：*Beyond Executable Models: The Pufibara Agent Harness and the Modelica Agent Workflow Benchmark for Physical System Modeling*；Wang, Zizhe；[arXiv:2608.23653](https://arxiv.org/abs/2608.23653)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：Pufibara 把 simulation evidence 与产生它的具体候选绑定，持续保存工程状态，防止 Agent 在多轮 Modelica 修改中拿旧结果证明新代码。

**为什么值得推荐、方法怎么工作**：物理系统代码可能 compile、simulate，却仍违反物理约束。Pufibara 因而把 Agent Runtime、Persistent Engineering State 与 Transparent Execution Plane 分开：候选每次修改都有身份；model checking 和 simulation 结果按候选记录；修复、生成、调参的 requirements 持久保存；submission 必须成为显式动作，再交由 benchmark-owned evaluator 独立评分。Figure 1 的虚线边界显示 evaluator 不在 Agent loop 内，Table 1 将 232 个任务拆成 132 repair、50 generation、50 tuning。

**关键实验、局限与当天主题**：在相同模型 backend 下，Pufibara 用 DeepSeek v4 Flash 通过 202/232，Claude Code 为 185；用 Claude Sonnet 5 时仍是 202 对 187。按仓库报告口径，logical token 少 76.4%–82.5%，顺序运行时间低 6.1%–58.4%。可信点是 harness 对照时固定模型，并由外部 evaluator 重算证据；限制是 Modelica/benchmark-owned oracle 仍是封闭域，token accounting 口径可能不完全等价，也未比较更多通用 harness。它说明模型不变时，候选身份、证据版本与提交语义本身就能改变成功率。

### 9. Are Android GUI Agents Robust Against Runtime Anomalies? AnTrap: Evaluating Agents in Dynamic Adversarial Environments

**论文信息**：*Are Android GUI Agents Robust Against Runtime Anomalies? AnTrap: Evaluating Agents in Dynamic Adversarial Environments*；Gan, Guo, Zhao, Yilun, Chen, Cong, Wei, Jinbiao, Song, Tingyu, Yang, Zheyuan, Fu, Lin, Zhou, Hong；[arXiv:2608.24099](https://arxiv.org/abs/2608.24099)；Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：AnTrap 用可保持任务可解的动态异常系统测 Android GUI Agent，发现更强 reasoning 并不会自然带来 runtime robustness，部分深层 trap 也无法靠在陷阱环境中做 GRPO 解决。

**为什么值得推荐、方法怎么工作**：benchmark 从真实移动运行中整理四层异常：State、Thinking、Action、Round，再细分成弹窗、状态死锁、错误动作映射和跨轮污染等十类。构造时先保留原任务可达性，再在执行轨迹中动态注入 trap，最后比较 clean success、trap success 与恢复行为；附加实验分别在原环境和 AnTrap 环境进行 GRPO，以区分可学习的局部异常和 reasoning-bottlenecked 异常。Figure 1 给出 taxonomy，Figure 3 按层比较两种训练制度。

**关键实验、局限与当天主题**：16 个 GUI 模型都出现显著下降。Qwen3-VL-8B-Thinking 的 clean success 是 62.7%，trap 下为 56.6%，下降 6.1 点，与 instruct 版 52.1%→46.3% 的 5.8 点几乎相同；GUI-Owl thinking 甚至比 instruct 掉得更多。对抗 GRPO 能明显修复 state/action 单步 trap，却对 state deadlock 等长上下文问题帮助有限。局限是异常由 benchmark 定义，真实 Android 的网络、权限和厂商 UI 更复杂，训练与测试 trap 之间也可能共享结构。它用设备动态证据否定了“thinking 越强就越稳”的简单推断。

### 10. Robust Code RL via Faulty-Code-Driven Test case Synthesis and Dense Reward Shaping

**论文信息**：*Robust Code RL via Faulty-Code-Driven Test case Synthesis and Dense Reward Shaping*；Zhang, Yiwen, Yan, Xiaodong, Huang, Zhenyu, Zhao, Deng, Jiang, Liang, Cui, Qing, Wen, Zujie, Zhang, Zhiqiang, Zhou, Jun；[arXiv:2608.24135](https://arxiv.org/abs/2608.24135)；Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：RobustTests 用近正确的 faulty code 反向合成能区分错误逻辑的测试，再以验证器聚类和 pass-rate dense reward 降低 coding RLVR 的假阳性与假阴性。

**为什么值得推荐、方法怎么工作**：流程首先采样并筛出接近正确但含潜在逻辑分歧的程序，让模型针对这些具体差异生成测试；随后 validator agents 检查输入合法性与答案可信度，behavioral clustering 去除重复或无诊断力案例；最后不把一次全过/全错当唯一奖励，而按逐步 pass rate 构造 dense curriculum，使少量合成噪声不会立刻把整条 rollout 判死。Figure 2 把 faulty-code synthesis、filtering 与 reward module 串起来，Figure 3 展示按当前模型正确率选择中等难度训练题。

**关键实验、局限与当天主题**：在 CodeContests 上训练 Qwen3-32B 后，LiveCodeBench 相对基线绝对提升 3 点；Table 1 同时报告 LiveCodeBench 与 CodeForces，Table 2/3 分别消融测试合成和 reward module。作者也承认 validator 不能清除所有伪测试，训练仍可能强化合成 oracle 的共同盲点，而且只训练“中等难度”题会改变数据分布。推荐它的原因不只是多了一个 code RL recipe，而是明确把 test quality 当作 RLVR 的上游因果变量：坏 verifier 会把 reward hacking 稳定写进权重。

### 11. Task-Adaptive Rubrics for GUI Reward Modeling

**论文信息**：*Task-Adaptive Rubrics for GUI Reward Modeling*；Xiong, Tao, Hu, Xavier, Wang, Wenkai, Wu, Qinzhuo, Wu, Changqiao, Gao, Pengzhi, Liu, Wei, Luan, Jian, Zhang, Shengyu；[arXiv:2608.24174](https://arxiv.org/abs/2608.24174)；Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：AdaptRubric 为每个 GUI 任务先检索任务族级粗规则，再从当前 instruction 提取数值、作用域与约束，避免 reward model 套错 rubric 或凭空增加要求。

**为什么值得推荐、方法怎么工作**：GUI outcome verifier 的失败常来自判断标准本身。该方法分两层：coarse router 将任务映射到 GUI family 并取回可复用标准；fine generator 再从当前指令抽取具体值、scope 与不可省略条件；judge 最后在受控 screenshot budget 内应用这组 rubric，对完整 trajectory 判定成功。离线阶段测 reward discrimination，在线阶段把它作为 RL evaluator，另有 heterogeneous candidate pool 检查 reward-guided selection。Figure 2 是完整 pipeline，Figure 3 用相同十张截图预算跨 backbone 比较。

**关键实验、局限与当天主题**：在 OGRBench 上，匹配 image budget 后平均 F1 比基线高 3.6 点；接入在线训练后，任务成功率提升 4.23 点。Table 2 将 coarse、fine 与二者组合消融，说明家族先验和实例约束互补。边界是 rubric 仍由模型生成并可能共享视觉盲点，十张截图无法覆盖隐式状态或副作用，类别路由错后细规则也会错。它对当天主题的意义是：reward model 的可靠性首先取决于是否在评估“这一个任务真正要求的状态”，而不是 judge 参数量。

### 12. ReproAgent: Contract-Guided Paper-to-Code Reproduction

**论文信息**：*ReproAgent: Contract-Guided Paper-to-Code Reproduction*；Hu, Xue, Pan, Zewei, Wang, Zhongyuan, Liu, Zhou, Su, Zeli, Zhang, Wentao；[arXiv:2608.24291](https://arxiv.org/abs/2608.24291)；Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：ReproAgent 用持续存在的 implementation contract 把论文中的显式义务与相关仓库中的隐式实现惯例绑定到 work package，避免 paper-to-code 长轨迹逐步丢规格。

**为什么值得推荐、方法怎么工作**：系统分 Prepare、Plan、Generate、Repair 四阶段。implementation-requirement channel 从论文片段抽出算法、指标、数据与 artifact obligations；reference-evidence channel 从相关仓库检索框架默认值、目录结构和常见实现模式；两类证据都绑定到 work package，再投影为 file-level contract，生成与修复时持续消费。这样，修 bug 不会只追当前报错而忘掉论文 protocol。作者在 PaperBench Code-Dev 上用同一 backbone 比较不同 scaffold，并做 end-to-end channel ablation。

**关键实验、局限与当天主题**：在 Claude-Sonnet-4.5 与 Gemini-3-Flash 两个条件下，ReproAgent 都取得同 backbone scaffold 的最高 mean score，论文还公开代码与实验 artifacts。证据的优点是双模型复验和通道级消融；不足是 PaperBench 分数仍会受到 judge 与可执行测试覆盖影响，reference repository 可能把错误或不兼容默认值带入，论文没有证明生成结果达到科学复现实验的统计等价。它把研究代码生成重新定义为 contract-preserving software change，而非从 PDF 到文件的单轮翻译。

### 13. Ockhamareto: Pareto-Gated Segment-Level Credit Assignment for Concise Unit-Test Generation with Reinforcement Learning

**论文信息**：*Ockhamareto: Pareto-Gated Segment-Level Credit Assignment for Concise Unit-Test Generation with Reinforcement Learning*；Huang, Dong, Harman, Mark, Zhang, Jie M., Guo, Zhijiang, Du, Mingzhe, Ng, See Kiong；[arXiv:2608.24473](https://arxiv.org/abs/2608.24473)；Software Engineering (cs.SE) ; Computation and Language (cs.CL)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：Ockhamareto 同时优化单元测试的 mutation kill 与套件长度，并把每个测试的边际杀变异贡献回传到对应 token segment，拒绝“多写测试就显得更强”。

**为什么值得推荐、方法怎么工作**：方法以单次 GRPO 生成完整 pytest suite。第一层 Pareto-gated bonus 只奖励在（mutation score，负测试数）空间不被支配的 rollout；第二层 segment credit 逐个计算测试块带来的边际 mutation kills，把优势落到该块 token；评测再用 first-N 聚合，防止靠后堆叠冗余测试掩盖前几个测试的质量。Figure 1 是训练结构，Figure 2 展示 first-N 曲线，Table 2 分别移除 conciseness bonus 和 segment credit。

**关键实验、局限与当天主题**：在 UnLeakedTestBench 的 N=5 条件下，mutation score 为 49.9%，最强 RL baseline MIST-RL 为 31.3%；平均测试数 2.60 对 4.67，形成 3.4 倍 per-test trade-off 改善。HumanEval+、MBPP+、CodeContests、TestGenEval-Lite 上也同时保持更高 mutation/coverage 与更小套件，4B、9B、27B 三尺度增益为 30–35 点。风险是 mutation operators 不是全部真实 bug，边际 kill 的计算昂贵，测试块之间有交互时局部 credit 不完全可加。它是当天最清楚的“工程目标多维化 + token 局部信用”案例。

### 14. Joint Optimization of Tool Creation and Use for Large Language Model Agents

**论文信息**：*Joint Optimization of Tool Creation and Use for Large Language Model Agents*；Tam, Zhi Rui, Lin, Chieh-Yen, Chen, Yun-Nung, Sun, Shao-Hua, Lee, Hung-yi；[arXiv:2608.24571](https://arxiv.org/abs/2608.24571)；Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：SMITH 用一个 policy 共同学习“写工具”和“调用工具”，并用 schema、代码与任务 outcome 三条独立 reward 轴让模型生成自己与其他模型都能真正使用的 API。

**为什么值得推荐、方法怎么工作**：传统 tool creation 让冻结模型临时写脚本，工具 writer 与 user 没有联合训练。SMITH 把 rollout 交替设为 build task 或 use task：build 从少量例子生成 callable schema 与实现，use 从共享工具池选择并调用；结构 verifier 检查 schema/顶层函数，执行器检查代码，exact task verifier 检查答案，三种失败分别给梯度。Figure 1 展示 shared policy 与 pooled tools，附录还用 naming drift 例子说明只看最终答案会漏掉 schema bug。

**关键实验、局限与当天主题**：Qwen3-4B 在 10 个 held-out reasoning category 上达到 79.9，ReTool 与 LATM-distill 为 63.2、65.8；平均输出仅 100 token，约为标准 CoT 的 1/32。它写的工具让 350M consumer 的 held-out 准确率从 11.6 升至 42.9，匹配 30B writer 的 41.5；给 30B consumer 使用时总体从 70.2 升到 76.6，TabMWP-Hard 从 0.7 到 38.8。局限是任务依赖 exact verifier、工具主要是短 Python 过程，安全副作用和开放 API 未覆盖。它证明 reusable tool code 可以成为 post-training 的能力载体。

### 15. StarHarness: Evolving Harnesses with Stratified Search for Enterprise Environments

**论文信息**：*StarHarness: Evolving Harnesses with Stratified Search for Enterprise Environments*；Esakkiraja, Esakkivel, Akhiyarov, Denis, Yadav, Vikas, Rajeswar, Sai, Bechard, Patrice, Nemala, Sridhar, Davasam, Sagar；[arXiv:2608.24804](https://arxiv.org/abs/2608.24804)；Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：StarHarness 在冻结模型权重下，以分层 failure sampling、隐藏 selection task 和 held-out evaluation 演化 prompt、tools、skills、MCP provider 与 agent loop。

**为什么值得推荐、方法怎么工作**：框架先按 baseline failure mode 将任务分层，避免搜索池只被易题或单一故障占据；proposer 可看到 search tasks 的 trace 与评分，提出 harness patch；selection tasks 对 proposer 隐藏，只有泛化通过的候选才能 promotion；最终 held-out tasks 完全保留，用于冻结 harness 的外部估计。Figure 1 同时给出 evolution workflow 与可执行 procedure，保留 parent link、分数、失败类别和 promotion decision，使 harness 改动可追踪。

**关键实验、局限与当天主题**：在 ITBench SRE、EnterpriseOps-Gym ITSM 与 AutomationBench Finance 上，仅接受 4–12 次修改就让 full-benchmark 成绩提高 20–35 个百分点；增益在未参与演化的任务上仍存在，并能从 GPT 转移到 Qwen 或其他模型，无需重新搜索。trace 分析显示主要收益来自接口修复、环境约定和压缩搜索的操作知识。风险是多轮 selection 会逐渐消耗隐藏集，三类 enterprise 环境仍是 benchmark，外围 harness 复杂度与维护成本未完整计价。它要求我们把“Agent 能力”拆成模型权重与可演化运行层两个可审计对象。

### 16. Recursive Experiential-Working Memory Evolution for Long-Horizon Agent Harnesses

**论文信息**：*Recursive Experiential-Working Memory Evolution for Long-Horizon Agent Harnesses*；Yu, Zhaochen, Wu, Yingcheng, Yin, Zhenfei, Chen, Kaiyuan, Zhao, Zhe, Wang, Mengdi, Yan, Shuicheng, Yang, Ling；[arXiv:2608.24876](https://arxiv.org/abs/2608.24876)；Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：Recuris 用 working memory 维护当前目标，用 experiential skill memory 提供程序性经验，再让固定 Meta-Agent 根据执行证据做局部、验证后才保留的技能更新。

**为什么值得推荐、方法怎么工作**：长程 Agent 的问题不是记忆越多越好，而是任务状态与技能调用逐渐错位。Recuris 在任务内用 working memory 跟踪每个 goal 的进度、证据与未决项，按当前需要从 skill memory 选择显式技能；失败时，执行 trace 被定位到具体 memory component；任务间固定 Meta-Agent 只修改被证据指向的技能，候选更新必须通过验证 gate。Figure 2 对照 append-only memory 与耦合记忆，Figure 3 展示执行—归因—更新的闭环。

**关键实验、局限与当天主题**：四个长程 benchmark、10 个模型的 37 个完成配对中有 35 个提升。tau-bench 上 GPT-5.6 Sol +17.8 点，Claude Opus 5 +15.6 至 87.9%；SkillFlow 上 Qwen3.6-27B/35B 分别 +16.6/+13.5，最长 horizon 增益扩大到 32.2 点。Table 3 还显示技能调用控制比简单提供技能内容更重要。局限是 skill evolution 仍由同类 benchmark 反馈驱动，验证集可能被反复使用，记忆错误跨任务传播的长期风险尚未完全量化。它把外部记忆从检索附件变成有状态、可归因、可回滚的演化对象。

### 17. ADE: Agentic Data Evolution Framework for Human-Centered Objectives

**论文信息**：*ADE: Agentic Data Evolution Framework for Human-Centered Objectives*；Yu, Yang, Jiang, Yilin, Fei, Zexuan, Luo, Yiming, Song, Xingkai, Huang, Kaiyi, Zhou, Aimin, Lin, Xin, Tan, Fei；[arXiv:2608.23719](https://arxiv.org/abs/2608.23719)；Computation and Language (cs.CL)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：ADE 不把合成数据当一次性生成物，而把它组织成版本化 snapshot，用 Observation–Variation–Selection 和稳态准入门持续演化弱可验证目标的数据质量。

**为什么值得推荐、方法怎么工作**：教育解释、写作帮助等 human-centered objective 很难有 executable oracle，盲目扩增只会把筛选噪声放大。ADE 每轮先观察当前 snapshot 在多维 evaluator 下的缺口，再让 Agent 产生定向 variation；selection 同时比较候选与现有样本，只有跨指标稳定胜出的更新才进入下一 snapshot，形成保守 quality ratchet。作者既跟踪 intrinsic trend，也用真正 post-training 后的 extrinsic performance 检查“数据看起来更好”是否转化为模型行为。

**关键实验、局限与当天主题**：在 DEV300 上，intrinsic win rate 从 50% 升到 75.81%，extrinsic win rate 从 55.20% 升到 68.86%；盲专家评审偏好演化答案的比例为 66.11%。提升跨 post-training 方法、模型尺度和超出目标教育任务的 benchmark 延续。局限是 admission evaluator 仍可能与最终评测共偏，反复选择会使 snapshot 对 rubric 过拟合，版本增长也需要 provenance 与回滚成本。它代表当天合成数据主线的关键转向：数据生成之后，最难的是验证哪些变化真能持续改善训练结果。

### 18. Mitigating Exploration Bias in RL for Multi-Instruction Following

**论文信息**：*Mitigating Exploration Bias in RL for Multi-Instruction Following*；Zhang, Mian, Yin, Yueqin, He, Kaiyu, Wu, Peilin, Zhang, Xinlu, Zhou, Mingyuan, Chen, Zhiyu Zoey；[arXiv:2608.23830](https://arxiv.org/abs/2608.23830)；Computation and Language (cs.CL) ; Machine Learning (cs.LG)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：多指令 RL 会先学会便宜的 easy instruction；Behavioral Bootstrapping 先激活难指令，Scarcity-Aware Reward 再按成功稀缺度重权，防止累计奖励继续偏向容易得分的项。

**为什么值得推荐、方法怎么工作**：作者先提出 VIA 与 VSA 两个指标，分别测模型对不同指令的探索与成功分配偏差，并发现它们与最终 prompt accuracy 高相关。训练分两阶段：轻量 rejection-sampling fine-tuning 用少量成功行为把 hard instruction 拉入可探索区；随后 RL 不再简单数完成了几条要求，而根据每类指令在当前 rollout 中的经验稀缺度给权重，让同样一分不再偏爱易项。Figure 3 把 bootstrapping 与 scarcity reward 连起来。

**关键实验、局限与当天主题**：三个 verifiable instruction-following benchmark 上，完整方法都显著超过标准 RL recipe；Table 1 显示只做 bootstrapping 或只做 reweighting 均不及组合，且训练后的指令级表现更均衡。局限是“难度”由当前 policy 的成功频率估计，会随训练漂移；稀有要求也可能是歧义、坏 rubric 或不可满足项，重权会放大噪声。它提供的核心判断很普适：如果初始 policy 从未成功探索某种行为，单靠 outcome RL 不会自动发现它。

### 19. PROOF-Gen: From Optimized Data to Better Distillation

**论文信息**：*PROOF-Gen: From Optimized Data to Better Distillation*；Ta, Anh, Zhu, Junjie, Shayandeh, Shahin；[arXiv:2608.23911](https://arxiv.org/abs/2608.23911)；Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：PROOF-Gen 不再丢弃 frontier teacher 的失败轨迹，而让 reflector 针对每个 near-miss 写临时纠错指导，重采成功后删除 scaffold，再把干净轨迹蒸馏给小模型。

**为什么值得推荐、方法怎么工作**：工具调用 SFT 的 generate-and-filter 会反复为同一难题付费。PROOF-Gen 先执行 teacher 并保留完整 tool trace 与 evaluator feedback；对失败任务，reflector 诊断最后的决定性错误，生成 per-scenario cheatsheet；teacher 在指导下重新执行，成功轨迹进入训练集前删掉提示，避免 student 依赖不可用信息。Figure 1 连接失败恢复和 student SFT，Figure 2 显示很多失败其实有较高 tool-call accuracy，只在一个关键步骤出错。

**关键实验、局限与当天主题**：tau2-bench 中 57% teacher trial 失败，其中约三分之二是 near-miss；方法恢复了 93% 失败 scenario。Qwen3-4B 的 Pass^1 从 0.132 升至 0.529；Gemma 4 E4B-it 在 BFCL-v4 multi-turn 上提升 7.2 点。部署流水线中，trajectory goal completion +6.3 点，on-device student 也有 +1.5 点。风险是 reflector/teacher/evaluator 可能共错，逐场景优化成本高且会泄漏 benchmark 结构，恢复成功不证明最小或安全轨迹。它把失败从废料变成可定向修复的数据资产。

### 20. AHEAD: Adaptive Hindsight with Environment-Augmented Distillation for Agentic RL

**论文信息**：*AHEAD: Adaptive Hindsight with Environment-Augmented Distillation for Agentic RL*；Jin, Xiaolong, Wang, Dingmin, Lingam, Vijay, Kumar, Varun；[arXiv:2608.24114](https://arxiv.org/abs/2608.24114)；Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：AHEAD 按步骤类型分配 privileged supervision：所有步骤给环境反馈，只有关键错误步骤再给纠错 hint，让 dense distillation 的预算落到真正需要方向的位置。

**为什么值得推荐、方法怎么工作**：统一给每一步同一种 privileged information 会把 routine action 和致命错误混在一起。AHEAD 先由 analyzer 在失败轨迹中定位 error steps；teacher 在每一步读取 environment feedback，在 error step 额外读取 LLM-generated corrective hint；teacher 与 student 的 token distribution 差异被转成局部重权信号，再以最小改动接入 GRPO。Figure 2 展示 error identification、augmented teacher 与 policy update，Figure 10 证明最大重权确实集中在错误步骤。

**关键实验、局限与当天主题**：在 ALFWorld、WebShop 与 search QA、三个模型尺度上，AHEAD 多数列最好或第二。7B 相对 GRPO 在 ALFWorld +13.3 点、WebShop +11.0 点，并以更少训练 step 达到同成功率、在更紧 interaction budget 下保持优势。消融显示 environment feedback、error hint 和 analyzer 缺一都会下降。局限是 error localization 与 hint 都依赖模型，错误 analyzer 可能把 teacher 偏差变成强信号；模拟环境的反馈也比真实网页/账户干净。它把 self-distillation 从“每步都教”推进到“按错误性质选择老师信息”。

### 21. Preference Data Selection for Mitigating the Alignment Tax in Large Language Models

**论文信息**：*Preference Data Selection for Mitigating the Alignment Tax in Large Language Models*；Kim, Minsu, Lian, Jianxun, Xie, Xing, Whang, Steven Euijong；[arXiv:2608.24192](https://arxiv.org/abs/2608.24192)；Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：BALIGN 从 preference sample 本身预测 alignment tax，用参考模型 margin、chosen/rejected 长度差和与通用能力语料的相似度筛掉高漂移、低收益数据。

**为什么值得推荐、方法怎么工作**：论文把灾难性遗忘从 optimizer 问题改写为数据选择问题。理论分析 preference gradient 后，作者构造三个互补 risk feature：reference log-probability margin 识别模型已会或极难学的 pair；token-length difference 估计长度偏置和梯度规模；TF-IDF similarity 估计更新是否撞击通用知识表征。三者合成 score，再在固定数据预算下选择低风险、高 alignment utility 的 preference pairs。Figure 1 展示对 general knowledge、instruction following、reasoning、code 等能力的遗忘。

**关键实验、局限与当天主题**：HH-RLHF 等标准数据上，BALIGN 在 helpfulness/harmlessness 与 general capability 之间形成最优 Pareto frontier；Table 2 与 Figure 2 显示保留基础能力的同时没有牺牲对齐收益，Table 3 的消融表明三种信号合用最好，计算开销也明显低于训练中动态方法。边界是 TF-IDF 只是粗语义代理，风险分数对数据域、tokenizer 和参考模型敏感，而且“通用能力”由有限 benchmark 代表。它的重要判断是：不是所有 preference pair 都值得优化，alignment tax 可以在训练前部分预测。

### 22. RecurSE: Bounded Recursive Self-Evaluation for LLM Rubric Judges

**论文信息**：*RecurSE: Bounded Recursive Self-Evaluation for LLM Rubric Judges*；Liu, Kaiyuan, Zhuang, Ziyuan, Weng, Rongxiang, Ye, Jieping；[arXiv:2608.24231](https://arxiv.org/abs/2608.24231)；Computation and Language (cs.CL)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：RecurSE 让 rubric judge 用同步 policy-copy 审计自己的推理并作为 RL reward，同时用独立 PAV 指标确定自我改进必须停止的窗口。

**为什么值得推荐、方法怎么工作**：自评训练最危险的是模型直接复制自己想要的判定 token。RecurSE 的 Pass 1 由可训练 judge 按多条 rubric 输出 reasoning 与 verdict；Pass 2 用同步 checker 按 meta-rubric 审 reasoning，只返回差异化 scalar score，并通过 interface decoupling 切断 verdict token 的直接抄写捷径；Pairwise Advantage Validity 同时监控 judge accuracy 与 checker fidelity，决定 early stop。Figure 2 是闭环，Figure 3 显示相同 YES/NO 接口会奖励上涨而准确率不动。

**关键实验、局限与当天主题**：Qwen3.5-9B 的 SV-HARD rule accuracy 从 60.8% 到 PAV 选中的 73.7%，SV-FULL 从 92.1% 到 95.3%；继续训练虽令局部 hard accuracy 到 75.9%，SV-FULL 却跌至 89.7%，证明“最终 checkpoint”更差。Gemma 与 27B 模型也在 held-out suite 提升；由该 judge 选出的 preference pairs 还能改善下游 DPO。限制是 PAV 仍要一个固定验证集，checker 与 judge 权重同步会共享盲点，bounded RSI 不能外推成无限自我提升。它最有价值的贡献是把停止条件纳入 post-training 设计。

### 23. Contrastive Branch Policy Optimization

**论文信息**：*Contrastive Branch Policy Optimization*；Wang, Ying, Qiu, Changlin, Lin, Bang, Jin, Linbo, Jiang, Wen, Sun, Zhe, Yang, Jingli；[arXiv:2608.24300](https://arxiv.org/abs/2608.24300)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：CBPO 把 branch budget 分配与 token credit 两个问题拆开：先在全响应找高熵分支点，再用相同 prefix 下不同 continuation 的 outcome 差构造局部敏感度。

**为什么值得推荐、方法怎么工作**：算法不只在 tool call 边界分支，而周期扫描整条 response 的 generation entropy；path-level 和 node-level decay 把固定预算分散到不同轨迹与位置，防止全挤在一小段；每个 parent 与共享 exact prefix 的 branches 形成受控组，组内 reward variation 得到 Contrastive Branch Value；多节点同轨迹时再切成不重叠 segment，避免共享 token 被重复加梯度。Figure 1 是整体训练框架，Figure 3 说明 exact-prefix 对照为何比随意比较轨迹更干净。

**关键实验、局限与当天主题**：两种模型尺度、5 个数学和 5 个 knowledge-intensive search benchmark 上都超过 policy-optimization 与 branch-based baseline。Table 1 中 1.7B/4B 的数学宏平均为 66.0%/69.3%，较最强 size-matched ARPO 高 1.7/2.2 点，搜索宏平均也最高。边界是 branch sampling 增加大量执行成本，entropy 不保证对应因果决策，局部 outcome variation 在 stochastic tool 环境中会混入环境噪声。它仍是少见的严格控制 prefix、又不需要人工 process label 的细粒度 credit 方法。

### 24. FARCA: Fact-Aligned Reliability-Aware Credit Assignment for Reinforcement Learning with Factual Supervision

**论文信息**：*FARCA: Fact-Aligned Reliability-Aware Credit Assignment for Reinforcement Learning with Factual Supervision*；Xie, Qiming, Zheng, Wenjie, Shen, Xiangqing, Xia, Rui；[arXiv:2608.24350](https://arxiv.org/abs/2608.24350)；Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：FARCA 把 factual verification 对齐到具体 token span，并用反事实移除证据后的判定变化估计 verifier 可靠性，减少错误事实标签被广播到整段推理。

**为什么值得推荐、方法怎么工作**：作者把 noisy factual credit 分成 localization ambiguity 与 reliability ambiguity。流程先把 reasoning 中可核对 claim 与证据对齐，局部 factual reward 只作用于相关 token；再对关键 evidence 做 counterfactual removal，如果 verifier 判断高度依赖证据，则权重更高，反之降低；这些 reliability weight 同时调制事实 reward 与局部 policy advantage，最终与答案正确 reward 一起优化。Figure 2 给出 answer reward、fact alignment、counterfactual attribution 和更新路径。

**关键实验、局限与当天主题**：在两个模型和多项 factual reasoning/hallucination benchmark 上，FARCA 在保持数学推理的同时稳定提升 factuality。相对 strongest baseline，平均增益约 1.75–2.21 点；TruthfulQA、HalluQA 的单项提升达到 2.09、2.67，另一模型可到 3.31 点。结果不算巨大，但 coarse factual reward 有时甚至低于标准 GRPO，说明可靠性加权确有必要。局限是 counterfactual dependence 不等于因果真实性，retrieved evidence 可能不完整，verification cost 高。它把“有事实监督”进一步收紧为“监督是否定位正确且值得信”。

### 25. IAPO: Influence-Aware Policy Optimization for Credit Assignment in Multi-Turn Service Agents

**论文信息**：*IAPO: Influence-Aware Policy Optimization for Credit Assignment in Multi-Turn Service Agents*；Ren, Bo, Mao, Yirong, Yang, Yi, Que, Wenhui；[arXiv:2608.24588](https://arxiv.org/abs/2608.24588)；Machine Learning (cs.LG)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：IAPO 把多轮 service-agent rollout 画成 typed influence graph，用后续用户澄清和工具观察来判断早期 action 如何贡献或传播错误，再重分配同一 trajectory advantage。

**为什么值得推荐、方法怎么工作**：final reward 不能说明一次询问、一次查单或一次退款谁真正负责。IAPO 让冻结 annotator 从 trace 中抽取 trainable actions 之间的 support-use 与 failed-use edge，用户和工具 observation 只作为证据节点；图特征转成正、有界、长度归一的 action weight，成功轨迹把优势路由到被后续使用的信息，失败轨迹把负优势路由到可观察错误源；总优势与符号保持不变，因此只改变归因、不改变任务 reward。Figure 1 用退款到原卡或余额的例子直观对比 GRPO。

**关键实验、局限与当天主题**：Qwen3-4B/8B 在 tau2-Bench、UserBench 与 AgentChangeBench 上优于多轮 RL baseline，BFCL-v4 Multi-Turn 则显示 gains 没有以函数调用能力下降为代价；主对照与 GRPO 使用相同训练协议，唯一变量是 trajectory-to-token advantage map。限制是 influence graph 由 annotator 推断，可能把叙事相关性误当因果；长 trace 的图构造成本高，隐藏状态也不会出现在证据节点。它把用户反馈与工具结果从上下文文本提升为 credit-routing evidence。

### 26. On-policy Distillation with Verifiable Reward

**论文信息**：*On-policy Distillation with Verifiable Reward*；Lin, Wenze, Zhao, Jiale, Jiang, Xitai, Rao, Songde, Li, Yining, Wang, Shenzhi, He, Bingxiang, Huang, Gao；[arXiv:2608.24696](https://arxiv.org/abs/2608.24696)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：OPDVR 用 verifiable correctness 给 on-policy distillation 的隐式 token reward 加 ReLU gate：正确轨迹只能得非负蒸馏信号，错误轨迹只能得非正信号，无需新的权重超参数。

**为什么值得推荐、方法怎么工作**：普通 OPD 给 dense teacher guidance，却不关心 trajectory 是否答对；RLVR 关心结果，却只有稀疏 outcome。作者先把 sampled-token OPD 梯度改写成隐式 reward，再按可验证结果对其门控，使 teacher distribution 与任务成功方向一致；该形式本身成为 RLVR reward，可直接与 GRPO 等 policy gradient 组合。Figure 1 对比门控前后 reward 几何，Figure 2 给出算法，无需手调 OPD/RLVR mixing coefficient 或切换时机。

**关键实验、局限与当天主题**：同架构与跨架构的 6 个数学 reasoning benchmark 上，OPDVR 都超过标准 OPD。进一步的 group-relative policy distillation 相对 GRPO 在 AIME24 +6.5 点、AIME25 +10.9 点，并在 6 项平均上领先；相对 OPD 在 AIME24 也高 2.8 点。局限是全部任务有清晰 verifier，teacher 若系统性偏向错误但可投机解，门控仍会保留偏差；结果集中于数学推理，尚未证明工具长轨迹。它给出了一个简洁而干净的 dense guidance × outcome correctness 组合。

### 27. SkillForge: Evolving Verifiable Skills for Reinforcement Learning Agents

**论文信息**：*SkillForge: Evolving Verifiable Skills for Reinforcement Learning Agents*；Yang, Shidong, Ma, Ziyu, Huang, Tongwen, Wang, Xucong, Li, Renda, Hu, Yiming, Wang, Yong, Chu, Xiangxiang；[arXiv:2608.24747](https://arxiv.org/abs/2608.24747)；Computation and Language (cs.CL)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：SkillForge 让技能调用显式进入 RL action space，并让每条技能通过环境证据持续验证、修订或淘汰，修复 append-only skill bank 的静默腐化。

**为什么值得推荐、方法怎么工作**：rollout 时，系统先从 skill bank 检索紧凑 catalog，Agent 用结构化 tag 显式调用技能，GRPO 同时优化环境动作和 skill invocation；任务结束后，多路径 induction 从成功、失败和修复 trace 提炼候选技能；evidence-based verifier 再用后续环境交互确认技能是否仍有效，只有通过的更新进入 bank。Figure 2 将 retrieval、explicit call、policy update 与 skill evolution 组成闭环，避免技能只因写得像经验就被永久保存。

**关键实验、局限与当天主题**：在 ALFWorld、WebShop、AppWorld 上都超过 SkillRL。Qwen3-4B 在 ALFWorld 为 93.6 对 89.9，WebShop success 83.0 对 72.7；AppWorld TGC 从 19.0 到 23.8，SGC 接近三倍。消融中去掉 explicit skill calling 或 skill bank，ALFWorld 从 87.9 降至 77.9 等明显幅度。局限是验证仍依赖同类环境、技能版本与任务分布漂移未长时间观察，也没有软件 release 级失效测试。它说明 skill 必须是可执行、可归因、可复验的训练对象。

### 28. StepGuard: Learning Step-Level Guardrails with Scalable Supervision and Safety-Utility Balancing

**论文信息**：*StepGuard: Learning Step-Level Guardrails with Scalable Supervision and Safety-Utility Balancing*；Zheng, Zhijie, Li, Yu, Qian, Chen, Fu, Yuqian, Fu, Yanwei, Sheng, Lu, Shao, Jing, Liu, Dongrui；[arXiv:2608.24777](https://arxiv.org/abs/2608.24777)；Artificial Intelligence (cs.AI) ; Cryptography and Security (cs.CR)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：StepGuard 在工具真正执行前审计每一步：StepGen 生成同 prefix 的危险、拒绝、知情替代与 benign reuse，Balance-GRPO 再动态平衡过度防御和漏防。

**为什么值得推荐、方法怎么工作**：训练首先围绕 risk anchor 生成一条 unsafe trajectory，并从共同 pre-anchor prefix 分出 Refuse 与 Aware 两种安全 branch，同时加入独立 benign tool-reuse，防止模型把敏感工具本身等同危险；结构与语义过滤后得到 step-level SFT 数据。第二阶段统计 safe/unsafe class accuracy，用 Balance-GRPO 动态调整优势，使两类错误都被压低。Figure 1 是 matched trajectory data engine，Figure 2 连接 cold-start SFT、online RL 与 pre-execution checker。

**关键实验、局限与当天主题**：StepGuard 在开放权重 guard model 中平均准确率最高，并与 GPT-5.4 相当；接入 AgentDojo 和 AgentDyn 后，相对无 guard 的 mean attack success rate 降低 77.3%，mean utility 只下降 2.8 点。优势是 action 执行前可阻断，且有 matched safe/unsafe context；不足是风险 anchor 和 policy library 仍是枚举集合，真实工具组合的 side effect 更复杂，guard 本身延迟与可绕过性需持续红队。它把安全 post-training 的评估单位从整条回答推进到单次外部动作。

### 29. CAFE: Self-Improving Search Agents Need Co-Evolving Feedback

**论文信息**：*CAFE: Self-Improving Search Agents Need Co-Evolving Feedback*；Liu, Boyang, Jin, Senjie, Wang, Peixin, Yin, Zhangyue, Wang, Yibo, Zhou, Yuhao, Liang, Xinbing, Zhu, Shizheng, Wang, Yuhui, Tong, Jingqi 等；[arXiv:2608.24794](https://arxiv.org/abs/2608.24794)；Artificial Intelligence (cs.AI)；列入 2026-08-26 官方列表。

**一句话 TL;DR**：CAFE 让 search agent 与 critic 共用模型并交替演化：policy 学何时请求、怎样使用反馈，critic 则从最新 on-policy 成败对中学习真正能改变后续轨迹的纠错。

**为什么值得推荐、方法怎么工作**：在线 RL 中，prompt-level call–skip success gap 估计一次 feedback request 是否值得，重复请求另有成本；feedback-aware advantage shaping 把干预前后的 token credit 分开。离线阶段从相同或近似 prefix 的成功/失败 rollout 构造 preference pair，用 RDPO 更新 critic。两种角色共享参数，因而每次 agent 更新都会改变 critic 面对的错误分布，反之亦然。Figure 1 把 CFE、advantage shaping 与 rollout-derived preference optimization 连起来。

**关键实验、局限与当天主题**：7 个 agentic SearchQA benchmark 上，7B 模型取得最高平均 EM 52.5、第二高 F1 60.7，较 strongest RL search baseline 高 2.1 EM、1.3 F1；增益在 6 个 OOD benchmark 保留，并减少答案级 hallucination。单边消融显示只改 agent 或只改 critic 最终都会 plateau，交替更新才继续上升。风险是共享参数可能让双方形成共谋式 shortcut，call–skip 比较昂贵，搜索 benchmark 的最终答案 reward 仍不等同证据完整性。它展示了反馈模型也必须追随 policy 的错误分布演化。

## 中相关论文速读

### 1. [REFINE: A Multi-Agent LLM Approach for Evidence-Guided Code Refactoring](https://arxiv.org/abs/2608.23611)

REFINE 用静态分析先定位 Java smell，再让多 Agent 规划、改写、重跑分析和 preservation check。15 个开源系统的 450 个文件、1,350 次输出中，三种前沿模型的 smell reduction 为 68.26%–72.79%，并比 matched direct prompt 改动更小、删除 public method 更少。保留它的判断是“静态证据能约束重构目标”；不深列强相关，是因为仍停留在 file-level，作者自己发现 assert/fail call 改动和 public API 删除，尚未以完整编译、依赖与回归测试证明行为保持。 论文分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 2. [Rebuild Dossier: Mechanically-Enforced Specs for Agentic App Rebuilds, and What Model-Tier Failures Reveal](https://arxiv.org/abs/2608.23616)

Rebuild Dossier 在写代码前锁定应用真实 I/O interface，再机械执行 one-test-at-a-time；它最有价值的不是胜率，而是三层核验——Agent 自报、自动日志、实际文件——抓到了包括作者日志 bug 在内的证据冲突。小规模结果甚至出现守规则 Agent 未过 held-out test、违规者全过，以及大应用中 enforcement 没真正运行而输给单提示 baseline。故应保留为负结果：写了 process rule 不代表系统执行了 rule；样本太小、结论不稳定，所以不作核心方法宣传。 论文分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 3. [Feedback That Backfires: Why Small Language Model Agents Repeat the Call They Just Watched Fail](https://arxiv.org/abs/2608.23651)

这篇研究解释了为什么把失败 tool call 原样塞回 transcript 可能适得其反。6 个 135M–1.7B 模型、模拟工具与 MBPP repair 中，失败记录使重复同一 action 的概率从 0.06 升到 0.54；表面字符串贡献约 83% 损害，显式“不要重复”无效。把调用改写成运行时失败描述能移除 76% inversion。推荐保留的是 harness-level 因果诊断；它主要针对小模型和固定候选动作，不能直接外推前沿 Agent，但提醒错误反馈的表示形式本身会改变下一步。 论文分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 4. [Confidently Wrong, Silently So: Auditing Undetectable Failures of a Deployed On-Device Language Model](https://arxiv.org/abs/2608.23663)

论文审计可开发者调用的 on-device foundation model，重点问用户是否能从可见输出发现它错了。false premise 上 confabulation 为 69%，benign refusal 18%，自报置信 AUROC 0.47、ECE 70；15 个表面特征区分正确与错误只有 AUROC 0.55。黑盒 consistency wrapper 能把 confident confabulation 从 75% 降至 3%，selective accuracy 从 43% 提到 83%。它是强可靠性审计，但不是 coding-agent 或 post-training 方法，故放速读。 论文分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 5. [Automata from Agent Traces: Failure and Next-Step Prediction](https://arxiv.org/abs/2608.23670)

作者把一批 Agent trace 压成 7–43 状态的有限状态机，held-out replay fitness 至少 0.997，并用状态上下文预测下一步和失败；12 个公开数据集中，failure AUROC 最高 0.94，能在任务结束前触发停止。值得记住的是跨 run topology 可能更多由 harness 而非 LLM 决定，这为观测与审计提供低成本结构。边界在于高 replay fitness 可能来自日志模板化，状态聚合不证明语义等价，也没有展示复杂代码修改的因果定位；实际使用时仍需把抽象状态映射回具体文件、工具调用和外部副作用。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Machine Learning (cs.LG)，列入 2026-08-26 官方列表。

### 6. [AgentRoom: Concurrent Multi-Agent Coding in a CRDT-Backed Shared Workspace](https://arxiv.org/abs/2608.23740)

AgentRoom 用 CRDT-backed shared workspace 支持多 coding agent 并发编辑，目标是让模块分工与冗余探索不再靠串行 patch merge。它把共享文件状态、并发冲突和 Agent communication 作为系统对象，适合关注多文件并行修改。之所以只列中相关，是因为当前证据更偏协作基础设施，CRDT 能解决文本合并，却不能保证跨文件语义一致、build order、测试责任和最终 patch correctness；并发收益也必须与额外 token、重复修改和冲突恢复同预算比较。 论文分类为 Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)，列入 2026-08-26 官方列表。

### 7. [SPIDER4TianoCore: Enhancing Patch-Propagation for the TianoCore UEFI Firmware Development Ecosystem](https://arxiv.org/abs/2608.23755)

SPIDER4TianoCore 面向 UEFI 固件社区的 patch propagation，尝试发现同类修复在分支、平台或相邻模块中未同步的问题。这个场景非常符合遗留维护：硬件条件复杂、代码历史长、遗漏传播会静默存在。值得留意的是它把 issue/patch 关系扩展到生态级同步修改；不深挖则因为摘要层面的 Agent 闭环、可执行固件验证和板级行为证据不足，传播候选的 precision/recall 与错误 backport 风险比生成数量更关键。若没有配置矩阵和固件启动证据，相似 patch 也可能在不同平台语义下失效。 论文分类为 Software Engineering (cs.SE)，列入 2026-08-26 官方列表。

### 8. [Automated Synthesis of Cloud Emulators](https://arxiv.org/abs/2608.23842)

Automated Synthesis of Cloud Emulators 试图由 API 文档、观察和交互自动构造云服务 emulator，为 Agent 测试提供可控替身。它的价值在于真实云 API 昂贵、慢且有副作用，emulator 可生成异常和状态变化；但 emulator 与真实 provider 的语义偏差会直接污染 reward 与 regression oracle。论文更像测试基础设施而非代码修复方法，速读时应重点核对状态机覆盖、错误码与并发语义，而不能把“调用能跑”视为业务等价。 论文分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Distributed, Parallel, and Cluster Computing (cs.DC)，列入 2026-08-26 官方列表。

### 9. [The Empire, Long Divided, Must Unite: Architectural Convergence in Three LLM Agent Harnesses](https://arxiv.org/abs/2608.23953)

这篇比较三个 LLM Agent harness 的架构收敛，讨论 tool registry、middleware、memory、subagent 与执行 loop 为什么逐渐出现相似分层。它有助于把 harness 从杂乱 prompt glue 提升为可比较的软件架构，也与当天多篇 harness evolution 工作形成背景。限制是架构归纳主要来自少数系统，component 名称相似不等于行为语义或可靠性等价；没有 matched model/task 的执行对照，因此更适合作为设计地图而非性能证据。 论文分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Computational Engineering, Finance, and Science (cs.CE)，列入 2026-08-26 官方列表。

### 10. [Evaluating Language Models on Cross-Language Code Functional Equivalence](https://arxiv.org/abs/2608.23961)

论文评测 LLM 对跨语言代码 functional equivalence 的判断，而不是仅看文本或 AST 相似度。这对迁移、重写和多实现审核很重要：两段代码表面差异大也可能等价，反之翻译顺畅也会改变边界行为。推荐保留的关键是以执行语义约束跨语言比较；不列强相关，是因为等价判定本身尚未形成仓库级迁移 Agent，真实 I/O、依赖、数值误差和未定义行为会比 benchmark 函数复杂得多。复现时还应检查测试是否真正覆盖两种语言各自的运行时边界，而非只验证共同的正常输入。 论文分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)，列入 2026-08-26 官方列表。

### 11. [Reflection with Action-Induced Visual Differences for Desktop GUI Agents](https://arxiv.org/abs/2608.24015)

桌面 GUI Agent 在 action 后对比执行前后视觉差异，再用 reflection 判断动作是否产生预期状态变化，补上“点了按钮就默认成功”的缺口。它与 runtime oracle 直接相关，尤其适合无 DOM 的桌面环境。中相关的原因是视觉 difference 既可能来自动画、时钟等无关变化，也可能漏掉后台状态；reflection 仍由模型解释，若没有任务级 postcondition 和 side-effect audit，局部像素变化只能证明发生了变化，不能证明变化正确。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 12. [WebMCP-Phalanx: Enforcing and Characterizing Trust Boundaries for Browser-Integrated LLM Agents](https://arxiv.org/abs/2608.24017)

WebMCP-Phalanx 为网页暴露给 Agent 的工具加入 principal-bound capability credential、provenance label 与 quarantine/privileged 双 Agent。ownership 机制把 revocation/overwrite attack success 从 100% 降到 0%，description 注入 80 次全拦，tool-return attack 仅 2/80 成功；但 white-box attacker 可借恶意 tool name 在 inspection 前调用。它的证据具体，适合保留；未列强相关是因为主要是浏览器安全 runtime，不是软件 change 或权重 post-training，且结论已指出还需 call-timing gate。 论文分类为 Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 13. [IterCAD: Iterative Program Repair for CAD Code Generation from Orthographic Views](https://arxiv.org/abs/2608.24020)

IterCAD 把正交图到参数化 CAD 代码从 one-shot generation 改成 render/inspect 后的 progressive repair，并用 revise-or-stop 数据与三阶段训练学习何时继续。它连接视觉理解、几何验证、程序执行与多轮 RL，能提高 CADExpert 上 executability 与 geometric fidelity。值得保留的判断是中间 artifact 应进入反馈环；但 CAD 几何距离比一般软件行为 oracle 更规整，摘要没有统一绝对数，尚不能外推到多文件工程代码。 论文分类为 Computer Vision and Pattern Recognition (cs.CV) ; Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 14. [What Guides the Agent? Adjudicating Unauthorized Behavior via Localizing Behavior-Guiding Instructions](https://arxiv.org/abs/2608.24022)

Attnlocate 把真正引导工具调用的 context span 定位成 attention matrix 上的一维 object detection，再按来源 authority 决定是否允许调用。10 种 Agent 配置上 mean IoU 0.743、AUROC 0.956，在 6.7% FPR 下 TPR 0.934，并能跨未见模型迁移。它比输入黑名单更接近运行时行为归因；但 attention trace 不是严格因果解释，模型可通过未检测通路受影响，white-box adaptive robustness 也需要持续检查，所以列为安全速读。 论文分类为 Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 15. [Knowing When to Ask for Help: Bayesian Self-Escalation in Hierarchical LLM Agents](https://arxiv.org/abs/2608.24087)

作者把模型在生成中途主动升级给更强模型写成 Bayesian optimal stopping：从标注轨迹学习 competence posterior，而非把 raw entropy 当置信度，并推导动态阈值与有限样本 regret。Qwen2.5-Coder 1.5B→7B、MBPP 257 题上，实时升级在同成本下优于事后 routing，累积 belief 的区分力也随生成增强。价值在于给 handoff 一个可校准决策；证据仍主要是仿真与函数题，handoff context 如何传递、仓库状态是否保真没有解决。 论文分类为 Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Machine Learning (stat.ML)，列入 2026-08-26 官方列表。

### 16. [Paritok-4B: Intent-Conditioned Context Compression for Coding Agents](https://arxiv.org/abs/2608.24188)

Paritok-4B 是 extractive、intent-conditioned coding-context compressor：从 67,074 条 OpenHands 轨迹蒸馏 40,606 个样本，压缩后 96% identifier/path/number 来自原文。SWE-bench Lite 上把上下文压到 25.7%，保留未压缩 single-shot solve quality 的 86.5%；行号输入时压到 27.8%、保留 89.3%，McNemar p=0.079。它对成本很实用，但 30 个 only-uncompressed 对 17 个 only-compressed 仍提示信息损失，且 single-shot 不能替代完整 Agent run。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Machine Learning (cs.LG); Software Engineering (cs.SE)，列入 2026-08-26 官方列表。

### 17. [DeepRepoQA: Code Repository Question Answering with Deep Agent Exploration](https://arxiv.org/abs/2608.24221)

DeepRepoQA 用 MCTS 让 Agent 沿仓库树搜索、跨文件追踪依赖并回答开发者问题，在 SWE-QA 上超过 surface retrieval baseline。问题很重要，因为代码理解是可靠修改的前置条件；方法也明确将 repository navigation 作为决策过程。未列强相关是因为 QA 正确不等于定位 patch 或保持行为，MCTS 的 search cost、答案引用的可复查性和超大仓库扩展性需要更完整数字；它应被看作 program understanding 组件。 论文分类为 Software Engineering (cs.SE) ; Computation and Language (cs.CL); Programming Languages (cs.PL)，列入 2026-08-26 官方列表。

### 18. [Towards LLM-Enhanced Android Taint Analysis](https://arxiv.org/abs/2608.24269)

初步工作让 Agent 迭代探索 Android 代码并判断 taint flow，在 DroidBench 上 Gemini-3 Flash F1 0.96，对 FlowDroid 的 0.55；ICC 0.95 对 0.17、implicit flow 0.94 对 0、reflection 1.00 对 0.50。结果说明 LLM 可能补传统模型缺口，但真实 app 只做了小样本，额外 leak 未有完备 ground truth，DroidBench 污染和 reasoning hallucination 都需排除。它值得速读为混合静态分析方向，不宜据此宣称替代 FlowDroid。 论文分类为 Software Engineering (cs.SE) ; Cryptography and Security (cs.CR)，列入 2026-08-26 官方列表。

### 19. [Observability and Fault Injection for LLM-Based Multi-Agent Systems in Software Engineering](https://arxiv.org/abs/2608.24271)

llmmas-otel 把 OpenTelemetry tracing 与 fault injection 接入软件工程多 Agent：workflow phase、agent step、通信、tool call、LLM call 都对齐到 trace，并可在指定交互点注入故障。它补的是可复现实验基础设施，便于比较正常与异常 run。当前验证只有 minimal demo 和一个真实系统，尚未证明 instrumentation 完整性、开销或 failure attribution 精度，因此不作为强论文；但它提供了当天可靠性研究需要的观测底座。 论文分类为 Software Engineering (cs.SE)，列入 2026-08-26 官方列表。

### 20. [The Handoff Tax: Continuing Non-Native Trajectories in LLM Agents](https://arxiv.org/abs/2608.24358)

The Handoff Tax 系统研究 coding Agent 在长轨迹中更换模型。Claude/GPT 两组 low-cost 与 high-capability 配对显示，完整轨迹升级只能追回不到一半 LC→HC 质量差，却增加显著成本；降级反而形成较好成本点。更微妙的是接口方向相反：升级时减少低质量轨迹信息更好，降级时删除高质量轨迹更差。它对真实调度很重要；但 benchmark、切换时机和 compaction 方法有限，也未解释哪些错误状态已写入仓库而无法靠删 trace 消除。模型切换策略因此必须同时处理文本历史和持久工作区，而不能只优化上下文长度。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 21. [Adaptive Influence Graphs for Failure Attribution in Multi-Agent Systems](https://arxiv.org/abs/2608.24361)

Adaptive Influence Graphs 先把失败的多 Agent trace 结构化成 action/component/dependency 图，再让诊断 Agent 定向导航，而不是从头顺读日志。多个模型上图表示越丰富，failure attribution 越好，并在 Who&When 上达到新 SOTA。保留它是因为可观察性表示本身会改变诊断能力；不列强相关，是因为图由模型构造，错误边会误导归因，benchmark 也不一定涵盖编译、测试与文件状态。它更像 failure-localization 层。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 22. [From State to Action: OODA-Tool for Reliable Multi-Turn Tool Use](https://arxiv.org/abs/2608.24368)

OODA-Tool 把 Observe、Orient、Decide、Act 做成 typed、controller-checked 中间状态，缓解直接 function calling 把状态跟踪与动作生成挤在同一 autoregressive stream 的竞争。Qwen3 0.6B–14B 在 multi-turn、multi-tool 与 incomplete-information 上都提升，小模型和强历史依赖任务增益更大。结论有价值，但 typed controller 可能把任务结构预编码，真正外部副作用和异常恢复覆盖有限，因此列为可靠 tool-use 速读而非核心。 论文分类为 Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)，列入 2026-08-26 官方列表。

### 23. [PeakBench: Benchmarking Resource-Aware Tool Invocation in LLM Agents](https://arxiv.org/abs/2608.24509)

PeakBench 给多工具工作流加 execution-grounded dependency 与实测 resource profile，把 logical planning 和 resource-constrained scheduling 分开打分。结果显示逻辑计划强并不保证并行执行安全，高峰资源信息能减少 overflow、改善利用率。它补上 Agent benchmark 常忽略的物理调度维度；不过主要评估调用编排，不涉及模型训练或软件补丁，资源曲线也可能随机器与工具版本漂移，故中相关。 论文分类为 Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)，列入 2026-08-26 官方列表。

### 24. [When "Must" Becomes "Maybe": Constraint Weakening in LLM Agent Workflows](https://arxiv.org/abs/2608.24569)

论文把多 Agent handoff 中的 constraint weakening 定义为 operational state preservation：摘要仍提到 blocker，但“必须先解决”被改成“可参考”。1,296 个受控 episode 中，普通压缩导致 100% deactivation、54.2% forbidden action；恢复 prerequisite、authority、fallback、consequence 四字段后 preservation 100%、违规 0%。下游 verification 虽能把违规降到 0，artifact deactivation 仍有 95.3%。这说明内容保留不等于行动约束保留；但任务是合成安全 blocker，真实 coding flow 还需验证。 论文分类为 Artificial Intelligence (cs.AI) ; Multiagent Systems (cs.MA)，列入 2026-08-26 官方列表。

### 25. [BrowserForge: Scaling Web Episode via Parallel Browser Sandboxes](https://arxiv.org/abs/2608.24848)

BrowserForge 用并行 browser sandbox、open-web sourcing 和 proposer–solver loop 从 203,238 个不同网站生成可验证视觉交互轨迹，训练模型只看 screenshot，不依赖 DOM。compact multimodal model 在 live Online-Mind2Web 从 25.66% 升至 33.33%，静态 benchmark 也随语料规模增长。它是实质 post-training 数据工程；局限是 synthesis 阶段仍用 accessibility tree、rule+model cleaning 可能保留假成功，开放网站内容与安全许可也需要持续治理。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-26 官方列表。

### 26. [Prompt Structure Redistributes, Not Reduces: An Empirical Analysis of Security-Weaknesses in LLM-Generated Python Code](https://arxiv.org/abs/2608.24857)

424 个安全敏感 Python 任务、GPT-4o 与 LLaMA 3.1-8B 的五种 prompt 对照显示，结构化提示主要降低拒绝，却不稳定减少漏洞。GPT-4o 高危 finding 从 20.8% 降到 13.6%，低危却从 32% 升到 43.5%，还出现删改用户要求的 semantic drift。推荐保留的是“风险被重分配而非消失”；由于实验是函数级生成、使用 Bandit/CodeQL 且没有仓库执行闭环，所以不列强相关。静态告警的 severity 也不等于可利用风险，最终仍需运行测试、依赖审计与人工威胁建模。 论文分类为 Cryptography and Security (cs.CR) ; Software Engineering (cs.SE)，列入 2026-08-26 官方列表。

### 27. [SPO++: Stream-Aligned Policy Optimization for Asynchronous Agentic RL](https://arxiv.org/abs/2608.24870)

SPO++ 修正异步 Agent RL 中 advantage normalization 的测度错位：trajectory-level whitening 并不保证 actor 实际消费的 token-weighted quantity 居中，因此改在 action-token measure 下标准化，并按生成该 evidence 的 policy event 而非 learner 到达顺序组织数据。ALFWorld 两尺度和 Math-TIR 的 matched run 都比 SPO 在线效率高，配对消融显示 normalization 是最强组件。它很实用但改进幅度与环境范围较窄，列中相关。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 28. [How much of a measured AI preference is the model, and how much is the instrument?](https://arxiv.org/abs/2608.23641)

这篇偏好测量审计固定 15 个 outcome 与 8 个模型，只改变 5 种 elicitation instrument，共 11,400 个评分。跨 instrument 的 generalisability coefficient 只有 0.348，估计要约 38 种工具才能到 0.80；因此单一问法得到的“模型偏好”很少能预测另一问法。它不是训练算法，却直接限制 preference data 和 reward-model 结论：人们测到的可能是 instrument effect。与当天 post-training 线的边缘关系是数据标签有效性，而非模型能力提升。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 29. [Scaling Reinforcement Learning for Diffusion Models via Velocity Matching](https://arxiv.org/abs/2608.23664)

RVM 不把 diffusion reward fine-tuning 硬套成不可 tractable 的 likelihood RL，而直接在 velocity field 上强化高 reward、抑制低 reward，并用 anchor 控制漂移。多项图像/视频任务中，它以更低成本匹配或超过 trajectory policy gradient；视频上还发现常用 preference reward 会奖励干净但几乎静止的输出，加入 motion-tracking reward 才改善动态与 VBench。方法新意清楚，但属于 diffusion post-training，且摘要缺统一绝对数字，所以速读。 论文分类为 Computer Vision and Pattern Recognition (cs.CV) ; Machine Learning (cs.LG)，列入 2026-08-26 官方列表。

### 30. [From Preferences to Principles: Rubric-Based Alignment for Grounded Knowledge Answers](https://arxiv.org/abs/2608.23812)

这篇为 open-domain QA 生成 query-specific、retrieval-grounded、分质量维度的 rubric，再把它用于 post-training reward。composition、grounding、instruction-following 三轴平均比 instruction-tuned baseline 高 6.5%，比 flat rubric 高 4%；证据条件化主要改善 factual support，维度拆分改善组织与遵循。它支持“reward specification 要按问题实例化”；但 rubric generator 与 answer policy 可能共享偏差，检索证据也可能不完整，因此放中相关。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-26 官方列表。

### 31. [AQLoRA: A Zero-Search Recipe for Fast Quantized LoRA Fine-Tuning](https://arxiv.org/abs/2608.23816)

AQLoRA 用一次 CPU pass 按 NF4 reconstruction error 排层，在内存预算下保留部分 fp16；speed setting 只适配顶层，让 backward 提前停止。6 个模型、4 个架构、1.4B–14B 上，速度版比调好的 QLoRA 快 11.1±2.7%，约损失 1 个 accuracy point；quality 版快 4.8±2.4%，准确率与 QLoRA 持平，仅多 0.2 GiB。作者还报告 density/error 选层两个负结果。它是严谨的训练效率 recipe，但不直接改变可靠性目标。 论文分类为 Machine Learning (cs.LG)，列入 2026-08-26 官方列表。

### 32. [Learning to Act While Waiting: RL Finetuning of Generalist Robot Policies Under Inference Latency](https://arxiv.org/abs/2608.23831)

ARLI 处理 VLA 做 RL finetuning 时的真实 inference latency：已提交动作和 mid-inference observation 被加入状态，以恢复近似 Markov 性，再用低延迟 policy 在大模型推理窗口继续行动。模拟与真实机械臂中，标准 RL 在 delay 下可能完全失败，而 ARLI 能有效改进，甚至匹配无延迟理想设置。它是重要 embodied post-training，但机器人动力学和动作安全与 LLM 工具 Agent 不同，故中相关。 论文分类为 Robotics (cs.RO) ; Machine Learning (cs.LG)，列入 2026-08-26 官方列表。

### 33. [NeuronGuard: Robust LLM Safety Alignment via Ablation-Aware Safety Signal Redistribution](https://arxiv.org/abs/2608.23959)

NeuronGuard 的判断是安全信息过度集中在少数 neuron，既容易被 jailbreak 绕过，也容易被 neuron pruning 摧毁。训练时周期性定位安全 neuron，主动 ablate 后仍要求拒绝，以 KL 保持分布一致，并用随机梯度投影减少 utility 冲突。3 个 LLM、6 类攻击及多模态设置中声称 near-zero ASR，并覆盖 white-box adaptive attacker。值得保留，但“安全 neuron”与线性 probe 可能不完备，理论上界依赖前提，需独立复现后再给强结论。 论文分类为 Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI); Information Retrieval (cs.IR); Machine Learning (cs.LG)，列入 2026-08-26 官方列表。

### 34. [Algorithmic Impact Reveals the Hidden Social Choice Structure of Alignment](https://arxiv.org/abs/2608.24046)

论文把多主体 alignment 映射成 convex impact space 上的 welfare optimization，展示 voting-by-issues、random dictatorship 的 strategyproof/unanimity，并从个体/群体 harm 约束反推 alignment protocol。它提醒 RLHF 不是中性的偏好平均，而隐藏了社会选择结构；实证覆盖肾脏分配、慈善食品、LLM response 和 trolley problem。它更偏规范理论，未给具体 post-training recipe 或模型泛化，因此列为概念速读。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 35. [Preference Optimization for Non-Verbal Vocalization Synthesis](https://arxiv.org/abs/2608.24163)

这项工作系统比较 DPO 等 preference optimization 对笑、咳嗽、叹息等 18 类 non-verbal vocalization 的作用，并用 objective、LLM 与人评共同检查表达实现和 lexical fidelity，最终给出标准 DPO 的有效配置。它说明 post-training 不应只覆盖文本与图像，也能改变 expressive speech 行为；但任务窄、reward 与人评一致性可能受听感主观影响，且摘要缺关键绝对数，所以放中相关。更值得复查的是偏好优化是否提高自然表达时牺牲了文字可懂度，以及不同文化听众的偏好能否泛化。 论文分类为 Audio and Speech Processing (eess.AS) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)，列入 2026-08-26 官方列表。

### 36. [MetaRAG: Belief-Action Aligned Policy Optimization for Agentic RAG](https://arxiv.org/abs/2608.24214)

MetaRAG 在每次 search/answer action 前先显式 verify，再从同一 context probe policy 的 answerability belief，用 belief–action consistency reward 约束“认为证据够了却继续搜”或“认为不够却作答”；reward 还由答案正确性 gate，防止一致但错误。7 个 QA benchmark 上改善 accuracy–efficiency trade-off，并转移到 deep research、不同 optimizer 与 backbone。边界是 belief probe 未必忠实，最终正确 reward 仍可能掩盖引用错误。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 37. [TRACE: An Evidence-Grounded Benchmark for Safety Evaluation of Large Reasoning Models](https://arxiv.org/abs/2608.24232)

TRACE 把 safety evaluation 从 prompt/final answer 扩到 reasoning trace，并给每个判断附 source evidence。双语、9 类风险、10 类攻击、4 个 reasoning model 的数据上，18 个 guardrail model 对 trace 的安全判断明显难于输入或答案，也难精确抽取依据。它不直接训练模型，却是 reasoning post-training 的重要 gate：如果安全训练只看 final refusal，会漏掉中间不安全内容；benchmark 的标注一致性和 chain-of-thought 可见性仍是边界。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 38. [RePolicy: Reinforcement Learning for Safety-Policy Invocation in Agent Safeguards](https://arxiv.org/abs/2608.24275)

RePolicy 学习从动态 policy library 中调用适用安全条款，再生成 grounded rationale 与 trajectory safety judgment。PolicyTraj-20K 做 SFT 初始化，之后用 GRPO、verifiable reward 和 policy-context perturbation 提升未见轨迹与变化政策下的 invocation。6 个 Agent safety benchmark 上总体检测与政策调用更稳。它是实质 safeguard post-training；但条款库与 verifier 是封闭集合，正确引用 policy 不等于能判断复杂副作用，因此列中相关。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)，列入 2026-08-26 官方列表。

### 39. [VideoHarness-RSI: Recursive Harness Self-Improvement for Long-Video Understanding with Frozen Vision-Language Models](https://arxiv.org/abs/2608.24302)

VideoHarness-RSI 冻结 VLM，只递归搜索如何从长视频构造有限上下文的 executable program。outer proposer 根据已有程序、执行 trace 与评测生成新 harness，成功变体进入后续搜索；从 uniform 与 stronger handcrafted baseline 出发都能提升，且选中 harness 可转移其他长视频 benchmark。它证明外围 context program 是独立优化层；但不是权重 post-training，selection set 被反复搜索、视频任务也与软件 Agent 距离较远。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 40. [OPDSearch+: On-Policy Distillation with RL Refinement for Search-Augmented Reasoning](https://arxiv.org/abs/2608.24310)

OPDSearch+ 先让 student 在 live search 中接受冻结 off-the-shelf teacher 的 per-position forward-KL，再用 RL 突破 teacher 上限，无需先微调 teacher。3B 模型在 7 个 QA benchmark 超过既有 3B RL baseline，HotpotQA +13.1%、2WikiMultihopQA +8.5%。关键判断是蒸馏可以改变 policy 起点，使后续 RL 到达从 scratch 不可达的解；风险是 live retriever 漂移、teacher evidence bias 与搜索成本，故中相关。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 41. [Beyond Static Interpretability: Anticipating Post-SFT Mechanisms from Pre-SFT Parameters for Better Tuning](https://arxiv.org/abs/2608.24482)

论文指出 pre-SFT neuron 不一定是 post-SFT 真正负责新任务的 neuron，因此直接“先解释再只调关键参数”会定位错。作者把 SFT 视为连续参数演化，用 Taylor expansion 从 pre-SFT 参数与目标数据预测 tuning 后的 mechanistic state，并做 neuron/component 双粒度定向更新。它连接 interpretability 与 PEFT，但摘要缺统一行为数字，线性近似在大更新下可能失效，也需防止 post-hoc localization 评价，所以保留为方法速读。 论文分类为 Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)，列入 2026-08-26 官方列表。

### 42. [Neurosymbolic Alignment for Physiologically-Safe Clinical Language Models](https://arxiv.org/abs/2608.24534)

Neurosymbolic Alignment 用 847K-node biomedical graph 的 HGNN world model 按 homeostasis、多跳 plausibility 和 drug interaction 排 preference，再做 on-policy ORPO。2,500 场景上 CSS 69.5%→90.8%，盲医师 harm rate 14.1%→5.1%，独立 rule engine score 也 +21.2 点；200 个 clinician label 的 ECE 0.038、kappa 0.91。证据丰富但仍是合成 clinical benchmark，作者也承认需真实数据外部验证，故中相关而非泛化强结论。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-26 官方列表。

### 43. [On-Policy Self-Distillation in Diffusion Models](https://arxiv.org/abs/2608.24646)

DiffusionOPSD 把 image-level reward gradient 转成 clean-output prediction 的正负 target，冻结 behavior policy 生成 query/anchor，trainable policy 有限拟合后用 EMA 更新。两个 backbone、10 个 evaluator 的 20 个 matched setting 中 19 个最好，最高胜 strongest competitor 44%，GPU-hours 比 DiffusionNFT 少 40%/63%。它把 target construction 与实际更新效果分开测量，方法严谨；但属于图像 diffusion，对 LLM 行为迁移有限，所以列中相关。 论文分类为 Computer Vision and Pattern Recognition (cs.CV)，列入 2026-08-26 官方列表。

### 44. [TurboT2VA: Fast Large-Scale Text-to-Video-Audio Generation via Score-Regularized Consistency Distillation](https://arxiv.org/abs/2608.24674)

TurboT2VA 用 per-modality normalization 与离散 warm-up→连续 consistency→distribution matching 课程蒸馏 19B video-audio model。512×768 下 50.52s 降至 2.51s（20.1×），高分辨率配合 W8A8、算子融合和稀疏注意从 318.74s 降至 5.83s（54.67×），同时维持同步与多样性。它是 multimodal post-training/系统协同的强工程结果；但生成质量依赖指标与 demo，未作核心深读。 论文分类为 Computer Vision and Pattern Recognition (cs.CV)，列入 2026-08-26 官方列表。

### 45. [Meta$^n$: Recursive Self-Improvement through Emergent Depth](https://arxiv.org/abs/2608.24735)

Meta^n 固定 meta-operation Ω，却反复把上一层 solver trace 与生成代码作为下一层输入，形成更深 strategic pre-process 和 helper library，再用 evolutionary archive 搜 layer chain。两种 backbone、8 组 benchmark 上超过既有 self-improving agent，ARC-AGI-2 唯一高于 0。它的“递归输入而非改写 updater”有趣，但主要是 harness/test-time evolution，搜索成本、held-out 消耗和真正持续学习界限不清，故中相关。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Systems and Control (eess.SY)，列入 2026-08-26 官方列表。

## 可留意 / 可跳过

这些工作与两条主线有明确边缘关系，但今天不值得按核心论文投入同等阅读成本。

- **[SDR Driver for Precise Timing Applications](https://arxiv.org/abs/2608.23614)**：AI 辅助生成 SDR driver 后只需有限调试，报告开发量级下降；但缺少受控 baseline、完整测试与时间测量，更像工程案例。
- **[LLM Agents Perform Controlled Experiments Using Simulation Models](https://arxiv.org/abs/2608.23622)**：让多 Agent 调用制药 simulation 做 controlled experiment，而非只生成建议；领域证据有价值，但任务专用且不涉及软件 change 或 post-training。
- **[Beyond the Mandate: A Systematic Security Analysis of the Agent Payments Protocol (AP2)](https://arxiv.org/abs/2608.23858)**：AP2 支付协议的系统安全分析适合关注高风险 Agent authority；本文主线是协议攻击面，不是 coding 或训练方法。
- **[Hybrid Semantic Tool Discovery for Enterprise MCP Gateway: Architecture and Implementation](https://arxiv.org/abs/2608.23992)**：企业 MCP gateway 的语义 tool discovery 有部署价值；应重点看检索错配和权限边界，目前与执行后 oracle 距离较远。
- **[Poisoning Agentic Alpha: Adversarial Vulnerabilities Across Roles and Architectures in Multi-Agent Trading Systems](https://arxiv.org/abs/2608.24069)**：多 Agent 交易系统的 role/architecture poisoning 暴露编排安全问题；金融仿真不能直接代表软件仓库，但 threat model 可留意。
- **[SA-Bench: Evaluating Semantic Alignment in LLM-Based Paper Reproduction](https://arxiv.org/abs/2608.24252)**：SA-Bench 评估 LLM paper reproduction 的 semantic alignment，接近 ReproAgent 的评价侧；需核对它是否有独立执行而非 judge-only 分数。
- **[EviDx: Evidence-Aware Active Diagnosis with Scaffolded LLM Agents](https://arxiv.org/abs/2608.24570)**：EviDx 强调主动诊断和证据 scaffold，适合 agent reasoning 可靠性背景；医疗诊断应用与软件 change 主线较远。
- **[A Literate Programming Environment for Human and Machine Agents](https://arxiv.org/abs/2608.24644)**：literate programming 环境把 prose、name graph、code 与测试共置，可能改善 coding-agent context；目前主要是系统原型，缺少仓库级对照。
- **[From Natural Language Requirements to Graphical User Interfaces: Automated Prototyping and Verification with Pretrained Language Models](https://arxiv.org/abs/2608.24749)**：自然语言需求到 GUI prototype 并以动态轨迹验证需求，问题相关；工作跨度大、贡献像学位论文合集，需逐项核对可复现性。
- **[Too much of a good thing -- when knowledge distillation promotes overfitting, and how to avoid it](https://arxiv.org/abs/2608.23752)**：中间层 KD 在细粒度、小数据视觉任务有时优于只蒸馏末层；属于通用视觉压缩，不应外推为 LLM distillation 规律。
- **[GAP-Prompt: Gated Adaptive Prompting for Efficient Continual Learning](https://arxiv.org/abs/2608.23782)**：GAP-Prompt 用 gated adaptive prompting 做高效 continual learning；与持续 post-training 相邻，但 foundation-model 行为证据不够集中。
- **[Resilience Matters for Embodied Agents System: New Metrics, Systematic Evaluation, and Optimization](https://arxiv.org/abs/2608.23839)**：embodied-agent resilience 指标与优化值得作为 robustness 对照；训练机制和可验证软件任务都不是核心。
- **[Exploit More, Explore Smarter for Budget-Constrained Agentic Search](https://arxiv.org/abs/2608.23848)**：预算受限 agentic search 的 explore/exploit 调度影响 test-time compute，不改变权重，故属于 post-training 邻近项。
- **[Granite.Trust Policy Tools: Shareable, Actionable Policies for Generative AI Applications](https://arxiv.org/abs/2608.23870)**：Granite.Trust 提供可共享 policy tools，适合安全运行时；本文不是对齐训练，也未证明 policy 执行覆盖。
- **[Recursive Agentic Reasoning](https://arxiv.org/abs/2608.23956)**：统一比较 GROW/PRUNE/BRANCH，49,327 个项目上 BRANCH 平均 +5.98 点；这是 paired test-time reasoning 评测，不是 post-training。
- **[Steering Recurrent Reasoners at Inference Time with Readout Feedback](https://arxiv.org/abs/2608.24136)**：以 readout feedback 在推理期 steering recurrent reasoner，属于 inference-time intervention，可用作 post-training baseline 而非同类方法。
- **[Selective Regenerative Decoding: Trajectory-Level Intervention for Inference-Time Reasoning](https://arxiv.org/abs/2608.24338)**：Selective Regenerative Decoding 只重生退化 suffix，理论与实验证明省 token；仍是 decoding，不改变模型长期能力。
- **[Beyond Semantic Accuracy: Consequence-Aware Evaluation for Safety-Critical Language Understanding](https://arxiv.org/abs/2608.24621)**：consequence-aware safety-critical language evaluation 能约束训练目标，但论文主贡献在 metric，不是具体 alignment recipe。
- **[IDeaL: Data-Free Multi-Teacher Distillation via Improved Dead Leaves](https://arxiv.org/abs/2608.24759)**：IDeaL 从教师自身生成去相关 dead-leaves 样本做无数据多教师视觉蒸馏；结果有趣，但与 LLM post-training 证据距离较远。
- **[Right Diagnoses, Decorative Reasoning:A Perturbation Audit of Medical Chain-of-Thought](https://arxiv.org/abs/2608.24790)**：医疗 CoT 扰动审计发现诊断正确时 reasoning 可能只是装饰；适合作为 process-supervision 警告，但不是训练方法。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 主要证据 | 可信边界 |
|---|---|---|---|---|
| [From Traceability to Justifiability: Accountability Structures in Agentic Software Engineering](https://arxiv.org/abs/2608.23610) | 发布同一性 | 行为元组哈希与 assurance ladder | 47 平台+30 仓库双轮审计 | 公开文档会快速过期 |
| [Identifying Latent Declarative Representations of Code for Assisting Repository Migration](https://arxiv.org/abs/2608.23619) | 仓库迁移 | ADFD 语义瓶颈与双闭环 | 50 仓库、382 probes、85.6% | Fortran→Python 与 oracle 有限 |
| [When May an Agent Stop? Evidence-Carrying Termination for Tool-Using LLMs](https://arxiv.org/abs/2608.23623) | 安全终止 | claim receipt + closed replay | 0/288 与 0/66 unsafe | 合成任务、可信 contract 前提 |
| [Callability Is Not Operability: Controlled Interface Interventions for LLM Agents](https://arxiv.org/abs/2608.23628) | 工具可操作性 | 接口语义配对干预 | 固定 task/backend/model 比机制 | 真实跨系统事务更复杂 |
| [FPGAgent: An LLM-Assisted Framework for Autonomous HLS Code Generation and Verification in FPGA Environments](https://arxiv.org/abs/2608.23630) | FPGA 代码生成 | 仿真—综合—板级执行闭环 | 78 题，功能正确 +30.6 点 | 单工具链与硬件环境 |
| [Function-Level Execution Feedback for Code Preference Optimization](https://arxiv.org/abs/2608.23632) | 代码局部信用 | 函数级测试 + stepwise KTO | 四个代码 benchmark | 函数分解与自动测试偏差 |
| [ToolRobustBench: Stage-Wise Perturbation Evaluation and Failure Diagnosis for Tool-Calling Agents](https://arxiv.org/abs/2608.23635) | 工具鲁棒性 | 四层扰动、五阶段归因 | 15,456 实例、7 模型 | 本地单调用工具为主 |
| [Beyond Executable Models: The Pufibara Agent Harness and the Modelica Agent Workflow Benchmark for Physical System Modeling](https://arxiv.org/abs/2608.23653) | 工程 harness | 候选绑定仿真证据 | 232 题，202 对 185/187 | Modelica 封闭域 |
| [Are Android GUI Agents Robust Against Runtime Anomalies? AnTrap: Evaluating Agents in Dynamic Adversarial Environments](https://arxiv.org/abs/2608.24099) | Android 动态异常 | 四层十类 trap + adversarial RL | 16 模型，thinking 仍显著掉点 | 人工异常与设备范围 |
| [Robust Code RL via Faulty-Code-Driven Test case Synthesis and Dense Reward Shaping](https://arxiv.org/abs/2608.24135) | 代码 RLVR oracle | faulty-code 反推测试 + dense reward | LiveCodeBench +3 点 | 合成测试共盲点 |
| [Task-Adaptive Rubrics for GUI Reward Modeling](https://arxiv.org/abs/2608.24174) | GUI reward | 任务族粗 rubric + 实例细约束 | F1 +3.6、成功率 +4.23 | 截图与模型 judge 盲点 |
| [ReproAgent: Contract-Guided Paper-to-Code Reproduction](https://arxiv.org/abs/2608.24291) | paper-to-code | 双通道持久 contract | 两 backbone 同 scaffold 最佳 | benchmark score 不等科学复现 |
| [Ockhamareto: Pareto-Gated Segment-Level Credit Assignment for Concise Unit-Test Generation with Reinforcement Learning](https://arxiv.org/abs/2608.24473) | 测试生成 RL | Pareto gate + segment credit | 49.9% 对 31.3%，测试更少 | mutation 不等全部真实 bug |
| [Joint Optimization of Tool Creation and Use for Large Language Model Agents](https://arxiv.org/abs/2608.24571) | 工具生成与使用 | 单 policy、三轴 verifier | held-out 79.9；跨 350M/30B 转移 | 短 Python 工具、封闭 verifier |
| [StarHarness: Evolving Harnesses with Stratified Search for Enterprise Environments](https://arxiv.org/abs/2608.24804) | harness 演化 | 分层搜索、隐藏选择、held-out | 三环境 +20–35 点 | selection 被多轮消耗 |
| [Recursive Experiential-Working Memory Evolution for Long-Horizon Agent Harnesses](https://arxiv.org/abs/2608.24876) | 长程外部记忆 | working/skill memory 耦合更新 | 37 配对中 35 提升 | 任务分布漂移与传播风险 |
| [ADE: Agentic Data Evolution Framework for Human-Centered Objectives](https://arxiv.org/abs/2608.23719) | 合成数据演化 | snapshot OVS + 稳态准入 | extrinsic win 55.20→68.86 | evaluator 过拟合 |
| [Mitigating Exploration Bias in RL for Multi-Instruction Following](https://arxiv.org/abs/2608.23830) | 多指令探索偏差 | bootstrapping + 稀缺奖励 | 三项可验证 benchmark | 稀有项可能是坏任务 |
| [PROOF-Gen: From Optimized Data to Better Distillation](https://arxiv.org/abs/2608.23911) | 失败轨迹蒸馏 | 逐场景反思恢复 near-miss | 恢复 93%；0.132→0.529 | teacher/reflector 共错 |
| [AHEAD: Adaptive Hindsight with Environment-Augmented Distillation for Agentic RL](https://arxiv.org/abs/2608.24114) | Agent 步骤信用 | 错误步 hint + 全步环境反馈 | ALFWorld +13.3、WebShop +11.0 | 依赖 analyzer 质量 |
| [Preference Data Selection for Mitigating the Alignment Tax in Large Language Models](https://arxiv.org/abs/2608.24192) | alignment tax | 训练前 preference 风险筛选 | 基础能力—对齐 Pareto 最优 | 风险代理依赖域与参考模型 |
| [RecurSE: Bounded Recursive Self-Evaluation for LLM Rubric Judges](https://arxiv.org/abs/2608.24231) | 自改进 judge | 接口解耦 + PAV 停止 | 60.8→73.7；继续训会退化 | 共享盲点与验证集消耗 |
| [Contrastive Branch Policy Optimization](https://arxiv.org/abs/2608.24300) | 分支局部信用 | exact-prefix outcome contrast | 10 benchmark、两尺度领先 | branch 执行成本高 |
| [FARCA: Fact-Aligned Reliability-Aware Credit Assignment for Reinforcement Learning with Factual Supervision](https://arxiv.org/abs/2608.24350) | 事实信用 | token 对齐 + 反事实可靠权重 | 平均 +1.75–2.21 点 | 依赖 evidence/verifier |
| [IAPO: Influence-Aware Policy Optimization for Credit Assignment in Multi-Turn Service Agents](https://arxiv.org/abs/2608.24588) | 多轮 service credit | typed influence graph 路由优势 | 三 service benchmark 提升 | 图由 annotator 推断 |
| [On-policy Distillation with Verifiable Reward](https://arxiv.org/abs/2608.24696) | OPD × RLVR | 正确性 ReLU 门控隐式 reward | AIME24 +6.5、AIME25 +10.9 | 集中于数学 verifier |
| [SkillForge: Evolving Verifiable Skills for Reinforcement Learning Agents](https://arxiv.org/abs/2608.24747) | 技能持续演化 | 显式调用 + 环境验证 | ALFWorld 93.6、WebShop 83.0 | 同类环境内验证 |
| [StepGuard: Learning Step-Level Guardrails with Scalable Supervision and Safety-Utility Balancing](https://arxiv.org/abs/2608.24777) | 动作前安全 | matched step data + Balance-GRPO | ASR -77.3%，utility -2.8 | 开放攻击面仍有限 |
| [CAFE: Self-Improving Search Agents Need Co-Evolving Feedback](https://arxiv.org/abs/2608.24794) | Agent/critic 共演化 | call–skip 信号 + RDPO | EM 52.5，6 个 OOD 保留 | 共享参数可能形成 shortcut |


## 我的判断

**整体创新性：A。** 这一天真正的新意集中在评测与训练单位的变化：行为配置元组、候选绑定证据、工具 operability、函数与测试 segment、exact-prefix branch、influence graph、可验证 skill，都比“整条回答”更接近实际负责对象。

**实用价值：A。** ECT、AFT、FPGAgent、Pufibara、AdaptRubric、StarHarness、StepGuard 都给出可执行协议或可复用工具。代价同样清楚：需要维护 receipt、状态机、候选身份、硬件/模拟环境、隐藏选择集和版本化技能库，可靠性不会由更长 prompt 免费获得。

**严谨性：A-。** 多篇论文采用配对接口干预、冻结协议、held-out selection、独立 evaluator、负结果或继续训练退化的证据，明显优于只报最好 checkpoint。不过主要不确定性仍是合成环境、自动 verifier 共盲点、公开 benchmark 污染、多轮搜索对验证集的消耗，以及外部记忆/技能在真实软件版本变化下是否持续有效。

**推荐价值：A。** 如果只选几篇精读，coding-agent 线优先看 AFT-Bench、ADFD-Migrate、FPGAgent、Pufibara 和 StarHarness；post-training 线优先看 STEP-KTODER、RecurSE、CBPO、IAPO、SkillForge 与 StepGuard。它们共同提供了一个更可靠的研究起点：先问 reward、state 和 evidence 是否指向真正的责任位置，再讨论模型是否变强。
