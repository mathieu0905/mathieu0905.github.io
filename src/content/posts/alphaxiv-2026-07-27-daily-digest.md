---
title: "补漏之后，真正值得看的不是又一个 Agent：7 月 17–24 日 arXiv 的 Harness 可靠性与 Post-Training 新证据"
date: "2026-07-27"
description: "补齐 7 月 17–24 日 arXiv：一边是 coding agent 从生成走向 harness、验证与安全，另一边是 post-training 开始正视数据、奖励和自蒸馏的失效机制。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Post-Training", "RLHF", "强化学习", "模型对齐", "Agent安全"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-slate-950 via-indigo-950 to-rose-900"
---

这是一篇补漏版，覆盖上次成功发布之后、截至 2026 年 7 月 27 日官方列表可核对到的 7 月 17–24 日首次提交论文。值得读的并不是“又多了多少个 Agent 框架”，而是两组更扎实的证据：coding agent 研究开始把故障定位到模型与 harness 的交界处，把性能、测试和安全做成可执行反馈；post-training 研究则开始回答更难的问题——数据什么时候有用，奖励什么时候会把策略训坏，自蒸馏为什么会失效，以及 RL 到底改变了模型的什么。

筛选后共有 **82 篇**进入正文：46 篇属于 coding-agent / software-change 主线，36 篇属于独立的 LLM post-training 主线。12 篇强推荐均阅读了 PDF；16 篇做完整速读；其余放在“可留意/可跳过”，保留其最值得记住的判断。推荐理由只基于论文自身的问题、方法和证据，不讨论它们如何与任何既有文章或项目结合。

## 今日脉络

第一条线是 **harness 已经从包装层变成可靠性的主要研究对象**。Agent-Reactive Bugs 说明很多错误既不能单独归因于模型，也不能单独归因于代码；验证循环论文进一步表明，循环是否有效取决于独立观察者、可执行 oracle 和停止规则，而不是“多反思几轮”。

第二条线是 **真实软件变更需要比 pass/fail 更丰富的证据**。PerfAgent 用 profiler、受影响测试和持续重测推动仓库级性能修改；DiffTestGen、IssueExec、DepRepair 则分别从差分行为、测试轨迹和上游 API 证据缩小变更空间。这里最重要的进展，是把“模型感觉应该改哪里”改写成“什么证据证明应该改这里”。

第三条线是 **post-training 的关键变量正在从算法名转向信号结构**。几篇论文共同说明：同样叫 RL 或 distillation，训练结果可能由初始化支持集、teacher–student 分布差异、组内方差、负样本处理和奖励通道决定。算法缩写不再足以解释结果，必须追问信号在哪里产生、怎样归一化、经由哪个通道进入梯度。

第四条线是 **负结果开始变得有价值**。反馈增强自蒸馏会发生 decoding collapse，GRPO 的稠密预测奖励会把 agent 推进“暗室”，而多轮 repair 可能持续破坏原本正确的答案。这批论文最可信的共同结论，不是“加反馈总会更好”，而是反馈也需要验证、校准与停止条件。

## 强相关论文深读

### 1. Agent-Reactive Bugs：错误发生在模型与 Harness 的反应关系里

