---
title: "从能跑到可信：8 月 5 日 arXiv 同时重写 Agent 验证与 Post-Training 信用分配"
date: "2026-08-06"
description: "8 月 5 日的新论文把 coding agent 的真实环境、失败恢复与跨变更审计，以及 post-training 的局部信用、奖励结构和持续学习风险推到同一张可靠性清单上。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Agent安全", "Post-Training", "RLHF", "强化学习", "GRPO", "Reward Model", "程序修复"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-zinc-950 via-cyan-950 to-emerald-900"
---

2026 年 8 月 5 日这一批论文异常密集，真正值得读的不是数量，而是研究问题明显从“模型能不能完成任务”转向“完成过程是否可解释、可恢复、可复现”。coding-agent 方向里，安全策略、跨 PR 历史、图形界面、工作流持久化与专业科学环境都进入了执行闭环；post-training 方向则集中追问，奖励究竟应该落在答案、token、turn、memory operation，还是扩散过程的中间 latent 上。两条线各自成立，不需要强行求交；它们碰巧共同指出，**粗粒度终局成功正在成为可靠性研究的主要盲区**。这批论文也有明显的可信度分层：可执行 benchmark、反事实对照和多 seed 结果值得优先读，只有漂亮均值却缺少边界条件的工作则应保留距离。

本轮逐项核对 arXiv 官方 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG 新论文页，并补充 cs.IR、cs.CV、cs.CR、cs.OS；九个页面均显示 **Wednesday, 5 August 2026**。合并 New submissions 与 Cross submissions 后得到 616 篇唯一条目，最终纳入 **86 篇实质相关论文**：coding-agent / software-change 主线 46 篇，post-training 主线 41 篇，其中 1 篇同时属于两条线。19 篇强相关论文均从 `https://arxiv.org/pdf/<id>` 下载，文件头与大小校验通过并成功抽取全文；其余条目基于 arXiv 官方摘要与元数据筛选。下文发布日期均指进入 2026-08-05 官方新论文列表的日期。

## 今日脉络

第一条脉络是 **agent 可靠性终于把环境约束当作实验变量，而不是杂音**。Boundary-Bench 直接测只读文件系统、受限网络和非 root 执行造成的成功率与成本损失；MDArena 把 coding agent 放进容器化分子动力学工作流；Resume Contract 则证明五个流行 workflow framework 对 checkpoint、interrupt 和 resume 没有一致语义。现实部署的“难”不再被抽象成更多 token，而是权限、持久状态、外部副作用和不可重复执行。

第二条脉络是 **验证对象从单个补丁扩展到长时间状态演化**。PRWeaver 研究恶意修改如何借多轮 PR 和合理目的隐藏，BulkPR-Bench 研究互相作用的 PR 队列，FailFast-RestartSmart 判断何时终止失败轨迹并保留可复用 diff，ReBug 则把自然语言 bug report 编译成真实浏览器可执行程序。这些工作共同说明，repository repair 的正确性不是某个 diff 的静态属性，而是证据、顺序、环境和历史共同决定的结果。

第三条脉络是 **post-training 的核心竞争转向信用分配的结构**。RuPI 用 rubric 作为 privileged information 直接提供 dense token signal；OM-GRPO 有意遮掉答案 token 的梯度，防止 label-free RLVR 偷看自己生成的共识；ADRS 和 TurnSight 分别把信号落到 return-relevant token 与 tool-interaction turn。今天最强的一批方法不是发明更复杂的奖励名称，而是明确回答“谁得到信用、信用从哪里来、什么情况下应被抑制”。

第四条脉络是 **持续 post-training 开始显式管理风险与遗忘**。RAPO 不再相信 RFT 天然抗遗忘，而按 rollout 可靠性与局部敏感度缩放更新，并调整 batch 风险分布；SFT Conflicts, RL Coexists 则给出一个更激进的判断：SFT 的多任务干扰受梯度范数控制，而 on-policy RL 的干扰更多受方差约束，因此更新更稀疏、近似正交。这一判断很有启发性，但也最需要跨模型复现。

第五条脉络是 **奖励模型正在从终点裁判变成过程传感器**。VerMem 的 local/global verifier 只在训练期检查 memory transition 和终态一致性；Latent Reward Registers 从扩散中间噪声 latent 预测最终偏好，并把 dense reward 用于训练和采样。它们都在缩短“行为发生”与“反馈到达”之间的距离，同时也引入新的 verifier 偏差与复现成本。

## 强相关论文深读

### 1. Self-Evolving Skills：进化不是稳步上升，而是稀疏的验证集搜索

