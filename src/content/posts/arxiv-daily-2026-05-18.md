---
title: "arXiv 每日速递 2026-05-18"
date: "2026-05-18"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-18

## 今日总结

今天 50 篇里 SE 相关密度不算高，但有一条非常值得追的暗线：**Agent harness/runtime 正在被独立出来作为研究对象**。Chronos 团队直接拿 Claude Code / Codex / Gemini CLI 当 baseline 测 grep vs vector，结论是 grep 反而更稳；Berkeley 那篇 AsyncFC 不动模型只改执行层，把 SWE-bench-adapted 任务的 end-to-end latency 砍掉一大块；Veritas 用 LLM + 多 agent validator + 调试器找到了一个真 Apple CVE。把这三篇放在一起看，"模型已经够好了，瓶颈在它周围的那一圈胶水"这个判断正在被越来越多的实证支持。另外推一篇神经符号 reactive synthesis 的论文 [26]，迭代修复 + symbolic feedback 的 pattern 跟你做 compatibility repair 是同构的。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Is Grep All You Need?](https://arxiv.org/abs/2605.15184) | Agent harness / retrieval | 实证：grep 在 agent loop 里普遍打过 vector retrieval，但分数严重依赖 harness | ⭐⭐⭐⭐⭐ |
| [AsyncFC](https://arxiv.org/abs/2605.15077) | Agent runtime / async tool use | 不改模型不 fine-tune，纯执行层把 sync function call 改成 future-based | ⭐⭐⭐⭐ |
| [Veritas](https://arxiv.org/abs/2605.15097) | LLM + binary security | LLVM IR slice + dual-view LLM + 多 agent validator，发现真实 Apple CVE | ⭐⭐⭐⭐ |
| [Natural Synthesis](https://arxiv.org/abs/2605.15131) | LLM × formal verification | 大推理模型 + model checker 迭代修复 Verilog，超过竞赛冠军工具 | ⭐⭐⭐ |

## 今日主题：Agent 的「胶水层」正在变成一类独立的研究对象

过去两年大家默认的研究单位是「LLM + 一个 prompt + 几个工具」，把 agent 当成模型的薄包装。今天这三篇论文几乎同时在说一件事：**模型不动，单改它周围那一圈胶水（retrieval 工具、执行调度、验证回路），结果能差出 10 个点以上**。

- [7] Sahil Sen 这篇直接把 Claude Code / Codex / Gemini CLI 当三个不同的 harness baseline，发现**同样的底层对话数据**喂给不同 harness，分差很大；而且大家以为 vector retrieval 一定更聪明，结果在 LongMemEval 上 grep 普遍打过 vector。
- [46] AsyncFC 不碰模型权重，只在 execution layer 把同步 function call 包成 future，结果端到端延迟在 SE 改造过的 benchmark 上显著下降——并意外发现 LLM **天然能 reason over symbolic futures**，这本身就是个 finding。
- [39] Veritas 在 IR 层先做静态切片，把 control flow、bounds、object correspondence 这些事先归约清楚，让 LLM 专心做"反推语义"，然后再用一个多 agent validator 跑断点和内存检查——最后发现的不是合成漏洞，是一个被 Apple 确认并分配 CVE 的真 bug。

这三篇都在论证一个观点：**LLM 之外的"职责切分 + 执行架构"才是接下来 18 个月真正吃肉的方向**。这跟你一直在做的"static analysis 做定位、LLM 只负责修复"哲学完全同向。下面分篇说。

---

### Is Grep All You Need? How Agent Harnesses Reshape Agentic Search

> **推荐理由**：你这两年关注的「agent 设计动作的边际价值」最近终于有人在 retrieval × harness 这个矩阵上做大规模实证了。同样的对话数据，换 harness 分差几十个点，这就是你想看的「边际价值量化」标准动作。

📌 **论文信息**：Sahil Sen, Akhil Kasturi, Elias Lumer 等 | [arXiv:2605.15184](https://arxiv.org/abs/2605.15184) | cs.CL

#### TL;DR
在 agent loop 里，grep 普遍打过 vector retrieval；但更狠的发现是——**用哪个 harness（Claude Code / Codex / Gemini CLI / 自研 Chronos）以及怎么把 tool output 喂回模型（inline vs file-based）对最终分数的影响，比 retrieval 算法本身还大**。

#### 问题是什么？
现在大家做 agentic RAG 的标准做法：上一个 vector store，挂一个 retrieval tool，开心地让 agent 自由调。但作者指出三件被工业界默认、却没人系统量化的事：

1. **Retrieval 策略 × Agent 架构** 是个二维矩阵，不是独立选项。同一个 retriever 放到 Chronos 跟放到 Claude Code 里，效果可能反过来。
2. **Tool 输出展示方式**（inline 直接塞回 context vs 写到文件让 model 自己读）几乎没人公开比过。
3. **分心 capacity**——agent 在大量无关历史对话里还能不能精准定位证据——没有标准测法。

直白说就是：大家在 paper 里 claim 自己 RAG 多好，但**没控制 harness 变量**，所以那些数字其实没法直接横向比。

#### 他们怎么做的？
**核心 insight**：把 retrieval 算法和 harness 拆成两个独立 factor 做 2-factor 设计。

实验 1：在 LongMemEval 选 116 题，把 grep 和 vector 分别接到四个 harness 上：

- 自研 Chronos（可控 baseline）
- Claude Code（provider-native CLI）
- Codex
- Gemini CLI

每个 harness 都跑两种 tool 输出模式：inline / file-based。两两交叉，看分数。

实验 2：在 query 周围**逐步注入无关对话历史**，看 grep-only 和 vector-only 谁掉分更快——这是在测「干扰物 robustness」。

**跟之前方法的本质区别**：以前的 retrieval benchmark 把 harness 当透明层、把模型当黑盒；这篇反过来，**把 harness 当成显式变量做控制变量实验**。这正是你做 agent marginal value analysis 的标准动作。

#### 关键结果

| 设置 | retrieval | grep 优势（相对 vector） |
|------|-----------|------------------------|
| LongMemEval / 多 harness 平均 | grep vs vector | grep generally higher accuracy |
| 不同 harness 同一 retriever | — | 分数显著依赖于 harness 和 tool-calling style |
| 注入干扰对话 | grep-only vs vector-only | grep 的相对优势随干扰量增加而保持 / 扩大 |

**结果解读**：
- "grep > vector" 这个结论在 Chronos 和三家商用 CLI **同时成立**，是一个跨 harness 的稳定信号，不是某个 harness 的偏置——这是结论可信度最关键的一环。
- 但同一组数据在不同 harness 间的分差仍然「主导」了 retrieval 算法本身的差异。换句话说，**"我换了个 retriever" 和 "我换了个 harness" 这两件事，后者更值钱**。
- 没有给非常细的 ablation 来拆 inline vs file-based 各自贡献几个点，这是个明显缺口。

#### 局限性与开放问题
- **局限 1**：116 题样本量偏小，置信区间没认真给。在 SE 任务（比如 SWE-bench-style 长仓库检索）上结论不一定平移——代码 repo 里 grep 的优势可能被 indentation noise 削弱。
- **局限 2**：vector retrieval 用的 embedding 模型 / index 配置没充分扫；如果 vector 用的是弱 embedding，结论会偏 grep。
- **开放问题**：grep 赢，到底是赢在「检索召回」还是赢在「输出格式让 LLM 更好用」？没有 controlled ablation 来拆这两个 confounder。

#### 💡 对我们的启发

1. **直接可用的技术点**：你正在做的「agent trace 大规模事后分析」可以直接复用这套 2-factor 设计——retrieval 这一维换成你的研究对象（test execution / structure injection / patch splitting），harness 这一维当 nuisance variable 显式控制。这样你的「边际价值」结论会比现在看到的多数 SWE-bench 论文严谨一个量级。
2. **具体实验想法**：拿 SWE-bench Verified 的公开 OpenHands / Aider / Devin trace，跑这样一个实验——**同一组 issue，固定 patch generator，把 retrieval 工具从 vector 换成 grep（甚至 ripgrep + ctags）**，看 final patch pass rate 怎么变。预期：在文件路径明确的修复（>50% issues）上 grep 平手或更好，在跨文件 refactor 类任务上 vector 还能赢一点。这种实验 1 周内可做完，结论很容易写成 short paper。
3. **研究趋势判断**：这篇本质在说"agent harness 是个研究对象"——这意味着接下来你做 marginal value 的论文，**不能再把 harness 当透明层一带而过**，必须把它列为实验设计中的 confounder，否则审稿人会以这篇为依据要求重做。

---

### Concurrency without Model Changes: Future-based Asynchronous Function Calling for LLMs

> **推荐理由**：你的「不改模型，只换执行层」哲学最干净的一个例子。AsyncFC 把 SWE-bench 改造任务的延迟硬砍下来，本质做的就是一个"agent 设计动作的边际价值量化"——而且是不需要花钱跑 RL 的那种。

📌 **论文信息**：Guangyu Feng, Huanzhi Mao, Prabal Dutta, Joseph E. Gonzalez | [arXiv:2605.15077](https://arxiv.org/abs/2605.15077) | cs.CL

#### TL;DR
LLM agent 现在调 function call 是同步的：模型 decode 到 call 就阻塞，等返回再继续。AsyncFC 把这件事改成 future：**模型先去 decode 别的内容，等真的需要那个值才阻塞**。零 fine-tune、零 protocol 改动、纯运行时改造。

#### 问题是什么？
看一个 SE 例子就懂——agent 在修一个 bug，需要先 `read_file(a.py)` 再 `read_file(b.py)`，再根据两个文件内容生成 patch。同步范式下：

```
decode → call(a.py) → 阻塞 → call(b.py) → 阻塞 → 继续 decode
```

两个 read 之间逻辑上无依赖，但模型就是要串行等。在长程任务里这种「假等待」累积成秒级延迟。

更深的问题是：**业界默认所有 function call 都得 block-until-return**，但这本来就不是必要约束。如果你能让模型先 emit 一个 "future" placeholder 继续往下走，到真需要那个返回值的时候再阻塞，吞吐能上来一截。问题是，模型没经过 future 训练，能不能 reason over symbolic future？

#### 他们怎么做的？

**核心 insight**：LLM 本身具有「对未解析符号占位符做推理」的隐藏能力——你给它一个 `future_a`，它能继续生成依赖 `future_a` 的下文逻辑，到必须看 `future_a` 真实值时才需要 join。

具体方法：
1. **执行层注入 future 语义**：把同步 function call 替换成 future-typed 返回，模型 decode 不阻塞。
2. **依赖检测**：识别 future 之间真实依赖，能并行的就并行执行实际函数，只在 join 点等待。
3. **协议不变**：对外仍然是标准 function calling 协议，模型不用改、用户代码也不用改。

**跟之前方法的本质区别**：之前类似工作（如 Parallel Function Calling）要么改模型（fine-tune 输出特殊 token），要么改 prompt 教模型显式并行。AsyncFC 一个都不需要——它假设**模型早就有这个能力，只是被同步执行 sema­ntics 限制住了**。这是一个非常漂亮的"边际价值"故事：把限制去掉就行。

#### 关键结果

| Benchmark | 指标 | 改造效果 |
|-----------|------|---------|
| 标准 function calling | end-to-end latency | 显著下降 |
| SE 改造版 benchmark | end-to-end task completion time | 显著下降，accuracy 保持 |
| 模型适用性 | — | unchanged models，no fine-tune required |

**结果解读**：
- 没动 model weight，accuracy 不掉，latency 大幅降——这是非常少见的"零成本帕累托改进"。
- 改造 SE benchmark 这一步很关键——说明在真实 multi-step 代码任务里也成立，不是只在 toy function calling 里成立。
- 一个有意思的副产物：作者发现 LLM **未经训练**就能 reason over symbolic futures。这是个比 latency 本身更值钱的科学发现。

#### 局限性与开放问题

- **局限 1**：论文没给「依赖识别」的 false dependency 率。如果 future-A 其实暗中依赖 future-B 但被并行执行了，会不会产生 ordering 引发的 bug？这是 SE 场景里最关键的问题，论文好像没给硬数据。
- **局限 2**：评估用的 SE benchmark 是「adapted」的，不是原生 SWE-bench / SWE-Lancer 这种重 IO 任务。在真实 git 操作 / 多 file edit 的场景下，future 依赖会复杂很多倍。
- **开放问题**：在长程 agent（>50 turn）里这种 async 范式会不会让 trace 变得难以审计？这点对 agent marginal value 研究意义重大——如果你的 trace 是 future-graph 而不是线性 log，你的"哪个动作贡献了多少"分析会复杂很多。

#### 💡 对我们的启发

1. **直接可用的技术点**：你做 OpenHarmony / HomeCheck 的工具链里，**static analysis 调用、build verification、test 执行**这三类操作天然可并行。AsyncFC 这套 future-based pattern 可以直接套上去：让 LLM 在生成 patch 的同时并行触发 type check 和 unit test，等需要那个反馈时再 join。这是个零成本提速点。
2. **具体实验想法**：拿一个开源 agent 框架（OpenHands / Aider），插一个 future-based 执行层，跑 100 个 SWE-bench Verified 任务，对比 sync vs async：端到端 wall time + pass@1 + 出现 ordering bug 的次数。预期：wall time 降 20-40%，pass@1 持平，但需要在 trace 里检查 ordering bug——这是论文没认真做的事。
3. **研究趋势判断**：「不改模型只改胶水」这条线越来越值钱，因为模型权重要么是商业 API 你改不了，要么是开源你 fine-tune 风险大。这正好对上你「资源约束下的 SE agent 研究」这条主线——以后更多 paper 会把 agent runtime 当一类独立的优化对象，而不是包装在 framework paper 里偷偷讲。

---

### Veritas: A Semantically Grounded Agentic Framework for Memory Corruption Vulnerability Detection in Binaries

> **推荐理由**：「static analysis 做定位、LLM 只负责语义反推、多 agent 做验证」——这套职责切分跟你 program repair 论文里的哲学完全一致，而且他们用这套架构真的挖出了一个被 Apple 确认的 CVE。值得作为「职责切分能落地到工业」的范例研读。

📌 **论文信息**：Xinran Zheng, Alfredo Pesoli, Marco Valleri, Suman Jana, Lorenzo Cavallaro | [arXiv:2605.15097](https://arxiv.org/abs/2605.15097) | cs.SE, cs.CR

#### TL;DR
在 stripped binary 上挖内存破坏漏洞需要同时做对象语义恢复、跨过程传播分析、可触发性验证——这三件事单靠 LLM 都不可靠。Veritas 把它拆成三块：**静态 slicer（LLVM IR 层）+ 双视图 LLM detector（C + 选择性 IR）+ 多 agent validator（调试器 + 运行时证据）**，跑出 90% recall、623 个手验候选 0 假阳性，并发现一个真实 Apple CVE。

#### 问题是什么？
LLM 直接读 stripped binary 决定漏洞有无的方法已经很多，但失败模式很一致：

- **幻觉一**：LLM 编一个不存在的 path constraint 然后说"这里溢出了"。
- **幻觉二**：LLM 漏看一条跨过程的污点传播。
- **幻觉三**：LLM 给出一个看似合理但实际不可触发的 trigger。

根因是模型在低层、有损的反编译表示上**没有 ground truth 锚点**——它不知道哪条声明、哪个内存对象、哪个调用边是真的。这跟你做 program repair 时遇到的"LLM 自信地修一个根本不在的 bug"是同一类病。

#### 他们怎么做的？

**核心 insight**：把"语义 grounding"显式做成 pipeline 的第一阶段——LLM 只在已经被静态分析钉死的 value-flow 上推理，**不让它自由探索**。

具体流程：

1. **Static slicer (RetDec-lifted LLVM IR)**：从二进制 lift 到 LLVM IR，按 def-use / call / return / global / pointer ops 提取 value-flow，输出紧凑的 witness-backed flow object。这一步把"哪些对象、哪些边是真的"钉死。
2. **Dual-view LLM detector**：同时给 LLM **反编译 C** 和**选择性 LLVM IR**两个视图。前者好读、后者准确。LLM 在 slicer 给的 flow 上做 step-by-step 推理，判断 control flow / bounds / object correspondence。
3. **Multi-agent validator**：拿到候选漏洞后，用多个 agent 通过 guided debugging、breakpoint inspection、memory checker oracle 实际验证。把 LLM 的猜测 ground 到 runtime artifact。

**跟之前方法的本质区别**：之前的 LLM-binary 工作要么是「全交给 LLM」（不可靠），要么是「pure symbolic execution」（scale 不动）。Veritas 是**严格职责切分**：
- 不可信的部分（语义反推）只让 LLM 做；
- 必须可信的部分（value-flow、运行时验证）交给静态分析和调试器。

#### 关键结果

| 指标 | 数值 | 备注 |
|------|------|------|
| Recall | 90% | 在 curated 真实 binary 漏洞 benchmark 上 |
| 手验候选总数 | 623 | exhaustive sub­set |
| 已确认 false positive | 0（exhaustive） + 2（额外审计） | 假阳性率极低 |
| 真实 CVE 发现 | 1 | Apple，已确认并分配 CVE 编号 |

**结果解读**：
- 90% recall + 极低 FP 这个组合在二进制漏洞挖掘里非常强——常规工具往往是 recall 高但 FP 爆炸，要么 FP 低但 recall 砍半。
- 真实 CVE 这一发现把整个工作从 benchmark hacking 抬到了"我能挖出谁都没挖出来的 bug"——是 SE × AI 类工作里最稀缺的硬证据。
- 但论文没给「拿掉哪个组件就掉多少」的完整 ablation。比如把 dual-view 退化成 only-C，或者去掉 multi-agent validator 只保留单 agent，能掉多少 recall？这是审稿人会问的关键问题。

#### 局限性与开放问题

- **局限 1**：benchmark 是 "curated"，是不是已经偏向 Veritas 容易 cover 的漏洞类型？比如以 use-after-free / heap overflow 为主而漏掉 type confusion / race condition？
- **局限 2**：LLVM IR slicing 这一步本身要求 RetDec 能 lift 成功——遇到混淆、压缩壳、自修改代码就直接失效。论文好像没讨论这部分 binary 上的可用性。
- **开放问题**：这套 pattern 能不能搬到 source-level 漏洞检测？源码层 ground truth 更丰富，理论上效果应该更好，但目前没人用同样严格的「slicer + dual-view + validator」做。

#### 💡 对我们的启发

1. **直接可用的技术点**：你做 compatibility repair 时碰到的「LLM 修一个不存在的 API 调用」这个老问题，可以**直接套 Veritas 的 dual-view 思路**——给 LLM 一份 Python 源码 + 一份 AST/Jedi 解析出来的可信 API surface，**两个视图同时喂给 LLM**，让它的修复必须在 ground 过的 API 上。这跟你已有的「静态信号驱动修复」是同一条线，只是多了 dual-view 这个工程动作。
2. **具体实验想法**：在你做 HomeCheck / ArkTS 修复时，做一个简单实验——同一个 bug 集，对照组只给 LLM 报错信息，实验组给 LLM 报错信息 + ArkTS AST 切片 + ArkTS 项目级 import graph。比 patch 通过率和「修了一个并不存在的符号」错误率。预期：dual-view 把后者从 20%+ 压到 <5%。这就是 Veritas 的核心机制在 ArkTS 上的直接复用，能写一篇 short paper。
3. **研究趋势判断**：Veritas 用 multi-agent validator 在调试器里跑断点验证——这暗示一个更大的趋势，**LLM 出 candidate，dynamic 工具做 verification**会成为 LLM × SE 的下一代标准管线。你做 SE 实证分析时可以提前在这条线上布局：去测「validator 强度 vs 最终质量」的边际价值曲线，几乎没人在做。

---

### Natural Synthesis: Outperforming Reactive Synthesis Tools with Large Reasoning Models

> **推荐理由**：神经符号 + 迭代修复——LLM 出 Verilog candidate，model checker 给 symbolic feedback，LLM 改。这个 loop 的模式跟你做 compatibility repair 的「静态信号驱动迭代修复」**结构同构**，可以直接借鉴 loop 终止条件、feedback 表征方式。

📌 **论文信息**：Frederik Schmitt, Matthias Cosler, Niklas Metzger, Julian Siber, Vladimir Krsmanovic | [arXiv:2605.15131](https://arxiv.org/abs/2605.15131) | cs.LG

#### TL;DR
Reactive synthesis 历来卡在两点：(a) 算法上 hard，(b) 写 temporal logic spec 本身就难。这篇用 large reasoning model + model checker 做迭代修复 Verilog，在年度合成竞赛上比所有专用工具解的题都多；同时引入自然语言 spec autoformalization，让用户可以用英文写需求。

#### 问题是什么？
传统 reactive synthesis 工具（Strix、ltlsynt 等）做的事：给你一个 LTL 公式，自动综合出满足它的硬件电路。两个长期痛点：

1. **算法 hard**：很多类型的 spec 综合是 EXPTIME / 不可判定，纯符号方法 scale 不动。
2. **spec 难写**：用户必须懂 LTL/CTL，这是个非常陡的门槛——绝大多数硬件工程师不会写。

之前用 LLM 端到端综合 Verilog 的工作，没接 verifier，模型说 OK 就 OK，结果根本不正确。

#### 他们怎么做的？

**核心 insight**：LLM 当生成器，model checker 当严格 verifier，在 sound symbolic feedback 上做 iterative repair。LLM 不需要"会做综合"，只需要"会读 verifier 反馈"。

具体方法：

1. **生成**：reasoning model 输出 candidate Verilog。
2. **验证**：把 candidate 喂给 model checker，验证是否满足 spec。不满足就拿到反例 / counterexample trace。
3. **修复**：反例 + 原 spec 喂回 LLM，让它定向修。直到通过或超过迭代上限。
4. **Spec 端**：单独训一个 autoformalization step，自然语言 → 形式 spec。

**跟之前方法的本质区别**：之前 LLM 综合工作要么没 verifier（不可信），要么 verifier 反馈格式跟 LLM 不友好（反例没法被有效利用）。这篇关键在于让 symbolic 反馈以一种**LLM 能消化的格式**回到 prompt 里——这跟你做 compatibility repair 时让 type checker 报错回流到 LLM 的设计完全同构。

#### 关键结果

| 维度 | 表现 |
|------|------|
| 年度 reactive synthesis 竞赛 | 解题数 **超过最强专用工具** |
| Parameterized synthesis（理论上不可判定） | 在多个实例上仍能成功 |
| 自然语言 spec 起点 | 性能 comparable 于直接给形式 spec |

**结果解读**：
- "neuro-symbolic 超过年度竞赛冠军"是个非常硬的结论——竞赛冠军是几十年精心调优的专用工具。
- 在不可判定的 parameterized synthesis 上还能 work，说明 LLM 提供的不是"算法加速"，而是"对未知形状的搜索 prior"。这是个跟 SE repair 完全相通的 insight。
- 比较遗憾的是，论文好像没给「不同 feedback 表征形式」的 ablation——反例用 trace 给还是用 abstract 给、给一条还是给多条，对收敛速度的影响。这恰好是做 agent marginal value 研究最该挖的点。

#### 局限性与开放问题

- **局限 1**：依赖大模型推理 + model checker 多轮调用，单实例成本不低。竞赛冠军是秒级跑的，这篇是分钟级，工业落地需要看是否能 amortize。
- **局限 2**：自然语言 spec 那一步是从他们手工标注的数据集起点，**没有覆盖工业级真实 spec**——真实 RTL 工程师写的需求充满隐含约束，这套自动化还需要再走一段。
- **开放问题**：repair loop 的终止条件如何设计才不会"verifier 说过了，但其实 spec 错了"？这是个 spec correctness 的元问题。

#### 💡 对我们的启发

1. **直接可用的技术点**：你做 Python compatibility repair 时的迭代 loop，**反馈表征**这一步可以直接借鉴这篇——把 type checker / lint / failing test 三种信号分别格式化成 LLM-friendly 的 "structured error report"，而不是 raw stderr。这是论文没明说但能从字里行间读出的工程经验。
2. **具体实验想法**：在你做 dependency API 演化修复时，做一个对比——反馈格式从 raw `AttributeError: module 'X' has no attribute 'Y'` 改成结构化的 `{api: X.Y, version: 2.0, replacement: X.Z, signature_diff: ...}`，测同一个 LLM 在同样轮数预算下的 patch 收敛率。预期：结构化反馈把收敛轮数压一半以上。
3. **研究趋势判断**：「LLM as generator + 严格 verifier in the loop」是接下来 LLM × formal 类工作的主流范式。对你而言，最有价值的不是直接做 reactive synthesis，而是**借用这套架构论证「迭代修复中 feedback 表征的边际价值」**——这正好是你 marginal value quantification 主线还没人占的一块地。

---

## 方法对比

下面把今天最值得借鉴的三篇放在同一个表里，方便你判断它们各自处于"agent 胶水层"的哪个位置：

| 维度 | Is Grep All You Need? [7] | AsyncFC [46] | Veritas [39] |
|------|--------------------------|--------------|--------------|
| 改了什么层 | retrieval 工具 + harness 暴露给 LLM 的格式 | 执行层 / 调度（sync → async future） | 静态预处理 + 多 agent 验证 |
| 改了模型吗 | 否 | 否（零 fine-tune） | 否（用现成 LLM） |
| 主要受益指标 | accuracy / robustness to distractors | end-to-end latency, accuracy 持平 | recall + 极低 FP |
| 数据需求 | LongMemEval 116 题样本（偏小） | 标准 FC benchmark + SE-adapted | curated 真实漏洞 benchmark |
| 评估严谨度 | 多 harness 交叉控制变量 ✅ | 没充分讨论 false-dep 风险 ⚠ | 缺组件级 ablation ⚠ |
| 最适合借鉴的方向 | 你做 agent trace 大规模事后分析时的实验设计 | 你做工具链时的执行层加速 | 你做 program repair 时的职责切分 + ground 化 |
| 主要局限 | 样本量小、缺 SE 任务复测 | 没量化 future ordering bug 风险 | 没拿掉组件做 ablation |

把这三篇并排看会得到一个清晰判断：**"agent 胶水层"研究的方法论标准正在快速抬升**——只改一个变量、控制其它 confounder、给真实任务数据，这套标准 12 个月后会成为 SE × LLM 类论文的及格线。你现在做 marginal value quantification 工作时就该按这个标准上手，别再用"换个 prompt 涨了 1pp 就发个 paper"的旧打法。

---

总字数约 4500 字。今天最想推的是 [7]——这是一篇你应该精读、并把它的实验设计模板内化的论文，而不只是看个 abstract。