**论文信息**：*Understanding Agent-Reactive Bugs at the Model-Harness Boundary: An Empirical Study of LLM Agent Issue Reports*；Jingyi Chen、Songqiang Chen、Hengcheng Zhu、Jialun Cao、Jiasi Shen、Shing-Chi Cheung；[arXiv:2607.15684](https://arxiv.org/abs/2607.15684)；cs.SE；2026-07-17。

**一句话 TL;DR**：论文定义并实证研究了“agent-reactive bug”——只有某种模型行为遇上某种 harness 处理方式才会显现的错误，并证明这类错误在检测、复现和归责上都有独立难度。

**为什么值得推荐**：现有讨论很容易把 agent 失败归为“模型能力不够”或“框架代码有 bug”，但真实系统的控制流由二者共同生成。模型输出一个表面合法但语义异常的工具调用，harness 可能静默接受、错误重试或污染上下文；单看任何一侧都解释不了最终症状。论文把这一灰区变成了可研究对象。

**方法怎么工作**：作者先从 Codex、Gemini CLI、LangChain 和 CrewAI 的 32,373 个 issue 出发，经“bug、可触达 LLM、讨论充分”三层过滤得到 3,037 个候选；再由人工判断问题是否依赖特定模型响应，最终确认 255 个 AR bug。随后建立两轴分类：一轴记录用户可见症状，另一轴记录触发它的模型行为；最后沿 issue 讨论和关联 PR 分析用户建议与开发者实际修复位置。Figure 1 的递归派生子 agent 案例很好地说明了模型行为如何改变 harness 控制流。

**关键实验与证据**：AR bug 占所分析活跃 issue 的 8.4%，被归纳为 5 类症状与 8 类触发行为。255 个问题中，168 个（66%）包含用户提交的 harness PR 或明确的 harness 归因，但开发者侧最大类别却是“未明确修复目标”，共 116 个（46%）。用户提交的 114 个 harness PR 中只有 43 个（38%）被合并。大量问题表现为 silent error，说明异常计数无法覆盖主要风险。

**局限和可信度**：样本只来自四个开源项目，Claude Code 等闭源产品没有公开 issue 轨迹；为获得足够讨论，研究设置了项目相关的 engagement threshold，可能系统性排除短生命周期但严重的问题。两位标注者通过讨论达成一致，却没有报告可复核的独立一致性系数。结论适合作为故障分类和研究议程，不应直接外推为所有 agent 的发生率。

**与当天主题的关系**：它给今天的 coding-agent 主线定了基调：可靠性不是模型分数或 harness 单测的简单相加，而是二者交互产生的新型软件行为。

### 2. 可靠性分解：验证循环有用，但大部分提升其实来自结构

**论文信息**：*Where Does Agent Reliability Come From? A Cross-Benchmark Decomposition of Verification Loops, Specialist Models, and Scaffolding in a Production Enterprise Agent*；Arunabh Dastidar；[arXiv:2607.17044](https://arxiv.org/abs/2607.17044)；cs.SE、cs.AI；2026-07-19。

**一句话 TL;DR**：这篇 vendor study 的真正贡献不是榜单成绩，而是把生产 agent 的提升拆成 scaffolding、专用小模型和验证步骤，并量出验证器的 catch、fix 与 false-alarm 行为。

**为什么值得推荐**：业界常说“加一个 verifier 就可靠了”，但很少区分工具、规划、路由、专用模型和验证步骤各自贡献多少。没有分解，所谓闭环可能只是更多推理预算。论文主动承认系统整体与裸模型不是等成本比较，并把重点放在机制而非排名，值得肯定。

**方法怎么工作**：系统分别为三类失败配置 oracle：SpreadsheetBench 用 LibreOffice 重算并独立读回单元格；BullshitBench 用小型专用模型做前提审查；GAIA 用 planner、类型化 artifact 和分步路由器检查长链任务。作者冻结生产配置，在三个公开 benchmark 上运行，并对 SpreadsheetBench 的循环做端到端 instrumentation，再把专用 verifier 换回生成模型观察 rescue 是否消失。

**关键实验与证据**：完整系统相对裸模型在 SpreadsheetBench 提升 11.0 个百分点（91.25% 对 80.25%，n=400），BullshitBench 提升 7–10 点，GAIA validation 约提升 15 点。但分解显示，SpreadsheetBench 的 11 点中约 9.5 点来自结构与 prompt，验证循环只贡献 1.5 点。Table 4 的 confusion matrix 更有价值：397 次循环中验证器标记 8 个错误，修复 6 个，却漏过 32 个；catch rate 约 0.20，fix rate 0.75。换回生成模型后，rescue 从 6 个降到 2 个。

**局限和可信度**：这是厂商评估自有系统，专用权重、训练数据和生产 prompt 不公开；多数 headline 是单次运行，GAIA 用公开 validation 而非隐藏 test，且早先 77.6% 的报告混合了 pass@1 与 best-of-k，本稿才修正为 75.2%。跨系统比较没有同模型、同工具和同预算的完整对照。最可信的是“结构占主要贡献”和 confusion matrix，不是榜单名次。

**与当天主题的关系**：它提醒我们，把验证闭环写进架构图远远不够；闭环本身也要像软件组件一样测覆盖率、误报率和修复率。

### 3. Code-Agent SFT：小规模时，数据量比精细质量分更重要

**论文信息**：*A Systematic Evaluation of Trajectory Data Curation for LoRA Fine-Tuning of Code Agents*；Yunze Han；[arXiv:2607.17205](https://arxiv.org/abs/2607.17205)；cs.AI、cs.SE；2026-07-19。

**一句话 TL;DR**：在 500–2,000 条 code-agent 轨迹的 LoRA 微调中，扩大数据量的收益明显高于复杂质量筛选；质量效应到 2,000 条才开始显著。

**为什么值得推荐**：agent post-training 常默认“只保留成功且优雅的轨迹”，却缺少控制变量实验。多步轨迹的错误重试、观察利用和动作风格到底是有效信号还是审美偏好，需要被拆开验证。这篇论文规模不大，但实验问题非常干净。

**方法怎么工作**：作者从 SWE-trajectory 的 67,074 条轨迹出发，先用正确、完整、格式可解析三道 gate 留下 32,161 条 resolved 轨迹；再从效率与风格两轴计算 error-retry、相对步数、动作多样性、观察利用四个子指标。随后对 Qwen2.5-Coder-7B-Instruct 做 16 组 QLoRA 实验，比较 Random、ResolvedOnly、TopQ、BottomQ，在 500/1,000/2,000 三个规模上训练，并用 held-out CE loss 和 first-action 生成交叉验证代理指标。

**关键实验与证据**：500→1,000 条数据使 CE loss 下降约 12.7%，而 TopQ 与 Random 在 500 和 1,000 时只差 0.7%–0.8%；到 2,000 时差距扩大到 3.6%，Mann–Whitney p=0.016。TopQ-2000 的 Gold loss 为 0.3732，相比未微调的 0.9100 下降 59%。消融显示 error-retry 单指标几乎追平完整复合分数，风格指标贡献很弱。CE loss 与 first-action ROUGE-L 在 4 个 checkpoint 上秩相关为 -1.00，但 n=4 时双侧 p 的理论下限约为 0.083。

**局限和可信度**：论文没有用真正的 SWE-bench resolve rate 作为主指标，而是使用 CE loss；作者解释 7B 模型成功率太低导致统计不可行，但代理指标仍不能证明端到端修复能力。实验只有一个模型、一个轨迹源，test split 每组 200 条；工具调用格式在所有 16 个配置中仍是 0% 合规。应把结论读成“小规模轨迹 SFT 的数据工程信号”，而非通用最优配方。

**与当天主题的关系**：它把 coding-agent 训练与 post-training 两条线真正接起来：轨迹不是越“漂亮”越好，首先要证明筛选维度能预测可执行行为。

### 4. VRR-Stop：修复循环最危险的问题，是不知道何时停

**论文信息**：*Verify, Repair, Repeat, or Stop? Robust Stopping for Noisy Verify-Repair Loops in LLM Agents*；Yitao Wu、Si Shen、Rui Yang、Hong Peng、Bin Hu；[arXiv:2607.17641](https://arxiv.org/abs/2607.17641)；cs.AI、cs.SE；2026-07-20。

**一句话 TL;DR**：论文用四参数噪声模型区分 verifier 的误判与 repairer 的修好/修坏概率，并用边际收益符号决定继续还是停止；当符号不可辨识时退回保守 guard。

**为什么值得推荐**：多轮 self-repair 往往只汇报“接受率越来越高”，却不检查真实正确率是否同步提高。一个正确方案被误拒后，repairer 可能把它改坏，随后 verifier 又误收；循环越长，代理指标越好、真实质量越差。停止策略因此不是成本优化，而是可靠性机制。

**方法怎么工作**：VRR-Stop 用 verifier false acceptance、false rejection，以及 repairer 修复无效方案和破坏有效方案的概率描述状态转移；对每轮多次验证投票做 belief filtering，计算再修一次的真实边际收益符号。它只要求符号可辨识，不要求所有参数精确恢复。论文再用 Youden’s J 与 decision margin 判断校准是否可靠；当 J 接近零时切换到 VRR-Guard，只有新候选获得足够验证优势才替换 incumbent。

**关键实验与证据**：GSM8K/Qwen2.5-3B 的 prompt-mismatch stress setting 中，固定修 5 轮把正确率从 0.700 压到 0.116；VRR-Stop 用平均 0.72 轮达到 0.722，比固定 5 轮高 60.6 个百分点。Llama-3-8B verifier 的 J 只有 0.03 时，校准策略从参考 0.803 崩到 0.223；VRR-Guard 恢复到 0.793。跨多个 shifted setting，固定轮数普遍恶化，而 guard 接近 no-repair 基线。

**局限和可信度**：核心结果来自刻意构造的 stress setting，四参数模型假设局部平稳、repair 转移与历史在给定状态下条件独立，并把 validity 压成二元变量。论文承认未来需要 round-varying 动力学。它证明了“噪声循环存在停止问题”和方法在压力测试中有效，还没证明生产环境能稳定估计这些参数。

**与当天主题的关系**：这篇论文直接反驳“反馈越多越可靠”：没有可辨识的停止证据，闭环本身就是误差放大器。

### 5. PerfAgent：仓库级性能优化需要 Profiler，而不是只看计时

**论文信息**：*PerfAgent: Profiler-Guided Iterative Refinement for Repository-Level Code Optimization*；Ryan Deng、Yuanzhe Liu、Bastian Lipka、Yao Ma、Xuhao Chen、Tim Kaler、Jatin Ganhotra；[arXiv:2607.19653](https://arxiv.org/abs/2607.19653)；cs.SE、cs.AI；2026-07-22。

**一句话 TL;DR**：PerfAgent 给通用 coding agent 加上热点摘要、受影响测试、持续重测与 best-patch 选择，使仓库级优化从“第一个能跑的加速”推进到跨抽象层追踪瓶颈。

**为什么值得推荐**：性能修改比普通 issue repair 更苛刻：补丁既要保语义，又要改善真实 workload，还不能靠缓存或特判骗过计时器。模型通常停在 Python 表层，即使瓶颈藏在 C/Cython/Rust；仅看一次时间差无法告诉它下一步该改哪里。

**方法怎么工作**：Figure 1 的循环先用 py-spy 生成带位置、调用上下文、自耗时和总耗时的精简热点摘要；agent 提交补丁后，pytest-testmon 只跑受改动影响的测试，失败立即反馈；通过后重新 profile，并把新热点与 speedup 送回下一轮，最多 5 轮。控制器保留所有轮次中“最快且正确”的补丁，而不是最后一个。为防缓存式 reward hacking，计时只看首次执行。

**关键实验与证据**：在 GSO 的 102 个任务上，GPT-5.1 + PerfAgent 的 hack-adjusted expert-match 从 OpenHands 的 19.6% 升到 39.2%；SWE-fficiency-Lite 的 100 个任务从 26% 升到 74%。它还超过 oracle best-of-five：GSO 为 39.2% 对 26.5%，平均成本 2.88 美元对 11.01 美元；SWE-fficiency-Lite 为 74% 对 68%。使用 profiler 的 agent 在 48% 任务中修改低层语言代码，OpenHands 为 31%。

**局限和可信度**：两个 benchmark 都以 Python 仓库为主，SWE-fficiency-Lite 只对给定脚本计时，更容易被投机；hack detector 含 LLM 判断，可能漏报。中间测试只跟踪 Python coverage，native regression 可能到最终评测才暴露。实验覆盖 GPT-5.1、Kimi-K2 和一个 Mini-SWE-Agent harness，且大多单次运行，跨语言、跨 harness 泛化仍未建立。

**与当天主题的关系**：它展示了执行反馈的高质量形态：不是把完整日志塞回上下文，而是把 profiler、测试与目标函数组织成能改变下一步决策的证据。

### 6. IssueTrojanBench：恶意 Issue 可以一路穿透到本地执行

**论文信息**：*IssueTrojanBench: Benchmarking AI Coding Agents Against Malicious Issue Requests*；Ankur Singh、Jinqiu Yang、Tse-Hsun Chen；[arXiv:2607.20759](https://arxiv.org/abs/2607.20759)；cs.CR、cs.AI、cs.SE；2026-07-22。

**一句话 TL;DR**：这套 benchmark 把恶意指令放进 issue、评论、PDF 和图像元数据，直接检查 Cursor、Claude Code 与 Codex Desktop 是否真的执行攻击动作，而不是只看模型文本是否拒绝。

**为什么值得推荐**：coding agent 的攻击面不止“不安全代码生成”。当 agent 能装依赖、改配置、运行 shell 时，issue 本身就是不可信输入。真正重要的指标不是输出里有没有危险句子，而是恶意动作是否在文件、进程、网络或配置层发生。

**方法怎么工作**：作者设计供应链、持久化 hook、策略绕过、资源耗尽四类攻击，组合六种投递向量与位置、语言、大小写等扰动；每个攻击都有 End-to-End Execution Metric，通过受控 sandbox 检查安装、文件修改或进程行为。实验覆盖 Cursor、Claude Code、Codex Desktop，以及 GPT-5.3 Codex、GPT-5.4、Sonnet 4.6。失败运行再被归因到模型拒绝、来源信任分类或框架防护；最后加入 Spotlighting 式边界标记测试轻量防御。

**关键实验与证据**：4,176 次运行中有 2,776 次执行成功，整体穿透率 66.5%。供应链攻击成功率 96.6%，策略绕过 84.7%；issue 正文、评论和 PDF 等标准文本向量为 72.2%，图像 alt-text 只有 16.7%。位置、中文翻译和格式扰动几乎不改变结果。1,400 次被阻止的运行中，82.9% 来自模型显式拒绝，17.1% 来自来源分类，框架级防护归因是 0；单纯边界标记没有可靠降低攻击。

**局限和可信度**：恶意 issue 是研究者构造的，攻击类别与成功条件仍可能偏向特定工作流；只覆盖三个产品、两个模型家族和固定版本。实验在隔离 sandbox 中进行，没有真实开发者确认、权限配置与组织策略。轻量防御只测试一种 prompting 方案，不能推出所有 agent-side 防御都无效。

**与当天主题的关系**：它把 agent 安全从“模型拒答率”推进到执行层，并说明安全边界必须落在权限、来源、动作 scope 和运行时监控上。

### 7. Pretraining 到 RL：Post-Training 的收益由初始化决定

**论文信息**：*Understanding Reasoning from Pretraining to Post-Training*；Jingyan Shen、Ang Li、Salman Rahman、Yifan Sun、Micah Goldblum、Matus Telgarsky、Pavel Izmailov；[arXiv:2607.16097](https://arxiv.org/abs/2607.16097)；cs.LG、cs.AI、cs.CL；2026-07-17。

**一句话 TL;DR**：论文用可控棋类环境把预训练、推理轨迹 SFT 和可验证奖励 RL 串成完整实验，得到“预训练 loss 预测 post-RL 水平、预训练 token 预测 RL 改进斜率”的经验规律。

**为什么值得推荐**：大多数 RL 论文固定 base model，只比较 post-training recipe；预训练论文又把下游 RL 当成黑盒。于是“再投一单位算力应该给预训练还是 RL”缺少量化依据。这篇工作不直接追求大模型榜单，而是用小而可控的系统回答阶段之间的因果关系。

**方法怎么工作**：Figure 1 的三阶段 pipeline 在人类棋局上预训练 5M–1B 参数模型；从 proposal model 采样多个棋局续写，合并为树并序列化成 synthetic reasoning trace 做 SFT；最后在棋题环境中逐步出招，用标准答案给可验证奖励做 RL。作者跨模型大小、token 数和 RL compute 拟合局部 log-linear scaling law，并比较 RL 前后正确棋步的概率质量；另用 1B 数学模型做跨域核对。

**关键实验与证据**：在不同 RL compute 下，预训练 loss 与 post-RL pass@1 的 Spearman 相关从 -0.93 增强到 -0.99；RL 改进斜率与预训练 token 的 Pearson r 为 0.84，联合 token 与模型规模拟合的 R² 为 0.84。机制分析发现，简单题上 RL 主要放大 SFT 已偏好的正确动作，难题上则能抬升原本尾部的正确动作，但也会强化错误模式。数学实验复现“预训练更久，RL 起点更高、斜率更陡”的定性趋势。

**局限和可信度**：棋类词表只有 81 个 token，动作和奖励精确可验证，与开放语言推理差异很大；数学扩展只有一个 1B 模型，不能等价于完整复现。拟合是研究 compute 区间内的局部规律，简单任务饱和时斜率会失真。最可靠的是“RL 效率依赖预训练状态”，不是可直接套用到千亿参数模型的全局比例。

**与当天主题的关系**：它让 post-training 从配方竞赛转向阶段耦合：RL 既不是凭空创造能力，也不只是温度变尖，而是在预训练支持集上重新分配概率质量。

### 8. KITE：合成数据崩塌不是平均变差，而是能力两极化

**论文信息**：*Learning from Synthetic Data without Model Collapse in Iterative Instruction Tuning*；Xiaonan Luo、Yue Huang、Kehan Guo、Ping He、Chuan Zou、Ting Hua、Xiangliang Zhang；[arXiv:2607.17043](https://arxiv.org/abs/2607.17043)；cs.CL；2026-07-19。

**一句话 TL;DR**：KITE 先从失败模式诊断薄弱技能，再用 rank-noise 探索候选，最后选择位于语义知识边界的数据，避免自生成数据只强化模型已经会的部分。

**为什么值得推荐**：讨论 synthetic-data collapse 时，平均 accuracy 掩盖了最危险的情况：强技能继续变强，弱技能继续退化。若不知道退化发生在哪些能力上，“增加多样性”就只是模糊口号。论文把 collapse 转成可指导下一轮数据生成的诊断问题。

**方法怎么工作**：第一步，用 DINA 认知诊断模型结合题目技能 Q-matrix，从当前模型的对错模式估计低掌握技能；第二步，把薄弱技能写成生成条件，并按 token rank 注入噪声，提升低排名 token 的采样概率，避免反复落入高概率模式；第三步，对候选多次采样答案，用 Kernel Boundary Uncertainty 衡量语义不确定性，选择位于中间知识边界而非极易或离群的数据。每轮新数据经外部模型验证后加入累计训练集。

**关键实验与证据**：经过五轮演化，KITE 在多组 1.7B–8B 模型和 GSM8K、MMLU-Pro、MATH、GPQA 上取得组内最佳平均值；例如 Qwen-3-4B 在 GSM8K、MMLU-Pro、MATH 上达到 95.04%、71.87%、82.60%。Llama-3-8B 消融中完整方法平均 45.2%，去掉 weakness profiling 为 43.2%，用 token entropy 替代语义边界为 43.9%。延长到九代时四项指标单调上升并逐渐饱和，未出现反转。

**局限和可信度**：所有方法都用 gpt-5-mini 验证与归一化答案，因此不是纯闭环 self-improvement，也含外部蒸馏；Q-matrix 由 LLM 标注、没有专家验证，固定 slip/guess prior 使 mastery 更像启发式。主评测集中在数学推理和 1.7B–8B 模型，非推理任务只用 perplexity。它证明了“面向弱点的边界采样”有效，但成本和大规模稳定性仍未知。

**与当天主题的关系**：它把 post-training 数据问题从“合成多少”推进到“合成数据落在能力空间的哪里”，与轨迹筛选论文形成有意思的规模对照。

### 9. Distilled RL：不要无条件模仿 Teacher，把 Teacher 变成 RL 的细粒度权重

**论文信息**：*Distilled Reinforcement Learning for LLM Post-training*；Chen Wang、Zhaochun Li、Jionghao Bai、Yining Zhang、Hexuan Deng、Ge Lan、Yue Wang；[arXiv:2607.17247](https://arxiv.org/abs/2607.17247)；cs.LG、cs.AI；2026-07-19。

**一句话 TL;DR**：Distilled RL 不再用独立 KL loss 强迫 student 复制 teacher，而是用 teacher 对 student 自采样 token 的相对偏好重新分配正优势轨迹上的 RL 梯度。

**为什么值得推荐**：纯 outcome RL 的 credit assignment 太粗，传统 on-policy distillation 又会在 teacher 与 student 分布差异大时把错误模仿压力施加到每个 token。尤其在跨模型家族时，“teacher 更强”并不意味着它在 student 访问的每个 prefix 上都是好目标。

**方法怎么工作**：第一步计算 teacher 相对旧 student 的反向 importance ratio，并裁剪极端值；第二步只在优势为正的轨迹上启用 teacher 权重，负轨迹重置为 1，避免把 teacher 偏好的 token 反向惩罚；第三步对每条序列做几何均值归一化，使权重只重新分配 token 间的学习强度，而不整体放大或压低整条响应。方法嵌入 GRPO 式 outcome RL，没有另加无条件 imitation objective。

**关键实验与证据**：在 DAPO-17K、三种 student 与数学 benchmark 上，Distilled RL 的平均 pass@1 分别达到 40.00、58.96 和 46.37，均优于 base、OPD、RL 和 OPD+RL。Qwen3-4B 相对 46.33 的强基线提升到 58.96；跨家族 DSQW-1.5B 从 31.70 升到 40.00。去掉 negative reset，Qwen3-4B 与 DSQW-1.5B 平均分别下降 8.81 和 6.39 点，是最大消融损失；去掉几何归一化也稳定退化。

**局限和可信度**：teacher 只评估 student 采样 token，不生成完整解，因此方法隐含“student 成功的问题 teacher 也掌握”的假设。随着 student 变强，固定 teacher 可能局部落后；论文建议用 teacher rollout 或 verifier 做能力 gating，但尚未实验。主要任务仍是数学可验证奖励，开放式对齐和长工具轨迹是否同样有效未知。

**与当天主题的关系**：它说明 post-training 的关键不在“RL 还是蒸馏”二选一，而在 teacher 信号如何进入优势估计、何时应被屏蔽。

### 10. 自蒸馏负结果：更强的 Self-Teacher 也可能教不会 Student

**论文信息**：*Why Does Feedback-Augmented Self-Distillation Fail to Improve Retrieval-Interleaved Search Agents?*；Fan Yang、Rui Meng、Yuxin Wen；[arXiv:2607.17558](https://arxiv.org/abs/2607.17558)；cs.AI；2026-07-20。

**一句话 TL;DR**：成功 rollout 作为 privileged feedback 能让 self-teacher 在推理时更强，却不保证 KL 蒸馏信号稳定；模型会陷入看似多样、实际与问题无关的搜索模板。

**为什么值得推荐**：这是少见的、认真追踪“一个合理方法为什么没用”的 post-training 论文。它区分 teacher 能力与 supervision 可学习性：teacher 回答更好，只说明条件信息有用，不说明 token-level 梯度能把这种优势转移给不带反馈的 student。

**方法怎么工作**：FA-SD 让 student 在无反馈 prompt 下采样搜索轨迹，再把同组成功轨迹放进 teacher prompt，用 teacher–student reverse KL 提供 token 监督。作者先测试 unclipped、PPO-style clipped 和 FA-SD+GRPO；再用有效蒸馏样本比例、输入相关性和模板重复诊断 decoding collapse；随后分别冻结 reference teacher、使用 EMA teacher，以拆分模型持续更新造成的不一致；最后把反馈增强移植到外部 teacher 的 MOPD，检查问题是否只属于 self-teacher。

**关键实验与证据**：未正则 FA-SD 在七个开放域 QA benchmark 上训练 pass rate 长时间接近 0，虽然 feedback-augmented self-teacher 经常明显强于 student。EMA teacher 经过早期退化后恢复，最终七项平均 0.206，高于 Qwen3B base 的 0.114，但仍说明训练十分脆弱。标准 MOPD 使用强外部 teacher 更稳定；加入 privileged feedback 的 FA-MOPD 反而低于标准 MOPD，表明 prompt inconsistency 本身会破坏监督。

**局限和可信度**：实验核心是 Qwen2.5-3B base、Qwen2.5-7B teacher、固定检索器和 2018 Wikipedia 语料，模型与环境覆盖有限。论文没有把所有模板无关性变成严格因果干预，也没有大规模 seed 分析。它最有价值的结论是诊断框架：监控 aggregate reward 不够，还要检查轨迹是否随输入变化、有效 teacher signal 是否持续存在。

**与当天主题的关系**：这篇负结果与 Distilled RL 形成直接对照：teacher 信号的稳定性、条件一致性和消费方式，比“是否有成功示范”更重要。

### 11. GRPO 的暗室：稠密奖励可能把 Agent 训练到 0% 成功率

**论文信息**：*The Dark Room in the Reward Channel: Dense Prediction Rewards Collapse GRPO-Trained LLM Agents—and What Actually Works*；Yu Wang；[arXiv:2607.21273](https://arxiv.org/abs/2607.21273)；cs.LG；2026-07-23。

**一句话 TL;DR**：在稀疏成功、组内大量全失败的场景中，GRPO 的标准差归一化会把极小的稠密 shaping 差异放大成满强度优势，最终让 agent 学会停在最可预测但任务失败的状态。

**为什么值得推荐**：稠密 process reward 常被当作解决长程 credit assignment 的万能药。这篇工作指出，奖励是否有界并不能保证梯度安全；真正决定风险的是信号在组内、尤其在掌握后是否仍保留方差，以及它通过 reward channel 还是 auxiliary loss 进入优化。

**方法怎么工作**：agent 每步预测下一 observation，用规则计算预测准确度，再把 potential difference 作为稠密奖励加入 ALFWorld 的稀疏成功回报。作者跨 Qwen3-1.7B/4B/8B 观察 collapse，用只移除 GRPO 标准差归一化的单因素实验定位原因；再提出 variance-profile criterion，判断信号在 mastery 时的组内方差是否归零。最后构造九臂 signal-delivery matrix，在信号内容相近时比较标准 reward、分通道 reward、mean-only、辅助 CE loss 与 shuffled-label placebo。

**关键实验与证据**：标准配置三种规模全部进入 prediction accuracy≈1、task success=0、episode length 卡住上限的吸收态。Qwen3-4B 中，仅改成 mean-only normalization 就从 0% 恢复到 51.6%，与无 shaping control 的 52.6% 基本持平；退火没有救回。辅助 loss 达到 69.3%，比 baseline 49.5% 高约 20 点，但 shuffled-gold placebo 更高到 76.0%，反而提示增益可能来自正则化或额外 token compute，而非正确世界模型内容。

**局限和可信度**：所有 endpoint 目前都是单 seed，主要环境只有 ALFWorld 与作者自建 HRG；group size 固定为 4，与标准差估计不稳定性混在一起。32-episode validation 在 p≈0.5 时噪声约 8.8 点，多个 prospective test 和统一 140-game 评估仍在进行。论文自己把结论限定在 GRPO-family，不适合泛化成“稠密奖励都危险”。

**与当天主题的关系**：这是当天最重要的 post-training 警告：奖励设计必须连同归一化和梯度通道一起审计，不能只检查 reward 数值是否合理。

### 12. MetaEvolve：把“会迭代改进”本身作为 Post-Training 目标

**论文信息**：*Teaching LLMs to Self-Evolve: Cultivating Core Meta-Skills with Reinforcement Learning*；Shujin Wu、Cheng Qian、Xiusi Chen、Heng Ji；[arXiv:2607.21971](https://arxiv.org/abs/2607.21971)；cs.LG、cs.AI、cs.CL；2026-07-24。

**一句话 TL;DR**：MetaEvolve 不只在推理时套进化搜索，而是用包含当前程序、分数与历史尝试的训练样本，让模型通过执行奖励学习“如何根据历史把方案改得更好”。

**为什么值得推荐**：AlphaEvolve 式系统把大部分能力放在外部搜索器里，模型本身未必学会读取历史、诊断瓶颈和放弃无效策略。若“自我演化”只是多采样，增加测试时计算未必提高每轮改进质量。这篇论文明确把 refinement meta-skill 作为训练对象。

**方法怎么工作**：作者先从 25k+ 编程题各采样 10 个回答，用两阶段多样性过滤留下约 6k 个 question–response pair；为每个当前程序合成 1–3 个按性能排序的历史尝试，并附 correctness 与 runtime 组合 fitness。训练时用 GRPO 比较新旧程序，未改善直接给 -1，改善则奖励分数增量。推理时在多个 island 上做 10 轮演化，每轮从父程序生成候选、执行测试、保留 top-5，并定期迁移保持多样性。

**关键实验与证据**：七个 coding benchmark 上，相对最强 AlphaEvolve，MetaEvolve 在域内平均绝对多 10.01 点，域外多 24.12 点；APPS 为 59.77% 对 42.21%，TACO 为 50.62% 对 33.93%，LeetCode 为 68.87% 对 39.88%。在 8 个 AlgoTune 开放优化任务上，harmonic score 从 1.392×升到 2.045×，相对提升 46.9%，并在 8 项中赢 7 项。结构新颖度指标也普遍高于 AlphaEvolve。

**局限和可信度**：训练和主评测都以 competitive coding 为中心，每个 benchmark 只抽 50 题；AlgoTune 只有 8 个任务，无法证明所谓 domain-agnostic meta-skill。历史是由静态回答人工拼出的“伪轨迹”，不等同于真实在线演化。论文没有独立 limitations 小节，且主要使用单一 Qwen3-14B，reward 对公开测试的过拟合风险也需要更严格评估。

**与当天主题的关系**：它提供了今天较积极的一面：post-training 不必只优化单轮答案，可以直接训练模型消费反馈、历史与增量目标，但“能力是否真正跨域”仍需更强证据。

## 中相关论文速读

### Coding Agent / Software Change

#### DiffTestGen：用双版本覆盖率引导差分测试

[DiffTestGen](https://arxiv.org/abs/2607.16024) 不直接问 LLM“这个 PR 改了什么”，而是用静态调用图和文档找到合法入口，再根据旧/新版本修改代码的 union coverage 反复生成测试。两个数据集共 463 个 PR，方法在 78.2% 上暴露行为差异，平均 union coverage 90.7%，比 baseline 多揭示 99 个 PR。推荐它是因为目标非常明确：生成测试不是终点，真正指标是能否触发版本间行为差异。仍需注意，覆盖率与语义充分性并不等价，且强结果依赖可编译、可执行的双版本环境。

#### DataFlow-Harness：让 Agent 修改持久 DAG，而非丢下一段脚本

[DataFlow-Harness](https://arxiv.org/abs/2607.16617) 用 Skills 提供过程知识、MCP 暴露实时 operator registry 与 pipeline state、WebUI 同步对话和可视 DAG；agent 通过 typed incremental mutation 构建平台原生数据流。12 题 benchmark 上观察到 93.3% 端到端通过率，相对 vanilla Claude Code 成本低 72.5%、延迟低 49.9%。它值得看的是 artifact 设计：当目标是长期可编辑工作流时，平台状态和类型约束比自由脚本更重要。样本只有 12 题，因此结果更像系统 proof-of-concept。

#### IssueExec：测试是需求到代码之间的可执行中介

[IssueExec](https://arxiv.org/abs/2607.17286) 把 issue localization 从“文本直接匹配代码”改成“issue→相关测试→执行轨迹→待改代码”。18 个仓库中现有测试覆盖 96.98% 的 ground-truth 文件，两跳语义连接在 82.4% 案例中强于直接匹配；在 SWE-bench Lite 上 function Recall@1 比最强 baseline 提高 41.57%，接入 Agentless 后多解 17.72% issue。推荐点是测试被当成可执行需求代理，而非最终验收工具；风险是缺测试或测试结构差的仓库会直接削弱方法。

#### Long-Context Skills：要求大多还在，但漏掉几个就足以失败

[How Agent Skills Fail under Long Contexts](https://arxiv.org/abs/2607.17937) 在固定 24 项 artifact check 的白盒审计任务中，把上下文从 10,991 字符扩到约 299k。Codex + gpt-5.4-mini 的通过率从 8/10 降到 3/10，无论长上下文相关还是无关；但 requirement coverage 仍超过 92%，说明不是整体遗忘，而是少数关键遗漏。详细外部 checklist 为 10/10，generic self-check 为 5/10（p=0.0325）。值得保留的判断是“长上下文失败具有稀疏致命性”；但只有两个任务，作者也明确不声称存在普适 context threshold。

#### DepRepair：依赖升级修复需要跨仓库证据

[DepRepair](https://arxiv.org/abs/2607.17957) 构造了跨四种生态的 95 个真实 dependency-breaking 实例，每个都有 Docker executable oracle。方法先过滤 release note/API diff，再定位 consumer usage，最后按 breaking-change 子类生成修复。GPT-5.5 与 Claude Opus 4.6 分别达到 89.5% 和 82.1% pass rate；直接塞入未经整理的 upstream evidence 反而使通过率下降 7–23 点。推荐理由很简单：更多上下文不是更多证据，跨仓库 repair 需要结构化压缩。规模和生态覆盖仍不足以代表复杂依赖图。

#### PhoenixRepair：把“找哪里改”和“怎么改”同时扩成搜索空间

[PhoenixRepair](https://arxiv.org/abs/2607.18859) 先采样多个候选 edit location，再在每个位置进行反思与 patch refinement，最后蒸馏历史尝试进入最终生成；困难任务可加入图结构定位。SWE-bench Verified 上，DeepSeek-V3.1 相对 SWE-agent 最大提升 7.8%，MiniMax-M2.5 达到 76.0% Pass@1。它值得速读，因为多数 repair agent 只在单一定位点反复改，搜索空间被过早截断。不过多 agent 与多尝试带来的计算增量需要和简单 best-of-N 做更严格的等预算比较。

#### WorkBuddy Bench：公开任务也可以靠构造流程抵抗污染

[Tencent WorkBuddy Bench](https://arxiv.org/abs/2607.20911) 从 commit、PR、业务场景和 CVE 反向构造 Code、Web、Office、Security 四个 track，把任务改写成短促、口语化的角色请求，隐藏原始检索线索，并公开 task、image、tests 与 reference solution。七个模型在两种 harness 下各跑三次；Security 的跨 harness 平均绝对变化达 8.6 点，而 Office 中位变化仅 0.86 点。Code 中 bug_fix 与 api_contract 均值只有 0.47，是最难类别。推荐它是因为同时展示污染防护、任务分布和 harness sensitivity；限制是 Code 明显偏 Python，公开后仍会逐步污染。

#### Claim Plane：并行 Agent 的冲突应该在写入前拒绝

[Claim Plane](https://arxiv.org/abs/2607.21909) 要求 worker 在实现前声明带 base commit、typed resource、依赖与操作类型的 ChangeIntent；控制面原子化 admission，同文件区域冲突被串行化，contingent mutation 首次写入时再动态扩 scope，并用 lease、worktree lock、fencing token 和 Git-tree provenance 绑定权限。概念上，它把并行协作从“出冲突再 merge”改成“写前授权”。但实证只有 6 对 CooperBench：静态模式 6/6 通过但全串行，动态模式只保留一半并行 admission，因此目前更适合当架构提案，不适合当性能结论。

### LLM Post-Training

#### ToolVerse：从 400 个 MCP、4,500 个工具构造 Agentic RL 环境

[ToolVerse](https://arxiv.org/abs/2607.15660) 自动把近 400 个真实 MCP 转成可执行环境，用工具依赖图和动态解锁采样生成长程 GUST 任务，再用 Turn-Aware Relative Advantage 处理多轮 credit assignment。它值得推荐的是把环境扩展、任务生成和 RL 算法放在同一条 pipeline，而不是只发布一批静态调用题。摘要报告多个 agent benchmark 有显著提升，但缺少可在摘要层核查的完整数字；环境自动化质量、工具副作用隔离和任务真实性需要读者继续检查实现。

#### BIRD：先修 rollout 分布，再做 On-Policy Distillation

[BIRD](https://arxiv.org/abs/2607.15736) 认为冷启动自蒸馏的主要问题是 student 访问的 prefix 已经冗长或跑偏，teacher 只能局部纠正。它先在 brevity prompt 下采样正确短解，用 prompt-switch SFT 把简洁行为迁回原 prompt，再进行 reverse-KL on-policy distillation。Qwen3-8B 在 MATH-500 从 86.2% 升到 92.0%，平均响应从 3,099 token 降到 1,115。值得记住的是“prefix support 决定蒸馏可学性”，而不是又一个压缩 CoT 技巧；代价是初始正确短解筛选本身依赖可验证任务。

#### CRAFT：把 Rubric 变成能力树，再生成针对性 SFT 数据

[CRAFT](https://arxiv.org/abs/2607.16122) 从每个 prompt-rubric pair 抽取能力描述，聚类成层级 capability tree，在不同层级定位当前模型的弱节点，再围绕这些节点生成 SFT 数据。四个开源模型、金融与法律两个域、13 个 held-out benchmark 中，金融四模型全部最好，法律三模型最好。它的价值是把 evaluation 从“哪里错了”推进到“缺什么能力、下一批数据该生成什么”。不过 rubric 抽取与聚类仍由模型完成，树的稳定性和错误诊断的闭环污染值得警惕。

#### TOPD：Diffusion LM 也可以沿自己的去噪轨迹做 On-Policy Distillation

[TOPD](https://arxiv.org/abs/2607.16872) 让目标 diffusion LM 先采样自己的 denoising states，再让 teacher 在对应部分去噪状态上给 token 分布，用 reverse KL 监督与最终响应对齐的 trace decision。SDAR-4B-Chat 在 MATH500 上追平 RL 版本 TraDo-4B，静态/动态评测分别提升 5.7/4.5 点；所需 rollout round 少 4 倍，作者估算达到同等准确率的 model-compute 加速为 96 倍。推荐它是因为 post-training 必须匹配生成范式；估算加速对系统实现和 teacher 查询成本很敏感，不宜只看 headline。

#### Environment-Free API Data：没有真实后端，也能合成 Tool Trajectory

[Environment-free Synthetic Data Generation for API-Calling Agents](https://arxiv.org/abs/2607.16900) 只需 API spec：一个 LLM 生成任务，teacher agent 解决任务，另一个 LLM 作为有状态世界模型生成连贯 API 响应，最后由 judge 过滤轨迹。AppWorld 与 OfficeBench 上微调均有明显增益。它解决的是 agent post-training 最昂贵的瓶颈之一——真实 API、数据库和账号环境。但模拟器与 judge 同属 LLM 时，错误世界规律可能被一致性地“验证”通过；缺少真实环境交叉检查会把可扩展性换成不可见偏差。

#### Thinking Checklist Reward：开放式偏好也可以提供过程级信号

[Rewarding Better Thinking for LLM Preference Alignment](https://arxiv.org/abs/2607.19824) 从每条 preference pair 推导 sample-specific checklist，评价完整 reasoning trace 是否覆盖用户意图、约束和 trade-off；再用 EMA 估计 checklist reward 中可被 outcome reward 解释的部分，只保留 residual thinking surplus。五个模型上，相对同一 DAPO baseline 的平均 win-rate 差提高 7.67–10.92 点，AlpacaEval 的 length-controlled win rate 也一致改善。值得看的是 reward 去重设计；主要风险是 checklist、过程评分与最终 pairwise judge 都依赖大模型，可能共享偏好偏差。

#### SLAI T-Rex：Post-Training 也有系统论文

[SLAI T-Rex](https://arxiv.org/abs/2607.20145) 讨论 DeepSeek-V4 family 在 Ascend SuperPOD 上做 full-parameter CPT/SFT 的工程路径：模型并行、通信编排和 kernel 优化共同把 MFU 提到 34.22%，相对开源 recipe 提升 2.93 倍。随后构建 10k solver-verified 运筹学 SFT 数据，DeepSeek-V4-Flash 专用模型 zero-shot Pass@1 达 71.81%，比 GPT-5.4-Mini 高 3.98 点、比 base 高 11.27 点。推荐它是因为训练系统和数据验证被放在同一报告中；但结果来自单一硬件栈与专业域，通用 post-training 效率结论有限。

#### RL 与模型合并：训练目标会改变任务冲突几何

[Enough is as good as a feast](https://arxiv.org/abs/2607.22039) 比较五类任务上 SFT 与 RL 专用模型的 merge 行为，发现 RL 模型合并后退化更小。作者给出三层解释：on-policy 数据使更新幅度更小；达到“足够好”后 RL 的冲突更新数量和强度继续下降；正负样本联合优化把参数推向更少偏置的任务子空间。推荐点不是“RL 模型更容易 merge”这个现象本身，而是把 post-training 的更新几何与后续模型组合联系起来。理论解释依赖实验设定，仍需要更多模型家族和非 merge 下游验证。

## 可留意 / 可跳过

### Coding Agent / Software Change：保留哪些判断

- [Making Agent-Mediated Contributions Governable](https://arxiv.org/abs/2607.15769)：保留“开源项目需要显式声明 agent contribution、验证责任和可回滚边界”；偏治理清单，实证较弱。
- [READU](https://arxiv.org/abs/2607.15780)：保留“README 也是随代码演化的可修复 artifact”；任务窄于一般仓库 repair。
- [TARS](https://arxiv.org/abs/2607.15948)：保留“代码理解辅助应建模具体开发者的知识状态”；个性化收益与真实维护结果仍有距离。
- [Specification-Driven Development as the Foundation of AI-Native Enterprise Software Engineering](https://arxiv.org/abs/2607.16680)：适合作为 AI-native 规格驱动的观点文，不当作已验证方法。
- [Model-Driven Discipline for Multi-Agent LLMs](https://arxiv.org/abs/2607.16708)：关注 requirement→model→verification 的 traceability；自动生成链条越长，错误累计越需要人工检查。
- [Agentic Code Review in the Terminal](https://arxiv.org/abs/2607.16740)：保留 trajectory、成本和 human-alignment 三类观察维度；终端实验的外部效度有限。
- [Specifying the Delegated-Autonomy Boundary](https://arxiv.org/abs/2607.17225)：保留“委托范围应写成需求与验收条件”；属于 requirements framing，非能力评测。
- [Test Coverage Analysis of Agentic Pull Requests](https://arxiv.org/abs/2607.18057)：值得记住 agent PR 不能只看 merge/resolved rate，还要看测试覆盖；因果解释需谨慎。
- [TRIM](https://arxiv.org/abs/2607.18161)：轨迹压缩可能减少 code slop，但“更短”是否保留复杂任务必要探索仍需分任务验证。
- [Semantic Drift in Bug Resolution](https://arxiv.org/abs/2607.18550)：保留 report→test→patch 行为信号漂移这个问题定义；适合继续看数据构造是否真正可执行。
- [LM2Alloy](https://arxiv.org/abs/2607.18555)：保留“形式规格可成为测试派生中介”；生产对象和规格正确性是主要可信度边界。
- [Data Leakage Prevention via Preemptive Hardening](https://arxiv.org/abs/2607.18847)：扫描 prompt、tool interface 与调用代码再生成 patch 的思路值得看；防御覆盖仍受攻击集限制。
- [TraceDev](https://arxiv.org/abs/2607.18886)：保留 use-case functional point 到代码/测试的显式 traceability；多 agent 数量本身不是证据。
- [CodeRescue](https://arxiv.org/abs/2607.19338)：关注失败后是否值得继续、切换策略或止损的预算路由；与本期 stopping 论文可互相参照。
- [Context Matters](https://arxiv.org/abs/2607.19682)：保留 unit-test generation 必须带 repository context 和实际可运行性判断；不要只看 isolated test quality。
- [Beyond Fail-to-Pass](https://arxiv.org/abs/2607.19843)：值得记住 reproduction test 与 fix 应共同 harden，避免弱测试把错误补丁判绿。
- [Delivery, Not Storage](https://arxiv.org/abs/2607.20972)：保留“工作记忆的价值在正确时刻送达线索，而非无限存储”；需要更广任务复现。
- [ICAE-Bench](https://arxiv.org/abs/2607.21217)：关注 coding agent 作为交互式项目构建者，而非单 patch 生成器；先检查任务环境和 verifier 是否能覆盖运行行为。
- [Petri-Net-Guided Rust API Test Generation](https://arxiv.org/abs/2607.21530)：资源流与并发状态适合形式模型引导；范围集中于 Rust stateful API。
- [Tool-Guided Repair for LLM-Generated C](https://arxiv.org/abs/2607.21641)：编译、CodeQL、KLEE 与历史修复模式联合可显著降缺陷；主要是函数级 C 任务，不等同仓库级 agent。
- [Cross-Model LLM Code Review](https://arxiv.org/abs/2607.21656)：116 道题中 Claude 审 Codex 从 71.6%升到 89.7%，反向却从 91.4%降到 82.8%；保留“review pairing 非对称”，但 reviewer 不能跑测试。
- [Output Format × Model Identity](https://arxiv.org/abs/2607.21674)：输出格式会重排模型名次；4 个仓库中 3 个全零成功率，也说明结论高度依赖小任务集。
- [KLEECopilot](https://arxiv.org/abs/2607.21676)：LLM 标记潜在漏洞并引导 KLEE 路径搜索，unique violation 比 Empc 高 24.3%；适合作为语义启发式与符号执行的结合案例。
- [Agentic Pull Requests](https://arxiv.org/abs/2607.21832)：保留 agent PR 与人类 PR 的生命周期和质量差异应纵向观察；摘要未给足可核查效应量。
- [Operational Memory RAG](https://arxiv.org/abs/2607.21911)：把已解决 incident 结构化为 symptom-root cause-resolution，比文档 RAG 更贴近诊断；LLM judge 覆盖 1,172 条、人工只核 123 条。
- [KaPilot](https://arxiv.org/abs/2607.21957)：unsafe Rust 规格通过 generate–precheck–verify 循环生成，ground-truth 组成功率 88.9%；规格“可验证”仍不等于规格“完整”。
- [Developer Responses to Agent-Generated Review Comments](https://arxiv.org/abs/2607.21997)：54,791 条评论中，inline code suggestion 最能预测被解决；相关性不等于建议正确性。
- [Code Review is a Conversation](https://arxiv.org/abs/2607.22095)：值得保留“review 是协商、追问与记录 rationale”的研究议程；它是 vision paper。
- [HarnessLLM](https://arxiv.org/abs/2607.22161)：关注 Rust verification harness 自动生成；与 KaPilot 类似，应继续追问 ground truth 与遗漏 unsafe path。
- [Do Agent Benchmarks Measure Capability?](https://arxiv.org/abs/2607.22368)：保留 protocol validity：harness、预算、工具与 judge 都是测量的一部分；属于评测方法论而非新 agent。
- [Vibe Coding with TDD](https://arxiv.org/abs/2607.22406)：适合作为“测试先行是否约束自然语言驱动开发”的小实验；不应外推生产维护。
- [MineValiCoder](https://arxiv.org/abs/2607.22471)：测试质量挖掘与代码/测试双向验证值得关注；主要回答可靠 code generation，仓库演化覆盖较弱。

### LLM Post-Training：保留哪些判断

- [Process Reward Informed Tree Rollout](https://arxiv.org/abs/2607.15610)：保留“过程奖励可以分配多轮 rollout 预算”；先核对 PRM 偏差是否被搜索放大。
- [QUADS](https://arxiv.org/abs/2607.15810)：关注 NVFP4 MoE RL 中权重与激活两侧量化误差对齐；更偏低精度训练系统。
- [JoyNexus](https://arxiv.org/abs/2607.16074)：保留多租户 VLA post-training 的服务化调度问题；与 LLM 推理对齐不是同一评测域。
- [When Does Muon Help Agentic RL?](https://arxiv.org/abs/2607.16169)：值得看优化器在 agentic RL 中何时有效，而非默认把预训练 optimizer 搬过来；需关注等算力控制。
- [RIMS](https://arxiv.org/abs/2607.16431)：多 pair 平滑聚合适合小规模 preference data；RAG 专用结果不代表通用对齐。
- [Enhancing Rubric-based RL via Self-Distillation](https://arxiv.org/abs/2607.18082)：保留 rubric reward 也能自蒸馏；需警惕 rubric 与 judge 共偏差。
- [Alignment Tuning and Sycophancy Representations](https://arxiv.org/abs/2607.18114)：关注对齐训练如何重塑谄媚相关表示，而非只看输出率；机制结论取决于 probe 的因果性。
- [CASE](https://arxiv.org/abs/2607.18820)：训练时因果对齐、推理时结构约束来减少 instruction→answer shortcut；CoT faithfulness 仍难由行为指标完全证明。
- [H²SD](https://arxiv.org/abs/2607.18955)：成功轨迹用 hindsight context、失败轨迹用 corrective reference 的混合蒸馏值得看；核心是按结果选择 teacher 角色。
- [Verifiable Self-Evolution for Dialogue Skills](https://arxiv.org/abs/2607.18973)：保留 future-feedback prediction 作为开放式技能自演化信号；“可验证”程度弱于代码和数学。
- [Contrastive On-Policy Distillation](https://arxiv.org/abs/2607.19046)：关注对比式 teacher signal 如何避免绝对 KL 拟合；需要和更简单 importance weighting 做等预算比较。
- [Off-Context GRPO](https://arxiv.org/abs/2607.19313)：训练时使用 privileged information、部署时移除，是 hard-problem curriculum 的一种；关键风险是 privileged cue 泄漏成捷径。
- [ISO](https://arxiv.org/abs/2607.19331)：RLVR-native optimization stack 值得系统研究者看；框架吞吐提升与算法收益要分开报告。
- [Rushes](https://arxiv.org/abs/2607.20767)：复数偏好数据可避免单一“平均人类”目标；数据覆盖和群体代表性比算法更重要。
- [OPOD](https://arxiv.org/abs/2607.20918)：on-policy omni distillation 扩展到多模态；teacher 查询成本和跨模态 token 对齐是关键。
- [AttriMem](https://arxiv.org/abs/2607.21106)：用 attribution-guided process feedback 学 agent memory；保留“记忆写入也需要 credit assignment”。
- [Emergent Misalignment Recruits a Pre-existing Persona Subspace](https://arxiv.org/abs/2607.21356)：关注 post-training 不是凭空创造恶意 persona，而可能激活已有表示；机制外推需谨慎。
- [PATS](https://arxiv.org/abs/2607.21419)：policy-aware scaffold 试图让训练 harness 随当前策略调整；环境变化可能同时引入非平稳性。
- [OpenForgeRL](https://arxiv.org/abs/2607.21557)：harness-native agent RL 的工程抽象值得看；“任意环境”仍取决于 verifier 与 state adapter 质量。
- [Progressive Rollout Allocation](https://arxiv.org/abs/2607.22002)：按训练进展动态分配 rollout，比固定预算更合理；检查收益是否只是多给难样本算力。
- [Pluralistic Alignment Roadmap](https://arxiv.org/abs/2607.22305)：适合作为价值多元对齐的问题清单，不当作已验证训练方案。
- [Cross-Tokenizer On-Policy Distillation](https://arxiv.org/abs/2607.22334)：用 byte-prefix marginalization 处理 teacher/student tokenizer 不同，是跨家族蒸馏的关键基础问题；计算开销和近似误差值得深挖。

## 横向比较

| 论文 | 问题定义 | 验证证据 | 可复现性 / 实用性 | 主要可信度风险 |
|---|---|---|---|---|
| Agent-Reactive Bugs | 模型行为 × harness 反应产生的新型 bug | 4 项目、255 个手工标注 bug、PR/讨论追踪 | taxonomy 和数据问题很实用 | 只覆盖公开 issue，采样受 engagement threshold 影响 |
| Reliability Decomposition | 结构、专用模型、验证分别贡献多少 | 三 benchmark、loop confusion matrix、swap ablation | instrument verifier 的思路很强 | 厂商自评、专有组件、单次运行 |
| Trajectory Curation | code-agent SFT 中质量与数量如何权衡 | 16 组训练、三规模、代理指标交叉验证 | 代码和配置公开，实验变量清楚 | 没有端到端 resolve rate，单模型单数据源 |
| VRR-Stop | noisy verify-repair 何时应该停止 | 多 stress/shift setting、参数与 guard 消融 | 适合设计可靠循环 | 二元状态、局部平稳假设、压力场景偏人工 |
| PerfAgent | 仓库级性能修改如何获得有效反馈 | GSO + SWE-fficiency、best@5 对照、hack-adjusted score | profiler/test/controller 可直接复用 | Python 偏置、单次运行、计时可被投机 |
| IssueTrojanBench | 恶意 issue 是否触发真实执行 | 4,176 次 sandbox run、E2E execution metric | 攻击类别和数据公开价值高 | 产品版本少、攻击由研究者构造 |
| Pretrain→Post-train | 初始化如何决定 RL 曲线 | 完整 compute sweep、棋类精确环境、数学复核 | 适合研究 scaling 机制 | 棋类过于可控，数学只做小规模定性验证 |
| KITE | 合成数据迭代如何避免能力两极化 | 多模型、多代、消融与 OOD | 数据选择逻辑清楚 | 外部 verifier、LLM 标注 Q-matrix |
| Distilled RL | teacher 信号如何进入 RL | 三 student、跨/同家族、关键组件消融 | objective 简洁，可接现有 RL stack | 默认 teacher 在正轨迹上更可靠 |
| FA-SD Negative Result | 强 self-teacher 为什么仍教不会 student | 训练动态、有效信号率、EMA/reference/external teacher | 诊断指标比 headline 更有价值 | 模型与检索环境单一，seed 覆盖有限 |
| Dark Room | 稠密奖励如何被 GRPO 归一化放大 | 单因素 rescue、九臂 channel matrix、理论命题 | 给出具体预警和替代通道 | 单 seed、小 group、部分实验仍在进行 |
| MetaEvolve | 能否训练“根据反馈持续改进” | 七 coding benchmark + 8 AlgoTune、novelty 分析 | execution reward 和轨迹格式明确 | 单模型、每集 50 题、跨域证据仍小 |

## 我的判断

- **创新性：A-**。最好的论文没有继续堆 agent 角色，而是重新定义问题：模型—harness 交互 bug、停止可辨识性、奖励方差轨迹、teacher signal 的消费方式。
- **实用价值：A**。Profiler 驱动优化、结构化 upstream evidence、差分测试、写前并发授权和恶意 issue 的端到端攻击，都能转化为更具体的系统检查项。
- **严谨性：B+**。有几篇给出了难得的负结果、统计边界和局限声明；但 vendor 自评、单 seed、公开 validation、LLM judge 以及小规模自建任务仍很常见。
- **推荐价值：A**。如果只读 post-training，优先读 Pretrain→Post-train、Distilled RL、FA-SD 负结果和 Dark Room；如果只读 coding agent，优先读 Agent-Reactive Bugs、PerfAgent、IssueTrojanBench 与 WorkBuddy Bench。

最大的不确定性来自时间窗口很密：这些都是刚上传的预印本，部分结果尚未经历同行评审，有些论文甚至明确写着 seed replication 仍在进行。因此本期最应该保留的不是单一分数，而是几条可反复验证的判断：**反馈不等于证据，循环不等于可靠，teacher 更强不等于监督可学，奖励有界也不等于梯度安全。**