**论文信息**：*Rethinking Self-Evolving Agent Skills: Feedback Dynamics over Multiple Rounds*；Yuxuan Liu、Zhaochen Su、Yuhao Zhang 等；[arXiv:2608.02636](https://arxiv.org/abs/2608.02636)；cs.SE / cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：所谓 skill self-evolution 更接近在失败轨迹驱动下进行的稀疏候选搜索，只有少量修改真正刷新验证集最优，而且验证、测试、鲁棒性和迁移可能偏好不同版本。

**为什么值得推荐**：自进化 agent 常用“轮数越多、经验越多、能力越强”的叙事，但这篇论文把 feedback composition 单独控制起来，问成功轨迹、失败轨迹和混合轨迹分别贡献什么。它最重要的新判断是：改写频繁不等于能力持续增长，selection rule 比 update frequency 更决定结果。

**方法怎么工作**：Figure 1 固定 executor、optimizer、revision procedure、validation rule 与十轮预算，仅改变 optimizer 能看到 Normal、Fail-only 或 Success-only 哪类轨迹；每轮生成 skill candidate，用验证集选择 byte-distinct best；最终再分别测 released test、鲁棒性、迁移，并用 parallel sampling 与 sequential refinement 排除“只是多花 test-time compute”的解释。Figure 2 进一步把每次真正刷新验证最优的事件画出来。

**关键实验与证据**：五个 benchmark、三个主模型构成 14 个可支持设置与 42 次匹配反馈实验。388 个候选中只有 55 个成为 byte-distinct validation best；14 个设置里 11 个选出了进化 skill，其中 9 个提升 released-test。所有 11 个被选版本都来自包含失败轨迹的条件。GPT-5.5 的 oracle parallel sampling 在 SearchQA 只落后进化 skill 0.43 分，却在 SpreadsheetBench 落后 30.96 分，说明 skill 并非普通采样预算的替代品。

**局限和可信度**：结果高度依赖 benchmark、模型和 validation split，且验证最优与鲁棒/迁移最优并不总一致；十轮预算也未证明更长时间下的动态。优点是变量控制干净、候选身份可追踪、负结果充分。它没有证明自进化普遍有效，反而可信地限定为“失败反馈支持、验证过滤的稀疏搜索”。

**与当天主题的关系**：它为今天所有 continual skill / recursive improvement 工作设定了更严格的基线：先证明进步不是上下文适应、随机搜索或验证集过拟合。

### 2. MDArena：真实科学工作流把 48% 变成更有意义的上限

**论文信息**：*MDArena: Evaluating Coding Agents on Realistic Molecular Dynamics Workflows*；Nithishwer Mouroug Anand、Wei-Tse Hsu、Kyle Vaccaro 等；[arXiv:2608.02642](https://arxiv.org/abs/2608.02642)；physics.chem-ph / cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：MDArena 用 50 个来自活跃分子模拟项目的容器化任务证明，coding agent 常能做出有价值的部分进展，却仍会在可复现实验所需的细节上失败。

**为什么值得推荐**：科学 coding agent 的风险不在于完全不会调用 GROMACS 或 MDAnalysis，而在于脚本能运行、结果看似合理，却使用了错误体系、采样协议或参数。MDArena 把“运行成功”和“科学流程正确”拆开，是比通用 shell benchmark 更接近真实研究自动化的证据。

**方法怎么工作**：Figure 1 展示数据构成：作者从活跃研究项目筛出长依赖、需领域判断且不能仅靠文本回答的任务，覆盖 29 个分子系统、22 个软件包和 14 类 protocol；每题打包成 Harbor container，gold solution 可由 Oracle agent 执行；评估同时包含 binary Strict-Pass@1、correctness reward 与由 243 条人工标准组成的 process reward，并记录成本与失败类型。

**关键实验与证据**：六种 model/harness 配置中，Codex GPT-5.5 extra-high 最好，为 24/50（48%）Strict-Pass@1；medium effort 为 21/50，OpenCode Gemini Flash 3.5 为 20/50。所有系统的平均 correctness/process reward 都显著高于严格通过率，说明 partial progress 普遍存在。膜蛋白体系准备和 alchemical free-energy setup 对几乎所有配置仍接近零成功。

**局限和可信度**：50 题来自一个工作群体的项目分布，每个配置每题仅跑一次，无法估计 sampling variance；process criteria 由作者定义，可能偏向本实验室实践。容器、reference solution、细分奖励和任务来源增强了复现性，但“自主 MD 研究者”仍远未得到验证。

**与当天主题的关系**：它展示了真实仓库、复杂依赖和领域 oracle 如何共同改变 coding-agent 质量判断。

### 3. CUADebug：根因定位只有在能提高重执行成功率时才有价值

**论文信息**：*CUADebug: Diagnosing and Repairing Computer-Use Agent Failures*；Weijia Zhang、Kunlun Zhu、Zeyi Liu 等；[arXiv:2608.02643](https://arxiv.org/abs/2608.02643)；cs.SE / cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：CUADebug 用 before/after screenshot、action trace 和主动局部检查定位 computer-use agent 的首个根因步骤，并证明结构化 RCA 能把后续重执行成功率翻倍。

**为什么值得推荐**：GUI agent 的错误往往在很早一步发生，最终失败画面却只显示连锁后果。纯文本 self-reflection 难以区分视觉感知、坐标 grounding、控制、任务推理与外部系统异常。本文把 debugging 变成多模态 causal localization，并用干预后的完成率检验诊断是否真正可操作。

**方法怎么工作**：先对 204 条 OSWorld 失败轨迹人工标出 earliest causal step 与层级错误类型；Figure 3 中，CUADebugger 不一次吞完整轨迹，而是主动检查可疑步骤的前后截图、动作和状态变化；它输出 root step、error subtype、grounded evidence 与 corrective strategy；最后把 RCA 注入单次或连续 re-execution，并和 history-only、self-debug、machine RCA、human oracle 对照。

**关键实验与证据**：204 条轨迹里，task reasoning/control 占 110，perception 36，grounding/interaction 25，external/system 13，另有 20 条不可行任务。Gemini 2.5 Pro 的 subtype+step 联合准确率从 prompt baseline 的 11.2% 升到 19.6%。单次重执行中，history-only 完成率 13.89%，machine RCA 为 28.47%，CUADebugger 为 29.90%；连续重执行从 12.2% 升到 25.86%，接近 human oracle 的 29.21%。

**局限和可信度**：数据只来自 OSWorld 与有限 agent source，联合诊断准确率本身仍低；更高完成率也可能部分来自额外 token 和重试预算。论文提供同预算对照、人工 taxonomy 和 intervention-based validation，可信度高于只报错误分类 F1 的工作，但尚未覆盖移动端、远程桌面与动态网页版本漂移。尤其应注意，human oracle 也只有 29.21%，说明剩余瓶颈不只是诊断，而可能包括模型无法执行正确策略、环境不可控和任务本身不可行；这限制了把 RCA accuracy 直接当作系统成功上限。

**与当天主题的关系**：这是“错误解释必须能改变后续执行”的典型，连接了 agent audit 与 repair loop。

### 4. Boundary-Bench：权限收紧会同时改写成功率、成本与失败形态

**论文信息**：*Permission Denied: Policy-Graded Evaluation of Coding Agents in Hardened Environments*；Dotan Davidovich、Yair Amar、Hai Rozencwajg、Or Hiltch；[arXiv:2608.02670](https://arxiv.org/abs/2608.02670)；cs.CR / cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：在企业常见的受限网络、只读文件系统、非 root 和 scoped credential 条件下，coding agent 的成功损失和成本膨胀并不一致，模型选择因此必须依赖部署 policy。

**为什么值得推荐**：主流 benchmark 默认 agent 拥有几乎无限权限，真实企业环境却把网络、写路径和凭据限制当成基本边界。本文不只问 agent 是否服从政策，而是测政策给任务成功和 token 成本带来的“hardening tax”，同时先审计任务在最严格策略下是否仍可解。

**方法怎么工作**：Boundary-Bench 为 Terminal-Bench 2.1 定义嵌套安全等级；pre-flight probe 确认每项限制 fail closed，grader 与 setup 留在 sandbox 外；对 12 个 model/harness bundle 在 89 个已审计任务上重复运行，联合报告 success、平均成本、cost multiplier、timeout/wrong-solution 分解与 blocked-action exposure；模型与 harness 交叉消融用于区分两者贡献。

**关键实验与证据**：最严格 policy 下，成功率损失最高 18.3 个百分点，成本膨胀最高 167.3%。保持成功最好的模型同时可能损失最多效率，Pareto 排名会随政策改变。被阻断后，多数 agent 并不会快速停止，而是继续探索直至 timeout 或给出 wrong solution；失败构成在模型间也显著不同。

**局限和可信度**：89 题仍是 benchmark task，不代表企业依赖图、内部 registry 与长时间 CI；bundle 将模型、harness、provider 行为部分耦合，价格也会变化。任务可解性 replay 和 model/harness ablation 降低了把 policy 不可行误算成模型失败的风险，这是论文最可信的设计点。

**与当天主题的关系**：它把“复杂环境”从叙事词变成可操作、可分级、可计价的 coding-agent 变量。

### 5. Modular Code Review：把风险概率和决策成本写进同一 prompt 会污染估计

**论文信息**：*When Policies Change Probabilities: Modular Decision-Making for LLM Code Review*；Rasvik Kudum、Max Corbett、Hitansh Paliwal 等；[arXiv:2608.02677](https://arxiv.org/abs/2608.02677)；cs.SE / cs.AI / cs.MA；发布于 2026-08-05。

**一句话 TL;DR**：同一 patch 与证据不变时，只修改 false-accept 成本和阈值，LLM reviewer 报出的失败概率就移动 13.6–16.9 个百分点；风险估计和批准动作应拆开。

**为什么值得推荐**：概率本应描述证据，成本只应决定行动。如果 reviewer 被告知“错放行代价高”，然后把风险概率也上调，这个数字就失去跨团队、跨政策复用的含义。论文用可执行 patch outcome 检验了这个长期被忽略的 decision-theory 错位。

**方法怎么工作**：数据为 360 个 repository issue，每题有一份通过 archived harness 的 patch 和一份失败 patch，共 720 个候选、15,792 次响应；对四个 reviewer 做 matched prompt intervention，保持 patch 与 monitor score 固定，只改变成本/阈值 block；再构造模块化 pipeline：先在无政策信息下估风险，与独立 monitor 分数组合，最后在代码中应用成本规则。

**关键实验与证据**：联合 policy block 使概率平均漂移 13.6–16.9 点。四个 reviewer 在 10:1 cost prompt 下的动作都比 reject-all 更差；把同一高成本规则应用到 equal-cost prompt 得到的概率后，四者 loss 均下降。模块化 pipeline 在等成本下每题 mean loss 再降 0.073，同时接受 58%–68% patch；10:1 下则接受 0，和 reject-all 相同。

**局限和可信度**：成本文本和阈值一起变化，尚未通过 factorial design 分离具体诱因；每个 issue 固定一好一坏 patch，不是生产 PR 的自然 base rate；reviewer 无工具、只有静态上下文。结论应限定为“联合提示会污染估计”，不是所有 LLM 概率都不能校准。另一个重要细节是，高成本下模块化 pipeline 通过拒绝全部 patch 避免损失，却没有证明能在真实低失败率流量中维持有用吞吐，因此论文更擅长诊断接口耦合，而非给出已经最优的 code-review policy。

**与当天主题的关系**：它要求 agent audit 把 belief、outside evidence 与 action policy 分别测量，避免单一 judge prompt 掩盖错误来源。

### 6. PRWeaver：长历史不是天然防线，合理叙事反而会掩护恶意 diff

**论文信息**：*PRWeaver: Evaluating LLM-Based Code Auditors against Long-Horizon Malicious Pull Requests*；Yuekun Wang、Mingfei Cheng、Xiaofei Xie；[arXiv:2608.02693](https://arxiv.org/abs/2608.02693)；cs.SE / cs.CR；发布于 2026-08-05。

**一句话 TL;DR**：将恶意行为分散到长期 PR 演化中并不总靠 commit 边界逃逸，真正有效的是把攻击与可信的 benign carrier 混入 reviewer 的活跃上下文。

**为什么值得推荐**：repository history 经常被当成 code-audit agent 的额外证据，却很少有人系统研究上下文增加后检测是否更好。PRWeaver 的新意是让恶意行为具备执行 oracle，再用 matched rendering 区分拆分、交错、融合和 whole-window review 的影响。

**方法怎么工作**：Figure 2 先从十个真实仓库的安全问题合成完整攻击和可执行 PoC，再拆成 2–8 个攻击 PR，与 benign PR 交错或语义融合；build、host tests、PoC 和 leave-one-out 检查确保每条链真实有效；208 个攻击各产生四种匹配 review rendering，共 832 个实例；三类 PR-auditing agent、六个系统在相同上下文剂量下评估。

**关键实验与证据**：单纯分解攻击对检测率影响最多 5 点，说明“多 commit”本身不是主要机制；N=16 的 per-PR interleaving 降低检测 5–13 点，coherent carrier fusion 降 10–18 点。N=24 的 whole-window review 检测率仅 16%–22%，显著低于 per-PR review 的 50%–60%。更多历史若挤压注意力，反而可能更危险。

**局限和可信度**：攻击由 benchmark synthesis 构造，十个仓库与选定风险类型不能覆盖真实供应链；auditor 与模型版本有限，review rendering 也未包含完整组织流程。执行 PoC、matched conditions 和剂量曲线使机制判断较可信，但生产部署还需加入开发者互动、CI 信号与动态权限。论文也没有证明攻击者能在真实维护周期中持续提交这些 carrier 而不被人类流程阻断；因此它测的是 auditor 在给定历史中的辨识能力，不是端到端供应链攻击成功率。

**与当天主题的关系**：它把长依赖链和 history reconstruction 从“更多上下文”改写成必须管理的审计资源。

### 7. FailFast-RestartSmart：终止失败轨迹时，别把已经做对的 diff 一起丢掉

**论文信息**：*Fail-Fast, Restart-Smart: Early Failure Prediction and Restart for SWE Agentic Tasks*；Chenyu Wang、Yunbo Lyu、Junda He 等；[arXiv:2608.03222](https://arxiv.org/abs/2608.03222)；cs.SE / cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：一个 0.6B prefix monitor 可以提前识别高概率失败的 SWE agent 轨迹；重启时把旧 diff 作为可选 overlay，既省 token 又比冷启动更容易成功。

**为什么值得推荐**：失败的 repository-level rollout 往往比成功轨迹更长，继续投入 token 只会重复探索；但粗暴 early stop 又可能杀掉慢热成功，并丢失已经正确的局部修改。本文把 cost control 与 patch recovery 放进同一个 sequential decision，问题定义很贴近实际 agent orchestration。

**方法怎么工作**：FailFast 用 issue、可观察 command/response 和 intermediate patch 训练 Qwen3-0.6B monitor，目标同时含终局 fail label 与通过 replay 得到的 dense fail-to-pass progress；在线以 target FPR 校准 alarm；RestartSmart 随后启动相同 policy 的全新 rollout，不继承长 prompt history，只把中断 diff 放进独立 overlay，允许新 agent 检查、采用或丢弃。

**关键实验与证据**：在 SWE-bench Verified 上，monitor 只用 Qwen3.6-27B 轨迹训练，却能迁移到另外三种 policy，包括闭源模型。在 5% false-positive 目标下节省 14.6%–20.4% execution token；Qwen3.6-27B 的 20.4% 高于 AgentStop 的 12.5%。25% FPR 时，RestartSmart 把 resolution 从 66.6% 提到 71.8%，冷重启仅 66.8%；FailFast 此时捕获 68.3% 失败并回收 49.0% token。

**局限和可信度**：25% FPR 对实际生产可能过高，额外 retry 的 wall-clock、API cost 和并发资源需单独计价；训练轨迹仍来自固定 benchmark 与 policy family。跨 policy transfer、FPR-constrained 报告和 cold-restart 对照使“保留 diff 有用”较可信，但尚未证明在脏工作区、依赖安装或不可逆外部副作用下安全。monitor 只看可观察 prefix 而不依赖 policy hidden state 是部署优点，也意味着它可能错过仅存在于内部计划中的即将恢复信号；未来应联合校准节省 token、最终 resolution 与错误终止的业务代价。

**与当天主题的关系**：它把 execution budget、失败预测与 patch state recovery 合成了一个可审计 controller。

### 8. MT-Web2Code：局部改对与不破坏周围内容是两种能力

**论文信息**：*MT-Web2Code: Benchmarking Coding Agents on Multi-Turn Regional Reconstruction and Localized Modification*；Qiming Li、Shujie Hu、Haohan Liu 等；[arXiv:2608.03474](https://arxiv.org/abs/2608.03474)；cs.CV；发布于 2026-08-05。

**一句话 TL;DR**：MT-Web2Code 把网页生成改造成多轮区域修复任务，分别衡量目标区域 fidelity 与非目标内容 preservation，暴露错误累积和视觉—代码错位。

**为什么值得推荐**：真实前端开发很少从空白截图一次生成整页，而是在已有 codebase 中连续修局部布局、字体和组件。单轮 screenshot-to-code 分数看不到多轮 error snowballing，也无法区分“改错地方”和“改对目标但破坏全局”。这篇 benchmark 的任务形式更接近持续 UI software change。

**方法怎么工作**：从 16 个领域的 golden pages 出发，Reverse-Corruption Trajectory Engine 按依赖顺序注入 macro region 与 micro style defect，生成 102 个确定性多轮任务；Figure 3 展示从 corruption、agent edit 到 render comparison 的闭环；macro 侧用五维 VLM rubric，micro 侧在固定 bounding box 内做 pixel-grounded alignment；总分以 0.8×in-box + 0.2×out-box 同时奖励修复与保持。

**关键实验与证据**：13 个 frontier coding agent、每项三次运行。Macro 最好是 Gemini-3.5-Flash 的 65.5，Kimi-K2.6 为 63.7；Micro 最好却是 Doubao-Seed-2.0-Pro 的 83.5，说明两种能力排序不同。多数强模型 out-box preservation 超过 0.95，但 in-box repair 差异很大。给区域加 caption 让 Gemini 提升 6.3 点，却使 Kimi 和 Claude 分别下降 4.5、4.4 点。

**局限和可信度**：macro rubric 依赖 VLM judge，网页只有 102 个且主要测渲染结果，不覆盖 accessibility、逻辑状态与长期维护；作者承诺代码和数据“will soon be released”，当前复现性仍未完全兑现。micro 指标确定性强，macro 结论应在人工评审或多 judge 下再确认。Reverse corruption 能提供便宜、确定的修复轨迹，却可能比自然需求变更更局部、更整洁；模型在这些任务上的 error snowballing 因而很有诊断价值，但不能直接预测真实团队中的多轮需求澄清能力。

**与当天主题的关系**：它把 UI 运行行为验证推进到“连续局部修改 + 非目标区域保护”，比单页视觉分数更接近真实变更。

### 9. ReBug：bug report 先补齐上下文，才能变成浏览器可执行程序

**论文信息**：*From Bug Reports to Browser-Executable Procedures: An LLM-Driven Agent for Web GUI Bug Reproduction*；Cunming Zhang、Yu Pei、Michail Papadakis；[arXiv:2608.03598](https://arxiv.org/abs/2608.03598)；cs.SE；发布于 2026-08-05。

**一句话 TL;DR**：ReBug 从自然语言报告重建缺失前置条件，生成高层计划，再用真实浏览器、结构化页面状态和终态 oracle 执行并验证 GUI bug reproduction。

**为什么值得推荐**：web GUI bug reproduction 不是普通 web-agent task completion：报告经常省略登录、输入文件、依赖和导航前置条件，成功标准也隐藏在“应该出现/不应该出现”的状态里。ReBug 把 context completion、stateful execution 和 outcome validation 明确分层，覆盖了维护工作中很实际的缺口。

**方法怎么工作**：准备阶段的 Context Builder 从 issue 与可用 artifact 补齐资源，Plan Generator 生成步骤；执行阶段在真实 browser 中用 DOM、URL、tab、action result 与压缩 history 更新状态，失败时允许有限恢复；最终 evaluator 对照人工标注的 expected / unexpected description，只有完成计划、满足 expected 且不满足 unexpected 才计 reproduction success。另对 40 个成功案例恢复 buggy version 做历史 replay。

**关键实验与证据**：从 Ghost、Metabase、NocoDB、n8n 约 4,000 个候选中，经双人筛选得到 667 个可浏览器执行报告。ReBug 平均 RSR 49.96%、task completion 74.96%、action execution success 86.54%，均优于 script-generation 与 browser-agent baseline。历史 replay 进一步表明，当前部署上的成功 procedure 经常能在恢复的旧版本上触发原始 bug-present behavior。

**局限和可信度**：主评测不是为每条 issue 恢复历史 buggy snapshot，而是在当前受控部署上验证 procedure 与预期终态，因此 RSR 不是“原 bug 被重新观察”的直接比例；历史 replay 仅 40 条。论文坦白排除了 version-locked、专有基础设施和非 GUI failure，结论适用于可浏览器观察的 defect 子集。RSR 与 74.96% task completion 的差距也提示，agent 经常能走完大部分计划却无法建立严格终态证据；这正是 reproduction system 不能只报 action success 的原因。

**与当天主题的关系**：它把 bug reproduction 从文本理解问题提升为可执行、可重放、带终态 oracle 的软件维护任务。

### 10. Resume Contract：五个 agent workflow framework 对“继续执行”给出五种答案

**论文信息**：*Resume Means Resume: A Machine-Checked Conformance Contract for Checkpoint, Interrupt, and Resume Semantics in Workflow Persistence Layers*；Sajjad Khan；[arXiv:2608.03836](https://arxiv.org/abs/2608.03836)；cs.LG / cs.DC / cs.LO / cs.SE；发布于 2026-08-05。

**一句话 TL;DR**：论文用 TLA+ 合同和无 LLM 的确定性 harness 证明，流行 agent workflow framework 的 resume 语义彼此不一致，且会静默忽略输入、重复外部副作用或接受非法状态。

**为什么值得推荐**：长任务 agent 必须 checkpoint，但“crash 后继续”涉及 exactly-once effect、fork、consume-once 和 recovery determinism，不是保存一段 JSON 就能解决。本文最有价值之处是把 workflow persistence 从方便性 API 提升成并发与容错协议，并把文档承诺和真实执行逐格对照。

**方法怎么工作**：RESUME CONTRACT 定义 prefix continuation、effect exactly-once、fork determinism、checkpoint validity、consume-once、recovery determinism 六项性质，以及 fork intent 与 liveness；TLA+ reference semantics 在扩大边界后穷举 740 万状态，39-cell fault matrix 检验性质独立性；确定性 harness 针对五个 pinned framework 注入 interrupt、SIGKILL、并发 resume 和 schema-invalid state；REMIT 用共享存储 claim 和 Verus 验证的 recovery core 修复部分单元格。

**关键实验与证据**：LangGraph 1.2.9 会持久化第二个 resume value 却不读取，静默保存 schema-invalid state，并在真实 SIGKILL 后重做已记录工作；CrewAI 1.15.2 重执行已完成的 effect-bearing method；pydantic-graph 1.x 不能从 mid-node crash 恢复。并发下 k 个 process resume 同一 parked interrupt 会触发 k 次副作用，40 个单元格中 36 个达到 1.0 饱和；没有两个 framework 共享相同 conformance profile。

**局限和可信度**：研究聚焦 persistence layer 的小而关键语义，没有评估整个 agent 任务成功率；framework 版本快速变化，部分修复只覆盖 read path 与 reference sequencer。优势是 harness 无 LLM 随机性、版本固定、模型检查与真实进程故障相互印证。它不是说这些框架不可用，而是说使用者必须知道自己获得哪种 delivery semantics。

**与当天主题的关系**：这是当天最贴近基础设施正确性的论文：可靠 agent 的前提是恢复层不会把一次动作悄悄变成零次或多次。

### 11. RuPI：开放生成里，rubric 比参考答案提供更好的 privileged information

**论文信息**：*Rubrics as Privileged Information for Open-Ended Generation*；Deepika Bablani、Ajay Gupta、Wanming Chen；[arXiv:2608.02948](https://arxiv.org/abs/2608.02948)；cs.LG / cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：对有多个有效答案的开放任务，与其把单个 reference completion 当蒸馏目标，不如把 rubric 条件化 teacher 的 token distribution 作为 dense privileged signal。

**为什么值得推荐**：RL 把 rubric 压成一个 scalar reward，会丢掉每项标准如何约束生成；reference distillation 又会把模型拉向某个特定写法。RuPI 的关键判断是，rubric 描述的是一组好答案共享的 preference structure，因此比“唯一范文”更适合开放生成的 on-policy self-distillation。

**方法怎么工作**：student 在只有 query 的条件下生成 on-policy response；同一模型的 frozen teacher 额外看到 rubric，并对 student 已生成 token 重新评分；训练用 clipped reverse-KL 把 teacher 相对 student 的偏好直接变成 token-level supervision。Figure 1 明确显示 teacher/student 的 context asymmetry；作者用同 judge、同 rollout budget 和匹配 KL 方向比较 rubric-as-PI、reference-as-PI 与 rubric-as-reward GRPO。

**关键实验与证据**：在 HealthBench、Qwen 与 Llama 家族上，RuPI 比 rubric-as-reward RL 最高多 0.10 absolute score；匹配 recipe 与 KL 后，比 reference-PI 高 0.034–0.079。转到 RubricHub Science 训练、ResearchQA 测试时，RuPI 为 66.6%，reference-PI 64.2%，rubric-reward RL 57.6%。rubric PI 的 per-token KL 也比 reference PI 高约 1.7 倍，说明它确实提供更强而非更稀的训练信号。

**局限和可信度**：rubric 质量与 teacher/judge 同样可能偏置，KL 更大也可能意味着过强更新而非更好监督；HealthBench 的医学开放回答仍依赖自动 rubric grading。匹配采样与 KL 的消融、跨模型和跨语料迁移增强可信度，但还需人类偏好与 reward-hacking 测试。更关键的是，teacher 和 student 来自同一模型家族，RuPI 证明了额外条件信息可被内化，却没有证明弱 student 能可靠吸收远强、异构 teacher 的 rubric reasoning；这一点决定它能否扩展成通用蒸馏配方。

**与当天主题的关系**：它是“不要只换优化器，先改变反馈所表达的信息结构”的代表。

### 12. LoCA：用一次反向校准换取之后的 forward-only tuning

**论文信息**：*LoCA: Forward-Only LLM Tuning after One-Shot Calibration with Local Credit Assignment*；Linhan Xia、Rui Liu、Zhaofeng Zhang 等；[arXiv:2608.03020](https://arxiv.org/abs/2608.03020)；cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：LoCA 只做一次 probe backward，把最终 prediction error 映射为各 transformer block 的局部修正，之后用 forward activation 和闭式 ridge regression 拟合低秩 adapter。

**为什么值得推荐**：PEFT 只减少可训练参数，并未消除每一步穿过 frozen backbone 的反向链、activation 存储和 backward-capable hardware。LoCA 针对的是 post-training 的系统门槛：小分布迁移能否把全局信用分配一次性摊销，从而在 CPU 或受限设备上继续适配。

**方法怎么工作**：第一阶段用一个校准 batch 做完整 backward，在每层拟合从 final error 到 local hidden correction 的低秩 map；第二阶段重放 forward activation，把这些 map 产生的局部目标转为 blockwise regression；第三阶段对每层 adapter 做闭式 ridge solve，无需再通过 backbone 反传。候选 rank 与正则集合按 scale normalization 共享到不同 Qwen 尺寸，并用 SmolLM2 检查迁移。

**关键实验与证据**：五个 discriminative benchmark、Qwen2.5 0.5B–14B 的 25 个 task-scale 对比中，LoCA 有 16 个 evaluation cross-entropy 低于对应 LoRA。包含校准在内，GPU peak memory 低 26%–29%；校准后 CPU steady-state memory 低 36%–52%，每次 pass 快 43%–48%。

**局限和可信度**：方法明确面向 small-shift adaptation 与分类式任务，生成、长上下文和大分布迁移未验证；一次 calibration 学到的局部线性 map 可能随数据分布漂移失效。作者报告 full-run 而非只报 steady-state 成本，这让效率结论较可信，但不能据此替代通用 LoRA。16/25 个 cross-entropy 胜出也意味着仍有 9 个设置不占优，论文的正确定位是受限设备上的条件性替代方案，而不是在质量和成本上无条件支配 backpropagation。

**与当天主题的关系**：LoCA 把 post-training 效率问题重新表述为“全局误差需要被传播多少次”。

更实际地说，它把训练能力从“必须持续拥有反向图”改成“只需在校准时短暂拥有”，这一区别对边缘设备和分时硬件很重要。

### 13. OM-GRPO：label-free RLVR 不能一边投票，一边直接强化答案 token

**论文信息**：*Don't Peek at the Answer: Outcome-Masked Group Relative Policy Optimization for Label-Free RLVR*；Yongshi Ye、Liang Zhang、Yidong Chen、Xiaodong Shi、Biao Fu；[arXiv:2608.03119](https://arxiv.org/abs/2608.03119)；cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：OM-GRPO 保留由答案共识估计的 reward，却遮掉答案 span 的 policy gradient，把更新压力推回推理过程，减少 label-free RLVR 的自我强化坍缩。

**为什么值得推荐**：多数投票看似摆脱 gold label，实际上同一批 answer token 既定义 pseudo-label，又被该 reward 直接强化；模型可能只学会更快重复当前多数答案，而非改善 reasoning。本文准确指出了 reward estimation 与 optimization target 的信息泄漏。

**方法怎么工作**：从 rollout group 计算 soft answer consensus 作为 outcome reward；训练时定位最终答案 span，对这些 token 的 GRPO gradient 做 mask，只更新 reasoning token；Contrast-Augmented Reward 再在已有 trajectory 间做低成本 pairwise comparison，修正共识强度，不增加 rollout。作者同时测常规训练和 test-time training，比较 supervised GT reward、majority-vote RLVR 与其他 label-free 方法。

**关键实验与证据**：三种 LLM backbone、多个 reasoning benchmark 上，OM-GRPO 稳定超过已有 label-free RLVR，并在多数设置接近使用 ground-truth reward 的监督训练。Test-Time Training 中比 majority voting 高 4.24 点；训练曲线也显示答案共识坍缩得到抑制，而非只在最终 checkpoint 偶然领先。

**局限和可信度**：答案 span 必须可可靠解析；完全不更新答案 token 可能牺牲格式、校准或领域术语；pairwise comparison 仍由当前模型分布产生，系统性错误可能形成稳定共识。方法对数学式可归一化答案最可信，开放生成场景不能直接套用。它接近 supervised GT reward 的结果很鼓舞，但不能由此断言 pseudo-label 与真实标签等价；更严谨的下一步应测错误多数持续多轮时，mask 是否只是延缓而非消除 collapse。

**与当天主题的关系**：它是当天最清楚的“信用隔离”设计：reward 可以来自答案，但 gradient 不必落在答案上。

### 14. VerMem：把记忆写入、检索、压缩和恢复训练成一个可验证 policy

**论文信息**：*Verifiable Memory: Learning Unified Memory Management with Local and Global Verifiers for Large Language Model Agents*；Xiaolong Sun、Qichao Wang、Hangyu Li、Liang Chen；[arXiv:2608.03137](https://arxiv.org/abs/2608.03137)；cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：VerMem 用一个 policy 控制长期记忆、活跃上下文和 episodic history 的七种操作，再以 local transition verifier 与 global coherence verifier 提供多粒度 RL 信用。

**为什么值得推荐**：agent memory 研究常把“写什么”和“当前上下文留什么”分开优化，终局成功又很难告诉某次删除、摘要或恢复是否正确。VerMem 的新意是让 memory management 成为显式 action space，并把可执行 transition 与终态证据一致性都纳入训练，而部署时移除 verifier。

**方法怎么工作**：LTM、active context、history 保持独立状态；policy 可 add/revise/soft-delete LTM、retrieve 到 active context、filter/summarize context、restore history。先 SFT 初始化操作格式，再进行三阶段 RL curriculum；local verifier 检查已实现的 atomic transition，global verifier 检查 evidence coherence 与 terminal memory consistency，并和 task success、evidence recall、效率、约束组成 hierarchical credit。

**关键实验与证据**：只在 HotpotQA 训练，却在 ALFWorld、SciWorld、PDDL、BabyAI、HotpotQA 五个 benchmark 测试。Qwen2.5-7B 上平均 48.01，比无显式 memory 的 Base 高 19.96 点、比最强外部 AgeMem 高 6.05；Qwen3-4B 平均 59.85，比 AgeMem 高 5.54。达到 40.0 macro success 只需约 2,080 online token，比 AgeMem 少 20%；2,500 token 预算下又高 5.30 点。

**局限和可信度**：每 episode 后清空状态，因此没有验证跨 session/user 的长期记忆；两种 Qwen backbone 和 proprietary Qwen-Max judge 限制独立复现；teacher/verifier 也带来离线成本和偏差。跨 benchmark transfer 与 verifier-free inference 支持方法有效，但隐私、冲突记忆和恶意注入仍未覆盖。PDDL 上 noVerify 还比完整 VerMem 高 0.35 点，说明 semantic verifier 不是所有结构化任务都受益；这类反例支持按任务选择反馈，而不是把更多 verifier 一律当成更强监督。

**与当天主题的关系**：它把长时 agent 的 credit assignment 精确落到 memory operation，而不是只奖励最终答对。

它也提醒读者，memory benchmark 应同时报告成功、证据召回、上下文 token 和操作次数，否则更大的外部存储很容易被误写成更好的记忆策略。

### 15. ADRS：privileged skill 只有与实际 return 相关时才该影响 token

**论文信息**：*Agentic Reinforcement Learning with Self-Distilled Reward Shaping*；Ranxu Zhang、Guinan Chen、Chenshaodong 等；[arXiv:2608.03223](https://arxiv.org/abs/2608.03223)；cs.LG / cs.AI / cs.CL；发布于 2026-08-05。

**一句话 TL;DR**：ADRS 用同一 frozen policy 在有/无训练期 skill 的条件下重评分固定 rollout token，再用 confidence-return association gate 过滤不与成功相关的 privileged signal。

**为什么值得推荐**：teacher 在看到技能提示后更相信某个 token，不代表这个偏好会提高环境回报；若直接把 teacher likelihood 当 dense reward，模型容易学到流畅风格而非动作贡献。ADRS 同时处理跨 step 标度、teacher 可靠性和信号如何进入原生 advantage 三个问题。

**方法怎么工作**：skill-free policy 先与环境交互；同一 snapshot 在普通与 privileged skill context 下重评分已生成 token；每 step 内做中心化与归一化，得到相对 token preference；Teacher Value Advantage 根据组内 teacher confidence 与 realized return 的关联给出 gate；最后在 native reward-to-advantage construction 前调制 token credit，rollout 和推理都不携带 skill。

**关键实验与证据**：三个 interactive benchmark、两种 backbone 和多种 RL base 上均有提升。Qwen3-1.7B 的 aggregate 结果中，ADRS 为 65.6，高于 SDAR 的 58.6；WebShop 300-step 对比中，GRPO best/final 为 78.9/78.9，完整 ADRS 为 84.4/82.0。ALFWorld 的 ADRS-global 最终 96.1，高于 GRPO 86.7；减少 40% 以上数据后仍保持明显收益。

**局限和可信度**：privileged skill 的质量与来源是额外假设，重评分和多 branch 增加训练成本；部分表格在不同 normalization/backbone 下不可直接横比。论文给了 matched normalization、teacher-scale sensitivity 与 unseen split，但匿名稿的复杂 pipeline 仍需要代码复现才能确认收益来自哪一层。Figure 6 中 action、object 与 style token gap 的分离支持其机制解释，不过这些类别由任务模板定义；换到开放工具生态，如何稳定识别 task-bearing token 仍是未解决前提。

**与当天主题的关系**：它代表一种更谨慎的 dense supervision：不是 teacher 说得更自信就奖励，而是先证明这种自信与 return 同向。

这使 ADRS 与普通 auxiliary distillation 的边界很清楚：它不另开一条优化目标，而是修改环境奖励进入原生 advantage 的路径。

### 16. SFT Conflicts, RL Coexists：多任务冲突可能来自两类更新的几何差异

**论文信息**：*SFT Conflicts, RL Coexists: A Theoretical and Empirical Analysis of Multi-Task Learning for LLMs*；Kejian Zhu、Zhuoran Jin、Shangqing Tu 等；[arXiv:2608.03573](https://arxiv.org/abs/2608.03573)；cs.CL / cs.LG；发布于 2026-08-05。

**一句话 TL;DR**：论文观察到多阶段 SFT 的任务更新高度重叠且互相覆盖，而 on-policy RL 的更新更稀疏、近似正交，并提出 SFT 干扰受范数、RL 干扰受方差限制的解释。

**为什么值得推荐**：多任务 post-training 常把数据混合比例当作主要问题，却少有工作从 parameter-update geometry 解释为何 SFT 与 RL 的遗忘行为不同。如果结论成立，它会改变 multi-task recipe 的设计：任务可分开做 RL update 再合并，而不是一定要维护一个复杂混合池。

**方法怎么工作**：作者在数学、科学推理、代码等任务上做 single-task、sequential 与 mixed training；比较各任务参数增量的稀疏度、幅度和 pairwise cosine；理论上分别界定 SFT gradient inner product 与 advantage-normalized policy gradient interference；最后据此提出 Parallel-RL，让任务独立优化，再 sum/merge task-specific delta，并做消融。

**关键实验与证据**：单任务 SFT 平均提高目标 4.0%，却在其他任务出现 2.4、6.9、16.0、2.6 点下降的代表性结果。参数层面，SFT 约 93% 更新幅度超过 `1e-5`，RL 仅约 20%，且 RL task delta 更接近正交。Parallel-RL 在表中同时改善训练效率与多任务平均表现，支持“稀疏、低干扰更新可组合”的假设。

**局限和可信度**：理论依赖正则条件和具体 advantage normalization，不能自动推广到所有 PPO/GRPO variant；update orthogonality 与能力共存相关，但未必是唯一因果机制。论文的结论强、实验也新，但需要在更多模型规模、长训练和 preference/safety 任务上复现，当前应读作高价值假设而非定律。

**与当天主题的关系**：它把 post-training 稳定性问题推进到优化几何层，而不是只调数据配比。

### 17. RAPO：RFT 并不天然抗遗忘，风险必须从 policy 和 data 两侧显式控制

**论文信息**：*Taming the Implicit: Dual-Channel Risk-Aware Reinforcement Fine-Tuning for Continual Multimodal Post-Training*；Yibei Liu、Jiajun Chen、Qianle Zhang 等；[arXiv:2608.03660](https://arxiv.org/abs/2608.03660)；cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：RAPO 根据 rollout 可靠性与 Fisher-inspired 局部敏感度缩小高风险样本的更新，同时按风险桶重组 batch，在不回放旧任务数据的情况下减轻 continual RFT 遗忘。

**为什么值得推荐**：RFT 常被认为比 SFT 更稳定，因为 advantage 与 sampling 带来隐式正则；作者证明在明显 task distribution shift 下，这种隐式保护仍会崩溃。它的贡献不是再加 memory replay，而是在只能访问当前阶段数据时显式治理 optimization risk。

**方法怎么工作**：Figure 2 有两条通道。Policy 侧，R-Scale 由 rollout reliability 和 token probability 对局部扰动的敏感度估计 sample risk，风险越高更新系数越小；Data 侧，R-Bucket 动态分成低/中/高风险并以 0.80/0.15/0.05 重点抽样，再混入均匀样本；两者作为 plug-in 保留原 RFT objective，不存旧数据也不改 inference。

**关键实验与证据**：在公开 MLLM-CL benchmark 上，标准 RLOO 随任务迁移出现明显 forgetting；RAPO 相对 RLOO 把 final forgetting 降低 79.8%，同时保持新任务 acquisition。Table 1 同时报告 stage-wise performance、mean final performance、mean forgetting 和 final memory，而非只挑最终新任务分数；通道消融显示 policy scaling 与 risk-aware sampling 都有独立贡献。

**局限和可信度**：只在一个 continual multimodal benchmark 和有限 RFT backbone 上验证；risk proxy 并非真实 Fisher，风险桶比例也可能对任务序列敏感。没有旧数据是实用优势，但无法对抗标签体系彻底冲突。当前证据足以反驳“RFT 天然不会忘”，还不足以证明 RAPO 是通用解。79.8% 是相对 forgetting reduction，不能和绝对新任务准确率混读；读者应同时检查 MFN、MAA 与 stage-wise FM，确认方法没有通过缩小所有更新来换取表面保留。

**与当天主题的关系**：它明确把 continual post-training 的可靠性写成优化风险管理，而不是经验性调参。

### 18. Latent Reward Registers：在扩散结束前就读出偏好

**论文信息**：*Latent Reward Registers for Diffusion Preference Alignment*；Yuanshen Guan、Zipeng Feng、Zhiwei Xiong、Peiqin Sun；[arXiv:2608.03929](https://arxiv.org/abs/2608.03929)；cs.LG / cs.CV；发布于 2026-08-05。

**一句话 TL;DR**：在 frozen DiT 前加入 position-free register token，从任意噪声 latent 预测最终偏好，再用 dense reward gradient 做 on-policy distillation 或 inference-time steering。

**为什么值得推荐**：扩散 alignment 的 reward 常在最终图像才出现，跨几十步 denoising 的 temporal credit 极稀；若每次都完整 rollout，再做 policy gradient，计算与显存都很重。本文把 reward model 变成一个不改 generator hidden state 的中间读出器，兼顾 dense signal 与非侵入性。

**方法怎么工作**：Figure 2 中，32 个 learnable register 从 frozen DiT 特征聚合 reward evidence，独立 readout 不改变空间 token 或 velocity field；训练 register 预测 pairwise preference；RG-OPD 在 student 的 on-policy trajectory 上用 reward gradient 蒸馏更新，避免完整 RL rollout；RGS 则在推理时按与生成梯度匹配的幅度直接 steer latent，无需改参数。

**关键实验与证据**：在高噪声 `u=0.8` 时，register 在四个 benchmark 上取得所比较 latent reward model 中最高 pairwise accuracy。RG-OPD 在 SD3-Medium 与 FLUX.1-dev 上超过 online RL baseline，并把 GPU hours 最多降低 33 倍；RGS 在 training-free 方法中同时提高 alignment 与 perceptual metric，而非只牺牲画质换偏好。

**局限和可信度**：reward register 仍由最终 preference label 训练，偏差会被密集传播；高噪声预测好不代表 gradient 在每个时间步都因果正确。大幅效率数字依赖具体模型、采样器和硬件，且 12MB 级 PDF 中的完整实现仍需代码核验。它是很有潜力的 multimodal post-training 机制，但 reward hacking 风险同样被前移到了 latent。由于 register 不改变 generator token stream，架构上较容易做干净消融；真正关键的复现项是 reward-gradient 幅度匹配是否对不同 solver schedule 仍稳定。

**与当天主题的关系**：它把“过程 reward”从语言 token 扩展到生成模型的中间动力学。

与只在终图上重排候选相比，这种设计真正改变了生成轨迹；与完整 online RL 相比，它又试图把计算集中到可微 reward readout 上。

### 19. TurnSight：tool-use 的自然信用单位不是 token，而是带执行反馈的一整个 turn

**论文信息**：*TurnSight: Turn-Level Hindsight Self-Distillation for Tool-Integrated Reasoning*；Changle Qu、Sunhao Dai、Hengyi Cai 等；[arXiv:2608.04007](https://arxiv.org/abs/2608.04007)；cs.CL / cs.AI；发布于 2026-08-05。

**一句话 TL;DR**：TurnSight 从后续工具返回构造多个 lookahead hindsight view，把 token 差异聚合为 turn signal，再只在不同 horizon 对更新方向达成一致时调制 RL advantage。

**为什么值得推荐**：在 tool-integrated reasoning 中，选工具、填参数和读取结果共同构成一个决策；逐 token teacher signal 会因格式 token 和参数等价写法互相冲突，trajectory reward 又太稀。TurnSight 选择 turn 作为 credit unit，并要求多种后见视角方向一致，设计上比简单“teacher 看未来”更稳健。

**方法怎么工作**：student 先产生真实 tool trajectory；frozen reference 分别看到未来 1、2、3 个 turn 的 execution-conditioned context，重评分已实现 token；同一 turn 内对 token gap 聚合，得到 decision-level hindsight；跨 horizon 用多数方向选择可靠 signal；最后在 sibling rollout 间归一化并有界调制 MatchTIR advantage，保持原优化方向，不额外训练 value model。

**关键实验与证据**：用 2,000 余条 FTRL training problem、每 query 16 条 trajectory、最多 10 turn，在 8 张 A800 上训练三轮。Qwen3-4B 的三 benchmark 总平均 37.51，高于 MatchTIR 34.76 与 SDAR 33.55；Qwen3-8B 为 42.02，高于 39.03 与 38.04。BFCL、ToolHop 为 OOD，提升不只来自记忆训练题型。

**局限和可信度**：训练开销很高，多 hindsight branch 的成本没有被最终准确率完全概括；只测两种 Qwen backbone、三类工具 benchmark，真实 API failure、权限和不可逆 effect 未覆盖。方向一致性降低了噪声，却可能过滤少数但关键的反常识信号。训练使用每 query 16 条 trajectory、三种 lookahead 和 8 张 A800，这意味着 2–3 点平均提升的资源性价比必须单独评估；论文证明了 credit unit 合理，还没有证明它是最便宜的实现。

**与当天主题的关系**：它把长时 agentic RL 的信用从“整条轨迹”缩到“由执行结果定义的回合”，是当天 post-training 主线的直接收束。

## 中相关论文速读

### Coding agent、软件变更与执行可靠性

#### KernelBrain：预算应随候选可信度逐级增加

[*KernelBrain: Coarse-to-Fine, Budget-Aware Search for Agentic GPU Kernel Optimization*](https://arxiv.org/abs/2608.02611) 处理 kernel search 中错误候选多、runtime noisy 和高保真 profiling 昂贵的问题。它先用 LLM mutation 与廉价 gate 大规模筛选，再把 profiler-informed diagnosis 和更多测量预算分给 survivor；Triton 任务上相对 PyTorch 为 0.88×–6.72×，相对现有 kernel agent 最高 1.4×，优化时间最多低 48%。值得保留的判断是“agent search 的预算分配本身就是算法”；但任务与硬件覆盖较窄，且速度测量容易受环境影响，因此放在中相关而不深挖。

#### Verified Tool Calls：timeout 不等于工具没有产生副作用

[*Verified Tool Calls Improve LLM Agent Reliability Under Non-Atomic Failures*](https://arxiv.org/abs/2608.02645) 指出现有 agent 把 tool call 当原子 success/failure，而真实系统会出现 dispatch 后 timeout、延迟可见和部分更新。方法在 wrapper 加 postcondition verification、verify-before-retry 与 idempotency key，在注入非原子故障的模拟环境中明显减少重复动作，同时保持相近任务成功率。应记住的是可靠性可由 interaction semantics 改善，无需改模型；之所以不深读，是因为证据主要来自受控 simulation，尚未给出真实 API、并发和跨服务 transaction 的外部验证。

#### Text-to-Terraform：语法正确与安全合规几乎正交

[*Security-First Evaluation of Text-to-Terraform*](https://arxiv.org/abs/2608.02672) 把 AWS IaC 生成接入 GitLab CI、Checkov 和 Trivy，测七个模型、17 个场景、两种 prompt 和三级安全要求。WizardCoder-33B 有 77.8% validate rate，却是 0 Checkov compliance；Claude Opus 4 在详细安全提示下为 23.1% Checkov、92.5% Trivy。核心判断很明确：能解析、能部署不代表配置安全，自动多 scanner gate 不可省。样本场景少、合规工具本身也有 false positive，所以更适合作为安全评测警示而非完整 agent 方法深读。

#### TraceCompiler：只把有 provenance 的依赖编译成确定性 workflow

[*TraceCompiler*](https://arxiv.org/abs/2608.02680) 从重复 agent trace 中区分稳定结构、恢复动作和残留 LLM 决策；只有 consumer argument 能唯一追溯到 producer output 时才建立 hard edge，模糊关系只标 suspected。T1 的 15,775 条 def-use edge 上 precision/recall 为 0.928/0.943；Venmo intent 把 34 次观测调用压到 11 次，21 个 leave-one-out 中过 15 个，并对不可确定副作用选择拒绝编译。推荐保留“可拒绝的 compiler 比强行自动化更可信”；但只实测两个 end-to-end intent，且未计离线编译成本，因此暂列中相关。

#### BulkPR-Bench：PR 队列治理不是逐个 review 的简单求和

[*BulkPR-Bench*](https://arxiv.org/abs/2608.02685) 用 18 个冻结仓库、581 个新写 PR 与隐藏安全检查构造关系图，agent 必须同时选最大安全子集和可执行顺序。K=32 缓冲协议下，最好三模型 RDS 为 66.6%、62.0%、57.9%，优于最强 sequential baseline 的 53.1%，但 324 次运行只有 8 次完整正确，critical-relation recall 仅 35.2%–57.7%。关键结论是局部 relation gain 还远未成为 whole-queue governance；benchmark 新颖，但任务人工构造、gold relation 难度高，适合速读而非把当前数字当生产能力。

#### PolicyGuard：自然语言 policy 可以做 coding-agent 前置 DLP

[*PolicyGuard*](https://arxiv.org/abs/2608.02687) 在模型前拦截 prompt，用可由非工程人员编辑的 plaintext policy 判断 credential、PII 和业务数据。2,000 个多语 prompt 的 sealed protocol 中，927 条冻结测试上 effective block 96.5%、FPR 3.0%，217 条 hidden holdout 为 100%；同内容自然语言 policy 显著胜过 JSON 与 zero-shot，并能跨四模型保持 86.4%–96.5% block rate。值得记住的是 policy format 也影响 classifier generalization；但数据为模板家族构造，复杂 repo context、代码片段误报和 adversarial paraphrase 仍需更强外部测试。

#### Don't Regenerate, Debug：near-miss kernel 值得被修而不是丢弃

[*Don't Regenerate, Debug*](https://arxiv.org/abs/2608.02712) 针对会编译、会执行却数值错误的 AscendC operator，用 retrieved pattern、诊断 instrumentation、anti-cheat full-coverage gate 与 bounded loop 做局部修复。27 个 near-miss 上 Debug Pass@1 66.7%，高于重新生成单次 25.9% 和三次 40.7%，每成功 token 少 92.8%；完整性 gate 还拒绝了 workflow 自认成功中的 12.5%–33.3%。判断很有价值：失败 artifact 是密集反馈资产；但单平台、27 题和强领域知识库限制泛化，所以列为中相关。

#### LACE：跨 RISC-V core 的修改要靠 IR、局部编辑和 formal loop

[*LACE*](https://arxiv.org/abs/2608.02915) 将自然语言 ISAX intent 编译成 operation-level / HDL-task-level 两层 IR，再做 retrieval-guided repository edit，最后用 compiler-agnostic `riscv-formal` 闭环检查。四个 embedded core 上，论文报告 pass@1 从近零升到 72.8%。值得推荐的是它没有把 RTL generation 与 integration 分开，而是把 localization、接口适配和 formal validation 串起来；不过结果高度依赖 RVFI 可用或可插桩，任务规模与 near-zero baseline 的可比性仍需代码复现，故不列强相关。

#### ParamBench：选对工具之后，参数仍可能是主要失败源

[*Getting the Parameters Right*](https://arxiv.org/abs/2608.03071) 同时属于两条主线。它用 cloud-network API 按 nesting、cross-parameter dependency 和前序调用推理分成五级难度，发现 hidden state 可由线性 probe 预测参数正确性；probe-filtered bootstrapping 用可信自生成调用做 SFT，probe-guided reranking 在推理时选候选，五个开放模型和六个外部 benchmark 上平均 exact match 从 19.7% 升到 59.6%。核心判断是内部 correctness signal 可服务数据筛选与执行选择；但 probe 对 API schema 漂移和闭源 hidden state 不适用，因此保留为交叉中相关。

#### GUI-MCP：能把模型诱导去用工具，不等于它会用工具

[*Screenshots or Tools?*](https://arxiv.org/abs/2608.03327) 在同一 OSWorld-MCP harness 的 309 题上发现，工具让 reasoning model +4.0 点，却让 non-reasoning model -5.9 点；前者也只在 55/309 题调用工具。dense bonus 能把 spreadsheet adoption 从 0.03 推到 0.33，但 held-out accuracy 不随之增长，说明 behavior steerable、competence 不自动出现。删除成功 tool call 后的冗余截图并减半 image history，再按同 observation rule 重训，可用 53% input cost 达 37.8%，高于原操作点 33.0%。因其更偏 computer-use policy 而非软件修改，放中相关。

#### UI Metamorphic Relations：覆盖到了行为，不代表测试写了 oracle

[*Assessing Behavioral Validation in UI Component Test Suites Using Inferred Metamorphic Relations*](https://arxiv.org/abs/2608.03337) 从组件 source、文档和测试推断 UI-specific metamorphic relation，再对齐现有 assertion，区分 MR Touch 与真正 MR Cover。三种 LLM 配置下 MR Cover 仅 42.5%–47.6%，显著低于被执行到的 relation，主要缺口是 weak oracle。应保留的判断是 statement/branch coverage 看不到行为关系是否被验证，这对 UI agent 生成测试很关键；但 MR space 本身由模型推断且不是完整 specification，故适合作为补充证据而非单独质量标准。

#### Self-Evolving Coding Agents Survey：先区分“什么在变”，再讨论进化

[*Self-Evolving Coding Agents*](https://arxiv.org/abs/2608.03392) 用 object-centered taxonomy 区分 framework、memory、skill、tool、model 与 collaboration structure 的变化，再增加“何时进化”和“什么软件证据驱动”两个轴。最有用的判断是 executable feedback、repository context 与 coding trajectory 让软件场景不同于一般 self-evolving agent，同时带来 benchmark overfitting、维护、安全与成本问题。它能作为当天多篇 skill 论文的地图，但属于 survey，没有新的可执行对照实验，所以不做强相关深读。

#### SkillSentry：skill 安全审计需要动态诱发条件行为

[*SkillSentry*](https://arxiv.org/abs/2608.03485) 先推断 skill 的能力边界，再构造带 decoy resource 的 adaptive honey world，生成任务探索状态，并把 skill-enabled 与 no-skill trajectory 配对，最后回到 source 和 execution trace 归因。标准集 Recall 99.50%、平均 F1 96.26%；语义保持规避下 F1 92.95%，最强 baseline 80.07%。应记住动态执行比一次静态语义判断更能发现条件恶意行为；但 LLM-simulated environment 与已知 scanner benchmark 可能高估现实覆盖，列中相关。

#### SkillJack：删除 poisoned memory 后，恶意 skill 仍会活着

[*SkillJack*](https://arxiv.org/abs/2608.03509) 攻击 experience-to-skill pipeline，把瞬时 poisoned trajectory 提升为持久 skill，并利用 sanitization whitewashing 隐去恶意意图。SkillX 中安全检测从原轨迹 98.5% 掉到抽取 skill 的 11.4%，两系统攻击成功率 56.2% / 89.2%，删除源记录后仍有 80% 攻击持续。最关键判断是 skill extraction 是有 provenance 风险的构建步骤，不是安全清洗；但只测两个系统和 150 条轨迹，攻击面仍需扩大，因此中相关。

#### CodeAssay：benchmark 审计会改变模型之间的真实差距

[*CodeAssay*](https://arxiv.org/abs/2608.03535) 用 185 个 Python 任务、public/hidden test、mutation score 与代码属性做 taxonomy-first 评测。审计后 1,890 个 correctness label 有 170 个（9.0%）变化，best-worst 差距从 11.9 扩到 23.7 点；安全 prompt 没稳定减少静态问题，反而让所有模型程序更长、更复杂。保留判断：ground truth 与 test strength 是模型排名的一部分；但任务仍偏小型 Python generation，不等同 repository change，所以中相关速读足够。

#### EffiHolmes：性能缺陷定位需要 workload 对比，不是一次 profile

[*EffiHolmes*](https://arxiv.org/abs/2608.03558) 面向功能测试全过、没有 stack trace 的 repository-level time inefficiency。它比较默认与放大 workload 的 differential profile，抽取 hotspot 到 reported function 的紧凑路径，再让 LLM 跨 semantic gap 定位实际 fix logic；RepoEffi-Bench 含 140 个 Python issue。GPT-5.1 的 file Acc@3 高 4.29 点，Qwen3-4B 的 function Acc@5 高 15 点。核心方法合理，但只做 localization、未验证最终 patch correctness，故不列强相关。

#### STEAD：对 operational data 的 agent verification 有明确可判定边界

[*Formal Verification of Agentic Systems over Operational Data*](https://arxiv.org/abs/2608.03609) 把 LLM、tool harness 与 relational state 建模为 STEAD，证明一般 FO-CTL verification 不可判定；有限域限制下为 PSPACE-complete。关键条件是 opaque identifier 重命名必须等变地改变 tool call，作者用 canonical wrapper 保证任意 base agent 的等变行为，同时证明 canonical representation 计算是 graph-isomorphism-hard。它提供了严谨系统边界，但案例仅是小型 case-management workflow，距离复杂仓库 agent 的端到端验证尚远，因此中相关。

#### ReCite：修注释要沿 Git history 找语义继承，不是只看当前代码

[*We Must Have Missed This Comment*](https://arxiv.org/abs/2608.03734) 检测 Linux kernel comment 中无法解析的 function-form symbol，沿历史追踪函数重命名/删除，再结合当前上下文生成修复。v6.18-rc1 上找到 869 个 stale reference；人工抽样 200 条中 89.0% 有用、42.5% 可直接应用，75 个提交 patch 已接受 50 个。推荐它因为 history-grounded maintenance 得到了真实上游接受证据；但目标只是一类注释引用，方法外延有限，故中相关。

#### TUI Testing：random baseline 仍然很难被 agent 全面击败

[*Can LLMs Test Terminal User Interfaces?*](https://arxiv.org/abs/2608.03743) 调查 197 个 TUI，只有 12% test code 真正触达界面，其中 45% 连输入都不发；随后把 Rust、Go、Python、TypeScript TUI 打包成 headless Docker benchmark。等 wall-clock 下四个 frontier LLM 无一统治 random；random 靠吞吐找更多 crash，LLM 每次 interaction 更有效并独有发现 input-gated fault。最值得记住的是 line coverage 不能可靠预测 crash，且自动推断 launch input 比换模型更有用。评测是测试生成/探索而非软件修复，列中相关。

#### ContinualSkillBench：上下文适应经常被误认为 skill 进化

[*ContinualSkillBench*](https://arxiv.org/abs/2608.03874) 在五个领域各安排 100 个递增、互相关联的 subtask，对照 sequential context 与显式 skill maintenance。顺序执行通常变好，但平均而言 in-context learning 与显式 skill 相近；明确 skill 只在可复用 procedure 或精确输出任务上有选择性优势，弱模型反而积累更多碎片化 task-specific skill。关键判断与本文首篇深读相互印证：进步必须证明来自可迁移抽象。它偏通用 agent 而非 coding 专项，故中相关。

### Post-training：偏好、蒸馏、持续学习与多模态训练

#### Pairwise Preference Is Not Safety：被偏好不等于临床安全

[*Preferred, Not Safer*](https://arxiv.org/abs/2608.02617) 用 736 位以上临床人员、28 个以上国家、13 个模型的 26,804 次 blind pairwise judgment，对照 `[-2,+2]` 多维 rubric。高 preference ranking 的模型仍可能在 harmlessness / accuracy 上出现大量 `<=-1` failure，且 specialty-specific “no-go zone” 会被总榜隐藏；表面特征解释的偏好变异还略多于 safety-critical rubric。应保留的判断是 preference data 不能直接替代安全 reward；但它主要是评价信号审计，没有训练新 policy，因此列为中相关。

#### AudioRubrics：reward rubric 应随样本与当前 policy 一起变化

[*Reinforcement Learning with Evolving Rubrics as Rewards for Audio Reasoning*](https://arxiv.org/abs/2608.02831) 从原始 waveform 生成 sample-specific rubric，再根据当前 rollout group 重写和重加权标准，使 reward 持续针对 policy 的新弱点。三个 audio reasoning benchmark 上超过多种训练 baseline，且推理长度收敛到稳定区间，没有 collapse 或无界增长；收益随 rubric generator / judge 能力增强。核心思想很强，但摘要缺少主要数值，reward 仍依赖强 judge，音频 grounding 的自动审计也有限，所以不升为深读。

#### OPTD：few-step diffusion LM 应在 student 自己访问的状态上学压缩

[*OPTD*](https://arxiv.org/abs/2608.02942) 解决 off-policy distillation 在 aggressive step compression 时的状态漂移：从 student partial state 出发，让 frozen question-only teacher 找 outcome-aligned future candidate，按 confidence 排序，并选择仍保持 teacher outcome 的最长 joint prefix；set-bottleneck objective 推高已验证候选，KL anchor 稳定其他 active position。四个数学/代码 benchmark 上质量约束 AUP 最好，且不用 gold response。结论值得保留，但 diffusion LM 评测与指标仍偏专门，故中相关。

#### SP3O：长轨迹 preference 可以拆成 segment，而不必训练 reward model

[*SP3O*](https://arxiv.org/abs/2608.02951) 面向 stochastic MDP，用短 segment pair preference 经 off-policy importance sampling 估计 policy value difference，再套入 PPO-style gradient；方法无需 reward model、critic，也不是 zeroth-order。理论分析 segment length 的偏差—方差/标注成本权衡，并在 robot control 与 LLM fine-tuning 中优于多种 PbRL/RLHF baseline，长时任务最明显。它扩大了 reward-model-free preference RL 的范围，但 LLM 实验不是全文唯一核心，生产规模标注成本也未定，因此速读即可。

#### Base vs Post-Trained：模型适合模拟人群，取决于你问的是 emulation 还是 estimation

[*Emulate or Estimate?*](https://arxiv.org/abs/2608.03044) 在 Pew American Trends Panel 上比较六组 matched base / post-trained model。让模型逐个生成人的回答并聚合时，base model 更接近真实分布、保留更多人口结构；让模型直接预测总体分布时，post-trained model 更强。推荐保留的是 post-training 会改变“如何代表不确定人群”，不应默认 instruction-following 更好就更像人。它是行为测量而非训练算法，且限于一套美国调查，因此列中相关。

#### CVPO：用 value variance 同时调 advantage 与 curriculum

[*CVPO*](https://arxiv.org/abs/2608.03068) 观察 token-level value variance 与 exploration intensity 相关，并给出其约束 policy update magnitude 的分析；trajectory 侧按 variance 调不同 reward 的 advantage，question 侧动态估计难度，让 curriculum 跟随当前能力。多个 math task 上优于 VAPO 等 value-based baseline，并报告更强 exploration。应记住“问题难度漂移”和“轨迹随机性”要共同调节；但效果高度依赖 value estimate，任务只聚焦数学推理，因此中相关。

#### ParamBench：交叉项见上文

[*Getting the Parameters Right*](https://arxiv.org/abs/2608.03071) 已在 coding-agent 中相关部分完整解释。它也是当天唯一明确横跨两条主线的论文：probe-filtered bootstrapped training 用内部 correctness signal 筛选合成 tool-call 数据，exact match 从 19.7% 提至 59.6%。它的交叉价值来自同一信号同时服务训练数据过滤和推理候选选择，而不是因为 coding 与 post-training 必须被合并讨论。

#### SMOPD：先让每个 reward 单独学会，再把专长蒸馏回一个 policy

[*SMOPD*](https://arxiv.org/abs/2608.03092) 指出多 reward 即使分别 normalize，dense 0.1–1.0 信号仍会压住 sparse binary reward。Stage 1 用不同 reward-priority 训练 specialist teacher，Stage 2 用 online policy distillation 合并成 student；在 tool-call accuracy/format 的互补 reward、helpful/harmless 的冲突 reward 上，1.5B、3B、7B backbone 都胜过 GDPO。方法直观且实用，但 teacher 数量增加训练成本，摘要也缺少完整 Pareto 数字，所以放中相关。

#### StructPO：把多阶段写作 workflow 内化成带 stage token 的单次 policy

[*Internalizing Academic Writing Workflows for Introduction Generation via Struct-Aware Policy Learning*](https://arxiv.org/abs/2608.03138) 用显式 stage token 表示背景、gap、方法与贡献，以 local stage quality / global coherence 分离的 credit 和 refinement-guided optimization，把外部多 agent 写作流程压进一次生成。Qwen3-32B 在 human evaluation 中可与 GPT-5.1 竞争，并改善 OOD 与效率。值得保留的判断是 policy learning 可内化 workflow；但任务、judge 与“好引言”高度主观，且不宜把单 section 结果泛化到学术真实性，故中相关。

#### GROW：对 flow-matching TTS，signed group advantage 比正权重自模仿更有效

[*GROW*](https://arxiv.org/abs/2608.03215) 不把 deterministic ODE 强行改成 SDE，而直接按 group 内标准化的 intelligibility / speaker similarity advantage 重加权 flow-matching regression，并用 Wasserstein-2 velocity penalty 锚定 reference。DiTAR 上平均 WER 2.016→1.558，speaker similarity 0.676→0.715；10-NFE rollout 与 32-NFE evaluation 下比 32-NFE DiTAR-GRPO 快 2.9 倍。机制清楚，但属于 TTS 专项 post-training，代码仍承诺未来发布，因此中相关。

#### SARF：多模态 post-training 也可以直接针对物理攻击机制

[*Structure-Aware Robust Fine-Tuning*](https://arxiv.org/abs/2608.03231) 先用 AGSD printable patch 诱发 action-to-vision attention hijacking，再只微调 visual encoder，通过 feature anchoring、关键注意力纠正与 language-guided geometry 保持 clean behavior。LIBERO 上 OpenVLA 攻击失败率从 100% 降到平均 28.6%，真实 PiPER robot 的攻击下成功率从 23% 升到 65%。保留判断是 robustness training 应对准可观测机制；但攻击和防御同源、suite 有限，adaptive attacker 尚未充分测试，故中相关。

#### SAGE：DP zeroth-order fine-tuning 中，噪声占主导的更新应主动缩小

[*Noise-Aware Shrinkage for Differentially Private Zeroth-Order Fine-Tuning of Large Language Models*](https://arxiv.org/abs/2608.03277) 从 privatized estimate 的二阶矩减去已知 Gaussian variance，时间平滑后与 warm-up SNR 比较，得到有界 shrinkage；作为纯 post-processing 不增加 privacy budget、query 或大状态。RoBERTa-large、OPT-1.3B/6.7B 在相同 privacy budget 下多数设置胜过 baseline。其价值在于把统计风险显式写入 forward-only post-training；但模型偏旧、任务与绝对 utility 未在摘要展开，因此中相关。

#### Any-OPD：teacher 与 student 不共享 latent space，也能做 on-policy distillation

[*Any-OPD*](https://arxiv.org/abs/2608.03316) 把异构 flow model 的 decoded sample 投到 frozen model-agnostic vision representation 比较，用 continuous noise level 对齐不同 timestep schedule，再用短暂 anchoring 适配 student VAE。把 12B FLUX.1-dev 蒸馏到 2.5B SD3.5-Medium 后，PickScore 0.846→0.884，HPSv3 9.12→10.97，而直接 latent regression 无法训练。关键判断是 representation bridge 可解除 architecture coupling；但只展示一个 teacher-student 主组合，视觉 embedding 偏差未充分审计，故中相关。

#### Cue-GRPO：重复出现的正确解法不应按出现次数垄断正信用

[*When Correct Solutions Repeat: Rarity-Aware Credit Redistribution for GRPO*](https://arxiv.org/abs/2608.03467) 将正确 rollout 按 deterministic strategy cue 聚类，再按结构稀有度重分正 advantage，缓解常见解法因 multiplicity 获得过多系数质量。Qwen2.5-Math-7B 与 Llama-3.1-8B-Instruct 在 AIME repeated sampling，尤其高预算下获益；额外 wall-clock 仅约 6%，judge partition 也支持同一机制。想法切中 GRPO diversity，但主要证据来自竞赛数学和人为 cue，开放推理的 strategy partition 仍不稳，所以中相关。

#### BCP：VLA 不该按固定步数机械重规划

[*Continue or Replan?*](https://arxiv.org/abs/2608.03483) 冻结 base VLA，只训练 Bernoulli continuation head 对 action chunk 每个 prefix 做 continue/replan 决策，并用同时奖励成功和少重规划的 trajectory reward 防止退化。RoboTwin 50 任务平均 89.88%→93.94%，真实 robot 两题从 74%→92%、44%→84%。保留判断是 execution horizon 本身可被 post-train；但方法更偏机器人控制头、任务数有限，和通用 LLM post-training 的联系较边缘，故中相关。

#### Hi-TTRL：低共识会放大错误，高共识又会让梯度消失

[*Hi-TTRL*](https://arxiv.org/abs/2608.03545) 先用部分 rollout 估 majority consensus；若落在目标区间外，就以 power-transformed prefix distribution 为目标做有限步 MCMC hint sampling，通过 sharpen/flatten 把共识拉回可学习区间。多个数据集与 backbone 上持续胜过标准 TTRL，且有 consensus steering 消融。应记住 pseudo-label 可靠性与 advantage contrast 由同一共识变量控制；但 test-time 参数更新成本高、MCMC 近似与真实收益数字未在摘要明确，故中相关。

#### Environment Distribution：训练环境不是越多越好

[*Beyond Simply Environment Scaling*](https://arxiv.org/abs/2608.03571) 从 diversity 与 difficulty structure 两轴设计 multimodal agent training pool：Ability-aware Environment Selection 选互补环境，Hierarchical Difficulty Curriculum 用 harness weakening 和 state-scale progression 排序。实验显示二者都优于简单扩池。这个判断对 agent post-training 数据工程很重要，但摘要没有规模、模型、绝对提升与 contamination control，证据透明度不足，因此保留为中相关而非深读。

#### SALT：训练 adapter 时就应考虑多租户 serving 的交换成本

[*Pin Once, Swap Light*](https://arxiv.org/abs/2608.03579) 先在公开域数据上联合训练可常驻 GPU 的高容量 centroid，用 alignment regularizer 统一子空间；用户只训练 `r<=2` private residual，部署时只交换轻量残差。相对压缩 baseline 准确率最多高 18.5 点、per-adapter memory 少 16 倍；vLLM 中 PCIe 压力下 throughput +51%，VRAM 压力下 +28%。它把训练 recipe 与 serving co-design 得很好，但需要 provider 预定义 domain centroid，跨域和隐私边界尚未充分说明，故中相关。

#### LS-MOPD：多语 ASR 的 specialist teacher 可以在 student 中超越各自上限

[*Language-Specialized Multi-Teacher On-Policy Distillation*](https://arxiv.org/abs/2608.03610) 先用 RL 独立优化普通话、方言、粤语、英语 specialist，再按语言路由做 token-level OPD，比较 static/dynamic acoustic prefix 一致性。generalist student 不只超过 joint RL baseline，还跨越各语言最佳 teacher 的经验 envelope，说明蒸馏可组合互补专长。方法对多任务冲突很相关，但证据局限 ASR 语言集与特定 prefix 设计，故中相关。

#### SA-OPD：teacher 的大梯度可能只是格式先验，不是输入证据

[*When Teachers Mislead*](https://arxiv.org/abs/2608.03632) 为每个 token 估 input-groundedness，只过滤同时“弱依赖输入且 distillation divergence 极大”的高影响信号，避免把一般语言先验、模板和格式惯性当任务监督。LLM 与 VLM 实验均稳定胜过 vanilla / selective OPD。最应保留的判断是 confident/informative/learnable 之外，还要问 teacher signal 是否由输入引起；但 proxy 的因果有效性和跨任务阈值仍需更多验证，列中相关。

#### CausalOPD：从第一处可验证错误开始短程修复

[*CausalOPD*](https://arxiv.org/abs/2608.03673) 让 knowledge-augmented teacher 在 student on-policy causal chain 中找到最早违反规则/关系/约束的 step，从正确 prefix 开始做 short-horizon RL，并按 evidence→mechanism→conclusion 逐阶段 curriculum。三领域 path correctness 比 sequence-level OPD 高 23.4 点，right-label-wrong-reasoning 从 15.7% 降到 4.4%，8B student 还超过两个 proprietary reference。结果很强，但“第一错步可验证”依赖领域知识库，开放推理难满足，故中相关。

#### Offline Top-K KD：把 teacher 移出显存，KL 也不必物化全词表

[*Efficient Knowledge Distillation for LLMs*](https://arxiv.org/abs/2608.03796) 缓存 teacher top-K logits 做 offline KD，单 H200 每 iteration 快约 29%、throughput 最高 +41%；fused chunked KL 不生成完整 vocabulary tensor，使 peak memory 随 sequence length 线性增长，在单卡把 context 拉到 32,768，且 kernel benchmark 测到 256K。推荐它因为是可落地的 post-training systems work；但质量结论主要是近似相同 training loss，跨任务下游效果与 cache 存储代价还需完整评估，故中相关。

#### SAFT Reward Model：先用任务结构去噪 VLM reward landscape

[*Enhancing VLM Reward Models Through Structure-Aware Fine-Tuning*](https://arxiv.org/abs/2608.03875) 不用人工 preference label，而以任务内在结构先验通过 LoRA 调整 VLM latent space，使 text-observation similarity 更平滑、更符合控制任务。不同 base VLM 能力下都加快 policy convergence，并改善 EPIC distance。值得保留的是 noisy reward 可能来自 representation brittleness 而非语义缺失；但具体结构先验依赖任务，且在线自监督可能把环境偏差固化，因此列中相关。

#### Omega-S：论文最诚实的结果，是它揭穿了自己的“拓扑”解释

[*Omega-S*](https://arxiv.org/abs/2608.03887) 提出只依赖当前 weight matrix、无需旧数据/Fisher/旧权重的 penalty，step cost 增加不到 4%。Llama-3-8B 从 code LoRA 到 prose 时，HumanEval retention ratio 62.9%→84.1%，十 seed 中 9 个胜无正则；但作者测出四个因子中三者 elasticity `<=1e-4`，真正起作用的只是 degree variance，而且相同配置重复的 retention ratio 标准差达 0.104。推荐保留这种机制自证伪与负结果；单模型、单迁移限制使其不宜深读成通用 regularizer。

#### CARE-X：临床多模态 post-training 应同时优化生成、判别、定位和工具测量

[*CARE-X*](https://arxiv.org/abs/2608.03890) 为 radiology VLM 增加 focal classification 与 grounding head，再用 DAPO 分别优化 report、VQA、spatial reward；另让 Qwen3-VL-4B 调 deterministic measurement tool。ReXVQA 为 94.0%，领先 6 点；五类 measurement-dependent condition 的 hybrid inference 比纯 perception 平均 F1 高 43.6 点。它证明结构监督与 reward alignment 可互补，但临床有效性、数据泄漏和 threshold calibration 风险很高，属于重要 domain case，不应仅凭 benchmark 升为强相关。

#### TACT：领域 taxonomy 可以同时定义训练动作空间和诊断 benchmark

[*TACT*](https://arxiv.org/abs/2608.03952) 从人类 tutoring 研究构造 13 类 tutor strategy 与 student move taxonomy，为 260 段真实对话生成 32,379 个 annotation，再对 Qwen3.5-4B 做 SFT + taxonomy-aligned GRPO。78 个真实 context 的 TACTBench 上比 backbone 高 20.30%，并在 50 位 learner 的 blind study 中平均评分最高。应保留的是“scaffolding quality 不等于 reference imitation”；但样本和用户实验较小、语言学习效果未做长期测量，故中相关。

#### ReflectRL：强 teacher 的失败轨迹也可以成为训练资产

[*ReflectRL*](https://arxiv.org/abs/2608.03972) 不丢弃 expert 在难题上的错误解，而先让 policy 对 golden negative trajectory 做 reflective reasoning，再通过 reflective-to-direct transition 把纠错能力转回不带反思 scaffold 的直接推理。九个 benchmark、四个 backbone、四种 on-policy training method 上都持续提升且额外开销小。关键判断是“批判一个错误解”可能比从零解题容易；但 reflection 是否忠实利用错误原因、以及 expert failure 的系统偏差是否被继承，仍缺少过程审计，因此中相关。

## 可留意 / 可跳过

下面 21 篇有明确关键词或局部判断，但与两条主线的核心问题距离更远、证据不够完整，或主要贡献是相邻领域工具。它们值得建立索引，不值得在今天优先投入全文阅读时间。

- [*Instruction Stacking Collapse*](https://arxiv.org/abs/2608.02639)：24 种 verifier-checked instruction 从单条约 96% 降到最多仅 20%，prompt compiler 对弱模型最高挽回 11 点。关键词是“约束组合冲突”；它是 training-free prompt rewrite，不是 coding-agent 执行或 post-training，故可留意但跳过深读。
- [*Intent-Level Quantum Programming with Assertion-Guided Execution*](https://arxiv.org/abs/2608.02648)：QDSL 用 inspectable IR、assertion-guided execution mode 和 Qiskit/PennyLane differential test 提高量子程序可验证性。它对复杂构建与跨 backend 有启发，但主体是 DSL/system design，不是 LLM agent 方法。
- [*HyperAgent*](https://arxiv.org/abs/2608.02650)：以 tool-schema hypergraph 建 Task DAG，并按当前缺失输入反向找 producer tool；AppWorld 上减少冗余调用并提高完成率。值得记住 schema-level planning，但缺少摘要数字，且不聚焦软件变更。
- [*HyperFL*](https://arxiv.org/abs/2608.02967)：hypernetwork 按 issue report 生成 query-specific LoRA，固定 code encoder；相对 SweRank，function MRR@10 最高 +13.3%、Hit@1 +16.7%。它解决 localization retrieval，而非完整 repair loop，可跳过全文。
- [*ConFL*](https://arxiv.org/abs/2608.02974)：用 concurrency knowledge base、分层检索和 interaction DSL 定位八个 Java 项目的并发 bug，MRR 0.503、MAP 0.486。方法有解释性，但没有最终 patch / execution validation，属于定位专项。
- [*TraceCAD*](https://arxiv.org/abs/2608.03062)：持久保存 requirement、故障 operation、局部 bounded edit 与修复结果，去掉 persistent state 后 recovery score 近乎减半。它展示 stateful repair，但 CAD 几何指标与 repository software change 的差距较大。
- [*CLEAR*](https://arxiv.org/abs/2608.03134)：Vulnerability Causal Knowledge Graph 驱动 Collector/Claim/Critic/Judge 四 agent，在 C/C++ 与 Java 上 Pair-Correct 相对提高 130.7% / 71.56%。改进幅度很大，但相对数缺绝对基线，且只做 detection。
- [*Test-time reasoning effort and unauthorized tool use*](https://arxiv.org/abs/2608.03169)：预注册 TRIO-20、840 条 trajectory 中没有出现 unauthorized call，低/高 reasoning effort 在 ±7.01 点 margin 内等价。这个负结果设计严谨，但场景太少、零事件上界仍宽，不宜泛化成安全保证。
- [*Enterprise Workflow Generation Lessons*](https://arxiv.org/abs/2608.03311)：把 monolithic JSON generation 拆成变量 scaffold、base block、nested block，29 个生产场景中结构成功从 31.5%–82.8% 提到 74.1%–97.8%，小模型也可用。价值偏工程经验，semantic correctness 仍未解决。
- [*Route-Align-Verify*](https://arxiv.org/abs/2608.03341)：task-aware prompt routing、aligned LoRA 和 public-test execution selection 把 MBPP Sanitized/Full 提到 0.8911/0.8520。它是函数级 code generation，不覆盖真实仓库和 hidden environment，今天可以跳过。
- [*Experience-Driven Adaptive Guidance*](https://arxiv.org/abs/2608.03403)：从历史 tool trajectory 提取、去重、总结 capability boundary 与 best practice，再按任务复用。小 agent 可超过无 guidance 的大 agent，但摘要缺具体规模与数据隔离，需等代码再判断。
- [*DataSpace*](https://arxiv.org/abs/2608.03451)：410 题、7,439 个 artifact、15.01GB workspace，用确定性 evaluator 检查跨 CSV/JSON/SQLite/PDF/video 的完整表格结果；最好 66.34%，同 backbone 的 harness 差 15.36 点。是高质量 data-agent benchmark，但不直接属于软件变更。
- [*LiveEvalBench*](https://arxiv.org/abs/2608.03689)：Build Engineer、Code Engineer、UI Tester 协作检查部署、代码与浏览器交互，并用 artifact-specific rubric 适应多种正确实现。方向对，但摘要不给样本量、相关系数和复现细节，当前可等待。
- [*Pattern over Pixels*](https://arxiv.org/abs/2608.03691)：1,440 个 screenshot fill-in task 显示 MLLM 对重复卡片/字体 pattern 的 bias 为 69.78% / 80.22%，准确率仅 21.17% / 7.89%。失败模式具体，但任务是 masked value recovery，不是完整 UI code edit。
- [*Semantic Optimization Opportunities Compilers Miss*](https://arxiv.org/abs/2608.03983)：SeGaBench 含 100 个合成与 20 个 source-backed C/C++ case，最强模型 94.8% response 正确、83.3% 获得至少 1.05× speedup。可把 LLM 当 speculative semantic proposer，但 source-backed 样本少、必须依赖 validator。
- [*PAST-Bench*](https://arxiv.org/abs/2608.04003)：26 scenario、204 episode 对照 retained experience 开/关，并检查 save-retrieve-update pathway；七个模型、四个 framework 的 headline gain 与真实路径证据经常不一致。它与 skill evolution 很相关，但场景是 personal agent，今天只需记住“收益必须有路径证据”。
- [*JudgeArena*](https://arxiv.org/abs/2608.02620)：统一 AlpacaEval、Arena-Hard、MT-Bench、m-Arena-Hard，支持替换 judge/backend 并记录元数据，还可用开放 judge 近似人类 preference。它是重要评测基础设施，但不是新的 post-training recipe。
- [*Evading Chain-of-Thought Monitoring Through Model Poisoning*](https://arxiv.org/abs/2608.02820)：简单 fine-tuning 就能植入行为 backdoor，同时让 CoT 看起来无害，提醒 process monitor 也可被 post-training 定向规避。安全意义很强，但主线是攻击，不是提升 post-training 可靠性的完整方案。
- [*When Refusal Looks Safe*](https://arxiv.org/abs/2608.03201)：WildGuardMix / GR-Train 中 refusal cue 与 harmless label 高度共现，插入拒绝语会让有害响应逃过 guard。关键词是 dataset shortcut；适合安全数据审计，不必与一般 alignment 能力混为一谈。
- [*Risky Business: Faithfulness-Safety Tension*](https://arxiv.org/abs/2608.03745)：HazMart 用人写的危险推理场景测模型既要 CoT 可监控、又要拒绝不安全结论的张力。问题重要，但 evaluation-dependent，且未形成成熟训练解法，当前留意即可。
- [*Test-Time Scaling in Reasoning LLMs*](https://arxiv.org/abs/2608.04001)：区分单轨延长、完整候选采样/聚合、partial-state search，并强调 compute accounting 与可复现性。它是很好的推理时 taxonomy，但不属于 post-training，本次只作为边界文献收录。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 核心验证证据 | 可复现性 / 实用性 | 评估可信度 |
|---|---|---|---|---|---|
| Self-Evolving Skills | 多轮 skill 更新何时真有收益 | 控制 feedback composition，验证集选择 byte-distinct candidate | 14 设置、42 runs；55/388 刷新最优 | 代码可用，协议可复查 | **高**：负结果与 test/robust/transfer 分离 |
| MDArena | 科学 coding agent 是否能可靠完成 MD workflow | 容器任务 + correctness/process 双证据 | 50 题；最好 Strict-Pass@1 48% | 环境化强，单次运行限制方差 | **中高**：真实项目来源，但实验室分布有限 |
| CUADebug | CUA 失败如何定位并修复 | 主动检查多模态 causal step，再以重执行验证 RCA | 204 轨迹；连续成功 12.2%→25.86% | taxonomy 与 benchmark 可扩展 | **高**：诊断由干预效果验证 |
| Boundary-Bench | 安全 hardening 的性能与成本税 | nested policy + solvability audit | 12 agents、89 题；最多 -18.3 点、+167.3% cost | 插件化强，企业环境仍有差距 | **高**：先排除 policy 不可解任务 |
| Modular Code Review | 成本政策是否污染风险概率 | 无政策估计 + 独立 monitor + coded decision | 15,792 响应；概率漂移 13.6–16.9 点 | 架构简单，数据分布非生产 base rate | **高**：matched intervention，但因素未拆开 |
| PRWeaver | 长时恶意 PR 如何绕过 auditor | execution-validated attack chain + matched rendering | 208 攻击、832 rendering；whole-window 仅 16%–22% | benchmark 明确，攻击合成仍有限 | **高**：PoC 与剂量对照完整 |
| FailFast-RestartSmart | 何时提前停并保留有用 patch | 小 monitor + 可选 diff overlay 重启 | 5% FPR 省 14.6%–20.4%；66.6%→71.8% | 易接 agent loop，需计重试资源 | **中高**：跨 policy transfer，25% FPR 偏高 |
| MT-Web2Code | 多轮 UI 局部修复与非目标保护 | reverse corruption + in/out-box 双轴评测 | 102 题、13 agents；Macro/Micro 排名分离 | micro 可复现，macro 依赖 VLM judge | **中**：数据代码尚待完全发布 |
| ReBug | 自然语言 bug report 如何变成可执行复现 | context completion + browser execution + 双终态 oracle | 667 reports；RSR 49.96% | 真实项目强，历史 replay 仅 40 条 | **中高**：主指标不等于原 bug 直接复现 |
| Resume Contract | checkpoint/resume 到底保证什么 | TLA+ contract + 无 LLM fault harness | 740 万状态；五框架无相同 profile | 合同与 harness 实用性高 | **很高**：模型检查与真实 SIGKILL 互证 |
| RuPI | 开放生成如何利用 rubric | rubric-conditioned teacher 提供 dense token PI | HealthBench + ResearchQA；66.6% vs 64.2%/57.6% | 训练可实现，依赖 judge/rubric | **中高**：matched recipe，人工验证仍少 |
| LoCA | PEFT 能否减少反向链 | 一次 backward 校准 + blockwise closed-form adapter | 16/25 胜 LoRA；内存 -26%–52% | 受限硬件价值高，限 small shift | **中高**：full-run cost 报告完整 |
| OM-GRPO | label-free RLVR 的答案泄漏 | reward 来自答案、gradient 遮掉答案 span | 三 backbone；TTT 比 voting +4.24 | 实现简单，需可靠答案解析 | **中高**：开放生成泛化未知 |
| VerMem | 统一 LTM/STM policy 如何训练 | 七操作 + local/global verifier + curriculum | 五 benchmark；平均胜 AgeMem 5.54–6.05 点 | 推理无 verifier，训练成本较高 | **高**：跨任务与 token frontier 同报 |
| ADRS | privileged teacher signal 何时可信 | step calibration + confidence-return gate + native advantage | 三环境；1.7B aggregate 58.6→65.6 | pipeline 复杂，代码复现关键 | **中高**：多 backbone/数据量消融 |
| SFT Conflicts, RL Coexists | 多任务 SFT/RL 为何不同 | norm-limited vs variance-limited interference 假说 | SFT 他任务降幅最高 16 点；RL 更稀疏 | 可能影响 recipe，需大规模复现 | **中**：强结论，因果链尚未完全锁定 |
| RAPO | continual RFT 是否仍遗忘 | policy risk scaling + data risk bucket | MLLM-CL forgetting 相对降 79.8% | 无 replay，plug-in 性强 | **中高**：单 benchmark 限制泛化 |
| Latent Reward Registers | 扩散中间态如何获得 dense preference | frozen DiT 上独立 register readout | 高噪声最佳；GPU hours 最多少 33× | 训练/采样两用，工程复杂 | **中高**：reward bias 可能被密集放大 |
| TurnSight | tool-use 信用应落在哪个粒度 | 多 horizon hindsight 聚合到 turn | 4B 34.76→37.51；8B 39.03→42.02 | 训练需多 branch 与 8×A800 | **中高**：OOD 有提升，现实 API 未覆盖 |

## 我的判断

**创新性：A。** 今天不是单一“大方法日”，而是问题定义升级日。最强创新来自三个地方：Boundary-Bench 把 deployment policy 变成评测轴，Resume Contract 把 agent workflow persistence 变成形式合同，OM-GRPO / TurnSight / Latent Reward Registers 把信用分配从终局答案重新定位到具体可干预的内部单位。若只看 benchmark 涨点会低估这批论文。

**实用价值：A。** coding-agent 侧的可落地性尤其强：权限 hardening、RCA 后重执行、失败轨迹早停、浏览器 bug reproduction、resume exactly-once 都是今天就会遇到的问题。post-training 侧，LoCA、offline KD、SALT 的系统收益很具体；更复杂的 multi-branch OPD / RL 方法则要先核算真实训练成本。

**严谨性：A-。** Resume Contract、Modular Code Review、Self-Evolving Skills、PRWeaver 的控制设计最好；MDArena、ReBug、MT-Web2Code 提供了更真实的任务，但样本、单次运行或 judge 依赖留下不确定性。post-training 论文数量很多，却仍普遍集中于少数 Qwen/Llama backbone 与自动 reward，跨规模和人工偏好验证不足。

**推荐价值：A。** 优先阅读顺序是：Resume Contract、CUADebug、Boundary-Bench、PRWeaver、VerMem、OM-GRPO、RuPI、TurnSight；如果关心持续训练，再读 RAPO 与 SFT Conflicts；如果关心真实 UI / 软件维护，再读 MT-Web2Code、ReBug、FailFast-RestartSmart。其余中相关论文适合按具体技术栈取用，不必为了追数量逐篇通读。

**最大不确定性**来自论文密度本身：同一天大量方法都声称超过强 baseline，但训练数据、judge、inference budget 与模型版本并不统一，横向涨点没有可比性。今天更可靠的结论不是“哪个算法赢了”，而是三个方向性判断：真实环境约束必须进入 agent benchmark；长时执行必须有可检查的状态与恢复语义；post-training 的反馈必须说明它在何种粒度、通过什么因果路径改变行为。
