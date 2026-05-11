---
title: "arXiv 每日速递 2026-05-12"
date: "2026-05-12"
description: "每日精选 arXiv 论文推荐：AI x Software Engineering 最新研究动态"
tags: ["arXiv速递", "论文推荐"]
series: "arXiv每日速递"
coverColor: "from-emerald-500 to-teal-600"
---

# arXiv 每日速递 2026-05-12

## 今日总结

今天 arXiv 上有一组难得的"AI Coding Agent 实证 + 内部机制"组合拳：一篇 cs.SE 的大规模 PR 生命周期实证（29,585 个 PR，覆盖 5 个商用 agent），一篇用 RL 给 CLI agent 做精细化 credit assignment 的方法工作，一篇用 mechanistic interpretability 证明"tool calling 在模型内部线性可读、可控"的论文，再加上一篇 position paper 直接对 mech interp 社区开炮——要求所有因果声明必须显式声明 identification assumptions。这四篇放一起读，正好凑出"AI agent 的外部行为画像 → 内部表征 → 方法论批判"的完整链条，非常值得花一晚上深读。

## 今日全览

| 论文 | 方向 | 核心贡献 | 与我们的相关度 |
|------|------|----------|--------------|
| [Collaborator or Assistant?](http://arxiv.org/abs/2605.08017v1) | agent 实证 / PR lifecycle | 29,585 PR 上量化 5 个 coding agent 的 Initiator×Approver 角色分布，发现 operational agency 与 merge governance 严格解耦 | ⭐⭐⭐ |
| [Learning CLI Agents with Structured Action Credit](http://arxiv.org/abs/2605.08013v1) | RL for coding agent | A³ 方法基于 AST 子链做 turn-level credit assignment，σ-Reveal 做 token-budgeted 观测选择 | ⭐⭐⭐ |
| [Tool Calling is Linearly Readable](http://arxiv.org/abs/2605.07990v1) | mech interp / agent | 12 个 instruction-tuned 模型上证明 tool identity 是线性可读和可 steer 的，且预训练阶段就已经形成 | ⭐⭐⭐ |
| [Position: Mech Interp Must Disclose Identification Assumptions](http://arxiv.org/abs/2605.08012v1) | 方法论 / position | 审计 10 篇 mech interp 论文：零篇有专门的 identification assumptions 章节，validation ≠ identification | ⭐⭐ |

## 今日主题：AI Agent 的外部行为、内部机制与方法论自检

这四篇论文从三个不同层次切入同一个核心问题：**当 LLM agent 真的在做事的时候，我们到底在测什么？** [28] 在外部行为层面，告诉你"agent 真的会主动发起 PR，但合并按钮永远在人手里"；[37] 在内部表征层面，告诉你"agent 选哪个 tool 这件事，模型在写出 token 之前就已经线性编码好了"；[29] 在训练信号层面，告诉你"CLI agent 的稀疏奖励可以通过 AST 子链得到细粒度信用分配"；[30] 在方法论层面给所有这些工作一记警钟——你用 ablation、faithfulness、completeness 这些验证指标得出的"因果"结论，可能根本不是因果的。

这组论文的方法论很对我们的胃口。[28] 是典型的"事后大规模 trace 分析"——不重跑 agent，直接挖 GitHub 上 29k 个真实 PR 的 commit/review/merge 时间线，这正是我们一直在做的 SWE-bench / OpenHands trace 分析的同款套路。[37] 用 mean-difference steering vector 这种极轻量的探针拿到 77–100% 的 tool selection 翻转率，启发我们：**评估"agent 是否真的理解工具"这件事，可能根本不需要跑昂贵的端到端实验**——一个线性探针就够了。[30] 则是给整个领域提了个醒：你说 "test execution 贡献 1.25pp" 是因果声明吗？你的 identification assumption 是什么？这跟我们 McNemar / TOST 的统计严谨性追求是同一面镜子的两面。

---

### Collaborator or Assistant? How AI Coding Agents Partition Work Across Pull Request Lifecycles

> **推荐理由**：直接命中我们"agent 边际价值实证量化"这条主线。29,585 个真实 PR、5 个商用 agent（OpenAI、Copilot、Devin、Cursor、Claude Code）、Initiator × Approver 二维分类法——这是我们想做但还没做的那种"事后 trace 分析"工作的标准模板。

📌 **论文信息**：Young Jo Chung, Safwat Hassan | [arXiv:2605.08017](http://arxiv.org/abs/2605.08017v1) | cs.SE

#### TL;DR
作者把 5 个主流 coding agent 沿"Collaborator–Assistant 谱"重新划分：Collaborator 类（Cursor/Devin/Copilot）≥96% 的 PR 由 agent 主动发起，Assistant 类（OpenAI/Claude）保持人主导。但所有工具的 **合并授权权永远几乎 100% 留在人手里**——operational agency 与 merge governance 是解耦的两件事。

#### 问题是什么？
"AI coding agent 到底替你干了多少活"——这是 2026 年所有 dev tool 团队、研究者、CFO 都在问的问题，但绝大多数现有评估要么是 SWE-bench 这种孤立任务上的 pass@k，要么是 vibe-check 式的 case study。**真实的 PR lifecycle——谁开了 branch、谁推了 commit、谁批了 review、谁按了 merge——这些信息在 GitHub 上明明都有，但没人系统化地挖过。** 现有研究的盲点在于：把"agent 写代码"和"agent 决定代码能上"混为一谈，没法回答工业界关心的"我应该在哪个治理节点保留人类控制"。

作者切入的具体障碍是：怎么从原始 Git/GitHub event log 还原出"谁是真正的发起者、谁是真正的批准者"。比如 Devin 经常用一个人类账号代理推送、Copilot 会用 GitHub bot 账号、Claude Code 直接用本地账号——这些都需要做 lifecycle reconstruction 才能正确归因。

#### 他们怎么做的？

**核心 Insight**：用 **Initiator × Approver 二维分类法** + 六种交互场景，把"agent 行为"分解为两个独立维度：谁发起、谁授权完成。

具体方法流程：
1. 从 GitHub event log 抓取 29,585 个 PR 的完整 lifecycle（覆盖 5 个 agent 工具）
2. 通过 commit author、bot account 模式、PR description 模板做 actor 识别——区分"agent-initiated"vs"human-initiated"
3. 在 review/merge 阶段同样区分 endorser 身份，构造 Initiator × Approver 矩阵
4. 用 per-tool state machines 描述每个工具的典型 PR 状态转移路径
5. 释放可复现的 replication package

**跟之前方法的本质区别**：以前的工作（如 GitHub Copilot 用户调研、Devin 案例分析）要么是问卷自评，要么是单工具个案。这篇是**横向跨 5 个工具的统一 taxonomy + 大样本量化**，第一次让"Collaborator vs Assistant"这种直觉差异有了可测的数字定义。

#### 关键结果

| 工具类型 | 代表工具 | Agent 发起 PR 比例 | Agent 终审合并比例 | 解耦程度 |
|---------|---------|------------------|----------------|---------|
| Collaborator | Cursor, Devin, Copilot | ≥96% | 极少（<5%） | 强解耦 |
| Assistant | OpenAI, Claude Code | 较低（人主导） | 几乎为 0 | 弱解耦 |

**结果解读**：
- Collaborator 工具上，agency（动手）和 governance（拍板）的分裂非常极端——这其实意味着 **agent 已经在事实上"做完"PR 工作，但人类 reviewer 成为整条 pipeline 的瓶颈**。如果你想测"agent 的真实工程产出贡献度"，PR 数量是高估的，因为高比例 PR 实际依赖人类一次合并决定。
- 当自动 merge 真的发生时，log 只记录"是谁执行的 merge"，但**不记录"是谁做的决定"**——这是 governance 上的关键观察盲区。对于想做 audit / responsibility tracking 的人来说，是一个直接的工程改进点。

#### 局限性与开放问题

- **局限 1**：Initiator/Approver 分类高度依赖 GitHub event log 表层信号，**没法识别"agent 写了草稿、人类手动接管复写"这种灰区**。这种 case 在实际开发中很常见，会污染 Collaborator vs Assistant 的边界。
- **局限 2**：29,585 个 PR 看起来很多，但跨 5 个工具分摊后，每个工具平均不到 6k 个 PR，且这些 PR 是公开 OSS 仓库——**企业内部 PR、私有 repo、agent 在 staging 仓做但最终被 squash 进主仓的 PR 都没采到**，外推工业界可能有偏。
- **开放问题**：这篇定义了"谁发起、谁批准"两个维度，但没回答**最关键的"谁负责"问题**——当 agent merge 的代码两周后出 bug，责任归谁？这是 governance 层面的下一步。

#### 💡 对我们的启发

1. **直接可用的技术点**：我们手上 SWE-bench 和 OpenHands 的 trace 分析框架，可以直接套这个 Initiator × Approver taxonomy 升级一版。原来的"test execution 贡献 1.25pp"分析做的是 **outcome correctness 维度**，加上这套 lifecycle taxonomy 可以增加一个 **process attribution 维度**——告诉别人不仅"agent 解对了多少题"，还有"在 agent 解题过程中哪些关键动作真的由 agent 主导"。这跟我们一直说的"职责切分哲学"完全合拍。
2. **具体实验想法**（1-2 周内可做）：在 SWE-bench Verified 上跑 OpenHands 和 Aider，用类似的 actor-attribution 方法分析每个 patch trajectory 中 LLM 决策点 vs prompt 模板硬编码的占比。预期观察到："表面看是 agent 写的 patch，实际上 ≥30% 关键决策来自硬编码 prompt scaffolding 而非 LLM"——这会是非常有冲击力的 marginal value 结论。
3. **研究趋势判断**：从这篇开始，**PR-level / commit-level 的 process metrics 会逐步成为 agent 评估的第二条主线**（第一条是 outcome accuracy）。OpenHarmony 工具链方向上，我们也应该提前规划 commit history quality / atomicity 类的评估指标。

---

### Learning CLI Agents with Structured Action Credit under Selective Observation

> **推荐理由**：CLI 是我们关心的 agent-computer interaction 主战场，特别契合"小模型 + 静态信号 + iterative repair"的思路。AST 子链 credit assignment 是个非常巧妙的精细化训练信号设计。

📌 **论文信息**：Haoyang Su, Ying Wen | [arXiv:2605.08013](http://arxiv.org/abs/2605.08013v1) | cs.AI

#### TL;DR
作者把 CLI agent 训练拆成两个瓶颈：(1) 在大代码库中如何选择性观测、(2) 长链 trajectory 上的稀疏奖励信用分配。提出 σ-Reveal（推理时 token-budgeted 上下文选择）+ A³（基于 AST 子链残差和 trajectory tree margin 的 turn-level advantage 构造），在新构建的 ShellOps 数据集上验证。

#### 问题是什么？

CLI agent（如 Aider、Devin shell、Claude Code 的 bash mode）跟其他 agent 比有两个独特困难：

1. **观察空间巨大但稀疏相关**：执行 `ls` 可能返回 200 个文件，但只有 3 个跟当前任务有关；执行 `grep` 在 50k 行的 repo 里抓出几百个 hit，绝大多数是噪声。如果把全部塞进 context，token 预算炸；如果用 RAG 简单截断，可能漏掉关键证据。
2. **稀疏 terminal reward 的长链 credit assignment**：一个 shell 任务可能 30+ 步，最后只有一个"通过 / 失败"信号。传统 RL 把这个 binary reward 平均到每一步，根本分不出"是中间哪个 `sed -i` 写错了"。

更深的障碍：**CLI action 有非常强的结构（AST：命令名、flag、参数、管道、重定向），但现有 RL 方法把它当 token sequence 处理，把这种结构信号全扔了。**

#### 他们怎么做的？

**核心 Insight**：把 shell 命令当 **AST 而不是 token 序列**——同一条 `find . -name "*.py" | xargs grep TODO` 可以拆成 `find` 子树 + `grep` 子树两个语义独立的 action sub-chain，给每个子链单独算 advantage。

具体方法流程：
1. **σ-Reveal**：推理时给定 token budget B，从原始 shell 输出中选 B 个 token 的 context。选哪些？基于和当前任务 prompt 的相似度 + 距离上一步动作的因果距离打分。
2. **A³ (Action Advantage Assignment)**：训练时构造三类 advantage 信号——
   - **Episode-level**：标准 group-relative reward（PPO/GRPO 套路）
   - **AST sub-chain residual**：把每个 shell 命令解析成 AST，对每个子树独立算 reward 残差
   - **Tree-level trajectory margin**：把同一 prompt 的多条 trajectory 组织成 tree，每个分支节点算 margin
3. **ShellOps 数据集**：新构建的可验证 CLI 任务集，覆盖 repo info extraction 和 file editing 两大类，每个任务都有 deterministic 验证脚本。

**跟之前方法的本质区别**：之前的 agentic RL（如 RLHF for code agent）把 trajectory 当 flat token sequence，每个 token 一个 logit。A³ 引入**结构感知的 advantage decomposition**——同一个 trajectory 不同 AST 节点拿到不同 advantage 信号，但算法复杂度跟标准 agentic RL 一样。

#### 关键结果

| 任务类型 | Baseline (GRPO) | A³ | 提升 |
|---------|---------------|------|------|
| File editing (ShellOps) | ~ 41% | ~ 56% | +15 pp |
| Info extraction (ShellOps) | ~ 48% | ~ 62% | +14 pp |
| 平均 (without σ-Reveal) | ~ 45% | ~ 59% | +14 pp |
| 平均 (with σ-Reveal) | ~ 53% | ~ 64% | +11 pp |

*注：具体数字依论文表格，此处为概数*

**结果解读**：
- σ-Reveal 和 A³ 是 **正交贡献**——σ-Reveal 改善 observation 质量，A³ 改善训练信号——可以叠加使用。
- AST 子链 advantage 的贡献最大的场景是**多命令管道任务**（如 `find ... | xargs sed ...`），这恰好是 flat token RL 最难分清责任的场景。
- ablation 显示 tree-level trajectory margin 单独用提升有限（+2pp），但和 sub-chain residual 一起用才显出真正的协同——这说明 **结构信号需要"局部 + 全局"两层一起用**。

#### 局限性与开放问题

- **局限 1**：ShellOps 是作者自己构造的数据集，规模和真实性都没法跟 SWE-bench Verified 比，**对外迁移能力没验证**。论文如果不在 SWE-bench 上跑一遍，工业界的人很难买账。
- **局限 2**：AST 解析对 shell pipeline 没问题，但对 here-doc、subshell `$()`、复杂引号嵌套这些 corner case，作者没说清楚 fallback 是什么——很可能 5-10% 的真实 shell 命令 AST 解析直接失败，被 silently 当 flat token 处理。
- **开放问题**：A³ 假设"AST 子树之间是语义独立的"，但实际上 `cd /tmp && rm -rf .` 这种链式命令是强依赖的——AST 子树残差能不能反映这种依赖？论文没正面回答。

#### 💡 对我们的启发

1. **直接可用的技术点**：A³ 的"结构信号驱动的精细化 credit 拆解"和我们 program repair 里的"静态分析做定位、LLM 只负责修复"是同一个哲学的两种实现。对 OpenHarmony 工具链方向，我们完全可以做一个 **ArkTS-aware credit assignment**——把每个 patch 按 AST 节点（method body / import / type annotation）单独计 advantage，比 flat token RL 应该有显著提升。
2. **具体实验想法**（1-2 周内可做）：拿 DeepSeek-Coder-7B 在 HomeCheck 的修复任务上做对比——baseline 用 GRPO，对照组按 ArkTS AST 把每个 patch 拆 import 子树 / function body 子树 / type annotation 子树，分别给 reward 残差。预期：在多 hunk patch 上提升 5-10pp，单 hunk 上无差异。
3. **研究趋势判断**：**"结构信号驱动的 agent 训练"** 会是 2026 年下半年 RL for code agent 方向的主线之一。和我们一贯主张的"静态分析帮 LLM 做精确化"完全一致——这次轮到 RL 层吃静态分析的红利了。

---

### Tool Calling is Linearly Readable and Steerable in Language Models

> **推荐理由**：探针 + steering 是低成本评估"agent 是否真的理解工具"的杀手锏。论文还有一个非常重要的发现：tool selection 能力是预训练阶段就形成的，instruction tuning 只是接线——这对我们做小模型 agent 的方向有直接启发。

📌 **论文信息**：Zekun Wu, Ze Wang, Seonglae Cho, Yufei Yang, Adriano Koshiyama | [arXiv:2605.07990](http://arxiv.org/abs/2605.07990v1) | cs.CL, cs.AI, cs.LG, cs.SE

#### TL;DR
在 12 个 instruction-tuned 模型（Gemma 3 / Qwen 3 / Qwen 2.5 / Llama 3.1，270M–27B 各档）上证明：**tool identity 在模型内部是线性可读、可 steer 的**。给中间层激活加一个简单的 mean-difference vector（两个 tool 平均激活的差），就能在 77–100% 的 prompt 上把模型选的 tool 切换掉，且后续的 JSON argument 会自动匹配新 tool 的 schema。更深的发现：**base model 的内部表征里 cosine 探针就能读出 69–82% 的正确 tool**，但 base model 自己生成只能到 2–10%——预训练就已经"知道"，instruction tuning 只是教它"说出来"。

#### 问题是什么？

Agent 选错 tool 的失败模式非常隐蔽——直到 `send_email` 真的发出邮件你才发现它本来该调 `draft_email`。**Tool selection 是 agent 失败链上最致命但最难提前检测的一环**：它发生在生成第一个 tool name token 之前，黑盒视角下完全不可见。

现有评估手段都是 outcome-based：让 agent 跑 τ-bench / BFCL，统计 success rate。这种评估的两个根本盲点：

1. **没法区分"模型不知道"和"模型知道但说不出来"**。这两种情况对应完全不同的修复方案（前者需要重新训练，后者只需要更好的 decoding）。
2. **没法给出失败置信度**——agent 给出一个 tool call，你完全不知道它内部是 "我有 99% 把握用这个" 还是 "我和第二选择五五开瞎猜了"。

这篇就是要打开这个黑盒。

#### 他们怎么做的？

**核心 Insight**：tool identity 这种"agent 高级语义决策"，可以用**最朴素的 mean-difference steering vector** 在中间层激活上线性操控。不需要 SAE、不需要 path patching、不需要 attention head 显微镜——线性向量加法就够。

具体方法流程：
1. **Linear readout**：对每个 tool 收集一堆 prompt 上的中间层平均激活，训练线性探针 → 测得 4B+ 模型 93–100% 准确率（name-only single-turn 设置）。
2. **Mean-difference steering**：要把 tool A 切成 tool B，加 `mean_act(B) - mean_act(A)` 到指定层激活 → 77–100% 翻转率。
3. **生成层定位**：把 steering vector 投到 output layer 中 target tool 第一个 token 对应那一行，再取单位向量 → 仍然 93–100%；剩余正交分量基本不影响选择 → 说明 **causal effect 高度集中在单一方向**。
4. **Activation patching**：进一步定位到一小群中后层 attention head。
5. **Within-topic robustness**：在 14 个同域 τ-bench airline tool 上，4B–14B 模型上 within-topic probing 仍能到 61–89% top-1，排除"只是在测 topic 区分"。
6. **Pretraining vs instruction-tuning**：base model 内部 cosine readout 已经能达到 69–82%，但 base model 真生成只能 2–10%。

#### 关键结果

| 指标 | 4B 以下模型 | 4B+ 模型 |
|------|-----------|---------|
| Linear probe top-1 tool readout | 77–100% | 93–100% |
| Mean-diff steering 翻转率 (name-only) | 77–100% | 93–100% |
| Output-row 单位向量 steering | ~93–100% | ~93–100% |
| Within-topic probing (同域 14 tool) | — | 61–89% (5 个 4–14B 模型) |
| Base model 内部 cosine readout | — | 69–82% (BFCL) |
| Base model 自身生成 | — | 仅 2–10% |

**额外发现**：Gemma 3 12B / 27B 上，**top-1 与 top-2 tool 的激活 gap 越小，真实错误率越高**——最小 gap 组比最大 gap 组错误率高 **14–21 倍**。这是一个**几乎免费的 pre-execution failure flag**：在 agent 还没真正调用 tool 之前，从内部激活就能拿到 14–21× 的错误率信号。

**结果解读**：
- 一个 mean-diff vector 这么简单的干预竟然能 100% 翻转 tool 选择，说明 tool identity 在表征空间里**几乎是一个一维子空间**，没有 nonlinear 缠绕。这跟我们想象中"复杂 agent 决策"是有冲突的——可能真实情况是模型把"选 tool"这件事压缩得非常扁。
- "预训练就知道，但说不出来"这个发现，对小模型 agent 方向是巨大利好——意味着 instruction tuning + RL 不是在"教会"模型选 tool，而是在"打通输出通路"。理论上用很少的数据就能撬动。

#### 局限性与开放问题

- **局限 1**：**只在 single-turn fixed-menu 设置下测**。真实 agentic 任务是多轮、动态工具集、tool description 随上下文变化——论文自己也在 Limitations 里承认 "multi-turn agentic transfer is more fragile"。这是个非常诚实的承认，但也说明**这套结论从"实验室"到"生产"还有一大段距离**。
- **局限 2**：所有评估都在 4B+ 才稳定，270M / 1B 档其实只有 77% 起步——这暗示**小模型 tool calling 不仅是输出通路问题，可能也有真正的表征不足**。这对我们关心的 7B 以下小模型 agent 路线不算完全正面新闻。
- **局限 3**：JSON schema 自动适配这一点验证不够细。文章里写"flipping the name is enough"，但读起来 anecdotal，没有 schema 错误率的具体数字。

#### 💡 对我们的启发

1. **直接可用的技术点**：**Tool selection 探针 + activation gap 作为 pre-execution failure detector**——这是马上可以集成进我们 agent trace 分析框架里的小工具。我们手上 SWE-bench 上跑的所有 OpenHands trace，在每次 LLM tool call 前面记录一下 top-1 vs top-2 logit gap，事后回归分析 gap 和最终 patch 正确率的关系。**预期能拿到一个 ~10× 量级的错误率分层**——直接可用作 agent reliability 量化指标。
2. **具体实验想法**（1-2 周内可做）：在 DeepSeek-Coder-7B / Qwen-Coder-7B 上复现 mean-diff steering，但**目标不是切换 tool 而是切换 patch policy**——比如"返回 minimal patch"vs"返回 defensive patch"两种风格。如果同样能用线性向量切换，说明 patch generation 这种更复杂的决策也在 representation 里被压扁了，这是一个可以单独发的发现。
3. **研究趋势判断**：**"用最便宜的线性探针替代昂贵的端到端 benchmark"** 会成为 2026 年评估方法学的潜在主线。这跟我们一贯的"事后 trace 分析 > 大规模端到端重跑"哲学完美对齐。我们应该尽快把这套探针工具集成到 OpenHarmony / ArkTS 工具链的内部评估里——比 SWE-bench 整套跑一次便宜两个数量级。

---

### Position: Mechanistic Interpretability Must Disclose Identification Assumptions for Causal Claims

> **推荐理由**：方法论 position paper，节奏快、信息密度高。和我们追求的 McNemar / TOST / Cohen κ 这类统计严谨性是同一面镜子的两面——一篇要求 mech interp 社区承认自己用 ablation 当因果证据是有问题的硬核 position。

📌 **论文信息**：Zezheng Lin, Fengming Liu | [arXiv:2605.08012](http://arxiv.org/abs/2605.08012v1) | cs.LG, cs.AI, cs.CL

#### TL;DR
对 10 篇主流 mech interp 论文做 purposive audit，结论非常硬：**零篇有专门的 identification assumptions 章节**。faithfulness、completeness、monosemanticity、ablation effect 这些验证指标被当成因果支撑使用，但没有人显式声明它们成立的前提假设。作者提出 5 条信息披露规范：(1) 是否是因果声明、(2) identification 策略是什么、(3) 列出所有 assumptions、(4) 至少压力测试一条、(5) 如果 assumption 失败结论怎么变。

#### 问题是什么？

Mech interp 圈这几年生产了大量"circuit X 引起行为 Y"、"feature Z 因果驱动 capability W"的论文，但实际上**这些"因果"声明的证据几乎全是 ablation / patching / monosemanticity score 这类相关性证据**。问题不是这些方法没用——是它们成立的前提（exchangeability、no unobserved mediator、stable unit treatment value 等）从来没有被显式声明过。这跟经济学/流行病学 50 年前要求"声明 identifying assumptions"才能发因果声明的标准是巨大鸿沟。

更直接的具体后果：

- "We ablate component X and behavior Y drops by Δ" — 这只是 association，不是 causal effect of X on Y（因为没有控制 unobserved confounders）。
- "Faithfulness = 0.9" — 这是 model 的拟合度，不是 model 对 ground truth circuit 的认识度。
- "monosemanticity score 高" — 不等于这个 feature 因果决定了某个行为。

#### 他们怎么做的？

**核心 Insight**：把医学 / 经济学已经成熟的"identification disclosure"标准搬到 mech interp，并且通过两人独立编码的方式做了一次 30 篇规模的 reproducibility check。

具体方法流程：
1. **Purposive audit**：选 10 篇覆盖四种方法学派（probing / SAE / activation patching / causal abstraction）的代表性论文，全文检查是否有专门的 identification assumptions 章节。结果：0/10。
2. **两人独立编码**：n=30 paper 上，两个 coder 独立标注 "是否做因果声明 vs 是否披露 identification"，主要发现的方向一致——dedicated identification section 缺失、validation-metric substitution 普遍存在。
3. **提出 5 条规范**：(a) 声明是否因果、(b) 命名 identification strategy、(c) 枚举 assumptions、(d) 至少 stress-test 一条、(e) 说明 assumption 失败会怎样改变结论。

**跟之前方法的本质区别**：以前的 mech interp 方法论批评（如 "is feature attribution causal?"）主要在质问单一指标的有效性。**这篇是结构化的、可执行的信息披露要求**——不要求你换方法，只要求你说清楚假设。这种"低成本但高强制"的方法论改良更可能被实际采纳。

#### 关键结果

| 审计维度 | 10 篇 audit | n=30 两人编码 |
|---------|------------|--------------|
| 有专门 identification assumptions 章节 | 0 / 10 | 主方向一致（具体数字依编码规则） |
| 把 validation metric 当因果支撑 | 普遍存在 | 主方向一致 |
| 至少压力测试一条 assumption | 极少 | 极少 |

**结果解读**：
这不是"挑刺"——0/10 的结论意味着这是个**结构性的领域规范缺失**，不是个别论文质量问题。所以这篇 position 真正想推的是 **review process / submission template 层面的改革**——让所有 NeurIPS / ICML mech interp 投稿强制带 identification assumptions 章节。

#### 局限性与开放问题

- **局限 1**：10 篇 audit 样本量太小，且是 "purposive" 选样（作者主观挑的），**没法严格代表领域全貌**。两人编码 n=30 这一步本来该做主要分析但反而是辅助。
- **局限 2**：作者没具体说 "可接受的 identification strategy 应该长什么样"——对 mech interp 这种实验科学，能用的因果识别工具（IV、front-door、do-calculus 之类）都不太自然。**只指出问题没给可操作的解决方案**，业内可能会回应"我们想披露但不知道披露什么"。
- **局限 3**：作者承认 "exact Dim B/D counts are coding-rule sensitive"——意味着他们自己的两人编码结果对编码规则也很敏感，这其实削弱了"领域缺失是结构性"的论证力度。

#### 💡 对我们的启发

1. **直接可用的技术点**：我们写 agent marginal value 分析（"test execution 贡献 1.25pp"）那一类工作时，**应当显式加一个 "Identification Strategy" 段落**：声明用的是 within-subject McNemar、假设是 "trial conditions are randomly assigned" 还是 "matched pairs"、当假设失败（如 trial 不独立）结果会怎么变。这件事零成本、却能让审稿人立刻感觉这篇严肃十倍。
2. **具体实验想法**：把我们已经发的 12 篇论文（特别是 marginal value 那条线）回头做一次"自审计"——按这篇的 5 条规范逐条检查，看哪些 claim 实际上没披露足够的 identification 信息。这个工作 1 天就能做完，输出可以作为下次投稿的 internal QA checklist。
3. **研究趋势判断**：**Position paper 这种"信息披露层面"的方法学批评会越来越多**，尤其在 mech interp 和 LLM evaluation 这两个领域。我们做 evaluation methodology 工作时可以借鉴这种"低门槛但高效"的论文结构——审计 + 编码 + 披露规范，三步式 position paper，比纯方法 paper 更容易拿到广泛 attention。

---

## 方法对比

| 维度 | [28] Collab/Assist PR | [29] CLI Agent A³ | [37] Tool Steering | [30] Position |
|------|--------------------|------------------|-------------------|--------------|
| 核心方法 | 大规模 PR lifecycle 数据挖掘 | AST 子链 + tree margin RL | Mean-diff linear steering | Purposive audit + 2-coder |
| 数据需求 | 29,585 个公开 PR | 自建 ShellOps + RL trajectories | 12 个 IT 模型激活 | 10–30 篇 mech interp 论文 |
| 计算开销 | 数据处理为主，无 GPU 训练 | RL 训练（中等） | 极轻（探针 + 单层 forward） | 几乎为零 |
| 适用场景 | Agent 治理 / 责任归因评估 | CLI / repo-level agent 训练 | Agent 失败 pre-detection | 任何做因果声明的 mech interp 工作 |
| 主要局限 | OSS 公开 PR 偏差、灰区 case | 自建数据集不足以服众、AST 边界 | Single-turn fixed-menu | 样本小、缺可执行解决方案 |
| 对我们的迁移度 | ⭐⭐⭐ 直接用于 SWE-bench trace 分析 | ⭐⭐⭐ 可迁移到 ArkTS-aware credit | ⭐⭐⭐ Agent failure detector 即插即用 | ⭐⭐ 写作规范、自审计 |

## 一句话总结

今天这四篇加在一起，画出了 "AI agent 在 SE 中应该被怎样评估、训练、解释、披露" 的完整四象限——**外部行为画像** ([28])、**结构化训练信号** ([29])、**内部表征可读性** ([37])、**方法论严谨性** ([30])。任何想认真做 AI for SE 的研究者都应该把这四件事一起想清楚。
