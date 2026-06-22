---
title: "周末前这批 arXiv 终于开始正面处理：Coding Agent 的仓库知识、验证闭环与错误边界"
date: "2026-06-19"
description: "2026-06-19 这批相关论文集中讨论 repository guidance、GitHub issue resolution、多轮可靠性、构建受限环境测试生成、协同日志与正确性判定。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "仓库级智能体"]
series: "alphaXiv论文解读"
coverColor: "from-sky-600 to-emerald-600"
---

# 周末前这批 arXiv 终于开始正面处理：Coding Agent 的仓库知识、验证闭环与错误边界

先说明日期边界。今天是 2026-06-22，但 arXiv CS 常规 `new` 列表在周末没有新批次；我联网核对后，当前对应的上一批标准新投稿仍是 **Friday, 19 June 2026**。所以这篇 digest 覆盖的是 **2026-06-19** 这一批里，与 `Reliable Coding Agents for Real-World Software Change and Evolution` 实质相关的论文，而不是硬凑一个并不存在的 2026-06-21 新列表。

这一天最值得读的地方，不是又多了几篇“模型会写代码”的论文，而是有一批工作开始同时碰三件更难的事：**Agent 到底需要什么仓库外知识，怎样在复杂工程环境里持续完成多轮变更，以及我们如何知道它没有在“看起来正确”的地方偷偷出错。** 具体看，repository guidance 不再被当成玄学提示词，而被当成可调对象；GitHub issue resolution 不再只比 resolve rate，而开始把 baseline regression、PR safety 和部署失效模式一起算进去；正确性评估也不再满足于“跑过一个固定输入就算对”。

如果把这些论文放在一起看，主线其实非常清楚。今天真正往前推进的，不是纯粹的代码生成能力，而是三类“外部结构”：一类是**仓库知识结构**，告诉 Agent 哪些文件、测试和历史工作流才是真上下文；一类是**验证结构**，让 build/test/runtime evidence 去约束修改；还有一类是**协作与审计结构**，把 PR 之前的冲突、错误、回滚、权限和 correctness illusion 暴露出来。对 repository-level coding agents、software change intelligence、agent reliability 这些方向来说，这一批论文是可以拼成一张图的。

下面的强相关论文均已下载并阅读 arXiv PDF 正文，方法、实验和局限尽量基于论文内容而不是只复述摘要。

## 今日脉络

今天的相关论文大致可以分成四组。

第一组是**“仓库外知识到底怎么喂给 Agent”**。`Probe-and-Refine Tuning of Repository Guidance for Coding Agents` 把 repository guidance 从静态文档变成可迭代调参对象；`Phoenix` 则说明真实 issue resolution 并不是单个 patch 生成问题，而是 planning、reproduction、testing、failure analysis 和 PR handoff 的串联。

第二组是**“多轮软件变更的可靠性”**。`StaminaBench` 不再问单题 pass rate，而是问 agent 在 100 次连续改动中能活几轮；`Before the Pull Request` 把注意力从 PR 结果前移到并发 agent 的 claim、冲突、重复劳动和日志可挖掘性。

第三组是**“复杂工程环境里的验证闭环”**。`Library-Aware Doubles and Iterative Repair...` 把受限 firmware 环境下的单测生成做成 scaffold + build log + coverage 的闭环；`AutoPass` 则把编译器内部状态与运行时证据接入 agent，而不是把编译器当黑盒。

第四组是**“正确性与安全边界不能只看表面通过”**。`The Correctness Illusion in LLM-Generated GPU Kernels` 直接指出现有 benchmark 的 fixed-shape oracle 会把明显错误的 kernel 判成正确；`AgentArmor` 和 `ToolPrivBench` 一类工作则在提醒，真实 coding agent 的风险一半来自模型，一半来自 harness、工具权限和状态管理。

## 强相关论文深读

### 1. Probe-and-Refine Tuning of Repository Guidance for Coding Agents

