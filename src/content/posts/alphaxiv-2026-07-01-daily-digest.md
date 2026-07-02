---
title: "写对 patch 已经不够了：2026-07-01 arXiv 把 reliable coding agent 的定位、验证与迁移链条摊开了"
date: "2026-07-01"
description: "这一天真正值得读的论文，不是在继续堆更大的模型，而是在把 repository-level 变更中的定位、证据、迁移、性能优化与可信验证逐步拆成可测对象。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "仓库级智能体", "软件演化", "验证闭环"]
series: "alphaXiv论文解读"
coverColor: "from-emerald-800 to-slate-900"
---

# 写对 patch 已经不够了：2026-07-01 arXiv 把 reliable coding agent 的定位、验证与迁移链条摊开了

如果把 2026-07-01 这一批论文并排看，最明显的感受不是“模型又更强了一点”，而是社区终于更认真地承认：真实软件变更不是一句 prompt 交给 agent，然后等它吐出 patch。仓库级任务里最难的部分，往往发生在 patch 之前和 patch 之后。前面是定位、意图组织、上下文约束与需求证据；后面是执行验证、置信度、结构性迁移和工业级落地。

这也是为什么今天最值得读的几篇论文，不是那种单纯报一个 pass rate 的 benchmark paper，而是那些把软件变更链条拆细的工作。`Loc2Repair` 在问：文件级定位到底给 end-to-end repair 带来多大增益？`FeatX` 在问：如果编辑对象从“代码片段”改成“功能”，仓库级演化会不会更自然？`MOA` 则直接把这个问题推到了 OpenHarmony 这种超大工业代码库上。

更重要的是，今天关于“验证”的论文明显变多，也明显更硬。`JETO-Bench` 把性能补丁做成了可复现 benchmark，`An Empirical Study of Security Calibration in Large Language Models for Code` 说明模型在仓库级安全判断上会系统性过度自信，`Falsification, Not Exposure` 则把所谓 self-repair 里的反馈成分一层层拆开，逼我们区分“看见失败代码”与“拿到可执行反例”到底差在哪里。

如果你的主线是 `Reliable Coding Agents for Real-World Software Change and Evolution`，今天这批论文很值得认真读。因为它们共同强调的一件事是：**可靠 coding agent 的核心，不再只是能不能写出一段看起来像样的代码，而是能不能把定位、证据、验证、迁移和系统边界组织成闭环。**

## 今日脉络

今天所有实质相关论文，大致可以压成三条线。

第一条线是 **把“改代码”拆回“先理解要改什么、该去哪改”**。`Loc2Repair`、`FeatX`、`Citation Discipline in Spec-Driven Development` 都属于这条线。它们分别从文件定位、功能层意图和需求到代码的可追踪性出发，说明真实仓库修改不是裸 patch synthesis，而是证据组织问题。

第二条线是 **把 verifier 和反馈对象本身拉出来单独研究**。`JETO-Bench`、`Security Calibration`、`Falsification, Not Exposure` 指向的是同一个痛点：我们过去太习惯把“测试过了”当成终点，却很少认真问 verifier 奖励了什么、模型对风险有没有自知、以及失败反馈里真正起作用的是哪一部分信息。

第三条线是 **把 coding agent 放进更大的工业级软件演化语境**。`MOA` 和 `AdaTrans` 最典型：前者是在 OpenHarmony 上做内存优化自动化，后者是在 C 到 Rust 迁移里把编译器反馈、语义修复和安全约束揉进同一闭环。它们提醒我们，agent 时代的软件演化并不只等于修 bug，还包括大规模性能治理、语言迁移和架构边界重写。

## 强相关论文深读

### 1. Loc2Repair：repo-level repair 里，文件定位不是前处理，而是第一层能力

