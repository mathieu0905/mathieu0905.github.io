---
title: "可靠性不是最后一个分数：7 月 31 日 arXiv 的生命周期证据、记忆事务与 Post-Training 信号"
date: "2026-08-03"
description: "7 月 31 日的论文把 agent 可靠性推进到运行时证据、版本化记忆和真实工业 harness，也把 post-training 的焦点转向数据组织、信用分配与 reward model 本身的可信度。"
tags: ["论文解读", "arXiv", "Coding Agent", "软件工程", "Agent可靠性", "Agent安全", "Post-Training", "RLHF", "强化学习", "GRPO", "Reward Model"]
series: "alphaXiv论文解读"
category: "arxiv"
coverColor: "from-slate-950 via-cyan-950 to-amber-900"
---

2026 年 7 月 31 日的 arXiv 新论文很密集，但真正值得读的变化可以压缩成一句话：**系统不再满足于证明 agent 最后答对了，而开始要求它在执行前、执行中、执行后留下可定位、可回滚、可复核的证据。** coding-agent 一侧出现了真实数据工程、生产 oncall、遗留迁移、合并冲突和 benchmark 污染检查；post-training 一侧则从“再换一个 RL 缩写”转向数据如何编排、token 如何分配信用、教师风格如何污染蒸馏，以及 reward model 本身是否值得信任。更重要的是，这批论文里有不少负结果：量化后的总分可能掩盖错误激增，自我反思在等 token 预算下可能输给重复采样，强 judge 在困难轨迹上也远未达到可放心训练的水平。

本轮逐项核对 cs.SE、cs.PL、cs.AI、cs.CL、cs.LG，并补充 cs.IR、cs.CV、cs.CR、cs.OS 的官方新论文页，合并得到 **473 个当日新列或交叉列入条目**。最终纳入 **75 篇实质相关论文**：coding-agent / software-change 主线 40 篇，post-training 主线 42 篇，其中 7 篇同时属于两条线。21 篇强相关论文均从 `https://arxiv.org/pdf/<id>` 成功下载，验证文件头和大小后完成文本抽取及首页渲染检查；其余论文基于 arXiv 官方摘要与元数据筛选。

## 今日脉络

第一条脉络是 **可靠性开始按执行生命周期分层**。AgentS4D 不再把安全压成一个最终分数，而是追踪风险从哪里进入、如何诱导、造成什么伤害、证据出现在哪个 checkpoint；Trajectory Graph Copilot 在动作执行前诊断失败模式；HALO 在外部动作真正发出前重验依赖和时效。三篇论文共同否定了“任务完成即安全”的默认假设。

第二条脉络是 **长期状态需要数据库式语义，而不是更长的 prompt**。ChronoMem 引入版本、HEAD 和语义回滚，MemTxn 引入写入验证、冲突解析和完整状态恢复。它们处理的不是一般的检索命中率，而是更严格的问题：后来的错误已经进入上下文后，系统能否回到某个历史状态，并像从未见过未来信息那样行动。

第三条脉络是 **真实软件任务正在把 agent 从补丁生成器变成运维与演化系统**。DataClawEval 用五种生产数据引擎和确定性脚本测端到端数据工程；ORCA-bench 把六天遥测、日志、trace、源码和模糊事故报告放进同一环境；Locksmith Loop 用 COBOL 与 Java 的双运行时确定性对照验证迁移。现实难度来自环境、状态和证据链，而不只是 diff 的长度。

第四条脉络属于 post-training：**训练信号的组织方式比信号名字更重要**。SDO 调整样本在 epoch 内外的暴露结构，CSCR 反而削弱对结果最敏感 token 的信用，Lightning OPD 2.0 从跨教师差异中减去重复出现的风格残差。它们分别作用于 batch、token 和 teacher 三个层次，但都在追问同一件事：优化器看到的差异究竟是能力信息，还是噪声、风格或重复暴露。

第五条脉络是 **评测与 reward model 本身进入被评测对象**。ClawTrack 用 12,541 条任务特定 rubric 审计过程，PAIChecker发现 SWE-bench Verified 中 13.6% 的 PR–issue 对存在错位，OSReward 则显示最强 computer-use judge 的准确率也只有 89.7%，到了 hard set 更跌到 69.7%。如果 oracle 不可靠，训练和排行榜都会把错误放大。

## 强相关论文深读

### 1. OwlPath：把仓库结构压成可查询知识，而不是把更多代码塞进上下文

