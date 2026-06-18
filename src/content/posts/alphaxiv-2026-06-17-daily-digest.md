---
title: "昨天的 arXiv 在问同一个问题：Agent 的判断如何被验证？"
date: "2026-06-17"
description: "2026-06-17 的相关论文集中讨论仓库级 Agent、漏洞审计、时间安全 benchmark、工具契约与证据锚定。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性"]
series: "alphaXiv论文解读"
coverColor: "from-emerald-500 to-cyan-600"
---

# 昨天的 arXiv 在问同一个问题：Agent 的判断如何被验证？

2026-06-17 这批论文很像一组互相照镜子的工作：它们不再满足于让 LLM Agent 给出一个判断，而是在追问这个判断能不能被验证、被追踪、被反驳。安全审计、软件工程 benchmark、工具调用防御、架构文档反馈、供应链检测，看起来是不同场景，但共同主题很清楚：Agent 进入真实工程环境以后，最稀缺的不是“会说”，而是“说出来以后有证据”。

这一天尤其值得读，因为强相关论文覆盖了三条正在汇合的线。第一条是仓库级安全 Agent：OpenAnt、Code-Augur、PYPILINE 都把 LLM 放进静态分析、知识库、fuzzing、动态验证组成的工作流里。第二条是评估协议：SWE-Future 和 Compute-Budgeted Evidence Graphs 都在处理时间泄漏和未来信息污染。第三条是 Agent 边界：CAPRA、ContractGuard、Agent communication protocol taxonomy 都在问一个更系统的问题，即 Agent 与证据、工具、协议和外部状态之间应该怎样连接。

下面的解读基于 arXiv 官方元数据和已下载 PDF 文本。强相关和中相关论文的 PDF 均已下载并抽取文本；本文尽量围绕方法与证据展开，而不是把摘要换一种说法。

## 今日脉络

昨天相关论文可以分成四组。

**第一组是“验证闭环”**。OpenAnt 和 Code-Augur 都做 agentic vulnerability detection，但它们真正的贡献不是“LLM 找到了更多漏洞”，而是把 LLM 的判断放进可执行闭环：OpenAnt 强调从代码分解到动态 exploit reproduction 的漏斗，Code-Augur 强调把 agent 的隐含安全假设写成 assertion，再交给 fuzzer 反驳。

**第二组是“时间一致性”**。SWE-Future 说，真实 GitHub issue/PR 任务虽然逼真，但在今天的模型训练生态里很容易污染；Compute-Budgeted Evidence Graphs 则在漏洞 triage 里展示，随机切分和未来证据会让指标膨胀到几乎失真。这两篇都在提醒：真实世界数据不是天然可靠，时间边界才是评估可信度的一部分。

**第三组是“证据锚定”**。CAPRA 在软件架构反馈里做 deterministic evidence anchoring，PYPILINE 在供应链检测里把 static API knowledge base 作为 agent 推理基础，Graph-ESBMC-PLC 则给了一个反面教材：验证器如果生成空 IR，验证成功反而是危险信号。

**第四组是“Agent 接口与契约”**。ContractGuard 把工具安全的信任边界从 agent policy 转移到 contract integrity；Agent communication protocol taxonomy 则把多 Agent 系统的通信协议拆成可比较的技术维度。它们都在把“Agent 系统”从 prompt 层往工程接口层拉。

## 强相关论文深读

### 1. OpenAnt：仓库级漏洞发现，不是靠长上下文硬看，而是靠验证漏斗

