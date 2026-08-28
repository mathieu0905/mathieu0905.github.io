---
title: "先验证状态，再优化模型：8 月 27 日 arXiv 的可审计 Agent、训练信用与持续适配"
date: "2026-08-28"
description: "8 月 27 日的新论文把 coding-agent 可靠性推进到跨状态证据、权限与长期规划，也把 post-training 推进到动态教师、局部信用和持续适配。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Post-Training", "RLHF", "RLVR", "软件演化", "程序修复"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-zinc-950 via-indigo-950 to-emerald-950"
---

8 月 27 日这一批论文的共同变化，是研究者开始拒绝把“模型输出看起来合理”当作系统已经完成。coding-agent 线把证据推进到浏览器状态、sanitizer、Android 跨方向状态、工具权限、仓库配置和长期开发轨迹；post-training 线则反复追问信号究竟落在领域、候选、token、事实还是视觉依赖结构上。最值得读的不是某个新缩写，而是这些论文不断把隐藏假设变成可执行的检查或可被否定的实验。两条主线都有大量实质新稿，因此本期是完整深读，而不是短评型 digest。

本轮以 arXiv 官方 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG 为核心，并补查 cs.IR、cs.CV、cs.CR、cs.OS 的 `pastweek` 页面，九类页面均定位到 **Thu, 27 Aug 2026**。合并 New 与 Cross submissions 后得到 **476 篇唯一条目**，独立筛选两条主线后纳入 **121 篇**：coding-agent / software-change 55 篇，post-training 66 篇，当天没有需要双重计数的交叉项。28 篇强相关论文全部从 `https://arxiv.org/pdf/<id>` 下载并完成 `%PDF`、大于 20KB、`pdftotext -layout` 与首页渲染检查；60 篇中相关和 33 篇可留意项依据官方摘要、元数据与必要的全文定位分层。

## 今日脉络

第一条脉络是 **完成必须绑定到跨状态证据**。网页修复要在注入后重新审计，Android 旋转要比较语义状态，科学工作流要同时交齐 deliverable，开放式 fuzzing 要真的触发 sanitizer。局部高分、截图相似、测试文件存在或一句“done”都不再足够。

第二条脉络是 **Agent 的外部能力正在成为新的供应链**。Metis 把权限和生命周期类型化，ToolMinimize 在字段级缩减泄露，KOPE 把硬件反馈写入经验图，EVOMAL 则证明自创技能会把恶意模板复制成持久 worm。外部 memory、skill 与 harness 能提升能力，也必须有版本、来源与回归门槛。

第三条脉络是 **post-training 进入 stage-aware 和 credit-aware 阶段**。TailSFT 不是追求当前 loss 最低，而是为后续 GRPO 保留 coverage；D3-MOPD 按领域收敛速度调数据；SuRe、V-Rubrics 与 Visual Dependence-Aware training 分别把信用落到 token、视觉命题与跨模态依赖。

第四条脉络是 **训练后的行为稳定性不能从权重形式推断**。QLoRA 的低秩不保证少遗忘，embedded steering 即使权重编辑几乎未被逆转，行为仍会在下游微调后恢复；privileged teacher 若不跟随学生，也可能让 OPSD 的 dense signal 变成过期监督。

## 强相关论文深读

### 1. What Does an Evaluation License? A Commit-Bound Census of Claim-Relative Inference in Inspect Evals

