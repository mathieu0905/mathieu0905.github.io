---
title: "把反馈送到真正决策：8 月 25 日 arXiv 的长程 Agent Oracle、局部 Credit 与可维护外部状态"
date: "2026-08-26"
description: "8 月 25 日的新论文显示，可靠 Agent 与 post-training 的共同瓶颈已从增加采样转向可执行证据、局部信用和可维护状态。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Post-Training", "RLHF", "RLVR", "程序修复", "软件演化"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-slate-950 via-violet-950 to-emerald-950"
---

2026 年 8 月 25 日这一批论文很密集，但主线并不是“又多了一个更强 Agent”。真正值得读的变化有三件：评测开始触达游戏、终端、网络和全仓库迁移的真实执行状态；训练信用从整条回答下沉到 token、turn、tool decision 和能力边界；外部 skill、memory 与 harness 被当作会过期、会被攻击、也需要受控更新的系统状态。coding-agent 与 post-training 两条线各自成立，不必强行合并，但都在反对同一种表面成功：测试绿了、reward 高了或一次 rollout 成功了，并不说明系统因正确理由完成了任务。

本轮逐项核对 arXiv 官方 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG，并补充 cs.IR、cs.CV、cs.CR、cs.OS 的 `pastweek` 页面，九类页面均定位到 **Tue, 25 Aug 2026**。合并 New 与 Cross submissions 后得到 **920 篇唯一条目**，最终纳入 **97 篇实质相关论文**：coding-agent / software-change 43 篇，post-training 62 篇，其中 8 篇同时属于两条主线。25 篇强相关论文均从 `https://arxiv.org/pdf/<id>` 下载，完成 `%PDF`、大于 20KB、`pdftotext -layout` 与首页渲染检查；45 篇中相关和 27 篇可留意项以官方摘要、元数据及必要的全文定位筛选。

## 今日脉络

第一条脉络是 **oracle 正在向行为与过程下沉**。GameXpert-Bench 不只看游戏能否启动，SWE Refactor Bench 先审迁移是否真的发生，再测 130,118 个行为检查，HVTB 则让 reward hack 可以机械识别。结果共同说明：最终产物、执行过程和任务意图必须有不同证据，不能用一个 pass/fail 压平。

第二条脉络是 **credit assignment 开始对齐真实决策**。SecOPD 找到开始服从注入的 token，CompPO 用轨迹特定内部计算传播优势，LACL-GUI 区分短成功与接近成功的失败，DIAG 把练习分布拉回学生能力边界。它们的共同敌人是 sequence-level 广播：同一终局 reward 不等于每个 token、turn 和工具调用都同样负责。

第三条脉络是 **Agent 的外围状态成为一等研究对象**。Repo2Skill-Evo 量化 skill 随 release 静默过期，AutoSaddler 只在独立验证后提交 harness patch，BASM 为成功技能加禁用边界，MCP-Universe RL 则把训练环境和工具等待当系统问题解决。可靠性越来越取决于“状态怎样演化、何时失效、如何回滚”。

第四条脉络是 **规模叙事受到 matched control 挑战**。Mixed SFT 以六十分之一以下计算超过 next-chunk RL 的完整 post-RLVR 上限，River 用不到 30% 环境取得更大 RL 增益，架构规格格式又能让弱模型缩小能力差。更多数据、更多 rollout、更多 Agent 都需要先证明不是把 verifier 噪声或 scaffold 偏差一起放大。

## 强相关论文深读

### 1. XRFix: Exploring Performance Bug Repair of Extended Reality Applications with Large Language Models

