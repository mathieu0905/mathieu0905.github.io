---
title: "先验证信念，再验证补丁：2026-07-13 arXiv 把 coding agent 的可靠性推进到轨迹、技能与仓库结构"
date: "2026-07-13"
description: "这一批论文沿着失败早检、执行反馈、技能约束与跨仓库一致性四条线，重新界定了真实软件变更中的 coding agent 可靠性。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "仓库级智能体", "验证闭环", "软件演化"]
series: "alphaXiv论文解读"
coverColor: "from-indigo-800 to-emerald-700"
---

# 先验证信念，再验证补丁：2026-07-13 arXiv 把 coding agent 的可靠性推进到轨迹、技能与仓库结构

2026-07-13 这一批 arXiv 新论文很密集。与 coding agent 实质相关的工作开始追查失败在哪一步形成、错误信念何时锁死、skill 里的条件为何没有生效，以及仓库里哪些跨文件约束根本没有进入现有 CI；最终 patch 能否通过测试只是其中一个指标。

把这些论文放在一起读，你会看到一条连贯的工程链：issue report 先给 agent 划定搜索空间，reproduction test 把自然语言故障变成可执行证据，agent 在轨迹中持续校验假设，结构化 verifier 再检查测试没有覆盖的仓库级一致性。任何一环缺失，局部正确的修改都可能留下静默错误。

这批工作还给出了两个不太舒服的结果。人类会高置信地接受错误断言；更强的模型也会违反 skill 里清楚写出的前置条件。把审查责任交给“更聪明的人或模型”并不能替代可执行约束。

本文按 arXiv 在 2026-07-13 公布的新批次筛选，覆盖 13 篇强相关、12 篇中相关与 9 篇背景相关论文。强相关论文均下载 v1 PDF，并阅读方法、实验与局限；论文首次提交时间集中在 7 月 9 日至 10 日 UTC。

## 今日脉络

今天的论文可以压成四组。

第一组研究**失败过程**。`Failure as a Process` 把一次失败拆成决定性错误、锁死和外部可见三个时刻；`Long-Horizon-Terminal-Bench` 用稠密奖励证明，二元通过率会抹掉长任务中的大量有效进展。这两篇共同要求评测者观察完整轨迹，而不是只看最后的测试结果。

第二组研究**执行证据**。`ReProAgent` 把 issue 转成 fail-to-pass reproduction test，`SCATE` 用覆盖率和可测性指标监督测试生成，property-template 工作把 Lean 证明与 PySpark property-based testing 并排运行。它们都把验证当成一个持续生产、交叉核对证据的过程。

第三组研究**agent 的控制面**。自动 harness adaptation、`SLBench`、`GRACE` 和 agent skill 市场研究分别处理工具编排、逻辑约束、长期指令演化与可复用工作流。结论很一致：instructions、tools、memory 和 recovery policy 已经构成软件资产，需要版本化、测试和安全审计。

第四组回到**仓库结构与变更入口**。`Patchwork Problem` 检查跨配置、路由、schema 和依赖图的一致性；`Git-Assistant` 用形式化规划约束危险的仓库状态变换；bug-report 研究量化了定位线索和修复建议对 agent 成功率的影响。可靠性从“生成后验收”前移到了任务描述、计划和每次状态转换。

## 强相关论文深读

### 1. Failure as a Process：失败通常在第 7 步已经决定，却到第 16 步才露出痕迹

