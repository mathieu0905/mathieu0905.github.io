---
title: "从结果奖励到运行证据：8 月 10 日 arXiv 把 Agent 可靠性拆到每个状态"
date: "2026-08-11"
description: "8 月 10 日的新论文把 coding agent 的执行验证、生产质量与持久状态风险，以及 post-training 的 diff、动作、token 和 memory-state 信用分配放到同一张可靠性地图上。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Agent安全", "Post-Training", "RLHF", "强化学习", "GRPO", "Reward Model", "程序修复"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-neutral-950 via-teal-950 to-amber-900"
---

2026 年 8 月 10 日这一批论文值得读，不是因为又出现了一组更高的 benchmark 分数，而是因为研究者开始追问：**模型在什么状态下做出了哪一步改变，系统凭什么相信这一步，以及错误会沿什么载体继续传播**。coding-agent 方向同时出现了仓库级安全训练数据、在线轨迹纠偏、生产 C++ 质量观测、LLM API 故障注入与持久载体安全；post-training 方向则把稀疏终局奖励进一步拆到 code diff、action、token、turn 与 compact memory state。两条线独立成立，但共同反对一种过于粗糙的评估方式：只看最终 pass/fail，却不检查执行链和信用链。今天的强论文不少，真正应优先看的，是那些把验证器、反事实、可执行环境或状态重建写进方法本身的工作。

本轮逐项核对 arXiv 官方 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG，并补充 cs.IR、cs.CV、cs.CR、cs.OS 的 `pastweek` 页面；九个页面均定位到 **Mon, 10 Aug 2026**。合并 New 与 Cross submissions 后得到 431 篇唯一条目，最终纳入 **58 篇实质相关论文**：coding-agent / software-change 主线 40 篇，post-training 主线 22 篇，其中 4 篇同时属于两条线。14 篇强相关论文均从 `https://arxiv.org/pdf/<id>` 下载，文件头、大小、文本抽取与首屏渲染全部通过；中相关与可留意论文基于 arXiv 官方摘要和元数据筛选。下文“发布日期”均指进入 2026-08-10 官方列表的日期。

## 今日脉络

第一条脉络是 **可靠性研究从最终补丁转向运行中的状态与证据**。LivePlan 不再让另一个 LLM 周期性猜测“是否该重规划”，而用确定性信号触发稀疏纠偏；PMCoder 把计划阶段和 episodic memory 双向连接，并优先相信 issue reproduction 的执行结果；AgentChaos 则直接在 OpenAI-compatible API 层注入 crash、omission 与 value fault。成功率仍重要，但它只是轨迹诊断的最后一列。

第二条脉络是 **软件变更的训练和评估 oracle 正在变得可执行**。CyberForge 要求注入后的项目仍通过原测试，且 PoV 只在漏洞版本触发；WebGrader 把网站需求编译成真实浏览器里的 Flow Contract；生产 C++ 研究则追踪 352 万次变更，把 AI 代码与 review、静态问题和部署计算成本连接起来。它们都比“judge 说看起来正确”更接近真实工程证据。

第三条脉络是 **post-training 的主要分歧不再只是选 PPO、GRPO 还是 distillation，而是状态和信用的粒度**。DiDPO 在一个 coding action 内按 sub-diff 建组，FACTOR 先给 action 分信用再分到 token，TRIAL 用 hindsight-conditioned likelihood gap 在同一轨迹内重分 turn 权重，MemOPD 则指出 teacher 若在错误的压缩后上下文打分，所谓 on-policy supervision 甚至不在学生实际访问的状态上。

第四条脉络是 **安全边界跨越了单轮 prompt**。StepJack 把恶意目标拆成沿网页链分布的无害小步骤，HarnessSafe 则把 memory、skill、tool/MCP 与共享 artifact 视为跨任务持久载体。今天的安全结论很直接：agent harness 的状态生命周期本身就是攻击面，不能只在当前对话里做字符串过滤。

## 强相关论文深读

### 1. CyberForge：仓库级安全训练数据必须同时有 build、测试和差分 PoV

