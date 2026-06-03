---
title: "arXiv 每日速递 2026-06-04"
date: "2026-06-04"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-06-04

## 今日总结

今天这批论文里，最值得我们关注的一条暗线是**"实验室里的 agent"和"真实部署的 agent"之间那道越来越扎眼的 gap**。三篇论文从不同侧面捅破了同一个窗户纸：RealClawBench 用真实开发者会话重建 benchmark，发现最强系统也只能解 65.8%；一篇 cs.SE 研究协议干脆把镜头对准 agent 写代码时"自己造轮子还是装库"的隐性决策；PROVE 则承认现有 tool-use 训练数据"根本跑不起来"，转而在真实可执行的 MCP 环境里合成 grounded 轨迹。再加一篇 VaSE 把 reasoning 模型的 KV cache 压到 4× 还不掉点——这是本地部署小模型绕不开的工程现实。今天值得深读，尤其是前三篇，正好砸在你"agent 边际价值实证 + benchmark 方法论批判"的主线上。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [RealClawBench](http://arxiv.org/abs/2606.03889) | agent benchmark | 用真实开发者-agent 会话重建 281 个可执行任务，SOTA 仅 65.8% | ⭐⭐⭐ |
| [Configuring Agentic Coding Tools (Build-vs-Buy)](http://arxiv.org/abs/2606.03907) | LLM4SE / agent 行为 | 预注册协议：研究配置机制如何左右 coding agent "造轮子 vs 装库"决策 | ⭐⭐⭐ |
| [PROVE](http://arxiv.org/abs/2606.03892) | tool-use RL / 小模型 | 20 个有状态 MCP server + grounded 轨迹合成 + 纯程序化 reward，4B/8B 模型涨点 | ⭐⭐ |
| [VaSE](http://arxiv.org/abs/2606.03928) | 本地推理 / KV cache | training-free KV cache eviction，保护大幅值 value state，4× 压缩仍超 SOTA | ⭐⭐ |

## 今日主题：真实部署的 agent，到底差在哪一环？

把今天这几篇放在一起看，它们其实在回答同一个问题的三个不同环节：**当 agent 从 demo 走向真实生产，链条的哪一节会断？**

- **评估环节断了**：RealClawBench 指出现有 agent benchmark 的任务分布根本不像真实用户问的东西——真实请求依赖本地执行环境、意图含糊、验证困难。它用真实会话重建任务后，模型分数应声而落到 65.8%。这正是你一直在做的"真实 vs 合成 benchmark 偏差实证"的活样本。
- **行为环节没人测**：Build-vs-Buy 那篇更狠，它盯住了一个几乎没人量化过的隐性决策动作——agent 写代码时**默默决定**是自己实现一个功能还是 import 一个库。这个决策直接牵连安全、licensing、可维护性，但"哪种配置机制（context 文件 / Skill / MCP 工具 / 权限）最能左右它"完全是黑箱。这是典型的**单个设计动作的边际价值量化**思路，只不过对象从 test execution 换成了 build-vs-buy。
- **训练环节喂错了料**：PROVE 承认现有 tool-use 训练数据"detached from server state"——合成的 query 引用了根本不存在的实体，于是 tool call 全部执行失败、RL 拿不到 reward。它的解法是先建真实可执行的有状态环境，再在上面合成 grounded 轨迹。

三篇共同揭示的趋势是：**agent 研究正在从"造更强的框架"转向"诚实地度量和修复真实性 gap"**。这跟你"不做学术 rubbish、产出真能被用上的 benchmark/guideline"的研究哲学高度同频。VaSE 则是另一条线——当你想把这些 agent 跑在本地小模型上时，长 reasoning 链的 KV cache 是绕不开的墙，它给了一个 training-free 的实用解。

---

### RealClawBench: Live OpenClaw Benchmarks from Real Developer-Agent Sessions

> **推荐理由**：直接命中你"真实 vs 合成 benchmark 偏差实证 + 公开 agent trace 大规模事后分析"的主线。它把真实部署会话变成可复现、自动评分的任务，方法论几乎可以原样搬到你的 agent 边际价值研究里。

📌 **论文信息**：Zongwei Lv, Zhewen Tan, Yaoming Li 等 | [arXiv:2606.03889](http://arxiv.org/abs/2606.03889) | cs.CL

> ⚠️ ar5iv 尚未渲染该 2606 新论文（重定向回 abs 页），故本文暂无配图。

#### TL;DR
从真实 OpenClaw 开发者会话里抽取 281 个可执行任务，用"重建执行环境 + 确定性可验证 scorer"把不可复现的真实会话变成自动评分的 benchmark；评测 14 个模型，最强的也只解 65.8%。

#### 问题是什么？
agent benchmark 长期有个尴尬：它们测的任务和用户真正丢给 agent 的活儿对不上。真实开发者请求有三个"脏"特性——**依赖本地执行环境**（同一条指令在不同 repo 下答案不同）、**意图含糊或欠定义**（用户不会把需求写成规约）、**验证非平凡**（对错不是跑个单测就能判的）。正因为脏，大家退而求其次造合成任务，结果 benchmark 上 90% 的分数在真实场景里根本兑现不了。这就是你反复强调的"真实 vs 合成偏差"在 agent 时代的最新版本。

#### 他们怎么做的？

**核心 Insight**：与其凭空造任务，不如把真实会话"冻干"成可复现实例——关键是补上真实会话缺失的两样东西：可重建的执行环境 + 确定性的 scorer。

具体方法流程：
1. **采样保分布**：从一个大得多的真实会话池里采 281 个任务，但刻意保持采样后任务分布贴近源分布（最大 final-vs-source Jensen-Shannon 散度仅 0.0448）。这一步是方法论亮点——它不是随便挑"好测的"任务，而是证明了采样没有扭曲真实难度分布。
2. **重建执行环境**：把每个会话依赖的本地环境复原成可复现容器，解决"换个机器答案就变"的问题。
3. **确定性可验证 scorer**：为每个任务写死一个可自动判定的验证器，绕开 model-as-judge 的噪声和循环依赖。

**跟之前方法的本质区别**：不是"又一个更难的 benchmark"，而是**保真采样 + 确定性验证**这套把真实会话工业化的协议。SWE-bench 是从 GitHub issue 反推任务，RealClawBench 是从真实交互会话正向重建——后者的意图含糊性和环境依赖性是前者没覆盖的维度。

#### 关键结果

| 维度 | 数值 | 解读 |
|------|------|------|
| 可执行任务数 | 281 | 从更大真实会话池采样 |
| 采样分布保真度 | JS 散度 ≤ 0.0448 | 证明采样未扭曲真实难度 |
| 评测模型数 | 14 | 当代主流系统 |
| 最强系统通过率 | 65.8% | 真实工作负载留有大量 headroom |

**结果解读**：65.8% 这个数字本身就是论点——它说明真实 developer-agent 工作负载远没被"解决"。提升空间主要来自那些**依赖环境、意图欠定义**的任务，而这恰恰是合成 benchmark 系统性回避的部分。JS 散度 0.0448 是这篇最该被引用的方法学贡献：它把"我这个 benchmark 真实"从口号变成了可度量的声明。

#### 局限性与开放问题

- **局限 1**：281 个任务源自 OpenClaw 单一生态，分布保真度只能保证"对 OpenClaw 用户真实"，跨工具（Claude Code、Codex、Aider）的迁移性未验证。
- **局限 2**：确定性 scorer 能覆盖的任务类型有天花板——那些"好坏见仁见智"的开放式重构 / 设计决策可能恰恰被排除在 281 之外，于是采样保真度和可验证性之间存在隐性 trade-off，论文没量化这个被排除的尾巴有多大。
- **开放问题**：它解决了"如何把真实会话变成可复现 benchmark"，但"用户意图欠定义本身要不要作为评估维度"（即 agent 主动澄清的能力）仍未纳入打分。

#### 💡 对我们的启发

1. **直接可用的技术点**：那个**保分布采样 + JS 散度证明**的协议，可以原样移植到你的 agent trace 事后分析里。你做 SWE-bench / OpenHands 日志大规模分析时，最大的攻击点之一就是"你采样的子集有没有偏"——用 JS 散度对源分布做保真度证明，能直接堵住 reviewer 这一刀。
2. **具体实验想法**：拿你手上的公开 agent trace（比如 OpenHands 日志），按 RealClawBench 的方式做一次"真实 vs 该 agent 官方 benchmark"的分布对比——输入是两批任务的特征向量（涉及文件数、是否需执行、意图明确度评分），用 JS 散度量化偏差，预期能观察到官方 benchmark 在"意图明确度"维度上系统性偏高。这是一个 1-2 周能出图的小实证，且结论天然有冲击力。
3. **研究趋势判断**：agent 评估正在从"分数"转向"分布保真 + 确定性验证"。这条线和你的 process quality vs outcome correctness 思路完全合流——下一步值得押的是把"确定性 scorer"和"过程质量度量"结合，做一个既测对错又测过程的真实会话 benchmark。

---

### The Impact of Configuring Agentic AI Coding Tools on Build-vs-Buy Decisions: A Study Protocol

> **推荐理由**：这是今天唯一一篇把"coding agent 的单个隐性决策动作"拎出来做受控实验的 cs.SE 论文，思路和你的"边际价值量化"是一模一样的方法论 DNA——只不过对象从 test execution 换成 build-vs-buy。

📌 **论文信息**：Jai Lal Lulla, Matthias Galster, Jie M. Zhang, Sebastian Baltes, Christoph Treude | [arXiv:2606.03907](http://arxiv.org/abs/2606.03907) | cs.SE, cs.AI, cs.HC

> ⚠️ ar5iv 尚未渲染该 2606 新论文，故本文暂无配图。

#### TL;DR
一份**预注册研究协议**：系统研究"配置机制"（context 文件、Skill、MCP 工具、权限控制）如何影响 Claude Code 和 OpenAI Codex 在写代码时"自己造轮子还是 import 外部库"的决策，并衡量 agent 是否如实披露新引入的依赖。

#### 问题是什么？
agentic coding tool 写代码时，**每次都在做一个几乎无人量化的决策**：这个功能我自己实现，还是装个库？这个 build-vs-buy 决策直接牵连安全（多一个依赖多一份攻击面）、licensing 合规、性能、长期可维护性。但现实是：没有任何受控实验研究过到底什么在驱动这个决策。开发者唯一能影响它的杠杆——各种"配置机制"——哪个最有效、是否真能管住 agent，完全是黑箱。这跟"test execution 到底贡献几个百分点"是同一类问题：一个被默认存在、却从没被精确测量的设计动作。

#### 他们怎么做的？

**核心 Insight**：把"配置机制 → build-vs-buy 行为"做成一个可操纵自变量的受控实验，而不是事后观察。

具体方法流程：
1. **构造 build-vs-buy 触点**：用一个 staged projects benchmark，每个项目刻意设计出可识别的 build-vs-buy 决策点。
2. **操纵配置自变量**：从"零配置"，到带软偏好和明确禁令的 context 文件，到可被自主发现的 Skill，再到 MCP 库发现工具和权限控制——逐级变化喂给 agent 的配置。
3. **测三个因变量**：agent 选了哪些库、是否披露新引入的库、披露是否完整准确。9 个预注册假设撑起整个协议，最终产出可复用的 benchmark 数据集和分析 pipeline。

**跟之前方法的本质区别**：不是"提出更好的 agent"，而是**把配置机制当实验变量去测它对一个具体决策的边际影响**。预注册（pre-registration）这一点尤其关键——它防止了 p-hacking，让"哪种配置最有效"的结论可信。

#### 关键结果

| 维度 | 内容 |
|------|------|
| 论文类型 | 预注册研究协议（study protocol，结果待跑） |
| 受测工具 | Claude Code、OpenAI Codex |
| 操纵的配置机制 | 零配置 / context 文件(软偏好+禁令) / Skill / MCP 工具 / 权限控制 |
| 测量因变量 | 选库行为、依赖披露、披露完整性 |
| 预注册假设数 | 9 |
| 产出 | 可复用 benchmark 数据集 + 分析 pipeline |

**结果解读**：这是一篇协议论文，还没有实验数字——但它的价值在于**问题定义和实验设计本身**。把"configuration mechanism 的边际价值"做成 9 个可证伪假设、预注册、配 benchmark，这套范式正是你应该收藏的模板。它隐含一个强假设值得我们盯着验证：明确禁令（explicit prohibition）是否真比软偏好更能管住 agent——直觉上是，但 agent 经常无视 context 文件里的约束。

#### 局限性与开放问题

- **局限 1**：staged projects 的 build-vs-buy 触点是人为设计的，可能和真实项目里那些"模糊地带"的决策点不同分布——这又回到了今天的主题：合成触点 vs 真实触点的偏差。
- **局限 2**：只测 Claude Code 和 Codex 两个工具，且模型会快速迭代，结论的时效性存疑（半年后模型一换，配置响应行为可能全变）。
- **开放问题**：它测的是"配置能否影响决策"，但没回答"什么样的决策是对的"——build 还是 buy 本身没有 ground truth，缺一个评判决策质量的标尺。

#### 💡 对我们的启发

1. **直接可用的技术点**：这套"**预注册 + 单个设计动作 + 可证伪假设**"的范式，可以直接套到你下一篇 agent 边际价值论文上。你做 test execution / structure injection 边际贡献时，把它写成预注册协议形式，会显著提升方法学说服力。
2. **具体实验想法**：复刻一个迷你版——选 build-vs-buy 之外的另一个隐性决策动作（比如"agent 是否主动跑测试再提交"），设计 3 档配置（无提示 / 软提示 / 强制 hook），在 5-10 个 staged 任务上测它对最终 patch 正确率的边际贡献。输入是配置档位，输出是 pass@1 差值，预期能复现你过往"test execution 只贡献约 1.25pp"那类反直觉结论。
3. **研究趋势判断**：LLM4SE 正在从"造 agent"转向"**审计 agent 的隐性决策**"——build-vs-buy、依赖披露、是否造轮子，这些都是供应链安全和可维护性的入口。你 OpenHarmony 工具链那条线完全可以接一个"ArkTS agent 的依赖引入审计"子课题。

---

### Synthesize and Reward — Reinforcement Learning for Multi-Step Tool Use in Live Environments (PROVE)

> **推荐理由**：用 4B/8B 小模型 + 纯程序化 reward（不需要 judge model）在真实可执行环境里训 tool use，命中你"小模型替代商业 API + 静态信号驱动 reward"两条偏好。

📌 **论文信息**：Ibrahim Abdelaziz, Asim Munawar, Kinjal Basu 等 | [arXiv:2606.03892](http://arxiv.org/abs/2606.03892) | cs.CL, cs.AI, cs.LG

> ⚠️ ar5iv 尚未渲染该 2606 新论文，故本文暂无配图。

#### TL;DR
针对 multi-step tool use 的三大顽疾（环境难建、合成 query 跟真实状态脱节、recall-based reward 鼓励啰嗦），PROVE 给出：20 个有状态 MCP server（343 个工具）+ 依赖图引导的 grounded 轨迹合成 + 多组件纯程序化 reward；在 Qwen3-4B/8B 等四个模型上用 GRPO 训练，BFCL/tau2-bench/T-Eval 最高涨 +10.2 分。

#### 问题是什么？
训 LLM 做多步工具编排卡在三个互相纠缠的障碍上：(1) **真实有状态执行环境造起来贵**，大家只能用假环境；(2) **合成的训练 query 跟 server 实际状态脱节**——query 引用了根本不存在的实体，于是生成的 tool call 全部执行失败；(3) **recall-based reward 奖励啰嗦**——只要把相关 tool 都叫一遍就能拿分，模型学会冗余调用。第二条尤其致命：执行全失败 → RL 没有有效 reward 信号 → 训练空转。这和 RealClawBench 指出的"benchmark 脱离真实环境"是同一个病根的训练侧版本。

#### 他们怎么做的？

**核心 Insight**：reward 不靠 judge model，而靠"在真实可执行环境里，轨迹是否真的跑通 + 跑得是否高效"——把环境的真实性变成 reward 的来源。

具体方法流程：
1. **建 20 个有状态 MCP server**（暴露 343 个工具），支持 session 级状态隔离的 live-execution RL 训练——解决"环境难建"。
2. **依赖图引导的对话模拟**：基于 live 采样的 server 真实状态合成多轮 tool-call 轨迹，保证每个 query 引用的实体真实存在——解决"query 脱节"。
3. **多组件程序化 reward**：分级有效性打分 + 依赖感知覆盖度 + 自适应效率惩罚（按复杂度缩放 call budget）+ tool-name 信号 + 参数值匹配奖励，**完全不需要外部 judge model**——解决"reward 鼓励啰嗦"。

**跟之前方法的本质区别**：不是"更大的 judge 或更多数据"，而是**让真实可执行环境同时充当数据合成的 grounding 和 reward 的裁判**。一份紧凑的程序化 reward 取代了昂贵且有循环依赖的 LLM-as-judge。

#### 关键结果

| Benchmark | 提升幅度（vs 基线） |
|-----------|--------|
| BFCL Multi-Turn | 最高 +10.2 |
| tau2-bench | 最高 +6.8 |
| T-Eval | 最高 +6.5 |

**结果解读**：训练规模很克制——约 13K 样本、四个模型（Qwen3-4B/8B、Qwen2.5-7B、Granite-4.1-8B）用**完全相同的 reward 超参**，只按模型族在三点 sweep 里调了学习率。跨两个模型族都稳定涨点，说明收益主要来自**reward 设计本身而非调参**，泛化性强。这正是你欣赏的"用静态/程序化信号把问题压到小模型能解的规模"的范例。

#### 局限性与开放问题

- **局限 1**：grounded 合成依赖"server 真实状态可 live 采样"——对于状态私有、无法采样的真实企业系统，这套数据合成 pipeline 未必跑得起来。
- **局限 2**：程序化 reward 的"参数值匹配奖励"在工具语义复杂、参数空间开放时可能退化为表面匹配，论文没充分讨论 reward hacking 风险。
- **开放问题**：它在 20 个受控 MCP server 上 work，但真实部署的 tool 生态是开放、持续演化的——training 环境和部署环境之间是否又是一个新的 sim-to-real gap？

#### 💡 对我们的启发

1. **直接可用的技术点**：那套"**纯程序化 reward 替代 judge model**"的配方，可以直接用在你的 program repair / compatibility migration 训练里——把"patch 是否通过静态检查 + 是否通过 T0/T1 验证"做成分级有效性 reward，绕开昂贵的 LLM judge，恰好契合你"static analysis 做验证、LLM 只负责修复"的职责切分哲学。
2. **具体实验想法**：在你的 compatibility repair 场景搭一个迷你 PROVE——用真实可执行的依赖环境（旧版 vs 新版 API）作为 grounding，合成"调用了真实存在 API"的修复轨迹，reward = 编译通过分级 + 测试通过。输入是 7B 代码小模型，预期 1-2 周能观察到：grounded 轨迹训练的小模型在执行通过率上显著高于用脱节合成数据训的版本。
3. **研究趋势判断**：tool-use RL 正在从"judge 打分"转向"**真实环境执行即 reward**"。这对资源受限的你是利好——它证明了小模型 + 程序化信号能打过依赖大 judge 的 pipeline，跟你"小模型替代商业 API"的判断同向。

---

### Value-Aware Stochastic KV Cache Eviction for Reasoning Models (VaSE)

> **推荐理由**：当你想把上面那些 agent / reasoning 小模型真正跑在本地时，长 CoT 的 KV cache 是绕不开的内存墙。VaSE 是 training-free 的实用解，直接服务你"local inference 优化"的偏好。

📌 **论文信息**：Ting-Yun Chang, Harvey Yiyun Fu, Deqing Fu, Chenghao Yang, Jesse Thomason | [arXiv:2606.03928](http://arxiv.org/abs/2606.03928) | cs.LG, cs.CL

> ⚠️ ar5iv 尚未渲染该 2606 新论文，故本文暂无配图。

#### TL;DR
发现 reasoning 模型 KV cache eviction 失败的两个关键因素——少量 value state 幅值异常大（误删会让模型陷入重复推理死循环）、eviction 缺乏随机性导致 cache 多样性不足；据此提出 VaSE：保护大幅值 value state + 引入随机 eviction，training-free，4× 压缩下超过 SOTA。

#### 问题是什么？
reasoning 模型靠长 CoT 提升准确率，但超长输出造成内存和算力瓶颈。KV cache eviction（直接丢掉不重要的 KV）能省内存，但准确率往往不如保留全 cache 的 sparse attention。为什么 eviction 这么容易掉点？没人讲清楚机理。这对本地部署 reasoning 小模型是硬约束——显存就那么大，丢 cache 又掉点，卡在中间。

#### 他们怎么做的？

**核心 Insight**：eviction 掉点不是"丢多了"，而是"丢错了"——两个被忽视的机理：极少数大幅值 value state 是命门，以及确定性 eviction 让 cache 同质化。

具体方法流程：
1. **诊断机理一**：一小撮 value state 幅值异常大，删掉它们会引发**灾难性失败**——模型进入重复推理 loop。
2. **诊断机理二**：eviction 时引入**随机性**能提升准确率，因为它增加了 cache 多样性。
3. **整合成 VaSE**：一个 training-free recipe——保护大幅值 value state + 促进多样化（随机）eviction 决策，支持 FlashAttention2，给 reasoning 模型固定静态内存占用。

**跟之前方法的本质区别**：不是"更聪明的重要性打分"，而是**承认贪心确定性 eviction 本身有缺陷，主动注入随机性**——这是个反直觉但有效的设计选择。

#### 关键结果

| 设置 | 结果 |
|------|------|
| KV cache 压缩比 | 4× |
| vs 最强 selection 方法（同 sparsity） | 平均准确率更高 |
| vs 最强 eviction 方法 | 高出 4%+ |
| 兼容性 | 支持 FlashAttention2，静态内存占用 |

**结果解读**：在六个 reasoning 任务上，4× 压缩还能超过保留全 cache 的 selection-based sparse attention，这是个不小的结论——它说明"保护大幅值 + 随机性"这两个简单干预的杠杆很大。提升最显著的场景应该是长 CoT 任务，因为那里 cache 压力最大、且大幅值 value state 误删的代价最高（直接死循环）。

#### 局限性与开放问题

- **局限 1**：在 Qwen3 系列验证，"大幅值 value state 是命门"这一现象是否跨架构普适（比如 Llama、Mistral）未充分验证。
- **局限 2**：引入随机性意味着结果有方差，对需要确定性复现的场景（如评测）可能带来麻烦，论文没讨论方差大小。
- **开放问题**：4× 是个甜点，但更激进的压缩（8×、16×）下"保护大幅值"是否还够用，未知。

#### 💡 对我们的启发

1. **直接可用的技术点**：VaSE training-free、即插即用、支持 FlashAttention2——你在本地跑 7B–14B 代码 reasoning 模型做 program repair 时可以直接挂上去，把长 CoT 修复轨迹的显存压力降下来，几乎零成本。
2. **具体实验想法**：在你的小模型代码修复 pipeline 上做一个消融——固定模型和任务，对比"无压缩 / 标准 eviction / VaSE 4×"三档下的 pass@1 和峰值显存。输入是 repair benchmark，预期观察到 VaSE 在显存砍到 1/4 时 pass@1 几乎不掉，从而支撑你"小模型 + 本地推理可行"的核心论点。
3. **研究趋势判断**：reasoning 模型的工程瓶颈正从"训练"转向"**长 CoT 推理时的内存**"。本地化部署这条线上，KV cache 压缩会和量化、投机解码一样成为标配——值得你在"小模型替代商业 API"的论证里专门留一节谈推理时优化。

---

## 方法对比

| 维度 | RealClawBench | Build-vs-Buy 协议 | PROVE | VaSE |
|------|--------------|------------------|-------|------|
| 核心方法 | 真实会话保分布采样 + 确定性 scorer | 预注册受控实验操纵配置机制 | grounded 轨迹合成 + 程序化 reward | 保护大幅值 value + 随机 eviction |
| 切入的"gap" | 评估真实性 | agent 隐性决策行为 | 训练数据真实性 | 本地推理内存 |
| 数据/计算需求 | 真实会话池 + 环境重建 | staged 项目 + 两工具 | 20 MCP server + 13K 样本 | 无需训练 |
| 模型规模 | 评测 14 个模型 | Claude Code / Codex | 4B–8B 小模型 | reasoning 模型(Qwen3) |
| 适用场景 | agent benchmark 构建 | coding agent 审计 | tool-use 小模型训练 | 本地长 CoT 推理 |
| 主要局限 | 单生态、排除主观任务 | 协议无数据、时效性 | 依赖可采样真实状态 | 跨架构普适性未验 |
| 对你的最大价值 | 保真采样方法学模板 | 边际价值预注册范式 | 程序化 reward 替代 judge | 即插即用显存优化 |
