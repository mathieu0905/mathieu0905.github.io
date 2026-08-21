---
title: "当表面成功不再够用：8 月 20 日 arXiv 的执行 Oracle、局部 Credit 与可演化 Harness"
date: "2026-08-21"
description: "8 月 20 日的新论文把可靠 Agent 与 post-training 的共同难点推进到可执行状态、可定位信用和可审计演化。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Post-Training", "RLHF", "RLVR", "程序修复", "OpenHarmony"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-zinc-950 via-teal-950 to-rose-950"
---

2026 年 8 月 20 日这批论文不缺新 benchmark 和训练算法，但真正值得读的变化是：研究者越来越不接受“输出看起来对”作为完成标准。coding-agent 一侧把难度、UI 组件、PLC runtime、移动设备、语义保持扰动和项目专属知识都纳入验证；post-training 一侧则把监督拆到 verifier 选择、skill token、turn、teacher-verifier 分歧与可执行环境。两条主线各自成立，却共同指出同一个风险：如果 oracle 没有触达真实状态，或者 credit 没有落到真正的决策，最终分数很容易奖励错误原因。

本轮逐项核对 arXiv 官方 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG，并补充 cs.IR、cs.CV、cs.CR、cs.OS 的 `pastweek` 页面，九类页面均定位到 **Thu, 20 Aug 2026**。合并 New 与 Cross submissions 后得到 **431 篇唯一条目**，最终纳入 **84 篇实质相关论文**：coding-agent / software-change 39 篇，post-training 55 篇，其中 10 篇同时属于两条主线。21 篇强相关论文均从 `https://arxiv.org/pdf/<id>` 下载并完成 `%PDF`、大于 20KB、`pdftotext -layout` 与首页渲染检查；33 篇中相关和 30 篇可留意项以官方摘要、元数据及必要的全文定位筛选。

## 今日脉络

第一条脉络是 **oracle 继续向真实运行边界推进**。SemaPLC 用 live runtime trace 拉开静态分数相近的方法，AppEval 要求同一应用真正 build-install-launch-test，ComponentBench 用程序终态定位组件级失败。绿色构建、judge 赞同或一次 target test 都只是证据的一层。

第二条脉络是 **可靠性要在等价扰动和重复运行下测**。A Jagged Frontier 显示代码语义不变仍会改变 Agent 成败，issue 难度研究则发现 17.7% 任务在重复运行间混合成败。模型、scaffold、接口与任务结构共同决定结果，单一榜单名次越来越难解释。

第三条脉络是 **post-training 的 credit 被推向真正动作**。SkillGate 只给 skill 选择 token 局部 advantage，RTPO 从末轮反向分配 turn credit，DART-SD 只修复首个拓扑断点，GC-OPD 用 verifier-teacher residual 修正 dense token supervision。它们都拒绝把同一 sequence reward 平均广播给整条轨迹。

第四条脉络是 **训练系统开始承认自己也会锁死、失衡和遗忘**。Open-MOPD 追踪 token budget 与 reward staleness，Continual Reasoning Gym 区分遗忘和错失正迁移，HCL 把 harness update 纳入持续学习，AI-for-AI 分析则指出 Agent 很会调参，却不会在实验中途推翻初始策略。

## 强相关论文深读

### 1. Adversarial Review: Structured Disagreement for Grounded Agentic Code Review