**论文信息**  
标题：[Probe-and-Refine Tuning of Repository Guidance for Coding Agents](https://arxiv.org/abs/2606.20512v1)  
作者：Asa Shepard, Jeannie Albrecht  
分类：cs.SE, cs.LG  
发布日期：2026-06-19

**一句话 TL;DR**  
这篇论文最重要的发现不是“guidance 有用”，而是 **repository guidance 只有在被系统性调成“仓库专属操作知识”之后，才会稳定地提升 coding agent 的解题覆盖率。**

**为什么这个问题重要**  
仓库级 coding agent 的一个常见误判是：只要把代码树、README 和 issue 丢给模型，它自然会自己找到正确文件、正确测试和正确工作流。真实 repo 里往往不是这样。真正决定 agent 能不能进入有效修改路径的，常常是代码外的知识：哪个子系统惯常放在哪里、测试要先跑哪一组、哪些历史工作流会把 patch 带偏、某个框架里哪类错误应该先 reproduce 再修。这个问题和“prompt engineering”不一样，它更像 software change engineering 里的 repo operational knowledge 表征问题。

**方法怎么工作**  
这篇的方法是一个非常干净的 pipeline。第一步，它从静态 guidance artifact 出发，针对每个仓库自动生成 synthetic bug-fix probes。第二步，用单次 LLM 调用诊断这些 probes 暴露出的 guidance 缺口，例如测试入口不清楚、子系统定位规则太泛、修复顺序建议不可靠。第三步，再把这些缺口回写到 guidance 里，形成新的 repo-specific 指导文本。论文图 1 给的是完整 tuning loop，图 2 还展示了 `django/django` 的 guidance 演化：原本泛化的“先看错误信息、再修改代码”之类规则，最终被替换成了 reproduce-first、子系统 tracing、特定 middleware 依赖、具体 test path 这种可执行知识。重要的是，这个 refinement 过程本身 **不是** agent loop，也不依赖工具执行，而是用 probes 去打磨 repo guidance。

**关键实验与证据**  
实验在 SWE-bench Verified 上做了 4 次独立 trial、每次 500 个实例、agent step budget 200。结果很明确。  
`probe-and-refine` 的平均 resolve rate 是 **33.0%**，高于 `static_kb` 的 **28.3%** 和无上下文 baseline 的 **25.5%**。混合效应逻辑回归里，`probe_refined vs. no_context` 的 odds ratio 是 **2.11**，`probe_refined vs. static_kb` 是 **1.58**，两者 `p < 0.001`。更关键的是，收益几乎全部来自 **coverage**：refined guidance 能让可评测 patch 的比例达到 **56.2%**，而 no-context 只有 **41.7%**，整整多出 **14.5 个百分点**。但 precision 基本不变，三组大约都在 **56%-61%**， evaluated subset 上没有统计显著差异。论文自己据此下了一个很重要的判断：这类 guidance 的主要作用不是让 patch 本身更“聪明”，而是让 agent 更容易走到正确文件和正确工作流上。

**局限和可信度**  
这篇的局限恰恰来自它做得很“工程”。首先，实验主要依赖 SWE-bench Verified；虽然比小样本 case study 强，但仍然继承 benchmark 本身的分布限制。其次，论文也承认收益高度依赖底座模型生成 probe 的诊断质量；交叉模型实验里，Qwen 可用，但 Nemotron 的 tuning loop 退化明显。第三，improvement 主要体现在 coverage 而不是 patch precision，这意味着如果仓库里的关键知识不是“去哪修、怎么跑”，而是更深的语义约束，guidance 未必能继续带来同等幅度增益。

**与当天主题的关系**  
这篇几乎可以视为“repository-level coding agent 需要仓库外知识”的代表作。它把一个原本很容易被说成 prompt 小技巧的事情，转成了可实验、可比较、可迭代优化的 repo artifact。

### 2. Phoenix: Safe GitHub Issue Resolution via Multi-Agent LLMs

**论文信息**  
标题：[Phoenix: Safe GitHub Issue Resolution via Multi-Agent LLMs](https://arxiv.org/abs/2606.20243v1)  
作者：Kipngeno Koech, Muhammad Adam, Baimam Boukar Jean Jacques, Joao Barros  
分类：cs.SE, cs.MA  
发布日期：2026-06-19

**一句话 TL;DR**  
Phoenix 真正有价值的地方，不是多 agent 分工本身，而是它把 **GitHub issue resolution 的正确性保护、状态机、测试基线和部署失效模式** 都显式写进了系统。

**为什么这个问题重要**  
“自动修 GitHub issue” 现在已经是一个熟悉的 demo，但 demo 和部署之间差了很多层。真实系统不是产出一个 patch 就结束，而是要处理 issue 文本脏数据、规划文件修改、复现实验、测试回归、失败重试、PR 生成、token 过期、并发仓库冲突、WAF 拦截等一串细节。对 real-world software change 来说，很多系统不是败在“模型不会改”，而是败在“系统没把 correctness preservation 和 workflow hazards 管住”。

**方法怎么工作**  
Phoenix 的架构很工整。它把流程拆成六个 agent：Planner、Reproducer、Coder、Tester、Failure Analyst、PR Agent，并用 GitHub labels 当成持久化状态机。论文图 2 展示的是核心流水线，图 4 展示五态 label state machine。关键步骤至少有三层。第一层是 **plan/reproduce**：先规划修改文件和实现路径，必要时尝试在 base branch 上补一个 failing test。第二层是 **baseline-aware test evaluation**：测试前先 stash Phoenix 的改动，回到未修改的 base branch 跑一次 test suite，拿到 baseline failures 集合 `B`；再恢复改动重跑，得到 `P`，只有 `P \\ B = ∅` 时，才算 correctness preserved。第三层是 **failure feedback loop**：如果引入了新失败，Failure Analyst 解析测试输出，给 Coder 返回结构化原因和建议，最多两轮。除此之外，论文还列出了七层 safety control，包括 path traversal prevention、workflow file guardrail、内容清洗、retry 上限、并发串行化、安装 token 刷新等。

**关键实验与证据**  
论文给了两种证据。其一是在 SWE-bench Lite 的 24 个实例上，Phoenix 取得了 **18/24 = 75%** 的 oracle resolution，且成功样本里没有 pass-to-pass regression。其二是在 **14 个仓库、42 个真实 issue** 上，Phoenix 的 correctness preservation 是 **42/42 = 100%**；其中 easy、medium、hard 三档都保持 100% CP，hard tier 的平均处理时间是 **122 秒**。但更值得记住的是作者自己做的人工复核：生成出来的 PR 大约 **一半是 well-targeted fix**，另一半虽然没破坏 baseline correctness，却把代码放到了错误路径。这直接暴露了当前系统的主要瓶颈不是“修完会不会炸测试”，而是 **planner localization**。

**局限和可信度**  
Phoenix 最大的诚实之处，是它没有把 100% CP 说成“问题解决了”。作者明确强调，CP 只能说明 **没引入新回归**，不能说明 patch 在语义上真解决了 issue。对于真实 issue 的试验，论文承认 roughly half 的 PR 放到了 invented path 或 generic scaffolding 上。再加上它依赖现有测试套件，若仓库测试覆盖不足，CP 也只能是一种下界保障。但从 reliability 角度看，这种“只承诺我没有把本来通过的东西弄坏”的系统设计，比空喊高 solve rate 要成熟得多。

**与当天主题的关系**  
Phoenix 把 software change agent 的问题重新定义成一个可部署 workflow 问题，而不是单条补丁生成问题。它和今天的主线高度一致：Agent 可靠性来自 state machine、baseline gate 和 failure handling，而不只来自模型参数。

### 3. StaminaBench: Stress-Testing Coding Agents over 100 Interaction Turns

**论文信息**  
标题：[StaminaBench: Stress-Testing Coding Agents over 100 Interaction Turns](https://arxiv.org/abs/2606.19613v1)  
作者：Vlad Sobal, Shuo Yang, Yuting Zhang, Wei Xia, Stefano Soatto  
分类：cs.SE, cs.AI  
发布日期：2026-06-19

**一句话 TL;DR**  
这篇论文把一个大家隐约知道但很少正式测的事实钉死了：**单轮能做题，不代表多轮能活下去；今天的 coding agents 在长会话改代码里普遍死得非常早。**

**为什么这个问题重要**  
真实软件维护不是一锤子买卖。仓库级变更经常是连续数十轮的需求澄清、回归修复、接口重命名、数据验证补丁和副作用修复。可很多 benchmark 仍然用“一题一解”的 solved fraction 衡量 agent，导致系统在多轮环境里累积的上下文腐败、回归扩散、错误恢复能力根本看不见。对于 reliable coding agents，这其实是最基础的外部效度问题。

**方法怎么工作**  
StaminaBench 的设计很清楚。它从一个 REST API server 起步，然后连续采样 follow-up change requests，逐轮修改同一个代码库，论文里固定到 **100 turns**。第一层关键设计是 **程序化生成任务和测试**，不让 LLM 参与 benchmark 造题，从而保证可重现。第二层是 **黑盒 HTTP 接口**：agent 和 server 都跑在隔离环境里，benchmark 只通过 HTTP 交互，因此语言无关，也更接近真实服务变更。第三层是 **failure accounting**：它不只看“第几轮挂了”，还统计 missing feature、hallucinated feature、data validation error、cascade deletion、rename failure、regression、wrong endpoint，甚至 agent self-kill、invalid tool call、stuck loop 这种 harness 级故障。

**关键实验与证据**  
这篇最扎眼的是数字。论文主文里给出的总体结论是，所有测试模型都在 **5-6 轮内**开始失败；而在附录的更高 retry 预算下，最强组合可以走得更远，但仍远没到“稳定完成 100 轮”。例如在 `R=10` retries 下，`GLM-5 + OpenCode` 的平均通过轮数达到 **82.5**，但只有 **65%** 场景能完整跑到 100 轮；`Qwen3.5-122B + OpenCode` 是 **61.0** 轮、**35%** full pass；`Kimi K2.5 + Kimi CLI` 是 **57.1** 轮、**30%** full pass。更重要的是反馈粒度影响极大：在 OpenCode、`R=2` 默认设置下，`GLM-5` 从 minimal feedback 的 **10.7** 轮提升到 detailed feedback 的 **57.0** 轮，`Qwen3.5-122B` 从 **2.8** 轮升到 **39.4** 轮，差距非常夸张。作者甚至估算了一次完整配置的 API 成本，像 `GLM-5 + OpenCode` 的单次 20-scenario sweep 就用了 **4.5B input / 7.5M output tokens**。

**局限和可信度**  
论文自己也说得很明白：这个 benchmark 只测试了一类任务，也就是逐轮演化 REST 服务。它当然无法覆盖复杂构建系统、跨语言仓库、移动端 UI、编译器或 OpenHarmony 这类环境。但它的价值不在 domain 覆盖，而在它把“多轮生存能力”从模糊抱怨变成了可操作指标。另一个需要注意的点是，结果强烈受 harness 影响，说明 benchmark 测到的不只是模型，还包括 agent shell、上下文压缩、错误恢复策略。

**与当天主题的关系**  
StaminaBench 为“software evolution in the agent era”提供了非常必要的动态视角。它提醒我们，coding agent 的可靠性不是 solve 一个 issue，而是在连续变更里 **不把之前修好的东西重新搞坏**。

### 4. Library-Aware Doubles and Iterative Repair for LLM-Generated Unit Tests in OpenSIL Firmware

**论文信息**  
标题：[Library-Aware Doubles and Iterative Repair for Large Language Model-Generated Unit Tests in OpenSIL Firmware](https://arxiv.org/abs/2606.19725v1)  
作者：Ma Toan Bach, Yuchi Zheng, Haingo Razafindranto, Tanvir Alam, Aric Leather, Ranveer Sandhu, Jitesh Arora  
分类：cs.SE, cs.AI, cs.MA  
发布日期：2026-06-19

**一句话 TL;DR**  
这篇论文证明，在严格构建约束下，单测生成真正困难的部分不是“写出断言”，而是 **把 stub/mock/fake、头文件、链接依赖和 coverage 迭代接起来，让测试能在真实固件环境里活下来。**

**为什么这个问题重要**  
很多 coding agent 论文默认测试环境是轻量 Python/JS 项目，build feedback 很短、依赖也不深。真实工业软件不是这样。像 firmware、embedded、OpenHarmony 这类环境，agent 生成代码常常第一步就死在编译链接、符号冲突、头文件缺失、静态依赖和运行前置条件上。对 real-world software change 来说，这一类“环境反馈能不能被 agent 消化”比单纯生成代码更关键。

**方法怎么工作**  
论文做的是 AMD openSIL firmware 的自动单测生成工作流。第一步，agent 生成 UT scaffold，包括 `.c`、`.h`、`.inf` 和 iteration `.json`。第二步，它通过 library-aware retrieval 找到已有的 doubles、禁止重定义的符号列表和必须包含的 `#include`。第三步，进入 compile-dispatch repair loop：根据编译和链接错误做小范围修复；如果 build 成功，再运行 UT，采集 LCOV line coverage。第四步，coverage-guided iteration 根据 hit/miss 行映射去补 test case、调输入、补 doubles。论文图 5 给了完整的 11-stage workflow，图 6 展示 LCOV 导出的逐行 hit/miss 如何驱动下一轮修复。整体上，它不是让 LLM 一步写对，而是把 test authoring 变成 “draft -> build -> dispatch -> coverage -> targeted repair” 的闭环。

**关键实验与证据**  
实验在 **76 个 functions under test** 上做。结果相当硬。  
整体上，工作流为 **73/76 = 96.1%** 的 FUT 生成了能在 EDK II 下编译并链接的 UT。没有 LCA/VDB 的配置下，compile-success 样本的平均 line coverage 是 **73.9%**。在 48 个同时评估两种高级配置的子集上，`LCA-only` 的平均 coverage 达到 **98.8%**，`LCA+VDB` 是 **94.7%**。从类别细分看，`LCA-only` 在 Small/Medium 上几乎都能做到 **100%** coverage，Large 是 **94.3%**，XFER/Ip2Ip 类甚至是 **99.4%**。这些数字说明，coverage feedback 比“直接多给 retrieval”更稳定；VDB 会改变 runtime-token tradeoff，在复杂函数上可能节约时间，但未必严格减少迭代次数。

**局限和可信度**  
这篇的局限很具体。首先，它依赖 Windows-hosted EDK II + POSIX LCOV 的混合环境，迁移到别的 embedded toolchain 还需要工程工作。其次，LCA+VDB 并没有在所有类别上优于 LCA-only，说明 retrieval 并不是免费午餐。第三，论文没有真正做开发者 productivity 的对照试验，所以“减少多少人工 effort”目前更多是合理推断而不是严格因果证明。

**与当天主题的关系**  
这篇对用户方向的意义很直接：它说明在复杂工业平台里，agent 可靠性的关键是能否把 **build log、dispatch log 和 coverage** 变成结构化修复信号。对于 OpenHarmony/HarmonyOS 这类平台研究，这个范式非常可迁移。

### 5. Before the Pull Request: Mining Multi-Agent Coordination

**论文信息**  
标题：[Before the Pull Request: Mining Multi-Agent Coordination](https://arxiv.org/abs/2606.19616v1)  
作者：Dipankar Sarkar  
分类：cs.SE, cs.AI, cs.MA  
发布日期：2026-06-19

**一句话 TL;DR**  
这篇最重要的观点是：**PR 结果只看到了协作的尾声，真正决定多 agent 软件变更质量的，很多信号都发生在 PR 之前。**

**为什么这个问题重要**  
今天讨论 coding agents 时，很多实证都盯着 PR 通过率、merge rate、修改速度。但如果多个 agent 在同一 repo 并发工作，最贵的失败往往不体现在 PR 上，而体现在“两个 agent 重复做同一件事”“最后写入覆盖前一个人的改动”“某个 claim 一直拿不到锁”“同一任务被 rediscover 多次”。对 software change intelligence 来说，这些都是第一手协作过程数据，不应被 PR 结果压平。

**方法怎么工作**  
作者提出 `grite`，一个把 coordination substrate 放进 git 自身的方案。核心思路有三步。第一步，使用 append-only、signed event log 记录 task claim、lease acquisition、completion 等过程，而不是只在 worktree 里写一个易冲突文件。第二步，协调策略分三档：无协调、只有 advisory locks、locks + shared task state。第三步，对这个 coordination log 做预注册的 detector 挖掘，自动恢复 conflicting edits、redundant rediscovery、lock starvation、race-to-close 这类 failure mode。论文强调这些 detector 跑在 tidy one-row-per-event log 上，未来也可以直接迁移到真实 agent 日志。

**关键实验与证据**  
在 `N=32` 并发 agent 的实验点上，结果非常直白：无协调时，重复劳动率是 **0.78**，conflicting edits 是 **410**，goodput 只有 **2.33**；只有 locks 时，重复劳动率仍有 **0.64**，conflicting edits 降到 **138**，goodput 升到 **3.84**；到了 `locks + shared state`，重复劳动率直接变成 **0.00**，conflicting edits 只剩 **48**，goodput 达到 **8.00**。另一张 failure-mode 表里还能看到一个很有意思的现象：`locks-only` 反而出现了 **180** 次 redundant rediscovery，高于 no-coord 的 **36**，因为 lease 只能阻止“同时做”，阻止不了“后来又把别人做完的活重新做一遍”。

**局限和可信度**  
这篇的主要限制是作者写得很坦率：目前量化结果来自 synthetic tier-T1 agent，而不是大规模真实 LLM agent 日志。也就是说，数量级未必能直接外推到生产系统。但它的结构性结论其实已经很稳：**mutual exclusion 不够，shared completion state 也必须有。** 这一点对任何多 agent repository workflow 都成立。

**与当天主题的关系**  
这篇补上了一个常被忽略的层面：repository-level agent 不只是 patch generator，还是协作系统。很多“为什么 AI PR 被拒更多”的答案，可能根本不在 PR 里，而在 PR 之前。

### 6. The Correctness Illusion in LLM-Generated GPU Kernels

**论文信息**  
标题：[The Correctness Illusion in LLM-Generated GPU Kernels](https://arxiv.org/abs/2606.20128v1)  
作者：Dipankar Sarkar  
分类：cs.SE, cs.DC, cs.LG  
发布日期：2026-06-19

**一句话 TL;DR**  
这篇论文的核心结论非常锋利：**很多被 benchmark 判为“正确”的 LLM 生成 kernel，只是因为 benchmark 的 correctness oracle 太弱。**

**为什么这个问题重要**  
这不只是 GPU kernel 的问题，而是所有 coding agent 评估都会碰到的问题。只要 oracle 过窄，agent 就会在“看起来通过”的地方藏下错误。对 patch correctness、repository repair、compiler optimization，甚至移动平台 UI 自动化来说，弱 oracle 都会把错误系统性洗白。换句话说，这篇论文讨论的是一个比 GPU 更普遍的研究方法问题。

**方法怎么工作**  
作者把现有 kernel benchmark 的典型 oracle 概括成 fixed-shape、small-sample、`allclose` 风格检查。然后自己构造了一个受控 corpus：**26 个 kernel 条目**，其中 **16 个正确 control**、**10 个 LLM-style buggy variant**。这些 bug 不是随便造的，而是针对 LLM 常见转写错误模式，例如 `other=0.0 instead of -inf`、漏掉 `0.5`、`acc=` 写成 `acc+=`、漏乘 attention score scale 等。新的 seeded oracle 用两层替换原始做法：一层是 **op-schema-aware seeded fuzzing**，主动打边界 shape；另一层是 **fp64 CPU reference + per-op/dtype tolerance**。重点不是更复杂，而是更接近“找出 illusion”。

**关键实验与证据**  
论文给出的 headline 非常干净。在单 GPU 的 24-op corpus 上，新 oracle **抓到了 9/9 buggy variants，放过了 15/15 correct controls，零 false positive**。扩展到 26-op、5 种 GPU（RTX 3060、A10、A100 SXM4、L40S、H100 NVL）后，结论完全一致：**16/16 controls clean，10/10 illusions all caught**。更细的例子也很有说服力：`softmax triton buggy` 在随机采样时 **13/30** cases 失败，但如果只看 regular shapes 则 **0/10** 失败；换成 boundary-only strategy 会变成 **6/10**。这说明问题根本不在模型“偶尔出错”，而在 oracle 根本没有打到正确边界条件。

**局限和可信度**  
作者明确承认这些 buggy variants 是 author-seeded，不是直接从真实 deployed LLM 输出中挖出来的。因此论文证明的是“这种 oracle 会把这类典型 LLM bug 误判为正确”，而不是“某个商业模型的真实 bug rate 是多少”。但这个限制不削弱主结论，因为它本来就在讨论 **benchmark fidelity** 而不是模型排名。

**与当天主题的关系**  
如果说前几篇在讲 agent 怎么利用外部证据，那这篇是在提醒我们：**连“证据”本身都可能是假的。** 对 agent reliability 研究来说，这是必须时时记住的一根刺。

## 中相关论文速读

### AgentArmor: coding agent 的危险边界一半在模型，一半在 harness

[AgentArmor](https://arxiv.org/abs/2606.19380v1) 把 coding agent failure 分成三类：underspecification、capability error、agent harness error。它的 mitigation 也有很强的系统味：两级命令风险分类器、三次误操作后直接终止回合、只允许用户解除的 immutability daemon、允许 agent 自己裁剪长工具输出，以及删除前必须先 `ls -la`、执行脚本前必须先读脚本等 deterministic guardrail。结果上，两级分类器在测试集上的 `AUC-ROC` 达到 **0.990**，production prompt 点的 precision 大约 **97.3%**、recall **64.7%**。更有价值的是它展示了 coding agent 的 failure source 并不只在模型，而在“模型以什么操作协议接触系统”。这与 repository-level reliability 很接近，但论文更多是 harness safety，而不是软件变更任务本身，所以我把它放在中相关。

### JAMER: project-level benchmark 已经开始区分“能编译”和“行为对”

[JAMER](https://arxiv.org/abs/2606.19830v1) 为专业游戏引擎上的 project-level code engineering 提供了 `JamSet/JamBench`。最有意思的是它的验证管线不是停在编译，而是从文件完整性、headless 运行到行为采集一路做下去。数据规模上，从 **24 万多个仓库**里筛出 **8,133** 个 verified projects，其中 **300** 个人工核验项目做 JamBench。结果也很说明问题：Task 2a 中，runtime pass rate 会从 small project 的 **80.4%** 掉到 large project 的 **5.7%**；Code Agent 虽然能提升 compilation rate，但 **几乎不提升 runtime behavioral quality**。这和今天的主线高度一致：语法/编译通过并不代表系统级行为正确。之所以放中相关，是因为它更偏 game-engine project benchmark，不是仓库演化或 patch workflow 本身。

### AutoPass: 把编译器内部证据和运行时证据一起纳入 Agent 决策

[AutoPass](https://arxiv.org/abs/2606.20373v1) 做的是编译器性能调优，不是传统代码修复，但方法论很值得关注。它不是把 LLVM 当黑盒，而是让 agent 读取 compiler IR、compiler-internal optimization state 和 measured runtime feedback，然后迭代修改 pass pipeline。结果上，在带 rollback policy 的设置下，AutoPass 在 x86-64 和 ARM64 上的几何平均速度提升分别达到 **1.043x** 和 **1.117x**（相对 `-O3`）；无 rollback 的 cBench 测试里，x86-64 上几何均值 **1.040x**、只有 **6** 个 regression，ARM64 上是 **1.109x**。更有意思的是 one-shot `R1` 到三轮 refinement `R3` 的差距：x86 上 regression 从 **13** 降到 **6**。它和“执行反馈驱动 Agent 修正”这个主题很贴，但任务更偏编译器 autotuning，所以放中相关。

### ToolPrivBench: least privilege 不是自然从通用 safety 对齐里长出来的

[When Lower Privileges Suffice](https://arxiv.org/abs/2606.20023v1) 研究的是 tool-using LLM agents 过度选择高权限工具的问题。论文的价值不在某个具体数字，而在结论：一般 safety alignment 并不会自然迁移成 least-privilege tool choice，而且 transient failure 还会放大这种过度升级倾向。对真实 coding agents 来说，这和 shell、git、文件系统、云部署工具的权限边界直接相关。之所以放中相关，是因为它研究的是工具选择安全性，而非仓库级代码变更任务本身。

### Qiskit Code Migration with LLMs: API 演化是软件演化里一个很真实但常被低估的场景

[Qiskit Code Migration with LLMs](https://arxiv.org/abs/2606.20173v1) 关注的是 QDK 高速演化带来的技术债。方法上它不是直接让 LLM“猜迁移”，而是先自动生成 migration taxonomy，再做 taxonomy-guided RAG，且比较 unrestricted 与 restrictive retrieval。论文主张 restrictive taxonomy-based retrieval 能显著减少 hallucination，尤其在复杂 refactoring scenario detection 上表现更稳。它对 “software evolution in the agent era” 很贴，但因为场景局限在量子软件生态，而且正文给出的定量证据不如今天前几篇扎实，所以我放在中相关。

### Repository-Level Solidity Code Generation: specialized repo benchmark 的价值在于暴露结构性缺陷

[Repository-Level Solidity Code Generation with Large Language Models](https://arxiv.org/abs/2606.19988v1) 引入了 **5,470** 个 repository-level Solidity contracts 的 `SolidityBench` 和面向领域语义的 `SolidityScore`。结论很有代表性：通用模型在 specialized repository generation 上存在系统性的结构缺陷；非参数方法里 RAG 最好，而 in-context learning 超过两个示例后会因 context saturation 退化；SFT 提升最大。这篇并不直接讨论 software change，但它说明“repository-level”这个维度已经在特殊领域开始形成真正的数据和评测，而不是单函数 codegen。

### CWE-Trace: 系统软件漏洞检测里，fine-tuning 可能只是校准，不是理解

[Calibration Without Comprehension](https://arxiv.org/abs/2606.20502v1) 用 **834** 个人工整理的 Linux kernel 样本、**74 个 CWE**、严格 temporal split 去检验一个尖锐问题：漏洞检测 benchmark 上的 gain 到底是 reasoning，还是 contamination 和阈值校准。结论并不乐观。作者发现名义上“受污染”的样本里，**84%** 实际没有可用 memorization signal，且约 **31%** 的样本带有 CWE misclassification。更关键的是，多数 backbone 的 directional prior 很稳定，`DFI` 从 **-85.5** 到 **+94.8** 个百分点不等，fine-tuning 主要是在改输出阈值，不是在改决策策略。最好检测分数也只有 **52.1%**，只比 chance 高 **2.1** 个百分点，Top-1 CWE ranking 还不到 **1.3%**。这篇更偏 vulnerability detection，而不是 coding agent，但它对“评估可信度”和“系统软件环境下 LLM 理解力边界”都有参考价值。

## 可留意 / 可跳过

- [OpenRath: Session-Centered Runtime State for Agent Systems](https://arxiv.org/abs/2606.19409v1)  
保留的关键词是 `Session` 作为可分支、可回放、可审计的运行时值。它对 agent provenance 很有启发，但目前更像编程模型报告，量化证据还少。

- [Interpretable and Verifiable Hardware Generation with LLM-Driven Stepwise Refinement](https://arxiv.org/abs/2606.19387v1)  
可保留“stepwise refinement + formal transformation rules”这个思路。它和“先把高风险生成约束成可验证中间步骤”有关，但应用场景偏 RTL 生成，不是今天 repo-level software change 的中心。

- [Beyond Global Replanning: Hierarchical Recovery for Cross-Device Agent Systems](https://arxiv.org/abs/2606.20487v1)  
关键词是 scope-aware recovery、device-local strategy 与 global replanning 分离。对 computer-use / mobile agents 有价值，但与仓库级代码变更的直接交集还有限。

- [Bistable by Construction: Wall-Clock-Calibrated State Monitors Have No Moment-Detection Regime at Agent Cadence](https://arxiv.org/abs/2606.19386v1)  
这篇有意思的点在于：wall-clock 校准的 state monitor 在真实 agent 节奏上要么几乎常亮，要么几乎失声。保留这个判断即可，不必今天深挖。

- [Prompt Quality and Pull Request Outcomes](https://arxiv.org/abs/2606.19644v1)  
结论是 prompt 的 `Context / Specificity / Verification` 对 downstream PR outcome 的作用不同，尤其 verification 与 code adoption 更相关。实证有用，但更像协作行为研究，不是今天最核心的 agent workflow 论文。

## 横向比较

| 论文 | 核心问题 | 关键证据 | 工程可迁移性 | 我最在意的风险 |
|---|---|---|---|---|
| Probe-and-Refine | repo guidance 是否能系统提升仓库级 agent | 33.0% vs 28.3% vs 25.5%，收益主要来自 14.5pp coverage 提升 | 很高 | 依赖底座模型是否能生成有诊断性的 probe |
| Phoenix | issue resolution 如何在真实 GitHub workflow 中保住 correctness | 24 例 SWE-bench Lite 中 75% oracle resolve；42 个真实 issue 上 100% CP | 很高 | CP 不等于真正修好，planner localization 仍弱 |
| StaminaBench | coding agent 多轮会话能活多久 | 默认场景早期失败；强配置也只是把平均通过轮数推高，不等于稳过 100 轮 | 很高 | 任务域仍局限于 REST API 演化 |
| OpenSIL UT | 严格构建环境里的测试生成如何闭环 | 73/76 compile success；LCA-only 98.8% mean coverage | 很高 | 平台和 toolchain 依赖较重 |
| grite / Mining Coordination | 多 agent 协作失败为何在 PR 前就发生 | dup-work 从 78% 到 0%，goodput 从 2.33 到 8.00 | 高 | 目前主实验仍是 synthetic agents |
| GPU Correctness Illusion | benchmark 的 correctness oracle 是否在误判 | 9/9 buggy caught, 15/15 clean；5 类 GPU 一致 | 很高 | author-seeded bugs 不是实际线上输出样本 |

## 我的判断

**创新性：A-**  
今天最有创新性的不是再造一个更大 benchmark，而是几篇论文都在改“外部结构”：repo guidance、baseline-aware testing、coordination log、seeded oracle、coverage-guided repair。这些东西不 glamorous，但很扎实。

**实用价值：A**  
如果你的方向是 repository-level coding agents、真实构建/测试环境反馈、agent reliability，这批论文的信号密度很高。尤其 `Probe-and-Refine`、`Phoenix`、`StaminaBench`、`OpenSIL UT` 这四篇，几乎都能直接转成后续研究原型。

**严谨性：B+**  
今天不少论文比常见 agent paper 更诚实，愿意把 failure mode、deployment hazard 和 oracle 弱点写出来。但也要看到局限：有些结果仍受 benchmark 分布、任务域、synthetic setup 或 author-seeded corpus 限制。

**与用户方向相关度：A**  
这一天的主线非常贴近 `LLM-based Software Change Engineering`：仓库外知识如何表达，验证闭环如何搭，PR 前协作如何记录，弱 oracle 如何误导结论，复杂工业环境中的 build/test feedback 如何变成 agent 的下一步依据。

**不确定性**  
最大的未知数有两个。第一，今天这些工作大多只各自打通了闭环的一段，还没有形成统一的 repo-level agent stack。第二，除了 OpenSIL 这种少数例子，我们仍缺少 OpenHarmony / HarmonyOS 级别复杂工业平台上的公开、可重复 agent 评测。也正因为如此，今天这批论文最值得重视的，不是它们已经把问题解决了，而是它们开始把真正该解决的问题说对了。
