---
title: "当系统开始长期行动，真正稀缺的是可迁移信用与可回放证据"
date: "2026-09-08"
description: "2026 年 9 月 7 日 arXiv：coding agent 的 harness、状态与执行证据，和 post-training 的稀疏监督、教师承诺与奖励不变性同时成为主角。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Post-Training", "RLHF", "RLVR"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-slate-700 via-indigo-700 to-fuchsia-600"
---

昨天这一批值得读，因为两条独立主线都开始从“更高分”退回到**什么被训练、什么被执行、什么证据能重算**。Coding-agent 论文把 harness、cache、memory、授权链、客户需求和工业运行环境变成显式变量；post-training 则集中追问 teacher 在何时拥有承诺权、稀疏 token 为何足够、过程奖励是否保持结构、reward 对同义表达是否不变。九个官方分类页共得到 487 个唯一条目，本次保留 125 篇：30 篇强相关 PDF 深读、66 篇中相关速读、29 篇可留意或可跳过。它不是把所有 Agent 论文硬连成一条线，而是分别判断真实软件变更与广义后训练各自新增了什么可信证据。

## 今日脉络

**Reliable Coding Agents / Software Change（60 篇）**最明显的趋势是：harness 已经不是中性的外壳。跨 harness RL、EVOHARNESSBENCH、Harbor、prefix-cache 分歧和 memory upgrade 都说明，模型输出会被接口、缓存、检索、技能库与评测器共同塑形；因此“同一个模型”并不意味着同一个可复现系统。另一组论文把正确性推进到 effect 和反事实：Decompile-Diverge 用 fuzz corpus 证明重编译不等于等价，BUGSTONE 从 CVE 修复史生成运行证据，ARIA 在实体车机上保存视觉测试收据，CONTINUITY 则要求授权语义一直传到最终副作用。

**LLM Post-Training（66 篇）**今天不应被 coding 主题吞没。最强的一簇都在拆解反馈：极稀疏 OPD 发现 0.05% token 也可触发能力变化，1-shot OPD 把有效性指向长 CoT 而非高 entropy，ConsensusPR 保留中间结论结构，SiLR 证明标量化会毁掉约束几何。教师角色也从“给分”变成“决定什么可以进入环境”：PTA 在工具调用前做 turn-level commitment，RISE 从 RLVR 轨迹外推动态 teacher。安全侧的共同警告是，reward 与 safety boundary 必须做反事实不变性测试，否则同义改写、模板注入或错误 reward 方向会被优化放大。

两条主线只有 1 篇交叉：`Train What You Deploy` 同时是生产 coding-agent 训练协议和 post-training 忠实度研究。这种低交叉是好事：它说明今天 post-training 的推荐来自自身的训练机制与行为证据，而不是为了配合软件工程主题。

## 强相关论文深读

### What Does Multi-Harness RL Learn? Credit Assignment and Portability in Coding Agents