**论文信息**：*OwlPath: Lossless Knowledge Compression for LLM Bug Repair*；Bo Zhang、Ren Pan、Huan Chen、Xiang Song；[arXiv:2607.27249](https://arxiv.org/abs/2607.27249)；cs.SE；列入 2026-07-31 官方列表。

**一句话 TL;DR**：OwlPath 把 tree-sitter 抽取的多语言代码结构编码为 OWL2 本体，用属性路径一次性恢复跨文件、多跳调用与接口实现关系，并以约 3KB 的知识地图把 agent 的第一次查询引到正确模块。

**为什么值得推荐**：仓库级 bug repair 的瓶颈经常不是模型不会写 patch，而是 100K token 预算里混入了大量无关代码，真正的 subclass、transitive caller 和 interface implementation 仍要靠试错发现。论文把“检索”重写成具有闭包语义的程序结构查询，这比增加 top-k 或换 embedding 更接近问题本质。

**方法怎么工作**：第一步，tree-sitter 将 Python、JavaScript、TypeScript、Go 等语言的符号与关系编码到统一 OWL2 模型；第二步，SPARQL property path 计算传递闭包，单次查询返回多跳关联符号；第三步，OWL-SKM 预计算模块树、核心 API 和 issue 相关符号，先给 agent 一个紧凑导航，再按需展开原始代码。Figure 1 展示本体层、知识地图与 agent CLI 的衔接。

**关键实验与证据**：在 18 个 SWE-bench Pro 实例上，strict-apply 为 68.4%，与 CodeGraph 的 66.7% 接近，但 token 减少 28.8%、运行时间减少 39.5%。67 个离线检索实例中 recall 从 0.226 升至 0.464，hit rate 从 59.7% 升至 88.1%；37 个结构问答里 recall 从 4.4% 升至 28.8%。

**局限和可信度**：18 个端到端实例太少，strict-apply 也不是完整测试正确性；动态调用、反射、生成代码和构建系统语义仍可能逃过静态本体。可信之处在于离线结构问答、端到端 agent 成本和 patch 应用三个层面给出一致方向，而不是只展示一个漂亮案例。

**与当天主题的关系**：它代表今日“把上下文变成结构化证据”的路线：可靠仓库理解来自可查询依赖，不来自无差别扩大窗口。

### 2. SDO：post-training 的下一块效率空间在 batch 组织

**论文信息**：*SDO: Structure-Aware Data Organization for Efficient LLM Post-Training*；Jinliang Gao、Ning Yang、Hai Wang、Baili Xiao、Pin Lyu；[arXiv:2607.27273](https://arxiv.org/abs/2607.27273)；cs.LG；列入 2026-07-31 官方列表。

**一句话 TL;DR**：SDO 不删除数据，也不预先固定课程，而是用外部 embedding 的局部结构组织每个 epoch 的 batch，再按累计暴露次数动态降低过度出现样本的采样概率。

**为什么值得推荐**：多数 post-training 效率工作关注“选哪些样本”或“何时训练”，却默认样本在 batch 中的共现结构无关紧要。本文指出，相邻表征形成更一致的梯度，而跨 epoch 暴露均衡避免少数簇反复主导更新；这是低侵入、可跨 SFT/DPO/GRPO 复用的系统变量。

**方法怎么工作**：第一步，用冻结的外部 embedding 建 ANN/KNN 邻接；第二步，epoch 内沿局部邻域遍历形成语义连贯 mini-batch；第三步，epoch 间维护每个样本的 exposure counter，降低高暴露样本概率但保证全体仍有非零覆盖。Theorem 1 把局部梯度一致性与方差下降联系起来，Figure 3 给出三种训练范式的收敛曲线。

**关键实验与证据**：GSM8K 的 GRPO 在 5k step 从 82.41% 升到 82.89%，更重要的是更早达到同等准确率；UltraFeedback 的 DPO reward margin 在 2k step 从 0.314 升至 0.358。3k step 的簇均值准确率由 77.02% 升至 79.72%，4k step 的 bottom-20% 从 50.71% 升至 55.11%。SFT 最终 loss 基本不变，说明收益主要是早中期效率而非更高终点。

**局限和可信度**：主结果使用单个代表性 seed，embedding 固定且只看 prompt，可能无法跟随策略表征变化；KNN 构建成本在超大数据上也需单独核算。论文坦率呈现 SFT 终点无提升，使“加速而非万能增益”的结论更可信。

**与当天主题的关系**：它把当天 post-training 主线落到样本层：有效信号不仅取决于数据内容，也取决于它们何时、和谁一起被模型看到。

### 3. AgentS4D：68% 的运行触发不安全信号，而且大多照样完成任务

**论文信息**：*AgentS4D: Benchmarking Runtime Risks across the Execution Lifecycle of LLM-Based Workspace Agents*；Jiajun Zhou、Zhaoxuan Ke、Jihang Ye、Xuanze Chen、Shanqing Yu、Qi Xuan；[arXiv:2607.27294](https://arxiv.org/abs/2607.27294)；cs.SE；列入 2026-07-31 官方列表。

**一句话 TL;DR**：AgentS4D 用风险入口、诱导策略、目标伤害和生命周期证据四个维度构造 328 个沙箱案例，证明同一 LLM 换 harness、同一风险换载体，安全表现都会显著改变。

**为什么值得推荐**：workspace agent 会读写文件、调用外部工具并保留状态，最终回答安全并不能说明中间没有越权、泄漏或破坏。本文把评估对象定义为“harness × model × risk carrier”的完整系统配置，避免把安全责任错误归因给单一基础模型。

**方法怎么工作**：第一步，从六类风险入口、六种诱导方式和九类伤害组合案例；第二步，在 Hermes、OpenClaw、Claude Code、Codex 四种 harness 与五个后端上执行；第三步，在七个生命周期 checkpoint 收集动作、副作用和状态变化；第四步，按风险载体和诱导方式切片，而非只报平均拒绝率。

**关键实验与证据**：20 个 agent 配置共运行 6,560 次，4,461 次（68.0%）触发预设不安全信号；4,344 次（66.22%）属于“不安全但完成”。这意味着绝大多数危险轨迹不会被 task completion 指标发现，同一伤害在不同载体上的结果也明显不同。

**局限和可信度**：风险注入是受控沙箱，不等价于真实攻击流量；unsafe signal 的严重度也不能完全由计数表示。优势是覆盖矩阵清晰、执行证据可定位，并把 harness 作为一等变量，结论对部署评估直接且可复核。

**与当天主题的关系**：它给“生命周期证据”提供了最完整的 benchmark 表达：可靠性必须覆盖动作与状态，而不只是终局。

### 4. Trajectory Graph Copilot：在动作执行前拦住会把轨迹带偏的选择

**论文信息**：*Leveraging Trajectory Graphs for Pre-Execution Error Diagnosis in Agentic LLM Systems*；Xu Zheng、Zhuomin Chen、Chaohao Lin、Hua Wei、Haifeng Chen、Wei Cheng、Dongsheng Luo；[arXiv:2607.27443](https://arxiv.org/abs/2607.27443)；cs.AI；列入 2026-07-31 官方列表。

**一句话 TL;DR**：该方法把历史轨迹压成概率图，用 GNN 识别常通向失败的动作序列，并在候选动作真正执行前发出诊断，让原 agent 有机会改判。

**为什么值得推荐**：长程任务中，错误的代价不是一个局部 token，而是消耗后续 step budget、污染状态并让恢复路径消失。常见反思发生在动作之后，已经付出了环境代价；本文把软件调试中的“从历史 log 找失败模式”前移到 pre-execution gate。

**方法怎么工作**：第一步，将成功和失败轨迹转成动作—状态转移图；第二步，用图神经网络学习局部序列与终局失败概率；第三步，对 agent 的候选动作做 sandbox 式预诊断；第四步，将警告反馈给原 agent 触发自我修正，不需要修改基础模型。Figure 1–2 对应图构建与干预闭环。

**关键实验与证据**：论文在四个 benchmark、三个 LLM agent 上报告平均 pass ratio 提升 14.69%，并通过动作级消融表明收益来自提前识别高风险序列，而不是简单增加一次语言反思。

**局限和可信度**：图只覆盖历史见过的动作模式，环境或策略分布变化时可能误报；GNN 警告也没有形式保证。实验跨 agent 与 benchmark 是优点，但仍需报告告警覆盖、漏报成本和图维护开销，才能判断大规模在线部署价值。

**与当天主题的关系**：它把验证从事后解释前移为执行前诊断，是当天 agent 可靠性从“修复错误”走向“避免不可逆错误”的代表。

### 5. Compliance2LoRA：用一个超网络生成任意政策子集的安全适配器

**论文信息**：*Compliance2LoRA: On-Demand Safety Alignment on Arbitrary Policy Subsets via Hypernetwork-Generated LoRA Adapters*；Pankayaraj Pathmanathan、Furong Huang；[arXiv:2607.27594](https://arxiv.org/abs/2607.27594)；cs.LG；列入 2026-07-31 官方列表。

**一句话 TL;DR**：Compliance2LoRA 把启用的安全政策子集作为输入，由超网络按需生成 LoRA 权重，在不维护 $2^n$ 个模型的情况下切换合规边界。

**为什么值得推荐**：个性化安全的真正难点不是再训练一个“更安全”模型，而是不同部署者可能需要不同政策组合。纯 in-context 方法增加每次推理的长上下文成本，逐组合微调又指数爆炸；本文将政策组合映射成 adapter 权重，提供了一种可组合的 post-training 接口。

**方法怎么工作**：第一步，把政策文本编码成 policy embedding，并构造部分/完整安全推理偏好；第二步，用 hypernetwork 将激活政策集合映射为 LoRA 参数；第三步，把生成 adapter 挂到冻结的 reasoning model；第四步，通过 attention mask 在测试时开启或关闭特定政策，并检查类别级行为是否随之变化。

**关键实验与证据**：在 DeepSeek-R1-Distill-Qwen 1.5B/7B 上，全部政策开启时 safety rate 分别达 0.901/0.976，优于 in-context 的 0.875/0.936。7B 平均输出 token 为 577.18，低于 deliberative alignment 的 633.25 和 in-context 的 2081.92；训练数据规模随政策数线性增长而非组合爆炸。

**局限和可信度**：实验主要围绕两个模型和两个安全数据集，政策之间的逻辑冲突、组合外泛化和恶意 policy embedding 尚未充分验证；个别类别关闭政策后仍保持拒绝，说明基础模型先验会限制可控性。论文的效率论证清楚，但“任意政策子集”仍应视为当前分类体系内的组合，而非开放世界承诺。

**与当天主题的关系**：它展示 post-training 如何从单一全局对齐走向可组合、按需加载的行为控制。

### 6. HALO：只保留仍被前提支持的动作，并在 dispatch 前重验

**论文信息**：*HALO: Heterogeneous Admission through Localized Obligations for Safe Agentic Execution*；Taewoo Park、Kyeonghyun Yoo、Kiseok Kim、Seunghyun Yoo、Hwangnam Kim；[arXiv:2607.27636](https://arxiv.org/abs/2607.27636)；cs.AI、cs.RO、cs.SE；列入 2026-07-31 官方列表。

**一句话 TL;DR**：HALO 将一个混合响应拆成 notice、request、handoff 和 action，为每个组件声明局部依赖，外部状态变化后只接纳仍有支持的子图，并对动作做最后一刻重验。

**为什么值得推荐**：整体拒绝会丢掉仍有价值的信息，逐组件独立判断又可能留下没有前提的动作。HALO 用 obligation graph 解决这个组合性问题，尤其适合路线、权限、资源状态在模型生成与执行之间会变化的系统。

**方法怎么工作**：第一步，响应组件携带类型与 prerequisite；第二步，admission 计算仍满足依赖的最大支持子集；第三步，每个 exact action 在 dispatch 前重新检查时效；第四步，失败动作只能由新生成候选替换，不能复用陈旧输出。协议测试覆盖部分接受、依赖传播、fresh recovery 和 stale action 阻断。

**关键实验与证据**：HALO 匹配 96/96 admission 预期并通过 20/20 协议测试；结构化 replay 保留 248/248 个仍受支持组件，其中 128/128 不受无关变化影响，而 whole-response 策略保留 0/248。十次 PX4/Gazebo 冷启动中，所有 stale route 被阻断，fresh recovery 全部完成。

**局限和可信度**：前提必须被正确声明，遗漏依赖时协议无法凭空发现；PX4 案例规模有限，尚未覆盖并发 dispatch 与部分失败。它的价值主要是清晰的运行时语义和非全有或全无的安全边界，而不是大规模学习结果。

**与当天主题的关系**：它把安全从“模型是否拒绝”变成“哪些组件在这一刻仍有执行资格”。

### 7. Java merge conflict：LLM 的优势来自覆盖，但结构正确性不能交给 judge

**论文信息**：*Can Large Language Models Resolve Real Java Merge Conflicts? An Evaluation with a Calibrated LLM-as-Judge*；Bowen Shen；[arXiv:2607.27674](https://arxiv.org/abs/2607.27674)；cs.SE；列入 2026-07-31 官方列表。

**一句话 TL;DR**：generate–parse–retry agent 在真实 Java 冲突上几乎不 abstain，并以约 55% 的保守下界匹配开发者解法，但必须用确定性解析与重复声明检查补足 LLM judge。

**为什么值得推荐**：merge resolution 同时暴露两个常被混淆的问题：能否总给候选，以及候选是否值得接受。传统工具准确但大量 abstain，LLM 覆盖高却难以自动判定。本文先用人工标签校准 judge，再把语义匹配与结构有效性拆开报告，评测设计比单纯 exact match 更扎实。

**方法怎么工作**：第一步，agent 只看冲突标记，用 Java parser 和 duplicate-declaration 检查迭代修复；第二步，G-Eval judge 比较候选与开发者最终解法；第三步，在 292 个有人类标签的样本上选阈值，保证零 false accept；第四步，与传统工具按相同覆盖条件比较，同时运行确定性结构检查。

**关键实验与证据**：校准后 judge 精度 100%、召回 64.6%，所以下游接受率是保守下界。LLM 在真实冲突上约 55% 匹配开发者；覆盖公平时 55%–59%，高于 AutoMerge 的 36.7%。但 judge 接受了 5 个结构失败中的 4 个，直接证明语义 judge 不能替代 parser。

**局限和可信度**：单一 Java 数据集与单一研究实现限制泛化；开发者解法也不一定唯一。最可信的结论不是“LLM 胜过 merge tool”，而是优势主要来自不 abstain，同时结构 oracle 必须独立存在。

**与当天主题的关系**：这篇把当天的核心边界说得很清楚：judge 可以补覆盖，确定性验证负责守底线。

### 8. Rehearse：autoresearch 会跌下 confidence cliff，历史结果比空想理由更有用

**论文信息**：*Rehearse: Stepping Back from the Confidence Cliff in Self-Improving Autoresearch*；Jiazhen Ji、Shouhong Ding；[arXiv:2607.27687](https://arxiv.org/abs/2607.27687)；cs.AI；列入 2026-07-31 官方列表。

**一句话 TL;DR**：随着 autoresearch 连续积累成功修改，候选改动变得更难，LLM 的执行前选择准确率从 82.8% 跌到 56.9%；只检索相似历史尝试及真实结果可将后期准确率拉回 83.5%。

**为什么值得推荐**：自动研究循环的昂贵资源是完整训练 run。模型能否在执行前筛掉坏主意，比多生成几个 idea 更决定预算效率。论文发现，早期成功会让剩余改动进入更狭窄、交互更复杂的空间，但 judge 的自信并不会同步下降，这是一种可观测的长期依赖失真。

**方法怎么工作**：第一步，从公开 AutoSOTA 日志构建同 baseline 的一好一坏修改对；第二步，让 judge 在隐藏实测结果时比较候选；第三步，Rehearse 先生成多个 idea，再以相似历史修改和结果组成 focused memory；第四步，只执行最有希望的候选，并把结果写回下一轮记忆。

**关键实验与证据**：公开日志中 helpful modification 从前两轮 70% 降到第 6 轮后的 43%。296 个同基线对中，无历史 judge 在可判样本上达 79.5%，但全 366 对的后期 selective accuracy 只有 56.9%；focused memory 提升到 83.5%。三类循环、4,000 个预算训练 run 均改善最终指标。

**局限和可信度**：任务集中在 nanochat、图像分类和时间序列，judge/idea generator 共享模型时可能相关；selective accuracy 还依赖 consensus 的覆盖率。论文最强证据是按轨迹阶段切片，而非只报整体胜率。

**与当天主题的关系**：它说明执行反馈的价值不只在训练 reward，也在改变下一轮候选的选择边界。

### 9. VeriSkill：技能自演化首先要能把失败归因给技能

**论文信息**：*VeriSkill: A Self-Evolution Framework for Program Verification Skills*；Changguo Jia、Tianqi Zhao、Zhiyou Xiao、Weiming Zhang、Minghui Zhou；[arXiv:2607.27733](https://arxiv.org/abs/2607.27733)；cs.AI；列入 2026-07-31 官方列表。

**一句话 TL;DR**：VeriSkill 将 verifier failure 分成任务不可满足、prover 限制和真正的技能缺陷，只把可修复模式抽象成 lesson，并要求新技能在验证集上严格改善且保持程序语义。

**为什么值得推荐**：通用 skill evolution 往往把每次失败都写进经验库，结果是环境故障、证明器边界和错误参考答案也被“学习”。程序验证提供了可执行 verifier，但反馈通常晦涩；本文的贡献是把责任归因、lesson 抽象和可执行回归绑定成 admission gate。

**方法怎么工作**：第一步，收集生成 artifact、verifier log 和语义检查；第二步，责任分类器判断失败是否源于 skill；第三步，从同模式实例抽象可复用诊断签名与操作建议；第四步，在 attribution/transfer cases 上 revise–test，只有 PASS 提升且语义保持才提交新版本。

**关键实验与证据**：在 Dafny、Frama-C、VeriFast 与两套 agent/backbone 组合的六个设置中均为最佳。相对 No Skill，Claude 配置提升 43.3/17.6/46.0 个百分点，Codex/GPT-5.6 配置提升 49.0/25.5/51.3。去掉 executable validation 后 Dafny PASS 从 57.3% 降至 36.0%。

**局限和可信度**：实验 API 成本约 1.5 万美元，复现门槛高；skill admission 仍在相近任务分布验证，可能过拟合失败模式。跨三个 verifier、两种 agent 的一致提升和清晰消融增强可信度。

**与当天主题的关系**：它把“agent 会积累经验”提升为“经验变更本身也要经过验证和版本门禁”。

### 10. ChronoMem：长期记忆需要 commit、HEAD 与语义 rollback

**论文信息**：*ChronoMem: Version Control and Semantic Rollback for Large Language Model Agent Memory*；Yongye Su、Wujiang Xu、Chaoji Zuo、Elisa Bertino；[arXiv:2607.27773](https://arxiv.org/abs/2607.27773)；cs.CL；列入 2026-07-31 官方列表。

**一句话 TL;DR**：ChronoMem 为每次记忆写入保存全量快照，用混合检索与 reranker 将自然语言撤销意图定位到历史版本，再让 agent 在已见过后续信息后恢复目标时间线。

**为什么值得推荐**：提示模型“忘掉刚才”并不等价于回滚；未来信息已经影响过上下文和摘要。ChronoMem 把问题定义为版本选择和应用状态恢复，而不是删一条向量，因而能测试更严格的反事实行为：回滚后回答是否像未来更新从未发生。

**方法怎么工作**：第一步，每次写入创建 whole-memory snapshot 与 commit 描述；第二步，BM25、dense retrieval、RRF 和 cross-encoder 选择目标版本；第三步，将 HEAD 原子切到该 snapshot；第四步，在 post-exposure protocol 下做问答与历史摘要，明确惩罚引用目标版本之后的事实。

**关键实验与证据**：LoCoMo 的版本 Recall@1 从 Hybrid 的 12.0% 升到 20.5%，Recall@5 从 28.1% 到 38.9%；MemoryAgentBench 上 Recall@1 为 33.4%、Scope@2 为 58.0%。回滚后 LoCoMo QA F1 在三种 backbone 上为 36.1/38.5/31.3%，均显著高于 RAG-only；MAB 准确率达 53.8/55.1/44.6%。

**局限和可信度**：全量 snapshot 的空间与隐私成本未在超长部署中充分评估；自然语言版本选择仍可能错指。论文把 version selection、QA、summarization 分开测，并使用 post-exposure 而非理想化 pre-exposure，评测边界较可信。

**与当天主题的关系**：它是当天“长期状态必须可审计、可撤销”的直接实现。

### 11. MemTxn：记忆写入也需要 transaction boundary

**论文信息**：*MemTxn: A Transaction Boundary for Source-Supported Updates and Complete-State Recovery in Agent Memory*；Hanshuai Cui、Zhiqing Tang、Zhi Yao、Fanshuai Meng、Qianli Ma、Weijia Jia；[arXiv:2607.27834](https://arxiv.org/abs/2607.27834)；cs.AI、cs.CL；列入 2026-07-31 官方列表。

**一句话 TL;DR**：MemTxn 在回答模型之外验证每次 memory patch 是否被来源支持，用时间解析选择冲突版本，并以 durable snapshot journal 恢复完整可见状态。

**为什么值得推荐**：记忆系统普遍优化写得快、找得准，却缺少数据库最基本的原子性与恢复语义。错误写入一旦跨 session 传播，后续 agent 会把它当作事实。本文最重要的判断是：可靠记忆必须有独立治理层，不能让同一个生成模型同时当作者、验证者和恢复器。

**方法怎么工作**：第一步，Ordered PatchTest 将候选写入拆成声明并逐项核对 source support；第二步，Temporal Resolver 在冲突事实中选择当前可见版本；第三步，durable journal 记录逻辑快照；第四步，故障后恢复完整 active map，而不是只回滚已知物理写集。

**关键实验与证据**：item-disjoint audit 中接受 60/60 个有支持原始写入、拒绝 179/179 个 hard negatives。LongMemEval-S 和 LoCoMo 的持久多 key 故障下恢复全部声明状态；MemoryAgentBench 的 12 种 answer-model 配置中平均 F1 最佳，五个代表设置比 Dense 高 17.06–24.07 点。

**局限和可信度**：来源本身错误时 support check 不能判断真实性；完整快照的存储与一致性开销需要生产评测。全拒绝/全接受的结果很强，也意味着应特别关注 hard negative 的构造是否覆盖现实歧义。

**与当天主题的关系**：ChronoMem 解决“回到哪个版本”，MemTxn 解决“什么写入有资格进入版本历史”，两者构成当天记忆可靠性的互补边界。

### 12. CSCR：对结果最敏感的 token，未必最值得加大信用

**论文信息**：*Not All Tokens Deserve Equal Credit: Counterfactual Sensitivity Credit Reallocation for Long-CoT Reasoning*；Qiangqiang He、Zhongheng Wu、ZiJian Wang；[arXiv:2607.27888](https://arxiv.org/abs/2607.27888)；cs.AI；列入 2026-07-31 官方列表。

**一句话 TL;DR**：作者固定同一条 rollout，分别在“答案正确”和“答案错误”条件下重算 token likelihood，发现大幅移动 token 在两种相反条件下常同向变化，因此不应被当成可靠方向；CSCR 反而适度降低它们的 GRPO 信用。

**为什么值得推荐**：OPSD 类方法常把 privileged teacher 引起的大 likelihood shift 视为强监督。论文用反事实条件拆开“幅度大”和“方向正确”，发现很多敏感 token 只是对条件文本或生成结构敏感，并不携带 answer-aligned 信息。这是对 dense self-distillation 一个重要负诊断。

**方法怎么工作**：第一步，对 400 条 on-policy 轨迹分别加入正、负结果条件；第二步，比较同一前缀下 token 和全词表 likelihood shift 的方向与重叠；第三步，把 counterfactual sensitivity 映射为衰减权重；第四步，重新归一化 token advantage，保留 GRPO 原始信用预算与 verifier 决定的整体方向。

**关键实验与证据**：Qwen3-1.7B/4B、五个数学 benchmark 共十个模型—任务组合全部优于 GRPO 及五个 self-distillation baseline；相对每个 benchmark 最强对手，平均提升 3.9 和 1.7 点。过强衰减会让 reward 崩溃、响应长度跌到约 6k/2k token，说明最佳区间是适度削弱而非删除。

**局限和可信度**：结论目前集中在数学 long-CoT、固定 verifier 与两个模型规模；反事实 prompt 仍可能引入格式偏差。但同轨迹、同前缀的控制设计比跨样本相关更能支撑因果诊断，且负向消融公开了稳定性边界。

**与当天主题的关系**：它是当天 post-training 最有洞察力的结果之一：credit magnitude 不是 credit validity。

### 13. Meta-Task：先让 agent 生成一个真的能跑的任务，再把它当训练数据

**论文信息**：*Meta-Task: Turning Terminal Task Synthesis into a Terminal Task for Scalable Agent Training*；Zhihong Pan、Jiyuan He、Kai Zhang、Yupeng Han、Ze Liu、Yuze Zhao、Yongcong Ye、Zhaohua Yang；[arXiv:2607.27929](https://arxiv.org/abs/2607.27929)；cs.AI；列入 2026-07-31 官方列表。

**一句话 TL;DR**：Meta-Task 把“生成 Terminal-Bench 任务”本身封装成容器内 terminal task，让 agent 在真实环境中创建、执行和验证题目，只有内部一致且可执行的任务才进入训练集。

**为什么值得推荐**：synthetic agent data 最大风险是问题、环境、reference answer 和 verifier 彼此不匹配。本文把 task synthesis 从文本生成改成环境内开发工作：生成者必须亲自把任务跑通，可靠性来自执行闭环，而不是更强的 LLM-as-judge。

**方法怎么工作**：第一步，沿目标类型、依赖、工具、难度等维度解耦需求；第二步，在容器中先设计 novel specification，再生成文件、环境与测试；第三步，反复执行并修复内部不一致；第四步，用可执行验证和 LLM quality filter 筛选轨迹，用于 SFT terminal agent。

**关键实验与证据**：仅 3,221 条合成轨迹微调 Qwen3-14B/32B，在 Terminal-Bench 2.0 分别达到 22.5% 和 31.8% Avg Pass@1，并以明显少于并行工作的训练数据超过其结果。

**局限和可信度**：任务由同类 agent 生成与验证，可能偏向生成者熟悉的模式；LLM filter 仍引入不可复现判断。最关键的可信点是题目和 verifier 在真实容器里共同执行，而不是离线拼接。

**与当天主题的关系**：它把“训练数据正确性”提升为一个可执行软件工程问题。

### 14. DataClawEval：数据工程 agent 终于进入五种真实执行引擎

**论文信息**：*DataClawEval: A Benchmark for Data Engineering Agents in Real Industrial Harness*；Debin Meng、Jiaming Yang、Zefang Zong、Tengyue Xu、Haining Xie、Yang Li、Peng Chen；[arXiv:2607.28033](https://arxiv.org/abs/2607.28033)；cs.AI；列入 2026-07-31 官方列表。

**一句话 TL;DR**：DataClawEval 用企业工程师代码构造 100 个端到端数据工程任务，在 PySpark、MySQL、HiveSQL、Presto/Trino、FlinkSQL 中执行并由确定性脚本评分。

**为什么值得推荐**：Text-to-SQL 掩盖了数据工程真正的难点：多引擎语义、运行环境、数据依赖、错误恢复和最终产物验证。该 benchmark 把 agent 放进生产式 harness，结果显示模型排名强烈依赖引擎，没有“通用数据工程 agent”。

**方法怎么工作**：第一步，从专业工程师的生产级代码抽取任务；第二步，为每个任务建立隔离 sandbox、数据和目标状态；第三步，让 agent 端到端读取需求、编辑并执行；第四步，用规则脚本而非 LLM judge 验证输出、状态和副作用，并按引擎切片。

**关键实验与证据**：100 个任务覆盖五个执行引擎，评估 16 个 frontier agent；最强总体分数仅 74.9，而且每种引擎的最佳模型不同。这个结果比单一平均分更重要：性能是 domain specialization 的组合，而不是一个模型全局占优。

**局限和可信度**：100 个任务仍不足以覆盖调度、权限、流批一致性和长期维护；生产代码脱敏后可能简化组织约束。确定性评分、容器化环境和跨引擎分层让它比 judge 驱动的数据 benchmark 更可信。

**与当天主题的关系**：它把真实环境和确定性验证同时纳入 coding-agent 评测，是“工业 harness”主线的代表。

### 15. ClawTrack：幸运通过和可靠过程必须分开计分

**论文信息**：*ClawTrack: Towards Trace-Level Evaluation and Improvement of Real-World Autonomous Agents*；Xingjian Wu、Xuhang Zhu、Xingchen Liu、Junlin Liu、Jianing Wang、Linsen Guo、Xiaoyu Li、Xuezhi Cao、Xunliang Cai；[arXiv:2607.28037](https://arxiv.org/abs/2607.28037)；cs.LG；列入 2026-07-31 官方列表。

**一句话 TL;DR**：ClawTrack 同时给 Task Score 与 Process Score，逐轮检查目标对齐、效率、信息使用和结果验证，再把高过程质量轨迹用于 post-training 过滤。

**为什么值得推荐**：最终成功可能来自偶然正确的 tool output，也可能掩盖无效循环和未验证结论。ClawTrack 的价值不只在“多一个 judge”，而在为每个任务写 task-specific rubric，并展示过程分能定位具体薄弱维度，尤其是系统性缺失的 result verification。

**方法怎么工作**：第一步，320 个任务接入 25+ 个确定性 mock service；第二步，12,541 条 rubric 把任务拆成可观察过程要求；第三步，Process Grader 对每轮四维评分，与 outcome oracle 独立；第四步，按过程分过滤正确轨迹，用相同数据量继续训练并比较模型改善。

**关键实验与证据**：21 个模型、16,000+ 次 trial；过程分与结果分互补，并能过滤 outcome-only 看不到的 lucky pass。跨三种模型规模，用过程过滤的训练数据带来 +10 到 +19 个 Pass@3 点，结果验证被识别为普遍瓶颈。

**局限和可信度**：过程评分仍依赖 LLM judge，rubric 编写成本高，且“好过程”可能存在多条等价路径。论文用不同 judge 检查稳健性，并保留独立 outcome oracle，降低了循环自证风险。

**与当天主题的关系**：它连接两条主线：过程评测既是 agent 审计工具，也是 post-training 数据筛选信号。

### 16. Locksmith Loop：用双运行时确定性 oracle 验证 COBOL→Java 迁移

**论文信息**：*Agentic Method for Deterministic Validation of Legacy Code Migration*；Andras Ferenczi、Jordan Docherty、Mariya Bessonov、Matthew Findlay、Krishna Lingamneni；[arXiv:2607.28271](https://arxiv.org/abs/2607.28271)；cs.SE、cs.AI；列入 2026-07-31 官方列表。

**一句话 TL;DR**：Locksmith Loop 同时运行 COBOL 源程序和生成的 Java，搜索能推进分支的输入 mock；遇到覆盖平台期时定位 Locked Paragraph，再用保持输出一致的变异继续深入。

**为什么值得推荐**：遗留迁移最危险的是“看起来合理但语义静默漂移”。缺少测试数据时，仅验证 Java 自身通过测试没有意义。本文用源/目标双运行时建立确定性差分 oracle，并让 agent 的任务从改代码转为主动寻找能区分行为的 witness。

**方法怎么工作**：第一步，为 COBOL 和 Java 分别建立可在普通硬件运行的 mock 环境；第二步，Witness Search 生成输入并比较两端行为；第三步，覆盖停滞时分析阻塞条件，定位 Locked Paragraph；第四步，对输入做 parity-preserving mutation，只有两端输出一致的 case 才被接受。

**关键实验与证据**：三个案例覆盖 430–4,114 行源码，包括两个开源与一个 production-like 程序；两个开源项目接近完整覆盖，内部案例达到 91.90% branch coverage。所有接受测试中 Java 与 COBOL 的确定性 parity 检查一致。

**局限和可信度**：只有三个程序，COBOL 方言、数据库/文件系统副作用和并发未充分覆盖；高覆盖不等于所有业务语义。源程序作为 oracle、两端真实执行和明确覆盖平台期，使结论比生成式 judge 更可靠。

**与当天主题的关系**：它说明工业迁移的正确性来自跨平台运行行为对照，不来自代码相似度。

### 17. Lightning OPD 2.0：跨教师蒸馏先减去风格残差

**论文信息**：*Lightning OPD 2.0: Mitigating Style Bias in Cross-Teacher On-Policy Distillation for Large Reasoning Models*；Yecheng Wu、Song Han、Han Cai；[arXiv:2607.28449](https://arxiv.org/abs/2607.28449)；cs.CL；列入 2026-07-31 官方列表。

**一句话 TL;DR**：当 SFT 数据生成者与 OPD teacher 不同，teacher–reference 差异会混入固定的措辞、格式和推理节奏；Lightning OPD 2.0 用 rollout-level cross-fitting 估计并减去这部分风格残差。

**为什么值得推荐**：teacher consistency 在实际训练中经常不成立：SFT 数据来源混杂，后续又想用更强模型蒸馏。原始 token 差异把内容改进和风格迁移混在一起，强 teacher 也可能几乎不提升。论文把“教师更强却没用”解释成信号分解问题，而不是简单归咎优化不稳定。

**方法怎么工作**：第一步，在 cross-teacher rollout 上收集 teacher 与 SFT reference 的 token log-prob 差；第二步，交叉拟合重复出现的上下文无关风格成分；第三步，从原差异中减去 residual proxy；第四步，在固定 replay、相同训练预算下构造 OPD update，避免用同一 rollout 同时估计和修正偏差。

**关键实验与证据**：Qwen3-4B-SFT 上平均数学从 48.3% 升到 51.7%，代码从 32.6% 到 35.7%；Klear-Reasoner-8B-SFT 上数学 73.6%→74.6%，代码 54.9%→58.5%。单项达到 AIME 2024 82.4%、LiveCodeBench v5 63.0%，五个 benchmark 均提升。

**局限和可信度**：风格残差是操作性 proxy，不保证只含风格；实验是 frozen replay、两个 reference/teacher 组合，在线分布变化仍待验证。共享 rollout、teacher score 和训练预算的控制比较使方法增益较可信。

**与当天主题的关系**：它把 post-training 的教师选择从“谁更强”细化为“差异里有多少可学习能力信号”。

### 18. ORCA-bench：生产 oncall 不是代码问答，最强 agent 在 realistic setting 也只有 25.3%

**论文信息**：*ORCA-bench: How Ready Are Language Model Agents for Oncall?*；Albert Gong、Kyuseong Choi、Abhineet Agarwal、Jason Schechner、Ryan Huang、Raj Agrawal、Anish Agarwal、Raaz Dwivedi；[arXiv:2607.28545](https://arxiv.org/abs/2607.28545)；cs.CL、cs.AI、cs.SE；列入 2026-07-31 官方列表。

**一句话 TL;DR**：ORCA-bench 把六天 Prometheus、Jaeger、OpenSearch 遥测与完整微服务源码放进真实接口，从模糊用户报告出发测 1,079 个根因分析任务。

**为什么值得推荐**：oncall 需要在噪声、时间延迟、共现故障和多源证据中定位根因，远比“给 issue 写 patch”复杂。论文不是模拟几个日志片段，而是构建 50GB、六天、OpenTelemetry instrumented 的活系统，迫使 coding agent 学会调查而非直接猜代码。

**方法怎么工作**：第一步，运行真实微服务并注入可控故障；第二步，通过常用遥测接口暴露 metrics/logs/traces 与源码；第三步，系统变化报告具体度、检测延迟和并发 fault；第四步，由 SRE 签字的症状与人类复核 judge 评估 RCA，另做移除源码消融。

**关键实验与证据**：1,079 个任务、五个 frontier agent；现实输入的 Medium 最佳 RCA Accuracy 仅 25.3%，Hard 仅 10.0%。最弱模型在 40% 事故中给出不可能根因；移除源码让所有指标下降。judge 与人工的加权 Cohen κ 为 0.90。

**局限和可信度**：系统虽大仍是公开且受控的单一 testbed，真实组织还有未文档化依赖、权限和持续流量。论文因此把结果称为下界是合理的；SRE ground truth、真实遥测接口和 judge 校准增强可信度。

**与当天主题的关系**：它把 coding agent 的可靠性边界推到生产演化与事故响应，而不是继续围绕静态 issue 打转。

### 19. Sample More, Reflect Less：等 token 预算后，自我反思没有一次可靠胜出

**论文信息**：*Sample More, Reflect Less: Self-Refine and Reflexion Lose to Repeated Sampling at Equal Token Cost, from 1.5B to 7B*；Iliya Mirzaei；[arXiv:2607.28576](https://arxiv.org/abs/2607.28576)；cs.CL、cs.AI、cs.LG；列入 2026-07-31 官方列表。

**一句话 TL;DR**：把 critique、reflection、debate 和选择消耗的全部 token 计入预算后，七种方法在 36 次配对比较中没有一次可靠优于“重复采样后多数投票”，而所有 18 个 self-inspection 比较方向都为负。

**为什么值得推荐**：许多推理方法用更多 token 换更高准确率，却把收益归因于“反思机制”。本文用每种方法自己的实测 token 成本配置重复采样 baseline，并提供 paired bootstrap、置信区间和多重比较校正，是难得的预算公平负结果。

**方法怎么工作**：第一步，在 1.5B/3B/7B 开源模型、两个数学 benchmark 各 150 题上执行七种策略；第二步，计算所有生成 token，包括 critique、改写、辩论和检查；第三步，为每个策略建立等成本 repeated-sampling 对照；第四步，逐题配对统计并校正 36 次比较。

**关键实验与证据**：没有任何方法可靠胜出，10 次显著更差；18 个 self-inspection 比较全部为负。1.5B 时模型自己选 Best-of-N 比多数票低 8.0/11.3 点，到 7B 缩至 2.0/1.3；Self-Refine 与 Reflexion 在 7B 仍低 3.6–10.1 点。最小模型的 Reflexion 甚至从不触发 retry，静默退化成单次 CoT。

**局限和可信度**：只覆盖小型开源模型和数学任务，不能外推到有外部 verifier 的 agent；多数投票也依赖可规范化答案。完整 generation 与验证脚本公开、统计设计明确，使“无外部新证据的自检不值额外预算”这一局部结论很强。

**与当天主题的关系**：它挑战今天许多 agent 论文的默认组件：反思只有带来新证据或更强 verifier 时才值得付费。

### 20. PAIChecker：benchmark 的 PR–issue oracle 自己就可能错位

**论文信息**：*PAIChecker: Uncovering and Checking PR-Issue Misalignment in SWE-Bench-Like Benchmarks*；Manyi Wang、Junjielong Xu、Pinjia He；[arXiv:2607.28587](https://arxiv.org/abs/2607.28587)；cs.SE、cs.AI；列入 2026-07-31 官方列表。

**一句话 TL;DR**：作者发现 SWE-bench Verified 中 13.6% 的 PR patch 与 linked issue 并非严格对应，并用模式识别、跨 agent 合成与代码级验证三阶段检查这类污染。

**为什么值得推荐**：SWE-bench 类 benchmark 把 issue 当任务、PR patch 当 oracle，但现实 PR 常顺带重构、修多个问题或只部分解决链接 issue。错位会让正确 agent 被判错、投机 patch 被判对，并污染 post-training 数据。本文把 benchmark construction 也当成需要 agent 审计的软件工程流程。

**方法怎么工作**：第一步，从 Verified 手工归纳五类模式、十一种细分场景；第二步，多个 agent 分别识别候选错位；第三步，cross-agent label synthesis 处理分歧；第四步，回到 diff、测试和代码依赖做验证，而不是停在文本相似度。

**关键实验与证据**：SWE-bench Verified 中 13.6% 被判存在错位。迁移到 SWE-Gym 与 SWE-bench Multilingual、四种 LLM backbone 时，二分类准确率最高分别 92.12% 和 91.67%。

**局限和可信度**：13.6% 依赖作者定义与人工审计，PR 的多意图本来就存在灰区；高 accuracy 也可能受模式分布影响。代码级第三阶段和跨 benchmark 验证使它比纯 LLM 文本判别更可靠。

**与当天主题的关系**：它提醒我们，patch correctness 评测的第一步是确认“这个 patch 本来是不是这个 issue 的答案”。

### 21. OSReward：如果 judge 有系统性宽松偏差，RL 会把失败训练成成功

**论文信息**：*OSReward: Instituting Standardized Evaluation for Cross-Platform Computer-Use Reward Models*；Qiushi Sun、Kanzhi Cheng、Yian Wang、Bowen Yang、Hang Yan 等；[arXiv:2607.28609](https://arxiv.org/abs/2607.28609)；cs.AI、cs.CL、cs.CV；列入 2026-07-31 官方列表。

**一句话 TL;DR**：OSReward 用人工多阶段标注的跨平台 computer-use 轨迹评测 27 个 VLM judge，发现普遍把失败判成成功；随后用 100K 轨迹训练 9B/35B OS-Shepherd，逼近商业 judge 而成本低 30–60 倍。

**为什么值得推荐**：CUA 的评测、数据筛选和 RL 都依赖轨迹 reward model。如果 judge 宽松，它会把未完成任务、错点 UI 或省略关键步骤的 rollout 当正例。论文没有直接优化 agent，而是先建立“评测 reward model 的 benchmark”，这是可靠 post-training 必须补的元评测层。

**方法怎么工作**：第一步，在 desktop、mobile 等平台收集多 agent 真实轨迹并清理环境故障；第二步，多阶段人工标注 success/fail、alignment 和 efficiency；第三步，构建 full、Hard 与 Multi 三种 track，统一最后 N 个状态的 judge protocol；第四步，用 OS-Shepherd-100K 的推理标注训练开放 reward model，再比较准确率、偏差和单位成本。

**关键实验与证据**：27 个 judge 中，full set 最高 Claude-Opus-4-8 为 89.7%，GPT-5.5 为 89.5%；到了 Hard 分别只有 69.7% 和 67.3%。许多模型高 success recall、低 fail recall，呈系统性 leniency。OS-Shepherd 以 9B/35B 达到接近商业 judge 的可靠性，推理成本降低 30–60 倍；hard-set 复核约投入 800 人时。

**局限和可信度**：90% 作为训练 reward 的经验阈值并非理论保证；平台分布和 UI 变化会快速使 benchmark 过时。独立收集轨迹、人工多阶段标注、偏差分解和成本分析使结论非常有现实价值。

**与当天主题的关系**：它给今日两条主线收尾：agent 的可靠训练最终受限于 verifier 是否比被训练对象更可靠。

## 中相关论文速读

### 1. [Modality Contribution Drift](https://arxiv.org/abs/2607.27260)：持续学习不只会忘知识，也会改变“依赖哪个模态”

论文定义 MCD score，用受控模态子集干预测量单模态贡献和交互贡献随任务变化的漂移，并给出有 replay 与无 replay 两种 CMCDR。它值得保留的判断是：旧任务准确率稳定不代表决策机制稳定；模型可能在视觉/文本相对依赖上悄然换轨。实验覆盖 multimodal class-incremental learning 和 continual VQA，但仍以分类式环境为主，因此放在中相关而非强读。

### 2. [Flat Score, Amplified Failures](https://arxiv.org/abs/2607.27275)：4-bit 总分不变，工具幻觉却最多放大 2.5 倍

作者在 $\tau^2$-bench 的八个模型—领域设置、每格 456 episode 上比较 16/8/4-bit。标准分数在多重校正后无显著差异，但 telecom 工具名幻觉增加 17.6 次/任务，失败集合跨精度 rank correlation ≥0.94；把十次错误预算缩到两次，17 分差距立即显现。方法贡献主要是诊断而非新量化算法，但它对“post-training quantization 近乎无损”的常见说法给出很有力的 process-level 反例。

### 3. [The Kinetics of Training](https://arxiv.org/abs/2607.27281)：能力涌现可能由缺失电路部件数控制

论文用 driven-nucleation rate law 解释能力形成、plasticity loss 与局部电路控制：在 Pythia 七种能力、三个尺度上，移除一个关键部件后 32/32 个判别单元只保留中位 17% 能力，而部分信用模型预期 50%–83%。它还能提前预测能力点火时间，并通过重置 query-key 切片恢复 6/6 个不可学习设置。洞察新，但范围是到 1.4B 的 conjunction circuit，距离一般 LLM post-training 仍有尺度和任务外推风险。

### 4. [LayerRAG-Bench](https://arxiv.org/abs/2607.27353)：groundedness 不能替代权限、会话和 freshness 检查

8 个企业领域、240 个任务、9 种故障、38,880 条 live record 显示，schema normalization 可把 schema-drift 成功率从 0 提到 0.913，却无法修复 stale evidence、缺失工具输出、权限拒绝和错误 session。论文最值得保留的是 layer-specific credit：一个 intervention 只能为它修复的层拿分。它面向 agentic RAG 而非代码变更，但对多工具仓库 agent 的证据分层同样直接。

### 5. [SkillMentor](https://arxiv.org/abs/2607.27360)：自演化的瓶颈可能是不会发现盲点

SkillMentor 固定 executor、不用人工标签，只以 RL 训练 Mentor 生成诊断任务、聚类重复失败并写成技能；AppWorld 和 BFCLv3 上 executor 平均提升 44.2%。推荐它是因为严格隔离了“诊断能力变强”和“执行模型更新”两条路径。没有更广泛软件环境和诊断正确率审计，使 44.2% 仍可能包含任务分布适配，因此适合速读。

### 6. [GAMER](https://arxiv.org/abs/2607.27415)：把成功与失败轨迹变成正负动作价值记忆

GAMER 用 action-centric graph 存历史轨迹，再以双流 temporal-difference learning 分别估计 suggestion value 与 avoidance value，推理时用小图搜索减少重复探索。相对 vanilla，success/progress 分别提高 20.81%/6.17%，同时减少记忆 token。方法把 episodic memory 从文本摘要改成可更新动作值，值得关注；但价值估计仍受环境平稳性约束。

### 7. [BACKROOMBench](https://arxiv.org/abs/2607.27484)：agent 说自己用了 skill，不代表 skill 真改变了答案

BACKTRACE 对 skill 的含义、措辞、身份、内容和分配做干预，并将回答与 matched no-skill counterfactual 比较。论文发现 silent uptake 与 performative use 同时存在，skill 来源还能在多 agent 通信中丢失；文本提及、trace 相似度和 LLM judge 都识别不了真实因果依赖。它主要是评测而非构建可靠技能系统，但对 skill provenance 的负结论很有阅读价值。

### 8. [FEV for Agentic Bioinformatics](https://arxiv.org/abs/2607.27556)：科学 agent 应按 workflow correctness 审计

这篇系统梳理 128 篇出版物，将功能、证据与验证分开，指出规划和工具执行进步快于 replayability、provenance、外部验证和前瞻实验。它不是新模型或 benchmark 实验，却给出了适用于科学 workflow agent 的清晰审计框架。若只关心 coding-agent 算法可略读，若关心真实工具链可信度则值得保留。

### 9. [Training Skills Like Parameters](https://arxiv.org/abs/2607.27557)：不用改权重，也能用重建误差更新外部技能库

论文借用 diffusion 的 corruption–reconstruction 思路，用高质量人类剧本构造自监督差异，更新的是可读 textual skill library 而不是模型权重。它避免闭源模型不可微与 LLM-as-judge 循环自证，在短剧写作上提升专业生成。方法概念新颖，但单一创作领域和主观质量评测限制证据强度，先作为外部化 post-training 路线观察。

### 10. [Policy Gradient Steering](https://arxiv.org/abs/2607.27574)：把临时行为 steering 直接写成 policy gradient

PGS 从少量 rollout 或 demonstration 的临时行为目标累积梯度，构造可移除、可组合 task vector；在 gridworld、棋题和足球策略中展示可校准、可逆和跨对手迁移。它击中了 activation steering 缺少行为目标的问题，但实验模型与任务离大语言模型安全对齐仍较远。可记住“用行为目标定义 steering，而非找一个对比激活方向”这一判断。

### 11. [LimICE](https://arxiv.org/abs/2607.27606)：让 LLM 逐条生成 lemma，ICE-DT 负责补全

LimICE 把 loop invariant 视为有序 lemma 序列，以 incremental ICE 逐条学习并过滤 counterexample，LLM 生成 lemma，传统 ICE-DT 兜底。367 个线性问题解出 349 个，50 个非线性问题解出 47 个，较最强 LLM baseline 多解 12%–24% 且快 36%–63%。它不是通用 coding agent，但“生成器负责候选、符号框架负责完备性”的组合非常扎实。

### 12. [Kalman-Guided Prompt Selection](https://arxiv.org/abs/2607.27610)：课程难度是动态状态，不是静态标签

KGPS 在 logit space 用 Kalman filter 维护每个 prompt 的成功率后验，并让 process noise 随 policy update 大小变化；选择时偏好中等难度且会主动回访高不确定样本。DeepSeek-R1-Distill-7B 相比 DS 少 83% rollout，六个数学 benchmark 平均还高 0.12 点。贡献是无需额外 rollout 的在线课程估计，但长期状态模型的线性高斯假设值得进一步压力测试。

### 13. [ReDiPPO](https://arxiv.org/abs/2607.27631)：value 校准和 token 重加权一起修 PPO 数学推理

ReDiPPO 用 reference-guided calibration 修正 critic value，再按策略—参考差异给 token 重新加权，目标是减少长推理中 value 偏置和局部更新失衡。论文报告数学 benchmark 上稳定优于 PPO 类 baseline。应保留的判断是，critic 准确性与 token credit 不能分别优化；不过改进集中于可验证数学，跨开放任务泛化仍需验证。

### 14. [Witness Evidence Portfolios](https://arxiv.org/abs/2607.27667)：闭源多模态输出的风险也可以压成单次 prefill 证据组合

该工作为无法访问内部状态的 MLLM 收集多个 witness 信号，再构造 evidence portfolio 进行风险判断，重点处理单一 detector 在分布变化下的不稳定。它与当天 verifier 主题一致，但目前主要是多模态风险检测，并非 post-training 算法本身。值得记住的是“证据组合应报告覆盖与冲突，而不是再压成一个置信分”。

### 15. [RefineSVG](https://arxiv.org/abs/2607.27699)：视觉反馈可作为 image-to-SVG 的 RL 闭环

RefineSVG 让模型生成 SVG、渲染图像、比较视觉差异并通过强化学习修正结构，而非只优化代码 token。推荐它是因为输出既是程序又有可执行视觉行为，天然适合 verifier-guided post-training。任务范围局限于 SVG，和仓库变更不同，但“运行产物优先于源码相似”的评估原则相通。

### 16. [Reasoning Consensus](https://arxiv.org/abs/2607.27783)：不是投票答案，而是聚合推理 DAG

论文把多条 reasoning trace 对齐为加权 DAG，在结构共享处聚合支持、在分歧处分配权重，试图减少纯 majority vote 对表面答案的依赖。它适合解释为何某些思路反复出现，也能作为 self-training 的过滤器。当前贡献偏 inference-time ensemble，训练端证据较弱，因此不列强相关。

### 17. [Verifier-Guided Decoding for Selective Object Correction](https://arxiv.org/abs/2607.27823)：只修正 grounding signature 异常的对象

作者发现视觉幻觉会在 grounding 表征中留下可检测信号，于是先定位可疑对象，再由 verifier 引导局部解码修正，避免整体重写造成新错误。它对 selective repair 的判断很有价值：修复范围也应被证据约束。论文主要针对 VLM 物体幻觉，对软件 agent 仅是方法类比。

### 18. [Margin-Calibrated Unlearning](https://arxiv.org/abs/2607.27836)：忘掉还不够，还要防止轻易 relearn

该工作把 unlearning 的目标从立即遗忘扩展到 relearn robustness，用 margin calibration 拉开被删知识重新进入决策边界的难度。它属于安全 post-training 的重要边缘：一次性 forgetting score 可能掩盖几步微调后的恢复。实验仍需关注攻击者训练预算与数据假设，适合作为方法风险检查而非直接结论。

### 19. [AutoSupervision](https://arxiv.org/abs/2607.27845)：科学 workflow 的每次修订都要有 grounded verifier

AutoSupervision 将科学工作流中的结果、证据和修订反馈闭成循环，用 grounded revision verification 判断 agent 的下一次修改是否真的解决了问题。它与 coding-agent 的执行反馈高度相似，尤其强调过程证据而非最终文字。当前科学场景的任务覆盖和 verifier 可扩展性仍有限，但“自动监督必须有外部锚点”的判断值得保留。

### 20. [One Anchor for All](https://arxiv.org/abs/2607.27917)：统一多语言、多模态安全对齐的 anchor

论文尝试用共享安全 anchor 约束多语言与视觉语言模型，使不同模态和语言不必各自维护独立对齐空间。它回应了 safety tuning 的碎片化问题。推荐保留的核心是跨域 safety transfer 需要统一参照，而不是简单合并数据；不过统一 anchor 是否抹平文化与语言差异，是必须继续审计的风险。

### 21. [Outcome-Verified Comparative Self-Distillation](https://arxiv.org/abs/2607.27937)：让 agent 比较可执行结果，而不是模仿一条轨迹

该方法从同一任务的多个 rollout 中用 outcome verifier 产生比较信号，再将相对优劣蒸馏回策略。相比单轨迹 SFT，它更贴近 agent 训练中“不同路径都可能正确”的现实，也避免错误 teacher trace 被硬模仿。贡献与当天执行证据主线直接相关，但广泛环境下 verifier 覆盖与成本仍需更多报告。

### 22. [TriShield](https://arxiv.org/abs/2607.27940)：联邦微调的隐私后门可以藏在梯度与 optimizer state 中

TriShield 用正交梯度投影和 optimizer-state entanglement 防御 federated language model fine-tuning 的隐私 backdoor，并声称保持 utility。值得推荐的是它把防御对象从最终权重扩大到优化器状态；很多 post-training 安全评估只检查模型输出，忽略了更新通道本身。威胁模型偏联邦训练，和通用 RLHF 不完全重合。

### 23. [Copyable Context Cannot Provide Reliable Safety](https://arxiv.org/abs/2607.27951)：能被复制的安全上下文也能被攻击者重放

论文从机制上质疑只靠 system prompt、policy context 或可复制 guard text 的安全方案：如果安全性完全由上下文承载，攻击者可复制、分割或重排它，并在新环境中绕过原授权关系。它没有直接提出强防御，但负结论与 AgentS4D、HALO 一致——安全边界必须落在平台维护的状态与执行权限上，而不是只存在 token 中。

### 24. [Specification-Guided Protocol Refinement](https://arxiv.org/abs/2607.27964)：LLM 提议通信协议，形式规格证明无死锁

该工作让 LLM 生成协议 refinement 候选，再由规格检查器验证通信安全与 deadlock freedom。它值得读，因为生成与证明职责清晰：模型负责搜索，形式工具负责裁决。应用范围是通信协议而非一般仓库，但对多 agent 协同和跨组件修改的同步验证具有直接方法意义。

### 25. [Reward Design for Reinforcement Unlearning](https://arxiv.org/abs/2607.27968)：binary reward 未必是遗忘的正确目标

论文系统比较多种 reward 设计如何影响 reinforcement unlearning 的遗忘、保留与稳定性，指出同样的“忘记成功”可能伴随不同 utility 损失和可恢复性。它的重要性在于把 unlearning 失败归因到 reward geometry，而不是只换 optimizer。具体结论仍依赖攻击和评测集，适合保留为 reward 设计参考。

### 26. [TAPO](https://arxiv.org/abs/2607.27973)：给 agent RL 的状态转移显式分配信用

Transition-Aware Policy Optimization 不只对终局 reward 做广播，而是根据动作引起的状态转移质量调节更新，针对长程 agent 中“正确最终答案掩盖坏中间动作”的问题。它与 ClawTrack 的过程诊断互补：一个提供训练信号，一个提供评测。当前实验证据仍需关注环境 verifier 是否覆盖隐藏状态。

### 27. [Flux-OPD](https://arxiv.org/abs/2607.28022)：当 context 随 student 行为演化时，蒸馏目标也必须跟着变

Flux-OPD 研究多轮 agent 中 student rollout 改变后续 observation，teacher supervision 因此不再来自固定上下文的问题。它让蒸馏在 evolving context 上重算或对齐信号，避免 exposure mismatch。推荐保留这一问题定义；训练成本、teacher 调用量和分布稳定性决定它是否实用。

### 28. [Contrastive Reinforced Policy Optimization](https://arxiv.org/abs/2607.28026)：用 privileged self-distillation 构造对比更新

该方法把带特权信息与不带特权信息的策略输出做对比，将差异转成 RL 优化信号。它与 CSCR 的诊断形成有趣对照：privileged shift 可能有用，但方向可靠性不能默认成立。若细读，应重点看对比信号是否经过 outcome verifier，以及在错误特权信息下是否稳定。

### 29. [SKILL-KD](https://arxiv.org/abs/2607.28048)：蒸馏 agent 时按技能结构对齐，而不只拟合 token

SKILL-KD 将 teacher trajectory 分解成可复用技能并做 contrastive skill distillation，目标是让 student 区分“相似文字、不同操作意图”。它属于 agent post-training 的结构化蒸馏路线。实验增益值得留意，但 skill ontology 的自动质量和跨环境可迁移性决定其上限。

### 30. [VIG-RL](https://arxiv.org/abs/2607.28055)：视觉 grounding 的搜索和插入都由 verifier 奖励

VIG-RL 训练模型决定在哪里搜索视觉证据、何时把新区域插入上下文，并以可验证 grounding 结果给 reward。方法强调工具调用只有在改变证据覆盖时才有价值，与 FaithEyes 的“装饰性工具”诊断一致。任务是图像 grounding，不宜直接外推到通用工具 agent。

### 31. [Temporal Concentration from Rollout Errors](https://arxiv.org/abs/2607.28058)：视频错误在时间上集中，可转成隐式偏好

该工作从 text-to-video rollout 的局部时间错误中构造 preference signal，不依赖完整人工排序。它扩展了“可验证奖励”到连续多模态生成：错误定位比全视频胜负更细。主要价值是 credit assignment 设计，和语言 agent 的直接关系较弱。

### 32. [Group-Reflective Self-Distillation](https://arxiv.org/abs/2607.28076)：反思不再是一条轨迹自言自语，而是 group-level 对照

方法在一组 rollout 内利用相互比较与结果反馈构造 self-distillation 信号，试图减少单条自评的确认偏差。它与 Sample More, Reflect Less 的负结果不矛盾：这里的关键是有 group 对照和训练更新，而不是无外部信息的单次改写。仍需看同一模型同时生成和评判带来的共模错误。

### 33. [LEEPS](https://arxiv.org/abs/2607.28077)：用 latent 探索价值选择 RLVR prompt

LEEPS 在不增加 rollout 的情况下估计 prompt 的 explore/exploit 价值，Qwen2.5-Math 1.5B/7B 在六个数学 benchmark 上相对最强 baseline 提升 2.6%/3.7%，每 step 约增加 2 秒。它与 KGPS 都在优化“训练什么”，但 LEEPS 更偏 latent-guided sampling；OOD general reasoning 也保持最佳平均分，是不错的效率信号。

### 34. [Agent Harness Distillation](https://arxiv.org/abs/2607.28147)：harness 也会通过黑盒交互泄露

AHD 先从目标 agent 的响应推断动态 harness，再迭代调整复制其行为，证明多 agent 编排本身是一种可被蒸馏的 IP。论文还用 deception-based defense 降低提取效果并保持效用。它不是提升 coding agent 的方法，而是揭示 inference-time workflow 的新安全边界，值得系统作者阅读。

### 35. [AudioAgentSecurity](https://arxiv.org/abs/2607.28165)：恶意指令可以与用户语音并发“搭便车”

8 个场景、10 种攻击模式、11 个 agent 中，并发音频注入对 Gemini 3 Pro 平均 ASR 达 69.10%。CADV 通过声源分离和跨模态一致性检测达到 90% 以上检测率，并有人类动态场景验证。它属于多模态工具 agent 安全，而非软件变更，但证明了风险载体会改变同一策略的安全性，与 AgentS4D 的主结论一致。

### 36. [FaithEyes](https://arxiv.org/abs/2607.28225)：工具调用只有真的提供了证据才该拿 reward

FaithEyes 让 VLM 子 agent 判断 crop/代码处理产生的 process image 是否帮助回答，把 helpful-tool ratio 同时写进 observation 和 tool reward，再以 SFT+RL 训练。它直指 reward hacking：模型可能答对，但工具裁错区域仍拿满分。多 agent 自判仍可能共模失误，不过“工具有用性”被从格式正确性中拆出来是重要进步。

### 37. [MemHarness](https://arxiv.org/abs/2607.28272)：记忆应按当前状态重构，不应原样 replay

MemHarness 先 critique retrieved experience，再根据当前状态生成 context-grounded guidance，重构能力通过 GRPO 端到端出现。ALFWorld 与 WebShop 上优于纯 RL 和静态记忆，OOD 也更稳。它解决负迁移，但与 ChronoMem/MemTxn 不同，重点是如何使用记忆，不提供版本、来源或事务保证。

### 38. [CACHE-UK](https://arxiv.org/abs/2607.28292)：4-bit 模型的连续知识编辑需要“退化债务”控制器

CACHE-UK 用 rank-1 LoRA、金融内容自适应 edit strength 和闭环 stability controller 管理连续更新。88,021 篇英国金融文档、4-bit OpenLLaMA-3B 上，知识退化降低 11%–17%，测试泛化成功率 28%，比最强适配 baseline 高 6 点。绝对泛化仍低，论文也没有掩饰这一点，因此更适合作为量化后持续编辑的可行性信号。

### 39. [HARGO](https://arxiv.org/abs/2607.28301)：异构 HPC 任务不该共享同一 advantage 权重

HARGO 从 group reward contrast 得到可区分性，再从 reference log-prob 得到置信度，以两者调节 per-response advantage，不需要显式 task label。四个 HPC 任务、九种方法中，WinRate 54.62%、Data Race F1 91.30%、PLP Similarity 0.8558 均最佳。它显示 domain post-training 的关键是奖励分布异质性，而不只是再做一轮 SFT。

### 40. [LedgerMind](https://arxiv.org/abs/2607.28374)：多模态 agent 的推理只能引用 active evidence ledger

LedgerMind 将工具输出规范化为结构化证据账本，后续 entity/numeric claim 必须引用活跃条目，repair 也只能通过 typed state transition 引入工具产生内容。它给出 provenance non-amplification 的形式边界，并处理 Phantom Grounding 与 repair-time amplification。实验摘要缺少足够具体数字，暂不列强读，但系统设计与当天证据主线高度一致。

### 41. [AAPT](https://arxiv.org/abs/2607.28399)：GUI agent 答对动作却错过时机，问题在 decode critical path

AAPT 在屏幕空闲期预编译带 observable guard、deadline 和预授权动作的有限 policy tree，事件到来时轻量 observer 直接路由。配对试验成功率从 0.50 升至 0.79，且无错误动作；独立模型 126 对试验仍显著。它不提高基础模型，而是重排何时思考，尤其适合可枚举动作的瞬态 UI。

### 42. [CoGate](https://arxiv.org/abs/2607.28529)：安全 code expert 不自信时，不该强行影响解码

CoGate 在 co-decoding 中按安全 expert 的置信度门控其 logits，避免 OOD 模式下错误 guidance。跨 CodeGen、DeepSeek-Coder、Qwen-Coder、StarCoder 和多个 benchmark，CWEval 的 Func-Sec@10 最多提升 12.6%。方法轻量且针对 code security，但置信度校准是否能抵抗 adversarial prompt 仍需验证。

### 43. [$\beta$-OPSD](https://arxiv.org/abs/2607.28582)：把自蒸馏看成带 KL 的 policy optimization 特例

论文证明 vanilla OPSD 是 $\beta=1$ 的更一般族，$\beta$ 控制 reference policy 与 privileged teacher 之间的几何插值；再把闭式最优策略混合成 token logits，用廉价 distillation 逼近昂贵 RL。数学推理上比 vanilla OPSD 更稳、更强。它提供了清晰理论桥梁，但 teacher 错误和开放式 reward 下的表现仍待验证。

### 44. [Beacon](https://arxiv.org/abs/2607.28595)：视觉 agent 要学会何时不用工具

Beacon 把工具使用拆成 Mode Adaptiveness 与 Tool Effect：是否只在必要时调用，以及工具是否真的扩展能力而非伤害本来会做的简单题。Necessity-Aware reward 和 Hint-Guided capability expansion 分别优化这两点。它对工具 reward 的拆分很准确，但当前仍是视觉 reasoning，先作为通用 agent 训练的可迁移评测思想保留。

## 可留意 / 可跳过

- [BridgeAlign](https://arxiv.org/abs/2607.27366) 面向人文社科偏好对齐，提醒通用 preference 数据会压平领域价值判断；若不研究 domain alignment，可先跳过实验细节。
- [HSS-Synth](https://arxiv.org/abs/2607.27379) 构造人文社科 synthetic data，关键词是“领域数据合成与筛选”，但与 agent 可靠性距离较远。
- [Albilich](https://arxiv.org/abs/2607.27705) 用 CAS 编排数学研究与 proof state，值得关注工具验证接口；当前不是软件仓库任务。
- [The Case for Vibe Modeling](https://arxiv.org/abs/2607.27923) 讨论可信软件开发中缺失的 vibe/modeling 层，概念有启发，但实证强度不及本日 benchmark 论文。
- [MARS-RA](https://arxiv.org/abs/2607.27967) 用 multimodal comparisons 做具身多 agent credit assignment；可记住 rank aggregation，应用范围偏窄。
- [Theia](https://arxiv.org/abs/2607.28269) 强调大规模多模态 caption 的自动验证与 data-free distillation；数据工程价值高，但不是核心 LLM agent 结果。
- [(Towards) Scalable Reliable Automated Evaluation](https://arxiv.org/abs/2607.28282) 用多 LLM pairwise comparison 与 Elo 逼近专家排序；目前案例与统计仍初步，可作为评测候选而非可靠 oracle。
- [Textual Requirements to Microservices](https://arxiv.org/abs/2607.28307) 系统比较 LLM 架构生成，问题重要，但主要是 design synthesis 能力盘点。
- [Structural Validation of Microservice Decompositions](https://arxiv.org/abs/2607.28331) 用源码依赖验证 o3 的分解：两个系统归一化 TPD 为 68.0%/83.3%，样本太少，但“必须控制 class mapping coverage”值得记住。
- [InfoOps Bench](https://arxiv.org/abs/2607.28503) 是 live 信息操作安全 benchmark；适合安全评测读者，和本日 post-training 方法主线关系较弱。

## 横向比较

| 论文 | 问题定义 | 方法新意 | 验证证据 | 可复现性 / 实用性 | 评估可信度 |
|---|---|---|---|---|---|
| OwlPath | 多跳仓库结构检索浪费上下文 | OWL2 闭包 + 3KB 知识地图 | SWE-bench Pro + 结构问答 | CLI 与多语言解析较实用 | 中高：端到端样本偏少 |
| SDO | 数据暴露与 batch 共现结构失衡 | KNN batch + 跨 epoch 暴露均衡 | SFT/DPO/GRPO | plug-and-play，但需 ANN | 中：主结果 seed 有限 |
| AgentS4D | runtime 风险被终局分数遮蔽 | 四维风险框架 + 七 checkpoint | 6,560 个 sandbox run | harness 级诊断价值高 | 高：执行证据充分 |
| Merge Conflict | LLM 覆盖与判断可信度混淆 | 校准 judge + 确定性结构检查 | 292 人工标签 + 真实冲突 | Java 流程容易复现 | 高：零 false accept 阈值清晰 |
| VeriSkill | skill 演化吸收错误失败信号 | 归因—抽象—验证 admission | 三 verifier、两 agent | 成本高，流程可复用 | 高：跨工具且有消融 |
| ChronoMem | post-exposure 后无法可靠忘记未来 | 全快照版本与语义回滚 | 两长期记忆 benchmark | ADK 集成实用，存储成本待测 | 中高：协议严格 |
| MemTxn | 可写记忆缺少事务边界 | PatchTest + 时态解析 + journal | 60 正例、179 hard negative、故障恢复 | 外置治理层易组合 | 中高：来源真实性不覆盖 |
| CSCR | 大 privileged shift 被误当好信用 | 反事实敏感度衰减 | 十个模型—任务组合 | GRPO 小改动 | 高：同轨迹控制与负消融 |
| DataClawEval | 数据工程 benchmark 过于玩具化 | 五引擎、确定性 sandbox | 100 任务、16 agent | 容器与脚本公开价值高 | 高：无 LLM judge |
| ClawTrack | outcome 无法区分幸运成功 | 双分数 + 12,541 rubric | 16k+ trials + 训练过滤 | rubric 成本高 | 中高：process judge 仍是 LLM |
| Locksmith Loop | 迁移缺少可执行语义 oracle | 双运行时 witness search | 3 个 COBOL→Java 案例 | 工业意义强，规模小 | 中高：确定性 parity |
| Lightning OPD 2.0 | cross-teacher 差异混入风格 | cross-fitted residualization | 五 benchmark、两 reference | 复用异源 SFT 数据很实用 | 高：matched replay 控制 |
| ORCA-bench | oncall 需要跨遥测与源码调查 | 50GB 六天生产式 testbed | 1,079 RCA 任务 | 环境重，但代表性强 | 高：SRE 签字与 judge 校准 |
| Sample More | 反思增益可能只是更多 token | 等成本 repeated-sampling 对照 | 36 配对比较 + 多重校正 | 代码与 generations 公开 | 高：负结果设计严谨 |
| PAIChecker | benchmark oracle 的 PR–issue 错位 | 多 agent + 代码级验证 | 三 benchmark、四 backbone | 可用于数据清洗 | 中高：人工定义仍有灰区 |
| OSReward | CUA reward model 未被系统评测 | full/hard/multi + 开放 RM | 27 judge + 100K 训练集 | 成本分析完整 | 高：人工多阶段标注 |

## 我的判断

**整体创新性：A-。** 最有新意的并不是某个单一 agent architecture，而是问题定义变得更严格：runtime lifecycle、post-exposure rollback、transactional memory、benchmark oracle 污染、cross-teacher style residual 都是过去平均分会掩盖的结构性变量。少数工作仍停留在新框架配新缩写，但本日强论文普遍能解释“为什么现有指标或训练信号会错”。

**实用价值：A。** DataClawEval、ORCA-bench、Locksmith Loop、OwlPath、HALO 和 MemTxn 都能直接落到真实系统接口：容器、遥测、parser、双运行时、transaction gate。限制是许多实现依赖昂贵 frontier model 或重型环境，复现成本不均衡。

**严谨性：A-。** Sample More 的等预算统计、Merge Conflict 的 judge 校准、AgentS4D 的完整配置矩阵、OSReward 的人工 hard-set 复核都很扎实。主要不确定性来自三处：若干论文只给少量端到端实例；process judge 仍可能共模偏差；一些 post-training 结果 seed 数有限或只覆盖数学推理。

**推荐价值：A。** 若只读五篇，我会优先选 AgentS4D、ChronoMem/MemTxn（二选一或连读）、CSCR、ORCA-bench、OSReward；若关心 coding agent benchmark 可信度，再加 PAIChecker；若关心 post-training 效率，则读 SDO 与 Lightning OPD 2.0。今天最值得带走的不是“哪个分数最高”，而是一个评估原则：**任何可靠性声明都应说明证据在哪个生命周期阶段产生、由谁维护、能否被回滚，以及 verifier 自己经过了什么验证。**
