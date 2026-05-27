---
title: "arXiv 每日速递 2026-05-28"
date: "2026-05-28"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-28

## 今日总结

今天这批论文里有一条非常清晰的暗线：**当 LLM/agent 已经"能跑"之后，真正稀缺的不是能力，而是预算**——API token、推理算力、标注、参数，每一份都得问"这一块钱到底买到了多少边际产出"。EviACT 用 execution evidence 当 guardrail，在程序修复上把 resolve rate 提了 1.6–6.0pp 的同时把单 bug 的 API 成本砍掉 70–88%；SIA 干脆把"改 harness"和"改权重"两个自我改进杠杆拆开，逐一量化各自的贡献；EdgeFlow 证明一张**零成本、零训练**的 Canny edge map 当结构先验，比微调 VLM 更划算；MobileMoE 则在手机的内存/算力约束下，把 MoE 的稀疏度甜点直接拟合成一条 on-device scaling law。四篇看似无关，骨子里都在做同一件事：**边际价值的精确归因**——这正是我们一直在做的主线。值得花一个下午细读。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [EviACT](http://arxiv.org/abs/2605.27238) | agentic program repair | 三道 evidence-driven guardrail，resolve rate +1.6–6.0pp，API 成本 −70–88% | ⭐⭐⭐ |
| [SIA](http://arxiv.org/abs/2605.27276) | self-improving agent | 把 harness-update 与 weight-update 两个杠杆拆开量化边际贡献 | ⭐⭐⭐ |
| [EdgeFlow](http://arxiv.org/abs/2605.27332) | VLM × RE / SE | 训练免费的 Canny edge map 当结构先验，flowchart→Mermaid 的 F1 +17pp；并坦白跨数据集失效 | ⭐⭐⭐ |
| [MobileMoE](http://arxiv.org/abs/2605.27358) | on-device small LLM | sub-billion 激活的端侧 MoE scaling law，2–4× 更少 FLOPs 匹配 dense | ⭐⭐ |
| [PIPO](http://arxiv.org/abs/2605.27255)（仅列） | efficient inference | 把 latent 压缩与 MTP 视为镜像操作，统一输入/输出侧加速 | ⭐⭐ |

## 今日主题：LLM 已经 work 之后，钱该花在哪个动作上？

我们实验室的研究哲学里有一条核心信念：**当 LLM 已经能解决问题时，真正有价值的研究不是再造一个"更强的框架"，而是精确地测出每个设计动作的边际贡献**——常常会得到反直觉的结论（比如我们之前发现 test execution 在某个 agent pipeline 里只贡献了 1.25pp）。今天这四篇论文，从四个完全不同的应用切面，不约而同地撞上了这条思路。

最直白的是 **SIA**：自我改进有两条历来被割裂的技术路线，一条改 harness（重写 agent 的工具、prompt、重试逻辑），一条改 weights（test-time training 更新模型参数）。SIA 没有发明新框架，而是把两个杠杆放进同一个 loop，做了一张关键的对照图——Baseline、只改 harness、改 harness+权重，三个 operating point 一目了然。这就是教科书式的边际价值消融。**EviACT** 则在程序修复里做了同样的事：它把"修复"拆成 retrieval scaffold / compile gate / test-driven gate 三道闸门，再用 ablation 告诉你哪道闸门省了 token、哪道闸门提了 resolve rate。这两篇都在回答"agent 的哪个设计动作真的有用"。

另一条暗线是**约束下的资源分配**。**EdgeFlow** 的洞察是：与其花标注和算力去微调 VLM，不如花 0 成本跑一遍 Canny 边缘检测，把拓扑结构"画"给模型看——这是典型的"用确定性静态信号替代昂贵的模型适配"，和我们"static analysis 做定位、LLM 只负责难的部分"的职责切分哲学完全同构。**MobileMoE** 则把约束推到极致：在手机内存和算力的硬墙内，哪种稀疏度、专家粒度是 compute-optimal？它给出的不是一个模型，而是一条 scaling law。

把四篇连起来看，2026 年这个时间点上，"做一个能跑的 LLM 系统"已经不再是论文的卖点了；**卖点变成了"我能告诉你这个系统里每一份预算的边际回报曲线长什么样"**。这对我们选题是个强信号：我们手里的 agent trace 大规模事后分析、marginal value 量化方法论，正好踩在这个浪尖上。

---

### EviACT: An Evidence-to-Action Framework for Agentic Program Repair

> **推荐理由**：这就是我们 Program Repair 主线的正面命中——agentic APR + 职责切分 + 成本量化，而且它的核心卖点"用 execution evidence 当 guardrail 省 70–88% API 成本"几乎是为我们"agent 边际价值 / cost reduction"方向量身定做的对照实验。

📌 **论文信息**：Qianru Meng, Xiao Zhang, Zhaochun Ren, Joost Visser | [arXiv:2605.27238](http://arxiv.org/abs/2605.27238) | cs.SE

![Figure：EviACT 的四阶段流水线 Setup→Localize→Patch→Verify，通过 retrieval scaffold、compile gate、test-driven gate 把 execution evidence 转化为修复决策](https://arxiv.org/html/2605.27238v1/x2.png)

#### TL;DR
把 execution evidence（编译结果、测试结果）做成三道贯穿定位/生成/验证的"闸门"，让 agentic APR 在 resolve rate 提升 1.6–6.0pp 的同时，把每个 bug 的 API 成本砍掉 70–88%。

#### 问题是什么？
LLM agent 已经把自动程序修复（APR）从"给定上下文生成补丁"推进到了"在整个仓库里交互式地修"。但这里有个尴尬的现实：**agent 手里明明握着大量 execution evidence（编译报错、测试失败的 stack trace），却没有系统地用它来约束自己的行为**。结果就是论文 Figure 1 画的那几种典型病：定位错了之后一路 mislocalization cascade（E1→E2→E3 越错越远）、反复生成编译都过不了的无效补丁、以及为了验证一个补丁把整套回归测试跑到底带来的高昂成本。换句话说，agent 不是不够聪明，而是**在该停下来看证据的地方没停**，于是把预算烧在了注定失败的尝试上。

#### 他们怎么做的？

**核心 Insight**：不要让 LLM "凭感觉"在仓库里漫游，而是在修复流水线的每个关键节点插一道"证据闸门"——只有通过证据检验的动作才允许往下走。

具体方法（对应 Figure 2 的四阶段流水线 Setup → Localize → Patch → Verify）：
1. **Retrieval scaffold（接地修复上下文）**：在定位阶段用检索把修复上下文"锚定"在真正相关的代码区域，抑制那种一步错步步错的 mislocalization cascade。
2. **Compile gate（过滤无效编辑）**：在补丁生成后、昂贵验证前，先用编译这个**便宜且确定**的信号把语法/类型层面就崩的补丁挡掉，不让它们浪费后续预算。
3. **Test-driven gate（先验目标测试再全量回归）**：先检查"导致 bug 的那个 target test 是否恢复"，只有恢复了才进入开销大的全量回归测试。这是典型的"廉价信号先行、昂贵信号后置"的分级验证。

**跟之前方法的本质区别**：之前的 agentic APR 把 execution evidence 当成"事后偶尔看一眼"的参考；EviACT 把它升级成**贯穿三个阶段的强制 guardrail**——证据不只是信息，而是控制流。这和我们一贯主张的"静态/执行信号驱动迭代修复、LLM 只负责它最擅长的那一步"职责切分哲学是同一个思路。

#### 关键结果

| 维度 | 结果 | 说明 |
|------|------|------|
| Resolve rate（4 个 benchmark） | **+1.6 ~ +6.0 pp** | 相对各 benchmark 上最强可比 baseline |
| 单 bug API 成本 | **−70.1% ~ −88.6%** | 在有 baseline 成本可比处 |
| 评估范围 | 4 个 benchmark（含 Defects4J 2.0） | 跨 LLM 对比 |

**结果解读**：最值得玩味的不是 resolve rate 那 1.6–6.0pp（说实话提升幅度算温和），而是**成本曲线**——70–88% 的 API 成本下降是数量级级别的。这强烈暗示：现有 agentic APR 的绝大部分开销，其实是花在了"本可以用编译/测试这种廉价信号提前掐死"的无效尝试上。论文的 ablation（Figure 4）正是冲着这个去的：它分别报告了去掉每道闸门后 resolve rate、token 用量、runtime 的变化，以及各阶段的 tool-call 分布——这恰恰是边际价值归因该有的做法。换句话说，EviACT 真正的贡献是**证明了"省钱"和"修对"可以不矛盾**，关键在于把证据放在正确的位置当闸门。

#### 局限性与开放问题

- **局限 1（benchmark 偏旧）**：明确用到了 Defects4J 2.0 这类经典 Java benchmark。这类数据集存在已知的 data leakage / 记忆风险，且 bug 形态偏"教科书化"，70–88% 的成本节省在更脏的真实仓库（依赖复杂、测试套件巨大、flaky test 多）上能否保持是问号。
- **局限 2（compile/test gate 的前提）**：两道核心闸门都依赖"项目能快速编译、target test 能快速定位并运行"。在编译耗时数分钟、或测试本身 flaky 的工业仓库里，闸门本身可能变成新的成本瓶颈——这一点 abstract 没有正面回应。
- **开放问题**：它解决了"如何用证据约束 agent 的动作"，但没回答"当证据本身有噪声（flaky test、误报编译错误）时，闸门会不会反而把正确补丁误杀"。证据的可靠性建模是下一步。

#### 💡 对我们的启发

1. **直接可用的技术点**：EviACT 的"分级验证闸门"思路可以直接搬到我们的 whole-repository compatibility repair（Python 版本演化 / dependency API 演化）项目里。我们现在的迭代修复也是静态信号驱动的，但还没把"compile gate 在前、target-test gate 居中、全量回归在后"这套分级显式化。把验证开销按"信号成本"排序后置，理论上能复现类似的成本曲线。
2. **具体实验想法（1–2 周可验证）**：拿我们已有的 compatibility repair trace，做一个**纯成本归因消融**——把每次 LLM 调用按它发生在"定位/生成/验证"哪个阶段、以及该调用前是否有 compile/test 证据可用，做一张分布图。预期观察：相当比例的 token 花在了"没有证据支撑就直接让 LLM 重试"的环节。如果成立，就直接复刻 EviACT 的 gate 结构看成本下降幅度。这是一个不需要重跑大规模 agent、只靠事后 trace 分析就能出结论的实验，完全符合我们"事后分析而非端到端重跑"的方法论。
3. **研究趋势判断**：APR 的竞争焦点正在从"resolve rate 谁高"转向"单位成本的 resolve rate"。我们如果要在这个方向出 benchmark/guideline，**"成本-修复率 Pareto 前沿"会比单纯的 resolve@k 更有引用价值**。

---

### SIA: Self Improving AI with Harness & Weight Updates

> **推荐理由**：这篇是"边际价值量化"哲学的活样本——它没有炫框架，而是把自我改进的两个杠杆（改 harness vs 改权重）拆开做对照消融，正好是我们最爱的那种"逐个设计动作量化贡献"的研究范式。

📌 **论文信息**：Prannay Hebbar, Yogendra Manawat, Samuel Verboomen, Alesia Ivanova, Selvam Palanimalai | [arXiv:2605.27276](http://arxiv.org/abs/2605.27276) | cs.AI

![Figure：SIA 在三个任务上的三个 operating point 对比——Baseline、SIA-H（仅改 harness）、SIA-W+H（harness+权重）](https://arxiv.org/html/2605.27276v1/x1.png)

#### TL;DR
自我改进有两条历来割裂的路线——改 harness（scaffold）和改 weights（test-time training）。SIA 把两个杠杆放进同一个 loop，并用三个对照点证明：**两个杠杆叠加 > 单改 scaffold**，且二者作用机制互补。

#### 问题是什么？
"AI 自我改进"领域长期分成两个互不来往的阵营。**Harness-update 派**：让一个 meta-agent 去重写任务 agent 的脚手架（工具、prompt、重试逻辑、搜索过程），但模型权重冻结。**Test-time training 派**：用手写的 RL pipeline 在任务反馈上更新模型权重，但 harness 冻结。问题在于：这两派各说各话，**从来没人在同一套实验里问过"这两个杠杆各自贡献多少、叠加起来是协同还是冗余"**。如果不拆开测，你永远不知道你观察到的提升到底来自"更聪明的脚手架"还是"更懂行的权重"。

#### 他们怎么做的？

**核心 Insight**：让一个 Feedback-Agent 同时拥有两个杠杆——既能改任务 agent 的 harness，也能改它的 weights——然后通过对照 operating point 把两者的边际贡献分离出来。

具体做法：
1. **统一 loop**：构造一个 self-improving 循环，Feedback-Agent 读取任务反馈后，既可以重写 scaffold，也可以触发权重更新。
2. **三个对照点**：Baseline（首代、无 SIA）、SIA-H（只改 harness）、SIA-W+H（harness + 权重），这就是 Figure 1 的核心设计——一张图把消融讲清楚。
3. **三个差异极大的域**：中文法律罪名分类（LawBench）、底层 GPU kernel 优化（TriMul CUDA）、单细胞 RNA 去噪（scRNA-seq）。故意选差异巨大的任务来检验结论的普适性。

**跟之前方法的本质区别**：之前的工作要么只动 harness、要么只动 weights，SIA 的贡献不是"两个都做所以更强"这种废话，而是**用对照实验给出了机制性解释**——论文的说法是"harness updates 让模型变得 agentic、塑造它如何搜索和行动，而 weight updates 建立的是 prompt 和 scaffold 都灌输不进去的领域直觉"。这是一个可证伪、有信息量的论断。

#### 关键结果

| 任务 | 指标 | SIA-W+H 相对初始 baseline 提升 |
|------|------|------|
| LawBench（中文法律罪名分类） | Top-1 accuracy | **+56.6%** |
| TriMul CUDA（GPU kernel 优化） | runtime reduction | **−91.9%**（运行时） |
| scRNA-seq 去噪 | mse_norm | **+502%**（相对改善） |

**结果解读**：三个数字本身很唬人，但对我们更有价值的是 Figure 1 里 **SIA-H 与 SIA-W+H 之间的那段 gap**——这才是"权重更新"这个杠杆的纯边际贡献。abstract 明说"combining both levers outperforms scaffold iteration alone on all three"，意味着在这三个任务上，光改 harness 是不够的，权重那一刀确实切出了额外价值。但要注意：三个任务的提升幅度差异巨大（502% vs 56.6%），这本身就是一条重要信息——**杠杆的边际价值高度依赖任务性质**，越是需要"领域直觉"（如 RNA 去噪）的任务，权重更新的边际贡献越大；越是靠"会搜索、会用工具"的任务，harness 的贡献占比越高。

#### 局限性与开放问题

- **局限 1（只有 3 个任务、每个任务一个点）**：三个域虽然差异大，但每个域基本只有一两个 benchmark，样本量小到无法做统计显著性检验。502% 这种数字很可能对初始 baseline 的选取极度敏感（baseline 越弱，相对提升越夸张）。
- **局限 2（成本被回避了）**：weight update 需要 RL pipeline 和算力，harness update 需要大量 meta-agent 的 LLM 调用。论文报告了性能提升，但**没有报告"每单位提升花了多少钱"**——而这恰恰是判断两个杠杆性价比的关键。对我们这种资源受限的研究者，"哪个杠杆 per-dollar 回报高"比"叠加起来更强"重要得多。
- **开放问题**：它证明了两个杠杆互补，但没回答"在固定预算下，该把钱按什么比例分给 harness 和 weights"。这是一个漂亮的后续课题。

#### 💡 对我们的启发

1. **直接可用的方法论**：SIA 的三 operating point 对照（Baseline / 单杠杆 / 双杠杆）就是我们做 agent 边际价值分析的标准模板。我们在分析 SWE-bench / OpenHands trace 时，完全可以套用——把某个设计动作（如 structure injection、tangled patch splitting）当作"杠杆"，构造"无该动作 / 仅该动作 / 该动作+另一动作"的对照点。
2. **具体实验想法（1–2 周）**：在我们已有的公开 agent trace 上，挑两个常被认为"互补"的设计动作（比如 test execution feedback 和 repository structure injection），用 SIA 式的 2×2 对照（有/无各自）做一个 marginal value 矩阵，再叠加 McNemar 检验看交互项是否显著。预期观察：很可能像 SIA 一样发现"叠加 > 单个"，但**交互项未必显著**——如果不显著，那就是一条比 SIA 更严谨的发现（SIA 缺的正是这个统计检验）。
3. **研究趋势判断**：self-improving agent 这个热词在 2026 年很可能会被"杠杆归因"重新框定。谁能率先给出"在固定预算下各杠杆的边际回报曲线 + 统计检验"，谁就能在这个拥挤赛道里立住方法论的旗。这正是我们的统计严谨性（TOST / Gwet AC1）能差异化的地方。

---

### EdgeFlow: Edge-Map Augmented VLM-Based Flowchart Processing for Industrial Requirements Engineering

> **推荐理由**：cs.SE 正面命中，而且它的内核是我们最认同的那种哲学——**用一个零成本、确定性的静态信号（Canny edge map）替代昂贵的模型微调**，去补 LLM/VLM 最弱的拓扑感知。更难得的是它诚实地报告了跨数据集失效，顺手批判了 benchmark 多样性问题。

📌 **论文信息**：Zhifei Dou, Shabnam Hassani, Ou Wei | [arXiv:2605.27332](http://arxiv.org/abs/2605.27332) | cs.SE / cs.AI / cs.CV

![Figure：FlowVQA 的 Canny edge map——边缘图把那条长长的 loop-back 连接线单独凸显出来，给 VLM 一个识别循环拓扑的强几何线索](https://arxiv.org/html/2605.27332v1/Figs/c3_canny.png)

#### TL;DR
直接把工业流程图丢给 VLM 转成 Mermaid，模型经常在"拓扑关键的视觉细节"（比如那条绕回去的反向边）上翻车。EdgeFlow 在输入里加一张**确定性提取的 Canny 边缘图**当结构先验，不训练、不标注，就把 node/edge F1 各提 ~17pp。

#### 问题是什么？
工业需求文档里全是流程图，但它们通常以**静态图片**的形式嵌在文档里，机器读不了。把流程图转成机器可读的模型（如 Mermaid），是需求工程（RE）自动化的关键一步。VLM 看起来很适合干这个，但直接上手时有个顽疾：**它们在"拓扑关键"的细节上会失败**。论文 Figure 1 的例子很典型——一张流程图里有一条很长的 loop-back 连接线（从 G 绕回 C 形成循环），VLM 在原图上经常直接漏掉这条反向边，于是生成的 Mermaid 拓扑就错了。本质问题是：VLM 的视觉编码偏向语义和纹理，对"细长、低对比、跨越大半张图的连接线"这种**几何拓扑信号**不敏感。

#### 他们怎么做的？

**核心 Insight**：与其花标注数据去微调 VLM 让它"学会看连接线"，不如先用一个确定性算法把连接线"画出来"喂给它——结构先验比模型适配更便宜也更可靠。

具体流程（对应论文的四步 pipeline）：
1. **图像预处理**：标准化输入流程图。
2. **Canny 边缘检测**：用经典的 Canny 算子提取边缘图，把流程图的"结构骨架"（尤其是那些容易被忽略的细长连接线）单独凸显出来——见配图，loop-back 连接线在边缘图里变得无比清晰。
3. **Mermaid 代码生成**：把原图 + 边缘图一起喂给 VLM，边缘图作为 structural prior 引导模型识别拓扑。
4. **语法校验**：对生成的 Mermaid 做语法验证，保证输出可用。

**跟之前方法的本质区别**：off-the-shelf VLM 是"单一模态输入、靠模型自己脑补拓扑"；微调方案是"花标注让模型记住拓扑"。EdgeFlow 是第三条路——**training-free、无需领域微调**，用一个零成本的确定性预处理把模型最弱的那块能力外包给经典 CV 算法。这跟我们"static analysis 做定位、LLM 做难的部分"的职责切分是同一套世界观。

#### 关键结果

| 指标（IndusReqFlow 真实工业数据集） | 相对 off-the-shelf VLM 提升 |
|------|------|
| Node-level F1 | **+17.39 pp** |
| Edge-level F1 | **+16.94 pp** |
| Path-level F1 | **+11.06 pp** |
| 公开合成 benchmark（跨数据集） | **无显著提升** |

**结果解读**：在真实工业数据集 IndusReqFlow 上，三个层级的 F1 都是两位数 pp 的提升，node 和 edge 提升尤其大（~17pp），说明边缘图确实补上了 VLM 在"节点识别"和"连接关系识别"上的短板。但**最诚实、也最有价值的一行是最后一行**：在公开的合成 benchmark 上，EdgeFlow 没有显著提升。论文自己点破了原因——合成流程图太"干净"，连接线清晰规整，VLM 本来就能看清，边缘图自然加不了戏。换句话说，**EdgeFlow 的增益专门来自真实工业图的"脏"**（手绘感、低对比、复杂走线）。这条负结果不是败笔，恰恰是它最有方法论价值的发现：它顺手论证了"合成 benchmark 会系统性低估这类结构增强方法的价值"。

#### 局限性与开放问题

- **局限 1（增益依赖输入"脏度"）**：方法的价值高度依赖流程图本身的视觉复杂度。在干净图上无效，意味着它的适用边界其实很窄——只有"图够脏、VLM 够蒙"时才有用。
- **局限 2（Canny 的脆弱性）**：Canny 边缘检测对参数（阈值）和图像质量极敏感。压缩噪声、背景网格、彩色填充都可能让边缘图本身变成噪声源，反而误导 VLM。论文没有充分讨论 Canny 失效时会不会损害性能。
- **开放问题**：它解决了"如何让 VLM 看见拓扑"，但 Canny 只是众多可能的结构先验之一。更结构化的先验（如先跑一个轻量的连通域/箭头检测器输出符号化的边列表）会不会比像素级边缘图更好？这是一个开放方向。

#### 💡 对我们的启发

1. **直接可迁移的范式**：EdgeFlow"确定性预处理 → 喂给 LLM/VLM 当先验 → 语法校验输出"的三段式，几乎可以原样套到我们的 ArkUI / ArkTS 工具链上。比如 ArkUI 渲染性能分析里，我们也面临"LLM 看不清结构信息"的问题——完全可以先用静态分析把组件树/渲染依赖图"画"成结构化先验，再喂给模型。这跟 HomeCheck 的静态信号驱动是天然契合的。
2. **具体实验想法（1–2 周）**：在 Android→HarmonyOS 迁移项目里，我们经常要让 LLM 理解原始 Android 布局 XML 的视觉/层级结构。可以做个小实验：对比"纯 XML 文本输入"vs"XML + 渲染后的截图 + 控件 bounding box 叠加图"两种输入，看后者在布局迁移正确率上是否有类似 EdgeFlow 的两位数提升。预期观察：复杂嵌套布局上提升明显，简单布局上无差异——和 EdgeFlow 的"脏度依赖"现象呼应。
3. **研究趋势 + benchmark 启示**：EdgeFlow 那条"合成 benchmark 低估真实增益"的负结果，直接呼应我们关心的"真实 vs 合成 benchmark 偏差"主线。**这是一个可以独立成文的方法论观察**——我们可以系统性地在多个 SE 任务上验证"结构增强方法在合成数据上被低估"这一假设，产出一份 benchmark 选择指南。

---

### MobileMoE: Scaling On-Device Mixture of Experts

> **推荐理由**：对应我们"小模型 / 本地推理"主线。它把"端侧到底该用多稀疏的 MoE"这个工程直觉，拟合成了一条可外推的 on-device scaling law——这种"把约束下的甜点形式化"的做法，正是我们想在代码小模型上复刻的。

📌 **论文信息**：Yanbei Chen, Hanxian Huang, Ernie Chang, Jacob Szwejbka, Digant Desai | [arXiv:2605.27358](http://arxiv.org/abs/2605.27358) | cs.LG / cs.CL

![Figure：MobileMoE 在端侧 LLM 上建立的新 Pareto 前沿——14 个 benchmark 平均精度 vs (a) 单 token 推理算力 / (b) 总参数量](https://arxiv.org/html/2605.27358v1/x1.png)

#### TL;DR
MoE 在百亿级模型上已是标配，但在手机要求的 sub-billion 激活规模下几乎没人系统研究过。MobileMoE 拟合了一条**端侧 MoE scaling law**，找到"中等稀疏 + 细粒度 + 共享专家"的甜点，用 2–4× 更少的推理 FLOPs 匹配甚至超过 dense 端侧模型。

#### 问题是什么？
MoE（Mixture-of-Experts）靠"激活一小部分专家"在大模型上实现了"总参数大、推理便宜"的双赢，是百亿级模型的事实标准架构。但有个被忽视的盲区：**在 sub-billion 激活参数这个"手机能跑"的尺度上，MoE 还划不划算？** 端侧的约束跟云端完全不同——你被手机的内存（装不下太大的总参数）和算力（每 token FLOPs 有硬上限）双重夹击。在这种约束下，到底该用几个专家、每个专家多大、要不要共享专家，全凭工程师拍脑袋。没有一条"端侧版"的 scaling law 来指导。

#### 他们怎么做的？

**核心 Insight**：把端侧的内存和算力约束**显式写进 scaling law 的优化目标**，反解出在这两个约束下同时 memory-optimal 和 compute-optimal 的架构甜点。

具体做法：
1. **拟合 on-device scaling law**：在 MoE 架构的三个设计因子上做系统扫描——模型稀疏度（专家数 E、top-k 路由）、专家粒度 g、是否有共享专家——并把手机的内存/算力约束作为优化条件。结论是一个甜点：**中等稀疏 + 细粒度专家 + 共享专家**，同时在内存和算力上最优。
2. **四阶段训练 recipe**：pre-training → mid-training → instruction fine-tuning → quantization-aware training（QAT），全程只用开源数据。QAT 是端侧落地的关键——保证量化后精度不崩。
3. **真机部署 profiling**：在商用智能手机上做了首个高效 MoE 推理的端到端 profiling，而不是只在 GPU 上估个 FLOPs 就收工。

**跟之前方法的本质区别**：之前的端侧模型几乎都是 dense 的（MobileLLM 系列），MoE 研究又都在云端尺度。MobileMoE 第一次把 MoE 的"省算力"红利**在手机的真实约束下做了形式化**，并用真机数字证明红利是真的能落地的（不是只在理论 FLOPs 上好看）。

#### 关键结果

| 对比项 | MobileMoE 表现 |
|--------|----------------|
| vs 领先 dense 端侧 LLM（14 个 benchmark） | 匹配或超过，**推理 FLOPs 少 2–4×** |
| vs SOTA MoE OLMoE-1B-7B | 匹配或超过，**参数最多少 60%** |
| vs dense baseline MobileLLM-Pro（同 INT4 内存） | prefill **快 1.8–3.8×**，decode **快 2.2–3.4×** |
| 规模 | 0.3–0.9B 激活 / 1.3–5.3B 总参数 |

**结果解读**：最硬的证据是最后一行——在**同等 INT4 权重内存**下，MobileMoE 比 dense baseline 真机 prefill 快 1.8–3.8×、decode 快 2.2–3.4×。这说明 MoE 的"激活稀疏"红利在手机上不是纸面数字，而是能转化成实打实的延迟下降。相比那些只报 FLOPs 的论文，这一点的可信度高得多。需要注意的是：2–4× FLOPs 节省 vs dense，听起来很大，但 MoE 的代价是**总参数（=内存占用）更大**——所以它的甜点本质是"用内存换算力"，在内存极度受限的低端机上未必划算。

#### 局限性与开放问题

- **局限 1（内存换算力的隐性代价）**：MoE 的总参数比同等激活的 dense 大几倍（1.3–5.3B 总参 vs 0.3–0.9B 激活）。在高端机上内存富裕、这笔交易划算；但低端设备内存紧张时，"装不下"可能直接否决这条路线。abstract 用 INT4 量化缓解了这一点，但极端约束下的边界没讲透。
- **局限 2（非代码任务）**：14 个 benchmark 覆盖 commonsense / knowledge / science / reasoning，但**没有代码任务**。MoE 的专家分工在代码这种高度结构化、长程依赖强的任务上是否同样有效，是个未验证的问号——而这恰恰是我们最关心的。
- **开放问题**：scaling law 是在通用语料上拟合的。代码语料的 token 分布、专家激活模式可能完全不同，端侧 code-MoE 的甜点未必落在同一个位置。

#### 💡 对我们的启发

1. **直接可借鉴的思路**：MobileMoE"把硬件约束写进 scaling law 反解架构甜点"的方法论，可以迁移到我们关心的"7B–14B 代码模型能否替代商业 API"问题上。我们一直在问"预处理 + 静态分析能把问题压到多小的模型能解"——这其实就是在找一个"任务难度 × 模型规模"的甜点，完全可以用类似的约束优化框架来形式化。
2. **具体实验想法（1–2 周）**：选一个我们熟悉的代码任务（如 fault localization 或 fill-in-the-middle 补全），在 dense 小模型（DeepSeek-Coder / Qwen-Coder 1.5B–7B）和一个开源 code-MoE（如 OLMoE 级别）之间，**在固定激活 FLOPs 预算下**对比真实 pass@1 和真机/单卡推理延迟。预期观察：验证 MoE 的"省算力"红利在代码任务上是否同样成立——如果成立，对"本地小模型替代 API"是个强论据；如果不成立，那本身就是一个有意思的"代码任务 MoE 失灵"发现。
3. **研究趋势判断**：端侧 LLM 正在从 dense 转向 MoE，但代码这块是空白。**"端侧 code-MoE 的 scaling law"是一个几乎无人占的高价值选题**，而且天然契合我们对 local inference + 小模型代码能力的双重兴趣。

---

## 方法对比

EviACT 与 SIA 都在做"agent 设计动作的边际价值消融"，但切面不同；EdgeFlow 与 MobileMoE 都在"约束下榨取资源效率"，对照来看更有意思：

| 维度 | EviACT | SIA | EdgeFlow | MobileMoE |
|------|--------|-----|----------|-----------|
| 核心方法 | 三道 execution-evidence guardrail | harness + weight 双杠杆 self-improving loop | Canny edge map 当结构先验 | 端侧 MoE scaling law + 4 阶段 recipe |
| "省"在哪 | API token（−70–88%） | 不省（追求性能上限） | 标注 + 训练（training-free） | 推理算力 FLOPs（−2–4×） |
| 数据/训练需求 | 无需训练，靠执行证据 | 需 RL pipeline 改权重 | **零训练、零标注** | 大规模预训练 + QAT |
| 边际价值是否显式拆解 | 是（阶段级 ablation） | **是（核心卖点）** | 部分（跨数据集对照） | 是（按设计因子扫描） |
| 主要局限 | benchmark 偏旧、依赖快编译/测试 | 任务数少、回避成本 | 增益依赖输入"脏度" | 内存换算力、无代码任务 |
| 与我们主线契合点 | Program repair / cost 量化 | agent marginal value 方法论 | 静态信号职责切分 / benchmark 偏差 | 小模型 / local inference |

**一句话总结今天**：四篇论文从修复、自改进、需求工程、端侧推理四个完全不同的战场，殊途同归地指向了同一个 2026 年的研究主旋律——**当能力不再稀缺，把"每一份预算的边际产出"测准、归因清楚，就是最有价值的研究**。这正是我们手里那套 agent trace 事后分析 + 统计严谨性方法论该乘的风。
