---
title: "别再相信一句 Done：8 月 31 日 arXiv 的证据闭环、可撤销 Agent 与细粒度后训练"
date: "2026-09-01"
description: "8 月 31 日的新论文把 Agent 可靠性推进到来源、状态、恢复与控制层证据，也把 post-training 推进到 verifier 信用、teacher 对齐和可验证程序。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Post-Training", "RLHF", "RLVR", "软件演化", "Agent安全"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-slate-950 via-blue-950 to-amber-950"
---

8 月 31 日这一批论文最值得读的地方，不是又出现了多少 Agent 与 RL 缩写，而是越来越多工作开始拒绝把最终一句“完成”当作证据。coding-agent 线把可靠性拆到用户请求的信息组成、工具参数来源、修改后的状态重验、Controller 的停止决定、插件共同演化和自修改的可恢复性；post-training 线则继续追问 reward 究竟应归给哪条 verifier 事实、哪个代码 span、哪次上下文编辑，以及 teacher 的方向是否真的与 outcome 一致。两条主线都很充实，因此本期是完整 digest，不是边缘短评。

本轮以 arXiv 官方 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG 为核心，并补查 cs.IR、cs.CV、cs.CR、cs.OS 的 `pastweek` 页面，九类页面均定位到 **Mon, 31 Aug 2026**。合并 New 与 Cross submissions 后得到 **416 篇唯一条目**，独立筛选两条主线后纳入 **150 篇**：coding-agent / software-change 83 篇，post-training 70 篇，其中 3 篇同时属于两条主线。31 篇强相关论文全部从 `https://arxiv.org/pdf/<id>` 下载，完成 `%PDF`、大于 20KB、`pdftotext -layout` 与首页渲染检查；其余 48 篇中相关和 71 篇可留意项按官方元数据、摘要与必要的全文定位分层。

## 今日脉络

第一条脉络是 **证据必须跟着状态变化**。RealSWE 证明输入信息组成会改变补丁结果；工程 Agent 修改参数后，旧仿真不再授权新状态；datasheet 抽取即使值正确，也可能根本没有打开源文档。可靠性评测正在从“答案像不像对”转向“哪条证据在何时授权哪项声明”。

第二条脉络是 **权限、来源与恢复要在模型外部落地**。ROPE 和 OBPE 分别约束参数来源与数据可见范围，Recognition Without Enforcement 直接展示模型识别伪权威却仍执行的裂缝；EvoUndo 则把自修改能否跨反事实状态撤销变成 verifier 任务。prompt 可以帮助行为，但不能替代安全边界。

第三条脉络是 **long-horizon Agent 的控制层本身需要 benchmark**。LoopArena 把 Controller 与 Worker 分开，CURA 用只读遥测提前报警，VICT 从终局 verifier 追溯动作信用，ContextPilot 给上下文编辑单独分配 advantage。模型是否会写代码，只是完整 Agent 能力的一部分。

第四条脉络是 **post-training 的核心不再只是“加 RL”，而是约束信号的方向、粒度与验证范围**。RA-OPD 过滤与 outcome 方向冲突的 teacher guidance，DA3PO 修正困难 prompt 的优势放大，RCCA 把 rubric 归因到代码 token，PLVR 甚至把可验证推理移到显式程序。当天最稳定的进展来自更可信的 credit interface，而不是更花哨的优化器名。

## 强相关论文深读

### 1. Grounded Checklist Partial Credit for Agent Skill Trajectories