**论文信息**：*What Does an Evaluation License? A Commit-Bound Census of Claim-Relative Inference in Inspect Evals*；Qin, Xi；[arXiv:2608.19269](https://arxiv.org/abs/2608.19269)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：一个评测分数只证明某段前向计算跑出了结果，并不自动授权论文附着在这个分数上的稳健性、胜负或排序结论。

**为什么值得推荐、方法怎么工作**：作者把评测重放拆成冻结证据底座 D、语义家族 F、声明查询 q 和 identified set：先固定 Inspect Evals 的提交版本，再检查历史输入、评分语义与替代解释是否齐备，最后只在证据闭合时计算精确值、赢家或稳定子序。Figure 1 的关键不是新 scorer，而是把证据缺失与语义多义变成有类型的停止条件。

**关键实验、局限与当天主题**：对 124 个机械可审计单元逐一给出终态，110 个在确定性推断前就因历史证据或语义 grounding 不足而停止；能闭合的单元也会随声明粒度和 primary/review family 改变结论。它值得推荐，因为这比把所有评测压成 robust/not robust 更诚实。局限是 commit-bound 文档审计不能证明未来版本或真实部署仍满足同一语义，也不评估被测 Agent 本身的能力。

### 2. From Blind Edits to Verified Repair: Building Trustworthy User-Side LLM Agents for Web Accessibility

**论文信息**：*From Blind Edits to Verified Repair: Building Trustworthy User-Side LLM Agents for Web Accessibility*；Wanscher, Lily Bundgaard, Lorensen, Markus Heidemann, Shafiq, Mohammed Ammad, Moghaddam, Mahyar Tourchi, Alipour, Mina；[arXiv:2608.24913](https://arxiv.org/abs/2608.24913)；Human-Computer Interaction (cs.HC) ; Software Engineering (cs.SE)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：网页辅助 Agent 只有在每次修改后重新审计、拒绝退化候选时，才从“会改 CSS”变成可信修复器。

**为什么值得推荐、方法怎么工作**：系统先由浏览器扩展提取并压缩样式表，本地 7B--14B 模型针对 18 项 WCAG/认知无障碍指标生成 additive CSS，再以可逆方式注入页面。论文随后把 blind generation 与 audit-inject-verify 区分：候选只有在自动违规数严格下降时才被接受；Figure 1 展示从页面证据、生成到注入和复核的完整回路。

**关键实验、局限与当天主题**：六个小模型在十个高违规与十个高可访问站点上的 100 次有效试验出现 24 次改善和 20 次退化，说明“平均变好”会掩盖伤害。加入验证后，57/57 个种子违规全部检出、零假阳性，并拒绝 126/126 个对抗性有害候选。可信边界是 oracle 只覆盖被编码的自动检查，无法证明屏幕阅读器体验、动态交互与人工可用性没有退化。

### 3. ToolMinimize: Auditing and Rewriting LLM Agent Tool Calls to Minimize Privacy Exposure

**论文信息**：*ToolMinimize: Auditing and Rewriting LLM Agent Tool Calls to Minimize Privacy Exposure*；Li, Wenbiao, Xu, Yuqiao；[arXiv:2608.24957](https://arxiv.org/abs/2608.24957)；Cryptography and Security (cs.CR) ; Software Engineering (cs.SE)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：与其允许或拦截整个工具调用，不如在调用跨越信任边界前，把参数改写到完成任务所需的最小信息。

**为什么值得推荐、方法怎么工作**：ToolMinimize 先从工具 schema 推断字段必要性，再对多余敏感数据执行删除、泛化、替换和截断；自由文本还可交给内容必要性层做二次清理。它处理的不只是姓名和号码，也包括医院名这类隐式泄露。整个中间件位于 Agent 与外部工具之间，因此不要求改模型，审计结果还能直接定位到字段级。

**关键实验、局限与当天主题**：GPT-4o、Claude 3.5 Sonnet 与 Llama-3.3-70B 的默认调用中有 81%--88% 携带不必要敏感数据，显式隐私提示后仍有 36%--76%。307 次 live call 上，基础层把隐私成本降低 81.2%--92.0%，保持 100% 参数级任务有效性；内容层将降幅推到 85.1%--95.6%，中位延迟 1.77 ms。风险在于“必要性”本身可能判断错，参数等价也不等于端到端业务语义完全不变。

### 4. FrontierChallenge: Evaluating Scientific Workflow Completion

**论文信息**：*FrontierChallenge: Evaluating Scientific Workflow Completion*；Su, Liangcai, Feng, Zhaopeng, Chen, Zhuo, Zhang, Zhen, Lin, Xiang, Li, Ruilin, Zhang, Handuo, Wang, Ning, Wen, Kailong, Guo, Yueqi, Xing, Feng, Guo, Yiling 等；[arXiv:2608.24979](https://arxiv.org/abs/2608.24979)；Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Software Engineering (cs.SE)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：科学 Agent 的主要失败不是完全不会做，而是把大量局部进展误报成完整交付。

**为什么值得推荐、方法怎么工作**：FrontierChallenge 把任务定义成输入、执行环境和一组必须同时出现的科学 deliverables，而不是单答案题。评测在量子化学、分子动力学、材料表征、分析化学、生命科学与电化学/环境六域运行 12 个前沿模型和 3 种 scaffold，并同时报告全交付 Pass Rate 与局部 Avg. Score；这种双指标能直接看见“做了很多”和“真正做完”的裂缝。

**关键实验、局限与当天主题**：基准规划 300 个工作流，本版发布 97 个；最佳配置也只完成 20 个，Pass Rate 为 20.6%。分析化学与电化学/环境的最高 Avg. Score 达 87.6 和 94.9，却只有 4% 和 0% 完成；Claude Code 的失败轨迹中 75.5% 仍以完成声明收尾。局限是 bundle scorer 的覆盖与领域环境会决定何谓完成，剩余 203 题尚未公开，结果也不能直接外推到开放实验室。

### 5. FuzzingBrain-Bench V1: Evaluating Open-Ended Bug Discovery by LLMs

**论文信息**：*FuzzingBrain-Bench V1: Evaluating Open-Ended Bug Discovery by LLMs*；Sheng, Ze, Kezic, Aleksandar, Chen, Zhicheng, Huang, Jeff；[arXiv:2608.25158](https://arxiv.org/abs/2608.25158)；Artificial Intelligence (cs.AI) ; Cryptography and Security (cs.CR); Machine Learning (cs.LG); Software Engineering (cs.SE)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：开放式 bug discovery 应按 Agent 真正触发的独立崩溃计分，而不是只看它是否命中预先指定的那一个漏洞。

**为什么值得推荐、方法怎么工作**：FuzzingBrain-Bench 把真实开源项目、sanitizer-instrumented harness 与自包含 Docker 镜像交给模型，让其生成尽可能多能触发 distinct crash signature 的输入。难度系数和每题上限控制不同项目的分值，Figure 2 记录挑战选择流程，Figure 3 则把模型、执行器、sanitizer 与去重链条放在同一可复验架构里。

**关键实验、局限与当天主题**：V1 有 77 个挑战、43 个项目，覆盖 36 个 C、32 个 C++ 与 9 个 Java/JVM 任务。Claude Opus 4.8 在 60/77 个挑战触发崩溃，得 196/579；三种模型都无法攻下 13 题。它把未预期发现纳入评价，是可靠 bug-finding agent 的重要进步。限制是 crash signature 不等于根因或安全影响，分值上限和 harness 可达性仍会塑造排行榜。

### 6. Model-Based Agentic Software Engineering

**论文信息**：*Model-Based Agentic Software Engineering*；Davis, James C., Kalu, Kelechi, Peng, Huiyun, Patil, Parth V.；[arXiv:2608.25174](https://arxiv.org/abs/2608.25174)；Software Engineering (cs.SE)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：当生成代码变得便宜，稀缺资源转向可持续的工程模型、验收证据和谁有权决定“可以合并”。

**为什么值得推荐、方法怎么工作**：MAGE 将问题拆成 representation 与 authority：先外化回答某个工程问题所需的最小目的性表示，再让已经稳定的义务通过约束、传感器、validator 和 gate 获得相称权力；仍不确定的意图继续开放给人。Figure 1 把外部化知识、边界动作、独立评价和人类保留权组合成 governed environment，Table 1 用六个工业案例重建这些机制。

**关键实验、局限与当天主题**：证据来自一个纵向案例与六份独立工业报告，贡献更接近框架与可证伪理论，不是性能榜单。它值得推荐，因为它明确拒绝把更长 prompt 当工程治理。局限也因此明显：案例能解释机制，却不能给出因果增益；“最小表示”和“意图何时稳定”仍需团队判断，跨组织复现实验尚未完成。

### 7. A Few Pages of Markdown: Committed AI Configuration and Lower Quality Cost after Coding-Agent Adoption

**论文信息**：*A Few Pages of Markdown: Committed AI Configuration and Lower Quality Cost after Coding-Agent Adoption*；Denisov-Blanch, Yegor, Agarwal, Shyam, Azaletskiy, Pavel, He, Hao, Schaeffer, Rylan, Miranda, Brando, Vasilescu, Bogdan, Koyejo, Sanmi；[arXiv:2608.25241](https://arxiv.org/abs/2608.25241)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：版本库中几页真正提交的 Agent 配置，可能比“用了哪个模型”更能解释采用 coding agent 后的质量差异。

**为什么值得推荐、方法怎么工作**：RAMP 从仓库可见工件构造四级累积成熟度：行为规则与代码规范、命名 Agent、再到多 Agent 编排。研究先验证等级能由独立标注复现，再把已有 agent-adoption panel 按成熟度分层，比较提交速度、认知复杂度和静态分析告警；这种设计把配置视为可审计的工程状态，而不是问卷自报。

**关键实验、局限与当天主题**：样本含 441 个仓库，held-out 标签复现率 97%，73.8% 的配置只提交一次便不再修改。各层采用 Agent 后提交量都增加 28%--38%，但 agent-first 仓库中，无已提交配置者的认知复杂度增幅约为 +53%，有配置者约 +27%，静态告警增幅也约 1.7 倍。作者明确承认是观察研究：工程纪律、团队能力或模型选择都可能同时解释差异，不能把 Markdown 本身当因果药方。

### 8. Metis: Typed Runtime Mediation for Tool-Using Software Agents

**论文信息**：*Metis: Typed Runtime Mediation for Tool-Using Software Agents*；Yu, Jun；[arXiv:2608.25322](https://arxiv.org/abs/2608.25322)；Software Engineering (cs.SE)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：工具 Agent 的权限、并发冲突和生命周期不能继续藏在 provider-specific 字符串流里，应先变成类型化事件再触发外部效果。

**为什么值得推荐、方法怎么工作**：Metis 先把不同模型供应商的 stream 归一成 typed events，然后依次经过权限决策、interference class、registry 与 terminal-state closure；子 Agent 能看见哪些工具也由 gate 与 registry 联合控制。Figure 1 展示交互式、headless、协议和桌面入口如何汇入同一 runtime，十例 fault matrix 则专门暴露重复标识符与 rollback 边界。

**关键实验、局限与当天主题**：30 组真实 I/O 配对中，四类 mediation 将强制串行的中位 25.958 ms 降到 14.146 ms，平均差 -12.295 ms，95% bootstrap 区间为 [-12.968,-11.694]；五个模型条件均 3/3 完成固定 Read-marker 协议。权限 oracle 在五种调用路径的十个声明案例全匹配。论文没有声称验证模型推理、语义安全或回滚，这种克制正是可信度的一部分。

### 9. RotDroid: Cross-Orientation State Equivalence Testing for Detecting GUI Rotation Bugs in Android Apps

**论文信息**：*RotDroid: Cross-Orientation State Equivalence Testing for Detecting GUI Rotation Bugs in Android Apps*；Qin, Mengdi, Jiang, Bo；[arXiv:2608.25425](https://arxiv.org/abs/2608.25425)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：Android 旋转 bug 的关键 oracle 不是截图相似，而是两种方向下业务状态是否语义等价。

**为什么值得推荐、方法怎么工作**：RotDroid 生成并变异 state-preserving action sequence，在 portrait 与 landscape 中构造可比较状态；RotBench 提供成对界面，微调的 RotVL 判定跨方向等价，再由测试框架在相同预算下探索真实应用。这样能抓到不崩溃却丢状态、错布局或错误旋转的 silent failure，而不是依赖 crash log。

**关键实验、局限与当天主题**：RotVL 在合成与真实数据上超过通用模型，RotDroid 在开源和闭源应用中报告 94 个此前未知问题，其中 47 个获开发者确认或修复；人工讨论前一致率 94.2%。局限是视觉等价模型仍可能误判语义，设备、系统版本与动态数据覆盖有限，开发者确认也不是所有报告的独立真值。它为移动端 Agent 验证提供了比像素差更合适的状态 oracle。

### 10. Beyond Scaling: Self-Evolving LLM Agents for Hardware Kernel Optimization via an Experience-Driven Workflow and Experience Graph Memory

**论文信息**：*Beyond Scaling: Self-Evolving LLM Agents for Hardware Kernel Optimization via an Experience-Driven Workflow and Experience Graph Memory*；Chen, Siyuan, Hou, Runlin, Wu, Shenxiu, Sun, Yansong, Cao, Junming, Zhang, Yiyu, Shao, Shudi, Qiu, Junhao, Lu, Zhichao, Zhang, Qingfu；[arXiv:2608.25570](https://arxiv.org/abs/2608.25570)；Machine Learning (cs.LG) ; Multiagent Systems (cs.MA)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：固定基础模型也能持续变强，但前提是把每次优化决策、真实硬件反馈和替代分支压缩成可检索的证据图，而不是无限堆轨迹。

**为什么值得推荐、方法怎么工作**：KOPE 在编译、正确性测试、profiling、修改的循环中，把决策顺序、观测结果与分支写入 Experience Graph Memory；Active Context Management and Injection 再按当前算子与固定 token 预算提取经验。Figure 1 的重点是旧经验只有在与当前硬件和任务相关时才进入上下文，避免被动日志挤占工作记忆。

**关键实验、局限与当天主题**：同为 GLM-5.2 时，KOPE 的逐算子几何平均加速是 CANNBot 的 1.54 倍。53 算子消融中，主动上下文把通过率从 60.0% 提至 84.6%，token 从 15.9B 降至 1.113B；经验图把完整套件通过率从 55.2% 提至 84.6%，有效计时上得到 1.43 倍几何平均加速。限制是 Ascend/特定 evaluator 与超大搜索预算，跨硬件迁移和记忆过期仍待验证。

### 11. EVOMAL: Self-Poisoning in Self-Evolving Coding Agents

**论文信息**：*EVOMAL: Self-Poisoning in Self-Evolving Coding Agents*；Wu, Xiaodong, Shi, Yu, Li, Qi, Zhao, Zhimin, Li, Xiangman, Adams, Bram, Hassan, Ahmed E., Ni, Jianbing；[arXiv:2608.25776](https://arxiv.org/abs/2608.25776)；Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：会自动模仿并保存技能的 coding agent，会把一次恶意检索结果复制成持久、自传播的本地能力。

**为什么值得推荐、方法怎么工作**：EvoMal 在共享技能库中植入带 banner 的恶意 skill，不要求它被直接调用；Agent 在新任务中检索该范式、生成自己的技能并执行，复制品随后重新进入库。作者以 ASPR 衡量任务是否新增恶意自创技能，并在移除原始投毒后继续多轮观察，因而测到的是供应链传播而不是一次 prompt injection。

**关键实验、局限与当天主题**：六个模型、153 个 tool-relevant SWE-bench Verified 任务上，ASPR 为 20.3%--41.8%，恶意技能数量膨胀到初始的 4.9--9.0 倍；按任务族定制描述可达 86.7%，移除原始技能后 Qwen3 第五轮仍有 68%。counter-prompt 将 ASPR 压至最高 6.7%，但它主要针对 banner copying。代码混淆、语义等价 payload、签名漂移和跨库传播仍是开放风险。

### 12. XREPOTEST: Benchmarking Multilingual Repository-Level Unit Test Generation for Large Language Models

**论文信息**：*XREPOTEST: Benchmarking Multilingual Repository-Level Unit Test Generation for Large Language Models*；Quang, Dung Le, Van, Dong Cao, Hai, Nam Le, Van, Linh Ngo, Bui, Anh M. T., Nguyen, Phuong T.；[arXiv:2608.25939](https://arxiv.org/abs/2608.25939)；Software Engineering (cs.SE)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：仓库级单测生成的瓶颈不是把测试文件写出来，而是依赖能否编译、断言是否正确、以及测试是否真的调用了目标函数。

**为什么值得推荐、方法怎么工作**：XREPOTEST 覆盖 Rust、Go、Julia、PHP、Ruby 五种以往较少评测的语言，用容器执行测试，并比较 file-level、LSP 与 retrieval context。除通过率、编译率和覆盖率外，Invocation Rate 专门检查 focal function 是否被直接调用，防止 wrapper 的间接执行把 coverage 虚高；Figure 2 给出从仓库函数到多上下文执行的流水线。

**关键实验、局限与当天主题**：14 个模型的平均编译成功率只有 57.4%，Go/Rust/Ruby 的平均 mutation score 仅 3.2%。例如标准上下文下 Claude 4.5 Sonnet 的 Rust TPR/Coverage/IR 为 12.78/11.56/75.94，Go 为 23.65/43.53/99.43，显示“触达目标”与“写对 oracle”差距很大。局限是五种语言和选定仓库仍不能覆盖 monorepo、外部服务与 flaky test，IR 也只证明调用，不证明断言有诊断力。

### 13. TraceML: An Empirical Analysis of Human-Agent Planning in Machine Learning Development

**论文信息**：*TraceML: An Empirical Analysis of Human-Agent Planning in Machine Learning Development*；Yan, Jiarui, Sun, Weiwei, Li, Sijie, Li, Wenhan, Yang, Yiming；[arXiv:2608.26086](https://arxiv.org/abs/2608.26086)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：长程 ML 开发中，Agent 不只是少一个好模型；它缺少人类反复切换工作类型、回到旧方案并重组验证证据的搜索纪律。

**为什么值得推荐、方法怎么工作**：TraceML 把人和 Agent 的每个代码版本统一编码为时间、分数、动作、意图、编辑规模和分数影响，再在相同比赛上对齐轨迹。它收集 4,465 条人类 Kaggle 轨迹、134 个比赛，并在 7 个比赛形成 430 条人类与 207 条 Agent 配对；Figure 1 的 action ribbon 直接展示人类混合数据、验证、模型和集成，而 scaffold 收缩成单一循环。

**关键实验、局限与当天主题**：顶尖人类在 9% 可返回版本中重开旧路线，且 78% 最终超过被返回版本；Codex 只返回一次，MLEvolve 一次没有。新成员式 ensemble 使人类下一版本改善概率 +6.4 点，单纯 reweight 则 -5.8 点。约千 token 的 planning skill 让 7 个比赛中 5 个提高、2 个在噪声内，但仍不能恢复人类式路线记忆。数据来自 Kaggle 与两个 scaffold，标签器和排行榜选择偏差限制外推。

### 14. Demystifying Reinforcement Learning Post-Training of Language Models

**论文信息**：*Demystifying Reinforcement Learning Post-Training of Language Models*；Clay, Donovan, Gollapudi, Saket, Harilal, Sankar, Jang, Min, Morrison, Jacob, Oh, Sewoong, Jaques, Natasha；[arXiv:2608.24949](https://arxiv.org/abs/2608.24949)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：RL post-training 能否学到目标，首先取决于基础模型是否给目标行为留下概率质量，以及奖励在什么 prompt 分布上被优化。

**为什么值得推荐、方法怎么工作**：论文用可控的目标字符串与多步数学环境拆解 RLVR：依次改变 base prior、奖励粒度、prompt 多样性和模型规模，并以输出熵比较 pretraining、SFT 与 RL 后的分布变化。Figure 1 将 base model、rollout、verifier 与 policy update 分开，使所谓 spurious reward、dense reward 和探索不足可以在同一实验里观察。

**关键实验、局限与当天主题**：实验显示，当参考策略几乎不给目标行为概率时，RL 会在约 10% 匹配率附近停滞；spurious reward 是否伤害能力又依赖训练 prompt 是窄分布还是广分布，不能脱离数据分布下结论。它是一篇机制 primer，价值在于把流行术语还原成可控变量。边界是任务刻意简化，结论不等于大规模生产 RLHF 的完整因果图，复杂 reward model 与分布漂移仍未覆盖。

### 15. D$^3$-MOPD: Adaptive Dynamic Domain ScheDuling for Efficient Multi-Teacher Distillation

**论文信息**：*D$^3$-MOPD: Adaptive Dynamic Domain ScheDuling for Efficient Multi-Teacher Distillation*；Sun, Zechen, Zhang, Zhiwei, Zhao, Fei, Li, Juntao, Chuan, Mu, Deng, Huayu, Zhan, Guojian, Chen, Wenliang, Hu, Yao, Zhang, Min；[arXiv:2608.24987](https://arxiv.org/abs/2608.24987)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：多教师蒸馏不应提前固定各领域配比；每个领域剩余 headroom 与收敛速度本身就是可复用的调度信号。

**为什么值得推荐、方法怎么工作**：D3-MOPD 保留原有 student rollout 和逐域 reverse-KL，只在训练进程外放一个 watcher：周期性追踪每域 KL 曲线，估计尚可提升空间和当前速度，再异步调整采样比例。它不改变核心 loss，也不额外生成 rollout，因此“zero-overhead”主要指复用既有统计而非训练免费。Figure 1 对照固定 mixture 与动态回流。

**关键实验、局限与当天主题**：在 Qwen3.6-35B-A3B 学生和四个领域专家上，D3-MOPD 关闭平均 teacher-student 差距的 97%，固定 MOPD 为 63%；达到同一峰值所需 rollout step 约减少 3 倍，并在 7 个 benchmark 中有 3 个超过专科教师。限制是调度器直接看训练 KL，可能追逐易降但与下游能力不一致的领域；四教师七基准仍不足以证明更大域数下稳定。

### 16. Does Fine-Tuning Undo Activation Steering? Behavioural Recovery Without Weight-Edit Reversal

**论文信息**：*Does Fine-Tuning Undo Activation Steering? Behavioural Recovery Without Weight-Edit Reversal*；Glass, Philipp E., Tucker, Allan, Li, Yongmin, Miron, Alina；[arXiv:2608.24988](https://arxiv.org/abs/2608.24988)；Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：下游微调可以恢复被 steering 抑制的行为，却几乎不需要把原来的权重编辑反向抹掉。

**为什么值得推荐、方法怎么工作**：研究先把 refusal suppression 与 brevity steering 写入五个 3B--14B instruction model，再做非对抗 SFT 与 RLHF。随后分别测行为保留、steering vector 的权重恢复和下游更新与原编辑方向的夹角，从而区分“行为回来了”和“机制被逆转”。Figure 1 直观显示这两个维度并不同步。

**关键实验、局限与当天主题**：当训练数据与 steering 目标冲突时，SFT 平均抹去拒答消融效果的 64%；但 mean vector recovery 只有 rho=0.004，微调更新与原编辑权重图样近乎正交，平均 cos(theta)=0.074。结论是 embedded steering 机制上耐久、功能上脆弱，因此任何后续训练都要重新做行为验收。局限是两类行为和五个模型，尚未覆盖长期在线训练、恶意微调或多种 steering 叠加。

### 17. From Memorization to Absorption: Mixed-Policy RL for Continual Knowledge Injection

**论文信息**：*From Memorization to Absorption: Mixed-Policy RL for Continual Knowledge Injection*；Hou, Zhibo, Zhao, Fan, An, Zhiyu, Du, Wan；[arXiv:2608.25243](https://arxiv.org/abs/2608.25243)；Computation and Language (cs.CL) ; Machine Learning (cs.LG)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：新事实若只靠 SFT 往往停在训练表述的记忆；混合离策略正确答案与在线探索，才更可能形成可组合的知识吸收。

**为什么值得推荐、方法怎么工作**：GRIN 有三阶段：先从文档构造 QA-SFT 让模型接触事实；再用 mixed-policy RL 让已有能力在新表述中探索；当 on-policy rollout 全错时，Golden-GRPO 注入 golden answer，避免 group advantage 全为零，模型改善后再自然转向在线样本。Blank 与 Counter 分别测试新事实获取和反事实覆盖，并区分单事实、跨文档与推理问题。

**关键实验、局限与当天主题**：Table 2 的主结果显示，SFT 在训练格式召回上强，却在多源组合和推理上脆弱；GRIN 在困难问题上明显超过 SFT 与其他 mixed-policy baseline，同时不牺牲基本召回。论文没有给一个可脱离数据集的统一 headline 分数，这反而提醒读者逐任务看。风险是 golden answer 与合成文档定义了可学边界，反事实覆盖不代表现实知识更新中的冲突、时效与来源可信度。

### 18. Beyond Pairwise Feedback: Listwise Vision-Language Supervision for Preference-Based Reward Learning

**论文信息**：*Beyond Pairwise Feedback: Listwise Vision-Language Supervision for Preference-Based Reward Learning*；Katkuri, Srivalli, Kawada, Maxwell, Wachs, Juan；[arXiv:2608.25350](https://arxiv.org/abs/2608.25350)；Machine Learning (cs.LG) ; Robotics (cs.RO)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：当 VLM 能同时比较多个机器人结果时，把监督压回二选一会丢掉排序结构；listwise reward learning 提供更匹配的接口。

**为什么值得推荐、方法怎么工作**：框架从 Meta-World 轨迹图像采样 K 个结果，VLM 生成排序，再用 Plackett-Luce 拟合 reward model，随后训练控制策略；对照包含 pairwise Bradley-Terry、K-wise BT、RL-VLM-F 与 oracle。Figure 1 将数据收集、视觉排序、reward 拟合和策略更新串成闭环，K 可在 3、4、5 间按环境调整。

**关键实验、局限与当天主题**：至少一个 PL 配置在每个环境的平均成功率上持平或超过对照，最佳配置最终平均成功率 86%，Drawer Open 上追平 oracle。它证明 listwise feedback 不是只在语言偏好中有用。边界是 VLM 排序仍可能共享视觉盲点，Meta-World 状态可控、任务少，K 增大也会提高标注上下文与排序噪声，尚不能推断真实机器人长期安全。

### 19. Training Alignment Auditors via Reinforcement Learning

**论文信息**：*Training Alignment Auditors via Reinforcement Learning*；Rosu, Paul, Wang, Rowan；[arXiv:2608.25460](https://arxiv.org/abs/2608.25460)；Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：alignment auditor 也需要训练成会规划调查，而不是仅靠更强通用模型临场提问。

**为什么值得推荐、方法怎么工作**：训练环境向 auditor 暴露可能由 system prompt 植入隐藏行为的目标模型，policy 组织多轮调查；知道真值的 judge 将调查与参考轨迹做 pairwise 比较给 reward。消融比较 pointwise/pairwise 奖励，并加入无隐藏行为目标来约束假阳性，最后跨 scaffold 与 AuditBench 的对抗微调目标检查泛化。

**关键实验、局限与当天主题**：pairwise reward 更稳定，加入阴性目标后假阳性率保持在 1% 以下；训练同时提升植入行为发现、生产模型异常发现和 audit realism，并能迁移到不同 scaffold。Figure 1 报告三 seed、95% 置信区间。局限是隐藏行为主要由 system prompt 人工植入，judge 知道真值且参考调查可能把自己的偏好写入 reward；发现能力提高不等于覆盖未知后门。

### 20. V-Rubrics: Visual Faithfulness via Rubric-Based Reinforcement Learning

**论文信息**：*V-Rubrics: Visual Faithfulness via Rubric-Based Reinforcement Learning*；Tian, Shulin, Li, Minglun, Dong, Yuhao, Ding, Hao, Yao, Jiarui, Diao, Haiwen, Yang, Jingkang, Zhu, Hongyuan, Liu, Ziwei；[arXiv:2608.25580](https://arxiv.org/abs/2608.25580)；Computer Vision and Pattern Recognition (cs.CV) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：多模态 RL 的信用不该只有一个答案分，而应分清视觉事实、推理一致性与指令约束分别在哪里成立。

**为什么值得推荐、方法怎么工作**：V-Rubrics 把参考回答拆成 atomic proposition，分别打 Visual Faithfulness、Reasoning Consistency、Instruction Following，并在有证据 span 时把 credit 定位到 prefix。训练从 Qwen3-VL-8B-Instruct 与 OpenMMReasoner-SFT-874K 冷启动开始，再以 17 个来源的 50,248 样本、规则过滤、难度分层和 Gemini-3-Pro rubric 做 component-wise GRPO；Figure 2 是完整 recipe。

**关键实验、局限与当天主题**：相同数据混合下，rubric GRPO 比 answer-only scalar GRPO 的 Overall Avg. 相对提高约 2.7%，prefix-localized credit 又带来 1.79 点，增益主要出现在知识与视觉 grounding 任务。局限是 rubrics 由强闭源模型生成，atomic proposition 仍可能错，训练和评测的视觉证据覆盖也未审计到真实世界；更细 reward 不是自动更真。

### 21. A Token-Level Analysis of Sampled-Token Reverse-KL On-Policy Distillation

**论文信息**：*A Token-Level Analysis of Sampled-Token Reverse-KL On-Policy Distillation*；Shao, Bing, Zhang, Jiazheng, Ma, Long, Shen, Yujiong, Jin, Senjie, Guo, Xin, Yang, Yuming, Chai, Mingxu, Xi, Zhiheng, Liu, Boyang, Shang, Junlin, Gui, Tao, Z 等；[arXiv:2608.25643](https://arxiv.org/abs/2608.25643)；Machine Learning (cs.LG) ; Computation and Language (cs.CL)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：reverse-KL 在线蒸馏的 token 梯度天然极不均匀：学生越意外、师生差距越大的采样 token，越主导更新。

**为什么值得推荐、方法怎么工作**：论文推导 K2 estimator 对 student logits 的逐 token 梯度，其 L1 范数可分解为 teacher-student log-prob gap 与 student softmax 因子。实证再按学生概率分桶检查梯度质量，最后提出 detached、bounded 的 Surprise-aware Reweighting 放大已有分配，而不是换一套教师或额外 reward。

**关键实验、局限与当天主题**：Figure 1 显示 post-training checkpoint 后只有 8.5% 的 OPD rollout token 和 7.1% 的 base-rollout token 达到所设位移条件，但梯度质量高度集中在低概率区。两个 Qwen3 学生尺度上，SuRe 在多项数学指标超过 vanilla OPD，选定 OOD 集未见明确退化。限制是实验集中数学、教师固定，重加权也可能放大教师在稀有 token 上的错误。

### 22. Learning New Facts with QLoRA: An Acquisition-Retention Frontier

**论文信息**：*Learning New Facts with QLoRA: An Acquisition-Retention Frontier*；Zheng, Estelle, Warichet, Sébastien, Helbert, Emmanuel, Cerisara, Christophe；[arXiv:2608.25677](https://arxiv.org/abs/2608.25677)；Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：QLoRA 并不天然比全量微调更能保留能力；adapter rank 决定了新事实获取与无关能力保持之间的前沿。

**为什么值得推荐、方法怎么工作**：研究用匿名化 OpenStreetMap 关联让 Qwen3-4B 安装此前不存在的事实，对比 FFT 与 rank 8/16/32/64 的 QLoRA，并分别测原题召回、同事实改写、无关 benchmark、权重距离与谱变化。Figure 1 把 OSM paraphrase accuracy 与 OOD 保留画在同一平面，另以数学适配检查这一前沿是否依赖任务类型。

**关键实验、局限与当天主题**：低 rank 保留 OOD 较好却少学事实，高 rank 的 paraphrase 泛化更强但遗忘增加；真实实体先验可把 chance EM 从 6.68% 提到 10.36%，说明数据匿名化控制确有必要。FFT 反而较保守，没有进入最高事实获取区。局限是单个 4B 模型与地理关联，rank 之外的 target module、学习率和数据重复也可能改变前沿。

### 23. TailSFT: Filtered Fine-Tuning Improves Post-Training Performance

**论文信息**：*TailSFT: Filtered Fine-Tuning Improves Post-Training Performance*；Malladi, Sadhika, Jelassi, Samy, Foster, Dylan, Ash, Jordan T., Krishnamurthy, Akshay；[arXiv:2608.25756](https://arxiv.org/abs/2608.25756)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：SFT checkpoint 不该只按当前 loss 选，还要看它给后续 RL 保留了多少可探索的正确尾部。

**为什么值得推荐、方法怎么工作**：TailSFT 在 SFT 过程中持续过滤已经拟合的序列，把更新集中到 under-modeled tail；设计依据是 coverage/pass@K 比单一 pass@1 更能预测后续 RL 上限。论文用受控实验和理论条件说明何时过滤可能增加 coverage，再从同一 checkpoint 启动 GRPO，避免把初始化差异与 RL recipe 混在一起。

**关键实验、局限与当天主题**：OLMo-3 7B 上，TailSFT 在数学和代码任务的 pass@16 最高绝对提升 16.8%（摘要概括为最多 17%），后续 GRPO 的 pass@1 最多提高 3.9%--4%，额外计算很小。它把 stage-aware checkpoint selection 变成可测问题。风险是过滤器依赖当前模型与数据难度，尾部可能混入噪声或不可学样本，单一 7B 家族不足以证明普适。

### 24. Unfolding Scientific Papers into Multi-Turn Generation Trajectories for Continued Pre-Training

**论文信息**：*Unfolding Scientific Papers into Multi-Turn Generation Trajectories for Continued Pre-Training*；Xu, Qiankai, Chen, Qiguang, Su, Zixin, Huang, Wenhao, Gao, Yue, Liu, Jiaheng, Zhang, Ge；[arXiv:2608.25826](https://arxiv.org/abs/2608.25826)；Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：与其让模型重写论文，不如保留原文答案，反向重建写作请求、全局计划和逐节 deliberation，用文档结构制造训练轨迹。

**为什么值得推荐、方法怎么工作**：pipeline 对质量筛选后的 arXiv 论文生成 multi-turn trajectory：request、global plan、每节写前思考；正文与摘要保持原样，合成思考包围真实答案。相同逆向构造还产生 SFT 数据与基于 held-out paper 的 PAW-Bench。Figure 1 明确标出哪些文本是原文、哪些是教师生成，便于审计答案污染。

**关键实验、局限与当天主题**：CPT 语料约为源文本两倍；PAW-Bench 覆盖 15 类任务，要求长度 20--2100 词、中位 1000。控制实验中，继续预训练后再做相同公共 SFT，写作平均分仍比 no-CPT 高 1.6--2.4 点，并改善长文阅读而未明显损害通用推理。局限是写作评测主要由 GPT-5.5 judge，arXiv 文本版权/重复与 held-out 污染需更严格审计，合成 deliberation 也不是真实作者思路。

### 25. One Symptom, Three Levers: A Critical Review of On-Policy Self-Distillation

**论文信息**：*One Symptom, Three Levers: A Critical Review of On-Policy Self-Distillation*；Robert, Justin, Qader, Raheel；[arXiv:2608.25936](https://arxiv.org/abs/2608.25936)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：OPSD 的 collapse 不是一个 loss 的孤立缺陷，而是 token 信号落在哪里、教师看见什么、教师何时变化三根杠杆共同作用。

**为什么值得推荐、方法怎么工作**：综述从 OPD 的 frozen external teacher 追到 privileged self-teacher：学生按自己的 rollout 生成，教师看到参考解、计划或环境反馈后给逐 token dense signal。作者把文献中分散的 entropy collapse、mode narrowing 和 guidance decay 统一到 signal location、privileged view、teacher dynamics 三轴，并用 Figure 1/2 梳理方法谱系与共同公式。

**关键实验、局限与当天主题**：论文明确不报告新实验，范围也只到数学 reasoning；价值在于区分已较稳定的结论与仍相互冲突的解释。它提醒读者：单次 rollout 最长 1,024 token、15 万词表上的 dense supervision 虽便宜，却可能把多条可行路径压成一种。作为强读是因为它提供判断框架，不是因为刷新分数；引用时不应把综述的结构归纳当成因果验证。

### 26. VISA: Agentic Self-Evolving Data Synthesis for Multimodal Instruction Following

**论文信息**：*VISA: Agentic Self-Evolving Data Synthesis for Multimodal Instruction Following*；Zeng, Min, Tan, Guanxin, Cen, Libin, Wen, Yafei, Hu, Rui, Bian, Liuyang, Chen, Xiaolong, Chen, Xiaoxin；[arXiv:2608.26013](https://arxiv.org/abs/2608.26013)；Computation and Language (cs.CL)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：合成 instruction data 不应一次生成再过滤，而要把失败样本、verifier 结果和目标模型弱点写回下一轮数据策略。

**为什么值得推荐、方法怎么工作**：VISA 每轮先分析图像、排除不兼容约束并发现可验证约束，再从持久 memory 按多样性与难度采样组合，生成 instruction 后用可执行工具和结构化 LLM judge 复核。失败触发诊断恢复，成功样本还要探测 target model 难度；这些结果反向更新 constraint space，且同一 verifier contract 可直接成为 RL reward。Figure 1 展示 perception、planning/execution、reflection/update 的闭环。

**关键实验、局限与当天主题**：MM-IFEval 上，VISA 在不同设置中持续超过强合成基线，并在七个公共多模态 benchmark 上保持一般能力；Table 2/3 分别检查组件与外部能力。摘要没有给可脱离配置的统一提升数字，因此文章只保留方向性结论。风险是 memory 会累积 verifier 的系统偏差，LLM judge 与目标模型可能共盲，所谓 self-evolving 仍是外部数据管线而非参数自主进化。

### 27. DualOPSD: Adaptive Privileged Teachers for On-Policy Self-Distillation

**论文信息**：*DualOPSD: Adaptive Privileged Teachers for On-Policy Self-Distillation*；Chen, Yutong, Guo, Guangfu, Xu, Zhichao, Liu, Kunpeng；[arXiv:2608.26019](https://arxiv.org/abs/2608.26019)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：privileged teacher 若始终冻结，会越来越不适配正在变化的学生；让教师沿同一学生轨迹交替跟进，可以减少监督错位而不增加 rollout。

**为什么值得推荐、方法怎么工作**：DualOPSD 先让 student 从带参考信息的 teacher 学习，再让 teacher 在同一条 student trajectory 上向更新后的学生分布移动。两次更新共享 rollout，教师不另行生成，因此成本主要是额外反向而非采样。Figure 1 对比学生只看问题、教师同时看问题和 privileged reference 的不对称输入。

**关键实验、局限与当天主题**：Qwen3-8B non-thinking 下，相对 OPSD 的 avg@12 在 AIME 2024、AIME 2025、HMMT 2025 分别提高 23.61、13.89、10.00 点；1.7B 与 4B 显示增益依赖规模，三个尺度都减少 truncation，4B 的双向 KL 也更低。限制是二进制数学 verifier、两轮训练和固定 1,024 token 设置，teacher 跟随过快是否重现 self-distillation collapse 仍需长程实验。

### 28. A Visual Dependence-Aware Framework for Multimodal Unsupervised Continual Post-Training

**论文信息**：*A Visual Dependence-Aware Framework for Multimodal Unsupervised Continual Post-Training*；Li, Kaichen, Zhu, Zhilin, Huang, Jianhao, Lai, Zhengqin, Xiong, Baochen, Shao, Zibo, Song, Yaguang, Xiao, Linhui, Yang, Xiaoshan, Xu, Changsheng；[arXiv:2608.26095](https://arxiv.org/abs/2608.26095)；Computer Vision and Pattern Recognition (cs.CV) ; Artificial Intelligence (cs.AI)；列入 2026-08-27 官方列表。

**一句话 TL;DR**：无标签多模态持续训练不能均匀优化所有 token；视觉依赖的结构既是遗忘报警器，也是新任务塑性该投向哪里的坐标。

**为什么值得推荐、方法怎么工作**：VDA 先估计 token 对视觉输入的 dependence。VC-OT 用区域感知代价和分层 transport penalty 保护旧任务的视觉依赖结构，禁止注意力退化成纯语言偏置；VMA 再提高强视觉 token 的适配权重以学习新流数据。Figure 2 展示实体、关系与弱视觉 token 的依赖异质性，Table 3 分离调制、强度保护和结构运输。

**关键实验、局限与当天主题**：六个连续多模态任务上，VDA AvgAcc 为 62.5%，比最强无监督 post-training 方法高 3.7 点、比 SEEKR-MLLM 高 2.4 点，并把冻结 Qwen2.5-VL-7B 提高 8.6 点；AvgLA 63.0%，forgetting 仅 0.6。风险是 dependence 估计和任务顺序由 benchmark 定义，答案无标签不等于现实流无偏，扩展到更长序列和新模态的计算成本尚不清楚。

## 中相关论文速读

这些论文对两条主线有实质贡献，但证据规模、任务边界或方法中心性不足以占用与强相关论文相同的阅读成本。

### 1. [Secret MCP: Evidence-Bounded and Context-Isolated Design Specification Generation from Web Screenshots](https://arxiv.org/abs/2608.24944)

**问题、方法与保留判断**：它把 screenshot-to-code 前的设计规格生成做成证据隔离系统：每个参考页面单独采样、记录坐标和色板，并用 19 节 contract 标注 measured/observed/inferred/unknown。两份输出零交叉标识污染、三个静态索引均含全部章节，但验证只覆盖编排与语法，不证明重建视觉正确，因此保留为可审计前处理方案。 论文列入 2026-08-27 官方列表，分类为 Software Engineering (cs.SE)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 2. [The Evolution of Binary Decompilation in the Modern Era: A Taxonomy, Literature Review, and Future Perspectives](https://arxiv.org/abs/2608.24955)

**问题、方法与保留判断**：系统综述给出现代二进制反编译的 taxonomy、指标、工具与 benchmark 版图，最重要的负判断是 ground truth 不可靠且缺少标准化比较。它对 legacy maintenance 与代码理解有背景价值，但没有新的 Agent workflow 或仓库级执行证据，适合速读挑战与评价章节。 论文列入 2026-08-27 官方列表，分类为 Software Engineering (cs.SE) ; Cryptography and Security (cs.CR)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 3. [Evaluating and Preventing Security Smells in AI-Generated Ansible Code](https://arxiv.org/abs/2608.24962)

**问题、方法与保留判断**：16 个模型生成 278 个 Tomcat/MongoDB Ansible role 时，无安全引导全部留下 security smell；把 CIS 与 best practice 写入扩展 CO-STAR 后，4 个模型能合规，最佳达 95%--100%，人类样本为 23%--43%。亮点是基础设施代码与真实合规 oracle，局限是强依赖提示和两种部署栈。 论文列入 2026-08-27 官方列表，分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Cryptography and Security (cs.CR)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 4. [DataKernelBench: Can LLMs Optimize Database Queries on GPUs?](https://arxiv.org/abs/2608.25061)

**问题、方法与保留判断**：DataKernelBench 让 Agent 从 SQL/TorchPlan 出发，在 H100 上执行、修复并优化 CUDA/Triton；最强完整查询配置在 SF10 全通过时加速 2.11 倍，四卡 SF100 加速 2.54 倍。它证明数据库算子与 ML kernel 不同，工作负载上下文比硬件描述更重要；目前只有 TPC-H 与特定 GPU。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Databases (cs.DB); Machine Learning (cs.LG); Programming Languages (cs.PL)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 5. [Auto-Policy, not Auto-Skill: Compiled Agent Skills for the Physical World](https://arxiv.org/abs/2608.25091)

**问题、方法与保留判断**：Auto-Policy 区分 advisory skill 与可执行 authority，把 world state 和 sensor evidence 的 typed guard 与技能一起编译。Edge Skillguard 在真实边缘控制面拒绝 60/60 个 borrowed-authority 请求且不拦良性调用。概念与高风险 Agent 安全高度相关，但物理 testbed 小、攻击类型有限，尚不能替代通用授权系统。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Cryptography and Security (cs.CR)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 6. [SPECMINE: A Large-Scale Corpus of Spec-Driven Development Artifacts](https://arxiv.org/abs/2608.25202)

**问题、方法与保留判断**：SPECMINE 收集 470,795 个 spec 文件、73,030 个仓库和 17 种工具，另有 98,574 个 Kiro 工件；5,992 个改 spec 的 PR 与 242 万条 typed reference 让“规格如何变成代码”首次可规模研究。它是数据基础设施而非 Agent 方法，代表性、机器人生成比例和许可证仍需后续清洗。 论文列入 2026-08-27 官方列表，分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 7. [LLM-Driven, Datasheet-Aware Automated Hardware Compatibility Verification for Early-Stage, Pre-Schematic Embedded System Design](https://arxiv.org/abs/2608.25217)

**问题、方法与保留判断**：框架把 34 份 datasheet 与连接关系转成 design graph，只检索显式验证规则所需属性，再生成确定性脚本做兼容判断；7 个嵌入式设计上准确率 97.5%，输入上下文缩小 8.6 倍。它的价值在 traceable stage 和数值计算不交给 LLM，规模与规则覆盖仍偏小。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Systems and Control (eess.SY)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 8. [FLARE: Verifying MILP Reformulations with LLM-Based Theorem Proving](https://arxiv.org/abs/2608.25220)

**问题、方法与保留判断**：FLARE 用构造性 MILP reformulation 定义和 Lean 证书验证模型改写，FormulationBench 含 20 题、109 个 formulation，NP-hard 子集准确率 100%。FLARE-NL 可在不要证书时给更便宜代理。这里的强点是 machine-checkable acceptance，边界是领域只到 MILP 形式化与参考 formulation。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Logic in Computer Science (cs.LO); Optimization and Control (math.OC)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 9. [Provenance Before Prose: Claim-Locked Reporting](https://arxiv.org/abs/2608.25336)

**问题、方法与保留判断**：claim-locked reporting 在写 prose 前固定证据源、数值、方向和允许的措辞强度；相对仍让模型选数的 hybrid template，fMRI 与 RCT 报告的复现性分别提高 37.4 和 20.5 点。它是生成结果审计的好协议，但场景是科学报告而非代码改动，人工审计规模与模板覆盖限制外推。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 10. [Where vs What: Decomposing Structural and Content Failures in LLM-Generated Structured Outputs](https://arxiv.org/abs/2608.25358)

**问题、方法与保留判断**：SCD 把结构输出失败拆成 placement 与 value error；高复杂度下 DeepSeek-V4-Flash 仍错放 35% 已召回值，Qwen2.5-7B 为 74%。将结构定位变成 GRPO 的可验证奖励后，JSON VPA 从 26% 升到 63%，并迁移到表格。它属于结构可靠性与 RLVR 的交叉，尚未到仓库级 schema evolution。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 11. [Can your AI agent be cheaper? Investigating the effects of task specifications on token spend in agentic coding tasks](https://arxiv.org/abs/2608.25399)

**问题、方法与保留判断**：2,700 次 Kimi K3 coding-agent 运行显示，把完整规格缩成 user story 会多花 29.7% token，任务间提示敏感性为 13%--115%；一次便宜 probe 可在 36% 误差内估计新任务配置成本。结论对成本治理直接有用，但只有单模型和合成规格强度，质量与 token 的因果权衡仍不完整。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 12. [Retry Amplification in Distributed Systems: A Systematic Analysis of Retry Policies and Their Role in Cascading Failures](https://arxiv.org/abs/2608.25403)

**问题、方法与保留判断**：200 个 Python 微服务中显式 retry 仅检出 11.5%，人工审计估计真实约 41%；已检出的生产配置里 60.9% 至少一处无 backoff，113 个配置仅一个随机延迟。相关故障下标准 retry 把成功率从 55.4% 降到 41.5%。这不是 Agent 论文，却是 coding agent 修改分布式策略时必须保留的系统级 oracle。 论文列入 2026-08-27 官方列表，分类为 Software Engineering (cs.SE)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 13. [MACGen: Toward Functionally Correct and Secure Code Generation via Multi-Agent Collaboration](https://arxiv.org/abs/2608.25457)

**问题、方法与保留判断**：MACGen 用 planner、security advisor、coder、reviewer 的结构化工件传递避免共享长对话；在 CWEval 与 BaxBench 上，功能与安全联合 F&S@1 相对 direct prompting 分别提高 19.61 和 10.57 点。方法清楚但仍是生成基准，真实依赖、构建与补丁最小性没有覆盖。 论文列入 2026-08-27 官方列表，分类为 Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI); Multiagent Systems (cs.MA)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 14. [Separating Disclosure from Authorization: Field-Tier Minimization for Agent Action Mediation](https://arxiv.org/abs/2608.25474)

**问题、方法与保留判断**：论文把 Agent action 的授权字段与审计披露字段分层，避免支付备注、收件人和记录标识原样进入不可删除 ledger。field-tier minimization 说明“可授权”不必等于“全量留痕”。它对高风险工具调用很重要，但安全性依赖字段分类、attestation 与下游验证器，跨系统组合效果尚未证实。 论文列入 2026-08-27 官方列表，分类为 Cryptography and Security (cs.CR) ; Software Engineering (cs.SE)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 15. [When Stale Constraints Go Unchecked: Budgeted Verification Failures in Inherited Agent Memory](https://arxiv.org/abs/2608.25553)

**问题、方法与保留判断**：这项研究聚焦 inherited agent memory 中过期约束：当验证预算有限，旧规则会继续影响检索和行动。核心判断是记忆不仅要相关，还要有版本、适用范围与重新验证优先级。它靠受控检索实验展示 stale constraint 的系统性失败，但与真实软件版本漂移、多人修改和长期持久化的距离仍大。 论文列入 2026-08-27 官方列表，分类为 Information Retrieval (cs.IR) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 16. [DBcover: A White-box SQL Test Generation Framework for Coverage Improvement](https://arxiv.org/abs/2608.25573)

**问题、方法与保留判断**：DBcover 是面向 SQL 的白盒 test generation，把覆盖反馈用于构造能进入未触达逻辑的查询。它补上数据库代码中传统单测难表达的路径 oracle，适合关注执行反馈与程序分析；但主对象是 DBMS 内部覆盖，不是 LLM Agent，也没有长程仓库修改。 论文列入 2026-08-27 官方列表，分类为 Databases (cs.DB) ; Software Engineering (cs.SE)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 17. [JIT-Agent: Scaling Harness Intelligence via Just-in-Time Harness Evolution](https://arxiv.org/abs/2608.25593)

**问题、方法与保留判断**：JIT-Agent 在任务进行中生成、评估和更新 harness 组件，主张把固定 scaffold 变成按故障即时演化的外部能力。应保留的判断是 harness 本身会决定模型可见状态与可恢复性；不过自生成组件的选择集、回归验证和成本会被多轮搜索消耗，结果需按 hidden evaluation 看。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL) ; Machine Learning (cs.LG)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 18. [Narcissus: Program Synthesis Using Context-Aware LLM Approximations](https://arxiv.org/abs/2608.25657)

**问题、方法与保留判断**：Narcissus 用 context-aware LLM approximation 辅助 program synthesis，在精确求解困难处以近似模型引导搜索。它与 neuro-symbolic coding 有明确关系，但任务规模、正确性保证和 approximation error 的处理比 repository repair 更窄，适合作为合成器设计参考而非 Agent 能力证据。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG); Programming Languages (cs.PL); Software Engineering (cs.SE)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 19. [From General Agents to RCA Experts: A Self-Evolving Harness for Root Cause Analysis](https://arxiv.org/abs/2608.25661)

**问题、方法与保留判断**：该工作把通用 Agent 变成 RCA 专家，持续把失败诊断、工具选择与验证结果写回 harness，而非只加一次领域 prompt。自演化外部状态对真实运维很有吸引力；但 root cause 的 ground truth、日志可观测性和不同系统间迁移仍决定结论上限，因此放中相关。 论文列入 2026-08-27 官方列表，分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 20. [AI Slop and Hallucinations in Vulnerability Assessment: A Survey on Reasoning Failures and Trustworthy Mitigation](https://arxiv.org/abs/2608.25667)

**问题、方法与保留判断**：这篇综述系统整理漏洞评估中的 AI slop、推理幻觉和缓解办法，提醒读者安全报告的 fluent prose 不能替代证据。它没有新的 patch 或 evaluator，但可作为 vulnerability agent 的失败 taxonomy；需警惕综述收录范围和快速变化的模型版本。 论文列入 2026-08-27 官方列表，分类为 Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 21. [From Verdict to Diagnosis: Attributable Security Review of Pull Requests](https://arxiv.org/abs/2608.25730)

**问题、方法与保留判断**：工作把 pull-request security review 从最终 verdict 推到可归因 diagnosis，要求指出风险落在哪个改动与证据链。这个方向比单一风险标签更可行动，也适合检验误报；但若缺少 clean PR control、可执行 exploitation 或开发者确认，诊断分仍可能只是更详细的 judge 输出。 论文列入 2026-08-27 官方列表，分类为 Cryptography and Security (cs.CR)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 22. [SkillShield: Prompt-Space Security Skills for LLM Coding Agents](https://arxiv.org/abs/2608.25817)

**问题、方法与保留判断**：SkillShield 以 prompt-space security skill 约束 coding agent，在不能改 API 模型权重时提供可部署防线。它直接面对文件编辑和 shell 权限，但仍是提示层：对抗者可利用多轮分解、工具输出注入和语义伪装；若没有执行边界与独立审计，低攻击成功率不能等价于系统安全。 论文列入 2026-08-27 官方列表，分类为 Cryptography and Security (cs.CR)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 23. [Beyond the Editing Canvas: Evidence Divergence in OOXML-to-LLM Ingestion](https://arxiv.org/abs/2608.25880)

**问题、方法与保留判断**：论文揭示 OOXML 在编辑画布、解析器和 LLM ingestion 中可能呈现不同证据，模型看到的文本并不等于用户可见状态。这个 evidence divergence 对文档 Agent、代码生成配置和审计都重要；主贡献是文件格式攻击面而非软件变更方法，适合记住“可见状态必须跨解析栈核对”。 论文列入 2026-08-27 官方列表，分类为 Software Engineering (cs.SE) ; Cryptography and Security (cs.CR)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 24. [Answer Is Cheap, Show Me the Evidence! Augmenting Automated Vulnerability Assessment with Evidence](https://arxiv.org/abs/2608.25905)

**问题、方法与保留判断**：自动漏洞评估加入截图、代码片段与项目上下文，并要求输出支持结论的证据，不再只预测 CVSS 类标签。它符合 evidence-carrying security review 的方向；可信度仍取决于证据是否真正判别漏洞、是否包含 clean control，以及项目上下文是否带来泄漏。 论文列入 2026-08-27 官方列表，分类为 Software Engineering (cs.SE)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 25. [Repair or Resample? Rethinking Failure Debugging in LLM Multi-Agent Systems](https://arxiv.org/abs/2608.25920)

**问题、方法与保留判断**：论文在固定多 Agent 失败轨迹上比较 repair 与 resample，试图分开局部调试是否比重新生成更有效。保留判断是失败恢复策略要按故障类型选，不能默认 reflection 总有用。若 agent roles、候选预算和 judge 同时改变，结论会混入架构效应，因此只做速读。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 26. [Code World Model: Coding Agent as World Brain](https://arxiv.org/abs/2608.25927)

**问题、方法与保留判断**：Code World Model 把代码与规则视为可执行世界状态，试图让 coding agent 预测行动的持续后果，而不是只模仿局部 diff。概念有野心，尤其适合长依赖链；当前证据更像研究纲领，world state 如何对齐真实构建、服务和 UI 行为仍是核心缺口。 论文列入 2026-08-27 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 27. [Praxist: From Experimental Artifacts to Solution Lineages](https://arxiv.org/abs/2608.25955)

**问题、方法与保留判断**：Praxist 将实验工件组织成 solution lineage，保存某个结果从哪些尝试、代码和证据演化而来。它为 agentic research 与软件演化提供比最终压缩包更好的 provenance，但 lineage 捕获成本、分支合并和外部环境版本化仍需实证。 论文列入 2026-08-27 官方列表，分类为 Multiagent Systems (cs.MA) ; Software Engineering (cs.SE)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 28. [Vulnerable Code Search: Transferable Attack for Code Language Models](https://arxiv.org/abs/2608.26031)

**问题、方法与保留判断**：Vulnerable Code Search 研究针对 code language model 的可迁移攻击，说明检索和相似性模型也能成为安全链路的脆弱点。它对漏洞定位 Agent 的输入可信度重要，但主要是模型攻击，不是修复 workflow；需要区分搜索结果被操纵与真实补丁错误。 论文列入 2026-08-27 官方列表，分类为 Software Engineering (cs.SE) ; Cryptography and Security (cs.CR)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 29. [Trace Integrity for LLM Data Agents: A Vision for Auditable Structured Reasoning in Real-World Systems](https://arxiv.org/abs/2608.26036)

**问题、方法与保留判断**：Trace Integrity 提出数据 Agent 的结构化、可审计 reasoning 轨迹愿景，要求声明能追到数据操作和中间状态。问题定义正确，但论文定位为 vision：没有完整后端审计、篡改模型或大规模实证，不能把“结构化 trace”直接当作真实性证明。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 30. [RTLGuard: A Lightweight Teacher-Student Defense for Poisoned RTL Code Generation Models](https://arxiv.org/abs/2608.26049)

**问题、方法与保留判断**：RTLGuard 用 teacher-student 防御被投毒的 RTL 代码生成模型，关心第三方微调权重把后门带进硬件。它覆盖 code generation、模型供应链和可综合验证的交叉；轻量防御是否保持功能、能否处理未知触发器与时序侧效应仍需更广基准。 论文列入 2026-08-27 官方列表，分类为 Cryptography and Security (cs.CR) ; Hardware Architecture (cs.AR)。它在本期归入 coding-agent / software-change 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 31. [aipsy-judge: A Specialized, Psychologist-Corrected Local Judge for the Psychological Safety of Conversational AI](https://arxiv.org/abs/2608.24899)

**问题、方法与保留判断**：aipsy-judge 由心理学家校正本地 judge，针对对话式 AI 的心理安全。它说明领域 reward/evaluator 需要专家纠错而非通用 rubric；但任务域、标签一致性和模型共识限制明显，且论文重点是评测器，不是训练算法。 论文列入 2026-08-27 官方列表，分类为 Human-Computer Interaction (cs.HC) ; Artificial Intelligence (cs.AI); Computers and Society (cs.CY)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 32. [Analyzing and Correcting Benevolence Bias in Large Language Models](https://arxiv.org/abs/2608.24912)

**问题、方法与保留判断**：研究识别并修正 LLM 的 benevolence bias，属于 post-training 改变价值判断的实质问题。应关注修正是否只把分数移到另一端、是否保持事实能力与跨文化泛化；若控制主要靠提示或小样本微调，就不宜把行为改善外推成稳定对齐。 论文列入 2026-08-27 官方列表，分类为 Human-Computer Interaction (cs.HC) ; Artificial Intelligence (cs.AI)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 33. [Unsupervised Post-Training of Foundation Models: A Survey](https://arxiv.org/abs/2608.24982)

**问题、方法与保留判断**：综述系统整理 foundation model 的 unsupervised post-training：目标、数据构造、持续适配和评测。它适合建立术语与方法地图，尤其能看清无标签目标如何同时影响塑性与遗忘；没有新实验，结论依赖收录边界，故放中相关而非当天机制核心。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Computer Vision and Pattern Recognition (cs.CV); Machine Learning (cs.LG); Multimedia (cs.MM)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 34. [Towards Reliable, Generalizable, and Specific In-Context Knowledge Editing via Multi-Objective Reinforcement Learning](https://arxiv.org/abs/2608.25100)

**问题、方法与保留判断**：多目标 RL 用可靠性、泛化与特异性共同约束 in-context knowledge editing，避免只看编辑命中率。贡献在于把冲突目标显式放入 Pareto/奖励设计；局限是 in-context editing 不等于权重更新，reward 权重和知识基准可能掩盖开放域副作用。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 35. [Tunable Tool-Call Rates in LLM Agents via Representation Steering](https://arxiv.org/abs/2608.25198)

**问题、方法与保留判断**：representation steering 调整 Agent 的 tool-call rate，让部署者不改权重也能控制调用倾向。它能分离“会不会用工具”和“用多少”，适合作为训练方法的对照；但 steering 是推理时干预，调用频率不是正确性，过度抑制可能把需要外部证据的任务变成幻觉。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 36. [Learning Mixtures of Plackett-Luce Models for Multi-Objective Alignment](https://arxiv.org/abs/2608.25200)

**问题、方法与保留判断**：论文学习 Plackett-Luce mixture 以表达多目标 alignment 偏好，比把所有用户压成单一 pairwise ordering 更灵活。值得保留的是偏好异质性应进入模型而非只调一个权重；可辨识性、组件数选择和真实人类偏好漂移仍是主要风险。 论文列入 2026-08-27 官方列表，分类为 Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 37. [Mitigating LLM sycophancy with RL-based fine-tuning: Bayesian Truth Serum approach](https://arxiv.org/abs/2608.25267)

**问题、方法与保留判断**：Bayesian Truth Serum 被用于 RL-based fine-tuning 以降低 sycophancy，试图奖励独立判断而非迎合多数。关键要核对 truthful signal 是否在无客观真值任务中仍成立，以及模型是否学会操纵报告分布；结果有对齐价值，但奖励投机与域外迁移需谨慎。 论文列入 2026-08-27 官方列表，分类为 Machine Learning (cs.LG) ; Systems and Control (eess.SY)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 38. [PointRL: Learning Point-Level Vision-Language Grounding from Verifiable Annotation Evidence](https://arxiv.org/abs/2608.25299)

**问题、方法与保留判断**：PointRL 从可验证 annotation evidence 学习点级视觉语言 grounding，把奖励落到可检查坐标而不是整句描述。它是 multimodal RLVR 的代表边缘项；点标注的可验证性强，但视觉推理、关系与遮挡并不都能化成单点证据。 论文列入 2026-08-27 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 39. [Learning What to Share and What to Personalize: Hierarchical Strategy Co-Evolution for Agent Memory](https://arxiv.org/abs/2608.25329)

**问题、方法与保留判断**：层级策略共演化决定 Agent memory 中什么跨任务共享、什么保留个性化，直面经验污染与过度共享。它更像外部记忆优化，不是权重 post-training；评测若只在同分布任务，容易高估共享策略对真实漂移的稳健性。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 40. [Where to Look Matters: On-Policy Self-Distillation for Long-Video Understanding](https://arxiv.org/abs/2608.25356)

**问题、方法与保留判断**：长视频 OPSD 研究 privileged teacher 应关注哪些片段，再把逐 token 信号给学生。它把“教师看哪里”具体化，和当天 OPSD 三杠杆吻合；但任务是视觉理解，collapse、teacher leakage 与跨视频域泛化需要比最终准确率更细的诊断。 论文列入 2026-08-27 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 41. [Refusal geometry reflects refusal training: diverse refusal prefixes can raise stable rank and weaken refusal vector ablation attacks](https://arxiv.org/abs/2608.25390)

**问题、方法与保留判断**：论文把多样 refusal prefix 与训练后 refusal geometry 联系起来：更丰富的拒答训练提高稳定秩并削弱单一 refusal vector ablation。它提供训练数据多样性影响机制稳健性的证据；但更难被线性消融不等于更安全，越狱、过拒与实用性仍需独立测。 论文列入 2026-08-27 官方列表，分类为 Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Cryptography and Security (cs.CR)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 42. [Distance Is Not Enough: Forget-Retain Alignment Gap Predicts LLM Relearning Robustness](https://arxiv.org/abs/2608.25429)

**问题、方法与保留判断**：forget-retain alignment gap 比单纯权重距离更能预测 unlearning 后的 relearning robustness，提醒人们“看似忘掉”可能很快恢复。它对安全 post-training 和持续学习重要；结论依赖所用遗忘算法、攻击预算和知识类型，不能把一个距离指标当通用证书。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 43. [DeCO: Discriminative Evidence Composition for Fine-Grained Dataset Distillation](https://arxiv.org/abs/2608.25480)

**问题、方法与保留判断**：DeCO 用 discriminative evidence composition 做细粒度 dataset distillation，重点不是样本逼真，而是保留类间判别证据。它属于广义合成数据筛选，和 LLM post-training 只有方法层邻接；视觉小数据结果不应直接外推到指令数据。 论文列入 2026-08-27 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV) ; Artificial Intelligence (cs.AI)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 44. [MMJailBench: A Factorized Benchmark for Disentangling Multimodal Jailbreak Vulnerabilities](https://arxiv.org/abs/2608.25490)

**问题、方法与保留判断**：MMJailBench 因子化多模态 jailbreak 的文本、图像与组合漏洞，适合检验安全后训练究竟修复哪一环。它是评价集而非新的 alignment recipe，且攻击模板与 judge 会迅速过时；作为 audit 基线比作为能力排行榜更有价值。 论文列入 2026-08-27 官方列表，分类为 Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI); Multimedia (cs.MM)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 45. [Agentic Game Development as a Verifiable Trajectory Data Engine for Scaling World Models](https://arxiv.org/abs/2608.25518)

**问题、方法与保留判断**：用 Agent 自动开发游戏并保留可执行轨迹，为 world model 制造可验证训练数据。亮点是生成任务、程序与运行结果同源，奖励可由游戏执行检查；风险是引擎规则封闭、Agent 生成偏差会进入数据，游戏成功也不代表通用世界建模。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 46. [GRIP: Granular Reward-Guided Parameter Interpolation for Efficient Reasoning](https://arxiv.org/abs/2608.25583)

**问题、方法与保留判断**：GRIP 以 granular reward 引导参数插值，在多个 checkpoint 之间寻找更高效 reasoning 模型。它把模型合并与 reward signal 结合，训练成本可能低于全量 RL；但插值空间、reward overfitting 和不同能力冲突决定其适用面。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 47. [From Specialization to Generalization: Instruction-tuned LLMs for Robust Harmful Content Mitigation](https://arxiv.org/abs/2608.25605)

**问题、方法与保留判断**：instruction-tuned LLM 用于 harmful content mitigation，关注从专门域到新域的泛化。应重点看训练数据覆盖、过拒和少数群体误伤，而不是只报宏平均；如果域外安全提升伴随 utility 损失，就不能称为稳健对齐。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 48. [Plans You Can Check: Verifier-Grounded Learning of an Open-Weight Planner for Executable Video-Editing](https://arxiv.org/abs/2608.25622)

**问题、方法与保留判断**：RefineCut 先用 verifier-grounded 数据训练开放权重视频编辑 planner，再在可执行闭环中迭代蒸馏；协议分从 0.620 到 0.858，演化版达 0.924，8B planner 可追平前沿教师。它把计划、执行和 verifier 绑定得很好，但视频编辑 oracle 仍比通用工具环境封闭。 论文列入 2026-08-27 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV) ; Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 49. [AutoVerifier: Residual-Guided Non-Parametric Optimization for Reference-Based Answer Verification](https://arxiv.org/abs/2608.25637)

**问题、方法与保留判断**：AutoVerifier 将反复出现的等价判断错误写成 rule card，只有 replay 无直接回归后才升级为代码模块或提示规则；四个 verifier benchmark 上大幅领先。它的优点是非参数、可编辑和有回放门槛，风险是回归集有限、规则交互会累积技术债。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 50. [Fairness-Aware Test-Time Prompt Tuning](https://arxiv.org/abs/2608.25707)

**问题、方法与保留判断**：FairTPT 在测试时用 soft prompt 同时压低目标熵、抬高伪属性熵；研究发现普通 TTA 常扩大群体差距，过度 blinding 还会灾难性遗忘。它是 test-time adaptation 而非长期 post-training，但对“适配一定改善公平”的直觉给出重要反例。 论文列入 2026-08-27 官方列表，分类为 Machine Learning (cs.LG)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 51. [Reassembling Distributed Risk: Trajectory-Conditioned Action Generation for Multi-Turn Agent Safety](https://arxiv.org/abs/2608.25711)

**问题、方法与保留判断**：ReDiR 把多轮轨迹压成 latent safety representation，在每次 action 生成前注入冻结模型；三模型、八个未见工具域上把攻击成功率压到 8% 以下并保持良性 fidelity。它有跨轮安全训练价值，但 latent 证据不可直接审计，攻击集与同模型监督可能共享盲区。 论文列入 2026-08-27 官方列表，分类为 Cryptography and Security (cs.CR)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 52. [Localize-Then-Decide Guarantees for LLM Judgments](https://arxiv.org/abs/2608.25824)

**问题、方法与保留判断**：Localize-Then-Decide 先用 conformal prediction 给出高概率包含人类偏好答案的 shortlist，再用校准置信度选择或 abstain，修复候选多时 confidence 单调性失效。它提供 judge agreement 保证，但保证依赖 exchangeability 与校准集，分布漂移后必须重校准。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 53. [Socialized Detector Learning: Trajectory-Guided and Reciprocal Distillation for Heterogeneous Object Detectors](https://arxiv.org/abs/2608.25836)

**问题、方法与保留判断**：TGRD 先按 held-out feature residual 估计 detector 间转移难度并规划蒸馏顺序，再把 union-category carrier 的知识回传专家；两种初始化均比同时聚合高 2.6 AP，专家在新类上达 20.8--28.4 AP。它展示 order-aware distillation，主要仍是视觉检测器社会。 论文列入 2026-08-27 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 54. [Anchoring Bias in LLM-as-a-Judge Systems: Prior Scores Compromise Evaluation Independence](https://arxiv.org/abs/2608.25869)

**问题、方法与保留判断**：185,271 次成功 judge 评估中，先前分数仅作为元数据也会锚定七个模型；Cohen's d 绝对值最高 0.71，行业数据中阻断 48% 错误修正并把 10.18% 正确判断翻错。CoT 与忽略警告都没消除效应。任何用 judge 反复筛数据或给 reward 的管线都应隔离历史分数。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 55. [From Passive Response to Proactive Correction: Enhancing LLM Robustness Against Input Fact Perturbations](https://arxiv.org/abs/2608.25894)

**问题、方法与保留判断**：DEDUCE 先抽取并验证输入事实，再多视角制定纠错策略，最后在回答中主动修正错误前提；TruthfulQA、FalseQA 与 MisFactQA 上跨 Qwen/LLaMA/Gemma 均提升。方法更像推理 scaffold，若无参数更新则不属于严格 post-training，但它定义了值得训练的鲁棒行为。 论文列入 2026-08-27 官方列表，分类为 Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 56. [Candidate supply and answer selection shape the value of LLM judging in multi-agent systems](https://arxiv.org/abs/2608.25937)

**问题、方法与保留判断**：固定 81,390 个候选池后，只改变终局选择规则，将频率与 judge 信号结合，准确率从 63.82% 升到 70.82%--70.95%。15,336 题分析显示 judge 可靠性取决于任务、生成器和正确答案稀有度。它是选择机制诊断，不是新训练算法，但能防止把 candidate supply 错算成 judge 能力。 论文列入 2026-08-27 官方列表，分类为 Artificial Intelligence (cs.AI) ; Multiagent Systems (cs.MA)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 57. [A Self-Evolving Multi-Agent Framework Defense against LLM Jailbreak Attacks](https://arxiv.org/abs/2608.26008)

**问题、方法与保留判断**：自演化 jailbreak 防御把成功攻击抽象成方法级规则并存入跨交互 memory，随后用 prompt 复用，不更新参数。它在四类黑盒攻击中降低 ASR 且保持 utility，说明外部记忆也能做持续防御；但这严格说是 test-time adaptation，规则投毒与遗忘策略尚未解决。 论文列入 2026-08-27 官方列表，分类为 Cryptography and Security (cs.CR) ; Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 58. [How Much Rank Does LoRA Need? Rank-Error Bounds for Transformer Attention](https://arxiv.org/abs/2608.26052)

**问题、方法与保留判断**：论文给出 LoRA rank 与 Transformer attention 近似误差的上下界，以 downstream-weighted tail energy 连接任务几何、softmax 饱和和多头 rank sharing。它为“rank 选多少”提供理论而非经验表；假设、单头可实现性与真实非线性训练间仍有距离。 论文列入 2026-08-27 官方列表，分类为 Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 59. [$R^3$: Training Robots to Reason in Natural Language via Reinforcement Learning](https://arxiv.org/abs/2608.26053)

**问题、方法与保留判断**：R3 先用专家语言 reasoning trace 做 mid-training，再从离线动作数据进行单步 rubric RL，让 VLM 用自由文本指导低层 manipulation policy；在 Language Table 与双臂装袋上优于 instruction-only imitation。它扩展 post-training 到机器人，但仿真任务、rubric 与低层策略误差限制外推。 论文列入 2026-08-27 官方列表，分类为 Robotics (cs.RO) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL); Machine Learning (cs.LG)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

### 60. [VBVR-Pro: A Scalable and Verifiable Suite for Native Visual Reasoning](https://arxiv.org/abs/2608.26105)

**问题、方法与保留判断**：VBVR-Pro 提供 300 个程序生成任务、确定性可验证 scorer 和多任务 RL，外部迁移覆盖七个视觉推理 benchmark，并比较 30 多种图像、视频与交错生成器。它证明视觉生成可以成为 reasoning substrate；程序化任务与规则 scorer 仍可能让模型学会封闭世界 shortcut。 论文列入 2026-08-27 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG); Multimedia (cs.MM); Robotics (cs.RO)。它在本期归入 post-training 中相关：值得保留上述机制或负结论，但不应越过其数据、模型和评测边界。

## 可留意 / 可跳过

这些工作与两条主线存在明确邻接，但今天可以先记住关键词和边界，不必按核心论文投入同等阅读时间。

- **[MCP-Driven Accessibility Tree Standardization for AI-Powered Screen Reader Agents](https://arxiv.org/abs/2608.24898)**：MCP 统一 accessibility tree 有助于 GUI Agent 获得语义状态，但主贡献是接口标准化，缺少软件修改与执行后 oracle。
- **[SimVerity: When Does Simulated Agent Success Survive Physical Deployment?](https://arxiv.org/abs/2608.25067)**：SimVerity 比较仿真成功能否落到物理部署，适合记住 sim-to-real 验收；它不是 coding 或 post-training 方法。
- **[Federation Is Nearly Free, Reasoning Is Not: Tradeoffs for AI Co-Scientists in Protein Characterization Workflows](https://arxiv.org/abs/2608.25215)**：跨机构 AI co-scientist workflow 的 federation 几乎免费、reasoning 才是成本瓶颈；领域工作流相关，软件变更证据较弱。
- **[Point-in-Time Audit Before Alpha: Public-Archive Availability and a Negative Matched-Budget Study on BTC Perpetual Futures](https://arxiv.org/abs/2608.25348)**：提交前 point-in-time audit 与 matched-budget 负结果强调时间绑定证据；对象是交易归档，不应当作通用 Agent benchmark。
- **[Paint What You See: Benchmarking Dexterous Visual Tool Use in Multimodal Agents](https://arxiv.org/abs/2608.25417)**：多模态 Agent 的视觉工具使用 benchmark 能测动作 grounding，任务偏具身单步，和仓库级 change 有距离。
- **[CaSKG: Counterfactual-Causal Skill Graphs for Scalable Agent Skill Retrieval](https://arxiv.org/abs/2608.25500)**：反事实因果 skill graph 改善 Agent skill retrieval；重点是检索编排，未证明技能执行正确或版本兼容。
- **[LocalLSTC: A Long Short-Term Control Architecture for Locally Deployed GUI Agents](https://arxiv.org/abs/2608.25777)**：本地 GUI Agent 的长短期控制架构值得关注状态管理，但缺少移动软件修复或跨应用长期验证。
- **[Closing the Gap: Automated Discovery of Secure Dockerfile Reference Standards via Semantic Clustering in Enterprise Inner Source](https://arxiv.org/abs/2608.25793)**：企业内源 Dockerfile 安全标准自动发现可支撑 IaC review；主要是语义聚类，补丁正确性证据有限。
- **[Formal, Executable and Explainable Runtime Monitoring of Spoken Air Traffic Control Operational Procedures](https://arxiv.org/abs/2608.25926)**：语音空管程序的形式化、可执行 runtime monitoring 展示强 oracle；领域专用，和 coding Agent 只在验证理念上相邻。
- **[ProgRouter: Online Progress-Guided Orchestration for Multi-Agent LLM Workflows under Quality-Cost Tradeoffs](https://arxiv.org/abs/2608.25992)**：ProgRouter 按在线进展调度多 Agent 质量与成本，属于 workflow orchestration，不改变模型也不验证软件语义。
- **[AsymSpec: Context-Asymmetric Speculative Decoding for Agentic LLMs](https://arxiv.org/abs/2608.26004)**：AsymSpec 用不对称上下文 speculative decoding 降低 agentic inference 成本；是 serving 优化，不是可靠性或 post-training。
- **[Agentic Autoresearch for Cell-Edge Power Control: Radically Redefining the Researcher's Role](https://arxiv.org/abs/2608.26093)**：自动地理预测研究 Agent 选数据与模型，适合观察 research workflow；证据集中单领域，软件演化关联弱。
- **[Detection != Reliable Control: Decodable Empathy Directions Yield at Most Partial Shifts in Automated Empathy Scores](https://arxiv.org/abs/2608.24901)**：activation steering 对 empathy 分数只能产生部分移动，提醒可解码方向不等于可控行为；属于推理时控制反例。
- **[Dynamic Influence-Weighted Distillation for Single-IMU Activity Recognition](https://arxiv.org/abs/2608.24904)**：影响加权蒸馏用于单 IMU 活动识别，是通用小模型蒸馏，不能直接外推 LLM。
- **[Domain-Adaptive ASR for Telephony AI Agents: Fine-tuning Canary Flash Models for Enterprise Contact Center Applications](https://arxiv.org/abs/2608.24916)**：Canary Flash 的企业电话 ASR 微调有应用价值，训练机制常规、数据域窄。
- **[The Dialect Tax: Dialectal Biases Persist throughout the Language Modeling Pipeline](https://arxiv.org/abs/2608.24952)**：方言偏差贯穿预训练到后训练链路，值得作为 alignment evaluation 背景；本文重点是测量而非新 recipe。
- **[Physics-Informed Error Field Learning: A Post-Training Optimization Framework for Physics-Informed Neural Networks](https://arxiv.org/abs/2608.24970)**：PINN 的 post-training error-field 优化名含 post-training，但对象不是 foundation model，保留关键词即可。
- **[SHIFT-LLM: Distribution Shift Correction in Depth-Pruned LLMs](https://arxiv.org/abs/2608.25068)**：深度剪枝 LLM 的 shift correction 属于压缩后校准，与能力对齐只有边缘关系。
- **[SelfGraphRAG: Bridging the Supervision Gap in Graph-Based RAG with Synthetic QA Generation](https://arxiv.org/abs/2608.25123)**：SelfGraphRAG 以合成 QA 填补监督缺口，属于数据合成；检索系统专用且 verifier 可信度需核对。
- **[What Do Medical Vision-Language Models Learn in Radiology? Transfer, Alignment, and Source-Proxy Leakage Under Distribution Shift](https://arxiv.org/abs/2608.25251)**：医疗 VLM 的 transfer、alignment 与 source-proxy leakage 审计对域外泛化重要，训练方法并非主贡献。
- **[Escaping Low-Dimensional Overlap: Multi-Task Model Merging via High-Dimensional Sparse Disentanglement](https://arxiv.org/abs/2608.25354)**：高维稀疏 disentanglement 做多任务模型合并，属于权重组合；任务冲突与真实 LLM 规模证据待看。
- **[Adaptive Triggering for Bias Correction in LLM Reasoning](https://arxiv.org/abs/2608.25379)**：reasoning 过程中按需触发 bias correction，是推理时机制而非 post-training。
- **[Efficient Training with Foresight: Multi-Token Auxiliary Supervision for Autoregressive Image Generation](https://arxiv.org/abs/2608.25386)**：多 token 辅助监督提升自回归图像生成训练效率，和 LLM 后训练只有监督粒度上的类比。
- **[Reflection Steering: Disentangling Reflection from Reasoning in Activation Space for Token-Efficient Inference](https://arxiv.org/abs/2608.25542)**：Reflection steering 在 activation space 分离反思与推理以节省 token，仍是 inference-time intervention。
- **[MLLMCLIP: Feature-Level Distillation of MLLM for Robust Vision-Language Representations](https://arxiv.org/abs/2608.25575)**：MLLMCLIP 做 feature-level distillation 以获得鲁棒视觉语言表示，主要贡献在表征压缩。
- **[DCEO: Direct Causal Effect Optimization for Long-Term User Value Modeling in E-commerce Search](https://arxiv.org/abs/2608.25635)**：电商长期价值的直接因果效应优化属于推荐系统目标设计，不宜归入通用 LLM 对齐核心。
- **[Towards Purified Multi-Label Test-Time Adaptation of Vision-Language Models](https://arxiv.org/abs/2608.25653)**：视觉语言模型的 test-time adaptation 研究净化伪标签，参数阶段和持续后训练不同。
- **[Why Does Graph Learning Fail to Fully Benefit from a Text Teacher?](https://arxiv.org/abs/2608.25741)**：图学习从文本教师蒸馏为何失效提供负结果，模型类型与 LLM student 距离较远。
- **[DEFUSE: Generalizable Backdoor Defense for Self-Supervised Encoders with Generative Priors](https://arxiv.org/abs/2608.25851)**：生成先验防御自监督 encoder 后门，属于视觉 SSL 安全，不是 LLM alignment。
- **[Learning Late, Guiding Early: Timestep-Decoupled Semantic Guidance for Fair Face Generation](https://arxiv.org/abs/2608.25862)**：公平人脸生成用 timestep-decoupled guidance，主要是 diffusion inference guidance。
- **[Loss-Based Active Learning for Neural Abstractive Summarization](https://arxiv.org/abs/2608.25881)**：主动学习选择摘要标注样本能降低 SFT 成本，但方法和规模较传统。
- **[PANDA - Prototype-Anchored Alignment for Partially Unpaired Multimodal Learning, with Applications to Alzheimers MRI and TCGA Pathology](https://arxiv.org/abs/2608.25970)**：部分不配对多模态数据用 prototype alignment 转移知识，属于医疗多模态适配。
- **[Fine-Tuning Whisper for Automatic Speech Recognition in Baniwa: A Preliminary Study](https://arxiv.org/abs/2608.26060)**：Baniwa Whisper 微调对低资源语言重要，训练 recipe 常规且样本规模初步。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 主要证据 | 可信边界 |
|---|---|---|---|---|
| [What Does an Evaluation License? A Commit-Bound Census of Claim-Relative Inference in Inspect Evals](https://arxiv.org/abs/2608.19269) | 评测声明是否被证据授权 | commit-bound claim replay | 124 单元，110 个有类型停止 | 不证明未来版本或模型能力 |
| [From Blind Edits to Verified Repair: Building Trustworthy User-Side LLM Agents for Web Accessibility](https://arxiv.org/abs/2608.24913) | 网页无障碍修复不伤害 | audit-inject-verify gate | 57/57 检出，126/126 有害候选拒绝 | 自动 oracle 覆盖有限 |
| [ToolMinimize: Auditing and Rewriting LLM Agent Tool Calls to Minimize Privacy Exposure](https://arxiv.org/abs/2608.24957) | 工具参数最小披露 | schema 必要性与字段改写 | 307 调用，隐私成本 -81.2% 至 -92.0% | 必要性判断可能错 |
| [FrontierChallenge: Evaluating Scientific Workflow Completion](https://arxiv.org/abs/2608.24979) | 科学工作流完整交付 | deliverable bundle 双指标 | 97 题，最佳 Pass Rate 20.6% | 领域 scorer 决定完成定义 |
| [FuzzingBrain-Bench V1: Evaluating Open-Ended Bug Discovery by LLMs](https://arxiv.org/abs/2608.25158) | 开放式 bug discovery | distinct crash signature 计分 | 77 挑战，最佳触发 60 题 | crash 不等于根因 |
| [Model-Based Agentic Software Engineering](https://arxiv.org/abs/2608.25174) | Agent 工程治理 | 最小表示与义务权威 | 纵向案例+6 个工业账号 | 理论解释多于因果验证 |
| [A Few Pages of Markdown: Committed AI Configuration and Lower Quality Cost after Coding-Agent Adoption](https://arxiv.org/abs/2608.25241) | 仓库 AI 配置与质量 | RAMP 可审计成熟度 | 441 仓库，held-out 复现 97% | 观察混杂 |
| [Metis: Typed Runtime Mediation for Tool-Using Software Agents](https://arxiv.org/abs/2608.25322) | 工具 runtime 边界 | typed event mediation | 30 配对+10 fault cases | 不验证语义安全 |
| [RotDroid: Cross-Orientation State Equivalence Testing for Detecting GUI Rotation Bugs in Android Apps](https://arxiv.org/abs/2608.25425) | Android 旋转 silent failure | 跨方向状态等价 oracle | 94 新 bug，47 确认或修复 | VLM oracle 与设备覆盖 |
| [Beyond Scaling: Self-Evolving LLM Agents for Hardware Kernel Optimization via an Experience-Driven Workflow and Experience Graph Memory](https://arxiv.org/abs/2608.25570) | 硬件 kernel 持续优化 | 经验图与主动上下文 | 53 算子，通过率到 84.6% | 单硬件栈和巨额预算 |
| [EVOMAL: Self-Poisoning in Self-Evolving Coding Agents](https://arxiv.org/abs/2608.25776) | 自演化技能供应链 | self-poisoning worm | 153 SWE-bench 题，ASPR 20.3%--41.8% | 防御主要针对 banner |
| [XREPOTEST: Benchmarking Multilingual Repository-Level Unit Test Generation for Large Language Models](https://arxiv.org/abs/2608.25939) | 多语言仓库单测 | Invocation Rate + 容器执行 | 14 模型，平均编译 57.4% | 五语言与选定仓库 |
| [TraceML: An Empirical Analysis of Human-Agent Planning in Machine Learning Development](https://arxiv.org/abs/2608.26086) | 长程 ML 开发规划 | 版本级人机轨迹对齐 | 4,465 人类轨迹+207 Agent 轨迹 | Kaggle 与两个 scaffold |
| [Demystifying Reinforcement Learning Post-Training of Language Models](https://arxiv.org/abs/2608.24949) | RL 后训练机制 | 控制 base prior/reward/data | 目标缺先验时约 10% 停滞 | 简化环境 |
| [D$^3$-MOPD: Adaptive Dynamic Domain ScheDuling for Efficient Multi-Teacher Distillation](https://arxiv.org/abs/2608.24987) | 多域蒸馏调度 | 复用逐域 KL 动态配比 | 关闭 97% 师生差距 | KL 代理可能错位 |
| [Does Fine-Tuning Undo Activation Steering? Behavioural Recovery Without Weight-Edit Reversal](https://arxiv.org/abs/2608.24988) | 微调后 steering 保持 | 行为与权重恢复分离 | SFT 抹去 64% 行为效果，rho=0.004 | 行为与模型类型有限 |
| [From Memorization to Absorption: Mixed-Policy RL for Continual Knowledge Injection](https://arxiv.org/abs/2608.25243) | 持续知识吸收 | Golden-GRPO mixed policy | 困难组合题显著胜 SFT | 合成事实与 golden oracle |
| [Beyond Pairwise Feedback: Listwise Vision-Language Supervision for Preference-Based Reward Learning](https://arxiv.org/abs/2608.25350) | 多候选 reward learning | Plackett-Luce listwise 偏好 | Meta-World 最佳 86% | VLM judge 共盲 |
| [Training Alignment Auditors via Reinforcement Learning](https://arxiv.org/abs/2608.25460) | Alignment auditor 训练 | pairwise 调查 reward | 假阳性低于 1% | 植入后门与 judge 偏差 |
| [V-Rubrics: Visual Faithfulness via Rubric-Based Reinforcement Learning](https://arxiv.org/abs/2608.25580) | 视觉 RL 局部信用 | 三维 rubric + prefix credit | 50,248 样本，+1.79 点 | 闭源 rubric 生成器 |
| [A Token-Level Analysis of Sampled-Token Reverse-KL On-Policy Distillation](https://arxiv.org/abs/2608.25643) | OPD token 梯度 | Surprise-aware reweighting | 两 Qwen3 尺度多项提升 | 数学域与教师错误 |
| [Learning New Facts with QLoRA: An Acquisition-Retention Frontier](https://arxiv.org/abs/2608.25677) | 事实获取-保持前沿 | rank 8--64 QLoRA 对照 | 高 rank 学得多也忘得多 | 单模型单知识域 |
| [TailSFT: Filtered Fine-Tuning Improves Post-Training Performance](https://arxiv.org/abs/2608.25756) | 为 RL 选 SFT 初始化 | 过滤已拟合序列 | pass@16 +16.8%，GRPO +3.9% | tail 可能含噪声 |
| [Unfolding Scientific Papers into Multi-Turn Generation Trajectories for Continued Pre-Training](https://arxiv.org/abs/2608.25826) | 文档级 CPT 合成 | 保留原文、反建写作轨迹 | 约 2 倍语料，平均 +1.6--2.4 | LLM judge 与数据污染 |
| [One Symptom, Three Levers: A Critical Review of On-Policy Self-Distillation](https://arxiv.org/abs/2608.25936) | OPSD collapse 解释 | 位置/特权信息/教师动态三轴 | 结构性综述，无新实验 | 只覆盖数学 reasoning |
| [VISA: Agentic Self-Evolving Data Synthesis for Multimodal Instruction Following](https://arxiv.org/abs/2608.26013) | 自演化多模态数据 | 失败与目标模型弱点回写 | MM-IFEval 提升、7 基准保持 | verifier 和记忆共偏 |
| [DualOPSD: Adaptive Privileged Teachers for On-Policy Self-Distillation](https://arxiv.org/abs/2608.26019) | 自蒸馏教师漂移 | 同轨迹交替更新 | AIME/HMMT +10.00 至 +23.61 点 | 短程数学设置 |
| [A Visual Dependence-Aware Framework for Multimodal Unsupervised Continual Post-Training](https://arxiv.org/abs/2608.26095) | 无标签持续多模态后训练 | 视觉依赖 OT + token 调制 | AvgAcc 62.5%，forgetting 0.6 | 依赖估计与任务顺序 |


## 我的判断

**整体创新性：A-。** coding-agent 线真正的新意来自评测对象的改变：从最终回答转到 claim、字段、状态、崩溃、权限、配置和版本轨迹。post-training 线则把优化对象从整条样本推进到动态领域配比、token surprise、事实吸收、visual rubric 和跨模态依赖结构。不是每篇都发明新算法，但不少工作重新定义了什么才是有效证据。

**实用价值：A。** ToolMinimize、Metis、RotDroid、XREPOTEST、TailSFT、AutoVerifier、VISA 都给出可以实现或复用的接口；FrontierChallenge、FuzzingBrain-Bench 与 TraceML 则补足长期任务和过程数据。代价是系统必须维护更多外部状态、版本和 verifier，可靠性不会由一次更强采样免费得到。

**严谨性：B+。** 当天最可信的论文主动报告 typed stop、阴性目标、candidate-bound execution、独立容器、开发者确认、held-out corpus 或 stage-matched baseline。主要不确定性仍是 LLM judge 共盲、程序化 verifier 的封闭世界、观察研究混杂、数据合成污染，以及短期 benchmark 无法覆盖技能库和记忆的长期漂移。

**推荐价值：A。** 如果只读 coding-agent 线，优先看 FrontierChallenge、Metis、RotDroid、EVOMAL、XREPOTEST 与 TraceML；如果只读 post-training，优先看 D3-MOPD、TailSFT、V-Rubrics、QLoRA acquisition-retention、DualOPSD 与 Visual Dependence-Aware continual post-training。今天最稳的总判断是：先证明 reward、state 与 evidence 指向真正负责的位置，再讨论模型或 Agent 是否“更强”。
