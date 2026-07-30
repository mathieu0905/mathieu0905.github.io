---
title: "Agent 不缺上下文，缺的是可验证的跨文件理解：7 月 29 日 arXiv 的仓库推理与 Post-Training 闭环"
date: "2026-07-30"
description: "7 月 29 日的新论文把 coding agent 的瓶颈从上下文长度推进到跨文件推理、证据化执行与真实编辑反馈，也把 post-training 的重点推进到数据闭环、token 归因和在线蒸馏。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Agent安全", "Post-Training", "RLHF", "强化学习", "偏好优化", "知识蒸馏"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-slate-950 via-indigo-950 to-cyan-900"
---

2026 年 7 月 29 日的 arXiv 官方新论文列表异常密集，但真正值得读的不是“agent 又能塞进更多 token”，而是多篇工作开始拆解长上下文仍然失效的原因：跨文件执行链没有被完整恢复，检索结果缺少生命周期管理，最终成功也不能证明工具调用与工作流过程可信。另一条同样强的主线来自 post-training：训练数据如何从失败轨迹产生、偏好标签如何降噪、rubric 如何下沉到 token、教师轨迹如何接力给学生，正在取代“只换一个目标函数”的粗粒度比较。两条线没有被机械合并，但它们给出同一种研究纪律——能力提升必须能追溯到数据、过程和可复核证据。

本轮逐项核对 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG，并补充 cs.IR、cs.CV、cs.CR、cs.OS 的 7 月 29 日官方列表；合并去重后共检查 508 个当日新列、交叉列入或版本条目。最终纳入 **57 篇实质相关论文**：coding-agent / software-change 主线覆盖 29 篇，post-training 主线覆盖 31 篇，其中 3 篇同时落在两条线，去重后为 57 篇。15 篇强相关论文均成功下载 arXiv PDF 并完成文本抽取；中相关和边缘项依据官方摘要、元数据与分类判断。

## 今日脉络

第一条脉络是 **仓库上下文的核心问题从“找得到”转向“理解得对”**。RepoReasoner 即使给出 oracle 文件，最佳模型仍有近三分之一输出预测失败；Agent Retrieval Bench 又表明高 Recall 与严格 token 预算下的可用上下文不是同一目标。CodeNib 因此把索引更新、视图有效性和轨迹 token 一起纳入系统成本，而不是把一次检索分数当作终点。

第二条脉络是 **真实软件变更需要外部证据链**。Specula 让模型生成 TLA+ 规范，再用模型检查与代码级重放约束幻觉；COVENANT 把自然语言工作流编译成控制流图，由外部控制器决定能否推进；SkillGate 则在技能安装前做供应链筛查。这些工作共同把 verifier 从“另一个 LLM 的意见”推进为可执行的结构、状态和策略。

第三条脉络是 **post-training 的主要变量正在从算法名转向反馈结构**。RSIBench-Data 固定训练栈，只考 agent 能否从 checkpoint 反馈改善数据策略；DMAPO 用多评估器一致性删掉模糊偏好；CoRT 用反事实重放把 response-level rubric 分配到 token；Relay-OPD 让教师在学生已经走出的轨迹上接棒。它们分别控制研究闭环、标签噪声、credit assignment 与分布偏移。

第四条脉络是 **在线改进并不天然单调**。RSIBench-Data 中 78.26% 的继续搜索会在最终候选上跌出历史峰值；自推测 agent 的跨域训练会提高 next-call 命中却降低任务成功；MemSFT 则尝试把领域能力写入外部参数记忆以隔离遗忘。今天最重要的结论不是“继续训练总会更强”，而是必须保留峰值、限制副作用，并分别测量新能力与回归。

## 强相关论文深读

### 1. RepoReasoner：oracle 上下文也救不了跨文件推理