**论文信息：** Le, Chenqian, Cheng, Jiayi, He, Qijia, Li, Runhao, Li, Yinghao, Chen, Xupeng；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04518](https://arxiv.org/abs/2609.04518)。

**一句话 TL;DR：** 多 harness 联训学到的首先是配置适应，不是可以脱离执行框架迁移的通用 coding 能力。

**为什么值得推荐：** 今天最值得先读的一篇控制实验。很多工作把多 harness 暴露、跨 harness 组内相对奖励和能力提升打包报告，本文只改变 GRPO 的分组边界，并把评测 harness 当独立变量，直接追问 credit 究竟落在任务能力还是脚手架习惯上。

**方法怎么工作：** 先用同一个 Qwen3-8B SFT 起点和 Aider、OpenHands、Qwen Code、SWE-agent 的冻结记录；再比较 task-harness 内分组的 Within 与同任务跨 harness 分组的 Cross；最后在四个源 harness 和一个训练外最小 harness 上，用封存的 SWE-bench Verified oracle 评测全部 checkpoint。

**关键实验与证据：** 24,000 次封存评测中，评测 harness 让平均 solve rate 从 2.14% 移到 9.27%，影响达 4.3 倍，而训练 recipe 只移动 1.16 倍。训练外 harness 上 Cross-Within 仅 +0.25 个百分点，95% CI 为 [-0.48,+1.02]；三 seed 合并为 +0.16，且符号会随 seed 改变。

**局限和可信度：** 训练数据仍来自四个既有 harness，只有一个最小 held-out harness，模型与任务族也单一；结论不能扩成“多环境 RL 无用”。可信边界是：跨 harness pooling 会编码 harness 身份，却没有在当前实验中产生可测的可迁移增益。

**阅读定位：** Figure 1 看控制变量与 harness-swap 设计，Figure 2 看 recipe 与评测框架的量级对比，Table 5 看不可运行组合。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### Better Understanding, Better Fixes? A Study of Hallucination in LLM-based Automated Program Repair

**论文信息：** Cai, Xuemeng, Liu, Jiakun, Yang, Linhan, Ma, Wei, Jiang, Lingxiao；分类：Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04909](https://arxiv.org/abs/2609.04909)。

**一句话 TL;DR：** LLM 修复中的幻觉不仅存在于最终 patch，也存在于测试、覆盖和因果定位这些中间理解产物。

**为什么值得推荐：** APR 常用“补丁是否过测试”收尾，但错误理解也能偶然导向 plausible patch，甚至全过现有测试。本文把 repair evidence 的忠实度分层测量，因而能解释为什么更会描述 bug 的模型不必然更会修。

**方法怎么工作：** 管线先在 832 个 Defects4J bug 上生成触发测试识别、行覆盖预测和额外测试；再由这些中间 artifact 驱动补丁；最后用自动执行与人工标注分别判定 patch、因果定位和 repair strategy 是否忠实于可用证据。

**关键实验与证据：** 不同模型/设置仅 21.0%-55.9% 补丁通过开发者测试。对 812 个抽样修复的人工分析中，72.7% 含 repair hallucination；其中错误因果定位占 45.9%，错误修复策略占 18.5%，而且全过测试的 patch 也可能被判为幻觉。

**局限和可信度：** 人工判断有主观性，Defects4J 与测试充分性也限制外推；“幻觉”定义比传统 plausible/valid patch 更宽。文章支持的是多层证据审计，而非仅凭人工语义标签否决所有可用 patch。

**阅读定位：** Figure 1 看两类幻觉的概念关系，Figure 2 看三项理解任务到修复的完整流程，后续结果表核对自动与人工判分差异。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### RefactorPlatform: An Open-Source Harness for Controlled Evaluation of Repository-Scale Refactoring Agents

**论文信息：** Amor, Aziz Ben, Mali, Drish, Acharya, Mann, Iyer, Vijayasri, Bratières, Sébastien；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04898](https://arxiv.org/abs/2609.04898)。

**一句话 TL;DR：** RefactorPlatform 把仓库级重构中的模型、检索、委派和提示细节拆成可控实验轴，并保留完整执行遥测。

**为什么值得推荐：** 多文件重构的难点不是生成一段新代码，而是在行为不变前提下同步传播变更。现有报告常同时换模型、agent scaffold 与上下文策略，本文的价值在固定环境后做 matched comparison。

**方法怎么工作：** 平台先把每题放入隔离 workspace 并直播终端；再在 baseline、RAG、多 Agent 三种 regime 下切换模型与提示；最后用 AST 验证、token/diff/transcript 日志和可导出 telemetry 复核 100 个 RefactorBench 任务。

**关键实验与证据：** AST-aware chunking 比朴素 token window 高 25%-30%；朴素检索反而低于无检索。匹配任务上，精简 RAG 单 Agent 达 86%，所测 sub-agent 配置为 66%，且没有任何题是委派成功而 RAG 失败；检索增益抵消 token 开销后，每次成功成本基本不变。

**局限和可信度：** 示范只有 100 题、四个模型族，委派实现只是众多可能设计之一；AST oracle 更适合结构性重构，不能覆盖行为语义。它证明的是 harness 可做严格消融，不是单 Agent 普遍优于多 Agent。

**阅读定位：** Figure 1 从 dashboard 看长程执行记录；Table 1 核对模型/任务设置，结果表重点看 chunking、RAG 与委派的 matched 条件。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### Train What You Deploy:Token-Faithful Post-Training of a Production Coding

**论文信息：** Li, Cheng, Liu, Jiexiong, Chen, Yixuan, Hong, Chi；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04678](https://arxiv.org/abs/2609.04678)。

**一句话 TL;DR：** 生产 coding agent 的训练必须忠实保留部署时 token 与控制流，否则 RL 更新会优化一个并不存在的轨迹。

**为什么值得推荐：** 离线重建日志常改写 prompt、混入后台模型调用，简化训练环境又会遗漏生产协议。论文把 token provenance、闭失败 loss mask 与训练/部署 coupling 放到同一套协议里，击中了 coding-agent post-training 最容易被忽略的测量误差。

**方法怎么工作：** 框架先让 trainer 以原始 prompt 发起采样；再用协商协议区分 policy call 与后台调用并保留原 token；最后只对可验证 span 计算 loss。C-DPPO 在标准 DPPO 上加入双侧 TV certificate、自适应 K、序列预算与错误鲁棒 masking。

**关键实验与证据：** 在 Baize5B/10B、相同训练与 TMax-100 测试协议下，C-DPPO 跨尺度稳定高 3.0 个点。Figure 1/2 展示 rollout plane 与 negotiated call；Table 1 的 provenance audit 用来确认 retained token 与历史证据没有被静默改写。

**局限和可信度：** 证据集中在两个自有模型和一个生产环境，3 点增益尚不足以拆清协议忠实度与优化器证书各自贡献；certificate 也只约束定义内 divergence，不自动证明 patch correctness。

**阅读定位：** Figure 1 看 token-faithful coupling，Figure 2 看一次协商调用，Table 1 对照保留证据与 provenance 诊断。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### When LLM Decompilers Recompile More and Preserve Less

**论文信息：** Liu, Chang, Raff, Edward, Micinski, Kristopher；分类：Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05370](https://arxiv.org/abs/2609.05370)。

**一句话 TL;DR：** LLM 反编译器可以更容易重编译，却更少保留原程序行为；固定测试会奖励这种“干净但错”的恢复。

**为什么值得推荐：** 重编译率和 shipped-test 通过率是反编译常用指标，但二者无法识别合法输入上的行为漂移，也会把原本可见的未知项替换成流畅幻觉。论文引入不依赖手工测试的差分 oracle，证据链非常贴近真实软件分析。

**方法怎么工作：** Decompile-Diverge 先为每个函数合成 driver；再从参考二进制生长 fuzzing corpus；最后在同一输入上执行反编译结果，与原实现比较输出、崩溃和副作用，并在 established corpus、GitHub 函数与 CVE 函数上交叉验证。

**关键实验与证据：** 八个系统九种配置中，所有 shipped tests 都通过的候选仍有 4.9% 行为分歧，单系统最高 13%。300 个 GitHub 函数上，最强 refinement LLM 将 Ghidra build rate 从 75% 提到 90%，Matched 却从 74% 降到 62%；CVE 函数中最多约一成出现 Crash Absence。

**局限和可信度：** fuzz corpus 仍不是全输入空间，driver 合成与外部状态建模可能漏错；C 函数/既有语料不能代表所有语言和系统。它推翻的是“可重编译即可视为恢复正确”，不是证明差分测试完备。

**阅读定位：** Figure 1 看三个重构结果为何同过测试却异义，Figure 2 看行为比较 oracle；核心结果表对照 Build、Matched 与 Crash Absence。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### $\tau^\tau$-Bench: An Environment for End-To-End, Realistic Agent Construction

**论文信息：** Shi, Quan, Dhandhania, Keshav, Narasimhan, Karthik, Barres, Victor；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04611](https://arxiv.org/abs/2609.04611)。

**一句话 TL;DR：** τ^τ-Bench 不让 coding agent 修一个已定义 issue，而是让它从客户记录、代码库、API 和预算中交付可部署 Agent。

**为什么值得推荐：** 真实项目的失败往往来自需求澄清、数据理解、架构试验和成本约束，而不是单个函数写错。该 benchmark 把“构建 Agent 产品”本身变成端到端软件工程任务，明显比普通 repo issue 更接近客户交付。

**方法怎么工作：** 每题先提供业务记录、持有隐含需求的模拟客户、既有 codebase 与生产 API；开发 Agent 需要访谈、实现、部署并控制模型/服务成本；最终不是看 patch，而是在 held-out 模拟用户上运行所构建 Agent。

**关键实验与证据：** 53 个任务跨四个领域；最强 Claude Opus 5 + Claude Code 仅通过 23.9% 评测模拟，而专家 reference ceiling 为 82.2%。失败集中在浅查询、几乎不与客户沟通、架构与 serving spend 试验不足，以及第一个能跑的设计就直接交付。

**局限和可信度：** 模拟客户和 held-out user 仍是作者构造的，82.2% ceiling 也说明评分/环境并非无噪声；成本上限与模型访问会快速变化。它适合测综合工程闭环，不宜与 SWE-bench 分数直接等价。

**阅读定位：** Figure 1 看 client engagement 到部署评测全链，Table 1 比较邻近 benchmark，Figure 2 看 records/API/cost 等任务组成。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### Integrating Crash Report Mining and LLMs for Bug Localization and Repair: An Industrial Report

**论文信息：** Medeiros, Marcos, Kulesza, Uirá, Treude, Christoph, Lucena, Daniel, Gomes, Rafael, Coelho, Roberta, Adachi, Eiji, Bonifacio, Rodrigo；分类：Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04483](https://arxiv.org/abs/2609.04483)。

**一句话 TL;DR：** 把 stack-trace 聚类与可疑文件/方法排序交给 LLM 前置，可以在工业 Java crash 集上提高定位与修复成功。

**为什么值得推荐：** 生产 crash 往往成簇出现，单条日志又缺乏足够上下文。论文不是只给 LLM 一段异常，而是先用经典 crash mining 压缩证据，再评估模型是否能把聚类、排名和源码转成可验证 repair。

**方法怎么工作：** 研究先比较五个 LLM 与四种 prompt 配置；再在 18 个 bug 子集上选出最佳设置并扩到两个大型 Java 企业系统的 38 个 crash bug；最后由人工核对定位、补丁正确性、结构特征与解释模式。

**关键实验与证据：** 最佳配置在全数据上定位率最高 71%，正确修复 52%。Fig. 1 给出数据固定、prompt 选择与扩展评估的八步流程；人工修复类别标注 κ=0.583、95% CI [0.544,0.622]，说明一致性只有中等。

**局限和可信度：** 38 个 bug、两个私有系统与回顾性人工判定限制复现；没有公开测试 oracle 或线上对照，也难区分排名器和 LLM 的独立贡献。最可信结论是 crash mining 能提供有效上下文，而非已达到自动部署。

**阅读定位：** Fig. 1 是主入口；结果表核对五模型四提示的选择过程，并留意人工标注一致性和两个系统的分项结果。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### Harbor Adapters and Harbor-Index: Infrastructure and a Curated Meta-Dataset for Large-Scale Agentic Evaluation

**论文信息：** Shi, Lin, Lin, Haowei, Zhu, Zixuan, Zhou, Xiaoyue, Li, Xiang, Lin, Xiangning, Deng, Yaxuan, Xu, Han, Li, Yuangang, Li, Shanda, Chen, Zizhao, Xing, Hanwen, Raj, Harsh, Chen, Bo, Shi, Quan, Dillmann, Steven, Gao, Yipeng, Khanna, Puneesh, Lu, Ruofan, Zhou, Chao Beyond, Yang, Michael, Zhang, Robert, Chai, Siyuan, Chang, Jiayu, Chen, Yizhao, Chen, Xiaokun, Dai, Yiwei, Yang, Wenting, Liu, Hange, Liu, Minghao, Wang, Zihan, Assadi, Adnan El, Stroebl, Benedikt, Buchanan, E. Kelly, Meng, Han, He, Junwei, Yu, Longxuan, Shayanfar, Radin, Lee, Yukyung, Dong, Zhikang, Hart, Allen G, Wei, Anjiang, Kashyap, Anurag, Khatua, Arpandeep, Zheng, Audrey Jixin, Ma, Chengrui, Heineman, David, Chen, Dubing, Trinh, Hai-Anh, Fang, Haishuo, Zhang, Hefan, Shen, Hui, Sugiura, Issa, Sun, Jiankai, Gao, Jiechao, Lin, Junhong, Li, Junnan, Yang, Kai, Hsiung, Lei, Wang, Maoyu, Tang, Mengze, Omi, Nabil, Raoof, Negin, Edwards, Nicholas, Guo, Octavia, Mastromichalakis, Orfeas Menis, Ji, Pengliang, Hejman, Przemysław, Qi, Qi, Lin, Qunshu, Zhuang, Richard, Yang, Rui, Zheng, Ruichen, Marten, Ryan, Fazliani, Shaghayegh, Hou, Shizheng, Jiang, Sicong, Li, Sijie, Bian, Song, Zhuo, Terry Yue, Wu, Tianqing, Tang, Tom, Zhao, Wanjia, Xuan, Weihao, Liang, Wenhua, Liu, Xian, Lan, Xin, Zhang, Xuan, Zhao, Xuandong, Tang, Yanchuan, Jiang, Yifan, Li, Yijiang, Guan, Yitong, Li, Yizhi, Liu, Yonghui, Tang, Yuheng, Yujun, Mao, Zhao, Yunfei, Wang, Yuxin, Tang, Yuxuan, Tang, Zhenheng, Li, Zhifei, Wang, Ziruo, She, Ziyu, Liu, Kaiyuan, Chaabane, Iheb, Tang, Yuxin, Li, Xiangyi, Konwinski, Andy, Li, Boxuan, Chen, Leon Liangyu, Dimakis, Alex, Carlini, Nicholas, Vosoughi, Soroush, He, Di, Guha, Etash, Feuer, Benjamin, Merrill, Mike, Schmidt, Ludwig, Shaw, Alex；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04298](https://arxiv.org/abs/2609.04298)。

**一句话 TL;DR：** Harbor 用统一 adapter、跨原生 harness 的配对运行与人工审计，把分散 Agent benchmark 变成可比且可负担的评测基础设施。

**为什么值得推荐：** Agent 分数经常混入环境移植误差和 scaffold 差异。本文同时做 adapter parity、模型×harness 对照与难题子集审计，推荐理由不是又一个榜单，而是试图把评测搬运本身变成可审计工程。

**方法怎么工作：** 先将 80 多个 benchmark 适配到统一 task/environment/test schema；再让 8 个能力层级模型在 54 个 benchmark 上分别跑 Terminus-2 与三种 native harness；最后经难度过滤、AI+人工审计和 audit-fix loop 构造 29 benchmark、82 题的 Harbor-Index。

**关键实验与证据：** 在 Harbor-Index 上，没有模型-harness 组合超过 30%；最强 GPT-5.5 with Codex 为 28.0%。Figure 2 还把原论文最好分数与统一复测并列，揭示 benchmark progress、adapter parity 与 harness sensitivity 不能混成一个数字。

**局限和可信度：** 82 题索引适合低成本回归，不代表 80+ benchmark 的完整能力分布；统一 adapter 也可能抹平原环境特性。需要依赖开放日志和 parity tests 判断每个移植是否真正等价。

**阅读定位：** Figure 1 看 54 个 benchmark 的 adapter/evaluation 图，Figure 2 看历史最好成绩与统一复测，Harbor-Index 部分看 82 题审计漏斗。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### EVOHARNESSBENCH: Can Your Agents Keep Pace with an Evolving Harness?

**论文信息：** Ke, Zixuan, Patil, Vaidehi, Shi, Haizhou, Li, Yang, Liu, Ye, Shekkizhar, Sarath, Koul, Anurag, Wang, Jiayu, Nguyen, Xuan Phi, Yavuz, Semih, Bansal, Mohit, Joty, Shafiq；分类：Multiagent Systems (cs.MA) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04280](https://arxiv.org/abs/2609.04280)。

**一句话 TL;DR：** 即使模型和旧任务不变，仅仅扩展工具、skill 或 specialist-agent harness，也会让已会的能力遗忘。

**为什么值得推荐：** 持续学习通常让任务流变化、harness 固定；真实 Agent 产品恰好相反，工具和技能持续升级。EVOHARNESSBENCH 把非平稳性放到执行接口本身，并区分 retention 与 adaptation，这是很必要的新评测轴。

**方法怎么工作：** 基准从 verifier-based 任务确定性构造 17 条多阶段 harness stream；沿 tools、skills、agents 三轴逐步增删能力；随后分别做 deployment retention 与 self-evolving adaptation，比较旧任务保持和新能力吸收。

**关键实验与证据：** 共 802 个任务、520 个工具、42 个 skills、62 个 agents。结果呈现三类稳定缺口：扩容本身会降低旧任务成绩；经验积累对新阶段增益不一致；保留旧能力与适应新能力有时方向相反。

**局限和可信度：** 17 条人工设计 stream 仍无法代表真实插件生态，工具数量也不等于语义冲突难度；论文揭示的是 harness-induced forgetting 现象，不提供通用修复。复现应保留每阶段接口 diff 与逐题轨迹。

**阅读定位：** Figure 1 看三种 harness 演化与两种评测，Figure 2 看现实生态增量；结果图重点比较 expansion 前后的旧题 retention。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### The History Is the Detector: Executing CVE Patch History, End-to-End

**论文信息：** Wu, Qiushi, Eykholt, Kevin, Park, Youngja, Shu, Xiaokui, Kirat, Dhilung, Schales, Douglas Lee, Molloy, Ian；分类：Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI); Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05335](https://arxiv.org/abs/2609.05335)。

**一句话 TL;DR：** BUGSTONE-E2E 把 CVE 修复史编译成带 provenance 的检测 skill，再用运行证据与双侧差分测试确认漏洞和补丁。

**为什么值得推荐：** 漏洞数据库保存了为何代码危险以及怎样被修，但通常停留在人读的 advisory。本文把历史变为可执行 rule，且在轻量筛选、LLM 检查、运行复现与 patch 验证之间设置成本漏斗，避免直接让 Agent 猜漏洞。

**方法怎么工作：** 先从 verified fixing commit 提取 anchor、fix semantics 和 CVE provenance，按 CWE/语言组织；再用 Tree-sitter 枚举并以启发式缩小候选，LLM Agent 只看剩余项；最后构建 runtime verification，生成 scope-checked patch，并要求补丁前失败、补丁后通过的双侧差分测试。

**关键实验与证据：** 从 2022-2026 年 19,325 个高危 CVE 找到 2,710 个 fixing commits，形成覆盖 56 个 CWE family 的 1,033 条规则、打包为 172 个 skills；在 14 个程序上产出 644 个有 runtime evidence 的发现。

**局限和可信度：** 摘要没有给出 644 项中的真阳性率、人工复核规模和最终 patch acceptance，历史 pattern 也可能偏向高复现 CWE。它最有力的是证据漏斗与 provenance，不是“发现数”等于新漏洞数。

**阅读定位：** Figure 1 看三段端到端漏斗，Table 1 看高复现 pattern，Table 2 核对 CVE→skill→运行证据的数量流失。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### How to Speculate about Uncertainty in Agentic Coding? A Draft-Model Gate Method

**论文信息：** Grotov, Konstantin, Malykh, Valentin；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05274](https://arxiv.org/abs/2609.05274)。

**一句话 TL;DR：** 用小型 draft model 对黑盒 coding-agent 已生成 token 做一次反向似然评分，可以在执行前预测失败并节省成本。

**为什么值得推荐：** 黑盒 Agent 不给 logits，错误动作又要执行后才暴露。Speculative Uncertainty 把 speculative decoding 倒过来：不生成草稿，而是用开放小模型审阅既有轨迹，得到可校准、可被路由或 veto 使用的外部风险信号。

**方法怎么工作：** 方法先区分 reasoning 与 action span；再由 draft model 单次 forward 计算跨模型 token likelihood 并抽取 phase-aware feature；最后对可执行 objective 校准失败概率，并在下游部署一个 pre-execution veto gate。

**关键实验与证据：** 在 Qwen3-Coder-480B 与闭源 Claude 3.5 Sonnet 软件工程 Agent 上，gate 将执行错误率降低 6-8 个百分点，token 成本降低 14%-19%，且无需重训即可迁移到分布外 benchmark。Table 1/2 分别报告预测与部署效果。

**局限和可信度：** 似然不等于语义正确，draft 与目标模型 tokenizer/分布差异可能改变信号；veto 也会牺牲合法动作，摘要未给全部 false-reject 代价。它适合作为外部风险特征，不应替代执行验证；部署时还应按任务严重度分别报告触发率、漏拦率和被拒正确动作。

**阅读定位：** Figure 1 看 trajectory→draft score→gate，Table 1 看 failure prediction，Table 2 看错误率与成本，Table 3 看校准。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### Does Your Agent's Memory Survive a Model Upgrade? A Controlled Study of Memory Portability

**论文信息：** Goyal, Ankit, Ray, Jaideep；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Information Retrieval (cs.IR)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05339](https://arxiv.org/abs/2609.05339)。

**一句话 TL;DR：** 模型升级时，同一 memory store 并不等于同一记忆；自然语言压缩和混合 embedding 会发生方向依赖的迁移损失。

**为什么值得推荐：** 长期 Agent 往往升级 reader/model 却复用旧 notes 或向量库。论文把 raw long-context、RAG、自然语言 notes 和固定 schema KG 分开，并保留原始历史来测试可修复性，直接击中持续部署中的隐藏兼容问题。

**方法怎么工作：** 先用 48 条带随机答案码的合成历史避免参数记忆；再让两个 10B 以下开放模型分别写入/读取四种 memory format，并模拟 writer swap、50/50 混合 embedding；最后做 deficit decomposition 与 store-only/source-retained repair。

**关键实验与证据：** KG-fixed 在 writer swap 后仅变化 +0.0004±0.0020；NOTES 因迁移方向不同可 +9.91 或 -13.28 个点。混合索引只拿到 4.96 点，而完全重嵌入带来 11.90 点；NOTES 的 80% deficit 来自写入时丢失，RAG 的 81% 来自检索。

**局限和可信度：** 合成历史、两个小模型和 exact answer 任务比真实记忆简单；KG 的 schema 成本也未充分计入。结论应限定为必须做方向性迁移测试、隔离 embedding space，并保留 source history。尤其不能把平均迁移无损当成每条权限、偏好和事实都被保留。

**阅读定位：** Figure 1 比较四种 format，Figure 2 看 writer/reader/embedding 迁移矩阵，Table 1 看假设与统计检验。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### CONTINUITY: Security-Context Contracts for Composable LLM Agent Controls

**论文信息：** Zheng, Chris, Yang, Geng；分类：Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05269](https://arxiv.org/abs/2609.05269)。

**一句话 TL;DR：** 单个安全控件都正确仍可能端到端失效；CONTINUITY 用签名上下文和 assume-guarantee contract 保证授权语义穿过组件边界。

**为什么值得推荐：** Agent 系统会串联 provenance、授权、协议 adapter 与 execution gate，风险恰恰出现在 context 被丢弃、扩权、重绑定或重新解释的接口。论文把安全从组件性质提升为 instruction-to-effect 的组合性质。

**方法怎么工作：** 框架先以 signed root grant、provenance commitment 建立起点；再让每个角色携带 role-bound receipt、typed release 与 transformation witness；最后由 effect-bound permit 在 finality boundary 前检查 principal、task、delegation、policy state 与 canonical action 的完整链。

**关键实验与证据：** 参考 verifier 覆盖四个应用域、32 类 cross-layer fault；2,560 个参数化攻击实例中完整配置没有提交 harmful effect，同时完成 700 个 benign task，并将 200 个 ambiguous case 全部升级处理。

**局限和可信度：** 结果来自确定性 fault injection 与作者的参考实现，无法覆盖 prompt injection、实现 bug 或签名根被攻破；“0 harmful effect”只在定义的 128 个 fault-domain 类内成立。真实部署还需验证 clock、撤销传播、密钥轮换和跨组织身份映射不会让合同语义漂移，也要测试异常恢复时收据链是否保持完整。

**阅读定位：** Figure 1 看 planner 在信任边界外的架构，Figure 2 看 verifier，Table 1 核对 32 类 discontinuity fault。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### Forgetting Without Restarting: Execution-State Unlearning for Stateful LLM Agents

**论文信息：** Yao, Chao, Wei, Yangbo, Huang, Zhen, Qian, Junhong, Chen, Chenle, Lu, Shaoqiang, Wu, Chen, He, Lei；分类：Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04875](https://arxiv.org/abs/2609.04875)。

**一句话 TL;DR：** 真正的 Agent 忘却必须重算被撤销信息之后的执行状态；删除一条文本记忆无法清除 summary、plan 与 KV cache 中的派生影响。

**为什么值得推荐：** 现有 forget API 把 memory 当数据库行，但长程 Agent 是状态机。论文给出 counterfactual 定义、重算下界和跨 prompt/memory/cache 的实现合同，因此不只是在做一个新的 unlearning benchmark。

**方法怎么工作：** 先将运行建模为确定性 transition system 并定位目标注入步 τ；再用 provenance graph 求 taint closure、裁剪到目标前 checkpoint/KV prefix；最后删除目标、重放后缀，使用显式、随机和无字符串探针比较 full reset。

**关键实验与证据：** 理论下界为至少重算 T-τ+1 个 transition，Selective Replay 达到该界。普通 memory deletion 泄漏不变，指令式遗忘在 elicitation 下 Leak@probes=1.00，source redaction 仍在 80% episode 受撤销偏好影响；selective replay 与 full reset 不可区分，最多少 9 倍 token。

**局限和可信度：** 确定性模型、可追踪注入点和可裁剪 cache 是强假设；外部工具副作用无法仅靠重放撤销。它解决的是 execution-state counterfactual，不是现实世界 effect 的回滚；随机采样、并发工具与远程状态还会让“完全重放”本身需要额外收据。

**阅读定位：** Figure 1 看派生状态污染，Figure 2 看 selective replay；Table 1/3 对照 leakage、行为抽取与成本。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### ARIA - An Agentic Framework for Autonomous Testing of Infotainment Systems

**论文信息：** Azevedo, António, Lima, Bruno, Faria, João Pascoal；分类：Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04913](https://arxiv.org/abs/2609.04913)。

**一句话 TL;DR：** ARIA 用视觉闭环多 Agent 在实体 Android 车机上执行测试并保存逐步证据，但高误报仍是工业接入的主要障碍。

**为什么值得推荐：** OTA 频繁更新让脚本维护困难，单/双 Agent 又容易把导航失败误判为产品缺陷。该工作提供真实硬件、已知缺陷、重复运行与成本记录，比模拟 GUI benchmark 更能说明运行行为验证的边界。

**方法怎么工作：** 输入是 path/action/expected outcome 的单句场景；每一步由感知、规划、动作与验证四类 Agent 协作，并在报告阶段生成可复现脚本与截图证据；失败时还能用 short-circuit replay 和更强模型复访。

**关键实验与证据：** 30 个场景中 28 个得到 verdict，20 个与 ground truth 一致，即 71.4%；5 个已知缺陷全部检出，没有把故障判为正常。8 个 false positives 来自导航/图像/手势限制；第一遍单 Agent FP 为 72.0%，多 Agent 为 52.6%。

**局限和可信度：** 样本只有一款制造商车机与 30 场景，ground truth 和系统未公开；零漏报只覆盖 5 个缺陷。它显示视觉测试可进 CI 探索，但在自动阻断发布前必须先压低误报。

**阅读定位：** Figure 1 看层次架构，Figure 2 看标准执行，Figure 3 看 replay；结果表核对首轮、复访与成本。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### Same Request, Different Answer: Quantization Amplifies Cache-Induced Divergence in LLM Serving

**论文信息：** Patodiya, Aditi；分类：Software Engineering (cs.SE) ; Distributed, Parallel, and Cluster Computing (cs.DC); Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04748](https://arxiv.org/abs/2609.04748)。

**一句话 TL;DR：** prefix cache 并非透明优化：量化会放大 cache-state 引起的 Agent 轨迹分歧，而该状态通常不在请求中也不会重置。

**为什么值得推荐：** 相同模型、seed 与请求仍可能因服务端缓存历史得到不同动作，这会破坏评测复现和生产审计。论文通过禁用 cache 的 bit-identical 对照、执行顺序实验与状态恢复，把常被归因于模型随机性的误差定位到 serving state。

**方法怎么工作：** 实验固定 batch size 1、串行运行 80 episode 工具任务；跨两个引擎和四种权重量化比较 cache on/off；再操纵服务器 prompt-cache 配置、执行顺序与 cache restore，最后用 single-turn bridge 确认分歧可到达任务结果。

**关键实验与证据：** 开 cache 后，16-bit 有 36.2% episode 改变轨迹，4-bit 达 75.0%；关 cache 的 800 次重复为 0 分歧。一个 server setting 可移动 37.5 个百分点；恢复状态后两条路径各自 40/40 可复现，却有 14 项彼此不同。

**局限和可信度：** 只测两个引擎、四种格式和一个 workload；aggregate accuracy 未显著变化，不代表每次差异都伤害正确性。关键建议是把 cache state 纳入运行证据，而不是禁用所有缓存。

**阅读定位：** Figure 1 看 cache-state 因果路径，Table 2 看量化×缓存矩阵及受控重测。

**与当天主题的关系：** 它进入今天的可靠 Agent/软件变更主线，因为把模型能力与执行环境、软件工程 oracle、状态或权限边界分开测量。复现时应保存任务输入、工具版本、完整轨迹、diff 与 verifier 输出；只有结果能被独立执行、回放或反事实比较，才可把提升解释为可靠性改善。

### Step Back to Move Forward: Reflection-Aware Preference Optimization for Visual Generation

**论文信息：** Wu, Junlong, Lin, Jiuzhou, Sun, Jia, Zhang, Boheng, Wang, Huaiqing, Fan, Dewen, Liu, Houde, Gan, Qianqian, Yang, Fan, Gao, Tingting；分类：Computer Vision and Pattern Recognition (cs.CV)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04282](https://arxiv.org/abs/2609.04282)。

**一句话 TL;DR：** RA-GRPO 先反演扩散轨迹做弱到强的“后退反思”，再把更优反事实路径蒸馏回前向生成策略。

**为什么值得推荐：** 生成模型的 group-based RL 容易只在当前支持集里挑相对好样本，持续放大奖励漏洞。本文把 search-based reflection 与 policy learning 连接起来，试图扩展可达轨迹而不增加部署时推理步骤。

**方法怎么工作：** 流程先用 weak estimator 反演中间 latent；再把状态拉向更高概率的数据流形并合成 counterfactual path；最后将纠正路径隐式蒸馏进标准 GRPO policy，并在 T2I/T2V、多个 reward model 上比较 baseline 与消融。

**关键实验与证据：** 主实验在 8×H800 上训练 300 step，而 baseline 多 5% step 以补偿额外计算；Table 1 显示多种自动 alignment 指标一致领先，Table 2/3 分离 counterfactual synthesis 与 reflection ratio，Table 4 将结论扩到 Wan2.1 视频模型。

**局限和可信度：** 摘要未给绝对增益，评测高度依赖自动 reward model，所谓缓解 reward hacking 仍需人评和分布外 prompt 支撑；reflection 还增加训练计算。创新性高，但证据可信度应读表而非只看定性图。

**阅读定位：** Figure 1 看 RA-GRPO 两模块，Figure 2/3 看定性差异，Table 1-4 核对自动指标、消融与跨模型泛化。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### Extremely Sparse Supervision Incentivizes Reasoning Ability

**论文信息：** Liu, Zhishuai, Xu, Xingzi, Seyfioglu, Mehmet Saygin, Xu, Pan, Bouyarmane, Karim；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04565](https://arxiv.org/abs/2609.04565)。

**一句话 TL;DR：** OPD 每条轨迹只监督一两个 token、约全部 token 的 0.05%，仍常能追平甚至超过全 token 训练。

**为什么值得推荐：** 这不是普通节省算力技巧，而是在挑战“密集 teacher token 信号是 OPD 有效原因”的解释。跨 teacher/student 尺度、模型族、数学/代码任务和 PPO-RLVR 的重复现象，使它成为当天 post-training 最值得细读的机制论文。

**方法怎么工作：** 作者构造九个 Qwen3 teacher-student family；对每条 student rollout 分别只选随机 token、最小/最大 teacher-student 概率差 token，与 plain full-token OPD 对照；再把设计移到 Llama、coding reasoning 与 PPO。

**关键实验与证据：** 一两个 token 只占约 0.05%；max-token 多数情形超过 plain OPD，min-token 可匹配，随机一 token 也稳定提升。论文报告只用几千个受监督 token 即产生显著参数与能力变化，并发现 reverse KL 有时反而上升，否定简单的“更接近 teacher”解释。

**局限和可信度：** 选择 token 需要先获得 teacher 分布，未必按监督 token 比例等比例省总计算；机制仍主要来自受控小规模模型，token 极差也可能与梯度幅度混杂。结论是稀疏触发值得研究，不是 0.05% 数据普遍足够。

**阅读定位：** Figure 1 看稀疏 OPD 机制，Table 1/2 看九个 family 与 token 策略，Figure 2-4 和 Table 3-4 看代表性 pass@k。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### Persistent Teacher Anchoring for Tool-Using Agents

**论文信息：** Park, Hyun Bin, Song, Kyungho, Lee, Sangmin, Chang, Du-Seong；分类：Machine Learning (cs.LG) ; Artificial Intelligence (cs.AI); Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04773](https://arxiv.org/abs/2609.04773)。

**一句话 TL;DR：** PTA 让 teacher 不只审文本，还在整个 turn 验证通过后才允许工具调用接触环境，从源头阻止错误 observation 污染后续蒸馏。

**为什么值得推荐：** OPKD 在 student 自己的状态上学习，但工具调用会先执行、后监督；一次错误 call 返回的 observation 会永久改变后缀。Persistent Teacher Anchoring 把 proposer-verifier 的承诺边界扩到 environment side effect，问题定义非常清楚。

**方法怎么工作：** student 逐 chunk 提案，teacher 逐块决定保留；在包含 tool call 的 turn 完整验证前不执行；已验证 chunk 作为原子单元跨 update 保持，persistent lookahead 利用空闲槽推进未来样本并携带未完成 rollout。

**关键实验与证据：** 相同下游 RL 预算下，Search-R1 式检索与 DeepEyes 感知任务的 macro best@4 分别比 OPKD 高 2.5、2.8 点；lookahead 吞吐从 0.519 到 0.644 samples/s，增 24%。student token 保留率仍为 90.5%/88.4%，说明不是 teacher 全面接管。

**局限和可信度：** 两类任务各训练一次，显著性主要来自评测变化；teacher 成本、错误 teacher 和复杂多工具副作用尚未充分覆盖。其可靠性来自 commit-before-execute，而不是保证 teacher 判断正确；还应报告因审查造成的尾延迟与被错误阻断的有效调用。

**阅读定位：** Figure 1 看 call commitment 边界，Figure 2 看 persistent scheduling，Table 2/3 看两类任务，Table 5 看吞吐。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### ConsensusBench: Benchmark of Consensus Nodes for LLM Reasoning via Outcome Reward Densifying

**论文信息：** Yan, Shi-Qi, Tan, Chao-Hong, Chen, Qian, Wang, Wen, Li, Xiangang, Ling, Zhen-Hua；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04648](https://arxiv.org/abs/2609.04648)。

**一句话 TL;DR：** ConsensusPR 从多条正确轨迹中抽取可验证的共同中间结论，把纯终局奖励加密成 node coverage 过程信号。

**为什么值得推荐：** outcome-only GRPO 无法指出长推理在哪一步失去关键子结论。论文避开自由文本 PRM，使用正确 rollout 的语义共识作为 sub-outcome，并同时报告正确率、覆盖率与每节点 token，给过程奖励增加可检查结构。

**方法怎么工作：** 先过滤每题 N 条正确轨迹并聚类等价中间陈述；再保留含公式/数字的 consensus nodes 并构造 ConsensusBench；最后将 NCR 与终局 Acc 线性组合或做两阶段 curriculum，在 GRPO/DAPO 上训练。

**关键实验与证据：** 实验覆盖 AIME 2024/2025、GSM8K、MATH-500；Table 3 报告 pass@1/pass@16/NCR，多个模型上 ConsensusPR 一致超过 outcome-only。α 默认 0.5；Table 4/5 用 TPN 与难度分析显示长题更受益，Table 9 做权重敏感性。

**局限和可信度：** nodes 由多条正确答案和闭源模型抽取，可能把共同但非必要的模板当关键步骤；作者也承认尚未设计独立 PR 算法。改进应解释为当前 node pipeline 的效果，不是过程正确性的完整标注。

**阅读定位：** Figure 1 看 outcome-only 的四类 mismatch，Table 2 看 NCR 一致性，Table 3-9 看主结果、难度和 α 消融。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### RISE: Recursive Improvement via Self-Extrapolating Policy Distillation

**论文信息：** Li, Yang, Yavuz, Semih, Joty, Shafiq；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05295](https://arxiv.org/abs/2609.05295)。

**一句话 TL;DR：** RISE 把当前 checkpoint 相对历史 anchor 的 RLVR 位移外推成“未来 teacher”，再以 OPD 将稀疏 outcome 更新变为密集 token 目标。

**为什么值得推荐：** 外部 teacher 有分布错配，自蒸馏又受当前模型能力上限。本文利用训练轨迹自身的低维结构构造非静态 teacher，把 RLVR 的方向性与 OPD 的细粒度结合，是一种真正改变 teacher 来源的 recipe。

**方法怎么工作：** 每轮先用 RLVR 从 θn 更新到 θn+1；再在权重或 logit 空间沿位移以 β>1 外推，并用 EMA anchor/β decay 控制距离；最后让当前 student 对外推 policy 做 on-policy distillation，循环刷新 teacher。

**关键实验与证据：** 1.7B-8B 模型、数学/STEM/代码/多轮 Agent 四类任务上均胜 RLVR-only 和自蒸馏；三个方向解释约 87% 轨迹方差。总 wall time 为 GRPO 的 1.3-1.6 倍且不增采样；Figure 5 显示移除 RLVR 或 OPD 都明显退化。

**局限和可信度：** 线性外推只在低曲率、低维局部可信，安全 β 范围随训练收窄；reward 被 hack 时外推会放大错误方向。论文自己明确这一限制，因此需要 reward uncertainty 或多目标 gate。

**阅读定位：** Figure 1 看 RLVR→外推→OPD 循环，Table 1/2 看数学与多域结果，Figure 2-6 看效率、消融和 β 安全区间。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### What Matters in On-Policy Distillation? A Perspective on Data Efficiency and Data Selection

**论文信息：** Hou, Zhinan, Zhang, Jiaqi, Cai, Xunliang, You, Keyou；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05198](https://arxiv.org/abs/2609.05198)。

**一句话 TL;DR：** OPD 的数据效率可能主要来自长 CoT 暴露的思维模式，而非样本数量或高熵 token；8 道难题可追平 17K 数据。

**为什么值得推荐：** 在 post-training 中，数据选择通常按正确率或 entropy。本文用 1-shot 极端实验拆机制，发现连 teacher/student 都解不出的难题也能训练 student，迫使我们重新理解 dense distribution supervision 提供了什么。

**方法怎么工作：** 先对单题 OPD 追踪 student-teacher overlap 与验证曲线；再把难度、CoT 长度和 token entropy 分开，并做长度约束；最后按难题筛 8 个样本，与 DAPO-Math-17K 全集在 1.5B-7B 四模型上比较。

**关键实验与证据：** 8 个样本的 1.5B student 达 53.6%，17K baseline 为 53.7%；AIME/AMC 用每题 16 次 rollout，其他集 mean@4。难题更稳定提升，解释变量更接近长 CoT 中的反思/替代路径，而非高熵 token。

**局限和可信度：** 重复使用极少样本会改变 update 次数与 token 暴露，长 CoT 也可能只是更大训练量；数学任务和小模型外推有限。论文提供了反常现象与控制线索，尚未给出完整因果机制。

**阅读定位：** Figure 1 看 1-shot 动态，Figure 2 看 token KL，Table 1-3 比较单样本/少样本/模型尺度，Figure 4 做长度控制。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### MCPO: Modality-Contrastive Preference Optimization for Multimodal Chain-of-Thought Compression

**论文信息：** Yang, Guangheng, Ni, Zhenliang, Wu, Zhenkai, Shu, Han, Feng, Juan, Yang, Wenming, Hu, Jie；分类：Computer Vision and Pattern Recognition (cs.CV) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04947](https://arxiv.org/abs/2609.04947)。

**一句话 TL;DR：** MCPO 用有图/无图推理差异识别视觉无关步骤，再以非对称偏好损失压缩多模态 CoT，避免视觉懒惰。

**为什么值得推荐：** 长 M-CoT 的成本高，但按长度剪枝很容易删掉真正的视觉证据。论文把 modality contrast 变成 step-level 选择准则，再让偏好优化同时约束长度与跨模态一致性，比纯短答案蒸馏更有针对性。

**方法怎么工作：** 离线阶段比较 with-image/no-image reasoning，计算 NCMI 并删除视觉无关步骤；先对少量压缩轨迹做 SFT 初始化；再用有图上下文的陡峭 odds-ratio 梯度和无图上下文的平缓线性差，进行长度受控 preference optimization。

**关键实验与证据：** 训练样本少于 900；在 Qwen3-VL-Thinking 8B/4B 与多 benchmark 上，CoT 最多缩短 69.5%，端到端最高 3.34× 加速，同时保持原准确率。Figure 3 的 CLEVR 案例从 168-token 冗长链对照删减后的视觉证据链。

**局限和可信度：** NCMI 依赖无图反事实质量，可能把语言先验足够的正确步骤误判为视觉无关；“保持准确率”需看各 benchmark 和 seed，而不是最大加速。适用边界是多模态 reasoning compression。

**阅读定位：** Figure 1 看整体收益，Figure 2 看两阶段方法，Figure 3 看逐步剪枝；Table 1 核对 8B/4B 的准确率、token 与速度。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### SiLR: Structure-Preserving Admission and Process Reward for LLM Tool Agents

**论文信息：** Zhou, Chenyu, Jiang, Qiliang, Wu, Shuning, Zhou, Xu；分类：Artificial Intelligence (cs.AI) ; Machine Learning (cs.LG); Systems and Control (eess.SY)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04629](https://arxiv.org/abs/2609.04629)。

**一句话 TL;DR：** SiLR 不把工具安全压成一个总分，而是在 shadow execution 后按每个约束分支的严重度乘积序决定是否前进。

**为什么值得推荐：** 恢复阶段有时必须在仍违规时接受局部改进，标量 gate 会把不可比较的约束状态投影成同一分数，从而接受通向 plateau 或不安全分支的动作。论文证明这种失败是表示问题，不是调阈值能解决。

**方法怎么工作：** 每个 ReAct proposal 先在模拟器 shadow-execute；状态记录 overloaded-branch support 与逐分支 severity；只有在 product order 下不恶化并推进时才 admit。相同结构再作为 GRPO process reward，与 count/scalar projection 比较。

**关键实验与证据：** Gym-ANM 多动作场景中 SiLR 恢复 21/21，terminal gate 为 0/21，最佳 scalar 为 9/21；双约束 42,410 个 proposal 上 product order 接受 0 个物理不安全动作，support-only 却接受 63.2%。作为 reward 时 ungated policy 0.844，base 0.778。

**局限和可信度：** 主要环境是电网/建筑模拟，product order 需要可枚举、可确定模拟的约束，不适用于开放世界语义风险。安全性来自 simulator 和 predicate 正确，而非 LLM 本身；若 shadow model 与真实系统偏离，结构化 gate 也会稳定地执行错误模型。

**阅读定位：** Figure 1 看信任边界与 shadow gate，Figure 2 看恢复阶梯，Table 1 看与 scalar/filter 方法的差别。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### Safety for Whom? Boundary-Aware Self-Distillation for Controlled LLM Safety Refusal

**论文信息：** López-Ávila, Alejo, García-Ferrero, Iker, Garcia, Jezabel, Tiene, Antonio, Orús, Román；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04482](https://arxiv.org/abs/2609.04482)。

**一句话 TL;DR：** 安全后训练不能只增加拒绝覆盖；必须围绕部署边界同时生成 harmful/benign 对，并用目标模型自己可实现的响应补偿过拒。

**为什么值得推荐：** 同一政治主题中，事实问答应答、定向操纵应拒。文章用 narrow-boundary 把 topic safety 改成 decision boundary，并量化自生成数据缺口、外部 teacher 分布错配和 over-refusal 的连锁效应。

**方法怎么工作：** 先受控生成目标主题请求并以升级重试补齐拒绝轨迹；再加入 in-distribution compensation 和 harmful-benign boundary pairs；训练时比较外部响应与经验证的目标模型响应，评测两侧 refusal、广域安全与 XSTest。

**关键实验与证据：** 单轮生成有 19.88% 缺失，升级后仅 0.20%。目标拒绝 9.47%→84.75%，广域 unsafe 26.26%→0.14%，但 XSTest 过拒 2%→74%；换成目标模型响应后过拒 15.2%→5.2%，boundary pairs 将 comply-side 32.94%→4.16%。

**局限和可信度：** 主要是 Qwen3-8B 和政治说服边界，judge/生成器可能共享偏差；降低一侧错误会牺牲另一侧拒绝率。它最强的贡献是双边报告，不是某个单一 safety score。

**阅读定位：** Figure 1 看 narrow boundary，Figure 2 看覆盖缺口，Figure 5 看边界对；主表需同时读 refusal、unsafe 与 over-refusal。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### Iris: Climbing to the Search Frontier

**论文信息：** Liu, Ziyuan, Liu, Hengqi, Wang, Zichuan, Qin, Yang, Liang, Jiachen, Chu, Xu, Chen, Shaowei, Gu, Yuantao, Chuan, Mu；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04304](https://arxiv.org/abs/2609.04304)。

**一句话 TL;DR：** Iris 用网页图谱反向构造闭卷失败、证据可解的多跳题，再交替做轨迹过滤 SFT 与 live-search RL。

**为什么值得推荐：** 搜索 Agent 的训练数据很容易被字符串命中或题库泄漏污染。Iris 把可检索性、闭卷不可解和证据充分性做成准入条件，还把 context management 作为显式评测变量，训练 recipe 与 harness 控制都较完整。

**方法怎么工作：** 先从种子页出链构造实体图并把非答案实体改写成描述；只保留 reference model 闭卷失败、给证据后成功的题；生成轨迹后按 turn/trajectory 过滤做 SFT，再对 live search 做 RL，并将每轮最难且高效的成功轨迹回流下一轮 SFT。

**关键实验与证据：** 开启 context management 后，Iris-mini 在 BrowseComp/BrowseComp-ZH/DeepSearchQA/HLE 为 82.2/84.8/86.9/52.3，Iris-pro 为 88.6/85.1/92.9/56.4。所有结果来自单 ReAct Agent，无 sub-agent 与 test-time verification。

**局限和可信度：** 模型权重和完整 recipe 仍是计划发布，不是已验证 artifact；live search 会随索引变化，reward judge 与 summarizer 位于训练集群也构成隐藏依赖。评测必须同时报告有/无 context management，并冻结搜索快照或保存证据页，才可能复算历史结果。

**阅读定位：** Figure 1 和 Table 1 看四个 benchmark，Table 2 看 context management 策略；数据构造章节核对闭卷/证据 gate。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### CoSkill: Joint Reinforcement Learning of Reasoning and Meta-Skill Agents for Hierarchical Skill Evolution

**论文信息：** Feng, Jinyuan, Li, Dongmin, Chen, Yiqun, Gao, Yang, Chen, Xing, Wang, Huimu, Pu, Zhiqiang；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04865](https://arxiv.org/abs/2609.04865)。

**一句话 TL;DR：** CoSkill 把 reasoning agent 与会增删层级技能的 meta-skill agent 置于同一 RL 目标下，让技能库和策略共同适应。

**为什么值得推荐：** 既有 skill RL 要么在训练外更新库，要么把 meta workflow 写死，导致 policy 只能消费静态技能。本文将 skill management 本身变为可学习角色，并用共享 backbone/共同奖励做端到端 credit。

**方法怎么工作：** 推理 Agent 先检索 task skill 与其 child step skills；执行结果通过共同 task reward 回传；Meta-Skill Agent 再决定 refine、compose 或重组层级，两个角色共享 backbone 并在交互中联合优化。

**关键实验与证据：** ALFWorld 成功率 98.4%，WebShop 90.6%，分别比对照高 3.5 与 6.2 个百分点；Figure 1 同时报告早期 sample efficiency、最终性能和 wall-clock，Figure 2 对比外部编排、固定 meta workflow 与联合学习。

**局限和可信度：** 只覆盖两个经典文本环境，极高成功率可能接近饱和；共享 backbone 让 improvement 来源难完全归因到 meta-skill policy，技能污染与跨任务负迁移也需更长序列验证。还应检查 skill library 增长、删除错误技能和跨版本模型读取时的稳定性。

**阅读定位：** Figure 1 看样本/时间效率，Figure 2 看三种技能演化范式；结果表核对 ablation 与两环境独立增益。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### Towards Understanding Pause Token Fine-Tuning Dynamics: A Mode Retention Perspective

**论文信息：** Kim, Jaehyeon, Kim, Suhwan, Lee, Nakyung, Kim, Yeongoon, Seo, Jimin, Lee, Giho, Lee, Jungwoo；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04489](https://arxiv.org/abs/2609.04489)。

**一句话 TL;DR：** masked boundary pause 不只是增加推理计算，它在微调中同时减少旧模式覆盖，并把后续步骤信息压进边界邻近 token。

**为什么值得推荐：** pause token 常被解释为给网络更多“思考位”。论文从训练动力学出发，用 mode retention 与 non-myopic compression 两个受控 pilot 解释为何 mask 掉 pause loss 仍能改善推理，并把规则扩到 GRPO。

**方法怎么工作：** 先在合成持续学习任务测相同最终适配下的旧分布覆盖；再用 probe 测边界 token 对后续步骤的编码；据此在 reasoning step 边界插入 pause 并 mask 其 loss，随后在 Qwen/Llama SFT 与 GRPO 中验证。

**关键实验与证据：** masked pause 在 matched adaptation 下对旧分布的覆盖约少 4×；1B-8B 模型上数学最高 +6 点、代码最高 +2.5 点，同时保持通用语言能力。Figure 2/3 分别展示 phase-2 loss 与边界 probe，后续实验显示 GRPO 也保留增益。

**局限和可信度：** 两个机制 pilot 是合成任务，真实模型中的表示解释仍是相关而非因果；pause 位置和 step segmentation 可能依赖数据格式。需要 seed、token 预算和普通额外 token 对照。

**阅读定位：** Figure 1 看标准 SFT 与 MBP，Figure 2/3 看两项机制证据，主结果表看 1B-8B 与 GRPO。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### Same Trajectory, Contradictory Rewards (ROBORMBENCH): Paraphrase Fragility in Vision Language Reward Models

**论文信息：** Jeung, Wonje, Yoon, Sangyeon, Hong, Hyesoo, Cho, Yoonjun, Jeon, Dongjae, Kim, Bumjun, Oh, Jean, Yu, Youngjae, No, Albert；分类：Robotics (cs.RO) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05401](https://arxiv.org/abs/2609.05401)。

**一句话 TL;DR：** 同一机器人轨迹只换同义指令，VLM reward 就可能从成功翻成失败；规模和显式 reasoning 都不能稳定消除。

**为什么值得推荐：** reward model 在 RL 中拥有优化方向，若对语义等价表达不 invariant，policy 会学会措辞而非任务进度。ROBORMBENCH 用真实轨迹和人工核验 paraphrase 做同轨迹反事实，比普通相关性评测更能暴露奖励脆弱性。

**方法怎么工作：** 从 2,390 条真实机器人轨迹出发，生成词汇、句法和 action-goal 三类改写；经 ensemble 与人工验证得到 21,673 条 paraphrase；固定视觉轨迹，仅替换目标文本，比较通用 VLM、显式 reasoning 与专门 reward model 的 progress/reward。

**关键实验与证据：** 模型 ensemble 标出的 25 个案例中人工确认 24 个，构造质量较高。跨开放/闭源 VLM，改写会造成广泛分数漂移和 success/failure 翻转，且随改写距离增加；专门用 trajectory-grounded supervision 训练的 reward model 显著更稳定。

**局限和可信度：** benchmark 主要测机器人视觉奖励，paraphrase 验证仍不能证明严格语义等价；稳定性也不等于对真实进度校准正确。发布时应同时报告 accuracy 与同轨迹一致性。

**阅读定位：** Figure 1 看 contradictory reward，Figure 2 看数据构造；Table 1 看 ensemble/人工一致性，主表看改写类别与模型尺度。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

### Harness-agnostic detection and immunization of reward hacking in self-evolving language models

**论文信息：** Yang, Rongxin, Liu, Yang, Luo, Shang, Jia, Haoxuan, Zhang, Chongyang, Zheng, Hao, Yang, Yingguang, Huang, Yulin, Zhang, Jianshen, Qi, Yongzhi, Xu, Kefu, Ran, Congjing, Chong, Bin；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04665](https://arxiv.org/abs/2609.04665)。

**一句话 TL;DR：** HackProbe 用秘密固定 comparison core 加轮换探针监测 self-evolving 模型，并以低带宽 reselection 从候选池找回诚实更新。

**为什么值得推荐：** 持续“保留可见分数最高候选”会让模型逐代适应 proxy。论文将检测与恢复分开：固定分布提供跨代可比性，旋转层降低共同适应，结构 footprint 则帮助在不泄露 probe bank 的前提下重选。

**方法怎么工作：** 监视器通过两个黑盒 hook 接入任意演化 loop；对 level gap、尺度对齐 divergence、能力停滞和 confidently-wrong rate 做 Sidak 校正；风险层结合 secret core 与结构 gaming footprint，在每代最多泄露 log2Π bits 的反馈下重选候选。

**关键实验与证据：** 四种注入 hacking channel 上 AUROC 0.763，最强 baseline 0.663；FPR 从 0.706 降到 0.434。只有该 immunization 在攻击时找回的真实能力（平均 +5.2 点）多于 clean run 牺牲（4.7 点）。

**局限和可信度：** 宿主是受控 prompt-level 演化，单 channel 多数效应未单独显著；秘密 core 仍可能泄漏或发生分布漂移。它提供的是可校准审计结构，不是所有 reward hacking 的通用免疫。

**阅读定位：** Figure 1 看 fixed core/rotated layer/reselection，Table 1 看 pooled detection，Appendix Table 5 看校正与分项限制。

**与当天主题的关系：** 它进入今天的 post-training 主线，因为训练目标、反馈来源、更新路径或评测行为中至少有一项被真正拆开，而非只换数据后报一个平均分。复现时应固定采样预算、teacher/judge、token 暴露、推理 harness 与随机种子；若这些条件改变，结论只能解释为当前 recipe 有效，不能直接上升为普遍规律。

## 中相关论文速读

这些论文都有实质方法或可保留判断，但证据范围、控制变量、领域专用性或复现条件还不足以按强相关投入同等阅读成本。

### Beyond Code Generation: Reliability, Verification, and Cost Economics in the Agentic Software Development Lifecycle

**论文信息：** Bhati, Happy；分类：Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04681](https://arxiv.org/abs/2609.04681)。

这是一篇证据综合而非新实验：它用 Production-Qualified Change、Verification Tax 与 Agentic SDLC Control Plane，把产码量和真正交付分开。值得保留的判断是成本应按美元、reviewer-hour 与运行风险联合核算；但材料横跨学术与公司报告，不能把汇总数字当同一实验。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### MaxKernel: Agentic Kernel Generation for TPUs

**论文信息：** Wang, Shangkun, Cai, Nina, Hoong, Charles, Walker, Julian, Kroiz, Gerson, Vanica, George, Patil, Deepak, Gavrilescu, Andi, Sipra, Hassan, Sankaran, Sethu；分类：Artificial Intelligence (cs.AI) ; Performance (cs.PF); Programming Languages (cs.PL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04523](https://arxiv.org/abs/2609.04523)。

MaxKernel 让规划、实现、调试、测试和 profiling 子 Agent 共享实时编译反馈，在 JaxBench 50 个 TPU kernel 及真实模型 workload 上接近专家实现。开源 artifact 与硬件反馈很有价值；不过 TPU/内核优化高度专用，摘要缺少逐题正确率和等预算对照，暂不升强相关。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Design Docs Are All You Need: An AI-native Machine-Learning Performance Tool

**论文信息：** Kushnir, Samuel, Noorbakhsh, Kimia, Sreedhar, Kavya, Cheng, Liqun, Liu, Ming, Ranganathan, Parthasarathy, Alizadeh, Mohammad, Kjolstad, Fred, Subramanian, Suvinay；分类：Programming Languages (cs.PL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05364](https://arxiv.org/abs/2609.05364)。

SMART 把自然语言 design-doc DAG 作为持久 artifact，让 coding sub-agents 在版本变化时重新生成几乎整个性能模型库，并对 DeepSeek-V3/TPU 模型复现到 round-off 精度。这个“文档耐久、代码可再生”的命题大胆，但目前只有一个符号性能库和手审 reference，尚不足以替代一般代码维护。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Substrate-Aware AI Agents: Execution Context as a First-Class Input

**论文信息：** Agrawal, Manu；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05232](https://arxiv.org/abs/2609.05232)。

Substrate-Aware Agents 将内存/时限 contract 显式加入规划状态；128MB 条件在 14 个可执行配对中 13 个降低峰值内存，三个模型平均时间都下降，最快三倍。证明 prompt 中的运行边界会诱导结构改写，但任务只是欧氏距离程序，且模型、实现和资源 oracle 很窄。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Building a research-software catalog with a coding agent: from hackathon prototype to public deployment

**论文信息：** Yoshimi, Kazuyoshi, Terasaki, Satoshi, Yamada, Gotai；分类：Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI); Computers and Society (cs.CY); Physics Education (physics.ed-ph)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04711](https://arxiv.org/abs/2609.04711)。

研究软件目录的 hackathon 到公开部署案例说明，coding agent 产出很快，真正费力的是数据质量、对抗审查、浏览器级验证和发布 safeguard；最危险的是 plausible 但不完整的静默失败。它是诚实的工业/研究经验报告，但 MateriApps 部分仍在开发，缺少对照与规模化统计。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### TROVE: Adaptive Agent Skill Orchestration via Trace-Grounded Route Validation and Editing

**论文信息：** Wang, Tianxing, Zhao, Mingming, Huang, Shuai, Xu, Huiyang, Niu, Chaoyue, Liu, Shengzhong, Wu, Fan；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05019](https://arxiv.org/abs/2609.05019)。

TROVE 从评过分的 workflow trace 蒸馏原子/组合 skill 与 outcome-conditioned transition graph；在线只替换被新证据否定的 suffix，而不全盘重规划。代码、QA、数学上报告更好的质量-效率权衡，思路适合长程 Agent；摘要没有统一绝对数和跨 harness 稳定性。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### FinalityBench: An Effect-Level Benchmark for Agent Decisions Under Delayed and Conflicting Financial Finality

**论文信息：** Sharma, Abhishek；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04706](https://arxiv.org/abs/2609.04706)。

FinalityBench 用隐藏 canonical log 和分别故障的支付/账本/ERP/银行视图生成 321 个任务，45 对在决策时不可区分却需相反处置。按最终经济 effect 判分后，权威 finality gate 达 85.4%，说明 irreversible action 应由可观测终局状态约束；金融语义强，故放中档。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Rethinking Indirect Prompt Injection as a Test-Time Search Problem

**论文信息：** Nguyen, Duong M., Kim, Joon Sik, Manczak, Blazej, Mugunthan, Vaikkunth；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL); Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04495](https://arxiv.org/abs/2609.04495)。

文章把 indirect prompt injection 攻击重写成 test-time search：攻击 Agent 先侦察环境、维护策略、再用 victim feedback 迭代。贡献在提醒安全分数必须同时报告攻击者的 harness 与计算预算；当前摘要未给任务规模、绝对 ASR 和防御基线，所以先保留问题设定，不深读结论。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### CUA-Universe: A Scalable and Dynamic Environment for Hybrid GUI+CLI Agents

**论文信息：** Shi, Haoting, Wang, Wenhao, Fang, Weicheng, Liang, Yaozhong, Jin, Tian, Zhao, Pengxiang, Liu, Guangyi, Chen, Siheng, Wang, Yanfeng；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05374](https://arxiv.org/abs/2609.05374)。

CUA-Universe 自动把真实桌面软件封装成 GUI+CLI 环境，Task-Weave 生成任务，Path-Steer 收集 verified trajectory 做后训练。16 个应用上训练 9B 模型后，CUA-Verse +39.3 分、OSWorld +16.8 点且步数/token 均降；环境生成和 verifier 的独立审计仍决定可信度。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Trace2Tower: Transition-Aware EigenTrace Induction of Multi-Level Skills for LLM Agents

**论文信息：** Sun, Jiazheng, Yang, Boyu, Yuan, Binhao, Li, Mingxuan, Peng, Xin；分类：Artificial Intelligence (cs.AI) ; Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05261](https://arxiv.org/abs/2609.05261)。

Trace2Tower 把执行轨迹规范化为事件图，经 transition/outcome-aware 谱分解形成 action-template、procedure、strategy 三层 skill。ALFWorld 达 87.31% 且 10.35 步，WebShop exact success 50.67%；但经典文本环境与 verifier feedback 不能代表仓库级副作用。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### An Empirical Analysis of CodeQL False Positives and Query Refinements for Java Vulnerabilities

**论文信息：** Sajadi, Amirali, Dutta, Saikat, Chatterjee, Preetha；分类：Software Engineering (cs.SE) ; Cryptography and Security (cs.CR); Programming Languages (cs.PL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04535](https://arxiv.org/abs/2609.04535)。

对 110 个 Java 项目、167 个 CVE 的 500 条 CodeQL 假阳性人工归类后，查询 refinement 去掉 81.8% 样本 FP，保留 7/8 TP；给 Agent 模板后适配成功 56%/62%，无模板仅 28%。静态分析规则与 Agent 互补很扎实，但项目依赖的 refinement 限制外推。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### TruthInsightBench: An Evidence-Grounded Benchmark for Automated Evaluation of Open-Ended Scientific Discovery Agents

**论文信息：** Yang, Zhibo, Zhang, Chen, Zhang, Yuewei, Wang, Hao；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05079](https://arxiv.org/abs/2609.05079)。

TruthInsightBench 让 40 个 coding-agent 科学发现任务只见中立目标和冻结数据，用 29 个 artifact-grounded item 聚合六维证据成熟度。四个 Agent 只在 58.4-60.3 平台且无显著差别，暴露控制、稳健性、可证伪和跨集验证缺口；固定 LLM judge 仍是主要可信度风险。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### A Mixed-Method Empirical Study of LLM Assistance in Software Engineering Workflows

**论文信息：** Weerasinghe, Pamali D., Rajapakse, Roshan N., Dharmadasa, Isuru, Keppitiyagama, Chamath；分类：Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04214](https://arxiv.org/abs/2609.04214)。

混合方法研究比较一、四年级学生的 AI-assisted SE 工作流：问卷 n=157，任务实验仅 n=20。它观察到 AI-first、copy-transfer 和 AI-mediated debugging，且收益受任务、经验和验证实践调节；样本小、非职业开发者，使它更适合作为行为线索而非生产率结论。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Robustness and Trade-offs for Code LLMs on Protected Code

**论文信息：** Wen, Jin, Guo, Yuejun, Ma, Yujie, Hu, Qiang, Cordy, Maxime；分类：Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04220](https://arxiv.org/abs/2609.04220)。

七个 Code LLM 在 C++/Go/Java/JS、五种混淆法上做执行式翻译/补全，较强模型直接处理混淆代码仍约 90% Pass@1；先反混淆有时反而破坏原本成功样本。关键判断是安全分析 pipeline 应按模型和执行结果设计，但 benchmark 规模与保护强度需阅读全文再定。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Corten - Foundational Verification of Rust Programs

**论文信息：** Farka, František, Abate, Carmine, Linker, Sven, Ertel, Sebastian；分类：Programming Languages (cs.PL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04372](https://arxiv.org/abs/2609.04372)。

Corten 在 Rocq/Iris 中深嵌 Rust THIR 与 weakest-precondition 语义，保持 proof goal 接近源代码，并在 buddy allocator 上验证内存安全；合成测试的 proof size 缩短 2-4 倍。它是重要的程序验证基础设施，但没有 LLM/Agent 实验，因此作为可靠变更的邻接证据速读即可。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### DTM: Deterministic Approaches for Black-box Test Suite Minimization with Tree-based Similarity

**论文信息：** Siam, Md, Nahid, Shartaz Sajid, Hasan, Md Arif, Tawhid, Nurul Ahad, Sakib, Kazi；分类：Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04205](https://arxiv.org/abs/2609.04205)。

DTM 用 AST 相似度和 MST、谱聚类、动态规划实现确定性黑盒测试集最小化，在 Defects4J 16 项目、661 buggy version 上平均 accuracy 0.74、耗时 0.98 分钟。可复现性优于随机进化搜索，但“accuracy”与 fault preservation 的具体定义、baseline 预算仍需核对。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Testing Interchangeability in LLM Agent Teams

**论文信息：** Gao, Jianxin, Yu, Tianyi, Deng, Linna, Li, Runze, Wang, Zining；分类：Artificial Intelligence (cs.AI) ; Multiagent Systems (cs.MA)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05279](https://arxiv.org/abs/2609.05279)。

八支同底模 Agent team 经十轮形成私有 notebook 后交换同角色成员；相对仅制造 roster disruption 的 placebo，任务分数变化小，单位进展通信量却增加 16%-63%。它把团队约定的隐形状态量化出来，但只测 Hanabi/Overcooked 类协作，不直接等于软件团队。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Reviewer Capability Governs Rejection Targeting, Not Repair Skill: Evidence from LLM Execute-Review-Revise Pipelines

**论文信息：** Tanveer, Faizan；分类：Software Engineering (cs.SE) ; Computation and Language (cs.CL); Multiagent Systems (cs.MA)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04270](https://arxiv.org/abs/2609.04270)。

在 100 道奥数 execute-review-revise pilot 中，跨家族中等 reviewer 将准确率 52% 提到 64%，自审虽有 0.85 recall 却无显著增益，弱 reviewer 只翻倍成本且零改动。它清楚区分 rejection targeting 与 repair skill，但任务不是代码，配置也只有一组。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### From Interaction Traces to Persistent Skills: Online Evolution for Computer-Use Agents

**论文信息：** Hu, Longtao, Liang, Xiao, Zhu, Linchao；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04869](https://arxiv.org/abs/2609.04869)。

Skill-Evo4GUI 把轨迹和 evaluator feedback 写入版本化技能库，并以同栈 empty-library 为对照；四个 OSWorld 域后热身平均增益 5.7-18.6 点，同时揭示 accepted revision 也可能无法恢复原任务。在线经验复用证据不错，但迭代短、领域少且不更新权重。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### LLM-Guided Program Evolution for Circle Packing: Breaking 10 Packomania Records for $28

**论文信息：** Sander, Wes；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05093](https://arxiv.org/abs/2609.05093)。

LLM-guided program evolution 以可执行几何评分驱动搜索，用约 28 美元打破 10 个 circle-packing 记录。它展示低成本、oracle 清晰的代码搜索可以产生新结果；任务结构极窄，记录提升不等于仓库级维护能力，适合作为 execution-guided evolution 案例。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Dynamic Adaptation of the LLM Context for Generating Routines with Coupled Semantics

**论文信息：** Villuri, Gnaneswar, Shaik, Hashmath, Doboli, Alex；分类：Software Engineering (cs.SE) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04570](https://arxiv.org/abs/2609.04570)。

该工作针对具有耦合语义的 routine 生成动态调整上下文，让模型在局部代码与跨例程约束之间切换。值得记住的是 context selection 也是软件变更算法的一部分；摘要层面的任务规模、执行 oracle 和与长上下文 baseline 的等预算对照不足，因此暂列中相关。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Breaking the Alphabet: Rethinking File Ordering in Code Review

**论文信息：** Rahman, Md Shamimur, Codabux, Zadia, Roy, Chanchal K.；分类：Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04207](https://arxiv.org/abs/2609.04207)。

文章质疑 code review 中按文件名/字母序展示 diff 的默认做法，讨论顺序如何改变审查者对依赖与风险的理解。它与多文件变更定位直接相邻，但主要贡献偏人因/界面，尚未证明新的 Agent verifier 或 patch-correctness 方法。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### A Governance Methodology Layer for AI-Assisted Software Development: Defect Taxonomy, Controlled Ablation, and Process-Over-Capability Evidence

**论文信息：** Kwon, Sungjin；分类：Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04218](https://arxiv.org/abs/2609.04218)。

治理方法层用缺陷 taxonomy、controlled ablation 和 process-over-capability evidence 约束 AI-assisted development。价值在要求结论绑定流程证据而非模型名；但更像方法论提案，经验规模和可复用工具不如当天的 Harbor/EVOHARNESSBENCH。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Large Language Models for Fuzz Testing in Microservices: A Systematic Literature Review

**论文信息：** Song, Ying, Ping, Ke, Wang, Yuqing, Li, Xiaozhou；分类：Software Engineering (cs.SE)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04219](https://arxiv.org/abs/2609.04219)。

这篇 SLR 整理 LLM 在微服务 fuzz testing 中的输入生成、接口推断与反馈循环，适合查研究空白和数据集。由于没有新的执行 benchmark 或可复现实验，证据来自异构研究，不能拿汇总优点替代具体系统比较。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Propagation Model for SSC attacks: Why SBOM (tools) don't tell the whole truth

**论文信息：** Grgic, Ljubica, Maksimovic, Lazar, Laskov, Pavel；分类：Cryptography and Security (cs.CR)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05380](https://arxiv.org/abs/2609.05380)。

供应链攻击传播模型提醒 SBOM 只列组件，无法表达构建、部署和运行时的可达路径。对 coding-agent 生成依赖与补丁审计很有用；文章的核心仍是 SSC attack propagation，不是 LLM Agent，因此只保留“从清单到可执行路径”的判断。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### A Cost-Aware Agentic Architecture for NL-to-SQL over Nested Enterprise Schemas, with a New Benchmark

**论文信息：** Varadharajan, Yoga Sri Varshan, Yadav, Ajay, Goru, Ritesh, Chaudhury, Prateek, Caramanis, Constantine, Jain, Prateek, Pasupuleti, Divyateja, Pandey, Sunil Kumar；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04641](https://arxiv.org/abs/2609.04641)。

面向嵌套企业 schema 的 NL-to-SQL 架构按成本选择检索、规划与验证阶段，并提供新 benchmark。它是复杂工具 Agent 的现实案例，但 SQL 正确率、schema 泄漏与成本对照依赖专有数据；与仓库级变更的同步修改问题仍有距离。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### ERPBench: Evaluating LLM Agents for Enterprise Decision-Making Across Competitive Market Ecologies

**论文信息：** Zhang, Xinran, Lu, Pengrui, Ye, Lyumanshan, Liu, Pengfei；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04667](https://arxiv.org/abs/2609.04667)。

ERPBench 将 LLM Agent 放入相互竞争的企业市场生态，测试连续决策而非单问答。可关注资源、反馈和对手造成的非平稳性；商业模拟的 ground truth 与软件构建/测试不同，因此适合作为长程系统评测补充，不替代 coding benchmark。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### DCFA: Dual-view Causal-inspired Attribution for Failure Reasoning in LLM-based Multi-agent Systems

**论文信息：** Wang, Zehao, Wang, Lanjun, Jin, Shilong, Chen, Junjie, Xiao, Yanghua；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04749](https://arxiv.org/abs/2609.04749)。

DCFA 用双视角、因果启发的归因分析多 Agent 失败，试图把错误从最终团队结果定位到成员与交互。它回应了 credit/audit 痛点，但自动归因是否与干预一致、人工标注一致性和对修复决策的真实收益需看完整实验。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### KVMem: Virtualizing Million-Token Agent Workspaces on a Consumer GPU

**论文信息：** Chai, Di, Wang, Leye, Su, Zeshen, Xia, Zhiguo, Yu, Zhihang；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04852](https://arxiv.org/abs/2609.04852)。

KVMem 将百万 token Agent workspace 虚拟化到消费级 GPU，核心价值是把长期上下文的 cache 状态作为可管理系统资源。它主要优化 serving，不改变 policy，也没有直接 patch-correctness 证据；可关注其淘汰/恢复是否保持确定性。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Compact-Memory LLM Agents via Online Max-Member Clustering and Atom-Aware Packing

**论文信息：** Geng, Jiahe, Wang, Jinpeng, Yuan, Kun；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04915](https://arxiv.org/abs/2609.04915)。

Compact-Memory Agents 用 online max-member clustering 与 atom-aware packing 控制长期记忆规模，目标是保留可检索语义而不无限增长。问题重要，但摘要没有显示权限、撤销或模型升级测试；相比当天 memory-portability/unlearning 两篇，安全与迁移边界较弱。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### ICM-Bench: Person-Level Identity Reasoning in Multimodal Agents with Long-Term Memory

**论文信息：** Ren, Shidu, Liu, Yunze, Liu, Xing, Wu, Chi-Hao, Zhou, Enmin, Shen, Junxiao；分类：Computer Vision and Pattern Recognition (cs.CV)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04438](https://arxiv.org/abs/2609.04438)。

ICM-Bench 评测多模态 Agent 的 person-level identity reasoning 与长期记忆，补充了现有任务只测短上下文的空白。身份线索容易涉及隐私和数据泄漏；若没有跨 session provenance 与撤销机制，较高识别率不能直接解释为更可靠。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Why Better Models Can Create Riskier Systems: Evidence from LLM Agents in Financial Markets

**论文信息：** Ross, Jillian, So, Eric, De Simone, Zoe, Pozniak, Charles, Lo, Andrew W.；分类：Artificial Intelligence (cs.AI) ; Computers and Society (cs.CY)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04373](https://arxiv.org/abs/2609.04373)。

金融 Agent 模拟显示更强模型的行为相关性更高；共同信息正确时风险下降，共同误导时相关行动形成不可分散风险地板。它提醒多 Agent 系统不能把单体能力单调映射到系统安全，但结论来自金融仿真，跨域仍是开放问题。它与当天可靠 Agent/软件变更主题的边缘关系在于：提供了可执行环境、分析 oracle、轨迹/记忆机制或现实工程观察，但没有同时给出足够强的仓库级、跨 harness 与独立验收证据。若要复现，应优先核对任务真实性、版本、日志、失败样本和 verifier 覆盖，而不是只看总成功率。

### Unifying ICL, SFT, KL-Regularized RL Through a Bayesian Lens

**论文信息：** Fan, Junxin；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05111](https://arxiv.org/abs/2609.05111)。

这篇理论 note 将 ICL、SFT、KL 正则 RLHF/RLVR、reward-weighted/advantage-weighted SFT 统一成“构造 Gibbs posterior，再做 forward-KL projection”。概念整理很清楚，也解释 cold start 的必要性；但主要是目标/一阶更新等价，没有新的规模实验，不能把统一形式误作训练行为等价。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Joint Alignment and Distillation for Video Generation via Sample-Guided Distribution Matching

**论文信息：** Lin, Jiuzhou, Wu, Junlong, Zuo, Fei, Ouyang, Huan, Fan, Dewen, Zhang, Boheng, Wang, Huaiqing, Sun, Jia, Yang, Fan, Liu, Houde, Chen, Kehai, Zhang, Min, Gao, Tingting, Li, Han；分类：Computer Vision and Pattern Recognition (cs.CV)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04283](https://arxiv.org/abs/2609.04283)。

DM-Align 在单阶段 distribution matching 中同时加入逼近真实分布与偏好样本的两条梯度，试图避免视频模型先 RL 后蒸馏成本高、先蒸馏后 RL 崩塌。多基础模型上优于独立/顺序流程，但摘要缺绝对指标、人评和计算量，先保留方法而不升强。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Distilled Continuous Diffusion Language Models Can Write Code in Few Steps---or One

**论文信息：** Peng, Fred Zhangzhi, Zheng, Kaiwen, Zhang, Anru R.；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04531](https://arxiv.org/abs/2609.04531)。

PlaidQ 将 0.7B 自回归模型改造成连续扩散代码模型，再用 distribution matching 做少步、paired trajectory 做一步蒸馏。16 步在 HumanEval/MBPP+ 的 pass@10 为 31.78/40.49，一步 HumanEval pass@1 仍有 7.07；证明可行但离实用 coding agent 很远。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### VLA-Precision: Asymmetric Co-Bootstrapping for Efficient Real-World Online RL of Vision-Language-Action Models

**论文信息：** Su, Chenyu, Shen, Zhaolong, Qian, Yuan, Qian, Chen, Zhang, Rui, Yan, Feng, Chen, Weixing, Zhang, Fei, Wang, Jiamin, Cong, Shuang, Shang, Weiwei；分类：Robotics (cs.RO) ; Artificial Intelligence (cs.AI); Human-Computer Interaction (cs.HC); Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04355](https://arxiv.org/abs/2609.04355)。

VLA-Precision 以人工干预早期 bootstrap、全局 return 与局部 preference 校准 value，并用 streaming 架构加速现实在线 RL。九个化学任务、四种机器人上平均成功 98.3%，每任务 45.8 分钟，吞吐最高 10.9×；实机证据强，但机器人专用且安全成本高。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Refuse without Refusal: A Structural Analysis of Safety-Tuning Responses for Reducing False Refusals in Language Models

**论文信息：** Kim, Minji, Kim, Hyounghun；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04714](https://arxiv.org/abs/2609.04714)。

作者把 safety-tuning 响应拆成 boilerplate refusal 与 rationale，发现只训 rationale 可减少表面风险词触发的误拒，同时保持所测安全表现。数据结构洞察很实用；但摘要没有跨模型绝对率、攻击覆盖和开放 artifact，故作为数据配方速读。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### A Verifier-Guided Explainable Reasoning Framework with Gold-Anchored QLoRA, Task-Aware Mixture-of-Experts, and Group-Relative RLVR

**论文信息：** Vo, Thi Kim Trang, Le, Nam Tien, Vo, Thi Kim Nguyet, Tran, Minh Khang, Tran, Duy Phuong；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05221](https://arxiv.org/abs/2609.05221)。

Qwen2.5-3B 先做 gold-anchored QLoRA，再按逻辑/物理路由 FOL-Z3 或公式单位 verifier，并用 P1/P2/P3 构造 RLVR。438 个 held-out 中 P3 从 50.68% 到 72.20%，hybrid P1 约 55.94% 基本不变；说明更会解释不等于更正确。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### When Financial Fine-tuning Fails: A Three-Level Detectability Analysis of Numerical Hallucination in Domain-Adapted Language Models

**论文信息：** Li, Xiaodong, Liu, Peiwei；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04806](https://arxiv.org/abs/2609.04806)。

受控金融摘要实验中，base numerical hallucination 约 5.4%，domain FT-A 的显式货币幻觉达 82.5%，再加 numeracy supervision 达 98%。作者定位到模板注入而非数理能力不足；数字极端、任务单一，需要复现，但这是后训练破坏 restraint 的重要负结果。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Compositional Reward Models for Conditional Medical Image Generation

**论文信息：** Tyagi, Aayush Kumar, P., Prathosh A., Mausam；分类：Computer Vision and Pattern Recognition (cs.CV)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05028](https://arxiv.org/abs/2609.05028)。

PRISM 把医疗条件图像奖励分成纹理/强度、结构对齐与高层语义，并用细到粗 constrained propagation 防止易指标掩盖硬错误。生成数据使 PanNuke mDice +2.3%、CeDeM MRE -8.5%、ISIC F1 +5.9%；领域窄但 reward decomposition 清楚。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### GEPARD - Generative, Prosody-aware, Autoregressive text-to-speech model for Realtime Dialogue

**论文信息：** Pavlov, Denis, Abdurazakov, Ulanbek, Bakashov, Nursultan；分类：Audio and Speech Processing (eess.AS) ; Computation and Language (cs.CL); Machine Learning (cs.LG); Sound (cs.SD)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04222](https://arxiv.org/abs/2609.04222)。

GEPARD 将流式 TTS 做成标准 LLM engine 可服务的解码器，并把两遍 classifier-free guidance 用 DPO 蒸馏进单次权重；单流 RTF 约 0.067，256 并发总加速约 204×。这是部署友好的蒸馏案例，但主要贡献在语音系统。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Distill Globally, Adapt Locally: Reasoning Distillation and Product-Type Test-Time Training for Scalable Trade-Up Recommendation

**论文信息：** Liu, Siliang, Ghasemi, Mohammad, Patel, Sapan, Banitalebi-Dehkordi, Amin；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05363](https://arxiv.org/abs/2609.05363)。

该工作将全局 reasoning distillation 与按商品类型的 test-time training 结合，用于大规模 trade-up 推荐。它体现“离线通用策略+上线局部适应”的 post-training 接口；商业排序反馈、非平稳性和在线安全未展开，因此暂列中相关。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### EuroAlpaca: Task-Preserving Localisation of Instruction Data for European Languages

**论文信息：** Sant, Aleix, Luque, Jordi, Escolano, Carlos；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05043](https://arxiv.org/abs/2609.05043)。

EuroAlpaca 研究如何在欧洲语言间本地化 instruction data 而不破坏原任务结构。值得看的是 task-preserving 数据变换和跨语言评测；若只报告语言覆盖而缺少语义等价人工审计、遗忘与安全测试，便不足以证明通用 instruction following 改善。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### SAM-D2Q: Aligning Multimodal Doc2Query with Search Demand and Conversion for E-commerce

**论文信息：** Zhou, Hui, Ji, Jian Hui, Ma, Lei, Xiao, Rong, Zeng, Xiaoyi；分类：Information Retrieval (cs.IR)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04961](https://arxiv.org/abs/2609.04961)。

SAM-D2Q 用搜索需求与转化信号对齐多模态 doc2query，在电商检索中把生成目标直接接到用户反馈。它属于 preference/behavior-aligned 后训练，但私有点击/转化会混入曝光偏差，且推荐系统指标难与通用多模态能力比较。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Generating Constructive Feedback on Stories via Reinforcement Learning

**论文信息：** Stahl, Maja, Ziegenbein, Timon, Wachsmuth, Henning；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04824](https://arxiv.org/abs/2609.04824)。

文章用 RL 训练模型为故事生成建设性反馈，关注反馈是否具体、可执行而非只流畅。它提供 outcome 之外的质量信号设计案例；任务主观、judge 可靠性和作者真实改写收益比 reward 分数更关键，故不做强推。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### LentEx: Generalizable Latent Entity Extraction via Synthetic Data and Instruction-Tuned LLMs

**论文信息：** Bodhwani, Umesh, Ling, Yuan, Senthilkumar, Cibi Chakravarthy, Dong, Shujing, Feng, Yarong, Li, Hongfei, Goyal, Ayush；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04511](https://arxiv.org/abs/2609.04511)。

LentEx 通过合成数据和 instruction-tuned LLM 做可迁移 latent entity extraction。保留价值在合成任务覆盖与跨域泛化；若实体 schema、teacher 与 evaluator 同源，提升可能来自格式适配而非新能力，需要人工标注与污染控制。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### LookThere! Sparse Vision by Reinforced Selection

**论文信息：** Rammohan, Sreehari, Yassin, Yousef, Fuller, Anthony, Wen, Junfeng, Vondrick, Carl, Shelhamer, Evan；分类：Computer Vision and Pattern Recognition (cs.CV) ; Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04698](https://arxiv.org/abs/2609.04698)。

LookThere! 用强化学习选择稀疏视觉区域，以更少观察维持任务表现。它展示 post-training 可以学习算力分配而不只学答案；不过对象是视觉选择，奖励是否鼓励忽视难例、对分布外场景是否稳定需进一步核对。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Training Large Language Models for Small-Molecule Design with Synthetic Task Scaling

**论文信息：** Hu, Frank, Chennakesavalu, Shriram, Wang, Zichen, Suriana, Patricia, Vani, Bodhi, Shmilovich, Kirill, Chuang, Kangway, Grambow, Colin；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04735](https://arxiv.org/abs/2609.04735)。

小分子设计工作用可自动扩展的合成任务训练 LLM，把任务生成与后训练规模联系起来。领域 oracle 相对明确，但化学有效性、可合成性和真实湿实验之间仍有鸿沟；更适合读数据 scaling recipe 而非泛化能力 headline。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Importance-Aware Low-Rank Distillation of Diffusion Transformers

**论文信息：** Zavadski, Denis, Heid, Sebastian, Kalšan, Damjan, Roth, Stefan, Rother, Carsten；分类：Computer Vision and Pattern Recognition (cs.CV)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04646](https://arxiv.org/abs/2609.04646)。

Importance-Aware Low-Rank Distillation 用重要性分配压缩 diffusion transformer，目标是在固定低秩预算下保留高贡献子空间。方法属于蒸馏/效率主线，但与语言模型和 Agent 行为证据距离较远，需看 wall-clock、相同 FLOPs 与不同分辨率泛化。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### ReCAST: Restoration-aware Cascaded Stage-wise Training for Obfuscated SMS Risk Classification

**论文信息：** Huang, Jieyun, Shen, Yi, Zhao, Kaikai, Yan, Jiangze, Zhang, Wenjing, Chen, Ping, Wang, Ning, Liu, Zhaoxiang, Wang, Kai, Lian, Shiguo；分类：Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04878](https://arxiv.org/abs/2609.04878)。

ReCAST 以 restoration-aware、级联分阶段训练处理混淆短信风险识别，强调先恢复可用信号再逐阶段适配。它是后训练 pipeline 设计，但单一分类域与混淆分布很专用；相较通用偏好/RL 机制，只需保留 stage-wise 恢复的判断。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Compression Beyond the Uncompressed: A Two-Stage Training Recipe for Soft Context Compression in RAG

**论文信息：** Guo, Shuyu, Zhang, Shuo, Ren, Zhaochun；分类：Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05152](https://arxiv.org/abs/2609.05152)。

Soft context compression 的两阶段 recipe 先训练表示压缩，再适配 RAG 下游目标，试图超越直接在未压缩上下文上训练。它触及训练效率和部署一致性；是否真的“超过未压缩”必须在同 token/计算预算和检索质量下判断。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### A Systematic Evaluation of Cross-Lingual Consistency Enhancement Methods in Multilingual Language Models

**论文信息：** Qi, Jirui, Wang, Mingyang, Schütze, Hinrich, Fernández, Raquel, Bisazza, Arianna；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04409](https://arxiv.org/abs/2609.04409)。

系统比较多语 LLM 跨语言一致性增强方法，适合作为选择 SFT、对齐或表示约束时的经验地图。它的价值在统一评测而非新算法；语言、任务与翻译质量会强烈影响排名，不能将某个平均分外推到所有语言。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Multi-Step Tool-Calling over Korean Open Public APIs: A Benchmark and a Data-Synthesis Recipe

**论文信息：** Kim, Dain, Cho, Eungi, Kim, Kyumin, Noh, Shinyeong, Lim, Kyuseong；分类：Artificial Intelligence (cs.AI) ; Computation and Language (cs.CL)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05395](https://arxiv.org/abs/2609.05395)。

韩国开放公共 API benchmark 同时给多步 tool-calling 任务和数据合成 recipe，能检验本地语言、schema 与跨调用状态。它补足非英语工具数据，但成功依赖 API 稳定性、参数 oracle 和合成模板多样性，尚不足以证明通用 Agent 迁移。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### WeAgent-MMGenEdit: A Full-Stack Recipe for Multimodal Agentic Image Generation and Editing

**论文信息：** Zhang, Hui, Liu, Zongkai, Niu, Liqiang, Liu, Juntao, Li, Han, Cao, Zhen, Chen, Wenchao, Zhao, Chengduo, Meng, Fandong；分类：Computer Vision and Pattern Recognition (cs.CV)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05171](https://arxiv.org/abs/2609.05171)。

WeAgent-MMGenEdit 提供多模态 Agent 图像生成/编辑的全栈训练配方，涉及数据、工具和行为轨迹。覆盖完整值得作为 recipe 索引；但生成质量、编辑忠实度与 agentic workflow 的增益需分别消融，避免把更强底模误作 Agent 后训练效果。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Mitra-v2 Technical Report

**论文信息：** Tao, Yefan, Zhang, Xiyuan, Liu, Xinyi, Han, Boran, Maddix, Danielle, Fang, Haoyang, Han, Zhen, Gai, Jiading, Liu, Xuanqing, Bohlke-Schneider, Michael, Yuyang, Wang, Friedland, Gerald, Mah, Kevan, Lee, Chris, Kong, Chris；分类：Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04540](https://arxiv.org/abs/2609.04540)。

Mitra-v2 technical report 提供模型训练与对齐的系统性说明，适合查数据混合、SFT/偏好阶段和评测边界。技术报告通常覆盖面大但控制实验少，本次只保留 recipe 与开放性信息，不按单一 benchmark headline 深读。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Scale-QLoRA: Code-Invariant Adapter Merging for Native 4-bit Microscaling LLMs

**论文信息：** Li, Tung-Ling, Huang, Jiale, Wang, Lee-Chi, Gotei, Janaki Ram；分类：Computation and Language (cs.CL) ; Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04526](https://arxiv.org/abs/2609.04526)。

Scale-QLoRA 研究原生 4-bit microscaling 下可跨尺度合并、保持代码不变的 adapter，目标是降低后训练与部署摩擦。关键要看量化底座、merge 后行为、吞吐和 full precision 对照；当前把它列为 PEFT 工程方法，不与能力型论文同级。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Cultural Misalignment in Large Language Models: Detection, Measurement, and Mitigation Through Targeted Fine-Tuning

**论文信息：** Czolgowski, Antoni, Iyasele, Abel；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI); Computers and Society (cs.CY)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04485](https://arxiv.org/abs/2609.04485)。

针对文化错位的检测、量化和 targeted fine-tuning 说明对齐不能只看英语平均值。值得保留的是先定位具体文化维度再适配；风险是刻板化标签、群体内差异和 evaluator 文化立场，不能用单一“更一致”指标代表更安全。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### PLUME: Parameter-Efficient Personalization of Large Language Models via Low-Rank User Modulation in Shared Subspaces

**论文信息：** Li, Xinyu, Zhou, Hao, Zhu, Jianfeng, Maharjan, Julina, Guo, Ruixin, Dragan, Feodor, Jin, Ruoming；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04715](https://arxiv.org/abs/2609.04715)。

PLUME 用共享低秩子空间中的用户调制做参数高效个性化，减少每用户独立 adapter 成本。它属于持续个性化 post-training，但隐私、用户漂移、撤销和跨用户负迁移比静态平均指标更重要；这些部署边界在摘要中不充分。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### First Things First: Teaching LLM-Based Agents to Prioritize Must-Haves before Nice-to-Haves

**论文信息：** Ju, Tianjie, Xu, Xinyue, Sun, Wanxuan, Diao, Lingxiao, Liu, Gongshen, Zhang, Zhuosheng, Yang, Cheng；分类：Computer Vision and Pattern Recognition (cs.CV)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05224](https://arxiv.org/abs/2609.05224)。

First Things First 训练/评测 Agent 先满足 must-have 再优化 nice-to-have，把多目标偏好从加权总分改成优先级约束。这个目标结构很重要；若 must-have 标注来自同一 judge，仍可能把错误边界固化，需看硬约束违例率和分布外任务。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Constructing and Evaluating Clinical Reasoning Trajectories for Medical Agent

**论文信息：** Zhu, Yunqi, Zhang, Wensheng, Yang, Xuebing；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05090](https://arxiv.org/abs/2609.05090)。

医疗 Agent reasoning trajectory 的构造与评测可作为 process supervision 数据案例。临床链路存在多条合理路径，final answer 正确也不保证过程安全；若没有专家一致性、证据引用和反事实病例，轨迹质量不能仅由 LLM judge 决定。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### MM-IFEval-Pro: A Multilingual and Attack-Resistant Benchmark for Instruction-Following in Vision-Language Models

**论文信息：** Xiao, Changming, Ni, Zhenliang, He, Jinhui, Shu, Han, Hu, Jie；分类：Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04859](https://arxiv.org/abs/2609.04859)。

MM-IFEval-Pro 用多语、抗攻击条件测 VLM instruction following，属于 post-training 评测而非训练算法。它适合检查对齐是否只记模板；关键是攻击覆盖、语言人工校验与 deterministic grading，故放中档而不与机制论文并列。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### TIER: Threat Implicitness Benchmark for Evaluating LLM Safety Behaviors

**论文信息：** Trinh-Thi, Thu-Hien, Vong, Hai-Yen, Ung-Dung, Thanh-Ha, Ho, Tram；分类：Cryptography and Security (cs.CR) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05117](https://arxiv.org/abs/2609.05117)。

TIER 以威胁表达的隐含程度分层测试 LLM safety behavior，能发现只对显式危险词拒绝的表面化对齐。它提供 safety post-training 的诊断切片；真实 intent 不可观测，隐含性标注和双用请求的合理响应需要人类校准。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Machine Unlearning as Private Retroactive Algorithms

**论文信息：** Kaplan, Haim, Kohen, Refael, Mansour, Yishay, Nissim, Kobbi, Stemmer, Uri；分类：Cryptography and Security (cs.CR) ; Data Structures and Algorithms (cs.DS)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.05329](https://arxiv.org/abs/2609.05329)。

Machine Unlearning as Private Retroactive Algorithms 从理论上刻画删除请求、历史状态和隐私保证。它帮助区分“删训练样本”“删运行记忆”和“撤销行为影响”；但缺少 LLM/Agent 实证，今天只作为 execution-state unlearning 的理论邻接项。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### When Do Internal Probes Beat Reading the Answer? Miscalibrated Readouts and Behavior-Concealed Knowledge in Language Models

**论文信息：** Villuri, Gnaneswar, Shaik, Hashmath, Doboli, Alex；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04582](https://arxiv.org/abs/2609.04582)。

论文比较 internal probe 与直接读模型答案，研究被行为隐藏的知识及失准 readout。它关系到 verifier/critic 能否发现模型“知道但不说”；probe 的训练分布、因果干预与跨模型可移植性决定是否可用于后训练审计。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### When Seeing Overrides Knowing: Visual Dominance and Deferral-Based Method for Personalized Safety in VLMs

**论文信息：** Sun, Edward, Wu, Yuchen, Ma, Zixian, Jiang, Eric Hanchen, Xiao, Yijia, Yi, Xiaoyuan, Krishna, Ranjay, Wang, Wei, Wang, Jindong, Caliskan, Aylin；分类：Computer Vision and Pattern Recognition (cs.CV) ; Artificial Intelligence (cs.AI); Machine Learning (cs.LG)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04281](https://arxiv.org/abs/2609.04281)。

该 VLM 工作把个性化安全边界与视觉支配现象一起建模，并用 defer 机制减少不确定时的错误执行。它提醒安全策略必须随用户/场景变化；但视觉医疗/个性化设置的 ground truth 和 privacy 代价较专用。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

### Knowing What Not to Answer: Selective Non-Compliance in Vision-Language Models

**论文信息：** Kim, Minji, Jang, Jihyoung, Kim, Hyounghun；分类：Computation and Language (cs.CL) ; Artificial Intelligence (cs.AI)；arXiv 官方列出日期：2026-09-07；[arXiv:2609.04720](https://arxiv.org/abs/2609.04720)。

Selective Non-Compliance 让 VLM 学会只拒绝不应回答的部分，而不是整段拒绝。它与 false refusal 的结构分析互补；需要同时检查 harmful leakage、benign helpfulness 和视觉诱导攻击，当前摘要不足以判断三者是否都改善。它与当天 post-training 主题的边缘关系在于：确实改变了训练数据、反馈、优化或安全评测的一环，但证据目前受领域、摘要信息或控制变量限制。细读前应先核对 teacher/judge 是否独立、预算是否匹配、是否报告随机种子和分布外行为；这些缺口也是它没有进入强相关层的原因。

## 可留意 / 可跳过

这一层不是“无关”，而是只保留一个关键词或边界判断；若目标是复现当天最强机制，可以先跳过。

- **[The Prompt Triangle: A Registered Report on Prompts as Hybrid Artifacts](https://arxiv.org/abs/2609.04209)**（2609.04209）：把 prompt 视为同时具有代码、文档和社会协商属性的 hybrid artifact；概念值得记，但 registered report 尚无结果。
- **[Cost-Aware Hierarchical Multi-Agent Ransomware Detection and Family Attribution](https://arxiv.org/abs/2609.04820)**（2609.04820）：分层多 Agent 做勒索软件检测与家族归因；可关注成本路由，跳过原因是单域分类而非通用软件变更。
- **[From Language Models to World-Acting Systems: Progress and Limits of Agentic AI across Digital, Social, Virtual, and Physical Environments](https://arxiv.org/abs/2609.04894)**（2609.04894）：Agentic AI 跨数字、社会、虚拟、物理环境的进展综述；适合查引用，不提供新的执行证据。
- **[Software Engineering in the Agent Era From Trustworthy Change to Human Agent Software Organizations](https://arxiv.org/abs/2609.04630)**（2609.04630）：用 Trustworthy Change、Responsibility Topology、Human-Agent Cell 讨论 Agent 软件组织；作者明确经验有效性仍待检验。
- **[Why Is SHAP Not a Reliable Standalone Explanation Framework for Malware Detection?](https://arxiv.org/abs/2609.04626)**（2609.04626）：证明 SHAP 在相关 PE 特征上会稀释、误归因甚至反号；是可靠安全分析邻接项，不是 coding-agent 方法。
- **[JLIR: A Julia-Native MLIR-Inspired Intermediate Representation with Automatic JACC Kernel Extraction](https://arxiv.org/abs/2609.04585)**（2609.04585）：Julia-native、MLIR-inspired IR 与自动 accelerator kernel 抽取；编译基础设施扎实，但和 LLM 变更主线间接。
- **[LLM-Driven Algorithm Design for Quantum Circuit Synthesis based on Binary Decision Diagrams](https://arxiv.org/abs/2609.05327)**（2609.05327）：LLM 设计量子电路综合算法；可记 algorithm-design agent，跳过原因是专用表示与 oracle。
- **[Data-Related Challenges and Requirements for Event Log Generation in Process Mining: A Systematic Literature Review](https://arxiv.org/abs/2609.04211)**（2609.04211）：流程挖掘 event-log 生成的数据挑战 SLR；对轨迹合成有借鉴，但无 Agent 或 post-training 新实验。
- **[MABPD: Multi-Agent Bias Probing & Detection via Structured Argument Debate](https://arxiv.org/abs/2609.04841)**（2609.04841）：用结构化辩论做多 Agent bias probing；领域偏评测，归因与 judge 独立性需要更多证据。
- **[A Structured Debate-Mixture-of-Agents Framework for Complex Clinical Diagnostic Decision Support](https://arxiv.org/abs/2609.05069)**（2609.05069）：临床诊断的 debate-mixture-of-agents；风险高且领域专用，不宜从模拟性能外推通用协作可靠性。
- **[ElderBench: Benchmarking Autonomous Mobile Agents for Older Adults](https://arxiv.org/abs/2609.04850)**（2609.04850）：面向老年人的自主移动 Agent benchmark；保留可及性与安全场景，和软件变更较远。
- **[La Agente \'Optima: Towards Agentic Self-Driving Laboratories](https://arxiv.org/abs/2609.04564)**（2609.04564）：Agentic self-driving lab；可关注现实闭环与人类接管，但化学实验平台不可直接迁移到 coding。
- **[Lightweight Vision Transformer Compression for On-Device Plant Disease Detection in Resource-Constrained Agricultural Field Conditions](https://arxiv.org/abs/2609.05334)**（2609.05334）：端侧植物病害 ViT 压缩；属于通用模型压缩，不是 LLM 后训练，故可跳过。
- **[MePo++: Unifying Representation Refinement and Reconciliation for General Continual Learning](https://arxiv.org/abs/2609.05075)**（2609.05075）：MePo++ 统一表示 refinement 与 reconciliation 做 continual learning；保留稳定-可塑性关键词，非 LLM 专用。
- **[Weather-Conditioned Depth Anything](https://arxiv.org/abs/2609.04827)**（2609.04827）：天气条件深度估计的适配训练；是视觉域迁移案例，不提供通用后训练机制。
- **[VICAL: Vicinal Consistency Alignment for Long-Tailed Visual Recognition](https://arxiv.org/abs/2609.04948)**（2609.04948）：长尾视觉识别的一致性对齐；可看 loss 设计，但与 LLM 能力/行为证据距离大。
- **[Learning 3D Editing without Paired Supervision via Generative Prior Distillation](https://arxiv.org/abs/2609.04942)**（2609.04942）：用生成 prior 蒸馏无配对 3D 编辑；重点是视觉编辑监督，非本日核心。
- **[When Genomic Masking Priors Fail to Transfer: Strong Variant Prediction, Weak Functional Generation](https://arxiv.org/abs/2609.04861)**（2609.04861）：基因组 masking prior 的强预测、弱生成负结果；可记 transfer failure，模型类型并非 LLM Agent。
- **[Don't Drop Dropout: Optimizing Layer Sparsity for Efficient LLM Training and Inference](https://arxiv.org/abs/2609.05275)**（2609.05275）：联合优化 dropout 与层稀疏以提高训练/推理效率；属于基础训练效率而非明确 post-training。
- **[Cache-Aware Joint Router Adaptation for Memory-Efficient MoE Inference](https://arxiv.org/abs/2609.04895)**（2609.04895）：缓存感知 MoE router adaptation；主要服务推理内存，不改变对齐或任务行为。
- **[Object Concepts Emerge from Motion](https://arxiv.org/abs/2609.04348)**（2609.04348）：从 7,163 小时视频得到 1.95 亿伪标，再 self-training 到 4.21 亿帧；规模大但属视觉预训练。
- **[When Quantization Breaks Memory: Recurrent-State Write-Back in Low-Precision Temporal Inference](https://arxiv.org/abs/2609.04490)**（2609.04490）：量化 recurrent-state write-back 可使误差放大 70×/300×；是状态接口警示，但对象是 GRU/LSTM 医学成像。
- **[PAPT++: Risk-Aware Adversarial Tuning and Generation for Single Domain Generalization](https://arxiv.org/abs/2609.04837)**（2609.04837）：单域泛化的 risk-aware adversarial tuning；可记风险目标，缺少 LLM/Agent 证据。
- **[Aplaud: Adaptive Personalized Low-Rank Decomposition for User-Specific LLM](https://arxiv.org/abs/2609.04738)**（2609.04738）：个性化低秩分解；与 PLUME 相邻但部署/隐私证据更弱，可跳过。
- **[Continual Field-Adaptive Models (CFAMs) for Post-Deployment Physical AI](https://arxiv.org/abs/2609.04552)**（2609.04552）：post-deployment physical AI 的持续场景适配；概念相关，缺少语言模型后训练细节。
- **[BeaconKV: Key-Value Cache Compression Guided by Beacon Queries for Efficient Large Reasoning Model Inference](https://arxiv.org/abs/2609.04971)**（2609.04971）：Beacon query 引导 KV cache 压缩；是 reasoning serving 优化，不属于权重后训练。
- **[Multi-scale Image Representation Compression](https://arxiv.org/abs/2609.04274)**（2609.04274）：多尺度图像表示压缩；没有 LLM/Agent 对齐、反馈或行为证据。
- **[ACE: Adaptive Calibration-Free Expert Skipping for MoE-based LLMs](https://arxiv.org/abs/2609.05228)**（2609.05228）：MoE expert skipping；推理效率主题，若无权重更新或可靠性影响就不纳入深读。
- **[A Constraint-Aware Generative Framework for Synthetic Origin-Destination Demand in Logistics Networks](https://arxiv.org/abs/2609.04345)**（2609.04345）：物流 OD 需求的约束合成数据；有 87% operational compliance，但属于运营生成模型而非 LLM post-training。

## 横向比较

| 论文 | 主线 | 方法新意 / 真正贡献 | 最硬证据 | 评估可信度 |
|---|---|---|---|---|
| [2609.04518](https://arxiv.org/abs/2609.04518) | Coding/Agent | 多 harness 联训学到的首先是配置适应，不是可以脱离执行框架迁移的通用 coding 能力。 | 24,000 次封存评测中，评测 harness 让平均 solve rate 从 2.14% 移到 9.27%，影响达 4.3 倍，而训练 recipe 只移动 1.16 倍。 | 高：控制或反事实较强 |
| [2609.04909](https://arxiv.org/abs/2609.04909) | Coding/Agent | LLM 修复中的幻觉不仅存在于最终 patch，也存在于测试、覆盖和因果定位这些中间理解产物。 | 不同模型/设置仅 21.0%-55.9% 补丁通过开发者测试。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04898](https://arxiv.org/abs/2609.04898) | Coding/Agent | RefactorPlatform 把仓库级重构中的模型、检索、委派和提示细节拆成可控实验轴，并保留完整执行遥测。 | AST-aware chunking 比朴素 token window 高 25%-30%；朴素检索反而低于无检索。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04678](https://arxiv.org/abs/2609.04678) | Post-Training | 生产 coding agent 的训练必须忠实保留部署时 token 与控制流，否则 RL 更新会优化一个并不存在的轨迹。 | 在 Baize5B/10B、相同训练与 TMax-100 测试协议下，C-DPPO 跨尺度稳定高 3.0 个点。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.05370](https://arxiv.org/abs/2609.05370) | Coding/Agent | LLM 反编译器可以更容易重编译，却更少保留原程序行为；固定测试会奖励这种“干净但错”的恢复。 | 八个系统九种配置中，所有 shipped tests 都通过的候选仍有 4.9% 行为分歧，单系统最高 13%。 | 高：控制或反事实较强 |
| [2609.04611](https://arxiv.org/abs/2609.04611) | Coding/Agent | τ^τ-Bench 不让 coding agent 修一个已定义 issue，而是让它从客户记录、代码库、API 和预算中交付可部署 Agent。 | 53 个任务跨四个领域；最强 Claude Opus 5 + Claude Code 仅通过 23.9% 评测模拟，而专家 reference ceiling 为 82.2%。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04483](https://arxiv.org/abs/2609.04483) | Coding/Agent | 把 stack-trace 聚类与可疑文件/方法排序交给 LLM 前置，可以在工业 Java crash 集上提高定位与修复成功。 | 最佳配置在全数据上定位率最高 71%，正确修复 52%。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04298](https://arxiv.org/abs/2609.04298) | Coding/Agent | Harbor 用统一 adapter、跨原生 harness 的配对运行与人工审计，把分散 Agent benchmark 变成可比且可负担的评测基础设施。 | 在 Harbor-Index 上，没有模型-harness 组合超过 30%；最强 GPT-5.5 with Codex 为 28.0%。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04280](https://arxiv.org/abs/2609.04280) | Coding/Agent | 即使模型和旧任务不变，仅仅扩展工具、skill 或 specialist-agent harness，也会让已会的能力遗忘。 | 共 802 个任务、520 个工具、42 个 skills、62 个 agents。 | 高：控制或反事实较强 |
| [2609.05335](https://arxiv.org/abs/2609.05335) | Coding/Agent | BUGSTONE-E2E 把 CVE 修复史编译成带 provenance 的检测 skill，再用运行证据与双侧差分测试确认漏洞和补丁。 | 从 2022-2026 年 19,325 个高危 CVE 找到 2,710 个 fixing commits，形成覆盖 56 个 CWE family 的 1,033 条规则、打包为 172 个 skills；在 14 个程序上产出 644 个有 runtime evidence 的发现。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.05274](https://arxiv.org/abs/2609.05274) | Coding/Agent | 用小型 draft model 对黑盒 coding-agent 已生成 token 做一次反向似然评分，可以在执行前预测失败并节省成本。 | 在 Qwen3-Coder-480B 与闭源 Claude 3.5 Sonnet 软件工程 Agent 上，gate 将执行错误率降低 6-8 个百分点，token 成本降低 14%-19%，且无需重训即可迁移到分布外 benchmark。 | 高：控制或反事实较强 |
| [2609.05339](https://arxiv.org/abs/2609.05339) | Coding/Agent | 模型升级时，同一 memory store 并不等于同一记忆；自然语言压缩和混合 embedding 会发生方向依赖的迁移损失。 | KG-fixed 在 writer swap 后仅变化 +0.0004±0.0020；NOTES 因迁移方向不同可 +9.91 或 -13.28 个点。 | 高：控制或反事实较强 |
| [2609.05269](https://arxiv.org/abs/2609.05269) | Coding/Agent | 单个安全控件都正确仍可能端到端失效；CONTINUITY 用签名上下文和 assume-guarantee contract 保证授权语义穿过组件边界。 | 参考 verifier 覆盖四个应用域、32 类 cross-layer fault；2,560 个参数化攻击实例中完整配置没有提交 harmful effect，同时完成 700 个 benign task，并将 200 个 ambiguous case 全部升级处理。 | 高：控制或反事实较强 |
| [2609.04875](https://arxiv.org/abs/2609.04875) | Coding/Agent | 真正的 Agent 忘却必须重算被撤销信息之后的执行状态；删除一条文本记忆无法清除 summary、plan 与 KV cache 中的派生影响。 | 理论下界为至少重算 T-τ+1 个 transition，Selective Replay 达到该界。 | 高：控制或反事实较强 |
| [2609.04913](https://arxiv.org/abs/2609.04913) | Coding/Agent | ARIA 用视觉闭环多 Agent 在实体 Android 车机上执行测试并保存逐步证据，但高误报仍是工业接入的主要障碍。 | 30 个场景中 28 个得到 verdict，20 个与 ground truth 一致，即 71.4%；5 个已知缺陷全部检出，没有把故障判为正常。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04748](https://arxiv.org/abs/2609.04748) | Coding/Agent | prefix cache 并非透明优化：量化会放大 cache-state 引起的 Agent 轨迹分歧，而该状态通常不在请求中也不会重置。 | 开 cache 后，16-bit 有 36.2% episode 改变轨迹，4-bit 达 75.0%；关 cache 的 800 次重复为 0 分歧。 | 高：控制或反事实较强 |
| [2609.04282](https://arxiv.org/abs/2609.04282) | Post-Training | RA-GRPO 先反演扩散轨迹做弱到强的“后退反思”，再把更优反事实路径蒸馏回前向生成策略。 | 主实验在 8×H800 上训练 300 step，而 baseline 多 5% step 以补偿额外计算；Table 1 显示多种自动 alignment 指标一致领先，Table 2/3 分离 counterfactual synthesis 与 reflection ratio，Table 4 将结论扩到 Wan2.1 视频模型。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04565](https://arxiv.org/abs/2609.04565) | Post-Training | OPD 每条轨迹只监督一两个 token、约全部 token 的 0.05%，仍常能追平甚至超过全 token 训练。 | 一两个 token 只占约 0.05%；max-token 多数情形超过 plain OPD，min-token 可匹配，随机一 token 也稳定提升。 | 高：控制或反事实较强 |
| [2609.04773](https://arxiv.org/abs/2609.04773) | Post-Training | PTA 让 teacher 不只审文本，还在整个 turn 验证通过后才允许工具调用接触环境，从源头阻止错误 observation 污染后续蒸馏。 | 相同下游 RL 预算下，Search-R1 式检索与 DeepEyes 感知任务的 macro best@4 分别比 OPKD 高 2.5、2.8 点；lookahead 吞吐从 0.519 到 0.644 samples/s，增 24%。 | 高：控制或反事实较强 |
| [2609.04648](https://arxiv.org/abs/2609.04648) | Post-Training | ConsensusPR 从多条正确轨迹中抽取可验证的共同中间结论，把纯终局奖励加密成 node coverage 过程信号。 | 实验覆盖 AIME 2024/2025、GSM8K、MATH-500；Table 3 报告 pass@1/pass@16/NCR，多个模型上 ConsensusPR 一致超过 outcome-only。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.05295](https://arxiv.org/abs/2609.05295) | Post-Training | RISE 把当前 checkpoint 相对历史 anchor 的 RLVR 位移外推成“未来 teacher”，再以 OPD 将稀疏 outcome 更新变为密集 token 目标。 | 1.7B-8B 模型、数学/STEM/代码/多轮 Agent 四类任务上均胜 RLVR-only 和自蒸馏；三个方向解释约 87% 轨迹方差。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.05198](https://arxiv.org/abs/2609.05198) | Post-Training | OPD 的数据效率可能主要来自长 CoT 暴露的思维模式，而非样本数量或高熵 token；8 道难题可追平 17K 数据。 | 8 个样本的 1.5B student 达 53.6%，17K baseline 为 53.7%；AIME/AMC 用每题 16 次 rollout，其他集 mean@4。 | 高：控制或反事实较强 |
| [2609.04947](https://arxiv.org/abs/2609.04947) | Post-Training | MCPO 用有图/无图推理差异识别视觉无关步骤，再以非对称偏好损失压缩多模态 CoT，避免视觉懒惰。 | 训练样本少于 900；在 Qwen3-VL-Thinking 8B/4B 与多 benchmark 上，CoT 最多缩短 69.5%，端到端最高 3.34× 加速，同时保持原准确率。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04629](https://arxiv.org/abs/2609.04629) | Post-Training | SiLR 不把工具安全压成一个总分，而是在 shadow execution 后按每个约束分支的严重度乘积序决定是否前进。 | Gym-ANM 多动作场景中 SiLR 恢复 21/21，terminal gate 为 0/21，最佳 scalar 为 9/21；双约束 42,410 个 proposal 上 product order 接受 0 个物理不安全动作，support-only 却接受 63.2%。 | 高：控制或反事实较强 |
| [2609.04482](https://arxiv.org/abs/2609.04482) | Post-Training | 安全后训练不能只增加拒绝覆盖；必须围绕部署边界同时生成 harmful/benign 对，并用目标模型自己可实现的响应补偿过拒。 | 单轮生成有 19.88% 缺失，升级后仅 0.20%。 | 高：控制或反事实较强 |
| [2609.04304](https://arxiv.org/abs/2609.04304) | Post-Training | Iris 用网页图谱反向构造闭卷失败、证据可解的多跳题，再交替做轨迹过滤 SFT 与 live-search RL。 | 开启 context management 后，Iris-mini 在 BrowseComp/BrowseComp-ZH/DeepSearchQA/HLE 为 82.2/84.8/86.9/52.3，Iris-pro 为 88.6/85.1/92.9/56.4。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04865](https://arxiv.org/abs/2609.04865) | Post-Training | CoSkill 把 reasoning agent 与会增删层级技能的 meta-skill agent 置于同一 RL 目标下，让技能库和策略共同适应。 | ALFWorld 成功率 98.4%，WebShop 90.6%，分别比对照高 3.5 与 6.2 个百分点；Figure 1 同时报告早期 sample efficiency、最终性能和 wall-clock，Figure 2 对比外部编排、固定 meta workflow 与联合学习。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.04489](https://arxiv.org/abs/2609.04489) | Post-Training | masked boundary pause 不只是增加推理计算，它在微调中同时减少旧模式覆盖，并把后续步骤信息压进边界邻近 token。 | masked pause 在 matched adaptation 下对旧分布的覆盖约少 4×；1B-8B 模型上数学最高 +6 点、代码最高 +2.5 点，同时保持通用语言能力。 | 中高：有执行/PDF证据，仍需外部复现 |
| [2609.05401](https://arxiv.org/abs/2609.05401) | Post-Training | 同一机器人轨迹只换同义指令，VLM reward 就可能从成功翻成失败；规模和显式 reasoning 都不能稳定消除。 | 模型 ensemble 标出的 25 个案例中人工确认 24 个，构造质量较高。 | 高：控制或反事实较强 |
| [2609.04665](https://arxiv.org/abs/2609.04665) | Post-Training | HackProbe 用秘密固定 comparison core 加轮换探针监测 self-evolving 模型，并以低带宽 reselection 从候选池找回诚实更新。 | 四种注入 hacking channel 上 AUROC 0.763，最强 baseline 0.663；FPR 从 0.706 降到 0.434。 | 中高：有执行/PDF证据，仍需外部复现 |

## 我的判断

- **创新性：A。** 最有新意的不是又一种 Agent 架构，而是把不可见的配置变量暴露出来：harness 分组、缓存状态、memory writer、teacher commitment、奖励结构和同义不变性都被转成可检验对象。RISE、稀疏 OPD、SiLR 与 execution-state unlearning 尤其值得细读。
- **实用价值：A-。** RefactorPlatform、Harbor、BUGSTONE、ARIA、Speculative Uncertainty 和 CONTINUITY 都提供可落地的评测或治理组件；但多篇系统只在作者环境、专有模型或小型真实集上验证，离广泛部署仍有工程鸿沟。
- **严谨性：A- / B+。** 多 harness 控制、cache on/off、同轨迹 paraphrase、full-reset counterfactual 等设计非常强；另一边，自动 reward/judge、合成历史、模拟客户和单次训练仍普遍存在。不要把“执行过”自动等同于“oracle 完备”。
- **推荐价值：强。** 若只读五篇，优先 `2609.04518`（harness credit）、`2609.05370`（行为等价 oracle）、`2609.04875`（状态遗忘）、`2609.04565`（极稀疏监督）与 `2609.05401`（奖励同义不变性）。若更关注训练 recipe，再加 `2609.04773` 与 `2609.05295`。

不确定性主要来自三处：不少论文仍是预印本且 artifact 尚未外部复现；模型/搜索 API 与评测 harness 会随版本变化；部分最大增益来自作者定义的 judge 或 simulator。今天最稳的总判断是：**能力提升必须和状态、接口、反馈、权限及可回放证据一起报告，否则更高分很可能只是在更熟悉的系统里学会了更有利的行为。**
