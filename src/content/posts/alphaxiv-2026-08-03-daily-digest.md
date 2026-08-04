---
title: "会通过还不够：8 月 3 日 arXiv 把 Coding Agent 的证据链与 Post-Training 的信用分配推到台前"
date: "2026-08-04"
description: "8 月 3 日的新论文集中追问两件事：软件智能体的成功究竟由什么证据支撑，以及 post-training 如何把反馈准确分配到步骤、动作与长期行为。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Agent安全", "Post-Training", "RLHF", "强化学习", "GRPO", "Reward Model", "程序修复"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-slate-950 via-indigo-950 to-emerald-900"
---

2026 年 8 月 3 日这一批 arXiv 新论文值得读，不是因为又出现了一批更高的 benchmark 数字，而是因为两条主线同时开始拆解“成功”这个过于粗糙的标签。coding-agent 论文追问：补丁通过了什么测试、agent 在修改前看过什么证据、删除是否真的发生、历史经验是否能跨任务复用；post-training 论文追问：奖励应落到整条回答、每个 token、可执行 action，还是能表征未来的 critic state。最醒目的共同趋势是，**训练与执行都在从终局分数转向可定位的过程证据**。这不是把两条方向硬凑在一起，而是当天各自独立出现、又恰好指向同一评测缺口的事实。

本轮逐项核对 arXiv 官方 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG 新论文页，并补充 cs.IR、cs.CV、cs.CR、cs.OS；合并新列与交叉列入条目后共得到 **382 篇唯一论文**。最终纳入 **59 篇实质相关论文**：coding-agent / software-change 主线 23 篇，post-training 主线 40 篇，其中 4 篇同时属于两条线。19 篇强相关论文均通过 `https://arxiv.org/pdf/<id>` 下载，文件大于 20KB、PDF 头校验通过，并用本地工具抽取全文；中弱相关条目基于 arXiv 官方摘要与元数据筛选。下文“发布日期”均指论文列入 2026-08-03 官方新论文页的日期，arXiv 编号仍为 2607 是因为首稿在 7 月末提交。

## 今日脉络

第一条脉络是 **coding agent 的验证证据开始被逐条审计**。BSG-VA 发现，repair agent 看到的“通过”事件里有 46.0% 根本不能区分 buggy state 与 gold fix；CanItDelete 进一步证明，测试通过常常只是因为测试没有检查应该删除的旧代码。ECLoop 则把干预点前移，在写文件或提交 patch 前要求 agent 先满足任务特定的 evidence condition。三篇论文共同否定了“跑过测试即有证据”这个默认假设。

第二条脉络是 **真实软件变更不再等价于单次 patch generation**。MobileForge 同时测多屏工程的构建、导航、视觉与可维护性；C-to-Rust 迁移把 12.5K SLOC 系统拆成可验证的 Ship-of-Theseus 式增量替换；AgenticRepair 组合静态结构、运行时崩溃和 commit history 修漏洞；STAIR 把过去 repair trajectory 抽象成能跨 scaffold 迁移的计划。软件演化的核心变量重新变成环境、状态、历史与同步修改。

第三条脉络属于 post-training：**dense feedback 只有在校准后才有价值**。SAF-OPD 发现 token-level teacher advantage 会在量级上淹没 bounded RLVR reward，并在时间上持续把 student 拉回 teacher；Adaptive FastOPD 则把 rollout horizon 的扩张绑定到当前阶段的相对学习进展，而不是固定步数。MAGA 更进一步，只把主要训练压力放到真正会执行的 GUI action token 上。这批工作没有否定 OPD，而是在回答“哪里该密、密到什么程度、何时退场”。

第四条脉络是 **critic / verifier 本身正在变成可训练、可审计的系统部件**。SVR 学会同时输出 verdict 与 confidence 来控制 test-time compute；LatentRM 把 reasoning trace 设为服务于 scalar reward 的离散潜变量；WCM 用未来 latent prediction 补足单帧 critic 的部分可观测性。它们分别覆盖语言推理、偏好建模和机器人控制，说明 critic 的表示能力已成为 post-training 上限的一部分。

第五条脉络是 **负结果比平均提升更值得记住**。偏好优化 counseling model 可能用放弃目标来换取“更体贴”；删除定位准确不等于真的删对；verified compiler 的测试与修复仍需要人监督确定实验边界；MobileForge 中 100% build success 与低视觉一致性、低导航成功可以同时存在。今天最有价值的论文大多没有把系统包装成“已解决”，而是精确说明成功指标漏掉了什么。

## 强相关论文深读

### 1. SVR：把自我验证训练成 test-time compute 控制器

