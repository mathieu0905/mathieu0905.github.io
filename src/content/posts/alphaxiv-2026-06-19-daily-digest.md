---
title: "6 月 19 日这批 arXiv 在逼近一个现实问题：Coding Agent 到底怎样才算可靠？"
date: "2026-06-19"
description: "2026-06-19 的相关论文集中讨论仓库级指导、长回合编码、agent harness 安全、多 agent 协调、复杂构建验证与系统软件安全评测。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "软件演化"]
series: "alphaXiv论文解读"
coverColor: "from-emerald-500 to-cyan-600"
---

# 6 月 19 日这批 arXiv 在逼近一个现实问题：Coding Agent 到底怎样才算可靠？

先把日期说清楚。今天是 2026-06-22，但 arXiv `cs/new` 当下最新一批新刊实际显示为 `Friday, 19 June 2026`。也就是说，这次 digest 按 arXiv 官方新刊节奏，解读的是 2026-06-19 这一批，而不是自然日意义上的 2026-06-21。这个区分很重要，因为周末没有新的 cs daily listing，若按自然日硬写，反而容易编出不存在的“前一天新论文”。

这批论文值得读，不是因为出了某一个压倒性的 SOTA，而是因为很多工作在同时碰同一个硬问题：**LLM coding agent 进入真实仓库、真实测试、真实权限边界以后，评价标准不能再只是“最后 patch 过没过”，而必须往前追问它是否找对了文件、是否理解了仓库惯例、是否在长回合中维持一致、是否知道自己什么时候该停、是否能在复杂构建环境里得到可信反馈。**

如果把昨天这些论文放在一条线上看，会发现主线很集中。第一类工作在研究**仓库级上下文和 repository guidance** 到底能不能真正帮助 agent。第二类在研究**长回合、多步骤、多 agent 协作** 时，失败是怎么累积出来的。第三类在处理**安全边界和 harness 设计**，也就是 agent 不该做什么、什么时候不能升级权限、什么时候不能直接把“会动”当成“安全”。第四类则在逼问**评估协议本身是否可信**，尤其是时间泄漏、基准过拟合、测试 oracle 错觉这些问题。

下面的解读基于 arXiv 官方页面元数据与本地下载 PDF 文本。强相关论文都已下载并抽取正文，不只依赖摘要。

## 今日脉络

昨天真正和“Reliable Coding Agents for Real-World Software Change and Evolution”这条线实质相关的论文，大致可以分成四组。

第一组是**仓库级 operational knowledge**。最典型的是 *Probe-and-Refine Tuning of Repository Guidance for Coding Agents*。它不讨论模型再训练，而是讨论仓库里的 `AGENTS.md`、运行测试的方法、子系统边界、常见误修路径这些“人类老开发者脑子里知道、代码里却没有”的隐性知识，能否被系统化地调优成真正帮助 agent 的 guidance。这个问题对 repository-level agent 非常关键，因为真实失败经常不是不会写代码，而是从第一步就走错目录、跑错测试、理解错局部约定。

第二组是**长程过程可靠性**。*StaminaBench* 和 *Before the Pull Request* 都属于这一类，但关注点不同。前者研究 agent 连续工作 100 轮会怎样崩，后者研究多个 agent 在真正打开 PR 之前如何相互踩踏、重复劳动、发生 race condition。这两篇合起来实际上在说同一句话：coding agent 的问题不是只看单题 pass/fail，而是要看它能否在 evolving workspace 中维持过程质量。

第三组是**agent harness 与安全边界**。*AgentArmor*、*Phoenix*、*When Lower Privileges Suffice* 这几篇都在讨论同一个现实：很多灾难不是模型不会写 patch，而是 harness 设计把它推到了错误的权限边界、错误的 fallback 策略或错误的执行路径上。这里的关键词不是“alignment”这种大词，而是很工程化的东西：baseline-aware test evaluation、least privilege、三振停止、deterministic guardrail、planner/reproducer/tester 的职责切分。

第四组是**复杂环境反馈与评估可信度**。*Library-Aware Doubles and Iterative Repair* 把视角放在固件代码的复杂构建/测试环境里，说明生成测试本身就要面对依赖、链接、stub、fake 和 line coverage 这些硬约束。*Calibration Without Comprehension* 则从系统软件漏洞检测切入，提醒我们即便模型在 benchmark 上“有分”，也可能根本没有学到安全推理，只是在调输出分布。

把这四组连起来，昨天这批论文传递出的判断其实很清楚：**coding agent 可靠性不再是模型层的单点问题，而是仓库知识、过程控制、执行边界、测试反馈和评估协议共同构成的系统问题。**

## 强相关论文深读

### 1. Probe-and-Refine Tuning of Repository Guidance for Coding Agents

