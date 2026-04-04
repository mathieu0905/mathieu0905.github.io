---
title: "arXiv 每日速递 2026-04-04"
date: "2026-04-04"
description: "每日精选 arXiv 论文推荐：AI × Software Engineering 最新研究动态"
---

# arXiv 每日速递 2026-04-04

## 今日总结

今天的 arXiv 论文中，SE 和 LLM 安全方向各有亮点。一篇直接做 LLM 反编译的工作把小模型训成了 Dart 语言的 idiomatic decompiler，对低资源语言的跨语言迁移有很好的启发；LLM 安全方面，一个巧妙的 "Trace Inversion" 方法通过反推 reasoning trace 来检测模型是否在回答错误的问题，为 abstention 提供了新思路。此外，De Jure 展示了 LLM 自我迭代修复在规则提取上的潜力，Neuro-RIT 则从神经元粒度切入解决 RAG 的噪声鲁棒性问题。总的来说，今天值得细读的论文不多，但这 4 篇在方法论上都有可迁移的 insight。

---

### LLMs as Idiomatic Decompilers: Recovering High-Level Code from x86-64 Assembly for Dart

> **推荐理由**：直接关联 LLM for Code + 低资源编程语言方向，跨语言迁移的实验设计对仓颉语言研究有直接参考价值

