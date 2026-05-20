---
title: "arXiv 每日速递 2026-05-21"
date: "2026-05-21"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-21

## 今日总结

今天的 SE / agent 板块呈现出一个非常一致的旋律：**"端到端 pass rate 不够了，必须看 agent 内部到底发生了什么"**。Code Cleanliness 用 minimal-pair 协议跑了 660 次 Claude Code，发现代码整洁度**不改变 pass rate 却显著改变 token 消耗与文件重访次数**；EvoTrace 用 replay 方法回放进化式 coding agent 的中间过程，发现 ~30% 的"新代码行"其实是删过又加回来的**字节同一**；INFRASCOPE 把已披露 CVE 当成 reference 在 GitHub 上挖到 11 个新漏洞（含 4 个新 CVE）；Production LLM Agents 提出 SDB（stochastic-deterministic boundary）原语并系统化 6 种运行时 pattern。**这四篇都不是炼丹，都是"agent 的实证解剖学"**——和博客主人的"边际价值量化"主线完全同频。今天值得读，尤其是第一篇。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Code Cleanliness vs Coding Agents](https://arxiv.org/abs/2605.20049) | Coding agent marginal value | minimal-pair × 660 trials，pass rate 无变化但 token -8% / 文件重访 -34% | ⭐⭐⭐ |
| [What Do Evolutionary Coding Agents Evolve?](https://arxiv.org/abs/2605.20086) | Agent trace 诊断 | EvoReplay 回放 + 9 类 edit 标注，揭示 30% byte-identical 循环 | ⭐⭐⭐ |
| [INFRASCOPE](https://arxiv.org/abs/2605.20051) | LLM-based vulnerability detection | reference-driven multi-agent，挖 11 个新漏洞 / 4 CVE | ⭐⭐ |
| [Production LLM Agent Runtime Patterns](https://arxiv.org/abs/2605.20173) | Agent architecture methodology | SDB 原语 + 6 种 pattern + replay divergence 失败模式 | ⭐⭐ |

## 今日主题：Agent 诊断学正在取代 Agent 炼丹学

如果你过去半年还在追 SWE-bench / tau-bench 的 leaderboard，今天这一批论文应该让你停下来想想。社区开始集体意识到一件事：**当前那一代"我把 X% pass rate 又涨了 2 个点"的论文，正在迅速失去信息量**——因为这些数字里掺杂了太多无法归因的东西。是模型本身变强了？harness 变好了？prompt 调了？还是仅仅 benchmark contamination？没人说得清。

今天的四篇都在试图回答一个更扎实的问题：**当 agent 已经能 work，"work 的内部机制是什么、瓶颈在哪、设计动作的真实贡献是多少"**？

- **Code Cleanliness** 用 minimal-pair 把外部行为 hold 住，只翻动代码整洁度这一个变量——这是教科书级的因果设计，发现的"null 结果"反而比"+2pp" 含金量高得多。
- **EvoTrace** 把进化式 coding agent 的每一次代码编辑用 LLM-as-judge 打成 9 种 edit type，然后用 replay 做反事实——这是把博主"trace 事后分析"哲学推到极致的方法。
- **INFRASCOPE** 不再追"我用更大的 LLM 找更多漏洞"，而是问"已披露的 CVE 在生态里有多少同源 variant？这种 variant 能不能机械化挖出来？"——把任务定义本身收紧。
- **Production LLM Agents** 不发布新框架，而是用 SDB 这个抽象**把 6 个看起来很不一样的 agent runtime pattern 归约到同一组原语**，并形式化"replay divergence"这个新失败模式。

把它们放在一起，主旋律非常清楚：**agent 论文的下一阶段，比拼的不是新分数，而是新"度量"**。这恰好是博主一直押注的方向——边际价值量化、benchmark 合理性、process quality vs outcome correctness。今天每一篇都能给现成项目挑出一个具体的方法点直接借鉴。

---

### Does Code Cleanliness Affect Coding Agents? A Controlled Minimal-Pair Study

> **推荐理由**：与博主"agent 边际价值量化"主线高度一致——同样是用受控实验拆开 agent 行为，同样得出反直觉结论（pass rate 不变但运营成本变了），同样把 Claude Code 当成研究对象。**这篇的实验设计本身就是博主下一篇论文的 baseline 模版**。

📌 **论文信息**：Priyansh Trivedi, Olivier Schmitt | [arXiv:2605.20049](https://arxiv.org/abs/2605.20049) | cs.SE / cs.AI

#### TL;DR

构造"行为等价但代码整洁度不同"的 repository minimal-pair，在 33 个任务 × 6 对 repo 上跑 660 次 Claude Code，**pass rate 没有显著差异，但 agent 在脏代码上多烧 7-8% token、多重访 34% 文件**。代码可维护性原则在 AI agent 时代不仅没过时，反而成了**算力成本**因素。

#### 问题是什么？

agent 评估社区现在的常规姿势是：把任务集固定（SWE-bench、HumanEvalPack、tau-bench 之类），然后比谁的 model / harness / prompt 跑出来的 pass rate 高。但这里有一个一直被遮蔽的混杂变量——**目标 codebase 本身的质量**。

你可能凭直觉相信"agent 在干净代码上表现更好"，但这从来没被严格验证过。一旦你想验证，问题立刻变得棘手：怎么排除"agent 因为读了更整洁的命名所以猜对了 API"这种 trivial 解释？怎么保证测试覆盖率、依赖、架构在两个 repo 之间真的等价？怎么避免把"任务难度差异"误读成"代码质量影响"？这种 confounding 不解决，所有数字都没法 attribute。

#### 他们怎么做的？

**核心 Insight**：用 **minimal-pair 协议**——同一个 repository 既往脏方向变，也往干净方向变——把"代码质量"这一个变量从"任务难度 + 架构 + 依赖"这堆混杂里剥离出来。

具体方法流程：

1. **双向构造 pair**：不是只挑一对，而是用 agent pipeline 既把干净 repo 故意"弄脏"（注入 lint 违例、提高 cognitive complexity），也把脏 repo "洗干净"。**两个方向的差异都测**——这是关键，防止单向构造引入的方向性 bias。
2. **行为等价 hold 住**：通过 hidden test suite 在 application 的 public surface 上验证两个 pair 行为一致——也就是说外部观察看不出区别，区别只在代码内部。
3. **任务设计在公共 API 层**：33 个任务全部从外部 API 视角写，不让 agent 因为"内部代码长得不一样"就有额外的语义提示。
4. **跑 Claude Code × 660 次**：6 对 × 33 任务 × 多次重复，覆盖统计噪声。

**跟之前方法的本质区别**：以前的"代码质量 vs agent 表现"研究通常是 observational——挑一堆开源 repo，按 lint score 排序，看 agent 表现是否相关。这种设计无法排除"高 lint score repo 通常文档好 / 测试好 / API 设计好"的混杂。Minimal-pair 把这些全部 hold 住了，剩下的差异就只能 attribute 到代码整洁度本身。

#### 关键结果

| 指标 | 干净 repo | 脏 repo | 差异 |
|------|---------|--------|------|
| Pass rate | ~baseline | ~baseline | **无显著差异** |
| Token 消耗 | baseline | +7~8% | 显著 |
| 文件重访次数 | baseline | +34% | 显著 |

**结果解读**：

- **pass rate 无差异**是真正的发现，不是 null finding 失败。它说明当前主流 coding agent 已经强到能"硬啃"脏代码——再脏也能解，只是要付出更多探索成本。
- **真实差异在运营成本**：+34% 的文件重访意味着 agent 在脏代码里**反复迷路**——读了某个文件，没看懂调用关系，又回去读一遍。这正是博主长期主张的"process quality vs outcome correctness"分离观——outcome 一样，process 完全不同。
- **8% 的 token 提升意味着什么**？如果你按 Anthropic API 价格估算，一个团队一年跑 100 万次 Claude Code 调用，光"代码不够干净"这一项就多烧几万美元。"可维护性"这个 vague 的东西，第一次有了硬性的美元单位。

#### 局限性与开放问题

- **只测了 Claude Code 一种 harness**：Cursor、Aider、OpenHands 上的弹性可能不同。例如 Aider 的 repomap 显式提供结构提示，可能让代码整洁度的影响进一步降低。
- **任务覆盖偏小**（33 个）：而且都是 application-level 任务，对 systems-level 重构、并发 bug 这种更依赖代码结构理解的任务，影响可能远大于 +8%。
- **"脏"是 agent 制造的脏**：用 agent 自动注入的 lint 违例和真正人类长期遗留的"历史包袱代码"分布可能不一样——后者还包含命名不一致、注释误导、隐式契约违反这些更难量化的东西。
- **开放问题**：如果不同模型 / 不同 harness 对 cleanliness 的弹性不同，那"挑 harness"就成了一个**取决于目标 repo 质量的决策**——这里有一个全新的 benchmark 维度。

#### 💡 对我们的启发

1. **直接可用的实验设计模版**：博主之前做 agent marginal value 时，每次都要纠结"怎么排除模型 / harness / prompt 的混杂"。这篇的 **minimal-pair 协议**就是答案——只要能构造"外部行为等价、单一变量不同"的 pair，因果 attribution 就立刻清晰。可以马上套到博主关心的几个问题上：**test execution 真贡献多少？**（minimal-pair：同 agent 同 task，只切 test execution 开关）；**structure injection 真贡献多少？**（minimal-pair：同一 task，inject vs 不 inject 结构提示）。
2. **具体实验想法**（1-2 周可做）：在博主的 ArkTS 修复 / Cangjie 补全数据集上复现这个协议——拿手上的 OpenHarmony repo，用 HomeCheck 把代码 violation 修了 / 又注入回去，做成 minimal-pair。然后跑 7B 开源 coder（DeepSeek-Coder / Qwen-Coder）×（干净 / 脏）做 grid。**预期观察**：(a) 在小模型上 pass rate 可能真的会变（不像 Claude Code 那么 robust）；(b) 小模型对代码 cleanliness 弹性更弱，意味着"预处理代码到干净状态"对小模型部署是个有杠杆的优化——这刚好支撑博主"local LLM + 静态分析预处理"的研究主线。
3. **趋势判断**：这篇标志着 agent benchmark 进入"**多维度 cost-aware 评估**"阶段。之前只看 accuracy / pass rate，现在还要看 token、wall-clock、文件 IO、tool call 次数。博主接下来如果发 agent paper，**必须**在主表格里加 token / latency 列，否则审稿人立刻会问"compared to baseline 提升 2pp 但代价是 3× token，这值得吗？"

---

### What Do Evolutionary Coding Agents Evolve?

> **推荐理由**：用 trace 事后分析 + replay 方法揭示"端到端分数提升其实来自不同机制"——和博主 SWE-bench trace 分析方法论同源。**EvoReplay 这个工具方法可以直接迁移到非进化式 agent 的归因分析**，是一个非常优秀的方法论模版。

📌 **论文信息**：Nico Pelleriti, Sree Harsha Nelaturu, Zhanke Zhou, Zongze Li, Max Zimmer | [arXiv:2605.20086](https://arxiv.org/abs/2605.20086) | cs.NE / cs.AI / cs.LG

#### TL;DR

进化式 coding agent（FunSearch / AlphaEvolve 风格）能在数学发现和算法设计上跑出惊人分数，但**"分数提升"实际上由几种完全不同的机制贡献**：新算法结构、常数重调、已有 idea 重组、对 evaluator 过拟合。这篇用 EvoReplay 反事实回放方法把这些机制拆开看——结果发现：**~30% 的新增代码行其实是删过又加回来的字节同一行**，进化在原地打转。

#### 问题是什么？

进化式 coding agent 这两年很火（FunSearch 在 cap set 问题、AlphaEvolve 在 matrix multiplication）。但它们汇报结果的方式有个根本盲点：**只看 final benchmark score**。score 涨了 5 个点，到底是因为：

(a) 找到了真正新的算法结构？
(b) 把已有算法的常数 / 超参重调得更准？
(c) 把模型内部 prior knowledge 的代码片段重组了一下？
(d) overfit 到 evaluator 的特定形式？

这四个的科学价值天差地别——(a) 是真发现，(d) 是 reward hacking。但 final score 完全没法区分。这正是博主"benchmark 合理性"研究方向上一直在喊的：**outcome 一样不代表机制一样**。

#### 他们怎么做的？

**核心 Insight**：单看终点不够，必须**回放进化轨迹本身**——而且要用反事实干预去验证"如果换掉这一步、改个常数，分数还在不在"。

具体方法流程：

1. **EvoTrace 数据集**：跨 4 个进化框架、含 reasoning / non-reasoning 模型、16 个 math + algorithm 任务，把所有 agent 中间步骤完整记录下来。
2. **9 类 edit 标注**：用 LLM-as-judge 把每一次代码编辑标成 9 种类型（如 constant tuning / structural change / re-introduction / component removal 等），然后用人类盲打重标做一致性校验（这正是博主一直强调的 Gwet AC1 / Cohen κ 套路）。
3. **EvoReplay 反事实干预**：找到 high-scoring 解，重放它的局部搜索状态，做 controlled intervention——比如把里面的某个常数动一下、把某个 component 删掉、换个 base model，看分数怎么变。这是把"哪一步真贡献了分数"用反事实做出来的。

**跟之前方法的本质区别**：以前评估进化式 agent 是"跑完看分数"，evidence 只有终点。这里 evidence 是**整条轨迹 + 每一步的反事实**——你能精确说"这次提分有 70% 来自常数 tuning，只有 30% 来自结构变化"，而不是笼统的"我们的 agent 比 baseline 强 5pp"。

#### 关键结果

| 现象 | 数值 | 含义 |
|------|------|------|
| 字节同一的"新"代码行占比 | ~30% | agent 在删了又加同样的行 |
| 出现该 cycling 模式的运行 | 几乎所有 run | 不是个别 bug，是系统性现象 |
| 提分主要来源的 edit 类型 | 少数几类 | 大多数 edit 对分数无贡献 |

**结果解读**：

- **30% byte-identical cycling 是个重磅发现**——它说明当前进化式 agent 的"探索"很大程度上是"震荡"。这种结构性低效之前从没被人测过，因为大家只看 final score。
- **少数 edit 类型贡献大多数分数**：意味着进化框架里的大部分 LLM call 都在做无用功——这对成本敏感的部署有直接价值（可以剪掉无用的 edit 类型，省 token）。
- **"模型内部已有 prior"是大头**：很多看起来"被进化出来的"算法，其实是 base model 一开始就知道，进化只是把它"召唤"出来。这意味着评估这类 agent 时，必须 control for base model 自带能力。

#### 局限性与开放问题

- **9 类 edit 是 LLM-as-judge 打的**：虽然有人类盲打做一致性校验，但 LLM 标注本身可能存在系统性偏差（比如倾向把 ambiguous edit 归到 "constant tuning"）。
- **任务集是 math + algorithm**：这两个领域的"对错"由 evaluator 严格定义。在更软的领域（系统设计、SE 任务），edit 类型的语义和归因都会更模糊。
- **没和"真新发现"做对照**：例如 AlphaTensor 那种真正发现 4×4×4 矩阵乘新算法的 case 是否也是 30% cycling？或者新发现集中在 cycling 率低的 run 上？这没回答。
- **开放问题**：byte-identical cycling 是进化框架本身的 bug（缺少 diversity 机制），还是 LLM 在做 local 改写时的固有行为？两种诊断会指向完全不同的解。

#### 💡 对我们的启发

1. **直接可用的方法迁移**：博主在做 SWE-bench / OpenHands trace 分析时，**EvoReplay 的"反事实干预"协议可以直接搬过来**。例如：拿一条成功的 SWE-bench trajectory，对每一个 tool call 做反事实——"如果跳过这一步 / 替换这一步的输出，agent 还能解吗？"——这就把"每个 agent 设计动作的边际价值"算出来了。比直接对比"开/关某 feature"更细粒度，因为是 per-step。
2. **具体实验想法**（1-2 周可做）：拿博主已有的 OpenHands trace 数据集，标注每一次 tool call 的"edit type"（仿照这篇的 9 类），统计**byte-identical re-edit 的比例**——如果 SWE-bench agent 也有 30% 这种循环，那对 agent design 的启示是巨大的（说明 short-term memory / state tracking 有严重 bug）。**预期发现**：可能比 30% 还高，因为 SWE-bench 任务比纯算法 task 更需要状态跟踪。
3. **趋势判断**：**LLM-as-judge + 人类一致性校验**正在成为标准 trace 分析协议。博主之前发的论文里就用过 Gwet AC1，这是社区开始向这个方向收敛的信号——下一步是不是该出一个**统一的 agent trace 标注 schema**？这可能是个 benchmark 论文的好坑。

---

### Hunting Vulnerability Variants in AI Infra: Measurement and Reference-Driven Detection

> **推荐理由**：与博主"AI for SE 工业落地"主线契合——把"已披露 CVE"当成 reference 在 AI infra 生态里挖 variant，方法论严谨（先做大规模 measurement 再设计方法），最终拿到 4 个新 CVE 是硬通货。**博主关心 OpenHarmony 生态的 vulnerability variant 完全可以套这个 pipeline**。

📌 **论文信息**：Tian Dong, Yanjun Chen, Shoufeng Zhang, Huaien Zhang, Yunlong Lyu | [arXiv:2605.20051](https://arxiv.org/abs/2605.20051) | cs.CR

#### TL;DR

AI infra（PyTorch 生态 / model server / agent framework）里大量项目共享相似的 model-centric workflow，一个 CVE 出现在某个 repo 后，**很大概率以 variant 形式在另一个 repo 重现**。INFRASCOPE 用 multi-agent 把已披露 CVE 的"transferable vulnerability semantics"提取出来，再去定位和验证新 repo 里的 variant——在 20 个 AI infra repo 上挖到 11 个被官方确认的漏洞（含 4 个新 CVE）。

#### 问题是什么？

AI infra 生态有个特殊的同质化问题：**大家都在重新实现"加载模型 → tokenize → run inference → 后处理"这套 workflow**。结果是某个项目（比如 vLLM）的 deserialization 漏洞修了，但另外 20 个 fork / 类似项目里的同形漏洞还在原地。

传统 vulnerability variant detection（如 Vuddy、CodeQL queries）的问题是：(a) 依赖 syntactic similarity，无法跨语言 / 跨重构；(b) 需要专家手写 detection rule。在 AI infra 这种"semantic 上很像，语法上千差万别"的场景里基本失效。

这就给 LLM 一个理想的发挥空间——LLM 擅长"理解 semantic 上等价但 syntactic 不同"。问题是：**怎么让 LLM 不靠胡猜，而是基于已有 CVE 的具体证据做 transferable 推理**？

#### 他们怎么做的？

**核心 Insight**：先做大规模 measurement 证明"variant 现象"真实存在（这是一个被忽视的 priors），再用 **reference-driven multi-agent** 把已披露 CVE 的"漏洞 semantic 模式"抽出来当 prompt 注入到 detection agent。不是让 LLM 自由发挥，是给它"参考答案"做 transfer。

具体方法流程：

1. **Measurement 阶段**：分析 688 个 AI infra GitHub repo + 251 个公开 CVE，量化"功能重叠度"和"漏洞模式复发率"——证明 variant 不是偶发现象。这一步本身就是有价值的 measurement 论文。
2. **Reference 提取 agent**：从已知 CVE 抽出 transferable vulnerability semantics——不仅是 patch diff，还包括 (a) 触发漏洞的输入类型、(b) 关键 API 调用模式、(c) 安全契约描述。
3. **Locator agent**：把这个 reference 套到新 repo 上，找出语义相似的代码段（不要求语法相似）。
4. **Validator agent**：对候选 variant 做静态分析 + LLM reasoning 双重验证，过滤 false positive。

**跟之前方法的本质区别**：CodeQL / Semgrep 是"专家写规则、引擎匹配"；这篇是"已有 CVE 当 reference、LLM 做语义匹配"。前者覆盖窄但精确，后者覆盖广但需要验证——而 reference-driven 设计大幅降低了 LLM 的 hallucination 风险。

#### 关键结果

| 指标 | 数值 |
|------|------|
| 测试 repo 数 | 20 |
| 挖出漏洞总数 | 20+ |
| 官方确认的漏洞 | 11 |
| 新分配 CVE | 4 |
| Measurement 阶段 repo / CVE | 688 / 251 |

**结果解读**：

- **4 个新 CVE 是硬通货**——AI/ML 论文里宣称"找到漏洞"的多，但能走完 CVE 流程被分配编号的极少。这意味着方法在 production 安全标准下也站得住脚。
- **Measurement 阶段证明 priors 真实**：这种"先证明问题存在再设计方法"的论文结构远比"上来就提方法"扎实——博主写 Android→HarmonyOS migration 论文时可以模仿。
- **multi-agent 的边界很清晰**：reference 提取 / locating / validation 三段，每段都有具体输入输出，便于 ablation 和归因。这种 agent 设计是"工程导向"，不是"端到端炼丹"。

#### 局限性与开放问题

- **依赖已披露 CVE 库**：对 0day（还没人披露过类似漏洞）完全无效——只能挖"已有 CVE 的同源 variant"，不能挖全新类别。
- **AI infra 只是一个垂直**：方法能不能迁移到 web framework / OS kernel / database 这些更成熟的生态？这些生态的 patch 信号更丰富但 variant 也更隐蔽。
- **被 acknowledge 不等于 critical**：11 个 acknowledged 中只有 4 个走到 CVE。剩下 7 个 severity 较低的漏洞，价值如何？没说。
- **运行成本不透明**：20 个 repo 用了多少 LLM call、多少美元？没披露。如果成本和发现量不成正比，工业部署性存疑。

#### 💡 对我们的启发

1. **直接可用的方法移植**：OpenHarmony / ArkTS 生态正处于"项目快速增多但 CVE 库很薄"的早期阶段——博主可以**反向用**这个 pipeline：把已有 Android CVE 当 reference，去 OpenHarmony 应用里找 variant。这种"cross-platform vulnerability transfer"是 cross-platform migration 工具链的天然补充。
2. **具体实验想法**（2 周可做）：拿 30-50 个公开的 Android CVE（OWASP MASVS 类）当 reference，在博主已有的 Android→HarmonyOS migration corpus 上跑 INFRASCOPE 风格的 locator。**预期观察**：migration 后的 ArkTS 代码很可能**继承**了原 Android 代码的安全漏洞——这本身就是博主"migration tooling"必须解决的问题，可以单独成一篇 short paper。
3. **趋势判断**：reference-driven LLM detection 是一个**比 prompt engineering 更稳健的范式**——它把 LLM 当作"语义相似度匹配器"而非"知识生成器"，hallucination 风险大幅降低。博主未来设计任何 LLM-based SE tool 时都应该优先考虑"有没有 reference 可以当锚"——这和博主"static analysis 做定位 + LLM 修复"的职责切分哲学是同一套。

---

### A Methodology for Selecting and Composing Runtime Architecture Patterns for Production LLM Agents

> **推荐理由**：用分布式系统的眼光重新整理 agent runtime，提出 SDB（stochastic-deterministic boundary）这个原语——对博主关心"agent 评估方法论"是一份概念框架级别的输入。**replay divergence 这个新失败模式定义本身就是一个好的研究坑**。

📌 **论文信息**：Vasundra Srinivasan | [arXiv:2605.20173](https://arxiv.org/abs/2605.20173) | cs.AI / cs.SE

#### TL;DR

production agent 真正难的不是 prompt / model，而是**"LLM 输出在哪个边界变成 system action"**。作者把这个边界命名为 SDB（proposer / verifier / commit / reject 四部分），并归纳出 6 种 runtime pattern，再把"模型方差降低后架构决策反而变更重要"这个观点形式化——并定义了一个全新的失败模式 **replay divergence**：deterministic event log 在不同模型版本下被 replay，下游输出会发散。

#### 问题是什么？

LLM agent 在生产环境跑出来的 bug 很难归因——是模型变了？是 prompt 漂了？是某个 tool 的 retry 逻辑炸了？还是 race condition？社区现在缺一套**形式化的 agent runtime 词汇**来描述这些 bug。结果就是大家说"agent 不稳定"时，谁也没法精确到底在抱怨什么。

更深的问题：随着模型方差不断降低（Claude 4.7 比 Claude 3 稳定得多），**"模型本身的不稳定"已经不再是主要 reliability bottleneck**——但社区还停留在"模型 nondeterminism 是万恶之源"的旧叙事里，看不见架构层面的累积不稳定来源。

#### 他们怎么做的？

**核心 Insight**：把 agent runtime 当成**分布式系统的特殊形态**——其中一个 worker 是 stochastic 的。然后用分布式系统几十年积累的概念（saga、event sourcing、supervisor pattern）做映射，但**显式标注"stochastic worker 改变了什么"**。

具体方法流程：

1. **定义 SDB 原语**：四部分契约——proposer（LLM 提议）/ verifier（验证）/ commit step（落地）/ reject signal（拒绝信号）。任何 agent 都可以按这个 schema 描述。
2. **6 种 runtime pattern 目录**：hierarchical delegation、scatter-gather + saga、event-driven sequencing、shared state machine、supervisor + gate、human-in-the-loop。每一种都追溯到经典分布式系统概念，再标注 stochastic worker 引入的差异。
3. **五步选择方法论**：给一个新的 workload，按 coordination / state / control 三个 concern 走五步流程，挑出合适的 pattern。
4. **诊断协议**：把 production failure 反向映射回某种 pattern 的固有弱点。
5. **Replay divergence 形式化**：当 LLM 是 deterministic event log 的 consumer 时，模型版本切换 / prompt 更新会导致**相同输入产生不同下游 trace**——这是一个传统分布式系统里没有的新失败模式。

**跟之前方法的本质区别**：以前的 agent 论文要么是"上来发一个新框架"，要么是"做 benchmark"。这篇既没框架也没 benchmark，是一个**纯概念整理 + 词汇定义**论文——但对工业实践的价值可能远高于一个新 agent runtime。

#### 关键结果

这篇没有传统意义上的实验表格，但提供了：

| 产出 | 数量 |
|------|------|
| Runtime pattern 目录 | 6 |
| Workload 应用案例 | 5 |
| 可运行 reference 实现 | 1（90 天合同续约 agent） |
| 新定义失败模式 | 1（replay divergence） |

**结果解读**：

- **价值在"词汇"而非"数字"**：博主可以理解这种贡献——就像 SOLID 原则、12-factor app 这些没有 benchmark 数字但深刻影响工业实践的论文。
- **replay divergence 是真正新的洞察**：传统 event sourcing 假设 consumer 是 deterministic，但 LLM consumer 破坏了这个假设——这个观察一旦点破，所有用 event sourcing 跑 agent 的系统都得重新审视。

#### 局限性与开放问题

- **缺乏实证验证**：6 种 pattern 是从经验归纳的，没有量化数据支持"按这个方法论选 pattern 比拍脑袋好多少"。
- **"模型方差降低 → 架构决策变重要"是 stylized**：作者自己承认是 stylized reliability decomposition——没有真实生产数据对比。
- **5 个 workload + 1 reference impl 偏少**：相比 distributed systems 文献几十年积累的 case study，证据基础还偏单薄。
- **开放问题**：能不能用 replay divergence 设计一个**专门的 benchmark**——给一组 deterministic event log，比较不同 agent runtime 在跨模型版本下的稳定性？这是空白。

#### 💡 对我们的启发

1. **概念框架直接可用**：博主下一篇 agent 论文如果涉及 production agent 评估，**SDB 这套四部分契约是个非常好的 framing 工具**——能让 reviewer 立刻 grasp "agent 在哪个具体边界出问题"，不会陷入"LLM 是黑盒所以不可分析"的争论。
2. **具体研究想法**：**replay divergence benchmark** 是个空白——可以构造一组 fixed event log，让不同 agent runtime 在 Claude 4.5 / 4.6 / 4.7 / Qwen / DeepSeek 上 replay，测量下游 action 的差异度。这能成为博主"agent 评估方法论"主线里的一篇——而且**和小模型主线天然结合**（小模型 nondeterminism 更高，replay divergence 现象更明显）。
3. **趋势判断**：agent 论文社区开始**从"我做了个新 agent"转向"我提出了一个描述 agent 的词汇"**——这其实是一个领域成熟的标志。博主如果想在 agent 方向占一个长期 niche，**做 measurement / methodology / vocabulary**比做新 framework 更耐看，也更符合博主"不做学术 rubbish"的研究哲学。

---

## 方法对比

| 维度 | Code Cleanliness | EvoTrace/EvoReplay | INFRASCOPE | LLM Agent Patterns |
|------|------------------|--------------------|------------|--------------------|
| 核心方法 | minimal-pair 受控实验 | 轨迹标注 + 反事实回放 | reference-driven multi-agent | 概念归纳 + pattern catalog |
| 评估单位 | 单 agent 行为差异 | 单次 edit 贡献 | 跨 repo variant | runtime pattern 选型 |
| 数据规模 | 660 trials / 33 任务 / 6 对 | 16 任务 × 4 框架 | 688 repo + 251 CVE | 5 workload + 1 ref impl |
| 主要贡献 | 实证 finding | 诊断方法学 + 数据集 | 检测工具 + measurement | 词汇与框架 |
| 适用场景 | 评估"代码因素"对 agent 的影响 | 进化 agent 与一般 agent trace 归因 | 已知漏洞的 variant 挖掘 | production agent 架构选型 |
| 主要局限 | 只测 Claude Code | LLM-as-judge 偏差 | 依赖已披露 CVE | 缺实证验证 |
| 与博主主线契合度 | ⭐⭐⭐ marginal value | ⭐⭐⭐ trace 事后分析 | ⭐⭐ migration 工具链 | ⭐⭐ 评估方法论 |

把这四篇并列起来看，最有意思的事情不是各自的具体方法，而是**它们都在用不同的方式回答同一个 meta question**：

> "当 LLM agent 已经能 work，我们应该如何度量它真正在做什么、靠什么 work、哪里会失败？"

Code Cleanliness 用受控因素剥离回答；EvoTrace 用 trace 回放回答；INFRASCOPE 用 reference 锚定回答；LLM Agent Patterns 用概念词汇回答。**四种回答互补，组合起来就是博主一直主张的"agent 实证解剖学"全景图**——非常值得拿这四篇做下一次组内 reading group 的主轴。