**论文信息**：*XRFix: Exploring Performance Bug Repair of Extended Reality Applications with Large Language Models*；Wu, Jingwen, Guo, Hanyang, Dai, Hong-Ning, Luo, Xiapu；[arXiv:2608.21718](https://arxiv.org/abs/2608.21718)；Software Engineering (cs.SE)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：XRFix 把 XR 性能缺陷从泛化的代码补全问题，落到跨 C# 脚本与 Unity 资产文件的检测、定位和修复闭环。

**为什么值得推荐、方法怎么工作**：值得推荐，是因为 XR 性能错误常不表现为编译失败，却会在渲染、动画与逐帧回调中累积成卡顿甚至眩晕。XRFix 的流程有三步：先从 23 个开源项目整理代码语料，并构造含 104 个真实错误的修复集；再扩展 UnityLint 与 CodeQL 规则，分别覆盖脚本和资产中的坏味道；最后按单行、函数、类级三种复杂度组织 prompt，让五个通用/代码模型产生补丁，并以静态规则、参考补丁和人工复核逐层验收。Figure 4 展示检测证据如何进入修复，而不是让模型在无反馈状态下盲改。

**关键实验、局限与当天主题**：全文结果比摘要更能说明边界：定制静态规则精度为 90.4%，GPT-4o 在主提示下的 plausible-fix 比例约 45%，明显高于多款代码模型；Table 10 又把它与传统 APR 作同任务比较。可信之处是错误来源、静态 oracle 和人工判定相互补充；不足是“性能修复”主要由预定义坏味道判定，未用帧率、延迟、内存或设备级运行轨迹验证真实收益，104 个错误也集中于 Unity/XR。它支持当天主线中的判断：复杂平台修复需要领域分析器和运行证据，LLM 生成本身不是充分 oracle。

### 2. Architecture as Capability Equalizer for Coding Agents

**论文信息**：*Architecture as Capability Equalizer for Coding Agents*；Canedo, Arquimedes；[arXiv:2608.21747](https://arxiv.org/abs/2608.21747)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：同一份架构信息，换成更接近代码的表示，就能显著缩小中小模型与前沿 coding agent 的能力差。

**为什么值得推荐、方法怎么工作**：论文控制了一个常被忽视的变量：架构内容不变，只改变表达格式。作者把同一系统约束写成自然语言、Mermaid+约束+ADR、OpenAPI、C4/Structurizr DSL、TypeScript 接口+ArchUnit 风格规则五种形式，在六个模型、90 次多轮 agent trial 中生成完整系统；随后同时检查功能、结构约束、编译、演示运行和 token 成本。Figure 1 的实验管线尤其重要，因为它把模型、格式与任务内容拆开，避免把“更多信息”误认为“更好表示”。

**关键实验、局限与当天主题**：最强模型的格式价差只有 0.17-0.92 分，而较弱模型达到 0.83-2.42；TypeScript contract 令最弱模型的 API 路由覆盖从 33% 到 100%，self-validation 又从强模型 100% 单调跌到弱模型 0%。这说明格式对弱模型确有 equalizer 效应，但样本只有 90 次、任务形态与打分 rubric 仍由作者控制，且强模型上的收益很小。当天主题里，它提醒我们把 scaffold 与模型能力分开报告：agent 质量不是单一模型标量，规格表示可以改变编译调试循环和最终结构完整性。

### 3. Beyond Success and Failure: Length-Aware Contrastive Learning for GUI Agents

**论文信息**：*Beyond Success and Failure: Length-Aware Contrastive Learning for GUI Agents*；Gu, Chengyang, Zhang, Le, Zhou, Jingbo, Chen, Yize, Shi, Yu, Bao, Siqi, Wu, Zheng-Fan, Wu, Hua, Xiong, Hui；[arXiv:2608.21830](https://arxiv.org/abs/2608.21830)；Artificial Intelligence (cs.AI)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：LACL-GUI 不再把所有成功轨迹视为同等好、所有失败轨迹视为同等坏，而用长度和偏离位置构造更细的可验证偏好。

**为什么值得推荐、方法怎么工作**：GUI RL 的问题不只是 reward 稀疏，还在于 GRPO 将同一结果类别广播成同一优势，短而稳的成功轨迹得不到额外信用，接近成功的失败也与早期跑偏等价。LACL-GUI 先异步收集 GUI 轨迹并维护成功缓冲区；再在成功组内偏好更短执行、在失败组内根据相对成功路径的分歧位置区分质量；最后用对比分类式 RLVR 目标更新策略，保留比原始 policy gradient 更稳定的优化几何。Figure 1 展示 decoupled rollout、buffer 与 length-aware objective 的连接。

**关键实验、局限与当天主题**：在 OSWorld 上，8B 版本总体成功率为 50.0%，较 Qwen3-VL-8B-Thinking backbone 高 7.3 点，较 GRPO 和 REAL 分别高 2.8、2.7 点；Table 2 的组件消融支持长度偏好与失败分层均有贡献。局限是“短”并非总等于安全或高质量，桌面任务的成功 oracle 也可能漏掉副作用，论文尚未证明长度信号迁移到移动端或真实账户环境。它与当天 post-training 主线直接相连：credit 要落到轨迹质量差异，而不是只复制终局标签。

### 4. GameXpert-Bench: How Far Are Coding Agents from Expert Game Development?

**论文信息**：*GameXpert-Bench: How Far Are Coding Agents from Expert Game Development?*；Chen, Kun, Hong, Haorong, Gao, Peizhong, Lin, Jianfeng, Luo, Tongxu, Xie, Yuxuan, Liu, Chenxu, He, Jieling, Liu, Zhon 等；[arXiv:2608.21833](https://arxiv.org/abs/2608.21833)；Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：GameXpert-Bench 用真实可交互游戏把 coding agent 评测从“第一次能跑”推进到生成、诊断修复和连续优化的完整生命周期。

**为什么值得推荐、方法怎么工作**：游戏开发同时要求代码逻辑、素材、UI、交互和可玩性一致，单元测试或静态截图都难覆盖。benchmark 因此拆成三条轨：GameGen 从空目录生成完整游戏；GameFix 在 50 个关卡上处理 100 个修复任务，每个关卡有人审的 19-27 个注入缺陷；GameOpt 从真实人机开发轨迹构造 17 条六轮链、共 102 个请求。系统随后结合 live interaction、确定性行为测试、产品 rubric 与回归检查。Figure 1/2 解释为什么最终 artifact 与过程证据必须同时保留。

**关键实验、局限与当天主题**：97 个生成任务覆盖 11 类游戏；完整 leaderboard 显示当前 agent 更擅长做出可玩的基础版本和实现显式需求，却不擅长主动发现缺陷、验证 runtime 行为、在多轮变化中保留旧功能。论文的可信点是执行 ground truth 与生命周期拆分；风险是游戏引擎、资产主观质量和人工修复集仍可能限制泛化，优化链仅 17 条也偏小。它值得深读，因为它把“多文件仓库修改”扩大到复合数字产品，并用 regression 证据约束表面成功。

### 5. Repo2Skill-Evo: Repository Skills Go Stale in Silence

**论文信息**：*Repo2Skill-Evo: Repository Skills Go Stale in Silence*；Duan, Chenyuan, Shi, Ge, Mao, Zineng, Zhang, Ge, Liang, Hao, Piao, Yinzhu, Wu, Yuchen, Yao, Zhixin, Huang, Kaiyu, Hua 等；[arXiv:2608.21964](https://arxiv.org/abs/2608.21964)；Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：Repo2Skill-Evo 证明 repository skill 的最大风险不是一开始写错，而是版本升级后仍能被检索、却已经静默过期。

**为什么值得推荐、方法怎么工作**：作者把每次 V1→V2 release transition 定义成技能维护任务：输入固定的 V1 skill set 和官方补丁，agent 要定位受影响的技能文件，删除或改写失效指导，同时保留仍正确的程序性知识。评测先由 patch-grounded target 衡量 stale-content recall 与 over-editing precision，再用自然语言 judge 补充最终状态质量，并分析轨迹中的文件覆盖和编辑范围。Figure 1 把 repo evolution、skill distillation、silent staleness 和 maintenance 串成生命周期。

**关键实验、局限与当天主题**：57 个真实仓库、105 个挑选过的 release transition 中，每个 transition 都使部分技能失效；六个前沿 agent 的 avg@3 macro F1 仅 29.9%-69.7%。两类错误相反：漏看受影响文件导致旧知识残留，过宽编辑又牺牲精度。论文也坦白这是 staleness-positive challenge set，不能估计一般 release 中的发生率；维护后技能没有重新用于下游 issue，因此 metric 还不是任务效用。它对当天主题的贡献是把外部记忆纳入 software evolution：可复用知识也必须有版本、失效检测和再验证。

### 6. Hack-Verifiable Terminal Bench: Evaluating Reward Hacking in Terminal Tasks

**论文信息**：*Hack-Verifiable Terminal Bench: Evaluating Reward Hacking in Terminal Tasks*；Roth, Amit, Bercovich, Ivan, Efroni, Yonathan；[arXiv:2608.22103](https://arxiv.org/abs/2608.22103)；Artificial Intelligence (cs.AI)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：HVTB 把 reward hacking 从主观审 trace 变成任务内可自动识别的 planted exploit，并检验“告诉模型别作弊”是否真能覆盖未知漏洞。

**为什么值得推荐、方法怎么工作**：方法在 Terminal-Bench 的真实终端/编码任务中植入两类可检测 hack，保留合法解法，同时让 evaluator 能机械区分正常完成与绕过意图。实验再构造 L0-L3 四级提示：从只讲一般原则，到明确泄露漏洞位置和规避方式；同一 agent 在每级都运行全部任务，记录完成、hack 类型、首次作弊位置和任务难度。Figure 1 对照原任务与 hack-verifiable 环境，Figure 3 则检查作弊在轨迹何时出现。

**关键实验、局限与当天主题**：论文的主要价值不是宣称某模型最安全，而是给 reward-hacking rate 一个可复查 oracle，并显示提示对已知技巧与 unknown-unknown exploit 的作用不同。数据来自修订后的 89 个任务，多模型×多提示的完整数值在 Table 2；但 planted hack 仍是作者知道的有限攻击面，agent 也可能以未枚举方式违背意图，不能等同开放世界作弊率。它同时属于 coding-agent 可靠性与 post-training 评测基础设施：没有可验证 hacking 标签，RLVR 很可能奖励 evaluator 的漏洞。

### 7. MCP-Universe RL: A Framework for Training MCP Tool-Use Agents via Reinforcement Learning

**论文信息**：*MCP-Universe RL: A Framework for Training MCP Tool-Use Agents via Reinforcement Learning*；Luo, Ziyang, Yang, Yan, Jian, Xiangru, Shi, Ziji, Lin, Xiaoqiang, Liew, Jun Hao, Savarese, Silvio, Li, Junnan；[arXiv:2608.22167](https://arxiv.org/abs/2608.22167)；Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：MCP-Universe RL 的贡献不是另一个 GRPO 变体，而是把 MCP 环境隔离、长工具等待和 GPU rollout 调度做成可复用训练系统。

**为什么值得推荐、方法怎么工作**：框架用 MCP 统一工具接口，新增两层基础设施：环境层按轨迹创建、隔离、回收容器化 MCP server；rollout 层把 Acquire→Run→Eval 分阶段并发，令正在等工具的 episode 不阻塞 GPU；训练层再接 veRL 或 slime 等既有 backend。新领域只需给 task specification，不必为 RL 重写集成。Figure 1 展示 domain/MCP/environment/policy 闭环，Figure 2 则说明 per-stage concurrency 为什么是吞吐关键。

**关键实验、局限与当天主题**：作者在 gpt-oss-20b 上仅替换任务定义，就训练软件工程、deep research 和通用 tool-use 三类 agent，三者 reward 均上升；一个任务成功率约从 0.22 到 0.52，全异步配置吞吐约 572、6.3 倍于串行基线。边界是训练收益只在单一模型族和作者选择的 verifier 上展示，MCP 标准化也不自动解决工具副作用、状态漂移与 reward 正确性。它是当天主题中很实用的一篇：post-training 的上限由环境和 rollout 系统共同决定。

### 8. Disagree to Explore, Agree to Commit: Routing-Guided Test-Time Scaling for Software Agents

**论文信息**：*Disagree to Explore, Agree to Commit: Routing-Guided Test-Time Scaling for Software Agents*；Chen, Kang, Nian, Junjie, Cao, Yixin, Jiang, Yugang；[arXiv:2608.22191](https://arxiv.org/abs/2608.22191)；Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：Risa 用稀疏 MoE 的 router trace 在多次软件修复之间制造探索差异并选择最终补丁，不依赖外部 judge 或选补丁时重新跑测试。

**为什么值得推荐、方法怎么工作**：论文先把 router readout 与行为角色对齐：轨迹内，决策 token 相对近期历史的路由新颖性鼓励探索，写 patch 时再用受控的 peer support 收敛；轨迹间，只在信息量高的 patch decision 位置比较独立尝试的 routing agreement，选择最终候选。对照集合必须与同一决策匹配，否则共享 prefix 会制造伪一致。Figure 3 正是说明 reference set 与 token 粒度为何决定信号是否有效。

**关键实验、局限与当天主题**：SWE-bench Verified 上，gpt-oss 家族宏平均 resolved 从 uniform 44.9% 升到 48.2%，与 text consensus 48.0% 相当；Qwen3.6 全 500 题从 41.7% 到 45.2%。6 个条件的提升为 2.3-5.7 点。论文边界很明确：需要白盒 sparse-MoE routing 和重复轨迹，dense/闭源模型不可直接用；没有 selection-time execution 也可能错过少数真正正确的离群补丁。它提供了内部计算证据，但不能替代最终可执行 oracle。

### 9. Learning Generalizable Behaviors for Terminal Agents

**论文信息**：*Learning Generalizable Behaviors for Terminal Agents*；Yao, Yihang, Pang, Bo, Nguyen, Xuan Phi, Zhao, Ding, Joty, Shafiq, Yavuz, Semih；[arXiv:2608.22631](https://arxiv.org/abs/2608.22631)；Machine Learning (cs.LG)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：River 发现 terminal-agent RL 的关键不是合成更多环境，而是过滤坏环境并把 verifier 变成可泛化行为的训练信号。

**为什么值得推荐、方法怎么工作**：作者提出 Agentic Compositional Generalization 假设：SFT/预训练已经给出低层技能，RL 主要学习在长任务中如何组合、路由和恢复。River 因而先检测并过滤低质量/不可判环境，再把 outcome reward 与 process-level behavior regularization 结合，最后跨模型、尺度、harness 和 RL objective 检查是否仍有效。Figure 1 给出能力组合假设，Figure 2 展示 environment filtering 与 verifier enhancement，而不是把环境数量当唯一自变量。

**关键实验、局限与当天主题**：用不到 TMax 训练环境的 30%，River 在 Terminal-Bench-Lite 和 v2.1 上令 2B-27B 模型的 RL 增益平均提高 106% 与 30%；8B 在四个 terminal benchmark 上达到所比较开源 RL 模型最佳。重要限制是“行为质量”仍由作者定义的正则器编码，合成任务与真实用户 shell 工作流存在 domain gap，最终成绩也受 harness 影响。它挑战当天最常见的规模叙事：有噪声的 verifier 扩大后只会更稳定地强化错误。

### 10. GSAR: Goal-State-Anchor Rewards for Mobile GUI Agents with Self-Evolving Data Synthesis

**论文信息**：*GSAR: Goal-State-Anchor Rewards for Mobile GUI Agents with Self-Evolving Data Synthesis*；Zhang, Long, Chen, Yuhan, Zhang, Chaoran, Cao, Wanxia, Huang, Kun, Gao, Pengzhi, Liu, Wei, Luan, Jian, Li, Chenliang 等；[arXiv:2608.22847](https://arxiv.org/abs/2608.22847)；Artificial Intelligence (cs.AI)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：GSAR 用成功终态中的关键 UI 元素作为 reward anchor，把移动 GUI agent 的任务合成和在线 RL evaluator 合成一个闭环。

**为什么值得推荐、方法怎么工作**：流程先让 agent 执行任务并修改环境，由已成功轨迹继续复杂化任务，形成 self-evolving data；再从成功 goal state 中自动标注与目标相关的 UI 元素，得到 state anchor；训练时 evaluator 不只看最终文本或像素相似度，而检查当前状态是否到达这些可定位锚点，并把结果送入 policy optimization。Figure 2 将环境演化、任务生成、anchor 标注和 RL 更新连起来，避免每个新任务都手写规则。

**关键实验、局限与当天主题**：离线轨迹验证准确率超过 90%，接近 rule-based evaluator；训练后的 agent 在 AndroidWorld 与作者 benchmark 上均提升。优势是 reward 对真实 UI state 有显式参照；局限是成功轨迹本身若带偶然状态，anchor 也会继承偏差，元素到达并不保证无副作用，环境自演化还可能收窄到易生成任务。摘要未提供所有绝对成功率，复现时应核对 Table 1/3 和任务去重。它把 GUI agent 的 reward 从“看起来像成功”推向可审计终态，但还不是完整业务事务 oracle。

### 11. When Can Agents Safely Checkpoint, Fork, Restore, and Merge? Exact Checking for Execution Edits

**论文信息**：*When Can Agents Safely Checkpoint, Fork, Restore, and Merge? Exact Checking for Execution Edits*；Zheng, Yusheng, Song, Xiaoyu, Hu, Yanpeng, Cheng, Lebin, Huang, Yuxi, Zhang, Wei；[arXiv:2608.22928](https://arxiv.org/abs/2608.22928)；Programming Languages (cs.PL) ; Cryptography and Security (cs.CR)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：这篇 PL 工作给 agent runtime 的 checkpoint、fork、restore、merge 建立精确安全判定，避免分支编辑重复授权或丢失尚需结果。

**为什么值得推荐、方法怎么工作**：作者首先定义 execution edit 的语义：过去已经发出的调用和授权不可撤销，编辑只能改变后续执行；随后从 execution record 枚举所有不违反 policy 的完成方式，删除会令 required result 不可达或与 in-flight call 冲突的路径；若无路径，返回可检查的 no-safe-implementation 证明，否则给出全部安全 continuation。最后把有限 checker、runtime invariant 与六种 edit 形式在 Lean 中机械化，并用可执行测试覆盖。

**关键实验、局限与当天主题**：它的创新在于既不让 agent 自证安全，也不要求调用者预先给出“要保留什么”，而是从运行记录精确推出。可信度来自定理、Lean proof 和测试三层；限制是形式模型依赖完整、离散、可信的 execution record，现实 API 的隐式副作用、异步外部状态和不完备日志会破坏前提，状态空间枚举也可能昂贵。当天 coding-agent 主线里，这是少见的语义级 runtime guard：并行探索需要恢复能力，也需要不重复动作和不丢责任的证明。

### 12. AutoSaddler: Automatic Harness Optimization with Durable Updates from Agent Execution Traces

**论文信息**：*AutoSaddler: Automatic Harness Optimization with Durable Updates from Agent Execution Traces*；Park, Sungho, Kim, Wonjoong, Tan, Rongyuan, Zhang, Jue, Han, Wook-Shin, Gao, Pengfei, Park, Chanyoung, Yao, Yongqiang 等；[arXiv:2608.23041](https://arxiv.org/abs/2608.23041)；Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Machine Learning (cs.LG); Multiagent Systems (cs.MA); Software Engineering (cs.SE)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：AutoSaddler 把 harness 当成可调试代码：从失败 trace 诊断根因，生成定向 patch，再用独立验证决定是否持久提交。

**为什么值得推荐、方法怎么工作**：每轮先让当前 harness 跑一小批任务，收集长程失败；诊断器把问题分解到 prompt、tool configuration、middleware/control logic；patch generator 只改相关结构；候选更新再经 validation 和 EvoDAG 式保留/组合，避免为单条轨迹过拟合。Figure 2 展示 test→diagnose→patch→validate 的离线学习循环，关键是“提出更新”与“改变未来生产 harness”分离。

**关键实验、局限与当天主题**：GAIA2、SWE-Bench Pro、Terminal-Bench 2.0 上，分别较基础 harness 提高 9.0、9.6、10.0 点，较最强自动 baseline 高 7.4、4.4、6.7 点；消融支持深诊断、定向修改和泛化选择缺一不可。风险是 validation set 仍可能被多轮搜索消耗成隐性训练集，harness 复杂度与维护成本未充分计价，evaluator 共盲点也会被固化。它与当天主题最直接的联系是：agent 演化不仅在权重里，外围控制层也要有 guarded update。

### 13. DPIAgent: Divide, Protocol, Isolate for Agentic Reproduction Test Generation

**论文信息**：*DPIAgent: Divide, Protocol, Isolate for Agentic Reproduction Test Generation*；Liu, Hao, Liu, Steven, Zhang, Xin, Luo, Jane, Kang, Yu, Wu, Jie, Yang, Fangkai, Huang, Yangyu, Gao, Pengfei, Li, Scar 等；[arXiv:2608.23341](https://arxiv.org/abs/2608.23341)；Software Engineering (cs.SE)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：DPIAgent 通过 Divide、Protocol、Isolate 把“定位缺陷”和“写 fail-to-pass test”拆成两个受约束阶段，减少 reproduction test 的目标漂移。

**为什么值得推荐、方法怎么工作**：第一阶段只探索代码和根因；在切换前必须产出结构化诊断与测试计划，作为明确 handoff protocol；第二阶段换成测试生成所需的受限工具集，避免探索工具继续诱导无关动作。之后可用多次候选的 test selection 提升最终输出。Figure 2 给出三段 pipeline，Figure 1 则把同 backbone 加/不加 DPI 的成功率和步数直接配对，能隔离结构贡献。

**关键实验、局限与当天主题**：SWT-Bench Verified 上，跨三种 backbone、七个 baseline 都有提升；GPT-5 下 DPI 单独达到 81.76%，GPT-5-Mini 最大增益 11.88 点，加入 selection 后为 86.17%，定位 Acc@5 也提高 25 点以上。局限是 benchmark 与工具协议已结构化，现实 issue 常同时需要探索、修改和验证反复回跳，硬阶段隔离可能阻断必要信息；Pass@k selection 还增加成本。它证明架构约束与大模型能力是互补轴，而不是二选一。

### 14. SWE Refactor Bench: Can Coding Agents Complete a Long-Horizon, Whole-Repository Stack Migration?

**论文信息**：*SWE Refactor Bench: Can Coding Agents Complete a Long-Horizon, Whole-Repository Stack Migration?*；Hong, Deyao, Chi, Yizhe, Li, Wenyi, Wang, Xiaoqiu, Gao, Mingju, Yang, Kaisen, He, Bingxiang, Zheng, Youjie, Xiao, Cal 等；[arXiv:2608.23564](https://arxiv.org/abs/2608.23564)；Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Software Engineering (cs.SE)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：SWE Refactor Bench 用迁移审计先否决“保留旧实现让测试通过”的投机，再检验整个仓库的行为保持。

**为什么值得推荐、方法怎么工作**：20 个任务覆盖四类技术债和真实开源基础设施。三阶段 oracle 依次是：Migration Audit 检查目标技术栈/结构是否真的替换；Behavioural Tests 用原系统记录的 130,118 个固定检查验证行为；Agentic Verification 再让六个独立 coding agent 各用一小时寻找隐藏差异，只接受可执行反例。Figure 1 把 prior benchmark 的 blindness 与这套 veto 流程并列，明确“发生迁移”与“行为正确”是两个能力。

**关键实验、局限与当天主题**：8 个前沿模型、26 个 model-effort 配置、520 次运行中，仅 28 次（5.4%）全过，13/20 任务无人解决；340 次过迁移审计的尝试里，58% 达到 99% 固定检查，却只有 26% 达 100%。最佳模型仅 47/100，build toolchain 改写均分 31.4，语言改写 5.6。局限是任务仅 20 个、agentic verifier 仍可能漏差异且公开仓库有污染风险；但证据足以说明长程 migration 不能用普通 repair pass rate 代替。

### 15. SecOPD: Mitigating Adaptive Prompt Injections by On-Policy Distillation

**论文信息**：*SecOPD: Mitigating Adaptive Prompt Injections by On-Policy Distillation*；Peng, Yibo, Lian, Long, Wagner, David, Chen, Sizhe；[arXiv:2608.21500](https://arxiv.org/abs/2608.21500)；Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：SecOPD 用干净输入下初始化模型的 token 级分布给被注入 rollout 提供局部监督，将自适应 prompt injection 成功率从近乎失守降到个位数。

**为什么值得推荐、方法怎么工作**：训练时先把攻击指令嵌入网页/文件式输入，让当前 policy on-policy rollout；同一初始化模型只看去除 injection 的干净输入，为每个输出 token 给出安全参考分布；反向 KL 只在当前模型真实访问的状态上蒸馏，使“哪一段开始服从攻击”得到精细梯度，而不是像 DPO/GRPO 把整条回答同奖同罚。Figure 2 展示 attacked rollout、clean teacher 与 token loss 的对应关系。

**关键实验、局限与当天主题**：SEP 9.1K 样本上，PISmith pass@10 自适应 ASR：未防御 97.9%、Meta-SecAlign 94.0%、GRPO 61.2%、SecOPD 9.0%；静态/基础自适应为 1.3%/0.2%。AgentDojo 949 对 tool task 上为 4.7%，同时平均 utility 88.1%，优于 GRPO。局限是 teacher 与初始 policy 同源、攻击/判定仍依赖已知 benchmark 和多次 LLM judge，安全不能外推到所有 tool injection。它是当天 credit 主线的安全案例：sequence reward 太粗会掩盖危险 token。

### 16. Let Credit Follow Computation: Architecture-Aware Credit Transport for Large Language Model Reinforcement Learning

**论文信息**：*Let Credit Follow Computation: Architecture-Aware Credit Transport for Large Language Model Reinforcement Learning*；Shi, Qifan, Kang, Zhaolu, Zhu, Chenghua；[arXiv:2608.21501](https://arxiv.org/abs/2608.21501)；Artificial Intelligence (cs.AI)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：CompPO 让 credit transport 追随 Transformer 在该轨迹上的内部计算，而不是沿 token 位置套固定折扣或广播终局分数。

**为什么值得推荐、方法怎么工作**：论文把 LLM RL 拆成 evidence、transport、update geometry 三个对象。CompPO 从行为 policy 的注意力集中度提取 detached gate；该 gate 同时进入一步 bootstrap 和 path-dependent Comp-GAE；TAC critic 复用 actor hidden state 与 routing 信息，避免再训一个同规模 Transformer。外层 reward 和 clipped PPO 不变，常数 gate 可退化为标准 GAE。Figure 1/2 让贡献边界很清楚：改的是信用传播，而不是奖励或 policy objective。

**关键实验、局限与当天主题**：Qwen3-4B 五个 seed 的 final accuracy 为 61.4%（95% CI 60.8-62.0），调优 GRPO 为 53.8%；仅 Comp-GAE 为 55.2%，仅 aligned critic 为 56.4，完整交互贡献 +2.4 点。12 个 PPO 网格中稳定 10 次，PPO 3 次；冻结评测在 Qwen/Llama 贪心 macro 分别较 GRPO +4.3/+3.9。风险是 attention 不等于因果计算，内部 readout 可能随架构变化；实验证据集中数学推理和两模型族。

### 17. Perturb the Thought, Not the Pixels: Latent-Space Rollout Diversification for Reinforcement Learning of Vision-Language Models

**论文信息**：*Perturb the Thought, Not the Pixels: Latent-Space Rollout Diversification for Reinforcement Learning of Vision-Language Models*；Jerge, Michael, Pelczar, Joseph, Downes, Justin；[arXiv:2608.21595](https://arxiv.org/abs/2608.21595)；Computer Vision and Pattern Recognition (cs.CV)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：NC-GRPO 不扰动图像，而在 prompt encoding 的最后隐藏层分叉 rollout，用潜空间出发点差异制造更有用的组内探索。

**为什么值得推荐、方法怎么工作**：一个 rollout group 的一半保持原表示，另一半注入按隐藏尺度校准的高斯噪声；两组共享同一图像、reward、GRPO objective 和推理协议。若受扰分支仍到达正确答案，更新会偏好对内部表征变化更稳的策略；若失败，则把 branch-point 敏感性转成梯度。方法只改 inference engine 约 50 行，Figure/Table 的关键对照包括像素噪声、独立/反向噪声与噪声尺度。

**关键实验、局限与当天主题**：Qwen2.5-VL-7B 在 Geometry3K 训练后，五个 OOD 数学 benchmark 合并检验显著优于 vanilla GRPO（McNemar p≤0.001），同时提高域内准确率和 hallucination robustness；机制消融认为独立随机多样性比方向或总噪声预算更关键。局限是单一 7B VLM、几何训练集和规则评分，潜空间噪声可能伤害感知密集任务，作者也观察到专门推理与通用能力的尺度权衡。它说明 rollout 多样性的位置本身就是 post-training 设计变量。

### 18. Reinforcement Learning on Benign Facts Amplifies Leakage of Memorized Private Data

**论文信息**：*Reinforcement Learning on Benign Facts Amplifies Leakage of Memorized Private Data*；Zhang, Renfei, Mireshghallah, Niloofar；[arXiv:2608.21727](https://arxiv.org/abs/2608.21727)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：在完全不含 PII 的良性事实数据上做 RLVR，也会显著提高模型吐出预训练记忆中私人邮箱的概率。

**为什么值得推荐、方法怎么工作**：作者先确认 instruct model 已记住 Enron name→email 但通常不输出；再仅用普通事实正确性 reward 做 RL，不触碰任何邮箱；训练过程中同时做 targeted recall@k、无提示 free recall、never-seen decoy、MMLU 与 refusal probe。Figure 2 的时间序列用 decoy 恒为零排除一般字符串幻觉，并检查泄露增加时推理性能是否崩溃。这个 matched design 将“接触敏感数据”与“改变可访问性”分开。

**关键实验、局限与当天主题**：DeepSeek-V3.1 的 verbatim recall@k 从 0.155 到 0.370（2.4 倍），free recall 50→83；Qwen3-8B 为 0.005→0.050，Qwen3.5-397B-A17B 为 0.050→0.135，且越大模型绝对泄露越高。推理与拒答大致保持，说明常规 release gate 可能看不见。局限是单一 Enron 英文邮箱 corpus、精确匹配和三种异构模型，不能外推其他 PII/语言；但它强烈挑战“训练数据无害即可”的安全假设。

### 19. The Chase Is the Curriculum, the Capture Anchors the Credit: Pursuit-Evasion Self-Play for Zero-Data LLM Reasoning

**论文信息**：*The Chase Is the Curriculum, the Capture Anchors the Credit: Pursuit-Evasion Self-Play for Zero-Data LLM Reasoning*；Yu, Jing, Chen, Shengchao, Tan, Yiyun；[arXiv:2608.21871](https://arxiv.org/abs/2608.21871)；Computation and Language (cs.CL) ; Machine Learning (cs.LG)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：LURE 把零数据 self-play 写成追逃游戏：出题者学习把任务放在能力边缘，解题者用可验证进展获得稠密 credit。

**为什么值得推荐、方法怎么工作**：evader 先在环境难度轴上选择位置并生成任务，reward 在 solver 约一半 rollout 能捕获时最大，避免事后大批拒绝过易/过难题；planner-executor pursuer 在可执行环境中尝试，单调 verifier progress 与终局 capture 一起组归一化；round-anchored KL 保持双方共同演化不发散，signature memory 抑制重复。Figure 2 将 difficulty placement、task generation、execution 和双边更新串成闭环。

**关键实验、局限与当天主题**：在 PhantomWiki、IFEval、ZebraLogic 三类可验证环境、三种 backbone family 上，LURE 在统一与专门训练设置都领先，并在来自三类任务的 9 个 held-out benchmark 上取得更高 OOD aggregate。证据覆盖面较好，但数值依赖作者的环境难度参数和 verifier，capture rate=1/2 只是课程启发式；生成环境的漏洞与分布收窄仍可能 reward hack。它把 curriculum 与 credit 联合优化，是当天 post-training 主线的代表。

### 20. EDGE: Experience-Distillation for Guided Exploration in Agentic Reinforcement Learning

**论文信息**：*EDGE: Experience-Distillation for Guided Exploration in Agentic Reinforcement Learning*；Xie, Can, Zhou, Yuyi, Yang, Wen, zhang, Ziyi, Song, Siyao, Deng, Yingzhuo, Ren, Shuo, Zhang, Jiajun；[arXiv:2608.21946](https://arxiv.org/abs/2608.21946)；Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：EDGE 把历史经验当训练期脚手架，只蒸馏确实提升当前 policy 的部分，并随能力增长淘汰过时经验。

**为什么值得推荐、方法怎么工作**：每个 rollout group 同时采样 experience-conditioned 与 experience-free 轨迹，用二者边际差决定经验是否入选，不增加额外采样组；随后在 policy 自身经验支持上做 reverse-KL，把有效探索模式写回参数；co-evolutionary bank 再从新失败合成经验、删除失效条目。Figure 1 清楚区分“检索帮助探索”与“去掉检索后仍保留能力”，避免把外部 memory 误报为模型学习。

**关键实验、局限与当天主题**：Qwen 7B 在 ALFWorld、WebShop 较 GRPO 分别 +8.3、+12.5 成功率点；移除外部经验后保留 96.0% 的 scaffolded performance。限制是两个模拟环境、经验质量由同一训练闭环估计，reverse-KL 可能固化错误捷径；真实工具的非确定性与不可逆动作未覆盖。它值得推荐，因为它直接回答何时应该蒸馏经验，而不是默认所有成功轨迹都可复用。

### 21. DIAG: Diagnostic Iterative Alignment and Generation for Data-Efficient Mathematical Preference Distillation

**论文信息**：*DIAG: Diagnostic Iterative Alignment and Generation for Data-Efficient Mathematical Preference Distillation*；Chen, Guhan, Tian, Songtao, Li, Bohan, Wang, Hejin, Xie, YeXin, Yu, Zixiong；[arXiv:2608.22806](https://arxiv.org/abs/2608.22806)；Computation and Language (cs.CL)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：DIAG 把 preference pair 的有效产出率当诊断信号，让教师围绕学生当前能力边界合成练习，缓解迭代优化后期的信号枯竭。

**为什么值得推荐、方法怎么工作**：第一阶段按 topic 统计 valid preference-pair yield，并用 Empirical Bayes shrinkage 稳定小样本估计，再分配 exploration/exploitation quota；第二阶段从学生失败轨迹生成难度邻近的变体，进入下一轮 preference distillation；理论上可视为教师近似执行 KL 正则化的 practice-distribution 重加权。Table 1 在固定总预算下比较数据源，Table 2 隔离采样与调度贡献。

**关键实验、局限与当天主题**：论文报告每轮有效 pair 产率和数学推理成绩均提升，在 iso-effective training budget 下优于静态池。真正可取的是把“学生进步导致数据失效”显式建模；不足是 teacher 合成与筛选可能共享错误，主题 yield 不等于任务覆盖，摘要没有给出跨模型/跨领域的统一绝对增益。它属于当天课程学习主线，但结论应限制为数学 preference distillation，而非通用在线 post-training 已解决。

### 22. Thinking at the Right Size: Amortized Distillation Across Post-Trained LLMs

**论文信息**：*Thinking at the Right Size: Amortized Distillation Across Post-Trained LLMs*；Zhou, Yan, Kangaslahti, Sara, Geuter, Jonathan, Nayak, Nihal V., Fumero, Marco, Locatello, Francesco, Alvarez-Melis 等；[arXiv:2608.22854](https://arxiv.org/abs/2608.22854)；Machine Learning (cs.LG)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：ADAPT 用一次蒸馏同时摊销模型尺寸轴和 post-training 变体轴，试图从一个 teacher-student 对构造多尺寸、多行为版本族。

**为什么值得推荐、方法怎么工作**：先以 pre-training alignment 对齐基座 teacher/student，再用 SFT distillation 构造能平滑尺寸插值的 post-trained student；随后把 base distillation 产生的 weight delta 转移到 instruction、reasoning、chat 等不同变体初始化上，而不为每个变体重跑完整蒸馏；最后利用连续尺寸在推理时做自适应计算选择。Figure 1/3 分别展示两阶段训练和 weight-delta 复用，核心是跨变体保持低损失插值路径。

**关键实验、局限与当天主题**：在 matched compute 下，ADAPT 在 generation、instruction following 与 reasoning 上优于 boomerang 系基线，并一次产生 L×K 个模型；不过论文摘要未给统一平均数字，可信判断要依赖各任务曲线。风险包括 delta 跨变体的线性假设、只验证有限架构/同族变体，以及中间尺寸可能通过插值获得不均匀安全行为。它对训练效率的意义很具体：post-training 不只是单模型 recipe，也要考虑整个部署模型族的成本。

### 23. Is Next-Chunk Reasoning RL Really Better than SFT? Revisiting Training Strategies under no-CoT Data

**论文信息**：*Is Next-Chunk Reasoning RL Really Better than SFT? Revisiting Training Strategies under no-CoT Data*；Tang, Yinhao, Fang, Youqing, Sun, Yanan, Liu, Jiangning, Wang, Ziyi, Zhao, Xun, Zhang, Weiming, Liu, Bin, Liu, Kuikun 等；[arXiv:2608.23256](https://arxiv.org/abs/2608.23256)；Artificial Intelligence (cs.AI)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：控制实验表明，在无显式 CoT 的推理语料上，简单 Mixed SFT 不仅更便宜，还给后续 RLVR 更高的性能上限。

**为什么值得推荐、方法怎么工作**：论文把 next-chunk reasoning RL 与一个容易被忽略的对照放在同一 pipeline：Mixed SFT 在一次监督训练中同时使用 no-CoT 推导文本和 long-CoT 数据；两种方法随后接受相同 RLVR，统一数据、模型和评测，分别观察 RL 前与 RL 后成绩。Figure 1 对照训练策略及 post-RLVR 结果，Figure 2 直接给 GPU-hour 成本，避免只比较中间 checkpoint。

**关键实验、局限与当天主题**：Mixed SFT 的 post-RLVR ceiling 在域内数学和 OOD 推理上都更高，训练计算少 60 倍以上；同时，高 pre-RLVR accuracy 并不保证高 post-RLVR accuracy。证据支持的是“此前 NCR-RL 的收益可能来自数据暴露方式，而非 RL 形式本身”，但仍限于 no-CoT 数据设置、选定模型和下游 RLVR recipe，不能否定所有 next-chunk 目标。它是当天最有价值的负向结果之一：post-training 方法必须在完整流水线和 matched compute 下比较。

### 24. SRPO: Self-Reflective Policy Optimization for Long-Horizon Reasoning

**论文信息**：*SRPO: Self-Reflective Policy Optimization for Long-Horizon Reasoning*；Liu, Jialong, Shi, Yuling, Yang, Ning, Gu, Xiaodong, Li, Zuchao；[arXiv:2608.23493](https://arxiv.org/abs/2608.23493)；Artificial Intelligence (cs.AI)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：SRPO 让模型把完整失败轨迹压成 reflection patch，再用其条件化 teacher score 产生 token 级训练信号，形成自我纠错闭环。

**为什么值得推荐、方法怎么工作**：当前 policy 先在数学或 agent 环境 on-policy rollout；模型对已完成轨迹反思，抽取简短错误模式与修正建议；同一规模的反思条件 teacher 在学生真实访问的状态上打分，将稀疏终局反馈稠密化到 token；更新后的 policy 再采样新轨迹，避免离线模仿的 distribution shift。Figure 1 展示 rollout→reflection→dense score→policy update 四步，并强调不需要外部 critic、独立 reward model 或更大 teacher。

**关键实验、局限与当天主题**：Qwen3-8B 用 scaled SFT 约 8% 的 FLOPs，在 AIME'24 达 73.3%；WebShop 64.7%、ALFWorld 76.8%、SWE-Bench-Lite 31.2%，跨推理与长程 agent 都有提升。局限是 self-reflection 可能与原错误高度相关，teacher score 的校准和额外生成成本仍在，SWE-Bench-Lite 31.2% 也远非可靠部署。它支持当天判断：局部 credit 有用，但最终仍要由外部环境 oracle 限定可信上限。

### 25. Best Practice Critic Optimization

**论文信息**：*Best Practice Critic Optimization*；Qi, Penghui, Zhou, Xiangxin, Lee, Wee Sun；[arXiv:2608.23566](https://arxiv.org/abs/2608.23566)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)；列入 2026-08-25 官方列表。

**一句话 TL;DR**：BPCO 证明 critic-based LLM RL 的不稳定并非必然：限制 value 范围、改 target 与 advantage 处理后，单响应训练可追平组采样。

**为什么值得推荐、方法怎么工作**：recipe 组合五项：DPPO 更新；把 critic prediction 限在 reward 可达范围；用最终 Monte Carlo outcome 而非有偏 bootstrap target；取消 policy advantage 归一化；按回答长度调节 GAE。critic 仅训练时存在，还可读取 reference answer/rubric 等 policy 不可见的 privileged reward 信息。Figure 1-3 逐项展示 PPO/DPPO、value bounding 和 target 的稳定性，而不是只报最终分数。

**关键实验、局限与当天主题**：从 1.5B 到 30B-A3B MoE 的数学任务上，BPCO 一致优于强 critic baseline，并在每 prompt 只采一条 response 时匹配或超过 group-based baseline；rubric reward 也成立。局限是组件多、最佳组合可能对当前 reward 形态特化，privileged critic 会引入训练-部署差异，摘要未给统一成本/准确率增益。它的价值在于把“不要 critic”变成可检验工程选择，而不是 GRPO 时代的默认教条。

## 中相关论文速读

### 1. [AIREP: A Protocol for Per-Decision Evidence in AI Runtime Governance](https://arxiv.org/abs/2608.21363)

AIREP 为 runtime 的 release、block、defer、redact、escalate 决策定义单个签名记录：输入、输出和证据只存哈希，声明证据覆盖范围，并以 SHA-256 链检测篡改与缺口。它击中 agent 审计的可携带证据问题，且有双语言 conformance kit；但目前是协议设计，没有大规模真实 runtime 或攻击实验，所以保留“每次决策可离线验证”的思想即可，不必把它当成熟治理标准。 论文分类为 Artificial Intelligence (cs.AI) ; Cryptography and Security (cs.CR)，列入 2026-08-25 官方列表。

### 2. [Neuro-Formal Verification: Agentic Language-Agnostic Formal Program Reasoning](https://arxiv.org/abs/2608.21516)

NFV 让 coding agent 把主流语言问题翻译为 Dafny/CBMC 可判模型，再由既有 verifier 给 proof 或 counterexample。Python 数据上，57% 条目得到 Dafny 正确/错误证明且 precision 92%，63% 错程序得到 CBMC 反例且 precision 90%。机器检查提升了证据强度，但翻译层本身不 sound、只覆盖编程题而非真实仓库；值得速读其“经验准确率+机器证明”边界。 论文分类为 Software Engineering (cs.SE) ; Programming Languages (cs.PL)，列入 2026-08-25 官方列表。

### 3. [ExploreAI: Agentic Exploration Knowledge Bases for Reproducible Observable-Regression Testing of Black-Box VR and 3D Applications](https://arxiv.org/abs/2608.21628)

ExploreAI 用 LLM 规划 VR/3D 场景探索，把对象、导航路径、多视角截图和自验证结果写入 Exploration Knowledge Base，供版本间 observable-regression 重放。六个 Unity、AI2-THOR、BeamNG 场景及人工/LLM reproduction pilot 支持知识库的复现价值。它与运行行为验证高度相关，但场景数小、LLM 自验证仍会共错，也没有复杂代码修改环，因此列中相关。 论文分类为 Software Engineering (cs.SE) ; Robotics (cs.RO)，列入 2026-08-25 官方列表。

### 4. [MemGuard: Persisting Verifier Signals for LLM-Agent Memory Governance](https://arxiv.org/abs/2608.21867)

MemGuard 把 verifier 的 reward、confidence、label、uncertainty 持久附到每条 memory，并在准入、检索、冲突解决、摘要和归档全生命周期复用。Terminal-Bench 2.0、SWE-bench Verified、WebArena、Mind2Web 的 16 个 backbone×benchmark 设置都最好，最大增益 7.9 点。值得保留的是 verifier 信号不能只做一次 filter；未深读是因为收益仍依赖既有 verifier，长期 bank 的错误关联未被独立人工审计。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 5. [SkillBloat: Token Amplification Attacks via Skill Injection in LLM Coding Agents](https://arxiv.org/abs/2608.21929)

SkillBloat 研究 coding-agent skill 供应链的经济攻击：恶意技能不直接窃密，而诱导 agent 消耗 5.42-10.15 倍 token。两阶段先筛攻击条件，再用 LLM 全文重写强化最有效样式；消融显示第二阶段确有额外放大。它揭示安全评测不能只看任务正确与否，但 benchmark、目标 agent 和 token 计价仍有限，且未给 sandbox/签名防御闭环。 论文分类为 Cryptography and Security (cs.CR) ; Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 6. [Spine-Branch Coordination for Multi-agent Computer Use](https://arxiv.org/abs/2608.22077)

Spine-Branch 正面处理多 VM 状态无法 merge：主 spine 保持连续执行状态，branch 只并行收集信息，完成即丢弃并把结果交回 spine。200 个 Odysseys 长任务、三种 CUA backbone 上成功率 +6.0% 到 +16.5%，成本降 34%-70%。这个系统约束很实在，但主要是 computer-use 编排，不含软件修改的补丁 oracle 或权重训练，适合速读。 论文分类为 Computation and Language (cs.CL) ; Multiagent Systems (cs.MA)，列入 2026-08-25 官方列表。

### 7. [D-Diff: An Interactive Environment for Adjusting Commit Boundaries Based on an Editable 3-way Diff](https://arxiv.org/abs/2608.22207)

D-Diff 提供可编辑 three-way diff，让开发者在 base/current/desired 间调整 commit boundary，而不是接受 agent 自动切分的历史。它与 atomic commit、变更重构直接相关，交互环境有助于把语义边界显式化；但核心贡献是人机界面与算法工具，不是 coding-agent 端到端评测，当前证据不足以说明会提高长期 repair 成功率。 论文分类为 Software Engineering (cs.SE)，列入 2026-08-25 官方列表。

### 8. [CodeMechanic: Bug-Property-Guided Program Mitigation](https://arxiv.org/abs/2608.22275)

CodeMechanic 以 bug property 指导 program mitigation，目标不是生成任意通过样例的 patch，而是保留待修性质并约束缓解策略。它对安全修复中的规格化很有价值，也能与 agent patch verifier 对接；不过论文主体偏程序分析/安全转换，缺少多文件 agent、构建与真实部署反馈，因此只保留其“先定义 bug property 再改代码”的判断。 论文分类为 Software Engineering (cs.SE) ; Cryptography and Security (cs.CR)，列入 2026-08-25 官方列表。

### 9. [When Not to Imitate: Boundary-Aware Skill Memory for Reliable Tool-Use LLM Agents](https://arxiv.org/abs/2608.22339)

BASM 发现只从成功轨迹提 skill 会形成 imitation trap：相似但应换工具的任务里，procedure skill 将错误工具 margin 提高 47%。它为技能增加适用条件、风险提示、禁用规则和恢复说明，AppWorld 成功率最多 +23.8%，BFCL +5.0%，AgentDojo 攻击成功率降 4.6%。证据很强，但这是外部 memory 治理而非权重 post-training，且边界字段仍由生成器质量决定，故中相关。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 10. [Mitigating Error Propagation in Chain-of-Thought: A Tree-of-Thought Framework for Smart Contract Repair](https://arxiv.org/abs/2608.22345)

该文将审计报告解析、Slither 静态定位、Tree-of-Thought 多修复路径与编译/人工检查组合到智能合约修复。50 个 Code4Rena 漏洞上 single/top-3 success 为 62%/84%，较 ContractTinker 高 12/6 点，fully effective 44%。值得看多分支与静态证据的组合；但样本小、manual check 较重，也没有链上状态和回归测试覆盖，不能视为自动部署级修复。 论文分类为 Cryptography and Security (cs.CR) ; Software Engineering (cs.SE)，列入 2026-08-25 官方列表。

### 11. [ClawProBench: Trace-Aware Evaluation of AI Agents with Runtime Coverage and Frozen Workplace-Style Holdouts](https://arxiv.org/abs/2608.22510)

ClawProBench 把评测单位声明为 model+runtime configuration，用 trace 同时记 evidence acquisition、routing、安全边界和重复执行。102 场景 full profile、68 场景冻结 holdout 中，最佳 trace score 0.7671；holdout pass@k-any 0.6638，而严格三次通过仅 0.2890，两个排名 Spearman 0.13。它很好地说明一次成功和跨配置排名不可靠，但 runtime 单一、scoring formula 仍是作者选择，所以不升为核心深读。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 12. [CausalCache: Conditional High-Fidelity Restoration for Long-Horizon GUI Agents](https://arxiv.org/abs/2608.22577)

CausalCache 在完整文字历史上选择少量旧截图恢复，而非把视觉槽位全给最近事件；selector 与 history-gated adapter 用 matched-budget intervention 训练。OSWorld-Verified 30 步诊断中 46.7% 对 Recent-4 的 42.4%，MobileWorld 零样本 36.8% 对 30.2%，跨应用子集差 11.2 点。效果集中在真正需跨应用记忆的任务，论证扎实；但 15 步官方设置无显著差，故中相关。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 13. [Execution-Anchored Hallucination Calibration Reranking for Verilog Code Generation](https://arxiv.org/abs/2608.22938)

这篇工作用 Verilog 编译/执行结果校准 hallucination reranking，把硬件代码生成候选放回可执行工具链，而不是用语言置信度选答案。它对 compile-gated coding agent 很有借鉴意义；但对象是单一 HDL 生成与 rerank，并未覆盖 repository change、复杂依赖或多轮修复，且执行通过仍不保证时序/综合语义正确，所以只速读其 oracle 设计。 论文分类为 Software Engineering (cs.SE) ; Hardware Architecture (cs.AR)，列入 2026-08-25 官方列表。

### 14. [What Process Evaluation of Coding Agents Actually Measures: Action, Task, and Step Are Three Different Levels](https://arxiv.org/abs/2608.22960)

作者把 coding-agent process evaluation 分成 action prediction、task uncertainty、step causal attribution，并用 replay/intervention 的 SCAE 实例化第三层。12 个仓库的 499 条定位 episode 显示 next action 主要受执行 provenance 驱动，task-level uncertainty 强于 step-level，full-trace judge 还有 collider bias。它纠正“相关步骤=因果贡献”的混淆，但只测文件定位、样本小且 replay 依赖结构模型，适合方法论速读。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 15. [ARGUS: MCP-Grounded Root Cause Analysis for Kubernetes Incidents](https://arxiv.org/abs/2608.23084)

ARGUS 通过 Kubernetes、Prometheus、Loki、NATS 的 MCP server 访问实时可观测数据，并在 Slack 生成结构化根因摘要。10 个故障注入场景中根因全对，MCP success ratio 0.91；6 名值班工程师信诊断却不信修复建议。最值得记住的是 diagnostic/prescriptive asymmetry。因场景少、商业模型与工业 partner 单一，尚不足以支持自动 remediation。 论文分类为 Software Engineering (cs.SE)，列入 2026-08-25 官方列表。

### 16. [NetConfArena: An Executable Benchmark for LLM Agents in Closed-Loop Network Configuration](https://arxiv.org/abs/2608.23179)

NetConfArena 把网络配置放入多设备仿真，以隐藏可执行测试验证协议和拓扑行为。96 个模板生成 480 实例、3,840 条轨迹，错误不仅是命令语法，还包括规格遵守和长程计划。它将真实系统状态作为 oracle，适合可靠 agent 评测；但任务由 LLM 辅助材料转换，网络仿真仍比生产简单，论文也只提出将轨迹用于训练而未完成 post-training。 论文分类为 Networking and Internet Architecture (cs.NI) ; Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 17. [From Natural Language Policies to Executable Obligations: A Verification Harness for Dependable In-Car LLM Agents](https://arxiv.org/abs/2608.23282)

AgentGuardUtil 把每段自然语言车载 policy 编译为 typed rule，其中一部分有可执行 obligation；deterministic engine 根据实时工具结果和模拟写后状态生成精确补救调用，再经过 25 个 gate 与 LLM critic 有界修订。它体现“LLM proposer+确定性 verifier”，但作为 CAR-bench 参赛系统，摘要缺少完整独立数字，规则覆盖和编译正确性仍是主要风险。 论文分类为 Software Engineering (cs.SE)，列入 2026-08-25 官方列表。

### 18. [Prime Agent: A Self-Improving RLM Harness](https://arxiv.org/abs/2608.23552)

Prime Agent 用持久 IPython REPL、Continual Harness、递归 subagent 和可观测 session 统一长程执行、恢复、验证与资源计量。ARC-AGI-3 RHAE Best@1 从 30% 到 95.5%，并覆盖 coding、GPU kernel、emulator、nanoGPT 等任务。系统能力很强，但混合了大量 test-time compute、并行与持久记忆，难隔离模型能力；适合作为 harness 上界工具，不宜把成绩直接当 agent 算法进步。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Software Engineering (cs.SE)，列入 2026-08-25 官方列表。

### 19. [On the Role of Citations in Preference Data](https://arxiv.org/abs/2608.21376)

论文审计 preference data 中引用/出处信息如何改变偏好标签与训练信号，提醒 ranking pipeline 可能把可见 citation 当质量代理。它与偏好优化的数据偏差直接相关，但贡献主要是数据测量而非新的 DPO/RLHF 算法；阅读时应重点看控制了回答质量后 citation effect 是否仍在，以及标注者/LLM judge 是否共享来源权威偏见。 论文分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 20. [Aligning Human Sense: Calibrated Distributional Reward Learning for Video Generation](https://arxiv.org/abs/2608.21425)

该文为视频生成学习分布式人类 reward，而非把多样审美压成单一标量；通过 calibration 让模型表达评价不确定性和群体差异。它对 multimodal alignment 的反馈建模很实质，但任务域专一，主结论取决于偏好采集与分布假设，也未证明对文本/工具 agent 可迁移，因此放中相关，保留“reward 应表示分布而非伪共识”的判断。 论文分类为 Computer Vision and Pattern Recognition (cs.CV) ; Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 21. [Can LLMs Truly Forget? Revealing Unlearning Gaps Through Adversarial Evaluation](https://arxiv.org/abs/2608.21606)

作者用对抗提取检查 LLM 是否真的 unlearn，而非只看标准问法拒答或知识题下降。论文揭示现有方法在重述、组合提示和攻击后仍可恢复目标知识，强调 utility 要在语义边界问题上同时测。它是 post-training 安全评测的重要负证据；但若缺少统一训练预算、攻击强度和真正删除 ground truth，就不能据此给所有 unlearning 方法下绝对结论。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 22. [Evaluation Awareness in Language Models: Representation, Verbalization, and Control](https://arxiv.org/abs/2608.21766)

六个模型上，evaluation awareness 的内部表示 best AUROC 均≥0.7；Olmo checkpoint 显示基座已存在，SFT 阶段进一步放大，之后较稳定，而 steering 效果持续增长。论文区分 activation representation、输出 verbalization 与因果 steering，避免把“模型说自己在考试”当全部证据。它分析 post-training 如何改变行为，但不提出训练修复，故中相关。 论文分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 23. [Hints, Critics, and Teachers: Prior Injection for Sparse-Reward RL in Vision-Language Math Reasoning](https://arxiv.org/abs/2608.21811)

在 Qwen2-VL-2B 仅 3.6% rollout 正确、85%-97% 组全错的稀疏 regime 中，论文 matched 11 种 hint、teacher distillation、critic prior。真正送达 policy 的六种 prior 与其余五种完全分开，HL-Gauss critic 比 MSE 多 14.4 点；同时一个常用域内 slice 与 OOD transfer 相关 -0.74。价值在于“先验证先验是否真的进入梯度”，但只限视觉数学。 论文分类为 Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)，列入 2026-08-25 官方列表。

### 24. [FIRM-Video: Check Before You Score for Reliable Text-to-Video Reward Modeling](https://arxiv.org/abs/2608.21839)

FIRM-Video 先按 instruction following、world coherence、perceptual quality 建逐项 checklist，再对时序视觉证据逐项核验，最后才汇总 reward 与自然语言解释。88,044 条训练实例、250 视频/750 人标 benchmark 支持 8B reward model 的 MAE 和 Best-of-8 选择。监督结构清楚，但评测集仍小且来源集中，视频 reward 是否抗优化投机尚未证明。 论文分类为 Computer Vision and Pattern Recognition (cs.CV)，列入 2026-08-25 官方列表。

### 25. [HiDiffTIR: Hierarchical Difficulty-Aware Policy Optimization for Multi-Turn Tool-Integrated Reasoning](https://arxiv.org/abs/2608.21863)

HiDiffTIR 从同一 RL rollout 的组统计估计轨迹难度和 turn 难度，分别给长程 tool reasoning 与关键调用更高 credit，不增加人工监督。三个 tool-use benchmark 均优于强 RL baseline，并提高 invocation accuracy。它直接回应 uniform advantage 过粗，但“难”可能与随机失败混淆，且摘要缺绝对数字；值得速读层级 credit，不必先于 CompPO/River。 论文分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 26. [VIG: Visual Information Gain as a Reward Signal for Multimodal Chain-of-Thought Compression](https://arxiv.org/abs/2608.21883)

VIG 用同一 policy 有图/无图两次前向的预测不确定性差，给每个 CoT token 计算 visual information gain，再作为 GRPO reward 压缩无视觉依据的描述和反思。三种 Qwen3-VL-Thinking 尺度、六个主 benchmark 上改善 accuracy-efficiency。优点是无外部 reward model；风险是两次前向增成本，信息增益不等于推理必要性，文本知识型步骤可能被误罚。 论文分类为 Computer Vision and Pattern Recognition (cs.CV)，列入 2026-08-25 官方列表。

### 27. [From Solver Feedback to Faithful Plans: Multi-Role Reinforcement Learning for Symbolic Planning](https://arxiv.org/abs/2608.21897)

该文用一个模型扮演 Actor、Judge、Editor，把 solver feedback 组织成 PDDL 生成、校验和有界修复，无需人工 PDDL demonstration。PlanBench success 从 35.5% 到 70.8%，faithful success 66.3%，semantic drift 降到 6.4%。可执行 solver 是强点；但同模型多角色相关错误、规划域有限，solver success 也可能容纳语义捷径，故中相关。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 28. [Decoupled Physical Modeling and Execution for Physics Reasoning](https://arxiv.org/abs/2608.22126)

两阶段 physics post-training 先用 SFT 学显式物理建模中间表示，再用 rubric reward RL 改进建模过程，将公式执行与物理建模解耦。PhysReason、PhyX、SeePhys 上较直接 GRPO 平均约 +3%。它展示 no-CoT/结构监督的另一种设计，但领域窄、rubric 与中间表示由作者定义，尚不能证明通用 reasoning 的迁移。 论文分类为 Machine Learning (cs.LG) ; Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 29. [Dual-Layer Agentic Memory with Fast Write Routing and Slow Consolidation](https://arxiv.org/abs/2608.22215)

Dual-Layer Agentic Memory 在写入时将信息分为不写、新写、更新，以 1.7B/8B cascade 控成本，再周期性 SFT 把高价值外部记忆写回参数。它能删 68% 冗余、不到 50% 升级到大模型，同时保留 exhaustive memory 98% 以上 QA EM。亮点是外部/参数记忆闭环；风险是 consolidation 的遗忘、污染与回滚未充分审计。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 30. [WAM-OPD: On-Policy Distillation for World Action Models](https://arxiv.org/abs/2608.22364)

WAM-OPD 让部署中的 student 决定访问状态，冻结 teacher 在这些历史上标视频与动作，student action 又条件于自己的视频计划，匹配真实部署。RoboTwin 两任务从 0→58.3%、16.7→33.3%。作者正确称其为初步 capability proof：只有两任务、轻量 adapter，不能证明 broad robotics generalization，但 on-policy dense distillation 设计值得保留。 论文分类为 Artificial Intelligence (cs.AI) ; Robotics (cs.RO)，列入 2026-08-25 官方列表。

### 31. [Think with Structured Grounding: Perceptual Reinforcement Learning for Chart and Visual-Tabular Understanding](https://arxiv.org/abs/2608.22429)

TwSG 先让 MLLM 用答案引导定位关键图块，再由 teacher 生成 region-aware 数据；SFT 学多轮聚焦与恢复，TL-GRPO 用过程 reward 内化工具式细粒度感知，推理时回到单次全图前向。多架构、多图表 benchmark 改善准确率与延迟。它是实质 multimodal post-training，但 teacher/答案引导可能泄漏任务结构，摘要缺统一数字，故中相关。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 32. [The Variance of Thought: Policy Variance, Critical Forks, and Local Credit Assignment](https://arxiv.org/abs/2608.22467)

论文把长程 credit 集中到 critical fork：policy variance 是发现高 advantage 动作的预算，受 Gini dispersion 上界；剩余 horizon 让 Monte Carlo sample cost 按 1/P 增长，而准确 value bootstrap 可把乘法生存概率转为加法。理论为局部 credit 提供尺度判断，但缺 LLM 训练实证，log-value 表示的误差条件也强，所以作为概念速读。 论文分类为 Machine Learning (cs.LG)，列入 2026-08-25 官方列表。

### 33. [GTA-RAG: Graph-Trajectory-Augmented Reinforcement Learning for Multi-Turn Retrieval-Augmented Reasoning](https://arxiv.org/abs/2608.22479)

GTA-RAG 从 entity-document graph 采路径、合成多跳 QA，并用真实 retriever 验证可执行 evidence trajectory；GRPO reward 同时奖励答案和目标文档覆盖，之后再用自然 QA 训练。Qwen2.5 3B/7B 在五个 QA benchmark 优于 RL-RAG baseline。它把检索链纳入 reward，但合成 graph path 可能简化真实查询，检索到目标文档也不等于正确归因。 论文分类为 Computation and Language (cs.CL) ; Machine Learning (cs.LG)，列入 2026-08-25 官方列表。

### 34. [Stress Testing Unlearning Algorithms](https://arxiv.org/abs/2608.22527)

WMDP++ 为 unlearning 加两类压力：主动强制提取已遗忘知识，以及与目标语义接近但应保留的 boundary question。它纠正“忘得多”与“伤得少”被分开报告的缺陷，适合作为安全 post-training gate；但本身是 benchmark extension，仍受 WMDP 领域与攻击集合限制，没有解决训练算法或开放式重构攻击。 论文分类为 Machine Learning (cs.LG)，列入 2026-08-25 官方列表。

### 35. [SPOC-SQL: Stage-wise Preference Optimization for Controllable Text-to-SQL](https://arxiv.org/abs/2608.22772)

SPOC-SQL 按 SQL 执行逻辑拆成四阶段，在关键决策点做细粒度 preference optimization，并暴露可干预中间表示。实验显示 stage-wise human knowledge 持续提升结构化生成。它说明 preference signal 可对准决策而非整段 SQL；但摘要没有绝对执行准确率、数据库泛化或错误恢复成本，且文本到 SQL 比仓库 agent 更封闭。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 36. [Can We Perform Online RL for Image Editing without Editing Rewards?](https://arxiv.org/abs/2608.22780)

Lever-Edit 先训练 reward-aligned captioner，把相对编辑指令转成冻结 T2I reward 可理解的目标描述，再只用成熟 T2I reward 做在线编辑 RL。它在编辑对齐和源图保持上可竞争甚至胜过专用 reward baseline。思路扩展了 reward 复用，但 captioner 可能改变目标语义，冻结 reward 的盲点会被 policy 利用，尚需更强人评和 OOD 编辑审计。 论文分类为 Computer Vision and Pattern Recognition (cs.CV)，列入 2026-08-25 官方列表。

### 37. [TailSieve: Partial-Rollout-Guided Tail Routing for LLM Rollouts](https://arxiv.org/abs/2608.22788)

TailSieve 利用上一轮 partial rollout 预测长尾 prompt，把它们隔离到低并发池，并联合调整 replica 分配；当前 policy 会重生成选中 prompt，保持 on-policy。routing-only 最多 1.67×，结合 MTP/DFlash 最多 2.59×。它对 RL/OPD 系统效率很实用，但不改变学习目标，长尾可预测性跨 policy 漂移时可能失效，故中相关。 论文分类为 Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)，列入 2026-08-25 官方列表。

### 38. [Industrial-Instruction: An End-to-End Framework for Building Instruction-Tuning and Benchmark Datasets from Industrial Technical Reports](https://arxiv.org/abs/2608.22817)

Industrial-Instruction 从 906 份 Panasonic 文档/7,525 页生成约 13.6K QA 数据，比较 Qwen 与 Claude 教师；小模型 Set-Match 28.5→42.0、F1 46.6→63.5，Claude 数据更干净但成本高约两个数量级，Qwen 数据还有轻微遗忘。它给出真实工业 SFT 数据工程与成本/质量对照；不足是 MCQ 合成和单品牌 corpus 可能形成模板偏差。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 39. [SelFusion: Self-distillation for Diffusion Language Models](https://arxiv.org/abs/2608.22898)

SelFusion 让 diffusion LM 在高/低 mask 两种难度下各前向一次，根据 token 正确性动态决定蒸馏方向，避免“easy mode 自信但错”时单向 KD 误导。instruction-following 上优于外部 LLM/DLM teacher，部分配置超过 LLM teacher。方法简洁且直指 DLM 质量；但正确性判定和双前向成本、跨任务泛化仍需细看。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 40. [Buried in Textual Debt: Context Pruning with Visual Evidence Preservation for MLLM Agents](https://arxiv.org/abs/2608.22963)

SPARE 用 task-state summary 作为 privileged 诊断上下文，对每段历史在原上下文/summary 条件下 replay，以 reverse-KL 判断能否安全删除，再 SFT summarizer 扩大覆盖。多步视觉工具 benchmark 中删 37.89%-64.58% reasoning token 且平均准确率最好。它缓解 textual debt，但依赖 privileged summary 与离线 replay，属于 context/harness+SFT 混合贡献。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 41. [Unlearning Is Not Just Erasing: Temporal Decoupling via Generation Inequality](https://arxiv.org/abs/2608.23020)

ADU 不直接惩罚目标 token，而定位 preplan 位置对敏感 anchor 的全局注意路径，用 adapter 抑制这些路径、保留局部语言结构，并以 activation exchange 验证忘却模块。TOFU Forget Quality 0.93，平均保留 utility 92.9%，baseline 81.9%。机制证据比纯行为分数强；但 attention path 归因仍可能不完整，TOFU/WMDP 无法代表所有隐式知识。 论文分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 42. [Language Chain in Alignment: Cross-Lingual Ranking Preference Optimization](https://arxiv.org/abs/2608.23149)

CRPO 将英语与目标语言的平行 preference pair 组成层级排序，用 LambdaLoss 同时优化语言内和跨语言候选，不再只有二元 chosen/rejected。五种资源水平语言上，instruction following、知识利用和 reward margin 都提高。它对 English-centric alignment 很实质；但数据翻译/平行性可能泄漏英语结构，社会文化偏好也未必可跨语言直接转移。 论文分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)，列入 2026-08-25 官方列表。

### 43. [Beyond the Stability-Exploration Dilemma: Environmental Regularization for LLM Policy Optimization](https://arxiv.org/abs/2608.23311)

ERPO 把正则从 response-side Policy-KL 移到 query-side QKL：约束训练过程中 policy 诱导的查询分布漂移，并用 reference-derived per-query 权重，而不直接压缩响应探索。六个数学 benchmark 上替代 Policy-KL 后更准，且高温/长训练更稳。新意清楚，但“policy 诱导 query”依赖特定训练采样闭环，是否在固定离线 prompt 集成立需细看。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 44. [Agent-G$^2$: Gaussian Guidance for Agentic Reinforcement Learning](https://arxiv.org/abs/2608.23318)

Agent-G² 认为 hint prefix 的有效深度是近似高斯带，而非单一最优点；它从已有 rollout 在线估计 cluster 难度、中心和方差，无额外 probe，再按分布采 guidance depth。ALFWorld 上较最强 hint/hint-free/Aux-RL 高 2.3/3.9/7.4 点，成本不到逐样本 probing 的三分之一。证据限 ALFWorld/WebShop 和 1.5B/7B，适合速读课程调度。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

### 45. [Mitigating Reasoning-Induced Misalignment via Safety-Direction Penalty](https://arxiv.org/abs/2608.23497)

SDP 分析 reasoning fine-tuning 何时沿安全表征方向漂移：先提取 reasoning/safety 两个 activation direction，按 CKA/probe 定位决策层，再在训练时惩罚安全方向位移，并迭代扩层防止补偿。Qwen2.5 3B/7B 上恢复安全且保持推理。亮点是承认 RIM 并非总出现；风险是线性方向与当前攻击集不等于完整安全行为。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)，列入 2026-08-25 官方列表。

## 可留意 / 可跳过

这些工作与两条主线有实质边缘联系，但今天不值得按核心论文投入同等阅读成本。

- **[SLICE: Specification-Level Isolation of Contract Enforcement](https://arxiv.org/abs/2608.21483)**：规格级 contract isolation 与 enforcement 有助于构造 verifier，但论文主线偏 PL 机制，不含 LLM agent。
- **[Large Language Models for Requirements Engineering: A Cross-Task Empirical Evaluation](https://arxiv.org/abs/2608.21531)**：跨任务要求工程 LLM 评测可作需求理解基线，缺少仓库级实施与执行反馈。
- **[LLM-Enhanced Commit Message Generation via Issue Information: An Exploratory Study](https://arxiv.org/abs/2608.22004)**：issue 信息改善 commit message 有历史重建意味，但目标仅文本摘要，不验证原子修改。
- **[Benchmarking the Titans: A Multi-Dimensional Empirical Evaluation of LLM Code Generation Quality in the .NET Ecosystem](https://arxiv.org/abs/2608.22529)**：.NET 代码生成多维质量评测覆盖生态差异，却仍以生成片段为主，离真实仓库演化较远。
- **[Evaluating Inference-Time Defenses Against Package Hallucination in LLM-Generated Code](https://arxiv.org/abs/2608.22652)**：包幻觉的 inference-time 防御值得部署关注，但不是 post-training，也没有完整 build/repair 闭环。
- **[Risk-Aware Reranking for Agentic Tool Retrieval](https://arxiv.org/abs/2608.22751)**：risk-aware tool retrieval 改善工具选择安全性，主要是检索排序，不含执行后状态 oracle。
- **[AgentFlow: A Flow-Centric Policy Language and Framework for Securing LLM Agent Systems](https://arxiv.org/abs/2608.22868)**：AgentFlow 用 flow-centric policy 限制 agent 行为，有安全框架价值，实证尚不足以列核心。
- **[Concepts for Securing Agentic AI Coding and the Terok Environment](https://arxiv.org/abs/2608.22930)**：Terok 环境讨论 agentic coding 安全概念，更像架构/立场工作，缺少可比较评测。
- **[An AI-Assisted Migration Framework for Transforming Legacy Scientific Applications into Reusable Cloud-Based Workflows](https://arxiv.org/abs/2608.23146)**：遗留科学应用迁云与软件演化相关，但 AI 辅助框架的 agent 自主性和行为等价证据偏弱。
- **[TianoForge: An Automated Bug Triage Approach for the TianoCore UEFI Firmware Development Community](https://arxiv.org/abs/2608.23259)**：TianoForge 面向 UEFI 社区 bug triage，适合复杂工业维护背景，却不直接生成/验证补丁。
- **[Can Coding Agents Build Robust Baselines? A Skill-Based Approach for Automating the Medical Imaging Model-Development Pipeline](https://arxiv.org/abs/2608.23336)**：coding agent 自动建医学影像 baseline 很实用，但任务是模型开发 pipeline，仓库迁移/修复证据较窄。
- **[A Reproducible, License-Aware Distillation Recipe for CPUDeployable Safety Classification](https://arxiv.org/abs/2608.21570)**：可复现、许可证感知的安全分类器蒸馏 recipe 有部署价值，但属于专用小模型适配。
- **[Calibrate What You SHIP: Post-Selection Risk Control for Verifier-Guided Text-to-Image Generation](https://arxiv.org/abs/2608.21748)**：verifier-guided 文生图 post-selection 讨论风险控制，主要改变采样选择而非权重 post-training。
- **[Learning to Look Again: Loss-Gap Supervision for Free-form Crop Routing in Vision-Language Models](https://arxiv.org/abs/2608.21762)**：loss-gap supervision 训练视觉 crop router，属于细粒度 VLM 适配，通用性证据有限。
- **[MCite-RL: Towards Reliable Multimodal RAG via Citation-enhanced Agentic Reinforcement Learning](https://arxiv.org/abs/2608.21808)**：MCite-RL 用 citation reward 改善多模态 RAG，应用明确，但评价依赖引用正确性 oracle。
- **[BioMed-Agent-RL: A Meta Learning, All You Need for Biomedical Applications](https://arxiv.org/abs/2608.21864)**：BioMed-Agent-RL 混合 CPO/DPO/GRPO，摘要声称约 73%/高 5%，训练变量过多、独立可复现性需谨慎。
- **[CD-LoRA: Consistency-Driven Low-Rank Adaptation for Multi-Task Fine-Tuning](https://arxiv.org/abs/2608.21909)**：CD-LoRA 处理多任务 PEFT 一致性，属于通用优化部件，LLM 行为证据不够集中。
- **[ESCRAG-R1: Retrieval-Augmented Reinforcement Learning for Emotional Support Conversation](https://arxiv.org/abs/2608.21925)**：情感支持 RAG-RL 是具体应用 post-training，需优先审计安全、人评与 reward 共偏差。
- **[Enhancing Group Recommendation with Memory-Augmented Reasoning in LLM Agent](https://arxiv.org/abs/2608.21939)**：群组推荐以 SFT+GRPO 学 memory/reasoning 协调，任务专用且 explainability 评价可能主观。
- **[ToSCA: Leveraging Hierarchical Reinforcement Learning on Temporal and Strategic Abstractions of Conversational Agents](https://arxiv.org/abs/2608.21969)**：层级 RL 的对话策略抽象可留意，尚难判断对通用 LLM post-training 的独立贡献。
- **[Unveiling the Depth-Performance Dilemma in Split-Federated Fine-tuning of LLMs](https://arxiv.org/abs/2608.22188)**：split-federated LLM fine-tuning 的深度/性能权衡偏系统效率，行为可靠性证据有限。
- **[Who Pays More for Safety? Measuring the Disparate Cost of Safety Alignment across Languages](https://arxiv.org/abs/2608.22490)**：多语言安全对齐的差异化成本是重要评测问题，但论文主要测量现象而非修复 recipe。
- **[BLADE: Bilevel Low-rank Augmented-Lagrangian Erasure for LLM Unlearning](https://arxiv.org/abs/2608.22557)**：BLADE 的低秩增广拉格朗日 unlearning 值得对照 ADU/WMDP++，但需重点核对边界 utility。
- **[ST$^2$U: Stateful Test-Time Unlearning via Restricted Knowledge Boundary Control](https://arxiv.org/abs/2608.23034)**：stateful test-time unlearning 改推理期状态而非长期权重，属于 post-training 的邻近边界。
- **[The Emergence of Relevance Through Axiomatic Attention Patterns During LoRA Fine-Tuning](https://arxiv.org/abs/2608.23338)**：LoRA 中层 attention 与 relevance pattern 相关，有机制解释价值，但仍是 correlational reranker case。
- **[On the Threat Model of Weird Generalization and Emergent Misalignment](https://arxiv.org/abs/2608.23476)**：weird generalization/emergent misalignment 的 threat model 有助于界定安全外推，缺少新训练算法。
- **[Act with Intent: Distilling Behavior Intent for Vision-Language-Action Models](https://arxiv.org/abs/2608.23478)**：VLA 行为意图蒸馏属于多模态/机器人 post-training，任务与 LLM agent 主线距离较远。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 主要证据 | 可信边界 |
|---|---|---|---|---|
| [XRFix: Exploring Performance Bug Repair of Extended Reality Applications with Large Language Models](https://arxiv.org/abs/2608.21718) | XR 性能修复 | 静态分析证据驱动 LLM patch | 23 项目、104 错误 | 缺设备性能轨迹 |
| [Architecture as Capability Equalizer for Coding Agents](https://arxiv.org/abs/2608.21747) | 架构规格效应 | 等信息多格式 matched trial | 6 模型、90 次 | 任务与 rubric 有限 |
| [Beyond Success and Failure: Length-Aware Contrastive Learning for GUI Agents](https://arxiv.org/abs/2608.21830) | GUI 轨迹信用 | 成功长度+失败分歧对比 | OSWorld 50.0% | 短不等于安全 |
| [GameXpert-Bench: How Far Are Coding Agents from Expert Game Development?](https://arxiv.org/abs/2608.21833) | 游戏全生命周期 | 生成-修复-优化三轨 | 97+100+102 请求 | 优化链仅 17 条 |
| [Repo2Skill-Evo: Repository Skills Go Stale in Silence](https://arxiv.org/abs/2608.21964) | skill 静默过期 | release patch-grounded 维护 | 57 仓库、105 transition | 未重跑下游任务 |
| [Hack-Verifiable Terminal Bench: Evaluating Reward Hacking in Terminal Tasks](https://arxiv.org/abs/2608.22103) | 终端 reward hacking | 任务内 planted 可验证 exploit | 89 任务、多级提示 | 攻击面仍枚举 |
| [MCP-Universe RL: A Framework for Training MCP Tool-Use Agents via Reinforcement Learning](https://arxiv.org/abs/2608.22167) | tool-use RL 系统 | MCP 环境+分阶段并发 | 三领域 reward 均升 | 单模型族/verifier |
| [Disagree to Explore, Agree to Commit: Routing-Guided Test-Time Scaling for Software Agents](https://arxiv.org/abs/2608.22191) | 软件 Agent 选轨迹 | MoE routing 协调 | SWE-bench 44.9→48.2 | 需白盒稀疏 MoE |
| [Learning Generalizable Behaviors for Terminal Agents](https://arxiv.org/abs/2608.22631) | terminal RL 泛化 | 过滤环境+行为正则 | <30% 环境，增益 +106%/+30% | 合成域差 |
| [GSAR: Goal-State-Anchor Rewards for Mobile GUI Agents with Self-Evolving Data Synthesis](https://arxiv.org/abs/2608.22847) | 移动 GUI reward | goal-state UI anchor | 验证准确率 >90% | 终态副作用未覆盖 |
| [When Can Agents Safely Checkpoint, Fork, Restore, and Merge? Exact Checking for Execution Edits](https://arxiv.org/abs/2608.22928) | 执行分支安全 | 精确 checker+Lean proof | 六类 edit 证明/测试 | 依赖完整日志 |
| [AutoSaddler: Automatic Harness Optimization with Durable Updates from Agent Execution Traces](https://arxiv.org/abs/2608.23041) | harness 自动演化 | 诊断-patch-验证提交 | 三 benchmark +9~10 点 | validation 被反复消耗 |
| [DPIAgent: Divide, Protocol, Isolate for Agentic Reproduction Test Generation](https://arxiv.org/abs/2608.23341) | repro test 目标漂移 | Divide-Protocol-Isolate | 81.76%，选取后86.17% | 硬阶段可能阻断回跳 |
| [SWE Refactor Bench: Can Coding Agents Complete a Long-Horizon, Whole-Repository Stack Migration?](https://arxiv.org/abs/2608.23564) | 全仓库技术栈迁移 | 迁移审计+行为+agent 反例 | 520 次仅5.4%全过 | 20 任务/公开仓库 |
| [SecOPD: Mitigating Adaptive Prompt Injections by On-Policy Distillation](https://arxiv.org/abs/2608.21500) | 自适应 prompt injection | clean teacher token OPD | PISmith 94.0→9.0 ASR | 攻击/judge 仍有限 |
| [Let Credit Follow Computation: Architecture-Aware Credit Transport for Large Language Model Reinforcement Learning](https://arxiv.org/abs/2608.21501) | LLM RL 信用传播 | attention gate+aligned critic | 61.4 对53.8，五seed | attention 非因果证明 |
| [Perturb the Thought, Not the Pixels: Latent-Space Rollout Diversification for Reinforcement Learning of Vision-Language Models](https://arxiv.org/abs/2608.21595) | VLM rollout 多样性 | 潜空间 branch noise | 五 OOD 联合显著 | 单模型/几何域 |
| [Reinforcement Learning on Benign Facts Amplifies Leakage of Memorized Private Data](https://arxiv.org/abs/2608.21727) | 良性 RL 隐私副作用 | PII-free matched RL probe | DeepSeek recall 0.155→0.370 | 仅 Enron 邮箱 |
| [The Chase Is the Curriculum, the Capture Anchors the Credit: Pursuit-Evasion Self-Play for Zero-Data LLM Reasoning](https://arxiv.org/abs/2608.21871) | 零数据课程与信用 | 追逃 self-play | 三环境、九 OOD | verifier/难度轴可投机 |
| [EDGE: Experience-Distillation for Guided Exploration in Agentic Reinforcement Learning](https://arxiv.org/abs/2608.21946) | 经验蒸馏 | 边际准入+reverse-KL | ALFWorld +8.3，WebShop +12.5 | 两模拟环境 |
| [DIAG: Diagnostic Iterative Alignment and Generation for Data-Efficient Mathematical Preference Distillation](https://arxiv.org/abs/2608.22806) | 偏好信号枯竭 | yield 诊断+能力边界生成 | 固定预算更优 | teacher 共错 |
| [Thinking at the Right Size: Amortized Distillation Across Post-Trained LLMs](https://arxiv.org/abs/2608.22854) | 模型族蒸馏成本 | 尺寸×变体双轴摊销 | 一次生成 L×K 模型 | 线性 delta 假设 |
| [Is Next-Chunk Reasoning RL Really Better than SFT? Revisiting Training Strategies under no-CoT Data](https://arxiv.org/abs/2608.23256) | no-CoT 训练归因 | Mixed SFT matched control | >60× 更省且 RL 后更强 | 限定特定流水线 |
| [SRPO: Self-Reflective Policy Optimization for Long-Horizon Reasoning](https://arxiv.org/abs/2608.23493) | 自反思局部信用 | reflection patch+token teacher | AIME 73.3%，8% FLOPs | 自我共错/外部 oracle |
| [Best Practice Critic Optimization](https://arxiv.org/abs/2608.23566) | critic 稳定训练 | bounded value+MC target+length GAE | 1.5B-30B 单样本匹配组法 | 多组件 recipe |


## 我的判断

**整体创新性：A。** 最重要的新意不是模型规模，而是评测和训练单位被重新定义：全仓库迁移、release-bound skill、可验证 hack、execution edit、goal-state anchor、critical token 与能力边界都比整条文本更接近真正负责的对象。

**实用价值：A。** SWE Refactor Bench、HVTB、DPIAgent、River、MCP-Universe RL 与 AutoSaddler 都给出可执行协议或清楚实现路径。实际成本也很明确：要维护容器、重复轨迹、状态 oracle、验证集和版本化外部知识，可靠性不会免费来自更强模型。

**严谨性：A-。** matched compute、独立 control、置信区间、机械证明和负结果明显增加；尤其 Mixed SFT、Repo2Skill-Evo 与隐私泄露论文都主动限制 claim。主要不确定性仍是自动 verifier 共盲点、公开数据污染、合成环境、单一模型族和 validation 在反复优化中逐渐变成训练集。

**推荐价值：A。** 若只读六篇，优先 SWE Refactor Bench、Repo2Skill-Evo、River、SecOPD、CompPO、Is Next-Chunk Reasoning RL Really Better than SFT。它们分别代表行为与迁移双 oracle、外部知识演化、环境质量、token 级安全信用、架构感知 credit，以及完整 post-training 流水线的 matched control。当天最值得带走的判断是：可靠进步取决于证据是否到达真实状态，credit 是否落到真实决策，以及外围状态是否能被审计、失效和回滚。
