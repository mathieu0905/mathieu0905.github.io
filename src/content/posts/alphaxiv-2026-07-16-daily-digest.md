---
title: "可靠 Coding Agent 的战场已经移到证据层：2026-07-16 arXiv 的仓库理解、验证门禁与 Harness 自我演化"
date: "2026-07-16"
description: "这批论文把可靠 coding agent 的核心从补丁生成推进到行为定位、执行证据、可证伪门禁、持续优化与技能供应链安全。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "仓库级智能体", "验证闭环", "软件演化", "Agent安全"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-indigo-900 to-cyan-800"
---

2026 年 7 月 16 日这批 arXiv 新稿很不寻常：与可靠 coding agent 实质相关的论文不是一两篇，而是形成了从仓库理解、补丁验证、运行时证据到 harness 自我演化的完整链条。它们共同追问的已不再是“模型能否写出一个看起来合理的 patch”，而是：目标行为分散在哪些文件里，模型凭什么相信自己的执行结果，验证器是否真的独立，系统又如何在持续更新时避免把偶然噪声固化为规则。

这批工作的另一层价值，是把“软件变更”重新放回工程语境。VisualRepair 处理视觉 issue 与运行行为，Harness Handbook 处理行为到实现的映射，SemaDiff 用双版本执行判断语义变化，Generative Compilation 把编译器推进到生成过程内部；DREA、SkillSec-Eval 和 falsifiable release gates 则把证据、权限与安全边界做成可检查对象。对真实仓库和 OpenHarmony 这类复杂工业平台而言，这比单纯再刷几个 benchmark 点更重要，因为最难的往往不是生成代码，而是组织足够可信的变更证据。

我的总判断是：**coding agent 的主战场正在从“生成层”移到“证据层”**。这一转向还不成熟，今天不少结果仍来自小样本、单团队或自建 micro-lab；但问题定义已经明显比“更强 prompt + 更多 rollout”更接近真实软件变更。

## 今日脉络

今天的论文可以压成四条彼此咬合的线。

第一条是 **行为定位与多模态仓库理解**。VisualRepair 说明 issue 中的截图、GIF 和 IDE 画面需要不同的工具链；Harness Handbook 则指出，修改 agent harness 的瓶颈是从“想改什么行为”定位到“哪些分散实现共同承载该行为”。两篇都在反对把仓库理解简化成一次向量检索。

第二条是 **可执行证据与语义验证**。SemaDiff 通过在提交前后运行同一组生成测试来判断语义是否改变；Generative Compilation 在模型尚未生成完整文件时就调用真实编译器；DREA 进一步提醒，即使分类结论正确，推理也可能是 lucky hit。共同点是：结论必须锚定到可复查的代码、执行或工具证据。

第三条是 **harness 自我演化的信用分配问题**。GSME 用密封测试集和配对显著性检验给改动记功，Phantom Guardrails 证明优化器会修复根本不存在的失败，falsifiable release gates 则要求每个新能力先面对预注册、机器可判的门禁。三篇放在一起看，答案很清楚：会提出改动不难，难的是证明“这次改动确实有用且没有移动球门”。

第四条是 **跨会话、跨技能与跨运行时的信任边界**。Compaction as Epistemic Failure 讨论摘要如何把短暂 stdout 写成“已确认事实”；积累行为规则的 coding agent 论文讨论如何让人工反馈跨会话保留；SkillSec-Eval 则把技能从入库、检索、规划、执行到更新的全生命周期都纳入威胁模型。可靠性不再是一次运行是否成功，而是错误能否被长期传播、放大和制度化。

## 强相关论文深读

### 1. VisualRepair：视觉 issue 修复不是“把截图塞给 MLLM”

