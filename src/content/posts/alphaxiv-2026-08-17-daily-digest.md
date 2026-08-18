---
title: "可靠 Agent 不只要做对，还要能回滚：8 月 17 日 arXiv 的仓库一致性、可执行监督与训练系统"
date: "2026-08-18"
description: "8 月 17 日的新论文把可靠 coding agent 的依赖一致性、原子执行和故障验证，与 post-training 的数据难度、可验证环境和系统调度共同推向了可审计闭环。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Post-Training", "RLHF", "GRPO", "可验证奖励", "程序修复", "软件迁移", "GUI Agent"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-neutral-950 via-emerald-950 to-red-950"
---

2026 年 8 月 17 日这一批论文值得读，不是因为又出现了一个更高的单点 benchmark 分数，而是因为研究者开始系统追问：agent 的一次成功能否跨仓库依赖、外部状态和故障注入仍然成立。coding-agent 方向同时出现了依赖感知迁移、GUI 原子性、ACID 式事务、可回滚执行、协议级授权和差分故障注入。post-training 方向则把注意力从单一优化器移到数据难度、跨语言 GRPO、专家 rubric、可验证环境合成、视觉 on-policy 蒸馏和 GPU phase scheduling。共同趋势很清楚：能力提升只有在训练信号、执行状态和验证证据都能追溯时，才足以转化成可靠系统。

本轮逐项核对 arXiv 官方 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG，并补充 cs.IR、cs.CV、cs.CR、cs.OS 的 `pastweek` 页面，九个页面均定位到 **Mon, 17 Aug 2026**。合并 New 与 Cross submissions 后得到 **380 篇唯一条目**，最终纳入 **81 篇实质相关论文**：coding-agent / software-change 主线 52 篇，post-training 主线 37 篇，其中 8 篇重叠。19 篇强相关论文均从 `https://arxiv.org/pdf/<id>` 下载，完成 `%PDF`、文件大小、文本抽取和首页渲染验证；中相关与可留意项基于官方摘要和元数据筛选。下文的“发布日期”指进入 2026-08-17 官方列表的日期。

## 今日脉络

第一条脉络是 **软件变更的正确性正在从文件级输出升级为状态级不变量**。DepWareTrans 要求迁移批次保持依赖闭包，LegacyWorld 把 GUI 成功拆成完成、可安全失败与非原子副作用，Agentic Transaction 则把 atomicity、consistency、isolation、durability 重写成 agent runtime 的语义约束。三者共同说明：一个 patch 能编译或一段 GUI 轨迹到达末屏，都不足以证明系统状态正确。

第二条脉络是 **失败后的恢复能力成为一等研究对象**。AgentRewind 同步保存上下文与环境 checkpoint，Mandato 在工具协议层阻断越权并留下哈希链证据，差分故障注入则检查现代化前后的程序是否在异常条件下保持相同行为。可靠性不再只是“尽量少失败”，而是“失败可发现、可界定、可撤销、可审计”。

第三条脉络是 **post-training 开始承认训练样本没有统一难度，也没有统一反馈制度**。Capacity-Dependent Data Selection 发现高似然样本适合小模型和早期训练，低似然样本却可能在大模型长训练中带来更大收益；APTER 把专家标准变成可追踪 rubric；Envs-FORGE 依据当前 policy 的通过率逐 seed 选择环境生成动作。这些工作都在反对“一套数据筛选或一个 scalar reward 适合所有阶段”的隐含假设。

第四条脉络是 **训练基础设施本身决定可得到的 policy**。视觉 on-policy 蒸馏通过人为制造 teacher-student 信息差获得无标签信号，Rollplex 则在不破坏同步 on-policy 语义的前提下重排 rollout、reference 与 actor training。训练 recipe 的有效性，越来越取决于数据、奖励、执行环境和调度系统是否作为一个整体设计。

## 强相关论文深读

### 1. Diverse Evaluation：SWE-bench 提升不能自动外推成“通用编码能力”

**论文信息**：*Don't Claim Benchmark-Oriented Optimization Improves General Coding Capability -- Diverse Evaluation Is Required*；Egor Shibaev 等；[arXiv:2608.13566](https://arxiv.org/abs/2608.13566)；cs.LG / cs.AI / cs.SE；发布于 2026-08-17。

**一句话 TL;DR**：论文用 Django 多模态任务检验 SWE-bench 轨迹 post-training 的外推性，发现 checkpoint 在目标 benchmark 上的优化很少稳定迁移到新的编码任务。

**为什么值得推荐**：coding model 论文常把 SWE-bench 或 LiveCodeBench 的单点增益写成一般能力提升，但训练数据、agent harness 和评测任务共享结构时，分数可能只反映适应性。本文直接检验 claim 与 evidence 之间的 meaning gap，价值在于给“general coding capability”设置了更高证据门槛。

**方法怎么工作**：第一步构建 Django-centered suite，把 coding 拆成模型、视图、模板、迁移和调试等不同任务模态；第二步在 foundation model、SWE-bench trajectory post-training checkpoint 与单模态 fine-tuning checkpoint 之间做横向比较；第三步检查同一排序能否跨 Django 子任务、LiveCodeBench 与 SWE-bench 保持，并据此提出 frontier model、研究模型和窄域应用三种差异化评估制度。论文的 Figure 1 用“benchmark score 到 broad claim”的断裂概括研究问题。

**关键实验与证据**：核心结果不是一个新的 SOTA 数字，而是多次排名翻转与“有限或零迁移”：SWE-bench 优化 checkpoint 在 Django suite 和 LiveCodeBench 上没有稳定收益，单个 Django 模态的微调也不向其他模态可靠扩散。负结果与统一 checkpoint 比较比再报一个 aggregate score 更有判断力。

**局限和可信度**：Django 仍只是一个框架，任务构造可能偏向其 ORM、模板和迁移约定；论文能否支持“所有 benchmark optimization 都不泛化”，取决于未来跨语言、跨仓库和长期维护复核。可信之处在于它没有把新 suite 包装成终极 benchmark，而是把结论限定为“小量 benchmark 不足以支撑广义能力声明”。

**与当天主题的关系**：它为今天全部论文设定了证据原则：局部成功只有通过异质任务与独立 oracle 才能变成能力结论。

### 2. Learning Harness without Labels：无标签环境里，用 teacher-relative lift 检查持续学习是否真的有效

