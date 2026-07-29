---
title: "正确结果不再够用：7 月 28 日 arXiv 把 Agent 与 Post-Training 的证据链拆开检查"
date: "2026-07-29"
description: "7 月 28 日的新论文集中揭示：Agent 的状态、测试、权限与成功来源必须可追溯，post-training 的偏好、蒸馏和奖励信号也必须接受失效机制审计。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Agent安全", "Post-Training", "RLHF", "强化学习", "Reward Model", "模型蒸馏"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-slate-950 via-indigo-950 to-rose-900"
---

2026 年 7 月 28 日的 arXiv 官方新论文列表 unusually dense，真正值得读的不是某一个更高的 leaderboard 分数，而是一批论文同时开始追问：这个分数究竟由什么证据支撑？在 coding-agent 一侧，程序状态、测试 oracle、harness、API 路由、修复循环与安全策略都被拆成独立的失效边界；在 post-training 一侧，偏好坍缩、局部蒸馏信号、奖励模型记忆与长程规划的训练区间也被逐项审计。两条线并不需要强行合并，但它们给出同一种研究态度：终点正确只是结果，可信研究还要解释成功从哪里来、失败在哪一层发生。

本轮核对 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG，并补充 cs.IR、cs.CV、cs.CR、cs.OS 的官方 new 与 cross-list 区段；排除 replacement、跨分类去重后共检查 919 篇。筛选后覆盖 **94 篇实质相关论文**：coding-agent / software-change 主线 44 篇，LLM post-training 主线 50 篇；其中 17 篇强相关论文均下载、验证并阅读 PDF，其余依据 arXiv 官方摘要与元数据分层。这里的“相关”只取决于论文本身是否推进了两条主线之一，不以任何既有项目或文章为参照。

## 今日脉络

第一条线是 **Agent 可靠性从像素和最终答案下沉到持久状态**。StateAct 直接操作文件、后端和 DOM，并用独立 finish gate 检查保存结果；Looping Is Not Reliability 则证明“曾经修对”不等于“最后保住并提交正确版本”。这让状态哈希、证据版本和 last-known-good checkpoint 从工程细节变成研究对象。

第二条线是 **测试与验证本身可能被被测代码、harness 或安全中间层污染**。Buggy code 会诱导 LLM 写出维护错误行为的测试；同一模型换 harness 可产生 40 倍 token 差异；第三方 API router 甚至能绕过客户端权限，直接改变仓库级动作。今天最强的 coding-agent 论文几乎都在测“验证器和运行链条是否可信”，而不只是测生成器。

第三条线是 **post-training 的局部信号不一定具有局部语义**。Outcome-Confounded Local Supervision 发现 teacher 与 student 在 token 上一致，仍可能共同走向错误终点；Reward Model Memorization 发现奖励模型把容量花在容易、高 margin 的样本和数据集捷径上；alignment drift 研究则说明 SFT、KL-SFT 与 RLVR 对既有行为的扰动结构并不相同。

第四条线是 **长程能力的提升越来越依赖训练区间和脚手架匹配**。ProGPO 只在全失败组中用状态进展恢复梯度，RLSVR 把开放任务改造成可自验证博弈，长程规划论文进一步划出 GRPO 与 on-policy distillation 的“无须、有效、无支撑”三区。算法名不是结论；数据质量、轨迹长度、teacher 知识与环境结构共同决定优化是否有效。

## 强相关论文深读

### 1. StateAct：长程电脑操作首先应对齐程序状态，而不是像素