**论文信息**：*Adversarial Review: Structured Disagreement for Grounded Agentic Code Review*；Qiu, Eric S., Gill, Joyce；[arXiv:2608.18167](https://arxiv.org/abs/2608.18167)；Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：用 reviewer 与 critic 的结构化分歧替代堆叠更多 Agent，让代码审查在较低通信成本下获得更可靠的修订信号。

**为什么值得推荐、方法怎么工作**：论文把主 Agent、reviewer 和 critic 组织成两层循环：主 Agent 先产出代码及 change log；reviewer 检查固定版本；critic 只审计 review 是否有证据、是否遗漏；二者收敛后才把结论交回主 Agent 修改。Figure 1 的关键不是角色数量，而是把“审代码”和“审审查”分开，并显式要求 disagreement。这样既能定位 false consensus，也避免多个 reviewer 各说各话。

**关键实验、局限与当天主题**：LiveCodeBench 的 105 题中，AR 达到 87%，hard 子集为 43/57；五 Agent 的 MARS 为 82% 和 39/57，而零样本与 self-refine 都是 77%。SWE-PRBench 又暴露 naive AR 会形成无证据共识，加入显式分歧约束后才恢复最佳 F1；SWE-bench Verified 方向一致。可信处在于三类任务分别测生成、审查和仓库修复；局限是主要实验固定 Claude Sonnet 4.5，同一模型扮演多个角色，相关错误和额外 token 成本仍未消失。

### 2. What Makes Software Issue Resolution Tasks Difficult for Agents?

**论文信息**：*What Makes Software Issue Resolution Tasks Difficult for Agents?*；Al-Haque, Ebtesam, Johnson, Brittany；[arXiv:2608.18280](https://arxiv.org/abs/2608.18280)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL); Machine Learning (cs.LG)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：仓库级 issue 难度并非纯粹随机：补丁碎片化和仓库规模已能静态预测相当一部分 Agent 成败。

**为什么值得推荐、方法怎么工作**：作者把 CoderForge-Preview 的任务拆成 gold patch、repository 和 issue prompt 三组特征，再分别预测 any-success、majority-success 与连续 pass rate。流程包括特征抽取、组内和组间 ablation、随机森林/XGBoost 拟合，以及 SHAP 与 effect size 解释。其价值是把 benchmark 总分拆回任务结构，Figure/Table 体系回答“什么使任务难”，而非只继续比较模型。

**关键实验、局限与当天主题**：数据含约 45.8 万个任务结果；XGBoost 对 any-success 的 AUC 为 0.863、MCC 0.549，随机森林同样达到 0.863；连续 pass rate 的 R2 约 0.408-0.409，明显高于线性模型 0.169。17.7% 任务在重复运行间混合成败，说明模型随机性仍是不可约部分。最重要的限制是部分最强特征来自 gold patch，真实接单前不可见；数据也集中于单一轨迹库与特定 Agent。因此它更适合难度控制和事后解释，不能直接当部署路由器。

### 3. ComponentBench: Diagnosing Component-Level Failures in Computer-Use Agents

**论文信息**：*ComponentBench: Diagnosing Component-Level Failures in Computer-Use Agents*；Guan, Tianchen, Lin, Xinlei, Cheng-Yue, Royce, Wang, Xiangjun, Zhou, Shuyan；[arXiv:2608.18307](https://arxiv.org/abs/2608.18307)；Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Human-Computer Interaction (cs.HC)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：ComponentBench 填补原子点击与长流程之间的评测空层，用可程序验证的 UI 组件任务定位 computer-use Agent 的具体失败机制。

**为什么值得推荐、方法怎么工作**：benchmark 先建立跨组件库的 97 类 canonical component ontology，再生成 2,910 个带确定性终态检查的任务，并保存人类参考轨迹。随后在 accessibility tree、DOM/Browser-Use 与 pixel 坐标等四种 observation-action space 下运行 Agent；最后用结构难度审计和 failure taxonomy 汇总错误。Figure 1 展示组件、场景、轨迹和诊断如何闭环，Core 子集则重生成 912 个未饱和难题。

**关键实验、局限与当天主题**：七个模型的同 harness 对照显示，GPT-5 mini 仅因接口从 accessibility tree 换为 pixel 就从 83.1% 跌到 48.9%；最快配置也需人类 3.7 倍时间。Core 上 GPT-5.4 mini pixel 由 77.1% 降至 37.7%，Opus 4.6 也只有 65.4%。证据把模型与接口效应分开，很适合解释 GUI Agent 可靠性；但任务来自三类主流组件库、排除 CAPTCHA 与 bespoke widget，程序 oracle 也主要验证终态，不覆盖误触副作用和真实网站漂移。

### 4. Task-Conditioned Least-Privilege Learning for Executable Terminal and MCP Agents

**论文信息**：*Task-Conditioned Least-Privilege Learning for Executable Terminal and MCP Agents*；Tu, Alexander, Tu, Michael；[arXiv:2608.18351](https://arxiv.org/abs/2608.18351)；Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG); Systems and Control (eess.SY)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：把最小权限从外部 gate 的一次判定变成可训练行为：模型学习为具体任务选择刚好够用的 terminal/MCP 权限。

**为什么值得推荐、方法怎么工作**：框架先为每个任务定义 sufficient-authority envelope；broker 在动作执行前解析命令与工具风险，执行后再根据真实状态做二次审计；六维风险、完成证据、禁止尝试和 exact state 一起形成可验证 reward。Qwen3.5-4B 在 1,500 个任务上 post-training，随后用冻结的 500 个 held-out task、外部 benchmark 和 continuation study 检查安全成功、权限过量与能力保持。Figure 1 把 policy、broker、terminal/MCP 与 verifier 串成闭环。

**关键实验、局限与当天主题**：所选 seed 在 2,896 个评估 episode 上 safe success 达 98.48%，base 为 64.36%；excess-authority event 从 4.56% 降到 0.79%。400-task continuation 又降低 6.99 个百分点，同时保持既有能力；ToolPrivBench 和 MetaTool 也给出外部方向性证据。边界同样明确：envelope 与 verifier 是人工预定义的，训练学到的克制可能只覆盖已枚举风险，4B 单模型与合成 executable task 不能代表开放环境。论文也正确强调它是 sandbox 和 permission gate 的补充，不是替代。

### 5. A Jagged Frontier: Evaluating Robustness of Code Agents to Semantics-Preserving Transformations

**论文信息**：*A Jagged Frontier: Evaluating Robustness of Code Agents to Semantics-Preserving Transformations*；Mahmud, Hasan Najib, Gupta, Shreya, Chaudhary, Isha, Enis, Nathaniel, Mangal, Ravi, Singh, Gagand 等；[arXiv:2608.18389](https://arxiv.org/abs/2608.18389)；Artificial Intelligence (cs.AI)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：代码语义不变并不保证 Agent 行为不变，而且鲁棒性排名会随 scaffold 改变，模型能力不是单一标量。

**为什么值得推荐、方法怎么工作**：作者定义 14 种 semantics-preserving transformation，包括控制流改写、dead code 与 identifier rename；random variant sampler 在保持测试语义的前提下为同一 issue 生成多个版本。实验对每个原始与扰动实例重复运行，用 paired resolve-rate 隔离 Agent 随机性，再跨 mini-SWE-agent/OpenCode、四个 frontier model、SWE-bench Verified/Pro 比较。Figure 1 画出的不是统一赢家，而是模型-scaffold 组合的 jagged frontier。

**关键实验、局限与当天主题**：16 个 model-scaffold-dataset 配置中有 6 个出现统计显著下降，最受影响配置平均跌 6.7 个百分点；Qwen 在 mini-SWE-agent 的 Verified 上较稳，却在 OpenCode 下最脆，较简单 scaffold 反而整体更稳。这类 matched perturbation 比一次 Pass@1 更能测部署稳定性。局限是变换只覆盖可自动验证的 Python 表面变化，排除了 baseline 从未成功的任务，可能低估极难任务的敏感性；多次昂贵运行也限制样本规模，尚不能推断真实重构、依赖升级或多语言迁移。

### 6. DART-SD: Diamond-topology Aware Retrieval and Tuning for Self-Distillation of Multi-Turn Tool-Calling Agents

**论文信息**：*DART-SD: Diamond-topology Aware Retrieval and Tuning for Self-Distillation of Multi-Turn Tool-Calling Agents*；Xu, Hangrui, Wang, Jiarui, Yang, Yang, Zhu, Chuanbo, Chen, Fangda, Wu, Ziqi, Cai, Jingming, Song 等；[arXiv:2608.18524](https://arxiv.org/abs/2608.18524)；Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG); Multiagent Systems (cs.MA)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：DART-SD 只在工具轨迹首次偏离可恢复结构的位置施加监督，避免完整轨迹 imitation 把合法探索一并惩罚。

**为什么值得推荐、方法怎么工作**：方法把多子目标工具调用建成可汇合的 Interaction-State Transition Graph，保留顺序不同但终态等价的 diamond topology；rollout 失败后定位 Critical Topological Breakpoint；从成功分支检索 recovery reference；训练时冻结有效 prefix，只对恢复步骤计算 localized loss，并以渐进课程继续采样。Figure 2 的核心是状态图上的局部纠错，而非把每条参考轨迹当唯一答案。

**关键实验、局限与当天主题**：实验覆盖 FTRL、BFCL、ToolHop、tau-bench 与 RoTBench，Qwen3-4B/8B 均取得最高平均结果；8B 在 FTRL、ToolHop、tau-bench 甚至超过 teacher。成功轨迹平均工具调用从第 1 轮 4.23 次降到第 5 轮 3.55 次，thinking 设置的四项通用平均由 43.92 升至 49.89。证据支持局部监督兼顾成功率与效率，但状态原子化、CTB 和成功图依赖可验证工具环境；真实 API 的非确定性、不可逆副作用和不完整 observation 可能破坏“同状态可汇合”的假设。

### 7. SemaPLC: A Project-Grounded, Verification-Gated Agent Harness for PLC Code Generation

**论文信息**：*SemaPLC: A Project-Grounded, Verification-Gated Agent Harness for PLC Code Generation*；Tu, Yanlun, Wang, Huacan, Zhou, Ziyue, Zhou, Jie, Zhu, Ningyan, Chen, Ge, Chen, Wangyi, Zhou, Ten 等；[arXiv:2608.18565](https://arxiv.org/abs/2608.18565)；Software Engineering (cs.SE)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：PLC 代码只有在真实运行时轨迹正确才算完成；静态分数接近的 Agent，动态行为可以相差一倍。

**为什么值得推荐、方法怎么工作**：SemaPLC 先读取项目上下文与任务 specification，生成 Structured Text 候选；再依次通过需求检查、RuSTy 编译/静态分析、项目集成和 live PLC runtime trace comparison。任何 gate 失败都会带证据回到 Agent 修复，只有外部日志确认所有层通过才结束。Figure 1 把 harness 与三层 oracle 放在同一项目状态中，避免模型自称完成或只验证独立 POU。

**关键实验、局限与当天主题**：117 个 function task、7 个模型上，严格 verified pass rate 均领先，平均 72.6%，比 bare generation 高 17.3 点。65 个 project-context task 上，集成编译均值 89.4%，动态分数 52.2；baseline 动态均值只有 22.4-31.4，而静态均在 71.7-75.7。层级 ablation 从生成到加 runtime gate，动态分数 23.1→30.3→43.7→54.1。局限是 PLC 任务和 oracle 来自特定 corpus，最多六个场景难覆盖连续控制安全；34.1 次请求/任务的成本也很高，52.2 仍远非可部署可靠度。

### 8. FACET: Preserving Source Intent and Executable State in Terminal Task Synthesis

**论文信息**：*FACET: Preserving Source Intent and Executable State in Terminal Task Synthesis*；Shi, Kou, Wang, Zun, Su, Qisheng, Huang, Shiting, Zhang, Ziao, Fang, Zhen, Ren, Qingnan, Liu, Jin 等；[arXiv:2608.18580](https://arxiv.org/abs/2608.18580)；Artificial Intelligence (cs.AI) ; Programming Languages (cs.PL)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：FACET 先构造并修复共享容器状态，再生成 instruction、solution 和 verifier，使 terminal 训练数据不因跨 artifact 假设不一致而失真。

**为什么值得推荐、方法怎么工作**：pipeline 从异构 skill 中重建带目标、依赖和约束的 scenario；先实现 container state 并执行修复；再按 instruction→solution→verifier 的顺序生成 artifacts；最后用真实执行逐项验证，针对失败 artifact 修补而不是整体重采样。Figure 2 对照 forward、reverse 和 joint generation，说明 verifier 若先于 solution，容易把错误 contract 固化。通过的 teacher trajectory 再用于不同尺度 Qwen3.5 的 SFT。

**关键实验、局限与当天主题**：最终得到 6,078 个验证任务，整体验证率 81.63%；对照实验中 forward 初始有效率 46.5%，reverse 24.2%，修复后 yield 为 83/100 对 63/100。仅 1.2K 成功轨迹就让 4B/9B/27B 在 Terminal-Bench 2.1 分别 +7.12/+8.24/+6.75，27B 达 47.57，接近 397B 的 49.06。限制是生成器、repair budget 与 verifier 共同变化，不能把收益全归因某一步；自动 oracle 仍可能共享盲点，任务由 skill 重组也不等于真实用户需求。

### 9. AppEval: A Unified Benchmark for LLM-Based Mobile Application Repair in ArkTS, Swift, and Kotlin

**论文信息**：*AppEval: A Unified Benchmark for LLM-Based Mobile Application Repair in ArkTS, Swift, and Kotlin*；Xie, Bang, Liu, Hao, Shi, Zhenyu, Zhang, Yonghao, Zhang, Senjian, Peng, Zhiyuan, Yin, Xin, Ying 等；[arXiv:2608.18588](https://arxiv.org/abs/2608.18588)；Software Engineering (cs.SE)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：AppEval 把移动修复的 build-install-launch-test 边界纳入 oracle，并首次用统一协议覆盖 ArkTS、Swift 和 Kotlin。

**为什么值得推荐、方法怎么工作**：每个实例绑定 issue、defective revision、hidden behavior test 与 reference production fix，但 Agent 看不到后两者。相同 installed-app target 必须在缺陷版本到达 assertion failure、在修复版本通过；SDK、device、launch crash 和 timeout 被单列为 infrastructure outcome。Figure 1/2 将三平台原生 build system、runner 与两状态 acceptance contract 映射到共同 schema，避免“测试没跑起来”被算作补丁失败。

**关键实验、局限与当天主题**：当前审计完成的 Android 分区含 24 个可构建仓库、200 个 instrumentation task，5 个 Agent 的 Pass@1 从 22.00% 到 90.50%，1,000 次评估均得到 resolved outcome、无基础设施悬案。这个 68.5 点跨度说明 evaluator 固定后 Agent 选择仍极关键。可信度来自设备级动态 oracle 和日志保全；但定量结果明确只属于 Android，HarmonyOS/ArkTS 与 iOS/Swift 尚无审计分数，单一 target test 不证明无回归，公开 issue 还存在训练污染风险。

### 10. SkillGate: Training In-Policy Skill Selection in Long-Horizon Agents

**论文信息**：*SkillGate: Training In-Policy Skill Selection in Long-Horizon Agents*；Li, Qingyao, Jiao, Wenxiang, Shao, Shuai, Zhang, Kangning, Lu, Yuan, Guo, Yi, Liu, Weiwen, Zhang 等；[arXiv:2608.18852](https://arxiv.org/abs/2608.18852)；Artificial Intelligence (cs.AI)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：SkillGate 把 skill 选择 token 与后续执行 token 的 credit 分开，修复长轨迹中选择动作被终局奖励淹没的问题。

**为什么值得推荐、方法怎么工作**：作者先从训练 artifact 证明 selector credit starvation：skill 名称只占极少 token，sequence advantage 随轨迹变长而稀释，而且正确 skill 也会因后续执行失败得到负梯度。SkillGate 将 token support 分成互斥通道：outcome reward 只更新执行 token，action-local advantage 只更新 skill-naming token；正确选择才获得正 credit。Figure 2 展示这一局部 credit 与正常 agentic RL 如何并行。

**关键实验、局限与当天主题**：在 16-candidate slate 和五个 agent benchmark 上，9B policy 的 trial success 从 40.8% 升到 53.2%，明显超过同预算 outcome-only RL；误导 skill 暴露下降约三分之二，读取 skill 数也更少。训练 artifact 中三种 starvation 现象都随 horizon 单调恶化，给出了机制证据。局限是实验假设每轮只读一个、且存在可判定的正确 skill；多 skill 组合、skill 内容质量与开放环境中“多个都够用”的选择会使局部标签更难构造。

### 11. SkillForge: Self-Distilling Agents for Project-Specific Issue Resolution

**论文信息**：*SkillForge: Self-Distilling Agents for Project-Specific Issue Resolution*；Chen, Silin, Li, Han, Gu, Xiaodong, Shi, Yuling, Guan, Haibing；[arXiv:2608.18933](https://arxiv.org/abs/2608.18933)；Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：SkillForge 不等真实 issue 暴露知识缺口，而是从仓库自身合成可测试问题，提前蒸馏项目专属技能。

**为什么值得推荐、方法怎么工作**：框架先定位测试覆盖的核心功能与 repository entity；把已有实现暂时视为待重建目标，合成 project-specific issue；让 Agent 在真实仓库中解决并执行测试；再从成功轨迹抽取 entity-grounded skill，并建立实体到 skill 的索引，未来 issue 到来时按相关实体检索。它把 repository exploration、issue synthesis、repair 和 skill distillation 组成离线准备阶段，避免每个真实问题都重新长程探索。

**关键实验、局限与当天主题**：论文在开放与闭源模型、多个项目和 issue-resolution baseline 上报告一致提升，并通过不同 skill 获取方式的对照支持“主动合成”而非单纯增加上下文。最值得推荐的是训练信号由仓库测试和实现约束，而非泛化的自然语言总结。边界在于 re-implementation task 可能更接近现有实现、比真实 issue 简单；测试覆盖薄弱会把错误知识蒸馏成 skill，且公开仓库历史仍有污染可能。摘要未给出统一可比较的绝对增益，复现时应重点核对项目切分和合成 issue 泄漏。

### 12. Harness Continual Learning: Continual Adaptation Beyond Model Parameters

**论文信息**：*Harness Continual Learning: Continual Adaptation Beyond Model Parameters*；Kang, Borui, Gu, Jinrui, Lv, Junhan, Li, Wenbin, Wang, Lei, Gao, Yang；[arXiv:2608.19013](https://arxiv.org/abs/2608.19013)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：持续学习不只发生在权重里：prompt、memory、tool、skill 与 router 的更新同样会遗忘已可靠的行为。

**为什么值得推荐、方法怎么工作**：HCL 把冻结 foundation model 外围的 Task Interface、Experience Memory、Capability Map 和 Adaptive Router 定义为可学习状态。每次任务后 Continual Optimizer 根据反馈提出候选 harness，但不直接提交；Continual Evaluator 同时检查当前改进、历史保留和结构有效性，只有通过才 commit。Figure 1 的 guarded evolution 把“提出更新”和“改变生产状态”分离，能够调节 stability-plasticity。

**关键实验、局限与当天主题**：文本推理、多模态感知和开放交互三类实验中，多项相对基线增益超过 10%，component ablation 说明四类状态都贡献能力；retention sweep 又观察到可量化的 harness-level forgetting，并可通过 gate 强度调节。论文开辟了重要评测单位，但证据仍来自作者定义的 harness 和任务序列，冻结模型不代表真实系统版本也冻结；历史测试集可能膨胀，evaluator 自身还有覆盖盲点。因此结论是外围状态需要 continual-learning discipline，而非 HCL 已解决长期 Agent 演化。

### 13. SPADE: Self-Play in Adaptive Synthetic Executable Environments

**论文信息**：*SPADE: Self-Play in Adaptive Synthetic Executable Environments*；Liu, Bo, Yu, Simon, Jiang, Yiding, Qu, Ao, Zhao, Andrew, Liu, Zichen, Kim, Junsu, Zhou, Zijian, K 等；[arXiv:2608.19197](https://arxiv.org/abs/2608.19197)；Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：SPADE 让 LLM 同时学习设计可执行环境与在其中行动，使训练任务分布随能力增长，而不是被固定题库锁死。

**为什么值得推荐、方法怎么工作**：一个角色作为 Environment Designer，输出含 reset/step、状态转移、reward 与 verifier 的完整环境代码；另一个角色作为 Reasoning Agent 在其中 rollout。Designer 用“有无 privileged hint 的 reward gap”估计 regret，优先生成刚好位于能力边缘且仍可解的环境；预训练语料文档提供 grounding，累计 environment memory 防止重复。Figure 1 将环境生成、验证、Agent 训练与反向 curriculum 连成 self-play。

**关键实验、局限与当天主题**：扩展到 30B 后，SPADE 在八个 held-out 数学、科学、代码和推理 benchmark 上比最佳 fixed-environment baseline 平均 +5.3；工具使用在 BFCL-v4 multi-turn +5.7、ACEBench-Agent +13.9，game 增益随模型规模扩大。覆盖面和 scaling 趋势很强，但 Designer 与 learner 是同一模型家族，privileged hint gap 不是环境质量的充分条件；自动生成 reward/verifier 可能产生可投机漏洞，文档来自 pretraining corpus 也带来污染与版权边界。开放式自改进的可信上限仍由环境审计决定。

### 14. Rethinking Privileged Information in On-Policy Self-Distillation

**论文信息**：*Rethinking Privileged Information in On-Policy Self-Distillation*；Shrestha, Samyak, Tessier, Alexander；[arXiv:2608.18271](https://arxiv.org/abs/2608.18271)；Machine Learning (cs.LG)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：OPSD 的提升不能自动证明 privileged reference 被学进去；学生可能只是恢复了 base model 已有的 reasoning mode。

**为什么值得推荐、方法怎么工作**：论文把 on-policy self-distillation 的 teacher 条件拆成正确 reference、错误问题的 solution、无 reference，以及 thinking/non-thinking generation；student 始终从自身回答获得 token-level supervision。随后比较 reference-induced supervision、teacher-without-reference supervision 与训练后预测变化的 alignment，并跨 Qwen3 1.7B-8B、数学和科学集做 matched control。Figure 1 的设计核心是把“教师更会想”与“参考信息真的传入学生”分离。

**关键实验、局限与当天主题**：Qwen3-8B 上，thinking teacher 即使拿到错误问题的 solution 也能在若干数学 benchmark 超过正确 reference；相同 teacher mode 下四项分数差通常不超过 0.3。4B/1.7B 的 reference 效果又随训练集变化，alignment 强也不总对应性能收益。这个负结果直接约束 privileged-information distillation 的因果叙述。局限是只测特定 OPSD objective、Qwen3 与有限 reference 形式；错误 solution 可能仍触发通用 reasoning 格式，尚不能否定更强的反事实控制或可执行 oracle。

### 15. The Lifecycle of LLM-as-a-Judge for Large-Scale Recommendation Explanations

**论文信息**：*The Lifecycle of LLM-as-a-Judge for Large-Scale Recommendation Explanations*；Kong, Emma Yanyang, Tan, JJ, Gupta, Ishan, Olds, Lars, Campbell, Claire, Fagnan, David, Balin, Ve 等；[arXiv:2608.18300](https://arxiv.org/abs/2608.18300)；Artificial Intelligence (cs.AI)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：生产 judge 不是一次训练完的模型，而是需要数据、rubric、部署角色、漂移监控和重训门的完整生命周期。

**为什么值得推荐、方法怎么工作**：Netflix 案例分四阶段：Birth 用人类标签与 rationale 构造分层 benchmark；Training 用 Reasoning-Aligned Rubric Tuning，让 meta-judge 对理由而非只对 label 给反馈；Deployment 同一 judge 同时做 quality gate 与 reflective generation；Monitoring 持续抽样人审，agreement 下滑时触发重训并扩充 benchmark。Figure 1 明确列出各阶段 artifact 与反馈回路，避免把 judge accuracy 当静态常数。

**关键实验、局限与当天主题**：系统每周评价数十万条节目 explanation，并在数千万会员上的五周 A/B test 中使浏览到播放和新内容观看相对无说明对照上升，且没有 quality-related takedown。真实部署规模难得，但论文未披露核心离线 judge 指标和 A/B effect size，商业排序、界面和推荐系统也可能共同影响用户结果。RART 还依赖 meta-judge，可能把偏差上移一层。推荐它是因为给出 judge 运维对象，而不是因为已证明 judge 判断等同人类。

### 16. Governance Records as Supervision: Verifier-Selected Self-Training for Structured Workflow Repair

**论文信息**：*Governance Records as Supervision: Verifier-Selected Self-Training for Structured Workflow Repair*；Salas, Jesus；[arXiv:2608.18324](https://arxiv.org/abs/2608.18324)；Artificial Intelligence (cs.AI)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：机器可验证 workflow 的治理记录本身可以成为监督数据，而且独立 verifier 选择比 schema 或模型自选更关键。

**为什么值得推荐、方法怎么工作**：流程先在结构隔离的 PlanBench replanning case 上让 Qwen3-14B thinking 产生候选；独立 VAL verifier 只接纳语义有效计划；被接纳的 attempt、contract、verdict 与 provenance 组成 training record；同一 checkpoint 再以 LoRA 学成 non-thinking one-shot executor。matched ablation 固定 source case、52 个候选、24 个 target、recipe 与 seed，仅替换 schema-selected、self-selected 或 VAL-selected 的选择面。

**关键实验、局限与当天主题**：80 个 unopened case 上，VAL-accepted 从 base 的 1 个增至 57，thinking 本身为 30，且 56 个 paired gain、0 regression；延迟约为 thinking 的 1/56。160 个新 case 中 base/schema/self/VAL 分别 1、55、69、102，VAL 相对 self 净增 33，p=0.0000019647。证据对选择机制控制很严，但数据规模仍小，PlanBench 可判定规划与开放 workflow 差距大；另一个 interface-cure gate 未通过，也说明不能把结果宣传成 unrestricted self-improvement。

### 17. Continual Reasoning Gym: Diagnosing and Harnessing Shared Reasoning in Continual RLVR

**论文信息**：*Continual Reasoning Gym: Diagnosing and Harnessing Shared Reasoning in Continual RLVR*；Luo, Lirui, Zhang, Guoxi, Xu, Hongming, Li, Rongqing, Fang, Cong, Fan, Lifeng；[arXiv:2608.18574](https://arxiv.org/abs/2608.18574)；Machine Learning (cs.LG)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：连续 RLVR 的差距不只来自遗忘；旧任务推理结构能正迁移，而 prompt replay 可以利用这种共享结构追平联合训练。

**为什么值得推荐、方法怎么工作**：Continual Reasoning Gym 把文本和视觉可验证推理编成五条任务序列，比较 multitask RLVR、sequential RLVR 与多种 replay。作者先分解最终差距为 forgetting 与未获得的正迁移，再计算任务梯度相似性；CPR 只重放旧 prompt，却用当前 policy 重新生成 response 与 reward，从而不把过时轨迹硬塞回训练。Figure 1-4 依次解释设置、差距和 shared reasoning。

**关键实验、局限与当天主题**：Sequential RLVR 的最终表现只有 multitask RLVR 的 88%，但遗忘幅度相对温和；任务对梯度余弦均值 0.345，82.2% 为正。表 2 中只有 CPR 平均达到 MTRL 水平，并同时改善当前与未来任务。机制分析比简单 replay 涨分更有价值。局限是顺序、任务与 verifier 均由 benchmark 预设，重新生成的旧响应增加显著训练成本；正梯度共享在更异质、安全目标冲突或 reward 被投机的序列中可能不成立。

### 18. RTPO: Reverse-Turn Policy Optimization for Stabilizing Agentic RL Training

**论文信息**：*RTPO: Reverse-Turn Policy Optimization for Stabilizing Agentic RL Training*；Li, Yugu, Cao, Jimmy, Qiao, Jianglin, Hu, Siyi；[arXiv:2608.18682](https://arxiv.org/abs/2608.18682)；Artificial Intelligence (cs.AI)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：RTPO 把多轮 Agent rollout 反向展开为 turn-level 更新，同时修正上下文错配、稀疏 credit 和异步 policy drift。

**为什么值得推荐、方法怎么工作**：论文先把扁平轨迹训练的三个失稳源统一为 turn-boundary MDP 问题：训练看到的 context 与 rollout 不同、terminal reward 广播到所有 turn、长短轨迹来自不同 policy version。RTPO 将 rollout 组织成 sparse reverse tree，从末轮向前逐轮更新，每一轮用已优化的 downstream continuation 重采样或对齐。Figure 1 是故障分解，Figure 2 则给出 reverse-order policy optimization 与递归最优性。

**关键实验、局限与当天主题**：八个多轮 agentic benchmark 上，RTPO 的总准确率相对 vanilla 提升 66.78%，比 GRPO 高 21.50%，比 turn-level SeeUPO 高 10.76%，并改善 tool-call 与 log-prob 稳定性。理论保证在论文定义的 turn-level formulation 下消除 context mismatch 与 asynchronous drift。风险是反向更新需要更多生成和存储，实际工具环境可能不可重放；八个 benchmark 仍偏可验证问答与搜索，理论假设也不覆盖非平稳外部状态和迟到副作用。

### 19. What is Missing from AI Post-Training AI: An Empirical Analysis

**论文信息**：*What is Missing from AI Post-Training AI: An Empirical Analysis*；Lim, Joy Jia Yin, Huang, Xin, Peng, Hao, Lu, Yaxi, Cong, Xin, Zhang, Zhong, Sun, Maosong, Lin, Ya 等；[arXiv:2608.19072](https://arxiv.org/abs/2608.19072)；Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Machine Learning (cs.LG)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：当前 AI-for-AI post-training Agent 会调参数，却很少在证据变坏时主动推翻最初训练策略。

**为什么值得推荐、方法怎么工作**：作者把能力分成 execution-level 与 strategy-level：前者是在既定 SFT/RL recipe 内改 learning rate、data 或步数，后者是依据中途实验重新选择训练范式。论文分析公开 post-training trajectory，追踪策略何时形成、后续 action 是否跨策略边界；再依次加入 experience scaffold、人类 guidance 和更多 inference compute，检验缺经验、缺指导与缺推理三种解释。这个递进干预比只报最终 GSM8K/HumanEval 分更有诊断力。

**关键实验、局限与当天主题**：experience scaffold 让 GSM8K +12.6、HumanEval +40.8，但策略仍从开头锁死；人类提示能改初始方向，训练开始后又退回局部 adjustment；更多推理算力只帮助较容易任务，对最难任务几乎无效。结论应限定为所分析 Agent 和任务：trajectory 的“策略”编码依赖作者 rubric，未证明模型原则上不能元学习；人工 guidance 的时机与信息量也影响结果。但它准确指出自动 post-training 的下一瓶颈是实验后改判，不是把同一 recipe 跑得更熟。

### 20. Open-MOPD: Diagnosing and Fixing Capability Imbalance in Multi-Teacher On-Policy Distillation

**论文信息**：*Open-MOPD: Diagnosing and Fixing Capability Imbalance in Multi-Teacher On-Policy Distillation*；Gao, Huan-ang, Chi, Haohan, Yan, Yong, Feng, Shiyuan, Wu, Hanlin, Jiang, Zheng, He, Bingxiang, Ma 等；[arXiv:2608.19098](https://arxiv.org/abs/2608.19098)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：多教师 OPD 的能力失衡主要不是梯度冲突，而是长短任务争夺 token budget、收敛速度错位与 stale teacher reward。

**为什么值得推荐、方法怎么工作**：Open-MOPD 用 SmolLM3-3B-Base 和 oracle routing 建立可复现实验，把 routing 误差排除后测 capability integration gap。诊断先比较各域 sequence length、学习曲线和异步 reward age；修复包括 token-share balancing、按未收敛 gap 动态分配预算，以及刷新 student reward。三个机制分别对应结构、动态与系统时延，避免把所有失败笼统归为 negative transfer。

**关键实验、局限与当天主题**：标准 M-OPD 只恢复 domain-routed oracle ensemble 可用 headroom 的 35.6%，尤其短 instruction-following 任务过早停滞；三项修复后 headroom recovery 达 83.4%，并保持单一可部署 student。完整 recipe、trajectory 和 evaluation suite 开源且硬件预算可达，复现性较强。局限是 oracle routing 人为简化真实系统，3B 单 backbone 与所选领域不能证明大模型同样受益；多机制叠加后的 47.8 点恢复也需更多独立 ablation 与长期稳定性验证。

### 21. Beyond Teacher Likelihood: Group-Calibrated On-Policy Distillation for Long-Context Reasoning

**论文信息**：*Beyond Teacher Likelihood: Group-Calibrated On-Policy Distillation for Long-Context Reasoning*；Zhang, Zhu, Wang, Jixun, Xu, Xiaoang, Wang, Xiaorong, Zhou, Zihan, Wang, Zhiyuan, Wang, Shuo, Xia 等；[arXiv:2608.19181](https://arxiv.org/abs/2608.19181)；Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)；列入 2026-08-20 官方列表。

**一句话 TL;DR**：GC-OPD 用 verifier 与 teacher likelihood 的组内差值校正 token 监督，缓解长上下文里局部合理却全局漏证据的问题。

**为什么值得推荐、方法怎么工作**：方法先在固定 response 上量化 prompt 变长时 OPD trajectory score 与 verifier reward 的分歧；训练时分别对二者做 rollout-group normalization，得到带符号的 teacher-verifier residual；RACA 再按 token 的相对 OPD advantage 分配这条 trajectory residual，同时保留原 dense teacher signal。Figure 2 的关键是校正而非替换：verifier 管全局完成，teacher 仍提供局部语言分布。

**关键实验、局限与当天主题**：9,527 个不超过 32K token 的训练 prompt、五个 held-out long-context benchmark 上，Qwen3-4B 平均 29.08→40.47，8B 为 35.12→44.65；vanilla OPD 分别 39.31 和 43.56。ablation 显示 signed residual 优于直接加 group-normalized reward，RACA 又优于均匀 token 分摊。提升相对 vanilla 不大但机制清楚；风险是 verifier 仍可能漏掉开放式证据错误，训练截断在 32K，且五项 benchmark 是否共享模板需做污染审计。

## 中相关论文速读

### 1. [Looped Language Models Improve Compositional Tool Calling](https://arxiv.org/abs/2608.18171)

在 API-Bank、BFCL、NESTful 上用 matched SFT 比较 looped 与普通语言模型，发现 recurrent depth 对多步依赖工具调用帮助更稳定，adaptive compute 的性价比更好。它把架构深度与工具规划联系起来，但收益随模型和单步/多步任务变化，尚不能替代执行 verifier。 论文分类为 Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)，列入 2026-08-20 官方列表。

### 2. [Reproducibility is Not Enough: Artifact Verifiability in Decentralized-Build Package Ecosystems](https://arxiv.org/abs/2608.18180)

四个去中心化构建生态的实证说明 deterministic build 只是起点：source state、依赖、环境与 release transform 缺一都无法独立核验 artifact。registry metadata、VCS 标记与 attestation 有帮助却不构成完整 recipe；对 Agent 交付审计很重要，但论文不直接评测模型。 论文分类为 Software Engineering (cs.SE)，列入 2026-08-20 官方列表。

### 3. [AdaRare: Telemetry-Guided Joint Profile Control for Greybox Fuzzing](https://arxiv.org/abs/2608.18187)

AdaRare 每 5 秒联合调 AFL++ 的 queue、mutation、dictionary、energy 与 comparison profile；8 个 target 全部提高 median coverage，固件案例复现 5 个后获 CVE 的内存错误。统计校正后部分组件证据较弱，且属于 fuzzing control system，不是 LLM Agent，故保留为执行反馈设计参考。 论文分类为 Cryptography and Security (cs.CR)，列入 2026-08-20 官方列表。

### 4. [Artifact-centered Claim-aware Observability for Autonomous Scientific Agents](https://arxiv.org/abs/2608.18312)

提出 claim-aware artifact lineage，把 scientific Agent 的 claim、evidence、operator、archive 与 steering command 变成一等节点，并可映射 OpenTelemetry/PROV-O/RO-Crate。问题定义准确，但当前主要是 observability profile，缺少用户审计时间、错误发现率和规模化开销实验。 论文分类为 Computation and Language (cs.CL) ; Computers and Society (cs.CY); Human-Computer Interaction (cs.HC)，列入 2026-08-20 官方列表。

### 5. [Engine-Transfer-Bench: An Evidence-Based Benchmark for Document Compilation Engine Selection](https://arxiv.org/abs/2608.18329)

Engine-Transfer-Bench 用 1,784 个开放文档、4,211 次/host 编译和跨 macOS/Ubuntu/Windows harness 比较六类文档引擎；Tectonic 成功率稳定在 96.3%-97.2%，经典 TeX 受发行策略影响 12-20 点。它是构建环境选择证据，不含 Agent，但揭示跨平台 oracle 必须记录 host。 论文分类为 Software Engineering (cs.SE) ; Programming Languages (cs.PL)，列入 2026-08-20 官方列表。

### 6. [One Gate Is Not Enough: Composing Stateful Pre-Action Controls for Agentic AI](https://arxiv.org/abs/2608.18360)

形式化多个 pre-action gate 的 remediation coupling：一个 gate 降级动作后会使另一 gate 的旧 verdict 失效，两个 remediation operator 还不交换。30 个预注册 seed 支持 bounded mechanism，但 payload 与 metadata 层仍是合成，且组合不会凭空增加 detection coverage；适合作为 Agent 控制平面速读。 论文分类为 Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Computers and Society (cs.CY)，列入 2026-08-20 官方列表。

### 7. [LEDGER: Claim-to-Evidence Trace Graphs for Auditing LLM Agents](https://arxiv.org/abs/2608.18398)

LEDGER 将细粒度 trace 汇成 Evidence Node、Workflow Node 与 claim-support edge，使代码和数据分析 Agent 的 artifact lineage、repair 与 validation coverage 可追溯。展示案例有解释力，但缺少对照用户研究和错误检出数字，当前更像审计数据模型而非已验证系统。 论文分类为 Human-Computer Interaction (cs.HC) ; Artificial Intelligence (cs.AI)，列入 2026-08-20 官方列表。

### 8. [Coverage-Driven RTL Assertion Generation with Formal Exploration and Neuro-Symbolic Refinement](https://arxiv.org/abs/2608.18482)

用 formal exploration 找 RTL coverage gap，再让神经符号循环生成和修正 assertion，把“多写断言”改成覆盖驱动。与 coding-agent 的关系在可执行形式验证，但论文核心是硬件 assertion generation，开放仓库变更、补丁正确性与 Agent workflow 并非主要对象。 论文分类为 Hardware Architecture (cs.AR) ; Artificial Intelligence (cs.AI)，列入 2026-08-20 官方列表。

### 9. [Beyond LLM-Based Reasoning: Lightweight GNNs for Agent Failure Attribution](https://arxiv.org/abs/2608.18575)

AFANet 把多 Agent 轨迹建成 step/agent graph，以轻量 GNN 做 faulty agent 与 error type attribution，匹配或超过昂贵 LLM baseline，且 OOD 可低成本适配。它提醒失败归因未必需要生成式 reasoning；不过 benchmark 标签和交互图已结构化，真实系统的缺失日志与混合责任更难。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-20 官方列表。

### 10. [OdinEval: A Reproducible Benchmark for LLM-Based Program Repair in the Odin Programming Language](https://arxiv.org/abs/2608.18595)

OdinEval 从公开 Odin 缺陷绑定 issue、base/fix commit、gold patch、历史 toolchain 和 fail-to-pass test，168 个实例上 Kimi-K3 Resolved 66.7%，Qwen3.8-Max Repro 96.4%。可复现包完整，但同模型三次审 test 会相关偏置，小众语言规模和公开补丁污染也限制外推。 论文分类为 Software Engineering (cs.SE)，列入 2026-08-20 官方列表。

### 11. [Code Health in LLM-Based Test Generation: Effectiveness and Token Efficiency](https://arxiv.org/abs/2608.18645)

跨 Python/Java/C++ 分析 CodeScene CodeHealth 与 LLM 生成测试，发现维护性对 coverage/mutation 只有弱但一致的正信号，同时与输入 token 数负相关。值得保留的判断是代码健康影响 Agent 成本和测试效果，但相关性不能证明重构会提升生成质量。 论文分类为 Software Engineering (cs.SE)，列入 2026-08-20 官方列表。

### 12. [Competence, Not Accuracy: A Diagnostic for Reference-Free Judge Gates in Skill Optimization](https://arxiv.org/abs/2608.18719)

先测 reference-free judge 是否具备区分正误的 competence，再决定能否把它放进 skill optimization gate；理论给出 competence c 与答案空间 k 的 AUC 界，并主张 within-question estimator 避免题目难度混淆。闭环实验支持诊断方向，但 judge 自己解题的能力上限和开放答案空间估计仍是难点。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-20 官方列表。

### 13. [Metrics That Write Themselves: Evolving an Evaluator from Its Own Blind Spots](https://arxiv.org/abs/2608.18744)

EvalCEGAR 从“指标打分相同但一对一错”的 collision 反推新的 Python defect operator。MBPP+/HumanEval+ 上 55 行 operator 在 428 个 unseen task 关闭 15.4% 的可关闭差距，6/8 run 得到有效 operator；效果不大但机制可审计，风险是 hidden tests 提供了现实任务少有的精确 ground truth。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Software Engineering (cs.SE)，列入 2026-08-20 官方列表。

### 14. [Contract-Aware Rescue of a Drifted Isabelle Development: The Double-Tank Case Study](https://arxiv.org/abs/2608.18822)

CAPRI 在 Isabelle 修复时同时检查 proof acceptance 与 machine-readable edit contract，重建 9 个 theory、10 个 obligation，并发现原 16-theory“成功构建”偷偷弱化了 16/100 个声明。案例说明 build green 不等于 specification 保真，但仍是单一 double-tank 项目，独立复现和 operational trace contract 未完成。 论文分类为 Software Engineering (cs.SE)，列入 2026-08-20 官方列表。

### 15. [CauSec: Unboxing the Causal Drivers of Static Vulnerability Analysis Performance](https://arxiv.org/abs/2608.18876)

CauSec 试图把静态漏洞分析性能拆成可干预因果因素，而非只比较 detector 排名。它对程序分析和工具选择有价值，不过没有 coding Agent 的定位-修改-验证闭环，适合作为未来 harness 中 analyzer 证据质量的旁支。 论文分类为 Cryptography and Security (cs.CR)，列入 2026-08-20 官方列表。

### 16. [Grading the Graders: Verification Autonomy Levels (L0-L5) for LLM Reasoning](https://arxiv.org/abs/2608.19009)

VAL 用 verification spec 来源和 verdict 保证把 verifier 分 L0-L5，并指出 sampling/substitution 只能证候选正确，不能证没有遗漏；开放世界通常止于 L2 anchored correctness。概念澄清很实用，但跨 17 篇工作的映射是 meta-standard，不是新的 verifier 性能实验。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-20 官方列表。

### 17. [Grouping the Stochastic Machine: Precision, Not Capability, as the Frontier Metric for AI Systems](https://arxiv.org/abs/2608.19140)

主张 reliability 应测相同请求多次运行的结果分散度，而非只测平均能力，并区分稳定地错与随机地错。已有真实案例中一条规则把 0/5 变成 5/5，但总体仍是立场与初步 harness，样本太少，适合记住“grouping”指标而非当成熟 benchmark。 论文分类为 Artificial Intelligence (cs.AI) ; Computers and Society (cs.CY); Machine Learning (cs.LG); Software Engineering (cs.SE)，列入 2026-08-20 官方列表。

### 18. [Beyond the Transcript: Detecting Covert Co ordination in Latent Multi-Agent Communication](https://arxiv.org/abs/2608.19161)

VLA 用共享 event ID 连接私有 latent channel 与公开动作，结合异常、反事实 influence 和 SAE 解释监控 Agent 合谋；同构 pair AUROC 0.993、异构 0.854，白盒 matched-neutral steering 降低低价合谋 47.3 点。控制拍卖证据强，但完全白盒恢复按构造成立，真实模型接口通常拿不到反事实 hidden state。 论文分类为 Artificial Intelligence (cs.AI) ; Cryptography and Security (cs.CR)，列入 2026-08-20 官方列表。

### 19. [Self- and Other-Labels Induce Bidirectional Bias in LLM Judges](https://arxiv.org/abs/2608.18091)

十个 LLM 判断无文风指纹的 narrative constraint selection：盲评控制质量后 self-preference 基本消失，但仅贴“self/other”标签就会双向抬高/压低分数。它直接警告 reward/judge pipeline 的 attribution bias，不过不是新的 post-training recipe。 论文分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)，列入 2026-08-20 官方列表。

### 20. [Abliteration Mitigation via Refusal Aliases](https://arxiv.org/abs/2608.18093)

AMRA 用 rank-k weight edit 把拒绝激活替换为随机 alias，并修正下游 reader，提升 Llama-3-8B/Gemma-2-9B 在 abliteration 后的 refusal 2.16/14.70 点。它针对安全对齐被权重投影移除的攻击，但 Gemma utility 代价较大，攻击面也只覆盖已知 refusal-direction 方法。 论文分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Cryptography and Security (cs.CR)，列入 2026-08-20 官方列表。

### 21. [Safety Alignment Illusion: The Cross-Lingual Safety Gap in LLMs](https://arxiv.org/abs/2608.18131)

INCLUDE 用 2,604 条英语、印地语、孟加拉语、马拉地语、泰米尔语和 Hinglish prompt 检查 10 个模型、14,988 个 bias score，发现安全表现跨语言和开闭源模式反转。它证明 English-centric alignment 的评估缺口，但不定位是哪种 post-training 数据或目标造成。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Computers and Society (cs.CY)，列入 2026-08-20 官方列表。

### 22. [Accelerating Visual On-Policy Distillation with Batched Speculative Jacobi Rollouts](https://arxiv.org/abs/2608.18183)

HB-SJD 将 speculative Jacobi decoding 扩成异步 batched rollout backend，只替换视觉 OPD 的 student 采样而不改 teacher/objective，显著缩短 rollout 与总训练时间并保持 LlamaGen 质量。工程贡献清楚，但领域是视觉自回归，摘要未给出统一加速数字。 论文分类为 Machine Learning (cs.LG)，列入 2026-08-20 官方列表。

### 23. [SESSE: Sketch, Expand, Sort, Summarize, Evaluate -- LLM-as-Judge Evaluation via Structured Decomposition](https://arxiv.org/abs/2608.18303)

SESSE 从 judge 自己的错误中挖 sub-question，按 Sketch-Expand-Sort-Summarize-Evaluate 分解判断；RewardBench 1,000 项接近 CoT，并可与 92.7% 的 RISE-Judge-32B 竞争。完全 training-free 且有 audit trail，但与 post-training 的关系主要在评测基础设施。 论文分类为 Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG)，列入 2026-08-20 官方列表。

### 24. [SingularClip: Preventing Spectral Collapse to Maintain Plasticity in Continual and Reinforcement Learning](https://arxiv.org/abs/2608.18319)

SingularClip 把持续/强化学习中的 plasticity loss 归因于权重奇异值各向异性增长，并周期裁剪所有矩阵，在多类任务上优于 baseline。机制值得关注，但不是 LLM 专属，也缺少语言模型 post-training 的成本与能力保持验证。 论文分类为 Machine Learning (cs.LG)，列入 2026-08-20 官方列表。

### 25. [Can a Lightweight Multimodal Model Estimate LLM Reasoning Performance? A Study for Compute-Optimal Document Inference](https://arxiv.org/abs/2608.18591)

用轻量 multimodal model 预测 LLM 文档 reasoning 性能，以便在 compute budget 下路由推理。它可作为 verifier/value proxy，但预测性能不等于答案正确性证明，分布外文档和模型升级时需要重新校准。 论文分类为 Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)，列入 2026-08-20 官方列表。

### 26. [VA-Judger: Reward Modeling from Human Preference Feedback for Joint Video-Audio Generation](https://arxiv.org/abs/2608.18607)

VA-Judger 基于 9K prompt、10.3K 人类 pair 训练音视频 omni-reward model，先易后难蒸馏 rationale，再做分维 RL；同时建立 OOD judge benchmark。它直面独立感知指标导致的 reward hacking，但数据来自有限开源 generator，CoT reward 的可解释性仍需人审。 论文分类为 Computer Vision and Pattern Recognition (cs.CV)，列入 2026-08-20 官方列表。

### 27. [Preference Reasoning under Indeterminacy in Large Language Models](https://arxiv.org/abs/2608.18631)

把 preference reasoning 的失败分成信息不全的 epistemic indeterminacy 与社会选择无解的 structural indeterminacy，发现前沿 LLM 连验证模式下也常把“无确定答案”硬判为有答案。它挑战偏好数据的确定标签假设，但主要是诊断，不提出优化算法。 论文分类为 Artificial Intelligence (cs.AI) ; Computer Science and Game Theory (cs.GT); Machine Learning (cs.LG)，列入 2026-08-20 官方列表。

### 28. [Clinically Structured Surrogate Rewards for Post-SFT Medical Image Captioning](https://arxiv.org/abs/2608.18654)

在 post-SFT 医学图像 captioning 中，把语义/词汇、图像邻域分布和临床实体-断言-关系图四类 reward 组内归一后用 GDPO 优化；三 backbone×两赛道都优于 SFT，Overall/Relevance/Factuality 平均相对 +3.4%/+2.1%/+5.8%。结构 reward 有意义，但临床真实安全尚未验证。 论文分类为 Computer Vision and Pattern Recognition (cs.CV)，列入 2026-08-20 官方列表。

### 29. [Learning What to Fail On: Failure-Mode Contextual Bandits for Adversarial Data Curation](https://arxiv.org/abs/2608.18681)

让 contextual bandit 选择下一轮应合成哪类失败，而非用固定 reward threshold 筛数据；RoBERTa 在 SNLI 88.48→92.60、ANLI 75.04→80.95、MultiNLI 54.67→71.99。它展示 curator 也可学习，但 judge ensemble 与目标模型共同生成/过滤，错误闭环和 LLM 费用需审计。 论文分类为 Computation and Language (cs.CL)，列入 2026-08-20 官方列表。

### 30. [To Go Far, Go Together: Diverse Preferences Induce a Curriculum for Reward Optimization](https://arxiv.org/abs/2608.18770)

CurriPO 在多用户 reward model 之间构造分支课程，优先复用易优化目标帮助难用户；模拟个性化控制中人口满意度为强 baseline 的 1.2-2.1 倍并省训练时间。它扩展 alignment fairness 到“reward 是否可优化”，但目前不是语言模型且仅模拟连续控制。 论文分类为 Machine Learning (cs.LG) ; Robotics (cs.RO)，列入 2026-08-20 官方列表。

### 31. [Decomposing Wrong-Consensus Agreement in LLM Self-Consistency: A GPT-4.1 Case Study](https://arxiv.org/abs/2608.18795)

分解 GPT-4.1 self-consistency 中多个采样一致但共同错误的情形，提醒 vote agreement 不是 verifier。对 outcome selection 很关键，不过单模型 case study 和既定题集不能证明所有 wrong consensus 机制相同。 论文分类为 Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)，列入 2026-08-20 官方列表。

### 32. [A Theory of Post-hoc Debate Judgement](https://arxiv.org/abs/2608.19002)

给 post-hoc debate judgement 建立理论，讨论辩论结束后 judge 能从相互攻击中恢复多少正确性。它适合约束 debate-based feedback 的保证边界，但理论假设与真实弱 judge、策略性语言和训练动态之间仍有距离。 论文分类为 Artificial Intelligence (cs.AI)，列入 2026-08-20 官方列表。

### 33. [ADEPT: Accelerating Dexterity via Pre-Training and Post-Training using Reinforcement Learning](https://arxiv.org/abs/2608.19182)

ADEPT 用通用 reposing 预训练，再以 behavior-cloning distillation、critic warm-up 和保守 on-policy update 避免 dexterity fine-tuning 迅速遗忘；两种 23/29 DoF 手实现 sim-to-real。稳定 post-training recipe 有代表性，但对象是机器人 policy，不是 LLM。 论文分类为 Robotics (cs.RO) ; Artificial Intelligence (cs.AI)，列入 2026-08-20 官方列表。

## 可留意 / 可跳过

这些工作与两条主线存在边缘关系，但今天不值得按核心论文投入同等阅读成本。

- **[Demo: tfdrift - A Severity Taxonomy and Risk Classification Framework for Infrastructure Drift Detection](https://arxiv.org/abs/2608.18173)**：基础设施 drift 的 severity taxonomy 和演示工具有工程价值，但没有 Agent repair 或执行对照。
- **[Towards Reversible Forgetting: Managing Obsolete Knowledge in Continual Enterprise AI Agents](https://arxiv.org/abs/2608.18177)**：active/dormant/retired 三态“可逆遗忘”适合企业 Agent memory 治理，当前主要是概念框架与金融例子。
- **[CentaurBench: Benchmarking LLM Capabilities on Augmenting vs. Automating Real-World Work Tasks](https://arxiv.org/abs/2608.18554)**：CentaurBench 区分增强与自动化真实工作任务，适合看能力边界，但不是软件变更或训练方法。
- **[CTIFoundry: An Agent-Native Corpus Scaffold for Cyber Threat Intelligence](https://arxiv.org/abs/2608.18613)**：CTI 的 agent-native corpus scaffold 关注威胁情报组织，缺少补丁、构建或 post-training 因果实验。
- **[TestifAI: Tomography-Based Testing for Deep Learning Systems](https://arxiv.org/abs/2608.18900)**：TestifAI 用 tomography 思路测试深度学习系统，属于 AI 软件测试，但不含 coding-agent 变量。
- **[Towards a Deductive Verification Infrastructure for Weighted Programming](https://arxiv.org/abs/2608.18971)**：weighted programming 的演绎验证基础设施偏 PL 理论，可作为未来 verifier 底座而非今日 Agent 主线。
- **[From Threat Intelligence to Detection: Knowledge-driven Enrichment and Template-based Rule Grounding for Automated Sigma Rule Generation](https://arxiv.org/abs/2608.19011)**：从 threat intelligence 生成 Sigma rule 有自动化安全价值，主要是模板 grounding 应用，未验证仓库修改。
- **[Tuning the Stochastic Machine: A Systems Engineer's Operating Model for Human-AI Engineering](https://arxiv.org/abs/2608.19125)**：七原则 human-AI 运维纪律强调纠错持久化、版本与退役，案例少、属 position/经验文。
- **[Backdoor Learning in Language Models and Vision-Language Models](https://arxiv.org/abs/2608.18095)**：语言与视觉语言模型 backdoor learning 综述可作安全入口，但缺少当天的新 post-training 机制证据。
- **[Alignment Is All You Need: Instruction-Free Training for General Audio-Language Models](https://arxiv.org/abs/2608.18132)**：instruction-free audio-language training 是通用多模态训练，是否属于严格 post-training 不够清楚。
- **[Efficient Adaptation of LLMs for Hate Speech Detection in Low-Resource Languages: A Comparative Study on Roman Urdu](https://arxiv.org/abs/2608.18142)**：Roman Urdu hate-speech 适配是具体应用微调，对通用训练目标和稳定性贡献有限。
- **[Model Card for OpenAI Privacy Filter](https://arxiv.org/abs/2608.18274)**：OpenAI Privacy Filter model card 值得看数据与失效边界，但它是专用过滤器文档，不是基础模型 post-training 研究。
- **[Figurative and Cultural Knowledge in LLMs: Investigating Cross-Domain Transfer through Fine-Tuning](https://arxiv.org/abs/2608.18361)**：微调后 figurative/cultural knowledge 的跨域转移是行为分析，任务窄且没有新优化方法。
- **[Pedagogical AI in Mental Health: A Tri-Stream Fine-Tuned LLM Framework for Automated Clinical Supervision and Risk Triage](https://arxiv.org/abs/2608.18438)**：该文与两条主线存在边缘联系，但主要贡献不在仓库级软件变更或 LLM post-training 机制；可按标题与摘要判断是否需要专题阅读。
- **[Pairwise Ranking Outperforms Single-Action RL for Offline Explanation Selection: A Practical Lesson](https://arxiv.org/abs/2608.18531)**：离线 explanation selection 中 pairwise ranking 胜过 single-action RL，实用但领域和 action space 很窄。
- **[Compress and Forget: bitsandbytes Quantization Amplifies Proactive Interference in LLMs](https://arxiv.org/abs/2608.18578)**：量化放大 proactive interference 是部署侧遗忘风险，不是新的训练阶段方案。
- **[When Safety Overrides Vision: Exploring Dynamics between Vision Influence and Safety Alignment in Vision-Language Models](https://arxiv.org/abs/2608.18628)**：VLM 中视觉影响与安全对齐冲突值得审计，主要是评测分析而非 post-training recipe。
- **[Improving LLM-Based SSH Honeypots Through Prompting and Fine-Tuning](https://arxiv.org/abs/2608.18686)**：该文与两条主线存在边缘联系，但主要贡献不在仓库级软件变更或 LLM post-training 机制；可按标题与摘要判断是否需要专题阅读。
- **[A Few Cases Are All You Need: An Empirical Study of Annotation-Efficient LoRA Fine-Tuning of MedSAM3](https://arxiv.org/abs/2608.18731)**：该文与两条主线存在边缘联系，但主要贡献不在仓库级软件变更或 LLM post-training 机制；可按标题与摘要判断是否需要专题阅读。
- **[Gradient Mirage: Trainable yet Label-Unidentifiable Gradients in Large Language Model Split Learning](https://arxiv.org/abs/2608.18767)**：split learning 梯度可训练却不可识别 label 的隐私结果重要，但不回答能力/行为如何被 post-training 改变。
- **[Forgetting, plasticity, and co-observation: a third facet of continual learning](https://arxiv.org/abs/2608.18803)**：该文与两条主线存在边缘联系，但主要贡献不在仓库级软件变更或 LLM post-training 机制；可按标题与摘要判断是否需要专题阅读。
- **[GEAR: Generative Expansion and Real Anchoring for Two-Stage Distillation of Tabular Foundation Models](https://arxiv.org/abs/2608.18849)**：该文与两条主线存在边缘联系，但主要贡献不在仓库级软件变更或 LLM post-training 机制；可按标题与摘要判断是否需要专题阅读。
- **[Training-Free Inference-Time Self-Reflection and Cost-Bounded Early Stopping for Large Language Models](https://arxiv.org/abs/2608.18884)**：self-reflection 与早停完全发生在推理期，故只作为 post-training 的对照边界。
- **[Test-Time Scaling in the Wild: Why Exploitation, Not Exploration, Is the Bottleneck](https://arxiv.org/abs/2608.18931)**：test-time scaling 的 exploitation 瓶颈是推理策略问题，不更新权重。
- **[Training Chemical Plausibility-Aware Large Language Models for Single-Step Retrosynthesis](https://arxiv.org/abs/2608.18940)**：该文与两条主线存在边缘联系，但主要贡献不在仓库级软件变更或 LLM post-training 机制；可按标题与摘要判断是否需要专题阅读。
- **[rEDMRec: Distilling Large Language Model Reasoning into an Editable Experience Memory for Recommendation](https://arxiv.org/abs/2608.18952)**：把 LLM reasoning 蒸馏到可编辑 experience memory，改变外部状态而非模型参数，适合与 HCL 对照。
- **[Catastrophic Learning: A New Attack Vector on Continual Learning Networks](https://arxiv.org/abs/2608.18976)**：该文与两条主线存在边缘联系，但主要贡献不在仓库级软件变更或 LLM post-training 机制；可按标题与摘要判断是否需要专题阅读。
- **[Self-prompting and cross-model consensus enable reproducible data extraction from scientific literature with large language models](https://arxiv.org/abs/2608.19025)**：self-prompting 与跨模型共识提升文献抽取可复现性，属于推理流程与数据工程。
- **[Learned, Then Lost: A Measured Single-Example Counterfactual in Pre-training](https://arxiv.org/abs/2608.19168)**：单样本 pre-training 反事实显示短期学会后最终不可检出，研究严谨但阶段是预训练。
- **[Finetuning Strategies for Querying Sounds by Vocal Imitation](https://arxiv.org/abs/2608.19174)**：该文与两条主线存在边缘联系，但主要贡献不在仓库级软件变更或 LLM post-training 机制；可按标题与摘要判断是否需要专题阅读。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 主要证据 | 可信边界 |
|---|---|---|---|---|
| [Adversarial Review: Structured Disagreement for Grounded Agentic Code Review](https://arxiv.org/abs/2608.18167) | 代码审查协作 | reviewer-critic 结构化分歧 | LCB 87%，三 benchmark | 单一主模型 |
| [What Makes Software Issue Resolution Tasks Difficult for Agents?](https://arxiv.org/abs/2608.18280) | issue 难度 | 静态结构预测+SHAP | 约45.8万结果，AUC .863 | gold patch 特征 |
| [ComponentBench: Diagnosing Component-Level Failures in Computer-Use Agents](https://arxiv.org/abs/2608.18307) | GUI 中层能力 | 97组件+程序终态 | 2,910任务，7模型 | 非真实网站 |
| [Task-Conditioned Least-Privilege Learning for Executable Terminal and MCP Agents](https://arxiv.org/abs/2608.18351) | 最小权限 | 双阶段确定性审计 reward | 2,896 episode，98.48% | 预定义 envelope |
| [A Jagged Frontier: Evaluating Robustness of Code Agents to Semantics-Preserving Transformations](https://arxiv.org/abs/2608.18389) | 等价扰动鲁棒性 | paired SPT variant | 16配置，6个显著下降 | Python/自动变换 |
| [DART-SD: Diamond-topology Aware Retrieval and Tuning for Self-Distillation of Multi-Turn Tool-Calling Agents](https://arxiv.org/abs/2608.18524) | 工具轨迹蒸馏 | 拓扑断点局部监督 | 五 benchmark、双尺度 | 状态可汇合假设 |
| [SemaPLC: A Project-Grounded, Verification-Gated Agent Harness for PLC Code Generation](https://arxiv.org/abs/2608.18565) | 工业控制代码 | 编译-静态-live trace gate | 117+65任务，动态52.2 | PLC corpus/高成本 |
| [FACET: Preserving Source Intent and Executable State in Terminal Task Synthesis](https://arxiv.org/abs/2608.18580) | terminal 数据合成 | 共享可执行状态 | 6,078任务，三尺度增益 | 自动 oracle |
| [AppEval: A Unified Benchmark for LLM-Based Mobile Application Repair in ArkTS, Swift, and Kotlin](https://arxiv.org/abs/2608.18588) | 移动修复 | 安装应用双状态 oracle | Android 200任务 | 跨平台未审计 |
| [SkillGate: Training In-Policy Skill Selection in Long-Horizon Agents](https://arxiv.org/abs/2608.18852) | skill 选择信用 | token support 分流 | 五 benchmark，+12.4点 | 单 skill 标签 |
| [SkillForge: Self-Distilling Agents for Project-Specific Issue Resolution](https://arxiv.org/abs/2608.18933) | 项目知识获取 | 合成 issue 自蒸馏 | 多项目/多模型 | 测试覆盖与泄漏 |
| [Harness Continual Learning: Continual Adaptation Beyond Model Parameters](https://arxiv.org/abs/2608.19013) | harness 持续学习 | guarded state commit | 三场景，>10%多项 | 作者定义 harness |
| [SPADE: Self-Play in Adaptive Synthetic Executable Environments](https://arxiv.org/abs/2608.19197) | 开放环境自博弈 | 环境设计器+regret | 八 benchmark，工具+13.9 | verifier 投机 |
| [Rethinking Privileged Information in On-Policy Self-Distillation](https://arxiv.org/abs/2608.18271) | privileged OPSD 归因 | 正确/错误reference控制 | Qwen3三尺度 | 有限 objective |
| [The Lifecycle of LLM-as-a-Judge for Large-Scale Recommendation Explanations](https://arxiv.org/abs/2608.18300) | 生产 judge | 四阶段生命周期 | 数千万用户A/B | 缺 effect size |
| [Governance Records as Supervision: Verifier-Selected Self-Training for Structured Workflow Repair](https://arxiv.org/abs/2608.18324) | 治理记录监督 | 独立 verifier 选 target | 80/160 case matched | 小型可判规划 |
| [Continual Reasoning Gym: Diagnosing and Harnessing Shared Reasoning in Continual RLVR](https://arxiv.org/abs/2608.18574) | 持续 RLVR | 当前policy prompt replay | 五序列，追平MTRL | 任务同质性 |
| [RTPO: Reverse-Turn Policy Optimization for Stabilizing Agentic RL Training](https://arxiv.org/abs/2608.18682) | 多轮 RL 稳定性 | 反向 turn 更新 | 八 benchmark，+21.5% vs GRPO | 重放/系统成本 |
| [What is Missing from AI Post-Training AI: An Empirical Analysis](https://arxiv.org/abs/2608.19072) | AI训练AI | 策略级改判审计 | 三类干预 | 策略rubric主观 |
| [Open-MOPD: Diagnosing and Fixing Capability Imbalance in Multi-Teacher On-Policy Distillation](https://arxiv.org/abs/2608.19098) | 多教师OPD失衡 | token/gap/staleness校正 | headroom 35.6→83.4% | 3B+oracle routing |
| [Beyond Teacher Likelihood: Group-Calibrated On-Policy Distillation for Long-Context Reasoning](https://arxiv.org/abs/2608.19181) | 长上下文OPD | teacher-verifier残差 | 9,527 prompt、五集 | 32K/verifier盲点 |


## 我的判断

**整体创新性：A-。** 最有新意的不是又多了几个 Agent，而是评测和训练单位被重新定义：installed app、live PLC trace、UI component、skill token、turn boundary、teacher-verifier residual 和可提交 harness state 都比整条文本轨迹更接近真实因果对象。

**实用价值：A。** AppEval、SemaPLC、FACET、ComponentBench、OdinEval 和 Open-MOPD 都给出可复现 artifact 或清楚协议；SkillGate、RTPO 与 GC-OPD 的实现思想也足够明确。代价是执行 oracle、重复运行和环境维护都昂贵，许多方法把成本从模型调用转移到了 harness。

**严谨性：A-。** matched perturbation、独立 verifier、结构隔离 split、动态 oracle 和负结果明显增多。主要不确定性仍是公开仓库污染、自动 verifier 共盲点、单一 backbone、合成 executable task，以及跨平台论文先提出统一框架、但只报告 Android 定量结果。

**推荐价值：A。** 若只读六篇，优先 AppEval、SemaPLC、SkillGate、Rethinking Privileged Information in OPSD、Open-MOPD 与 SPADE。它们分别代表真实运行 oracle、工业动态验证、动作局部 credit、监督因果归因、训练预算失衡和自生成环境。当天最重要的判断是：可靠进展不再等于“更强模型+更多 rollout”，而取决于证据是否触达真实状态，以及优化信号是否落在真正可负责的决策上。