**论文信息**：*Evaluating Agentic Learning Harness Capabilities Without Labels via the Scaling Hypothesis*；Aryan Luthra 等；[arXiv:2608.13608](https://arxiv.org/abs/2608.13608)；cs.AI / cs.CR / cs.LG；发布于 2026-08-17。

**一句话 TL;DR**：更强 teacher 只给稀疏纠正，评价指标看带 memory/retrieval harness 的 student 是否持续靠近 teacher，并用隐藏 gold 验证这种 lift 是否可信。

**为什么值得推荐**：持续学习 harness 的真实场景往往没有新鲜标签，直接用同级 LLM-as-a-judge 又容易得到无信息的自我确认。本文把“学习系统有没有变好”变成可检验的 teacher-relative convergence，而不是要求每个 operational sample 都有人工 gold。

**方法怎么工作**：第一步让较强 teacher 对 student 的少量运行给高精度 correction；第二步由 continual-learning harness 将纠正写入检索或记忆并在后续任务调用；第三步测量 student 相对 teacher 的差距是否随时间收敛，再在研究阶段用 withheld gold 检查 teacher-relative lift 与真实 lift 的相关性。Figure 1 的设计把无标签部署指标和有标签验证层明确分开。

**关键实验与证据**：论文跨多类安全任务、模型家族和 harness 设计观察到 teacher-relative improvement 与 held-out gold improvement 同向，而能力相近模型之间的 LLM-as-a-judge 给不出可用区分信号。这支持“强 teacher + 稀疏纠正”作为 proxy，但不是把 teacher 当作绝对真值。

**局限和可信度**：scaling hypothesis 只有在 teacher 的错误与 student 不高度相关、纠正样本不严重偏置时才成立；安全场景中的新型攻击可能同时骗过二者。论文还不能替代周期性人工审计，更不能证明 teacher-sized model 通过少量人类纠正就必然持续提高。优势是 proxy 最终经过隐藏 gold 校准，而非仅凭理论直觉。

**与当天主题的关系**：它说明 post-training 的监控也需要独立证据层，和 coding-agent 的外部执行 oracle 形成对应。

### 3. MOOSEDev：项目记忆需要生命周期、否定与 supersession，而不只是向量相似度

**论文信息**：*Ontology-Grounded Project Memory for Coding Agents*；James Adam；[arXiv:2608.13662](https://arxiv.org/abs/2608.13662)；cs.AI / cs.SE；发布于 2026-08-17。

**一句话 TL;DR**：MOOSEDev 把架构决策、约束、经验和 rationale 存成带 provenance 与 supersession 的知识图，通过 MCP 让 coding agent 查询仍然有效的项目事实。

**为什么值得推荐**：真实项目最危险的不是“没检索到旧知识”，而是把已废弃的设计决定当成当前事实，或在需要完整集合时只取 top-k 相似项。论文击中向量 memory 在否定、集合完整性和时间演化上的结构性弱点。

**方法怎么工作**：第一步定义 typed ontology，将 decision、constraint、lesson、rationale 及其来源写成记录；第二步为每条记录附 lifecycle status、provenance 与 supersession edge，使更新不是覆盖旧文本，而是保留演化关系；第三步通过 MCP 暴露查询接口，由符号层先执行集合、否定和时间约束，再把结果交给 agent。论文还用 commit history bootstrap 初始化项目记忆，并预注册 live trial。

**关键实验与证据**：在 835 条中性公开记录上，MOOSEDev 对 supersession、set-completeness 和 negation 问题返回期望集合的 **0.98-1.00**，生产向量记忆工具 top-k 只覆盖 **6%-27%**；普通 relevance recall 与 token cost 则大致相当。也就是说，优势集中在结构查询，不是所有 retrieval 都更强。

**局限和可信度**：核心 neurosymbolic engine 是 proprietary，ontology 建模和 commit bootstrap 都可能引入人工偏见；835 条记录与自有代码库不能代表大型多团队仓库。对比还是 backend bundle，而非逐组件消融。论文把普通 relevance 不占优写得很清楚，因此结论应限定为生命周期与逻辑查询优势。

**与当天主题的关系**：它把软件演化中的“当前有效状态”引入 agent memory，是事务一致性与可回滚执行的知识层前提。

### 4. Multilingual GRPO：跨语言迁移可以很强，也可能悄悄伤害域外能力

**论文信息**：*GRPO Beyond English: A Large-Scale Study of GRPO in Non-English and Multilingual Settings*；Konstantin Dobler 等；[arXiv:2608.13698](https://arxiv.org/abs/2608.13698)；cs.CL / cs.LG；发布于 2026-08-17。

**一句话 TL;DR**：大规模语言 × 模型 × reasoning-language 实验表明，本地语言 RLVR 常接近英语推理训练且能跨语迁移，但某些训练语言会造成严重域外回退。

**为什么值得推荐**：GRPO/RLVR 的主流经验几乎都从英语数学推理得出，容易把“reward 可验证”误当成“训练行为与语言无关”。本文真正贡献是把训练语言、推理语言、模型底座和跨语泛化同时放进控制网格，专门寻找负迁移。

**方法怎么工作**：第一步在多个 base model 上分别构造单语与多语 GRPO 训练；第二步改变 reasoning language reward，区分回答语言和内部推理语言的作用；第三步在训练语内、其他语言和域外能力上联合评估，以 transfer matrix 和 regression audit 而非单一平均分解释结果。Figure 1 的实验矩阵强调跨语言不是一个总分问题。

**关键实验与证据**：论文发现 native-language reasoning 与 English-reasoning training 通常只差一个小 gap，而且单语训练经常改善多种其他语言；但收益高度依赖 model × language cell，部分语言训练对其他语言的域外任务造成严重 regression。这一正一负结论比“多语 GRPO 有效”更重要。

**局限和可信度**：摘要没有把所有语言的效应量压成统一数字，读者需要查看各矩阵而不能只引用平均值；可验证推理任务也不代表对话、安全或工具使用。语言数据质量、tokenizer 和基础模型预训练比例仍是混杂因素。可信度来自大规模 controlled grid 和主动报告负迁移。

**与当天主题的关系**：它与版本回退和多任务评估共同提醒：post-training 的 aggregate gain 不能掩盖局部能力倒退。

### 5. Capacity-Dependent Data Selection：高似然样本不是普适好数据

**论文信息**：*Capacity-Dependent Effects of Data Selection for Reasoning*；Cuong Dang、Hoang Anh Just、Ruoxi Jia；[arXiv:2608.13721](https://arxiv.org/abs/2608.13721)；cs.LG / cs.AI / cs.CL；发布于 2026-08-17。

**一句话 TL;DR**：小模型更需要贴近当前分布的高似然答案，大模型训练足够久后反而能从低似然、高跨度 teacher response 中获得更多。

**为什么值得推荐**：reasoning SFT 的数据筛选常把 student likelihood 当作单调质量信号，默认“越容易模仿越适合训练”。本文发现的是明确的 capacity × duration interaction，说明数据价值取决于学生能否吸收以及训练预算是否足够。

**方法怎么工作**：第一步由强 teacher 为同一数学问题生成多个候选 response，并按 student likelihood 分成高低难度；第二步在 **1.5B 到 8B** 的 student 上控制数据量与训练时长，追踪早期和后期曲线；第三步分析输出是否出现浅层、重复或向 teacher distribution 移动，并用 capacity-constrained distillation 理论连接 data span、模型容量和可达误差。Figure 1 把这一现象概括为 Fast-Fit / Slow-Gain。

**关键实验与证据**：高似然数据在小模型和训练早期带来更快、更稳定的提升；低似然数据对小模型可能诱发重复和浅层行为，却在更大模型、训练更久时逐步反超。论文覆盖四个数学 reasoning benchmark，得到的是稳定交互趋势，而非只在一个数据集上的排序。

**局限和可信度**：数学推理、1.5B-8B 尺度和 teacher-generated response 限制了外推；likelihood 还同时编码长度、风格和解题路径，未必是纯“难度”。理论是 capacity-constrained view，不是完整训练动力学证明。控制容量和 duration 的实验足以否定统一筛选规则，但不足以给出自动 curriculum。

**与当天主题的关系**：它为 Envs-FORGE 的 per-policy 环境选择提供训练侧解释：同一个样本不会对所有 policy 同样有用。

### 6. Niche Code Translation RL：用执行结果自举 25 种语言的 many-to-many 翻译

**论文信息**：*Bootstrapping Niche Multilingual Code Translation via Reinforcement Learning with Execution-Based Verifiable Supervision*；Kouki Yuki 等；[arXiv:2608.13854](https://arxiv.org/abs/2608.13854)；cs.CL；发布于 2026-08-17。

**一句话 TL;DR**：论文从可执行 Python seed 扩展多语言代码池，用执行结果标注 preference、训练 reward model，再以 GRPO 覆盖 **600** 个有向语言对。

**为什么值得推荐**：代码翻译最缺的不是生成语法相似文本，而是稀有语言间可执行的平行监督。本文把 compilation/execution 作为数据生成、reward learning、policy optimization 与 benchmark 的共同 oracle，形成完整可验证闭环。

**方法怎么工作**：第一步把 Python seed 翻译到 25 种语言，只保留通过执行验证的程序，形成多语 pool；第二步让 base LLM 在语言对之间生成候选，以执行成败构造 preference 并训练跨语言 reward model；第三步在 **25×24=600** 个方向上用 GRPO 优化 4B/9B 模型，并用新建 HumanEval-X++ 和已有 benchmark 做 execution-based 测试。Figure 1 展示了 pool generation、reward modeling、RL 和 evaluation 四段管线。

**关键实验与证据**：Qwen-3.5 4B 在 HumanEval-X++ 全语言平均提升 **13%**，中等资源语言提升 **21%**，4B 与 9B 在多个 benchmark 上均优于未训练底座。结果说明可验证 supervision 可以跨稀有语言扩张，而不是只记住少量主流 pair。

**局限和可信度**：reward model 仍可能学习测试 harness 的表面特征；通过有限输入的执行不等于语义等价，语言 runtime 和库版本也会造成不对称。HumanEval 风格短函数不能代表 repository migration。优势是训练和评估都使用真实执行，且语言覆盖显著超过传统 C++/Java/Python 设置。

**与当天主题的关系**：它是两条主线的直接交叉点：post-training 的 reward 由代码行为产生，软件变更质量由执行而非文本相似度决定。

### 7. Engineering Reliable Coding Agents：模型只是可靠性依赖链中的一层

**论文信息**：*Engineering Reliable Coding Agents: Evaluating and Operating the System Around the Model*；Stephanie Jarmak；[arXiv:2608.13867](https://arxiv.org/abs/2608.13867)；cs.SE / cs.AI；发布于 2026-08-17。

**一句话 TL;DR**：这部 monograph 将 task、harness、execution、retrieval、memory、permission、verification 和 observability 组织成一条会相互放大失败的系统依赖链。

**为什么值得推荐**：coding agent 往往以“模型分数”被评估，却以“分布式执行系统”被部署。论文的价值不在新模型，而在把 infrastructure effect、repair asymmetry 和 evidence gate 统一为操作框架，迫使评估者说明失败到底来自模型还是环境。

**方法怎么工作**：第一步结构化汇总 **164** 篇学术工作、**100** 条 practitioner record、**29** 条 benchmark record 与 **17** 个 author-system case；第二步按任务构造、执行环境、检索、状态、验证和观测性建立 versioned evidence ledger；第三步将结论转成 gated practice、可运行 protocol 和带 evidence map 的 agent skill，并通过 targeted update audit 记录哪些检索 lane 仍未执行。

**关键实验与证据**：最终 catalog 含 **206** 条 reliability record，其中 **193** 条 gated practice、**56** 条深度实践和 **13** 个 research lead。其核心观察是很多“模型失败”由执行与状态层触发，而且单层提升常不能传到 end-to-end outcome。论文不是 meta-analysis，没有汇总效应量，但 provenance 和可执行 protocol 提高了审计价值。

**局限和可信度**：证据覆盖是 structured 而非 exhaustive，不同主题的证据强度不一，作者系统案例也可能偏向可观察问题。catalog 不能替代具体 workload 的 matched experiment。值得肯定的是论文显式记录未检索 lane 与证据等级，没有把 practitioner record 当成同等因果证据。

**与当天主题的关系**：它为依赖迁移、事务、回滚和 fault injection 提供总框架：这些都不是模型附件，而是系统可靠性的组成部分。

### 8. Agentic Transaction：把 ACID 从数据库重新解释成 Agent 的语义保证

**论文信息**：*Agentic Transaction: Towards ACID-Compliant Agent Systems*；Zhaoyan Sun、Xiaoxiao Wang、Guoliang Li；[arXiv:2608.13900](https://arxiv.org/abs/2608.13900)；cs.DB / cs.AI / cs.CL / cs.LG；发布于 2026-08-17。

**一句话 TL;DR**：论文用 Semantic Atomicity、Consistency、Isolation、Durability 约束长程 agent，并在数据 agent 中实现 transactional exploration-execution-validation。

**为什么值得推荐**：传统 ACID 管的是确定性 transaction，agent 的计划、工具调用和状态解释却带概率性。如果直接套数据库 rollback，会遗漏“目标语义是否完成”“并发 agent 是否互相污染”等问题。本文的贡献是给这类系统保证命名并给出可实现机制。

**方法怎么工作**：第一步将 agent trajectory 切成带目标与检查条件的 atomic semantic unit；第二步通过 exploration-execution-validation cycle、confidence-divergence validation 和 semantic dependency 隔离候选操作；第三步把通过验证的技能与状态写入 transaction-aware semantic store，并以 durability policy 决定哪些成果可跨任务保留。Figure 1 展示了 atomic unit、consistency validation、dependency-aware isolation 与 durable skill hub。

**关键实验与证据**：在多个常用数据 agent benchmark 上，系统相对包括 Claude Code 在内的 SOTA agent 提升 **10.6%**。论文还展示并发探索与候选验证如何减少错误提交。结果有启发性，但 aggregate improvement 不能单独证明四项语义属性都成立。

**局限和可信度**：semantic consistency 的 oracle 仍可能由 LLM confidence 和有限测试近似；外部系统未必支持补偿事务，真实 API side effect 也可能无法 rollback。实验主要是 data agent，离多仓库、GUI 和异步工作流还有距离。框架价值高于当前性能结论，后续需要 property-level fault injection。

**与当天主题的关系**：它把 LegacyWorld 的 atomicity 与 AgentRewind 的 checkpoint 提升到统一 runtime contract。

### 9. HELIX：Harness 演化既提升当前执行，也生成下一轮 post-training 数据

**论文信息**：*HELIX: Model-Harness Co-evolution for Recursive Self-Improvement*；Tianyu Fan、Chao Huang；[arXiv:2608.13951](https://arxiv.org/abs/2608.13951)；cs.AI；发布于 2026-08-17。

**一句话 TL;DR**：HELIX 将 harness 拆成 typed port、atom、recipe、product shell 与 runtime policy，使每次改动可追踪，并把 sibling trajectory 转成 SFT、critic、filter 和 preference 数据。

**为什么值得推荐**：agent 能力由模型和 harness 共同决定，但通常只保存最终 prompt，丢失哪些工具、终止策略或上下文干预造成了收益。HELIX 把 harness intervention 设为有 provenance 的实验对象，同时把同一任务上的成功、回退、near miss 和替代解转化为学习信号。

**方法怎么工作**：第一步用 typed components 与 source-traceable recipe 表达候选 harness，保持 intervention identity；第二步在固定模型上生成 candidate portfolio，以重复运行和 SWE-bench evaluator 验证 coverage；第三步从 sibling trajectories 抽取 matched 成败记录更新模型，再因模型能力变化重新构建 harness，形成 model-harness-data 循环。Figure 1 清楚画出 build harness、verify、update model、rebuild 的闭环。

**关键实验与证据**：一次 code-repair evolution round 搜索 **65** 个候选，最佳固定 harness 比 Pi 多 **4.0%** task coverage，而完整组合通过互补行为暴露最多 **58.0%** 额外 verified coverage；一个 **200-slot** sibling slice 产出 **438** 条 SFT/critic/filter/preference record。

**局限和可信度**：论文只完成一轮而不是长期 recursive improvement；portfolio coverage 是 oracle union，不等于可部署单一 harness 的成绩。SWE-bench evaluator 与候选搜索仍可能共享偏差，数据记录数也不代表有效训练增益。其可信点是重复运行、保留负例与 provenance，而非只展示最佳 prompt。

**与当天主题的关系**：它把 coding-agent 系统演化和 post-training 连接在真实 verified trajectory 上，而不是机械寻找主题交集。

### 10. APR Cost-Efficiency：更贵的模型和更长推理并不保证更划算的修复

**论文信息**：*Rethinking Automated Program Repair: The Impact of Bug Complexity, Fault Localization, and LLM Cost-efficiency*；Junchi Liu 等；[arXiv:2608.14065](https://arxiv.org/abs/2608.14065)；cs.SE / cs.AI；发布于 2026-08-17。

**一句话 TL;DR**：在 ChatRepair、CodeCorrector 与三类 LLM 的统一实验中，bug complexity 和 fault localization 比“模型更贵、reasoning 更强”更稳定地解释修复差异。

**为什么值得推荐**：APR 报告常把总修复数当成唯一目标，却忽略简单 bug、精确定位和高 token 预算对结果的贡献。本文把 repair effectiveness、bug complexity、定位精度、reasoning setting 和成本同时放入统计分析，适合判断系统在受限预算下是否真的更好。

**方法怎么工作**：第一步按结构复杂度分层 bug，并给出不同精度的 fault localization；第二步以同一任务集运行 ChatRepair 与 CodeCorrector，组合 DeepSeek、GPT、Llama 及不同 reasoning setting；第三步同时计算正确修复、成本和 cost-efficiency，并分析 technique gap 随定位噪声如何变化。论文的表格将“多修几个 bug”和“为此付多少调用成本”分开。

**关键实验与证据**：低成本 APR 对中等复杂 bug 的修复率仍超过 **50%**；GPT-5 比 DeepSeek-V4-pro 与 DeepSeek-V3.2 分别多修 **7** 和 **39** 个复杂 bug，但总成本效率最好的是 DeepSeek-V3.2。定位越不精确，不同 APR technique 的差距越大。

**局限和可信度**：成本依赖 2026 年具体 API 定价、重试策略和 prompt，容易漂移；复杂度与定位分层也可能受 benchmark 设计影响。论文更能支持“成本与效果需联合报告”，不能据此固定选择某个模型。真实仓库还需要构建时间、人工 review 和回归风险成本。

**与当天主题的关系**：它把可靠修复从 model leaderboard 拉回到定位证据和可运营预算。

### 11. Mandato：把 Agent 授权从 prompt 约定提升为协议级可验证 artifact

**论文信息**：*Mandato: Protocol-Level Enforcement of Digitally Signed Mandates on AI Agent Actions with Cryptographically Chained Audit Trails*；Giovanni Racioppi；[arXiv:2608.14074](https://arxiv.org/abs/2608.14074)；cs.AI；发布于 2026-08-17。

**一句话 TL;DR**：Mandato 在 MCP 等工具协议前放置透明 proxy，用签名 mandate 约束工具、参数、上下文、期限和委托人，并记录 permit/deny 的哈希链证据。

**为什么值得推荐**：把“不要调用危险工具”写进 system prompt 不构成授权，因为应用日志既不能证明谁授予了权限，也不能证明执行记录未被改动。论文把 mandate 设计成律师、审计员和工程师都可检查的 machine-readable delegation artifact，问题定义很扎实。

**方法怎么工作**：第一步由 principal 签发 mandate，明确 allowed tool、参数约束、上下文条件、有效期与 delegation chain；第二步 protocol proxy 在 action 到达外部系统前逐条做 decision/enforcement，非合规调用直接阻断；第三步将 permit、deny 与判定证据写入 append-only hash chain，并用 qualified timestamp 周期锚定。Figure 1/2 分别给出 mandate 内容和 MCP-transparent enforcement architecture。

**关键实验与证据**：当前论文主要给出 decision semantics、reference implementation 状态及面向 EU AI Act、GDPR、NIS2、eIDAS 2 的映射；量化 evaluation 仍是计划，指标包括 enforcement overhead、audit completeness 与 tamper-evidence verification cost。因此推荐理由来自机制创新，不来自已完成性能实证。

**局限和可信度**：这是明显的 evidence gap：没有延迟、吞吐、绕过攻击或真实组织授权链实验；签名只能证明 mandate 来源，不能证明 mandate 本身安全合理。外部工具若绕开 proxy，保证也会失效。论文诚实标注 implementation/evaluation 状态，应读作架构提案而非成熟安全产品。

**与当天主题的关系**：它补上事务与回滚之前的第一道边界：什么动作一开始就不应被允许执行。

### 12. DepWareTrans：仓库迁移的最小单元不是文件，而是依赖一致批次

**论文信息**：*DepWareTrans: Dependency-Aware Incremental Repository Migration across Co-executable Languages*；Sivajeet Chand 等；[arXiv:2608.14128](https://arxiv.org/abs/2608.14128)；cs.SE；发布于 2026-08-17。

**一句话 TL;DR**：DepWareTrans 构建仓库依赖图，将相互依赖文件成批迁移，再用编译与测试反馈逐批收敛，避免跨文件符号长期处于不一致状态。

**为什么值得推荐**：file-level translation 在单文件 benchmark 上看似成功，进入真实仓库后却会因调用方、类型、build 和 API 的同步修改失败。论文从工业 Java-to-Kotlin 迁移中定位到 dependency inconsistency，并把 translation unit 提升为 dependency-consistent batch。

**方法怎么工作**：第一步分析源仓库构建和符号关系形成 dependency graph；第二步对强关联文件分组，选择可以在源/目标语言共执行的增量边界，批量翻译而非逐文件替换；第三步每批运行 compile/test，依据错误修正当前批次和暴露的跨批依赖，直到 end-to-end validation 通过。Figure 1 将传统 file-level pipeline 与 dependency-aware incremental loop 对比。

**关键实验与证据**：在 **51K LOC** 的工业 STAR 仓库中，file-level 方法只有 **38.16%** compilation 与 **9.39%** test success，DepWareTrans 在报告设置达到 **100% 编译与测试成功**；Java-Kotlin、Java-Scala、C#-F# 多仓库实验也显示少量迭代内收敛。

**局限和可信度**：研究限定在 co-executable language pairs，依赖解析比跨平台 UI、资源、配置和行为迁移更容易；100% 是既有 test suite 覆盖下的成功，不等于语义完全等价。工业仓库只有一个，分组策略和人工干预量需要进一步披露。尽管如此，file-level baseline 的巨大失败差距非常有诊断价值。

**与当天主题的关系**：它把“跨文件同步修改”写成可执行算法，与 Agentic Transaction 的 semantic consistency 构成仓库层对应。

### 13. LegacyWorld：GUI Agent 的失败必须检查是否留下不可见的持久副作用

**论文信息**：*LegacyWorld: Atomicity-Aware Evaluation of GUI Agents for Legacy Workflows*；Thilo Reintjes 等；[arXiv:2608.14131](https://arxiv.org/abs/2608.14131)；cs.SE；发布于 2026-08-17。

**一句话 TL;DR**：LegacyWorld 为 28 个 Windows legacy workflow 定义 initial state、goal state 和 validator，把结果拆成 useful completion、safe failure 与 non-atomic side effect。

**为什么值得推荐**：GUI benchmark 常按末屏或 agent 声明判成功，但在医疗、业务和企业系统中，一次中途失败可能已经提交半条记录。论文用 atomicity 重新定义 acceptance：要么目标状态完整成立，要么失败后没有非预期持久变化。

**方法怎么工作**：第一步由 domain expert 选择具有真实状态风险的 legacy workflow，并记录 initial/goal state；第二步比较人工编写 prompt 与从 expert golden-path screen recording 生成的 prompt；第三步让六个 hosted computer-use agent 执行，并由 task-specific state validator 同时检查完成、残留副作用和可恢复性，而不是只看视觉轨迹。论文 Figure 1 展示了错误病历/业务状态如何在“任务失败”后继续存在。

**关键实验与证据**：benchmark 有 **28** 个 Windows GUI workflow、**6** 个 agent。结果显示 completion、safe failure 和 non-atomic side effect 是三种不同 profile：有些 agent 完成率不低，却更常留下危险中间状态；workflow capture 改善可执行提示，但不能替代 state validator。

**局限和可信度**：28 个任务和 Windows legacy UI 的样本量有限；validator 需要领域定制，部署成本高，而且某些外部 side effect 不能真正 reset。论文是 pre-deployment study，不应外推成全部 GUI agent 排名。其强点是 oracle 直接读取持久状态，并由领域专家参与定义风险。

**与当天主题的关系**：它把 Agentic Transaction 的 atomicity 从抽象性质落到可见的 GUI 业务后果。

### 14. Self-Supervised Visual OPD：没有强 teacher，也能通过信息不对称制造 on-policy 学习信号

**论文信息**：*Self-Supervised Visual On-Policy Distillation*；Yijiang Li 等；[arXiv:2608.14144](https://arxiv.org/abs/2608.14144)；cs.CV / cs.AI；发布于 2026-08-17。

**一句话 TL;DR**：S²VOPD 让 teacher 看原图、student 看强增强图，在同一模型内制造 task-consistent information gap，并把原图分布 on-policy 蒸馏到增强视图。

**为什么值得推荐**：on-policy distillation 通常依赖更大 teacher、答案或 ROI，这限制了数据规模。本文的关键判断是：informative asymmetry 不一定来自 teacher 多知道什么，也可以来自 student 被有控制地减掉信息。

**方法怎么工作**：第一步对同一图像生成增强视图，teacher branch 保留原图，student branch 接收有损视图；第二步以当前 policy 在原图上的分布作为 on-policy target，蒸馏到增强视图分布；第三步系统搜索四类 augmentation 与强度，要求差异足够大但不删除问题相关证据，并以 symmetric self-distillation 做反事实对照。Figure 1 直接比较 privileged teacher 与 subtractive asymmetry。

**关键实验与证据**：六个 fine-grained perception benchmark 上，Qwen3.5-4B 从 **70.7% 提升到 77.4%**，超过所比较的开源模型，甚至报告高于 GPT-5.4；在保持训练数据不变时，恢复了 privileged-information 方法 **96%** 的提升。对称蒸馏反而退化，支持 asymmetry 是关键变量。

**局限和可信度**：benchmark 仍是视觉感知 QA，不代表长程视觉 agent；增强策略可能对数据集线索定制，强到抹掉答案时会产生错误信号。对闭源模型的“超过”只在选定 benchmark 成立。论文的多 augmentation 消融很有说服力，但持续 on-policy 更新的遗忘与安全风险未被验证。

**与当天主题的关系**：它展示 post-training 信号可以来自受控信息差，但仍必须通过 task-consistency gate 防止伪监督。

### 15. APTER：把专家标准从一次性 Judge Prompt 变成可诊断的训练坐标系

**论文信息**：*APTER: Adaptive Post-Training with Expert-Grounded Rubrics*；Xukai Wang 等；[arXiv:2608.14212](https://arxiv.org/abs/2608.14212)；cs.AI；发布于 2026-08-17。

**一句话 TL;DR**：APTER 从专家 criteria framework 为每个 query 实例化 rubric，用 criterion-level verdict 同时做 RL 奖励、能力诊断和定向 SFT 修复。

**为什么值得推荐**：专业领域的 holistic preference 容易奖励流畅答案，逐 query 自生成 rubric 又会漏掉领域硬约束。APTER 的创新是让 rubric 同时有稳定的 expert source ID 和 query-specific 可执行描述，因此低分可以被聚合成具体能力缺口。

**方法怎么工作**：第一步由领域专家定义可复用 criterion，每项对应专业能力；第二步为每个 query 检索相关 criterion 并实例化 rubric，无需 reference answer；第三步用 rubric verdict 驱动 policy optimization，同时按 criterion ID 聚合持续低分，触发 targeted SFT，再进入下一代 RL。Figure 1 将 expert knowledge、rubric instantiation、RL diagnosis 与 repair loop 连起来。

**关键实验与证据**：在数学推理与医疗问答、三代模型上，APTER 相对各自 base model 的平均分最高提升 **15.86** 与 **8.04** 点；跨代一致收益说明不是单一底座偶然。开源 code 与 rubric dataset 也提高了复现性。

**局限和可信度**：专家 criterion 可能固化当前规范并遗漏少见合理路径；rubric judge 的误判会同时污染 reward 和诊断，形成反馈闭环。数学和医疗两个域还不足以证明一般化，且 targeted SFT 的数据成本与遗忘需要独立审计。论文比黑箱 reward 更可解释，但不等于 rubric 本身无偏。

**与当天主题的关系**：它把 feedback provenance 写进 post-training，对应 MOOSEDev 在项目记忆里保存 decision provenance。

### 16. Envs-FORGE：环境合成应根据当前 Policy 的学习前沿逐 Seed 调节

**论文信息**：*Envs-FORGE: Frontier-Optimized Reward-Grounded Environment Synthesis for Agent RL*；Xiaojun Wu 等；[arXiv:2608.14312](https://arxiv.org/abs/2608.14312)；cs.CL；发布于 2026-08-17。

**一句话 TL;DR**：Envs-FORGE 根据 seed pass rate 在六种投影方向中选择环境改写动作，同步生成 instruction、fixture、oracle、test 和 Docker，并只让 gold-verified bundle 进入 RL。

**为什么值得推荐**：Self-Instruct/Evol-Instruct 对所有 seed 使用同一“变难”prompt，却不知道当前 policy 已经会什么。本文把 environment synthesis 变成受 verifier reward 驱动的 per-seed decision，目标不是盲目增加难度，而是把样本放在可学习前沿。

**方法怎么工作**：第一步运行当前 policy 估计每个 seed 的 pass rate；第二步对六种 projection-direction action 估计其相对目标 frontier 的价值，并用 mixed-integer linear program 选择动作，可附带 skill coverage 约束；第三步同步改写任务、fixture、oracle、test 与 Docker，gold verifier 过滤无效环境，固定规模环境集随后用于 RL。Figure 1/2 展示从 reward 到 action 再到完整 bundle 的闭环。

**关键实验与证据**：Qwen3.5-35B 在 tb-core 从 **40.0% 到 49.2%**，tb-2.0 从 **23.0% 到 29.4%**，分别比最强固定 recipe 高 **2.4** 和 **2.1** 点；SWE-bench Verified 从 **73.4% 到 77.1%**。4B-35B 的 tb-core 均提升 **6.8-9.2** 点，各方法都输出 100 个验证环境并使用约 **2.27M-2.88M** synthesis token。

**局限和可信度**：pass-rate frontier 依赖 verifier 覆盖，测试可被 exploit；MILP 的 action family 仍由设计者预设，无法保证发现全新任务结构。100 个环境的数据规模有限，SWE-bench 提升也可能受任务相似性影响。公平之处是固定下游数据规模和大致 synthesis budget，并公开完整 bundle。

**与当天主题的关系**：它把“可执行环境是否可靠”前移到训练数据生产，而不是只在最终 benchmark 检查。

### 17. AgentRewind：长程 Agent 需要同步回滚上下文与环境，而非只重写计划

**论文信息**：*AgentRewind: Recoverable Execution for Long-Horizon LLM Agents*；Yu Zhuang 等；[arXiv:2608.14380](https://arxiv.org/abs/2608.14380)；cs.AI；发布于 2026-08-17。

**一句话 TL;DR**：AgentRewind 记录 agent context 与 controlled environment 的对齐 checkpoint，出错时回到早期状态，并携带上一次失败得到的信息重新执行。

**为什么值得推荐**：长任务中的早期错误会同时污染对话上下文和外部 workspace。只在 prompt 里“反思”不能撤销已写文件或系统状态，全量重启又浪费已经完成的子任务。论文把 recovery path 作为 runtime capability，而不是把所有希望押在错误预防上。

**方法怎么工作**：第一步在执行关键点同时 capture context 与 environment checkpoint；第二步通过完成度、失败信号或 agent decision 选择 recovery point，恢复两侧一致状态；第三步将前一尝试的 failure information 作为受控提示注入，从 checkpoint 继续，而不是复用已经污染的完整轨迹。论文另建 MettleBench，将长工程任务拆成相关 requirement checklist，同时计 task success 与 partial progress。

**关键实验与证据**：作者跨任务、多个模型、execution strategy 和 harness 报告 AgentRewind 相比 baseline 同时提高 task success 与平均 checklist progress。PDF 中的主结果强调恢复在更长 horizon 和错误传播更强的设置下收益更明显，而不是只靠增加重试次数。

**局限和可信度**：摘要未给出统一效应量，具体收益需按 model/harness 读取；controlled environment 才能可靠 snapshot，外部 API、支付和消息发送往往不可逆。checkpoint 存储、恢复延迟与 nondeterministic tool replay 也是生产成本。MettleBench 是新 benchmark，仍需独立复现。

**与当天主题的关系**：它是今天“失败必须可恢复”最直接的 runtime 实现，与 LegacyWorld 的 atomicity oracle 互为前后端。

### 18. Rollplex：不破坏 On-Policy 语义，也能让 VLM RL 的三个 Phase 共享 GPU 空间

**论文信息**：*Rollplex: Cross-Phase GPU Spatial Sharing for Vision Language Model Post-Training*；Hanfeng Lu 等；[arXiv:2608.14498](https://arxiv.org/abs/2608.14498)；cs.LG / cs.DC；发布于 2026-08-17。

**一句话 TL;DR**：Rollplex 把 reference 与 actor training 的 prefix computation 移入 rollout decode 空闲窗口，并通过 phase-aware memory 与跨 TP weight sharing 避免复制整套模型。

**为什么值得推荐**：VLM RL 的视频 prefix 很重，严格串行 rollout、reference scoring、actor training 会留下大量算力空洞。简单并行又可能破坏同步 on-policy 更新，或因不同 tensor-parallel layout 需要双份权重而 OOM。论文解决的是训练系统与算法语义之间的冲突。

**方法怎么工作**：第一步分解 reference/training phase，把与 response 无关的 prefix processing 调度到 rollout decode；第二步按 producer-consumer lifetime 管理 HBM residency，只在需要的 phase 保留张量；第三步对不同 TP degree 的 layout-compatible tensor 共享物理存储，仅重建不兼容部分，从而保持同步 policy version。Figure 1 对比 serial、disaggregated 与 cross-phase spatial sharing。

**关键实验与证据**：朴素共置 Qwen2.5-VL-32B 约需 **165 GiB/GPU**。在 **32 张 H800** 上，Rollplex 相比串行共置加速 **1.23×-1.30×**，相比 disaggregation 加速 **1.57×-2.24×**，GPU 预算相同且同步 RL update 不变。

**局限和可信度**：结果依赖 H800、模型大小、视频长度和具体 TP 配置；prefix/response 比例变化时收益会下降。系统复杂度、kernel interference 和容错恢复未在摘要中量化。论文证明吞吐改进，不证明训练后的模型质量更高；价值是以 algorithm-preserving 方式释放预算。

**与当天主题的关系**：它提醒 post-training 可靠性也包括 policy version 和执行顺序不被系统优化悄悄改变。

### 19. Differential Fault Injection：现代化软件应在异常条件下与原系统保持一致

**论文信息**：*Validating LLM-Modernized Scientific Software Through Differential Fault Injection*；Evan Coleman、Yuzhong Shen、Masha Sosonkina、Peng Xu；[arXiv:2608.14527](https://arxiv.org/abs/2608.14527)；cs.DC / cs.SE；发布于 2026-08-17。

**一句话 TL;DR**：论文在 GAMESS 原始与 LLM 现代化实现的共享 SCF driver 中注入相同确定性故障，比较收敛、误差、死锁和低精度行为，而非只测 nominal output。

**为什么值得推荐**：legacy modernization 最容易通过正常输入，却在数值扰动、并行同步或 reduced precision 下改变 failure mode。科学软件中这种 silent divergence 可能比编译失败更危险。论文把 differential testing 从输入输出扩展到 fault response，是罕见的异常路径验证。

**方法怎么工作**：第一步在共享 self-consistent-field driver 的 **12** 个位置布置 deterministic injection site，隔离被转换的 integral kernel；第二步对原始与现代化版本施加相同 transient fault、persistent perturbation 和 precision reduction；第三步比较额外迭代、最终能量误差、收敛状态与并行 liveness，并根据测量结果修改 synchronization，再做 paired campaign。Figure 1 描述 original/modernized 的对称注入 harness。

**关键实验与证据**：总计超过 **2,200** 次运行；瞬态故障的理论 slope 为 **0.74/1.49 iterations per bit**，实测 **0.82/1.50**，持久扰动每增加一 bit 使 final-energy error 约减半。原始与现代化 kernel 在 **200** 组 paired injection 全部一致，修改 synchronization 后另 **40** 对也一致，同时发现 phase-dependent deadlock 与低精度 false convergence。

**局限和可信度**：研究只有 GAMESS 的一类 modernization，注入位置和故障模型仍由研究者选择；paired agreement 不能覆盖未注入的异常或 compiler-specific undefined behavior。优势是 oracle 不依赖 LLM judge，故障确定、成对且包含 liveness 与数值误差，证据强度明显高于仅跑 regression suite。

**与当天主题的关系**：它给“迁移后行为验证”提供了今天最硬的异常路径证据，也为 AgentRewind 与 ACID 属性提供 fault-based 检验范式。

## 中相关论文速读

### Coding Agent、软件变更与运行可靠性

#### RubricForge：Judge 更重要的指标是少放过失败，而不是平均一致率

*Inducing Reward-Free Judging Rubrics that Reduce Over-Crediting in Agent Evaluation*；[arXiv:2608.13564](https://arxiv.org/abs/2608.13564)。论文从少量有环境标签的 trajectory 反思演化一份可读 rubric，冻结后让同一个 7B 模型一次调用完成判断。在 tau-bench 173 条和 WebShop 160 条轨迹上，它对 G-Eval 的总体一致率优势不显著（McNemar p=.248），但 tau-bench false-pass 从 **0.173 降到 0.115**，WebShop Spearman 从 **0.370 到 0.410**。值得保留的判断是 evaluator 要按错误代价选指标：假通过会部署坏 agent，假失败通常只增加重试。它没有进入深读，因为样本小、agent 与 judge 同模型，且改进主要集中在少数 false-pass。

#### LSP vs. Grep：语义工具精确，不等于 token 更省

*Does a Language Server Save Tokens for Coding Agents?*；[arXiv:2608.13568](https://arxiv.org/abs/2608.13568)。作者以 tokens-to-success 和五臂消融比较 Python/TypeScript 仓库中的 grep 与 LSP。symbol localization 上 LSP 多耗 **6%-118%** token，agent 自由选择时语义工具占比只有 **0%-6%**；多文件 rename 中 grep 全部成功，location-only LSP 因漏 call site 失败四分之三。它击中了“结构化工具天然更高效”的未经验证假设，推荐关注 adaptive router，而非 LSP-always。暂列中相关，是因为研究仍是 preliminary，仓库、模型和任务类型不足以给出一般成本结论。

#### Agentao：Host 授权应位于模型提议与工具执行之间

*Agentao: A Governed Local-First Runtime for Tool-Using LLM Agents*；[arXiv:2608.13574](https://arxiv.org/abs/2608.13574)。系统把 host-facing surface、host contract、runtime core、permission-mediated tools 和 memory/replay/plugin 子系统分层，用结构化 event 保留执行轨迹。最值得记住的是“proposal 不等于 authority”：模型只提出动作，host contract 决定是否执行。这与 Mandato 同属治理层，但 Agentao 更像公开 runtime design，明确不提供 formal guarantee，也没有系统性 attack/overhead 实验，因此不宜和有 outcome evidence 的强相关论文同级。

#### BCM：同任务可重复与跨任务策略一致是两条不同轴

*Measuring Cross-Task Behavioral Consistency in Language Model Agents*；[arXiv:2608.13598](https://arxiv.org/abs/2608.13598)。BCM 先用行为特征预测 trajectory 成功，再取 feature-attribution vector，计算同一 agent 跨任务的向量相似度。约 **9,000** 条软件工程轨迹、6 个 agent 显示，有的系统在同一任务重复运行很稳定，换任务后却没有稳定策略；一致性也不能由 success rate 代替。这个过程指标适合补充 outcome，但 attribution model 本身可能把任务难度和行为编码混在一起，且高一致并不必然是好事，所以应当作为诊断信号而不是新 leaderboard。

#### MobileMem：移动端长期记忆要测试更新、时间推理和隐式偏好

*MobileMem: Learning from a Year of Mobile Experiences*；[arXiv:2608.13606](https://arxiv.org/abs/2608.13606)。它从用户-app session 出发，用知识约束的合成管线生成一年尺度、时间一致的 text/multimodal trajectory，覆盖 multi-hop、knowledge update 与 implicit preference inference。贡献是把 memory 从事实召回推进到“经历如何随时间改变”，同时与 post-training 的持续适应相连。没有深读的原因是摘要对真实数据比例、隐私处理、合成偏差和模型结果披露有限；year-scale 名称也不能自动证明长周期真实交互有效。

#### Version Regression：没有一个推理期信号能通吃所有模型更新

*No Universal Signal Predicts Sample-Level LLM Regression under Version Updates*；[arXiv:2608.13607](https://arxiv.org/abs/2608.13607)。论文在 6 个 benchmark、3 类任务和 6 个 update pair 上比较 confidence、margin、attention entropy 与 output/token KL、likelihood/representation drift，并用 added-value test 检查它们相对 confidence baseline 的增益。MCQ 和简单数学更适合 confidence，困难数学与 code 更常从跨版本 KL/likelihood 获益；可据此把高风险样本路由回旧模型。它提供了实用的回退思路，但信号选择仍需任务标签校准，proof-of-concept routing 尚不是稳定部署策略。

#### SemPlan：结构化计划改变失败分布，却不会单调提高正确率

*SemPlan: Benchmarking Structured Semantic Planning for LLM-Based Queries over Enterprise Data*；[arXiv:2608.13612](https://arxiv.org/abs/2608.13612)。1,800 个双语合成案例比较 direct SQL、bounded tool agent、semantic request + deterministic planner 和 clarification/stateful plan。4,800 条主记录中正确率分别为 **22.25%、22.58%、25.67%、24.25%**；A3 最好但绝对值仍低，A1 的 policy correctness/unsafe-invalid 更好，A4 成本和 false refusal 更低。推荐保留“架构约束改变 trade-off 而非自动变强”，但合成 enterprise schema 与低绝对正确率限制了外推。

#### Second Thought：把工具等待窗口变成并行推理窗口

*Second Thought: Reasoning in Parallel as LLM Agents Act and Observe*；[arXiv:2608.13667](https://arxiv.org/abs/2608.13667)。每个 Thought 结束后并行 fork 四个 auxiliary branch，在 action serialization 与 environment wait 期间提前思考，observation 到达后再合并。三个 benchmark × 三个 reasoning LLM 的 9 个组合都减少 turn，6 个组合主线程 decoding 最高降 **43%**；7/9 的 Pass@1 无显著变化，另两项提高 **12.4/10.2** 点。方法有系统价值，但总计算量增加、并行分支可能基于尚未观察到的状态误推，因此更适合作 latency optimization，而非能力提升证据。

#### C-to-Rust Curriculum：语言先验、调试能力和任务映射应分阶段训练

*Fine-Tuning Qwen3-27B for C-to-Rust Code Translation*；[arXiv:2608.13681](https://arxiv.org/abs/2608.13681)。recipe 依次进行 Rust continued pretraining、基于 Verus 数据的 debugging-aware SFT、以及 LeetCode C/Rust paired SFT，再由 SACTOR 做静态分析引导的两阶段翻译与 FFI end-to-end test。它值得保留，因为将“会写 Rust”“会根据编译反馈修复”“保持跨语言语义”拆开，且同时报告 Clippy、unsafe fraction 与 failure mode。当前摘要没有具体提升数字，数据域偏算法题，尚不足以判断真实 repository translation。

#### AI-Intensive Software Cost：成本模型中的两个小错误足以把结论放大一倍

*Building AI-Intensive Software with AI*；[arXiv:2608.13730](https://arxiv.org/abs/2608.13730)。六人学生团队一学期开发带 RAG、tour、dependency graph 和 technical-debt analysis 的系统，以真实 AI 支出、人工自报和 human counterfactual 三层计价。初始 **19.4×** 成本比因把 flat-rate 订阅推成 per-token 价格、并使用错误地区工资而被修正为约 **9.9×**。推荐理由是它公开撤回错误并展示 cost claim 的脆弱性；但单团队、学生劳动力与 counterfactual 都很难泛化，所以应读作测量警告而非 AI 开发效率结论。

#### ISO-Grounded NFR：更完整的要求改善静态质量，不保证功能正确

*Does ISO-Grounded NFR Specification Improve LLM Code Generation?*；[arXiv:2608.13742](https://arxiv.org/abs/2608.13742)。论文以 HumanEval/HumanEval-ET 比较一行自然语言、ISO/IEC 25010 丰富描述与结构化 JSON，覆盖 performance、error handling、smell、readability。丰富描述降低 unreadability density，例如 performance **0.88→0.69**，也减少 prompt variation；但 extended test 没有稳定提升，error handling 甚至下降，NL-rich 与 JSON 的正确率差异不超过 **0.023**。它说明 semantic content 比 serialization 更重要，但静态 proxy 与短函数 benchmark 不能代表 repository NFR。

#### AdsWorldEngine：Actor 和 Tool 可以由同一批 Rewarded Rollout 共同演化

*AdsWorldEngine*；[arXiv:2608.13833](https://arxiv.org/abs/2608.13833)。系统由 opportunity gate、orchestrator、广告工具和 evaluator 组成：先以 SFT/agentic RL 训练 orchestrator，再用高低 reward rollout 构造 preference 更新 tool，并用 label-grounded judge 与 cost-sensitive GRPO 处理主观决策。离线 diversity/relevance 提升 **60%/80%**，线上 RPM 与 coverage 提升 **22%/74%**。它展示 actor-tool coevolution 的真实产品闭环，但广告目标、私有数据与商业指标难以独立复现，且用户体验和侵扰风险需更长期审计。

#### MemoryArena Matched Study：记忆 Backend 的优势高度依赖工作负载

*MemoryLake on MemoryArena*；[arXiv:2608.13883](https://arxiv.org/abs/2608.13883)。同一 agent framework、model alias、task sample 和 scorer 下比较 structured multi-track memory、Mem0、向量 RAG 与 long context。MemoryLake 在数学 **9/40**、物理 **12/20**、progressive retrieval **4/20** 最好，但 travel 全部为零，shopping 只有 long-context 成功 **1/150**；五域 post-hoc 均值 **20.5% vs. 13.6%**。作者明确这是 backend bundle matched comparison、非 representation causal ablation，且置信区间重叠，因此最值得保留的是 workload-dependent 结论。

#### TANGLE：冲突记忆的正确答案有时就是“证据不足以决定”

*When Personal Memory Has No Single Answer*；[arXiv:2608.13921](https://arxiv.org/abs/2608.13921)。TANGLE 有 **541** 个实例、40 个 persona，覆盖 context-partitioned、behavior-oscillation、source-contradiction 三类不可约冲突，分别测 conflict perception、causal reasoning、calibration、clarification 与 memory faithfulness。oracle memory 下模型能发现冲突却不善于校准行动，pipeline memory 又经常丢掉冲突关系。它把“保留多个候选并请求信息”设为能力，但构造 persona 与人工冲突 taxonomy 仍需真实长期会话验证。

#### Agent Skills：真正起作用的是程序锚点，真正先崩的是检索

*Demystifying Agent Skills: Why They Work-Until They Don't*；[arXiv:2608.14036](https://arxiv.org/abs/2608.14036)。研究归一化 **8,135** 次 trial，并对 238 个有效 open-code label 做 trajectory 对照。skill 比 Workflow Memory 高 **6.06** 点；**65.7%** 案例由 procedural anchoring 解释，显式知识注入只有 **4.5%**。但 pool 从 5 增至 100 时实际使用 precision 从 **29.6% 降到 3.3%**。这项诊断很有价值，不过 skill package、retriever 和 harness 高度耦合，aggregate success 对错误检索又不敏感，因此不能简化成“skills 普遍有效”。

#### Drift Recovery Graph：小模型可作为大 Agent 外挂的分步恢复模块

*A Graph-Based Reinforcement Learning Framework for Structured Drift Diagnosis and Recovery*；[arXiv:2608.14109](https://arxiv.org/abs/2608.14109)。同一个小模型在 recovery graph 的 drift classification、operation detection、risk evaluation 和 final decision 节点扮演不同角色，以 schema/length rule reward 和 LLM judge semantic reward 训练。AppWorld 实验显示它能利用疑似 drift onset 给出结构化恢复决策。推荐关注“外部恢复模块”而非重训主 agent；但 XML 合规和 judge 语义分数不是外部状态恢复证据，论文尚未量化不可逆 side effect 的真实修复率。

#### Act2Intention：主动移动 Agent 的评估应从动作追踪到意图预测

*Act2Intention*；[arXiv:2608.14132](https://arxiv.org/abs/2608.14132)。benchmark 含 **72,511** 个 intention、70 万余 action、52 个 app，agent 分成 intention understanding、personalized prediction 和 experience-guided execution。SFT 相对同框架未微调版本分别提升 **32.0 Acc-S、10.25 Acc-S、6.9 SSR**。它扩展了 GUI agent 的任务定义，但 intention 由 validated generation 构建，预测得准不等于用户授权，主动执行还需要 Mandato/atomicity 一类约束，所以暂列中相关。

#### MazeRunner：黑盒渗透测试需要任务树、线索库与失败复核分工

*MazeRunner*；[arXiv:2608.14216](https://arxiv.org/abs/2608.14216)。三个 agent 分别负责全局 orchestration、上下文密集执行和失败 review，并持久保存 task state 与环境 clue，以便恢复前置条件、切换攻击分支和关联长程证据。10 个近期 HTB target、每次 20M token 上，Sonnet 4.5 完成 **47.7%** 子任务，对 PentestGPT-V2/Claude Code 为 **36.2%/34.2%**；取得 6 个 user-level、2 个 root。证据来自真实黑盒目标，但样本仅 10 个、预算极高，安全任务专属性强。

#### TimeSage-EV：Live Benchmark 要检查结论是否使用了当时可得的数据

*TimeSage-EV*；[arXiv:2608.14270](https://arxiv.org/abs/2608.14270)。它跟踪 6 个领域 **60** 个真实机构场景、2023-02 至 2026-05 的 **1,485** 个 period QA，用下一期 release 做 withheld truth，测 state identification、summary 和 outlook。自演化 TimeSage-1.0 带可复用 skill library，但 frontier agent 仍频繁违反时间 cutoff、漏用外生上下文或不能适应更新。推荐价值在 evaluation design；它不是 coding benchmark，月度更新能否长期无泄漏仍需维护证据。

#### Mutation Testing for Judges：没有唯一 Gold 时，可以先检查 Judge 是否抓得到人为缺陷

*Breaking Models to Test the Judge*；[arXiv:2608.14315](https://arxiv.org/abs/2608.14315)。作者为 domain class diagram 定义 11 个 mutation operator，例如删除 class，从 PlantUML 与需求文本生成有控制的语义坏版本，再看 3 个 LLM × 2 个 prompt 的 judge 能否检出。自动 mutation ranking 与人工 judgment validity 大体一致。最值得保留的是把 evaluator 当测试对象；但 mutation 只覆盖预设缺陷，等价变换和更深语义错误不一定被代表，尚不能替代人工评审。

#### SAFARI：主动探索需要消除示范的 Hindsight Bias

*Clearing the Fog: Towards Installing and Refining Proactive Exploration Capabilities in LLM Agents*；[arXiv:2608.14339](https://arxiv.org/abs/2608.14339)。方法先合成包含有效信息搜集的 trajectory，避免标准成功示范看起来“从一开始就知道答案”；再以 contrastive trajectory pair 做 RL，区分 productive exploration 与冗余 wandering。它同时属于 agent behavior 和 post-training，问题定义清楚。当前官方摘要没有任务规模与具体效应量，主动探索还可能扩大工具成本和安全暴露，因此需读正文结果后再判断是否强推荐。

#### PACE-Bench：自演化最难的不是猜参数，而是重写失效机制

*PACE-Bench*；[arXiv:2608.14441](https://arxiv.org/abs/2608.14441)。144 个 source-target pair 覆盖 6 个 physics domain；接口与目标不变，环境物理规律发生 mutation，agent 必须根据 sandbox 反馈改写代码。10 种方法中 Reflexion + Qwen3-14B 仅解 **35.9%**，GPT-5.5 在 Statics 子集为 **66.7%**；直接告知物理变化仍未突破 ceiling。记忆会锚定旧设计，宽树搜索又难收敛。它是很好的 dynamic-environment benchmark，但 physics code 与真实 repository evolution 的对应仍属受控替身。

#### Twin：先让可执行 World Model 重放全部历史，再允许 Agent 走下一步

*Twin: Playing an Unknown Game with a Test-Time Digital Twin*；[arXiv:2608.14490](https://arxiv.org/abs/2608.14490)。coding agent 从交互中写 world-model 程序，每次真实行动前必须重放并匹配全部过去 transition；预测不符就作为 counterexample 修复模型。系统清除 **179/183** level，23/25 游戏上的总分从 base **7.8**、普通 harness **61.1** 提到 **93.3**。最重要的判断是 executable prediction 可作为行动 gate；但 ARC-AGI-3 网格世界规则封闭，真实软件状态更部分可观测，不能直接外推。

#### SETYPE：让 LLM 推断语义类型，再由类型检查暴露安全违例

*Finding Vulnerabilities via LLM-Augmented Semantics-Aware Type-Checking*；[arXiv:2608.14533](https://arxiv.org/abs/2608.14533)。SETYPE 从 symbol/expression 的自然语言含义推导语义类型，LLM 同时完成 type inference 与 checking，失败即潜在漏洞；Python prototype 达 **87% precision、88% accuracy**，提出 15 个 zero-day 中 9 个获开发者确认。它把 LLM 语义与可检查规则结合，比直接问“有无漏洞”更可审计；但 LLM 参与 checker 会削弱 soundness，Python Web 范围也很窄，不能视为静态分析保证。

### Post-Training、数据与评估

#### Safety Dataset Slice Audit：多语言覆盖声明必须下钻到单个语言和 Harm Type

*Language-Specific Gaps in AI Safety Training Datasets*；[arXiv:2608.13695](https://arxiv.org/abs/2608.13695)。论文审计 21 个资源、25 个 language slice，以 Hausa、Swahili、French 表示低中高资源层。Hausa 某 slice 未达到其论文自身翻译质量阈值，而同 pipeline 的 Swahili 通过；非洲语言层的 self-harm 与 sexual content 都没有 native coverage。它把“覆盖 12 种语言”拆成 provenance、annotation、access、taxonomy 与 reuse，适合约束 post-training data claim。未列强相关，是因为只抽三种语言，且 dataset gap 到模型安全回退之间仍是结构一致性而非直接因果验证。

#### SocialRL：小模型的社交推理可以学到 Frontier 水平，但迁移由博弈结构决定

*From Passive Delegates to Strategic Negotiators*；[arXiv:2608.13787](https://arxiv.org/abs/2608.13787)。同一 RL recipe 在六个谈判/代理域分别训练 4B policy，再以 cascade RL 与 multi-teacher OPD 合并专家。统一模型平均 utility **0.627**，与 GPT-4.1/5.1/5.2 的 **0.625/0.619/0.613** 相当；买方低于目标锚定从未训练的 **3%** 到 **78%**。最有价值的是跨域迁移遵循 game structure，ToM trace 只有经训练内化才稳定有效。它暂列中相关，因为六域都为受控代理博弈，utility 未覆盖隐私泄露、公平和长期关系代价。

#### Geometric Filtering：合成数据筛选的简单距离 Baseline 可能胜过复杂规则

*Geometric Filtering of LLM-Generated Samples for Few-Shot Text Classification*；[arXiv:2608.13866](https://arxiv.org/abs/2608.13866)。方法计算合成样本到真实类别样本的 embedding 欧氏距离，再硬筛或软加权。13 数据集、5 classifier、10 augmentation、6,700 余配置上比 SMOTE 高 **2.61pp**（p<.0001，d=.95，胜率 88.9%），不改 filter 用到 NER 提升 **9.26pp**。它提醒 post-training data curation 先做强简单 baseline；但任务是小样本文本分类，不是生成式 LLM SFT，embedding geometry 也可能继承 encoder 偏差。

#### Research Preference Models：先预测哪个实验值得跑，再把 GPU 预算给它

*AI Research Preference Models*；[arXiv:2608.13940](https://arxiv.org/abs/2608.13940)。RPM 不执行全部候选，而从 plan、code 和已运行结果预测值得投资的方向；agentic 版本还先跑小规模 pilot。接入 AIRA-dojo 后，AIRS-Bench normalized score 从 **0.684** 到 **0.711/0.729**，约 15 小时达到 unguided agent 24 小时表现，使用不足三分之二预算。它把 preference modeling 从回答偏好扩展到 research resource allocation。未深读是因为 frozen model 判断与 pilot 结果可能偏向可快速显效的想法，长期探索多样性仍未验证。

#### Multi-Genre SFT：数据多样性要沿 Genre 结构扩张，而非重复 Story

*Scaling Creative Writing Beyond Story-Centric Data with Attribute-Guided Genre Expansion*；[arXiv:2608.13947](https://arxiv.org/abs/2608.13947)。作者把人类 story prompt 当主题 seed，再用人工 genre attribute 约束结构、风格与格式，生成并筛选 **50K** 样本、13 个 genre。OOD 写作与 held-out genre diagnostic 均优于 base、专用 baseline 和已有语料，genre-count ablation 支持“受控形式扩张”而非单纯增加故事。它是数据设计的好案例，但质量由强 LLM 生成与过滤，真实人类偏好、版权和长期风格同质化仍缺证据。

#### Batch-Wise Adaptive Pruning：推理模型的稀疏策略必须在真实 Batch 下校准

*Batch-wise Adaptive Pruning*；[arXiv:2608.14003](https://arxiv.org/abs/2608.14003)。现有 threshold 在 batch 聚合 activation 后失配，实际 sparsity 漂移并导致 reasoning accuracy 崩溃。新方法周期性 top-k 选择，并用 activation memory 保留长思维链中重复激活的 neuron。在 DeepSeek-R1-Distill-Qwen-7B、batch 4、目标 50% sparsity 下，比既有 SOTA 平均准确率高 **39.7** 点，达到 **1.40×** dense speedup。它属于 post-training 部署效率边缘：方法 training-free，不改变模型行为目标，故不列强相关。

#### RCV：安全分类器应先估计自己何时不符合部署 Policy

*Regime-Conditional Verification*；[arXiv:2608.14089](https://arxiv.org/abs/2608.14089)。RCV 从现有 classifier 的内部 representation 估计“当前预测与 deployer policy 不一致”的概率，选择性修正，并把 correctness estimate 当无标签 drift signal；只有轻量修复失败才 fine-tune classifier。3 个 classifier × 2 benchmark 全部改善，最多找回 **0.81** 的漏检 unsafe content；10 类 held-out attack campaign 均在 injection panel 被发现。它为持续 post-training 提供分级维护思路，但内部估计层本身也会漂移，安全 benchmark 到真实流量的 base rate 差异仍需校准。

#### P2Skill：用失败驱动的 Skill Refinement 把 PII 留在本地

*P2Skill: Privacy Preserving Skill Distillation for Cloud-Local LLM Inference Systems*；[arXiv:2608.14094](https://arxiv.org/abs/2608.14094)。本地 SLM 依据 skill 完成 decomposition、PII-aware routing、paraphrase 和 reconstruction，cloud LLM 只根据失败改进 skill，不接收原始 PII，也无需 privacy fine-tuning。四域 benchmark 的 privacy-preserved quality 为 baseline 的 **1.69×/3.66×**。值得关注的是 distillation 对象是可审计 procedure 而非权重；但小模型若漏识别 PII，云端泄露不可逆，且 cloud 参与失败分析的输入边界必须严格说明。

#### Redundancy-Aware Clinical RL：重复病历会稀释真正的新状态

*Removing Temporal Note Redundancy Improves Multimodal Reinforcement Learning for Medicine*；[arXiv:2608.14157](https://arxiv.org/abs/2608.14157)。方法用局部历史子空间 SVD 或 sentence-level diff 删除 copy-forward note，再与结构 EHR 组成 ventilation policy state。真实 ICU 数据上，去冗余表示在 model-based rollout、FQE、WIS 和 WDR 多种 off-policy evaluation 中都超过 structured-only 与 raw-note。核心判断是 RL state 要表达新增信息，而不是文本体量。由于没有 prospective clinical trial，且 off-policy estimator 都可能受未观测混杂影响，不能把指标提升解释成临床收益。

#### AdaPop Unlearning：越流行的事实需要越强、但受约束的遗忘压力

*The More Popular, The Harder to Forget*；[arXiv:2608.14229](https://arxiv.org/abs/2608.14229)。AdaPop 用 token confidence 与外部 popularity proxy 形成 per-fact exponent，再由 dual-ascent 自动平衡 forget/retain。3 个模型家族、2 benchmark 上，paraphrase 泄漏约少 **5×**，adversarial reformulation 少 **1.6×**，同时保持 retain representation 接近原模型。它实质讨论 post-training 如何修改已记能力，但 popularity proxy 可能与敏感度、答案长度混杂，Wikidata/LLM judge 对长尾事实也并非可靠频率估计。

#### MOBO-Merge：模型合并应寻找 Pareto Front，而不是只调一个平均分

*Multi-Objective Bayesian Optimization for Model Merging*；[arXiv:2608.14264](https://arxiv.org/abs/2608.14264)。MOBO-Merge 把 instruction、math、code capability 当多目标黑箱，用有限评测预算搜索 Linear、SLERP、TIES 与 block-wise 参数。在 Qwen3-4B/Llama-3.1-8B 的 held-out partition 上，12 个比较中 11 个 hypervolume 高于 random search；Linear 一维提升小，TIES/block-wise 多目标场景更明显，也没有统一最佳 operator。它是高效 post-training 组合工具，但 benchmark reuse、evaluation noise 和 Pareto 点的部署选择仍需人决策。

#### DHD：错误答案中的推理片段可能提升后续 Multi-Agent 轨迹

*Wrong but Useful: Trajectory Value Beyond Answer Correctness in Multi-Agent Messages*；[arXiv:2608.14375](https://arxiv.org/abs/2608.14375)。Diverse Hypothesis Deliberation 缓存 5 条独立 message，再用同一 integrator 做 message 可见/隐藏 replay，以最终变化定义 trajectory value。5 个数学/科学 benchmark、2 个开放模型中，错误但有帮助的消息在全部组合出现；会改变最终正确性的错误消息里，超过四成变化是正向，重复效应不太可能由噪声解释（p=.0002）。它挑战“只蒸馏正确答案”，但 replay counterfactual 仍受随机性和 solver 特定交互影响。

#### Tripwire：只在检测到攻击时触发模型已学会的拒答 Circuit

*Tripwire*；[arXiv:2608.14392](https://arxiv.org/abs/2608.14392)。方法对 neuron 做带 FDR 控制的 hypothesis test，再以 utility-specific filter 找安全专属单元；攻击时把其 activation clamp 到 harmful-conditional mean，触发既有 alignment refusal，可部署为 detector gate 或等价 bias patch。4 个模型、4 类 attack 的平均 ASR 最多 **2.0%**，MT-Bench utility 降 **0.5%-5.3%**。它是 training-free safety intervention，故放中相关；对 adaptive white-box attack、跨语言和 detector error 的稳健性仍是关键风险。

#### CRAFT：Reward 先约束 Attention 看哪里，再约束生成像不像

*CRAFT: Constrained Reward via Attention Fine-Tuning*；[arXiv:2608.14403](https://arxiv.org/abs/2608.14403)。单步 ReFL 只用 **10K** reference image + mask，不需要 150K 到 2M composed-target pair。attention reward 对齐 noise/phrase token 与正确 subject，得到的 mask 再 gate pixel identity reward，避免两个监督互相矛盾；FLUX.2-klein-9B 在 XVerseBench 达 SOTA 并迁移到其他 backbone。它是 multimodal post-training 的高效实例，但 subject-personalization benchmark 与自动 identity metric 可能偏向参考复制，真实创作可控性需人工评估。

#### Optstop：评测预算应流向不确定 Item，而不是每题固定重复

*Knowing When to Stop: Bayesian Optimal Stopping for LLM Evaluations*；[arXiv:2608.14425](https://arxiv.org/abs/2608.14425)。optstop 用 hierarchical Bayesian model 对 binary、ordinal、continuous outcome 估计精度，所有 item 始终可被再次采样，并在接近零成功率时更谨慎停止。一个 200-item、10-epoch 示例的 9 个 validation setting 中，移除 **57%-97%** 计划 trial，整体结论与 full run 等价。它能降低 agent/post-training audit 成本，但目前主要是 illustrative study；adaptive sampling 下置信声明、rare failure 保留和 benchmark heterogeneity 还需更严格验证。

#### Unified Diffusion RL：Reverse-Trajectory 与 Forward-Matching 的差异核心是方差约简

*Designing Reinforcement Learning for Diffusion Models: A Unified Path-Space View*；[arXiv:2608.14430](https://arxiv.org/abs/2608.14430)。论文从 regularized diffusion-RL objective 和 sampling SDE 间 importance sampling 推导 trajectory-space policy gradient，显示 Flow-GRPO 类 stochastic Itô integral 与 AWM/DiffusionNFT 类 value-gradient form 属于同一原则，经验差异来自 variance reduction。新方法用 multi-sample KDE 重用 rollout group，并限制 weight scale；SD3.5-M 与 Qwen-Image 实验支持统一解释。理论贡献强，但视觉 reward 的偏差、KDE 尺度和训练成本需要正文复核，故暂列中相关。

## 可留意 / 可跳过

- **[Proxy-Validated UX Micro-Simulations](https://arxiv.org/abs/2608.13563)**：用 app review、support tweet 与 issue 代理校验 LLM UX 模拟，embedding weighted-Jaccard 优于词法，但 bootstrap 显示估计不稳定。关键词是 artifact-first 与 proxy ceiling；它不是 coding-agent outcome 评测，真实用户验证仍缺，快速了解即可。
- **[Jais 2](https://arxiv.org/abs/2608.13580)**：70B/8B Arabic-centric 开源模型报告，涵盖自研词表、训练效率与文化 benchmark。可作为多语言 post-training/model recipe 资料，但摘要重点是整套模型发布，缺少可隔离的 post-training 机制，按需阅读。
- **[Coverage-Aware Active Evaluation](https://arxiv.org/abs/2608.13719)**：有限预算下主动寻找稀有失败，适合 reliability evaluation 关键词追踪；对象是 paired autonomous systems 的一般失败发现，和 coding/tool agent 的具体 oracle 关系较远。
- **[SDO Adapter Composition](https://arxiv.org/abs/2608.13820)**：以 subspace deconfliction 减少多角色 diffusion adapter 的身份串扰，属于参数组合方法。与 multimodal post-training 邻接，但主要是图像生成 composition，不必为两条主线优先深读。
- **[33,228 PR Collaboration Signals](https://arxiv.org/abs/2608.13884)**：纵向观察 vLLM/SGLang PR 中的人机协作变化，数据规模大，适合了解工程过程信号；标题延伸到 biomedical agent 的部分需要警惕外推，且 observational trend 不能归因于 agent。
- **[Tool-Call Abstention](https://arxiv.org/abs/2608.13959)**：区分 constrained decoding 对 schema repair 与真正决策改善的贡献，值得记住“格式修复不等于工具选择正确”。若关心 decoder 机制可读；它不涉及 repository change 或 post-training。
- **[Nanbeige on Apple Silicon](https://arxiv.org/abs/2608.13987)**：记录 Looped Transformer 部署 bug 和内存优化，是有用的工程复现说明，但聚焦单模型、单硬件，不形成一般 agent 可靠性方法。
- **[MedClaw](https://arxiv.org/abs/2608.14015)**：用 heuristic harness 处理长程手术视频，关键词是分段、证据定位和长上下文；当前更像领域 agent 系统，和软件变更证据链只有方法邻接。
- **[Agent-Orchestration in Chip Design](https://arxiv.org/abs/2608.14035)**：讨论 chip design 的多 agent/tool orchestration，可作为 EDA 场景背景；若缺少可执行 PPA、编译或布局验证的细粒度消融，优先级低于 Envs-FORGE 与 differential testing。
- **[Adversarial CFG Schedules](https://arxiv.org/abs/2608.14038)**：学习 diffusion guidance schedule，属于生成控制而非训练后对齐主线；只有在追踪 diffusion post-training 边界时需要留意。
- **[ART: VLA On-the-fly Tool Use](https://arxiv.org/abs/2608.14047)**：让 VLA 模型运行时调用工具，适合 embodied-agent 读者；机器人 action oracle 与仓库/软件 change 有距离，本文不展开。
- **[MathForm](https://arxiv.org/abs/2608.14221)**：knowledge retrieval + verifier-guided refinement 扩展 Lean autoformalization，验证闭环清楚；但核心对象是形式化数学生成，不属于当日 coding-agent 软件变更核心。
- **[Code Prompt Contamination](https://arxiv.org/abs/2608.14303)**：用 influence function 发现会诱发不安全实现的 prompt batch，连接 code generation data hygiene 与安全；目前更像 batch-level detector，需查看攻击模型与误报后再判断价值。
- **[TRIAGE Pseudo-Label Admission](https://arxiv.org/abs/2608.14321)**：以风险控制筛选医疗视觉 pseudo-label，方法上属于数据筛选，但任务专用、非 foundation-model post-training，记录关键词即可。
- **[Four-Axis LLM-as-Judge](https://arxiv.org/abs/2608.14329)**：从原则监管评估 judge 的 trustworthiness，和 RubricForge 同属 evaluator audit；监管文本与软件 agent outcome 距离较远，可留作 judge 方法对照。
- **[ATLAS Agent Strategies](https://arxiv.org/abs/2608.14352)**：LLM abstraction + automata learning 从测试/安全轨迹抽取策略，潜在审计价值高；官方摘要缺具体结果和 automaton faithfulness 证据，等完整复现再提升等级。
- **[ScienceFlow](https://arxiv.org/abs/2608.14354)**：面向 ML research 的长程 agent，关注 evolving state、exploration 和 compute。与 Research Preference Model 可配套阅读，但系统范围大、评价易被自定义任务影响，先看 benchmark 与 artifact 再决定。
- **[Wyvern](https://arxiv.org/abs/2608.14446)**：多 agent 生成带图表和引用的报告，figure informativeness 在 87% case 被偏好、citation recall/precision 最高提升 2.3×/1.6×。适合报告生成，不是 coding change 核心。
- **[SheetCompass](https://arxiv.org/abs/2608.14452)**：用 worksheet 内外层级 relation graph 和 memory 做 spreadsheet reasoning；结构化状态有价值，但摘要未给足实验数字，暂不深挖。
- **[Split the Labor](https://arxiv.org/abs/2608.14509)**：把 evidence interpretation 与 aggregation 分开，并指出未归一加权和会产生 count-scale drift。它提供 evaluator 算术警告，但主要是决策聚合框架，离 post-training recipe 较远。
- **[Handover of ICL State](https://arxiv.org/abs/2608.14528)**：从 predictive equivalence 推导跨 session handover 应保存哪些决策、统计量与原始 observation。理论上贴近长任务记忆，但验证集中在回归模型，不是可直接部署的 agent checkpoint 方法。
- **[Leading-Silence Multi-Stage Supervision](https://arxiv.org/abs/2608.14150)**：为多语会话语音 challenge 设计 silence augmentation 与分阶段 synthetic supervision。属于专项多模态训练，和通用 LLM post-training 的行为/可靠性证据较弱，可跳过。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 主要验证证据 | 可复现性 / 实用性 | 评估可信度 |
|---|---|---|---|---|---|
| Diverse Evaluation | benchmark gain 能否外推 | Django 多模态交叉评估 | 排名翻转、有限/零迁移 | 新 suite 可复核 | 中高：负结果清楚，范围有限 |
| Harness without Labels | 无 gold 如何评持续学习 | teacher-relative lift + hidden gold 校准 | 多任务/模型/harness 同向相关 | 需强 teacher | 中：依赖 scaling 假设 |
| MOOSEDev | 项目记忆的否定与时序 | ontology + provenance + supersession | 835 records，0.98-1.00 vs. 6%-27% | MCP 可接入，核心引擎私有 | 中：系统 bundle 对比 |
| Multilingual GRPO | RLVR 是否跨语言稳定 | 语言 × 模型 × reward 网格 | 广泛正迁移与局部严重回退 | 大规模 recipe 可参考 | 高：主动审计负迁移 |
| Data Selection | 似然筛选是否普适 | capacity × duration curriculum 视角 | 1.5B-8B Fast-Fit/Slow-Gain | 易复现实验 | 中高：域限数学推理 |
| Niche Translation RL | 稀有语言缺可验证平行数据 | 执行池→preference→RM→GRPO | 600 方向，4B +13%，中资源 +21% | 新 benchmark/执行 oracle | 中高：短函数覆盖有限 |
| Reliable Coding Agents | 模型外系统如何失效 | 依赖链、evidence ledger、gated practice | 206 records，多源审计 | protocol/skill 可用 | 中：综述非效应量分析 |
| Agentic Transaction | agent 如何获得 ACID 性质 | 语义 ACID + 事务式探索验证 | benchmark +10.6% | data-agent prototype | 中：property 级证据不足 |
| HELIX | harness 与 model 如何共演化 | typed intervention + sibling data | 65 candidates，+4%，oracle +58% | code 开源 | 中高：仅一轮演化 |
| APR Cost | 修复效果与成本如何交互 | complexity/localization/cost 联合分析 | 中等 bug >50%，模型成本反转 | 高，定价会漂移 | 中高：统计维度完整 |
| Mandato | 工具授权如何可证明 | 签名 mandate + protocol proxy + hash chain | 当前主要为设计与计划 | 架构清楚 | 低中：缺量化实证 |
| DepWareTrans | 仓库迁移如何维持依赖一致 | dependency-consistent batch | 51K LOC，38.16/9.39%→100% | 工业+多语言对 | 高：test coverage 仍是 ceiling |
| LegacyWorld | GUI 失败是否留下副作用 | state validator + atomicity label | 28 workflow，6 agent | validator 成本较高 | 高：检查持久状态 |
| S²VOPD | 无强 teacher 如何造蒸馏信号 | subtractive information asymmetry | 70.7%→77.4%，恢复 96% 增益 | recipe 清晰 | 中高：仅视觉感知任务 |
| APTER | 专业 reward 如何可诊断 | expert criterion→rubric→RL/SFT | 数学 +15.86，医疗 +8.04 | code/data 开源 | 中高：judge bias 会闭环 |
| Envs-FORGE | 合成环境如何贴近学习前沿 | pass rate + MILP per-seed action | tb-core +9.2，SWE-bench 73.4→77.1 | 完整 bundle 开源 | 高：固定规模/预算比较 |
| AgentRewind | 长程错误如何恢复 | context/environment 对齐 checkpoint | 多模型/harness 成功与进度提升 | 需可控环境 | 中：缺统一效应量 |
| Rollplex | VLM RL 如何保留 on-policy 又提速 | cross-phase prefix + weight sharing | 32 H800，最高 2.24× | 系统实现要求高 | 高：算法语义保持明确 |
| Differential Fault Injection | 现代化是否保留异常行为 | 原/新实现 paired fault campaign | >2,200 runs，200+40 对一致 | harness 可迁移 | 高：外部、确定性 oracle |

## 我的判断

**创新性：A-。** 今天最强的新意不在某个 loss，而在“把正确性变成状态性质”：semantic ACID、GUI atomicity、dependency-consistent migration、aligned checkpoint 与 differential fault response 共同构成比 success rate 更严格的研究对象。post-training 一侧，per-capacity data selection、per-seed environment synthesis 与 expert-grounded rubric 也真正改变了反馈如何被组织。

**实用价值：A。** DepWareTrans、LegacyWorld、AgentRewind、Mandato 和 Rollplex 都指向明确系统接口；Envs-FORGE 与 code-translation RL 给出可执行数据闭环。不过 Mandato 仍缺性能与攻击实验，AgentRewind 的外部不可逆动作支持也未解决，不能把架构完整度误判成部署成熟度。

**严谨性：B+。** differential fault injection、LegacyWorld 的 state validator、DepWareTrans 的 compile/test 和 Envs-FORGE 的 gold environment 提供了当天最强 oracle；Diverse Evaluation 与 multilingual GRPO 也主动报告负迁移。扣分主要来自新 benchmark 样本有限、部分系统只报告 aggregate gain，以及 Mandato 仍处于 evaluation plan 阶段。

**推荐价值：A。** 若只深读五篇，我会选 DepWareTrans、LegacyWorld、Envs-FORGE、Capacity-Dependent Data Selection 和 Differential Fault Injection：它们分别回答仓库一致性、外部状态、训练环境、数据难度和异常路径五个常被现有 agent 评估忽略的问题。若关注 post-training 系统效率，再加入 Rollplex；若关注长期 agent runtime，再加入 AgentRewind 与 Agentic Transaction。

今天的不确定性主要有三类：新的 benchmark 尚未经历独立复现；许多“100%/SOTA”仍受既有 test、verifier 或 judge ceiling 约束；部分论文在 arXiv 官方列表出现时，元数据首次提交日期早于 8 月 17 日。本文因此把“进入当日官方列表”与“首次提交”区分，并把架构提案、受控 benchmark 结果和外部状态证据分开评价。