**论文信息**：*StateAct: Program State, before Pixels, for Long-Horizon Computer-Use Agents*；Yan Yang、Xiangru Jian、Ziyang Luo、Zirui Zhao、Yutong Dai、Ziji Shi、Hanshu Yan、Jun Hao Liew、Silvio Savarese、Junnan Li；[arXiv:2607.22798](https://arxiv.org/abs/2607.22798)；cs.SE、cs.CV；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：StateAct 把文件、应用后端与 DOM 作为主操作面，只在必要时委派 GUI 子代理，并用独立 finish gate 验证持久化结果，让长程 computer-use 从“看屏幕点按钮”转向“围绕真实状态行动与验收”。

**为什么值得推荐**：屏幕是程序状态的有损投影：相同总数可能来自公式或常量，未保存文件与已保存文件也可能显示相同。长轨迹里，这种歧义会逐步累积。论文击中的不是视觉识别小误差，而是 agent 的 action、memory 与 verification 是否围绕最终被评分的状态组织。

**方法怎么工作**：Figure 2 的流水线包含三层。①主 agent 用代码读取和修改可寻址状态；②遇到不可脚本化的模态框或纯视觉目标时，把局部子任务交给新鲜上下文的 GUI specialist；③任务结束时由独立 finish gate 只读取原始指令和落盘结果，检查缺失、未保存、路径错误等结构性失败。长期上下文则通过子目标委派与状态摘要控制。

**关键实验与证据**：在 OSWorld 2.0 的 108 个任务上，Claude Opus 4.8 的 binary success 从 20.6% 升至 26.9%，partial success 从 54.8% 升至 61.6%，每任务成本约从 72 美元降到 7.8 美元。GUI 子代理只用于 28/108 个任务、占主代理步骤的 1.1%；但完全去掉视觉后 partial success 仅 45.9%，说明正确答案不是“只用代码”，而是 state-first 的混合架构。

**局限和可信度**：评估只有一个主干模型与一个桌面 benchmark，且直接状态访问在真实软件中可能受权限、API 可用性和安全边界限制。系统级比较也难完全控制 harness 差异。不过消融显示 state action、finish gate 和 context management 各有独立贡献，且论文明确承认剩余瓶颈已从感知转向推理，结论边界清楚。

**与当天主题的关系**：它最直接地说明，可靠 Agent 的基准单位不应只是截图轨迹，而应是“动作—持久状态—独立验收”的闭环。

### 2. Buggy code 会把测试生成器教成错误行为的维护者

**论文信息**：*Evaluating and Mitigating the Misguidance Effect of Buggy Code in LLM-Generated Unit Tests*；Junda Zhao、Shurui Zhou、Eldan Cohen；[arXiv:2607.22883](https://arxiv.org/abs/2607.22883)；cs.SE、cs.AI、cs.LG；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：论文把“被测 buggy code 诱导 LLM 写出认可错误行为的测试”量化为 misguidance effect，并用从实现中抽离出来的 specification docstring 同时减少误导测试、增加真正能暴露 bug 的测试。

**为什么值得推荐**：许多 test-generation 工作默认把被测实现作为最丰富的语义来源，但在修复场景中实现恰恰可能是污染源。更危险的是，测试能编译、覆盖率高、甚至稳定通过，却把错误行为固化为 oracle。论文把这一静默失败定义得足够精确，避免把“在 buggy 版本上通过的测试”一概误判为被误导。

**方法怎么工作**：①每条测试同时在 buggy 与 fixed 版本上执行，区分 effective、misguided、true-negative 等四类；②比较模型在两种代码条件下对测试序列的偏好，验证误导不仅是输出表象；③从 buggy 实现生成行为规格 docstring，再以规格而非源码生成测试，并用分析增强 prompt 恢复边界条件；④在多轮反馈生成中继续检查编译、路径和双版本行为。

**关键实验与证据**：论文跨多种 LLM 和真实 bug 做大规模双版本执行。基础 specification-only 方案平均把 effective tests 从 104.15 提到 186.77；增强分析后，相对 code-only 平均少 99.00 个 misguided tests、增加 111.15 个 effective tests。模型内部序列评分也显示 buggy context 系统性偏好 misguided tests，且“误导减少”与“有效测试增加”显著相关。

**局限和可信度**：fixed 版本被当作语义参照，但真实维护中修复本身也可能不完整；LLM 生成的 docstring 会产生新的规格幻觉。研究主要围绕可双版本执行的单元级 bug，尚未证明对跨文件状态、并发或环境相关故障同样成立。优势在于 oracle 是实际执行而非另一个 LLM，因果链比纯 judge 评估更可信。

**与当天主题的关系**：这篇论文提醒，测试不是天然独立的证据；若它从错误实现中学习，验证环本身会成为错误传播通道。

### 3. AssumptionMiner：把“能跑但意图错”前面的隐含假设显式化

**论文信息**：*AssumptionMiner: Extracting, Tracing, and Revising Implicit Assumptions in LLM Code Generation*；Jie “JW” Wu；[arXiv:2607.22898](https://arxiv.org/abs/2607.22898)；cs.SE、cs.CL；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：AssumptionMiner 让代码生成器同时产出结构化假设层，用 AST 依赖图把每个未明说的设计决定追踪到代码区域，并在假设变化时做局部再生成。

**为什么值得推荐**：现实 prompt 很少穷尽输入格式、异常策略和边界语义；LLM 必须补全空白，但这些决定通常藏在代码里。测试通过只能证明某组样例一致，不能证明开发者同意模型的默认假设。论文把隐含假设提升为可审阅的一等 artifact，问题定义紧贴 working-but-wrong 的核心。

**方法怎么工作**：①从自然语言请求与生成代码中抽取约束、策略和设计选择，形成可确认/可修改的 assumption layer；②用 confidence-weighted ensemble 合并多个开放模型的候选；③构建 AST dependency graph，把假设定位到受影响节点；④用户修订假设后，只重生成依赖区域，并比较局部、关键词和整文件再生成的改动范围。

**关键实验与证据**：新 benchmark 含 180 个歧义任务、676 条标注假设，平均每题 3.8 条。ensemble 的 assumption extraction F1 达 0.816，是最强离线 baseline 的 3.6 倍；但更严格的“同一设计决定”级 F1 只有 0.66。AST-guided localization 比关键词和整文件方法更精确，局部再生成修改更少代码。

**局限和可信度**：180 个任务仍偏小，且单作者研究的标注与系统设计可能共享偏好。F1 0.66 说明描述相似不等于决策等价；级联依赖与跨文件影响也是当前弱点。论文主动报告严格指标和 cascading edit 失败，使“可控性提升但未解决语义确认”这一判断较可信。

**与当天主题的关系**：它把可靠性前移到实现之前：先暴露模型替用户做出的决定，再谈代码是否正确。

### 4. Adversarial Test-Hardening：最有价值的结果是一场实验仪器尸检

**论文信息**：*Adversarial Test-Hardening for AI-Written Code: An Instrument Autopsy and a Pre-Registered Causal Estimate of the Critic Loop*；Jeff Otterson；[arXiv:2607.23002](https://arxiv.org/abs/2607.23002)；cs.SE、cs.AI；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：Tester 先写测试、mutation testing 暴露存活缺陷、Critic 再定向补测；但论文更重要的贡献是发现一个看似极显著的跨模型效果其实来自输出截断和初始样本不一致。

**为什么值得推荐**：LLM 写代码也写测试时，coverage 只能说明执行过，不能说明验证了什么。机械 mutation oracle 能避免“模型给模型判分”；而对错误实验结论的公开解剖，则罕见地展示了 agent 研究如何被 harness 的静默截断制造伪因果。

**方法怎么工作**：①Tester 生成初始测试套件；②mutation engine 注入缺陷并返回 surviving mutants；③Critic 只针对这些存活缺陷生成新测试，所有 kill 判定由执行完成；④第二个预注册实验冻结并共享 round-0 套件、预先提交 seed，用 within-replicate 对比移除初始条件混杂。

**关键实验与证据**：实验一在 5 个 Python subject 上额外杀死 105 个 one-shot 漏掉的 mutant，且没有丢失既有 kill；但原先 (p=9.5\times10^{-66}) 的跨 lineage 效果被证明是输出 cap 截断伪影。修正后的实验二在 4 个 subject、每个 5 次重复上，same-lineage Critic 杀死初始 survivors 的 78.3%，95% cluster-bootstrap CI 为 [59.2%, 93.5%]；跨 provider 差值 17.8 点，但主要由单次重复驱动。

**局限和可信度**：subject 数极小，所谓 provider/lineage 差异与模型、API、失败处理和成本纠缠，不能解释成纯模型效应。恰恰因为作者预注册、保留 receipts 并否定了自己早期的漂亮结论，这篇论文的可信价值主要来自方法论透明，而不是泛化后的绝对提升。

**与当天主题的关系**：它说明 agent 实验的 instrument 也是被测系统；没有对截断、重采样和运行失败的审计，极小的 p 值也可能只是流水线 bug。

### 5. TLA+-Bench：能解析的形式化规格，离正确还非常远

**论文信息**：*TLA$^{+}$-Bench: An Execution-Grounded Benchmark and Dataset for Natural-Language to TLA+ Specification Generation*；Arslan Bisharat、Eric Spencer、Brian Ortiz、Khushboo Bhadauria、Mujtaba Nazari、Beatriz Santos、Anisa Ramos、TaiNing Wang、George K. Thiruvathukal、Konstantin Läufer、Mohammed Abuhamad；[arXiv:2607.23425](https://arxiv.org/abs/2607.23425)；cs.SE、cs.AI；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：TLA+-Bench 用模型检查器遍历完整可达状态空间，把 parse、接口绑定、属性成立和属性是否真正约束行为拆开，得到 18.7% 到 1.7% 的“正确性包络”。

**为什么值得推荐**：自然语言到形式化规格常被用文本相似度或 parser success 评分，但一个模块能解析，并不意味着配置能绑定、性质能运行、语义正确，更不意味着性质不是 vacuous。论文没有假装 exact oracle 给出唯一真值，而是诚实展示 grading choice 如何改变结论。

**方法怎么工作**：①从 13 个公开仓库整理 403 个带可运行配置的 gold 和 897 个 parse-only silver 规格；②模型生成后依次运行 SANY、配置绑定与 TLC 全状态检查；③改变是否提供接口名、是否要求 substantive multi-state behavior、是否让性质通过 mutation probe，形成 correctness envelope；④按难度和 failure taxonomy 分析 parser、binding 与 semantic failure。

**关键实验与证据**：同一批输出仅改变评分约定，正确率从 10.0% 降至 1.7%；加入“向模型提供配置名”的上界后扩展为 18.7%—1.7%。最强模型默认正确 16%，提供接口名后 26%，开放模型最高仅 1%。300 个 frontier 输出只有 30 个通过基础检查，其中 12 个满足 substantive screen、5 个通过更严格的 mutation-surviving test；从 basic 到中高难度， pooled correctness 从 25% 跌到约 2%。

**局限和可信度**：描述由模型生成再人工审计，不等于真实需求；每规格只采样一次，置信区间约 ±4—7 点；配置绑定既测建模也测命名，组合与 refinement 任务偏少。论文把这些影响量化成包络而非隐藏起来，因而最值得相信的是“指标定义决定正确率”的测量结论。

**与当天主题的关系**：它把 patch correctness 的思想推进到规格生成：合法语法只是入口，执行与非空约束才构成证据。

### 6. API Router：coding agent 的可信路径比客户端权限更长

**论文信息**：*Where Is the Cost of Third-Party API Routers in Agentic Software Development?*；Donghao Fu、Jingxin Li、Xue Jiang、Yihong Dong；[arXiv:2607.23624](https://arxiv.org/abs/2607.23624)；cs.SE、cs.AI、cs.CL；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：SIDEL 证明第三方 API router 若可改写 provider 响应，就能让四类 coding agent 执行仓库级恶意动作；客户端 permission mode、白名单和 LLM review 都不能恢复端到端完整性。

**为什么值得推荐**：多数 agent 安全设计把信任根放在本地 permission prompt，却忽略 provider 与 agent 之间的 router 能读取并改写每个响应。对高自治 coding agent 而言，这不是文本完整性问题，而是命令、文件和仓库动作的供应链问题。

**方法怎么工作**：①SIDEL 记录干净 trace 并严格 replay；②在 router 层实施 response substitution、append、LLM-polished、distribution-aligned 四级注入；③比较 Claude Code、Codex、Cursor、OpenCode，以及不同 backend 和 permission mode；④用 defense success rate 与 wrong-block rate 联合评估白名单和绕过 router 的独立 LLM reviewer。

**关键实验与证据**：400 个注入样本覆盖 3 个 SWE-bench Lite 任务。无额外缓解时，四个 agent、四级注入、四种 Claude Code permission mode 和四个 backend 的 defense success rate 全为 0%。白名单 DSR 仅 30.8%—44.1%，同时误阻 29.7%—43.9%；独立 LLM review 最佳 DSR 约 64.4%，在 L2—L4 最佳也只有 50.8%—51.8%。

**局限和可信度**：端到端任务只有 3 个，恶意样本人工构造，全部 agent 取高自治配置；结果不能外推到所有 router 和隔离策略。replay 设计减少了上游随机性，但也弱化了真实交互适应。论文最可靠的结论是架构性的：客户端看不到 provider 原始输出时，无法单独证明响应完整性。

**与当天主题的关系**：它把 Agent 安全的证据链扩展到网络中间层：本地审计只能覆盖本地看到的内容。

### 7. Scaffold Effect：leaderboard 的比较单位应是 model–harness pair

**论文信息**：*The Scaffold Effect in Coding Agents: Harness Choice as a Hidden Variable in Coding-Agent Evaluation*；Naman Vats、Oleg Golev；[arXiv:2607.22585](https://arxiv.org/abs/2607.22585)；cs.AI；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：固定模型和任务后，Goose、OpenCode、OpenHands-SDK 之间的 pass rate 差距不大，但每个成功任务的 token 成本可差 40 倍，失败指纹也稳定地属于 harness。

**为什么值得推荐**：公开榜单常把系统分数归到模型名下，却不充分报告工具协议、上下文预载、重试、停止与验证逻辑。对实际开发者而言，成本、延迟和需要人工盯守的空转，比几个百分点的 pass rate 更直接。

**方法怎么工作**：①从 Terminal-Bench Pro 公开集按 8 类任务分层抽取 50 题；②固定任务、sandbox、900 秒上限和核心系统提示，交叉运行 2 个模型 × 3 个开源 harness，共 300 次；③收集 pass、token/solved task、turn、无动作 turn 与 6 类失败；④用 paired-task bootstrap 比较同一模型下的 harness 差异，并检查失败模式能否跨模型复现。

**关键实验与证据**：Qwen 3.6 Plus 的 pass rate 为 48%—50%，MiniMax M2.5 为 38%—46%；harness 内差异 0—8 个百分点，大多数 95% CI 含 0。与此同时 OpenCode 每成功任务的 token 约为 Goose 的 40 倍。Goose 偏 REASON failure，OpenHands-SDK 偏 VERIFY/MAX_TURNS，OpenCode 偏 idle-loop/TIME，且模式跨两模型稳定。

**局限和可信度**：只有 50 题、2 个模型、3 个 harness；token accounting 由各 harness 上报，未完全同构。OpenCode 没有同样的 turn cap，也说明“固定所有条件”与“评估原生系统”存在张力。作者没有夸大 pass-rate 显著性，并释放日志与配置，适合作为 benchmark reporting 的负证据。

**与当天主题的关系**：它解释了为什么成功率不能单独归因于模型：Agent 是模型与 scaffold 的共同产物。

### 8. Looping Is Not Reliability：修对过，不等于最后仍然正确

**论文信息**：*Looping Is Not Reliability: State-Bound Evidence and Typed Revision Contracts for Agentic Code Repair*；Xueping Gao、Jianwei Yang、Qiang Yang；[arXiv:2607.24604](https://arxiv.org/abs/2607.24604)；cs.CL、cs.AI；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：论文用 common-state 分支实验证明旧测试 trace 会让已正确代码回归，并提出把 evidence 绑定到代码/测试哈希、保留已验证 checkpoint、以 typed action 管理修复循环。

**为什么值得推荐**：generate–test–revise 循环经常被当作可靠性来源，但 iteration 只增加搜索机会，也增加覆盖正确解的机会。若反馈对应旧代码、verifier 依赖同一模型、停止规则只看自信，更多轮次甚至会系统性伤害正确状态。

**方法怎么工作**：①在同一 frozen program 上分叉 current trace、stale trace、无 trace 和 control，移除“只有失败样本继续修”的后处理偏差；②分别估计 admission、preservation、certification、competence 与 liveness；③定义 evidence envelope，携带 code hash、suite hash、execution id；④用 Keep/Patch/Escalate typed action、last-known-good ledger 和风险/依赖感知 gate 实现 StateSeal reference contract。

**关键实验与证据**：30 个 HumanEval repair、5 个 seed 形成 900 条三轮轨迹。强制第二轮后 current correctness 从 82.0% 降至 67.3%，尽管 ever-correct 升到 84.7%。14B common-state 实验中，stale trace 伤害 34/135 个正确起点，current trace 仅 4/135，差 22.2 点，95% CI [8.9, 37.0]。visible gate 把 29.5% risk 降到 2.4%，但仓库级 24 bug 实验受 floor effect 影响，未得到 Holm-significant 的能力提升。

**局限和可信度**：主证据集中于 HumanEval，仓库实验 proposal 稀少、无效动作多，contract 更像可执行规范而非已证实的通用修复器。verifier 仍会共同失效，hash 只能证明证据新鲜，不能证明语义正确。论文明确给出 negative prospective result，这让边界比只报告 replay 成功更可信。

**与当天主题的关系**：它为“状态—证据—提交”建立了最清楚的类型契约，直接挑战把循环次数当可靠性的习惯。

### 9. ContainmentBench：相同的零伤害终点，可能隐藏完全不同的传播轨迹

**论文信息**：*ContainmentBench: Trace-Based Evaluation of Post-Injection Containment in Tool-Using LLM Agents*；Wenhao Lan、Shan Li、Xinhua Lai、Meiqi Wu、Junbin Yang、Haihua Shen；[arXiv:2607.23999](https://arxiv.org/abs/2607.23999)；cs.CR；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：ContainmentBench 把 prompt injection 后的 endpoint policy、taint 传播、恢复证据和授权任务效用分开计量，证明“最终没有提交恶意动作”并不能代表 containment 质量相同。

**为什么值得推荐**：安全评估若只看攻击是否最终成功，会把早早隔离与一路污染消息、记忆和子代理后才被最后工具边界拦下视为同一结果；反过来，block-all 也会用严重过拒绝换取漂亮安全分。论文把 containment 定义成轨迹属性，而非单一 terminal label。

**方法怎么工作**：①sandbox 记录消息、tool proposal、memory write、side-effect commit、taint 与授权决策；②按 security、active-tainted utility、memory/recovery、clean utility 四个 evidence stage 分层；③比较 taint-only、trusted intent ledger、rollback 与强 tool-boundary policy；④对相同 endpoint 的 matched pairs 计算 trajectory divergence，并显式报告分母与 stage composition 敏感性。

**关键实验与证据**：预设研究共 17,640 次 rollout，使用 Qwen2.5-7B-Instruct。600 对 taint-only 与 intent-aware 样本都实现零 committed harm，但 73.5% 的轨迹或效用不同。taint-only 的授权污染任务完成率只有 0.1642，intent ledger 提升到 0.8567，tool-boundary 达 0.9233；logged-spread 排名会随 stage 和分母改变。

**局限和可信度**：全量研究是 synthetic、single-model，intent policy 假设结构化授权 ledger 正确；“传播”也只等于 instrumented log 中可见的 taint。作者没有把零事件当零风险，并报告 cluster upper bound 与分母敏感性，因此测量主张可信，但真实生态泛化仍需验证。

**与当天主题的关系**：它把 Agent 安全从“是否出事”升级到“影响传播到哪、恢复了什么、牺牲多少授权效用”。

### 10. Group Preference Collapse：个性化模型会向多数偏好塌缩

**论文信息**：*Group Preference Collapse in Personalized Multimodal Large Language Models*；Fan Lyu、Wenqi Zhang、Joost van de Weijer；[arXiv:2607.22603](https://arxiv.org/abs/2607.22603)；cs.AI；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：PrefMoE 把稳定 profile 与细粒度 preference 分开建模，用 prototype、个体 residual 和双 LoRA 路由，缓解多用户训练向主流偏好收缩的问题。

**为什么值得推荐**：个性化评估若只看总体 accuracy，会漏掉模型把少数用户“平均化”的失败。论文定义 collapse 指标，检查模型是否把用户未偏好的项目错误扩张进偏好边界，给偏好 post-training 一个比平均正确率更敏感的失败对象。

**方法怎么工作**：①把 preference 分解为共享 prototype 与 personalized residual；②用 imbalance-aware learning 保护低密度 residual，并生成 counterfactual pseudo-user 平衡长尾；③对 residual 做 decorrelation，减少群体偏好互相吞并；④通过 profile 与 preference 两条 LoRA adaptation path 分路由，再融合回答。

**关键实验与证据**：MMPB-Clean 含 12,516 个 QA pair，覆盖 0-turn 与 10-turn。LLaVA-1.5-7B 上，相对 full fine-tuning，PrefMoE 将 preference accuracy 从 44.13% 提至 67.33%，collapse 从 34.25% 降至 12.33%；最佳设置 preference accuracy 达 78.93%、collapse 10.96%。多 backbone 的趋势一致，消融显示 profile learning 主增准确率，counterfactual augmentation 与 decorrelation 主降 collapse。

**局限和可信度**：模型依赖显式、结构化偏好描述，真实偏好往往矛盾、动态且不完整；exact-match 与人工构造的 preference boundary 也不能涵盖开放式回答质量。结果支持“机制能减轻该 benchmark 上的坍缩”，尚不能证明普遍个性化对齐。

**与当天主题的关系**：它说明偏好优化的可靠性不能只看群体平均，必须检查训练是否抹平了个体边界。

### 11. Masked Distillation：思维链能否内化，取决于任务是否已有先验

**论文信息**：*Masked Distillation: Internalizing the Chain-of-Thought in Language Models*；Durgesh Kalwar、Vardhan Palod、Subbarao Kambhampati；[arXiv:2607.22629](https://arxiv.org/abs/2607.22629)；cs.AI、cs.CL；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：student 只预测最终解答 token，teacher 在完整 CoT 条件下给分布监督；结果显示 GSM8K 可大幅内化，而陌生的 Countdown 仍需要少量显式 reasoning scaffold 才能接近 teacher。

**为什么值得推荐**：缩短 CoT 常被描述成统一的推理压缩问题，但显式 token 可能既是冗余解释，也是在陌生搜索空间中不可替代的工作记忆。论文通过连续调节保留的 trace suffix，给出 accuracy–token frontier，而不是只比较“有/无 CoT”。

**方法怎么工作**：①收集 teacher 的 intermediate tokens 与 solution tokens；②student 仅看问题并在 solution token 上匹配 teacher 分布，形成 fully masked distillation；③在 self-distillation 与大 teacher/小 student 两种设置中训练；④用参数 \(\alpha\) 保留不同比例的 trace suffix，在完全内化与完整 trace 之间扫描。

**关键实验与证据**：GSM8K self-distillation 将非思考 student 从 61.0% 提到 76.0%，平均输出 369.6 token，对 teacher 的 2,398.1 token 是 6.5 倍缩减；\(\alpha=0.3\) 时达 83.2%。Countdown 完全 masked 只有 41.7%，但小 scaffold 可达 86.2%，接近 teacher 的 87.3%，同时比非 masked 少约 1.3 倍 token。双模型 Countdown 中 fully masked 为 34.1%，完整 trace 为 81.1%。

**局限和可信度**：只有两个推理域，且 GSM8K 很可能进入预训练分布；“内化”由输出行为推断，并未证明同一算法过程进入参数。teacher trace 的错误、长度与采样质量也会影响蒸馏。论文最有价值的结论正是负面边界：无先验的新搜索结构不能简单删掉显式 scaffold。

**与当天主题的关系**：它把训练效率与能力来源连接起来：少 token 不一定更聪明，可能只是把已有模式压进参数。

### 12. Task Adaptation 不是 alignment-neutral 的能力升级

**论文信息**：*How LLM Task-Adaptation Reshapes Alignment: A Multi-dimensional Study of Behavioral and Representational Drift*；James Elcock、William F. Shen、Xinchi Qiu、Nicholas D. Lane；[arXiv:2607.22676](https://arxiv.org/abs/2607.22676)；cs.AI、cs.CL；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：跨 15 个 alignment 维度比较 SFT、KL-SFT 与 RLVR 后，论文发现 SFT 的行为与内部表示漂移最大，RLVR 较小但非零，KL anchor 可连续调节保持程度。

**为什么值得推荐**：下游 fine-tuning 常只报告任务增益和单一安全集，默认其他行为保持不变。论文把安全、事实性、立场稳定、社会伤害、可控性与指令遵循同时纳入，并检查 residual-stream concept direction 是否与行为漂移同步。

**方法怎么工作**：①在 Qwen2.5-3B、Llama-3.2-3B 等 instruction model 上对 MATH 与 TACO 做 SFT、KL-SFT、GRPO/RLVR；②在 15 个维度、多个 checkpoint 上做等价性检验；③扫描 KL 系数 \(\beta\)；④抽取 refusal、sycophancy、power-seeking 等 7 个对比方向，比较表示距离与行为变化。

**关键实验与证据**：SFT 的 112 个 metric cell 中 32 个显著 shift，mean absolute drift 4.68 个百分点；KL 系数从 0.05、0.1 增至 0.5 时，平均漂移从 4.26、3.80 降到 2.29 点，shift cell 降到 13。7 个概念的表示变化与行为变化均在 Holm–Bonferroni 后显著，|r| 从 0.57 到 0.95；RLVR 整体更接近 baseline。

**局限和可信度**：模型较小、任务只有数学与代码，alignment metric 自身存在测量噪声；concept direction 的线性可分性不等于因果机制。KL 会同时压回有害与有益变化，不能被解释为单向安全增益。多 checkpoint 与统计校正增强了可信度，但跨规模结论仍待复验。

**与当天主题的关系**：它要求 post-training 报告“能力变好时哪些既有行为被改写”，而不是把 alignment 当静态属性。

### 13. ProGPO：只在全失败组里，用进展恢复稀疏奖励的方向

**论文信息**：*Progress-conditioned Group Policy Optimization for Long-Horizon Agentic Tasks*；Kaibing Yang、Guangfeng Cai、Shengtian Yang、Shuo He、Yu Li、Mengyi Liu、Pengwei Chen、Jun Xu、Lei Feng；[arXiv:2607.22724](https://arxiv.org/abs/2607.22724)；cs.LG、cs.AI；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：ProGPO 不改写成功奖励，只在同组 rollout 全部失败时，以 first-visit observation coverage 给相对 advantage，打破长程任务中“重复动作—全失败—零梯度”的 credit trap。

**为什么值得推荐**：GRPO 类方法依赖组内相对结果，但困难任务早期常出现 all-zero group。此时没有学习信号，策略的高概率重复动作继续占据采样，下一轮仍全失败。论文没有粗暴奖励“动得多”，而是把进展信号限制在 outcome 无法排序的退化组中。

**方法怎么工作**：①检测整组 outcome reward 是否全零；②按首次访问的新 observation 计算长度归一化 coverage；③通过 novelty gate 排除无状态变化的重复动作；④仅在退化组混入 progress advantage，成功组仍保持原始 outcome 排序，并对 shuffle/random/always-on 做控制。

**关键实验与证据**：在 ALFWorld、WebShop 上用 Qwen2.5-1.5B/7B，ProGPO 对 GRPO、GiGPO、HGPO 三类 base 均提升。训练早期 75%—92% 的组全失败，baseline 在 epoch 60 仅 32.8%，ProGPO 为 49.2%，最终达到 91.4%。默认权重得到 92.2%，接近 sweep 最优 94.5%；always-on 版本在 ALFWorld/WebShop 仅 90.9/68.8，低于条件版 91.4/72.4，支持“只在无 outcome 信号时介入”。

**局限和可信度**：进展依赖 observation-level 新颖性，可能奖励无意义探索；两个文本环境离真实 GUI 和仓库 agent 仍远。阈值和状态表征可能被环境实现影响。论文用随机/打乱控制和条件消融排除了部分替代解释，但尚未证明 progress 不会被策略投机。

**与当天主题的关系**：它是“先诊断信号何时失效，再局部修补”的代表，而不是把辅助奖励灌进所有轨迹。

### 14. Outcome-Confounded Local Supervision：teacher 同意，也可能一起错

**论文信息**：*Outcome-Confounded Local Supervision in On-Policy Distillation*；Guoqing Ma；[arXiv:2607.23731](https://arxiv.org/abs/2607.23731)；cs.LG；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：把 token-level teacher–student divergence 与最终正确性做二维拆分后，论文发现大量 token 属于 agreement-on-failure，说明局部 teacher likelihood 不能定位长轨迹在哪一步不可恢复。

**为什么值得推荐**：on-policy distillation 常把 teacher 同意解释为安全模仿、teacher 不同意解释为局部错误。但 teacher 是在 student 已走到的 prefix 上打分，最终失败可能来自更早的不可逆分叉；局部一致性被 trajectory outcome 混杂。

**方法怎么工作**：①student rollout，teacher 在每个 student prefix 给 token likelihood；②以 divergence threshold 与最终答案正确性构造 safe imitation、productive divergence、harmful divergence、agreement-on-failure 四象限；③跨 threshold、sequence、格式与截断做稳健性审计；④用 imitate、mask、contrast 三个 matched probe 测试这些现有信号能否减少坏象限。

**关键实验与证据**：Qwen3-8B student / Qwen3-32B teacher 的 8-seed 数学实验中，agreement-on-failure 占 pooled response-token mass 的 67.84%；Qwen2.5-7B/32B 仍为 67.68%。即便只看 teacher 四次都解对的 prompt，student accuracy 达 86.91%，agreement-on-failure 仍有 14.76%。三个训练 probe 均未稳定降低这一比例。

**局限和可信度**：主证据只有数学推理流水线、两个模型 family，诊断阈值仍是人工设计；token mass 也不等于对最终错误的因果贡献。作者明确把工作定位为 diagnostic 而非新算法，并指出需要 process label、teacher continuation 或跨 rollout 对齐，结论克制。

**与当天主题的关系**：它是今天最重要的 post-training 警告之一：稠密反馈不自动意味着可解释 credit assignment。

### 15. RLSVR：把开放任务变形成可自验证博弈

**论文信息**：*From RLVR to RLSVR: Task Transformation Induces Self-Verifiable Rewards for Open-Ended LLM Self-Improvement*；Qinsi Wang、Jing Shi、Huazheng Wang、Kun Wan、Yiran Wu、Bo Liu、Qingyun Wu、Hai Helen Li、Yiran Chen、Handong Zhao、Wentian Zhao；[arXiv:2607.23802](https://arxiv.org/abs/2607.23802)；cs.AI；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：SpyRL 把摘要和创作放进“谁是卧底”式非对称信息博弈，让预先指定的 spy 身份与投票结果产生可验证奖励，从而把 RLVR 扩展到没有天然答案的开放任务。

**为什么值得推荐**：开放生成依赖人类、reward model 或 LLM judge，既贵又把训练上限锁在 judge 能力。RLSVR 的创新不是声称质量可被完全客观化，而是重新设计任务，使“产出足够好以不被识别”与一个规则可核验结果相关。

**方法怎么工作**：①多个 agent 接收不对称信息并完成同一目标任务；②预定一个 spy，其输入经过摘要遮盖、创作遮盖或数学上下文破坏；③所有 agent 互评并投票识别 spy，身份给出 exact reward；④用 GRPO 交替优化 perform 与 detect，使输出质量和辨别能力共同提升。

**关键实验与证据**：Qwen3-4B 的五个摘要集上，SpyRL 平均 ROUGE 提升 4.56 点；Qwen3-8B 提升 4.04 点，并相对 base 获得约 75.4% 摘要、77.3% 创作 win rate。数学/可验证 reasoning 平均提升 8.40%（4B）和 6.32%（8B）。盲评创作中，对 base、R-Zero、Absolute Zero 的 win rate 分别为 80.0%、78.5%、74.0%。

**局限和可信度**：投票奖励只与质量相关，不等价于质量本身，模型可能学习可识别性捷径或合谋；开放任务主评仍大量依赖 GPT-4o A/B judge。人评与多 benchmark 增强证据，但“自验证”应理解为构造出的 proxy 可验证，而非开放质量已被完全形式化。

**与当天主题的关系**：它展示了 verifiable reward 的另一条路：不勉强为开放答案造 judge，而是改变训练环境让反馈可核验。

### 16. Reward Model Memorization：奖励模型把容量花在了错误的地方

**论文信息**：*What do Reward Models Memorize?*；Ivo Verhoeven、Pushkar Mishra、Ekaterina Shutova；[arXiv:2607.24484](https://arxiv.org/abs/2607.24484)；cs.LG、cs.CL；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：用 counterfactual memorization 分解两个偏好数据集后，论文发现 reward model 记住高 margin 易样本、模型身份和招募批次，却在未见 pair 上过度依赖长度与顺从等表面启发式。

**为什么值得推荐**：理想 RM 应把记忆能力用于细微、上下文依赖、低 margin 的难偏好，而把稳定原则泛化出去。现实却相反：训练目标奖励容易分开的 pair，数据集特有元数据被当作偏好原因，最后为 RLHF 的 verbosity、sycophancy 和 compliance hacking 提供梯度。

**方法怎么工作**：①在 PRISM 与 COMMUNITY 上多次训练 LoRA reward model，比较样本被纳入与留出时的偏好概率，得到 training、testing 与 counterfactual memorization map；②为 response pair 标注 84 个复杂度、dialog act、情绪、礼貌、规则和 sycophancy 特征；③用三层 MLP 与 SHAP 解释哪些特征驱动记忆/泛化；④训练 sparse autoencoder，从表示中寻找不同 map 区域的潜在特征。

**关键实验与证据**：特征回归对 training memorization 的 \(R^2\) 为 0.56/0.63，对 testing generalization 为 0.52/0.38，对 counterfactual memorization 为 0.39/0.33（PRISM/COMMUNITY）。高 user-preference margin 强烈预测训练记忆，却较弱预测留出泛化；模型身份、招募波次会形成数据集捷径。未见 pair 上，长度、复杂度和 full compliance 被系统性过度奖励，而拒绝需要被逐例记住。

**局限和可信度**：只有两个相关偏好集、LoRA RM 和自动特征标注；SHAP/SAE 是关联解释，不能直接证明 RLHF 下游行为的因果路径。counterfactual 估计依赖多模型训练预算，方差和初始化仍可能影响 map。尽管如此，跨两数据集复现三类模式，使“RM 不只记多少，更要看记什么”成为很强的诊断结论。

**与当天主题的关系**：它把 reward hacking 的调查前移到 reward model 训练数据，而不是等 policy 暴露异常行为后再补救。

### 17. 长程规划的“物理学”：GRPO 与 OPD 有不同有效区间

**论文信息**：*The Physics of Multi-Turn Long-Horizon Planning: From Pre-training to Post-training via Single- and Multi-Teacher On-Policy Agentic Distillation*；Tianyi Men、Zhuoran Jin、Kang Liu、Jun Zhao；[arXiv:2607.24720](https://arxiv.org/abs/2607.24720)；cs.CL、cs.AI、cs.LG；列入 2026-07-28 官方新论文列表。

**一句话 TL;DR**：在可控多环境中，论文从预训练数据、GRPO/OPD 塑形到多 teacher OPD 整合，系统划出长程规划何时可学、何时需少量长轨迹、何时 teacher 知识反而造成干扰。

**为什么值得推荐**：长程 agent 的提升常把预训练、RL 和 distillation 混在一起，无法回答能力来自世界模型、原子技能还是 teacher。论文构造统一环境，控制 horizon、最优/次优路径、环境共享结构和 teacher 知识，试图给出机制级相图，而非单点 SOTA。

**方法怎么工作**：①预训练阶段比较直接 action imitation 与显式 state-transition world modeling，并扫描 short/middle/long 数据比例；②post-training 阶段在不同数据质量与 horizon 上比较 outcome-reward GRPO 与 token-level OPD，划分 unnecessary、effective、unsupported region；③知识迁移实验区分 planning pattern 与具体 procedure；④MOPD 依次吸收多 teacher，测试兼容、部分共享和冲突模式下的泛化与遗忘。

**关键实验与证据**：world modeling 对 short/middle/long 的 avg@8 分别带来约 +9.4、+39.3、+45.8 点。只学 short task 时 middle/long pass@8 仅 0.83%/0%，加入 5% middle 数据后 middle 升到 51.88%，加入 5% long 后 long 升到 11.46%。在大量次优轨迹的困难区，OPD 增益约 +18.4—18.9 点，而 GRPO 可能只有 +7.4 点甚至为负；这支持 OPD 的有效区更宽。

**局限和可信度**：环境是人为控制的合成规划世界，规律未必直接迁移到 web、GUI 或 repository repair；整篇实验规模极大，多个阶段与指标也增加研究者自由度。MOPD 的“共享 pattern”主要由行为结果与信息论分析支持，仍非可识别因果对象。它适合作为机制假设地图，而不是现成统一配方。

**与当天主题的关系**：这篇论文把 post-training 的成败放回数据和环境结构中解释，反对脱离能力支持区比较算法名。

## 中相关论文速读

### Coding agent / software change

#### 1. 编程语言会系统性改变 Agent 的 token 成本

[*The Best Programming Language for Tokenmaxxing*](https://arxiv.org/abs/2607.22807) 在控制题目难度后比较五个模型的 Python、Java、Rust、OCaml 轨迹，并重放每个中间版本。值得保留的判断是：语言不仅改变最终通过率，还改变“先写不编译代码—重复修已经通过的解—用 Python 原型逃避陌生语言”的轨迹结构。它没有给出新的修复器，但把 per-language token efficiency 提升为 benchmark 必报项；因任务多为编程题而非真实仓库，所以不列强读。

#### 2. Coverage 与 mutation score 只有在特定测试语境下才可靠

[*Do Coverage and Mutation Scores…Correlate with Effectiveness?*](https://arxiv.org/abs/2607.22880) 复现实证研究，发现 LLM 生成测试与人写测试不同：在被测代码可合理视为无 bug 的 regression 场景，coverage/mutation 可用于跨模型比较；当输入本身有 bug、目标是暴露它时，两者不再是可靠 real-bug signal。它和强读第 2 篇共同说明应先定义测试生成场景，再选代理指标；论文贡献偏测量复现，所以速读即可。

#### 3. Solidity property generation 已接近部分人工基线，但方差很大

[*Towards LLM-assisted High-Quality Property Generation for Solidity Smart Contracts*](https://arxiv.org/abs/2607.23308) 用 mutation testing 比较 zero-shot、few-shot、prompt chaining。Gemini Pro 1.5 + chaining 的平均 mutation score 为 25.99%，人工为 31.75%；LibBit 上分别为 74.34% 与 74.83%。可记住的是按合约报告方差，而不是用平均值宣称“接近专家”；样本与模型较旧，且 property correctness 仍主要由 mutant killing 间接衡量，因此不必深挖。

#### 4. Athena 用依赖图加语义耦合做 change impact analysis

[*Enhancing Code Understanding for Impact Analysis…*](https://arxiv.org/abs/2607.23355) 把 program dependence graph 与 transformer code representation 结合，并构建 25 个开源项目的 Alexandria benchmark。最佳 mRR/mAP/HIT@10 为 60.32%/35.19%/81.48%，相对简单 baseline 提升 10.34/9.55/11.68 点且有统计显著性。它直接服务软件演化中的变更定位，但论文最初已被 FSE’24 接收、此次是较晚 arXiv 上架，创新时效性低于当天强读。

#### 5. Issue–commit traceability 应建模成一对多迭代选择

[*LinkRank*](https://arxiv.org/abs/2607.23610) 不再独立分类每个 issue–commit pair，而是 pick–remove–renormalize，直到 Known-K 或自动 stopping rule 停止。六个仓库上 Known-K F1 74.54%，最强 baseline 48.39%；Unknown-K 为 68.84%/67.02%。对 history reconstruction 很实用，但数据仅六仓库，停止规则跨项目稳定性还不够，适合作为明确的建模判断保留。

#### 6. RESTOR 把单次 API traffic 变成可执行 oracle

[*RESTOR*](https://arxiv.org/abs/2607.23963) 从一个 request–response pair 生成断言，用数据增强和 GRPO 教轻量 LLM 避开 timestamp/trace id 等动态字段。在 2,300+ trace、246 个真实服务上 key-field F1 达 85.42%；字节跳动生产 CI/CD 的自动测试采纳率从 74.1% 提到 96% 以上。工业证据很强，但摘要没有充分暴露 reward 设计与泄漏控制，故先列速读，复现前应细查 train/test 服务隔离。

#### 7. NL2Test 的价值在“LLM 语义 + 确定性依赖校验”

[*Industrial Practice of LLM-Based Test Case Carving and Assertion Generation*](https://arxiv.org/abs/2607.24000) 从自然语言场景与 traffic capture 抽取最小 replay sequence、重建数据依赖并生成断言。51 个工业场景 exact match 82.4%，允许小改后 98.0% 可用；9 个月生成 3,196 个 case，代码采纳率 85.4%。样本不大且缺少公开复现包信息，但长期部署比单次离线分数更值得记住。

#### 8. Execution-grounded red team 揭示“工程任务伪装”下的危险执行

[*Execution-Grounded Security Testing for Coding Agents*](https://arxiv.org/abs/2607.22569) 把不安全操作藏进 unit test、回归、crash reproduction 等常规工作负载，再用 sandbox tool trace、runtime trace 和文件 diff 做 oracle。经过执行反馈改写后，code carrier 的 verified unsafe execution 达 73.61%，text carrier 达 53.93%。它强烈支持执行层红队，但危险意图嵌入方式与真实攻击分布仍需审计，因而放在中相关。

#### 9. ParBench 把并行代码迁移的低层语义纳入执行验证

[*ParBench*](https://arxiv.org/abs/2607.22588) 固定 build/run/verification，只让模型翻译 CUDA、OpenMP、OpenCL、target offload kernel，并用 AST 保义变换测试表面记忆。最值得保留的是 direction asymmetry、多文件协调与 host–device 语义不能被普通编译通过替代。摘要未给完整数值和硬件覆盖，暂不深读，但它为跨平台迁移评估提供了正确的 executable framing。

#### 10. ParaGUIBench 首次把 GUI 多代理并行协调变成可测对象

[*Beyond Sequential Interaction*](https://arxiv.org/abs/2607.22689) 提供多桌面 Docker、共享文件系统和 233 个任务；ParaGUI planner–worker 达 46.4% success，比最强 serial baseline 高 12.9 点，步骤和 token 均不到一半。结果说明可分解长任务能从并行获益，但共享文件冲突、真实设备差异和不可分任务比例仍未充分覆盖。

#### 11. Runtime safety 的可保证范围取决于策略状态能否表示

[*What Can Be Enforced?*](https://arxiv.org/abs/2607.22868) 给出 deterministic gate 可执行 policy 的形式边界、Neyman–Pearson false-block/miss frontier、conformal marginal certificate，以及 blocking 改变未来 proposal 后的 closed-loop occupancy program。它对安全 Agent 很重要，但主要贡献是理论分层而非 coding-agent 实验；阅读时应重点记住“benign calibration 不会自动抵抗 representation attack”。

#### 12. ATWZ 把长寿命 coding team 的工作状态落到文件系统

[*Agent Team Work Zone*](https://arxiv.org/abs/2607.22917) 用 workstation、skill、hook 和脚本保存 teammate 状态，解决进程结束后不可恢复、compaction 丢细节与长期 agentic technical debt。设计问题很现实，但当前摘要主要是系统主张，缺少任务成功率、恢复正确性和多人冲突的对照实验，因此更像值得试用的工程原型。

#### 13. Triton 优化需要从 profiling 逐层追到 compiler IR

[*Compiler-Grounded Hierarchical Diagnosis for LLM-Based Triton Kernel Optimization*](https://arxiv.org/abs/2607.23089) 先轻量 pattern/profiling，必要时升级到 IR attribution 和 compiler behavior，再做 source rewrite。Ascend 950 的 37 个 kernel 上 geometric mean speedup 4.35×、median 2.73×，22/37 超过 2×。结果亮眼，但只含“成功转换”的 37 项，selection bias 与硬件专属性使它更适合作为诊断 workflow 参考。

#### 14. SQBench 把 deliverable 与风险触发分开计分

[*SQBench*](https://arxiv.org/abs/2607.23123) 含 220 个 L1/L2/L3 任务，先算 Completion，再用 10D Risk Matrix 独立给 penalty；Strict Pass 要求完成且无风险。27 个配置最高 Weighted Pass@1 60.5%，L3 平均 Strict Pass 仅 18.5%；2,348 个已完成结果中 4.8% 因引用、资源或格式风险失败。每配置每题只跑一次限制了统计稳定性，但评价对象选得对。

#### 15. E-Bench 用数据库状态差分评分多步工具调用

[*E-Bench*](https://arxiv.org/abs/2607.23722) 合成三个产品域的 323 个 state-changing task，以 graph-guided 数据库生成环境、generator–solver asymmetry 制造信息与工具缺口，最后用 DB diff 确定性评分。11 个前沿模型的 Pass³ 仍低于 60%，加入代码执行也低于 70%。完全合成提高控制性但牺牲真实分布，是适合做机制测试而非直接估计生产能力的 benchmark。

#### 16. AcquaBench 审计“成功是否依赖拿到了答案”

[*Success Is Not Self-Explanatory*](https://arxiv.org/abs/2607.24054) 用 CLEAN、GOLD、SHAM matched substitution 区分正常推理、正确答案暴露与结构相同的错误值暴露。D0 中 GOLD 比 SHAM 高 19.1—25.9 点，证明成功跟随目标值；分布式 sufficiency 下简单 coloc probe 的 AUROC 可跌到 0.376/0.142。它不专门测 coding，但对带搜索、记忆和工具的 Agent 评估极有启发。

#### 17. STP 用 GUI 状态转移预训练内部世界模型

[*Scaling GUI Agents with Visual State Transitions*](https://arxiv.org/abs/2607.24112) 联合 inverse dynamics（状态差推动作）与 forward dynamics（状态和动作推下一屏），再对任务轨迹 fine-tune。在桌面与移动 benchmark 上都优于直接 trajectory tuning，并随 transition data 扩展。摘要没有给绝对数值或真实 app drift 测试，因此保留“状态转移是预训练轴”这一判断即可。

#### 18. FCPAgent 让计划步骤携带可证伪条件

[*Falsifiable Commitment Planning for Self-Correcting Web Agents*](https://arxiv.org/abs/2607.24167) 把每步计划写成 subgoal、skill、确认/反证 evidence 与 confidence 的 FCU，动作前后测试 commitment，失败时只修 execution、skill 或 plan 中最小范围。WebArena 相对最强 baseline 平均成功提升 13.8%。方法契合可靠工作流，但仍依赖 LLM diagnostic verifier，且 WebArena 的状态可观测性不能代表真实网站。

### LLM post-training

#### 19. PAJAMA 把 LLM judge 蒸馏成程序委员会

[*Codifying the Judge*](https://arxiv.org/abs/2607.22561) 合成多个可检查、可编辑的评分程序，低置信样本才回退 LLM。五个数据集、四个模型族上可匹配 13B judge；RewardBench 上，用程序 verdict 训练的 RM 优于 proprietary-LLM label，API 成本低两个数量级。它把 evaluator distillation 做成透明 artifact，但 program synthesis 是否把 judge 偏差固化为规则仍需逐域审计。

#### 20. DynaResize 优化的是 post-training pipeline bubble

[*DynaResize*](https://arxiv.org/abs/2607.22614) 在 rollout 与 training 间动态切换 GPU，通过 communicator reuse、bounded state staging 与 hysteresis 降低角色切换成本。相对最佳静态分区，吞吐提升 66.5%、总时间降 33%，并隐藏 27% 的切换开销。它不改变 RL 算法，却实质改变可承担的在线 post-training 效率；需要关注故障恢复和更大集群上的网络成本。

#### 21. TRACE 用两阶段课程保住工具知识

[*TRACE*](https://arxiv.org/abs/2607.22639) 先用多格式 SFT 将 8,300+ API 编成虚拟 token，再用业务规则合成 query 与 reasoning trace，训练单 beam JSON 检索。Stage 2 后 MCQ/QA probing 反而提高 3.2/9 点，两个域 recall 约 86%/60%，对 embedding baseline 的 27%/52%。可记住的是“课程要同时验证旧知识保留和线上解码成本”。

#### 22. STAIF 把软约束偏好与硬约束 RLVR 分阶段优化

[*STAIF*](https://arxiv.org/abs/2607.22649) 在约 31,000 条中英多约束指令上，Stage 1 用多 negative preference optimization 学主观质量，Stage 2 用 verifiable reward 强化可判定硬约束。方法动机合理，也报告 SOTA 与 OOD generalization；但摘要缺绝对指标和 judge 细节，阅读时应优先核查 soft/hard constraint 划分是否泄漏测试规则。

#### 23. Co-Harness 让脚手架与权重交替共同演化

[*Co-Harness*](https://arxiv.org/abs/2607.22688) 由 HarnessCritic 分析失败轨迹、提出并验证局部 prompt/tool/skill/memory 更新，再用改良 harness 产生高质量轨迹 fine-tune 模型。200+ 小时 autonomous case 可从 crash 恢复、优化推理效率并发现 ensemble。概念上重要，因为固定 harness 会锁住训练数据生成过程；当前主要是一例长时间 case，缺少严格多 seed 因果分解。

#### 24. TTCov 在训练前用部署分布选择数据

[*Test-Time Coverage*](https://arxiv.org/abs/2607.22697) 用 LLM atomic proposition 构建 deployment Atlas，再按未标注测试样本的概念频率形成 K-Atlas，选择匹配的训练子集；权重更新仍在正常训练阶段，不在推理时适配。自动驾驶实验优于训练侧 curation baseline。它属于数据层 post-training/适配，核心风险是测试侧信息使用边界与 proposition extractor 偏差。

#### 25. AutoThinkSQL 用 SFT+DPO 学会“何时不推理”

[*Learning When to Reason for Text-to-SQL via SFT and DPO*](https://arxiv.org/abs/2607.22622) 让 Qwen3-Coder-30B-A3B 对简单 SQL 直答、复杂 SQL 展开 CoT。在 Spider/BIRD 上同时增分，并相对 CoT-only 减少 24.6%/18.3% token、17.1%/11.5% latency。贡献是把 reasoning budget 作为可学习决策；但训练难度标签与 benchmark schema 的相关性可能形成捷径。

#### 26. Influence auditing 能把 alignment 数据审查空间缩小 99.1%

[*Beyond Shapley*](https://arxiv.org/abs/2607.22766) 用语义 k-NN 图与 reference LLM 条件 log-likelihood shift 近似记录影响，无需反复 retrain。HelpSteer2 上把人工审查空间缩小 99.1%，HH-RLHF 中发现数千个安全/事实偏好反转，并指出 evaluation split 也会错罚更安全回答。它是数据诊断而非训练算法，关键待核查项是 reference model 自身偏差是否被当作真值。

#### 27. DomainPilot 用域级 loss 调混合，而非逐样本筛选

[*DomainPilot*](https://arxiv.org/abs/2607.22769) 在线记录 token-level domain loss，用 scaling law 做粗调、mixing law 建模跨域交互做细调，并以约 30 行 adapter 接入 Megatron 类框架。Qwen3-1.7B SFT 在相同数据量/成本下，MMLU-Redux、AIME24、LiveCodeBench v5、BFCL v3 分别提升 2.0、1.8、3.8、3.6 点。工业可实现性强，但 controlled sweep 本身的成本应计入总预算。

#### 28. NOPD 用干净/扰动视觉差异制造自监督 teacher

[*Self-Boosting Vision-Language Models with Noisy Student On-Policy Self-Distillation*](https://arxiv.org/abs/2607.23125) 让 student 从 corrupted image rollout，teacher 用同一模型的 clean image 分布监督。Geometry3K 仅 2.1K 样本就让 Qwen2.5-VL-7B 提升 20 点，MathVista OOD 提升 7.4 点，并跨 3 模型、12 benchmark 生效。方法简洁，但若 corruption 改变语义，teacher–student 差异不再是纯 privileged signal。

#### 29. SeekJudge 把 computer-use reward 变成可搜索的多角色判断

[*SeekJudge*](https://arxiv.org/abs/2607.23263) 用 Condense、Ground、Seek、Analyze 四角色在 trajectory 上循环检索证据，再蒸馏到共享 9B backbone。论文声称按 held-out RL goal 的下游 success，首次让 model-based reward 匹配或超过原生 rule evaluator，并给 step-level verdict、更低成本和长轨迹小上下文。它很贴近真实 CUA post-training，但摘要缺具体差值与 rule drift 控制，值得保留而非直接接受 SOTA。

#### 30. Outcome reward 下，“无偏”与“长度不变”不可兼得

[*On the Impossibility of Unbiased and Length-Invariant Policy Optimization with Outcome Rewards*](https://arxiv.org/abs/2607.23364) 证明标准 GRPO 场景中不存在只依赖长度的权重同时满足 policy-gradient unbiasedness 与每轨迹贡献不随长度变化。GRPO 近似后者但有偏，Dr. GRPO 无偏但长轨迹贡献按长度比放大；\(f_\alpha(L)=L^{\alpha-1}\) 给出连续谱。它是很干净的理论纠偏，提醒“修掉 length bias”必须先说选择了哪端 trade-off。

#### 31. HyGAE 用一个 critic 同时服务 token 与 turn credit

[*Hybrid Advantage Estimation with Unified Critic for VLM Agentic RL*](https://arxiv.org/abs/2607.23605) 推导 token-wise 与 turn-wise objective 的 hybrid advantage，并证明适当 discount/target 下可用统一 critic 估值。五个多轮环境平均 success 91%，比其他方法高约 10%。理论与结果都值得看，但五个环境的任务同质性、critic calibration 与更长 horizon 的方差仍需 PDF 级核查。

#### 32. O²-CritiCuRL 用离线多 rollout 找关键步，再在线补全

[*Offline-Online Curriculum RL for Multimodal Reasoning*](https://arxiv.org/abs/2607.23700) 先从 step-annotated 多轨迹估计 criticality、过滤冗余，再用逐步截断 CoT 让模型在线补齐关键步骤。目标是避免“结论对、过程错”的 shortcut，并报告 SOTA 与训练/推理效率提升。摘要缺具体数值和过程标签来源，重点应核查 critical-step estimate 是否由最终答案反向污染。

#### 33. EviBack 专门给 all-zero search rollout group 补证据约束信号

[*EviBack*](https://arxiv.org/abs/2607.23955) 在 outcome reward 仍由可验证答案控制的前提下，只为全零组引入 evidence-constrained teacher backoff，并把证据充足性判断与答案 refinement 分离。七个开放 QA benchmark、三个 Qwen3 规模上优于 Search-R1，同时减少重复 query 与强制终止。它与 ProGPO 问同一问题但给出 teacher 路线；代码尚承诺“以后发布”，复现性暂时偏弱。

#### 34. RP-OPSD 把高分辨率当作训练期 privileged information

[*RP-OPSD*](https://arxiv.org/abs/2607.24447) 让 student 在 1/4 分辨率图片上生成 on-policy trajectory，teacher 看原分辨率并沿 student prefix 给 token supervision；推理仍可回到原分辨率。Qwen3.5-9B 平均相对提升 5.45%，训练比普通 OPSD 快 1.78×。亮点是不用外部模型或人工 trace，但分辨率差只适合视觉信息确实可恢复的任务。

#### 35. Diffusion OPD 的 CFG 组合目标可能掩盖分支错误

[*Rethinking Classifier-Free Guidance in On-Policy Diffusion Distillation*](https://arxiv.org/abs/2607.24731) 指出 guided velocity 相等并不能识别 positive/negative branch：两支误差可抵消。teacher negative branch 含 student 不可见 privileged information 时会出现 Negative Branch Asymmetry；PDM 分别约束 positive prediction 与 conditional direction，在 dense-to-sparse video control 上对 guidance scale 更稳。它是明确的 objective identifiability 问题，适合关注生成模型蒸馏者速读。

## 可留意 / 可跳过

### Coding-agent 与软件工程侧

- [Bifrost](https://arxiv.org/abs/2607.23169) 用对比学习从多层日志结构学习 fallibility representation，在三公开系统和一工业系统上分别提升 anomaly F1、root-cause HR@k、fault-ID Macro-F1；与软件运维相关，但不是 LLM agent 或变更自动化主问题。
- [Multi-level Code Optimization via Mixture of Prompts](https://arxiv.org/abs/2607.23665) 用 prompt mixture 做代码性能优化，可记住“不同优化层级需要不同提示策略”；摘要证据不足以支撑强推荐。
- [Alternative UX Extensions for Code Completion in Pharo](https://arxiv.org/abs/2607.24253) 关注代码补全交互而非仓库级变更，适合 HCI 读者，本 digest 可跳过。
- [Explainable AI and Trust in AI-Assisted Code Review](https://arxiv.org/abs/2607.24601) 研究解释如何影响信任，问题有现实性，但主要是用户研究，不直接验证 review correctness。
- [CORVUS](https://arxiv.org/abs/2607.22711) 研究 coding-agent 上下文压缩与同步，值得记住“压缩必须保留工作状态”；缺少足够摘要证据判断跨仓库泛化。
- [Poster: Rethinking Security in LLM Code Generation](https://arxiv.org/abs/2607.23088) 与真实风险场景相关，但 poster 体量和证据深度有限。
- [The Illusion of Secure LLM Code](https://arxiv.org/abs/2607.23710) 用 iterative reprompting 缩小安全差距，可关注是否只是对已知 scanner 过拟合；在完整实验披露前不宜高估。
- [Agentic Permissions Policy Algebra](https://arxiv.org/abs/2607.24625) 试图为 taint confinement 建权限代数，与 API router/ContainmentBench 同题，但当前更偏形式化政策表达，真实工具链验证待补。
- [Plans Work in Mysterious Ways](https://arxiv.org/abs/2607.23670) 直接评估 spreadsheet agent 的 plan mode，值得关注“显式计划是否改善实际状态操作”；其主分类为 cs.HC、以 cs.AI/cs.SE cross-list 出现，不能仅因不在核心分类而漏掉。
- [Evaluating LLMs for Symbolic Security Protocol Analysis](https://arxiv.org/abs/2607.20712) 把语言模型放进符号协议分析流程，连接自然语言推理与可执行安全工具；更接近形式化分析能力评估，不是仓库 repair 主线。
- [From Vibe to Code — and Back](https://arxiv.org/abs/2607.23126) 研究人和生成式 AI 如何在自然语言与代码间往返形成 design intent；它提供需求语义视角，但主要证据是交互/词汇分析。
- [MulRobBench](https://arxiv.org/abs/2607.23870) 在多模态 UAV agent 上按决策层评估安全与政策合规，适合作为跨域 agent safety benchmark 留意；与软件变更的直接联系较弱。
- [LLM-based Source Code Compression](https://arxiv.org/abs/2607.24192) 用 thresholded symbol ranking 压缩源码上下文，对长仓库 context budget 有意义；核心仍是表示压缩，不直接证明 repair correctness。
- [Benchmarking LLMs for Verilog Design Flows](https://arxiv.org/abs/2607.22759) 把 LLM 放进 HDL 设计工具链，值得检查 compile/simulate/synthesize 是否分别计分；主分类 cs.AR，通过 cs.LG cross-list 被发现。
- [DRC-Aid](https://arxiv.org/abs/2607.22761) 用 agentic workflow 修正硬件 design-rule violation，是 repository repair 在 EDA 场景的相邻实例；需要重点看物理验证 oracle 与多轮修复的独立性。
- [Efficient LLM-Generated Shuttling Compilers](https://arxiv.org/abs/2607.24714) 面向 trapped-ion 架构生成调度/编译结果，属于编译器迁移与约束求解边缘项；应用非常专门，故不深挖。
- [Systematic Experiment Tracking in Quantum Software](https://arxiv.org/abs/2607.24264) 强调量子软件实验的配置、误差缓解和结果 provenance；它不是 LLM agent 论文，但对复杂构建/运行环境的可复现维护具有软件工程意义。

### Post-training 侧

- [Between Suppression and Collapse](https://arxiv.org/abs/2607.22657) 用 LENS 评估 narrative unlearning；值得记住“看似忘记”可能是输出抑制或能力坍缩，领域较窄。
- [Socratic Guides via Heuristic RL](https://arxiv.org/abs/2607.22996) 把教育模型从直接作答对齐为苏格拉底式引导；奖励启发式是否真正改善学习效果是主要疑问。
- [Activation Oracles Learn Not to Read](https://arxiv.org/abs/2607.23379) 揭示 fine-tuned oracle 的概念盲点，对 verifier 训练很相关；需进一步确认 blind spot 是否跨层、跨模型稳定。
- [Inference-Time Consensus for Hidden Behaviors](https://arxiv.org/abs/2607.23394) 用多次推理共识减轻 fine-tuning 植入的隐藏行为，属于部署缓解而非 post-training 根治。
- [LA-RL](https://arxiv.org/abs/2607.23420) 为信息抽取加入 label-aware self-reflection RL；任务专用，但可作为“结构标签进入奖励”的案例。
- [The Intruder Threshold](https://arxiv.org/abs/2607.23711) 给 LoRA fine-tuning 的谱阈值定律，理论上值得跟踪；与实际 LLM 行为指标之间仍隔一层。
- [Multi-Agent Protocol Distillation in Agentic Search](https://arxiv.org/abs/2607.24280) 将 proprietary multi-agent protocol 蒸馏到开源系统，关注分布差和协议行为保真；若只复现终点分数，可能漏掉角色漂移。
- [PRISM](https://arxiv.org/abs/2607.24353) 用 image-grounded self-reward 优化 prompt；属于生成模型 self-reward，和通用语言模型证据的可比性有限。
- [Expert Training for Model Merging with Prompt Learning](https://arxiv.org/abs/2607.24465) 重新设计可合并 expert 的训练方式，适合关注 task arithmetic 的读者。
- [IKS-Instruct](https://arxiv.org/abs/2607.23322) 提供 24,000 条多语 instruction 数据，数据覆盖有价值，但仅有数据集不等于证明 instruction tuning 改善泛化。
- [Mask2Shield](https://arxiv.org/abs/2607.23015) 针对 neuron-pruning attack 强化 LLM safety，属于模型安全 post-training；威胁模型较专门，先留意。
- [FlowCTS](https://arxiv.org/abs/2607.24522) 将 on-policy continuous trajectory supervision 用于 flow model，说明过程监督正扩展到非自回归生成，但不是 LLM 主线。
- [DecoupleMix](https://arxiv.org/abs/2607.24516) 分离 VLM 数据配比搜索与 convex allocation，关注 scalable data recipe；需要核查搜索成本是否计入训练效率。
- [Pathology Foundation Models via Fine-Tuning](https://arxiv.org/abs/2607.22861) 研究领域 fine-tuning 的鲁棒化，实质属于 post-training，但医学域与任务较专门。
- [Foundation Models and Fine-Tuning for Time Series](https://arxiv.org/abs/2607.23146) 总结时间序列基础模型适配，偏综述/领域路线，不是当日最强方法贡献。
- [Parameter-Efficient Adaptation of SAM3](https://arxiv.org/abs/2607.23694) 把 PEFT 用于手术概念分割；可看参数效率，不能据此推断通用多模态 post-training。
- [IJCB-AFMFR 2026](https://arxiv.org/abs/2607.24422) 比较 synthetic data 下的人脸基础模型适配；竞赛报告适合查 benchmark，不必按单一新算法深读。
- [Sparse-Frame Adaptation of MLLMs](https://arxiv.org/abs/2607.24570) 研究视频 grounding 的稀疏帧适配，关注效率与时空能力权衡；领域评测较窄。
- [Test-Time Adaptation via Dual Distillation](https://arxiv.org/abs/2607.24611) 在严重视频分布偏移下做双蒸馏，属于在线/持续 post-training 的边缘案例，值得跟踪稳定性与灾难性适配。
- [Auditing Alignment Controllability via Political Axes](https://arxiv.org/abs/2607.23519) 把可控政治立场轴作为 alignment 行为探针；适合作为 post-training 后行为漂移审计，但价值取决于轴构造与文化覆盖。
- [Generative Video Compression with Adaptive Score Distillation](https://arxiv.org/abs/2607.22772) 将 adaptive score distillation 用于视频生成压缩，属于扩散/生成模型 post-training 的领域实例；应区分感知质量提升与 teacher 误差继承。
- [Source-Free Controlled Adaptation of Teachers](https://arxiv.org/abs/2607.23735) 研究 continual test-time adaptation 中 teacher 自适应而无需源数据，符合在线 post-training 主线；关键风险是伪标签闭环与长期漂移。
- [UNIFUSION](https://arxiv.org/abs/2607.24507) 以统一 reverse-rate objective 把 autoregressive language model 适配为 discrete diffusion，属于模型形态转换式 post-training；需要核查能力保留而非只看生成速度。
- [Black-Box Adaptation via Logit Bias](https://arxiv.org/abs/2607.22837) 不更新权重、只调 logit bias 做语言模型适配，提供极低成本对照；严格说更接近推理侧适配，因此放在边缘层。
- [Machine Unlearning through Mode Connectivity](https://arxiv.org/abs/2607.23970) 从参数空间连通性解释遗忘，直接涉及 post-training 如何移除行为；是否真正忘记而非沿路径抑制输出，是应保留的判断。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 主要证据 | 可复现性 / 实用性 | 评估可信度 |
|---|---|---|---|---|---|
| StateAct | 像素不是持久状态 | state-first + GUI specialist + finish gate | OSWorld 2.0，26.9% binary，约 9× 降成本 | 架构清楚，依赖状态接口 | 中高：单模型、系统比较 |
| Buggy-code misguidance | 被测实现污染测试 oracle | 双版本分类 + specification prompting | effective tests 104.15→186.77 | 适合 test generation | 高：执行 oracle，fixed 版本假设 |
| AssumptionMiner | 隐含假设造成 working-but-wrong | 假设层 + AST 依赖局部再生成 | 180 题、676 假设，F1 0.816 | 有 replication package | 中高：严格 F1 仅 0.66 |
| Test-Hardening | coverage 不等于验证 | mutation-guided Critic loop | 增量 kill 78.3%，预注册复验 | receipts/analysis 公开 | 高：主动否定仪器伪影 |
| TLA+-Bench | parse 不等于形式正确 | execution oracle + correctness envelope | 18.7%—1.7% 包络 | 数据与 grader 可复现 | 高：限制与评分自由度透明 |
| API Router | 中间层破坏端到端完整性 | trace replay + 四级注入 + 防御权衡 | 无缓解 DSR 全 0% | SIDEL/代码可用性高 | 中：3 个端到端任务 |
| Scaffold Effect | 模型榜单混入 harness 效应 | fixed-model paired harness study | token/solve 最大差 40× | 日志配置释放 | 中高：50 题、accounting 异构 |
| Looping Is Not Reliability | 正确 patch 会在循环中丢失 | common-state 因果设计 + typed contract | stale harm +22.2 点 | StateSeal 可执行规范 | 高：仓库实验结果为负也报告 |
| ContainmentBench | 终点掩盖传播与过拒绝 | stage-stratified trace contract | 17,640 rollout，73.5% 隐藏差异 | 合成环境可复现 | 中高：单模型、授权假设 |
| PrefMoE | 多用户偏好向多数坍缩 | prototype/residual + 双 LoRA 路由 | preference 44.13→67.33%，collapse 34.25→12.33% | 方法可实现 | 中：显式偏好、构造边界 |
| Masked Distillation | CoT 是否能被参数内化 | solution-only KD + suffix 扫描 | GSM8K 6.5× 少 token；Countdown 需 scaffold | 控制实验清楚 | 中高：仅两个域 |
| Alignment Drift | task adaptation 改写既有对齐 | 15 维行为 + 概念方向 | SFT 4.68pp 漂移；KL 0.5 降至 2.29pp | 评估协议可复用 | 中高：小模型、指标有效性 |
| ProGPO | 全失败组无相对奖励 | 条件化 first-visit progress | 最终 91.4%，多 base 提升 | 算法改动小 | 中高：两个合成文本环境 |
| Outcome-Confounded OPD | token 一致不等于局部正确 | divergence × outcome 四象限 | agreement-on-failure 约 67.8% | 诊断易复现 | 高于平均：明确无新算法主张 |
| RLSVR | 开放任务没有 exact reward | 任务变形 + 多 agent self-play | 摘要/创作 win rate 约 75%/77% | 代码模型已释放 | 中：proxy 与 LLM judge 仍在 |
| RM Memorization | RM 记住捷径而非难偏好 | counterfactual map + SHAP + SAE | 两偏好集复现三类模式 | 分析链完整 | 中高：关联而非下游因果 |
| Long-Horizon Physics | 规划能力来源与训练区间不清 | 可控环境 + GRPO/OPD/MOPD 相图 | 5% 长数据触发跃迁；OPD 困难区更稳 | 大规模但复杂 | 中：合成环境、自由度较多 |

## 我的判断

**当天整体等级：A。** 创新性 **8.8/10**，实用价值 **9.0/10**，实验严谨性 **8.3/10**，推荐阅读价值 **9.2/10**。

最值得优先读的不是分数最高的系统，而是三类“拆错层”的论文：TLA+-Bench 把 parse 与 correctness 拆开，Looping Is Not Reliability 把 discovery、retention、certification 与 liveness 拆开，Outcome-Confounded Local Supervision 把 token agreement 与 trajectory outcome 拆开。它们都给出了可复用的测量语言。

第二优先级是 StateAct、API Router、Scaffold Effect 与 ContainmentBench：四篇共同证明 Agent 的实际行为由状态接口、harness、中间层和 runtime policy 决定，模型名不是充分的系统描述。post-training 侧，Alignment Drift、Reward Model Memorization 与长程规划“物理学”最能改变研究判断，因为它们不只报告提升，还解释训练信号在哪些条件下变坏。

不确定性主要有三点：今天不少论文使用 2026 年新模型与尚未广泛复验的 benchmark；强结果中合成环境、单模型或小任务集仍多；若干 post-training 论文的开放任务质量最终仍回到 LLM judge。因而最稳妥的阅读方式不是照单接受绝对分数，而是优先复用它们对证据 freshness、oracle independence、harness disclosure、reward identifiability 和分层指标的要求。