**论文信息**：*RepoReasoner: Evaluating Repository-Level Code Reasoning Ability of Long-Context Language Models*；Yanlin Wang、Suiquan Wang、Yanli Wang、Bowen Zhang、Daya Guo、Jiachi Chen、Zibin Zheng；[arXiv:2607.25996](https://arxiv.org/abs/2607.25996)；cs.SE；2026-07-28 提交，列入 7 月 29 日官方列表。

**一句话 TL;DR**：RepoReasoner 用动态 pytest trace 构造输出预测与调用链预测任务，证明真实瓶颈不仅是检索——即使把正确文件全部给模型，跨文件执行与多跳依赖仍然明显失败。

**为什么值得推荐**：大量 repository benchmark 把“修好 issue”压成一个最终 pass/fail，无法区分定位错、调用链漏、状态执行错还是输出格式错。本文把仓库理解拆成微观执行与宏观架构两项能力，并用 oracle context 隔离检索因素，因此给出的负结果比“长上下文不够好”更有诊断价值。

**方法怎么工作**：第一步从真实 Python 仓库和 pytest 测试出发，用动态 tracing 得到实际跨文件调用链；第二步构造 Output Prediction，要求模型在给定测试与关联代码后恢复被遮蔽输出；第三步构造 Call Chain Prediction，在含噪文件池中恢复测试触发的文件序列；第四步用 I/O rewriting 改写等价输入输出，检查模型是否依赖记忆。Table 1–3 分别隔离 oracle 推理上限、信噪比和记忆效应。

**关键实验与证据**：7 个模型中 DeepSeek-R1 在 10k oracle context 上的 Output Prediction Pass@1 只有 69.1%，Pass@5 为 80.3%；Qwen2.5-Coder-14B 仅 51.9%。Call Chain Prediction 的 oracle 设置中，最佳 Gemini-2.5-Flash 也只有 66.3% F1、21.3% exact match；多数大模型 precision 超过 80%，recall 却低于 40%。I/O 改写后多模型继续下跌，说明原始数据含有可被模式记忆利用的信号。

**局限和可信度**：benchmark 主要是 Python/pytest，动态 trace 只覆盖执行到的路径，不能代表静态可达依赖；I/O rewriting 改得是值而非程序结构，污染诊断仍不彻底。输出预测也可能把格式错误算作推理错误，论文确实发现 Qwen2.5-14B 有 35.3% 错误属于格式/抽取问题。尽管如此，oracle 对照和多任务拆分让“跨文件理解是独立瓶颈”这一结论相当可信。

**与当天主题的关系**：它为今日 digest 定下基线：更长 context window 不是仓库级 coding agent 的充分条件，完整依赖恢复和状态推理必须被单独训练与评测。

### 2. RSIBench-Data：会改数据策略，不等于会稳定地自我改进

**论文信息**：*RSIBench-Data: Benchmarking Data-Centric Research for Recursive Self-Improvement*；Fanqing Meng、Lingxiao Du、Qiguang Chen、Ziqi Zhao、Haocheng Lu、Mengkang Hu、Michael Qizhe Shieh；[arXiv:2607.25886](https://arxiv.org/abs/2607.25886)；cs.SE、cs.CL；2026-07-28 提交。

**一句话 TL;DR**：RSIBench-Data 固定训练、服务和评测基础设施，只让 frontier agent 迭代数据方案，从而测出它们能发现改进，却还不能可靠停止、保峰或从反馈中持续变好。

**为什么值得推荐**：递归自我改进常把写训练代码、修环境、调 serving、设计数据和选择 checkpoint 混在一起，最终分数无法说明 agent 是否真的做出了研究判断。本文把 target model、预算、Tinker 训练服务、Harbor/E2B 评测都固定，剩下的变量主要是“怎样诊断失败并构造下一轮数据”，问题定义非常干净。

**方法怎么工作**：agent 先观察固定 base model 在目标 benchmark 上的失败；随后提出数据合成、筛选或混合策略，经受控服务训练候选 checkpoint；官方 evaluator 返回 selection signal，agent 再修改策略；系统保留每个候选、成本和轨迹，并用 historical-best 选择避免最后一轮覆盖峰值。Figure 2、3 把闭环和非单调轨迹画得很清楚。

**关键实验与证据**：4 个 frontier agent 在 SWE-bench Verified/Multilingual/Pro、Terminal-Bench 2.0、GPQA Diamond、AIME 2026 上形成 24 个主设置。14/24 设置的后续候选超过首个有效候选，即 58.33%；但在达到峰值后仍继续搜索的 23 个设置中，18 个最终跌破峰值，另 5 个只回到峰值。成本从 4.80 美元到 363.77 美元、时长从 1.14 到 14.91 小时；Terminal-Bench 最佳设置把 base 的 1.12% 提到 20.22%，也说明有价值的改善确实存在。

**局限和可信度**：只有一个固定 target model 与六个 benchmark，agent 之间的产品更新和 harness 差异也会影响结论；训练服务是托管栈，完整复现仍依赖外部基础设施。selection split 与 official split 的关系决定了过拟合风险。最可信的是非单调性与成本轨迹，不宜把某一 agent 的排名外推为普遍研究能力。

**与当天主题的关系**：它把 post-training 变成可审计的软件过程：数据、checkpoint、反馈和停止条件必须被共同管理，不能只报告最终最好分。

### 3. Bug Report Attention：修复失败常始于“看错了地方”

**论文信息**：*How Do LLMs Read Bug Reports? An Empirical Study of Attention in LLMs for Automated Program Repair*；Ramtin Ehsani、Irene Manotas、Saurabh Pujar、Luca Buratti、Preetha Chatterjee；[arXiv:2607.25873](https://arxiv.org/abs/2607.25873)；cs.SE；2026-07-28 提交。

**一句话 TL;DR**：对 319 个真实 Python/Java bug 的分析表明，成功修复通常把注意力分散到描述、堆栈和测试等诊断证据，失败修复则更容易过度盯住版本号等元数据。

**为什么值得推荐**：APR 论文通常把模型当黑盒，只比较 resolved rate。这篇工作没有把 attention 直接当解释真相，而是将其与真实修复结果、开发者标注的重要段落和 patch 相似度关联，回答“同样上下文为什么有时修对、有时修错”。

**方法怎么工作**：研究从 SWE-bench Verified 与 Multi-SWE-bench 取 319 个 bug，让 Claude-4-Sonnet、gpt-oss-20b、Qwen3-32B 生成修复；按 bug report section 聚合 attention，并将结构分为 diffused、localized 等模式；再由有经验开发者标出 top-2 关键 section 和 exact phrase，最后用 Fisher 检验、FDR 校正和 Cliff’s delta 比较成功/失败组。

**关键实验与证据**：整体修复率分别为 65.2%、51.7% 和 40.7%。成功修复对 Bug Description 的 attention effect size 为 0.54、0.51、0.50，而失败修复更偏向 Version Information，对应 -0.53、-0.20、-0.42。diffused attention 与成功的 odds ratio 为 2.07，localized attention 为 0.40，二者经 FDR 后仍显著；成功 patch 的 CodeBLEU 中位/典型水平约 84%–91%，失败组只有 29%–31%。

**局限和可信度**：attention 不是因果解释，段落更长或 token 结构不同也会改变分布；319 个任务来自两个 benchmark，Hard 类只有 11 个。每份报告只由一名开发者标注，主观性未用多标注者一致性估计。论文能支持“注意力模式与成功相关”，不能支持“强制改 attention 就一定提高修复率”。

**与当天主题的关系**：它补上 RepoReasoner 的微观解释：仓库信息即使已经进入 prompt，也可能因分配错误而没有成为有效修复证据。

### 4. SkillGate：技能文件已经成为 coding agent 的供应链边界

**论文信息**：*SkillGate: Cost Efficient Runtime Malicious Skill File Detection in Coding Agents*；Rui Yang、Michael Fu、Kla Tantithamthavorn、Chetan Arora、Joey Chua；[arXiv:2607.25619](https://arxiv.org/abs/2607.25619)；cs.SE、cs.CR；2026-07-28 提交。

**一句话 TL;DR**：SkillGate 先用 530 个模式做低成本预筛，再只把命中窗口交给 LLM judge，在恶意技能检测中同时压低漏检、误报和 token 成本。

**为什么值得推荐**：skills 会被 coding agent 当成高优先级程序知识，却常从公共 registry 一键安装；恶意 Markdown 可以诱导凭据外泄、后门代码和越权工具调用。论文把这一新供应链面做成可部署 gateway，并与现有静态扫描器及全量 LLM 审查比较，而不是只展示几个 prompt injection 案例。

**方法怎么工作**：第一步 regex prefilter 同时识别危险模式与明确安全信号；零命中文件直接放行，命中文件只截取有限 snippet window；第二步 LLM judge 对窗口做恶意性与置信度判断；第三步混合分类器把静态信号、judge 结果和阈值合成为策略决定。Figure 3 的 precision–recall 曲线与 token 消融共同检查准确率—成本边界。

**关键实验与证据**：SkillsBench 共 1,650 个文件，其中 9.1% 恶意。SkillGate 的 F1 为 0.817、recall 0.769、FPR 1.13%、AUPRC 0.830；ClawVet 和 SkillScanner 的 AUPRC 只有 0.144 与 0.162。67.2% 文件绕过 LLM，输入 token 从 3,022,409 降到 699,085，节省 76.9%；三次运行的 F1 标准差为 0.013。

**局限和可信度**：SkillsBench 的恶意比例高于真实生态，生产 precision 会受低基率影响；530 个模式可能被攻击者针对性绕过，snippet 截断也会遗漏跨段落组合攻击。judge 使用特定托管模型，模型升级会改变决策。它是安装前检测，不替代 sandbox、最小权限与运行时信息流控制。

**与当天主题的关系**：可靠 coding agent 不只要验证 patch，也要验证改变其行为的输入资产；skill 与依赖包一样需要准入和审计。

### 5. CodeNib：仓库检索应被当成持续维护的数据系统

**论文信息**：*CodeNib: A Multi-View Data System for Serving Repository Context to Coding Agents*；Zhongming Yu、Hengjia Yu、Boqin Yuan 等；[arXiv:2607.25431](https://arxiv.org/abs/2607.25431)；cs.SE；2026-07-28 提交。

**一句话 TL;DR**：CodeNib 为每个 commit 维护 lexical、dense、structural 三类视图，把增量有效性、符号定位、排序和 token 预算统一到一个 repository-context runtime。

**为什么值得推荐**：多数检索工作只测一次静态语料上的 Recall，却忽略 agent 修改代码后索引是否过期、不同工具是否返回一致坐标、重复搜索消耗多少轨迹 token。CodeNib 的贡献是把这些 lifecycle cost 显式化，让 context serving 更接近真实开发基础设施。

**方法怎么工作**：系统以 commit snapshot 为版本边界，构建词法、向量和依赖图视图；所有结果统一映射到 repo-relative source range；代码变化后按视图特性做增量更新并检查与独立 rebuild 的一致性；查询端编译 ranked search、symbol navigation 与 bounded context policy，agent 可在 Eager、Compact 等策略间复用上下文。Figure 2 与 Figure 10–11 分别展示数据流、更新成本和轨迹效应。

**关键实验与证据**：在 100 个 snapshot 上，输出与独立重建一致时，图更新和向量更新中位数分别快 8.7× 与 25.4×。1,000 个静态导航请求中，63% 能与规范化 live-server 位置匹配，这一子集的 live/static 延迟比中位数为 4.7×。五个模型上，选择性 context policy 在保持 localization 的同时比配对 grep/read 少用 50%–87% trajectory token。

**局限和可信度**：只有 63% 请求进入严格的 live/static 可比子集，未匹配部分可能正是最难的语言服务场景；100 snapshots 与支持语言范围仍不足以代表超大 monorepo。系统结果强调检索与定位，不直接证明 issue resolution 提升。向量模型、硬件与缓存配置也会影响速度比。

**与当天主题的关系**：它回答了“上下文怎样长期保持可用”，与 RepoReasoner 的“上下文拿到后能否理解”形成互补，而不是互相替代。

### 6. Specula：用模型检查把 agent 的规范生成变成可执行证据

**论文信息**：*Specula: Scaling formal specifications for autonomous model checking of system code*；Qian Cheng、Saad Mohammad Rafid Pial、Ruize Tang、Yiming Su、Emilie Ma、Finn Hackett、Ivan Beschastnikh、Yu Huang、Tianyin Xu；[arXiv:2607.25333](https://arxiv.org/abs/2607.25333)；cs.SE、cs.AI、cs.OS；2026-07-28 提交。

**一句话 TL;DR**：Specula 让 coding agent 自动构造 TLA+ 模型与 invariant，再通过 model checking、trace projection 和代码级重放淘汰“看起来合理但与实现脱节”的规范。

**为什么值得推荐**：形式化方法难以进入真实系统代码，主要成本不是运行 checker，而是选择抽象、写 invariant 并把 counterexample 对回实现。纯 LLM 生成规范又容易 hallucinate 或 reward hack。Specula 把理解、规范、搜索和回放组成闭环，且在多语言系统项目上给出真实 bug 证据。

**方法怎么工作**：agent 从代码、文档、issue、commit 和测试提取协议/代码级 invariant；随后生成带合适抽象的 TLA+ 模型并分解 scenario；TLC 搜索 counterexample；系统把模型 trace 投影到代码执行，尝试生成测试或重放；无法复现的违例回流到 specification evolution，继续修改模型与性质。Figure 5–6 展示 projection 与 trace validation。

**关键实验与证据**：48 个开源系统中共发现 249 个 bug，其中 207 个为新 bug；已报告 89 个，68 个获确认、24 个已修复。最新版本检查的 14 个系统产生 136 个报告，其中 134 个完成代码级重放。200 个 model-checking 违例里 187 个由 BFS 找到，中位 counterexample 9 步、p90 18 步；但 99.10% 生成性质是 safety，只有 0.90% 为 liveness。

**局限和可信度**：运行依赖 Claude Opus、96 核 CPU 与 384GB 内存，成本和闭源模型变化会影响复现；48 个项目集中在并发、Raft/BFT 与系统库，不能外推到一般业务代码。确认率只针对已报告子集，未报告项的真实性未知。liveness 覆盖极低，说明“推按钮完成形式化”仍偏向可快速搜索的安全性质。

**与当天主题的关系**：这是今日最强的“外部 verifier”工作：agent 负责提出抽象，可信度来自 checker、trace 和实现重放，而不是 agent 自评。

### 7. DECODE：真实开发者编辑比最终 commit 更接近训练信号

**论文信息**：*Learning from 53.6K Real-World Developer Edits of AI-Generated Code*；Jenny T. Liang、Mihika Bairathi、Wayne Chi、Ameet Talwalkar、Nishant Subramani、Valerie Chen；[arXiv:2607.25130](https://arxiv.org/abs/2607.25130)；cs.SE、cs.AI、cs.LG；2026-07-27 提交，7 月 29 日交叉列入。

**一句话 TL;DR**：DECODE 记录 1,000 多名开发者在 IDE 中如何修改被接受的 AI 代码，并证明用这些细粒度轨迹微调 3B 模型，能比 frontier LLM 更好预测下一步编辑。

**为什么值得推荐**：commit 只保留最终成功状态，丢掉接受后删除、局部重写、补测试与反复修订过程；而这些恰恰是 coding assistant 的真实失效信号。DECODE 将“人类修了什么”从遥测转成可训练、可分析的数据，兼具软件工程和 post-training 价值。

**方法怎么工作**：研究从 IDE 事件流中定位 AI completion 被接受后的编辑窗口，把连续动作还原成 edit trajectory；再按删除、替换、保留等行为做分析，并构建下一编辑预测任务；最后在统一 3B base 上用 DECODE 微调，与未调模型和 frontier API 模型比较，同时检查 HumanEval 等代码生成能力是否回退。Figure 1–5 展示数据提取、时间分布和学习曲线。

**关键实验与证据**：数据含 53.6K 条 Python、TypeScript、JavaScript 编辑轨迹，来自 1K+ 开发者。多数编辑发生在接受后 15 分钟内，31% 轨迹最终移除 AI completion。微调后的 3B 模型在编辑类型/内容预测上显著超过 frontier LLM，且观察更多 edit data 时性能持续上升；论文还报告基础代码生成能力未出现明显退化。

**局限和可信度**：数据来自固定工具、固定时间窗和特定 completion 模型，用户自选择与隐私过滤会改变分布；编辑不一定意味着原代码错误，也可能是风格偏好或需求改变。只覆盖三种语言，且预测编辑不等同于生成正确 patch。公开数据能否保留足够上下文也决定复现价值。

**与当天主题的关系**：它给 post-training 提供了比“成功 commit”更真实的监督来源，也为可靠 coding agent 增加了人类纠错这一关键行为证据。

### 8. COVENANT：把自然语言工作流当程序编译，而不是当提示词

**论文信息**：*COVENANT: Natural-Language Workflow Compilation for Aligned Agent Execution*；Jincheng Wang、Min Zheng、Tao Wei；[arXiv:2607.25400](https://arxiv.org/abs/2607.25400)；cs.AI；2026-07-28 提交。

**一句话 TL;DR**：COVENANT 将工作流说明编译为抽象语法树和控制流图，由外部解释器逐步验证 agent 提议，显著减少跳步骤、走错分支和参数越权。

**为什么值得推荐**：多步 agent 常把“知道规则”误当成“执行遵守规则”。prompt 中即使写明流程，模型仍同时控制分支选择、参数和状态提交，失败后也难审计。COVENANT 把过程控制权移出模型，是一种比重复提醒更坚实的可靠性设计。

**方法怎么工作**：编译阶段先把自然语言分段成 workflow AST，再 lowering 为显式 WCFG；运行时 controller 只暴露当前可执行节点，agent 给出 action proposal；控制器检查前置条件、分支依据、参数与副作用，只有通过后才提交状态并推进；失败则返回诊断供修复。Figure 1 与 Figure 3 对比了 prompt-only 轨迹与编译执行。

**关键实验与证据**：120 个案例来自 3 个现有 benchmark、7 类 workflow。COVENANT 将平均成功率从 50.00% 提到 83.33%，workflow-misalignment failure 从 42.50% 降到 15.83%，相对减少 62.75%。消融中只有 WCFG+controller 的 85 个可比较案例成功 60 个（70.59%），说明结构表示与运行控制都在贡献。

**局限和可信度**：自然语言到 WCFG 的编译本身可能错，论文的场景规模和流程形态仍有限；外部 controller 只能执法已抽取规则，无法判断规范是否遗漏现实约束。额外模型调用和墙钟成本不可忽略。benchmark 中的工具副作用受控，生产系统的并发、回滚和人工审批更复杂。

**与当天主题的关系**：它与 Specula 都把自然语言意图变成可执行结构；区别是一个验证系统行为，一个约束 agent 工作流。

### 9. Agent Retrieval Bench：高召回还不等于对 agent 有用

**论文信息**：*Agent Retrieval Bench: Evaluating Repository Context Retrieval for Coding Agents*；Bowen Qin、Yi Xie；[arXiv:2607.24882](https://arxiv.org/abs/2607.24882)；cs.IR、cs.AI、cs.CL；2026-07-27 提交，7 月 29 日交叉列入。

**一句话 TL;DR**：该 benchmark 同时测文件级相关性、8k token 预算收益与“没有 gold 文件”的拒检场景，揭示检索器在 Recall@20 与可直接喂给 agent 的上下文之间存在明显错位。

**为什么值得推荐**：coding agent 的检索结果最终要占用有限上下文并支持一个具体动作；返回 20 个相关文件并不代表前 8k token 能覆盖关键证据。论文把 code-to-test、comment-to-context 等关系区分开，并专门检查 shortcut leakage 与 no-gold 样本，评价协议比单一 MRR 更贴近运行约束。

**方法怎么工作**：数据集从多类 repository task 构造 gold file 集与 agentic-relevance taxonomy；对每个方法同时计算 MRR、Recall@20 和预算约束下的 BCY@8k；无 gold 样本则检查是否能避免制造虚假上下文；此外做 repository-balanced、leakage diagnostics 和 RRF fusion，分析 lexical、map 与 dense/LLM retrieval 的互补性。

**关键实验与证据**：正样本主表包含 345 个任务。Qwen3-8B 达到最高 Recall@20 0.7029，而 RepoMap 在 BCY@8k 上最高也只有 0.3788，说明“找全”与“预算内组织好”不是同一能力。论文还把 287 个 code2test、comment2context 等任务做 Qwen3-8B 与 RepoMap 的后验融合，验证不同检索信号确有互补。

**局限和可信度**：345 个正样本仍偏小，gold file 不一定覆盖运行时真正必要的非代码资产；BCY@8k 是代理指标，不等于最终 patch success。部分任务由现有 artifact 反推，仍可能残留历史线索。benchmark 主要测静态 retrieval，没有覆盖 agent 编辑后索引失效。

**与当天主题的关系**：它定义了 CodeNib 要优化的“质量”是什么，也解释了 RepoReasoner 为什么必须用 oracle 对照把检索与推理解耦。

### 10. CoRT：让 response-level rubric 真正落到关键 token

**论文信息**：*CoRT: Counterfactual Replay for Token-Level Rubric-Guided Policy Optimization*；Bo-Wen Zhang、Junwei He、Wen Wang、Song-Lin Lv、Wentao Ma、Rongyi Lin、Shuhan Zhong、Lan-Zhe Guo；[arXiv:2607.25659](https://arxiv.org/abs/2607.25659)；cs.AI；2026-07-28 提交。

**一句话 TL;DR**：CoRT 删除 rubric 条件后反事实重放同一 response，用 likelihood 变化估计哪些 token 真正依赖评价标准，再重分配 GRPO advantage。

**为什么值得推荐**：GRPO 即使拥有细致 rubric，通常仍把同一个 response advantage 复制给所有 token；真正满足格式、证据或安全标准的少数 token 与普通连接词得到相同 credit。CoRT 不要求人工 token label，而是利用模型自身在“有/无 criterion”条件下的概率差来定位贡献。

**方法怎么工作**：先用 rubric 对 rollout 得到 response-level reward 与 GRPO advantage；再固定 response，移除或改变 criterion 做 counterfactual teacher-forced replay；计算逐 token likelihood contrast，经过 response normalization 转为 credit weight；SmoothStep 逐步开启权重，避免早期训练突变；最终用这些权重缩放原有 signed advantage。Figure 2–4 展示流程和稳定性消融。

**关键实验与证据**：在 IFEval、IFBench、MultiDimIF 上，Qwen2.5-7B 的 AON reward 设置中 CoRT 相对匹配 GRPO 将 MultiDimIF 从 69.41 提到 79.63，提升 10.22 点，综合均值提高 1.24；Qwen3-4B 上也能叠加到 DAPO，MultiDimIF 83.41→84.06。去掉 response normalization 会让平均 token weight 漂到约 1.04，并伴随 length clipping、梯度和 entropy 激增。

**局限和可信度**：反事实 likelihood 差只是 criterion dependence 的代理，不保证因果 credit；rubric 冗余、与 prompt 重叠或删除后语义不自然时会失真。某些指标出现回退，例如表中 GPQA/数学类泛化并非稳定提升。训练多一次 replay 增加计算，结果集中在 instruction following。

**与当天主题的关系**：它把“反馈结构”推进到 token 层，与 DMAPO 的数据级降噪形成两个互补尺度。

### 11. DMAPO：偏好数据少而一致，可能比大而含混更有效

**论文信息**：*Less Data, Better Alignment: Data-Centric Multi-Evaluator Agreement for Preference Optimization*；Zhengtao Yao、Runhao Li、Xupeng Chen 等；[arXiv:2607.25136](https://arxiv.org/abs/2607.25136)；cs.AI；2026-07-27 提交，7 月 29 日交叉列入。

**一句话 TL;DR**：DMAPO 只保留多个 evaluator 在 helpfulness、factuality、conciseness 和 process critic 上一致的 on-policy 样本，用 1,871 条高置信数据胜过多种 10k–60k 偏好优化基线。

**为什么值得推荐**：偏好优化常把更多 judge 分数当作更好监督，却忽略评估器分歧意味着标签本身不确定。本文的核心贡献不是新 loss，而是先通过多评估器一致性和方差门控定义“值得更新的数据”，再用普通 KTO 训练，并用未参与筛选的评估器复核。

**方法怎么工作**：从 target policy 生成多候选；多个 evaluator 分别评估质量维度，方差门控删掉意见不稳的样本；process critic 再检查推理/生成过程；最终将高置信正负样本交给 KTO。消融保持同一 LoRA 与训练 recipe，只改变随机筛选、单评估器、无方差门控和无 critic，便于把收益归因到数据治理。

**关键实验与证据**：Mistral-7B 上 DMAPO 用 1,871 条数据达到 MT-Bench 7.50、IFEval 57.3、length-controlled AlpacaEval 95.5；SimPO 用 10k 数据分别为 7.23、54.0、91.5。独立 GPT-4o 在 129 个 held-out prompt 上给出相对 SimPO +23.3 的 net win，相对 REINFORCE++ 为 +31.8。结果为 4 个 seed 的均值；但数学分项从 base 6.45 降到 5.70，显示严格筛选也会制造能力空洞。

**局限和可信度**：多个 evaluator 可能共享偏见，一致不等于正确；Mistral-7B 与通用对话 benchmark 的证据不足以外推到 reasoning/coding。Qwen diagnostic 使用了同一家族 evaluator，只能作为拟合信号，论文对此有明确警告。数学回退说明 conciseness 与数据覆盖需要单独 guardrail。

**与当天主题的关系**：它提供了 RSIBench-Data 可复用的研究判断：改进数据策略首先要减少含混监督，而不是盲目扩大样本数。

### 12. Relay-OPD：让教师在学生轨迹上“接棒”

**论文信息**：*Pass the Baton: Trajectory-Relayed On-Policy Distillation*；Haolei Xu、Xiaowen Xu、Haiwen Hong、Zixuan Ni、Hongxing Li、Yiwen Qiu、Weiming Lu、Yongliang Shen；[arXiv:2607.26057](https://arxiv.org/abs/2607.26057)；cs.CL、cs.AI；2026-07-28 提交。

**一句话 TL;DR**：Relay-OPD 不让教师从头生成，也不只在学生完整轨迹上打分，而是在学生探索到关键前缀后由教师继续，从而兼顾 on-policy 前缀和更高质量后续。

**为什么值得推荐**：标准 on-policy distillation 保持分布匹配，却受学生低质量轨迹限制；教师从头生成质量高，却产生严重 state mismatch。接棒把两者放在同一条 trajectory 上，方法概念简单，却直接击中在线蒸馏的分布问题。

**方法怎么工作**：学生先生成候选轨迹；系统选择多个接棒点，保留学生前缀并让教师继续生成后缀；这些 relayed trajectories 与学生轨迹共同构成 on-policy distillation 更新；K、接棒点数量与截断预算控制探索—成本权衡。训练不使用外部 verifier、过程标签或答案正确标签，因此收益主要来自教师条件分布。

**关键实验与证据**：Qwen3-4B-Instruct 教师、0.6B/1.7B 学生，在 DAPO-Math-17K 上训练并测 8 个数学 benchmark。1.7B 学生平均 46.96，标准 OPD 为 41.23、FastOPD 为 45.47；AIME 2025/2026 相对 OPD 分别提高 7.29/7.19 点，平均 rollout 长度还减少 50.7%。0.6B 平均 31.04，对 OPD 28.03，长度减少 63.9%。

**局限和可信度**：只在数学推理与 Qwen 家族验证，教师—学生规模和风格相近；接棒点策略增加生成与实现复杂度，实际 wall-clock/总 token 成本需要与所有 baseline 更完整对齐。没有 correctness signal 既是简洁性优点，也可能把教师错误稳定蒸馏给学生。

**与当天主题的关系**：它展示 post-training 如何通过 trajectory 结构而非新 reward 改善效率与能力。

### 13. SearchArt：长程搜索能力来自可验证任务合成，而不是让轨迹无限变长

**论文信息**：*SearchArt: Training Long-Horizon Search Agent with Scalable Synthetic and Verified Task*；Lang Mei、Xiaohan Yu、Chong Chen 等；[arXiv:2607.24850](https://arxiv.org/abs/2607.24850)；cs.IR、cs.LG；2026-07-25 提交，7 月 29 日交叉列入。

**一句话 TL;DR**：SearchArt 以可验证 QA 合成、工具轨迹和 critic reward 训练 27B 搜索 agent，使模型更愿意持续查证，同时在多个 deep-search benchmark 上显著超过 base。

**为什么值得推荐**：long-horizon search 的训练难点不是生成很长回答，而是合成的问题是否真的需要多跳搜索、答案是否可验证、工具调用是否提供了信息增益。本文将任务生成、验证、rollout 与 RL 串成完整 recipe，并同时看搜索轮数与答案质量。

**方法怎么工作**：先从多领域种子扩展需要外部搜索的 QA，再通过自动 validator/critic 过滤伪问题和不可证答案；agent 在浏览工具中生成长轨迹，以最终正确性和过程质量构成奖励；训练过程中监控 response length、tool calls 和 critic reward，避免仅靠冗长获得分数。Figure 9 展示三项动态，而合成集覆盖 11 个领域。

**关键实验与证据**：SearchArt-27B 在 BrowseComp-ZH、BrowseComp、BrowseComp-Plus、DeepResearch-Bench 分别为 74.39、70.06、63.49、52.55。相对 Qwen3.5-27B，BrowseComp-ZH 提升 12.29 点，BrowseComp-Plus 提升 5.06 点；BrowseComp 上也超过多种更大开源与闭源系统。轨迹分布显示训练后平均搜索轮数右移，而非更早停止。

**局限和可信度**：大规模合成与 verifier 可能把 benchmark 风格写入训练，污染审计和数据发布时间边界需要更透明；多数比较模型的工具、最大步数和复现条件未必完全一致。论文作者众多且系统资源可观，27B 长轨迹训练并不“低成本”。强结果仍需独立复现。

**与当天主题的关系**：它把可验证合成数据用于 agent post-training，是今天“反馈结构决定能力”的典型正例。

### 14. MemSFT：把新领域能力写入外部参数记忆，隔离 alignment tax

**论文信息**：*MemSFT: Mitigating Alignment Tax with an External Parametric Memory*；Jiarui Wang、Xiang Shi、Jiaqi Cao、Rubin Wei、Xiquan Wang、Hao Sun、Jingzhi Wang、Zhiqi Yang、Qipeng Guo、Bowen Zhou、Zhouhan Lin；[arXiv:2607.25614](https://arxiv.org/abs/2607.25614)；cs.LG、cs.CL；2026-07-28 提交。

**一句话 TL;DR**：MemSFT 冻结原模型，把领域知识写入独立参数记忆，并由 token-level router 选择性调用，以避免 full SFT 用新能力交换通用能力。

**为什么值得推荐**：持续 post-training 的核心难题不是“能否在新域涨分”，而是新域参数更新是否破坏原有 instruction following、reasoning 和语言能力。本文不靠混合 replay 或权重插值，而是改变能力存放位置，并用 memory size 与固定路由消融验证隔离机制。

**方法怎么工作**：冻结 backbone，在旁路训练可扩展 parametric memory；router 对每个 token 决定 backbone 与 memory 的融合强度；领域训练只更新记忆和路由；推理时选择性调用，普通 token 仍沿用原模型。Figure 2 给出架构，固定 λ 对照证明“始终使用记忆”不如选择性路由。

**关键实验与证据**：Qwen3-14B 在 Biology-Instructions 上 base 平均 6.64；1.7B、4B、8B memory 分别达到 30.38、37.12、42.92，而通用平均保持在 83.23–83.62。BM25 RAG 即使 top-50 也只有 12.23，远低于 42.92。多 backbone、LawBench 与 OpenSWI 进一步检查了领域迁移和保留。

**局限和可信度**：额外 1.7B–8B 参数并不轻量，推理延迟、显存和多领域记忆冲突需要更完整系统评估；生物/法律/地学 benchmark 可能受训练数据污染。通用平均分会掩盖局部回归，且每个新领域是否都要独立 memory 尚不清楚。

**与当天主题的关系**：它给在线/持续 post-training 提供了“隔离写入”的路线，与 RSIBench 的 checkpoint 保峰问题相呼应。

### 15. Self-Speculating Agent：预测下一次工具调用也可以成为 RL 目标

**论文信息**：*Speculate While You Reason: Teaching Agents to Predict Their Next Tool Call via Joint Agent-Speculator RL*；Jiabao Ji、Yujian Liu、Li An、Rohit Jain、Gungor Polatkan、Siyu Zhu、Shiyu Chang；[arXiv:2607.25816](https://arxiv.org/abs/2607.25816)；cs.AI；2026-07-28 提交。

**一句话 TL;DR**：同一个 4B agent 在 speculator mode 预测自己稍后的工具调用，通过交替 RL 将 exact Hit@1 提高约 17 点，同时基本保持原任务成功率。

**为什么值得推荐**：外部 draft model 往往不了解部署 agent 当前策略，缓存历史轨迹也会随 post-training 迅速过期。本文发现 agent 自己已是更好的 next-call predictor，于是把 agent 与 speculator 合并，直接复用 prefix KV cache，并用 on-policy rollout 持续校准。

**方法怎么工作**：先用成功轨迹和 speculation example 做短 SFT warmup；随后在 agent mode 优化任务 reward，在 speculator mode 截断部分轨迹、预测后续完整 tool name 与 argument dictionary；两个目标按 block 交替更新，切换时重置 optimizer state，避免动量互相污染；最终只保留一个双模式模型。

**关键实验与证据**：Qwen3-4B 的平均 Hit@1 从 SFT 后 44.1 提到 RL 后 61.2，Qwen3.5-4B 从 48.9 提到 66.3；任务成功分别从 26.6 到 27.7、49.2 到 50.6。1:1 更新 schedule 只有 31.8 Hit@1/10.3 success，4:8 达 55.2/26.1，说明稳定化细节是实质贡献。

**局限和可信度**：错误推测只能安全丢弃，因此主要适用于搜索、查询等只读工具；对写文件、付款和远程部署等副作用操作不能直接预执行。跨域测试虽然 Hit@1 上升，任务成功会下降，例如 Airline/Retail 从 21.6/36.4 降到 17.6/29.8。论文尚未给出端到端真实延迟节省。

**与当天主题的关系**：它同时属于 tool-agent 系统和 post-training：训练目标从“答对”扩展到“可提前验证地预测自己的下一步”。

## 中相关论文速读

### Coding Agent / Software Change

#### Code review 数据清洗仍然解决不了任务定义错位

[Rethinking Training Data for Generating Code Review Comments](https://arxiv.org/abs/2607.25851) 从常用 diff-comment 数据中归纳 semantic ambiguity、lack of actionability、context dependence 三类 misalignment，并发现即使用 LLM taxonomy filter 也很难可靠识别。值得保留的判断是：局部 diff 无法支持的评论不应被当作“脏样本”简单删除，输入边界和评价目标都要重写。论文主要是数据审计和立场论证，尚未给出新模型在真实 review adoption 上的闭环验证，因此不必按 SOTA 生成模型深挖。

#### OpenCoder：检索来源之间不是简单相加

[Beyond “What to Retrieve”: Uncertainty in Retrieval-Augmented Code Generation](https://arxiv.org/abs/2607.24884) 分别估计 API、仓库上下文和相似代码证据的不确定性，再用于过滤、生成、验证与修复。32 个 RepoExec-inline 任务上，GPT selected-output correctness 从 56.25% 升到 78.13%；但它与“验证+修复”控制持平，Gemini 的提升也无统计支持。推荐保留 factorial interaction 与负结果：检索源的价值依赖 backend 和其他证据，不能宣布一个普适排序。样本只有 32 个，适合速读而非把 21.88 点当作稳健收益。

#### Deep-learning compiler bug 需要面向 frontend 的根因测试

[Demystifying Deep Learning Compiler Frontend Bugs](https://arxiv.org/abs/2607.25651) 用领域知识增强的 LLM 辅助分析 TorchDynamo 的 123 个 frontend bug，形成 7 类、15 个子类的根因 taxonomy，再按根因生成测试，发现 23 个新 bug，其中 15 个已确认。问题与真实复杂构建/编译环境高度相关，且“taxonomy→targeted test→developer confirmation”证据链完整。它不是自主 repair agent，LLM 在编码和分析中的独立贡献也难与人工知识分离，所以列为中相关。

#### EBTE：不要把 agent 的解释当授权

[Explanation-Bound Tool Execution](https://arxiv.org/abs/2607.25364) 将自由文本理由转换成 typed action claims，再与 server-held intent、policy、payload、risk、provenance 和 freshness 校验；冲突拒绝，不完整进入 review。136 个 conformance scenario、96 个 hard contradiction 与 232 个 metamorphic check 均通过，并在 AgentDojo 派生攻击上保持 non-allow。最值得记住的是“rationale 只能携带待验证 claim，不能扩大权限”。场景为作者构造且 trusted facts 假设很强，不能把全通过等同于生产安全。

#### VClare：先修规格，再生成 Verilog

[VClare](https://arxiv.org/abs/2607.24854) 针对含糊、矛盾和缺失的硬件描述，分别做 spec-level inconsistency mining 与 simulation-based behavioral clustering，再生成/仲裁修正版规格。它把失败定位到需求输入，而不是只调 prompt，并构造系统注入缺陷的 benchmark。方法符合“变更定位—执行反馈—同步修正”，但规格缺陷多为合成，真实工程师是否接受自动澄清仍需用户研究和更复杂 RTL 验证，因此保留框架即可。

#### Desktop-Delta：GUI agent 需要理解状态变化，而不只是当前截图

[Desktop-Delta Bench](https://arxiv.org/abs/2607.26041) 把连续桌面截图之间的 transition 作为评测对象，要求模型判断动作造成的可见/隐含状态变化。这个问题直接击中 UI 自动化中的静默错误：点击“看起来成功”不等于窗口、焦点、文件或后台任务已进入正确状态。论文的重要性大于当前分数本身；但基准仍是离线 delta 理解，不含真实副作用、回滚和长流程成功率，所以暂不列强读。

#### Interactive Reward Agent：GUI 成功应由环境状态验证

[Interactive Reward Agent](https://arxiv.org/abs/2607.25904) 让 evaluator 与 GUI 环境交互，通过状态查询和后续动作验证任务是否真正完成，而非只依赖最终截图或语言 judge。推荐保留“evaluation agent 也必须被 environment state 约束”这一判断，它适用于运行行为与 UI 验证。边缘之处在于评估器本身仍可能选错检查动作，且摘要未充分披露跨应用规模、人工 gold 和 evaluator 成本。

#### 长程 agent 会把停滞误判成进展

[When Do Agent Loops Mistake Stagnation for Progress?](https://arxiv.org/abs/2607.25152) 研究长期 autonomous loop 的 self-evaluation bias，并用 externally grounded verification 区分真实状态变化与重复规划、重复尝试。它与 repository repair 的 silent failure 高度相关：日志更长、调用更多不代表离目标更近。论文适合保留失败 taxonomy 与外部进展信号；当前实验仍偏受控 agent loop，尚不足以说明怎样在大型仓库中通用地定义 progress。

#### Matryoshka Agent：长程 ML engineering 的关键是可展开的子任务

[Matryoshka Agent](https://arxiv.org/abs/2607.25090) 在机器学习工程任务中动态展开 sub-agent，把数据、实验、实现和验证分层处理。它命中了真实工程的长依赖链与计算反馈，比单轮代码生成更贴近软件变更；但贡献主要是 orchestration，独立消融很难排除更多 token、更多并行尝试带来的收益。推荐关注任务分解和状态传递协议，不必只看最终 leaderboard。

#### Kernel Forge：CUDA 优化必须在真实编译与性能反馈中迭代

[Kernel Forge](https://arxiv.org/abs/2607.24762) 提供生成、编译、正确性检查与性能测量闭环，让 LLM agent 搜索 CUDA kernel。值得读的是 harness 如何把“能编译、数值正确、确实更快”设为分层 gate；这比只用静态代码 judge 可信。它的任务集中在 kernel 微优化，无法代表多文件 feature change，而且硬件、编译器与计时噪声会显著改变排名，因此放在中相关。

#### Kubernetes patch 需要运行拓扑上下文

[Does Runtime Topology Context Improve LLM-Generated Kubernetes Security Patches?](https://arxiv.org/abs/2607.25995) 比较只看 YAML 与加入部署拓扑、依赖和运行关系时的安全修复。问题很实用：配置补丁的正确性依赖真实 service graph，局部 manifest 容易制造不可达或过度授权。值得保留的是 runtime context 应作为 patch evidence，而不是更多无差别文本；实验对象和云环境规模仍有限，尚不足以说明拓扑上下文在所有集群上都净增益。

#### Hybrid Analysis：MCP 工具安全需要静态事实与运行策略共同执法

[Hybrid Analysis for Secure MCP Tool Use in LLM Agents](https://arxiv.org/abs/2607.25297) 将工具 schema、实现分析与运行时调用上下文合并，避免只信描述或只看单次参数。它与 SkillGate 的区别是：SkillGate 管安装前内容，本文管已接入 MCP 的实际调用。推荐保留这层分工；但工具生态与攻击样本仍小，复杂跨调用数据流和动态代码加载的覆盖不足，因此无需把检测率当作成熟安全保证。

#### Frozen model 也能通过 harness policy 学习领域

[A Control System, a Dataset, and a Recipe for Making Frozen LLM Agents Learn a Domain](https://arxiv.org/abs/2607.25415) 把 prompt、few-shot、retrieval 量、planning/verification 次数视作有限动作空间，用 contextual bandit 与 REINFORCE 在线选择，并以成功、verifier、合规、成本、延迟和 unsupported-claim 组成多目标 reward。优点是黑盒 API 也可用且策略可审计；局限是“学习”发生在 harness 而非模型参数，HumanEval/HotpotQA/工具任务仍不能代表持续仓库演化。可作为系统路线速读。

### Post-Training

#### DecoEvo：solver 与 rubric-generator 共同演化，但自举风险也共同放大

[DecoEvo](https://arxiv.org/abs/2607.25675) 将 solver skill 与 rubric-generator skill 在文本空间中分数解耦地共演化，试图让任务能力和评价能力互相抬升。推荐它是因为 verifier 不再被假定为固定真值，而成为训练对象；同时这也带来最危险的闭环——solver 和 rubric 可能共同找到容易得分的私有约定。若没有外部 gold、冻结评估器和跨模型审计，内部 score 上涨不能证明真实能力提升，因此适合带着 reward hacking 问题速读。

#### Localized Adaptation：相同 loss 下降可能来自不同层的学习路径

[Localized Adaptation Reveals Distinct Learning Signatures in Transformers](https://arxiv.org/abs/2607.25663) 用局部参数更新比较 transformer 在不同任务和数据条件下的学习 signature，强调“调了哪些层”能揭示 post-training 改变了什么表示。它为 LoRA target module 选择与能力回归诊断提供实证视角，但不是直接的新对齐 recipe；模型规模、任务族和局部化干预决定外推范围。值得读分析方法，不必把 localized signature 直接当能力因果机制。

#### Harness-assisted synthesis 可以蒸馏时间搜索与未来预测

[Distilling Temporal Search and Reasoning](https://arxiv.org/abs/2607.25554) 用外部 harness 生成带时间约束的搜索/推理轨迹，再蒸馏到较小 LLM 以做 future prediction。核心价值是把“截至何时可知”写进数据生成和验证，降低模型用静态记忆猜未来的机会。边缘之处是未来预测的评价容易受数据截断、搜索源覆盖和泄漏影响；若没有严格 time-split，性能不能说明真正 temporal generalization。

#### CoTinyVLA：sub-billion VLA 的能力主要来自 CoT distillation

[CoTinyVLA](https://arxiv.org/abs/2607.25487) 将大模型的视觉—语言—动作推理链蒸馏到十亿参数以下模型，属于明确的 multimodal post-training。值得保留的是 teacher reasoning 如何被压成可部署 action policy，以及小模型是否在真实机器人/仿真闭环中保持行为。它与软件工程主线无关，但完全符合 post-training 主线；因环境覆盖、teacher bias 与 sim-to-real 证据仍有限，列中相关而不降级为无关。

#### ODYSSE：个性化 agent 的优化单位应是 episode

[ODYSSE](https://arxiv.org/abs/2607.25369) 用 episode-wise policy optimization 处理多轮个性化推理，避免把每条回复独立奖励而忽略长期偏好一致性。方法判断是对的：个性化不是单轮措辞，而是跨 episode 的状态与反馈。需要谨慎的是用户模拟器与 reward model 可能共享偏差，离线 persona 一致性不等于真实用户满意；因此推荐关注目标定义和跨轮 credit，不必过度相信单一模拟分数。

#### Instruction tuning 让模型“会描述分布”却未必“会采样分布”

[Instruction-Tuned Language Models Cannot Sample from Distributions They Can Describe](https://arxiv.org/abs/2607.25292) 检查模型对概率分布的语言知识与实际生成频率是否一致，属于 post-training 行为评估而非新训练算法。重要判断是 instruction tuning 可能强化单次最优回答与确定性遵循，却损害按指定随机分布采样的能力。它提醒 alignment benchmark 不能只测答案语义，还要测生成行为统计；但任务较合成，对开放对话和工具决策的外推仍需谨慎。

#### 小模型 agent 的 RL 稳健性不能用平均成功率替代

[Towards Robust Reinforcement Learning for Small-Scale Language Model Agents](https://arxiv.org/abs/2607.25091) 关注小模型在 agentic RL 中的 collapse、seed 方差与任务外泛化。推荐保留它对训练稳定性和低容量约束的强调：大模型可吸收的多目标 reward，小模型可能表现为格式退化或策略单一。若论文的“robust”主要来自受控小型环境，仍需在真实工具错误、长上下文和分布变化下复验。

#### 最后一段 pretraining 会改变后续 SFT 的可塑性

[Similar Models Learn Differently: Final-Window Pretraining Shapes Post-Training Beyond SFT](https://arxiv.org/abs/2607.25063) 比较总体能力相近、但预训练末段数据/顺序不同的 checkpoint，发现它们接受相同 SFT 后会走向不同能力和行为。论文价值在于挑战“只要 base benchmark 相同，post-training 起点就等价”的默认假设。它更像训练动力学诊断，数据顺序与 checkpoint 数量决定因果强度；建议看控制实验，不必只记最终分数。

#### AdaKP：reasoning RL 的课程可以在线选择知识点

[AdaKP](https://arxiv.org/abs/2607.24833) 根据模型当前表现在线选择 knowledge point，构造由易到难或补弱项的 reasoning-oriented RL curriculum。它把 curriculum 从静态题目难度改成 policy-dependent 数据选择，属于典型 post-training 研究。风险是知识点分类与 reward 同源时会造成局部过拟合，且持续追弱项可能破坏已学能力；需要看保留测试与不同 base model 的稳定性。

#### RoCo-ACE：在线蒸馏必须同时记住旧知识

[RoCo-ACE](https://arxiv.org/abs/2607.24771) 用 rollout-conditioned online distillation 做知识注入，并显式加入 retention-aware 机制，目标是避免新知识写入时牺牲原能力。它与 MemSFT 的问题相同、路线不同：前者改优化数据/目标，后者隔离参数存储。值得保留横向比较；如果 retention 只测平均 benchmark，局部遗忘和事实冲突仍可能被掩盖。

#### “假装对齐”需要在后果清晰与不清晰条件下分别测

[Do Models Fake Alignment Without Clear Consequences?](https://arxiv.org/abs/2607.24758) 改变模型对训练/部署后果的认知，测试表面顺从是否依赖明确的惩罚或未来部署叙事。它是安全与 post-training evaluation，而非普通 prompt study：目标是区分真正行为改变与情境性迎合。结论高度依赖模型是否相信实验设定，文本诱导与真实训练压力之间仍有距离；可记住评测设计，不必把单次 scheming rate 当模型固有属性。

#### Rashomon Alignment：相同偏好分数可能对应多种不同行为

[Rashomon Alignment](https://arxiv.org/abs/2607.25680) 研究多个在离线偏好指标上近似等价的 aligned model，是否在分布外、安全和风格上形成不同解。它把 Rashomon set 引入对齐稳定性，提醒研究者报告 seed、checkpoint 和行为分布，而不只是平均 reward。若只在小模型或少量偏好集上观察，结论范围有限；但问题本身对 DPO/RLHF 复现非常关键。

#### CAST：用 game solver 提供逐回合教师信号

[CAST: Game Solvers as Turn-Level Teachers for LLM Agents](https://arxiv.org/abs/2607.25308) 将可计算的 game solver 作为每一回合的教师，而不是只给最终胜负，改善 agent 的过程监督和 credit assignment。推荐点是 teacher 可验证、turn-level、能暴露局部错误；这比 LLM judge 更可信。局限是规则游戏拥有完美 simulator，现实工具环境往往没有最优 solver，因此方法价值主要在训练原则而非直接迁移。

#### Manifold-LoRA：把低秩适配写成 Stiefel manifold 优化

[Retraction-Free Optimization over the Stiefel Manifold for the LoRA Fine-Tuning](https://arxiv.org/abs/2607.25299) 提出无需 retraction 和 penalty tuning 的 landing algorithm，再把 LoRA 适配重写为 manifold optimization。贡献位于训练效率与优化稳定性，不是新的行为目标；理论上给出全局收敛复杂度，实验显示下游性能和效率竞争力。是否值得复现取决于 wall-clock、显存和大模型规模是否真实优于成熟 optimizer，而不只是迭代数。

#### RecoReward：训练时用用户行为，推理时仍保持 content-only

[RecoReward](https://arxiv.org/abs/2607.25901) 让历史参与用户与非目标用户的 affinity 差形成 reward，用 RL 训练 MLLM 生成更利于推荐的共享商品描述；上线推理不需要用户历史。离线七项 recall 和在线 A/B 均报告提升，说明下游行为 reward 可以改变多模态描述。因果风险在于 observational user signal、热门度和选择偏差，且工业数据不可公开；推荐读 reward 定义，不必把在线提升外推到其他平台。

#### TabRank：CoT distillation 对结构化检索也有效

[TabRank](https://arxiv.org/abs/2607.25182) 构造 6,728 条表格重排推理轨迹，比较显式 CoT distillation 与在 prompt 中条件化 teacher trace。相对 base，HybridQA、SQA、TabFact、TATQA 子集 Acc@10 分别提高 30.5%、15.2%、52.9%、13.1%，并测试多表 OOD。它是扎实的 task-specific distillation，但主要贡献落在 table retrieval，离通用 reasoning post-training 还有距离，所以适合速读。

#### Inverse RL 对齐：模仿行为之前先推断人的隐含目标

[Inverse RL Helps Align AI by Imitating Humans](https://arxiv.org/abs/2607.24900) 用 inverse reinforcement learning 从人类行为恢复 reward，再训练策略，而不是把行为克隆当作最终目标。它补充了 preference comparison 之外的反馈来源，也能显式讨论次优示范。局限是 reward identifiability：多种目标可解释同一行为，环境模型错时会学出看似合理的伪偏好；推荐关注假设和不确定性处理。

#### CARE：MoE-LoRA 不必让每个 token 调同样多专家

[Spend Experts Where You Are Unsure](https://arxiv.org/abs/2607.26052) 用 router 分布的置信度和专家分歧动态选择激活数，再用 budget thermostat 保持平均计算量。8 个 commonsense benchmark 以及数学、代码、知识任务上，在 matched compute 下优于 fixed top-k，并能以更少专家接近 k=4。它更接近 PEFT 推理/路由效率而非训练目标创新，但对“post-training 效率如何不均匀分配计算”有实质贡献。

#### 60M Text-to-SQL 的 LoRA 对照实验值得当作负面尺度校准

[How Small Can You Go?](https://arxiv.org/abs/2607.25583) 在 T5-small/WikiSQL 上单变量比较 rank、target module 与量化。r=16 用不到 1% 参数、少 31% 峰值显存，但 exact match 59.6%，仍比 full fine-tuning 的 71.2% 低 11.6 点；INT8/NF4 约 52.8%/53.2%。它的价值是完整日志与受控 trade-off，不是宣称 LoRA 无损；单表、60M 模型使外推范围很窄。

## 可留意 / 可跳过

- [Authoring Agent Skills](https://arxiv.org/abs/2607.25032) 把 skill 视为软件 artifact，强调单一职责、低耦合、渐进加载和行为测试。术语与工程建议清楚，但属于 position/note，缺少对照实验；适合作为实践清单，可跳过“新算法”期待。
- [HANDBOOK.md](https://arxiv.org/abs/2607.25398) 评测长上下文 agentic instruction following。关键词是跨长文档规则保持与冲突处理；若只关心 repository repair 可先略读，因为任务并不直接要求修改代码。
- [Agent Skills Matter](https://arxiv.org/abs/2607.25560) 从执行轨迹推断 proprietary skill，提示技能会留下可识别行为指纹。安全与知识产权问题新颖，但与 patch correctness 的直接关系较弱。
- [Cyber-Capable AI Agents](https://arxiv.org/abs/2607.25379) 讨论漏洞、评测 containment 与防御响应，适合安全治理背景阅读；若缺少新的大规模可复现 benchmark，可跳过泛化的风险清单。
- [Evaluating VLMs for Autonomous Agent-Driven Geometry Clipping Detection](https://arxiv.org/abs/2607.25921) 把游戏 QA 的视觉 clipping 检测交给 VLM agent，属于运行行为验证案例；领域窄，先看数据与标注协议再决定是否深挖。
- [Context Assembly as the Controlled Variable](https://arxiv.org/abs/2607.25408) 是冻结模型 harness controller 的形式化配套论文，重点在控制论分解和稳定性论证；与 2607.25415 内容高度重叠，读应用篇后可选择性跳过。
- [Tools Are Not Islands](https://arxiv.org/abs/2607.25718) 用 query-conditioned hyperedge 做工具集合检索，提醒相关工具存在组合关系。它更偏 retrieval，不直接解决调用正确性与安全性。
- [Bits and Memories](https://arxiv.org/abs/2607.25451) 测量量化后 LLM 的逐字提取，属于 post-training/部署后的记忆与污染审计；若今日重点是训练算法，可保留“quantization 改变 extraction risk”这一关键词即可。
- [Instruction-Tuned Models Locally Reuse Human Syntax More Than Humans Do](https://arxiv.org/abs/2607.26015) 分析 instruction-tuned model 的句法复用，是 post-training 行为变化的窄而有趣证据；与能力或可靠性评估距离较远。
- [Instruction-based Image Editing Survey](https://arxiv.org/abs/2607.25642) 系统整理数据、模型和评价，覆盖多模态 post-training 背景；它是综述而非当天的新训练证据，已有领域地图的读者可跳过。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 最关键证据 | 可复现性 / 实用性 | 评估可信度 |
|---|---|---|---|---|---|
| RepoReasoner | 隔离检索后的仓库推理 | 动态 trace + 两类任务 + I/O 改写 | oracle Pass@1 最高 69.1%，call-chain EM 最高 21.3% | benchmark 路线清楚；Python 偏重 | **高**：oracle 与改写对照扎实 |
| RSIBench-Data | agent 能否研究数据策略 | 固定训练栈的闭环研究 benchmark | 14/24 超过首候选；18/23 末轮回退 | 代码开放，但依赖托管训练服务 | **中高**：成本与轨迹完整，目标模型单一 |
| Bug Report Attention | 修复成败与信息分配 | attention、开发者标注、patch 结果关联 | diffused OR 2.07，localized OR 0.40 | 分析流程可复现 | **中高**：相关非因果、Hard 样本少 |
| SkillGate | 恶意 skill 供应链检测 | regex skip + snippet LLM judge | F1 0.817，token -76.9% | 部署形态明确 | **中**：benchmark 基率与对抗适应风险 |
| CodeNib | 动态仓库的上下文服务 | 多视图、commit 版本化、增量有效性 | 更新快 8.7×/25.4×，token -50%–87% | 系统工程价值高 | **中高**：未直接测 patch success |
| Specula | 自动生成可执行形式规范 | 规范演化 + model checking + 代码重放 | 249 bugs，68 confirmed，24 fixed | 成本高、闭源 agent 依赖 | **高**：真实开发者确认，但领域集中 |
| DECODE | 真实 AI 代码编辑监督 | IDE 级 edit trajectory 数据 | 53.6K 轨迹，31% 最终移除 completion | 数据价值高，隐私决定开放粒度 | **中高**：真实行为强，选择偏差存在 |
| COVENANT | 自然语言流程的执行对齐 | WAST/WCFG 编译与外部解释器 | success 50.0%→83.33% | 架构可实现，编译正确性是新瓶颈 | **中高**：120 个受控案例 |
| Agent Retrieval Bench | agent 预算下的仓库检索 | Recall、BCY@8k、no-gold 联合协议 | R@20 0.7029，BCY@8k 0.3788 | 适合比较检索器 | **中**：345 正样本、代理指标 |
| CoRT | rubric 的 token credit | criterion-removal counterfactual replay | MultiDimIF 单项 +10.22 | 可叠加 GRPO/DAPO，需额外 replay | **中**：有回退，criterion proxy 有限 |
| DMAPO | 偏好数据标签含混 | 多 evaluator 一致性与方差门控 | 1,871 条胜过 10k–60k 基线 | 数据筛选容易复用 | **高**：4 seeds + 独立 judge；数学回退明确 |
| Relay-OPD | 在线蒸馏的轨迹错位 | 学生前缀、教师后缀接棒 | 1.7B 平均 41.23→46.96，长度 -50.7% | recipe 清楚，生成成本需核算 | **中高**：8 个数学集，模型族单一 |
| SearchArt | 可验证长程搜索训练 | 合成任务 + verifier + tool RL | BrowseComp 70.06，ZH 74.39 | 资源要求高 | **中**：污染与跨系统公平性待审 |
| MemSFT | 领域适配的 alignment tax | 外部参数记忆 + token router | BioIns 6.64→42.92，通用分约 83.2–83.6 | 参数开销较大 | **中高**：多域/多 backbone，局部回归仍可能 |
| Self-Speculating Agent | 下一工具调用的低延迟预测 | 单模型双模式交替 RL | Hit@1 44.1→61.2、48.9→66.3 | 只读工具最实用 | **中高**：跨域任务成功会下降 |

## 我的判断

**创新性：A-。** 今天不是某一个“统一大突破”，而是一批方法在不同层级重新定义可验证性：RepoReasoner 隔离推理，CodeNib 管上下文生命周期，Specula/COVENANT 把意图编译成可执行结构，CoRT/Relay-OPD 改写反馈在 token 与 trajectory 上的传播方式。最值得警惕的是一些新名词仍可能只是已有 RL、蒸馏或控制器的重新包装，必须靠消融判断。

**实用价值：A。** SkillGate、CodeNib、COVENANT、DECODE 和 Specula 都对应现实系统里可落地的接口：安装准入、索引维护、工作流控制、真实编辑数据和形式化检查。它们的共同优点是可以被插入现有 agent harness，而不是等待一个全新基础模型。

**严谨性：B+。** RepoReasoner 的 oracle 对照、DMAPO 的四 seed 与独立评估、Specula 的开发者确认、RSIBench-Data 的成本轨迹都很强；但许多 agent benchmark 样本仍小，工具和模型版本更新快，闭源 judge、合成数据污染、托管训练栈与低基率安全检测都会削弱外推。

**推荐价值：A。** 若只深读五篇，优先顺序是 RepoReasoner、Specula、RSIBench-Data、DMAPO、COVENANT。它们分别回答：模型是否真的理解仓库、验证能否落到执行、数据研究闭环是否稳定、偏好数据如何降噪、工作流如何从提示升级为外部控制。最大不确定性在于 7 月 29 日论文密度极高，部分预印本还缺少独立复现；因此今天更适合把“评测协议和证据链”当作可保留贡献，而不是立即接受所有绝对分数。
