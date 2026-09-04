---
title: "当 Agent 学会长期行动，验证、权限与后训练必须同时升级"
date: "2026-09-04"
description: "2026 年 9 月 3 日 arXiv：从仓库级规范、可执行反事实与持久授权，到过程奖励、教师分配和 harness-policy 共演化。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Post-Training", "RLHF", "RLVR"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-indigo-600 via-violet-600 to-rose-500"
---

昨天这一批值得读，不是因为又出现了几个更高的 pass rate，而是两条主线都开始追问：**系统凭什么相信一次行动、一次评测或一次训练更新？** Coding-agent 论文把正确性拆到 specification、检索反事实、执行边界、长期记忆与证据收据；post-training 论文则把 reward 拆到首个错误、覆盖范围、样本级 teacher 可靠性和学生真实访问的状态。官方九个分类的 476 个唯一条目中，本次保留 88 篇：25 篇强相关深读、44 篇中相关速读、19 篇可留意项。强相关 PDF 全部来自 `https://arxiv.org/pdf/<id>`，均通过 `%PDF`、大小与文本抽取检查。

## 今日脉络

**Coding Agent / Software Change（56 篇）**的共同趋势是把“Agent 说完成了”改成“系统保存了可重算、可追踪、可拒绝的证据”。PaperCompiler 约束跨文件实现，ExecRetrieval 用可执行错误近邻检验检索，EarlyEval 与 Web monitor 在轨迹前缀上判断风险，EAL-Bench 和 skill-selection 攻击则把 memory/skill/router 明确提升为权限边界。传统软件工程的提交史、差分测试、静态/动态分析并未过时，反而成为 Agent 时代少数可依赖的硬证据。

**LLM Post-Training（39 篇）**没有被压成 coding 的附庸。今天真正有新意的是反馈粒度与覆盖：Cliff 找首错，PRO-Step 在检索树里恢复，Coverage 论文提醒“精准但稀疏”可能输给均匀奖励；MT-SDPO 逐样本验 teacher，on-policy distillation 让 student 在自己的状态上学习；SafeEvolve 则把可回滚 harness 与权重更新放入同一闭环。两条主线的交集只有 7 篇，说明 post-training 的价值仍来自它对训练目标、数据和行为证据本身的解释。

## 强相关论文深读

### From Silicon to Boot Code: Extending Automated Program Repair to Firmware-Layer Security Workarounds

