---
title: "arXiv 每日速递 2026-04-25"
date: "2026-04-25"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-04-25

## 今日总结

今天的 SE 板块有一条很清晰的暗线：**"标准评估方式正在系统性地少报问题"**。CrossCommitVuln-Bench 用 15 个真实 CVE 证明每 commit SAST 漏掉了 87% 的多 commit 漏洞；TestGeneralizer 指出"代码覆盖率"完全错过了由需求驱动的真正测试场景；Tool Attention 量化了 MCP 协议每轮 47k token 的隐性成本，把"上下文长度"伪装成了"上下文有效利用率"问题；MathDuels 用 dual-role 自博弈机制化解了 benchmark 饱和。四篇论文不是在做"更强的方法"，而是在质疑**评估管道本身**——这正是博主"benchmark 合理性 + 边际价值量化"的研究主线最值得收藏的一类论文。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [CrossCommitVuln-Bench](http://arxiv.org/abs/2604.21917) | benchmark + SAST 批判 | 15 个真实 CVE 证明 per-commit SAST 漏掉 87% 跨 commit 漏洞 | ⭐⭐⭐ |
| [TestGeneralizer](http://arxiv.org/abs/2604.21771) | LLM 测试生成 | 从单个开发者写的 test 反推需求模板，泛化出场景级测试 | ⭐⭐⭐ |
| [Tool Attention](http://arxiv.org/abs/2604.21816) | agent 成本量化 | 量化 MCP "Tools Tax"，per-turn 47.3k → 2.4k tokens | ⭐⭐ |
| [MathDuels](http://arxiv.org/abs/2604.21916) | 自博弈评估 | Rasch model + dual role，让 benchmark 难度跟模型协同进化 | ⭐⭐ |

## 今日主题：当"标准评估"变成最大的盲点

这四篇论文做的事情看似毫不相干——一篇是漏洞检测、一篇是测试生成、一篇是 agent 协议、一篇是 LLM 评测——但它们共享一个非常硬的共同 insight：**我们日常默认的评估单位是错的**。

- per-commit 是 SAST 工具的默认扫描单位 → 但漏洞跨 commit
- code coverage 是测试质量的默认指标 → 但真正的测试场景源自需求
- "上下文窗口长度"是 agent 性能的默认讨论点 → 但 token 实际有效占比才是约束
- "静态 benchmark 排行榜分数"是 LLM 能力的默认衡量 → 但前沿模型很快天花板

这种"错配"的代价不是细枝末节：CrossCommit 的数字是 87% 漏报，Tool Attention 的数字是 95% 浪费，TestGeneralizer 报出 +31.66pp 提升空间。所有这些数字都在告诉我们一件事：**AI for SE 的下一波边际价值，不在更强的模型，而在重新定义评估单位**。这跟博主"边际价值量化"的研究哲学完全合拍——别再拼 pass@1 涨 0.5 pp，去找那些被默认 pipeline 系统性遗漏的东西。

---

### CrossCommitVuln-Bench: A Dataset of Multi-Commit Python Vulnerabilities Invisible to Per-Commit Static Analysis

> **推荐理由**：和你的 RepoRescue / 全仓库兼容性修复主线天然耦合。它把 SAST per-commit 的盲区量化成了一个可运行的 benchmark，思路完全可以迁移到"per-commit AST diff 看不到的 dependency drift"这种你正在做的问题。

📌 **论文信息**：Arunabh Majumdar | [arXiv:2604.21917](http://arxiv.org/abs/2604.21917) | cs.CR, cs.SE

#### TL;DR
精选 15 个真实 Python CVE，每个漏洞由**多个独立看起来良性的 commit** 累积形成，证明 Semgrep / Bandit 等 per-commit SAST 漏报率达 **87%**，cumulative 模式也只能检出 27%。这是一份小而锋利的 benchmark，而不是一篇"我们提出更强工具"的论文——这反而更有价值。

#### 问题是什么？

业界的 SAST 工具（Semgrep、Bandit、CodeQL）默认扫描单位是 **single commit 或 single snapshot**。这隐含一个假设：**漏洞是在某一个 commit 中"被引入"的**。但真实世界里，至少有一类高危漏洞是分散在多个 commit 里的：commit A 引入一个未受保护的工具函数（看起来 OK，因为没人调用）→ commit B 加了一个 endpoint 调用它（看起来 OK，因为函数参数都来自内部）→ commit C 把这个 endpoint 暴露到公网（看起来 OK，因为是个"性能优化"PR）。任何单独看一个 commit 的扫描器都不会报警。

这个问题之前只有零散的 case study，没有一份可比较的 benchmark。Majumdar 这篇就是要把它做成一份**可复现的硬基线**。

#### 他们怎么做的？

**核心 Insight**：与其自己造合成漏洞，不如手工标注真实 CVE 的"贡献链"——从 NVD 倒推出每个 CVE 涉及的所有 commit，再对每个 commit 标注"为什么 per-commit 分析会漏掉它"的结构化原因。

具体方法流程：
1. 从公开 CVE 库筛选 15 个 Python 漏洞，确保它们的引入跨 ≥2 个 commit
2. 对每个 CVE 手工标注：贡献 commit 链、每个 commit 单独看为什么良性、漏洞如何在累积时浮现
3. 用 Semgrep + Bandit 跑两种模式：per-commit 模式（每个 commit 单独扫）和 cumulative 模式（最终 codebase 一次扫）
4. 报告 CCDR（Cross-Commit Detection Rate）

**跟之前方法的本质区别**：之前的"漏洞检测 benchmark"（如 Big-Vul、Devign）都是**snapshot-level** 标注——你只知道"这个版本有漏洞"，不知道"漏洞是在哪几个 commit 里被引入的"。所以你没办法用它评估 per-commit 工具的真实漏报率。Majumdar 这份 benchmark 第一次给出了 commit chain 标注。

#### 关键结果

| 检测模式 | 工具 | 检出率 | 备注 |
|---------|------|-------|------|
| Per-commit | Semgrep + Bandit | 13% (2/15) | 而且这两个 hit 都"质量很差" |
| Cumulative | Semgrep + Bandit | 27% (4/15) | 即使看完整 codebase 仍漏 73% |

**结果解读**：
- **13% 不是"基线弱"，而是"任务定义被忽略了"**：作者特意指出，那两个被检出的 case 里，一个是 commit message 写明"security fix"被开发者主动 suppress 掉了 alert；另一个只检到一个次要的 hardcoded key，**完全错过了主要的 200+ 个未鉴权 endpoint**。所以即使报警了，分析师也会被误导。
- **cumulative 模式才 27% 这个数字更值得深究**：这说明问题**不是 per-commit vs snapshot 的分析窗口大小**，而是这类工具的**模式库本身没有覆盖跨函数、跨模块、跨 PR 时间维度的漏洞模式**。换句话说，扩大窗口救不了你。

#### 局限性与开放问题

- **样本量太小（n=15）**：15 个 CVE 的 87% 数字看着惊人，但置信区间巨大。需要更大规模的 mining pipeline 把这个数字稳定下来。
- **只覆盖 Python**：跨 commit 漏洞是不是 Python 特有？还是 JavaScript / Ruby 的 dynamic dispatch 也一样严重？需要横向跨语言验证。
- **没有评估 LLM-based 检测器**：作者只跑了规则型 SAST（Semgrep / Bandit），没有跑 GPT-4 / Claude 看完整 codebase 时能不能识别。这是一个明显的 follow-up，也是博主可以立刻做的实验。

#### 💡 对我们的启发

1. **直接可用的方法论**：你的 RepoRescue 工作里其实可以套用同样的 commit-chain 标注思路。当前 RepoRescue 的 entry 是 "T0 PASS + T1 FAIL"，但 T1 FAIL 的根因可能也分散在多个 commit。可以加一个 **"breakage chain"** 标注维度：哪些 commit 引入了 breakage、每个单独看为什么"良性"、累积时如何 fail。这会让 RepoRescue 从"修复 benchmark"升级成"修复 + 根因诊断 benchmark"。

2. **具体实验想法（1-2 周可做完）**：拿 CrossCommitVuln-Bench 的 15 个 CVE，把它们投喂给 GPT-4o / Claude / DeepSeek-Coder，**单 commit 模式 vs full repo 模式**对比检出率。预期观察到：(a) full repo 模式下 LLM 能补一部分缺口（30-50%），但仍然有相当一部分跨 PR 时间维度的漏洞被遗漏；(b) 即使检出，LLM 也很可能把"看似 security fix"的 commit 误判成"已修复"——和 SAST 一样的失败模式。这一发现可以直接成为一篇 short paper。

3. **研究趋势判断**：**"benchmark-as-critique"** 正在成为 SE 顶会一类很受欢迎的论文形态——不是提出更强的方法，而是用一个精心标注的小 benchmark 把整类工具的盲区量化出来。这跟你过去做 MazeBreaker 时"用方法论暴露评估缺陷"的思路一致。这类论文 ROI 极高：标注成本可控、写作清晰、被引可期。

---

### Generalizing Test Cases for Comprehensive Test Scenario Coverage

> **推荐理由**：你做 program repair / agent marginal value 时离不开"测试"作为信号。这篇直接论证了"代码覆盖率 ≠ 测试场景覆盖率"，对你评估 LLM 修复质量、做 test execution 边际价值时的指标设计有直接参考价值。

📌 **论文信息**：Binhang Qi, Yun Lin, Xinyi Weng, Chenyan Liu, Hailong Sun（北航 + 上交） | [arXiv:2604.21771](http://arxiv.org/abs/2604.21771) | cs.SE

#### TL;DR
传统自动测试生成都在追求**代码覆盖率**，但真实开发者写测试是在覆盖**需求场景**。TestGeneralizer 从开发者已经写好的**单个 initial test** 出发，把它当作需求规约的"种子"，反推需求模板再泛化出多个场景级测试。在 12 个 Java 项目上比 ChatTester 高 +31.66pp（mutation-based 场景覆盖率）。

#### 问题是什么？

当前自动测试生成（EvoSuite / Pynguin / ChatTester）的优化目标是**branch coverage 或 line coverage**。但实际工程里，真正缺的不是"覆盖到这一行 if 语句的两个分支"，而是"覆盖这个方法在不同业务场景下应该有的行为"——比如 `transferMoney()` 这个方法，开发者可能写了一个 happy path test，但漏了"账户冻结"、"日切时间窗"、"跨币种"这些场景。这些场景**不一定对应任何分支**，但是 bug 真正会出现的地方。

更深的问题是：**这些场景往往没有被显式记录在 requirement doc 里**，它们隐藏在开发者脑子里、在 PR review 评论里、在事后修 bug 的 commit message 里。怎么把这些隐性需求挖出来？

#### 他们怎么做的？

**核心 Insight**：开发者写的**第一个 test 本身就是一份可执行规约**——它揭示了"这个方法应该怎么用、什么是预期行为"。如果你能从一个 test 反推出它背后的"场景模板"（比如"输入合法、内部状态正常、外部依赖可达"），就能机械地枚举其他场景实例。

具体方法流程：
1. **Stage 1 – 需求理解**：用 LLM 读 focal method + initial test，输出一段对"这个方法做什么、initial test 验证了哪个场景"的自然语言描述
2. **Stage 2 – 场景模板化**：让 LLM 基于 stage 1 的理解生成一个"场景模板"（可参数化的场景描述），然后枚举出多个具体的"场景实例"
3. **Stage 3 – 测试代码生成 + 精炼**：每个场景实例转成可执行 JUnit 测试，跑一遍，failed 的让 LLM 修

**跟之前方法的本质区别**：
- ChatTester / CodaMOSA 都是"给一个方法签名，生成 N 个测试"，**没有 anchor**——LLM 容易生成大量重复或低价值的测试。
- TestGeneralizer 把 initial test 当作 anchor，**强制 LLM 围绕已知正确的场景去做"近距离泛化"**，确保新生成的测试和真实需求对齐。这其实是 in-context learning 的一个很自然的应用，但作者把它做成了一个完整的 3-stage pipeline。

#### 关键结果

| Benchmark | 指标 | TestGeneralizer | ChatTester | 提升 |
|-----------|------|----------------|-----------|------|
| 12 个 Java 项目 | mutation-based 场景覆盖率 | – | – | **+31.66pp** |
| 12 个 Java 项目 | LLM-assessed 场景覆盖率 | – | – | **+23.08pp** |

**结果解读**：
- 31.66pp 这个数字非常大，可信度需要打个问号——是不是 baseline 选得太弱？ChatTester 是 2023 年的工作，相比 EvoSuite + LLM hybrid 的最新方法可能有差距。
- **mutation-based 和 LLM-assessed 两个指标都涨**这一点比较强。两个指标的 noise 来源不同（mutation 测的是真能 kill 多少 mutant，LLM-assessed 测的是语义层面有多丰富），同向变化说明效果不是单一指标的过拟合。
- 没有报 traditional code coverage 的提升——这其实暗示着 **"场景覆盖" 和 "代码覆盖" 是两个正交维度**。值得做一下两者的相关性分析。

#### 局限性与开放问题

- **依赖一个高质量的 initial test**：如果开发者写的 initial test 本身有 bug 或场景错位，整套方法会被带偏。
- **只评估了 Java**：Python / JavaScript 的动态特性会让"场景模板化"变难（运行时类型不固定）。
- **场景模板的"质量"没有人评**：作者只测了"生成的测试能不能 kill mutant"，但没有人工评估"这些场景是不是真的对应业务需求"。这是一个明显的盲点。

#### 💡 对我们的启发

1. **直接可用的方法论**：你做 LLM-based program repair 时，可以借用 TestGeneralizer 的 **"initial test as anchor"** 思路：把开发者的 reproducer test 当作 anchor，让 LLM 生成更多场景化的 regression test。这能解决你之前关心的"修复 patch 通过了 test 但泄露 bug 到边角场景"的问题。

2. **具体实验想法（1-2 周）**：拿你手上的 RepoRescue / SWE-bench 数据，对每个 issue 的 reproducer test 跑一次 TestGeneralizer 风格的扩展，得到 N 倍多的"场景化测试"。然后用这些扩展测试**重新评估**已有 SWE-bench 工作生成的 patch——看看那些原本"通过"的 patch 在场景级测试下还有多少存活。预期：会有相当一部分 patch 在场景化测试下 fail，证明 SWE-bench 的 pass@1 高估了真实修复质量。这又是一篇典型的"benchmark-as-critique"。

3. **研究趋势判断**：测试生成正在从 **"覆盖驱动"** 转向 **"规约驱动"**。这个转向背后的关键技术是 LLM——只有 LLM 能从 informal 的代码 + 测试中抽取出 informal 的"需求"。这条路线和你 OpenHarmony 工具链的"静态分析提取规约"路线可以互补：静态分析给规约骨架，LLM 给场景泛化。

---

### Tool Attention Is All You Need: Dynamic Tool Gating and Lazy Schema Loading for Eliminating the MCP/Tools Tax

> **推荐理由**：你研究 agent marginal value 时一直在问"哪个设计动作真的贡献了多少"。这篇精确量化了 MCP 协议每轮被吃掉的 47k tokens——一个之前被工程师私下抱怨但从没被学术化的成本项。**但要批判性地读**：他们的结果很大程度上是 simulation。

📌 **论文信息**：Anuj Sadani, Deepak Kumar | [arXiv:2604.21816](http://arxiv.org/abs/2604.21816) | cs.AI

#### TL;DR
MCP（Model Context Protocol）每轮把所有可用工具的 schema 都塞进 prompt，在 120-tool / 6-server 的典型部署下平均 47.3k token/turn。Tool Attention 把这件事从"暴力注入"改成"基于意图嵌入的 gated attention + 两阶段 lazy schema 加载"，token 减少 95%（47.3k → 2.4k），有效上下文利用率从 24% 提升到 91%。**但任务成功率、延迟、成本是 projection 而不是实测**。

#### 问题是什么？

当 LLM agent 通过 MCP 接入 N 个工具/MCP server 时，每一次 turn 都要把所有工具的完整 JSON schema 塞进 prompt 让模型决定调哪个。在真实部署里，N 经常 ≥ 100，schema 总长度轻松上 50k tokens——这部分 token 是**每一轮都重复支付的 tax**，挤压了真正用于推理的上下文。

更糟糕的是：超过某个上下文利用率阈值（通常 70%），LLM 的推理质量会断崖式下降（"context fracture point"）。所以这个 tax 不只是花钱问题，它还**直接侵蚀模型能力**。

之前业界的解决方案大多是**手工修剪工具列表**，但这破坏了 agent "动态选择正确工具"的核心能力。

#### 他们怎么做的？

**核心 Insight**：把 attention 这个概念从"token 之间"提升到"工具之间"——用一个轻量级 embedding 相似度先筛出 top-k 相关工具，**只对它们加载完整 schema**，其他工具在 context 里只保留一行简介。

具体方法流程：
1. **Intent Schema Overlap (ISO)**：把当前 user intent 的 sentence embedding 跟每个工具的 schema embedding 算相似度
2. **State-aware gating**：根据 agent 当前的 state（已认证、已选数据库等）过滤掉不可用的工具
3. **Lazy schema loading**：context 里始终保留"工具简介池"（约 200 tokens），只把 ISO 筛出的 top-k 工具的完整 JSON schema 注入

#### 关键结果

| 指标 | 基线（Eager MCP） | Tool Attention | 改善 |
|------|----------------|---------------|------|
| Per-turn tool tokens | 47.3k | 2.4k | **−95.0%** |
| 有效上下文利用率 | 24% | 91% | +67pp |
| Task success / latency / cost | – | – | **projected only** |

**结果解读**：
- **token 数字是直接测量的**——这部分可信度高。47.3k → 2.4k 的差距是巨大的工程价值。
- **task success / latency / cost 是从 token 数字 + 第三方部署遥测推算出来的 projection**——作者明确标注了这一点。这是这篇论文最大的结构性弱点：你只能信"token 少了 → 一切都好"这个假设链。
- **120-tool 的 simulation benchmark**：作者承认数字是基于公开 MCP 部署 audit 校准的"模拟"benchmark，而不是真实多 MCP server 端到端实测。

#### 局限性与开放问题

- **没有真实 LLM 端到端实验**：这是最致命的问题。token 减少不等于任务成功率上升——top-k 选错工具会直接让任务失败，而 simulation 里没有这一项。
- **ISO embedding 是 weakest link**：embedding 选错工具会引发**完全静默的失败**——agent 不知道自己缺哪个工具。这跟原始 eager MCP "全部塞进去让 LLM 自己选"的鲁棒性是两个量级的差距。
- **state-aware gating 是个 hand-crafted layer**：每个 MCP server 要手写 precondition 规则。规模一上来这就是另一种维护负担。

#### 💡 对我们的启发

1. **这是一个完美的"agent marginal value 量化"目标**：你之前测 test execution 只贡献 1.25pp，那 MCP schema 大小贡献几个 pp？很值得复刻：在 SWE-bench Verified 上跑一组实验——prompt 里 (a) 全量工具 schema、(b) top-k=5 工具 schema、(c) top-k=1 工具 schema，分别看 pass@1。**预期结果会比作者的 projection 悲观得多**——top-k 选错的情况下 pass@1 会塌方，说明"95% token 节省"在真实 task 上买不到 95% 的成本节省。

2. **方法论可以借**：这篇 ISO embedding + lazy schema 的设计本身可以套到你 ArkTS 的项目级 agent 里——HomeCheck 规则集和 fix 工具集庞大时，prompt 不可能全量塞进去。但**先做一组真实 LLM 实验**，别像作者那样靠 simulation。

3. **研究趋势判断**：MCP / tool-use 的"协议级效率"会成为下一年很热的方向。但学界很容易踩坑：用 simulation 替代真实 LLM。这是一个系统性的方法论 gap，可能值得写一篇 position paper 提醒社区。

---

### MathDuels: Evaluating LLMs as Problem Posers and Solvers

> **推荐理由**：纯数学评测但**方法论极其可迁移**——dual-role + Rasch model + 难度自动协同进化的设计，几乎可以原样套到 code generation / debugging 评测上，对你"benchmark 设计与方法论批判"主线非常对口。

📌 **论文信息**：Zhiqiu Xu, Shibo Jin, Shreya Arya, Mayur Naik | [arXiv:2604.21916](http://arxiv.org/abs/2604.21916) | cs.CL, cs.SE

#### TL;DR
前沿模型在 GSM8K / MATH 这些静态 benchmark 上几乎打满分，传统评测拉不开差距。MathDuels 把评测变成"自博弈"：每个模型既是出题人也是解题人，用 Rasch model 联合估计"作答能力"和"出题质量"。新模型一进场就生产能击溃前任 SOTA 的题，**benchmark 难度跟着选手强度协同进化**，永不饱和。19 个前沿模型的实验显示：**作答和出题能力是部分解耦的**。

#### 问题是什么？

经典 benchmark 的死亡过程：(1) 发布 → (2) 被 fine-tune 进训练数据 → (3) 模型表现接近天花板 → (4) 区分度归零。MATH benchmark 已经走到这一步，新模型间差异被噪声盖过，无法做有意义的排名。

更深的问题是：**单角色评测假设"会解题 = 有数学能力"，但出题能力其实是另一个独立维度**——一个能造出难题但解不出难题的模型，可能比相反的模型更值得关注。但目前没有任何评测能拆出来这个维度。

#### 他们怎么做的？

**核心 Insight**：把评测从"解题排行榜"变成"双盲对抗赛"。每个模型既出题又解题，用心理测量学的 Rasch model 同时估计"selv 能力"和"题目难度"——出题质量 = 你出的题目让别人困难的程度。

具体方法流程：
1. **三阶段题目生成**：meta-prompt → problem generation → difficulty amplification（同模型自我加大难度）
2. **独立验证器**剔除 ill-posed 题（无解、有歧义）
3. **Rasch model 联合估计**：从所有 model × problem 的对答矩阵反推每个模型的 ability 和每道题的 difficulty
4. **Author quality** 派生：作者模型的得分 = 它出的题平均难度

#### 关键结果

| 现象 | 数据/结论 |
|------|---------|
| 解题 vs 出题相关性 | 部分解耦——某些模型解题强但出题平庸 |
| 评估 model 数 | 19 个前沿模型同时排名 |
| Benchmark 饱和 | 不出现——新模型出的新题打败旧 SOTA |
| 公开 leaderboard | 新模型加入即更新 |

**结果解读**：
- **"作答 ≠ 出题"是有意思的发现**：这意味着我们之前所有的 LLM 排名都忽略了 generative 能力的一个重要维度。
- **"co-evolving difficulty"是核心创新**：传统 benchmark 是 fixed test set，MathDuels 让 test set 跟着 SOTA 一起涨。这是一个非常优雅的设计。
- 但有一个隐忧：**新模型出的题并不一定是"更好的数学题"，可能只是"更适合击败前任 SOTA 的对抗样本"**。Rasch model 假设难度是 unidimensional 的，这个假设在被对抗 prompt 优化后可能 break。

#### 局限性与开放问题

- **Rasch model 的单维难度假设可能不成立**：如果某个模型出的题专门攻击另一个特定模型的弱点，这就不是一个稳定的"difficulty"维度了。
- **缺乏跨任务迁移验证**：在 math 上 work 不代表在 code、reasoning、science QA 上同样 work。
- **对抗性出题可能 collapse 到"无意义难题"**：作者用了 verifier 排除 ill-posed 题，但 verifier 本身也是 LLM——会不会被欺骗？

#### 💡 对我们的启发

1. **直接可迁移到 code generation 评测**：你完全可以做一个 **CodeDuels**——每个模型既是代码生成者，也是测试用例出题者。Rasch model 会同时给出"代码能力"和"测试设计能力"两个维度。这两个维度的相关性数据本身就很有意思，可以揭示哪些 model 是"能写但测不全"的。

2. **具体实验想法（2-3 周）**：拿 5-8 个开源 code LLM（DeepSeek-Coder / Qwen-Coder / CodeLlama / StarCoder / Yi-Coder），让每个出 N 道编程题（带 reference solution + 测试），其他模型解。用 Rasch model 反推 ability。预期发现：(a) ability ranking 跟 HumanEval 排行榜不完全一致（说明 HumanEval 已饱和）；(b) "出题能力"独立于"解题能力"——会成为一篇有声量的 evaluation methodology 短论文。

3. **研究趋势判断**：**self-play evaluation** 会是 2026 年评测领域的一条主线。它解决了 benchmark 静态化的根本问题。这条路线和你"benchmark 合理性"的研究主线高度契合，建议保持长期跟踪——可能 12-18 个月内会出现真正普及的开源框架。

---

## 方法对比

| 维度 | CrossCommitVuln | TestGeneralizer | Tool Attention | MathDuels |
|------|----------------|-----------------|----------------|-----------|
| 核心方法 | 手工 commit-chain 标注 + SAST 跑分 | LLM 三阶段场景模板化 | ISO embedding + lazy schema | 自博弈 + Rasch model |
| 数据需求 | 真实 CVE + git 历史 | 任意带初始测试的项目 | 工具 schema 库 | LLM 选手集合 |
| 计算开销 | 低（rule-based scan） | 中（多次 LLM 调用） | 极低（embedding only） | 高（M² 次模型对答） |
| 适用场景 | 漏洞检测 benchmark 评估 | 项目级测试增强 | 大规模 MCP agent 部署 | 防 benchmark 饱和 |
| 主要局限 | 样本量小（n=15）、仅 Python | 依赖高质量 initial test | 真实 LLM 端到端未验证 | Rasch 单维假设可能 break |
| 跟博主的契合度 | RepoRescue 标注、根因分析 | LLM repair 的测试质量 | Agent marginal value 量化 | Code-evaluation methodology |

---

## 一句话收尾

四篇论文，一个共同主题：**当评估 pipeline 本身被默认接受时，最大的研究 ROI 就藏在重新定义评估单位里**。这正是你"边际价值量化 + benchmark 合理性"两条主线的甜蜜区——CrossCommitVuln 和 MathDuels 给了你两个可以立刻借用的方法论原型。