**论文信息**  
标题：*Loc2Repair: A Framework for Evaluating the Impact of File-Level Issue Localization in Repo-Level LLM Repair*  
作者：Mohammad Nour Al Awad, Sergey Ivanov  
arXiv：[2606.30963](https://arxiv.org/abs/2606.30963)  
分类：cs.SE, cs.AI  
发布日期：2026-07-01（本次 cs/new 公开批次）

**一句话 TL;DR**  
这篇论文最重要的结论是：在仓库级自动修复里，文件级定位不是可有可无的 prep step，而是一个稳定、可量化、能同时改善成功率和时延的上游杠杆。

**为什么这个问题重要**  
今天很多 repo-level repair 工作喜欢直接报 end-to-end resolved rate，但这会把多个失败模式糊在一起。agent 失败，可能是没找对文件，也可能是找对了文件但 patch 写错了，还可能是后续调试没收敛。对于真实软件变更研究来说，这三类失败的研究含义完全不同。`Loc2Repair` 的价值就在于，它把“先去哪里看”单独抽出来测，逼着我们承认定位能力本身值得独立建模。

**方法怎么工作**  
方法上它做得很干净。第一步，用统一 runtime、artifact schema 和 evaluation harness 把 localization 和 repair 拆开。第二步，在同一套 repair backbone 下比较四种条件：不做显式定位、用两个不同 localizer 的预测结果引导修复、以及直接给 gold modified-file set。第三步，在 `SWE-bench Verified` 上跨三个 repair backbone 重复这个实验，这样它测到的不是“某一个 agent 刚好配某个 localizer 有用”，而是文件定位这个变量本身的平均效应。

**关键实验与证据**  
结论相当稳。pooled resolved rate 从 baseline 的 `44.7%` 提升到 `48.9%` 和 `49.1%`，gold localization 则进一步到 `52.4%`。同时平均耗时不是上涨，而是下降：两种 predicted localization 分别减少 `100.94s` 和 `52.25s`，gold guidance 减少 `154.45s`。一个很值得注意的细节是，standalone localization 指标更高，不一定自动转化成更高的 end-to-end 修复收益，这说明 repair backbone 和 localization 之间不是简单单调关系，真正该看的还是 joint pipeline。

**局限和可信度**  
它的边界也很清楚。这里测的是 file-level localization，不是 symbol-level、call-chain-level 或 cross-issue reasoning。数据集仍然是 `SWE-bench Verified`，所以结论主要成立于 benchmarkable repo repair，而不是更开放的产品级演化任务。但我认为这不削弱论文价值，反而说明它在非常有限的干预下给出了相当稳定的增益证据。

**与当天主题的关系**  
这篇论文直接支撑今天的主线之一：**可靠 patch 之前，先要有可靠定位。** 对 repository-level agent 而言，这比再往 patch generator 上堆一点 sampling trick 更值得投资。

### 2. FeatX：如果编辑对象从“代码块”改成“功能”，仓库演化会自然得多

**论文信息**  
标题：*FeatX: Editing Software by Editing Features for Repository-Level Code Evolution*  
作者：Xutian Li 等  
arXiv：[2606.31206](https://arxiv.org/abs/2606.31206)  
分类：cs.SE  
发布日期：2026-07-01（本次 cs/new 公开批次）

**一句话 TL;DR**  
`FeatX` 的真正贡献不是又做了一个 IDE agent，而是把仓库级修改的交互对象从“代码片段”提升成“功能”，并显式维护 feature-to-code 映射。

**为什么这个问题重要**  
真实软件演化任务经常不是“把第 83 行改成这样”，而是“给用户管理模块加一个导出功能”或“把日志策略从局部开关改成按 feature 统一管理”。这类任务天然是 feature-level 的，但现有 agent 交互往往还是 code-centric：你得自己搜上下文、手动圈文件、自己把 feature intent 拆成 edit plan。`FeatX` 解决的是一个经常被忽略的问题：**如果人类本来就按功能思考，为什么 agent 交互要逼人回到行号和文件级别？**

**方法怎么工作**  
它的 pipeline 由两个核心部分组成。第一部分是 feature extraction：从现有仓库里抽取分层的 epic-feature 结构，并给每个 feature 绑定代码实体。第二部分是三阶段 `Evolution Agent`：先做静态分析和探索式检索构造 `CodeMap`，再做 localization 和 planning，最后落到具体代码修改。整个过程通过四个面板暴露给用户，用户编辑的是 feature 描述，agent 再把 feature edit 还原成多文件 patch。论文里的 Figure 1 和 Figure 2 都很关键，前者解释整体系统，后者解释用户如何围绕 feature panel 驱动演化。

**关键实验与证据**  
证据不算巨大，但很有方向感。用户研究里，NASA-TLX 平均分从 `12.5` 降到 `7.4`，相当于 `41%` 的认知负担下降。回放实验覆盖 `38` 个真实 feature-editing commits，`FeatX` 的 function-level localization `F1` 做到 `0.385`，相对强基线 `Claude-opus-4.5` 的 `0.270` 提升 `42.6%`。更有意思的是成本：`FeatX` 整体只花 `0.07` 美元，而直接用 Claude 跑到 `45.05` 美元。这种“交互更顺 + 定位更准 + 成本更低”的组合，在仓库级演化工具里很少见。

**局限和可信度**  
它的弱点也明显。首先这是篇短文风格工作，实验规模和统计细节不如大 benchmark 论文厚。其次用户研究样本偏小，仓库类型也有限。再者，feature extraction 本身如果抽歪了，后面 feature edit 就会建立在错误语义切片上。所以我会把它看成一个很有潜力的交互范式，而不是已经被充分证成的最终方案。

**与当天主题的关系**  
`FeatX` 特别适合放进“software change intelligence”语境里看。它在提醒我们：**仓库演化不一定要从代码搜索开始，也可以从功能结构开始。** 这对多文件、长依赖链修改尤其重要。

### 3. MOA：OpenHarmony 终于不是背景板，而是真正的 agent 级工业测试场

**论文信息**  
标题：*MOA: A Profiling-Guided LLM Framework for Memory-Optimization Automation at Codebase Scale*  
作者：Zijian Liu 等  
arXiv：[2606.31368](https://arxiv.org/abs/2606.31368)  
分类：cs.SE  
发布日期：2026-07-01（本次 cs/new 公开批次）

**一句话 TL;DR**  
如果今天只能选一篇最贴近“复杂工业平台上的真实软件演化”主题，我会优先读 `MOA`，因为它直接在 OpenHarmony 上把 profiling、规则合成和 patch 生成串成了一个可落地闭环。

**为什么这个问题重要**  
很多 coding agent 论文说自己面向真实工程，但真正碰到上亿行 C/C++、复杂服务边界、性能与资源约束同时存在的工业代码库时，论文就退回小 benchmark 了。`MOA` 不一样，它处理的是 memory inefficiency 在超大系统里的规模化治理问题。这个场景很贴近你关心的方向，因为它不是“解一道题”，而是“在生产级代码库里识别反模式、生成修复并接受人工审查”。

**方法怎么工作**  
`MOA` 的设计很像一个分层 agent pipeline。`Analyzer` 从 profiling 证据出发，结合代码库探索，挖出 recurring anti-pattern；`Checker Generator` 把这些自然语言模式提炼成可执行的静态检查器，底层挂在 Clang Static Analyzer 上；`Patcher` 再用状态机驱动的工作流，把大规模检测结果分块转成具体优化 patch，并做应用、编译与验证。Figure 2 解释总流程，Figure 4 则明确给出 `Patcher` 的状态机，这不是“LLM 一把梭”，而是明显吸收了大代码库工程化约束。

**关键实验与证据**  
结果非常硬。只用 `3` 个 profile 过的服务，`MOA` 就识别出 `13` 类经验证的 anti-pattern，其中 `9` 类此前未知，且 `69.3%` 不被 Clang-Tidy 现有规则覆盖。随后它在 `7` 个系统服务里检测到 `10,000+` 个 inefficiency instance，最终生成 `769` 个 patch，覆盖 `518` 个文件，人工评审接受率 `92.5%`。性能收益也不是边角级别：平均 `42.2%` heap reduction，`10.6%` binary size reduction。更关键的是，这些数字发生在 OpenHarmony `100M+` 行 C/C++ 代码的上下文里，这让论文的工程含金量明显高于普通 benchmark result。

**局限和可信度**  
当然它也不是无条件泛化的胜利。第一，任务目前聚焦 memory optimization，不代表同样流程可直接迁移到 correctness bug、security bug 或跨模块重构。第二，最终 patch 仍有人工 maintainers 审核，说明系统还不是 fully autonomous。第三，pattern mining 依赖 profiling 证据，本质上偏向运行时已暴露的问题，而不是纯静态潜伏缺陷。但这些都是合理边界，不是硬伤。

**与当天主题的关系**  
对“OpenHarmony 作为高价值测试场景”这条线来说，`MOA` 是今天最关键的实证之一。它说明复杂工业平台完全可以成为 coding agent 研究的主战场，而不只是论文里顺手提一下的 deployment ambition。

### 4. JETO-Bench：性能补丁 benchmark 不该只给一堆 diff，还得给可复现执行证据

**论文信息**  
标题：*JETO-Bench: A Reproducible Benchmark for Execution Time Improvement Patches in Java*  
作者：Khashayar Etemadi, Zhendong Su  
arXiv：[2606.31767](https://arxiv.org/abs/2606.31767)  
分类：cs.SE  
发布日期：2026-07-01（本次 cs/new 公开批次）

**一句话 TL;DR**  
这篇论文最值得注意的地方，不只是又给了一个 Java benchmark，而是把“性能改进补丁”做成了可持续挖掘、带 Docker 和统计检验的可复现数据生成管线。

**为什么这个问题重要**  
性能修复是很多真实软件仓库里极其重要、但在现有 coding agent benchmark 里被严重低估的一类任务。原因很简单：功能 bug 可以用测试集相对直白地评，性能问题却要面对 JIT、GC、测试噪声、环境漂移和是否真的有 observable speedup 的复杂性。没有严肃 verifier，所谓“优化补丁”很容易沦为表面改动。

**方法怎么工作**  
`JETO-Mine` 用三阶段 pipeline 处理这个问题。第一阶段做静态挖掘：从 GitHub 仓库历史里筛 commit/PR，用 LLM-based issue classifier 找 execution time improvement patch。第二阶段做动态分析：给候选补丁包 Docker 镜像，反复运行测试并做统计检验，确认是否存在显著执行时间提升。第三阶段给出 evaluation harness，用统一环境去测生成 patch 与生成测试。它不是一次性静态 benchmark，而是可配置、可复用、可继续扩展的新 benchmark 生产机。

**关键实验与证据**  
最终产出很扎实：从 `174` 个开源 Java 仓库、`11` 年历史、接近 `1.8M` commits 中，挖出 `660` 个 identified ETIPs，进一步得到 `102` 个 executable ETIPs，其中 `91` 个人工确认可用于评估。用 OpenHands 跑这 `91` 个问题，正确修复率只有 `14.3% (13/91)`；只有 `22% (20/91)` 的候选 patch 真正能 apply、编译并通过测试；另有 `36.3% (33/91)` 连 patch 都没生成出来，`27.5% (25/91)` 虽然改到了正确位置，但语义仍然不对。这个 breakdown 很重要，因为它说明性能补丁不是简单的语法修补，而是高度依赖 fault localization 和 execution-based feedback 的复杂任务。

**局限和可信度**  
局限也很明确。它现在只做 Java，且性能改善阈值与统计显著性参数需要人为配置；这意味着 benchmark 设计本身带有 policy choice。另一个现实问题是，开源 Java 项目里能真正证明性能提升的测试本来就很少，作者自己也明确指出现有测试实践不足。但恰恰因为这些限制被正面摊开，论文的 benchmark 观比很多只给 fixed dataset 的工作更可信。

**与当天主题的关系**  
`JETO-Bench` 把“执行反馈”这件事讲得很具体：**不是所有 patch correctness 都是功能对错，性能改进尤其需要统计型 verifier。** 对做 repository repair 和 patch QA 的人，这篇论文值得长期跟。

### 5. Security Calibration：仓库级安全代码生成里，模型最危险的不是犯错，而是高置信犯错

**论文信息**  
标题：*An Empirical Study of Security Calibration in Large Language Models for Code*  
作者：该文作者团队  
arXiv：[2606.31159](https://arxiv.org/abs/2606.31159)  
分类：cs.SE, cs.CR, cs.LG  
发布日期：2026-07-01（本次 cs/new 公开批次）

**一句话 TL;DR**  
这篇论文最重要的结论不是“模型会写出不安全代码”，而是“模型在仓库级环境里会高置信地写出不安全代码，而且这种 False Trust 很难靠简单 repair 消掉”。

**为什么这个问题重要**  
在真实开发流程里，开发者并不会逐行重新验证每段 AI 生成代码。很多时候，是否继续信任输出，取决于模型给人的稳定感和自信程度。于是问题从“代码安不安全”变成了“模型知不知道自己写得安不安全”。如果 calibration 失真，agent 就会把风险伪装成确定性，这比普通错误更危险。

**方法怎么工作**  
论文把问题拆成四层。第一层，在 self-contained 的安全代码任务上测 security confidence 与 functional confidence。第二层，把评测搬到 repository-level 的 `AICGSecEval`，让模型面对真实 CVE、跨文件依赖和多语言仓库环境。第三层，设计 calibration-guided repair，看低置信样本是否更适合自动修复。第四层，再测试 mitigation，例如 execution gating 和更激进的 repair 许可。这个设计的好处是，它不是只报一个 ECE，而是把 calibration 放回开发闭环里看。

**关键实验与证据**  
几个数字很值得记。首先，repository-level miscalibration 比 isolated function 严重得多，作者分解后发现 build fragility 可以解释 `45%` 到 `82%` 的 ECE 上升，但即便只看成功构建的样本，ECE 仍比 self-contained 任务高出 `4` 到 `27` 个百分点，说明问题不只是“环境太脆”，还有真正的跨文件复杂度。其次，calibration-guided repair 并没有变成灵丹妙药：三种模型的 repair success 只有 `0.00%` 到 `2.39%`，而 functional breakage 经常超过 `60%`。最后，execution gating 虽然能把 ECE 再压低 `30.8%` 到 `39.3%`，但代价是拒掉 `45.8%` 到 `86.0%` 的样本。这说明 calibration 更像风险分层器，不是自动安全修复器。

**局限和可信度**  
这篇工作的价值主要在 diagnosis，不在最终解决方案。它目前只覆盖少数主流模型，repair 流程也仍受 benchmark 设计约束。另一个现实边界是，安全正确性比功能正确性更难用统一 oracle 表达，所以 calibration 指标再漂亮，也不等于可直接部署。但从证据密度看，这篇论文已经足够有说服力地说明：repo-level code generation 的安全自知，远比社区想象中差。

**与当天主题的关系**  
它直接击中了 `agent reliability and quality assurance` 这条主线。对真实仓库里的 coding agent 来说，**置信度本身也是待验证对象**，而不是额外赠品。

### 6. Falsification, Not Exposure：self-repair 真起作用的不是“再看一遍自己的代码”，而是可执行反例

**论文信息**  
标题：*Falsification, Not Exposure: An Internally Preregistered Placebo-Controlled Decomposition of Self-Repair Feedback in Frozen Small Code Models*  
作者：该文作者团队  
arXiv：[2606.31511](https://arxiv.org/abs/2606.31511)  
分类：cs.SE, cs.CL, cs.LG  
发布日期：2026-07-01（本次 cs/new 公开批次）

**一句话 TL;DR**  
这篇论文最强的地方是把 self-repair feedback 拆成了可证伪成分，并用 placebo control 证明：真正有用的不是重新暴露失败代码，而是拿到外部、可执行的反例事实。

**为什么这个问题重要**  
很多 coding agent 论文会说“给失败反馈后模型能修回来”，但这里面混了太多成分。到底是因为模型看见了失败代码？因为 prompt 更长了？因为多了一轮生成机会？还是因为执行器给了它真正的 counterexample？如果这些不拆开，我们就很容易把“任何二次尝试都有效”误认成“feedback content 有效”。

**方法怎么工作**  
这篇论文的方法论几乎比结论本身更有价值。它在 `HumanEval+` 和 `MBPP+` 的 `290` 个 dead task-cell unit 上构造五臂实验，把 bare code、blind resampling、facts only、code plus facts 和 generic-bullet shape-matched placebo 放在 matched budget 下比较。更重要的是，它做了 preregistration、same-unit discordant-pair tests、fresh-generation confirmation 和 mirror placebo。也就是说，它不是单纯跑更多 ablation，而是在构造一个“研究者自己的解释也要被反证”的实验装置。

**关键实验与证据**  
结论非常清楚。blind resampling 相对 bare code 带来 `+18` 个净解锁，discordant split 是 `25/7`，Holm-adjusted `p=0.0021`。`code-plus-facts` 相对 bare code 同样是 `+18` 个净增益，discordant `21/3`，`p=0.00042`；相对 shape-matched placebo 还有 `+15` 的优势，`p=0.0041`。而 instruction-only 的效应并不显著。换句话说，在这个 frozen small model 的 regime 里，真正起作用的是外部执行反例把原猜想“击穿”，而不是模型多看几眼自己写的东西。

**局限和可信度**  
论文自己也很克制：结论局限于 `0.5B-1.5B` 小模型、dead-unit 场景以及这套反馈 packet 设计，不能直接外推到 frontier coding agent。可它的实验严谨度非常高，尤其是 placebo 与 matched-budget 设计，让这篇论文在“怎么研究 self-repair”层面比很多直接报收益的论文更值得反复看。

**与当天主题的关系**  
它支撑的是今天一个特别重要的判断：**反馈闭环里最值钱的是可执行证据，不是更热闹的 self-talk。** 这对未来做 patch verifier、test feedback 和 execution trace 利用都很关键。

### 7. Citation Discipline：需求引用会降低输出一致性，但会显著提高可验证性

**论文信息**  
标题：*Citation Discipline in Spec-Driven Development: A Cross-Model Empirical Study of Output Determinism and Automated Hallucination Detection in LLM-Generated Code*  
作者：Subham Panda  
arXiv：[2606.30689](https://arxiv.org/abs/2606.30689)  
分类：cs.SE, cs.AI  
发布日期：2026-07-01（本次 cs/new 公开批次）

**一句话 TL;DR**  
这篇论文说明了一件很现实的事：给代码强制加需求级引用，会损失一点 determinism，但会换来真正可自动化的 hallucination detection。

**为什么这个问题重要**  
很多 spec-driven coding 流程的问题不是模型不会写代码，而是它会悄悄写出 spec 里没要求的东西，而且这些额外功能完全可能通过测试。对于高要求软件工程场景，pass tests 并不等于没有 hallucination。于是问题变成：能不能让生成代码里的每一行，都对某个 requirement claim 负责？

**方法怎么工作**  
作者比较了三种 SDD 体系：`traceSDD` 要求代码行带 `REQ-XXX.Y.Z` 形式的内联引用；`Spec Kit` 主要维持 artifact-level traceability；`OpenSpec` 则走事后 external trace map。实验跨两种模型做了两轮：`Claude Sonnet 4.6` 上 `20` 个任务、`240` 个实现；`GLM-5-turbo` 上 `50` 个任务、`600` 个实现。核心测两件事：多次独立运行输出有多稳定，以及自动 hallucination detection rate 能不能真正跑起来。

**关键实验与证据**  
结果是一个非常典型的工程 trade-off。uncited condition 在 determinism 上明显更强，effect size 分别达到 `d=-0.76` 和 `d=-0.72`；但只有 cited condition 才具备自动 hallucination detection，TDR 分别做到 `86.4%` 和 `88.0%`，而且 `FPR=0%`。换句话说，你在输出稳定性上付了代价，但换回了“这段代码到底有没有在偷偷引用不存在需求”的自动检查能力。对于高保证开发流程，这种交换未必亏。

**局限和可信度**  
这篇论文更像 controlled empirical study，而不是完整开发平台评估。它证明了 traceability 能帮助 detect hallucination，但没有直接证明最终系统级 correctness 更高；另外 determinism 下降也不是小事，意味着工程采纳时要权衡重复性与可核查性。不过它至少把这个 trade-off 做成了可测现象，而不是概念口号。

**与当天主题的关系**  
它非常贴近“evidence anchoring”这条线。对 reliable coding agent 来说，**需求到代码的可追踪性，本身就是 verifier 的一部分**，不是文档工程附属物。

### 8. AdaTrans：C 到 Rust 迁移真正缺的不是一次性翻译，而是编译器驱动的语义修复闭环

**论文信息**  
标题：*AdaTrans: Automated C to Rust Transformation via Error-Adaptive Repair*  
作者：该文作者团队  
arXiv：[2606.31706](https://arxiv.org/abs/2606.31706)  
分类：cs.SE  
发布日期：2026-07-01（本次 cs/new 公开批次）

**一句话 TL;DR**  
`AdaTrans` 的核心不是把 C 翻成 Rust，而是把编译错误、知识检索和修复策略做成一个 error-adaptive loop，从而在正确性和安全性之间拿到更好的平衡。

**为什么这个问题重要**  
C 到 Rust 迁移是典型的软件演化任务，而且是高价值、长周期、强工程约束的那种。难点不在于把语法翻过去，而在于 ownership、borrowing 和 unsafe 的语义鸿沟。很多 LLM 能生成能编过的 Rust，但要么靠 unsafe 绕过去，要么编得过却行为错。对真正的 legacy migration 来说，这种“看似成功”远远不够。

**方法怎么工作**  
`AdaTrans` 的三段式设计很值得借鉴。Phase 1 是 multi-stage validation：不仅检查能不能编译，还检查功能等价。Phase 2 是 strategy-driven RAG：把编译器错误映射到 `Rust Violation-Fix Graph` 上，取回特定修复知识。Phase 3 是 `ESTS`，也就是 Error-Stratified Transformation Strategy：按错误类别做温度调度、局部循环和重置策略。Figure 4 到 Figure 6 讲得很直白，它不是单纯“看到 error message 再试一次”，而是把 error semantics 结构化了。

**关键实验与证据**  
在 `104` 个算法题数据集上，`AdaTrans` 三次独立运行的 mean compilation pass rate 是 `95.51% ± 1.11%`，mean solve rate 是 `81.09% ± 3.09%`，unsafe file rate 仅 `1.19%`。这个结果比最强现有 LLM-based 工具高 `59.94` 个 solve-rate 百分点。更关键的是 ablation：去掉 `ESTS` 后 solve rate 掉到 `69.23%`，去掉 `RAG` 掉到 `71.15%`。这说明真正有效的不是某个提示词，而是“编译器反馈 -> 语义分类 -> 对应修复知识 -> 再验证”的整条闭环。

**局限和可信度**  
不过这篇论文还没真正证明 project-level migration。它的数据集是 self-contained algorithmic problems，虽然便于 differential testing，但离真实大型 C 系统迁 Rust 还有距离。作者自己也承认，真正的项目迁移常常缺少这么干净的 functional oracle。所以我会把它看成“迁移闭环方法论正确、真实场景仍待放大”的工作。

**与当天主题的关系**  
它之所以重要，不只是因为 Rust 很热，而是因为它展示了**语言迁移任务可以被 agent 化为可验证的 error-driven software evolution loop**。这和你关心的跨平台、跨语言工业演化高度同频。

## 中相关论文速读

### AxDafny：把 verifier 放进生成循环，比“代码 + 测试过了”更接近高保证开发

`AxDafny` 研究的是 Dafny 里的 verified code generation。它不只生成可执行代码，还要一起生成 invariants、assertions 和 termination 论证；同时新建了 `250` 题的 `LCB-Pro-Dafny`。结果上，它在 `DafnyBench` 上做到 `92.7%` verification success，比最强 proof-hint baseline 高 `6.5` 个百分点。它和今日主线高度相关，因为它再次强调：验证成功和运行时测试成功不是同一件事。但它主要还是 competition-style formal tasks，而不是 repo-level 软件变更，所以我把它放在中相关而不是强相关。

### AutoTrainess：当 agent 开始“训练模型”而不是“写一段代码”，workflow 本身就成了关键能力

`AutoTrainess` 的定位很有意思。它研究的不是代码补丁，而是让 LM agent 自主完成 post-training 工作流，包括数据准备、训练、评估和状态保存。论文把这些操作外化成显式的 agent-computer interfaces，而不是让模型在原始 CLI 里盲走。结果上，在 `PostTrainBench` 上，GPT-5.4(Codex) 从 `23.21` 提到 `26.94`，DeepSeek-V4-Flash 也从 `12.13` 提到 `19.58`。它和可靠 coding agent 的关系在于：长时程自治并不天然来自更强 base model，很多时候来自更清晰的工作流结构。

### ClawArena-Team：多智能体时代，主 agent 的“管理能力”终于被单独测了

`ClawArena-Team` 很值得保留，因为它测的不是 agent 自己会不会做任务，而是它会不会当 manager：创建 subagent、分配权限、收集异步结果、处理 staged updates。benchmark 有 `41` 个场景、`258` 轮评估和 `72` 次 staged update。最醒目的结论不是谁第一，而是**没有模型的 workspace-permission precision 超过 `50%`**。这和做真实仓库 agent 非常相关，因为未来很多复杂变更都会走 orchestration，而不是单代理闭门修补。

### Generative Skill Composition：coding agent 的 skill library 变大后，检索已经不够了

这篇论文把 skill 使用从“给一堆候选再 rerank”提升成“直接预测一条可执行 skill sequence”。在 `SkillsBench` 上，`SkillComposer` 对两种 production-grade coding agent 都有明显增益：在 `GPT-5.2-Codex` 和 `Gemini-3-Pro-Preview` 上分别带来 `+23.1` 和 `+18.2` 个百分点的通过率提升。它的相关性在于，真实软件变更越来越依赖分工明确的 skill/tool stack，这篇论文算是在回答“skill 用什么、用几个、按什么顺序”。

### QVal：dense supervision 这件事，很多复杂方法可能还没简单 prompting 可靠

`QVal` 不直接针对 coding tasks，但它对 long-horizon agents 的反馈设计很有参考价值。作者做了 `21` 种 dense supervision method、`4` 个环境、超过 `1.2K` 次评估实验，用 training-free 的方式测一个信号到底和高质量 Q-value 排序有多一致。结论不太客气：很多最近的 dense supervision 方法在统一评测下并不如简单 prompting baseline。对做 coding agent 训练的人，这是一句非常实用的提醒：不要把复杂 feedback engineering 自动当成真增益。

### ScratchWorld：如果 world model 只会复制持久状态，它看起来会很准，实际上几乎没在“推演后果”

`ScratchWorld` 把 Scratch 项目当成可执行世界，用 pinned VM 生成 replay-verified transitions、hidden variables 和 counterfactuals。`659` 个样例里，七个模型在 changed-field `F1` 上最高只有 `13.8%`；反过来，一个“直接抄输入状态”的 baseline 却能拿到 `98.0%` implied full-state accuracy，但 changed-field `F1` 是 `0.0%`。这跟 coding agent 很相关，因为它提醒我们：如果 evaluator 奖励了“看起来像”，模型就会去学复制持久态，而不是推演真正改变了什么。

### AgRefactor：把真实软件改写成 HLS 代码，本质上也是另一种大规模程序变更

`AgRefactor` 做的是把真实软件重构成 HLS-compatible 程序，并继续做性能优化。它在 `11` 个 challenging real-world benchmarks 里有 `9` 个优于或匹配现有方法，后续 agentic optimization 还能带来相对最强 pragma tuning 工具 `6.51x` 的几何平均加速。它不是传统 repository repair，但很适合从“跨范式程序迁移”去理解。之所以没放进强相关，是因为场景更偏硬件综合，而不是通用软件仓库维护。

### Governance Gaps in Agent Interoperability Protocols：今天的 agent 协议会通信，但还不会治理

这篇论文不直接讨论代码修改，却和 agent runtime 边界很相关。作者用六维治理需求 taxonomy 去审 MCP、A2A、ACP、ANP 和 ERC-8004，结论是 voting 和 dissent preservation 在五个协议里都缺失，deliberation 也基本只有部分支持。对做真实工程 agent 的人，这个结论很关键：协议层解决了连通性，不等于解决了治理性，更不等于解决了审计与责任边界。

## 可留意 / 可跳过

- `CoCoMUT` 值得记一下。它在 `20` 个 Java 仓库上生成 `56,512` 个 method-context record、`386,048` 条 call edge，source reconciliation 做到 `97.8%`，人工审计正确率 `99.0%`。但它更像高质量上下文抽取和数据管线工具，而不是直接回答 coding agent 能力边界的论文。
- `Learning from Failure: Inference-Time Self-Improvement for Computer-Use Agents` 把 `OpenCUA-72B` 在 `OSWorld` 上从 `42.3%` 提到 `48.9%`，说明失败轨迹可转化成改进信号。但它主要是通用 computer-use agent 视角，与软件仓库变更只有间接相似性。
- `Ask the World Before Acting` 的“预算化环境 probing”想法很对味，尤其是把 environment interaction 当 calibration resource 看待；但当前证据更多是 world-model task 上的机制验证，还没有真正落到 repository workflow。
- `Xiaomi-GUI-0`、`What Memory Do GUI Agents Really Need?`、`PPT-Eval` 这些 GUI/computer-use 论文可以作为执行闭环与任务状态管理的外围观察样本保留，但今天不建议放在主读清单前排。它们更像 agent execution engineering，而不是软件变更核心论文。

## 横向比较

| 论文 | 主要对象 | 最关键证据 | 工程可迁移性 | 我对可信度的判断 |
| --- | --- | --- | --- | --- |
| Loc2Repair | repo-level repair 上游定位 | `44.7% -> 48.9/49.1/52.4%`，且时延下降 | 高 | 高，设计干净、变量隔离清楚 |
| FeatX | feature-level 软件演化交互 | `F1 0.270 -> 0.385`，NASA-TLX `12.5 -> 7.4` | 中高 | 中，方向强，实验规模还偏小 |
| MOA | OpenHarmony 上的工业级优化自动化 | `769` patches，`92.5%` 接受率，`42.2%` heap reduction | 很高 | 高，工程含量最强 |
| JETO-Bench | 性能补丁 benchmark 与 verifier | `91` 人工验证任务，OpenHands 仅 `14.3%` | 高 | 高，benchmark 构造扎实 |
| Security Calibration | 代码安全置信度与 False Trust | repair success `0-2.39%`，gating 仅能降 ECE | 高 | 高，诊断很强，解决方案仍弱 |
| Falsification, Not Exposure | self-repair 反馈成分拆解 | `25/7`、`21/3` 这两组 discordant 结果很硬 | 中高 | 高，实验控制极少见 |
| Citation Discipline | spec 到 code 的可追踪性 | TDR `86.4%/88.0%`，FPR `0%` | 中高 | 中高，trade-off 讲清楚了 |
| AdaTrans | C 到 Rust 迁移 | solve `81.09%`，unsafe file `1.19%` | 高 | 中高，方法好，任务域仍偏窄 |

## 我的判断

如果只看今天这批论文，我会给出下面这个判断。

- **创新性：A-**。最有新意的不是某个单独模型，而是 `MOA`、`Loc2Repair`、`Falsification, Not Exposure` 这种把链条拆细、把变量隔离开的工作。它们不一定最 flashy，但研究价值很高。
- **实用价值：A**。`MOA`、`JETO-Bench`、`Security Calibration`、`AdaTrans` 都有明显可复用成分，既能转成研究问题，也能转成工程系统设计原则。
- **严谨性：B+ 到 A-**。今天最严的证据集中在 benchmark construction、反馈拆解和 calibration diagnosis；相对弱一些的是 `FeatX` 这类交互工具论文，方向很好，但样本量和长期外部效度还不够。
- **与用户方向相关度：A**。这一天很少见地同时出现了 repo-level repair、功能级演化、工业级平台优化、性能补丁 benchmark、校准/自修复验证和语言迁移闭环，几乎把 `Reliable Coding Agents for Real-World Software Change and Evolution` 的关键子问题都碰了一遍。

不确定性主要有两点。第一，部分论文更像 short/demo/workshop 风格，实验厚度不完全一致。第二，像 `AdaTrans`、`AxDafny` 这类工作虽然验证信号很强，但任务域仍比真实大仓库更干净。所以今天最稳的读法不是“谁已经解决了可靠 coding agent”，而是：**哪些论文把关键断点拆成了可被继续推进的独立对象。**

如果你今天只打算精读 4 篇，我会建议顺序是：`MOA -> Loc2Repair -> Security Calibration -> JETO-Bench`。如果你更关心 feedback 与 verifier 本身，再补 `Falsification, Not Exposure` 和 `Citation Discipline`；如果你更关心演化与迁移，再补 `FeatX` 和 `AdaTrans`。