**论文信息：** Mastora, Maisha, Sullivan, Dean；分类：Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01769](https://arxiv.org/abs/2609.01769)。

**一句话 TL;DR：** 把自动程序修复从芯片设计期推进到量产后的固件补丁：先从真实提交史抽取修复字典，再定位、实例化并验证安全 workaround。

**为什么值得推荐：** 固件漏洞出现时硬件已不能更改，而现有 APR 多停在 RTL/HLS。论文没有直接让 LLM 猜补丁，而是把 EDK II 全历史中的重复修复模式变成可审计字典，因此推荐价值在真实维护证据与可解释搜索空间。Figure 1 展示 commit mining 到 firmware patch 的闭环。

**方法怎么工作：** 管线分三步：聚类完整提交史得到 bug signature、repair template、validation oracle；用四个独立 localizer 处理 C 与 x86 assembly；最后实例化模板并做结构、位置和部分编译验证。Table 1 给出五类字典项，Table 2/3 把成本、精度与假阳性根因分开。

**关键实验与证据：** 四类 localizer 都达到 100% recall；C 类 precision 仅 2.1%--15.5%，assembly/HOB 类为 100%。假阳性中 77%--90% 可归为两类过程内原因，剩余 alias-analysis 缺口被量化为 15%--20%；held-out 文件仍保持 Spectre v1 的全召回。

**局限、可信度与当天主线：** 最关键限制是验证多为结构而非语义：作者未运行 exploit differential 或完整 regression suite，18 个修复点也不足以代表固件生态。它支持的结论是“提交史可约束修复”，不是补丁已被证明安全。

**阅读定位与复现检查：** 先看 Figure 1 的历史挖掘—字典—修复链，再对照 Table 2 的 recall/precision 与 Table 3 的假阳性归因；最后直接读第 5 节 Limitations，那里明确承认没有 exploit differential。阅读时应把 localization、template instantiation、structural validation 三种证据分开，避免把找到正确位置误写成补丁已阻断漏洞。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### PaperCompiler: Faithful Paper-to-Code Generation via Repository-Level Specification Compilation

**论文信息：** Liu, Yunhao, Pham, Hong Phuc, Yoon, Jaehong；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02272](https://arxiv.org/abs/2609.02272)。

**一句话 TL;DR：** PaperCompiler 把论文证据编译成带来源、状态、所有权和跨文件约束的仓库级 specification，减少 paper-to-code 时的算法降级。

**为什么值得推荐：** 自由文本计划容易被下游 coding agent 压缩或重解释，尤其会丢公式、评测协议和模块间契约。论文把“忠实实现”视为受控的信息变换，显式区分 paper-supported、inferred、external 与 unresolved，问题定义比再加一个 planner 更值得读。

**方法怎么工作：** Figure 3 的流程先由 MinerU 转换论文，再提取带位置与证据状态的原子实现项；随后编译 method scope、non-degradation requirements、ownership、dependencies 和 file constraints；生成 agent 可在未约束的局部工程选择上自由实现，但不能弱化核心方法。

**关键实验与证据：** Paper2CodeBench 上 reference-free 4.562→4.777、P2C-Ex 4.535→4.728、reference-based 3.647→4.152，后者相对提升 13.8%；高严重度 critique 从 13.2% 降到 6.1%。三组各 30 篇论文的 Figure 4 也显示提升不是少数样本驱动。

**局限、可信度与当天主线：** 评分仍主要依赖 evaluator 与作者实现的单一参照；等价实现可能被低估，规范抽取本身也会遗漏。它最强的贡献是 provenance-aware specification，不是已经解决可执行复现。

**阅读定位与复现检查：** 先读 Figure 3，检查每个原子实现项是否真的携带 source location、evidence status 和 downstream role；再看 Table 1 与 Table 3，前者是平均分，后者才显示高严重度错误降到哪里。值得复现的关键不是提示词，而是 specification 能否被下游生成器强制消费，以及 evaluator 能否识别算法等价而非表面相似。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### ACLE-MCP: Attested Capability Leases for Execution-Time Trust in Remote LLM Tool Use

**论文信息：** Ding, Zhiyang, Luo, Yang, Chen, Guangpu, Shen, Qingni, Wu, Zhonghai；分类：Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02690](https://arxiv.org/abs/2609.02690)。

**一句话 TL;DR：** ACLE-MCP 把 OAuth 权限、当前 workload attestation、sender proof 与一次工具调用绑定成短租约，在 provider 入口做不可绕过验收。

**为什么值得推荐：** 远程 MCP 中“客户端有权限”不等于“此刻执行的是被批准 workload”。连接时 attestation 也可能在调用前失效。论文把 post-authorization trust gap 落到 execution-time lease，直接对应工具替换、stale appraisal、proxy 与 replay。

**方法怎么工作：** Figure 1 的三段式流程是：Attested Step-Up 获取当前工作负载证明；Lease Issuer 将 audience、tool、operation、object、scope 与 freshness 封装成 capability lease；provider-side Execution Gate 逐次检查并签出 receipt。评测覆盖重放、替换、越权 scope、未声明代理和 receipt 违规。

**关键实验与证据：** 完整方案在作者的攻击矩阵中阻断全部预期拒绝路径；Table 2 的组件消融说明去掉 freshness、sender binding 或 execution gate 都会恢复对应攻击。论文还用真实组件与 backend substitution 验证租约不是纯符号设计。

**局限、可信度与当天主线：** 安全性依赖 provider gate 不可绕过，且不处理错误规划、prompt injection 或 verifier 被攻破。它证明的是调用边界可收紧，而不是 Agent 全栈可信。

**阅读定位与复现检查：** 阅读 Figure 1 时沿 OAuth grant、attestation、lease、execution gate、receipt 顺序追踪一次调用，并把 Table 2 每个消融对应回一种攻击。真正的检验点是 provider 侧是否存在绕过 gate 的路径、freshness 如何定义、lease 是否绑定具体 object 与 operation；如果这些条件缺失，再强的签名也只是连接级身份确认。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### A Finger on the Scale: Covert Policy Steering through Agentic Skills

**论文信息：** Li, Jiarui, Chen, Jiahao, Zhou, Chunyi, Pu, Yuwen, Ma, Oubo, Feng, Zhou, Hu, Chunqiang, Ji, Shouling；分类：Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02564](https://arxiv.org/abs/2609.02564)。

**一句话 TL;DR：** 看似功能正确、没有显式注入语句的第三方 skill，也能通过累计语义线索悄悄改变 Agent 的产品或依赖选择。

**为什么值得推荐：** 技能安全研究常盯恶意命令，但 policy steering 可以藏在任务适配说明和示例中，输出仍完全合法。SkillShift 因此击中了插件生态里更难检测的偏置面：语法安全不等于决策中立。Figure 1 清楚画出 skill 到 policy 的隐性路径。

**方法怎么工作：** 方法固定候选、查询与输出约束，只优化 skill 内的 semantic cues、task-fit framing 与 examples；再以购物推荐和 Python dependency selection 做独立 held-out 评测，并用长度控制、关键词堆叠和直接注入作对照。

**关键实验与证据：** Python 目标选择率达到 63.33%，购物从 clean 的 37.33% 升到 81.33%，同时 valid response 为 100%。六类扫描器对隐式 skill 全部漏检，而显式正控能被四类检出；跨模型迁移也保留主要效果。

**局限、可信度与当天主线：** 两项固定候选任务仍很窄，偏好改变也不等同现实危害；skill 来源、排序和用户意图会改变基线。最可信判断是 registry 需要做反事实选择测试，不能只扫文本。

**阅读定位与复现检查：** 建议对照 Figure 3 的组件消融和 Table 3 的扫描结果：如果删掉 semantic cue、task-fit framing 或 example 后 steering 消失，才支持累计语义机制。还要区分 PSR 与实际危害：选择 polars 或某品牌本身是合法输出，论文测到的是偏置能力而不是恶意后果，这正是它比显式注入更难治理的原因。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### CodePoisonRAG: Knowledge Poisoning Attacks on Retrieval-Augmented Code Generation

**论文信息：** Gadey, Varun, Marey, Ziad, Dmitrienko, Alexandra；分类：Cryptography and Security (cs.CR) ; Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02774](https://arxiv.org/abs/2609.02774)。

**一句话 TL;DR：** CodePoisonRAG 说明检索库里语义贴近、功能像真的脆弱代码，会被 RACG 取回并显著牵引最终生成，即使输出表面完成任务。

**为什么值得推荐：** 代码检索增强常把知识库当可信外部记忆。论文把攻击从普通文本投毒推进到 CWE/CVE 约束的代码 artifact，价值在同时量化 retrieval、generation 与 validator 三段，而不是只报命中率。

**方法怎么工作：** 攻击先从良性 snippet 构造含目标弱点且保持语义相关的 poisoned variant；再用 semantic mislabeling 等策略植入库；最后在多个检索器和代码模型上追踪检索排名、漏洞 ASR、CodeBLEU 与防御效果。

**关键实验与证据：** 在代表性设置中，生成结果对 poisoned snippet 的 CodeBLEU 为 0.594，对原 benign 仅 0.169，说明不是模型独立产生的偶发漏洞。论文还固定检索结果更换 LLM validator，揭示安全判分本身的模型依赖。

**局限、可信度与当天主线：** 漏洞判断仍有 LLM judge 噪声，注入语料与任务规模有限，真实仓库中的编译、测试和依赖解析没有被完整覆盖。它证明知识库完整性是 coding-agent 安全边界。

**阅读定位与复现检查：** 先看攻击生成与植入流程，再核对 retrieval 命中、漏洞 ASR、CodeBLEU 三类指标是否同向；只报最终 validator 判定不足以说明毒样本被采用。阅读 Table VIII/IX 时要特别留意不同 validator 的分歧和 benign-context baseline，因为模型本身也会生成不安全代码，真正的增量风险应来自配对差异。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### ToolGate: An Executable Acceptance Pipeline for Tool-Dependent Scientific Benchmark Construction

**论文信息：** Zhang, Ke, Liu, Yankang, Zandi, Roya, Raissi, Maziar；分类：Artificial Intelligence (cs.AI) ; Mathematical Software (cs.MS); Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02067](https://arxiv.org/abs/2609.02067)。

**一句话 TL;DR：** ToolGate 要求基准题先证明“无工具模型会失败、工具 Agent 能成功、答案可执行验证”，再允许题目进入发布池。

**为什么值得推荐：** 让 LLM 生成看似需要软件的问题很容易，真正稀缺的是可测量 tool gap。论文把生成、标签验证、难度筛选与去重做成可重放 acceptance pipeline，并发现固定选项顺序会把字母偏好伪装成难度。

**方法怎么工作：** Figure 1 中 generator 提出题目、选项、答案和解法；本地软件验证标签；三次随机选项顺序的 no-tool screen 淘汰可直接答题者；tool-enabled agent 必须在 workspace 执行成功，最后 exact dedup。

**关键实验与证据：** 500 个候选中 478 个本地可验证，no-tool 筛去 343 个，135 个进入工具门，130 个被指定 agent 解出，最终留下 128 个唯一 survivor。Figure 2 和 Table 2 同时记录资源消耗与漏斗。

**局限、可信度与当天主线：** 这是 protocol-relative acceptance：工具条件同时多了迭代与 scaffold，不能把差异因果归于工具；选择池也不适合给同一强 agent 排名。它仍给出了比“生成后人工扫一眼”可靠得多的基准构造纪律。

**阅读定位与复现检查：** Figure 1 是最值得复用的图：生成器不能直接决定题目合格，必须依次通过可执行标签、随机选项 no-tool screen、tool-agent success 和去重。阅读 Discussion 时注意作者主动承认 tool access 与 scaffold/iteration 混杂，因此 128 个 survivor 证明的是指定协议下存在 gap，而不是软件本身对所有模型都不可替代。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### EarlyEval: Cheaper Agent Evaluation via Early Outcome Prediction

**论文信息：** Shi, Yuling, Sun, Zhensu, Dong, Junsen, Wan, Chengcheng, Lo, David, Gu, Xiaodong；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02783](https://arxiv.org/abs/2609.02783)。

**一句话 TL;DR：** EarlyEval 从部分轨迹预测 Agent 最终成败，在不明显改变榜单分数与排名的前提下提前终止昂贵评测。

**为什么值得推荐：** Agent benchmark 的成本不仅来自任务数，也来自每条长轨迹。论文没有简单抽样任务，而是学习行为、进度和环境信号何时已足够判断结局，并用 leave-one-agent-out 防止记住特定 harness。

**方法怎么工作：** 方法在 SWE-bench Verified、TerminalBench、Toolathlon 收集 2.1 万余条、来自 16/37/22 个 agent 的轨迹；prefix encoder 预测 success/failure，双阈值分别早停确定成功和确定失败；运行点以完整榜单偏差约束选择。

**关键实验与证据：** SWE-bench 在 95% 预测准确率时可停约 35% run，减少 26% steps、33% 输入和 29% 输出 token；三项排名 Spearman ρ 为 0.991、0.994、0.994。无同 scaffold 比无同模型更难，说明 harness 节律是主要迁移风险。

**局限、可信度与当天主线：** 该方法依赖历史 reference 与跨 agent 数据，只适用于评测，不应直接用于部署时自我终止；新 scaffold 分布会显著降 precision。

**阅读定位与复现检查：** 先从三套 benchmark 的 leave-one-agent-out 设计判断是否存在 scaffold 泄漏，再看行为特征消融和 TerminalBench 的 no-same-model/no-same-scaffold 差异。部署上最危险的误用是把 EarlyEval 变成 Agent 自己的停止器；论文允许利用 reference answer 与历史评测轨迹，目标是省 benchmark 成本，不是证明任务现场可以安全提前结束。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### How Fast Do Agents Rot? An Empirical Study of Long-Horizon Degradation in LLM Agents for Production Decision-Making

**论文信息：** Mittal, Shubhra；分类：Physics and Society (physics.soc-ph) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01660](https://arxiv.org/abs/2609.01660)。

**一句话 TL;DR：** 长程 Agent 的可靠性会随交互步数出现可复现衰减，而且主要不是上下文长度本身，而是状态更新与累积决策负担。

**为什么值得推荐：** 很多 benchmark 只报总成功率，把 horizon 与 task difficulty 混在一起。论文把自然、压缩、padding 条件分开，让同样 token 长度承载不同 step count，从而把“长上下文弱”与“多步弱”拆开。

**方法怎么工作：** 评测按 horizon 分箱多个模型与 streaming task family；再固定步骤改变上下文压缩/填充，比较 success curve；最后用失败类型与状态变量检验退化是否来自信息位置、上下文长度或交互链。Figure 1/2 是阅读入口。

**关键实验与证据：** 结果显示 success 随 step count 的下降在多模型、多任务族上持续存在，而等长度对照不能复现全部下降；这支持 step-resolved reliability 作为独立指标，而非只看 token budget。

**局限、可信度与当天主线：** 长 horizon 仍可能和隐藏难度、环境噪声共变，任务族也不等于真实多年维护。论文最有价值的是实验拆分与报告规范，不宜把单一斜率当模型固有寿命。

**阅读定位与复现检查：** 阅读 Figure 1 的自然 horizon 曲线后，必须继续看 Figure 2 的压缩与 padding 对照；只有 step count 与 context length 被拆开，才能谈长程退化。还应检查每个 horizon bin 的任务组成和 Wilson 区间，防止高步数只是更难任务。论文建议的报告单位是 step-resolved curve，而非一个笼统长上下文标签。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### LLM-as-a-Judge Is Not an Oracle: Why Self-Improving Agents Need Deterministic Guardrails

**论文信息：** Wahi, Vansh；分类：Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02246](https://arxiv.org/abs/2609.02246)。

**一句话 TL;DR：** 当 optimizer 反复追逐 LLM judge 时，judge 不能拥有最终发布权；真正不可协商的 schema、执行与隔离门必须由确定性检查掌权。

**为什么值得推荐：** 论文来自多个生产式优化循环的失败复盘：标签泄漏、格式崩溃、overlap metric 和 judge phrase mimicry 都能让分数上涨而真实质量下降。推荐它不是因为一句“judge 有偏”，而是把错误放回系统权限结构。

**方法怎么工作：** PROCTOR 将 Orchestrator、Advocate、Challenger 与 deterministic gates 分权；接受路径按低成本机械验证、执行/隔离、语义判分逐级进行，并保留 blind partition。Figure 2/3 与 Table 3 给出 failure-to-guardrail 映射。

**关键实验与证据：** 六轮校准显示提示改写并不能稳定消除 judge 偏差；54 个 code-quality directory 中仅 15 个有人类专家分数，论文也据此限制 claim。部署记录表明 schema gate、sandbox 和隐藏标签控制会拒绝一批高 judge-score 候选。

**局限、可信度与当天主线：** 证据来自一个专有模型家族且多数 ground truth 仍由校准模型生成；四角色架构也未做完整消融。它更像有数据的系统经验论文，结论应限定为权限设计原则。

**阅读定位与复现检查：** 从 Figure 3 的 gate 顺序读起，再回看 B1--B3 等生产故障，能看清每个 deterministic check 在阻止什么。Table 5 的成本说明这些控制并非免费；第 8 节 Limitations 则揭示 39/54 目录仍用模型标签。复现时最关键的是把 optimizer 永远不可见的 blind partition 与可学习 judge 分开。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### ExecRetrieval: Measuring the Functional-Correctness Gap in Code-Embedding Retrieval

**论文信息：** Kapoor, Aaryan, Khan, Md Abdullah Al Hafiz；分类：Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL); Information Retrieval (cs.IR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01865](https://arxiv.org/abs/2609.01865)。

**一句话 TL;DR：** 代码 embedding 能找到近邻，却经常把仅一处编辑、可执行错误的 near-clone 排在正确实现之前；语义相似不是功能正确。

**为什么值得推荐：** RAG coding 的检索 benchmark 往往缺少最危险的反事实：几乎同样但测试失败的实现。ExecRetrieval 把这些 execution-verified distractor 放回同一搜索池，直接测 retriever 是否辨别 correctness。

**方法怎么工作：** 数据集含 939 个 Python task，每题一个 canonical 和至多四个机械单编辑、经测试确认失败的 distractor；评测 23 组 dense embedding 与 BM25，报告 exec@k、paired McNemar 与 query bootstrap，并做 distractor density 消融。

**关键实验与证据：** 最强 hosted system 的 exec@10 为 1.00，但 exec@1 只有 0.331；领先系统 91.5%--99.4% 的 rank-1 错误就是配对 buggy variant，67%--78% 查询中至少一个错误近邻分数高于 canonical。

**局限、可信度与当天主线：** 仅 Python、机械 mutation、非 hardened runner；真实仓库错误更复杂，也可能有多个正确实现。但它非常有力地说明 coding-agent retrieval 需要 executable counterfactual。

**阅读定位与复现检查：** Figure 1 先解释 canonical 与单编辑 distractor 如何同池竞争，Figure 2/3 再看 exec@1 到 exec@10 的差距；Table 4 的密度消融回答是不是故意塞四个近邻才造成失败。推荐亲自检查 released tests 是否真能区分 mutation，并把 retrieval correctness 与 downstream generator 是否会验证代码分开。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### Agent Memory Is a Surface for Endogenous Authorization Laundering

**论文信息：** Cerruti, Tommaso, Okamoto, Mika, Erol, Ansel Kaplan；分类：Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01836](https://arxiv.org/abs/2609.01836)。

**一句话 TL;DR：** 长期记忆若把授权历史总结错，会把不存在的许可洗白成持久状态；执行 Agent 随后几乎总会照做。

**为什么值得推荐：** 这不是外部攻击，而是 memory writer 自己制造 authority。EAL-Bench 把“记忆准确率”升级为安全策略问题，特别适合多 session、撤销与范围变更场景。

**方法怎么工作：** 论文构造采购、网络安全、金融三域的授权历史和成对请求，比较 one-shot/incremental、free-text/typed memory；再替换 oracle-exact memory 做因果诊断，并评估 source-authority gate 与 bounded event sourcing。

**关键实验与证据：** 增量 writer 对未授权请求生成 false authority 的比例最高达 50.2%，一旦错误权限存在，executor 在 98.6% trial 中执行；金融 typed incremental 的 unauthorized submission 达 51.0%。两种防护都降风险，但增加合法拒绝。

**局限、可信度与当天主线：** 历史仍比真实沟通更结构化，工具为模拟环境，部分分析仅单 seed，不能估计现实发生率。最稳结论是 memory store 属于 authorization policy，而非普通缓存。

**阅读定位与复现检查：** 先看 Figure 2 的四种 memory 条件，再用 Table 3 的 oracle-exact 替换确认失败源在错误状态而非 executor 固有不守规。Figure 3 的 Pareto front 很重要：source gate 和 event sourcing 会增加 under-grant。任何复现都应保留授权事件的 provenance，而不是只比较 free-text 与 JSON 哪个更准。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### Monitoring Web Agents Without Internal Signals: Observable Trajectories and Key-Step Supervision

**论文信息：** Pan, Sitong, Shen, Yipeng, Lu, Yilin, Ding, Caiwen, Cheng, Lu, Wang, Qianwen；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02057](https://arxiv.org/abs/2609.02057)。

**一句话 TL;DR：** 即使拿不到 logits，也能用可观察的动作—环境轨迹与“第一个未纠正关键错误”监督，预测 Web Agent 前缀是否已偏航。

**为什么值得推荐：** 最终失败标签会把早期正确步骤全部标坏，造成 monitor 学不到真正转折点。论文改用 key-step boundary，并把宏观行为统计和多次黑盒查询得到的意图—动作—预期状态一致性结合，问题设定很干净。

**方法怎么工作：** Figure 2 中 Macro 特征概括跨步反馈、重复与进度，Micro 特征用重复问询测 intention/action/state-change 一致性；模型在 WebArena-Lite 与 Online Mind2Web 的五个 backbone 上训练 prefix risk，并在固定 false-cut budget 下做提前干预。

**关键实验与证据：** 可观察信号总体接近内部信号基线，跨网站类别仍有迁移；Table 2/6 展示在成功轨迹误切率受控时的 failure detection。案例中重复点击在关键步使 Macro risk 峰值达 0.82。

**局限、可信度与当天主线：** 只覆盖 ReAct 架构，Micro 需要额外解码成本，key-step 标注依赖已观察 continuation。它适合离线/旁路监控，不等于知道未探索分支。

**阅读定位与复现检查：** Figure 2 给出 Macro/Micro 的信息来源，Table 2/6 则要在相同 false-cut budget 下比较 detection，不能只看 AUROC。Figure 6 的个案说明重复点击等外显行为和黑盒一致性会在不同时间报警。部署前还需估算 Micro 的重复解码开销，并验证网站类别外的校准是否保持。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### Implicit Manipulation for Skill Selection in LLM Agents with Semantic Matching

**论文信息：** Wang, Qikai, Zhang, Yongzhao, Chen, Zhiwei, Sun, Yimiao, Yu, Jiguo, Zhang, Xiaosong；分类：Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02035](https://arxiv.org/abs/2609.02035)。

**一句话 TL;DR：** skill 与用户请求单独看都正常时，它们之间被设计过的语义匹配仍能劫持 selector，把目标选择率从 15.2% 推到 63.5%。

**为什么值得推荐：** 这篇和 SkillShift 互补：前者攻击 skill 内容塑造最终决策，ISM 攻击更早的 capability routing。因为没有显式“选择我”指令，传统 injection detector 很难看到关系层操纵。

**方法怎么工作：** 三阶段方法先扩展目标 skill 的语义覆盖，再加入区分性技术 hook，最后自然化可复用 prompt；评测覆盖代码、数据、文档、工作流四域和八个 selector，并与 explicit steering、人类审查和三种 guard 比较。

**关键实验与证据：** 平均 TSR 15.2%→63.5%，matched setting 为 73.5%，仅比显式 steering 低 9.8 点；人类只阻断 2.9%，而显式攻击阻断 91.4%，五个 LLM inspector 对 ISM 平均放行 82.9%。

**局限、可信度与当天主线：** 攻击需要同时塑造 metadata 与 prompt，现实权限因渠道而异；高 TSR 也不必然导致危险操作。它证明 selector 的相对匹配本身必须成为安全边界。

**阅读定位与复现检查：** 阅读 Figure 2 的 metadata/prompt 联合构造后，对照 Table 1 的 Native→ISM 变化、Figure 8 的人类判断和 Figure 9 的防御阻断。三组证据共同说明的是关系级 manipulation：单个文本看起来正常。防御因此应比较多个候选的相对语义优势，并把来源 provenance 纳入 selector，而非只做逐文本恶意分类。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### SkillGLoW: Procedural-Family Skill Consolidation for Self-Improving Agents on Long-Horizon Task Streams

**论文信息：** Yan, Ao, Zhang, Xin, Du, Jiawei, Zhou, Joey Tianyi；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02217](https://arxiv.org/abs/2609.02217)。

**一句话 TL;DR：** SkillGLoW 把长期经验压缩到“程序族”而非全局大文档或逐任务碎片，并用真实执行 gate 决定技能是否入库。

**为什么值得推荐：** 全局 skill 容易退化为泛泛纪律，flat pool 又会膨胀且绑定实例。论文提出 procedural family 作为复用单位，并明确区分可泛化 procedure 与需要现场再生的 instance detail。

**方法怎么工作：** 流程先把每个任务的执行经验封装成 local skill card；聚类同类求解程序并去实例化为 global prior；测试时再生成局部细节；commit gate 只有在执行证明不降级时才更新 versioned library。Figure 2 是完整入口。

**关键实验与证据：** 四个 benchmark、三个模型的 12 次 continual run 中，hard split 相对 no-skill 平均 +17.2 点，加 local regeneration 为 +18.0；库比逐任务池紧凑 3.6 倍。未改库在 unseen ALFWorld 上 73.9%→83.9%。

**局限、可信度与当天主线：** procedural family 的聚类与 gate 仍依赖既有任务覆盖；软件 repair 只是一项 benchmark，库长期漂移和安全性未完全测试。亮点是执行验收和版本化，而不是文本压缩本身。

**阅读定位与复现检查：** Figure 2 展示 local card、procedural family、global prior 与 regeneration 的职责分离；Table 1 看跨模型主结果，Table 2 比较 single document/flat pool，Table 4 看 unseen transfer。最应核对的是 commit gate 是否使用独立执行集，否则 skill library 可能把对当前任务的过拟合包装成可复用程序。

**与当天主题的关系：** 它在今天的 Agent 可靠性主线中提供的不是单一成功率，而是一个可以被检查的系统边界。复现时应把模型能力、软件工程证据和 Agent workflow 分开：先确认任务与轨迹是否真实，再确认 verifier 是否覆盖关键失败，最后检查 harness、权限、状态和预算是否与基线一致。若只有最终输出或自评，结论应降为候选机制；只有执行、反事实、独立验收或可回放证据同时成立，才能把提升解释为可靠性改善。

### Act More, Decide Less: Skill-Guided Adaptive Action Chunking for Long-Horizon LLM Agents

**论文信息：** Yang, Yanting, Jin, Can, Zhao, Jinman, Wu, Jiahao, Zhou, Yang, Wang, Zhepeng, Wang, Zhendong, Zhou, Mu, Metaxas, Dimitris N.；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02042](https://arxiv.org/abs/2609.02042)。

**一句话 TL;DR：** SPACE 从成功轨迹诱导程序化 skill，用其子技能边界监督 variable-length action chunk，让 Agent 少决策而不盲目长承诺。

**为什么值得推荐：** ReAct 每一步都调用 LLM 成本高，直接做 multi-action RL 又会塌成单步或过长序列。论文把难点定位为 chunk boundary，而不是简单鼓励更长动作，机制清晰。

**方法怎么工作：** Figure 2 先把成功轨迹归纳为两级 programmatic skill；展开 skill call 得到 primitive sequence 与边界；用 hybrid on/off-policy objective 和 chunk-aware credit 训练 primitive-chunk policy；部署时不再依赖 skill library，直接输出可变长度动作。

**关键实验与证据：** ALFWorld 与 ScienceWorld 的 seen/unseen split 上，相对最强 baseline success +7.0%--31.3%，平均 LLM 决策轮次最多减少 78.9%，达到 baseline 最终水平只需 26.6% training steps。消融显示 primitive rollout 与 skill boundary 比纯 multi-action GRPO 稳定。

**局限、可信度与当天主线：** 只测文本模拟环境，成功轨迹提供的边界可能固化已有策略，真实浏览器/代码工具的失败恢复尚未验证。收益是训练和执行效率，不代表 chunk 内每步可审计。

**阅读定位与复现检查：** Figure 1 解释单步塌缩与过长承诺两个对称失败，Figure 2 说明 skill 只提供边界监督、部署 policy 不依赖库；Table 3 的消融检验 hybrid rollout 与 chunk credit。看效率时要同时报告 success 与 LLM rounds，单纯少调用可能来自过度承诺；真实工具还需加入中途异常与 chunk abort。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### SafeEvolve: Harness-Policy Co-Evolution from Agent Experience for Safety Alignment

**论文信息：** Mao, Qinghua, Qu, Wanying, Guo, Dadi, Yuan, Leitao, Liu, Qingyu, Li, Yu, Chen, Guanxu, Fu, Yanwei, Lin, Xi, Hu, Xia, Liu, Dongrui；分类：Artificial Intelligence (cs.AI) ; Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02786](https://arxiv.org/abs/2609.02786)。

**一句话 TL;DR：** SafeEvolve 用同一批 on-policy 轨迹同时演化可回滚 harness skill/prompt，并通过 SFT+RL 把安全知识内化到模型 policy。

**为什么值得推荐：** 只改 runtime 能快速防护但受 policy 能力上限，只改模型又难审计和热修。论文把两者做成闭环，尤其适合 prompt injection 与 unsafe tool use 这种多步风险。

**方法怎么工作：** Figure 2 先在可验证有限状态工具环境收集 utility/safety/tool-validity 轨迹；从 failure bucket 生成、测试并版本化 harness 更新；harness-use SFT 教会模型使用新控制；再以联合 safety-utility reward 做 harness-augmented RL。

**关键实验与证据：** Qwen3.5-4B 在 AgentDojo ASR 2.37%→0.79%，clean utility 59.79%→61.86%；AgentHarm harm 56.45→12.27、refusal 28.98%→83.83%。冻结 policy 的消融说明 skill evolution 独立有效，随后 RL 进一步内化。

**局限、可信度与当天主线：** 训练环境由 LLM 生成的 simulator 简化现实工具链，安全 verifier 定义决定 reward，在线更新仍可能过拟合已见攻击。论文证明协同优化的可行性，不等于开放世界持续安全。

**阅读定位与复现检查：** Figure 2 中 harness update 必须先独立验收、版本化，再进入 SFT/RL；Table 2 的 frozen-policy 结果用来证明外部控制本身有效，Figure 3 才说明 policy internalization。尤其要核对 failure bucket、skill admission 和联合 reward 是否使用同一 verifier，否则共演化可能围着同一个盲点同时过拟合。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### Coverage, Not Targeting: A Structural Regime in Multi-Turn Agent Credit Assignment

**论文信息：** Zhou, Chenyu, Jiang, Qiliang, Wu, Shuning, Zhou, Xu；分类：Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02417](https://arxiv.org/abs/2609.02417)。

**一句话 TL;DR：** 在终局 verifier 只能确认整条链是否成功时，credit 覆盖多少因果步骤往往比精确瞄准哪个步骤更重要；稀疏“聪明归因”可输给均匀 dense reward。

**为什么值得推荐：** 多轮 Agent RL 热衷 step-level credit，但每回合只给一个 spike 时，长因果链的大部分必要动作没有信号。论文用真实 τ²-Bench、BFCL V3、ToolACE 与可穷举 toy 把 coverage 作为独立轴。

**方法怎么工作：** 实验固定总 reward budget，对 binary terminal、per-turn concentration、shuffled 与 uniform dense 几何做配对多 seed；测 causal-chain length C 与 credit budget k 的相位；再扫 matched-budget breadth，区分位置精度与覆盖。

**关键实验与证据：** retail-14B 中 binary 在 4/5 seed 降低 policy，uniform 在 4/5 seed 提升、相对 base +0.041；concentrated 与 shuffled 均低于 uniform。第二 benchmark 和 20-seed breadth sweep 复现 C≫k 时覆盖主导，能力阈值以下则信号都无效。

**局限、可信度与当天主线：** 结论限定 terminal-verifier tool agents 与 C≫k；τ² 主结果只在 Qwen3，chain 定义也影响边界。它挑战的不是所有 PRM，而是把单点 attribution 默认当作更优。

**阅读定位与复现检查：** Figure 1/3 先建立 C≫k 的 coverage gap，Table 1 再看 uniform、concentrated、shuffled 的配对 seed；Figure 7 的 matched-budget breadth sweep 是机制最强证据。阅读时不要把 uniform 当普遍最佳，它只是在 terminal verifier、能力超过阈值且因果链长于 credit budget 的区域成为强默认。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### Post-Training Language Models for Gold-Medal Performance in Coding Competitions

**论文信息：** Ficek, Aleksander, Narenthiran, Sean, Samadi, Mehrzad, Majumdar, Somshubra, Ginsburg, Boris；分类：Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL); Multiagent Systems (cs.MA); Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02849](https://arxiv.org/abs/2609.02849)。

**一句话 TL;DR：** 22,000 道题、合成推理 SFT、RL 与反馈式 GenCorrect 共同把 30B-A3B 模型从 IOI 2025 的 130 分推到 468 分；更大系统在真实 IOI 2026 超过最高人类分数。

**为什么值得推荐：** 这篇是当天最完整的 coding post-training 系统报告：它把数据筛选、teacher trace、SFT、RL、测试时搜索和真实赛场约束分开，因此能判断性能来自训练还是推理预算。

**方法怎么工作：** 流程先清洗 22K 竞赛题并去除 IOI 2025、ICPC 2025、LiveCodeBench Pro 污染；生成约 120 万条推理轨迹做 SFT；Nano-CC 再接受 RL；GenCorrect 在固定提交预算内生成、测试、反馈和修订多解。Ultra-CC 因算力只做 SFT。

**关键实验与证据：** Nano-CC 在 IOI 2025 由 130→291（后训练）→468（GenCorrect），超过 438.3 金牌线；Ultra-CC 达 502。真实 IOI 2026 在同样时间、网络与提交限制下得 535.4/600，高于 361.12 金牌线和最高人类 498.27。

**局限、可信度与当天主线：** 这不是等算力的人机比较，训练与测试时成本巨大；Ultra 未做 RL，训练语料不能完全公开，领域也局限竞赛编程。真实赛时评估显著降低了回溯污染风险，但不能外推仓库维护。

**阅读定位与复现检查：** 先将 Table 2 的 teacher 选择、Nano 的 SFT/RL 与 Ultra 的 SFT 分开，再看 live IOI 2026，而不要把所有分数归于单一 RL recipe。附录的 contamination policy 和 120 万 trace 生成细节决定结果可信度；同时要把训练计算、GenCorrect 的测试时计算、与人类相同的赛场时间/提交限制视为三种不同资源。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### Cliff: Learning Process Rewards from the First Mistake

**论文信息：** Han, Peixuan, Wang, Runhui, Ramaneti, Ketan, Hao, Jie, Friedland, Gerald, Kong, Chris；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02817](https://arxiv.org/abs/2609.02817)。

**一句话 TL;DR：** Cliff 只让 teacher 找出 rollout 的第一个错误，把此前 token 赋正 advantage、此后赋负 advantage，用粗 outcome 构造细粒度 process reward。

**为什么值得推荐：** RLVR 的最终 0/1 奖励不能告诉模型错从哪里开始；传统 PRM 又需要专门模型。Cliff 的关键判断是错误前缀有价值、错误后的判断信息边际很低，因而只需 off-the-shelf teacher 定位 cliff point。

**方法怎么工作：** Figure 1 中学生产生 rollout；teacher 基于过滤后的 reference solution 判断首错；轨迹被分成 correct prefix/incorrect suffix；token advantage 再送入修改后的 GRPO。论文比较不同 teacher 能力、是否使用 ground truth 与训练动态。

**关键实验与证据：** 覆盖数学和代码共 12 个设置，平均相对 on-policy distillation 提升 15%、相对标准 GRPO 提升 7%，较弱 teacher 也有效。Table 1 同时报告 teacher reference accuracy 与对自动 verifier 的一致性，避免只按 teacher 名称推断质量。

**局限、可信度与当天主线：** 代码任务是单轮且每题仅 10 个测试，teacher 的“首错”可能把等价推理误判；强 reference 过滤也增加成本。它支持首错切分这一 reward shaping 机制，不证明 token 标签就是因果真值。

**阅读定位与复现检查：** Figure 1 是机制入口，Table 1 用来检查 teacher 判断首错是否可靠，Table 2 再比较 GRPO、on-policy distillation 与 Cliff。训练曲线比终点均值更重要：如果 teacher 噪声只改变长度或格式，token advantage 可能学到表面模式。代码任务还应检查十个测试是否足以定位语义首错。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### APEx: Distillation of Agent Procedural Experience for Adaptive Deep Research Question Answering

**论文信息：** Ding, Jie, Sun, Rui, Zhang, Xinyuan, Zhang, Zeyu, Liu, Xin；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02253](https://arxiv.org/abs/2609.02253)。

**一句话 TL;DR：** APEx 让 Executor、Distiller、Planner 交替接受 GRPO，把实例轨迹与类别技能闭环起来，并在测试时用 skill-guided RL 自适应。

**为什么值得推荐：** 长轨迹 memory 太重，静态 skill 又和 policy 更新脱节。APEx 的贡献是让经验压缩、执行与计划共同被环境 reward 约束，而非由固定提示一次性总结。

**方法怎么工作：** Figure 2 的四块是 memory、framework、alternating optimization 与 TTRL：保存实例 trajectory；Distiller 提炼 category skill；Planner 以 skill 生成计划；Executor 执行。三模块轮流固定另外两者做 GRPO，测试时再以 skill-alignment regularization 限制无真值 RL 漂移。

**关键实验与证据：** 七个 benchmark 上平均最强，报告相对 GPT-5.4 +14.7 点、相对最佳 memory baseline +3.0；移除 memory、skill、两者分别降 1.8、3.1、10.1 点，说明两层经验有互补性。

**局限、可信度与当天主线：** 训练基于小型开放模型，测试时 RL 的 ground-truth-free reward 仍可能自我强化，搜索 benchmark 也不等于开放研究事实核查。需要看代码与 reward 才能判断可复现成本。

**阅读定位与复现检查：** Figure 2 要按 Executor、Distiller、Planner 的更新顺序读，避免把交替 GRPO 误解成三个同时变化的黑盒；Table 3 的去 memory/skill 消融说明二者并非同义。测试时 RL 是最需警惕部分：skill-alignment regularization 只能限制偏离，不能替代事实 reward，因此开放研究问答还需要独立引用核验。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### How Output Format Confounds Data Quality and Capability in Instruction Tuning

**论文信息：** Gan, Chengguang, Wei, Hanjun, Liang, Yunhao, Zhang, Qinghao, Ni, Shiwen, Cai, Zhixi；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02015](https://arxiv.org/abs/2609.02015)。

**一句话 TL;DR：** instruction-tuning 数据的输出格式可让未训练 base accuracy 相差最多 70 点，并让 selector 把“格式匹配”错当内容质量。

**为什么值得推荐：** 数据选择论文常用 embedding、梯度谱或训练增益判断样本质量，却默认接口只是外壳。这项受控研究旋转语义等价 output interface，显示 selection signal 会被 format 锁定，直接挑战大量 data quality 结论。

**方法怎么工作：** 实验把 12 个任务渲染成多个语义等价格式，在 Qwen3.5 4B/9B 与 Mistral 上做多 seed LoRA；比较选择器、谱统计与 held-out interface transfer；再预注册一个对齐残差的因果干预，检验锁定能否被移动。

**关键实验与证据：** 仅换输出接口，ARC-C base accuracy 最多相差 70 点，12 任务平均 22.5 点；训练后同格式相对跨格式可差 40 点以上。谱统计对 interface rotation 基本不敏感，真正携带选择信号的是 interface-varying residual。

**局限、可信度与当天主线：** 只测分类与短推理、LoRA 和有限格式族；长生成与 full FT 尚未验证。它最重要的边界是：数据质量必须跨接口测，不能把单格式增益当内容能力。

**阅读定位与复现检查：** Figure 1 先建立 base model 的 format sensitivity，Figure 4 再看跨接口 capability map；预注册的 Figure 10/Table 15 才是因果干预证据。复现时必须保持语义、token budget 和训练样本不变，只旋转接口，并同时报告 same-interface 与 held-out-interface，否则很容易再次把格式记忆称作数据质量。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### On-Policy Distillation Meets Off-Policy GRPO: Training Compact Instruction-Following Rerankers

**论文信息：** Prabhakar, Vignesh, Pan, Jialing, Ankisettipalli, Anil Babu；分类：Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01947](https://arxiv.org/abs/2609.01947)。

**一句话 TL;DR：** 先用 off-policy GRPO 强化 4B teacher，再让 1B student 在自己的排名上接收 teacher soft reward，蒸馏因此覆盖学生真实会访问的状态。

**为什么值得推荐：** 离线 KD 只能模仿 teacher 已给出的排序，distribution shift 时尤其脆弱。论文用受控 RankNet 与 on-policy GKD 对照，证明收益不只是换 loss 或把 teacher matching 搬到在线。

**方法怎么工作：** Figure 1 两阶段共享 Plackett--Luce 排名采样与 GRPO：teacher 在 88K instruction-following 样本上用 LLM-judge reward 做 off-policy 优化；student 自采 ranking，teacher 对该 ranking 打软 reward，配合 KL/entropy 更新。

**关键实验与证据：** MAIR-11 的 869 query 上 nDCG@6=0.7670，比离线 listwise KD 高 4.6 点；MAIR-Full 126 task/9,356 query 达 0.6808 nDCG@6、0.7865 MRR@6。1B 也超过两款公开 7B RL reranker，三种 student backbone 都有增益。

**局限、可信度与当天主线：** 仅英文文本 reranking；LLM judge 人工校验只有 188 例，多数消融单 seed，teacher 架构未扩展。结论应限定为学生分布上的 reward distillation。

**阅读定位与复现检查：** Figure 1 要分清 teacher 的 off-policy GRPO 与 student 的 on-policy reward distillation；Figure 2 的核心消融排除了 RankNet KD 和 on-policy GKD 两种替代解释。Table 5 的 126-task macro 与 Table 17 的多 seed 稳定性比单个 MAIR-11 数字更重要，同时应注意 judge 人工校验仅 188 条。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### CoMerge: Conflict-Driven Preference Optimization for Multi-Task Model Merging

**论文信息：** Zheng, Mingjie, Chen, Zihao, Chen, Wenqing, Yuan, Weile, Chu, Zhixuan, Yu, Jianxing, Zheng, Zibin；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02273](https://arxiv.org/abs/2609.02273)。

**一句话 TL;DR：** CoMerge 不直接平均专家参数，而把 naive merge 暴露的冲突行为当 hard negative，只学习 1,445 个 tensor-wise 系数做 preference optimization。

**为什么值得推荐：** model merging 最大问题是 interference，但常见方法只在参数几何中消冲突，没利用合并后真实退化行为。CoMerge 用自监督 preference pair 把“哪里坏了”反馈给 merging coefficient，兼顾数据效率与行为目标。

**方法怎么工作：** Figure 2 先提取稀疏 task vector；用 task arithmetic 生成冲突输出作为 rejected、专家或高质量行为作为 chosen；再对轻量系数做偏好优化并重建 merged weight。消融区分没有 negative、不同 negative 来源和正样本策略。

**关键实验与证据：** MergeBench 平均 normalized performance 达 0.9968，超过所有 data-free/data-driven baseline；Llama-3.1-8B-Instruct 的安全与 instruction following 冲突任务改善明显，同时接近 full-parameter FT。小模型设置也报告 0.9321±0.0014。

**局限、可信度与当天主线：** 评测仍围绕给定专家与 MergeBench，hard negative 质量受 naive merge 影响；只调系数可能无法处理需要新表征的任务。它展示了 preference objective 可优化模型组合，但不是通用持续学习解法。

**阅读定位与复现检查：** 先看 Figure 2 中 task vector、conflict negative、preference update 到 coefficient reconstruction 的闭环，再看 Table 2 判断负样本是否必要。0.9968 normalized performance 接近上限，尤其需要检查各任务的原始分数和冲突强度；若 benchmark 太容易，少量系数可能只是选择专家比例，而非真正修复参数干扰。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### PRO-Step: Step-level Process Reward Optimization for Retrieval-Augmented Generation

**论文信息：** Kim, MinKeon, Lee, Namjun, Kim, Jaekwang；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01658](https://arxiv.org/abs/2609.01658)。

**一句话 TL;DR：** PRO-Step 用 tree search 与 process reward model 找出检索推理的首个局部错误，再从该状态生成修正轨迹并做偏好优化。

**为什么值得推荐：** RAG agent 的最终答案错，可能源自早期查询、证据选择或推理传播；只用 outcome reward 会把整个轨迹同判。论文把过程 verifier 放到可恢复节点，并特别报告 critic-feedback regeneration 的负结果，可信度高于只呈现成功配方。

**方法怎么工作：** Figure 1/2 的流程是：对检索轨迹扩展 search tree；PRM 对每步状态打分并定位首错；从错误状态重规划查询与证据；用 outcome margin 过滤 chosen/rejected，最后做 DPO。部署 policy 不需要 PRM。

**关键实验与证据：** 五个 benchmark 上平均 EM/F1 最佳，并在多项相对 baseline 达统计显著；移除 PRM 选择或 outcome filter 都会退化。附录还显示把 critic 文字直接用于 regeneration 虽得到更强表面反馈，却在所有下游 benchmark 退化。

**局限、可信度与当天主线：** PRM、检索器和 answer metric 可能共享偏差，首错并非唯一根因，公开摘要未给统一绝对增益。最值得保留的是“局部归因+结果过滤”，以及负结果对 feedback distribution shift 的解释。

**阅读定位与复现检查：** Figure 2 的 tree-search case 能帮助区分“找到首错”和“从首错恢复”；Table 1 再看五个 benchmark 的 EM/F1。附录的 critic-feedback regeneration 负结果必须一起读：更会解释错误的 critic 可能生成与部署 policy 不同分布的轨迹。这个失败对所有用文字反馈造偏好对的数据流程都有警示。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

### Learn from Whoever Is Right: Answer-Verified Multi-Teacher Distillation for Multi-Domain LLMs

**论文信息：** He, Xixiang, Li, Xingming, Wu, Baiqi, Sun, Qiyao, Ji, Xuanyu, Cheng, Ao, Hu, Qingyong；分类：Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02548](https://arxiv.org/abs/2609.02548)。

**一句话 TL;DR：** MT-SDPO 逐样本验证多个领域 teacher 谁真的答对，再把所有合格反馈聚合到一个 student，避免按领域标签盲选老师。

**为什么值得推荐：** 多 teacher 蒸馏常假设领域对应最可靠专家，但论文发现同域 teacher 会失败、异域 teacher 反而正确。用答案 verifier 做 sample-level eligible set，直接解决最弱领域被错误监督的问题。

**方法怎么工作：** Figure 2 中离线阶段验证每个 teacher answer；在线 student rollout 若成功就 self-anchor，失败则从合格 teacher 池聚合经 sanitizer 的反馈；EMA self-teacher 与 normalized update 稳定 100-step 训练。

**关键实验与证据：** Qwen3-8B 相对 multi-domain post-training 的 Macro +4.64、worst-domain +14.79，并缩小 domain gap；跨 1.7B/4B/8B 与 OLMo-3-7B 的五个 student 检查规模效应。消融显示 cross-domain reassignment 和 aggregation 分别贡献覆盖与精度。

**局限、可信度与当天主线：** 只有科学问答三域、每域 79 个 held-out、16 次采样，verifier 依赖私有答案；较小模型并非所有指标都提升。它支持“按样本验老师”，不支持任意 teacher feedback 都能合并。

**阅读定位与复现检查：** Figure 1 先看 domain teacher 并不总在本域正确，Figure 2 再追踪一个样本如何形成 eligible set、self-anchor 和聚合反馈；Table 2 的消融区分 cross-domain reassignment 与 aggregation。阅读结果时优先看 worst-domain 与 gap，而非只看 Macro，因为方法的核心主张正是避免弱域被错误老师淹没。

**与当天主题的关系：** 它在今天的后训练主线中提供的不是“某个榜单又涨了”的故事，而是把训练目标、数据来源、反馈质量、优化状态和部署行为放到同一条因果链上。复现时应先确认对照是否只改变目标机制，再分别报告训练内、分布外、不同模型规模和不同随机种子结果；还要核对计算预算、采样次数、判分器与污染控制是否一致。若这些条件未满足，最安全的解释是方法在当前配方有效，而不是已经形成普遍训练规律。

## 中相关论文速读

这些论文都提供了可保留的方法或判断，但证据规模、领域专用性、复现条件或与主线的距离使它们暂不值得按强相关投入同等阅读成本。

### Skill-as-API: Confidential Multi-Agent Coordination for Agentic Software Engineering

**论文信息：** Zhao, Ziwei, Gu, Yu, Liang, Haojun, Zhang, Chen, Ding, Xizhi；分类：Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01677](https://arxiv.org/abs/2609.01677)。

Skill-as-API 将技能正文 closure-capture 在所有者进程，只公开名称、描述、I/O schema 和 trust tier，并以自动降权、skill hiding 和函数边界缩小注入面；三 Agent PR review case 与 1.8--2.9 秒跨洲热重连证明协议可跑。它未处理跨步输出投毒，且证据主要是单一案例，适合作为 confidential capability 设计参考。

### From Prompting to Engineering: A Research Agenda for Prompt Engineering in Software Engineering

**论文信息：** De Martino, Vincenzo, Broccia, Giovanna, Pecorelli, Fabiano, Horkoff, Jennifer, Coppola, Riccardo, Ferraro, Antonino, Motger, Quim, McKenzie, Emma, Siddeeq, Shahbaz；分类：Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02248](https://arxiv.org/abs/2609.02248)。

这篇 PROMPT-SE 社区议程把 prompt 视为需要版本、追踪、测试、治理和技术债管理的软件 artifact，整理标准化、benchmark、lifecycle、人机协作、隐私五类问题。推荐保留术语框架，但它来自 workshop discussion，没有新的执行实验，不必按方法论文深挖。

### Belief-Calibrated Optimization: An Explicit World Model for Agentic Optimization

**论文信息：** Chen, Yuhan, Tian, Zhihua, Dabas, Mahavir, Peris, Charith, Gupta, Rahul, Jin, Ming, Kang, Feiyang, Zhang, Siyuan, Wang, Nan, Jia, Ruoxi；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01861](https://arxiv.org/abs/2609.01861)。

BCO 让 scaffold optimizer 把对环境的假设写成持续修订的 in-context world-model 文档；五个 memory/tool/code/terminal benchmark 的 train 与 held-out 都优于只少这份文档的匹配控制，模型替换后多数仍领先。亮点是用 falsified same-form 文档证明收益来自内容；限制是上下文过长会直接让优化未完成。

### RecEvolve: A Knowledge-Driven Autonomous Agent System for Recommender Systems

**论文信息：** Pan, Weidi, Ma, He, Ye, Shuhao, Rungta, Palaksh, McPeek, David, Jiao, Junyi, Bhadury, Arnab, Gao, Mingyan, Dalal, Onkar；分类：Information Retrieval (cs.IR) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01622](https://arxiv.org/abs/2609.01622)。

RecEvolve 在生产双塔推荐上让 Agent 完成想法、实现、训练、评估的 40 多轮闭环，离线 NDCG 相对提高约 20%，线上满意度 +3.77%，并真实发现 reward-hacking shortcut。生产证据难得，但系统、流量和评测细节不可外部复核，不能把业务提升归因于某个通用 Agent 组件。

### Towards Behavior Tree-Guided Vulnerability Detection with Lightweight LLMs

**论文信息：** Basic, Enna, Giaretta, Alberto；分类：Cryptography and Security (cs.CR) ; Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01758](https://arxiv.org/abs/2609.01758)。

Behavior Tree 将 Java 代码的控制流、条件和动作压缩成比 AST 更短的表示；460 个 Juliet 样本上，短代码提高 recall，长代码在 AST 超窗时改善总体表现，而 raw source precision 更高。它对本地量化模型的程序表示有用，但单一 Mistral 24B 与合成漏洞限制很大。

### Harness Engineering in LLM Tool Use via Agent-Native Reusable Tool Primitives

**论文信息：** Jin, Haibo, Wang, Suijin, Yu, Xucheng, Luo, Haojing, Wang, Haohan；分类：Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL); Machine Learning (cs.LG); Multiagent Systems (cs.MA)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01736](https://arxiv.org/abs/2609.01736)。

论文把常用多步 tool workflow 封装为 Agent 可原生调用的 typed primitive，并用多 Agent schema negotiation 降低反复规划与格式错误；ACEBench 上报告跨域改进。值得记住 harness abstraction，但 tool schema 仍人工编写，威胁模型只覆盖选择阶段 prompt injection，不能视作完整运行时安全。

### OmegaUse-SOP: SOP Engineering for Professional Computer Use from Human Demonstrations

**论文信息：** Xiao, Yixiong, An, Lang, Yang, Hucheng, Ma, Pinxue, Chen, Yongquan, Cao, Jingjia, Zhao, Yusai, Wang, Ting, Liu, Ting, Bao, Siqi, Zhou, Jingbo, Wu, Hua；分类：Human-Computer Interaction (cs.HC) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02149](https://arxiv.org/abs/2609.02149)。

OmegaUse-SOP 将人类 GUI 演示经 Observe、Reason、Configure、Execute 转成可复用 SOP skill，并在 PVsyst 7.2 的光伏专业流程逐步 grounding、操作、验证。它展示领域软件的可部署路线，但摘要缺少任务数、绝对成功率和强 baseline，当前证据不足以上升为强相关。

### Zeta-Lite: A Concurrent, Branchable In-Browser SQL Database for Agentic Memory

**论文信息：** Zhang, Gene；分类：Databases (cs.DB) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01818](https://arxiv.org/abs/2609.01818)。

Zeta-Lite 把 2.87MB gzip 的 SQL engine 放进浏览器，支持单线程交错 snapshot-isolation transaction 与 copy-on-write branch/merge/rebase，点读达 268k--315k/s。作为 Agent memory substrate 很有吸引力，但论文验证数据库机制，不验证 LLM 是否正确管理分支与提交。

### Bilevel Coordinated Reflection: A Game-Theoretic Approach to Multi-Agent LLM Systems

**论文信息：** Chen, Yihang, Chen, Yuxiang, Huang, Yuxuan, Fang, Meng, Luo, Weilin, Wang, Jun；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02750](https://arxiv.org/abs/2609.02750)。

SRMA 把多 Agent reflection 写成带外部 gate 的 stochastic memory ascent，并证明 transcript-only gate 在文本不可区分环境中不能统一改善；500 个 SWE-bench 上完整 Kimi 系统 72.2%，公开 mini-SWE-agent 70.8%。理论问题很漂亮，但系统差仅 1.4 点且 scaffold 不完全匹配，需看复现。

### Dictionary-Guided Mutation Operators for Automated HDL Repair

**论文信息：** Mastora, Maisha, Sullivan, Dean；分类：Emerging Technologies (cs.ET) ; Artificial Intelligence (cs.AI); Hardware Architecture (cs.AR); Neural and Evolutionary Computing (cs.NE)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01775](https://arxiv.org/abs/2609.01775)。

字典约束 Verilog token mutation，并用一次 simulation divergence 定位可疑线；CirFix 六类 DUT 上修复 14 个 variant，含 CirFix 失败的六编辑 bug，并在一项两编辑任务快 18 倍。oracle-passing 仍可能过拟合 testbench，且规则族有限，但这是执行反馈约束 repair 搜索的扎实例。

### Agent Flight Recorder: Tamper-Evident Audit Trails with On-Chain Anchoring for Long-Horizon Tool-Using Agents

**论文信息：** Bindschaedler, Laurent, Botha, Quentin, Siebenbrunner, Christoph；分类：Cryptography and Security (cs.CR) ; Multiagent Systems (cs.MA)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01931](https://arxiv.org/abs/2609.01931)。

Agent Flight Recorder 用 tamper-evident event chain、时间戳和链上 anchor 留存长程工具轨迹，强调审计证据不能由 Agent 自己事后改写。工程测量显示开销可控，但链上哈希只证明记录未变，不能证明 observation 完整或 action 合法，因此适合审计层而非 correctness verifier。

### MASkills: Continual Skills Optimization for Multi-Agent LLM Systems

**论文信息：** Yao, Huaiyuan, Liu, Xiaoou, Fleming, Charles, Chen, Tianlong, Wei, Hua；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02094](https://arxiv.org/abs/2609.02094)。

MASkills 以 skill-conditioned credit、层级聚合和 momentum-smoothed update 做多 Agent 技能库的 refine/induce/consolidate/prune，在 HotpotQA、LoCoMo、GAIA 改善表现。核心单位和 SkillGLoW 接近，但摘要缺少绝对数、跨版本漂移与执行 gate，先列中相关。

### PGPO: Potential-Guided Policy Optimization for Multi-Turn Agentic Tasks

**论文信息：** Zheng, Yuyao, Sun, Haipeng, Bao, Junwei, Liu, Lemao, Jiang, Hongfei, Song, Yang, Dou, Dejing；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02236](https://arxiv.org/abs/2609.02236)。

PGPO 从同组 rollout 的 anchor state return 估计 potential，再用相邻状态差传播 action advantage，使失败轨迹里的有效动作不再同罚；ALFWorld/WebShop 优于近期 group-based RL，训练开销很小。潜力估计仍依赖可比较状态与终局 reward，缺少摘要中的绝对增益。

### Modelstamp: Pre-Deserialization Verification of Machine-Learning Artifacts and Runtime Environment State

**论文信息：** Dhekne, Anagha；分类：Software Engineering (cs.SE) ; Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01781](https://arxiv.org/abs/2609.01781)。

Modelstamp 在反序列化前校验模型哈希、受限依赖集合与环境版本；14 个 drift、8 个 trust-boundary 场景按预期响应，1GiB 中位验证 3.334 秒、约 307--312MiB/s。它诚实承认共享密钥伪造与重放，不替代安全反序列化；对 Agent artifact provenance 很实用。

### PrimSynth: An Agentic Approach to Discover, Validate, and Synthesize Exploit Primitives for Linux Kernel Vulnerabilities

**论文信息：** Wang, Pengfei, Chen, Anying, Liu, Danjun, Zhou, Xu, Xie, Wei；分类：Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02647](https://arxiv.org/abs/2609.02647)。

PrimSynth 把 Linux kernel exploit primitive 形式化为六类能力，通过多 Agent、漏洞定向执行和可重启环境反复发现、验证、合成，在 16 个真实漏洞上测试。它使用环境信号证明 state transition，比纯代码生成可信；但研究目标是 exploitation，风险与可复现边界需要优先审查。

### Efficient GUI Agents: A Systems Survey of Observation, Memory, Action, and Runtime Optimization

**论文信息：** Bai, Bizhe, Yuan, Jiakang, Wu, Hongming, Wang, Xinyue, Ren, Jie, Chen, Siyao, Ya, Yuchen, Bai, Fan, Peng, Pai, Qin, Huafeng, Chen, Tao；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02309](https://arxiv.org/abs/2609.02309)。

GUI Agent 系统综述沿 observation、memory、action、runtime optimization 四层整理效率瓶颈，适合快速建立 inference cost 地图。它不提供新模型或统一可执行 benchmark，且系统数字来自异构论文，读者应把它当索引而不是性能结论。

### Diagnosing with Insights: Structured Analysis of Agent Failures via Behavioral Abstractions

**论文信息：** Bi, Jiayi, Gao, Yanjie, Xie, Yuanmin, Li, Liqun, Xu, Tianyin, Yang, Fan, Yang, Mao；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02371](https://arxiv.org/abs/2609.02371)。

工作把 Agent failure trace 抽象成重复、停滞、错误恢复等行为 pattern，再用于诊断而非只贴最终失败标签。结构化行为语言有助于跨 harness 比较，但自动抽象器、人工一致性和对实际修复决策的增益仍需完整论文核对。

### CHIME: Credit-Aware Hierarchical Memory Evolution for Long-Horizon Agentic Planning

**论文信息：** Ye, Yongshi, Lan, Tian, Jiang, Feihu, Ye, Muyang, Zhu, Bin, Jia, Qianghuai, Wang, Longyue, Xu, Zhao, Luo, Weihua, Shi, Xiaodong；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02074](https://arxiv.org/abs/2609.02074)。

CHIME 对长程 planning memory 做 hierarchical credit：把最终结果拆回 episode、skill 与记忆条目，再演化保留内容。它直击“记住什么”而非“存多少”，但评测主要是 agent planning benchmark，归因器可能把共同出现误当贡献，因此暂作中相关。

### CAPTURE: Disentangling Preference Drift from Memory Poisoning in Personalized LLM Agents

**论文信息：** Hossain, S M Asif, Shayoni, Ruksat Khan, Morol, Md Kishor；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02265](https://arxiv.org/abs/2609.02265)。

CAPTURE 将 personalized Agent 的 preference drift 与 memory poisoning 分开建模，避免所有行为变化都被误判为攻击；这对持续对齐评测重要。它主要是诊断框架而非新的 post-training recipe，且真实偏好没有完全可观测 ground truth。

### Git4Data: Database-Native Version Control for AI Agents

**论文信息：** Gou, Hongshen, Zhang, Zuyu, Sun, Yuze, Xu, Peng, Tian, Feng, Wang, Long, Wang, Jianguo；分类：Databases (cs.DB) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02106](https://arxiv.org/abs/2609.02106)。

Git4Data 为 AI Agent 提供数据库原生 branch、commit、merge 与可追溯版本语义，目标是让数据状态像代码一样可回滚。系统意义明确，但论文重心是数据基础设施，尚未证明 LLM 能正确解决语义冲突，故不必深读。

### SCX Router: Streaming Zero-Shot Model Selection with a Decoder-KV Classifier and a Real-World Task Ontology

**论文信息：** Stepanov, Ihor, Smechov, Aleksandr, Shtopko, Mykhailo, Vodianytskyi, Dmytro, Lukashov, Oleksandr；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02292](https://arxiv.org/abs/2609.02292)。

SCX Router 用 decoder-KV classifier 在 streaming request 上零样本选模型，并以现实 task ontology 适应任务漂移。它能改善 Agent 系统成本/质量分配，但不是模型 post-training，本次只保留为 harness-level efficiency。

### A Tri-Agent Framework for Evaluating and Aligning Question Clarification Capabilities of Large Language Models

**论文信息：** Zhao, Yikai, Pandey, Saurabh, Misra, Pradeep Kumar；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02054](https://arxiv.org/abs/2609.02054)。

三 Agent 框架分别生成、批判和对齐澄清问题，评估 LLM 在信息不足时是否先问而不是猜。它与可靠 Agent 的需求澄清相关，也可能生成 alignment data；不过没有仓库任务和执行闭环，适合作为边缘方法。

### EvalDetectBench: A Benchmark for Measuring Evaluation Awareness in Frontier Language Models

**论文信息：** Li, Xinning, Ochwang'i, Kemunto, Bharadwaj, Aryasomayajula Ram, Souly, Alexandra, Kirk, Robert；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01611](https://arxiv.org/abs/2609.01611)。

EvalDetectBench 测 frontier model 是否识别自己处于评测环境，揭示 benchmark-aware behavior 可能让离线结果失真。它对审计和安全评测重要，但论文是检测基准，不直接改进 coding agent 或 post-training，因此放中档。

### CivBench: A Long-Horizon Benchmark for Tool-Mediated Agents in Civilization VI

**论文信息：** Andrews, Austin Tudor David, Wilkinson, Liam, Heagerty, Jamie, Coppock, Harry, Foerster, Jakob Nicolaus, Costa, Rui Ponte；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02459](https://arxiv.org/abs/2609.02459)。

CivBench 用 Civilization VI 构造长程、工具介导、部分可观测的 Agent 规划任务，能测试跨数百步资源与策略一致性。游戏环境有状态 oracle，但与真实软件变更的 artifact/build/test 语义不同，适合补充 horizon 压力而非替代 SWE benchmark。

### Discriminative World Models for Web Agents

**论文信息：** Li, Kelvin, Pendharkar, Dhruv, Pahilajani, Anish, Shang, Chuyi, Oks, Leon, Karlinsky, Leonid, Feris, Rogerio, Darrell, Trevor, Herzig, Roei；分类：Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02885](https://arxiv.org/abs/2609.02885)。

Discriminative World Models 用真实/反事实下一状态区分训练 Web Agent world model，再为 PRM action ranking 和 WebArena-Lite test-time selection服务，胜过监督 next-state world model。它说明“预测文本”不如“辨别行动后果”，但依赖网页模拟与候选 action coverage。

### ClaimReceipt: Verifying Evidence Sufficiency and Coverage in Agent Evaluations

**论文信息：** Zhu, Peiying, Chang, Sidi；分类：Artificial Intelligence (cs.AI) ; Cryptography and Security (cs.CR); Multiagent Systems (cs.MA)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01992](https://arxiv.org/abs/2609.01992)。

ClaimReceipt 区分证据是否足以重算 claim 与记录是否覆盖预先承诺实验全集；1,392 个历史记录、30 个 prospective assignment 上，缺一 terminal receipt 即返回 INCONCLUSIVE_COVERAGE，开销仅推理时间 0.021%。单一酒店 testbed 与设计型 fault 限制泛化，但 claim-relative receipt 很值得借鉴。

### Public-Sharing Labels and Verbatim Field Egress in an MCP-to-A2A Agent Configuration: A Controlled Multi-Model Study

**论文信息：** Mahapatra, Arpan Kumar；分类：Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01693](https://arxiv.org/abs/2609.01693)。

480 次冻结三臂 MCP→A2A 实验保持六个实质字段逐字相同，只改变 CONFIDENTIAL/无标签/PUBLIC。机密对无标签因 floor 不可判，PUBLIC 与外发增加的关联又强烈依模型而变；论文不夸大因果，展示了 composition-level data egress 必须独立测试。

### Automated Vulnerability Injection in Smart Contracts Using Large Language Models

**论文信息：** Migliaccio, Luca, Natella, Roberto, Ivaki, Naghmeh, Laranjeiro, Nuno, Vieira, Marco；分类：Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02624](https://arxiv.org/abs/2609.02624)。

LLM 向真实 Solidity 合约注入 49 类漏洞，近千候选经编译、执行、业务逻辑和漏洞存在四级验证后只剩 32 个、覆盖 25 类，survival 16.58%。低存活率反而说明自动基准生成必须严格验收；样本集中局部简单 bug，离大规模真实分布仍远。

### When Does Authorization End? Effect Closure at Provider Boundaries

**论文信息：** Santos-Grueiro, Igor；分类：Cryptography and Security (cs.CR) ; Distributed, Parallel, and Cluster Computing (cs.DC)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02866](https://arxiv.org/abs/2609.02866)。

EFFECTBOUND 定义 policy-relative effect closure：撤销后既不能再发新授权，旧授权也不能越过最后可阻止 effect 的 frontier。GitHub、Kubernetes、NATS、Kafka 案例给出 strategy、impossibility certificate 或 abstain；它是强系统安全工作，但不是 LLM 方法，作为工具 Agent provider boundary 的邻接证据保留。

### Repo-To-Skill: Distilling GitHub Repositories Into AI4AI Skills

**论文信息：** Chen, Jianlyu, Hu, Yuyang, Qian, Hongjin, Liu, Jiawei, Wei, Wenqing, Chen, Xiaolong, Lian, Defu, Dou, Zhicheng, Li, Chaozhuo, Ye, Qiwei, Liu, Zheng；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02749](https://arxiv.org/abs/2609.02749)。

DisCo 从 1,000 个 ML 仓库蒸馏 5,000+ verified skills，固定 GPT-5.5、harness 和执行预算时，MLE-bench +134.3%、PaperBench +34.4%、FrontierCS +9.2%、PassNet +14.0%。规模与匹配控制很吸引人，但 skill 验证、仓库污染和公开性决定结论，需等待 artifact。

### Convergence Theory of Knowledge Distillation in Asynchronous P2P Gossip Learning Network

**论文信息：** Fang, Lucas Qingyang, Liu, Tiyao, Jing, Jinhao, Li, Zeji, Chen, Kaijie, Kuttivelil, Harikrishna, Obraczka, Katia；分类：Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01952](https://arxiv.org/abs/2609.01952)。

异步 P2P KD 的理论把 consensus 从参数搬到函数/预测空间，给出收敛到含可达误差与异质性的邻域；混合架构实验让 disagreement 收缩 40--61 倍。它对分布式蒸馏扎实，但不是典型 LLM post-training pipeline，因此中档保留。

### MERGED: Multimodal Entity Resolution via Generated Expert Reasoning Distillation

**论文信息：** Chen, You-Lin, Park, Kyoungjun, Xu, Bin, Sen, Prithviraj, Herrero-Vidal, Pedro；分类：Information Retrieval (cs.IR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01913](https://arxiv.org/abs/2609.01913)。

MERGED 用多 VLM teacher 一致样本做 SFT、分歧样本经 meta-judge 变成 DPO pair；多语电商 entity resolution 上 PR-AUC 比人标训练 +13.79%，比 Qwen2.5-32B-VL +6.32%，成本低 6 倍。生产适配快，但 teacher/judge 同源偏差与私有数据妨碍复核。

### Post-Training Ternarization of Qwen3-4B Capability, Effective Bit Budget, Storage Compression, and Deployment

**论文信息：** Malik, Anirudh, Mehra, M Sparsh, Devan, Poojith；分类：Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01962](https://arxiv.org/abs/2609.01962)。

Qwen3-4B 的 post-training ternarization 把目标线性层做到 1.641 effective bit，模型 8.29→3.96GiB，但十项 accuracy 64.5%→54.7%，Triton 单形状还比 FP16 cuBLAS 慢 4.6 倍。作者拒绝把压缩等同加速，这份负边界比 headline 更值得读。

### DMRL: Document-Mediated Reinforcement Learning for Skill Optimization in Advertising Recommendation

**论文信息：** Zhang, Wei, Li, Hongji, Sun, Song, Yu, Peng, Yang, Xue, Zhao, Lei, Jiang, Peng；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02170](https://arxiv.org/abs/2609.02170)。

DMRL 把广告 skill 文档优化建模为结构化编辑动作，上层 Agent 改文档、冻结下层 Agent 用 A/B 信号评估；DRPO 估风险感知 advantage，LRP 预测长期异质人群结果，并已上线短视频广告。在线证据强，但商业指标与数据未披露，外部无法复验。

### Train What You Deploy: Closing the MLP Reachability Gap in Low-Rank Clone Distillation

**论文信息：** Chen, Wenhui, Li, Zhifeng, Zhou, Jie, Singh, Navan Preet, Ciobanu, Madalina, Wang, Chenghua, Mao, Qingqing, Das, Ritankar；分类：Machine Learning (cs.LG) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02006](https://arxiv.org/abs/2609.02006)。

LRC distillation 部署完整 MLP，却让 62.5%--81.4% 线性自由度训练不可达。Dense-/CORE-LRC 在相同部署参数/FLOPs 下扩大可达集合，三 teacher Avg9 +2.36/+2.71/+10.45，Qwen 设置以半 token 达原精度。全结果单 seed，需复现后再升档。

### PragAlign: Feedback-Guided Pragmatic Alignment for Controlled Synthetic Dialogue Generation

**论文信息：** Sudheendra, Smitha Muthya, Srivastava, Jaideep；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02480](https://arxiv.org/abs/2609.02480)。

PragAlign 的生成—评估—最多三轮修订把 800 个对话的 evaluator acceptance 从 72.25% 提到 99.50%；无结构重复已到 95.88%，说明反馈主要做最后约束修正。1,200 条人工评估又显示 emotion 不稳定，清楚界定了 LLM judge 的上限。

### DKL: Decoupled Knowledge Learning for Instruction-Tuned Language Models

**论文信息：** Bhushan, Kushagra, Pulivarthi, Meghanadh, Sathi, Sai Krishna Reddy, Pandey, Gaurav, Gupta, Sonam, Kumar, Vineet, Sen, Jaydeep, Nandwani, Yatin, Joshi, Sachindra, Raghu, Dinesh；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02685](https://arxiv.org/abs/2609.02685)。

DKL 先在 base LM 上做 extended pre-training 注入语料知识，再把权重 merge 回 instruct LM，避免重新 IFT；retrieval failure 上 RAG accuracy 54.17→79.26。关键问题是 merge 是否在更广 instruction/safety 集上保持行为，摘要的“without affecting”需要完整表格支持。

### CA-OPD: Confidence-Aware On-Policy Distillation for Structured Visual Prediction

**论文信息：** Li, Menghao, Mu, Linjie, Wang, Yin, Hu, Haotian, Gu, Yannian, Xue, Lujiayi, Wang, Fanyi；分类：Computer Vision and Pattern Recognition (cs.CV)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02401](https://arxiv.org/abs/2609.02401)。

CA-OPD 用 teacher confidence 决定何时替换 student rollout token，并让被替换位置做 CE、保留位置做分布蒸馏；Qwen3.5-0.8B 在六个 GUI/OCR benchmark 全升，ScreenSpot-Pro +9.50、OCRBench-v2 English +6.72。它是多模态 on-policy distillation 的干净实例。

### SEAL: Reinforcing Global Safety in Mixture-of-Experts through Shared Expert ALignment

**论文信息：** Meng, Qingyu, Zha, Yiwei, Pei, Jiahuan, Hindriks, Koen, Bos, Herbert, Chen, Min；分类：Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02293](https://arxiv.org/abs/2609.02293)。

SEAL 把 MoE 的 always-on shared expert 当 router-independent safety anchor，用 adapter 与正交约束保留原安全子空间；六类攻击组合中 ASR 最多降 60%，五项能力平均代价不超过 1.4%。结构洞察有价值，但只适用于含 shared expert 的 hybrid MoE。

### User Feedback Provides a Unique Signal that LLMs Can not Detect

**论文信息：** Don-Yehiya, Shachar, Choshen, Leshem, Abend, Omri；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02859](https://arxiv.org/abs/2609.02859)。

论文比较有/无真实用户反馈的 revision，发现反馈能显著修正目标问题，而 LLM judge 常反而偏好没修好的 baseline，说明 feedback 学习被 evaluator bias 低估。它直接关系 RLAIF/RLHF 数据价值，但摘要缺少规模与绝对率，暂列中相关。

### A Survey on Self-Improving Test-Time Intelligence: Feedback-Driven Adapting, Learning, and Scaling at Inference

**论文信息：** Niu, Shuaicheng, Chen, Guohao, Chen, Yaofo, Wen, Zhiquan, Hu, Jinwu, Deng, Zeshuai, Chen, Deyu, Zhang, Shuhai, Chen, Renjie, Lian, Zihao, Xu, Shoukai, Dai, Gang, Zhang, Yunbei, Luo, Wei, Zhang, Yifan, Tan, Mingkui, Deng, Cheng；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.01679](https://arxiv.org/abs/2609.01679)。

该综述统一 test-time adaptation、learning 与 scaling，区分模型状态更新和额外推理资源，并覆盖语言、多模态、机器人等领域。它能澄清哪些方法属于持续 post-training、哪些只是搜索；但没有新实验，不应和机制论文同级。

### LoRA-TSD: Tangent-Space Spectral Descent for LoRA via Muon-Style Updates

**论文信息：** Andriianov, Dmitrii, Veprikov, Andrey, Beznosikov, Aleksandr；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02734](https://arxiv.org/abs/2609.02734)。

LoRA-TSD 在固定秩流形切空间内做 Muon 式谱范数最速下降，retraction 比 truncated-SVD 最多便宜 2.8 倍，并给 LoRA-Pro/TSD 的全局收敛保证；三种规模模型、六项任务均胜其它 LoRA optimizer。需要看到 wall-clock 与 full-FT 对照再判断实用性。

### TaRA: Training-Aware Low-Rank Adaptation Initialization

**论文信息：** Kim, Taehyeon, Park, Eunhyeok；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02639](https://arxiv.org/abs/2609.02639)。

TaRA 让 LoRA 初始化诱导的梯度尽量逼近 full-rank 梯度，以几乎零额外开销改善训练初期可达方向；多任务均超过既有初始化。方法简洁，但摘要没有模型、数据、绝对增益和 seed，适合记下后等待完整复现。

### NE-R1: Enhancing Named Entity Recognition Model via Reinforcement Learning

**论文信息：** Chen, Meixuan, Li, Hehan, Zhao, Ruizhi, Lu, Xin, xu, peizhi, Qian, Liwei, Meifang, LI, li, shuanglong, Liu, Hanmeng, Pei, Xin, Ma, Yanbiao；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-03；[arXiv:2609.02366](https://arxiv.org/abs/2609.02366)。

NE-R1 先多任务 instruction tuning，再用含准确率与 retrieval benefit 的 RL reward 学习 NER 何时检索；域内平均 F1 +2.52%、跨域 +1.18%。它把工具边界写进后训练，但任务较窄，检索成本和 reward trade-off 需看详细消融。

## 可留意 / 可跳过

- **[Bonded Recourse for Smart-Contract Settlement of Compensable Agent Side Effects](https://arxiv.org/abs/2609.01939)**（2609.01939）：可赔偿 Agent side-effect 的智能合约担保；记住 bonded recourse，跳过原因是法律/链上结算重于 Agent correctness。
- **[SpiderSapien: Client-Centric Web Crawler and Security Scanner](https://arxiv.org/abs/2609.02532)**（2609.02532）：client-centric Web crawler 与安全 scanner；有执行面但缺少与 coding-agent benchmark 的直接比较。
- **[Multi-Agent Retrieval-Augmented Generation for Efficient Cloud Knowledge Base Search in Telecom SNOC Environment](https://arxiv.org/abs/2609.01618)**（2609.01618）：电信云知识库的多 Agent RAG；属于具体企业检索应用，泛化证据有限。
- **[Hybrid Retrieval-Augmented Generation with Knowledge Graph Expansion, RRF Fusion, and Per-Chunk Grounded Evaluation for Enterprise Document Search](https://arxiv.org/abs/2609.01617)**（2609.01617）：向量、BM25、KG 融合并做 per-chunk grounded check；89.6% grounding 有参考性，但主要是单域 RAG 工程。
- **[CAPTCHAs in the Agentic Era: Solvers That Learn from Every Encounter](https://arxiv.org/abs/2609.02393)**（2609.02393）：CAPTCHA Agent 从每次 encounter 持续学习；可关注在线经验更新，当前和软件变更主线较远。
- **[SchedBlame: Who Ran While You Waited? Culprit-Attributed CPU Contention for Containers on Stock Kernels](https://arxiv.org/abs/2609.02052)**（2609.02052）：eBPF 在 stock kernel 上归因容器 CPU contention，84 容器场景约 1% Redis 吞吐损失；是很好的 runtime observability，但不是 Agent 论文。
- **[Agentic Settlement Protocol: An Application Profile for Refundable, Delayed-Fulfilment Agent Commerce on Stablecoin Rails](https://arxiv.org/abs/2609.02208)**（2609.02208）：可退款、延迟履约的 Agent commerce protocol；适合关注 effect/settlement 语义，不必按通用 Agent 方法深挖。
- **[Examining the Vulnerability of Multi-Agent Medical Systems to Human Interventions for Clinical Reasoning](https://arxiv.org/abs/2609.02191)**（2609.02191）：临床多 Agent 对人类干预的脆弱性；安全问题真实，但医疗域、判分和风险结构高度专用。
- **[VIPS: Vehicle-Infrastructure Cooperative Planning Benchmark via Pseudo-Simulation](https://arxiv.org/abs/2609.02462)**（2609.02462）：VIPS 用伪仿真评测车路协同规划；长程 Agent benchmark 邻接，但非 coding/tool workflow。
- **[Entangled Representations Amplify Collateral Damage in Unlearning](https://arxiv.org/abs/2609.02285)**（2609.02285）：unlearning 的 entangled representation 会放大 collateral damage；主题重要，但对象与本次语言模型证据链较弱。
- **[Federated LoRA Adaptation of BiomedCLIP Across Four International Chest X-Ray Cohorts](https://arxiv.org/abs/2609.02101)**（2609.02101）：四国胸片上 federated LoRA 适配 BiomedCLIP；可记跨机构 PEFT，方法更偏医疗应用。
- **[SpeakPay: Domain-Adaptive LoRA Fine-Tuning of Whisper for Low-Resource Nepali Financial Speech Recognition](https://arxiv.org/abs/2609.01737)**（2609.01737）：尼泊尔金融语音的 Whisper LoRA；是低资源适配 case，不含新的通用 post-training 机制。
- **[Choosing a PEFT Variant for Per-Patient Dysarthric ASR: A Single-Speaker Case Study on Two ASR Bases](https://arxiv.org/abs/2609.02735)**（2609.02735）：单说话者构音障碍 ASR 的 PEFT variant 对比；样本与模型都太窄，适合查实现而非深读结论。
- **[SCULPT: Training Edge Vision Models for Post-Training Quantization Readiness](https://arxiv.org/abs/2609.01743)**（2609.01743）：训练时压制 activation skew/kurtosis 以便后续低比特 PTQ；关注 deployment readiness，但不是 LLM 专属。
- **[GDB-Reward: From Evaluation Metrics to Training Rewards for Graphic Design](https://arxiv.org/abs/2609.02813)**（2609.02813）：把图形设计指标变成冻结生成器的 RL prompt reward；优化的是 prompt policy，不是模型权重。
- **[IDEEA: training-free Input-Dependent stEEring via Activation cluster matching](https://arxiv.org/abs/2609.02089)**（2609.02089）：activation cluster 做 input-dependent steering；训练免费、可部署，但不属于 post-training。
- **[Do Cantonese-Adapted Language Models Better Predict Cantonese Reading? A Cross-Model Eye-Tracking Evaluation](https://arxiv.org/abs/2609.02163)**（2609.02163）：评估粤语适配模型能否预测阅读眼动；主要是行为评估而非新训练方法。
- **[NeoMME: A Single-Tower Multimodal-Native Multilingual Foundation Encoder for Efficient Fine-Tuning and Inference](https://arxiv.org/abs/2609.01657)**（2609.01657）：多模态多语 encoder 的高效 fine-tuning；模型工程完整，但和本日核心机制重复度高。
- **[Debias-SparseGPT: Bias-Aware Pruning for Large Language Models](https://arxiv.org/abs/2609.02496)**（2609.02496）：bias-aware SparseGPT pruning；关注压缩后的公平性，但缺少 Agent/RL 维度。

## 横向比较

| 论文 | 主线 | 问题与方法新意 | 验证证据 | 可信度 / 可复现性 |
|---|---|---|---|---|
| [2609.01769](https://arxiv.org/abs/2609.01769) | Coding/Agent | 把自动程序修复从芯片设计期推进到量产后的固件补丁：先从真实提交史抽取修复字典，再定位、实例化并验证安全 workaround。 | PDF 深读；见对应实验数字 | 中高：边界明确 |
| [2609.02272](https://arxiv.org/abs/2609.02272) | Coding/Agent | PaperCompiler 把论文证据编译成带来源、状态、所有权和跨文件约束的仓库级 specification，减少 paper-to-code 时的算法降级。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02690](https://arxiv.org/abs/2609.02690) | Coding/Agent | ACLE-MCP 把 OAuth 权限、当前 workload attestation、sender proof 与一次工具调用绑定成短租约，在 provider 入口做不可绕过验收。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02564](https://arxiv.org/abs/2609.02564) | Coding/Agent | 看似功能正确、没有显式注入语句的第三方 skill，也能通过累计语义线索悄悄改变 Agent 的产品或依赖选择。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02774](https://arxiv.org/abs/2609.02774) | Coding/Agent | CodePoisonRAG 说明检索库里语义贴近、功能像真的脆弱代码，会被 RACG 取回并显著牵引最终生成，即使输出表面完成任务。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02067](https://arxiv.org/abs/2609.02067) | Coding/Agent | ToolGate 要求基准题先证明“无工具模型会失败、工具 Agent 能成功、答案可执行验证”，再允许题目进入发布池。 | PDF 深读；见对应实验数字 | 中高：边界明确 |
| [2609.02783](https://arxiv.org/abs/2609.02783) | Coding/Agent | EarlyEval 从部分轨迹预测 Agent 最终成败，在不明显改变榜单分数与排名的前提下提前终止昂贵评测。 | PDF 深读；见对应实验数字 | 中高：边界明确 |
| [2609.01660](https://arxiv.org/abs/2609.01660) | Coding/Agent | 长程 Agent 的可靠性会随交互步数出现可复现衰减，而且主要不是上下文长度本身，而是状态更新与累积决策负担。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02246](https://arxiv.org/abs/2609.02246) | Coding/Agent | 当 optimizer 反复追逐 LLM judge 时，judge 不能拥有最终发布权；真正不可协商的 schema、执行与隔离门必须由确定性检查掌权。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.01865](https://arxiv.org/abs/2609.01865) | Coding/Agent | 代码 embedding 能找到近邻，却经常把仅一处编辑、可执行错误的 near-clone 排在正确实现之前；语义相似不是功能正确。 | PDF 深读；见对应实验数字 | 中高：边界明确 |
| [2609.01836](https://arxiv.org/abs/2609.01836) | Coding/Agent | 长期记忆若把授权历史总结错，会把不存在的许可洗白成持久状态；执行 Agent 随后几乎总会照做。 | PDF 深读；见对应实验数字 | 中高：边界明确 |
| [2609.02057](https://arxiv.org/abs/2609.02057) | Coding/Agent | 即使拿不到 logits，也能用可观察的动作—环境轨迹与“第一个未纠正关键错误”监督，预测 Web Agent 前缀是否已偏航。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02035](https://arxiv.org/abs/2609.02035) | Coding/Agent | skill 与用户请求单独看都正常时，它们之间被设计过的语义匹配仍能劫持 selector，把目标选择率从 15.2% 推到 63.5%。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02217](https://arxiv.org/abs/2609.02217) | Coding/Agent | SkillGLoW 把长期经验压缩到“程序族”而非全局大文档或逐任务碎片，并用真实执行 gate 决定技能是否入库。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02042](https://arxiv.org/abs/2609.02042) | Post-Training | SPACE 从成功轨迹诱导程序化 skill，用其子技能边界监督 variable-length action chunk，让 Agent 少决策而不盲目长承诺。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02786](https://arxiv.org/abs/2609.02786) | Post-Training | SafeEvolve 用同一批 on-policy 轨迹同时演化可回滚 harness skill/prompt，并通过 SFT+RL 把安全知识内化到模型 policy。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02417](https://arxiv.org/abs/2609.02417) | Post-Training | 在终局 verifier 只能确认整条链是否成功时，credit 覆盖多少因果步骤往往比精确瞄准哪个步骤更重要；稀疏“聪明归因”可输给均匀 dense reward。 | PDF 深读；见对应实验数字 | 中高：边界明确 |
| [2609.02849](https://arxiv.org/abs/2609.02849) | Post-Training | 22,000 道题、合成推理 SFT、RL 与反馈式 GenCorrect 共同把 30B-A3B 模型从 IOI 2025 的 130 分推到 468 分；更大系统在真实 IOI 2026 超过最高人类分数。 | PDF 深读；见对应实验数字 | 中高：边界明确 |
| [2609.02817](https://arxiv.org/abs/2609.02817) | Post-Training | Cliff 只让 teacher 找出 rollout 的第一个错误，把此前 token 赋正 advantage、此后赋负 advantage，用粗 outcome 构造细粒度 process reward。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02253](https://arxiv.org/abs/2609.02253) | Post-Training | APEx 让 Executor、Distiller、Planner 交替接受 GRPO，把实例轨迹与类别技能闭环起来，并在测试时用 skill-guided RL 自适应。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02015](https://arxiv.org/abs/2609.02015) | Post-Training | instruction-tuning 数据的输出格式可让未训练 base accuracy 相差最多 70 点，并让 selector 把“格式匹配”错当内容质量。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.01947](https://arxiv.org/abs/2609.01947) | Post-Training | 先用 off-policy GRPO 强化 4B teacher，再让 1B student 在自己的排名上接收 teacher soft reward，蒸馏因此覆盖学生真实会访问的状态。 | PDF 深读；见对应实验数字 | 中高：边界明确 |
| [2609.02273](https://arxiv.org/abs/2609.02273) | Post-Training | CoMerge 不直接平均专家参数，而把 naive merge 暴露的冲突行为当 hard negative，只学习 1,445 个 tensor-wise 系数做 preference optimization。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.01658](https://arxiv.org/abs/2609.01658) | Post-Training | PRO-Step 用 tree search 与 process reward model 找出检索推理的首个局部错误，再从该状态生成修正轨迹并做偏好优化。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |
| [2609.02548](https://arxiv.org/abs/2609.02548) | Post-Training | MT-SDPO 逐样本验证多个领域 teacher 谁真的答对，再把所有合格反馈聚合到一个 student，避免按领域标签盲选老师。 | PDF 深读；见对应实验数字 | 中：需跨环境复验 |

## 我的判断

- **创新性：A-。** 今天不是单点算法爆发，而是接口、轨迹、授权、reward 和 teacher selection 的问题定义明显变精细。Cliff、coverage credit、PaperCompiler、ExecRetrieval 与 EAL-Bench 都提出了能改变实验设计的单位。
- **实用价值：A。** provider gate、deterministic acceptance、event-sourced authorization、skill commit gate 和 execution-verified distractor 都能直接变成系统控制；但不少方案需要额外 verifier、重复 rollout 或白盒环境。
- **严谨性：B+。** 多篇论文使用配对控制、held-out scaffold、预注册预测、bootstrap/多 seed 或明确 negative result；与此同时，专有模型、LLM judge、模拟工具环境、单领域数据仍是主要证据上限。
- **推荐优先级：** 先读 `2609.01865`、`2609.02417`、`2609.02015`、`2609.02817`、`2609.01836`，它们最能改变如何做对照与解释结果；再读 `2609.02272`、`2609.02783`、`2609.02786`、`2609.02849`，看系统怎样把原则落实为端到端证据。

最大的未确定性不是模型是否还能涨点，而是这些 verifier、judge、memory schema 和 provider contract 在跨模型、跨 harness、跨真实组织后是否仍保持同样含义。今天最稳的结论是：**可靠性不来自更多自我反思，而来自把关键状态、权限和反馈变成可验证、可拒绝、可回放的对象。**