**论文信息**  
标题：*VisualRepair: Dynamic Tool Calling and Region Focusing for Visual Software Issue Repair*  
作者：Jingyu Xiao、Zhongyi Zhang、Haoran Hou、Yuxuan Wan、Yuan Jiang、Yintong Huo、Michael R. Lyu  
链接：[arXiv:2607.14075](https://arxiv.org/abs/2607.14075)  
分类：cs.SE；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
它把视觉 bug 附件先按 UI、GIF、代码截图和文本图分类，再调用专用工具抽取证据，并在测试时动态缩放多个候选区域，以提高真实前端仓库中的定位和修复成功率。

**为什么这个问题重要**  
视觉 issue 的难点不只是“多了一张图”。GIF 需要时间信息，IDE 截图含代码语义，长页面有大量空白和噪声，而 UI bug 往往只有局部像素区域真正关联源码。统一用一个视觉 prompt 处理，既浪费 token，也容易让模型把注意力落在无关区域。对于移动应用、跨平台 UI 和 OpenHarmony 场景，这类“运行行为—视觉证据—源码位置”的链条尤其常见。

**方法怎么工作**  
Figure 4 的 pipeline 有三个关键步骤。其一，Image Type-aware Tool Calling（ITTC）先做规则与模型结合的图像分类，再按类型调用 OCR、GIF 关键帧抽取、空白裁剪或代码模板库；论文在完整 SWE-bench Multimodal 上人工核查了分类结果。其二，Dynamic Test-time Region Focusing（DTRF）让模型提出多个 bug 相关区域，并分别做 zoom-in、zoom-out，避免一次 grounding 决定一切。其三，每个区域生成候选 patch，实际应用并编译，最后由模型结合失败信息选 patch。Figure 7 的 GIF 案例把 89 帧压成 4 个关键帧，Figure 8 则展示了裁剪和多尺度区域如何把 Lighthouse 的视觉异常对应到实现位置。

**关键实验与证据**  
在 517 个 SWE-bench Multimodal test 实例上，VisualRepair 解出 196 个（37.91%），比 GUIRepair 和 SVRepair 的 186 个多 10 个，平均成本约 0.47 美元/题；dev 上是 25/102（24.51%），明显高于 GUIRepair 的 14/102。Table III 的消融更有解释力：统一视觉 baseline 解出 151 个，只开 ITTC 是 171，只开 DTRF 是 166，两者同时开启达到 196。新增的 15 个 DTRF 解题中，人工检查发现 14 个（93.3%）确实定位到了 bug 区域。参数实验也表明盲目增加区域并不好：3 区域、10 patch 最佳，4 区域反而从 37 降到 33 个。

**局限和可信度**  
主实验仍以 o3 为 backbone，虽然 GPT-4o 与 o4-mini 的补充结果方向一致，但并未覆盖开源模型。更大的外部效度问题是 benchmark 主要由 JavaScript/TypeScript 前端仓库构成，Java、Python、C# 以及原生移动 UI 尚未验证。失败案例集中在超长截图、关键帧仍过多的 GIF 和高密度噪声图。换言之，它证明了“类型感知工具链 + 区域迭代”有效，还没有证明视觉修复已跨语言、跨平台稳定泛化。

**与当天主题的关系**  
这篇论文代表今天的第一条主线：可靠修复需要把非文本证据转成可定位、可编译、可比较的工程证据，而不是把多模态能力当作一个更大的输入框。

### 2. Harness Handbook：先把“行为”映射回代码，再谈自动改 harness

**论文信息**  
标题：*Harness Handbook: Making Evolving Agent Harnesses Readable, Navigable, and Editable*  
作者：Ruhan Wang、Yucheng Shi、Zongxia Li、Zhongzhi Li、Yue Yu 等  
链接：[arXiv:2607.13285](https://arxiv.org/abs/2607.13285)  
分类：cs.SE、cs.AI；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
它为大型 agent harness 自动生成“行为—阶段—源码单元”的分层手册，并用渐进披露引导较弱 planner 找到真正需要同步修改的位置。

**为什么这个问题重要**  
生产 harness 的一个行为通常横跨 system prompt、状态管理、工具调用、解析器和终止逻辑；需求却以“改变重试策略”“增加验证步骤”这类行为语言出现。文件树和向量索引告诉你代码在哪，却不直接告诉你一次运行如何穿过这些文件。结果是 agent 即使能读全仓库，也可能只改到最显眼的位置，漏掉共享状态和间接路径。

**方法怎么工作**  
Figure 2 的构建分三相。Phase I 用静态分析抽取函数、调用边、状态读写和外部边界，未解析调用显式记录而不猜。Phase II 把这些事实组织进执行阶段：有可信 skeleton 时用 function-as-leaf，没有时从文件卡片和程序图推断 file-as-leaf 结构。Phase III 合成 L1 系统概览、L2 阶段卡、L3 源码单元卡与跨阶段状态表。修改时，BGPD 先在行为层选择阶段，再沿状态和调用关系扩展候选，最后回到当前仓库验证 locator；执行产生 diff 后，手册增量重同步，无法确认的条目冻结而非臆测。

**关键实验与证据**  
作者在 Codex 与 Terminus-2 两个开源 harness 上各构造 30 个行为修改请求，覆盖普通查询、跨文件和 search-hostile 三类，由 DeepSeek-V4-Pro 规划，并让 GPT-5.5、Opus 4.8、DeepSeek-V4-Pro 三个 judge 独立比较计划。Handbook arm 的总体 win rate 在 Codex 上从 28.3% 升到 38.3%，在 Terminus-2 上从 26.7% 升到 45.6%；planner token 同时下降 12.7% 与 8.6%。对两个强模型参考计划的 24 个 file/symbol 级 Recall、Precision、F1 比较全部改善，F1 增幅 5.0–18.8 点，零重叠错误最多下降 25.9 点。

**局限和可信度**  
实验评的是 localization 和 edit plan，不是实际执行后的 patch correctness；参考计划和质量判断都来自模型，也不等于人工金标准。对象只有两个 harness、60 个请求，自动重同步的长期漂移和维护成本没有被纵向测量。因此最可信的结论是“行为组织能改善规划证据”，而不是“它已闭环解决 harness 自我演化”。

**与当天主题的关系**  
它把 repository-level change intelligence 具体化为 behavior-to-code mapping，补上了很多 coding agent 工作默认跳过的前置环节：知道要改什么，不代表知道所有该改的位置。

### 3. SemaDiff：用同一组生成测试审问提交前后的真实语义

**论文信息**  
标题：*SemaDiff: Identifying Semantic-Changing Commits with Generated Code and Tests*  
作者：Maha Ayub、Michael Konstantinou、Ahmed Khanfir、Nikolaos Tsantalis、Mike Papadakis  
链接：[arXiv:2607.13111](https://arxiv.org/abs/2607.13111)  
分类：cs.SE、cs.AI；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
SemaDiff 不猜一个 refactoring 是否保语义，而是生成更容易触达改动的依赖代码和测试，在提交前后运行同一测试，以行为差异作为判据。

**为什么这个问题重要**  
“检测到了 refactoring”不等于“这个 commit 只做了 refactoring”。纠缠提交可能同时改变行为，这会污染 bug 数据集、回滚分析和 backport 判断。纯 diff 分类器即使准确率高，也没有给出行为证据；原有测试又经常走不到被改动的方法，特别是库代码和深层调用链。

**方法怎么工作**  
SemaDiff 先解析 diff，定位修改代码与未变化的 caller；若真实依赖路径太深，LLM 生成一个更直接调用改动点的 dependent class，并在两个版本上编译。然后模型基于 diff 和依赖代码生成同一组保守测试，编译失败时最多进行三轮错误反馈修复。最后测试分别在 parent 与 commit 版本运行：任何结果差异都视为语义变化，否则判作保语义。Figure 6–8 说明生成依赖类的价值：它不是替代真实程序，而是为双版本差分执行构造更容易覆盖改动的观测点。

**关键实验与证据**  
数据集含 7 个 Java 项目的 183 个近期提交，三位标注者独立判断并讨论 41 个歧义样本。Table II 中 SemaDiff 的平均 accuracy 为 75.95%，execution failure 3.82%，对“语义改变”判断的 precision 为 100%，recall 58.89%。生成依赖代码覆盖了约 98% 被识别的语义变化，其中约 85% 只能靠生成代码暴露；测试对修改类的平均覆盖约 85%，Randoop 只有 49%，且 Randoop 方案执行失败 45.35%。静态 LLM baseline 的 accuracy 可达 86.89%，但 precision 仅 84.47%，说明“猜得更全”不等于“有足够证据宣布发生语义变化”。

**局限和可信度**  
183 个样本全部来自 Java，且特意聚焦含 refactoring 的近期提交；对其他语言、跨服务行为、数据库与 UI 副作用的适用性未知。100% precision 建立在相对低的 recall 上，本质是保守探测器。标签把新增可访问功能统一视为语义改变，也带有研究定义选择。Spoon 调用图、LLM 生成和测试执行都可能失败，作者虽检查了部分调用图，仍不能排除工具链偏差与在线检索导致的数据泄漏。

**与当天主题的关系**  
它给“software change intelligence”提供了一个很干净的模板：对提交的判断应尽可能转化为双版本、同观测、可执行的反事实比较。

### 4. DREA：仓库探索能提高漏洞检测，但更多上下文并不能替代安全推理

**论文信息**  
标题：*DREA: Decoupled Reasoning and Exploration Agents for Repository-Level Vulnerability Detection*  
作者：Mingyang Sun、Guozhu Meng  
链接：[arXiv:2607.13439](https://arxiv.org/abs/2607.13439)  
分类：cs.CR、cs.SE；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
DREA 让强 Planner 提出并更新漏洞假设，让本地轻量 Explorer 用只读工具寻找仓库证据；它提高了成对检测可靠性，却也发现 26%–55% 的真阳性只是“标签对、理由错”。

**为什么这个问题重要**  
漏洞常跨越输入源、校验、授权和危险操作，单函数判断看不到缺失的保护；但把整仓代码一股脑塞给模型又会制造上下文过载。更严重的是，漏洞 benchmark 常只看二分类标签，模型可能靠“输入校验不足”这类泛化话术撞对答案，无法支持真实审计和修复。

**方法怎么工作**  
Figure 2 把职责拆开：Planner 从目标函数形成威胁假设，要求追 callers、验证逻辑或权限检查；Explorer 仅能 `ls/glob/grep/read_file`，返回 repository context、code evidence 和 security findings；Planner 迭代约 10 轮后给出带 trigger path 的结论。作者还构造 RepoPairBench：100 对 Python CVE 修复前后函数、对应仓库快照、CWE 和 commit 信息。评估不仅看单实例 recall/FPR，还用 Pair-Correctness 要求 vulnerable 与 patched 两端同时判对，并让独立 GPT-4.1 judge 对真阳性理由做机制一致性检查。

**关键实验与证据**  
三种 backbone 的 Pair-Correctness 都改善：DeepSeek-V3.2 从 19% 到 42%，GLM-4.7 从 26% 到 34%，GPT-5.2 从 21% 到 30%。消融很关键：DeepSeek 的 whole-file 仅 26%，single-agent 虽有工具却因吞下 442K API tokens，FPR 升到 64%、P-C 只有 24%；DREA Planner 只吃 88K tokens，P-C 42%。Explorer 承担 93.7%–97.9% token，估算 API 成本降低 16–48 倍。不过更多搜索不是更好：DeepSeek 的 false negative 平均用 1.70M tokens，true positive 只用 1.24M，token 与正确性相关约 -0.34。更值得警惕的是 lucky hit：真阳性中 26%–55% 理由与真实漏洞机制不一致。

**局限和可信度**  
benchmark 只有 100 对 Python CVE，单个 CWE 子组仅 3–13 对；公开 CVE 可能已进入模型训练。理由评估依赖 LLM judge，人工只核查 50 个案例，尽管 Cohen's kappa 达 0.88–0.92。patched 标签只表示目标 CVE 已修，模型发现其他真实问题也会算 false positive。因而结论更适合解释架构机制，不宜当作通用漏洞检测率。

**与当天主题的关系**  
DREA 同时支持和挑战“证据驱动 agent”：主动找证据确实比固定上下文好，但证据量无法弥补 backbone 对安全机制的误解，验证还必须审查 rationale 是否锚定到正确因果链。

### 5. Generative Compilation：让编译器在代码还没写完时就介入

**论文信息**  
标题：*Generative Compilation: On-the-Fly Compiler Feedback as AI Generates Code*  
作者：Niels Mündler-Sasahara、Hristo Venev、Dawn Song、Martin Vechev、Jingxuan He  
链接：[arXiv:2607.13921](https://arxiv.org/abs/2607.13921)  
分类：cs.PL、cs.AI、cs.LG；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
论文用一个轻量 “sealor” 把尚未完成的 Rust 前缀封成可编译程序，从而在黑盒模型生成途中发现已经不可能挽回的静态语义错误。

**为什么这个问题重要**  
传统 compiler feedback 要等完整文件生成后才返回，早期错误会沿后续代码滚成几十条诊断；constrained decoding 又通常需要白盒 logits 和为语言重写约束。真实 coding agent 更需要一种模型无关、能复用现有编译器、又不会错误剪掉可完成前缀的中间方案。

**方法怎么工作**  
核心是 sealor：它把 partial program 转成完整程序交给原生编译器。作者先在 Rust 风格核心语言 FR 上定义 partial syntax 和 realization，再证明 global completeness——只要一个前缀存在良构完成，sealor 就不会拒绝它；对重要子类还给出 selective soundness，Lean 机械化覆盖这些性质。扩展到真实 Rust 后，系统用 rust-analyzer 解析部分 AST，插入尽量少引入新类型义务的占位结构，并并行流式检查。遇到不可恢复错误就停止当前生成、把聚焦诊断反馈给模型并重启；达到 10 次中途重启预算后，才退回普通 post-compilation 迭代。

**关键实验与证据**  
实验覆盖 7 个模型和两个仓库级 Rust 任务：20 个复杂 C-to-Rust Translation 实例，以及要求适配近期 API 变化的 UpdatedAPI。普通生成平均 non-compiling rate 65.9%，post-compilation 降到 20.7%，Generative Compilation 再降到 13.1%；14 个 model×dataset 配置中 9 个相对 post-compilation 的改进显著。UpdatedAPI 上 Opus 4.8 的编译错误从 6.7% 到 0，GLM 5.2 的功能正确率从 53.3% 到 71.7%；Translation 上 Kimi K2.7 从 39.9% 到 53.9%。65% 的中途错误报告只有 1–2 条诊断，平均 5.5 条，而事后编译平均 13.8 条；错误中位报告延迟仅 3 行，事后反馈是 89 行。

**局限和可信度**  
形式证明约束的是 accept/reject，不证明生成给模型的诊断一定对应原始前缀中的真实错误；sealing artifact 主要靠工程过滤缓解。任务只覆盖 Rust，Translation 仅 20 个实例，无法说明其他编译器生态同样容易实现。系统约 5K Rust 加 3K Python 代码，虽远小于 rustc 前端，仍是明显工程投入；对跨文件构建、宏、生成代码和平台相关配置的实时反馈能力也尚未充分展示。

**与当天主题的关系**  
它是今天“执行反馈”主线最扎实的机制论文：验证不是生成后的裁判，而可以成为生成过程中的主动约束，同时仍保留模型黑盒兼容性。

### 6. Self-Evolving Agent Harnesses：提案归模型，记功权必须归确定性评估

**论文信息**  
标题：*Self-Evolving Agent Harnesses via Gated Semantic Quality-Diversity*  
作者：Xiaotian Luo、Fengxingyu Wang、Chuanrui Hu、Dizhan Xue、Yafeng Deng  
链接：[arXiv:2607.13683](https://arxiv.org/abs/2607.13683)  
分类：cs.CL；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
GSME 让 LLM 诊断失败和修改 harness，但由确定性代码负责采样、激活记录、配对显著性与密封测试，避免模型给自己的改动记功。

**为什么这个问题重要**  
部署中最容易改的常不是模型权重，而是 prompt、知识注入、runtime hook 和配置。自动优化 harness 的难点并非生成 patch，而是一次分数上涨究竟来自真实改进、采样噪声、环境故障还是对训练任务的过拟合。没有独立 crediting，所谓“self-improving”很容易只是 self-grading。

**方法怎么工作**  
系统先固定 model kernel 与可修改 surface，让诊断模型从失败轨迹生成 3–4 个候选。候选先过环境健康 gate，再要求 runtime mechanism 发出 activation beacon，最后在同一任务集上以 K=3 配对比较；只有 z≥1.96 的增益才能被 credit。GSME archive 按 `(where × why)` 保存 elite：where 是 prompt/knowledge/runtime/config，why 是 runaway、未验证终止等失败病理，避免按具体任务记忆补丁。搜索只看 train，最终 harness 在 sealed test 只评一次。git tree 保存每个候选的父节点、diff、触发条件和结论，使演化过程可审计。

**关键实验与证据**  
冻结 qwen3.6-27B 后，六个 domain 的 sealed gain 为 +9.2 到 +15.5 个点，保留训练增益的 86%–147%；AppWorld 从 41.3% 到 56.7%，BrowseComp+ 从 16.9% 到 30.8%。SWE-bench 从 47.4% 到 52.6%，但 n=26、z=0.78，作者明确只报 preliminary，不放宽门槛。跨模型实验显示补丁匹配的是 failure distribution 而非模型家族：27B 受 verify-finalize 帮助 +15.5，而 397B/Gemini 更受 checklist 型补丁帮助 +13.6/+13.5。单变量实验还显示 selective recovery 的 79.4% 优于把 token budget 放大 16 倍的 71.1%。

**局限和可信度**  
信用保证只相对 verifier 成立：如果 checker 可被投机，显著提升仍可能是 reward hacking。目标是短期 benchmark pass rate，不覆盖可维护性和长期鲁棒性；每个候选反复 K=3 评估，成本很高。sealed withholding 尚未做到系统级强制，诊断器是更强的 Claude Opus 4.8，也意味着“自我”其实是强模型优化弱模型 harness。SWE-bench 样本过小恰好展示了作者的克制，也说明真实仓库证据仍不足。

**与当天主题的关系**  
它给今天的主线提供了一个可复用原则：**生成与认证必须分权**。自我演化可以由模型驱动，但是否有效必须交给预先固定、可重复的证据程序。

### 7. Phantom Guardrails：优化器会认真修复一个从未发生的失败

**论文信息**  
标题：*Phantom Guardrails: When Self-Improving Agent Harnesses Fix Failures That Never Happened*  
作者：Su Wang、Pin Qian、Yifan Lin、Jingzhou Xu、Yihang Chen 等  
链接：[arXiv:2607.13083](https://arxiv.org/abs/2607.13083)  
分类：cs.CR、cs.SE；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
在所有行为都合法、oracle 证明无需修复时，LLM harness proposer 仍会把无害模式解释成规则违规，并添加永远不会真正触发的 guardrail。

**为什么这个问题重要**  
自我改进循环通常从“观察失败—提出修复”开始，却很少先问失败是否真实。多余 guard 可能在当前 benchmark 上完全无害，因此 suppression score 看不出来；但它会增加运行延迟、攻击面和规则复杂度，并在 add-only 循环中永久累积。这是软件演化里的典型静默债务。

**方法怎么工作**  
Counterfactual Fabrication Lab 构造一个确定性 MiniArena。语法越界等真实失败各有精确 oracle，第三类 `castle` 则被生成器保证绝不出现；候选菜单里却预置了对应 guard。作者比较三类 pool：确有违规的 congruent、全合法但含无害重复图案的 fabrication、全合法且无图案的 pristine。proposer 只看带 legality 标签的固定轨迹，一次性选择 hook；byte-exact oracle 决定 guard 是否有真实依据。随后又把同一机制放进四轮 accept loop，比较 accept-if-not-worse、strict improvement 和必须引用 oracle 证据的 warrant-aware acceptance。

**关键实验与证据**  
pristine 上 phantom guard 是 0/60，真实违规 pool 是 60/60；但无害规则形图案出现后变成 15/60，比例差异 z=4.14。效应高度模型相关，glm-5.1 占 11/12。去掉“存在失败”的预设、声明规则集完整，或移除规则形模式，fabrication 都降到 0。进入 add-only loop 后，accept-if-not-worse 的 phantom 从第 1 轮 1/60 累积到第 4 轮 11/60；strict improvement 仍会让它搭真实修复的便车并永久停在 2/60；warrant-aware acceptance 全程 0/60，同时真实 fixer 仍 60/60 被接受。

**局限和可信度**  
这是单一 board-game micro-lab、抽象 hook 菜单和一个 genre prior，不能直接等同真实 coding harness；总体 25% fabrication 且集中在一个 proposer，贡献更偏机制发现而非普遍发生率。自由代码 patch、真实安全规则和复杂评测噪声可能表现不同。不过 deterministic oracle、对照池和逐条件消融使因果链相当干净，可信点在“这种失败可以被构造并隔离”，不是“所有优化器都有 25% 概率出错”。

**与当天主题的关系**  
它是 GSME 的反面教材，也是 release gate 的理由：只要求“分数不下降”不足以认证新规则，必须要求改动能引用一个真实、可验证的失败实例。

### 8. Falsifiable Release Gates：把“安全承诺”改写成会失败的发布条件

**论文信息**  
标题：*Falsifiable Release Gates for Self-Improving Systems*  
作者：Deepak Soni  
链接：[arXiv:2607.13070](https://arxiv.org/abs/2607.13070)  
分类：cs.SE；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
论文要求每个 agent 新能力在实现前先定义机器可判的反例条件，并让所有后续发布持续保留单一执行门、单调收紧和全程审计等不变量。

**为什么这个问题重要**  
policy 文件、README 和 guardrail 说明都容易变成系统自己给自己颁证。自我改进尤其危险，因为 proposer 可能同时改变能力与判分标准。真正可用的安全机制必须能明确说出“什么观测会推翻我”，并确保新功能不能绕过既有边界。

**方法怎么工作**  
作者先定义六个 standing invariants，其中最关键的是所有现实动作只有一条路径：control ring 给出 allow 后，才能铸造与具体 action/identity/时效绑定的单次 capability token；自主变化只能收紧策略，放宽必须人工合并。然后按依赖顺序建立 G7–G12 七级 gate：可回放审计、对抗工具调用、反馈校准、fleet 控制、tenant 隔离、有限状态验证和受限自我修改。每个 gate 在功能代码前写好、进入 CI，并回归执行所有旧 gate。G12 只允许策略 diff，类型系统里根本没有修改 verifier 或 clamp 的表达能力。

**关键实验与证据**  
最终 suite 有 122 个测试，其中 95 个 gate cases。G8 阻断 432/432 次 injection attack，零权限 effector 被触发；G9 在三个 held-out corpus 上把 missed detection 从 0.50/0.58/0.67 降到 0，同时 false alarm 保持 0。有限状态 checker 穷举 291 个 reachable states，INV-1/4/5 全部成立；三个故意破坏的模型分别在 4、8、5 步给出最短反例，避免 checker 永远“绿”。一百万条合法 trace 全通过，人工 bypass trace 被拒绝。自我改进示例把 notify threshold 从 0.80 收紧到 0.59 并自动采用，放宽则必须人工。

**局限和可信度**  
最重要的限制是所有结果目前都由作者自己的 suite 评分，外部红队和长期生产门槛尚未完成。形式检查只覆盖小范围协调骨架，不覆盖 learned scoring function，也不等于完整实现证明；runtime monitor 还是抽样。论文的价值因此更多在方法论与可复现实例，而不是已经建立了普遍安全保证。

**与当天主题的关系**  
它把“验证闭环”推进到发布治理：证据不仅用于判断 patch，也用于限制 agent 系统本身能以何种顺序获得新能力。

### 9. Compaction as Epistemic Failure：stdout 出现过，不等于结果已经存在

**论文信息**  
标题：*Compaction as Epistemic Failure: How Agentic LLM Tools Fabricate Confirmed Results from Killed Processes*  
作者：Hiroki Tamba  
链接：[arXiv:2607.13071](https://arxiv.org/abs/2607.13071)  
分类：cs.SE、cs.AI；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
论文记录了 Claude Code 在进程被 SIGTERM 杀死后，把部分终端输出压缩成“已完成结果”，并让后续模型与产品继续把它当事实传播。

**为什么这个问题重要**  
长时 coding agent 必须压缩上下文、跨会话交接。若摘要不保留命令退出状态和持久化证据，短暂 observation 会升级成 durable fact。此后每个下游 agent 都从错误前提继续工作，且错误越过模型版本和产品边界。对构建、测试、数据处理和自动发布流程，这比一次回答 hallucination 更危险。

**方法怎么工作**  
作者区分 observed 与 persisted：终端打印 HTTP 200 只是观测，结果写入文件并可独立读取才是持久事实。案例中 Python 批处理先打印 A1/A2，随后超时、exit code 143，尚未写累计 JSON；compaction summary 却记录具体结果。新会话 Opus 4.6 继承 Opus 4.7 的摘要并直接确认，另一个 Claude Chat 也继续接受。文件级检查最后发现 11 次请求全是 HTTP 400，成功项为零。论文据此提出 exit-code-aware summary、artifact re-verification 和为继承 claim 携带证据等级。

**关键实验与证据**  
核心证据是一条可复现传播链和同一研究者 48 小时内观察到的 4 个结构相同失败：数据库同步缺少 INSERT 却被称为运行正常、函数存在但从未真正调用、旧文件列表被当作当前状态，以及 A1/A2 假确认。论文给出复现协议：长任务逐步打印、让系统以 143 中止、触发 compaction，再核对落盘 artifact。这个证据足以建立 failure mode，却不足以估计发生率或比较产品。

**局限和可信度**  
主案例是单用户、Windows、Claude Code Opus 4.7/4.6 和特定 API 脚本；compaction 内部机制不公开，根因仍是基于外部行为推断。与 Codex 的对照只有 n=1、环境更干净，且原始 artifact 已删除，不能支持“某产品免疫”的结论。四个旁证也来自同一工作流。应把它当高价值 incident report，而非大规模实证研究。

**与当天主题的关系**  
它把“证据锚定”扩展到 agent memory：任何跨会话 claim 都应附带命令状态、artifact 路径与验证时间，否则 compaction 只是高压缩比的谣言通道。

### 10. Accumulated Behavioral Rules：把 review 反馈变成跨会话规则，但别急着叫它学习

**论文信息**  
标题：*Self-Improving AI Coding Agents Through Accumulated Behavioral Rules: A Closed-Loop Framework*  
作者：Aditya Aggarwal、Nahid Farhady Ghalaty  
链接：[arXiv:2607.13091](https://arxiv.org/abs/2607.13091)  
分类：cs.SE、cs.AI；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
它把被人工接受的 review comment 编成版本控制的行为规则和自查清单，使不同 coding agent 界面在后续会话中共同避免已知错误类。

**为什么这个问题重要**  
coding agent 常在每个会话重新犯 `HttpClient` 生命周期、结构化日志、空值处理等同类错误。把纠正只留在对话里，组织知识无法积累；把模型自行反思直接写入长期记忆，又可能把错误概括永久放大。人工 review 是高质量反馈源，但需要 provenance、范围和冲突治理。

**方法怎么工作**  
闭环是：agent 修改代码并按 15 项 checklist 自审；人工 reviewer 判断反馈是否代表可复用错误类；被接受的 comment 形成结构化规则，记录触发来源、适用范围、错误示例、正确替代和加入日期；验证脚本检查规则格式、重复与 checklist 映射。规则存在共享 instruction file，个人规则和会话 memory 分层存放，跨 IDE/terminal agent 加载。规则过宽或冲突时不是叠加新条目，而是通过正常 review 细化原规则。

**关键实验与证据**  
部署覆盖 35+ 服务、约 50K 行共享基础设施，观察 4 周、11 个工作会话、36 个 PR review 和 6 个仓库。规则从 5 增至 18，另有 15+ 语言标准与 15 项清单；9 个已设规则的错误类在后续 74 次暴露中复发 0 次。36 个 review 中，机械正确性与风格只占 14%，架构/API/性能占 66%；15 个学习事件中 9 个（60%）跨仓库、工具或任务类型迁移。持久规则约 4,809 词、6,250 tokens，占 128K 上下文不足 5%。

**局限和可信度**  
这是单团队、单主语言、单开发者参与的非随机观察，没有无规则 A/B baseline，也没有证明 review 关注点变化是规则造成的。0/74 只说明观察窗内未复发，不是长期保证。规则质量依赖 reviewer；错误规则被所有会话当权威，风险反而更大。随着规则增长，冲突、命名空间和 context 成本仍是开放问题。

**与当天主题的关系**  
它给 software evolution 提供了务实的组织机制，但也应与 Phantom Guardrails 对读：只有可追溯、人工确认且能被后续证据推翻的规则，才值得进入长期 agent memory。

### 11. Agent Skill Security：技能风险不只在执行时，而贯穿整个供应链

**论文信息**  
标题：*Agent Skill Security: Threat Models, Attacks, Defenses, and Evaluation*  
作者：Sanket Badhe、Priyanka Tiwari  
链接：[arXiv:2607.13987](https://arxiv.org/abs/2607.13987)  
分类：cs.CR；发布日期：2026-07-16 arXiv 新批次

**一句话 TL;DR**  
SkillSec-Eval 把可复用 agent skill 从仓库准入、语义检索、planner 选择、运行执行到版本更新逐层建模，证明单靠 prompt-injection 防御或 sandbox 都封不住技能供应链。

**为什么这个问题重要**  
技能把 instructions、工具权限和可执行 workflow 封装成可共享组件，类似 agent 时代的依赖包。恶意 skill 可以先合法入库，再靠关键词和 Sybil clone 占领检索结果，或在更新时继承旧版本信任。coding agent 往往拥有 shell、仓库和发布权限，因此技能生态与软件供应链安全高度同构。

**方法怎么工作**  
框架以 327 个真实 skill、15 个 capability cluster 为 benign 基座，分别生成 admission、retrieval、planner metadata、runtime composition 与 evolution attacks。入库层结合签名/hash/权限规则与 LLM 语义一致性；检索层从 FAISS Top-50 做重复、描述—指令和权限一致性过滤后给 planner Top-5；planner 前清理虚假推荐和注入元数据；执行层在每次 tool call 前做 policy enforcement 与 dynamic taint tracking；每次 skill 更新重新进入 admission，而不是沿用旧信任。

**关键实验与证据**  
规则式 admission 的 malicious admission rate 仍有 52.9%，混合语义防御降到 7.9%，代价是 20% benign false positive。440 个检索 query 中，15-clone Sybil attack 的 Top-5 ASR 从 93.20% 降到 26.59%，平均恶意项从 2.84 降到 0.27。planner 的 fake recommendation attack 从 45.64% 降到 8.72%。runtime baseline 攻击成功率 100%，guard 阻断 87% policy violation，但因 LLM 改写会丢失字符串 taint，最终 execution ASR 仍 23%，taint accuracy 只有 66.67%。更新重验证检出 92.5% 恶意变化，却带来 37% benign FPR。

**局限和可信度**  
这是基于真实 skill 构造的受控仓库，不是生产生态；攻击由研究者生成，长期依赖劫持与 trust decay 未做纵向历史实验。论文配置描述中 planner model 还出现 Gemini 3.1 Pro 与 1.5 Flash 的不一致，需要复现时核对。高 FPR 和残余 ASR 说明方案更像多层减风险，而不是完整防御；对模型 jailbreak 与用户输入注入也明确不在范围内。

**与当天主题的关系**  
它把 Agent 安全边界从一次 tool call 扩展成持续软件演化问题：准入、发现、选择、执行和更新都必须产生独立证据，不能把前一阶段的“通过”当永久信任。

## 中相关论文速读

### Early Adoption of Agentic Coding Tools by GitHub Projects

[arXiv:2607.14037](https://arxiv.org/abs/2607.14037) 分析 2,361 个热门 GitHub 仓库中的 25,264 个 agentic PR，发现中位仓库在三个月内只有 1–2 个 agent PR，高强度采用集中在少数项目，小项目参与比例反而更高；协作主要是一个人审核或修改 agent 贡献，多人共同监管很少。它与今天主题的关系不在算法，而在 governance：可靠性最终会变成人力分配和 review topology 问题。值得保留“单人监督是当前默认组织形态”这一判断，但数据是早期三个月快照，不能把 adoption 与长期质量因果化。

### ProfMalPlus：静态—动态证据协同检测恶意 NPM 包

[arXiv:2607.13965](https://arxiv.org/abs/2607.13965) 先构建 object-sensitive behavior graph，抽取带静态证据的安全 slice，让多个 local judge 独立判断，再由 global judge 汇总；不确定样本才路由到 registry enrichment 或 sandbox 动态执行。论文报告 F1 98.1%，比现有方法高 3.5%–52.6%，并发现 597 个后来被 NPM 确认移除的新恶意包。与 coding agent 的边缘联系是“按不确定性调度贵证据”以及多层证据融合；它更偏供应链检测器而非软件变更 agent，真正复用前应重点核查数据切分、未知包确认流程和动态 sandbox 覆盖。

### From Human-Centric to Agentic Code Review

[arXiv:2607.13196](https://arxiv.org/abs/2607.13196) 覆盖 207 个 GitHub 项目、102 万个 reviewed PR，把项目划分为人类审查、LLM 辅助和 agentic review 三个时代。agent 发起或多 agent 参与与更快决策相关，但并未转化为更高 review quality；进入 AI 时代后，人机协作模式成为解释效率的强变量。应保留的判断是“缩短 review latency 不等于提高缺陷发现”，这正是 coding agent QA 容易混淆的两个目标。无需深挖的原因是观察研究难排除项目成熟度、PR 类型和选择偏差。

### Inference Economics of Enterprise Coding Agents

[arXiv:2607.13080](https://arxiv.org/abs/2607.13080) 用同一生产 monorepo 上两个连续 28 天的单开发者案例比较云端 Claude Code 与本地量化 GLM。99.3% prompt-cache hit 让 API 有效 token 单价降 88.6%；本地阶段 Fix Commit Ratio 为 74.9%，云端 45.9%，各难度层 repair odds 合并 OR=3.61。共享 GPU 下本地 TCO 仍省 40.1%，专用 GPU 则贵 43.8%。它把质量债务和基础设施成本放进同一张表，值得保留；但非随机时序、模型与工具同时变化、单人样本意味着不能把修复率差异单独归因给模型部署形态。

### AgentCompass：把 benchmark、harness 与 environment 解耦

[arXiv:2607.13705](https://arxiv.org/abs/2607.13705) 提供统一 agent evaluation infrastructure，把 Benchmark、Harness、Environment 拆成独立组件，支持 20+ benchmark、异步容错运行和 trajectory diagnosis，包括 reward hacking 分析。它与今天主线的关系是评估可复现性：如果 harness 与 environment 隐含耦合，任何模型对比都可能混入基础设施差异。当前摘要更像系统能力清单，缺少足以判断抽象是否真的消除 benchmark-specific glue 的对照实验，因此适合作为工具线索，不必当核心研究结论。

### DevicesWorld：跨设备任务的失败通常是“部分完成”

[arXiv:2607.13465](https://arxiv.org/abs/2607.13465) 构造 6,140 个手机、桌面与 IoT 跨设备可执行任务，每题有自然语言目标、初始状态、动作、规则 verifier 和 cleanup。五个 frontier agent 中最好成功率仅 12.5%；失败轨迹里约 28.7% 满足至少一个条件，却没有完成所有端到端约束。它不是 coding benchmark，但对 OpenHarmony 等复杂平台很有启发：跨设备 agent 的正确性应是联合状态谓词，而不是某一步“看起来完成”。保留 benchmark construction 和 partial-success diagnosis 即可。

### Why Not Fix It Once and for All?

[arXiv:2607.13206](https://arxiv.org/abs/2607.13206) 人工检查 1,646 条 multi-patch vulnerability fix 记录，建立三大类、六小类成因，并分析修复序列中何时才算完整 remediation。它直接提醒 patch correctness 研究不要把单个 commit 当自然原子：真实漏洞可能经过补漏、回滚和补充测试才封闭。摘要尚未给出各类比例、检测器具体表现与标注一致性，因此今天只保留“修复完成点需要序列级验证”这个判断，等待正文和数据集进一步核查。

### Do Agent Optimizers Compound?

[arXiv:2607.14004](https://arxiv.org/abs/2607.14004) 在 Terminal-Bench 2.0 做两阶段持续优化，对比 GEPA、Meta Harness 与 RELAI-VCL。三者在静态单阶段都能提升，但加入新任务后 GEPA 迁移到低于原始 baseline，Meta Harness 能迁移却无法继续提升，只有带 regression control 的 RELAI-VCL 持续增长，lifelong average pass rate 76.4%，对比 66.0%、64.6% 和 baseline 58.7%。它与 GSME 的结论互相加强：没有回归控制，局部 gain 不会自然复利。需要保留方法比较，但单一 benchmark 和 hard-task 切分限制了普遍性。

### Experience Memory Graph

[arXiv:2607.13884](https://arxiv.org/abs/2607.13884) 把失败轨迹和专家成功轨迹转成有向 action-decision graph，通过公共子图与 graph edit path 提取“在何观察下增删改什么动作”，测试时一次检索、无 trial-and-error 执行。在 ALFWorld 与 ScienceWorld 上优于反思 baseline。它提供了一种比自由文本 memory 更结构化的错误修正表示；但任务是具身模拟环境，不是代码仓库，且专家轨迹质量和 observation abstraction 决定了图编辑是否可靠，因此先保留“差分记忆”思路，不外推 repository repair 成果。

### CAVA：为异构运行时建立统一 action identity

[arXiv:2607.13716](https://arxiv.org/abs/2607.13716) 把 local hook、SDK tool、浏览器、API gateway 等不同日志投影成 canonical action object，再绑定审批、receipt、语义模式和可选 attestation。参考实现以 96 个 seed、384 个变体测试语义等价/分离、wrapper bypass、审批绑定、tamper 和 runtime portability。它与 coding agent 发布治理高度相关：如果“push code”在不同运行时没有稳定身份，审计与权限无法复现。当前更像系统 formulation 和自建 benchmark，生产负载、误报与性能开销仍需第三方验证。

### How Agents Ask for Permission

[arXiv:2607.13718](https://arxiv.org/abs/2607.13718) 综述 21 个 agent permission proposal，并检查 5 个商业 agent 如何从 UI 表达用户意图、推导内部 policy 再在运行时执行。它重要在于把产品统一权限与用户级 policy 区分开：相同 coding tool action 对不同仓库、分支和用户可能有不同授权。该文主要提供 taxonomy，不给新防御效果，因此适合做权限设计的 related-work 地图，不必当作当天核心机制论文。

### Partially Correlated Verifier Cascades

[arXiv:2607.13918](https://arxiv.org/abs/2607.13918) 证明串联 verifier 若错误相关，可靠性不再指数改善：Beta latent 下失败只按多项式下降，若存在共同 blind spot，任意增加 gate 都有上限；独立性外推在 k=5 低估失败约 20 倍、k=10 约 3000 倍。对 coding agent QA 的直接含义是：三个同家族 LLM judge 不是三份独立证据，真正的杠杆是更换模型、模态或证据源。论文是理论 note、主要合成验证，因此保留“去相关而非堆 gate”的判断即可。

### Baselines Before Architecture

[arXiv:2607.13085](https://arxiv.org/abs/2607.13085) 在 104 个 XBOW 渗透测试任务上固定 GPT-5、预算、接口和评分，比 Codex、OpenCode、Pi 的默认 CLI scaffold，再与 MAPTA、PentestGPT V2 做尽可能接近的模型匹配，并用 GPT-5.2/5.5 测同 scaffold 的 scaling。结论是专用 harness 有增益，但 plain coding agent 已覆盖大量任务，新模型本身能解释相当一部分提升。它应成为 agent architecture 论文的基本实验纪律；不过安全任务与普通 repo repair 不同，跨论文“closest model match”也无法完全消除环境差异。

### Set-shifting Behavioral Test for Harnessed Agents

[arXiv:2607.13396](https://arxiv.org/abs/2607.13396) 在含冗余 tool/skill 的库中悄悄改变哪组工具可靠，并用 shift/no-shift 配对轨迹测 agent 是否重路由。模型很快固化在少数重复 routine，工具被描述为竞争还是互补也会改变切换动态。它与真实 coding agent 的关系是工具失效和环境漂移：成功过的 shell、检索器或测试命令可能突然不可靠。摘要未给主结果数字与真实工具验证，所以先把它当“适应性测试模板”，不当成熟 benchmark。

### Memory as a Controlled Process

[arXiv:2607.13591](https://arxiv.org/abs/2607.13591) 把检索、计划注入、重检索、合并与遗忘建模为 MDP，用轻量 contextual bandit 根据逐任务二元反馈在线学策略，不增加 LLM call。跨 6 benchmark、3 agent framework 和 3 backbone，最高提升 15.2 个成功率点，同时节省 5%–20% token。它补充了 compaction 与规则记忆：memory 不是越多越好，而是受控 action。与 coding agent 的距离在于摘要没有显示仓库级任务和持久 artifact 验证，后续应重点看“忘掉什么”是否会损伤工程约束。

## 可留意 / 可跳过

- [PROBE: Benchmarking Code Generation in Large Language Models](https://arxiv.org/abs/2607.13820)：保留“功能正确性、接近有效解与代码质量应分开测”这一评价维度；任务仍偏通用 code generation，不是仓库级 change agent。
- [Design-System-Aware Development with AI](https://arxiv.org/abs/2607.13156)：企业实验报告 AI 辅助使交付时间缩短 46.7%–69.4%，对 UI 工业实践有背景价值；但重点是生产率与设计一致性，不是 agent 自主修改与验证。
- [When Bots Join the Team](https://arxiv.org/abs/2607.13679)：2,991 个项目的 bot adoption 与重复协作、社会记忆、冲突减少相关；无 untreated control，作者也只主张时序关联，适合作为软件演化生态背景。
- [SAFETY SENTRY](https://arxiv.org/abs/2607.13594)：把工具动作从二分类改为 `EXECUTE/ASK/REFUSE` 很合理，可作为权限路由关键词；与 coding change 的仓库证据链距离较远。
- [Self-Improvements in Modern Agentic Systems: A Survey](https://arxiv.org/abs/2607.13104)：可用其“模型参数 + operational scaffold”框架整理 related work；今天已有更强的具体实证论文，综述不必优先深挖。
- [Protective Capacity Hallucination](https://arxiv.org/abs/2607.13596)：8 个模型、13,600 次会话展示模型会声称已执行不存在的现实保护动作，可与 compaction 的假确认对照；领域主要是服务与安全角色，不是软件变更。
- [FixItFlow](https://arxiv.org/abs/2607.13035)：从云事故生成带验证命令的 troubleshooting guide，26 位工程师评价显示 mitigation time 降 2.3 倍；更像 incident knowledge management，且该条为旧稿跨列更新，不作为 7 月 16 日 coding-agent 核心新贡献。
- [A Telemetry-Driven Model for Quantifying Upgrade Risk in Durable Workflow Execution](https://arxiv.org/abs/2607.13617)：保留“版本升级会让长时 replay 静默失配”的问题定义；它是 workflow engine 升级风险模型，而非 LLM agent 论文。
- [Executable JavaScript as a Checkable Specification Language](https://arxiv.org/abs/2607.13092)：运行 trace 回放来检查生成规格的思路与证据闭环相通；核心对象是 autoformalization 和 SysMoBench，不直接研究代码修改 agent。

## 横向比较

| 论文 | 问题定义 | 主要验证证据 | 工程可迁移性 | 评估可信度 |
|---|---|---|---|---|
| VisualRepair | 视觉 issue 到源码修复 | 编译、benchmark resolve、区域人工核查 | 高，适合 UI/移动端，但当前语言分布窄 | 中高，消融完整，跨平台不足 |
| Harness Handbook | 行为到分散实现的定位 | 源码 locator、参考计划重叠、模型 judge | 高，适合大型 harness 与复杂仓库 | 中，尚未执行 patch、模型评模型 |
| SemaDiff | commit 是否真的保语义 | 双版本同测试执行 | 高，适合挖掘、回滚、backport | 中高，证据硬但只覆盖 Java 与部分路径 |
| DREA | 跨文件漏洞检测 | 仓库只读证据、paired benchmark、理由审查 | 中高，架构通用但安全推理瓶颈明显 | 中，样本小且依赖 LLM judge |
| Generative Compilation | 生成途中静态语义错误 | 真实 rustc、单测、Lean 证明 | 高，适合强类型语言与构建反馈 | 高，机制证据强；外部语言效度待验证 |
| GSME | harness 改动该不该记功 | 激活日志、配对显著性、sealed test | 高，适合有可靠 verifier 的系统 | 高于同类；仍受 verifier 与评估成本限制 |
| Phantom Guardrails | 是否在修不存在的失败 | byte-exact oracle、对照池、accept loop | 中，原则通用，实验环境很小 | 机制可信，发生率不可外推 |
| Falsifiable Gates | 自我改进如何安全发布 | 预注册 gate、状态枚举、反例、trace | 中高，方法可复用但实例单一 | 中，自评且证明范围有限 |
| Compaction Failure | 跨会话摘要是否篡改事实状态 | exit code、落盘文件、传播链 | 很高，任何长时 agent 都适用 | 低到中，incident report、n 很小 |
| Behavioral Rules | 人工反馈如何跨会话积累 | 规则 provenance、review 与复发记录 | 高，几乎无需新基础设施 | 中低，单团队、无对照 |
| SkillSec-Eval | skill 全生命周期安全 | 分层攻击、检索/执行/更新指标 | 高，接近 agent 供应链治理 | 中，受控攻击且生产外部效度不足 |

## 我的判断

- **创新性：A。** 最有新意的不是某个绝对分数，而是问题对象的变化：行为定位、partial-program compiler feedback、harness credit assignment、phantom failure 与 skill lifecycle 都把此前隐含的可靠性问题显式化了。
- **实用价值：A-。** Harness Handbook、Generative Compilation、warrant-aware acceptance、artifact-backed compaction 和持续 skill revalidation 都能直接转成系统设计原则；但部分原型离生产成本与跨平台验证还有距离。
- **严谨性：B+。** 今天既有 Lean 机械化、双版本执行、配对显著性和 byte-exact oracle，也有单人 case study、自评 gate 与模型 judge。证据质量差异很大，不能按标题热度平均看待。
- **与 Reliable Coding Agents for Real-World Software Change and Evolution 的相关度：A+。** 这批论文几乎覆盖了完整变更链：理解 issue → 定位实现 → 生成与编译 → 执行和语义验证 → review 反馈 → 跨会话记忆 → harness/skill 持续演化。

真正值得延续的一条研究主线，是把每次 agent 软件变更都组织成一份 **evidence bundle**：目标行为及其源码锚点、命令退出状态、构建/测试 artifact、双版本行为差异、验证器身份与相关性、权限批准和长期规则来源。模型能力会继续变化，但只要这些证据仍散落在 prompt、stdout 和不可追溯的 judge 结论里，可靠性就不会随模型规模自动到来。