**论文信息**：*Grounded Checklist Partial Credit for Agent Skill Trajectories*；Qin, Suliu, Yin, Lu, Wang, Xilu；[arXiv:2608.27487](https://arxiv.org/abs/2608.27487)；Software Engineering (cs.SE)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：对长程 Agent 而言，二元 pass/fail 会同时漏掉有价值的局部进展和被技能引入的隐性退化；可信的 partial credit 必须落到执行日志与官方 verifier。

**为什么值得推荐、方法怎么工作**：GCPC 先由人定义可复用规则，再让 LLM 按任务指令和官方 verifier 实例化 checklist；判分器只能使用轨迹日志中的证据，缺证据时必须 abstain，最后由脚本把官方终局结果并入分数。Figure 1 的重点是把人类治理、任务级实例化、日志证据和确定性终局检查分开，避免 judge 自己补全未发生的步骤。

**关键实验、局限与当天主题**：4,455 条去重 SkillsBench 轨迹上，GCPC 区分官方 PASS/FAIL 的 AUC 为 0.689，高于整体式 judge 的 0.619；96 条人工复核也更贴近人类进度判断。1,946 组有/无 skill 配对中，879 组二元结果未变，却有 20.9% 的局部分数提升超过 0.10、18.7% 同幅退化。局限是 checklist 仍由 LLM 实例化且人工集较小；它能证明可观察进展，不能证明未被 checklist 覆盖的语义正确性。

### 2. ROPE: Routed Origin Policy Enforcement against Indirect Prompt Injection

**论文信息**：*ROPE: Routed Origin Policy Enforcement against Indirect Prompt Injection*；Ma, Xinhang, Xiao, Chaowei, Yeoh, William, Zhang, Ning, Vorobeychik, Yevgeniy；[arXiv:2608.27496](https://arxiv.org/abs/2608.27496)；Cryptography and Security (cs.CR)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：间接提示注入不应继续靠模型猜哪句可信，而应把能进入状态改变型工具参数的数据来源变成可验证的 origin policy。

**为什么值得推荐、方法怎么工作**：ROPE 给值附着不可伪造的来源，只允许用户、用户明确点名的来源或权威记录中的值流入受保护参数；敏感字段集合先审计，运行时 admission 只做确定性来源检查，LLM 只处理攻击者接触不到的可信用户请求。Figure 1 将来源路由、参数 guard 与工具执行放在同一边界，论文还证明改写注入文本不会改变准入结论。

**关键实验、局限与当天主题**：四个 Agent 模型与开放式套件上，ROPE 把攻击成功率压到 1.6%--2.6%，同时保留无防御系统 82%--100% 的干净任务效用；可击败既有系统防御的长程攻击在 ROPE 下为 0 成功。可信边界是 origin 标注、敏感参数枚举和工具实现必须正确；从可信记录推断出的组合信息、未受 guard 的字段及业务语义越权仍可能漏过，因此这是结构性最小权限，不是完整 noninterference。

### 3. WM-R1: Training GUI Agents to Reason and leverage World Models with Reinforcement Learning

**论文信息**：*WM-R1: Training GUI Agents to Reason and leverage World Models with Reinforcement Learning*；Han, Yu, Qian, Tianwen；[arXiv:2608.27508](https://arxiv.org/abs/2608.27508)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：GUI Agent 可以在世界模型里完成全部 RL rollout，但只有同时训练“何时模拟、如何利用模拟结果和何时停止”才会超过把模拟器当推理插件。

**为什么值得推荐、方法怎么工作**：WM-R1 用冻结的 Code2World 代替真实 Android 产生状态转移，策略在每步可调用世界模型预演候选动作，再由多维规则奖励联合约束任务成功、轨迹长度和模拟器使用效率。Figure 1 给出 world-model rollout、GRPO 更新和推理内预演的闭环；Table 2 的消融把链式推理、世界模型观测与调用奖励分别移除，说明增益不是单一额外调用带来的。

**关键实验、局限与当天主题**：7B 模型在 AndroidWorld 达 39.8%，比 UI-R1-7B 高 9.0 点；训练曲线 Figure 3 显示第 15 个 episode 达到该水平且方差更低。去掉 CoT 后 AndroidWorld 和困难集分别下降 5.2 与 4.9 点；3B 模型在 ScreenSpot-Pro 的图标 grounding 提升 15.1 点。局限是训练完全依赖世界模型，模拟误差会被策略吸收；任务还过滤了零样本成功率高于 80% 或低于 5% 的样本，真实长尾与动态应用覆盖仍不足。

### 4. If Agents Were Angels, No Governance Would Be Necessary: Out-of-Band Policy Enforcement at a Trusted Tool Boundary

**论文信息**：*If Agents Were Angels, No Governance Would Be Necessary: Out-of-Band Policy Enforcement at a Trusted Tool Boundary*；Millstone, Marc, Akidau, Tyler, Brüderl, Johannes, Pekker, Marat；[arXiv:2608.27646](https://arxiv.org/abs/2608.27646)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：持有人类凭据的 Agent 不应自动继承人类全部可见数据；可信工具边界要在请求前缩小查询、在响应后删字段，并限制 Agent 自己扩大授权。

**为什么值得推荐、方法怎么工作**：OBPE 把 typed operation、resource、query、record、field 与 write argument 逐层纳入外部策略；数据所有者设定最大 grant，Agent 只能收窄。Figure 2 展示从类型化调用到策略计划、后端执行与响应过滤的完整路径，Table 1 明确哪些机制提供精确保证、哪些只是 best effort。语义 gate 还能根据参数值或外部状态暂停已授权调用。

**关键实验、局限与当天主题**：Jira/ServiceNow 模拟环境的 3,621 次试验中，trace failure 从 57.6% 降至 0.2%，cluster-weighted 降幅为 41.2 点，95% CI [27.7,54.9]；虽然 fulfillment 从 79.1% 降至 60.9%，安全且有用的完成率反而提高 21.8 点。论文诚实报告模型可从过滤后的行数重建秘密：单次字段整形不等于非干扰，持久审批、跨时聚合泄露和完整写控制仍在评估外。

### 5. Why Didn't It Check? Unsupported Final Claims and Their Repair in Two Tool-Equipped Language Models

**论文信息**：*Why Didn't It Check? Unsupported Final Claims and Their Repair in Two Tool-Equipped Language Models*；Bronder, Justin；[arXiv:2608.27768](https://arxiv.org/abs/2608.27768)；Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：工具型模型的“没检查就下结论”不是不可修复的知识缺失，而是可在精确复制状态中用最小证据干预验证的决策失误。

**为什么值得推荐、方法怎么工作**：作者先从可见证据与最终声明定义 unsupported occurrence，再把发生时的完整上下文复制成 matched replay；两种工具回复长度和结构相同，只改变一个响应码，分别提供决定性证据或无信息控制。自动规则随后只在证据确实缺失时追加调用。这个设计把自然发生、条件修复与提示导致的行为改变分开，而不是事后挑错。

**关键实验、局限与当天主题**：Qwen3-32B 的 512 次首答中出现 33 个 unsupported claim；决定性证据修复 33/33，无信息响应修复 0/33，支持原答案的证据保持 33/33。另一组 64 例中自动检查增加 21 次调用，修正全部 10 个错误且未伤害正确答案；同设置 Gemma 4 则 512/512 都先调用工具。局限是两个合成任务族、两个固定模型配置，不能估计真实部署频率，但这种局部因果配对比泛化性口号更可信。

### 6. ContextLeak: Exfiltrating LLM Agent Context via Malicious Tools

**论文信息**：*ContextLeak: Exfiltrating LLM Agent Context via Malicious Tools*；Jia, Yuqi, Wang, Ruiqi, Li, Patrick, Hu, Yuepeng, Li, Peinian, Gong, Neil；[arXiv:2608.27800](https://arxiv.org/abs/2608.27800)；Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：恶意工具不只争取被选择，还能通过工具描述诱导 Agent 把用户提示、轨迹和工具表主动塞进参数；攻击面位于 schema 与调用论证之间。

**为什么值得推荐、方法怎么工作**：ContextLeak 用攻击 LLM 生成恶意工具名与描述，在模拟 shadow users 上以 RL 优化两个目标：让受害 Agent 选择工具，并让其把运行时上下文作为参数传入。训练奖励直接围绕外泄内容，而非只优化工具可见性；随后在 shadow/victim 上下文显著不同的条件下测试迁移。论文的流程图把选择、参数构造和外部发送三个必要条件拆开。

**关键实验、局限与当天主题**：实验表明 ContextLeak 在跨用户上下文迁移时仍保持高攻击效果，并显著超过改造后的既有恶意工具攻击；这说明只扫描工具实现或阻止网络发送不足以覆盖参数侧泄露。可信度风险是 shadow context、工具竞争集合和 Agent 提示会强烈影响结果，且攻击本身依赖 RL 生成器；防御结论应落到最小参数披露、schema 审计和出站控制，而不是假定模型会自觉保密。

### 7. CURA: Certified Runtime Alarms for Computer-Use Agents

**论文信息**：*CURA: Certified Runtime Alarms for Computer-Use Agents*；Kumar, Divake, Tayebati, Sina, Naik, Devashri, Rios, Amanda Sofie, Ahuja, Nilesh, Tickoo, Omesh, Krishnan, Ranganath, Trivedi, Amit Ranjan；[arXiv:2608.27808](https://arxiv.org/abs/2608.27808)；Artificial Intelligence (cs.AI) ; Computer Vision and Pattern Recognition (cs.CV); Machine Learning (cs.LG)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：Computer-use Agent 的自报在失败时几乎失效，但只读 harness telemetry 可以在不调用额外模型的情况下提前发出有假警率证书的告警。

**为什么值得推荐、方法怎么工作**：CURA 把 feasibility gate、planner 与 GUI executor 的可见遥测转成序贯 CUSUM 检验；部署者先选择假警预算 alpha，再在线累计风险信号并在越界时升级给昂贵 overseer。Figure 1 区分事前 gate、执行中报警和事后 composite，避免把 retrospective AUROC 当实时能力。系统不读隐藏状态、不改提示，也不依赖 Agent 说自己失败。

**关键实验、局限与当天主题**：361 个 OSWorld 任务中，基础管线均分 82.9，但 71 次失败里 64 次仍声称成功。alpha=0.10 时 CURA 检出 42.3% 失败，实际假警率 0.066，中位提前 31 步；用 38 次 frontier oversight 恢复 23/70 个失败，最终均分 86.8、full-solve 84.5%。证书只约束假警，不保证召回；事后 composite 0.828 AUROC 对 token baseline 的优势也不显著（p=0.101），论文没有把相关性包装成万能 oracle。

### 8. RealSWE: A Compositional Evaluation of Coding Agents under Realistic User Requests

**论文信息**：*RealSWE: A Compositional Evaluation of Coding Agents under Realistic User Requests*；Kim, Gyuhyeong, Gwon, Hyojung, Kim, Jeonghyeon, Shim, Kyuhong, Lee, Sunjae；[arXiv:2608.27831](https://arxiv.org/abs/2608.27831)；Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：SWE-bench 的长而正式 issue 高估了 Agent 面对真实短请求时的能力，且信息组成会改变模型排序。

**为什么值得推荐、方法怎么工作**：RealSWE 先以六类信息和四类语言风格标注 SWE-chat、SWE-bench Verified/Pro，再从同一底层任务与同一 gold patch 构造 381 个多变体家族；每个家族只改变提供的信息和表述风格。这样的 compositional design 能在补丁难度不变时测量 request realism，而不是比较两个不同题集。

**关键实验、局限与当天主题**：真实提示中 88% 只有问题描述或少量补充，而 benchmark 只有 7%；87% 真实请求是随意语气，benchmark 却有 94% 正式表述。七个模型在真实化输入下 resolution rate 平均下降 6.4 点，并可能重新排序；desired behavior 与 motivation 显著有帮助，环境信息和复现步骤只增 token、没有可测收益。边界是所有变体仍来自 SWE-bench gold task，尚未覆盖真实用户持续澄清、私有仓库与模糊验收。

### 9. openJiuwen: Beyond Static Harnesses for Long-Horizon Coding Agents

**论文信息**：*openJiuwen: Beyond Static Harnesses for Long-Horizon Coding Agents*；openJiuwen Team, Yu, Tao, Zhang, Xinyu, Chen, Qianqian, Xiang, Xiaoneng, Kwangyang, Chia, Huang, Xingchen, Chen, Ran, Ding, Yangkai, Wang, Zheng, Hong, Yeo Boon, Gan 等；[arXiv:2608.27969](https://arxiv.org/abs/2608.27969)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：长程 coding-agent harness 的价值不只是塞更多工具，而是让能力组合与基于新证据的运行时改写共享一套执行语义。

**为什么值得推荐、方法怎么工作**：openJiuwen 用 shared execution substrate 与 Rail 组合单 Agent、delegated sub-agent 和 Swarm Flow；模型策略保持固定，框架根据语义诊断、执行结果、任务进度与上下文相关性调整反馈和控制。Figure 1 强调 Structural Composability 与 Runtime Adaptivity 两层：前者让编排可重用，后者让 evolving repository evidence 真正改变下一步。

**关键实验、局限与当天主题**：在 SWE-bench Verified 与 Terminal-Bench 2.1 上分别达到 82.6% 和 87.19%，比论文选取的官方 leaderboard 最强点估计高 3.4 与 3.39 点。强结果说明 harness 是能力的一部分，但也必须谨慎：排行榜点估计可能使用不同模型、预算和时间窗口，无法单独归因于 Rail 或 adaptive control；需要公开轨迹、matched-budget 消融和多次运行才能确认可迁移增益。

### 10. Compared to What? A Human-Anchored Security Benchmark for LLM-Generated Infrastructure-as-Code

**论文信息**：*Compared to What? A Human-Anchored Security Benchmark for LLM-Generated Infrastructure-as-Code*；Shaw, Animesh；[arXiv:2608.28021](https://arxiv.org/abs/2608.28021)；Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI); Multiagent Systems (cs.MA); Software Engineering (cs.SE)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：评价 LLM 生成 IaC 的安全性必须先与同规模人类模板匹配，否则漏洞密度主要测的是资源数而不是作者类型。

**为什么值得推荐、方法怎么工作**：GenIaC-SecBench 构造 100 个按架构复杂度分层的部署场景，收集 12 个模型配置的 1,196 个产物，用 Checkov、Trivy、KICS 三个 policy engine 扫描；再以同一工具链扫描 634 个人工模板，并按 declared-resource count 做 size matching。Table 1 的贡献不是又一个 raw count，而是人类锚点、复杂度分层与完整重生成脚本。

**关键实验、局限与当天主题**：漏洞密度与产物大小显著负相关（Spearman rho=-0.55，p<1e-77）；匹配规模后，所有模型配置仍为人类密度的 3.21--3.87 倍，单资源任务差距 4.9 倍、20 个以上资源缩到 1.4 倍。vendor extended thinking 比提示式 CoT 低 12.0% 漏洞（p=0.0013），后者与普通生成无差异。静态扫描不等于可利用漏洞，人工模板也可能有选择偏差，但它纠正了最常见的比较基线错误。

### 11. VICT: Verifier-Instrumented Credit Tracing for Long-Horizon LLM Agent Reinforcement Learning

**论文信息**：*VICT: Verifier-Instrumented Credit Tracing for Long-Horizon LLM Agent Reinforcement Learning*；Li, Pengcheng, Zhang, Zhengyang, Zhang, Dongxu, Huang, Sui, Ma, Shaohua；[arXiv:2608.28128](https://arxiv.org/abs/2608.28128)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：既然 terminal verifier 已经知道哪些事实组成成功，就不该把它压成一个标量再让每个动作背同样的奖励。

**为什么值得推荐、方法怎么工作**：VICT 把 verifier 暴露为可执行或有证据支撑的 atoms，再通过 dependency-valid proof edges 把 atom 追溯到真正写入、揭示或提交事实的动作；证据不完整时 abstain，只重分配 group-relative advantage，不改变终局 reward，也不在推理时调用 verifier。Figure 1 与 Table 3 展示 atom、witness、proof gate 和 advantage tensor 的接口。

**关键实验、局限与当天主题**：Qwen3-8B 上，VICT 比 outcome-only GRPO 在 ALFWorld 平均成功率高 18.2 点、WebShop strict success 高 24.9 点；Qwen2.5-7B 达 93.7% 与 83.6%，对应 +16.1、+17.5 点。运行开销约 11.9%--16.7%；消融排除了 dense atom reward、最终动作、时间邻近和稀疏性本身。局限是 verifier 必须能提供忠实原子和因果边，错误 witness 会把精细信用变成精细误导，开放式软件任务未必有这类接口。

### 12. Post-Edit Re-Verification in Simulator-Backed Engineering Agents: A Controlled Comparison of Verification-Cadence Guidance

**论文信息**：*Post-Edit Re-Verification in Simulator-Backed Engineering Agents: A Controlled Comparison of Verification-Cadence Guidance*；Zhu, Qingchuan, Tong, Shuyue, Ren, Pengju；[arXiv:2608.28147](https://arxiv.org/abs/2608.28147)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：修改后的工程状态会让旧仿真证据过期；是否重新验证应当成为显式协议，而不是期待模型自发意识到证据失效。

**为什么值得推荐、方法怎么工作**：研究在 DWSIM 后端中控制阀门压力修改，保持所有 verification-relevant facts 相同，仅比较保留或删除“实质修改后请求新仿真”的 cadence guidance；没有硬 gate。五个 Qwen 模型、八个合成案例、每格三次 live API 执行，使估计对象严格限定为 instruction-conditioned adherence。

**关键实验、局限与当天主题**：每个条件 120 个 slot：Cadence-Guided 有 94 次重验证，Cadence-Omitted 只有 32 次；cadence violation 为 26 对 87，bounded final success 为 95 对 35。一个 35B 模型在两组中几乎都不重验证且零成功，说明更大并不自动遵循。局限同样重要：这不是模型自发 stale-evidence detection，场景只有连续参数调节和合成任务；结论是协议有用，不是 prompt 已解决工程验证。

### 13. LoopArena: Benchmarking Models as Runtime Controllers for Loop Engineering

**论文信息**：*LoopArena: Benchmarking Models as Runtime Controllers for Loop Engineering*；Wang, Yi, Zhang, Haopeng, Huang, Chengxiang, Dai, Rui, Liu, Kaikui, Koniusz, Piotr, Chu, Xiangxiang；[arXiv:2608.28281](https://arxiv.org/abs/2608.28281)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：长程 coding-agent 的 Worker 能力与 Controller 的循环控制必须分开评估，否则一次失败无法判断是执行不会还是循环过早停止、信错进度或漏做验证。

**为什么值得推荐、方法怎么工作**：LoopArena 固定 Worker，把被测模型设为 Controller：每轮只看结构化运行摘要，选择下一份 Loop Contract、要求继续验证或停止。Type I 用执行验证的问题测下一步决策，Type II 在任务切片上反复控制，Type III 从原始状态跑完整配对任务。Figure 1 的三层设计用不同成本逐步逼近真正 end-to-end loop engineering。

**关键实验、局限与当天主题**：完整任务最佳 Strict Success Rate 仅 24.69%，说明控制层远未可靠；不同 Controller 平均把估计推理成本降低 64.4%，Type II 与主 Core 排序的 Spearman rho=0.9747，支持廉价切片作为代理。局限是排序依赖固定 Worker、摘要 schema 和 contract 集，不能外推到 Controller 同时改 harness 或 Worker 的自适应系统；成本还是估算而非统一账单。

### 14. EvoUndo: Recoverability-Constrained Self-Evolution for LLM Agent Harnesses

**论文信息**：*EvoUndo: Recoverability-Constrained Self-Evolution for LLM Agent Harnesses*；Sah, Tanmay, Sah, Dolly, Jain, Harshul, Sah, Tanya；[arXiv:2608.28363](https://arxiv.org/abs/2608.28363)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：Agent 自我修改能提升当下能力，却可能在另一状态无法撤销；可靠 self-evolution 的基本单位应包含 counterfactual recovery witness。

**为什么值得推荐、方法怎么工作**：EvoUndo 把 prompt、tool、middleware、resource 与 harness mutation 表示成带恢复语义的修改，跨反事实状态独立验证；先诊断原 recovery language 的表达力与地址 grounding，再用 2x2 intervention 分离两类瓶颈。论文 Figure 1 把 capability gain、持久副作用、恢复程序和外部 verifier 组成同一门槛，而不是用“再提示一次”当 rollback。

**关键实验、局限与当天主题**：600 个未见 one-shot 任务中找到 197 个能力提升但不可恢复的 mutation，常规修复为 0/197。确定性 oracle 在原语言恢复 48/197，扩展 calculus 后为 191/197；精确地址使可表达子集从 0/48 升至 38/48，更丰富语言在 S1 层恢复 142/143。一个 backbone 出现诊断反而降到 133/143 的负交互，另一模型不复现；这提示机制效应可迁移，但交互结论仍模型依赖。

### 15. Fidelity Is Not Enough: Dispatch-Level Instrumentation for Agentic Datasheet Extraction

**论文信息**：*Fidelity Is Not Enough: Dispatch-Level Instrumentation for Agentic Datasheet Extraction*；Ye, Qing, Lin, Meng-Hsuan；[arXiv:2608.28439](https://arxiv.org/abs/2608.28439)；Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：抽取值与文档一致仍可能是静默失败：如果模型根本没打开 datasheet，偶然答对不应被算作可靠 agentic extraction。

**为什么值得推荐、方法怎么工作**：作者对每次工具 dispatch 做逐调用记录，从轨迹构造规则式 failure attribution 和 silent-failure detector；两个规则只检查必要工具是否被调用，不看最终值。另建 causal chamber，把少量 datasheet claim 在物理装置上测量，明确区分文档 fidelity 与现实有效性。Figure 1 的 instrumentation chain 让 structured-output 禁用工具这一 serving bug 可定位。

**关键实验、局限与当天主题**：三类模型的 207 次干净且 fidelity-passing 抽取中零误报，50 个刻意 withholding fault 全部检出；但后者 recall 是按规则构造得到，不代表能抓到“调用了工具仍答错”的失败。物理 chamber 只能验证 37 个 claim 中 2 个，并给出其余不可评分原因。论文价值在于把 telemetry 和 oracle coverage 写清楚；样本只有 37 条、设备包络窄，不能把零误报外推到通用文档 Agent。

### 16. On the Maintenance and Co-evolution of Agent Plugins: An Empirical Study of Claude Code Plugin Marketplaces

**论文信息**：*On the Maintenance and Co-evolution of Agent Plugins: An Empirical Study of Claude Code Plugin Marketplaces*；Hereiz, Ahmed, Lyu, Yingzhe, Li, Hao, Adams, Bram, Hassan, Ahmed E.；[arXiv:2608.28497](https://arxiv.org/abs/2608.28497)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：coding-agent plugin 不是一次性提示文件，而是自然语言指令、脚本与配置共同演化的新型软件包，其维护依赖需要被版本控制与分析。

**为什么值得推荐、方法怎么工作**：研究挖掘 1,926 个 Claude Code marketplace 仓库、8,351 个插件和 77,773 次提交，按组件类型、commit intent、共同修改与功能耦合分析 plugin evolution；尤其把 skill 目录内 instruction 与 implementation script 的 co-change 同随机基线比较。这里的关键不是插件数量，而是哪些文本工件已经具有传统代码依赖的维护性质。

**关键实验、局限与当天主题**：发布后六个月 plugin-touching commit 活跃度增长 8.8 倍，61.3% 插件服务软件工程；feature commit 占 39.6%，是传统 OSS 的 17.2% 两倍以上，Claude co-author 34.9% 提交。skill 目录的文本与脚本共同变化中 78% 被判定为功能耦合。局限是 Git 可见 marketplace、Claude Code 单生态和 commit 分类噪声；相关 co-change 不等于缺陷因果，但已足以否定“技能只是静态 prompt”的假设。

### 17. Recognition Without Enforcement: Configuration-Dependent Failures in LLM Agent Instruction Arbitration and External Control

**论文信息**：*Recognition Without Enforcement: Configuration-Dependent Failures in LLM Agent Instruction Arbitration and External Control*；Leong, Jun Wen；[arXiv:2608.28502](https://arxiv.org/abs/2608.28502)；Cryptography and Security (cs.CR)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：模型能识别伪造权威、甚至在激活中编码来源，并不意味着它会拒绝冲突工具调用；识别与执行控制是两件事。

**为什么值得推荐、方法怎么工作**：论文用线性 probe、marker ablation、crossed controls 和开放权重 lineage 分析 source-format 信息，再在 46--48 个模型 fleet 上测试 authority spoofing 与 memory conflict；最后把 authenticated routing 与 capability-gated execution 放到外部 reference monitor。Figure 1 明确 recognition--arbitration--enforcement 三段，Table 1 给每项声明标注证据类型与上限。

**关键实验、局限与当天主题**：来源标记可达 97.5%--100% balanced accuracy；某 GPT-4.1-mini 配置识别伪造权威 98.7%，却仍有 99.3% 工具执行。14,294 次 spoof trial 的平均执行仅 1.21%，但漏洞集中在可重复配置，单 fingerprint 窗口内跨度最高 47 点；外部 monitor 拒绝全部测试的伪造、篡改、重放与未签名请求。行为结论依赖部署窗口，probe 也不证明抽象 trust representation，论文对此边界处理得很克制。

### 18. Offline-Verifiable Accountability for Cross-Organization Agent Messaging: A Preserved Evidence-Bundle Approach

**论文信息**：*Offline-Verifiable Accountability for Cross-Organization Agent Messaging: A Preserved Evidence-Bundle Approach*；Alshammari, Adil, Bahsi, Hayretdin；[arXiv:2608.28542](https://arxiv.org/abs/2608.28542)；Cryptography and Security (cs.CR) ; Multiagent Systems (cs.MA)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：跨组织 Agent 工作流若只保留平台日志，争议发生时无法证明授权、委托、收件与事件连续性；证据必须能离线独立验证。

**为什么值得推荐、方法怎么工作**：方案把 sender authentication、authenticated log commitment、witness-backed checkpoint、append-only continuity、delegation evidence 与可选 receiver-signed receipt 打包，并由显式 policy 决定每类事件需要哪些证据。verifier 只判断证据充分性，不从传输成功或日志包含关系推断收件。Figure 1 的 bundle/verification 分离把“发生了什么”与“可证明什么”区分开。

**关键实验、局限与当天主题**：原型覆盖 300 个完整 workflow、1,200 个有效 bundle；checkpoint-context anchoring 是主要延迟来源，委托和前置条件会增加验证步骤。定向 negative-evidence 测试中，所有损坏或 policy-insufficient bundle 都被拒绝，未观察到 false acceptance。局限是负例由既定腐坏模型构造、没有开放网络对手与长期密钥轮换；离线证据证明的是 policy 下的充分性，不是业务动作本身正确。

### 19. Quantization-Triggered Backdoors in Language Models: Cross-Quantizer Transferability and the Validation--Deployment Gap

**论文信息**：*Quantization-Triggered Backdoors in Language Models: Cross-Quantizer Transferability and the Validation--Deployment Gap*；Dardini, Jacopo, Stanzione, Claudio, Colò, Giordano, Fenza, Giuseppe；[arXiv:2608.27512](https://arxiv.org/abs/2608.27512)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL); Cryptography and Security (cs.CR)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：把量化视为语义中性部署优化会制造验证--部署裂缝：通过 FP16 审计的 checkpoint 可以只在 INT8/4-bit 后触发后门。

**为什么值得推荐、方法怎么工作**：作者先以 Quantization Behavioral Equivalence Class 形式化多对一参数映射不保证行为等价，再用三阶段对抗微调把潜在 payload 藏进全精度模型，并在不同 quantizer 与架构间测 transfer。Table 1 对应真实边缘部署情境，Table 2/3 分别测战术翻译中的 friend--foe inversion 与政治立场偏移。

**关键实验、局限与当天主题**：修复后的 FP16 翻译模型测得 0 腐坏，量化后 inversion 最高 85.02%；配对立场分类器的偏移最高 DeltaBias=0.33。实验用 5,000 条 clean、2,000 条 malicious 和 1,000 条测试翻译样本，且 transfer 不只由 bit-width 决定。局限是场景与数据合成、模型尺度较小，BLEU 不能完整度量隐蔽性；但结论明确：最终部署配置必须重新做行为认证。

### 20. Below the Noise Floor: Bimodal Seed Collapse and Distinct Failure Modes in Small-Model Knowledge Distillation

**论文信息**：*Below the Noise Floor: Bimodal Seed Collapse and Distinct Failure Modes in Small-Model Knowledge Distillation*；Sumit, Dipto, Haque, Sakib Ul, Sadeque, Farig；[arXiv:2608.27729](https://arxiv.org/abs/2608.27729)；Computation and Language (cs.CL)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：小模型蒸馏的平均提升可能低于 seed 方差；单次成功训练会完全遮住双峰坍塌和输出在函数名之前截断的失败模式。

**为什么值得推荐、方法怎么工作**：研究在 740 例医疗 API routing、1.5B Qwen student 与 20B teacher 上比较八种 KD 变体，并对关键配置跑 3--6 个 seed；除均值外还记录 per-seed 分布、错误函数与输出终止类型。Figure 1 把 wrong-function collapse 与 reasoning-only truncation 分开，Table 1 直接列出每个 seed，而不是只报最优点。

**关键实验、局限与当天主题**：seed 标准差从 2.8 到 48.7 个百分点，足以吞掉所有低于 5 点的声称增益；七个 KD 变体中三个出现双峰坍塌，reasoning_kd 的截断 seed 仅 0.9% accuracy。只有 progressive_kd 与 rank_kd 在观测 seed 中无坍塌（sigma<=3.9），但均值并未显著超过 88.5% 的 CE baseline。样本与任务单一、seed 数仍有限，不过这正是值得推荐的负结果。

### 21. CoRe-MoE: Compact Reusable MoE for Continual Multimodal Instruction Tuning

**论文信息**：*CoRe-MoE: Compact Reusable MoE for Continual Multimodal Instruction Tuning*；Liu, Runze, Gu, Naibin, Ai, Mingxu, Li, Yuqing, Fu, Peng, Lin, Zheng, Wang, Weiping；[arXiv:2608.27867](https://arxiv.org/abs/2608.27867)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：持续多模态 instruction tuning 不必为每个新任务保存完整 LoRA expert；大量更新方向可复用，任务差异主要落在小型坐标与 router。

**为什么值得推荐、方法怎么工作**：CoRe-MoE 先对 task-specific LoRA update 做 SVD，抽取输入侧与输出侧共享方向基；后续任务冻结基，只训练 compact coordinate experts 与 task-specific low-rank router，并用视觉和文本共同路由。Figure 2 展示 basis/coordinate 分解，Table 3 做 budget-matched LoRA-MoE 消融，验证增益不是参数更多。

**关键实验、局限与当天主题**：LLaVA-1.5-7B 的最终平均为 71.20%，比次优高 3.33 点，最后阶段高 5.90 点，BWT 为 -0.02%；Qwen2-VL-7B 对应提升 2.32 与 4.58 点。后续任务训练参数不到 sequential LoRA 的 1%。局限是两种 MLLM、固定六任务顺序与显式 task router，真实连续流中任务边界、方向基过期和新模态是否仍可压缩尚未回答。

### 22. Rubric-to-Code Credit Assignment for Reinforcement Learning

**论文信息**：*Rubric-to-Code Credit Assignment for Reinforcement Learning*；Jin, Rui, Chen, Jikai, Chen, Yihan, Zhou, Hao, Zhu, Demin, Yang, Kaichen, Wang, Dong, Zhuang, Chenyi；[arXiv:2608.27906](https://arxiv.org/abs/2608.27906)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：网页代码 RL 的奖励应从功能 rubric 追溯到负责的 DOM、事件处理器、状态更新与 token，而不是让整段程序共享一个序列分数。

**为什么值得推荐、方法怎么工作**：RCCA 先把任务拆成显式功能 rubric，再用层级 reward 区分格式、源代码、运行时与功能失败；evaluator 生成文字归因，将每条 rubric 对齐到代码 span，再映射到生成 token 做局部 advantage。Figure 1 的关键是 runtime verdict 到 source attribution 的链，而不是只增加一个 VLM judge。

**关键实验、局限与当天主题**：Ling-RCCA-Flash 在 MiniAppBench 得 41.25，比 Ling-3.0-Flash 高 32.20 点并略超 Claude Opus 4.5；ArtifactsBench 得 76.19，比 SFT 高 4.48、比榜单 GPT-5 高 3.64 点。不同 benchmark 增益差距巨大，说明任务构造和执行 oracle 很关键。局限是 evaluator 的 span attribution 可能错误、前端 rubric 不覆盖可访问性与安全，闭源模型比较也受版本和预算影响。

### 23. When Teacher Guidance Misleads: Reward-Aligned On-Policy Distillation

**论文信息**：*When Teacher Guidance Misleads: Reward-Aligned On-Policy Distillation*；Gan, Siyuan, Li, Yuhan, Wang, Xiran, Meng, Linjian, Wang, Boyan, Zhao, Zhen, Huo, Jing, Gao, Yang；[arXiv:2608.27960](https://arxiv.org/abs/2608.27960)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：on-policy teacher 并非天然可靠：如果 teacher update 方向把正确轨迹推远或把错误轨迹拉近，蒸馏信号应被结果奖励否决。

**为什么值得推荐、方法怎么工作**：RA-OPD 对每条 student rollout 计算 trajectory-level distillation return，再检查它与可验证 outcome reward 是否同向；只保留“朝正确移动”或“远离错误”的轨迹，不改 token-level OPD loss，也不增加采样。Figure 2 把 correct-negative 与 incorrect-positive 两类冲突分开，Table 4 的单边 mask 消融验证两者都应过滤。

**关键实验、局限与当天主题**：Qwen3-4B 上七个数学 benchmark 的 avg@k 达 45.88，比 OPD 高 5.20 点；DeepSeek student 平均 69.34，比 OPD 高 4.91 点。被丢弃轨迹平均占 48.63% 与 68.23%，训练时间 4.48 小时，仅比 OPD 多 0.10 小时；三项代码任务平均也高 3.93 点。边界是必须有可信 outcome verifier，轨迹级一致不保证每个 token 都正确，过滤还可能牺牲覆盖。

### 24. Learning from Hard Prompts: Difficulty-aware Advantage Amplification in Dynamic Sampling

**论文信息**：*Learning from Hard Prompts: Difficulty-aware Advantage Amplification in Dynamic Sampling*；Gan, Siyuan, Li, Yuhan, Wang, Xiran, Meng, Linjian, Wang, Boyan, Zhao, Zhen, Huo, Jing, Bai, Lei, Gao, Yang；[arXiv:2608.27982](https://arxiv.org/abs/2608.27982)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：Dynamic Sampling 去掉全对/全错 prompt 虽能避免零梯度，却会在困难 prompt 上放大错误响应的优势；稀有正确轨迹反而没被充分利用。

**为什么值得推荐、方法怎么工作**：作者解析 DAPO 的组内标准化，证明 hard prompt 中错误样本获得更强 advantage amplification；DAA 直接放大难采样正确响应，再以不足 30 行改动组成 DA3PO。Table 1 报 avg@k，Table 2 同时报 pass@k，避免只提高单次准确率却让策略坍缩到少数解。

**关键实验、局限与当天主题**：Qwen3-4B/8B 在七个数学 benchmark 上，DA3PO 至少比其他 GRPO 变体高 5.02/4.95 个平均准确率点；平均 pass@k 至少高 5.81/5.87 点，AIME24 某些比较达 10--13.33 点。lambda=2 在两尺度最优，但结论只在数学、固定 group size 16 与两种 Qwen 尺度验证；理论中的 difficulty proxy 与真实数据噪声可能错位。

### 25. Coverage, Not Credit: Failure-Credit Routing of Zeroth-Order Perturbation Budgets Does Not Improve On-Pool Sample Efficiency for LLM Agents

**论文信息**：*Coverage, Not Credit: Failure-Credit Routing of Zeroth-Order Perturbation Budgets Does Not Improve On-Pool Sample Efficiency for LLM Agents*；Ge, Yuxu；[arXiv:2608.28011](https://arxiv.org/abs/2608.28011)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：能定位哪个 Agent 模块导致失败，不代表应该把固定的零阶扰动预算集中给它；覆盖不足会抵消更精细的 credit。

**为什么值得推荐、方法怎么工作**：研究在三个冻结小模型、三类任务、六种 allocation、credit-noise sweep 与 paired seeds 上，把 credit-based routing 与 uniform 做 matched-budget 比较，并用 exact sign-flip test 预先规定至少 2 点的实质增益。还加入 burst、step-compensating catch-up 与 credit-free coverage floor，专门区分更新频率和累计参数移动。

**关键实验、局限与当天主题**：所有 on-pool 对比都未检出至少 2 点增益；3B 上全预算投给 argmax 显著更差，misrouting 最多损失 0.074 AUC，BFCL-derived 端到端损失 0.118。六种 schedule 中损失与 bottleneck starvation 的 R2=0.94，coverage floor 消除已检测伤害；唯一例外是 unseen BFCL endpoint 上 soft routing +0.047（p=0.031,n=6）。这是边界明确的负结论，不应扩大成“credit 无用”。

### 26. VISTA: Verifier-Informed Student-to-Teacher Adaptation for On-Policy Self-Distillation

**论文信息**：*VISTA: Verifier-Informed Student-to-Teacher Adaptation for On-Policy Self-Distillation*；Ding, Zewen, Wu, Zezhong, Tao, Zhou, Wang, Shida, Hou, Shizhuo, Hua, YongXiang, Cao, Haoyu, Xu, Linli；[arXiv:2608.28306](https://arxiv.org/abs/2608.28306)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：privileged teacher 看见参考解不等于始终给出适合 student 当前轨迹的目标；经 verifier 证明正确的 student rollout 也应反向校准 teacher。

**为什么值得推荐、方法怎么工作**：VISTA 保留标准 OPSD 的 student update，同时只用 outcome-verified rollout 更新 teacher，并将更新限制在 teacher--student KL 最大的 top-k token 位置；不额外采样，也不引入独立 reward objective。Figure 1 把 student rollout、privileged distribution、verifier 与 selective teacher adaptation 组成闭环。

**关键实验、局限与当天主题**：在 AIME24、AIME25、HMMT25 与 Qwen3 1.7B/4B/8B 上，VISTA 的 Avg@12 在每个尺度都最高，比 OPSD 分别高 0.6、0.7、2.1 点。增益随尺度增大，但绝对幅度有限，说明它更像纠偏而非新能力来源。局限是数学题有清晰 outcome verifier、teacher 仍见参考解，top-k KL 不一定对应因果错误；在开放生成与噪声奖励下是否稳定未知。

### 27. Post-Training VLMs for Video Mistake Detection

**论文信息**：*Post-Training VLMs for Video Mistake Detection*；Spurio, Federico, Zatsarynna, Olga, Doorenbos, Lars, Bahrami, Emad, Francesca, Gianpiero, Gall, Juergen；[arXiv:2608.28406](https://arxiv.org/abs/2608.28406)；Computer Vision and Pattern Recognition (cs.CV) ; Machine Learning (cs.LG)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：视频错误检测不应只记住固定流程的步骤标签，而应在 post-training 中学习“指令与可见执行是否一致”这一可迁移概念。

**为什么值得推荐、方法怎么工作**：论文提出 MD-VQA 协议，把视频步骤、文本指令和正确/错误判断统一成问答，并为未见 action 单独建 split；post-training 使用面向 discrepancy 的定制 reward，促使 VLM 找到动作与说明的不一致，而不是只拟合 closed-set class。Figure 1 对比闭集 mistake classifier 与开放指令条件判定。

**关键实验、局限与当天主题**：该方法超过 zero-shot、SFT 与其他 post-training baseline，在 EP-VQA 未见流程上最高比最佳 baseline 高 11.6%，且公开 benchmark 与代码。推荐点在于把泛化对象定义得更合理。局限是 reward 与 benchmark 都由可观察视频错误构造，细粒度安全后果、遮挡和长延迟因果未覆盖；VLM judge 或标签也可能把合理变体误判成错误。

### 28. Program Learning with Verifiable Rewards: Symbolic Backpropagation for Post-Training LLMs

**论文信息**：*Program Learning with Verifiable Rewards: Symbolic Backpropagation for Post-Training LLMs*；Bhat, Vishvesh；[arXiv:2608.28421](https://arxiv.org/abs/2608.28421)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：对中间步骤可验证的任务，post-training 不一定要改模型权重；可以学习显式、可移植且逐层有 contract 的程序。

**为什么值得推荐、方法怎么工作**：PLVR 在 deterministic/neural primitive library 上搜索 typed program，以 symbolic backpropagation 从输出 loss 反推每层所需 ontology；每步 reward 是 contract verdict，credit 是类型推导而非采样估计。Figure 1 将输入输出例、program layer、typed signature 与 backward requirement 串联，conformance checker 则验证新 primitive library。

**关键实验、局限与当天主题**：在 LiveCodeBench v6 与 Tau2Bench 上，30B base+PLVR 在 matched budget 下平均比 RL 高 27.8 点，比大一个数量级的 frontier 模型高 13.6 点；每个新任务只需 100 个 program-search 示例。把 loss-guided search 换成同空间 uniform sampling 后，中位得分从 65.6 降到 17.5。局限是能力被移到外部程序而非权重，依赖手工 primitive 与类型 ontology；它挑战 RLVR 定义，但不是通用语言能力训练的替代品。

### 29. Learning to Use Tools: Reinforcement Learning for Tool-Integrated Mathematical Reasoning

**论文信息**：*Learning to Use Tools: Reinforcement Learning for Tool-Integrated Mathematical Reasoning*；Xu, Minghui, Wang, Zi；[arXiv:2608.28447](https://arxiv.org/abs/2608.28447)；Artificial Intelligence (cs.AI)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：可验证数学 RL 即使只有终局奖励，也能学会更有效地调用计算器；但先用 SFT 教会工具格式和结果解释是必要起点。

**为什么值得推荐、方法怎么工作**：研究先构造 tool-formatted SFT 数据，让模型学会何时调用计算器及如何继续读取 observation，再比较 RLOO、RLOO++、GRPO、DAPO 等 on-policy 方法；reward 只检查 Countdown 表达式语法、数字使用和终值。Figure 1 展示工具调用插入生成轨迹的训练回路，另建 1,024 题无精确训练重叠的 held-out 集。

**关键实验、局限与当天主题**：工具集成对 SFT 与 RL 的 pass@k 均带来约 10 点提升，Tool-DAPO 把 pass@1 从 Tool-SFT 的 35.8% 提到 66.0%。新测试集比原 50 题更能稳定估计。局限是只有确定性计算器和 Countdown，终局 reward 无法区分正确推理与偶然表达式，数据无 exact overlap 也不排除结构模板污染；对开放网页或代码工具的外推应谨慎。

### 30. Acquire, Repair, Preserve: A Diagnosis-Guided Post-Training Recipe for Small-Model Dialogue Game Agents

**论文信息**：*Acquire, Repair, Preserve: A Diagnosis-Guided Post-Training Recipe for Small-Model Dialogue Game Agents*；Li, Nan；[arXiv:2608.28458](https://arxiv.org/abs/2608.28458)；Computation and Language (cs.CL) ; Machine Learning (cs.LG)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：小模型交互 Agent 的 post-training 应先获得可参与能力，再修复可机械检测的局部决策，并显式保护域外能力。

**为什么值得推荐、方法怎么工作**：Acquire--Repair--Preserve 先用 SFT 学广泛游戏参与，再从重复猜测、格式错误、违背刚收到反馈等诊断构造 turn-local preference pairs，最后用静态与域外集合检查保留。方法把 broad acquisition 与 family-specific repair 分开，避免把所有失败都归结为知识不足。

**关键实验、局限与当天主题**：2B 模型 public clemscore 从 10.67 升到 38.92，closed in-domain 从 13.41 到 41.17，静态总分基本保持 44.14 vs 44.24；但 out-of-domain clemscore 仅 7.88，最大增益集中于目标家族的未见变体。论文值得推荐正因为没有把局部修复包装成通用 Agent：大部分能力来自 SFT，精确 turn-local supervision 的迁移半径很窄。

### 31. ContextPilot: Teaching Agents for Proactive Context Management via Fine-grained RL

**论文信息**：*ContextPilot: Teaching Agents for Proactive Context Management via Fine-grained RL*；Pan, Zhuoshi, Pei, Qizhi, Lu, Junru, Lin, Honglin, Zhao, H. Vicky, Yin, Di, Sun, Xing；[arXiv:2608.28476](https://arxiv.org/abs/2608.28476)；Computation and Language (cs.CL)；列入 2026-08-31 官方列表。

**一句话 TL;DR**：长程 Agent 不应被迫无限携带完整历史；上下文编辑本身是一串有差异影响的动作，需要专门工具和 action-level credit。

**为什么值得推荐、方法怎么工作**：ContextPilot 增加全局计划、长期记忆与 soft context offloading，并以 context/entropy variation 选择关键编辑点做 partial rollout；所有经过某编辑动作的后续分支共同估计该动作 advantage。Figure 1 展示工具扩展、context-aware branching 与 snapshot-level credit，Table 1 列明每类工具而非把压缩统称 summarization。

**关键实验、局限与当天主题**：8B RL 模型在四个 long-context QA 上比 StateLM-8B-RL 平均高 3.55 点，只用 32K context 仍超过 128K backbone；RL 相比未训练 ContextPilot 平均 +3.62，BrowseComp+ +5.34。完整工具集把一项准确率从 63.49% 推到 80.96%。局限是 NovelQA/deep search、固定工具语义与强 outcome scorer；长期记忆是否陈旧、错误 offloading 如何恢复仍未被充分验证。

## 中相关论文速读

这些论文对两条主线有实质贡献，但证据规模、任务边界或方法中心性不足以占用与强相关论文相同的阅读成本。每篇都保留可迁移的判断，同时明确为何不列为强读。

### 1. [Benchmarking General Mobile Assistants in Challenging Real-World Scenarios](https://arxiv.org/abs/2608.27477)

**问题、方法与保留判断**：GMA 用七个开源移动应用构造 300 个四级难度任务，并在统一环境下比较八个 frontier 模型及 context retention、显式状态跟踪等 harness 选择。任务越长性能越快下降，且相同 harness 对不同 backbone 的收益并不一致。它补足 AndroidWorld 一类基准的应用与复杂度覆盖，值得保留的判断是：移动 Agent 排名同时受任务现实度和框架状态管理影响；但摘要没有给出设备扰动、动态账户数据与多次运行方差，因此不足以作为强可靠性证据。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI) ; Computer Vision and Pattern Recognition (cs.CV)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 2. [The Calls are Coming from Inside the Model: Investigating Probe-based Detection of Tool-Calling Errors in LLMs](https://arxiv.org/abs/2608.27750)

**问题、方法与保留判断**：作者在 Berkeley Function Calling Leaderboard 上对 18 个工具调用模型训练线性 probe，目标不仅是格式错误，还包括“类型正确、取值错误”这类日志层很难捕获的问题。probe 效果受模型规模、层位置和 post-training 类型影响，并对未见错误类型显示一定迁移。它提示运行时监控可以利用内部状态而非只审计最终 JSON；但需要模型权重与激活访问，probe 的分布外校准、对抗适应和误报成本尚未形成部署级证书。 论文列入 2026-08-31 官方列表，分类为 Machine Learning (cs.LG) ; Computation and Language (cs.CL)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 3. [Credo: Reusable Declarative Primitives for Agentic Workflows](https://arxiv.org/abs/2608.27790)

**问题、方法与保留判断**：Credo 把搜索得到的 imperative harness 还原成带 provenance 的声明式 primitive，分别记录逻辑步骤、运行信号、物理执行决策与 prompt 策略，再由 compiler 为新任务绑定组合。它击中了“Agent 自动找到强流程却无法复用、审计和维护”的真实问题，也把 model/workload drift 纳入 catalog maintenance。当前证据主要是 preliminary result 与研究议程，没有大规模 matched-task 性能和维护成本实验，因此适合速读框架，不宜当成熟系统结论。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI) ; Databases (cs.DB)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 4. [Resource Constraints and Performance in Agentic AI Systems](https://arxiv.org/abs/2608.27886)

**问题、方法与保留判断**：论文以成对主 benchmark 和细粒度 instrumented subset 比较 OpenClaw 与 NanoBot：完整完成率 31% 对 25%，95% bootstrap 区间跨零；细粒度层两者都为 26%，NanoBot 的墙钟时间几何均值低 2.98 倍、峰值内存低 19.44 倍。最有价值的是把任务结果、资源消耗和逐 attempt provenance 联结起来，并指出便宜的共同失败不应算系统优势。样本仅 23 个详细 prompt，两个系统也代表有限实现空间。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 5. [TACIT-Switch: Cost-Aware Model Escalation for LLM Agents from Censored Supervision](https://arxiv.org/abs/2608.27911)

**问题、方法与保留判断**：TACIT-Switch 用 Teacher-Annotated Censored Intervention Times 学习何时从便宜 backbone 永久切换到强模型，将 handoff 标注表示为 cumulative-risk 上的区间删失观察；部署时不需要 teacher。在仿真中相近成本下成功率高 7.4--11.1 点，ALFWorld 与 DABench 的 held-out success 分别到 48.5%/45.5% 与 73.1%。它提供了轨迹级成本--可靠性调度思路，但核心机制先在受控仿真成立，真实 strong rollout 配对和切换不可逆假设会限制泛化。 论文列入 2026-08-31 官方列表，分类为 Machine Learning (cs.LG)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 6. [What Makes Agent Memory Useful for Reliable Unanswerable Question Handling?](https://arxiv.org/abs/2608.27924)

**问题、方法与保留判断**：研究在统一 agentic RAG 中比较四种 memory、三组不可回答问题数据和两个 base model，发现记忆收益是选择性的，跨模型复用往往比跨数据集迁移容易；程序式、规则式记忆比堆积轨迹更稳，decision guidance 也比 trajectory shaping 更能保留收益。这个负结论对可靠 Agent 很重要：记忆容量不是目标，answerability pattern 的分布漂移才是主要风险。实验仍局限 QA/RAG，未覆盖记忆写入污染、长期版本过期和工具状态。 论文列入 2026-08-31 官方列表，分类为 Computation and Language (cs.CL)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 7. [GraftyVul: Synthesising Insecure Programs Through Real-World Vulnerability Grafting](https://arxiv.org/abs/2608.27928)

**问题、方法与保留判断**：GraftyVul 把真实漏洞 graft 进已有开源项目，利用原有 build/test 环境和 exploit-verification script 确保行为确实改变；最终生成 212 个可复现、可利用样本，跨 Python、TypeScript、Java、Go、C# 和 23 类 CWE。其跨语言语义 embedding 按 sink、mechanism 与 host feature 衡量保真度，并用于工业 remediation case。它为补丁与安全 Agent 提供比静态片段更强的执行 oracle，但 graft 后上下文仍可能与自然漏洞修复分布不同，规模也不足覆盖依赖链和真实历史。 论文列入 2026-08-31 官方列表，分类为 Cryptography and Security (cs.CR) ; Software Engineering (cs.SE)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 8. [Cross-Session Decomposition Attacks: Scaling Risk and Intent-Aligned Retrieval Defense](https://arxiv.org/abs/2608.27945)

**问题、方法与保留判断**：论文把跨 session 的无害子问题重组成禁用目标，定义 compositional safety risk，并在条件假设下给出 excess loss 到组合风险的转移界；600 个 intent 与 Qwen3/Gemma3 评估显示更强模型可带来更大 harmful-capability uplift。22M 的 IntentAlign-MiniLM 用意图对齐检索提高 guardrail recall。它与长程 Agent 安全直接相关，但理论界依赖参考环境已有分散危险证据，攻击 pipeline 和合成 withholding 会决定风险上限，防御仍可能漏掉未建模意图。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 9. [CHISEL-ing Back Source Code with AI-enabled Iterative Recovery](https://arxiv.org/abs/2608.27981)

**问题、方法与保留判断**：CHISEL 不依赖给定测试套件，而以 compiler 静态反馈、coverage-guided fuzzer 差分观测、跨轮 divergence memory 和 best-candidate retention 修复 Ghidra pseudo-C。120 个 ExeBench 函数、四种优化和 stripped/unstripped 条件下，平均可编译率 96.1%、可执行率 79.8%，2.1 轮恢复 26% 首轮执行错误；oracle 仍误收 9.4% 候选。它展示执行反馈的价值，也清楚暴露 fuzz coverage 不能证明语义等价。 论文列入 2026-08-31 官方列表，分类为 Cryptography and Security (cs.CR) ; Software Engineering (cs.SE)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 10. [CAITLYN: Can LLM Agents Autonomously Synthesize Defenses against Emerging Injection Attacks?](https://arxiv.org/abs/2608.27990)

**问题、方法与保留判断**：CAITLYN 把即时防御与持续合成分成两套系统：Tier-0 规则和 Tier-1 LLM detector 处理已知注入，异常信号再触发第二系统生成并验证新防御。在标准集上以更低 token 开销接近已有方法，在自建 Emerging delivery-aware benchmark 上，静态配置仍被击穿，而新防御合成降低三类 Agent 环境的攻击成功率。亮点是防御也进入可演化 harness；风险是验证器与攻击生成器可能共盲，且自动发布策略的回归与回滚尚需硬门槛。 论文列入 2026-08-31 官方列表，分类为 Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 11. [String: An Agentic OS Where Every App Is a Markdown File](https://arxiv.org/abs/2608.28027)

**问题、方法与保留判断**：String 把工具知识从持续上下文移到按需 Markdown view：一个 SFMD 文件声明界面、typed action、导航和 credential，运行时负责发现、验证、状态和 secret。过早暴露一级细节会损失最高 23 个准确率点，正确 staging 将错动作从 28% 降到 2%；87 题上与 curated skill 成功率近似，完成 episode token 少 33.5%。这是 agent-native interface 的有力系统论证，但 benchmark 与三个月生产经验仍由同一实现定义，安全保证依赖 runtime provenance。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 12. [WeAgent-MMSearch: Native Text-Vision Interaction for Multimodal Search Agents](https://arxiv.org/abs/2608.28062)

**问题、方法与保留判断**：WeAgent-Harness 给检索图像持久磁盘引用并恢复异常 rollout，FA-GSPO 过滤无效轨迹、保留可挽救分支；训练数据由强 MLLM 发现、合成并验证，VisTarget-Bench 的 150 个任务用 held-out target image 区分检索失败与视觉理解失败。agentic post-training 平均提升 19.22 点，并可追近约十倍规模模型。它同时连接 harness 与训练，但 synthetic task、verifier 和训练策略可能共享偏差，150 题仍不足覆盖开放网页漂移。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 与 post-training 交叉 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 13. [Adaptive Strategy Generation for Boundary Value Exploration Beyond Numeric Inputs](https://arxiv.org/abs/2608.28230)

**问题、方法与保留判断**：ABEX 用多个 LLM Agent 生成、选择和执行自然语言 mutation strategy，以执行反馈和 quality-diversity archive 探索输入行为边界。20 个函数上，数值任务中 10/11 优于已有 QD，平均 QD-score 高 11.7 倍；非数值任务首次自动发现领域边界，同规模 test suite 的 mutation score 为 86.2% 对 61.9%。它把 BVE 扩展到字符串、数组和混合输入，但 subject 数小、black-box 行为差异未必等同缺陷，策略复用还可能携带函数特定过拟合。 论文列入 2026-08-31 官方列表，分类为 Software Engineering (cs.SE)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 14. [Beyond Task-Only Matching: Personalized Skill Routing with Counterfactual Evaluation](https://arxiv.org/abs/2608.28241)

**问题、方法与保留判断**：SkillFeed 将技能检索从 task-only matching 改成 task 与 user profile 的联合相关性，并用固定任务、反事实变化 profile 的 paired benchmark 检查参考 skill 是否应变化；先召回语义相关候选，再以 body evidence 排除 profile-conflicting skill。Top-1 为 75.1%，比预训练 router 高 23.1 点；真正改变适用性的 query 上 profile conditioning 高 35.1 点。结论适合个人化 Agent，但 profile 构造、reference skill 与隐私风险还未在真实 marketplace 验证。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 15. [Finding Where the Buck Stops: An Automated Failure Attribution-Based Reflection Framework for Multi-Agent Collaboration](https://arxiv.org/abs/2608.28264)

**问题、方法与保留判断**：DoCtOR 先定位 decisive error step/agent，再用反事实生成修正步骤，只让责任 Agent 写入 reflection，避免所有成员把错误经验存进 memory；HotPotQA、ChartQAPro、Mind2Web 相对初始成功率分别提升 22%、26%、27%。诊断后修复比全员反思更符合因果责任，也直接触及多 Agent 记忆污染。中相关的原因是失败归因本身仍由自动模型完成，三类 benchmark 的 ground truth 无法证明真正责任唯一，长期记忆副作用也未追踪。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 16. [PanelShield: Verifiable Closed-Loop Safe Planning for Robotic Industrial Panel Operation](https://arxiv.org/abs/2608.28305)

**问题、方法与保留判断**：PanelShield 从 manual evidence 生成参数化 action primitive，再用 LTL 检查跨步时序、Safety FSM 检查局部转移；若违规，返回最早反例与原因后定向修复、重验证。三类工业面板的模拟与真实机器人实验把 violation rate 降至 2.7%，总延迟 4.1 秒。它展示形式 oracle 如何包围语义 planner，但 panel 状态机、manual 编译与 real-world 执行包络由作者预先定义，不能直接代表开放环境的安全部署。 论文列入 2026-08-31 官方列表，分类为 Robotics (cs.RO) ; Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 17. [Where Does Balance Break? Boundary Discovery for Game Balance Testing under a Finite Simulation Budget](https://arxiv.org/abs/2608.28364)

**问题、方法与保留判断**：BBExplorer 将非确定性游戏平衡回归测试表述为有限 simulation budget 下的 boundary discovery，结合多方向候选、两阶段预算筛选和自适应步长收缩；两个复杂度不同的游戏上，在低维设置最强，也能跨未见 seed 与阈值保持边界稳定。它提醒软件正确性有时不是单次 pass，而是统计区域是否越界。当前证据限于两个游戏和作者设定的 balance threshold，尚未与 LLM coding Agent 闭环集成。 论文列入 2026-08-31 官方列表，分类为 Software Engineering (cs.SE)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 18. [PersonaForge: Realistic Multi-Turn User Simulation for Agentic Systems](https://arxiv.org/abs/2608.28378)

**问题、方法与保留判断**：PersonaForge 从 1.6 万真实 session 得到 75.9% 为多轮这一偏差，使用四维 persona、SOUL 行为控制和真实 seed 的反向构造生成 6.3K 训练记录，并建立 138 题、20 余领域的人工标注 benchmark。Qwen3.5-27B 综合 +4.1%，Task Completion +6.0%、Response Quality +6.8%，同时减少轮次与工具调用。它对 Agent post-training 有直接价值，但模拟用户与评价 rubric 同源、138 题较小，真实人类中途改意图和拒绝配合仍可能不同。 论文列入 2026-08-31 官方列表，分类为 Computation and Language (cs.CL)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 19. [CamoDocs: A Poisoning Attack Against Retrieval-Augmented Language Models Using Camouflaged Documents](https://arxiv.org/abs/2608.28389)

**问题、方法与保留判断**：CamoDocs 不把目标 query 原文塞进毒文档，而将良性与对抗草稿切块、用 dispersion token 分散 embedding，再以 coherence filter 保持可读；七种防御、三种开源模型和三 benchmark 上仍有较高 ASR，GPT-5.4-mini 与 Claude-Haiku-4.5 平均分别 61.80% 与 55.09%。它说明 query-overlap 过滤过于表面。强 erasure 防御可降 ASR，却伤害 NeoQA 等依赖检索任务，安全--效用权衡仍未解决。 论文列入 2026-08-31 官方列表，分类为 Cryptography and Security (cs.CR) ; Computation and Language (cs.CL)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 20. [Recovering Software Architecture Intent from Historical Work Items using Generative AI: A Mixed-Methods Industry Case Study](https://arxiv.org/abs/2608.28403)

**问题、方法与保留判断**：研究从 Azure DevOps 历史 work item 恢复 C4 架构图，以五步 prompt chain、双向 traceability 和逐步推理生成可追溯 artifact；两个工业项目中，专家认为基线对理解有用，实体稳定性高于关系，且多步生成会累积相对方差。它把软件历史从文本检索推进到架构意图重建，并可暴露文档与实现漂移。边界是 artifact 严格受输入记录限制、项目仅两个、专家判断不能替代代码或运行时一致性验证。 论文列入 2026-08-31 官方列表，分类为 Software Engineering (cs.SE)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 21. [LongPIBench: A Long-Context Benchmark for Prompt Injection](https://arxiv.org/abs/2608.28411)

**问题、方法与保留判断**：LongPIBench 覆盖论文评审、简历筛选、代码评审和邮件摘要四类长上下文场景，每类同时构造合成与真实数据，长度从数千到数万 token。结果显示即使简单 heuristic injection 也常绕过短上下文上表现强的防御，说明现有 benchmark 系统性高估安全性。它对 coding/review Agent 很实用，但摘要未给统一 ASR 数字；真实场景仍是静态文档输入，没有覆盖多工具、多 session 与持久 memory 传播。 论文列入 2026-08-31 官方列表，分类为 Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 22. [Are These Modules Worth Their Cost? A Paradigm-Level Accuracy-Cost Analysis of In-context Learning Text-to-SQL](https://arxiv.org/abs/2608.28432)

**问题、方法与保留判断**：论文在统一实现中枚举 text-to-SQL 的五类常见模块和 17 种 pipeline 配置，跨四种 backbone 做边际准确率--成本归因，并外测五个模型。execution-feedback refinement 是唯一在所有 backbone 上稳定低成本获益的模块；其他增强依赖模型，固定预算常应优先给中档模型配更强 pipeline，而非换 frontier 模型。结论有助于 harness 设计，但仅限 ICL text-to-SQL，模块交互和数据库执行环境会限制迁移。 论文列入 2026-08-31 官方列表，分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Databases (cs.DB)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 23. [COVER: Identifiable Evaluation of Coalition Routing](https://arxiv.org/abs/2608.28475)

**问题、方法与保留判断**：COVER 指出多 Agent router 换队伍会同时改变消息与答案，单纯 end-to-end gap 无法识别 routing effect；它预先冻结公共信息边界、downstream stack 与合法 team family，用 complete coverage 计算有限 benchmark 上的 oracle regret。ToolSandbox 224/224 有效行中，冻结 router 的 safe-evidence completion 0.637、family oracle 0.768，未达到预设 regret 0.10。它的价值是暴露 headroom 而不制造胜利，但成本随队伍全集增长，结论仍 stack-dependent。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 24. [LLM-Based Agents for Software and Systems Security: Approaches, Applications, and Assessment](https://arxiv.org/abs/2608.28490)

**问题、方法与保留判断**：这篇系统综述从 2023--2026 同行评审文献整理安全 Agent 的架构、感知、记忆、规划、行动、编排、自改进、任务与评价协议。核心判断是领域已经造出“能行动”的 Agent，却缺少边界化 authority 与可审计行为，且 agent 定义、风险和 benchmark 不可比。作为地图很有阅读价值，也与当天外部 reference monitor、prompt injection 和工具证据论文互相印证；但它不提供新的因果实验，检索截止与纳入规则会很快随快速生态过期。 论文列入 2026-08-31 官方列表，分类为 Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 25. [Logos: An Agent Harness on a Cross-Process Bus](https://arxiv.org/abs/2608.28553)

**问题、方法与保留判断**：Logos 把每个 plugin 放进独立进程，以 append-only transcript 作为唯一共享状态，并基于 capability 带 tracked inverse 的组合 calculus 论证跨进程不破坏原 soundness invariant。80 个 session 在工具调用四个边界注入 kill 后恢复且无重复 effect；单进程对照一次故障会打断所有共驻 session，peer-process 只终止一个节点。它把故障域隔离带入 harness，但理论假设 LLM 推理无状态，外部服务副作用和 transcript 损坏仍需更强 exactly-once 协议。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI) ; Multiagent Systems (cs.MA)。本期将它放在 coding-agent / software-change 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 26. [INSPIRE: An Internalize-Then-Improve Approach for Example-Driven Mathematical Reasoning](https://arxiv.org/abs/2608.27501)

**问题、方法与保留判断**：INSPIRE 面向反例式数学推理，先用 Reference-Guided Student Internalization 在 policy 自身分布上构造 preference candidate，再分阶段用方法 rubric 和正确性 rubric 做偏好训练，解决“模型尚不会该策略时无法直接优化正确应用”的鸡生蛋问题。多尺度、多家族和 OOD 集上均有提升且不伤一般数学能力。它把 capability acquisition 与 refinement 分阶段是亮点，但摘要缺少具体增益、反例质量仍受 reference 与 rubric judge 控制，暂不列强读。 论文列入 2026-08-31 官方列表，分类为 Computation and Language (cs.CL)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 27. [A Survey on Rubric-Guided Reinforcement Learning for Language Models](https://arxiv.org/abs/2608.27505)

**问题、方法与保留判断**：综述把 constitution 表示为 rubric 先验 P(R)，实例 rubric 表示为条件后验 P(R|x)，沿 prior--posterior 轴统一 constitutional AI、实例 rubric、过程监督、自演化 rubric 及 Agent/多模态扩展。尤其强调粒度权衡、语义漂移和 linguistic reward hacking，给当天 RCCA、VICT 等细粒度工作提供概念地图。它没有新训练对照或统一 benchmark，Bayesian 表述更多是组织语言，因此适合建立阅读框架而非判断具体方法孰优。 论文列入 2026-08-31 官方列表，分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 28. [Fully Unleashing the Multimodal Attacker: Meta-Adaptive Jailbreaking of Vision-Language Models](https://arxiv.org/abs/2608.27531)

**问题、方法与保留判断**：MAMJ 不再固定 jailbreak 策略，而让 LLM critique 更新 attack strategy prompt，并用多条轨迹的 ASR reward 继续更新 attacker 权重。对 GPT-4o、Gemini-3-Pro-Preview、Seed 2.0 的 ASR 分别为 81.0%、78.9%、82.3%，最高比 sample-level baseline 高 24.1 点，且向未见 victim 迁移。这是安全 post-training 的强压力测试；但 attacker 与 victim API 版本、评测危险类别和代表性防御决定结论，尚未形成训练侧修复。 论文列入 2026-08-31 官方列表，分类为 Cryptography and Security (cs.CR) ; Computer Vision and Pattern Recognition (cs.CV)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 29. [Nemotron 3.5 Content Safety Moderator: A Compact Multimodal, Multilingual, and Reasoning Enabled Content Safety Moderator](https://arxiv.org/abs/2608.27548)

**问题、方法与保留判断**：Nemotron 3.5 CS 用 4B VLM 同时处理用户文本、图像、文档截图和 assistant 输出，覆盖 12 种语言；快速路径输出安全标签，需要审计时再生成简短理由与自定义 policy 违规类别。配套数据包含真实图像标注、良性任务、合成稀有风险与 jailbreak。它展示小型 moderator 的覆盖--延迟折中，但技术报告的多基准“竞争力”缺少统一数字，reasoning trace 也可能为错误决策提供事后合理化。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 30. [Beyond Data Scaling: Representation-Centric Continued Pre-training for Vision-Language-Action Models](https://arxiv.org/abs/2608.27550)

**问题、方法与保留判断**：VLAct 在任务微调前用多来源、多 embodiment 机器人数据做 representation-centric continued pre-training，通过保留 VLM prior、连续 action co-supervision 与部分统一 action layout 学共享动作语义。LIBERO-Plus 与 RoboTwin 2.0 成功率 82.6%、92.5%；未见 humanoid 上只用 20% 下游轨迹就超全数据 GR00T-N1.6。它说明后训练阶段的数据表示比盲目扩数据重要，但属于 VLA、需要 16 GPU，真实机器人安全与跨 embodiment action 等价仍是风险。 论文列入 2026-08-31 官方列表，分类为 Robotics (cs.RO) ; Computer Vision and Pattern Recognition (cs.CV)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 31. [First Make It Playable, Then Make It Good: Staged Interaction Learning for Small Dialogue-Game Agents](https://arxiv.org/abs/2608.27672)

**问题、方法与保留判断**：Qwen-GuidePlay-2B 采用成功轨迹 SFT、加权 turn-level SFT 和 teacher-guided SFT 三阶段；teacher 只修格式与评估，不生成新 gold action。公开验证 clemscore 57.12、statscore 42.68，挑战中相对 base 的 clemscore 增量约 +36；复杂 replay-repair 和 hard mining 反而无益。它与 Acquire--Repair--Preserve 共同支持“先可玩，再局部修”的配方，但只在 dialogue game、且消融结论可能受小模型与数据筛选影响。 论文列入 2026-08-31 官方列表，分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 32. [ReToolSQL: Agentic Reinforcement Learning for Robust Text-to-SQL](https://arxiv.org/abs/2608.27796)

**问题、方法与保留判断**：ReToolSQL 先用 rejection-sampled、verified privileged-teacher 轨迹做 SFT 扩大 pass@k coverage，再以多轮执行反馈 RFT 学何时验证、查什么证据和如何修 SQL。Gemma 4 31B 上 RFT 为 73.66% BIRD-SQL EX，SFT→RFT 单次 74.32%、self-consistency 74.77%。阶段分工清楚，但相对增益不大，且 database execution correctness 不等于查询意图、权限和效率正确；enterprise-grade 的表述仍偏强。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 33. [KLOD: Locality-Preserving Knowledge Editing via Non-Target Distribution Preservation](https://arxiv.org/abs/2608.27839)

**问题、方法与保留判断**：KLOD 在微调式知识编辑中把目标概率提升与应保持的非目标分布分离：达到阈值后停止放大目标，同时约束目标位置的 target-excluded distribution 和 prefix 全分布。CounterFact/ZsRE、Llama3-8B/Qwen2.5-7B 上，在高 edit reliability 下显著减轻 locality drift，并给出阈值控制的 generalization--locality 前沿。它对持续后训练很实质，但事实编辑 benchmark 与顺序规模有限，KL 保持不保证下游行为不变。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 34. [EvoHarmBench: Breaking Content Moderation with Iterative Human-Like Evasion](https://arxiv.org/abs/2608.27844)

**问题、方法与保留判断**：EvoHarmBench 将 moderation 评估变成动态对抗循环，在 5,002 条真实样本形成的 229 个语义子簇上同时优化逃逸与可读性；12 轮后，SOTA LLM moderator 在可读约束下 ASR 仍达 80.3%。它说明静态 safety benchmark 无法代表会根据反馈迭代的人类攻击者，也为当天 MAMJ 提供文本侧呼应。局限是攻击优化器与可读性 judge 可能偏向特定表达，线上政策和人工审核的组合防线未被复现。 论文列入 2026-08-31 官方列表，分类为 Computation and Language (cs.CL)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 35. [SpikeOPD: Stable On-Policy Distillation for Autoregressive Spiking Language Models](https://arxiv.org/abs/2608.27857)

**问题、方法与保留判断**：SpikeOPD 处理 ANN-to-SNN 语言模型迁移中的 prefix-source mismatch：在 student 自生成前缀上做 full-KL teacher correction，同时用 matched-prefix policy anchor 限制偏离，再以 layerwise spike regularization 控制放电率。三尺度相对 KD SNN 分别 +0.8、+1.7、+2.9 点，并保持稀疏计算。它验证“on-policy coverage 不等于稳定”，但对象是 0.125B--1.3B spiking LM，结论对主流 dense LLM 的迁移有限。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 36. [Iron: Intent-Aligned and Retrospective Dual Learning Framework for Enhancing Generalist Virtual Agents](https://arxiv.org/abs/2608.27866)

**问题、方法与保留判断**：Iron 用 stepwise cycle-consistent reward 对齐低层 GUI action 与高层 intent，再以 hindsight reproduction 回收失败轨迹而不是丢弃；跨环境与设备上用更少标注超过三倍数据训练的模型，未见 web 任务相对提升 25.06%。它把局部 action-intent 信用和失败数据利用结合，适合 GUI Agent post-training。摘要没有给出绝对成功率、reward 的错误率和真实设备副作用，故留在中相关。 论文列入 2026-08-31 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 37. [CommerceVibe: Learning to Design E-Commerce Creatives as Executable Visual Code via Dual-Feedback Reinforcement Learning](https://arxiv.org/abs/2608.27893)

**问题、方法与保留判断**：CommerceVibe 将电商创意表示成可执行 HTML/CSS，而非扁平图片；先在 2.8 万样本 SFT，再用规则奖励检查文字、商品与布局，用 VLM 从六个感知/商业维度补充视觉 reward。1,300 例上从 SFT 的 87.3 提到 94.0/100，五位设计专家盲评支持。方法体现 rubric+runtime 双反馈，但商业 rubric 与 VLM judge 可能同偏，前端安全、可访问性和真实转化没有验证。 论文列入 2026-08-31 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 38. [From Documents to Reasoning: A Validated Synthetic Data Pipeline and Semantic-Aware Fine-Tuning for Financial Numerical Reasoning](https://arxiv.org/abs/2608.27919)

**问题、方法与保留判断**：论文从文档生成金融数值推理合成 QA，以激进验证过滤样本，再用 QLoRA 微调小模型；评价不只做 Exact Match，而是从算术表达式计算答案，并把语义相似、表达式指标与交叉熵组合成 loss。ConvFinQA 上报告显著提升。它覆盖 synthetic data、data validation 与 domain SFT，但摘要缺少具体数值，表达式正确也可能掩盖引用错误或单位错，跨财报年份污染需单独审计。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 39. [QUORUM: QUality-Optimized Routing Using Multiple annotators](https://arxiv.org/abs/2608.27974)

**问题、方法与保留判断**：QUORUM 在固定预算下按实例难度把标注路由给人或多个 LLM，再用 annotator agreement reward 聚合，而不是信任模型自报 confidence。英语、多语、封闭与开放任务上，标注质量最高 +34.4%、成本低 8.8%。它对 post-training 数据生产很实用：关键不是全自动，而是把昂贵人类判断投到 LLM 不可靠的位置。风险是 agreement 不等于真值，难度 feature 在新域会漂移。 论文列入 2026-08-31 官方列表，分类为 Computation and Language (cs.CL)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 40. [Should I Use This Synthetic Dataset for Training? How to Test with Minimal Real Data](https://arxiv.org/abs/2608.27996)

**问题、方法与保留判断**：aeSFT 回答“合成数据是否真能改善真实分布”：比较只用真实数据与加入 synthetic 的两个已训练模型，以 paired loss difference 做 anytime-valid sign-flip e-process，同时自适应 Monte Carlo 轮数和真实测试样本数。三个工程任务中，它比均值序贯检验用更少真实样本，功效接近固定 sign-flip/t-test，并把假阳性压在目标内。它是数据筛选的强统计工具，但要求固定学习算法与较强对称零假设，不能解释为何 synthetic 有害。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 41. [Token-Budget Distillation: Transferring Full-Token Semantics to Compressed Video Vision-Language Models](https://arxiv.org/abs/2608.28138)

**问题、方法与保留判断**：Token-Budget Distillation 冻结 video VLM backbone，仅训 LoRA；full-token teacher 监督压缩 token student，联合任务 loss、答案区 KL、GT-anchored margin 与 reliability-aware KD。三种 backbone、四 benchmark 上，10% token 保留时 LLaVA-Video 仍保留 97.0% 原准确率，LLaVA-OneVision 达 58.4、相对准确率 100%。它展示效率型 post-training 的信号设计，但 teacher 与 student 同源、压缩后细粒度时序错误可能被平均指标掩盖。 论文列入 2026-08-31 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 42. [HARTS: Efficient Agentic Reinforcement Learning for Hybrid-Attention Models over Arbitrary Rollout Trees](https://arxiv.org/abs/2608.28158)

**问题、方法与保留判断**：HARTS 针对 agentic RL 的不规则 rollout tree，把 shared prefix 的 microbatch、DP replica 与 slot schedule 联合规划，并为 chunkwise linear attention 做最少顺序调用的状态恢复；对 MoE 还恢复 token multiplicity。SWE-bench 轨迹的 hybrid-attention 模型上，带 activation recomputation 获得 4.81--4.87 倍前后向加速，前 120 step reward 趋势近似基线。它是训练系统贡献，数值等价和更长训练稳定性仍需扩大验证。 论文列入 2026-08-31 官方列表，分类为 Machine Learning (cs.LG) ; Distributed, Parallel, and Cluster Computing (cs.DC)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 43. [Efficient Online Continual Foundation Model Fine-Tuning for Predictive Process Monitoring](https://arxiv.org/abs/2608.28237)

**问题、方法与保留判断**：COMPASS 用 loss-plateau drift detection 自动识别事件流任务边界，并维护同时包含预训练与任务特定方向的 adaptive subspace，以在线持续微调 foundation model。九条合成/真实 process stream、task-free/task-aware、多 backbone 上超过三种非 FM 方法与两种更新 baseline， recurrent drift 和长流程收益尤其明显。它证明 continual post-training 能缓解 cold start，但领域是预测流程监控，模型规模、遗忘指标和漂移检测误报需要更多披露。 论文列入 2026-08-31 官方列表，分类为 Machine Learning (cs.LG)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 44. [AIM: Anchor Identity Features, Then Match for Multimodal Large Language Model Unlearning](https://arxiv.org/abs/2608.28312)

**问题、方法与保留判断**：AIM 研究删除阶段无 retain image 的 MLLM 身份遗忘：先观察 identity question 按人物聚类、视觉感知按问题类型聚类，再用通用视觉 prompt 锚定忘却目标，并在 Fisher 约束下匹配 vision encoder。实验在忘记身份事实的同时保留其他身份、旧知识和同图感知，说明可利用表示分离降低 collateral damage。局限是 identity benchmark 与隐藏状态可分性不代表现实照片上的隐私彻底删除，攻击式 extraction 未充分覆盖。 论文列入 2026-08-31 官方列表，分类为 Computer Vision and Pattern Recognition (cs.CV) ; Computation and Language (cs.CL)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 45. [GRACE:Gradient-guided Coreset Selection for LLM Unlearning](https://arxiv.org/abs/2608.28361)

**问题、方法与保留判断**：GRACE 从少量不良行为 seed 估计 forget gradient direction，用非负 OMP 选小型 forget coreset；再投影掉忘却方向，在剩余空间聚类选 retain set，以同时覆盖效用。两个域、两个模型家族、四种 unlearning 算法上，在相近 forget quality 下更好保留 utility。贡献是真实地处理“集合并未预先给定”的数据选择，但 gradient proxy、seed representativeness 和 post-unlearning extraction 攻击仍限制结论。 论文列入 2026-08-31 官方列表，分类为 Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 46. [How Proper Scoring Rules Shape LLM Forecasting](https://arxiv.org/abs/2608.28482)

**问题、方法与保留判断**：论文将五种 proper scoring rule 直接作为二元真实事件预测的训练目标。虽然理论上都鼓励诚实概率，Brier、log 等训练出的模型却在校准、概率使用以及 bias/information/noise 分解上明显不同；Brier 模型有最佳 Brier 与 AUC，log 模型有最佳 log score 和 calibration error。它提醒 reward 等价的理论不保证有限训练行为等价；每个条件只有一个 seed，差异可能混入训练随机性，因此结论应视为机制信号。 论文列入 2026-08-31 官方列表，分类为 Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 47. [REPLICANT: Learning Policies for Evading and Hardening Malware Detectors](https://arxiv.org/abs/2608.28499)

**问题、方法与保留判断**：REPLICANT 在严格 label-only black-box 下用深度 RL 学“如何修改恶意样本、何时查询”，策略可跨样本、detector 与 feature space 迁移。七个 Android malware detector、三类特征上平均 ASR 78.8%，比 SOTA 相对高 20.9%--39.2%；同一策略用于 adversarial training 时也提升泛化鲁棒性。它是安全后训练的攻防闭环，但标签查询预算、语义保持与真实恶意软件可执行性决定威胁现实度。 论文列入 2026-08-31 官方列表，分类为 Machine Learning (cs.LG) ; Cryptography and Security (cs.CR)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

### 48. [DARTS: Decoder-Aware Representation Tuning via Surgery for Model Merging](https://arxiv.org/abs/2608.28547)

**问题、方法与保留判断**：DARTS 处理 decoder 模型 merge 后随 token 位置累积的 representation bias：以 entropy-weighted L1 强调决策关键位置，再用逐位置 additive bias 做轻量修正。Llama-2-7B 的 HumanEval、GSM8K、AlpacaEval 上优于 encoder 时代的标准 surgery，额外参数仅 0.1%。它抓住自回归模型与视觉 encoder 的结构差异，但模型较旧且只合并三个任务，真实多模型冲突、chat safety 和长上下文没有验证。 论文列入 2026-08-31 官方列表，分类为 Machine Learning (cs.LG)。本期将它放在 post-training 中相关：建议保留上述机制、数字或负结论，但不要越过其数据、模型、工具和评测边界。

## 可留意 / 可跳过

这些工作与两条主线存在明确邻接，但今天可以先记住关键词和边界，不必按核心论文投入同等阅读时间。

- **[VR-Themis: A Scalable Framework for Virtual Reality Application Clone Detection](https://arxiv.org/abs/2608.13290)**：用 VR 应用 clone detection 研究软件相似性，任务真实但与代码变更 Agent 距离较远，可记住跨模态克隆审计。
- **[PACE: Publisher-Adaptive Content Extraction via Agentic Automation](https://arxiv.org/abs/2608.27466)**：以 agentic automation 适配不同 publisher 的内容抽取，实用性高，主要贡献在网页抽取配置，不含长程软件修改证据。
- **[Hypothesize, Evaluate, Refine: A Scientific Agent for PDE Discovery with Unknown Spatial Coefficient Fields](https://arxiv.org/abs/2608.27475)**：科学 Agent 通过假设--评估--细化发现带未知系数的 PDE，执行闭环值得看，但领域 oracle 与仓库工程不同。
- **[Image Augmentation as Test Generation for Deep Learning-Based Image Retrieval Systems](https://arxiv.org/abs/2608.27502)**：把图像增强当作深度图像检索系统的测试生成，属于 ML 软件测试，未涉及 coding Agent 或多文件 repair。
- **[Predicting LLM Performance from Prompt Linguistic Features: An Empirical Study in Requirements Engineering](https://arxiv.org/abs/2608.27621)**：在需求工程中用 prompt 语言特征预测 LLM 表现，能辅助任务路由，但没有直接改进或验证软件变更。
- **[Operationalizing Regulations into Code: A Model to Enhance Governance and Compliance in LLM Selection for Software Engineering](https://arxiv.org/abs/2608.27703)**：把法规操作化为软件工程 LLM 选择代码，偏治理与模型筛选，缺少真实修复任务和运行反馈。
- **[RiskBlend: A Multi-Signal Framework for Test Input Prioritization in Machine Learning Regression Testing](https://arxiv.org/abs/2608.27704)**：RiskBlend 为机器学习回归测试做多信号输入优先级，属于测试资源分配，Agent 成分较弱。
- **[AcCoRD: Evaluating User-Agent Collaboration Under Realistic User Preference Dynamics](https://arxiv.org/abs/2608.27818)**：AcCoRD 测购物与旅行中用户偏好随对话形成、调整和放宽；五个 frontier 模型仍难处理动态偏好，适合作为协作 Agent 邻接基准。
- **[DBRepro: Automated Database Synthesis via a Hybrid Constraint-Solving Approach for Reproducing Slow Queries](https://arxiv.org/abs/2608.27822)**：DBRepro 用约束分布合成复现慢查询计划，在近 1TB 数据上验证；是强系统复现工作，但不以 LLM Agent 为中心。
- **[FedEHR-Agents: Federated Agentic Optimization for Automated EHR Modeling](https://arxiv.org/abs/2608.27856)**：FedEHR-Agents 用联邦 Agent 优化 EHR 建模，重点是医疗模型训练与隐私，软件工程可靠性证据有限。
- **[See, Hypothesize, Validate: Multimodal Agentic Framework for Discovering Governing PDEs](https://arxiv.org/abs/2608.27869)**：多模态 Agent 以观察--假设--验证发现 PDE，流程有执行反馈，单一科学领域与 coding 主线相邻。
- **[Decoupling is a Necessity: Transformation-Agnostic Decompiled Code Recovery under Optimization and Obfuscation](https://arxiv.org/abs/2608.27889)**：ReSource 将反编译恢复拆为词汇、语法、语义三层，8 万函数上有规模证据；模型偏检索/恢复而非闭环 repair。
- **[LandingAgent: A Reference-Annotated Dataset and Agentic Generation Framework for Landing Pages](https://arxiv.org/abs/2608.27902)**：LandingAgent 以 reference profile、wireframe 和 critique 生成可执行 landing page，评价偏美学与文案，功能 oracle 较弱。
- **[A User-Centric Context-Aware Permission Governance Framework for Privacy Control in Default Mobile Applications](https://arxiv.org/abs/2608.27914)**：默认移动应用权限治理框架与移动 Agent 安全相邻，但论文对象是用户隐私控制，不是 Agent 工具权限。
- **[Antipatterns in AI-assisted Qualitative Data Analysis: A Catalog of Temptations and Pitfalls for Software Engineering Researchers](https://arxiv.org/abs/2608.27927)**：总结软件工程研究者用 AI 做定性分析的反模式，适合方法论提醒，未提供 Agent 系统或后训练机制。
- **[The Illusion of $\textit{What If}$: Evaluating the Breakdown of Counterfactual Reasoning in LLMs](https://arxiv.org/abs/2608.27953)**：评测 LLM 反事实推理崩解，可作为 Agent 决策可靠性背景；没有工具执行或软件状态 oracle。
- **[When Evidence Shapes Collaboration: Knowledge-Conditioned Topology Generation for Multi-Agent Systems](https://arxiv.org/abs/2608.27984)**：按证据生成多 Agent 拓扑，关注协作结构自适应；结果若无固定下游栈，很难单独归因路由收益。
- **[GOD: Govern, Observe, and Direct - A Real-Time Control Room for Agent Societies](https://arxiv.org/abs/2608.27992)**：GOD 提供本地 Agent society 控制室和可移植 replay pack，15 个运行槽有初步可观测性证据，规模尚小。
- **[Moirae: A Multimodal Agent Collaborative Framework for Dynamic Android Malware Detection](https://arxiv.org/abs/2608.27994)**：Moirae 融合 UI、状态转移和运行 API 检测 Android malware，未微调达 90.06%，更像安全分析 Agent 而非软件 repair。
- **[Automated Analysis Framework for Multilingual Climate-Health Literature Based on Multi-Agent Large Language Model](https://arxiv.org/abs/2608.27998)**：多 Agent 自动分析多语种气候健康文献，属于领域工作流自动化，缺少通用工具可靠性与执行验证。
- **[PhenoIntel: A Lifecycle-Aligned Multi-Agent Web Application for Verified, Accessible Plant Phenotype Analysis](https://arxiv.org/abs/2608.27999)**：植物表型 Web 应用强调 verified 与 accessible lifecycle，系统集成有价值，但科研域和软件变更主线较远。
- **[The Impact of Magma: A Ground-Truth Fuzzing Benchmark](https://arxiv.org/abs/2608.28016)**：Magma ground-truth fuzzing benchmark 可为 bug-finding Agent 提供锚点，论文重点是 benchmark 影响而非新 Agent。
- **[Twin Worlds: Equivariance-Based Abstention for Evidence-Grounded Reasoning](https://arxiv.org/abs/2608.28018)**：Twin Worlds 以实体替换后的 equivariance violation 触发 abstention，适合 evidence grounding；不涉及软件执行状态。
- **[Speculative Probing: LLM Monitoring at Speculative-Decoding Cost](https://arxiv.org/abs/2608.28099)**：复用 speculative-decoding 模块做低开销 probe，在四模型四任务上优于轻量 guard；属于监控组件，不专门面向 Agent。
- **[CC4M: Code Clone Analysis and Visualization for Microservices](https://arxiv.org/abs/2608.28111)**：CC4M 做微服务代码 clone 分析与可视化，程序理解相关，但没有 LLM 或自动修改验证。
- **[RESTCov: A Tool for Structural Coverage Analysis of REST APIs](https://arxiv.org/abs/2608.28114)**：RESTCov 提供 REST API 结构覆盖分析，可作为 Agent 测试工具，论文没有评估 coding Agent 使用效果。
- **[From Architecture to Binary: Ensuring Cross-Domain Consistency in Model-Based Airborne Software Development](https://arxiv.org/abs/2608.28156)**：从架构到二进制的航空软件跨域一致性很契合验证理念，但工作不以 LLM Agent 为对象。
- **[CrabOS: An Operating System for Human-AI Co-inhabitation](https://arxiv.org/abs/2608.28165)**：CrabOS 探索人--AI 共居操作系统，属于 agent-native OS 设计；安全与实际 workload 证据仍早期。
- **[MaCoPlanner: LLM-Assisted Manual-Compiled Task Planning with Proactive Safety Verification for Robotic Industrial Panel Operation](https://arxiv.org/abs/2608.28300)**：MaCoPlanner 从手册编译 typed IR 并在执行前符号 rollout，成功率和拒绝率透明；与 PanelShield 高度同源，保留一篇速读即可。
- **[MAIL: Memory-driven, Adaptive, Incremental, and Literature-grounded Framework for Hypothesis Generation in Chemistry](https://arxiv.org/abs/2608.28315)**：MAIL 用记忆、自适应和文献 grounding 生成化学假设，长程科研流程相关，软件 change 证据较弱。
- **[AGENT-O: A Semantic Agent Card Framework for Interoperable and Governed Healthcare AI Agents](https://arxiv.org/abs/2608.28345)**：AGENT-O 用 OWL/RDF 与 SHACL 定义医疗 Agent Card；279 篇论文暴露运行架构和 provenance 报告缺口，但不评 Agent 质量。
- **[Sustainability of Open-Source Machine Learning Robustness Assessment Tools: A Repository Mining Study](https://arxiv.org/abs/2608.28396)**：挖掘开源 ML robustness assessment 工具的可持续性，属于 repository mining，与 Agent 自动维护只有间接关系。
- **[RetailAgent: Structured Adverse Timing in Self-Conditioned Multimodal LLM Trading Agents](https://arxiv.org/abs/2608.28399)**：RetailAgent 发现 LLM 交易决策存在可预测负时序，memory 加强策略持续性；领域风险有趣，不宜外推一般 Agent。
- **[When Verified Source Becomes Attack Input: Defending Smart Contracts Against LLM-Based Vulnerability Scanning](https://arxiv.org/abs/2608.28400)**：DeLLMGuard 通过多地址关系提高 LLM 扫描智能合约的难度，并验证部署关系；更偏攻防混淆，可能同时妨碍合法审计。
- **[Prove2Me: An Open Collaborative Platform for Scaling Math Formalization](https://arxiv.org/abs/2608.28433)**：Prove2Me 让多个 AI coding Agent 贡献 Lean 证明并机器检查，平台愿景强，尚缺大规模协作正确性与冲突实验。
- **[NL2AGBench: Benchmarking LLM Auto-Formalization for AlphaGeometry](https://arxiv.org/abs/2608.28481)**：NL2AGBench 用 AlphaGeometry 执行器验证自然语言到 DSL 的形式化，闭源模型 executable rate 超 80%；任务边界窄。
- **[A System-of-Systems Case Study for the Verification of Composed Digital Twins](https://arxiv.org/abs/2608.28498)**：组合数字孪生验证案例与系统之系统一致性相关，但没有 LLM Agent 或真实软件 patch 评估。
- **[Rethinking Vulnerability Remediation as a Capacity Allocation Problem](https://arxiv.org/abs/2608.28509)**：以多个 issue tracker 论证漏洞修复是容量分配而非只做优先级；对 AI 加速发现后的维护瓶颈重要，但不含 Agent 实验。
- **[When Robots Mishear Us: Mapping the Safety Risks of Voice-Controlled Embodied AI](https://arxiv.org/abs/2608.28518)**：系统梳理语音控制具身 AI 的误听安全风险，可作交互 Agent safety 背景，与代码变更和后训练机制较远。
- **[An Enclosed Mode Is a Gauge Choice: Topology Relative to Reach in Certified Code World Models](https://arxiv.org/abs/2608.28541)**：用拓扑与 reach 分析 certified code world model 的盲区，理论新颖但 instrument 极简，适合作为 oracle coverage 反例。
- **[Time Capsule of Testable Human Knowledge: 41 Years of Jeopardy! in a Single Free Local Model](https://arxiv.org/abs/2608.27459)**：在 52.9 万 Jeopardy 线索上测 14B 量化本地模型，强调知识时间胶囊；主要是评测，不是 post-training 方法。
- **[Sledgehammer or Scalpel? A Fine-grained Adaptive Framework for Implicit Hate Speech](https://arxiv.org/abs/2608.27462)**：隐性仇恨识别的细粒度自适应框架涉及安全分类，训练机制与通用 LLM 后训练主线不够中心。
- **[Marginal Coverage Credit Reduces Redundant Exploration in Parallel State-Entropy Optimization](https://arxiv.org/abs/2608.27507)**：Marginal Coverage Credit 改善并行策略非重复探索，理论上属 credit assignment，但对象是离散 RL policy 而非 LLM。
- **[When Muon Meets Task Interference: A Spectral Perspective on Continual Learning and Model Merging](https://arxiv.org/abs/2608.27518)**：从谱视角研究 Muon 下持续学习和模型合并任务干扰，适合机制背景，未聚焦 foundation-model post-training。
- **[LongGuard: Mechanistic Analysis and Training-Free Mitigation of Long-Context Failure in Safety Guardrails](https://arxiv.org/abs/2608.27580)**：LongGuard 做长上下文 guardrail 的机制分析与免训练缓解，安全重要，但属于 inference-time mitigation。
- **[Unsupervised Continual Learning with Growing Self-Organizing Maps and Synthetic Replay](https://arxiv.org/abs/2608.27662)**：Growing self-organizing map 与 synthetic replay 的无监督持续学习不是 foundation-model 后训练，保留关键词即可。
- **[Report Supervision](https://arxiv.org/abs/2608.27668)**：Report Supervision 用 4.1 万 CT 报告监督肿瘤分割，外测最高 +15%；监督信号新颖，但对象不是 LLM/VLM post-training。
- **[Diffusion Distillation for Efficient Weather Ensembles](https://arxiv.org/abs/2608.27728)**：天气 ensemble 的 diffusion distillation 有效率价值，模型类型和任务与 LLM 后训练相距较远。
- **[Beyond Search-Imitation: Prior-Directed Exploration for Searchless Chess](https://arxiv.org/abs/2608.27757)**：searchless chess 用 self-play RL 与 prior-directed exploration 提升战术、保留棋力，提醒准确率与 Elo 可解耦；领域专用。
- **[Fast Weight Attention for Continual Learning](https://arxiv.org/abs/2608.27763)**：Fast Weight Attention 把递归状态更新解释为在线学习规则，涉及持续适配，但主要是架构与语言建模。
- **[PersonaEdit: Representative Sample Selection for Personalized Model Editing](https://arxiv.org/abs/2608.27816)**：PersonaEdit 以表示聚类选择个性化 model-edit 样本并结合 retrieval，数据选择实用，编辑规模和长期干扰证据有限。
- **[Relational Knowledge Distillation Brings DNN Representations Close Enough to Humans to Be Aligned Without Supervision](https://arxiv.org/abs/2608.27877)**：关系蒸馏让 DNN 表示更接近人类认知，无监督对齐说法有趣，但不是 LLM student，也无 instruction/RL 阶段。
- **[StreamEMS: Streaming Video Understanding with Self-Evolving Memory Scheme for Vision-Language Models](https://arxiv.org/abs/2608.27881)**：StreamEMS 的 self-evolving memory 服务流式视频推理，主要是推理期记忆方案，不更新基础模型能力。
- **[OpenStamp: A Watermark for Open-Source Language Models](https://arxiv.org/abs/2608.27899)**：OpenStamp 为开源语言模型做水印，涉及模型发布治理，但不是能力/行为 post-training。
- **[AI Alignment through a Game-theoretic Lens: A Survey](https://arxiv.org/abs/2608.27910)**：从博弈论梳理 AI alignment，适合理论地图；综述不提供新的训练配方或可验证实验。
- **[Training-Free Temporal Abstraction for General Video Understanding](https://arxiv.org/abs/2608.27929)**：视频理解的 training-free temporal abstraction 属推理期压缩，不纳入核心 post-training。
- **[Temporal Memory-Aware Online Test-Time Adaptation on Dynamic Graphs](https://arxiv.org/abs/2608.27948)**：动态图 online test-time adaptation 使用 temporal memory，参数会更新但对象不是 foundation model，场景专用。
- **[Information-Guided Selective Modality-Interest Alignment for Multimodal Recommendation](https://arxiv.org/abs/2608.27950)**：多模态推荐的 modality-interest alignment 是推荐模型目标设计，和通用 LLM 对齐只共享术语。
- **[Dynamic Alignment Compensation for Hallucination Mitigation in Large Vision-Language Models](https://arxiv.org/abs/2608.28058)**：动态 alignment compensation 缓解 LVLM hallucination，属于推理或表示补偿，未形成通用 post-training recipe。
- **[SEPO: Evidence-Grounded Prompt Optimization via Structural Editing](https://arxiv.org/abs/2608.28067)**：SEPO 用结构编辑优化 prompt 并以证据 grounding，改的是提示而非模型参数，归入 inference optimization。
- **[Dual-Stream Semantic Guidance with Prototype Anchor Calibration for Source-Fully-Free Adaptation of Vision-Language Models](https://arxiv.org/abs/2608.28145)**：source-free VLM adaptation 以双流语义和 prototype anchor 校准，属于域适配，持续 LLM 后训练关联有限。
- **[Nested Byte-Level Vocabularies Are Cheap to Deploy and Expensive to Share: A Pre-Registered Negative Result](https://arxiv.org/abs/2608.28151)**：预注册负结果显示 nested byte vocabulary 部署便宜但跨模型共享昂贵，训练设计有启发，非 post-training 主问题。
- **[Biologically Inspired Mechanisms for Facilitating Grokking in Multilayer Perceptrons](https://arxiv.org/abs/2608.28184)**：用生物启发机制促进 MLP grokking，研究优化动力学，不涉及 LLM 对齐或后训练数据。
- **[Cut-ViT: Task-Specific Model Pruning via Gram Anchoring Subspace Consistency](https://arxiv.org/abs/2608.28205)**：Cut-ViT 以 Gram anchor 做任务剪枝，是视觉模型压缩，不属于 LLM post-training 核心。
- **[REINS: Refusal-Enhanced Inhibitory Steering with Sparse Autoencoder Features](https://arxiv.org/abs/2608.28233)**：REINS 用稀疏自编码特征增强拒绝 steering，安全相关但属于 activation intervention，未更新模型权重。
- **[D-TAIA: Domain-Aware LLM Adaptation for Multi-Task Predictive Process Monitoring](https://arxiv.org/abs/2608.28236)**：D-TAIA 对 10M backbone 做领域适配以预测流程，技术规模和任务使其更像传统 transfer learning。
- **[RECAST: Recent & Context-Aware Sampling for Test-Time Adaptation in Streaming Biosignals](https://arxiv.org/abs/2608.28271)**：RECAST 为流式生理信号做 test-time adaptation，和持续后训练只在在线更新概念上相邻。
- **[Deriving Scaling Laws for OpenEuroLLM Models: Learning Rate, Batch Size and Loss](https://arxiv.org/abs/2608.28308)**：OpenEuroLLM 的学习率、batch 与 loss scaling law 面向预训练，不应因含模型训练就误归为 post-training。
- **[Curvature-Conditioned Multiscale Momentum with Sphere Constraints for LLM Pretraining](https://arxiv.org/abs/2608.28442)**：曲率条件多尺度动量与球面约束明确是 LLM pretraining optimizer，非本期后训练主线。
- **[Training Communication-Efficient Mixture-of-Experts Language Models with Layer Re-Configuration](https://arxiv.org/abs/2608.28511)**：通过 layer re-configuration 训练通信高效 MoE LM，属于从头训练系统效率，不是现成模型 post-training。
- **[Learning a Size-Weight Frontier for Synthetic-Augmented Inference](https://arxiv.org/abs/2608.28576)**：研究 synthetic-augmented inference 的 size-weight frontier 偏统计方法，未直接改变 LLM 后训练能力。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 主要证据 | 可信边界 |
|---|---|---|---|---|
| [Grounded Checklist Partial Credit for Agent Skill Trajectories](https://arxiv.org/abs/2608.27487) | 长程技能的局部进展 | 日志证据 checklist + 官方 verifier | 4,455 轨迹，AUC 0.689 | 实例化 judge 与 checklist 覆盖 |
| [ROPE: Routed Origin Policy Enforcement against Indirect Prompt Injection](https://arxiv.org/abs/2608.27496) | 间接注入的参数来源 | 不可伪造 origin policy | ASR 1.6%--2.6% | 来源标注和 guard 字段必须完整 |
| [WM-R1: Training GUI Agents to Reason and leverage World Models with Reinforcement Learning](https://arxiv.org/abs/2608.27508) | 无真实环境的 GUI RL | 世界模型 rollout + 调用奖励 | AndroidWorld 39.8%，+9.0 | 模拟误差与筛题偏差 |
| [If Agents Were Angels, No Governance Would Be Necessary: Out-of-Band Policy Enforcement at a Trusted Tool Boundary](https://arxiv.org/abs/2608.27646) | 凭据过宽与数据泄露 | 请求前缩权、响应后过滤 | 3,621 试验，failure 57.6%→0.2% | 不保证跨时聚合非干扰 |
| [Why Didn't It Check? Unsupported Final Claims and Their Repair in Two Tool-Equipped Language Models](https://arxiv.org/abs/2608.27768) | 未检查就做最终声明 | 精确状态 matched replay | 33/33 证据修复，0/33 控制修复 | 两个合成任务族 |
| [ContextLeak: Exfiltrating LLM Agent Context via Malicious Tools](https://arxiv.org/abs/2608.27800) | 恶意工具诱导上下文外泄 | RL 优化工具名/描述和参数泄露 | 跨 shadow/victim 上下文仍有效 | 工具集合与模拟上下文依赖 |
| [CURA: Certified Runtime Alarms for Computer-Use Agents](https://arxiv.org/abs/2608.27808) | CUA 失败仍声称成功 | 只读遥测序贯告警 | 42.3% 召回，假警 0.066 | 证书只约束假警 |
| [RealSWE: A Compositional Evaluation of Coding Agents under Realistic User Requests](https://arxiv.org/abs/2608.27831) | 真实短请求与 SWE-bench 差距 | 同 gold patch 多变体家族 | 真实化输入平均 -6.4 点 | 仍源自 SWE-bench |
| [openJiuwen: Beyond Static Harnesses for Long-Horizon Coding Agents](https://arxiv.org/abs/2608.27969) | 长程 harness 组合与适应 | Rail + evolving-evidence runtime | 82.6% / 87.19% | 排行榜协议不完全匹配 |
| [Compared to What? A Human-Anchored Security Benchmark for LLM-Generated Infrastructure-as-Code](https://arxiv.org/abs/2608.28021) | IaC 安全是否比人差 | 规模匹配人类基线 | 模型漏洞密度 3.21--3.87 倍 | 静态扫描不等于可利用性 |
| [VICT: Verifier-Instrumented Credit Tracing for Long-Horizon LLM Agent Reinforcement Learning](https://arxiv.org/abs/2608.28128) | 终局 verifier 的动作信用 | atom + proof edge tracing | ALFWorld +18.2，WebShop +24.9 | 依赖忠实 verifier 接口 |
| [Post-Edit Re-Verification in Simulator-Backed Engineering Agents: A Controlled Comparison of Verification-Cadence Guidance](https://arxiv.org/abs/2608.28147) | 修改后旧证据失效 | 显式 re-verification cadence | 重验证 94/120 vs 32/120 | 测提示遵循而非自发识别 |
| [LoopArena: Benchmarking Models as Runtime Controllers for Loop Engineering](https://arxiv.org/abs/2608.28281) | Controller 与 Worker 能力混淆 | 三层 Loop Contract 评测 | Strict Success 24.69% | 固定 Worker 与摘要 schema |
| [EvoUndo: Recoverability-Constrained Self-Evolution for LLM Agent Harnesses](https://arxiv.org/abs/2608.28363) | Agent 自改不可撤销 | 反事实恢复 witness 与 calculus | 常规修复 0/197，oracle 191/197 | 部分交互模型依赖 |
| [Fidelity Is Not Enough: Dispatch-Level Instrumentation for Agentic Datasheet Extraction](https://arxiv.org/abs/2608.28439) | 偶然正确但未读源文档 | dispatch-level silent-failure detector | 207 clean 零误报，50 fault 全检出 | fault recall 按规则构造 |
| [On the Maintenance and Co-evolution of Agent Plugins: An Empirical Study of Claude Code Plugin Marketplaces](https://arxiv.org/abs/2608.28497) | plugin 是否需要共同维护 | marketplace commit/co-change 挖掘 | 8,351 插件，78% 功能耦合 co-change | 单生态与分类噪声 |
| [Recognition Without Enforcement: Configuration-Dependent Failures in LLM Agent Instruction Arbitration and External Control](https://arxiv.org/abs/2608.28502) | 识别权威却仍执行 | probe + fleet audit + 外部 monitor | 98.7% 识别、99.3% 执行案例 | 部署窗口与配置依赖 |
| [Offline-Verifiable Accountability for Cross-Organization Agent Messaging: A Preserved Evidence-Bundle Approach](https://arxiv.org/abs/2608.28542) | 跨组织 Agent 争议证据 | policy-controlled 离线 bundle verifier | 1,200 有效 bundle，负例全拒 | 腐坏模型与密钥生命周期有限 |
| [Quantization-Triggered Backdoors in Language Models: Cross-Quantizer Transferability and the Validation--Deployment Gap](https://arxiv.org/abs/2608.27512) | 量化后的行为后门 | QBEC + 三阶段对抗微调 | 量化后 inversion 最高 85.02% | 合成场景与小模型 |
| [Below the Noise Floor: Bimodal Seed Collapse and Distinct Failure Modes in Small-Model Knowledge Distillation](https://arxiv.org/abs/2608.27729) | 小模型 KD seed 坍塌 | 3--6 seed 与错误模式审计 | 标准差最高 48.7 点 | 单一 API routing 任务 |
| [CoRe-MoE: Compact Reusable MoE for Continual Multimodal Instruction Tuning](https://arxiv.org/abs/2608.27867) | 持续多模态调优参数膨胀 | 共享 LoRA 方向基 + 坐标 expert | 最终平均最高 +5.90 点 | 固定任务边界与顺序 |
| [Rubric-to-Code Credit Assignment for Reinforcement Learning](https://arxiv.org/abs/2608.27906) | 网页代码序列奖励过粗 | rubric 到代码 span/token | MiniAppBench +32.20 | attribution judge 可能共偏 |
| [When Teacher Guidance Misleads: Reward-Aligned On-Policy Distillation](https://arxiv.org/abs/2608.27960) | OPD teacher 与 outcome 冲突 | reward-aligned 轨迹过滤 | 数学 avg@k +4.91 至 +5.20 | 要求可信终局 verifier |
| [Learning from Hard Prompts: Difficulty-aware Advantage Amplification in Dynamic Sampling](https://arxiv.org/abs/2608.27982) | 困难 prompt 正确样本被弱化 | 直接 advantage amplification | 平均准确率至少 +4.95 | 数学域与固定 group size |
| [Coverage, Not Credit: Failure-Credit Routing of Zeroth-Order Perturbation Budgets Does Not Improve On-Pool Sample Efficiency for LLM Agents](https://arxiv.org/abs/2608.28011) | credit 是否应路由扰动预算 | matched-budget 负结果 | on-pool 无至少 2 点增益 | 不否定其他优化器/域 |
| [VISTA: Verifier-Informed Student-to-Teacher Adaptation for On-Policy Self-Distillation](https://arxiv.org/abs/2608.28306) | privileged teacher 也会误导 | verified student 反向适配 teacher | 三尺度 +0.6/+0.7/+2.1 | 数学 verifier 与小幅增益 |
| [Post-Training VLMs for Video Mistake Detection](https://arxiv.org/abs/2608.28406) | 未见流程的视频错误 | discrepancy reward post-training | EP-VQA 最高 +11.6% | 可见错误与标签覆盖 |
| [Program Learning with Verifiable Rewards: Symbolic Backpropagation for Post-Training LLMs](https://arxiv.org/abs/2608.28421) | 可验证推理是否必须进权重 | typed program symbolic backprop | matched-budget 比 RL +27.8 | 依赖 primitive library |
| [Learning to Use Tools: Reinforcement Learning for Tool-Integrated Mathematical Reasoning](https://arxiv.org/abs/2608.28447) | 工具数学 RL | SFT warm-up + 终局 RL | pass@1 35.8%→66.0% | 单一计算器任务 |
| [Acquire, Repair, Preserve: A Diagnosis-Guided Post-Training Recipe for Small-Model Dialogue Game Agents](https://arxiv.org/abs/2608.28458) | 小模型交互能力与局部修复 | Acquire--Repair--Preserve | clemscore 10.67→38.92 | 域外 clemscore 仅 7.88 |
| [ContextPilot: Teaching Agents for Proactive Context Management via Fine-grained RL](https://arxiv.org/abs/2608.28476) | 长程上下文自我管理 | 关键编辑点 branching + 局部信用 | 平均 +3.55，BrowseComp+ +5.34 | 记忆过期与工具语义 |


## 我的判断

**整体创新性：A-。** coding-agent 线的创新集中在评测对象变化：从最终 patch 转向请求信息、工具 origin、dispatch、证据时效、Controller、plugin dependency 和 recovery witness。post-training 线则把 reward 从整段序列下沉到 verifier atom、rubric-code span、困难 prompt、student-teacher 方向和 context snapshot。并非每篇都提出新优化器，但不少论文重新定义了“什么证据才授权更新”。

**实用价值：A。** ROPE、OBPE、CURA、GCPC、VICT、EvoUndo 和 ContextPilot 都给出可实现的接口；RealSWE、LoopArena、GenIaC-SecBench 与 plugin marketplace mining 则修正了 benchmark 与维护对象。真正的代价是系统需要版本化 origin、verifier、telemetry、controller summary 和 rollback semantics，可靠性不会由更长 prompt 免费获得。

**严谨性：B+。** 当天最可信的工作使用 matched replay、human anchor、paired seeds、exact sign-flip、typed abstention、counterfactual state 和明确的负结果。主要不确定性仍是程序化 verifier 的封闭世界、LLM judge 共盲、合成任务与小样本、API deployment-window drift，以及排行榜配置不可比。尤其要警惕把“识别”“解释”“有日志”直接等同于“阻止”“正确”“可审计”。

**推荐价值：A。** 如果只读 coding-agent 线，优先看 GCPC、ROPE、CURA、RealSWE、LoopArena、EvoUndo 和 plugin co-evolution；如果只读 post-training，优先看 VICT、RA-OPD、DA3PO、RCCA、PLVR、ContextPilot，以及小模型 KD 的多 seed 负结果。今天最稳的总判断是：先让 evidence、state、authority 与 credit 的边界可执行，再讨论 Agent 或模型是不是更强。