**论文**：[OpenAnt: LLM-Powered Vulnerability Discovery Through Code Decomposition, Adversarial Verification, and Dynamic Testing](http://arxiv.org/abs/2606.19149v1)  
**作者**：Nahum Korda, Gadi Evron  
**分类**：cs.CR, cs.LG  
**发布日期**：2026-06-17

**TL;DR**：OpenAnt 把大型代码库漏洞发现拆成一个逐级收窄、逐级加证据的 pipeline：先用静态结构削减分析面，再让 LLM 做语义判断，最后用对抗验证和动态 exploit 环境筛掉不可执行的发现。

OpenAnt 要解决的是一个很硬的工程问题：真实大型代码库的漏洞发现既不能完全依赖静态分析，也不能把所有希望放在 LLM 的长上下文推理上。论文开头指出，传统静态分析在真实项目上的 false positive 可能从个位数到 40% 以上不等，具体取决于工具、数据集和配置。开发者面对大量 warning 时会疲劳，重要发现也会被噪声淹没。另一方面，LLM 有更强语义推理能力，但直接应用到 repository-scale security analysis 会遇到上下文管理、成本、验证不足三重问题。

它的解法是把“让 LLM 看代码”改造成一个六阶段漏斗。第一步，用语言相关 AST 抽取函数和代码单元。第二步，从外部输入入口出发做 reachability filtering，只保留攻击者可能触达的路径。第三步，把可达代码包装成自包含分析单元，让 LLM agent 通过工具辅助导航、查 caller、读函数、跟踪数据流。第四步，对候选漏洞做 adversarial verification：模型不能只说“这里可能有漏洞”，还要在受限攻击者能力下尝试多种 exploit strategy，证明这个条件在现实威胁模型里可触达。第五步，进入动态验证：系统为漏洞生成临时 exploit environment，在 sandbox/container 中执行；如果 build failure 或 runtime crash，错误消息会回传给 LLM，最多迭代三次修正测试环境。第六步，最终只留下有动态证据支撑的发现。

论文中最有说服力的不是某一个 prompt，而是分析面收缩的数字。作者报告在大型仓库中，reachability filtering 可以消除 83%-99% 的函数；摘要中称最多约 97%。在 OpenSSL 示例里，原始抽取函数数达到 15,232，经过后续暴露分类后，外部可利用单元只剩 586，不到原始代码库的 1%。这说明 OpenAnt 并不是寄希望于模型“读完整个 repo”，而是先用程序结构把问题变小，再把 LLM 放到更窄但更相关的空间中。

实验设计上，OpenAnt 有一个值得注意的选择：它没有把 Juliet、OWASP Benchmark 或公开 CVE benchmark 当作主要评估对象。论文明确说这些 benchmark 对现代 code-oriented LLM 存在污染风险，有些测试文件名甚至直接暴露 vulnerability type，容易让模型走 shortcut learning。因此作者转向真实开源项目，包括 web application、automation platform、cryptographic library、web framework 等多种项目类型。这个选择很对，但也带来新的不确定性：真实项目评估更贴近实践，却更难做系统性 recall 估计，因为未知漏洞本身没有完整 ground truth。

这篇与当天主题的关系很明确：它把 Agent 判断变成逐层验证的工程产物。LLM 在这里不是最终裁判，而是中间推理器；真正让结论站得住的是 reachability、attacker simulation、dynamic reproduction 这些外部证据。局限也在这里：如果动态验证环境覆盖不了某类漏洞，或者 adversarial verification prompt 对特定语言/框架不敏感，OpenAnt 仍可能漏掉重要问题。论文强调相同 prompt 可跨语言应用，这是好信号，但跨语言泛化的系统性边界仍需要更多案例支撑。

### 2. Code-Augur：把“我觉得这里安全”变成可被 fuzzer 打脸的断言

**论文**：[Code-Augur: Agentic Vulnerability Detection via Specification Inference](http://arxiv.org/abs/2606.18619v1)  
**作者**：Zhengxiong Luo, Mehtab Zafar, Dylan Wolff, Abhik Roychoudhury  
**分类**：cs.CR, cs.AI, cs.SE  
**发布日期**：2026-06-17

**TL;DR**：Code-Augur 不只让 Agent 报告漏洞，还要求它把安全判断背后的隐含假设写成源码断言；随后 guided fuzzer 尝试 falsify 这些断言，从而暴露漏洞或修正错误 specification。

如果说 OpenAnt 关注“候选漏洞能否被验证”，Code-Augur 关注的是另一个更微妙的问题：Agent 没报漏洞时，我们凭什么相信它？当前许多 agentic security systems 可以找到 impressive 的漏洞，但它们的 negative judgment 很难解释。一个 agent 说某个组件安全，可能是因为它理解了输入约束，也可能是因为它漏掉了某个特殊路径。论文把这个问题称为 agent tacit assumptions 的不透明性。

Code-Augur 的核心范式是 security-specification-first。它先从代码、文档和构建上下文中 distill threat model，再让 agent 分析各个组件。当 agent 认为某处安全时，不是把判断留在自然语言里，而是把 local invariant 写进源码，形成 assertion。这些 assertion 是 agent 对程序语义的承诺：如果它认为某个输入组合不可能出现，或某个状态关系必须成立，就要把这个假设落到可执行检查上。接着，guided fuzzer 尝试生成输入去违反这些 assertion。触发 assertion 后有两种可能：要么是真漏洞，要么是 assertion 本身太强或错误。无论哪种情况，Agent 的理解都必须被修正。

论文的 motivating example 来自 Little CMS。简化案例中，攻击者控制的 profile 可以构造带 13 个 channel 和 PT_ANY wildcard 的 pixel format，而库中 transform 的 entry color space 固定为单 channel；某个 guard 因 PT_ANY 分支直接返回 true，没有比较 channel count。人读这类 bug 时，关键不只是发现一行 if 有问题，而是意识到 agent 对“这个 guard 代表什么安全条件”的理解可能是错的。Code-Augur 的 assertion insertion 正好把这种理解变成可测试对象。

实验上，论文使用 DARPA AI Cyber Challenge 和 OSV database 相关 benchmark，并在两个 frontier LLM 下评估。摘要称 Code-Augur 比其他 SOTA agent 检测出更多漏洞，并发现 22 个新的 open-source vulnerabilities，其中 16 个已经被修复。这些数字说明它不只是形式上优雅，也有实际发现能力。不过，和所有漏洞发现论文一样，读者要注意两个问题：第一，发现的新漏洞并不等于整体 recall 高；第二，assertion 的强弱会极大影响 fuzzer 的效率和误报。如果 agent 写出的 spec 太弱，fuzzer 无法触发；太强，则会制造大量 benign violation。

Code-Augur 和当天主题的关系在于它把 Agent 的“理解”外化成了程序对象。很多 LLM Agent 工作把 reasoning trace 当解释，但 trace 仍然是语言；Code-Augur 让解释变成 assertion，让 assertion 经受执行。这个方向比“让模型自我反思”更工程化，也更可审计。它的局限同样清楚：specification inference 仍然依赖模型本身，guided fuzzing 能否覆盖足够路径也取决于 harness 和输入建模。即使如此，这篇仍是昨天最值得认真读的论文之一，因为它把“可信 Agent 判断”推进到了可反驳层面。

### 3. SWE-Future：SWE Agent benchmark 的真实性，不能再靠历史 PR 重放

**论文**：[SWE-Future: Forecast-Conditioned Data Synthesis for Future-Oriented Software Engineering Agents](http://arxiv.org/abs/2606.18733v1)  
**作者**：Qiao Zhao, JianYing Qu, Jun Zhang, Yehua Yang, Hanwen Du, Zhongkai Sun  
**分类**：cs.SE, cs.AI  
**发布日期**：2026-06-17

**TL;DR**：SWE-Future 用仓库时间点 T0 之前的 evidence 预测未来 task family，再基于预测结果合成 coding-agent 任务，以减少直接重放 GitHub issue/PR 带来的污染风险。

这篇论文的问题定义非常切中当前 SWE agent 评估的痛点。SWE-bench 一类 benchmark 的价值来自真实 GitHub issue 和 pull request：任务不再是孤立函数，而是带有仓库上下文、测试、依赖和项目习惯的真实软件工程问题。但它的风险也来自同一个来源。公开 issue、PR discussion、reference patch、benchmark traces 可能进入预训练、微调、合成数据生成或模型选择流程。随着 benchmark 越有名，这种污染风险越高。完全合成任务虽然能降低污染，却可能脱离真实仓库需求。

SWE-Future 试图走中间路线：不用直接重放已经发生的 PR，而是从过去预测未来。方法有四步。第一，在时间点 T0 为每个 repo 构建 evidence bundle，包含 T0 前的 issue、PR、label 和文本。第二，基于这些信息 forecast 未来 feature implementation/enhancement、bugfix、refactor task families。第三，固定 forecast 后，用 T0 之后真实发生的 PR 只做 retrospective validation，检查预测任务族是否确实对应未来仓库工作。第四，在 task-generation snapshot 中，以 validated families 为条件合成任务，而不是复制后来的 PR。

论文把 temporal boundary 画得很清楚：forecast 使用 pre-T0 evidence，validation 使用 later PR，但 later PR 不进入公开任务构造。这个边界是它区别于历史重放 benchmark 的关键。作者在 80 个 repository 上做 retrospective validation，forecaster 对 76 个 repo 输出 260 个 families，剩下 4 个因为没有 cluster 超过 evidence threshold 而 abstain。强相关或相关的 family 有 151 个，覆盖 61 个 repository。类别上，bugfix families 最容易形成可合成方向，89/139 个达到 strong+related；feature/enhancement 更难，45/93 个达到 strong+related。最终数据集包含 200 个 coding-agent tasks，来自 61 个 repo。

最重要的结果是 58.1% future-work relevance。这个数字不算惊艳，但很诚实：预测未来仓库演化本来就难。它说明 repository evidence 对未来工作有明显信号，但也远不是确定性 oracle。比起把这个数字包装成高性能，我更喜欢它暴露出的研究问题：什么样的仓库历史能预测未来任务？什么类型的变更更容易被 forecast？feature、bugfix、refactor 的可预测性差异是否反映了软件演化的结构性规律？

这篇和当天主题的关系是“验证不只是执行层面的，也包括评估协议层面的”。如果 benchmark 本身带有未来信息泄漏或历史重放污染，再强的 agent 结果也很难解释。SWE-Future 的贡献不在于生成了 200 个任务，而在于提出了一个更时间一致的任务构造范式。局限也明显：forecast relevance 只有中等水平，合成任务是否真正保留项目约束，需要看 executable validation assets 和 hidden artifact boundary 的质量。此外，语义匹配并不等同于可执行修改需求，后续仍需要更多人工审计和 agent performance 分析。

### 4. CAPRA：多 Agent 评审软件架构文档，关键不是多 Agent，而是证据锚定

**论文**：[CAPRA: Scaling Feedback on Software Architecture Deliverables with a Multi-Agent LLM System](http://arxiv.org/abs/2606.18976v1)  
**作者**：Marco Becattini, Niccolo Caselli, Matteo Minin, Roberto Verdecchia, Enrico Vicario  
**分类**：cs.SE, cs.AI  
**发布日期**：2026-06-17

**TL;DR**：CAPRA 用多 Agent 系统评审软件架构交付物，但最值得注意的是 deterministic evidence anchoring：每个反馈 claim 都要尽量绑定回原始文档和图中的证据片段。

CAPRA 的场景是软件工程教育。学生提交架构文档、UML 图、需求说明和设计理由，教师需要检查结构完整性、需求 traceability、功能是否覆盖、问题严重程度和反馈可操作性。传统自动评分更擅长代码或选择题，对这类多模态、半结构化、主观但又需要证据的 artifact 不太适用。LLM 看起来很适合生成反馈，但问题也很明显：它可能说得像真的，却无法指出学生文档哪里支撑了这个判断。

系统架构分为几个阶段。首先是 document parsing：CAPRA 用 Python microservice、PyMuPDF 和 vision-enabled LLM 解析文本和 UML 图。然后是 parallel multi-agent evaluation：多个 specialized agents 针对不同维度检查文档，例如规格、测试、功能覆盖、架构一致性。接着是 evidence anchoring：agent 发现的问题不能直接进入报告，而要通过 fuzzy matching 和 normalized Levenshtein distance 回连到原始文档片段。最后由 ConsistencyManager agent 做 cross-verification、deduplication 和 merge，再生成 template-compliant LaTeX feedback。

它的经验结果不大，但信息密度够。评估使用 10 份学生报告，构建 8 项二元评价 taxonomy，覆盖 extraction completeness、feature validation、issue grounding、severity detection、recommendation specificity、traceability、template/tone compliance 等方面。严格双评审聚合下，CAPRA 满足 88.8% criteria；两名评审 raw agreement 93.75%，但论文提醒这个数字要谨慎解读，因为 corpus 主要由高分报告组成，多数类别天然偏 pass。Cohen's kappa 为 0.582，属于中等一致性。效率上，CAPRA 每份报告略多于 4 分钟，约 0.44 美元，论文称相比 30-45 分钟人工评审有 7.2-10.8 倍加速。

这篇的关键不在“多 Agent 比单 Agent 强”，论文也没有充分证明这一点。真正重要的是 evidence anchoring 的设计哲学：LLM 的反馈必须能回到 artifact 中的具体证据，否则它只是漂亮的评论。它和 OpenAnt、Code-Augur 是同一条线的不同表述：OpenAnt 用动态执行锚定漏洞，Code-Augur 用 assertion/fuzzing 锚定安全假设，CAPRA 用文本/图匹配锚定文档反馈。

局限也很清楚。样本只有 10 份，而且是高分学生报告，不能代表混乱、缺失、低质量、跨语言的真实课程提交。评估 taxonomy 是二元化的，可能掩盖反馈质量的细粒度差异。vision-enabled LLM 对 UML 图的解析错误也可能向后传播。尽管如此，这篇对“Agent 输出如何被证据约束”提供了一个很具体的中间层设计，不需要读者关心教育场景，也能理解它在 Agent reliability 上的价值。

### 5. Vibe Coding 到 Product Lines：AI 生成软件把 variability 挪到了生成时刻

**论文**：[Where Did the Variability Go? From Vibe Coding to Product Lines by Regeneration](http://arxiv.org/abs/2606.19042v1)  
**作者**：Xhevahire Ternava  
**分类**：cs.SE, cs.AI  
**发布日期**：2026-06-17

**TL;DR**：这篇论文观察到 vibe-coded 软件几乎不保留传统软件产品线意义上的 compile-time/runtime variability，而是把变体决策提前到 generation time，并提出 Variability by Regeneration。

这篇和前几篇的技术味道不同，更像一个概念性软件工程问题：当整个程序由 LLM 从 prompt 生成时，传统软件工程里精心维护的 variability 去哪里了？软件产品线过去会把 variability 放在代码、配置、编译选项、插件、运行时开关里，让同一套 artifact 支持不同环境和用户需求。vibe coding 则倾向于从自然语言生成一个目的明确的完整程序。作者对 10 个 vibe-coded C/C++ GitHub 项目做探索性分析，结论是这些 artifact 几乎没有 compile/runtime variability；变体选择发生在 LLM 生成源码的那一刻。

作者没有把这件事简单定义成缺陷，而是提出 Variability by Regeneration。基本思路是把 feature model 和 variant configuration 留在 specification 中，让 LLM 作为 derivation engine，为每个 variant 生成 purpose-built binary。系统中有一个 dispatcher，根据用户请求路由到对应 variant binary。形式化上，论文把 specification 写成 S = <F, tau, V, C>：F 是 feature 集合，tau 给 feature 类型，V 是 variant configuration，C 是 requires/excludes 等约束关系。也就是说，variability 不再主要存在于源码 artifact，而存在于 spec 和生成过程。

这个观点很有意思，因为它改变了“软件演化”的单位。传统 SPL 里，维护者维护的是一个带 variability 的代码库；在 VbR 设想中，维护者更像是在维护一个生成规范、一个 dispatcher 和一组可再生成 artifact。这样可以得到更干净、更少 dead code 的 binary，但代价是生成一致性、变体间行为一致性、LLM 输出可控性、dispatcher overhead、验证成本都会变成核心问题。

实验和证据相对薄。论文的探索性分析只有 10 个项目，VbR pipeline 也只在一个 wc product family 上演示。作者自己也承认，扩展到几十个 variants、测量 generation cost、LLM consistency、dispatcher overhead，以及自动验证 VbR properties 都是开放问题。因此，这篇不应被当作成熟系统论文读，而应当读作一个概念提醒：AI-generated software 可能改变 variability 的 binding time。

它和当天主题的关系在于，Agent 生成的软件 artifact 也需要被放回工程生命周期中看。OpenAnt/Code-Augur 问生成或判断能否被验证；SWE-Future 问任务构造是否时间安全；这篇则问 AI 生成 artifact 在长期演化中如何表达变化。它的贡献不是给出强实证结论，而是给 “software evolution in the agent era” 提供了一个新的切入点。

### 6. PYPILINE：供应链检测中的 Agent，不是替代静态分析，而是消费静态分析产物

**论文**：[PYPILINE: Malicious PyPI Package Detection via Suspicious API Knowledge and Agent Workflow](http://arxiv.org/abs/2606.19063v1)  
**作者**：Siyuan Pang, Zhengwei Jiang, Yepeng Yao, Zijing Fan, Haozhe Li, Baoxu Liu  
**分类**：cs.CR  
**发布日期**：2026-06-17

**TL;DR**：PYPILINE 先用静态分析从已知恶意包中构建 suspicious API knowledge base，再让 LLM Agent 基于这份知识库分析未知 PyPI 包并输出可解释恶意性报告。

PyPI 恶意包检测是一个很适合 Agent workflow 的场景。攻击者可以在 setup.py、install hooks、动态导入、网络请求、编码 payload 等地方藏行为；纯规则方法可解释但脆弱，传统 ML 方法可能适应不了新攻击，动态分析又昂贵且覆盖不稳定。PYPILINE 的思路不是让 LLM 直接读包然后判断，而是先通过程序分析构造一个结构化知识层。

离线阶段，系统收集已知恶意包，对其 AST 和 API call graph 做静态分析，提取 suspicious APIs，并构建一个按相关性排序的知识库。论文提到最终形成 300 个 malicious API 相关知识项。在线检测阶段，未知包先被静态分析，得到代码结构、API usage 等信息；然后 Agent 在 suspicious API knowledge base 的引导下做语义分析。输出不是单个 label，而是结构化、可解析的 maliciousness assessment report。Agent 还可以调用预定义工具，例如数据库或邮件服务相关检查，以增强自动化程度。

实验规模不小。论文使用 9,408 个恶意包和 14,005 个良性包；报告 precision 96.7%、recall 99.6%、F1 98.1%，precision 比 baseline 高 5.7 到 24.2 个百分点。论文还把恶意行为分成多种类型，并做了恶意行为的 empirical study。这个结果很漂亮，但需要谨慎看待：恶意包检测最容易受数据切分、家族泄漏、时间泄漏和重复样本影响。如果训练/测试里存在同源变体，F1 会显著乐观；如果评估不是按时间切分，也难以说明系统面对未来攻击的适应性。

PYPILINE 和当天主题的关系在于，它把 Agent 放在“结构化证据消费者”的位置。Agent 的价值是综合静态 API knowledge、代码语义和报告生成，而不是取代 AST/call graph 分析。这个设计比“让 LLM 当恶意包分类器”可靠得多，也更容易审计。它也和 OpenAnt 形成呼应：二者都说明，在真实软件安全任务里，LLM 最适合待在一个 evidence-rich workflow 里，而不是孤立地给出最终判断。

## 中相关论文速读

### Compute-Budgeted Exploitability Evidence Graphs：评估协议比模型更容易泄漏未来

[Compute-Budgeted Exploitability Evidence Graphs for Prospective Vulnerability Triage](http://arxiv.org/abs/2606.19076v1) 不是 coding agent 论文，但它对昨天主题很重要。它研究漏洞 triage：防御者无法一次修所有 CVE，因此需要预测哪些漏洞更可能被利用。问题是，很多 exploit prediction 研究把未来才出现的公开 chatter、PoC、advisory、fix commits 喂给模型，导致指标被未来信息污染。

论文把 advisories、exploit archives、fix commits、hacker-community discourse 组织成 temporal evidence graph，并要求每个 CVE 只能使用固定 decision time 前可见的证据。每个风险分数还配一个 auditable certificate，列出支持信号、时间戳、source layer 和 leakage flags。结果很有警示性：budgeted evidence selection 把 leakage-safe prospective recall@50 从 severity-only baseline 的 0.010 提到 0.026，虽然绝对值仍然低；但 naive random split + unfiltered evidence 会把 prospective recall 虚高 8.5 倍，把 EPSS-high recall 虚高 5.0 倍。这个结论比具体模型更重要：评估边界错了，模型比较就失真。

### ContractGuard：结构化工具 gating 的信任边界在 contract integrity

[The Gate Is Only as Honest as Its Contracts](http://arxiv.org/abs/2606.18550v1) 讨论 tool-augmented LLM agents 的安全问题。Risk-Aware Causal Gating 的思想是把危险工具从 agent 可见 action space 中移除，这样即使 agent 完全听从 prompt injection，也调用不到看不见的工具。但这篇指出，安全保证并没有消失信任假设，只是把它转移到了 tool contracts：preconditions、effects、risk、authorization 这些字段如果被污染，gate 仍会错。

论文把攻击拆得很细，尤其强调 effect forgery 比 risk relabeling 更危险，因为 causal gate 先判断工具是否在路径上；伪造 effects 能把危险工具路由到 causal path。ContractGuard 用 signed provenance、typed contract attestation、runtime effect verification 三层防御。控制 benchmark 中，完整 L3 stack 在 exhaustive adaptive attacker 下把 attack-induced injection success rate 降到 0；没有防御或部分防御在多数目标上仍可达到 1.00。它的局限也明确：symbolic benchmark 中 runtime effect verification 只需调解共享状态，但真实工具可能已有不可逆副作用，例如邮件发送、文件删除或资金转移。

### A Technical Taxonomy of LLM Agent Communication Protocols：多 Agent 系统正在变成协议工程

[A Technical Taxonomy of LLM Agent Communication Protocols](http://arxiv.org/abs/2606.19135v1) 是一篇 taxonomy。它分析 9 个 actively maintained open-source protocols，提出五个维度：counterparty、payload、interaction state、discovery mechanism、schema flexibility。表 1 和表 2 分别给出跨协议模式和逐协议理由。

这篇和 coding agent 的距离比安全审计论文远，但它提醒了一个趋势：当 Agent 从单体脚本变成分布式系统，可靠性问题会下沉到通信层。论文观察到，7/9 协议支持 agent-to-agent communication，所有 sampled agent-to-agent protocols 都结合 hybrid payload 和 session-state persistence；多数协议支持多个 predefined schemas，少数可以 runtime schema negotiation；decentralized discovery 仍然少见。作者认为未来更可能出现 federated layered protocol stack，而不是单一协议统一天下。对昨天主题来说，它补上了“Agent 判断如何流动”的基础设施视角。

### Graph-ESBMC-PLC：验证成功也可能是空 IR 的假象

[Graph-ESBMC-PLC](http://arxiv.org/abs/2606.18941v1) 是偏 PL/formal verification 的论文，但它有一个非常有教育意义的失败模式：原 ESBMC-PLC 支持 textual PLCopen XML ladder diagram，却会把 graphical exports 解析成空 GOTO IR，导致 verification vacuously succeeds。也就是说，工具显示 safe，不是因为程序被证明安全，而是因为根本没有生成要验证的程序。

新工作用 DFS-based graphical LD resolver 修复这一点：从 leftPowerRail 遍历到 coils，提取 rung paths，处理 SET/RESET coil 顺序，再转换到 ESBMC 后端可用的 IR。实验上，3 个 graphical LD programs 都从空 IR 变成 full GOTO IR，并在 k=2 下 70ms 内验证 SAFE；11 个 textual benchmarks 也保持 11/11 零回归。局限是 benchmark 很小，两个 Beremiz 示例暴露了 current resolver 对 function blocks 动态保持不足的问题。它和当天主题的关系是反向的：验证本身也需要被验证。只看 pass/fail，不检查 verifier 是否覆盖目标 artifact，是很危险的。

### REVES：把“修正过程”变成训练信号

[REVES](http://arxiv.org/abs/2606.18910v1) 更偏通用 LLM training，但因为使用 LiveCodeBench 和 public test feedback，和执行反馈有边缘关系。它认为当前 post-training 多优化 single-shot objective，而 test-time scaling 依赖 sequential revision，两者不匹配。REVES 把成功恢复轨迹中的 near-miss intermediate answers 转成 decoupled revision prompts 和 verification prompts，让模型专门学习“如何改错”和“如何识别错”。

摘要报告在 LiveCodeBench 上，使用公开测试反馈，相比 RL baseline 提升 +6.5 points。它和昨天主题的联系在于：错误不只是失败样本，也可以是可学习的中间对象。不过这篇主要是训练方法，不是仓库级软件工程系统；如果只关心真实 repo agent，保留“revision/verification prompts 从恢复轨迹中抽取”这个概念即可。

## 可留意/可跳过

- [Leadership as Coordination Control](http://arxiv.org/abs/2606.19111v1)：多 Agent 团队里的 process-level coordination control。可保留的判断是：协调控制不是越多越好，论文显示收益只在特定 recovery regime 下出现。
- [EARS](http://arxiv.org/abs/2606.18668v1)：把 sub-agent abstention 设计成 inter-agent communication protocol。关键词是“拒答不是沉默，而是可操作 failure state”。
- [RouteJudge](http://arxiv.org/abs/2606.18774v1)：LLM routing 的偏好评估平台。与软件工程主线较远，但 cost-aware routing 可能影响未来多模型 coding agent。
- [Quantifying and Auditing LLM Evaluation via Positive-Unlabeled Learning](http://arxiv.org/abs/2606.19057v1)：LLM-as-judge 偏差审计。保留关键词：选择性人工监督下的 judge calibration。

## 横向比较

| 论文 | 问题定义 | 证据形式 | 工程可迁移性 | 主要可信度风险 |
|---|---|---|---|---|
| OpenAnt | 仓库级漏洞发现如何降低噪声并验证 exploitability | reachability、对抗验证、动态 exploit reproduction | 很高，pipeline 思路清晰 | 真实项目缺少完整 ground truth，动态验证覆盖有限 |
| Code-Augur | Agent 的安全假设如何显性化并被反驳 | in-source assertions、guided fuzzing | 很高，specification-first 很通用 | assertion 质量决定上限，fuzzer 覆盖不确定 |
| SWE-Future | SWE benchmark 如何避免历史重放污染 | temporal boundary、forecast validation、hidden artifacts | 高，任务构造范式重要 | forecast relevance 中等，合成任务真实性需验证 |
| CAPRA | LLM 架构反馈如何 grounding 到原始 artifact | fuzzy evidence anchoring、ConsistencyManager | 中高，适合反馈/审计类系统 | 样本只有 10 份且高分报告偏多 |
| VbR | AI 生成软件的 variability 去哪里 | spec、variant config、regeneration pipeline | 中，概念价值大于系统成熟度 | 小样本、小 demo，缺少规模验证 |
| PYPILINE | 恶意包检测如何结合静态知识和 Agent 分析 | AST、API call graph、suspicious API KB、结构化报告 | 高，安全和供应链场景直接 | 数据切分和家族/时间泄漏风险 |

## 我的判断

| 维度 | 判断 |
|---|---|
| 创新性 | 8/10。OpenAnt、Code-Augur、SWE-Future 分别在验证闭环、可反驳 specification、时间安全任务构造上提出了清晰问题。 |
| 实用价值 | 8.5/10。昨天这批论文很多都能落到真实工程 workflow，而不是停在 prompt 或 benchmark 分数。 |
| 严谨性 | 7/10。强相关论文普遍意识到污染、grounding、验证覆盖问题，但不少评估仍受样本规模或 ground truth 不完整限制。 |
| 与当天主题一致性 | 9/10。多数论文都围绕“Agent 判断如何被外部证据约束”展开，主题集中度很高。 |

最值得记住的一句话是：**可靠 Agent 的关键能力，不是把判断说得更像专家，而是把判断变成能被程序、时间边界、证据链和执行环境检验的对象。**