**论文信息**：*SVR: Self-Verifying Refinement via Joint Verdict-Confidence Reinforcement Learning for Adaptive Test-Time Compute*；Hongyu Chen、Liang Lin、Guangrun Wang；[arXiv:2607.28457](https://arxiv.org/abs/2607.28457)；cs.AI / cs.CL / cs.LG；发布于 2026-08-03。

**一句话 TL;DR**：SVR 不依赖推理时的外部 verifier，而让模型每轮同时给出答案、离散正确性判断和置信度，并用这套内部信号决定保留答案还是继续推理。

**为什么值得推荐**：扩展 test-time compute 的常见做法是统一跑固定轮数，简单题浪费计算，难题又可能在反复“改进”中毁掉早先的正确答案；外部 oracle 虽能指导迭代，却把不可得的答案信息带到部署阶段。SVR 击中的是控制问题而非单纯解题问题：模型能否学会判断“现在已经足够好”。

**方法怎么工作**：Figure 2 给出三段闭环。第一步，每轮生成 solution、Correct/Incorrect verdict 与 confidence；第二步，训练期在固定三轮 trajectory 上用 ground truth 构造 correctness、calibration 与 stop-ready 奖励，再用 GRPO 更新；第三步，部署期不再读取 ground truth，仅当 verdict 为 Correct 且置信度超过阈值才停止，否则继续 refinement，最多十轮。训练固定、推理自适应的设计避免了 stopping action 改变训练采样分布。

**关键实验与证据**：Qwen3.5-2B 在七个数学 benchmark 上宏平均准确率 0.563，高于普通 GRPO 的 0.427、最强非 oracle 多轮 baseline Murphy 的 0.488，也高于论文设置中的固定预算 oracle-guided reference 0.519；平均只用 2.99 轮、每例约 8.56K token，不到固定十轮方法的一半。三 seed 结果为 0.556±0.007，说明提升不是单次幸运运行。

**局限和可信度**：训练奖励仍依赖可验证答案，结论主要来自数学题和一个 2B 模型；confidence threshold 虽统一为 0.85，但换领域后不保证仍校准。AIME26/AMC23 样本只有 30/40，作者也明确避免据此夸大显著性。可信之处在于同时报告准确率、轮数、token、seed 和阈值敏感性，而非只报最终分数。

**与当天主题的关系**：SVR 是当天“过程信号控制资源”的代表：verdict 不只是评价输出，还直接决定下一步是否发生。

### 2. MobileForge：编译成功不是多屏 App 生成的终点

**论文信息**：*Looks Right, Works Right: A Project-Level Benchmark for Multi-Screen Mobile App Generation*；Fan Wu、Cuiyun Gao、Yiming Huang、Yang Xiao、Yujia Chen、Qing Liao；[arXiv:2607.28645](https://arxiv.org/abs/2607.28645)；cs.HC / cs.AI；发布于 2026-08-03。

**一句话 TL;DR**：MobileForge 将截图到代码从单页像素复刻升级为多屏项目生成，同时测 build、真实导航、跨页视觉一致性、维护性与成本。

**为什么值得推荐**：真实移动产品不是一组互不相干的截图。共享组件、页面关系、路由状态和交互入口会把单页生成错误放大为工程级失败。论文最重要的贡献不是又建了一个 design-to-code 数据集，而是证明 build success、navigation、visual fidelity 和 maintainability 是相互独立的能力轴。

**方法怎么工作**：Figure 2 的 pipeline 先从真实 App 构造 29 个多屏项目与人工复核的页面关系，再生成 701 个导航场景和状态隔离的测试规范；统一 agent harness 给六个多模态模型相同的 React/TypeScript/Tailwind scaffold 与八种文件/构建工具；构建与导航由确定性执行检查，视觉用 anchor-referenced list-wise judge，维护性用复用、死组件、文件粒度等静态指标。状态隔离避免前一条导航失败级联污染后续测试。

**关键实验与证据**：29×6 共 174 次端到端运行全部构建成功，但导航通过率从 58% 到 92%，视觉点分最高仅 2.99/5。Claude Opus 4.6 的视觉 Borda 为 0.906，却生成 1,441 LoC、死组件率 19.9%；GPT-5 的 Borda 0.542，但只有 668 LoC、死组件率 7.8%，清楚显示视觉领先不等于工程质量领先。

**局限和可信度**：项目均落到同一 Web 技术栈，而非原生 iOS/Android 构建；29 个 App 与单次 run 无法估计随机方差；闭源模型和 judge 会随版本漂移。论文用 anchor sanity check、另一 judge 的稳健性检查和人工失败分类缓解 judge 风险，但尚不能替代真机交互与长期可维护性研究。

**与当天主题的关系**：它把 agent 质量从“能生成代码”拆成“能构建、能到达、看起来对、还能维护”四种证据。

### 3. Rolling With Resistance：偏好优化可能用放弃目标换取关系感

**论文信息**：*Rolling With Resistance: Preference-Optimized LLM Counselors Can Trade Goal Persistence for Relational Attunement in Motivational Interviewing*；Weiying Chen、Junlong Shen、Zhexuan Tang；[arXiv:2607.28814](https://arxiv.org/abs/2607.28814)；cs.CL / cs.AI / cs.LG；发布于 2026-08-03。

**一句话 TL;DR**：DPO 惩罚“对抗式劝导”并不会自动学会既尊重来访者又维持改变目标，模型常以降低 goal persistence 换取表面 relational attunement。

**为什么值得推荐**：这篇论文罕见地把 alignment tax 放到一个有专业行为规范、又不能压成单一好坏分数的场景。若只优化“不要对抗”，模型可能走向另一个失败极端——放弃干预目标。推荐它的原因是它展示了 preference pair 的负例定义如何改变行为边界，而不是只证明 DPO 能提高某个 judge 分数。

**方法怎么工作**：Figure 2 从 AnnoMI 的 sustain-talk 情境出发，按 topic 做不交叉切分；用 MITI 规范把回复标成 Goal Persistence 与 Relational Attunement 两轴、四象限；对三个 Qwen/Llama base 生成 on-policy negatives，并分别构造“拒绝 confrontation”与“拒绝 capitulation”的 DPO 数据；最后用模型家族隔离的生成、标注、judge firewall，加训练过的人类 coder 复核。

**关键实验与证据**：在三种 base、三个 seed 上，惩罚 confrontation 后 goal persistence 全部跌到与 base 的 pairwise parity 以下；attunement 只在 3 个 base 中的 2 个提升，第三个从 36.6% 到 35.9%，没有收益。惩罚 capitulation 基本无效，因为 base 的 on-policy 输出里该失败本来就少。prompt-only control 能提升 attunement 且不付 goal-persistence 代价，定位了优化本身的副作用。

**局限和可信度**：测试只有 142 个情境，自动 judge 仍可能继承临床语言偏见，论文评估的是文本 counselor 而非真实治疗效果。优势在于专家规范、topic-disjoint split、多 seed、跨模型和人类复核共同支持同一负结果；结论应理解为“DPO 的局部行为贸易”，不是对 DPO 或 AI counseling 的整体否定。

**与当天主题的关系**：它提醒当天所有 post-training 工作：降低一个可见错误，可能只是把概率质量推向另一个未被奖励覆盖的错误。

### 4. ECLoop：先满足证据条件，再允许 coding agent 修改

**论文信息**：*Preventing Premature Commitment in Coding Agents with an Evidence-Conditioned Execution Layer*；Yisen Xu、Chenglin Li、Zehao Wang、Jinqiu Yang、Tse-Hsun Chen；[arXiv:2607.28815](https://arxiv.org/abs/2607.28815)；cs.SE；发布于 2026-08-03。

**一句话 TL;DR**：ECLoop 在 agent 与仓库之间加一层 action gate，把 issue 和仓库结构编译成修改前必须观察到的证据条件，未满足时延后写入并引导继续检查。

**为什么值得推荐**：coding agent 常见失败不是完全不探索，而是在只看了一个相似函数、一个局部测试后就开始写代码，后续轨迹被早期假设锁死。ECLoop 把这种 premature commitment 定义成可拦截的运行时事件，并证明不改模型、不改 scaffold 也能改善结果。这比事后反思更接近数据库中的 commit precondition。

**方法怎么工作**：Figure 1 展示三步：先由 issue 描述与 repository tree 生成 task-specific evidence specification；运行时跟踪 agent 已读文件、搜索、测试和诊断输出，把观测映射到已满足条件；当 write/patch/submission 到来时，根据 action type 检查前置条件，若缺失就暂缓动作并返回结构化 gap，条件满足后才执行。结构化条件比自然语言提醒更能约束实际 action。

**关键实验与证据**：在 SWE-bench Verified 全部 500 题、两种模型与 mini-SWE-agent v2 / Codex CLI 两种 scaffold 上，Pass@1 提升 4.8–11.8 个百分点；GPT-5-mini 在 mini-SWE-agent 中从 56.2% 到 68.0%，MiniMax M2.5 从 75.8% 到 80.6%。平均 token 降低 1.4%–12.1%，成本最多降 10.2%。把结构条件替成自然语言摘要时 Pass@1 下降 10 点，说明收益不是多一句提醒。

**局限和可信度**：evidence specification 本身由模型编译，漏掉跨文件或隐含约束时 gate 会放行；暂缓动作也可能阻碍合理的 exploratory edit。实验只覆盖 SWE-bench Verified，尚未测复杂构建、移动端或长期演化。全量 500 题、跨 scaffold 与消融让主结论可信，但“零额外推理成本”应理解为总 token 下降，而非 gate 没有计算开销。

**与当天主题的关系**：ECLoop 是“把证据链前移到修改边界”的最直接实现。

### 5. MUTE：post-training 闭环会让已删除数据留下 influence echo

**论文信息**：*When Unlearning Fails: Reliable Data Deletion under Post-Training in Agent Networks*；Zihao Ding、Jun Huang、Liang Dong；[arXiv:2607.28829](https://arxiv.org/abs/2607.28829)；cs.NI / cs.LG；发布于 2026-08-03。

**一句话 TL;DR**：持续收集当前策略轨迹并继续训练的 federated agent network 中，目标数据的影响会经由后续“保留数据”回流，单次 unlearning 无法阻止它重新出现。

**为什么值得推荐**：大多数机器遗忘工作把模型更新看成静态一次性操作，但在线 post-training 的 retained trajectories 已经被旧策略塑形。删掉原始样本，不等于删掉它在后续行为中的二阶影响。论文把这一现象命名为 influence echo，并把删除义务扩展到数据—部署—采集—聚合的完整因果链，是持续训练可靠性中很实质的新问题。

**方法怎么工作**：MUTE 先用轻量 server ledger 记录样本、轮次和聚合路径，估计 forget item 对后续 trajectory 的影响；再做 forget-retain update 清除当前参数残留；对高影响 retained trajectories 隔离或降权，阻断回流；最后持续审计行为泄漏，并在 uplink 预算内调度后续 erasure。它不是把 full retraining 换个名字，而是显式治理闭环中的下游派生数据。

**关键实验与证据**：论文在 LIBERO、两个 VLA backbone、三种删除粒度上验证，并加入 Jetson 物理 edge testbed；主结论是 retained-data retraining 后 echo 仍存在，且随被目标数据塑形的 retained trajectories 增多而增强。MUTE 同时降低 behavioral leakage 与 influence regeneration，任务效用接近保留训练，并显著少于 full retraining 的通信量。这里作者没有在摘要中压成单一平均数，全文按删除粒度与预算展示曲线，反而更符合多目标权衡。

**局限和可信度**：影响估计依赖 ledger 完整性与既定网络拓扑；LIBERO 的机器人策略不能代表开放文本模型；“低泄漏”也不等于法律意义上的完全删除。物理边缘测试和多粒度设计增强系统可信度，但仍需要更大网络、异步客户端和对抗性日志缺失下的验证。

**与当天主题的关系**：这篇把 post-training 的可靠性从优化器内部扩展到数据生命周期：反馈回路本身也是必须审计的状态。

### 6. Ship-of-Theseus C→Rust：迁移不是翻译，而是双 gate 的增量演化

**论文信息**：*From C to Idiomatic Rust: A Ship-of-Theseus Agentic Translation*；Vasily A. Sartakov；[arXiv:2607.28835](https://arxiv.org/abs/2607.28835)；cs.SE / cs.OS / cs.PL；发布于 2026-08-03。

**一句话 TL;DR**：先用自动工具得到语义保真的非 idiomatic Rust，再让 agent 一小块一小块替换成安全 Rust，每次修改都必须同时通过编译与运行行为 gate。

**为什么值得推荐**：成熟 C 系统的 layout、aliasing、未定义行为与外部 ABI 无法靠一次生成重建。论文的阅读价值在于把迁移从 code translation 重新定义为 software evolution：保留一个始终可运行的 baseline，用连续小变更逐步替换内部结构。这恰好对应工业遗留系统最需要的可回退边界。

**方法怎么工作**：第一步，c2rust 生成尽量逐句对应、unsafe 但语义接近的 Rust baseline；第二步，agent 按模块和数据结构选择小的 idiomization step，逐渐用 ownership、safe abstraction 与 Rust API 替换原始指针语义；第三步，每一步先过 compilation gate，再跑与 C 实现对照的 runtime / protocol test；失败即定位并回退当前小步，而不是重做整个系统。Figure 2 把这个双 gate 循环画得很清楚。

**关键实验与证据**：案例是 iodine，一个约 12.5K SLOC 的真实 C 网络系统，而不是函数级翻译集。论文展示从可编译移植到 idiomatic Rust 的连续版本，并以行为测试保持 DNS tunnel 的运行语义；主要证据是迁移过程中系统始终可构建、可执行，且 unsafe 边界逐步收缩。它没有把单项目结果包装成平均胜率，属于方法论与经验型强相关论文。

**局限和可信度**：只有一个系统、一个主要 agent 工作流，外部协议测试也不可能覆盖全部未定义行为；人工选择变更顺序的作用难与模型能力分开。单案例限制泛化，但完整系统、真实编译器和双运行时行为验证的证据强于合成翻译 benchmark。

**与当天主题的关系**：它说明跨平台与遗留迁移的可靠单位不是“生成完的仓库”，而是每个可验证、可回退的演化步骤。

### 7. BSG-VA：一次 passing test 到底有没有测到这个 bug

**论文信息**：*Validation Evidence in LLM Repair Agents: How Much of What Passes Actually Tests the Bug?*；Xiaonan Xu、Wenjing Wu；[arXiv:2607.28871](https://arxiv.org/abs/2607.28871)；cs.SE / cs.AI；发布于 2026-08-03。

**一句话 TL;DR**：BSG-VA 把 agent 的每条验证命令精确重放在 buggy state、candidate state 与 developer gold fix 上，据此区分真正 bug-discriminating 的通过和“无论是否修复都会通过”的伪证据。

**为什么值得推荐**：repair agent 日志里最容易被高估的信号就是绿色测试。若同一个命令在原始 buggy code 上也通过，它最多说明没有触发新回归，不能证明修到了报告缺陷。这篇论文提供了一个可离线应用于任意可重放 trajectory 的 evidence role 分析框架，并用控制实验测试把 bug contrast 反馈给 agent 是否真的改变行为。

**方法怎么工作**：先在每个 validation command 执行时保存 exact working tree；从该状态抽取 test-only patch，避免新增测试与代码修改混在一起；把同一命令分别放到 B（buggy）、S（candidate）、G（gold）三种代码状态重放；根据三元结果赋予 gold-aligned discriminating、regression-only、misleading 等角色。实验再比较 bug-replay 内容、等注意力 reminder 和无干预三组。

**关键实验与证据**：643 条 rollout、110 个任务产生 3,730 个可分析事件；46.0% 的正向可比事件不携带 bug-discriminating 信息，23.8% baseline rollout 最终 patch 的全部正证据都属于这一类。返回 B-replay 后，证据不足闭环相对 reminder 降 7.8 个百分点（p=0.0029），discriminating evidence 升 7.4 点（p=0.011），repair success 未显著下降。

**局限和可信度**：两项效应都低于预注册的 10 点最小实际重要效应，且约三分之一改善来自 reminder；两次探索复现中，内容增量只在 gpt-5.6-sol 的开放工具 loop 显著。BSG-VA 要求保存代码状态和可重放环境，现实日志未必具备。作者没有把统计显著误写成实用显著，这一点尤其可信。

**与当天主题的关系**：它直接回答了今天 coding-agent 主线的中心问题：测试通过是一种事件，只有反事实重放后才可能成为修复证据。

### 8. CanItDelete：模型找到了该删的位置，却常用 guard 把旧代码留着

**论文信息**：*To Add Is Machine, To Delete Is Human: Measuring and Mitigating Deletion Avoidance in LLM Code Editing*；Amir M. Ebrahimi、Mohammed Mehedi Hasan、Aaditya Bhatia、Gopi Krishnan Rajbahadur、Ahmed E. Hassan；[arXiv:2607.28887](https://arxiv.org/abs/2607.28887)；cs.SE / cs.AI / cs.LG；发布于 2026-08-03。

**一句话 TL;DR**：前沿模型经常知道旧逻辑在哪里，却不愿真正删除，而是加 guard、fallback 或替代路径让测试先过；这是训练分布造成的编辑偏差，而不只是定位失败。

**为什么值得推荐**：软件维护的核心不只是加代码。遗留逻辑、过期 fallback 和重复分支若长期保留，会增加理解成本并制造静默行为差异。本文从真实 developer patch 出发，把 deletion recall、结构策略与追加测试结合，证明“过修复式加法”是可测的系统性行为。

**方法怎么工作**：先从五个 SWE-bench Verified 排行榜模型都能解决的任务对齐 developer deletion，测文件、行和语义层面的删除召回；再用结构分类器识别 Guard-and-Go 等补丁策略；为 34 个任务追加“旧目标仍存在就失败”的 removal-sensitive tests；最后构造 200 个纯删除任务 CanItDelete，并对 GPT-5.6 Sol 做逐层提示与 deletion post-training pilot。

**关键实验与证据**：五个模型的删除 recall 最高仅 71.7%；它们在 92% 以上案例到达正确文件，却不足 52% 真删中目标行。29.0% passing patch 属于 Guard-and-Go。34 个 retrofit 任务上，四个模型的成功率从 63.2% 降到 41.9%；纯删除集最强模型仍失败约五分之一。给出精确行后成功率也只有 80.5%，因为又出现越界删除或继续加代码。

**局限和可信度**：developer patch 不是唯一正确实现，34 个 retrofit 样本偏删除密集，不能代表完整 SWE-bench；结构分类仍有人工规则。论文明确讨论这些边界，并用“定位正确但动作错误”拆开 retrieval 与 editing，支持“undertrained behavior”而非能力绝对缺失的判断。

**与当天主题的关系**：这篇揭示通过测试后的静默维护债，是当天最值得记住的 patch correctness 负结果。

### 9. ACDC：对 coding agent 生成的 verified compiler 再做生成式测试与修复

**论文信息**：*Automated Testing and Repair for Verified Compilers Generated by a Coding Agent*；Martin Rinard；[arXiv:2607.28928](https://arxiv.org/abs/2607.28928)；cs.SE；发布于 2026-08-03。

**一句话 TL;DR**：论文针对 verified、checked、unverified 与 specification 四类代码分别设计随机/变形测试，把 defect record 交给 coding agent 修复，并反向审计编译器及 repair 是否为小 benchmark reward hack。

**为什么值得推荐**：形式验证并不意味着整个 compiler stack 都已正确；printer、parser、certificate generator 与可执行 specification 都可能留下空隙。更特别的是，Axon 本身由 coding agent 在人监督下生成，作者没有默认“有证明就可靠”，而是把 agent 生成系统再次置于执行和 reward-hacking 审计中。

**方法怎么工作**：针对 operational semantics / ASM printer，比对解释执行与真实 AArch64 结果；针对 optimization 与 checker，用 Csmith、skeletal enumeration、EMI 变体产生语义保持程序和 certificate rejection；针对 parser / printer，做随机 AST round trip；每个 defect record 保存 seed、触发程序、差异或错误，再让 repair agent 审计所有消费该语义的 proof/code site，生成最小修复并用原 seed 与新 seed 验证。

**关键实验与证据**：初始 30 分钟处理 8,200 个汇编程序，其中 6,760 个触发缺陷；repair 阶段修复 5 个 root defect，之后 4,600 个新程序未再触发。五次落地修复成本合计约 19.19 美元，其中 Fcmp 同时修改定义 +21/−5 行与证明 +24/−24 行。全部 campaign 最终修复所有暴露 defect / rejection，作者未发现 Axon 或修复代理利用小 benchmark 投机的证据。

**局限和可信度**：这是单一 Lean compiler、单一主力模型和开发者监督下的系统研究；“未发现 reward hacking”不是不存在的证明，随机测试也不能覆盖全部输入。优势是缺陷触发器、seed、proof impact 与修复成本都被保存，验证链比只报告 pass@1 更可审计。

**与当天主题的关系**：它说明 agent 生成的软件即使带形式证明，也仍需要覆盖未验证边界的执行证据和独立反投机检查。

### 10. SciDisco：把科学发现环境编译成 turn-level 可验证的 agentic RL

**论文信息**：*Scaling Scientific Discovery Environments for Turn-Level Agentic RL*；Yucheng Xu、Keyi Zhang、Yuyang Yu、Min Zhang、Shiyuan Meng、Pei Chu、Zhongying Tu；[arXiv:2607.28990](https://arxiv.org/abs/2607.28990)；cs.AI；发布于 2026-08-03。

**一句话 TL;DR**：SciDisco 将科学数据、hypothesis template 与 verifier 编译成沙箱环境，用隐藏 evidence DAG 标记中间分析进展，再以 DiscoPO 做 turn-level credit assignment。

**为什么值得推荐**：agentic RL 最大难点是终局奖励太稀疏：一个正确结论可能依赖数据清洗、统计检验、图表和假设修订，失败时也很难知道哪一步值得保留。SciDisco 的贡献是让环境本身持有不可见的 evidence state，从而在不把答案泄漏给 policy 的前提下，把进展变成可训练信号。

**方法怎么工作**：Figure 1 中，SciThèque 先把数据集、hypothesis 和可执行 verifier 包装成统一环境；模型在 sandbox 内调用分析工具，verifier 将每个动作映射到 evidence DAG 的状态跃迁；通过的轨迹先做 cold-start SFT；DiscoPO 再用 group rollout 和 turn-level evidence transition reward 更新 14B policy，而不是只给最终 answer reward。

**关键实验与证据**：SciDisco-14B 在 DiscoveryBench 达 35.2% HMS，超过 GPT-5 Mini 的 26.9% 与 DeepAnalyze-8B 的 25.9%；DataSciBench success/completion 为 56.3%/61.0%，而 Qwen3-14B base 仅 32.4%/45.9%，SFT+GRPO 为 49.5%/55.4%。但 DABStep 只有 17.8%，明显低于 DeepAnalyze 的 38.9%，清楚暴露训练分布边界。

**局限和可信度**：环境只覆盖文本可读数据与模板化假设，不等价于湿实验或开放科学发现；environment-accepted progress 仍是科学质量的代理。论文包含数据泄漏扫描、细粒度 ablation 和 10 位领域专家审查，但 14B 单 backbone 与领域 adapter 覆盖仍限制泛化。

**与当天主题的关系**：它展示 post-training 如何把最终成功拆成可验证、可归因的执行步骤，而不是依赖语言 judge 猜过程质量。

### 11. Execution-First Trace：合成 tool-use 数据应先跑通，再拿去 SFT

**论文信息**：*Execution-First Synthetic Tool-Use Trace Generation for LLM Agents*；Hafsa Ouajdi、Francesco Giannuzzo、Alaa Boukhary、Paolo Papotti、Gerard Conangla、Adam Elwood；[arXiv:2607.29175](https://arxiv.org/abs/2607.29175)；cs.SE；发布于 2026-08-03。

**一句话 TL;DR**：SyntheticAgentTraceQA 先在受控工具环境中构造并执行 reference trace，验证每一步参数、返回值和最终答案，再把成功轨迹用于小模型微调；只监督 action 与 final answer 比监督全部思维更好。

**为什么值得推荐**：function-calling 数据常由 LLM 直接“写一段看起来合理的对话”，工具返回值和答案未必一致。论文把数据生成改成软件测试：先 profile API、构造任务、真实执行、修复失败，最后才序列化成训练轨迹。它同时提供了一个有价值的 post-training 负结果——对 `<think>` token 施加 SFT loss 会伤害工具行为。

**方法怎么工作**：Figure 1 有五阶段：Profiler 提取工具 schema 与约束；task synthesizer 生成需要多步调用的问题；sandbox 按顺序执行工具并返回结构化错误而非中止；validator 检查参数、trace 与 answer 的一致性；最后比较 Full SFT 和 Masked SFT，后者只监督可执行 tool call 与答案，推理块不计 loss。

**关键实验与证据**：Qwen3.5-4B 的 answer completion 从 thinking base 41.0% 升到 Masked FT 59.5%，9B 从 52.83% 升到 86.0%；4B attempt-success gap 从 6.1% 降到 0.23%。Full FT 在 9B 上 completion 只有 17.5%，远低于 Masked 86.0%，是“过程监督越多不一定越好”的强证据。不过 token F1 最高仅 0.15、numeric match 最高 9.83%，最终语义质量仍远未解决。

**局限和可信度**：工具环境是受控企业分析模拟，reference trace 不一定唯一；answer overlap 对开放答案偏苛刻，低 numeric match 也说明数据与任务仍难。论文把执行成功、工具幻觉、trace agreement 与答案质量分开报告，因此不会用高 completion 掩盖低答案一致性。

**与当天主题的关系**：它同时属于两条主线：合成数据的可信度来自执行，而 post-training 的信用应落到真正影响环境的 token。

### 12. LatentRM：让 reasoning trace 成为服务于 scalar reward 的潜变量

**论文信息**：*Learning Latent Reasoning Traces for Scalar Reward Models End-to-End*；Sanwoo Lee、Clive Bai、Hsiu-Yuan Huang、Kun Liang、Weijie Liu、Yunfang Wu；[arXiv:2607.29185](https://arxiv.org/abs/2607.29185)；cs.CL；发布于 2026-08-03。

**一句话 TL;DR**：LatentRM 不把生成 reasoning 和 scalar scoring 并列训练，而把离散 reasoning trace 设为潜变量，直接优化它对最终偏好排序 likelihood 的贡献。

**为什么值得推荐**：scalar RM 快且有概率解释，却容易依赖表面线索；generative RM 会推理，但自然语言分数难稳定用于 RL。常见 hybrid 只做多任务，无法保证生成的解释真在帮助标量判断。LatentRM 的价值在于建立端到端耦合：只有能提高下游排序概率的 reasoning trace 才会被强化。

**方法怎么工作**：generator 根据 prompt 与候选列表产生离散 latent trace；scalar discriminator 条件于输入、候选与 trace 输出 Plackett–Luce 式排序概率；训练先从高质量 reasoning warm start，再用 on-policy rollout 和 Kendall's τ 奖励优化 latent generator，同时最大化标量 likelihood；部署时仍得到可直接用于 GRPO/RLHF 的数值 reward。

**关键实验与证据**：Table 2 显示 LatentRM 在六个 ID 数据集上取得最佳总体 Kendall's τ；Table 3 的 RM-Bench / PPE Correctness OOD 评测仍领先 scalar、generative 与并行 hybrid。用该 RM 做 100-step GRPO 后，对 base policy 的长度控制 win rate 为 56.9%，且在动态 policy shift 下比其他 RM 更稳定。这比仅在静态 preference set 上报分类准确率更有说服力。

**局限和可信度**：离散 latent trace 增加 rollout 成本，trace 是否“忠实解释”标量判断未被证明；训练与评测仍依赖自动偏好数据，reward hacking 可能转入潜变量。论文用 ID、OOD 与在线 RLHF 三层验证增强可信度，但需要更大模型、人类偏好与 adversarial trace 审计。

**与当天主题的关系**：它把 verifier 的中间推理从装饰性 rationale 变成必须对最终 reward 负责的训练对象。

### 13. SAF-OPD：teacher 的 dense advantage 也会把 RL 信号淹没

**论文信息**：*SAF-OPD: Stable Advantage Fusion for On-Policy Distillation*；Yifan Ding 等；[arXiv:2607.29209](https://arxiv.org/abs/2607.29209)；cs.LG / cs.AI；发布于 2026-08-03。

**一句话 TL;DR**：SAF 先稀疏、压缩 OPD advantage 的幅度，再让它 warm up 后逐步退场，从而避免 fixed GRPO+OPD 融合造成 entropy collapse 与 teacher ceiling。

**为什么值得推荐**：RLVR 的 response reward 稀疏但允许超越 teacher；OPD 的 token feedback 稠密却把 student 拉向 teacher。论文真正的新判断不是“二者互补”，而是固定系数融合会同时发生 magnitude mismatch 与 temporal mismatch：局部 teacher spike 抹掉全局验证奖励，长期 teacher force 又扼杀探索。

**方法怎么工作**：Figure 2 的四阶段只修改 OPD branch：先按重要性保留少量 token advantage，再对极值做非线性压缩；训练前期逐渐升高 OPD 权重以建立稳定行为，随后退火让 RLVR 主导探索；最后与 GRPO response advantage 相加。各阶段可独立开关，基本不改变 rollout 系统。

**关键实验与证据**：Qwen3 1.7B/4B/8B、数学与 code 两类共六个 model-domain setting、七个 benchmark 上，aggregate 比固定系数融合提高 0.51–2.70%，并避免 entropy collapse。代表性 4B ablation 中，仅做幅度控制约 44.35%，与 fixed 44.38% 接近；完整 temporal control 后才出现稳定增益，说明两种 mismatch 必须同时处理。

**局限和可信度**：提升幅度不大，主要环境仍是可验证数学/代码；teacher 质量、稀疏率和退火 schedule 可能对新领域敏感。六个 setting 的一致方向与完整消融支持机制判断，但尚未证明能迁移到开放式 preference reward 或长程工具 agent。

**与当天主题的关系**：SAF 把“更多 token feedback 更好”的直觉改成“dense signal 必须限幅、限时、为探索让路”。

### 14. MAGA：GUI agent 蒸馏应围绕 executable action，而不是平均对待所有 token

**论文信息**：*MAGA: Multi-Platform Self-Fusion of GUI Agents via Structured Action Distillation*；Hang Yan、Zhangxuan Gu、Beitong Zhou 等；[arXiv:2607.29320](https://arxiv.org/abs/2607.29320)；cs.AI；发布于 2026-08-03。

**一句话 TL;DR**：MAGA 将 mobile、web、desktop 三个专家蒸馏到统一 GUI policy 时，依据 action 是否正确重新分配训练信号，压低无用或错误 teacher token，只集中修 student 的可执行动作。

**为什么值得推荐**：跨平台 GUI agent 的难点不是自然语言风格统一，而是不同 action space 中一个坐标、selector 或参数错了就会改变环境。直接 weight merge 会在专家冲突时破坏 action；普通 OPD 又把解释 token 与 action token 等权。MAGA 精确抓住了 agent post-training 与普通文本蒸馏的差别：动作才是环境接口。

**方法怎么工作**：先分别训练 MobileWorld、OSWorld、WebVoyager 专家；student 在自身 on-policy 轨迹上执行并判断当前 action 正误；错误时加强对应专家在结构化 action 字段上的监督，正确时抑制不必要的 imitation，避免覆盖已掌握行为；训练期再给 teacher 一个不出现在 student 输入中的 hint，以生成更可用的纠错信号。Figure 2 对比 merge、普通 OPD 与 action-routed MAGA。

**关键实验与证据**：两个模型规模、三个环境上，MAGA 的平均 success rate 均为最佳；8B 比最强 baseline 高 2.0 个百分点，且平均表现接近三个专门 teacher。8B ablation 去掉 student-side action routing 后，三个环境分别降 3.4、3.8 和更明显的 action-quality 损失，说明收益来自结构化信用而非额外 teacher call。

**局限和可信度**：正确 action 的判定依赖各 benchmark 的局部 oracle；真实 GUI 中同一目标可能有多条等价路径，expert 也可能教错。三套 benchmark 仍是受控环境，跨版本 UI 漂移与安全权限未测。跨 action space 与两种规模的结果可信，但“统一 agent”尚未达到每个 teacher 的全部长尾能力。

**与当天主题的关系**：MAGA 同时覆盖 tool-using agent 与 post-training，清楚说明环境 action 应拥有比自然语言 token 更高的训练优先级。

### 15. AgenticRepair：漏洞修复需要结构、运行与历史三种上下文同时到场

**论文信息**：*AgenticRepair: Multi-Faceted Program Context Engineering for Agentic Vulnerability Repair*；Michael Fu、Qiyue Mei、Patanamon Thongtanunam、Kla Tantithamthavorn；[arXiv:2607.29422](https://arxiv.org/abs/2607.29422)；cs.SE / cs.AI / cs.CR；发布于 2026-08-03。

**一句话 TL;DR**：三个 specialist subagent 分别重建跨文件代码结构、崩溃运行时语义和漏洞 commit history，再把互补证据写入 repair agent memory 生成并用 sanitizer 验证 patch。

**为什么值得推荐**：一般 bug repair 只靠 issue、检索与测试反馈，漏洞修复却常要求沿内存来源、跨文件 data flow 和历史引入点追踪根因。论文不是简单堆 agent，而是按安全工程师真实取证过程拆分三种 context，并用完整 SEC-Bench 做互补性消融。

**方法怎么工作**：code-structure agent 搜索调用、数据流、内存操作与相关模块；runtime agent 执行 PoC、读取 sanitizer trace，定位 crash semantics 与 memory origin；history agent 查看 commit / blame，恢复脆弱模式如何被引入；context manager 将三份证据压入共享 memory，repair agent 再合成 patch，最后必须通过 PoC、构建与 sanitizer gate。Figure 1–2 展示从 triage 到多面上下文汇合。

**关键实验与证据**：SEC-Bench 全 300 个真实重建漏洞上成功 220 个，即 73%，比最强 GPT-5.2 Smolagents baseline 高 29 个百分点；在 200 个 CVE 子集上仍有 70%。按类别，150 个 buffer overflow 成功 74.7%，51 个 use-after-free 为 68.6%。消融显示三个 context facet 互补；换 GPT-5-Nano 后只剩 10%，也说明 scaffold 不能掩盖 base capacity。

**局限和可信度**：SEC-Bench 仍可能与预训练数据重叠，作者虽讨论 contamination，却无法彻底排除；真实安全补丁还需要 code review、性能与兼容性验证，sanitizer pass 不是完整正确性。300 题全量评估、PoC 与 sanitizer 执行、失败分类使结果强于只靠 patch similarity 的研究。

**与当天主题的关系**：它是当天“仓库级可靠修复依赖多源证据”的最强实证之一。

### 16. Adaptive FastOPD：rollout horizon 应在边界学不动时才扩张

**论文信息**：*Adaptive FastOPD: Progress-Aware Rollout Horizon Expansion for Efficient On-Policy Distillation*；Qian Tan、Huaifei Liang、Xuanyu Zhu、Lei Jiang、Yuqiang Li；[arXiv:2607.29494](https://arxiv.org/abs/2607.29494)；cs.LG；发布于 2026-08-03。

**一句话 TL;DR**：Adaptive FastOPD 不用固定日程或绝对 teacher-student agreement，而观察当前 rollout 边界附近的相对学习进展与 horizon 利用率，只有停滞且用满时才增加长度。

**为什么值得推荐**：OPD 的主要系统成本往往来自极少数超长 response 拖住整批 rollout。固定截断省钱但会长期丢失后段监督，按训练 step 固定扩张又不适配不同 student。本文把 horizon 当作 curriculum state，并用进入该阶段时的相对基线判断是否已经学尽，而非假设所有模型以相同步速成长。

**方法怎么工作**：学生先在当前 H 内 rollout；系统持续记录四个 teacher-student signal，并与刚进入这个 horizon 时的值比较，检测 boundary-region plateau；同时统计序列是否普遍接近 H，防止少量长尾触发扩张；只有 plateau 与 utilization 两个 gate 同时满足才增加 horizon。Figure 1 给出状态机，Figure 2 展示真实扩张轨迹。

**关键实验与证据**：两个 teacher-student pair 上，Adaptive FastOPD 获得最高平均数学推理分数，相对 OPD 15K 训练时间减少 49.1%–71.2%。在一个对照中，它比固定 step 扩张高 1.2 个百分点且时间再少 13.4%；不同 threshold 组合下扩张点变化较小，说明相对信号比绝对 agreement 更稳。

**局限和可信度**：只有两个 pair、主要是数学长回答；四信号和多个阈值仍带来系统复杂度，异步 rollout / heterogeneous batch 下可能失效。论文报告 wall-clock、性能和 horizon trace，而非只用理论 FLOPs，因此效率结论较可信，但需要大规模集群复现。

**与当天主题的关系**：它把 post-training 效率从“少生成 token”改成“在模型准备好之前不为远端 token 付费”。

### 17. ARCTIC：AI diff 需要 intent、drift 与 spotlight，而不是更多 style comment

**论文信息**：*From Code Review to Code Critique: Intent, Drift, and Spotlight for AI-Generated Diffs at Scale*；Chandra Maddila、Mashrur Rashik、Euna Mehnaz Khan、Smriti Jha、James Saindon、Nachi Nagappan、Peter C. Rigby；[arXiv:2607.29516](https://arxiv.org/abs/2607.29516)；cs.SE / cs.AI；发布于 2026-08-03。

**一句话 TL;DR**：ARCTIC 不再试图给整个 AI diff 写一堆 review comment，而是恢复开发意图、用 backtranslation 测实现漂移，并把最值得人看的一小片代码排到前面。

**为什么值得推荐**：coding agent 产出速度超过人工 review 后，低价值风格建议只会进一步消耗注意力。论文从 18,000 条真实 code review 建立人类关心点 taxonomy，发现 correctness、安全与性能才是稀缺审查资源的目标，因此把系统设计为 critique / triage，而非自动批准器。

**方法怎么工作**：intent prediction 汇合对话日志、issue 与变更元数据，推断“为什么改”；drift detection 将 diff backtranslate 为实现意图，再与原意图做序数对齐；spotlight 在行/块级估计 correctness、安全、性能风险并排序；最后把三类信号放入作者 self-review UI，让人优先检查高 drift 与高 risk region。Figure 1–2 对应架构和工作流。

**关键实验与证据**：intent prediction F1 为 0.86，drift 与人工标注的 QWK 达 0.907；spotlight 在质量估计上比 baseline AI reviewer 强 2.4 倍，同时少用 5 倍 token。实验 rollout 中 drift score 使 misalignment 再降 5.76 点（p=0.026），intent 获 90.2% 认可；上线后未归因到 self-reviewed diff 的 defect 是有价值但尚短期的运营信号。

**局限和可信度**：工业单组织数据可能带有特定流程偏差；“zero attributed defect”受归因机制和观察窗影响，不能当零风险。backtranslation 与 judge 也可能共享语言模型盲点。离线标注、受控 rollout 与生产观察三层证据互补，但长期 defect escape 仍需追踪。

**与当天主题的关系**：ARCTIC 把 agent 审计的目标从“自动 review 一切”调整为“把有限人工注意力投到意图漂移最可能发生处”。

### 18. WCM：critic 若看不见时间，就学不好机器人价值

**论文信息**：*WCM: A World Critic Model for Vision-Language-Action Reinforcement Learning*；Senyu Fei、Xiaopeng Yu、Siyin Wang、Xianzhong Zhao、Jingjing Gong、Xipeng Qiu；[arXiv:2607.29613](https://arxiv.org/abs/2607.29613)；cs.RO / cs.CL / cs.CV；发布于 2026-08-03。

**一句话 TL;DR**：WCM 让 VLA critic 同时预测未来 latent state 与 scalar value，用轻量 world-model objective 补足单帧表示的部分可观测性。

**为什么值得推荐**：VLA post-training 中，policy 需要根据动作历史和物体状态判断当前处境，但 critic 常只读一帧或一帧 backbone latent。单纯把更多帧拼进视觉空间昂贵，而且 return regression 本身没有足够信号学动力学。WCM 把问题定位为 state approximation，而不是再换一种 PPO loss。

**方法怎么工作**：Figure 2 中 observation encoder 生成当前 latent；LeJEPA 风格预测头根据历史与 action 预测未来 latent，提供跨时间自监督；value head 在共享世界表示上估计回报；训练时将 world prediction 与 value loss 联合，部署只保留轻量 critic 接口。它可插入 on-policy 和 off-policy pipeline，并兼容 Pi0、Pi0.5、OpenVLA-OFT。

**关键实验与证据**：论文覆盖 ManiSkill、MetaWorld、CALVIN、LIBERO-Plus 等四套 benchmark 共 149 个任务，在 in-distribution 与 OOD 上均取得 SOTA 或稳定提升；还用 OpenVLA-OFT 与 Pi0.5 在 7 个真实操作任务上做 off-policy RL 验证。Table 1–2 的主要增益在 OOD 与少示例设置更明显，支持“更好状态表示而非只记训练任务”的解释。

**局限和可信度**：world latent 的可预测性不等于物理正确性，critic 可能学习视觉捷径；真实实验只有 7 个任务，机器人平台、相机与物体分布仍窄。大规模 simulation、两种真实 backbone 和 value-curve 可视化增强可信度，但训练成本与长 horizon failure 尚需展开。

**与当天主题的关系**：它是 multimodal post-training 中“先修 critic 表示，再谈 RL 稳定性”的代表。

### 19. STAIR：过去的修复轨迹只有经过层级抽象才值得复用

**论文信息**：*Reusing Past Repairs Through Hierarchical Trajectory Abstraction for Coding Agents*；Yisen Xu、Jiayuan Zhou、Ruiqi Pan、Tse-Hsun Chen；[arXiv:2607.29658](https://arxiv.org/abs/2607.29658)；cs.SE；发布于 2026-08-03。

**一句话 TL;DR**：STAIR 把历史 repair trajectory 压成从诊断动作到高层策略的多层树，针对新 issue 跨层检索并改写为阶段计划，且这些计划能迁移到完全不同的 agent scaffold。

**为什么值得推荐**：经验复用的常见做法是检索相似 patch、原始轨迹或一句总结，但真实修复的可迁移部分往往是“先检查 upstream serializer，再审计所有 backend”这类跨粒度程序。STAIR 的关键贡献是把失败探索和具体文件名过滤掉，保留可在新仓库重新实例化的过程结构。

**方法怎么工作**：Figure 1 先把每条历史轨迹按 repair stage 分段；再把工具动作、局部诊断和高层策略组织成层级树；新 issue 到来时从多个 abstraction level 选择相关节点，tailor 成阶段性可执行计划；计划作为 prompt guidance 注入现有 agent，不改工具和验证逻辑。多层混合既给方向又保留足够操作约束。

**关键实验与证据**：SWE-bench Verified 上，MiniMax M2.5 达 81.2%、GPT-5 达 79.2%；同 backbone 的 Lingxi 分别为 74.6% / 75.6%。把 STAIR 计划直接给 mini-SWE-agent v2，Pass@1 从 75.8%（379/500）升到 81.0%（405/500），平均步骤从 60.45 降到 58.18、token 从 1.245M 降到 1.180M。125 题消融中完整层级为 80.0%，原始轨迹只有 57.6%。

**局限和可信度**：历史轨迹与 SWE-bench 任务的相似性可能带来 benchmark-specific reuse；计划也造成 17 个 regression，其中 8 个因覆盖不全、9 个因执行偏离。人工 gain analysis 的 κ=0.85，且跨 scaffold transfer 是很强的独立证据，但仍需时间切分和真实企业 issue 验证 contamination 与长期收益。

**与当天主题的关系**：STAIR 把 commit/history reuse 从“拿旧答案”变成“复用可审计的修复过程”，是当天软件演化线的收束点。

## 中相关论文速读

以下论文对两条主线有明确贡献，但或场景较窄、实验仍初步，或与当天更核心的“证据链 / 信用分配”只在一侧相接，因此保留关键判断而不展开为完整深读。

### 20. LARA：把 adapter 放进 residual stream

*LARA: Lightweight Adapters in the Residual Stream for Composable Adaptation and Alignment*；[arXiv:2607.28669](https://arxiv.org/abs/2607.28669)；cs.LG。问题是 LoRA 把行为写进权重更新，难以连续调节强度或让多个行为同时常驻。LARA 在少数层读取 hidden state，再把低秩 correction 加回 residual stream；冻结 base 后，推理时用缩放系数连续插值 base / adapted behavior，还可逐 token 路由不同模块。

等参数量下，它在 code fine-tuning 与 DPO 上匹配 LoRA，并让 1.5B 模型同时常驻七种行为，只增加约 33MB。值得保留的判断是：post-training artifact 不一定是 weight delta，也可以是可组合的 activation delta。暂不深挖是因为主实验规模与任务范围有限，自动路由的干扰、安全边界及更大模型吞吐还需验证。

### 21. TELLER：用当前模型的残余错误刷新 preference data

*TELLER: Dual-Path Iterative Preference Optimization for Table Entity Linking*；[arXiv:2607.28680](https://arxiv.org/abs/2607.28680)；cs.CL / cs.LG。静态偏好对会迅速与更新后的模型脱节；TELLER 的 direct path 持续挖当前 residual errors 刷新 DPO 数据，reasoning path 则先压缩 CoT 做 SFT，再用长度归一、正则化的 iterative preference objective，避免长 reasoning 在 sequence loss 中占便宜。

MammoTab V2 上 direct path 从 87.59% 到 88.20%，reasoning path 从 79.09% 到 81.85%；TableInstruct 已接近饱和，只从 94.35% 到 94.50%。推荐它作为“偏好数据必须随 policy 演化”的小而清楚案例；不列强相关是因为提升主要集中于单一 table entity-linking 任务，尚未证明迭代采样不会自我强化标注偏差。

### 22. MASC：隐喻会把错误的程序流程带进代码

*Metaphor-Induced Algorithmic Steering: Cross-Domain Procedural Transfer in LLM Code Generation*；[arXiv:2607.28683](https://arxiv.org/abs/2607.28683)；cs.SE / cs.AI。MASC 迭代生成看似良性的 metaphor instruction，让“全面搜寻、逐个排查、反复重建”一类源域程序被类比迁移到编程题，诱发穷举、全扫描等低效率实现；作者还检查 hidden-state 是否向低效算法 prototype 移动。

这篇值得留意，因为它把代码生成的可靠性风险从明显恶意 prompt 扩展到语义上合理的跨域 analogical transfer，也说明只做表面关键词检测不够。暂不深挖的原因是摘要没有给出足够清楚的任务覆盖与绝对性能损失，机制分析也主要是表征相似，尚不能证明隐喻是唯一因果路径。

### 23. Agent-safety benchmark validity audit：先说清楚你测的是什么安全

*Safety, or Just Capability? A Validity Audit of Agent-Safety Benchmarks*；[arXiv:2607.28685](https://arxiv.org/abs/2607.28685)；cs.AI / cs.IR。作者按官方实现运行 R-Judge、InjecAgent、AgentHarm、AgentDojo，并把“安全分数”当测量工具做效度审计。R-Judge 上 always-positive 的 F1 就有 0.690，高过 21 个模型中的 5 个；同一批模型在三套 broad benchmark 上排名不一致，小样本相关甚至会换符号。

AgentHarm 对 jailbreak safety 的控制能力相关最高达 ρ=0.72，但这只能证明两者都在测 harmful compliance，不能外推“总体安全”。这篇与当天 agent 质量审计高度相关；未列强读只是因为它针对通用 agent-safety measurement，而非软件变更 agent 本身。最该记住的结论是：报告 benchmark、metric、target behavior 与 model panel 缺一不可。

### 24. DragonCrawl：从易碎 selector 转向 intent-based 移动端回归

*DragonCrawl: A Generative, Intent-Based Framework for Scalable Mobile End-to-End Testing*；[arXiv:2607.28750](https://arxiv.org/abs/2607.28750)；cs.SE / cs.AI。系统用 GPT-4o 多模态理解测试意图与屏幕状态，并通过 tool call 切换 backend state，目标不是随机探索 crash，而是在每次代码变更后重跑关键用户 flow、阻断回归。

1,013 条持续 CI 测试中，iOS / Android pass rate 为 91.6% / 92.2%，onboarding 从 96–120 小时降到 4 小时内，作者估计节省 27 developer-years 的维护工作。生产数据很有分量，且与 MobileForge 的“导航 / 运行行为必须独立验证”呼应；但系统依赖单一闭源模型，pass rate 的分母、人工介入与失败严重度需要更细拆解，因此保留为中读。

### 25. Repository-aware metamorphic relation：为没有 oracle 的 AR App 造可执行判断

*Repository-Aware Metamorphic Relation Generation for Augmented Reality Applications using Large Language Models*；[arXiv:2607.28775](https://arxiv.org/abs/2607.28775)；cs.SE。pipeline 先按文件、类、方法建立层级仓库上下文，再从多种 context configuration 生成 metamorphic relation；当候选冲突时，用 agentic deliberation 合并、去重并选择能落到具体 assertion 的关系。

142 个移动 AR 仓库共产生 14,916 个候选，hierarchical context 覆盖 7,004 条 relation 与 5,167 个 class-method pair；79.0% 案例发生冲突，deliberation 在 88.2% 结果中选出 context-aware 关系。关键边界是 executable evidence 只有 5 个测试的初步案例，人工 oracle 也仅 141 条；所以它证明了规模化生成与具体性，尚未证明大规模 fault detection。

### 26. Model or Harness：把失败修复责任分配到交互边

*Model or Harness? An Interaction-Centric Taxonomy for Localizing Agent Failures*；[arXiv:2607.28802](https://arxiv.org/abs/2607.28802)；cs.AI。论文不再给整个 agent system 打一个 failure label，而把 model、harness、user、tool、memory、environment / grader 画成组件图；41 种 failure mode 被放到某条交互边，并标明 fault side，从而决定应该 post-train 模型、修 tool integration，还是重做 benchmark。

四个 frontier reasoning judge 中最强者对人工类别达到 Cohen's κ=0.76，说明 taxonomy 有一定可复现性。它是当天两条主线的桥梁：post-training failure 与软件 harness failure 不应混修。暂不强读是因为证据主要来自公开案例、system card 与日志重标，而非对一个真实系统按 taxonomy 修复后测因果收益。

### 27. TextCloak：用 GRPO 生成“训练后不可学、阅读仍自然”的文本

*TextCloak: Thwarting Unauthorized LLM Exploitation via RL-Driven Unlearnable Text*；[arXiv:2607.28862](https://arxiv.org/abs/2607.28862)；cs.CL / cs.AI / cs.CR / cs.LG。生成 policy 将干净文本变形成语义和自然度尽量不变的版本；GRPO-UE 的 reward 来自 surrogate LLM 在这些文本上 fine-tune 后的性能退化，形成内外两层优化，而不是添加分类任务专属触发词。

六个数据集、九个 LLM 上均能抑制未经授权 fine-tuning，并测试了跨架构、训练配置和 adaptive attack 的迁移。它实质涉及 post-training 数据安全，也很新颖；但核心目标是保护内容而非改善模型能力，且“合法用户效用不降 / 非法训练退化”的现实威胁模型容易被攻击者改变，因此放在中读而非今日主轴。

### 28. Circuit-guided LAT：从 defense 与 attack 两侧同时降 adversarial training 成本

*Efficient LLM Adversarial Training via Low-Rank Defense and Circuit-Guided Surrogates*；[arXiv:2607.28959](https://arxiv.org/abs/2607.28959)；cs.LG / cs.AI。defense side 用 representation fine-tuning 代替全参更新，并指出 ReFT token 与 attack token 不匹配会削弱防御；attack side 只抽取与当前攻击相关的 circuit，构造轻量 surrogate 生成 latent adversary，避免每步都穿过完整模型反向传播。

相对 full fine-tuning LAT，平均每步 FLOPs 降 48.1%，可训练参数仅 0.0118%。值得保留的是它没有把 PEFT 当即插即用，而明确检查攻击位置与低秩防御位置的耦合。暂不深挖是因为安全强度、adaptive white-box attacker 与 wall-clock / memory 的完整权衡需要比摘要更长期的复现。

### 29. UML formalism-aware reward：可编译不等于建模语义正确

*A Formalism-Aware Reward Loop for Handwritten UML-to-PlantUML Generation*；[arXiv:2607.28987](https://arxiv.org/abs/2607.28987)；cs.SE。作者先 SFT，再用 GRPO；reward 不是文本相似度，而是把 PlantUML 转成 XMI（类图）或 control-flow graph（活动图）后比较结构。适配模型的编译率和转换质量超过 untuned open model 与一个 proprietary baseline，对更强 closed model 则只在类图上接近。

推荐它是因为 reward 明确落在软件 formalism，而不是让 judge 看“像不像”。但作者自己承认当前 held-out set 尚未证明 RL 阶段相对 SFT 的附加收益，metric validity 也只覆盖部分建模可接受性。这种克制很重要，也决定它目前适合速读、还不适合当 post-training recipe 复现。

### 30. EvoReason：让 reasoning primitive 与 student latent space 一起演化

*EvoReason: Self-Evolving Reasoning Primitive-Guided On-Policy Distillation for Latent Reasoning in Generative Recommendation*；[arXiv:2607.29010](https://arxiv.org/abs/2607.29010)；cs.IR。它从高质量推荐 agent trajectory 中提炼可复用 reasoning primitive，把 primitive 当 pseudo-tool 约束 teacher 生成更短、更稳定的 CoT；student 在 latent space 学习后，当前表现又反过来决定下一轮 primitive-guided supervision，形成 on-policy co-evolution。

问题定义很有价值：原始 CoT 冗余且路径不稳定，不应直接当 latent reasoning ground truth。未列强相关的原因是摘要几乎没有给出具体 benchmark 数字，且推荐系统的延迟约束与一般 reasoning transfer 不完全相同。最值得保留的是“teacher rationale 也应随 student failure 更新”，与 TELLER 的 residual-error preference refresh 同方向。
### 31. DASH-OPD：多轮 agent 应按 drift / recovery 切换 student 与 teacher

*DASH-OPD: Discrepancy-Aware Switching with Hysteresis for On-Policy Distillation*；[arXiv:2607.29078](https://arxiv.org/abs/2607.29078)；cs.LG。DASH 在 student turn 上计算 student-to-teacher action-token log-prob ratio 作为 drift，在 teacher turn 上反向计算 recovery；信号跨多轮累积，超过不同阈值才切换 executor，用 hysteresis 防止一次异常造成频繁抖动。

ALFWorld 上优于 baseline，并声称训练、部署效率更好。这个方法比“训练越晚越少用 teacher”的固定 curriculum 更贴合 agent trajectory，因为错误是否已将状态带出 teacher 熟悉分布取决于当前交互。不过论文明确是 work in progress，代码、训练日志与 checkpoint 尚待发布；数字和多环境复现不足，所以只保留机制判断。

### 32. PRISM：多 reward 冲突时，分解 policy 而不是先把分数相加

*Don't Mix Rewards, Mix Policies: Policy Decomposition and Optimization for Multi-Reward RL*；[arXiv:2607.29246](https://arxiv.org/abs/2607.29246)；cs.AI。PRISM 为每个正向目标训练独立 positive policy，再训练一个全局 negative policy；部署时在 policy space 组合，而不是把 helpfulness、安全、工具使用等 reward 先线性混合后让一个 policy 承受相互冲突的梯度。

在科学推理、tool-use reasoning 与 helpfulness-safety alignment 上均优于 multi-reward RL baseline，并提供推理期偏好控制。推荐它因为它把 alignment tax 定位为优化路径冲突；暂不深读是因为 policy composition 的存储、推理成本、组合外行为和负 policy 的安全稳定性仍需更多具体数据。它与 LARA 都代表“行为模块化”而非“一套权重包办一切”。

### 33. Data Turnstile：小模型的 function calling 首先是数据工程问题

*Data Turnstile: A Scalable Open Framework for Function-Calling Data Generation*；[arXiv:2607.29250](https://arxiv.org/abs/2607.29250)；cs.CL。框架读取用户 API schema，把多轮调用拆成受约束的 stepwise generation，并在每步做 schema validation、执行 / 错误反馈与难度控制；发布数据覆盖 1,000+ API、100K+ 多轮交互。

Qwen3-0.6B 在 BFCL 从 thinking base 67.4% 升到 75.9%，接近 4B 的 79.9%；τ²-bench Telecom 上 1.7B 从 6.6% 升到 31.1%，超过 Qwen2.5-32B 的 27.4%。数字很强，值得复现；未列强读是因为摘要未说明合成 API 与 benchmark API 的相似性、执行 oracle 的真实程度和 contamination 控制。它与 Execution-First Trace 的差别正值得并读：一个强调规模和 schema loop，一个强调 reference trace 先真实跑通。

### 34. Translation with Thought：按难度决定是否值得长思考

*Translation with Thought: Difficulty-Adaptive Reasoning via Reinforcement Learning for Multi-Domain Machine Translation*；[arXiv:2607.29287](https://arxiv.org/abs/2607.29287)；cs.CL / cs.AI。TwT 先用 DeepSeek-R1 长 CoT、再经 GPT-4o 改写为更节制的 reasoning trace 做 SFT；随后用同时奖励翻译质量与 reasoning efficiency 的 RL，让模型在直觉翻译与 deliberate reasoning 之间切换。

15 个 benchmark、3 个 seen 和 59 个 unseen language 上，7B/14B 超过更大 reasoning model，同时 token 减 32%–60%。它是 reasoning post-training 泛化到翻译的扎实例子；但 teacher-generated CoT 是否真对应人类翻译过程、自动质量指标能否覆盖语用，以及三阶段数据来源是否泄漏，都需要全文复核，因此列中读。

### 35. Beyond Component Testing：agent validation 需要五维生命周期视图

*Beyond Component Testing: Validating Agentic AI Systems*；[arXiv:2607.29405](https://arxiv.org/abs/2607.29405)；cs.AI / cs.MA / cs.SE。综述汇总 257 篇论文，把验证分为 behavioral、safety、temporal、regulatory、multi-agent 五维，并用医疗、工业、智能交通案例说明 trajectory、环境变化与持续证据维护为什么超出 one-shot component test。

核心判断是 behavioral evaluation 相对成熟，temporal validity、runtime evidence maintenance、regulatory legibility 与开放多 agent assurance 明显不足；建议用 bounded-autonomy specification、adversarial trajectory、runtime monitoring 和 audit-ready evidence。它是很好的地图，但主要贡献是整理与议程，不是新 benchmark 或因果实验，因此适合作为当天强实证论文的索引，而非深读中心。

### 36. SESA：self-play 的失败应同时改写参数与技能记忆

*Self-Play Meets Skill Evolution: Self-Evolving Search Agents that Pose, Solve, and Remember*；[arXiv:2607.29468](https://arxiv.org/abs/2607.29468)；cs.AI。challenger 出题，solver 解题并独占 skill retrieval；informative failure 被蒸馏为 procedure 写回 memory，新的 memory 改变 solver 成功率，进而改变 challenger reward 与下一批问题分布。skill 既进入 on-policy trajectory 影响参数，也可作为推理期插件。

七个开放域 / 多跳 QA benchmark 上比普通 self-play 提升 1.2–3.2 点，比 SkillRL 高 0.9；移除 memory 后仍保留 1.8–2.2 点参数收益，最终 skill bank 再加 0.5–1.0 点。值得保留“外部记忆可改变训练分布”这一判断；不列强读是因为搜索 QA 与工具执行可靠性仍有距离，skill 污染与遗忘也未充分审计。

### 37. AuditCoder：让生成决策、代码所有权与 bounded repair 共用稳定 ID

*AuditCoder: Responsibility-Preserving Task Graphs for Auditable Code Generation and Bounded Repair*；[arXiv:2607.29529](https://arxiv.org/abs/2607.29529)；cs.SE。系统在生成前建立 contract-annotated task graph，每个 commitment、实现片段、来源、验证证据与后续干预都绑定稳定 responsibility identity；失败后 locator 只在有证据时映射到节点 / dependency branch，否则 abstain，并冻结其余代码做 bounded regeneration。

APPS pass@1 为 82.5%–83.0%，落后 AgentCoder 7.5–8.5 点；ClassEval 75.0%–82.0%。200 条记录的 decision-code trace coverage 为 0.9725，60 个失败中定位 26 个，17 次局部 repair 通过。它牺牲一部分最高分换审计性，研究问题很好；但主要是函数 / 类生成，尚未验证大型仓库中 task graph 的稳定边界，所以保持中读。

### 38. LEMUR：从多人的偏好学习多目标 reward vector

*LEMUR: Learning to Align with Multi-Objective Reinforcement Learning from Preference Feedback*；[arXiv:2607.29559](https://arxiv.org/abs/2607.29559)；cs.AI / cs.RO。LEMUR 不假设每个目标都有已知 scalar reward，而是从多个反馈者的 pairwise preference 联合学习 objective-specific reward model，并在此基础上训练覆盖 Pareto trade-off 的 policy。

它补上了 preference-based RL 多集中于单目标、multi-objective RL 又假设 reward 已知的缺口。论文在多种 multi-objective task 上优于 baseline，但摘要没有给出人类反馈规模、噪声处理和绝对数值；目标之间的偏好冲突是否被真实人群覆盖也不清楚。因此它是值得追踪的 RLHF 扩展，不足以成为当天实证主角。

### 39. Multi-policy PEFT：组织优化路径比继续加 adapter 容量更重要

*The Parts Are Greater Than the Sum: Automated Task Sequencing for Efficient Training of Multi-Policy LLMs*；[arXiv:2607.29601](https://arxiv.org/abs/2607.29601)；cs.LG。作者先估计任务间优化兼容性，自动 grouping / sequencing；兼容任务共享路径，不兼容任务进入独立 QLoRA，使固定参数预算下既保留正迁移，又减少持续 fine-tuning 的 interference 与 forgetting。

TRACE benchmark 上，自动 multi-policy PEFT 达 44.78，同等 trainable capacity 下优于单 policy 与简单多 adapter。推荐理由是它把 continual post-training 的问题从“adapter 表达够不够”移到“任务以什么顺序共享更新路径”。暂不深挖是因为单 benchmark、任务相似度估计成本和部署时 policy 选择尚未给出足够证据。

### 40. OVI：on-policy interaction 放宽的是 student 的表示要求

*When Does On-Policy Interaction Help? Representational Tradeoffs in Value-Based Imitation Learning*；[arXiv:2607.29617](https://arxiv.org/abs/2607.29617)；cs.LG / cs.AI。理论核心是：若 student 表达不了 expert policy，offline BC 会受 expert policy class 复杂度限制；有 on-policy expert interaction 后，只要 student 能表示 expert value function，就可能通过价值引导学到好行为。OVI 在 linear maximization oracle 下给出统计与计算效率保证。

实验中 OVI 优于 BC、DAgger 和 offline value-based IL，student 越小、expert 越强时优势越大；同时给出“只有 value realizability 时，离线算法仍必须随 expert policy class 扩张”的负结果。它对 distillation 很有基础价值，但不是 LLM 专用 recipe，实验环境与语言模型规模的距离较大，所以列中读。

### 41. CodeShrink：多模态代码理解先删空白，再按任务删视觉 token

*CodeShrink: Adaptive Visual Compression for Efficient Multimodal Code Understanding*；[arXiv:2607.29637](https://arxiv.org/abs/2607.29637)；cs.CV / cs.SE。Blank-Free Rendering 用显式结构标记替代缩进与换行占据的大量空白；轻量 RL agent 为每个输入选择压缩配置；Dominant Token Selection 再联合 instruction 与 code image 删除无关视觉 token。

在 code QA、clone detection、completion 上最多减少 71.2% visual token，并匹配或超过未压缩 text-only 输入。它与软件 agent 的关系主要在仓库 / 截图式代码上下文成本，而非变更执行，因此未列强读。更需警惕的是 rendering 可能破坏对齐、tab / whitespace 语义和长文件跨页关系，当前三个任务不足以证明能安全用于 repair agent。

## 可留意 / 可跳过

这一层不是“无关”，而是论文对关注方向有实质接触，但贡献主要服务特定任务、基础设施或早期概念验证。下面给出值得记住的关键词，以及当前不必优先深挖的原因。

### 42. Knowledge distillation 的偏差不对称

*The Asymmetric Effects of Knowledge Distillation on Bias in Small Language Models*；[arXiv:2607.28639](https://arxiv.org/abs/2607.28639)。值得记住“teacher bias 不会按比例复制，蒸馏与 SFT 可能在不同群体上产生不对称放大”。它属于 post-training 行为审计，但聚焦 small LM bias，和当天 reasoning / agent feedback 主线较远，可先留关键词。

### 43. ConnectED 的 SFT + DPO 教学系统

*ConnectED: A Curriculum-Aligned AI System for Vietnamese Instructional Lesson Planning and Student Learning*；[arXiv:2607.28647](https://arxiv.org/abs/2607.28647)。它把 curriculum-aligned data、SFT 与 DPO 用于越南教学规划；适合作为低资源教育 domain adaptation 案例，但 post-training recipe 本身不新，系统效用也高度依赖本地课程与人工评价，因此可跳过方法细读。

### 44. TAPR 用 GRPO 训练 prompt rewriter

*TAPR: Enhancing LLM Performance with a Task-Aware Prompt Rewriter*；[arXiv:2607.28657](https://arxiv.org/abs/2607.28657)。值得记住“把输入改写器而非主模型作为 RL policy”，可降低部署改动；但其贡献主要是 inference preprocessor，是否稳定提升主模型能力、是否对 prompt injection 更脆弱尚不清楚，暂列边缘 post-training。

### 45. 用 agentic AI 构建 process-modeling 工具的经验报告

*Building a Process-Modeling Tool using Agentic AI: An Experience Report on PM4Py-UCM*；[arXiv:2607.28825](https://arxiv.org/abs/2607.28825)。与真实软件开发 agent 有关，值得看工具协作、需求澄清和人工监督失败案例；但它是单项目 experience report，没有可比较 benchmark，不宜与 repository repair 实证论文同级。

### 46. 把 LLM 知识蒸馏进轻量网络防御 RL agent

*Distilling Knowledge from Large Language Models into Lightweight Reinforcement Learning Agents for Autonomous Cyber Operations*；[arXiv:2607.28826](https://arxiv.org/abs/2607.28826)。关键词是“LLM teacher → 小型 RL policy → autonomous cyber operation”；目标 student 并非语言模型，安全环境也专门化。它属于广义蒸馏，但不直接回答 LLM post-training 如何改变语言模型，故可留意不深挖。

### 47. DeltaServe：推理与 fine-tuning 的 host-agnostic co-serving

*DeltaServe: Host-Agnostic Co-Serving of Inference and Fine-Tuning for LLMs*；[arXiv:2607.28848](https://arxiv.org/abs/2607.28848)。它处理在线 post-training 的系统调度与资源隔离，关键词是 inference / fine-tuning co-location；与训练目标和行为证据关系较弱。除非关注训练基础设施吞吐，否则今天可跳过算法细节。

### 48. Snapchat 生成式检索 fine-tuning

*LLM-Based Generative Retrieval for Snapchat Content Recommendation*；[arXiv:2607.28895](https://arxiv.org/abs/2607.28895)。这是大规模工业 domain SFT 的应用证据，能观察生成式 ID 检索如何进入推荐生产；但贡献以检索系统和业务指标为主，post-training 方法不是核心创新，适合 IR 读者而非本 digest 主线。

### 49. SafeNexus 的多模态安全神经元 steering

*SafeNexus: Discovering and Steering Modality-Universal Safety Neurons in MLLMs*；[arXiv:2607.28969](https://arxiv.org/abs/2607.28969)。值得记住“跨文本 / 图像共享的 safety neuron 与参数高效 steering”；不过 neuron 解释的因果稳定性、越狱适应性与正常能力税需要额外审计。它是安全对齐边缘强候选，但当天已有更扎实的 benchmark validity audit。

### 50. Think2Go：推荐系统的 reasoning curriculum

*Think2Go: Generative Next POI Recommendation with LLM Reasoning*；[arXiv:2607.28997](https://arxiv.org/abs/2607.28997)。SFT、curriculum 与推理监督用于 next-POI 推荐，说明 post-training 可以改变序列推荐行为；但任务和评价封闭，方法更像领域 recipe。除非研究 recommendation reasoning，否则可跳过。

### 51. 多参考图像编辑的 Evaluation-Verification Reward

*Evaluation-Verification Reward for Consistent Multi-Reference Image Editing*；[arXiv:2607.29025](https://arxiv.org/abs/2607.29025)。关键词是“先评估编辑结果，再验证跨参考一致性”的复合 reward；属于 multimodal post-training。场景很专门，且 reward model 与人类视觉偏好的一致性决定成败，暂不放入主线深读。

### 52. 合成关系数据的 curriculum

*Curriculum Matters: Data-Efficient Relational PFN Pretraining with Synthetic Data*；[arXiv:2607.29120](https://arxiv.org/abs/2607.29120)。它证明 synthetic relational data 的难度顺序影响数据效率，但训练对象与阶段更接近 task pretraining，不是典型 LLM post-training；保留“课程顺序影响合成数据价值”，其余可跳过。

### 53. CLIFT：机器人 on-device 模型的闭环迭代微调

*CLIFT: Turning Gemini Robotics On-Device into Humanoid Specialists via Non-Invasive Closed-Loop Iterative Fine-Tuning*；[arXiv:2607.29172](https://arxiv.org/abs/2607.29172)。关键词是 closed-loop rollout、失败收集、non-invasive fine-tuning 与 humanoid specialization。它属于 VLA post-training 应用，但模型闭源、平台专用；与 WCM 的 critic 方法相比，更像系统适配报告。

### 54. GALA：电商推荐中的 GRPO 对齐

*GALA: Generative Aligned Learning for Adaptive Multimodal Representation in the Taobao Shangou Recommender System*；[arXiv:2607.29213](https://arxiv.org/abs/2607.29213)。值得留意工业多模态推荐如何用 GRPO 连接生成目标与线上业务约束；但任务 reward 专有、外部复现困难，不应只因有 GRPO 就提高推荐等级。

### 55. RTLCurator：label-efficient RTL 数据筛选

*RTLCurator: Label-Efficient Data Curation for RTL Generation*；[arXiv:2607.29283](https://arxiv.org/abs/2607.29283)。它同时触及 coding 与 post-training：用少量标签筛选更有价值的 RTL training data。值得记住“硬件代码生成的瓶颈可能是数据选择而非模型”；但不涉及真实仓库级修改，且硬件验证设置专门，因此列边缘。

### 56. 连续 token 语音生成的 post-training 稳定性

*Stable Autoregressive Speech Generation with Low-Frame-Rate High-Dimensional Continuous Tokens*；[arXiv:2607.29363](https://arxiv.org/abs/2607.29363)。论文明确讨论 post-training 如何稳定高维连续 token 的自回归生成，属于多模态主线的有效补充；但其训练目标和误差模式与文本 / agent RL 差异大，今天先记住“低帧率连续 token + 稳定化训练”。

### 57. 流体系统 simulation code generation

*Simulation Code Generation for Fluid Systems using Large Language Models: Benchmarking Models and Prompting Strategies*；[arXiv:2607.29389](https://arxiv.org/abs/2607.29389)。它测科学模拟代码与 prompt strategy，对 code generation 可靠性有参考；但不是 repository repair，也没有显著软件演化或训练贡献。可作为领域 benchmark 留档，不必优先读。

### 58. MolGVR 的 chemistry-grounded verifier

*MolGVR: A Chemistry-Grounded Framework for Text-to-Molecule Generation*；[arXiv:2607.29479](https://arxiv.org/abs/2607.29479)。关键词是 chemistry constraint、verifier 与生成 reward；对“可验证奖励”有跨领域意义。由于核心对象是 molecule 而非 LLM 行为本身，且化学有效性需要专业复核，今天可留意其 verifier 设计、跳过整体应用。

### 59. 视觉生成中文本条件的 scaling 与 SFT / distillation

*Scaling Properties of Text Conditioning in Visual Generation*；[arXiv:2607.29679](https://arxiv.org/abs/2607.29679)。它系统观察 text conditioning、监督微调、verifier / distillation 随规模变化的性质，属于 multimodal post-training 边界；但与当天 agent / reasoning 证据链联系较弱。若关注视觉模型 scaling 值得另行读，这里不展开。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 关键验证证据 | 可复现性 / 实用性 | 评估可信度 |
|---|---|---|---|---|---|
| SVR | 自适应推理何时停止 | verdict+confidence 联合 GRPO | 7 benchmark，0.563，2.99 turns | 中：训练需可验证答案 | 高：多 baseline、3 seeds |
| MobileForge | 多屏工程不是单页复刻 | 五轴项目级 benchmark、状态隔离导航 | 174 runs；build 100%，nav 58–92% | 中高：规范清楚，闭源模型多 | 中高：确定性+judge+人工 |
| Rolling With Resistance | 单轴偏好会否制造另一失败 | GP/RA 双轴、on-policy DPO firewall | 3 base×3 seeds；一致 GP 下降 | 中：数据和 rubric 可描述 | 高：负结果、人类复核 |
| ECLoop | 修改前证据不足 | action-specific evidence gate | SWE-bench 500，+4.8–11.8pp | 高：不改模型 / scaffold | 高：跨两 scaffold、消融 |
| MUTE | 删除影响在在线训练中回流 | ledger、残留清除、隔离、持续审计 | 2 VLA、3 粒度、Jetson testbed | 中：需完整 ledger | 中高：系统验证，绝对数较分散 |
| C→Rust | 一次翻译无法保持成熟系统语义 | baseline→小步替换→双 gate | iodine 12.5K SLOC 完整迁移 | 中高：真实编译与行为测试 | 中：单案例、有人监督 |
| BSG-VA | passing test 是否真测 bug | B/S/G 三状态反事实重放 | 3,730 events；46.0% 无区分力 | 高：可后处理任意可重放日志 | 很高：预注册、p 值、克制结论 |
| CanItDelete | 模型系统性回避删除 | 删除 recall、retrofitted test、纯删除集 | 5 模型；63.2→41.9% | 高：benchmark 定义直观 | 高：多层诊断，gold 非唯一 |
| ACDC | agent 生成 verified compiler 的未验证边界 | 分代码类型的生成测试+repair | 8,200→5 root defect→4,600 clean | 中：Lean/AArch64 专门 | 中高：seed、proof、成本可审计 |
| SciDisco | agentic RL 的中间进展不可见 | hidden evidence DAG + DiscoPO | DataSci 32.4→56.3%；DAB 弱项公开 | 中：环境编译成本高 | 高：跨 benchmark、泄漏扫描 |
| Execution-First Trace | 合成 tool trace 内部不一致 | 先执行验证，再 Masked SFT | 9B completion 52.8→86.0% | 中高：需可控工具沙箱 | 高：执行、trace、答案分开报 |
| LatentRM | scalar RM 浅、generative RM 难数值化 | reasoning 作为离散潜变量端到端优化 | ID/OOD 领先；RLHF LC win 56.9% | 中：rollout 成本较高 | 中高：静态+在线三层验证 |
| SAF-OPD | RLVR/OPD 融合导致熵崩塌 | advantage 限幅与时序退火 | 6 settings，+0.51–2.70% | 高：轻量、可插拔 | 高：完整消融，领域仍窄 |
| MAGA | GUI 蒸馏平均 token 信号错位 | action correctness 路由蒸馏 | 3 平台×2 规模；8B +2.0pp | 中：依赖 action oracle | 中高：跨平台与 ablation |
| AgenticRepair | 漏洞修复缺多面上下文 | 结构/运行/history 三 agent 汇合 | SEC-Bench 220/300，领先 29pp | 中：执行环境和成本重 | 高：PoC、sanitizer、失败分类 |
| Adaptive FastOPD | 长 rollout 拖慢 OPD | 相对进展+利用率双 gate 扩 horizon | 时间 −49.1–71.2% | 高：系统侧可落地 | 中高：仅 2 teacher-student pair |
| ARCTIC | AI diff 超出人工 review 容量 | intent、drift、spotlight | F1 .86；QWK .907；5×少 token | 高：直接服务人审 | 中高：单组织、生产归因有限 |
| WCM | 单帧 critic 不理解时序状态 | future latent prediction + value | 149 simulation + 7 real tasks | 中：机器人训练成本高 | 高：多 backbone、IND/OOD |
| STAIR | 历史 repair 轨迹无法直接复用 | 多层轨迹树与跨层计划 | 81.2%；跨 scaffold +5.2pp | 中高：prompt 注入即可 | 高：500 题、迁移、人工误差分析 |

## 我的判断

**整体创新性：A。** 今天不是由一篇压倒性的“新范式”领跑，而是多个关键接口被重新定义：validation event 变成反事实证据，action token 获得不同于解释 token 的信用，critic 被要求表示时间，online unlearning 被扩展到派生 trajectory。概念质量高于单纯换 loss 的日子。

**实用价值：A。** ECLoop、ARCTIC、STAIR、MobileForge、DragonCrawl 与 AgenticRepair 都直接落在真实软件流程的修改前门禁、评审、历史复用、移动端行为和漏洞修复上；Adaptive FastOPD、LARA 与 Data Turnstile 也给出明确成本 / 部署收益。不过不少系统依赖闭源模型、复杂 harness 或百万 token 轨迹，短期可复现性并不均匀。

**严谨性：A−。** 最可信的是 BSG-VA 的预注册对照与克制解释、MobileForge 的多轴拆分、CanItDelete 的追加测试、STAIR 的跨 scaffold transfer、SciDisco 主动公开 DABStep 失败。扣分来自大量 2607 新稿仍只有单一模型对、单一组织或单一系统案例；WCM、MUTE 等多模态 / 机器人工作还需外部复现。

**推荐价值：A。** 若只读五篇，我会选 BSG-VA、CanItDelete、ECLoop、SAF-OPD 与 LatentRM：它们分别改变“什么叫测试证据”“什么叫正确编辑”“何时允许修改”“如何融合 dense teacher signal”“reasoning 如何真正服务 reward”。若关注真实系统，再追加 MobileForge、AgenticRepair、ARCTIC 与 STAIR。

最大的未确定性有三类：第一，7 月末集中提交的新稿尚未经历同行复核；第二，若训练 / benchmark 数据进入模型预训练，SWE-bench 与公开任务成绩仍可能被高估；第三，很多过程信号依赖模型 judge 或环境 oracle，而今天的 benchmark validity audit 恰好证明这些测量工具不能互换。因而最稳妥的阅读方式不是追最高分，而是检查每篇论文究竟保存了哪些状态、执行了哪些反事实、用什么独立证据阻止“看起来通过”。
