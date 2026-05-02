---
title: "arXiv 每日速递 2026-05-03"
date: "2026-05-03"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-03

## 今日总结

今天的 SE / Agent 评测板块出现了一组耐人寻味的论文：从 **25 年开源项目里 util 文件的实证考古**，到 **agent benchmark 必须"活"起来的呼吁**，再到 **agent sandbox 内核级 checkpoint 的 75% 稀疏性观察**，最后是 **terminal-agent 任务设计的对抗性指南**。这四篇放在一起，正在合奏一个新趋势：**Agent/SE 评测正在从"看终态成功率"转向"看过程可信度"**。对正在做 agent 边际价值量化的我们而言，这是一组方法论级别的弹药——尤其那篇 Crab 论文的 "75% turn 没有 OS-relevant 状态变化" 几乎可以直接迁移成 SWE-bench 类 trace 的过滤器。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Unsafe and Unused? A History of Utility Code](http://arxiv.org/abs/2604.28146v1) | SE Empirical / Mining | 7 个长期开源项目 147 项目年纵向研究，util 文件涉漏率高达非 util 的 2.75× | ⭐⭐⭐ |
| [Claw-Eval-Live: A Live Agent Benchmark](http://arxiv.org/abs/2604.28139v1) | Agent Benchmark | 把 benchmark 拆成"可刷新信号层 + 可复现快照"，13 个前沿模型最高 66.7% pass | ⭐⭐⭐ |
| [Crab: Semantics-Aware C/R for Agent Sandboxes](http://arxiv.org/abs/2604.28138v1) | Agent OS / Trace Analysis | eBPF 桥接 agent-OS 语义鸿沟，75% turn 无副作用，recovery 正确率 8% → 100% | ⭐⭐⭐ |
| [What Makes a Good Terminal-Agent Benchmark Task](http://arxiv.org/abs/2604.28093v1) | Benchmark Methodology | 主流 terminal-agent benchmark 中 >15% 任务可被 reward hack | ⭐⭐⭐ |

## 今日主题：Agent/SE 评测正在长出真实的牙齿

如果用一句话概括今天这四篇论文的共性：**之前我们用 benchmark 来"评分"，现在论文界开始用 benchmark 来"质疑评分本身"**。

这种集体性反思可能源于一个尴尬的事实：当前主流 SWE-bench / Terminal-Bench / 各种 agent leaderboard 上，模型分数还在涨，但这些分数和工业界真实生产力的相关度反而越来越模糊。今天四篇论文从四个互补的角度切入这个鸿沟——

- **Util Code 论文**用 25 年纵向数据告诉你：连"哪些代码该被 benchmark"这种最基础的问题，社区都没认真问过——结果一类高漏洞代码长期被忽视。
- **Claw-Eval-Live** 把"benchmark 衰老"这个隐性问题制度化解决：一边是定期刷新的 demand signal，一边是冻结的 release snapshot。
- **Crab** 从内核视角观察 agent，发现 75% 的 turn 根本不产生 OS 副作用——这意味着我们一直在为大量"空 turn"花成本和算力。
- **Terminal-Agent Benchmark Guide** 直接喊话：写 benchmark 任务和写 prompt 是反向的——prompt 要让 agent 成功，benchmark 要让 agent 暴露。

把四篇并读，对正在做 agent 边际价值量化的人来说几乎是同步的："我们一直怀疑的那些事情，现在有数据了。"

---

### Unsafe and Unused? A History of Utility Code in Mature Open Source Projects

> **推荐理由**：纯实证 SE，做了 7 个项目 × 147 项目年的纵向 mining，发现 util 文件比非 util 文件多 **2.75 倍**漏洞涉及概率——这恰好是博主一直关注的"被忽视的工程质量维度"和"benchmark 设计盲区"

📌 **论文信息**：Brandon Keller, Kaitlin Yandik, Angela Ngo, Andy Meneely | [arXiv:2604.28146](http://arxiv.org/abs/2604.28146v1) | cs.SE

#### TL;DR
开源项目里以 `util` 命名的文件不仅没让代码变干净，反而成了高风险区——它们与 CVE 涉及的概率是非 util 文件的 2.75 倍，且常出现"作者一人维护、同事不复用"的孤岛模式。

#### 问题是什么？
"util" 这个命名约定无处不在——Apache Tomcat 925 个 util 文件，占源码 17.9%。社区**默认**假设：把通用代码抽到 util 是为了避免重复、降低工作量。但**真的吗？** 这个假设几乎从来没被实证过。

更具体的问题是：当一个文件的命名宣称"我是公共工具"时，它在项目演化中会发生什么？是被广泛复用（assumption work）、还是逐渐变成代码垃圾场（util as dumping ground）？而当 util 文件涉及安全敏感操作（字符串处理、I/O、协议解析）时，假设落空的代价是漏洞。

#### 他们怎么做的？
**核心 Insight**：用 30 天为间隔的快照在 7 个长期项目（Linux kernel、Django、FFmpeg、httpd、Struts、systemd、Tomcat）上做纵向 mining，跟踪文件级生命周期 + rename，把"util-ness"作为一个时间序列变量来研究。

具体方法流程：
1. **快照采样**：每 30 天打一次快照，覆盖整个项目历史，共 1773 个快照。
2. **rename 跟踪**：在每个快照对 util 文件做改名追踪，把"曾经叫 util / 后来改名"等转移情况都纳入文件的完整生命周期。
3. **多维相关分析**：在每个快照上同时测 util 使用率、复杂度、协作者数量、安全涉及（CVE 相关 commit）四个维度，做时间相关。

**跟之前方法的本质区别**：以前关于 util 的研究多停留在某个版本的横切（"this version has X util files"），他们做的是**纵向人口学**——同一个文件随时间长成什么样、谁在用、是不是出 CVE。这种纵向视角让"unused" 和 "unsafe"两个看似无关的属性的相关性浮了出来。

#### 关键结果

| 维度 | 发现 | 备注 |
|------|------|------|
| 漏洞涉及率 | util 文件相对非 util 高达 **2.75×** | 跨 7 个项目的最大值 |
| util 占比 | Apache Tomcat 中 925 文件 / 17.9% | 单项目级别已成主体 |
| 协作模式 | util 文件常呈"作者孤岛"模式 | 与"广泛复用"假设相反 |
| 时间趋势 | 项目成熟后 util 占比并不下降 | "项目变好后 util 会被吸收"假设也错 |

**结果解读**：
- 2.75× 的漏洞涉及率意味着如果你做安全 fuzz / SAST 的 prioritization，util 路径应该被重点 weight——但当前主流静态扫描工具基本不区分。
- 协作模式的发现也很反直觉：如果 util 真是"通用工具"，应该是多人维护多人 commit，但实际是单作者 owns + 同事不来。这恰恰是工业界众所周知的"util 是垃圾场"现象的第一份大规模证据。

#### 局限性与开放问题

- **局限 1**：基于文件名启发式（`util` 出现在路径里）。这种识别会漏掉很多语义上是 util 但命名不同的文件（如 `helpers/`、`common/`），结论可能反而是低估。
- **局限 2**：只覆盖了 7 个 C/Java/Python 项目。Rust、Go、TypeScript 的 util 文化可能完全不同（Rust 有 `*-utils` crate 拆分习惯）。
- **开放问题**：util 高漏洞率的因果方向不清——是"放进 util 的代码本来就敏感"还是"util 文件因协作不足才更易出 bug"？需要 instrumental variable 类的因果设计才能厘清。

#### 💡 对我们的启发

1. **直接可用的技术点**：我们做 OpenHarmony / ArkTS HomeCheck 工具的时候，可以**单独把 util 类文件拎出来跑更激进的检查**——这篇论文给了 2.75× 这个数字作为 prioritization 的实证基础。具体落地：在 HomeCheck 配置里加一个 "high-priority paths" rule，匹配 `*util*`/`*helper*`/`*common*` 路径并启用更高敏感度的安全规则集。
2. **具体实验想法（1-2 周可做）**：在我们已有的 RepoRescue benchmark 基础上，**统计真 entry（T0 PASS + T1 FAIL）的 util 路径占比**——如果 util 文件在依赖升级失败的修复点中显著富集，就有了"util 不仅是漏洞热点，也是兼容性升级热点"的新维度，能直接成为新的 paper claim。预期观察：util 文件在 fix patch 里 over-represent。
3. **研究趋势判断**：纵向 mining + 文件级生命周期跟踪正在重新成为 SE 实证主流——LLM/agent 时代我们一直把数据集"扁平化"为 input-output 对，丢掉了时间维度。这篇论文提醒我们：很多 benchmark 的真正价值不在 N 个样本，而在 N 个样本的**时间结构**。

---

### Claw-Eval-Live: A Live Agent Benchmark for Evolving Real-World Workflows

> **推荐理由**：直接命中博主关于"benchmark 合理性"的研究主线——把"基准随时间衰老"这个一直没人正面回应的问题，用"信号层 + 快照层"的解耦设计制度化解决

📌 **论文信息**：Chenxin Li, Zhengyang Tang, Huangxin Lin, Yunlong Lin, Shijue Huang | [arXiv:2604.28139](http://arxiv.org/abs/2604.28139v1) | cs.SE / cs.AI

#### TL;DR
Workflow agent benchmark 不应该是冻结的题库——这篇把 benchmark 拆成两层：上面是**会刷新的需求信号层**（来自 ClawHub Top-500 真实 skill 排名），下面是**冻结的 release snapshot**（带 fixture / service / grader）。13 个前沿模型测下来，最强的也只过了 66.7%，没有一个到 70%。

#### 问题是什么？
当前 agent benchmark 有两个老问题：
1. **题库死了**：发布时冻结的 task set 跟不上工业界 workflow 实际变化。例如 GitHub PR review、Slack 通知、Zoom 会议这些"workflow 原语"每年都变，但 benchmark 不会。
2. **只看终态**：大部分 grader 只看 final response，不看 agent 是不是真的执行了。一个 agent 可能"嘴上说做了"但 service state 完全没动——这种 task verification 漏洞会让分数虚高。

更隐蔽的是：当 leaderboard 都在 80%+ 时，到底是模型变强了，还是 benchmark 被记住了？区分不开。

#### 他们怎么做的？
**核心 Insight**：把 benchmark 拆成两层 —— **可刷新的 demand signal 层**（每个 release 重新从 ClawHub Top-500 工作流技能排名采样）+ **可复现的 release snapshot**（fixture + service state + 时间戳锁定）。前者保证"题目随真实需求演化"，后者保证"分数仍然可比"。

具体方法流程：
1. **Demand 采样**：从 ClawHub 公开的 workflow demand signal（实际被使用的 skill）抽 Top-500，作为本期 release 的题源池。
2. **Task materialization**：把抽出的 skill 翻译成具体 task，绑定 fixture（输入数据）、service（mock 业务系统）、workspace（工作目录）、grader。
3. **多源证据 grading**：同时记录 execution trace、audit log、service state、post-run workspace artifact。能用 deterministic check 的优先 deterministic（比如"这个 commit 推到 main 没有"），只有语义维度才用 LLM judge。

**跟之前方法的本质区别**：以前的"live benchmark"通常只是"定期换题"，但题与题之间的对比性丢了。这篇通过 **demand 层 + snapshot 层的解耦** 既保留了"题目随时代变化"的鲜活感，又保留了"同一 snapshot 下不同模型可对比"的科学性。这是 benchmark 设计上的一个真正进展。

#### 关键结果

| 任务族 | 顶级模型 pass rate | 评注 |
|--------|------------------|------|
| 整体（105 task / 13 模型） | 最高 **66.7%**，无一过 70% | 远未饱和 |
| HR / 管理类多系统业务 workflow | 持续 bottleneck | 跨 system state 协调最难 |
| Local workspace 修复 | 相对容易但未饱和 | 比业务 workflow 简单 |
| 同档分模型差异 | pass rate 接近，但 overall completion 分化 | 单一指标不够 |

**结果解读**：
- "13 个最强模型没人过 70%"这个数字非常重要——它说明 workflow automation 远未 saturate，相比 SWE-bench 那种部分 split 已经 80%+ 的状况，这里还有真信号。
- 把"业务多系统协调"识别为 bottleneck 也很有指导意义：这告诉我们 SWE 类 agent 研究里**跨系统状态同步**比单仓库代码修复更难，但社区目前 fokus 几乎都集中在后者。

#### 局限性与开放问题

- **局限 1**：依赖 ClawHub 这个特定平台的 demand signal，可能有平台 bias（用户群体、使用场景偏向）。如果 ClawHub 用户主要是某个行业，"demand" 就会对应那个行业的 workflow。
- **局限 2**：105 个 task 的样本量对"任务族级别"的统计推断偏小，特别是子族（HR/IT/code repair）切片后单族 task 数量很少，model ranking 的稳定性存疑。
- **开放问题**：如何防止"刷新机制本身被攻击"——如果 demand signal 是公开的，模型供应商完全可以预知下个 release 大概会考什么。需要保留一部分私有 hold-out。

#### 💡 对我们的启发

1. **直接可用的技术点**：我们做的 RepoRescue benchmark（依赖升级 / API migration）完全可以借鉴这个"demand layer + snapshot layer"架构——比如把 PyPI 的依赖升级 trending 作为 signal layer，每季度刷新一批"近期升级最频繁的 N 个包"的 entry，但每个 release 内部 entry 锁死。这样既能跟上生态演化，又保证"v2026.1 vs v2026.2 同一模型 pass rate 是可比的"。
2. **具体实验想法（1-2 周可做）**：在我们已有 agent trace 数据集上**统计 deterministic check 和 LLM judge 的一致性**。如果两者在某些 task 类别上分歧很大，那就是"LLM judge 在帮模型护盘"的证据——这能直接成为一篇方法论批判论文。预期观察：LLM judge 在"模糊语义"任务上系统性偏宽松。
3. **研究趋势判断**：benchmark 设计正从"任务集"向"任务流水线"演化——以后的 benchmark 不仅有题，还有题的产生机制 + 证据收集机制 + 评分协议。这意味着 benchmark 论文的"工程含量"会越来越高，更像 dataset infrastructure 论文。

---

### Crab: A Semantics-Aware Checkpoint/Restore Runtime for Agent Sandboxes

> **推荐理由**：博主一直在做"agent 单步设计动作的边际价值量化"——这篇用 eBPF 实测发现 **超过 75% 的 agent turn 不产生任何 recovery-relevant 的 OS 状态变化**，几乎是用内核数据帮你做了一次"agent step 边际价值"的体检

📌 **论文信息**：Tianyuan Wu, Chaokun Chang, Lunxi Cao, Wei Gao, Wei Wang | [arXiv:2604.28138](http://arxiv.org/abs/2604.28138v1) | cs.OS / cs.AI

#### TL;DR
Agent sandbox 的 checkpoint/restore 一直卡在两个极端：app 层只记 chat history（漏掉 OS 副作用），全 turn checkpoint 又太贵。Crab 用 eBPF 监测每个 turn 的 OS-visible 副作用，发现**>75% 的 turn 无副作用**——只对剩下 25% 做 checkpoint，把 recovery 正确率从 8% 拉到 100%，traffic 砍掉 87%。

#### 问题是什么？
现在的 autonomous agent（Claude Code、Devin、Cursor agent 之类）跑在 sandbox/microVM 里，它们的状态既包括 LLM 上下文（chat history），也包括 OS 状态（filesystem、processes、runtime artifact）。要做 fault tolerance / spot execution / RL rollout / safe rollback，必须能 checkpoint。

但当前两条路都不好走：
- **App 层 checkpoint**：只存 chat history。restore 后 LLM 以为它已经做了某个 `pip install`，但实际 sandbox 里 package 不存在 —— **silent inconsistency**。
- **每 turn 全 OS checkpoint**：100% 正确，但 dense co-location 下 I/O 直接打爆。

更深层的问题作者称作 **agent-OS semantic gap**：agent framework 看得到 tool call 但看不到 OS 副作用；OS 看得到状态变化但不知道 turn 边界。两边都不知道"这次 turn 该不该 checkpoint"。

#### 他们怎么做的？
**核心 Insight**：用 eBPF 在内核层监测每个 turn 的 OS-visible 副作用，**根据副作用的存在与类型自适应决定 checkpoint 粒度**——而不是统一每 turn 全存。这样对那 75% 没副作用的 turn，开销近乎 0。

具体方法流程：
1. **eBPF inspector**：在内核挂 BPF probe，按 turn 边界聚合 syscall 副作用（file write、process spawn、network state）。
2. **Coordinator**：把 checkpoint 时机对齐到 turn 边界，并把 C/R I/O **overlap 到 LLM 等待时间**——LLM call 通常要几秒到几十秒，I/O 完全可以藏进去。
3. **Host-scoped engine**：跨 co-located sandbox 调度 checkpoint traffic，避免雪崩。

**跟之前方法的本质区别**：以前 C/R 系统（CRIU / SCM）都是"通用过程级"，不知道 agent 的 turn 概念；agent 框架的 checkpoint 又不懂 OS。Crab 是**第一个把 turn-level 语义和 kernel-level 状态观察缝合起来**的运行时——既不改 agent，也不改 C/R 后端。

#### 关键结果

| 指标 | Before（chat-only） | Crab |
|------|--------------------|------|
| Recovery correctness | **8%** | **100%** |
| Checkpoint traffic | baseline | -87% |
| Fault-free 时间开销 | - | +1.9% |
| 无副作用 turn 占比 | - | >75% |

**结果解读**：
- 8% → 100% 的 recovery correctness 是个戏剧性数字，说明此前 chat-only checkpoint 几乎完全没用——而这是当前大量 agent 框架默认做法。
- "75% turn 无副作用"这个数字比 checkpoint 本身更有方法论价值：**它直接量化了 agent step 中"真正改变世界"的步骤比例**。剩下 75% 是什么？大部分是"读文件 / 思考 / 输出文本"这类 read-only 步骤。

#### 局限性与开放问题

- **局限 1**：eBPF 依赖 Linux kernel 版本和能力，跨 Mac/Windows agent 环境（如本地 Cursor 用户）不通用。
- **局限 2**：以 OS 副作用 = recovery-relevant 这个等价并不严格——比如 LLM 内部的 plan 状态变化不留 OS trace，但对 task 进度至关重要。Restore 时只恢复 OS 不恢复 plan 可能仍然偏题。
- **开放问题**：跨 turn 的因果链没考虑——某个 turn 的副作用可能是后续多个 turn 的前置条件，按"无副作用"跳过的 turn 可能在某些 fault scenario 下其实需要重放。

#### 💡 对我们的启发

1. **直接可用的技术点**：我们做 SWE-bench / Aider trace 大规模事后分析时，可以**借用 Crab 的 eBPF turn 分类思路**——把 trace 里每个 step 按"是否产生 file/process/network 副作用"打 tag，然后量化"真正修改 repo 的 step 比例"。这能为我们已经做的 test execution 边际贡献 1.25pp 那个结果提供新的解释维度——可能贡献低恰恰是因为大量 step 是 read-only 推理。
2. **具体实验想法（1-2 周可做）**：在 SWE-bench 公开 trace（Claude / OpenHands）上做一个小型 trace 标注实验——人工标注 200 条 trace 的每个 step 的"副作用类型"（read / search / write / exec / propose-only），然后看**最终 pass 的 trajectory 与 fail 的 trajectory 在副作用分布上的差异**。如果 fail 主要是"propose 多 / exec 少"，就有了 SWE-agent 失败模式的新定量画像。
3. **研究趋势判断**：Agent observability 正在下沉到内核/系统层——前几年大家在 LLM 输出层做 agent 分析（chain-of-thought / tool call log），现在开始往 OS 层走。这意味着未来 agent 评测的"基础设施层"会变成 OS 工具的天下，而不是 NLP 工具的天下，**对系统出身的研究者是结构性利好**。

---

### What Makes a Good Terminal-Agent Benchmark Task

> **推荐理由**：直接对应博主"benchmark 设计与方法论批判"主线——以 Terminal Bench 实战经验告诉你为什么主流 agent benchmark 中 **15%+ 任务可以被 reward hack**，并列出了一份避坑清单

📌 **论文信息**：Ivan Bercovich | [arXiv:2604.28093](http://arxiv.org/abs/2604.28093v1) | cs.AI

#### TL;DR
作者基于一年多 Terminal Bench 任务审稿经验，提出一个反直觉的口号——**好的 benchmark 任务应该是对抗性的、困难的、可读的**，而当前社区把"写 benchmark 任务"等同于"写 prompt"，导致主流 terminal-agent benchmark 中超过 15% 的任务可被 reward hack（即 agent 可以不真正完成任务但骗到 pass）。

#### 问题是什么？
"prompt 是为了帮 agent 成功；benchmark 是为了发现它能不能成功" —— 这两件事方向**完全相反**。但因为社区对 benchmark task 的需求暴涨（每个新 capability 都要 benchmark），写 task 的人越来越多用"写 prompt"的姿势写 task，导致一系列系统性失败模式：

- **AI 生成的 instruction**：用 LLM 写题，结果模型对"自己人语言"特别擅长。
- **过度规约**：把解法都写在题面里。
- **Clerical difficulty**：把"难"做成"乱"——堆 boilerplate 但没真正难度。
- **Hidden knowledge oracle**：参考解假设了题面没说的知识。
- **测错对象**：测 pretty-print 而不是逻辑正确。
- **Reward-hackable env**：不真正完成任务也能 pass。

#### 他们怎么做的？
**核心 Insight**：把"benchmark task 不是 prompt"作为一个明确的设计原则，并把"adversarial / difficult / legible"操作化为可审稿的 checklist。

具体方法流程：
1. **失败模式 catalog**：列出 6 类常见失败模式，每个配真实案例。
2. **对抗审稿流程**：每个新 task 必须经过"找 reward hack 路径"的对抗 review（而不是"看看能不能跑通"的友好 review）。
3. **概念难度 vs 环境难度的区分**：真正的难应来自**概念难度**（比如分布式系统状态推理），而不是环境难度（比如要在 50 个文件里找一个）。

**跟之前方法的本质区别**：以前 benchmark methodology 论文要么停留在"benchmark 评分指标"层面（pass@k、Elo），要么停留在"data leakage"层面（contamination）。这篇直接下沉到**单个 task 的设计哲学**——更细粒度、更可操作。

#### 关键结果

| 发现 | 数据 |
|------|------|
| 主流 terminal-agent benchmark 可被 reward hack 的任务占比 | **>15%** |
| 失败模式分类 | 6 大类 |
| 推荐的设计原则 | adversarial / difficult / legible |

**结果解读**：
- "15% reward-hackable" 这个数字非常 stark——意味着当前 agent leaderboard 上每 7 个任务就有 1 个测的不是它声称要测的能力。这直接拉低了任何"X 模型在这个 benchmark 上 +Y%"类 claim 的可信度。
- 论文是"经验报告 + 指南"型，没大量 quant 实验，但作为方法论文献它的价值不在数字而在 framework。

#### 局限性与开放问题

- **局限 1**：单一作者经验视角，"15%"这个数字没有公开可复现的统计协议。如果换 5 个 reviewer 重新打分，可能在 8%-25% 之间。
- **局限 2**：focus 在 terminal agent，对非 terminal agent（比如纯 web agent、纯 GUI agent）的迁移性需要单独验证。
- **开放问题**：即使知道这些 anti-pattern，**自动化检测它们**仍未解决。需要把 6 大失败模式编码成自动化 lint 规则，否则规模化审稿仍然不可行。

#### 💡 对我们的启发

1. **直接可用的技术点**：我们做的所有 agent trace 分析论文都可以**主动用这 6 个 anti-pattern 反过来检查 SWE-bench / Terminal-Bench 中的 task**——挑出可疑 task，单独切一个"高质量子集"，在子集上重新评估各模型，对比与全集 ranking 的差异。如果排名显著变化，就有了 "SWE-bench 子集敏感性"这类有价值的方法论 paper。
2. **具体实验想法（1-2 周可做）**：建一个**"reward hackability detector"**——给定一个 SWE-bench task，自动检查 (a) 测试是否只验输出格式不验语义、(b) 题面是否暗含解法、(c) 参考解是否依赖未声明的环境状态。能跑就发一个 short workshop paper，跑不通也能成为"为什么自动化 hackability 检测难"的实证证据。
3. **研究趋势判断**：未来 1-2 年会出现"benchmark 的 benchmark"——评测各 benchmark 设计质量本身的元 benchmark。这是博主"benchmark 方法论批判"主线的天然落点，应该优先抢占这个赛道。

---

## 方法对比

把今天这四篇并排放，能更清楚看到它们如何从不同层面切入"agent 评测可信度"这同一问题：

| 维度 | Util Code 历史 | Claw-Eval-Live | Crab | Terminal Benchmark Guide |
|------|--------------|---------------|------|------------------------|
| 切入层 | dataset 来源（哪些代码该被测） | benchmark 演化机制 | agent 运行时观察 | task 设计原则 |
| 方法 | 纵向 mining + rename 跟踪 | 双层架构（signal + snapshot） | eBPF + turn-aligned C/R | 经验汇编 + checklist |
| 数据需求 | 7 项目 × 25 年 git history | 105 task × 13 model | 真实 agent 运行 trace | 一年 review 经验 |
| 核心数字 | 2.75× util 漏洞涉及率 | 最高 66.7% pass | 75% turn 无副作用 / 8% → 100% recovery | >15% task 可 reward hack |
| 主要局限 | 文件名启发式、单生态 | 平台 demand bias | OS-only（漏 LLM plan 状态） | 单作者主观 |
| 对我们 | 启发 dataset prioritization | 启发 RepoRescue 二层化 | 启发 trace step 副作用分类 | 启发 benchmark 子集分析 |

**一个潜在的 follow-up 选题**：把 [16] 的 util prioritization × [20] 的 turn 副作用分类 × [34] 的 reward hackability 检测三件事合起来，做一个"**SWE-bench Pathology Map**"——逐 task 标注"是否涉及 util 文件 / 是否包含纯 propose turn / 是否可被 reward hack"，然后看模型分数与这些 pathology 的相关。这能成为一篇 ICSE / FSE empirical track 的扎实工作，并且完美契合"边际价值量化"的研究哲学。