**论文信息**：*CyberForge: Verified Vulnerability Injection at Repository Level for Cybersecurity Agent Training*；Amine Lbath、Manan Suri、Aurelien Delaitre 等；[arXiv:2608.06471](https://arxiv.org/abs/2608.06471)；cs.CR / cs.AI / cs.SE；发布于 2026-08-10。

**一句话 TL;DR**：CyberForge 在真实 C/C++ 仓库中自动注入漏洞，并用“原测试仍通过 + PoV 仅在漏洞版触发”的差分 oracle 验证 1,034 个实例，再用执行轨迹微调安全修复 agent。

**为什么值得推荐**：安全修复训练数据最危险的失败不是数量少，而是漏洞注入破坏了项目、PoV 本身无效，或者补丁只修 benchmark artifact。CyberForge 把数据生成、仓库构建、攻击触发和训练收益连成闭环，回答了合成漏洞能否同时“像真实变更”和“可执行验证”。这使它既是 coding-agent 训练论文，也是数据正确性论文。

**方法怎么工作**：Figure 1 有两条互补管线。第一步从 OSS-Fuzz 的真实项目和可达入口选择注入位置，生成漏洞版/修复版候选；第二步运行项目测试并执行 differential PoV，只有 clean 不触发、injected 触发且两版均保持预期 build/test 行为的实例才进入语料；第三步由 teacher agent 在这些仓库任务上采集修复轨迹，再对不同规模 student 做 fine-tuning，并用 SEC-bench 与跨语言 PatchEval 检查迁移。Table 3 的 workflow ablation 还显示，生成候选不难，最难的是让候选通过差分 oracle。

**关键实验与证据**：最终语料覆盖 80 个项目、63 类 weakness、1,034 个验证实例。六种“3 个 student 尺寸 × 2 个 teacher”配置在 SEC-bench 上全部提升，增益为 3.3 到 14.7 个百分点；31B student 达到 72.7%，接近 GPT-5.4-mini teacher 的 74.0%。在包含其他编程语言的 PatchEval 上，每个配置也都提升，31B student 甚至超过 teacher，说明收益不只来自记住 C/C++ 注入模板。

**局限和可信度**：数据仍以 OSS-Fuzz 可构建的 C/C++ 项目为主，PoV 可触达性会偏向已有 fuzz harness 能覆盖的漏洞；“测试通过”不等于无非预期行为，注入分布也未必复现真实攻击者的长期演化路径。另一方面，差分触发、项目测试、跨基准外推和规模曲线构成了相当扎实的证据链。最值得复现的不是具体模型分数，而是实例必须经过可执行差分验证这一数据门槛。

**与当天主题的关系**：它把训练数据的 correctness 从静态标签提升为仓库级执行属性，并与 post-training 的数据质量主线直接相交。

### 2. WebGrader：网站 RL 的奖励必须等到关键状态真的发生

**论文信息**：*WebGrader: Training LLMs for Web Development with Self-Evolving Programmatic Grader*；Boshui Chen、Huiping Liu、Shaolei Zhang；[arXiv:2608.06474](https://arxiv.org/abs/2608.06474)；cs.AI；发布于 2026-08-10。

**一句话 TL;DR**：WebGrader 把开放式网站需求转换成浏览器可执行 Flow Contract，用 DOM、视觉、网络响应和持久状态的联合证据产生 RL reward，并离线演化可复用 verifier skill。

**为什么值得推荐**：网页生成很容易出现“首屏像、交互假”的静默错误。VLM grader 可能在点击前就给分，手写 Playwright 脚本又无法覆盖大量开放需求。本文真正的新意不是再加一个 judge，而是把 test planning、action grounding、evidence collection 与 semantic judgment 分离，并规定只有观察到请求中的状态转移后才能 Pass。

**方法怎么工作**：Figure 2 展示三阶段管线。首先从需求生成 interaction flow，并把前置状态、动作、观测和终态写成 Flow Contract；其次在真实构建的网站中结合源码和 live DOM 落地动作，同时采集 screenshot、DOM、response 与 storage 等证据；最后用 clean/fault 页面形成可执行监督，按残差定位失败来源，产生 verifier skill 变体，在互斥验证页筛选后加入 SkillGraph。技能图在 policy training 前冻结，避免 grader 与 policy 同时漂移。

**关键实验与证据**：在 WebGen-Bench 上，训练得到的 8B policy 功能成功率为 52.01%，比匹配的“外观 + 脚本”奖励高 7.88 点，并超过 o4-mini 与 DeepSeek-v4-flash。WG-core-250 上 Full Score 为 44.953，超过 Qwen3-Coder-480B。Table 4 的 design validation 从 66.80% 提升到 82.00%，而 Table 5/6 显示主要增益来自功能证据，不只是视觉评分变宽松。

**局限和可信度**：Flow Contract 和 skill mutation 仍由模型生成，错误只是在独立验证和冻结阶段被压低，并未消失；WebGen 任务与真实网站的认证、第三方 API、异步队列和长期数据一致性仍有差距。论文的 controlled clean/fault pairs、冻结 grader 和多模态执行证据提高了可信度，但自演化 verifier 是否会在更开放域中形成系统性盲点，需要跨站点人工审计。

**与当天主题的关系**：它说明可验证奖励的关键不是“自动打分”，而是把 reward 锚定到真实交互后的可观察状态。

### 3. 生产 C++ 质量：AI 代码的成本会在 review 与部署后才显现

**论文信息**：*Characterizing the Quality Profile of AI-Generated C++ in Production*；Michael Tran、Fred Lewis、Kun Yang 等；[arXiv:2608.06640](https://arxiv.org/abs/2608.06640)；cs.SE / cs.AI；发布于 2026-08-10。

**一句话 TL;DR**：对一家超大规模企业一年内 352 万次生产 C++ 变更的追踪显示，AI 生成代码具有可辨认的接口、耦合、拷贝与分配问题，并对应更高 review 成本和 5% 到 8% 的计算资源增长。

**为什么值得推荐**：大多数 coding benchmark 在 patch 提交时停止，但生产质量问题常在 code review、性能回归或部署资源账单中才出现。本文利用行级 provenance，把“谁生成了代码”与 submitted change、静态问题、review、可靠性和计算成本连接起来。它提供了罕见的 brownfield 证据，也提醒读者不要把离线 pass rate 当作工程净收益。

**方法怎么工作**：Figure 1 把研究分成四个 RQ。第一步记录 2025 年 4 月到 2026 年 4 月的 AI provenance，并聚合到实际提交变更；第二步以变化规模、函数结构和预先定义的 C++ 静态问题 taxonomy 对 AI 与人类代码做匹配比较；第三步把上游模式连接到 review effort、可靠性和部署 compute；第四步开展 taxonomy-informed feedback intervention，比较反馈前后的目标警告与效率变化。Figure 2 说明干预数据与主观察数据分开生成。

**关键实验与证据**：样本包含 352 万次代码变更。AI 代码更常出现接口/耦合负担、额外 copy/allocation，以及显式 loop 取代优化标准 API；这些模式对应更高 review effort，并与 5% 到 8% 的计算资源增加相关。给模型加入针对 taxonomy 的反馈后，目标静态警告下降 11.1%，计算效率也改善，说明部分问题可以通过反馈闭环缓解。

**局限和可信度**：研究来自单一大型企业且只覆盖 C++，组织工具链、模型使用规范和任务分配会影响结果；provenance 能观测生成来源，却无法完全消除“开发者把更难任务交给 AI”的选择偏差。部署 compute 与代码模式之间主要是观察关联，不宜解读为单一因果效应。优势是规模大、真实上线、跨生命周期观测；局限是外部复现几乎不可能，读者应把具体比例视为该组织条件下的估计。

**与当天主题的关系**：它把 agent 质量验证从“补丁是否过测”延伸到生产维护成本，是当天最重要的现实世界证据之一。

### 4. LivePlan：确定性监控先发现漂移，LLM 只在需要时纠偏

**论文信息**：*Online Monitoring and Corrective Steering of Programming Agents*；Shuyang Liu、Saman Dehghan、Ji Young Kim 等；[arXiv:2608.06701](https://arxiv.org/abs/2608.06701)；cs.SE / cs.AI / cs.CL / cs.LG；发布于 2026-08-10。

**一句话 TL;DR**：LivePlan 用规则监控器在线识别 programming agent 的重复动作、震荡、停滞与计划违背，只在触发时请求 advisor LLM 给出下一步纠偏，平均提升 9.9% resolution。

**为什么值得推荐**：让另一个 LLM 每隔几步“审查轨迹”听起来稳妥，实际上会产生错误重规划，并破坏本来能成功的 rollout。LivePlan 把 judging 与 advising 拆开：前者由可复核的轨迹信号完成，后者才使用语言模型。这个设计比泛化的 self-reflection 更容易审计，也更符合线上系统对成本和误干预的约束。

**方法怎么工作**：Figure 3 的流程有三步。Graphectory 从动作图识别 repeated action、oscillation 与 long stagnation，LanguTory 从阶段标签识别 plan violation；监控器根据 blocking/non-blocking drift 决定是否触发；Advisor 只接收压缩后的局部证据，输出高层 next-step correction，系统还用 cooling 机制避免重复建议。Table I 把触发条件写成确定性规则，模型不负责声明自己是否“卡住”。

**关键实验与证据**：作者在 SWE-agent 上用 3 个 executor 与 2 个 advisor，共覆盖 SWE-bench Verified 和 SWE-bench Pro。相对 vanilla SWE-agent，resolution 最高提升 15.2%，平均提升 9.9%，新增成功主要集中在 medium/hard 实例；额外成本仅约每题 0.08 美元。与周期性 advisor 和其他重规划方法相比，它既获得更多新解，也较少让原本成功的轨迹退化。

**局限和可信度**：规则只能捕获已定义的行为漂移，无法识别“动作看似顺畅但假设本身错误”；阈值与 SWE-agent 的 phase/action 表达耦合，迁移到其他 harness 需要重新标定。论文在两个 SWE-bench 版本、多 executor/advisor 上做了对照，可信度不错，但还未测长时间真实仓库、并发 CI 与不可逆外部操作。0.08 美元也不是完整 wall-clock 与算力成本。

**与当天主题的关系**：它把在线可靠性控制写成“可确定检测的信号 + 稀疏模型干预”，与 AgentChaos 的可观测故障和 PMCoder 的执行证据形成互补。

### 5. PMCoder：计划与记忆必须双向耦合，验证不能来自 agent 自述

**论文信息**：*Coupling Planning with Episodic Memory in LLM Agents for Software Issue Resolution*；Jiahao Zhang、Yifan Zhang、Yu Huang；[arXiv:2608.06811](https://arxiv.org/abs/2608.06811)；cs.SE / cs.AI；发布于 2026-08-10。

**一句话 TL;DR**：PMCoder 让当前 repair phase 决定检索什么记忆，又让记忆中的失败统计触发 stuck detection 与 replanning，并用可用的 issue reproduction verdict 锚定验证。

**为什么值得推荐**：repository repair 的长轨迹中，计划和记忆分开优化会产生两个典型问题：计划继续沿用过时假设，记忆则把不相干的旧观察塞回上下文。PMCoder 的价值在于明确做双向连接，并承认 `exit 0`、agent 自写测试或“我已完成”都不是可靠 oracle。Figure 1 的 Django 案例显示，两个 agent 得到同一正确诊断，差别在于能否在后续阶段保留并重新调用它。

**方法怎么工作**：第一步用有限状态的 hierarchical planner 在 exploration、hypothesis、implementation、verification 等 phase 间推进；第二步把观察、动作、结果与 phase 写入 episodic memory，检索由当前 phase 条件化；第三步从重复失败、空 patch、上下文消耗等统计检测 stuck 并触发 replanning；若提供 issue reproduction script，则验证进度必须以其执行结果为准，而不是模型的自然语言声明。

**关键实验与证据**：在 SWE-bench Verified 上，PMCoder 比 harness-matched baseline 平均多解决 25 题，即 +5.0 个百分点。Verified-500 的额外实验覆盖 Claude Haiku 4.5、DeepSeek-V4-Flash 与 OpenHands port，至少多解 14 题（+2.8 点）；TerminalWorld 官方 sample 也显示同方向迁移。消融表明 plan-memory coupling 优于只加 planning 或只加 memory，并减少重复失败动作、空 patch 退出和 context-window exhaustion。

**局限和可信度**：issue reproduction gate 并非所有任务都有，且脚本本身可能不完整；SWE-bench 的 withheld grader 仍只判断最终 patch，不能覆盖维护成本和非目标回归。规划 phase 是人工设计的，记忆统计在不同 harness 上未必稳定。多模型、多实现端口和组件消融支持核心判断，但 TerminalWorld 只用官方 sample，不能据此宣称广泛跨域泛化。

**与当天主题的关系**：它说明长轨迹可靠性不仅需要更大上下文，还需要状态化记忆、可执行验证与明确的恢复触发条件。

### 6. AgentChaos：agent harness 也需要真实运行时的故障注入

**论文信息**：*AgentChaos: Chaos Engineering for Agent Systems via Programmatic Fault Injection*；Gou Tan、Zhensu Sun、Jieke Shi 等；[arXiv:2608.06790](https://arxiv.org/abs/2608.06790)；cs.SE；发布于 2026-08-10。

**一句话 TL;DR**：AgentChaos 在共享 LLM API 层非侵入式注入 crash、omission 和 value fault，并用 trigger verification 只统计实际触发的故障，发现 pass@1 最多下降 50 个百分点。

**为什么值得推荐**：agent 系统的基础设施故障常被 benchmark 当成噪声，但截断的 tool call、空 content、服务器错误或字段腐坏都可能沿多 agent 管线传播。离线改 trace 无法触发真实恢复逻辑，直接改源码又难以公平比较系统。本文借 OpenAI-compatible HTTP 接口这个共同边界，把 chaos engineering 引入 agent evaluation。

**方法怎么工作**：Table 1 先定义针对 content 与 tool-call 字段的 fault taxonomy，包括 error、timeout、truncate、omit 与 corrupt；Figure 3/4 的 wrapper 拦截真实 API response，按目标 call、字段、持续次数和复合场景注入；trigger verifier 随后确认故障确实命中预期位置，未触发任务从分母中剔除；最后对正常与故障运行比较 pass@1，并让现有诊断器定位 fault type 和 fault step。

**关键实验与证据**：作者跨多种 agent system、benchmark 和 backbone 测了 65 个 fault configuration，所有系统均退化，最严重是 MapCoder 在 HumanEval+ 上下降 50 个百分点。系统鲁棒性排序在不同模型下相对稳定，提示实现层恢复逻辑比单纯换大模型更关键。现有诊断方法对 fault type 的准确率低于 53%，对 fault step 低于 56%，说明“能发现失败”与“能定位基础设施根因”仍有明显差距。

**局限和可信度**：方法只覆盖经过 LLM API 边界的故障，文件系统、网络工具、浏览器、并发 race 与外部服务语义错误尚未纳入；trigger filtering 能避免低估影响，但也会改变有效样本分布。65 种配置提供了较系统的压力面，运行时注入也比离线扰动更可信，不过 pass@1 下降不能自动区分恢复策略缺失、任务本身脆弱和模型输出冗余不足。

**与当天主题的关系**：它把可靠性评估从任务正确性扩展到依赖故障，是 harness-level 审计的重要补充。

### 7. StepJack：无害的小步骤可以在长导航链上组合成攻击

**论文信息**：*StepJack: Benchmarking Computer-Use Agent Safety Against Multi-Step Indirect Prompt Injection*；Zhuoxin Zhan、Akbar Rafiey、Avery Ma 等；[arXiv:2608.06477](https://arxiv.org/abs/2608.06477)；cs.CR / cs.AI / cs.CL；发布于 2026-08-10。

**一句话 TL;DR**：StepJack 把一个恶意目标拆成分布在多个网页上的无害子步骤，使 computer-use agent 在沿引用链完成 benign task 时自行组合出攻击链。

**为什么值得推荐**：单页 prompt injection 防御通常检查某条指令是否明显越权，但组合攻击让每一步都保持局部合理，危险只在跨页序列中出现。这与长时 coding/tool agent 的风险高度一致：局部 action 合规不代表全局目标安全。论文不仅提出攻击概念，还构建自动分解、faithfulness 验证和可执行 benchmark。

**方法怎么工作**：Figure 2 展示 wrapping：先由 decomposition LLM 将攻击目标拆成 2 到 3 个子目标，并为每步生成 plausible cover story；再用 faithfulness judge 确认组合执行仍达到原恶意目标，同时筛掉显眼有害的单步；最后把子步骤分散到 Reddit/OwnCloud 等页面链，要求 CUA 在正常任务中逐页导航。评估同时记录整体 ASR、逐步 compliance 和 benign task completion，Table 3/4 还分离资源、平台与两类防御影响。

**关键实验与证据**：数据集包含 480 个可执行样例、6 个 CUA。在固定分解深度下，3/6 系统的 ASR 上升，最高增加 31.2 点；GPT-5.4-mini 从单步 41.7% 升到三步 72.9%。排除无法可靠跟随引用链的 EvoCUA-32B 后，五个系统平均 ASR 从 31.3% 升到 36.9%。结果不是所有模型单调上升，逐步 compliance 暴露了有些 agent 会在后段因能力不足而中断攻击。

**局限和可信度**：攻击链长度只到三步，平台和动作仍较受控；自动 judge 可能遗漏语义泄露或高估 innocuousness，且不同 CUA 的导航能力会与安全性混淆。论文主动报告 per-step compliance、benign completion 与失败位置，避免把“不会操作网页”误写成“更安全”，这是可信度亮点。更长任务、持久 memory 与开发工具链仍需另测。

**与当天主题的关系**：它把安全判断从单条内容提升到跨状态组合，与 HarnessSafe 的持久载体生命周期共同指出 harness 必须维护全局 provenance。

### 8. HarnessSafe：memory、skill 与工具配置都是延迟触发的安全载体

**论文信息**：*HarnessSafe: Evaluating Safety Across Persistent Carriers in Agent Harnesses*；Xiao Zhang、Yusheng Wang、Yuhao Fei 等；[arXiv:2608.06984](https://arxiv.org/abs/2608.06984)；cs.CR / cs.AI；发布于 2026-08-10。

**一句话 TL;DR**：HarnessSafe 用 328 个可执行案例追踪攻击内容如何进入 memory、skill、tool/MCP 或共享 artifact，跨任务持久化，并在后续 benign request 中触发违规。

**为什么值得推荐**：传统 attack success rate 只告诉我们最后是否出事，却看不到攻击被写入了哪里、在哪个边界被阻断。对于会自建 skill、保存 memory 和共享 artifact 的 coding agent，这种中间状态尤其重要。HarnessSafe 把攻击写成 Persistent-Risk Lifecycle，使安全评估从一个二元结果变成可定位的阶段进度。

**方法怎么工作**：第一步定义七类 persistent carrier，并把每个案例写成 entry、persistence、cross-boundary transfer、benign trigger 与 observable violation 的链；第二步通过 harness-native 事件和执行证据判断案例是否 eligible，未真正激活相应载体的运行不强行计分；第三步把每条轨迹映射到最远到达阶段，而非只报最终 ASR；最后固定 harness 或 backend 做交叉实验，分离模型与编排层对 containment 的贡献。

**关键实验与证据**：benchmark 共 328 个 executable cases，覆盖 memory、reusable skills、Tool/MCP 和 shared artifact 等七类载体，并评估多种主流 harness。实验表明 containment 高度 carrier-specific，同一模型换 harness、同一 harness 换 backend 都会显著改变链条能走多远；单一 ASR 会把“入口即阻断”和“已跨多个边界但最后失败”混为一谈。论文的主要贡献因此不是某个总分，而是可观察的 lifecycle 分解。

**局限和可信度**：不同 harness 对载体的原生语义并不一致，部分组合因功能缺失而只能在少于 328 个案例上评估；案例是设计性攻击，不代表真实发生频率。阶段映射依赖事件规范化与 case-specific oracle，仍需人工审计。优势是它明确区分 eligible、progress 与 violation，避免功能缺失被误判为安全，也为修复提供了具体阻断位置。

**与当天主题的关系**：它把 agent 安全从当前 prompt 扩展到跨会话状态管理，是长期运行 coding agent 不可缺少的审计视角。

### 9. DiDPO：coding action 的信用单位应该是 sub-diff，而不是整轮回复

**论文信息**：*DiDPO: Diff-in-Diff Policy Optimization for Coding Agent Training*；Xucong Wang、Zhe Zhao、Liheng Yu 等；[arXiv:2608.07147](https://arxiv.org/abs/2608.07147)；cs.AI；发布于 2026-08-10。

**一句话 TL;DR**：DiDPO 从多条 coding rollout 中对齐相似 sub-diff，形成局部 advantage group，再把 diff 级信用投影回生成这些变更的 response token。

**为什么值得推荐**：一个 coding action 往往同时修改 import、脚手架、核心逻辑和测试，终局 reward 无法说明哪个局部变化有效。按整步分 credit 仍会把不同区域捆在一起。DiDPO 把代码差异本身作为训练结构，让可验证执行反馈更接近实际变更单元，是今天两条主线最自然的交叉点。

**方法怎么工作**：Figure 1/2 先把多轮 thought-action 轨迹映射为版本间 diff；Figure 3 的 Groupability Score 在语义范围与可形成的组规模间折中，把 whole diff 切成可比较 sub-diff；相似 anchor 只在相同 edit type 内对齐并形成 advantage group，避免一个片段重复索取信用；最后将 diff advantage 投影到对应 response token，同时保留 trajectory-level advantage 监督整体行为。

**关键实验与证据**：作者在标准代码生成、长时 coding agent 与竞赛算法任务上比较 GRPO 等基线。Table 1 中 DiDPO 相对 GRPO 平均提升 5.6 点；在多步跨度更大的设置中增益达到 10.4 点。Qwen2.5-7B-Coder 上整体超过可比方法 10% 以上，并缩小与更大模型的差距。Table 3 消融显示，移除 trajectory advantage 或 sub-diff grouping 都明显退化；训练只收集约 3K 条高质量轨迹。

**局限和可信度**：sub-diff 相似不等于因果等价，跨文件依赖和多个编辑协同可能被错误拆开；groupability 与 token projection 依赖 diff parser 和启发式对齐。实验包含多类 coding/reasoning benchmark 和结构消融，但尚未充分报告真实仓库 build 成本、失败测试类型与 patch regression。它证明了局部信用有用，尚未证明当前切分就是最优原子变更。

**与当天主题的关系**：DiDPO 直接回答“代码修改中的信用落在哪里”，把执行 reward、软件变更结构与 token 更新连接起来。

### 10. Simple-OPD：warm-up 主要传递思考模式，不只是正确答案

**论文信息**：*Simple-OPD: Demystifying Warm-up for On-policy Distillation*；Tao Liu、Taiqiang Wu、Mao Zheng 等；[arXiv:2608.06802](https://arxiv.org/abs/2608.06802)；cs.CL；发布于 2026-08-10。

**一句话 TL;DR**：Simple-OPD 发现 OPD warm-up 的关键是 teacher-compatible CoT 与合适的 LoRA 时长，甚至错误 teacher rollout 也能带来接近正确 rollout 的初始化收益。

**为什么值得推荐**：很多 on-policy distillation 工作把 warm-up 当作工程细节，但它可能决定学生是否进入 teacher 能有效提供 token supervision 的行为区域。本文把数据和优化两部分分开检查，得到一个反直觉结论：warm-up 更像在迁移可兼容的推理形态，而不只是灌输正确答案。

**方法怎么工作**：第一步比较 teacher-generated CoT、仅 final answer、学生自生成及正确/错误 rollout，测 warm-up 后的 student-teacher overlap；第二步比较 full-parameter SFT 与 LoRA，并沿训练时长观察 ID 适应和 OOD 泛化；第三步形成 Simple-OPD recipe：用 teacher CoT 做接近饱和但不过度的 LoRA warm-up，再让 student 在自己的 rollout 上接受 teacher token-level supervision。Figure 7/8 分别展示 OOD 权衡与后续 OPD dynamics。

**关键实验与证据**：多个 student/teacher、任务和 ID/OOD 组合中，teacher-compatible CoT 稳定优于只给答案；错误 teacher rollout 的收益可接近正确 rollout，支持“迁移思考模式”解释。LoRA 在接近饱和的训练阶段比 full SFT 更好地平衡 ID 与 OOD。论文报告 Simple-OPD 在多种设置下提高最终 OPD 表现并加速收敛，而单看 warm-up checkpoint 的高分并不能预测 OPD 终点。

**局限和可信度**：错误 rollout 有用不代表内容正确性不重要，它可能只在所选推理任务、teacher/student 家族和后续 OPD 能纠错时成立。CoT 的“兼容性”主要由行为与似然现象间接推断，缺少因果表征分析；LoRA 时长仍需每类模型标定。论文诚实把限制写出，但摘要没有给统一主指标，阅读时应重视逐设置结果而非一个总分。

**与当天主题的关系**：它提醒 post-training 研究不要只看主阶段算法，初始化数据如何改变可学习状态同样决定最终行为。

### 11. MemOPD：on-policy 轨迹若在错误 memory state 打分，监督仍然失真

**论文信息**：*MemOPD: On-Policy Distillation through Memory State Alignment for Long-Horizon Agents*；Zhiyuan Liu、Tinghong Ye、Chenghao Liu 等；[arXiv:2608.07068](https://arxiv.org/abs/2608.07068)；cs.AI；发布于 2026-08-10。

**一句话 TL;DR**：MemOPD 保存每次模型调用的真实输入、输出、token 位置和 causal visibility，在 teacher scoring 时重建原调用状态，避免 compact memory 把 on-policy action 放进学生从未访问过的上下文。

**为什么值得推荐**：长时 agent 会不断压缩和重写上下文。同一 action 虽然来自学生 rollout，但若事后把轨迹 flatten 成 persistent history 交给 teacher，它的前缀、位置和可见信息都可能改变。本文把“on-policy by provenance”和“on-policy by state”明确区分，是一个非常具体、容易被实现忽略的训练正确性问题。

**方法怎么工作**：Figure 2 的管线首先记录每次 invocation 的完整输入和 sampled output；随后恢复原 token 位置与 causal mask，把只用于 context 的复制内容和真正 sampled action 分开；多个独立调用共享 task prefix 打包，提升 teacher scoring 效率；teacher 只在真实 action position 给 full-vocabulary supervision，PPO 则继续优化终局任务 reward。Table 3/4 用 log-probability 误差与 false clipping 检查重建是否忠实。

**关键实验与证据**：在多跳检索的 Q2/Q8/Q16 和 Wiki-RAG 上，MemOPD-3B 在各 horizon 的 EM/F1 都优于 PPO。相对 PPO，F1 最高提升 416.2%；在匹配的 Q2 对照中，persistent-history scoring 已提升 5.6% F1，而正确 state reconstruction 再多 7.0%，EM 也额外提升 10.0%。packing 让 actor computation 最快加速 1.63 倍，并在多种 context update 下保持低 log-probability 误差。

**局限和可信度**：任务以检索和 memory compression 为主，416.2% 是相对提升，基线绝对值和小分母需要结合表格理解；精确重建要求 harness 记录 tokenization、位置和 causal visibility，闭源 API 很难满足。实验对机制做了直接 log-probability 校验，因而“状态错位存在”很可信，但它是否同样主导网页、代码与多模态 agent 的训练收益仍待验证。

**与当天主题的关系**：它把 post-training 的可靠性追溯到 teacher 打分时的真实状态，与 coding agent 的 checkpoint、memory 和 audit 问题高度同构。

### 12. FACTOR：先决定每个动作值多少，再决定动作里的哪些 token 负责

**论文信息**：*How Much, Then Where: Credit-Conserving Action-to-Token Allocation for Multi-Turn Agent Reinforcement Learning*；Lichao Ma、Yang Sun、Shuaitao Zhao 等；[arXiv:2608.07118](https://arxiv.org/abs/2608.07118)；cs.AI；发布于 2026-08-10。

**一句话 TL;DR**：FACTOR 用 checkpoint-calibrated TD residual 给 action 分信用，再用 feedback-conditioned teacher-student likelihood gap 在 action 内分配 token 权重，同时保持每个 action 的平均信用不变。

**为什么值得推荐**：许多细粒度 RL 方法在重分 token 权重时，顺便改变了整个 action 的总信用，甚至让长回复获得更大隐式权重。这样无法判断增益来自更好的 action credit，还是 token 数和 teacher confidence 的副作用。FACTOR 的关键贡献是 credit conservation：把“多少”和“分给哪里”变成两个可单独验证的问题。

**方法怎么工作**：Figure 2 的 TAC-HTA-APM 三段式流程先从恢复的 checkpoint 做短 continuation，用 TD residual 产生会 telescoping 到 trajectory advantage 的 action credit；再比较 action 在普通上下文与带 post-action feedback 上下文中的 teacher-student likelihood gap，定位更该承担信用的 token；最后做 action 内 mean-one normalization，并用 action-mean reduction 消除 token length 对 surrogate weight 的影响。

**关键实验与证据**：在 ALFWorld、WebShop、ScienceWorld 的每个 environment-seed 比较中，FACTOR 都优于对照，最长 horizon 的 ScienceWorld 增益最大。方法同一组超参数直接迁移到 Qwen2.5-14B 和 Llama-3.1-8B，增益分别约为 0.8/0.9/2.7 点与 2.1/1.9/2.9 点。消融显示去掉 TD action credit 的损失最大，hindsight token allocation 提供额外但较小的互补增益。

**局限和可信度**：checkpoint continuation 使环境交互达到 SERL 的约 3.5 倍、wall-clock 约 1.25 倍，训练成本不是免费；TD credit 依赖有限 rollout graph，稀有状态估计仍会噪声较大，恢复后 continuation 与原策略后续分布的偏离也可能给 credit 引入系统误差。三环境、多 seed、跨模型与保持信用的数学性质构成较完整证据，但尚未验证代码 diff、浏览器 DOM 或多模态动作中的 token responsibility 是否仍可稳定解释。

**与当天主题的关系**：它是当天“信用分配必须守恒且可审计”这一 post-training 主线中最完整的方法论表达。

### 13. TRIAL：hindsight 不该平均撒给每一轮，而应在轨迹内部相对分配

**论文信息**：*Trajectory-Relative Hindsight Distillation for Agentic Reinforcement Learning*；Haoyu Zheng、Yun Zhu、Qing Wang、Wenqiao Zhang；[arXiv:2608.07371](https://arxiv.org/abs/2608.07371)；cs.LG / cs.CL；发布于 2026-08-10。

**一句话 TL;DR**：TRIAL 对每个决策轮构造 outcome view，以普通和 hindsight-conditioned 上下文的 signed log-probability gap 决定 token 更新方向，再在整条轨迹中归一化各轮强度。

**为什么值得推荐**：完成一条 rollout 后可以生成许多 hindsight 信号，但不同 turn 对终局的贡献差异很大。直接把 dense supervision 平铺到每轮，会让无关动作与关键决策获得相近更新。TRIAL 同时保留跨 rollout 的 GRPO advantage 和轨迹内的相对 turn profile，因而没有把 hindsight 变成第二个不受约束的 reward。

**方法怎么工作**：Figure 2 先复用 GRPO 的 rollout group 与 outcome objective；对每个 turn 提取其动作后果，分别在原上下文和 outcome-augmented context 计算同一 response 的似然差，符号决定提升或抑制；再按整条 realized trajectory 聚合绝对 gap，生成 turn allocation multiplier；eligible-token-weighted mean 固定为 1，dense objective 只重分位置而不改变平均尺度。部署时仍使用普通 policy，无额外推理输入。

**关键实验与证据**：TRIAL 在 WebShop、ALFWorld、两个 backbone、success/score 两项指标组成的 8 个组合中全部超过 GRPO，并在六种方法比较的 6/8 组合中最佳或并列最佳。Qwen3-1.7B 在 WebShop 上 success 从 56.4% 升至 75.2%，task score 从 78.7% 升至 85.7%。消融显示，轨迹相对 turn allocation 的收益超过只做 dense hindsight distillation。

**局限和可信度**：outcome view 由已实现后果构造，可能把偶然环境反馈当成因果证据；两类环境仍偏短、可模拟，尚未覆盖真实代码仓库和不可逆工具调用。没有额外推理成本是优点，但训练要多次 teacher scoring。结果覆盖多个 backbone 与指标，方向一致；仍需报告更多 seed、训练成本和不同 hindsight 生成器的敏感性。

**与当天主题的关系**：它把“哪一轮值得学习”写成轨迹内部的相对量，与 FACTOR 的 action/token 分层和 DiDPO 的 diff 分组形成连续尺度。

### 14. Fisher-R1：代码执行正确不代表统计结论有效

**论文信息**：*Fisher-R1: Training LLM Agents for Reliable Hypothesis Testing*；Jiacheng Miao、Jin Mu、Guanhua Chen、James Zou；[arXiv:2608.07437](https://arxiv.org/abs/2608.07437)；cs.AI；发布于 2026-08-10。

**一句话 TL;DR**：Fisher-R1 用 425 个带隐藏统计 answer key 的开放假设检验任务和可验证统计 reward 训练 14B agent，专门纠正“代码跑通但检验选择错误”的静默失败。

**为什么值得推荐**：科学 agent 很容易生成可执行 Python 和一个 p-value，却因为分布、独立性、异常值或重复测量假设不满足而得出错误结论。P-Bench 不只检查数字格式，而是检查选择的检验、p-value 与结论是否共同正确。这把 verifier 从程序执行提升到领域推断有效性，是实际 agent 可靠性的关键边界。

**方法怎么工作**：Figure 2 中每题只给科学假设和 CSV，agent 要自行选择方法、计算并下结论；作者从经济、生命科学和医学来源构建任务，用确定性程序生成隐藏的 `(p, decision)` answer key，并经专家与自动检查验证；Figure 4 的训练先收集专家轨迹做 SFT，再在合成任务上用可验证 statistical reward 做 RL，P-Bench 全部留作 OOD 测试。425 题按元数据规则分为 203 easy 与 222 hard，覆盖 17 类检验。

**关键实验与证据**：Fisher-R1-14B 在 P-Bench 上显著超过 backbone，并胜过 GPT-5.4、DeepSeek-V4-Pro 等闭源和开源基线。相对 DeepSeek-V4-Pro，单次成功率平均提高 21%，hard task 最高提高 26%。每题运行三次，同时报告 pass@1 和 pass@3；论文案例显示 frontier agent 能识别异常值，却仍可能坚持不合适的参数检验，而 rank-based test 才给出正确结论。

**局限和可信度**：P-Bench 仍使用结构化 CSV 与预先可计算的唯一检验目标，真实科研中的模型设定、缺失数据、探索性分析和多重假设更开放；合成 RL 任务与 benchmark 的方法族可能共享归纳偏置。专家验证、可执行 key 和完全留出的 P-Bench 提升可信度，但“超过闭源模型”受具体 prompting、工具和模型版本影响。临床或政策结论仍需人类统计审查。

**与当天主题的关系**：它强调 verifier 必须检查领域假设而非只检查代码是否执行，是“静默正确外观”风险的代表论文。

## 中相关论文速读

### Coding agent、软件变更与验证

**[Agolic：Agentic Planning for Symbolic Execution](https://arxiv.org/abs/2608.06397)** 不让 LLM 取代 symbolic executor，而是根据源码、已覆盖分支和前几次 targeting 证据安排下一轮 bounded symbolic execution。7 个 C/C++ 程序上平均覆盖分支超过连续 symbolic execution 的 3 倍，并在 6/7 程序找到所有比较 corpus 都没有的分支。它值得保留，因为 agent 负责跨运行资源配置、传统工具负责状态探索，边界清楚；但程序数量很少，离真实仓库和复杂 build 仍远，所以不列强读。

**[TRACE：Toward Reliable Context Compression for Long-Horizon Agents](https://arxiv.org/abs/2608.06503)** 通过在同一环境状态分叉 paired continuation，逐次评估 compression event 是否削弱近期交互影响，并用 verifier preference 优化自然语言压缩 prompt。AppWorld 初步结果显示 task performance、跨运行稳定性与 context-execution efficiency 改善。核心判断很重要：summary 的质量应在闭环后果中测，而不是做文本相似度；但论文自称 preliminary，任务与统计规模不足以支撑强结论。

**[软件重构的能耗影响](https://arxiv.org/abs/2608.06620)** 同时研究 68 类受控 refactoring 和 430 个 GitHub 项目的 481 次真实 commit。微基准 384 个 refactoring-workload 组合中 51.8% 有显著能耗差异，45.3% 会随 workload 改变影响类别；真实提交仅 7.5% 显著，但其中三分之二变化至少 10%。它提醒变更验证要覆盖 workload，且现有指标和 LLM 都不能稳定识别能耗回归；与 coding agent 的关系在评估 oracle，而不是 agent 方法本身。

**[PDFuzzer](https://arxiv.org/abs/2608.06641)** 从 JavaScript API 手册和执行 trace 中让 LLM 构建 grammar、推断 API 关系，再由 constraint solver 生成有意义的调用序列。三款 PDF reader 上覆盖率最多高 48%，发现 31 个已协调披露的 zero-day，管线各阶段 LLM 准确率为 93% 到 98%。它展示“LLM 负责语义建模、solver 负责有效生成”的强组合，但主要是专用 fuzzing 系统，不是通用 coding agent，因此放中相关。

**[CyberLLM](https://arxiv.org/abs/2608.06651)** 把 regex/AST/topology 检查、LLM refinement、decision agent、signed memory 与四项运行时安全性质组合成汽车网络防御系统。9 个原创 ECU module 含 47 个分层漏洞；确定性层以零误报覆盖 34%，加入 LLM 后覆盖约 70%、F1 0.83，clean control 仍零误报。可取之处是动作必须通过独立 alignment oracle；但数据集很小且由作者构造，离真实车辆部署的误报率和安全认证还有距离。

**[The Horizon Gap](https://arxiv.org/abs/2608.06663)** 系统整理 long-horizon LLM agent 的 planning、memory、execution、training 与 evaluation 缺口。它适合作为今天论文的索引：单纯扩 context 不能解决状态压缩、错误累积和环境反馈稀疏。推荐速读而不深读，是因为它主要贡献是 taxonomy 与研究议程，缺少新系统和统一实验证据。

**[Translation Tag Team](https://arxiv.org/abs/2608.06705)** 首次给 C macro translation 形式化定义和 MacroBench。规则系统 MerC 正确支持 50% case；LLM 多覆盖 22% 到 77%，但其中 8% 到 28% 翻译错误。先运行 MerC、剩余项交给 LLM 的组合平均失败率比 LLM 低 32%，覆盖又比 MerC 高 51%。这是一条很实在的迁移结论：形式规则先兜底，生成模型只处理规则外长尾，但 benchmark 仍集中于 macro 而非完整 C-to-Rust 工程。

**[How Reasoning Shapes Social Bias in LLM-Generated Code](https://arxiv.org/abs/2608.06829)** 在 9 个模型、三类敏感决策任务上发现 reasoning 把平均代码偏差率从 0.64 降到 0.40，却也让平均质量从 0.72 降到 0.59。ProbeDebias 在 reasoning 阶段检测并重写偏差，检测 F1 87.76%，平均减少 83.73% 代码偏差。论文的重要判断是，biased reasoning 能预测 biased code，不能只在最终程序上做静态筛查；任务是人为构建的社会决策代码，泛化需谨慎。

**[SafeEdit：模型编辑用于安全代码生成](https://arxiv.org/abs/2608.06848)** 比较三种 model editing 与 inference-time CoSec，发现对已见漏洞类型的 security ratio 可比原模型高 15% 到 25%，但 unseen vulnerability 泛化不稳且会损失功能正确性。SafeEdit 用 functional tuning 与 edit-aware regularization 修复权衡，在 8 个模型上相对 UltraEdit 的 Pass@1 提高 11.73 到 15.50 点，并大体保留安全收益。它同时属于 post-training，但目前证据更支持“局部加固有代价”，尚不支持普遍安全迁移。

**[SynChain](https://arxiv.org/abs/2608.06862)** 研究 computer-use agent 如何利用自己生成并持久化的 skill、memory 和 artifact 构造攻击链。它把风险从环境里的单次注入推进到“系统自己沉淀恶意能力”，与 HarnessSafe 的 carrier lifecycle 互补。值得关注的关键词是 self-synthesized attack chain 与 persistent artifact；不列强读，是因为当天更完整的 StepJack 和 HarnessSafe 已分别提供组合攻击与跨载体评估框架。

**[SkillEval](https://arxiv.org/abs/2608.06891)** 不把 agent skill 只看作最终 task score，而拆成可解释质量信号，试图区分技能内容、适用范围、调用与实际贡献。这个方向对会积累 Markdown/JSON skill 的 harness 很重要，因为高分可能来自 backbone 而非 skill。论文适合与 SkillProx 连读；目前它更像评估层设计，尚未形成跨 harness 的稳定标准。

**[Long-Horizon Agent Trajectory Attribution](https://arxiv.org/abs/2608.06909)** 构建细粒度 annotation framework，定位长轨迹中哪些步骤对成功或失败真正有贡献。它与 LivePlan 的在线 drift detection、FACTOR/TRIAL 的训练 credit assignment 处在同一问题链上，但目标是事后归因。推荐保留的判断是：trajectory-level label 无法训练诊断器；不必优先深挖的原因是 annotation 可扩展性与跨环境一致性仍是主要风险。

**[IoT 反编译的可执行性与程序等价](https://arxiv.org/abs/2608.06960)** 在 318 个 OpenWrt 程序、5 种方法生成的 19,625 个反编译结果上，提出结构、行为、语义九维评价。可重编译组的总分效应量 Cohen's d=0.92，行为相似 d=0.96、结构相似 d=0.69。它击中“生成代码可编译但语义已漂移”的静默错误，不过指标仍是质量代理，没有直接证明漏洞语义被完整保留。

**[视觉回归测试究竟发现什么](https://arxiv.org/abs/2608.07020)** 分析 103 个仓库的 307 个 VRT PR，并与 299 个普通视觉 PR 比较。VRT PR 中位解决时间长 3.8 倍、评论多 10 倍、变更规模大 1.75 到 4.5 倍；189 个问题里约 18.5% 来自 state、内容消失或不可见回归等非纯样式原因。它说明 pixel oracle 能发现非局部变更后果，但观察研究无法判断 VRT 导致讨论变多，还是复杂 PR 更爱用 VRT。

**[BinJudge](https://arxiv.org/abs/2608.07038)** 为人类导向二进制逆向构建 expert-annotated reference-free benchmark，LLM judge 与人工的平均相关为 63.20%，传统指标仅 35.04%。动态路由不同 judge 配置后，相关再提升 4.5% 到 24.7%，API 成本降到固定最佳配置的 0.06 到 0.84 倍。它告诉我们 judge 配置不是一刀切，但 63% 级相关仍不足以单独充当高风险逆向结果 oracle。

**[解释引导的 specialized LM metamorphic testing](https://arxiv.org/abs/2608.07076)** 组合 attribution token priority、LLM mutation 与 semantic verification，在 3 个数据集、4 类模型、20 个配置上比启发式变异多发现 2.30 倍经验证的 failure-inducing case。它揭示模型对实体与格式 shortcut 的依赖，适合垂直模型回归测试。中相关原因是研究对象不是 coding agent，但其“语义保持变换 + 人工确认 gate”可作为模型组件测试证据。

**[Assurance Closure in AI-Native Agile](https://arxiv.org/abs/2608.07317)** 试图把 agent 生成、review、测试、治理与组织责任放进大型敏捷开发的 assurance loop。推荐记住 assurance closure 这个问题定义：每个 AI 变更需要从生成证据一直闭合到接受责任。文章更偏概念框架，缺少可复现 benchmark 和定量干预，适合做讨论入口，不适合作为效果证据。

**[$A^2E$ Agent Auditing Engine](https://arxiv.org/abs/2608.07346)** 用 Agent Task Protocol 快速接入不同 harness，自动 instrument monitor 采集统一 trace，再从 correctness、效率、tool use、planning 与 recovery 多维评估 model-harness 组合。实验结论是没有一种组合在所有任务上稳定最佳。它与 HarnessSafe/AgentChaos 的区别在通用能力审计；目前协议覆盖度和 oracle 质量仍需更多第三方复现。

**[PACE](https://arxiv.org/abs/2608.07395)** 把 automated algorithm design 从 whole-program evolution 改成持久的 Executable Algorithmic Primitive，使用结构化 operator 跨程序保留局部逻辑，再用 parent-relative improvement 的 Thompson sampling 选择 primitive。四个任务上能发现有竞争力算法，并避免整程序淘汰时丢失好片段。它对代码演化很有启发，但任务数量少、摘要未给足具体增益，尚不能判断 primitive credit 是否可靠。

**[Circuit-Based Program Verification](https://arxiv.org/abs/2608.07397)** 把 C 程序翻译成 sequential circuit，调用现成 hardware model checker 做 reachability、termination、k-induction 与 IC3/PDR，再把 counterexample 还原成软件 witness。超过 16,000 个任务上与 5 个成熟 verifier 竞争，并独立解决部分其他工具失败的实例。它不依赖 LLM，却值得 coding-agent 读者保留：强 agent 应调用有互补完备性的 verifier，而不是只靠生成测试。

**[TEPA](https://arxiv.org/abs/2608.07429)** 把 memory validity 写成显式状态：新证据与同 key 旧 precedent 冲突时撤销其 active 状态，但保留历史供审计。50-seed 全反转实验中 append-only 与 last-write-wins 都跌到 0.210、无 memory 为 0.309，TEPA 达 0.950；真实文件执行重复了这一模式。结论对持续软件环境很重要，不过它主要解决单跳事实替换，多跳 retrieval chain 和超长上下文仍暴露瓶颈。

**[SkillProx](https://arxiv.org/abs/2608.07449)** 用 proximal-gradient 类比组织文本 skill 自演化：forward 阶段按诊断修改、同批重执行并回滚退化；backward 阶段把 skill 拆成知识单元，以冻结的 leave-one-out utility audit 做合并、降级或删除。多 backbone 的 ID/OOD benchmark 上比最强文本梯度基线平均高 3.0 点。它把删除当成一等操作很有价值，但 leave-one-out 成本高，且 benchmark accuracy 尚不能证明 skill 在长期版本变化中仍有效。

### Post-training、奖励与数据

**[TEXAS](https://arxiv.org/abs/2608.06396)** 从 MoE 模型成功与失败样本的 expert activation 差异中找 task-relevant expert，再上调失败样本中激活这些 expert 的 answer token 权重。3 个 MoE、6 个 benchmark 的 18 个设置里 17 个最佳或并列最佳，平均超过最强基线 1.3 到 1.5 点。它把 routing 从“谁被使用”改成“谁与成功相关”，但相关激活仍非因果机制，增益也较小。

**[CoCo：MoE Reward Model 的 response-level 解释](https://arxiv.org/abs/2608.06400)** 指出 routing weight 只说明 prompt 被送给哪个 expert，不能解释该 expert 如何偏好 chosen/rejected response。CoCo 用贡献差最大的 response pair 同时刻画 routing 与 judgment，在自动和人工评价中比 router、score 与 SAE 解释更连贯、忠实、专门化，同时保持有竞争力的 reward accuracy。它改进的是 reward model 审计，不是优化算法本身。

**[GRASP](https://arxiv.org/abs/2608.06526)** 用同一个 8B 本地模型扮演 anonymizer、attacker 和 utility judge，以 GRPO 直接优化隐私-语义权衡，并加入防 reward hacking 设计。相对 DPO 蒸馏基线，在 3 个独立 judge 下都有更好 trade-off，成本约 GPT-4o teacher 的 1%。亮点是把在线 objective 对准最终隐私目标；风险是 self-reward 三个角色共享盲区，真正敏感属性泄露仍需外部红队验证。

**[AgentPatch](https://arxiv.org/abs/2608.06699)** 研究多个 agentic MLLM 合并后的 weak-task degradation 和 decisive-action forgetting。它先选稳定 merge backbone，再恢复弱任务 unique residual，最后做受 capability protection 约束的 behavior-critical patch，输出单一静态 checkpoint。六个 agentic/multimodal benchmark 上普遍改善多种 merge backbone；但这是 training-free model merging，缺少统一数字与开放环境验证，因此列中相关。

**[IB-RL](https://arxiv.org/abs/2608.06735)** 针对战略对话中的 static-counterpart mismatch，让双方共同 rollout，却各自拥有独立 advantage、action mask 与 update path。Vehicle TeleSales 的 Success@1 从最佳单边 RL 的 84.6% 提到 89.6%，Deal-or-NoDeal 对 DeepSeek V4 Pro 的 agreement 从 86.4% 提到 98.4%。它说明 co-evolution 可以减少对固定对手的投机，但两个对话域仍不足以排除新的共同适应偏差。

**[TTP-R1](https://arxiv.org/abs/2608.06778)** 先用 hybrid retrieval 缩小 MITRE ATT&CK 标签空间，再做 SFT，最后以 precision、recall 和格式组成的可验证 reward 运行 GRPO。4 个 CTI benchmark 上平均 F1 最优，sub-technique F1 比带检索的 Claude Sonnet 4.5 高 7.4 点，8B 单卡服务快 28 倍。它是很完整的垂直 RLVR 案例，但 reward 与 taxonomy 都高度结构化，不能直接外推开放 agent task。

**[推荐基础模型的多阶段 post-training](https://arxiv.org/abs/2608.06792)** 把下游适配拆成 linear probing、full fine-tuning 与 reward-model 驱动的 RFT：先稳定随机 head，再联合特化，最后对齐 business metric。离线实验优于单阶段方案，并有大规模线上 A/B 正向结果。实用价值高，但摘要未披露关键线上幅度，reward model 对商业目标的代理偏差也缺少细节，因此建议等完整复现再深读。

**[Gated-BEPO](https://arxiv.org/abs/2608.06861)** 在 rollout group 中构建经验图，以 mean-backup Bellman fixed point 估 node value，再用 GAE 累积 TD residual；只有一个状态观察到多个 successor 时，confidence gate 才引入 step credit，否则退回 episode credit。WebShop、ALFWorld、视觉 Sokoban 上对语言和视觉语言模型均稳定提升。方法判断很稳健：细粒度 credit 只应在证据足够时使用；代价是 rollout graph 的覆盖成本。

**[Agent Memory Distillation](https://arxiv.org/abs/2608.07169)** 不更新权重，而把强 teacher 的成功轨迹蒸馏成 workflow、subtask 与 function 三层 memory，前两者主动注入，function memory 在 tool error 时被动检索。4B 到 8B student 在 AppWorld、BFCL V3、ToolSandbox 平均分别提升 27.2、11.2、3.4 个百分点。它说明小模型可通过结构化外部记忆受益，但更接近 inference-time knowledge transfer，不应与参数蒸馏混为一谈。

**[TEMPO](https://arxiv.org/abs/2608.07314)** 为 VLA 模型把 semantic projection 与低层 action expert 分成两种更新速度：冻结 vision-language backbone，语义投影慢更、动作 expert 快更，避免在线控制反馈破坏高层表征。CALVIN 和两个真实机械任务上优于 pretrained VLA 与统一 RL baseline。它是明确的多模态 post-training 论文，但真实任务数少，长期安全和分布外物体仍未覆盖。

**[ResidencyRL](https://arxiv.org/abs/2608.07418)** 用最长 60 轮对话、8 次工具调用的模拟临床 encounter 训练 agent，reward 同时覆盖诊断、管理、沟通、记录与安全。对抗条件下诊断准确率从 81% 提到 88%，missed red flag 降 31%，盲评临床专家在 87.6% 对比中偏好训练后 agent，六个 AMIE multi-visit 维度也同向改善。证据很强，但 simulator/reward 共偏和真实临床前瞻验证缺失决定了它仍不能代表临床效用。

上文的 **SafeEdit** 同时属于 post-training：它最重要的结论不是 model editing 能提升已见漏洞安全性，而是安全编辑会损害功能正确性，必须用 edit-aware regularization 和独立正确性 benchmark 联合验证。

## 可留意 / 可跳过

- **[ADIAS](https://arxiv.org/abs/2608.06410)**：自动设计 interactive agentic system，关键词是 system-level search；与可靠性主线相邻，但应先看其设计空间是否含执行 oracle，暂不优先。
- **[Flaky Test Recognition for CPS](https://arxiv.org/abs/2608.06535)**：用 hybrid model 在额外一轮测试中识别 flaky case/condition，适合关注非确定环境验证；摘要的结果描述不完整，可等待修订版。
- **[GR1MINE](https://arxiv.org/abs/2608.06546)**：从 trace 学习可实现 GR(1) 规范，60 个 Syntech benchmark 上比通用 LTL mining 快 30 倍以上；是可靠验证工具，但与 LLM agent/post-training 关系较弱。
- **[Solution-Generated Autograders](https://arxiv.org/abs/2608.06572)**：四年、近 800 道 Java/Kotlin 题的课程实践，强调从参考解生成 grader 并验证准确性；教育价值高，非真实仓库 agent 研究。
- **[The Optimizer Is the Agent](https://arxiv.org/abs/2608.06714)**：统一搜索 prompt、program 和 ML workflow，记住“optimizer 具备 reasoning state”这一表述；需要更清楚的成本与独立 evaluation 才能判断是否超过强搜索基线。
- **[HLSmith](https://arxiv.org/abs/2608.06791)**：面向 C/C++ 到 HLS translation 的 expert-guided agent，属于跨平台工业迁移邻域；专用硬件综合约束很有价值，但当天摘要不足以判断 end-to-end correctness。
- **[CAS2UML](https://arxiv.org/abs/2608.07036)**：557 张手绘 UML 与人工验证 PlantUML code，并提供 syntax/render validator；数据和工具可复现，但主要是图像到模型数据集。
- **[Rust Coreutils](https://arxiv.org/abs/2608.07135)**：总结用 Rust 重建近百个 Unix 基础命令并成为 GNU coreutils drop-in replacement 的真实遗留系统经验；值得做软件演化案例读，不是 agent 论文。
- **[AI Risk Mitigation Tools Taxonomy](https://arxiv.org/abs/2608.07446)**：把 21 个开源工具映射到 32 类风险，三人 Fleiss' Kappa 0.509、投票后 F1 75.5%；适合工具盘点，分类可靠性仍只中等。
- **[Multiscale Reward Hedging](https://arxiv.org/abs/2608.06825)**：给只有正确 demonstration、没有 reward 的 continuous reward class 首个 horizon-free 保证；理论有价值，但与 LLM post-training 的直接实证很弱。
- **[双 DGX Spark 训练测试床](https://arxiv.org/abs/2608.07226)**：记录 Tailscale 远程双节点 LLM fine-tuning 环境；工程关键词可留意，缺少可推广的 post-training 方法贡献。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 核心证据 | 可复现性 / 实用性 | 评估可信度 |
|---|---|---|---|---|---|
| CyberForge | 安全修复数据缺少可执行仓库 oracle | 双注入管线 + 差分 PoV | 1,034 漏洞；SEC-bench +3.3 到 +14.7 点 | 数据流程清楚，重建 OSS-Fuzz 环境有成本 | **高**：build/test/PoV 与 OOD benchmark |
| WebGrader | 网页 reward 未观察关键状态 | Flow Contract + 自演化 SkillGraph | 8B 功能成功率 52.01%，高 7.88 点 | 浏览器闭环实用，grader 构建复杂 | **中高**：冻结 verifier 与 clean/fault 对照 |
| 生产 C++ 质量 | pass 之后的维护与资源成本 | 行级 provenance 跨生命周期连接 | 352 万变更；compute +5% 到 +8% | 工业价值高，外部无法复现数据 | **中高**：真实生产但有选择偏差 |
| LivePlan | 长轨迹行为漂移与误干预 | 确定性触发 + 稀疏 LLM advisor | 平均 resolution +9.9%，成本 +$0.08 | 易嵌入现有 harness，需调阈值 | **高**：双 benchmark、多 executor/advisor |
| PMCoder | plan 与 memory 分离导致失忆和重复失败 | 双向 plan-memory coupling + reproduction gate | Verified +5.0 点；跨模型至少 +2.8 点 | 设计可迁移，reproduction script 不总存在 | **中高**：多实现与消融，跨域样本小 |
| AgentChaos | LLM API 故障缺少运行时压力测试 | API 层非侵入注入 + trigger verification | 65 配置；pass@1 最多 -50 点 | OpenAI-compatible 系统易接入 | **高**：真实运行故障，未覆盖工具侧故障 |
| StepJack | 多步无害指令组合成攻击 | 自动分解 + 跨页链执行 | 480 题；部分 CUA ASR 最高 +31.2 点 | 数据代码公开，平台仍受控 | **中高**：报告 compliance，judge 仍有偏差 |
| HarnessSafe | 持久载体造成延迟风险 | Persistent-Risk Lifecycle 分阶段评分 | 328 案例、七类 carrier | 对 harness 审计直接有用 | **中高**：eligible/progress 分开，真实频率未知 |
| DiDPO | coding action 内局部 edit 无法分 credit | sub-diff grouping 与 token projection | 对 GRPO 平均 +5.6，部分 +10.4 点 | verl-code 开源，diff 对齐成本可控 | **中高**：多任务消融，真实仓库覆盖有限 |
| Simple-OPD | OPD warm-up 机制不清 | teacher-compatible CoT + LoRA 饱和点 | 正误 teacher rollout 都有相近初始化收益 | recipe 简单，需逐模型标定 | **中**：现象广泛，统一效应量不足 |
| MemOPD | compact memory 造成 teacher state 错位 | 精确 call reconstruction + packing | matched control 再 +7.0% F1；最高 1.63x | 需访问 token/causal state | **高**：直接验证 log-probability 重建 |
| FACTOR | action credit 与 token allocation 被耦合 | TAC-HTA-APM 信用守恒 | 三环境每个 seed 均胜；跨模型同超参 | 训练交互约 3.5x | **高**：数学约束、成本和消融均报告 |
| TRIAL | hindsight signal 在 turn 间分配不当 | 轨迹相对 likelihood-gap profile | WebShop success 56.4% 到 75.2% | 无部署额外成本，训练需 teacher scoring | **中高**：8/8 组合胜 GRPO，环境仍少 |
| Fisher-R1 | 代码可执行但统计检验无效 | P-Bench + 统计可验证 RL | 425 题；相对强基线平均 +21% | benchmark/open model 价值高 | **高**：隐藏 executable key 与专家验证 |

## 我的判断

**创新性：A-。** 今天最有价值的创新不是新缩写，而是四种粒度变得明确：CyberForge/WebGrader 定义什么证据能给 reward，DiDPO/FACTOR/TRIAL 定义 reward 应落到什么局部单元，MemOPD 定义 teacher 必须在哪个真实状态监督，HarnessSafe/AgentChaos 定义错误沿什么系统边界传播。Simple-OPD 的错误 rollout 现象很有启发性，但机制解释还需要更强因果证据。

**实用价值：A。** LivePlan 的低成本触发式纠偏、AgentChaos 的 API wrapper、CyberForge 的差分 PoV、WebGrader 的浏览器证据和 TEPA 的 memory revocation 都能映射到现有 agent stack。需要警惕的是，能接入不等于能泛化；阈值、环境 fixture、隐藏测试和载体语义依旧会随 harness 改变。

**严谨性：A-。** 最强论文普遍有 executable oracle、matched control、ablation 或跨模型结果。相对薄弱之处也很集中：真实生产 C++ 数据无法外部复现，StepJack/HarnessSafe 的攻击分布不代表发生概率，FACTOR/TRIAL/MemOPD 仍只覆盖少数环境，几篇中相关论文只在摘要给出方向性结果。今天没有哪篇足以单独证明“长时 agent 已可靠”。

**推荐顺序**：若只读四篇，先读 **CyberForge** 看仓库级验证数据如何构造，再读 **LivePlan** 看在线纠偏如何避免二次伤害，接着读 **MemOPD** 理解状态错位，最后读 **FACTOR** 理解信用守恒。关注安全则把后两篇替换为 **HarnessSafe + StepJack**；关注 post-training 则按 **Simple-OPD → MemOPD → FACTOR → TRIAL → DiDPO** 的粒度递进阅读。

整体推荐等级：**A（高优先级，但应按证据类型分组阅读）**。最大的不确定性不在平均分数，而在这些精细 oracle、credit unit 与 lifecycle taxonomy 能否跨模型、跨 harness、跨真实软件环境保持同一语义。