📌 **论文信息**：Raafat Abualazm, Ayman Abo Elhassan | [arXiv:2604.02278](http://arxiv.org/abs/2604.02278v1) | cs.SE

#### TL;DR
用 4B 参数的小模型做 x86-64 汇编到 Dart 的 idiomatic 反编译，效果接近 ~480B 的大模型；同时发现跨语言数据（Swift → Dart）的迁移存在模型容量门槛。

#### 问题是什么？
反编译（把机器码还原成可读代码）一直是逆向工程的核心难题。现在 LLM-based decompilation 在 C 语言上已经做得不错了，但像 Dart、Swift 这类现代语言完全没人碰过。问题在于：这些语言的训练数据稀缺，你没法像 C 那样找到海量的汇编-源码对。这跟我们做仓颉语言支持面临的困境如出一辙——数据少，怎么让模型学会一门新语言？

#### 他们怎么做的？
核心 insight 很直接：**用合成数据 + 跨语言迁移来弥补数据不足**。具体做法是：
- 先用 synthetic same-language examples 训练（自动生成 Dart 代码再编译得到汇编-源码对）
- 然后尝试加入 related-language 数据（Swift 的汇编-源码对）来做跨语言迁移
- 在 4B 和 8B 两个规模上对比这两种数据增强策略

跟之前 C 语言反编译工作的关键区别：不追求语义等价，而是追求 **idiomatic**——生成的代码要像人写的 Dart，有有意义的变量名和 Dart 风格的代码结构。

#### 效果如何？
- 4B 特化模型：CODEBLEU 71.3（95% CI 65.5-77.1），接近 ~480B 大模型的 73.1
- compile@k5 在 34 个自然 Dart 函数上达到 79.4%，base model 只有 64.7%
- **关键发现**：Swift 数据在 8B 模型上有帮助，但在 4B 上没用——说明跨语言迁移存在 **capacity threshold**，模型太小装不下两种语言的知识
- 这个容量门槛的发现很实在，不是"越大越好"的废话，而是给出了一个具体的设计约束

#### 💡 对我们的启发
这篇论文对仓颉语言的 fine-tuning 工作有直接参考价值：
1. **合成数据策略可以直接复用**：仓颉的编译器如果能产出汇编-源码对，就可以用类似方法生成训练数据
2. **跨语言迁移的容量门槛**：我们在做仓颉 fine-tuning 时，如果想用 TypeScript/Kotlin 数据做迁移，需要关注模型大小是否足够支撑跨语言知识
3. **idiomatic 而非 semantic 的评估思路**：对低资源语言来说，先追求"看起来像人写的"可能比追求"完全语义正确"更实际

---

### Answering the Wrong Question: Reasoning Trace Inversion for Abstention in LLMs

> **推荐理由**：与 LLM safety / robustness 方向直接相关，提出了一种检测 LLM hallucination 的新范式，可用于 jailbreak 检测

📌 **论文信息**：Abinitha Gourabathina, Inkit Padhi, Manish Nagireddy, Subhajit Chaudhury, Prasanna Sattigeri | [arXiv:2604.02230](http://arxiv.org/abs/2604.02230v1) | cs.AI

#### TL;DR
把 LLM 的 hallucination 重新定义为"回答了错误的问题"，通过反推 reasoning trace 还原模型实际在回答什么问题，如果跟原问题不匹配就拒绝回答。在 9 个数据集上 36 个设置中有 33 个超过了所有 baseline。

#### 问题是什么？
Reasoning model（比如 o1、DeepSeek-R1）虽然在复杂任务上表现更好，但它们的 abstention 能力反而更差——该说"不知道"的时候不说。这很危险：模型会自信地给出一个看起来很有道理但实际上是编造的答案。现有的 abstention 方法（基于 logit、verbalized confidence）在 reasoning model 上效果打折扣，因为长长的 chain-of-thought 让模型"说服了自己"。

#### 他们怎么做的？
核心 insight 非常巧妙：**hallucination 不是"回答错了"，而是"回答了错误的问题"**。基于这个重新定义，他们提出了 Trace Inversion：

1. 让模型正常生成 reasoning trace
2. **只基于 reasoning trace**（不看原问题），让另一个模型反推"这个 trace 最可能是在回答什么问题"
3. 把反推出的问题和原始问题做相似度比较
4. 相似度低 → 模型偏题了 → 触发 abstention

这个方法的美在于它不需要 ground truth，也不需要额外训练，纯粹利用了 reasoning trace 本身包含的信息。

#### 效果如何？
- 在 4 个前沿 LLM（包括 GPT-4o、Claude 3.5 Sonnet）上测试
- 覆盖 9 个 QA 数据集，36 个实验设置中 33 个 SOTA
- 在 reasoning model 上提升尤其显著，因为它们的 trace 更长、包含更多可供反推的信息
- Abstention 的精度大幅提升，同时保持了正确问题的回答率

#### 💡 对我们的启发
这个 "回答了错误的问题" 的框架可以迁移到 jailbreak 检测：
1. **Jailbreak 检测的新角度**：很多 jailbreak 本质上就是让模型"误解"了真正的问题。可以用 trace inversion 检查模型是否被 jailbreak prompt 引导到了一个不同的"理解"上
2. **Multi-agent jailbreak 的防御**：在多轮攻击中，每一步都做 trace inversion 检查，看模型是否逐渐偏离了安全边界
3. **不需要训练的即插即用特性**：这个方法可以直接叠加在现有的 safety pipeline 上，作为一个额外的检查层

---

### De Jure: Iterative LLM Self-Refinement for Structured Extraction of Regulatory Rules

> **推荐理由**：迭代式 LLM 自修复 + 结构化规则提取，方法论可直接迁移到 domain rule mining 和 program repair

📌 **论文信息**：Keerat Guliani, Deepkamal Gill, David Landsman, Nima Eshraghi, Krishna Kumar | [arXiv:2604.02276](http://arxiv.org/abs/2604.02276v1) | cs.AI, cs.CL, cs.LG

#### TL;DR
一个完全自动化的流水线，用 LLM-as-a-judge 做 19 维评估 + 迭代修复，从法规文档中提取结构化规则，无需人工标注。在下游 RAG 问答中被偏好的比例高达 84%。

#### 问题是什么？
把密密麻麻的法规文档转成机器可读的结构化规则，是一件极其费人力的事。想象一下，一份金融监管文件有几百页，里面嵌套着各种条件、例外和交叉引用。人工标注成本高、速度慢，而且容易遗漏。直接让 LLM 一次性提取？效果不稳定，因为法规的层级结构和语义复杂度远超普通文本。

#### 他们怎么做的？
核心 insight 是 **用 LLM 评估 LLM 的输出，然后让 LLM 自己修复低分部分，形成闭环迭代**。四个阶段：

1. **文档规范化**：把 PDF 等格式统一转成结构化 Markdown
2. **语义分解**：LLM 把文档拆分成独立的规则单元
3. **多维评估**：LLM-as-a-judge 从 19 个维度打分（包括元数据、定义、规则语义）
4. **迭代修复**：低分的规则单元进入修复循环，先修上游（文档规范化），再修下游（规则提取），有固定的 regeneration budget

关键设计是 **upstream-first repair**——先确保文档解析没问题，再修规则提取。这比直接修输出要高效得多。

#### 效果如何？
- 在金融、医疗、AI 治理三个领域的法规语料上测试
- 金融领域在 3 次迭代内达到峰值性能，提升单调递增
- 在 RAG 下游问答中，De Jure 提取的规则在 single-rule retrieval 下被偏好 73.8%，broader retrieval 下 84.0%
- 开源和闭源模型都能用，跨领域泛化能力好

#### 💡 对我们的启发
这篇论文的方法论对我们的两个方向有价值：
1. **Domain rule mining**：我们在 OpenHarmony 生态做领域规则挖掘时，可以借鉴这个 "LLM 提取 + LLM 评估 + 迭代修复" 的流水线。ArkTS 的 API 文档和迁移规则就是一种"领域法规"
2. **Program repair 的迭代策略**：upstream-first repair 的思路可以用在 fault localization → patch generation 的流水线中——先确保定位准确，再修 patch，而不是一次性端到端
3. **19 维评估框架**：这种细粒度的多维评估比简单的 pass/fail 更适合评估 LLM 生成的代码修复质量

---

### Neuro-RIT: Neuron-Guided Instruction Tuning for Robust Retrieval-Augmented Language Model

> **推荐理由**：从神经元粒度理解 LLM 如何处理噪声输入，方法论可迁移到 LLM security 和 prompt robustness 研究

📌 **论文信息**：Jaemin Kim, Jae O Lee, Sumyeong Ahn, Seo Yeon Park | [arXiv:2604.02194](http://arxiv.org/abs/2604.02194v1) | cs.CL, cs.AI

#### TL;DR
通过 attribution-based neuron mining 找出 LLM 中分别负责处理"相关上下文"和"无关上下文"的神经元，然后选择性地关闭后者、强化前者，让 RAG 系统对噪声检索结果更鲁棒。

#### 问题是什么？
RAG 系统的一个老问题：检索回来的文档经常有噪声（不相关甚至误导性的内容），这会让 LLM 的回答质量大幅下降。现有的鲁棒性增强方法都是在 layer 或 module 级别做粗粒度的参数更新，忽略了 LLM 内部神经元级别的稀疏性——实际上只有一小部分神经元在"处理噪声"，你没必要动所有参数。

#### 他们怎么做的？
核心 insight：**LLM 处理相关信息和无关信息用的是不同的神经元子集，可以分开操作**。具体做法：

1. **Attribution-based neuron mining**：用归因分析找出两类神经元——处理相关上下文的"有用神经元"和处理无关上下文的"噪声神经元"
2. **两阶段 instruction tuning**：
   - 第一阶段：功能性地"关闭"噪声神经元（直接抑制噪声）
   - 第二阶段：优化目标层做 evidence distillation（强化从有用上下文中提取答案的能力）

跟之前方法的区别：之前是"教模型忽略噪声"（整体优化），这里是"直接切断噪声的通路"（精准手术）。

#### 效果如何？
- 在多个 QA benchmark 上一致超过强 baseline 和现有鲁棒性增强方法
- 关键是在保持正常问答能力的同时提升了噪声鲁棒性（不是以牺牲性能为代价）
- 论文展示了清晰的神经元可视化，确实能看到 relevant 和 irrelevant context 激活了不同的神经元群

#### 💡 对我们的启发
这篇论文的神经元级分析方法可以迁移到 LLM security：
1. **Jailbreak 机制理解**：用类似的 attribution 方法找出 LLM 中负责 safety alignment 的神经元 vs 被 jailbreak 绕过的神经元，可以更精准地理解 jailbreak 为什么能成功
2. **Prompt robustness**：如果能识别出哪些神经元对 prompt 扰动敏感，就可以针对性地做 hardening，而不是整体 fine-tuning
3. **Defense 设计**：类比 Neuro-RIT 的"关闭噪声神经元"，我们可以设计一种防御机制——检测到 jailbreak 信号时选择性地强化 safety 神经元的激活