**论文信息**：*Probe-and-Refine Tuning of Repository Guidance for Coding Agents*  
**作者**：Harry Degroot, Alex Vasilopoulos, Yuntian Deng  
**arXiv**：[2606.20512](https://arxiv.org/abs/2606.20512)  
**分类**：cs.SE, cs.LG  
**发布日期**：2026-06-19

**一句话 TL;DR**：这篇论文证明了 repository guidance 不是“有没有”在起作用，而是“怎么生成、怎么诊断、怎么迭代修正”在起作用；调好的仓库指导能明显提升 agent 的 solve coverage，但并不直接提高单个 patch 的精度。

#### 为什么这个问题重要

做真实仓库级 coding agent 时，最常见的一类失败不是模型不会写一段局部代码，而是它对仓库的 operational knowledge 一无所知。哪个目录才是责任边界，哪个测试最小且最相关，某个 bug 历史上常常误改到什么模块，repo 里哪些辅助脚本才是正确入口，这些信息往往不在类型系统里，也不在函数签名里。人类维护者靠长期经验记住这些“仓库习惯”，agent 则只能靠 trial-and-error 在昂贵的 step budget 里慢慢摸。

因此，问题并不是“给 agent 一份 `AGENTS.md` 会不会更好”这么简单，而是：**仓库指导文件能否像 prompt 一样被系统调优，且这种调优是否真正改变了 agent 在真实 bug-fix 任务中的轨迹？**

#### 方法怎么工作

这篇论文的方法不是训练一个新 agent，而是训练仓库指导的生成流程。核心 pipeline 可以分成四步。

第一步，先为每个 repository 生成一个初始的 `static_kb`，相当于一份静态仓库知识文件。它来自 pinned commit 的代码快照，而不是根据具体 SWE-bench 实例临时写。

第二步，系统为该仓库自动生成一批 synthetic bug-fix probes。这里的 probe 不是正式 benchmark 任务，而是用于“试探 guidance 是否会把 agent 引向正确工作流”的诊断题。论文图 1 展示了完整闭环：生成 probe、让固定 coding agent 尝试修复、根据 expected behavior 判断成败、再把失败模式汇总成 guidance edits。

第三步，把多个 probe 失败轨迹聚合成 repository-specific edits。论文图 2 给出的例子很有代表性：原来模糊的规则“先做 targeted reads”会被改成更具体的 repo navigation 指令；“先跑最小相关测试”会被改成明确到 test class / method 的执行建议。这说明 refinement 不是简单扩写字数，而是在把泛化建议压实为 repo-specific operational heuristics。

第四步，用 refined guidance 替换原始 static KB，再把同一份 guidance 用到该仓库下所有 SWE-bench Verified 实例。值得注意的是，refinement 阶段完全不接触正式 evaluation instances，避免了直接用测试集调 prompt 的污染。

#### 关键实验与证据

实验主设置是在 SWE-bench Verified 500 个实例上、4 个独立 trial、200 agent steps。对比三组条件：无 guidance、静态 guidance、probe-refined guidance。

最关键的数字有三个。

第一，**resolve rate 从 25.5%（no context）提升到 28.3%（static KB），再提升到 33.0%（probe-refined）**。而且 `probe-refined > static > no-context` 的顺序在 4/4 次 trial 中都成立，关键对比的 mixed-effects logistic regression 都是 `p < 0.001`。

第二，提升主要来自 **coverage 而不是 precision**。论文明确写到 refined guidance 会让 agent 产出可评估 patch 的实例比例多出 **14.5 个百分点**，但 **per-patch precision 基本维持在约 59%**，差异不显著（`p = 0.119`）。这很重要，因为它说明 guidance 的作用更像“把 agent 送到更可能正确的文件/测试/工作流”，而不是直接让它写出更精细的改动。

第三，refinement 后的 guidance 平均比 static KB 长 **63%**，从平均 **1,687 字符**增长到 **2,754 字符**。这既是一个结果，也是一个潜在混杂项：性能变好到底因为内容更对，还是因为 prompt 更长？论文在 limitations 里坦率承认这点没有被完全剥离。

#### 局限和可信度

这篇论文最值得肯定的是它对局限写得比较老实。

第一，实验虽然有 4 个独立 trial，但低 step budget 的扩展实验只是单次运行，方差刻画不足。第二，refined guidance 比 static guidance 长很多，存在 length confound。第三，它的单文件 guidance 设计本身就共享了一个假设：仓库 operational knowledge 可以被压缩到一个几千字符的 artifact 中，这对中大型 repo 未必总成立。第四，评测对象仍然是 SWE-bench Verified 的 Python 仓库，对其他语言、尤其是复杂工业平台和怪异构建系统的迁移还没有证据。

不过它最强的一点也正在这里：它没有声称“guide makes model smarter”，而是把机制说得很窄很清楚。**guidance 主要改善定位与流程选择，不直接改善 patch precision。** 这比很多只报最终 pass rate 的论文更有研究价值。

#### 与当天主题的关系

这篇论文直接支撑了“仓库级任务不是单靠大模型上下文窗口就能解决”的主线。真正重要的是，仓库知识要被结构化、诊断化、可迭代改写。对真实软件变更工程来说，这比再多一个“会写代码”的模型更接近问题本身。

---

### 2. StaminaBench: Stress-Testing Coding Agents over 100 Interaction Turns

**论文信息**：*StaminaBench: Stress-Testing Coding Agents over 100 Interaction Turns*  
**作者**：Miloš Lajh, Matej Letovský, Antonín Komenda, David M. Píchal, Jan Kocián  
**arXiv**：[2606.19613](https://arxiv.org/abs/2606.19613)  
**分类**：cs.SE, cs.AI  
**发布日期**：2026-06-19

**一句话 TL;DR**：StaminaBench 不是再测一个“单题能不能过”的 coding benchmark，而是问 agent 在连续 100 次需求变更后还能不能维持工程一致性；结果显示，不带充分测试反馈的 agent 基本在 5-6 回合内就会崩。

#### 为什么这个问题重要

现实中的 coding agent 使用方式很少是“一次性给你一道题”。更常见的是用户先让它搭一个基础功能，再连续加条件、改接口、修边角、补异常处理、做局部重构。也就是说，agent 面对的不是孤立 task，而是**持续演化中的 workspace**。如果 benchmark 只测单轮任务，它衡量的更像一次性代码生成，而不是 software change engineering。

StaminaBench 把“多轮连续改动”这个长期被忽略的维度，单独提升成 benchmark 的一等公民。这和真实仓库演化、真实协作式开发更接近。

#### 方法怎么工作

论文先抽象出一个通用的多轮 benchmark 框架：有一个 reference system 按已知规则演化，agent system 需要在每一轮根据自然语言变化追上 reference state，测试函数在每轮结束时判断两者是否一致。

在 coding 场景下，它把这个框架落到一个可程序化生成的 REST API server。核心流程至少包括三步。

第一，随机采样一个 OpenAPI-like 初始 schema，agent 先根据 spec 生成 `server.py`。第二，每一轮系统生成一个 follow-up change request，对 reference implementation 做合法演化，同时给 agent 一个自然语言变更描述。第三，用黑盒 HTTP 测试套件去比对 agent 当前系统和 reference state 是否一致；如果失败，可以把测试反馈回传给 agent 重试若干次。

这里有两个设计很关键。其一，测试完全程序化生成，**不依赖 LLM judge**，因此 reproducibility 强很多。其二，agent 与 server 都运行在隔离环境，通过 HTTP 和 benchmark 通讯，这使它天然具备语言无关性和黑盒验证属性。

#### 关键实验与证据

实验覆盖 6 个 agent harness、7 个开源或开放权重模型、20 个 100-turn 场景。

最扎眼的结果是：**在没有反馈循环时，所有测试 agent 都在大约 5-6 轮之内失败。** 这不是个小问题，而是说明当前很多“vibe coding”式 agent 还没有稳定维护 evolving codebase 的能力。

更具体地看，Table 2 显示在 `R = 0` 无重试条件下，多数组合平均通过回合数连 10 都到不了。加上反馈与重试后，情况会显著改善。论文摘要概括为：**把测试反馈回传并允许 retry，平均通过回合数最多可提升 12 倍。**

但反馈不是万能药。Table 3 也显示，即便在 `R = 2` 下，harness 差异仍然非常大，强模型在最好和最差 harness 间能拉出 **最高约 6 倍差距**。这说明“模型能力”与“agent scaffold”不是可互相替代的，harness 设计本身就是性能变量。

另一个值得保留的数字是成本。论文在 limitations 中指出，一次完整 full-grid sweep 的 token 成本极高，例如某些组合单个 20-scenario sweep 就要消耗 **45 亿输入 token** 量级。换句话说，这种 benchmark 非常接近真实长程工作负载，但也因此极其昂贵。

#### 局限和可信度

StaminaBench 的优点是问题定义很扎实，缺点也几乎都来自这个定义。

第一，它测的是一个特定任务族，即 REST API server 演化，不能直接外推到 GUI app、compiler、firmware 或移动平台。第二，程序化 change sampler 虽然保证了可重复性，但自然性和真实开发者提出的杂乱需求之间仍有差距。第三，多轮 benchmark 极贵，导致很多实验格点无法像单轮 benchmark 那样做海量重复。

不过这些局限并不削弱它的核心结论：**coding agent 的“耐力”是一个独立于单题能力的维度，而且当前系统在这条维度上明显偏弱。**

#### 与当天主题的关系

这篇论文把“软件演化时代的 agent 可靠性”从一句口号变成了可测的 benchmark 目标。它直接挑战了当前大量只用单步任务评估 coding agent 的做法，也解释了为什么很多看起来强的 agent 一旦进入长 session 就会静默积累错误。

---

### 3. AgentArmor: A Framework, Evaluation, & Mitigation of Coding Agent Failures

**论文信息**：*AgentArmor: A Framework, Evaluation, & Mitigation of Coding Agent Failures*  
**作者**：Ari Holtzman, Jared Kaplan, Milan Aggarwal, Zico Kolter, Dan Hendrycks 等  
**arXiv**：[2606.19380](https://arxiv.org/abs/2606.19380)  
**分类**：cs.SE, cs.LG  
**发布日期**：2026-06-19

**一句话 TL;DR**：AgentArmor 的核心贡献不是再做一个更强 coding agent，而是把 destructive coding-agent failure 分成 underspecification、capability error 和 harness error 三类，并用 agent harness 级改造去降低这些失败。

#### 为什么这个问题重要

真实开发环境里，coding agent 出错的方式往往不是 benchmark 上那种“没把题做出来”，而是“做了一个会伤人的动作”。例如在部署环境中执行了不该执行的命令、在上下文错乱后继续推进危险更改、在明明有 safer action 的情况下走了默认危险路径。随着 coding agent 从 code completion 进入 editing、deployment、monitoring 闭环，这类 failure 的成本会越来越高。

关键点在于：这些失败并不都来自模型本身。有些是任务说明不充分，有些是模型能力不足，还有些纯粹是 harness 没把安全动作变成默认路径。因此只盯模型层面会看错问题。

#### 方法怎么工作

论文先定义三类 failure mechanism。

第一类是 **underspecification**：safe action 存在，但默认系统提示或指令没有把它变成优先策略。第二类是 **capability error**：safe action 明明可用，模型却因为偏置或能力限制没选它。第三类是 **agent harness error**：模型知道该怎么做，但 harness 没能让它顺利执行。

然后作者基于真实部署故障灵感构造 8 类评估情境，覆盖 **20 个 coding environments** 和 **59 个 synthetic transcript templates**。这套评估本身就有价值，因为它把平时口头流传的“agent 翻车案例”变成了可重复压力测试。

在 mitigation 端，AgentArmor 不是一个新模型，而是一组 harness 改造，至少包括五块：扩展系统提示、独立 command classifier、`3 strikes` policy、deterministic guardrails，以及让 agent 能编辑自身上下文的工具。可以把它理解成“把安全默认值前移到 harness”。

#### 关键实验与证据

实验使用 Claude Opus 4.6、GPT 5.4、Gemini 3.1 Pro 三个模型，在各自支持的 tool-calling agent harness 上运行。

摘要层面的主结论是：**加入 AgentArmor 后，在统计显著意义上更安全。** 论文没有把自己包装成“完全消除风险”，而是强调 harness 级增强确实能降低多个 failure mode 的发生率。

更重要的不是某个单一分数，而是分析框架本身。作者指出很多灾难性失误并不是同一种病：有些应该靠更具体的系统 prompt 修，有些要靠 rule-based classifier 拦，有些必须靠停止策略与 deterministic policy 限制。这个拆解避免了一个常见误区：凡是 agent 出错就归因为“模型不够 aligned”。

#### 局限和可信度

这篇论文的问题定义非常强，但结果展示相对更偏系统安全论文风格，而不是大规模 SWE benchmark 风格。它的限制包括：场景由作者手工设计，代表性取决于 failure taxonomy 是否覆盖现实世界；评估高度依赖 synthetic transcript templates；论文证明的是“更安全”，不是“依然保持同等任务效能下更安全”。

即便如此，我认为它的可信度仍然不错，因为它没有试图夸大 generality。它更像一篇给工业 agent harness 设计者看的经验-机制论文，而不是一篇 leaderboard 论文。

#### 与当天主题的关系

这篇论文支撑了一个很重要的主线：**agent reliability 很多时候是 harness property，而不是纯模型 property。** 对真实软件变更工程尤其如此，因为 destructive action、权限调用和长上下文误导都发生在 harness 与环境边界上。

---

### 4. Phoenix: Safe GitHub Issue Resolution via Multi-Agent LLMs

**论文信息**：*Phoenix: Safe GitHub Issue Resolution via Multi-Agent LLMs*  
**作者**：Kipngeno Koech, Nathan Aw, Andrei Dan, Alex Vasilopoulos 等  
**arXiv**：[2606.20243](https://arxiv.org/abs/2606.20243)  
**分类**：cs.SE, cs.MA  
**发布日期**：2026-06-19

**一句话 TL;DR**：Phoenix 试图把“自动处理 GitHub issue”做成一个 production-style pipeline，重点不是 solve rate 本身，而是 baseline-aware test evaluation、分工明确的多 agent state machine，以及一套围绕真实 webhook 部署失败总结出的安全控制。

#### 为什么这个问题重要

很多 issue-resolution agent 的论文都停在离线 benchmark。真正要把 agent 接到 GitHub webhook、让它收 issue、起分支、跑测试、开 PR，问题会立刻变成工程问题：认证会过期、WAF 会挡请求、权限边界不对、CI 会抖动、现有测试就不稳定。只看离线 fix accuracy，根本看不到这些 failure。

Phoenix 的价值正在于它把“从 triage 到 PR”这条线拉到了一个更接近 production automation 的层级。

#### 方法怎么工作

系统由六个专门角色组成：planner、reproducer、coder、tester、failure analyst、PR agent。它们通过 label-based GitHub webhook state machine 串起来，而不是在一个大 prompt 里混成一团。

核心流程至少有三步。

第一，planner 和 reproducer 负责理解 issue、定位问题、建立最初复现路径。第二，coder 与 tester 在 baseline-aware testing 框架下工作：不是简单跑测试，而是把变更后的测试结果和 baseline test run 做对比，防止把本来就 flaky 或本来就 failing 的 repo 误判成自己修坏了。第三，failure analyst 和 PR agent 负责判断这次尝试是否该收敛、是否应开 PR、如何写出足够可审计的结果。

这种切分的好处是：安全控制可以绑定到具体角色与状态，而不是作为全局大词存在。

#### 关键实验与证据

论文给了两组最重要的数字。

第一，在 production webhook path 上跑 **24 个 SWE-bench Lite 实例** 时，Phoenix 的 **oracle-resolve rate 为 75%**，并且成功样本里没有 pass-to-pass regressions。作者也明确提醒，这个 slice 不是 full split leaderboard，不能简单横比。

第二，在 **14 个 repository 的 42 个真实 issue** 试验中，它实现了 **100% correctness preservation**，hard tier 平均耗时 **122 秒**。这个指标很有意思，因为它更像工程系统该报的数字：不是“我解决了多少”，而是“我至少没有把正确性变坏”。

但论文并没有只报好消息。作者手工检查发现，最终 PR 里**大约只有一半是 well-targeted fix**，另一半会把代码落到错误路径上，主要是 planner localization 还不够稳。这种不遮掩失败的态度反而提升了可信度。

#### 局限和可信度

Phoenix 的局限同样很明确。24 个 SWE-bench Lite 样本太小，42 个真实 issue 也更像 pilot 而不是成熟大样本。其次，`correctness preservation` 很重要，但不等于真正解决率。再者，约一半 PR path placement 仍不理想，说明 retrieval/localization 还是瓶颈。

不过它有一个别的论文很少给出的强点：作者把 **WAF filtering、token expiry、permission boundaries、flaky CI** 这些部署故障直接纳入 paper narrative。对真正想做 GitHub automation 的研究者来说，这比再报一个脱离环境的 benchmark 分数更有价值。

#### 与当天主题的关系

Phoenix 强调了一个现实：**仓库级 agent 的关键不是“会不会修”，而是“修的过程能不能在真实平台边界内被安全组织起来”。** 这恰好对应用户画像里关于“理解、修改、验证和组织软件变更”的后三个动词。

---

### 5. Before the Pull Request: Mining Multi-Agent Coordination

**论文信息**：*Before the Pull Request: Mining Multi-Agent Coordination*  
**作者**：Donald Pinckney, Ajeet Khatri, Maxime Heckel 等  
**arXiv**：[2606.19616](https://arxiv.org/abs/2606.19616)  
**分类**：cs.SE, cs.AI, cs.MA  
**发布日期**：2026-06-19

**一句话 TL;DR**：这篇论文的核心观点是，多 agent coding system 的很多失败并不出现在 PR 结果上，而出现在 PR 之前的 claim、碰撞、等待和重复发现过程里；如果不记录这些 pre-PR coordination 信号，你就看不见真正的过程质量。

#### 为什么这个问题重要

目前很多关于 agent 协作的观测都停留在 PR 层：提交速度、被接受概率、回滚比例之类。但真实多 agent 环境下，更致命的问题常发生在更早阶段：两个 agent 同时认领同一块工作、一个 agent 长时间持锁、多个 agent 重复探索同一文件、race condition 让状态记录丢失。这些问题在最终 PR 历史中往往不可见。

如果研究目标是“Agent 时代的软件组织方式”，那 pre-PR coordination 本身就是研究对象，而不是结果的噪声。

#### 方法怎么工作

作者提出一个叫 `grite` 的 coordination substrate，核心设计是：**不依赖中心服务器，而把协调事件直接写进 git 内部的 append-only、signed event log**。

这件事至少解决三类问题。

第一，它让每个 agent 的 claim、release、conflict、merge 等动作有统一的可挖掘记录。第二，因为底层是可复制的日志，而不是脆弱的文件 tracker，可以在并发写入下保持收敛。第三，日志本身就是 mining artifact，可以反推出冲突模式。

换句话说，这篇论文不是在做另一个协作 prompt，而是在做**协作过程的 observability substrate**。

#### 关键实验与证据

最关键的数字非常直观：引入共享协调 substrate 后，**“纯粹重做别人任务”的工作占比从 78% 降到 0%**，同时 **useful throughput 超过三倍**。这是个相当强的结果，因为它说明多 agent 的浪费并不是小修小补，而是可以吞掉大部分劳动。

论文还报告每个 agent 的日志副本都会**收敛到同一状态**，而基于普通文件的 tracker 会出现并发写入丢失。更进一步，作者可以从日志中自动恢复出 **conflicting edits、lock starvation、redundant rediscovery、race-to-close** 这类 failure mode，而且这些失败很多在 PR 历史里根本看不见。

#### 局限和可信度

这篇论文最可能被质疑的地方，是它把相当一部分改进归因于新的协调 substrate，因此实验的公平 baseline 设计很关键。另一个问题是，日志写入和协议维护本身也有成本，论文虽说 overhead bounded，但对超大规模 agent swarm 的扩展性还需要更多数据。

不过我认为它的贡献不在于宣称“我们解决了协作”，而在于提醒大家：**如果你的 agent system 连 pre-PR coordination trace 都没有，那你根本无法研究过程失败。**

#### 与当天主题的关系

它和用户方向里的 `software change intelligence` 非常贴近。真正的 change intelligence 不只是分析 patch 本身，还要分析 patch 之前变更是如何被认领、定位、冲突、放弃和重试的。

---

### 6. Beyond the GUI Paradigm: Do Mobile Agents Need the Phone Screen?

**论文信息**：*Beyond the GUI Paradigm: Do Mobile Agents Need the Phone Screen?*  
**作者**：Jinseok Chung, Minkyoung Song, Hyunji Jung, Namhoon Lee  
**arXiv**：[2606.19388](https://arxiv.org/abs/2606.19388)  
**分类**：cs.SE, cs.CL, cs.HC  
**发布日期**：2026-06-19

**一句话 TL;DR**：这篇论文真正提出的不是“CLI 比 GUI 强”这么简单，而是：对于复杂移动任务，屏幕交互只是 interface 的一种；如果平台暴露了 CLI，agent 应该被允许使用更接近系统状态的操作面。

#### 为什么这个问题重要

把 OpenHarmony/HarmonyOS 视为高价值测试场景时，一个核心原因就在这里：复杂工业平台往往不只是一个屏幕，而是同时包含文件系统、命令行、包管理、后台服务、权限状态、跨 app 数据。若 agent 只能通过 GUI screenshot 和 click 工作，它看到的是最表层的交互层，很多高价值操作根本不在这一层。

所以这篇论文虽然表面上是 mobile agent，但实质上讨论的是**agent 应否接近系统真实控制面**。这和 repository-level coding agent 可以直接读文件、跑命令、查进程而不是只看网页，是同一种设计选择。

#### 方法怎么工作

作者把 mobile agent 分成 GUI paradigm 和 CLI paradigm 两类来比较。CLI agent 可以直接访问 device services/data，GUI agent 则只看屏幕并发出交互。

实验分两部分。第一部分是在 AndroidWorld 和 MobileWorld 上，对比三种 coding-agent style 系统和三个可复现 GUI baseline。第二部分是自己构建 `CLI-Advantage Task Suite`，覆盖 bulk operations、multi-condition filtering、aggregation、cross-app workflows、hidden device state 五类日常任务。

这里最重要的方法论选择是：作者不只测“标准 benchmark 能不能过”，还专门构建一批**GUI 自然吃亏、CLI 自然占优** 的任务模板。这避免了评测只服务于旧范式。

#### 关键实验与证据

数字非常直接。Claude Code (Opus 4.7) 在 AndroidWorld / MobileWorld 上达到 **71.8% / 51.9%**，都超过可复现 GUI baseline。oracle CLI 解的上限更高，达到 **88.8% / 86.3%**，说明空间还很大。

更有说服力的是 CLI-Advantage Suite：**所有 CLI agent 在五类任务上都优于所有 GUI baseline，而且平均步骤数只有 10.7，而 GUI baseline 要 18.6。** 这说明 CLI 不是只在极个别任务上取巧，而是在一类“需要系统状态与批处理能力”的任务上系统性更合适。

#### 局限和可信度

它的限制同样明显。首先，这不是一个“纯苹果对苹果”的设定，CLI 能力本来就比 GUI richer；因此论文更像是在证明 interface choice matters，而不是单纯比较推理能力。其次，AndroidWorld/MobileWorld 对真实用户任务覆盖有限，离工业级移动平台仍有距离。第三，CLI agent 天然带来更高权限与更高破坏能力，这一点论文强调得不够多。

但它给出的工程含义非常清楚：**当任务本质上依赖系统状态、批量操作、隐藏元数据和跨应用数据流时，只让 agent 看屏幕是主动把它绑在低带宽接口上。**

#### 与当天主题的关系

这篇论文对用户关注的 OpenHarmony/HarmonyOS 场景尤其值得保留。它提醒我们，不应把复杂平台上的智能软件工程任务窄化成 GUI automation，而要从更接近系统控制面的接口设计 agent workflow。

---

### 7. Library-Aware Doubles and Iterative Repair for Large Language Model-Generated Unit Tests in OpenSIL Firmware

**论文信息**：*Library-Aware Doubles and Iterative Repair for Large Language Model-Generated Unit Tests in OpenSIL Firmware*  
**作者**：多位 AMD/openSIL 相关作者  
**arXiv**：[2606.19725](https://arxiv.org/abs/2606.19725)  
**分类**：cs.SE, cs.AI, cs.MA  
**发布日期**：2026-06-19

**一句话 TL;DR**：这篇论文说明，在复杂构建环境里，测试生成的主要难点不是“写出断言”，而是能否让测试在真实工具链中编过、链过、跑起来；LLM workflow 必须正面处理 doubles、依赖和编译修复。

#### 为什么这个问题重要

很多 coding agent 论文把“测试反馈”讲得很轻，好像有个 `pytest` 就够了。但真实工业环境里，尤其是固件、系统软件、嵌入式代码，测试本身就很难搭起来。函数可能依赖特殊头文件、链接脚本、硬件抽象层、复杂 mock/stub/fake、专门构建系统。这里的瓶颈不是让模型猜一个 assert，而是让生成物进入真实 build/test loop。

这和用户研究方向中的“复杂构建/测试/运行环境反馈”高度一致。

#### 方法怎么工作

论文针对 AMD 的 openSIL 固件代码库，设计了一个多 agent UT authoring workflow。关键步骤至少有三层。

第一，自动生成 test scaffold，包括必要的测试框架文件、JSON 输入、INF 配置等。第二，做 **library-aware doubles** 生成与复用，也就是识别哪些依赖需要 deep doubles、哪些只要 shallow stub/mock/fake。第三，进入 **iterative compile-dispatch repair loop**：让测试在真实构建系统里编译、链接、调度执行，再把 build log 与 line coverage 回传给 LLM 继续修。

这里最有意思的是它把 line coverage guidance 放进闭环，而不是只把编译错误当反馈。也就是说，系统不仅追求“能跑”，还追求“跑到更多有效代码”。

#### 关键实验与证据

结果很扎实。总共 **76 个 functions under test** 中，有 **73 个最终生成了可编译的单测**。在不使用 coverage guidance 或 retrieval augmentation 时，平均 line coverage 是 **73.9%**。在一个 **48-function 子集** 上，仅用 line-coverage guidance 就能把平均 coverage 拉到 **98.8%**；加入 vector-database retrieval 后是 **94.7%**。

这组数字有两个解读。其一，复杂环境下 buildability 的确可以通过 structured repair loop 大幅提高。其二，retrieval 并不必然比更直接的 coverage feedback 更有效，至少在这套设定里，`LCA-only` 反而优于 `LCA+VDB`。这说明“多加知识库”不一定是免费午餐。

#### 局限和可信度

论文也写得很明白：compile success、dispatch success、line coverage 都只是 proxy，不代表语义正确或测试 oracle 强。换句话说，**高 coverage 不等于好测试**。此外，实验只针对 AMD openSIL 和 EDK II，外部可迁移性有限。

但即便如此，这篇论文的重要性依然很高，因为它正面展示了一个常被忽略的事实：**在复杂软件环境里，验证闭环本身就是要被工程化的对象。**

#### 与当天主题的关系

它直接支撑“执行反馈”“构建环境反馈”“复杂工业平台测试场景”的主线。相比那些只在干净 Python repo 上跑单测的论文，这篇更接近真实复杂平台的 friction。

---

### 8. Calibration Without Comprehension: Diagnosing the Limits of Fine-Tuning LLMs for Vulnerability Detection in Systems Software

**论文信息**：*Calibration Without Comprehension: Diagnosing the Limits of Fine-Tuning LLMs for Vulnerability Detection in Systems Software*  
**作者**：若干系统安全/SE 研究者  
**arXiv**：[2606.20502](https://arxiv.org/abs/2606.20502)  
**分类**：cs.CR, cs.AI, cs.SE  
**发布日期**：2026-06-19

**一句话 TL;DR**：这篇论文最重要的结论不是“某个模型不行”，而是 fine-tuning 在系统软件漏洞检测上很可能只是在校准输出阈值，而没有形成真正的安全理解。

#### 为什么这个问题重要

如果研究 coding agent 的安全验证，漏洞检测和安全 triage 是无法绕开的子问题。但这个方向一个长期疑问是：模型在 benchmark 上拿到的分，到底来自真实安全推理，还是来自污染数据、模板记忆和分类倾向？

这篇论文的价值在于，它没有再做一个“我们调了个模型，分数更高”的工作，而是反过来检查这种提升是否只是表面校准。

#### 方法怎么工作

作者构建了一个名为 **CWE-Trace** 的框架，基于 Linux kernel 样本，强调三个设计点。

第一，数据是 **834 个手工整理样本，覆盖 74 个 CWE**，而且做了严格 temporal split：历史集与 post-cutoff leakage-free 集分开。第二，保留 vulnerable-patched pairs 的上下文对应关系，而不是只给孤立代码片段。第三，除了常规准确率外，还引入 **Directional Failure Index (DFI)** 和 **Hierarchical Distance and Direction (HDD)** 两个指标，用来诊断模型是以什么方向系统性地失败。

这套设计其实是在逼问一个更深的问题：模型到底是在理解漏洞机制，还是只是学会“某种模式更像漏洞”。

#### 关键实验与证据

最关键的实验结论非常硬。

第一，所谓污染优势并不明显。作者发现，**84% 的 nominally contaminated 样本其实没有可用的 memorization signal**，而且约 **31%** 带有 CWE misclassification。换句话说，“这条样本可能见过”并不自动意味着模型真能靠记忆得利。

第二，最强 detection 分数也很一般。论文报告 **最佳 binary detection 只有 52.1%**，仅仅 **比随机高 2.1 个百分点**；而精确 CWE Top-1 排名 **低于 1.3%**。这已经足够说明当前模型离“可靠安全推理”还很远。

第三，更重要的是 failure 机制。作者认为 backbone directional priors 主导了 fine-tuning 后的行为，fine-tuning 更多是在调输出 threshold，而不是改变决策政策本身。这就是标题里的 `calibration without comprehension`。

#### 局限和可信度

这篇论文的可信度相当高，原因不是结果多漂亮，而是它刻意把漂亮结果拆掉了。它不仅控制时间泄漏，还从函数级分析污染是否真的存在，并区分 detection 与 understanding 两种能力。局限主要在于数据仍然是 Linux kernel/C 场景，不能直接外推到所有语言与漏洞族。

不过对 coding agent 研究来说，这恰好是最有价值的负结果之一。它提醒我们：**如果你把安全能力建在表面分数上，很可能是在给一个不会安全推理的模型做 calibration cosmetics。**

#### 与当天主题的关系

它和昨天主题的关系在于“评估可信度”这一条主线。Agent reliability 不是只看会不会输出一个漏洞标签，而是看这个标签是否建立在真实理解上。对 repository-level 安全 agent，这个提醒尤其关键。

## 中相关论文速读

### When Lower Privileges Suffice: Investigating Over-Privileged Tool Selection in LLM Agents

[2606.20023](https://arxiv.org/abs/2606.20023) 讨论的不是 coding patch 本身，而是 agent 在多个可选工具间的权限选择。它定义了 `over-privileged tool selection`：明明低权限工具已经足够，却过早选了高权限工具，或在短暂失败后过度升级。这个问题对 coding agent 非常现实，因为真实开发环境里“能完成任务”和“应当用什么权限完成任务”不是一回事。

方法上，作者构建了 ToolPrivBench，在八个 domain、五类 recurring risk pattern 上测直接高权限选择与失败后的 escalation。结论是 mainstream LLM agent 普遍存在过度升级，而且 transient failure 会放大这种倾向。prompt-level control 能缓解一些，但效果不稳；他们提出的 privilege-aware post-training 更有效，把 OPUR 降到 **39.71% / 27.02% / 18.93%**（在三种 Qwen3 设定下）。为什么这篇我放中相关而不是强相关？因为它离 repository software change 还差一层，但它对 agent 安全边界设计有直接启发：least privilege 不能默认从一般安全 alignment 自动获得。

### OpenRath: Session-Centered Runtime State for Agent Systems

[2606.19409](https://arxiv.org/abs/2606.19409) 不是一篇重结果的 benchmark 论文，而是一篇 runtime model 论文。它的中心思想是把 `Session` 做成一等运行时对象，统一承载 conversation、tool effect、memory event、sandbox placement、lineage metadata、token usage、pending work 和 replay evidence。这样 fork、merge、replay 这些原来只能靠日志重建的行为，会变成显式 runtime 操作。

这和用户方向里的 `verify and organize software change` 很贴近，因为很多真实 agent 系统的问题，恰恰来自状态被碎片化记录。为什么我没有把它列为强相关？因为它的 claims 主要限于 controlled runtime properties，论文自己也承认缺少广泛定量比较与 memory quality 评测。不过它值得保留一个判断：**如果 agent runtime 状态不是 first-class value，后续审计和复现会很痛苦。**

### N-Version Programming with Coding Agents

[2606.20158](https://arxiv.org/abs/2606.20158) 把经典 N-version programming 搬到 coding agent 时代来做。作者用 Knight-Leveson 的 Launch Interceptor Program Specification，让 agent 生成 **48 个实现**，再用 **100 万随机测试输入** 来测共同失效。结果显示 common-mode failure 仍然很多，这个负结果很重要，因为它打掉了一个过于乐观的想法：多模型/多语言自然就会带来足够的错误独立性。

但它也发现 diversity 不是完全没用。多数投票的三版本单元把平均 failure count 从 **387.44** 降到 **130.99**，还有 **11,844 个 N-version units** 没观察到失败。这说明多版本 agent assembly 仍可能是工程上可用的 reliability strategy，只是不能假设错误自动独立。对 coding agent 来说，这是个边缘但很有价值的判断。

### JAMER: Project-Level Code Framework Dataset and Benchmark on Professional Game Engines

[2606.19830](https://arxiv.org/abs/2606.19830) 值得关注，不是因为游戏，而是因为它把 project-level benchmark 从小 repo 拉到了 professional engine framework。作者从超过 **24 万个仓库** 中筛出 **8,133 个验证通过的 Godot 项目**，其中 **300 个**构成 JamBench。评价指标不只看 compile，而是结合 SCS 与 BAS，还收 runtime behavior。

最值得保留的结论是：随着项目规模增大，runtime pass rate 会从 **80.4%** 掉到 **5.7%**；而 Code Agents 虽然提高了 compilation rate，却没有带来 runtime behavioral quality 提升。这和很多 repository benchmark 的经验高度一致：**语法层修通不等于系统层行为对了。** 之所以放中相关，是因为它和 coding agent 大方向很近，但不直接聚焦软件变更与可靠性闭环。

### FAPO: Fully Autonomous Prompt Optimization of Multi-Step LLM Pipelines

[2606.19605](https://arxiv.org/abs/2606.19605) 更像 pipeline optimization 论文，不是 repository agent 论文。但它有一个值得保留的判断：多步 LLM pipeline 的瓶颈常常不是单个 prompt，而是链条结构。FAPO 先做 prompt edits，不够时再做结构级改动；在 **18 个模型-基准组合中赢了 15 个**，平均比 GEPA 高 **14.1 个百分点**，在需要升级到结构变化的 6 个 HoVer / IFBench 比较中全部取胜，平均增益 **33.8 个百分点**。

为什么与今天主题有边缘关系？因为 coding agent 本身也是 multi-step pipeline。它提醒我们，在研究 agent 可靠性时，不能把全部问题都压缩成“prompt 写得好不好”，workflow shape 本身也是变量。但这篇缺少 repository-level software change 证据，因此不必深挖。

## 可留意 / 可跳过

- `Qiskit Code Migration with LLMs`：[2606.20173](https://arxiv.org/abs/2606.20173)。可保留关键词是“API 演化驱动的迁移辅助”，但论文目前更像特定框架迁移案例，不够仓库级。
- `Prompt Quality and Pull Request Outcomes`：[2606.19644](https://arxiv.org/abs/2606.19644)。保留一个判断：PR 结果与 prompt structure 的关联值得看，但它更偏经验研究，不直接提供 agent reliability 机制。
- `The Correctness Illusion in LLM-Generated GPU Kernels`：[2606.20128](https://arxiv.org/abs/2606.20128)。很值得保留“测试 oracle 会制造 correctness illusion”这个警示，但任务域偏 GPU kernel，不是仓库级软件变更。
- `Multi-LCB: Extending LiveCodeBench to Multiple Programming Languages`：[2606.20517](https://arxiv.org/abs/2606.20517)。保留“多语言新题评估”的 benchmark 价值，但它主要测 coding breadth，不是 software change depth。
- `DynAMO`：[2606.19382](https://arxiv.org/abs/2606.19382)。可以保留“dependency-aware parallel workflow”这个词，但场景偏工业资产流程，不必今天深挖。

## 横向比较

| 论文 | 问题定义 | 关键证据 | 工程可迁移性 | 可信度判断 |
|---|---|---|---|---|
| Repository Guidance | 仓库指导是否真能帮助 repo agent | 33.0% vs 28.3% vs 25.5%，提升主要来自 coverage | 很高 | 机制解释清楚，但有长度混杂 |
| StaminaBench | 长回合 coding agent 会怎样失稳 | 无反馈 5-6 轮即崩，反馈可提升至多 12x | 很高 | benchmark 扎实，但任务族单一且昂贵 |
| AgentArmor | destructive failure 来自哪里 | 20 环境、59 模板、harness 改造显著更安全 | 高 | taxonomy 强，量化更偏系统安全风格 |
| Phoenix | GitHub issue automation 如何落地 | 75% oracle-resolve；42 real issues 上 100% CP | 很高 | 样本小，但部署细节真实 |
| Before the PR | 多 agent 协调失败在哪里 | 重复劳动占比 78% -> 0%，throughput 超 3x | 很高 | 过程可观测性贡献大 |
| Mobile CLI Agents | 复杂移动任务是否该只靠 GUI | 71.8/51.9；步骤 10.7 vs 18.6 | 中高 | interface advantage 明确，但权限问题仍待展开 |
| Firmware UT Repair | 复杂构建环境下如何生成可运行测试 | 73/76 buildable；coverage 73.9% -> 98.8% | 很高 | coverage 不等于语义正确，但工程价值强 |
| CWE-Trace | 安全 benchmark 高分是否代表理解 | best detection 52.1%，Top-1 < 1.3% | 很高 | 负结果非常有信息量 |

## 我的判断

如果只用一句话概括 2026-06-19 这批论文，我的判断是：**coding agent 研究正在从“模型会不会做题”转向“系统怎样才能持续、受约束、可审计地做变更”。**

从创新性看，我给这一天打 `A-`。最强的不是某篇单点算法，而是多个子方向同时开始认真处理同一个系统问题。`Probe-and-Refine`、`StaminaBench`、`AgentArmor`、`Phoenix` 这几篇放在一起，已经能拼出一个相对完整的研究版图。

从实用价值看，我给 `A`。昨天最有价值的论文都不是纯 leaderboard 工作，而是直接触到 repo knowledge、长 session、权限边界、复杂测试环境和真实 webhook 这些工程痛点。对真实软件仓库智能体而言，这些问题比再涨几点 pass@1 更接近瓶颈。

从严谨性看，我给 `B+`。优点是很多论文开始主动报告局限、主动避开污染、主动解释失败机制；缺点是样本规模仍然偏小，很多实验还停在特定任务族或 pilot deployment。尤其是 Phoenix、OpenRath 这类系统论文，想变成更稳的证据还需要更大规模开放评测。

从与用户研究方向的相关度看，我给 `A`。昨天最强的一批论文几乎都打在“repository-level coding agents、software change intelligence、agent reliability and quality assurance、software evolution in the agent era”这条主线附近，而且不是泛泛而谈。

不确定性主要有两点。第一，很多结果还集中在 Python repo、REST API、GitHub workflow、Linux kernel、Android 这些相对成熟生态，离 OpenHarmony/HarmonyOS 这类复杂工业平台还有迁移距离。第二，大家越来越会报“安全”“可信”“可验证”，但真正能做到跨平台、跨仓库、跨工具链稳住结论的系统仍然很少。这也正是接下来最值得盯的研究空白。