**论文信息**：Xiangxin Zhao 等，*Failure as a Process: An Anatomy of CLI Coding Agent Trajectories*，[arXiv:2607.09510](https://arxiv.org/abs/2607.09510)，`cs.SE / cs.AI`，v1 提交于 2026-07-10，进入 2026-07-13 新批次。

**一句话 TL;DR**：作者把 coding-agent failure 从一个终局标签改写为三个时间点，并发现多数失败源于 agent 误用已有信息，而非模型缺少知识。

**为什么值得读**：只在任务结束后运行测试，你只能知道 agent 失败了。你不知道它在第几步采纳了错误前提，也不知道 verifier 发出信号时是否已经错过修复窗口。对长依赖链、复杂构建环境和真实仓库任务，这个时间差决定了在线监控有没有用。

**方法怎么工作**：作者先让 7 个模型通过 MiniSWE、OpenHands 和 Terminus2 三种 scaffold 执行 Terminal-Bench，收集 3,843 条原始轨迹。随后保留 89 个拥有完整 21 组模型与 scaffold 组合的任务，得到 1,794 条有效轨迹和 63,000 多个步骤。最后，Claude Opus 4.6 只生成标注草稿，两名人工标注者给 1,184 条失败轨迹确定决定性错误 `t_err`、经验性锁死 `t_lock`、首个可见失败 `t_obs`，并标记根因与恢复行为。图 1 给出了整条标注流水线，表 II 列出 9 类根因。

**关键证据**：失败轨迹中位长度为 27 步，决定性错误却出现在第 7 步；中位修复窗口只有 1 步，外部失败信号约在第 16 步出现。57.9% 的根因属于 epistemic error，其中未验证的错误前提占 30.7%；能力不足占 32.8%，环境阻塞只占 9.4%。前缀监控器即便拿到任务要求，召回率也只有 28.8%，只有 3.7% 至 8.7% 的失败能在锁死前被识别。图 5 的案例很典型：agent 在错误目录工作 17 步后，才从 `git add` 得知自己不在仓库里。

**局限和可信度**：样本来自 Terminal-Bench，不等于真实 PR 修复；三种 scaffold 和七个模型也只是 2025 至 2026 年的一次快照。`t_lock` 表示“这条轨迹里没有再恢复”，不证明理论上无法恢复。优点是所有最终标签都由人工确认，关键标签的 Cohen's κ 为 0.78 至 0.94。

**与今日主题的关系**：这篇把验证闭环的第一道关口放在“验证假设”上。agent 每次读取空输出、切换目录或推断权限时，都应该生成可检查的证据，而不是等 patch 写完再统一验收。

### 2. Long-Horizon-Terminal-Bench：二元 pass/fail 看不见长任务如何耗尽预算

**论文信息**：Zongxia Li 等，*Long-Horizon-Terminal-Bench: Testing the Limits of Agents on Long-Horizon Terminal Tasks with Dense Reward-Based Grading*，[arXiv:2607.08964](https://arxiv.org/abs/2607.08964)，`cs.AI`，v1 提交于 2026-07-09，进入 2026-07-13 新批次。

**一句话 TL;DR**：46 个长时终端任务和细粒度子任务评分显示，现有 agent 可以做出不少局部进展，却很难在时间预算内收束成完整结果。

**为什么值得读**：真实仓库变更会包含环境安装、数据准备、复现实验、修改与多轮验证。终局测试把“完成 90% 后超时”和“第一步就走错”都记成零分，研究者无法区分规划、状态保存与局部执行能力。

**方法怎么工作**：作者构造 46 个任务，覆盖软件工程、实验复现、科学计算、文档表格和交互游戏等 9 类场景。每个任务沿用 Terminal-Bench 的容器和 reference solution，同时拆成可独立评分的子目标。统一 harness 允许 agent 运行数百轮、最长 90 分钟，并记录归一化奖励、episode 数、token、时间和成本。图 1 展示稠密评分结构，图 3 同时报告 `R≥0.9`、`R≥0.95`、满分通过率与平均奖励。

**关键证据**：15 个模型平均每题消耗约 9.9M tokens、231 个 episodes 和 85.3 分钟。最强的 GPT-5.5 在 `R≥0.95` 时只通过 7/46 题，即 15.2%；满分只通过 5 题。全模型在两个阈值上的平均通过率为 4.3% 和 1.7%。64.6% 的运行产生了可计量的部分进展，如果只用二元评分，这部分差异会消失。未完成运行中 79% 因 90 分钟预算耗尽，19% 属于提前退出，harness 错误只占 3%。

**局限和可信度**：46 题仍然偏小，子任务拆分也会把作者对“合理进展”的判断写进评分器。成本和排名受模型版本、价格和 90 分钟上限影响。稠密奖励适合诊断，却不能替代最终正确性；一个高部分分结果仍可能留下无法部署的系统。

**与今日主题的关系**：这篇补上轨迹分析的量尺。repository-level agent 的评测需要同时报告最终通过、阶段性证据、时间预算和停止判断，否则你无法知道改进来自更好的执行，还是来自更长的试错。

### 3. ReProAgent：先把 issue 变成可执行的故障证据，再让 repair agent 动手

**论文信息**：Quanjun Zhang 等，*ReProAgent: Tool-Augmented Multi-Stage Agentic Generation of Bug Reproduction Tests from Issue Reports*，[arXiv:2607.09123](https://arxiv.org/abs/2607.09123)，`cs.SE`，v1 提交于 2026-07-10，进入 2026-07-13 新批次。

**一句话 TL;DR**：ReProAgent 用定位、根因、计划和执行复核四个阶段生成 fail-to-pass 测试，并证明这些测试能提高下游修复成功率。

**为什么值得读**：issue resolution 最大的证据缺口常常发生在写 patch 之前。自然语言描述没有告诉 agent 如何在当前仓库里稳定触发故障，最终它只能依赖已有测试或自己猜测成功条件。reproduction test 可以同时约束定位、行为语义与后续 patch 验证。

**方法怎么工作**：图 2 把系统拆成四个 agent 阶段。第一阶段结合文本检索和 repository graph 做分层 bug localization；第二阶段沿执行路径分析根因；第三阶段生成测试计划，决定测试入口和断言；第四阶段写入测试、运行环境，再通过反馈迭代与 triadic review 检查测试是否在旧版本失败、在目标语义下合理。表 1 列出代码检索、图查询、执行和反思工具。

**关键证据**：在 SWT-bench-lite 和 verified 上，GPT-5-mini 版本分别复现 58.43% 与 70.30% 的 issue，较同 backbone 的 OpenHands 高 20.43 和 7.90 个百分点，平均成本 0.14 美元。四种 backbone 的平均复现率仍有 56.35%，说明收益不只来自单个模型。消融最有说服力：删掉 feedback iteration 与 triadic review 后，Qwen3-Coder 从 56.88%/60.05% 跌到 18.84%/22.86%。把 reproduction-test feedback 接入一个简单 repair loop，成功数从 293 提升到 346。

**局限和可信度**：两个数据集都围绕 Python 仓库，SWT-bench 的 issue 和环境质量会影响上限。作者只运行有限轮随机 agent 推理，没有充分报告多次运行方差。生成测试也可能复现表象而非底层缺陷。论文用 fail-to-pass 与 review 缓解这个风险，却没有消除 specification gaming。

**与今日主题的关系**：它把 issue 文本、仓库定位、运行时反馈和 patch correctness 串成一条证据链。对于复杂工业平台，reproduction test 还可以扩展为 UI、设备或跨进程行为探针。

### 4. Writing Bug Reports for Software Repair Agents：agent 最需要的是“去哪里看、往哪修”

**论文信息**：Vincenzo Luigi Bruno 等，*Writing Bug Reports for Software Repair Agents: What Information Matters Most?*，[arXiv:2607.09553](https://arxiv.org/abs/2607.09553)，`cs.SE`，v1 提交于 2026-07-10，进入 2026-07-13 新批次。

**一句话 TL;DR**：在 SWE-bench Verified 上，定位线索与修复建议比单纯增加描述长度更能提高 repair-agent 成功率，两者同时删掉会显著伤害性能。

**为什么值得读**：agentic-first workflow 会把 issue report 变成机器执行的任务接口。人类偏好的背景叙述、复现步骤和外部链接未必能直接缩小 agent 的搜索空间。团队如果继续沿用只面向人类的模板，就会把定位和修复成本转移给 agent 的昂贵探索。

**方法怎么工作**：作者先从 SWE-bench Verified 的 500 题中筛出 441 个 bug report，人工给每个句子标注 observed behavior、expected behavior、reproduction steps、affected area 和 suggested fix 等信息类型。随后让 mini-swe-agent 搭配 GPT-5-mini、Gemini 3 Flash 和 MiniMax M2.5 执行修复，用 mixed-effect binomial model 控制难度、patch 大小和 issue 长度。最后对 65 个信息完整的 issue 做文本消融，分别删除行为信息、定位或建议，建立更接近因果的对照。

**关键证据**：自然语言修复建议的成功 odds ratio 为 2.01，代码建议为 1.76；行级、函数级和一般 affected-area 线索分别为 1.52、1.37 和 1.37。普通 code mention 没有显著作用，说明关键词不等于可操作定位。消融中，单独删除定位或建议未达到显著，但同时删除两者把 OR 压到 0.60；再删行为背景后降到 0.56。信息变短也没有省钱：缺少定位与建议时，GPT-5-mini 的平均成本增加 38%，执行步数增加 13%。

**局限和可信度**：观察性回归仍会受 issue 难度和作者写作习惯混杂；消融只覆盖 65 个信息完整 issue，每个模型的统计功效有限。论文发现 reproduction steps 对不同 backbone 的作用不一致，因此不能把结果直接写成统一模板。SWE-bench 里的成熟 Python 项目也不能代表移动端或工业平台的 issue 结构。

**与今日主题的关系**：这篇研究解释了验证闭环的入口质量。agent 在第一步获得 repair-directed localization，后面的工具调用和测试反馈才不必为错误搜索方向买单。

### 5. SCATE：让监督器根据覆盖反馈决定继续、深挖还是停止

**论文信息**：Sijia Gu、Noor Nashid、Ali Mesbah，*SCATE: Learning to Supervise Coding Agents for Cost-Effective Test Generation*，[arXiv:2607.08983](https://arxiv.org/abs/2607.08983)，`cs.SE / cs.AI`，v1 提交于 2026-07-09，进入 2026-07-13 新批次。

**一句话 TL;DR**：SCATE 把 test-generation supervision 建模为 contextual bandit，用运行覆盖与类可测性选择默认生成、程序分析或停止动作。

**为什么值得读**：coding agent 生成几条容易覆盖的测试后，常会过早宣布完成。固定迭代次数只能用更多 token 换覆盖率，也会在简单类上浪费预算。监督器需要读取当前执行状态，并把下一次调用投向仍有收益的路径。

**方法怎么工作**：SCATE 先从 LOC、WMC、RFC、当前行覆盖和分支覆盖构造上下文。bandit policy 在每轮选择 `Default`、`Analysis` 或 `Stop`，并用单位成本带来的覆盖增益更新策略。`Analysis` 动作调用程序分析提取未覆盖路径，agent 再针对这些路径补测试。作者在 40 个 Defects4J 类上训练，在另 80 个类上评估，并分别接入 Gemini CLI 与 Claude Code。

**关键证据**：Gemini CLI 的单轮默认生成只有 50.5% 行覆盖、43.8% 分支覆盖。8 轮固定默认循环升到 77.3%/70.2%，SCATE 达到 82.8%/74.7%，mutation score 为 64.7%，成本 0.693 美元，低于固定默认循环的 0.797 美元。对 PANTA，SCATE 的行覆盖、分支覆盖和 mutation score 分别为 82.8%、74.7%、64.7%，对方为 77.2%、70.2%、61.6%。Claude Code 起点更强，监督器让 95% 的类提前停止，平均只用 2.1 轮。

**局限和可信度**：训练与测试都来自 Defects4J Java 项目，数值特征虽不含源码，项目风格仍可能泄漏。覆盖率和 mutation score 只能近似测试价值，无法保证需求语义。一次训练分别花费 48.40 与 127 美元，迁移到新语言、框架或构建系统时是否要重训尚未充分验证。

**与今日主题的关系**：SCATE 展示了一个可复用的 agent-control 模式：监督器依据工程信号分配动作预算。构建失败、UI 差异和设备日志也可以成为同类上下文，而不必把所有判断交给语言模型。

### 6. Agentic Proof and Property-Based Testing：证明与执行测试要互相揭短

**论文信息**：Seongmin Lee、Yaoxuan Wu、Miryung Kim，*Agentic Proof and Property-Based Testing via Property-Templates in Data-Intensive Computing*，[arXiv:2607.09072](https://arxiv.org/abs/2607.09072)，`cs.SE`，v1 提交于 2026-07-10，进入 2026-07-13 新批次。

**一句话 TL;DR**：作者用 property template 同时约束 Lean 证明和 PySpark property-based test 生成，让形式模型与真实实现交叉验证。

**为什么值得读**：LLM 可以生成会编译的“证明”，也可以生成会运行的测试；两者都可能误解自然语言性质。数据密集系统又包含分区、聚合、空值和浮点语义，单一验证通道很难覆盖模型与实现之间的缝隙。

**方法怎么工作**：作者先从 Spark 的 partition、decomposition 与 dataflow 原理抽取 HOE、UDF、aggregation decomposition 和 subsumption 四类 property family。每类 template 留出待实例化的函数、生成器和关系孔位。proof track 让 agent 调用 Lean LSP，填充模板并构造机器检查证明；PBT track 让 agent 生成可执行 PySpark property tests。最后，系统把“证明成功但测试反例”当成模型与实现不一致的诊断信号。图 2 展示 aggregation decomposition 的端到端实例，表 IV 对齐两条验证轨道。

**关键证据**：400 个候选性质中有 243 个进入 Lean 模型范围。模板把正确证明数从 90 提到 136，平均提高 1.6 倍，并把 proof hallucination 从 17 降到 7。PBT 的忠实生成率从无模板的 92.8% 提到 96.8%，自然语言错配从 22 个降到 1 个，部分 family 成本下降 5.7 倍。交叉核对中，130/400 个性质同时获得证明和通过的忠实测试，6 个性质被测试找到反例，其中包括 formal model 与 PySpark 行为不一致的诊断案例。

**局限和可信度**：模板 family 由研究者预先定义，适合重复性质，不适合开放式业务规则。Lean 模型只覆盖部分 PySpark API，400 个候选中有 157 个被排除。aggregation decomposition 上仍有 54% 的编译证明属于 hallucination，说明模板没有消除错误建模。人工判断证明是否表达原始意图也带来主观性。

**与今日主题的关系**：这篇给出了“多证据验证”的具体形态。对复杂软件变更，静态证明、property test 和真实运行行为应该互相检查，而不是竞争唯一 verifier 的位置。

### 7. The Patchwork Problem：测试通过了，仓库仍可能在结构上自相矛盾

**论文信息**：Viraaji Mothukuri、Reza M. Parizi，*The Patchwork Problem in LLM-Generated Code*，[arXiv:2607.08981](https://arxiv.org/abs/2607.08981)，`cs.SE / cs.AI`，v1 提交于 2026-07-09，进入 2026-07-13 新批次。

**一句话 TL;DR**：论文把 LLM patch 的跨文件结构错误形式化为仓库图约束，并显示 97% 的发现逃过 type checking、测试和 SAST。

**为什么值得读**：agent 会生成一个能编译的 endpoint，却引用未声明配置；会添加 route，却漏掉兄弟 route 都有的鉴权；会写 import，却指向不存在的包或 symbol。这些错误跨越配置、schema、路由和依赖图，局部测试很难覆盖。

**方法怎么工作**：作者先构建 import、call、dependency、configuration、schema、resource、control-flow 与 routing graph，再定义 8 类结构失败。成熟工具能检查的约束交给 type checker 和 SAST，剩余跨图不变量由专用 detector 处理。实验从 10 个 Python/TypeScript 生产仓库提取 60 个真实任务，按单文件、多文件和 cross-cutting 分层；两个模型在四种上下文策略下生成 336 个结果。作者还扫描 43 个公开的 AI-generated repository 做外部验证。图 1 给出流水线，表 4 与表 5 报告 detector 结果。

**关键证据**：系统找到 67 个结构失败，其中 65 个对 type check、test、SAST 与 regex baseline 都不可见。GPT-4o 与 Claude 的总体失败率接近，13.0% 对 11.8%，类别分布却显著不同。cross-cutting 任务的发现率为 44.6%，单文件只有 16.1%。在 43 个外部仓库的 1,581 个文件中，系统找到 1,152 个问题，35 个仓库命中至少一项。

**局限和可信度**：受控实验只用较旧的 GPT-4o 与 Claude 3.5 Sonnet。RCF 和 CCV 两类 detector 通过迭代规则消除 false positive，没有像其他小类别那样逐条人工核验，存在评价者调参偏差。外部 vibe-coded 仓库缺少可靠 provenance，1,152 个发现也不等于 1,152 个真实部署故障。

**与今日主题的关系**：它把 patch correctness 从文件级测试扩展到 repository invariants。跨平台迁移和复杂工业仓库尤其需要这类图约束，因为“相关位置同步修改”往往横跨语言、资源与配置。

### 8. SLBench：skill 写清楚了，agent 仍可能绕过前置条件和清理义务

**论文信息**：Xuan Chen、Chengpeng Wang、Lu Yan、Xiangyu Zhang，*SLBench: Evaluating How LLM Agents Follow Logical Relations in Skills*，[arXiv:2607.09016](https://arxiv.org/abs/2607.09016)，`cs.CR / cs.SE`，v1 提交于 2026-07-10，进入 2026-07-13 新批次。

**一句话 TL;DR**：SLBench 把 skill 中的前置条件、约束、例外和 fallback 变成 86 个可执行测试，最差组合的 unsafe rate 达 70.2%。

**为什么值得读**：skill 是一份会影响执行的程序性资产。它会告诉 agent 何时可以执行脚本、失败后要清理什么、哪些数据不可发送。只测任务完成率会奖励“绕过约束但做成了”的轨迹，安全与正确性也就被拆开了。

**方法怎么工作**：SkillLogic 先定义 8 类 procedural relation，包括 precondition、constraint、postcondition、exception、conjunction、conflict、override 和 fallback。作者扫描 5,000 多个公开 skill，从高置信、高影响且可在本地执行的关系构造 86 个 case，每个 case 配套隔离 fixture 和 deterministic grader。随后用 Codex CLI、Claude Code 和 6 个 backbone 执行，再让三名人工审核者分析违例根因。SLGuard 在推理时把隐含关系转成显式 gate 和 completion check。

**关键证据**：70% 的公开 skill 至少含一类逻辑关系。GPT-5.5 驱动 Codex CLI 时 unsafe rate 为 70.2%，Claude Opus 4.7 驱动 Claude Code 仍有 35.1%。人工审核的 12 个高质量 case 中，没有一个被认为对人类读者含糊，说明错误不能全怪原文。把 skill 改写得更显眼后，违例从 11/12 降到 5/12；SLGuard 在 11 个原始违例 case 上把违例降到 4 个，即减少 63%。

**局限和可信度**：86 个 case 只覆盖可本地执行、可确定评分的关系，复杂网络权限和组织流程被排除。benchmark 由筛选管线和人工判断共同构造，可能偏向容易形式化的失败。SLGuard 仍靠 prompt-level scaffold，前置条件和 exception 上改善有限。

**与今日主题的关系**：这篇把 agent 行为规范变成测试对象。仓库级 coding agent 的 AGENTS.md、SKILL.md 和工具权限需要像代码一样拥有逻辑测试，不能只靠阅读审查。

### 9. Inside the Skill Market：软件工程工作流正在变成依赖，但市场还不会验证可迁移性

**论文信息**：Jialun Cao 等，*Inside the Skill Market: From Software Engineering Activities to Reusable Agent Skills*，[arXiv:2607.09065](https://arxiv.org/abs/2607.09065)，`cs.SE / cs.AI`，v1 提交于 2026-07-10，进入 2026-07-13 新批次。

**一句话 TL;DR**：对四个 skill marketplace 的大规模研究发现，现有 skill 集中在实现、测试和 code review，市场评分重静态安全与完整性，几乎不测跨仓库迁移。

**为什么值得读**：团队开始把测试流程、部署步骤和领域规则封装成 skill。复制一个 skill 与引入一个依赖很像：它带来执行逻辑、权限假设和维护责任。市场如果只检查文档格式，就会把过时规则、缺失脚本和过宽权限一起传播。

**方法怎么工作**：作者从 ClawHub、SkillHub、SkillNet 与 SkillsMP 收集 775,790 个候选，先用 110 个 SE 关键词检索和规则过滤，再用 GPT-5.5 判断相关性、Qwen3.6-35B-A3B 标注 lifecycle stage 与 20 类活动，去重后得到 11,497 个 SE skill。随后统计版本、token 和附属资产，并读取各市场的 VirusTotal、SkillSpector 与 LLM 评分。最后，人工抽查分类和低分原因。图 2 展示收集管线，图 11 和 12 展示 lifecycle 分布，表 I 对比市场指标。

**关键证据**：实现、测试和 code review 分别占 25.0%、21.3% 和 19.1%，三者合计 65.4%；requirements 只有 2.2%，release 只有 3.2%。ClawHub 中 19.6% 的 SE skill 同时被两种 scanner 标为可疑，另有 28.7% 被其中一种命中。只有 23% 的 skill 在 instruction scope 上被评为 OK，24% 被标为 Concern。SkillNet 的 completeness 也只有 55.7% 获得 Good。

**局限和可信度**：检索和 LLM 分类会漏掉命名隐晦的 skill，也会受模型判断偏差影响。市场数据更新快，论文记录的是 2026 年中期快照。更大的限制是论文没有执行这些 skill，因此无法证明 marketplace 指标与真实任务成功或安全事件相关。

**与今日主题的关系**：skill 已经进入 software evolution 范畴。研究者需要追踪它与仓库版本、构建环境和权限模型的共同演化，并为每次更新保留可执行回归证据。

### 10. Better Harnesses, Smaller Models：把重复难点移出模型，前提是任务足够稳定

**论文信息**：Chenyang Yang、Xinran Zhao、Tongshuang Wu、Christian Kästner，*Better Harnesses, Smaller Models: Building 90% Cheaper Agents via Automated Harness Adaptation*，[arXiv:2607.08938](https://arxiv.org/abs/2607.08938)，`cs.SE`，v1 提交于 2026-07-09，进入 2026-07-13 新批次。

**一句话 TL;DR**：meta-agent 从失败轨迹中修改 instructions、tools 和 orchestration，使小模型在重复型任务上接近大模型性能，但仓库差异会削弱收益。

**为什么值得读**：agent 性能通常被归因于 foundation model，harness 却决定它看见哪些上下文、能调用什么工具、如何重试。对工业平台，许多难点来自固定目录、构建规则和工具协议，把这些知识固化进 harness 可能比升级模型更省钱。

**方法怎么工作**：作者先把失败分成 instruction-following、knowledge、tool-use 和 long-context 等类型，再映射到添加上下文、创建工具、缩减工具集和改变循环等适配动作。meta-agent 读取失败轨迹，提出候选 harness 修改，在训练实例上重复评估并保留有效组合。实验覆盖 7 个业务型任务和 Gemma、Qwen、Ministral 三个小模型家族，统一与 Gemini 3.1 Pro 比较。图 2 给出 failure-to-adaptation 映射，图 3 展示优化循环。

**关键证据**：21 个 task-model 组合中有 16 个显著改善，7 个追平大模型。Gemma 优化后平均准确率从 31.4% 升到 80.2%，以 4% 的推理成本恢复大模型 89.7% 的性能；一次性 20 美元优化成本平均 13 次运行即可摊平。优化最常处理 instruction-following 与 knowledge failure，两者都占 81%。任务多样性与优化后性能的 Spearman ρ 为 -0.96；受控实验中，模板数增加让性能从 89.1% 降到 68.0%。

**局限和可信度**：7 个任务以重复业务流程为主，不能代表开放式 repository repair。作者也发现 code refactoring 因仓库和需求差异而难以适配。meta-agent、评估模型和闭源 API 会随时间变化；训练预算与多次试验还可能让优化器对小验证集过拟合。

**与今日主题的关系**：这篇说明 harness 是可优化的软件层，同时给出边界：固定平台规则适合外置，跨仓库语义仍需要模型和验证器处理。OpenHarmony 这类高约束平台会是检验这种分工的好场景。

### 11. GRACE：长期指令演化需要局部验证和结构化合并

**论文信息**：Dan C. Hsu、Luke Lu，*Scoped Verification for Reliable Long-Horizon Agentic Context Evolution under Distribution Shift*，[arXiv:2607.09175](https://arxiv.org/abs/2607.09175)，`cs.AI / cs.CL`，v1 提交于 2026-07-10，进入 2026-07-13 新批次。

**一句话 TL;DR**：GRACE 用 typed semantic graph 保存可变系统指令，只验证更新节点的局部邻域，并通过结构分析合并冗余规则。

**为什么值得读**：长期运行的 agent 会从失败经验里不断追加规则。平面文本越长，条件冲突和重复就越难发现；旧分布学到的修补规则还可能在新分布下破坏原有行为。软件仓库里的常驻 agent 同样会维护项目说明、memory 和 skill。

**方法怎么工作**：GRACE 把持久指令拆成带类型的对象与关系图。诊断器从失败会话提炼更新主题，graph editor 只修改相关节点；系统按 type-signature 检查局部邻域，拒绝非法关系，再把接受的 delta 重建成部署文本。结构分析模块负责合并重叠节点、处理细粒度张力。作者在 `τ²-bench` telecom 域中构造 10 个交替分布的经验批次，用 66 个从未参与演化的 held-out task 反复评估。

**关键证据**：五次独立复现实验中，Gemini 2.5 Flash 的严格 `pass^3` 从 0.091 升到最终 0.673±0.136；平面文本 HCE 最终只有 0.191±0.051，去掉结构分析的图版本为 0.248±0.144。GRACE 最终 `pass@1` 达 0.851±0.073。HCE 的部署指令增长到 82,592 字符，GRACE 为 51,413；HCE 平均矛盾数 3.35，两个图版本为 1.75 至 1.90。

**局限和可信度**：实验只有 telecom 一个域，固定 Gemini 2.5 Flash agent 和 GPT-4.1 user simulator。对照共享更新频率，却不共享内部 LLM 调用预算。矛盾与冗余由 LLM-as-judge 做事后审计，只能提供机制相关性，不能证明性能差异的唯一原因。

**与今日主题的关系**：它把 agent context 当成需要 schema、delta 和 regression evaluation 的演化资产。项目级 instruction 的更新也应该局部化，并在分布变化后测 retention。

### 12. Git-Assistant：让 LLM 解释目标，让 planner 负责仓库状态转换

**论文信息**：Alfredo Garrachón Ruiz、Tomás de la Rosa、Daniel Borrajo，*Git-Assistant: Planning-Based Support for Updating Git Repositories*，[arXiv:2607.09224](https://arxiv.org/abs/2607.09224)，`cs.SE / cs.AI / cs.CL`，v1 提交于 2026-07-10，进入 2026-07-13 新批次。

**一句话 TL;DR**：Git-Assistant 把自然语言请求转成 PDDL goal，再由自动规划器生成可验证命令序列，显著减少脏工作树和分支关系引发的错误。

**为什么值得读**：`git` 操作会直接改写开发历史。LLM 逐条猜命令时容易漏掉 stash、误判 ahead/behind，甚至虚构参数。执行后的 local、remote 和 working tree 状态决定这类 agent 是否可靠。

**方法怎么工作**：Observer 先读取分支、工作树、remote 与 commit 关系。LLM-based baseline 直接生成命令；Hybrid-Planner 只让 LLM 把用户意图翻译成 PDDL goals，Fast Downward 用 A* 和 LM-cut 在手写 git domain 上求解动作序列。Executor 在用户确认后执行。作者构造手工 base environment 和由随机状态机生成的协作环境，每类设计 25 个请求，再各生成 4 个经人工核验的改写，总计 200 个 case；评分比较最终仓库状态，而非命令表面相似度。

**关键证据**：GPT-4o 实验中，base 环境的完全准确率为 81%，纯 LLM 只有 19%，vanilla 为 12%；错误率分别为 3%、78% 和 97%。随机环境更难，planner 仍有 59% 准确率，两个 baseline 为 16% 和 12%。在 base 环境，planner 对 merge、squash、commit 和 update/move 达到 100%，代价是规划时间从 16.2 秒增加到 31.3 秒。o4-mini 下 planner 仍领先，但 base 准确率降到 34%。

**局限和可信度**：PDDL domain 只覆盖作者选定的 git 功能，冲突统一采用 newest-commit 策略，回避了需要开发者判断的合并语义。环境和请求由作者合成，无法覆盖 submodule、LFS、worktree 和复杂 hook。planner 保证的是模型内计划有效，LLM 如果生成错误 goal，系统仍会可靠地做错事。

**与今日主题的关系**：这篇给出了工具型 agent 的清晰职责划分：语言模型负责语义映射，形式系统负责高风险状态变化。对构建、部署和迁移命令，同样可以采用这一结构。

### 13. Programmers Are Poor and Overconfident Judges：人类审查者也需要可执行辅助

**论文信息**：Zhanna Kaufman、Yuriy Brun、Adithya Murali、Madeline Endres，*Programmers Are Poor and Overconfident Judges of LLM-Generated Assertions*，[arXiv:2607.08885](https://arxiv.org/abs/2607.08885)，`cs.SE`，v1 提交于 2026-07-09，进入 2026-07-13 新批次。

**一句话 TL;DR**：86 名 Python 程序员能识别 73.9% 的正确 postcondition，却只能识别 49.0% 的错误 postcondition，低质量解释还会抬高信心。

**为什么值得读**：不少 agent 安全方案默认“生成断言或解释，再交给开发者确认”。如果开发者对看似合理的错误规格存在接受偏差，人类审批会变成橡皮图章。assertion 又常被当作后续测试生成和验证的 oracle，错误会沿整条链传播。

**方法怎么工作**：作者做预注册控制实验，让 86 名参与者判断函数 postcondition 的正确性与完整性，并操纵无解释、精确解释、错误解释、过度解释和欠充分解释五种条件。mixed-effects model 分析准确率、信心和响应时间。随后邀请 10 人完成 50 次 think-aloud 判断，编码他们如何建立程序心智模型、比较 clause 和寻找反例。图 1 与图 2 展示刺激材料，图 4 对比信心分布。

**关键证据**：参与者识别正确断言的准确率为 73.9%，识别错误断言只有 49.0%，OR=2.94，`p<0.001`。两类判断的自报信心都在 3.98 至 4.14/5，正确性与信心没有显著关系。欠充分解释相对精确解释把准确 odds 降到 0.58，同时让信心从无解释的 3.99 升到 4.25。自然语言解释整体没有提高准确率；检测错误断言成功时平均用 123 秒，错误接受只用 97.1 秒。

**局限和可信度**：任务是短 Python 函数与逻辑 postcondition，不是大型 PR review。参与者中专业程序员只有 7 人，think-aloud 样本也只有 10 人。断言来自既有 corpus，错误类型和复杂度可能影响结果。预注册设计、统计检验和质性复核提升了结论可信度。

**与今日主题的关系**：人类监督需要工具支持。mutation、counterexample search 和差分执行应当先把可疑规格暴露出来，再让审查者做判断；只附一段流畅解释可能让风险更隐蔽。

## 中相关论文速读

### SeedSmith：把 directed fuzzing 的语义准备工作交给 code-reading agent

[SeedSmith](https://arxiv.org/abs/2607.08949) 从目标 sink 反向探索代码，解析间接调用，提取触发 crash 的语义前置条件，再合成能满足这些条件的 seed。它不改下游 fuzzer，因此能作为 AFL++、AFLGo 等工具的前置层。在 Magma 上，几何平均 crash-time 加速为 11.51 至 14.66 倍；在 ARVO 上触发了 10 个项目中 16 个原先不可达的 bug。

它与 coding agent 的交集在“程序分析证据如何进入 agent workflow”。SeedSmith 仍以受控安全数据集和明确 sink 为前提，离通用 repository repair 有距离；但它证明 agent 适合承担传统 fuzzer 不擅长的跨函数语义准备，而变异与崩溃确认仍交给成熟执行器。值得保留的是这种模型与程序工具的边界，不必把它当成通用修复方案。

### Benchmarking LLMs on Repairing Qiskit Programs：领域 API repair 需要专门故障分布

[Bugs4Q](https://arxiv.org/abs/2607.09007) 研究 LLM 修复 Qiskit 量子程序，价值在于把 API 迁移、量子电路语义和领域约束放进 repair benchmark。通用 Python 测试可能只检查程序能运行，却漏掉电路结构、qubit 映射或测量语义。论文因此提醒我们，复杂工业平台上的 repair 不能照搬 SWE-bench 的 verifier。

这项工作适合作为 domain-specific repair 的背景。Qiskit bug 数量、任务来源与 oracle 范围限制了它对仓库级 agent 的解释力；如果方法主要依赖语言模型直接修补，也很难解释收益来自领域理解还是训练记忆。可保留的判断是：平台迁移和工业框架修复需要领域行为 oracle，语言级测试覆盖不了完整行为。

### Automating Just-In-Time Python Type Annotation Updating：运行时证据可以反哺演化中的类型契约

[JIT Python Type Annotation Updating](https://arxiv.org/abs/2607.09054) 关注程序执行过程中类型事实与源码 annotation 的偏差。它把 runtime observation 转换为更新建议，处理软件演化后注解陈旧的问题。对 coding agent，这类机制可以提供比静态猜测更可靠的 change intelligence：修改调用链后，系统能指出哪些类型契约已经失真。

它的边缘性来自任务范围。Python type annotation 只是众多跨位置同步修改中的一种，运行覆盖不足还会把“未观察到”误当成“不可能”。读这篇时应关注 observation、merge 与 update policy，而不要把运行时类型当作完整规格。若迁移到大型仓库，还需要处理测试分布、动态特性和公共 API 兼容。

### Multi-Agent LLM Collaboration for Unit Test Generation：多角色流程有用，但比较对象决定结论强度

[Multi-Agent LLM Collaboration for Unit Test Generation](https://arxiv.org/abs/2607.09101) 模仿人类测试团队，把分析、测试设计、生成与 review 分给不同 agent。它与 SCATE 的差别很清楚：前者靠角色分工改善测试，后者用覆盖和可测性信号学习何时采取动作。多 agent 可以增加候选与审查视角，却也会放大 token 成本和共享误解。

这篇值得看 workflow decomposition 和 review protocol。判断实验时要检查是否控制了总模型调用量、是否使用 mutation score，以及 baseline 是否拥有同等执行反馈。若只与单轮 prompt 比较，很难证明收益来自协作结构。对真实仓库，角色数量不如共享状态、失败归因和停止规则重要。

### Evaluating Semantic and Quality-Aware Retrieval for Source Code Repositories：检索相关不等于上下文可用

[这篇 retrieval 研究](https://arxiv.org/abs/2607.09161) 比较 source-code repository 中的 semantic 与 quality-aware retrieval。它处在 repository-level agent 的上游：定位器返回的文件会决定模型能否看到变更链、测试与配置。quality signal 试图过滤自动生成、低信息或结构不适合放入上下文的结果，这比只看 embedding 相似度更接近 agent 使用场景。

它仍属于组件评测。检索指标如果没有接到真实修复、跨文件同步或执行成功率上，就不能证明 agent 性能提升。读者应保留两点：检索器要区分语义相关与工程可用；评测需要 project-disjoint split，避免同仓库风格泄漏。暂时不必把某个排序模型当成完整 repository understanding。

### How Far Are We from Detecting Flaky Tests：代码文本里经常没有 flakiness 的决定性证据

[这篇 flaky-test 研究](https://arxiv.org/abs/2607.09345) 重新检查 code-based detector。作者构造 C-IDoFT，包含 57 个 GitHub 项目的 54,468 个测试，并用 project-disjoint protocol 消除原 benchmark 的标签捷径。两个 CodeBERT detector 在公开交叉验证设置中表现很高，分项目后却不优于常数 baseline。对 86 个同 commit 上既成功又失败的端到端测试，代码和 CI log 只能解释 42%，其余 58% 需要更多执行证据。

它与今日主线高度契合，但没有直接研究 coding agent，所以放在中相关。最值得保留的判断是：agent 不该从 test source 静态宣判 flaky，而应询问“这次失败是否可能受环境影响”，并收集重跑、时序、资源与依赖证据。论文也提醒 benchmark 设计者使用 project-disjoint split。

### Diversifying to Verify：同一语义目标可以选择更容易证明的实现结构

[Diversify2Verify](https://arxiv.org/abs/2607.09366) 为 73 个 Why3 任务生成数组、列表、递归和 imperative 等 292 个实现变体，再推断 representation-specific contract、运行测试并做 bounded annotation repair。初始验证 96 个 artifact，两轮修复后增至 154 个，artifact-level verification 从 32.9% 升到 52.7%；73 题中有 49 题至少一个变体验证成功。

它对 coding agent 的启发是：patch 搜索不必只优化“能否通过测试”，还可以优化“是否容易验证”。不过 benchmark 是小型算法任务，离多文件仓库和真实 API 约束较远。应保留 implementation diversity 与 verifier-guided selection 这个策略，同时警惕生成多个实现带来的成本，以及 contract inference 本身可能写错规格。

### Practical Source Code Recovery from Binary Functions：anchor 比自由生成更适合需要审计的恢复任务

[这篇 binary-to-source 工作](https://arxiv.org/abs/2607.09452) 用 Ghidra 提取字符串、常数、外部调用和函数名等 anchor，在源码数据库中检索候选文件与函数，再让 LLM 结合反汇编、decompiler 输出和 metadata 重排。高保真数据库上的 tcpdump 实验达到 95.2% assembly instruction coverage；换成噪声更大的 GitHub 数据库后，平均只有 35.5%，主要瓶颈是 retrieval miss。

它与软件维护的关系在 legacy recovery 和证据锚定。系统优先找真实源码，不让模型自由“还原”一个看似合理的版本，审计性更强。实验只围绕少量 binary 和数据库条件，不能外推到普遍闭源恢复。可保留 anchor-based retrieval 加 LLM reasoning 的组合，尤其适合迁移和历史重建。

### Malaika：软件分析结论需要领域、程序语义与外部知识三重落点

[Malaika](https://arxiv.org/abs/2607.09179) 用多 agent 分别承担 malware hypothesis、程序证据定位和 threat-knowledge attribution，并要求行为结论同时获得 domain、semantics 和 knowledge grounding。它在 Android malware 场景中强调可审计行为重建，而不是只给家族标签或一段安全解释。

这与复杂平台中的代码分析很接近：agent 应指出哪个函数、哪条数据流和哪项外部知识支持结论。论文摘要没有给出足够的样本数和绝对指标，结论强度要等完整实验复核；malware 分布也与一般软件变更不同。值得保留的是 tri-grounding 结构，可跳过具体安全排行榜。

### Shared Selective Persistent Memory：保存稳定约束，丢掉会过期的推理轨迹

[Shared Selective Persistent Memory](https://arxiv.org/abs/2607.09493) 只持久化 task specification、data schema、tool configuration 和 output constraint 四类信息，丢弃 session-specific reasoning。三个企业场景中，选择性记忆达到 96% task completion，无记忆为 79%，完整历史为 71%；zero-token refresh 让重复更新快 14 倍，summary-driven generation 相对 raw data injection 减少 97 倍 token。

这篇直接涉及 git-versioned artifact maintenance，却缺少多种 coding benchmark 与强对照，企业场景的任务构造也可能偏向作者系统。它与 GRACE 一起说明，memory 的重点是保留什么和如何更新，而不是无限累积 transcript。对 coding agent，可保留 schema、命令和验证约束；旧推理与一次性错误猜测应当有淘汰机制。

### Balancing Usefulness and Naturalness：code-review 数据清洗要防止“更整齐但更同质”

[CuREV 的后续工作](https://arxiv.org/abs/2607.09524) 用 LLM 重写嘈杂 code-review comment，再引入高质量 exemplar，只改写低质量样本，以保留真实写作风格与多样性。目标同时覆盖 comment generation 和 code refinement。它关心 review feedback 的数据质量，而不是 agent 执行过程，所以与主线保持一层距离。

论文页面带有与 arXiv:2502.03425 大量文本重叠的 admin note，阅读时应核对增量贡献。LLM 自己评质量、再按自己偏好的风格重写，可能制造循环偏差；下游自动指标也未必等价于 review usefulness。可保留“只修低质量样本、保留优质原文”的数据治理策略，不必把自然度提升直接等同于 code quality。

### CogniConsole：固定模型下，控制层也会改变失败率

[CogniConsole](https://arxiv.org/abs/2607.08774) 把 task framing、context selection 与 coordination 外置到结构化控制台。在 489 个 controllability probe 中，作者比较无结构到完整 scaffold 的交互，报告输出方差和失败率随结构增强而下降。它支持一个重要判断：不少 context drift 和 constraint violation 来自控制层欠规格，不全是模型能力不足。

这篇的实验是多步交互环境，不专门针对软件仓库，摘要也没有给出关键绝对下降幅度。它适合作为 harness 研究的理论背景。用于 coding agent 时，需要把 probe 换成 repo state、tool side effect 和 verifier signal，才能证明控制抽象对软件变更有效。

## 可留意 / 可跳过

- [Toward Inferring Accurate Context-free Grammars for Big Languages in a Black-box Setting](https://arxiv.org/abs/2607.08959)：可留意黑盒 grammar inference 与输入生成，对 fuzzing 有背景价值；不涉及 LLM coding agent，可跳过主体。
- [Loop-Based Slicing and Input-Driven Concretization](https://arxiv.org/abs/2607.08988)：保留 loop slicing 与 termination witness 两个关键词，适合程序分析工具箱；与 agent workflow 的连接较弱。
- [From Generic to Personalized: Persona-Aware Code Review Explanations](https://arxiv.org/abs/2607.08990)：保留“review 解释要适配读者”这一判断；它没有解决审查证据是否正确的问题。
- [Exploring the Potential of Program Flowcharts on Code Generation Using Multimodal LLMs](https://arxiv.org/abs/2607.09146)：flowchart 可能帮助局部程序理解，当前离真实仓库变更、执行验证和多文件同步较远。
- [Attention to Detail: vLLM Configurations](https://arxiv.org/abs/2607.09172)：适合部署侧选择能耗、性能与准确率配置；它研究 inference serving，不是 software-change agent。
- [How Do Software Professionals Evaluate AI-Generated Code?](https://arxiv.org/abs/2607.09434)：这是 registered report，计划访谈 20 至 50 名软件从业者，目前没有结果。保留研究问题，暂不据此下结论。
- [Toward Auditable AI Scientists](https://arxiv.org/abs/2607.09195)：hypothesis-test-evidence-belief protocol 对轨迹审计有启发，但实验在材料科学，不应直接外推到 coding agent。
- [TrustX Agent Risk Classification Framework](https://arxiv.org/abs/2607.09586)：包含 coding-assistant extension 和 12 维风险 rubric，现阶段主要是治理框架与示例，缺少实证验证。
- [VEXAIoT](https://arxiv.org/abs/2607.09653)：260 次受控攻击中报告 95.0% 成功率，说明 agent 可自动化 IoT 攻击链；环境只有 IoTGoat 与 Metasploitable，适合作为安全边界背景，不宜当作真实工业可靠性证据。

`cs.SE` 新列表中还出现了 *Shadow-Based Noise Fingerprinting of Simulated Quantum Noise Models*。它虽挂在该分类下，内容与软件变更、coding agent 或工程验证没有实质关系，本文排除。

## 横向比较

| 论文 | 核心问题 | 主要验证证据 | 工程可迁移性 | 可信度判断 |
|---|---|---|---|---|
| Failure as a Process | 失败何时形成并锁死 | 1,794 条轨迹、人工双标 | 高，适合在线监控设计 | 高，但只覆盖 Terminal-Bench |
| Long-Horizon-Terminal-Bench | 长任务如何计量部分进展 | 46 题、15 模型、稠密 reward | 高，适合复杂执行环境 | 中高，评分拆分含作者判断 |
| ReProAgent | issue 如何转成故障测试 | 两个 SWT-bench、执行消融 | 很高，可接 repair loop | 高，受 Python 数据集限制 |
| Bug Reports for Repair Agents | 哪类 issue 信息帮助修复 | 441 issue 回归、65 issue 消融 | 很高，可改 issue template | 中高，消融样本偏小 |
| SCATE | 如何监督 test agent | coverage、mutation、成本 | 高，可替换状态信号 | 中高，单语言单 benchmark |
| Property-Templates | 如何交叉核对证明与测试 | Lean 与 PySpark 双轨 | 中高，适合重复性质 | 高，模板范围有限 |
| Patchwork Problem | 如何找跨文件静默错误 | 仓库图 detector、外部扫描 | 很高，适合跨层变更 | 中，部分 detector 存在调参偏差 |
| SLBench | agent 是否遵守 skill 逻辑 | 86 个可执行 case、人工审计 | 很高，适合 instruction CI | 高，但案例规模有限 |
| Inside the Skill Market | skill 如何覆盖与被评估 | 11,497 个 SE skill | 高，适合生态与治理 | 中，缺少执行验证 |
| Better Harnesses | 能否把重复难点外置 | 7 任务、3 个 SLM 家族 | 中，稳定流程收益最大 | 中高，开放仓库任务偏弱 |
| GRACE | 指令如何长期演化 | 5 次复现、分布迁移 | 高，适合项目 context | 中，单领域且预算不齐 |
| Git-Assistant | 如何安全执行 git 状态变换 | 200 个合成 case、状态比对 | 中高，domain 可扩展 | 中，真实冲突被简化 |
| Programmer Judgment | 人类能否识别错误规格 | 86 人控制实验、think-aloud | 高，影响 human review | 高，任务规模较小 |

## 我的判断

**创新性：A-。** 今天没有一篇工作单独解决 repository-level reliability，但几篇论文把过去模糊的概念变成了可测对象：失败锁死时刻、skill logical relation、结构一致性图、长期 instruction delta 和 agent-ready issue information。问题定义比再造一个 patch leaderboard更有价值。

**实用价值：A。** ReProAgent、SLBench、Patchwork verifier 和 Git-Assistant 都能嵌入现有工程链。最直接的组合是：issue 模板提供定位与修复方向，reproduction agent 生成 fail-to-pass test，coding agent 每次关键假设后运行局部检查，提交前再跑 repository invariant detector。

**严谨性：B+。** 轨迹研究的双人标注、bug-report 消融、SCATE 的统计检验和 GRACE 的五次复现都提高了可信度。主要不确定性来自合成环境、单语言 benchmark、LLM-as-judge 和较新的闭源模型版本。部分论文的绝对数值很强，外部泛化仍需真实工业仓库验证。

**与 Reliable Coding Agents for Real-World Software Change and Evolution 的相关度：A+。** 这一天覆盖了任务入口、仓库定位、执行反馈、跨文件一致性、agent 控制面和人类审查六个环节。OpenHarmony/HarmonyOS 这类复杂平台可以把这些环节放进同一场景：用编译、设备运行、UI 行为、资源图和跨模块依赖共同验证修改，并记录错误信念从出现到被发现的距离。

我对“这些方法已经能在工业仓库稳定工作”的判断仍然保守。今天最可靠的结论是研究议程层面的：coding agent 的下一轮进步需要更早的证据、更窄的状态变换边界，以及对 instructions、skills 和 harness 自身的持续测试。
