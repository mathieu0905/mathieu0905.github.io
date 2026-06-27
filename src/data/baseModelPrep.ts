export type PrepTrackId = "foundation" | "transformer" | "training" | "postTraining" | "agentic" | "narrative";

export interface PrepWeek {
  id: string;
  title: string;
  focus: string;
  outcome: string;
  tasks: {
    id: string;
    label: string;
    detail: string;
  }[];
}

export interface ConceptCard {
  id: string;
  track: PrepTrackId;
  title: string;
  oneLiner: string;
  mechanism: string;
  interviewAnswer: string;
  checkpoints: string[];
}

export interface InterviewQuestion {
  id: string;
  track: PrepTrackId;
  question: string;
  shortAnswer: string;
  deepAnswer: string[];
  bridgeToCv: string;
}

export interface FrontierPaper {
  id: string;
  title: string;
  organization: string;
  year: string;
  theme: "模型报告" | "代码模型" | "SWE Agent 训练" | "Agent RL" | "评测与数据";
  priority: "必读" | "精读" | "跟踪";
  sourceLabel: string;
  sourceUrl: string;
  whyItMatters: string;
  keyIdeas: string[];
  trainingLens: string[];
  cvBridge: string;
  readFor: string;
}

export interface IncidentCard {
  id: string;
  title: string;
  symptom: string;
  likelyCauses: string[];
  diagnosis: string[];
  interviewLine: string;
}

export const prepWeeks: PrepWeek[] = [
  {
    id: "week-1",
    title: "第 1 周：ML 与训练地基",
    focus: "把 loss、梯度、优化器、batch、泛化这些概念补到能解释训练曲线。",
    outcome: "面试官问到 learning rate、loss spike、AdamW、perplexity 时，可以用机制和排查思路回答。",
    tasks: [
      {
        id: "w1-loss",
        label: "交叉熵与 next-token loss",
        detail: "能从 softmax logits 讲到 negative log likelihood，并解释 perplexity = exp(loss)。",
      },
      {
        id: "w1-gradient",
        label: "反向传播与梯度噪声",
        detail: "理解 batch size、gradient accumulation、learning rate 对训练稳定性的影响。",
      },
      {
        id: "w1-optim",
        label: "AdamW / warmup / schedule",
        detail: "能解释 AdamW 的 decoupled weight decay，以及 warmup 为什么能减少早期不稳定。",
      },
      {
        id: "w1-overfit",
        label: "过拟合、泄漏与验证集",
        detail: "把 train loss、val loss、benchmark leakage 和数据去重放到同一个框架里理解。",
      },
    ],
  },
  {
    id: "week-2",
    title: "第 2 周：Transformer 与长上下文",
    focus: "从 token 到 logits 讲清 decoder-only Transformer，再补长上下文与推理缓存。",
    outcome: "能画出 attention / RoPE / GQA / KV cache 的数据流，并能估算为什么 1M context 贵。",
    tasks: [
      {
        id: "w2-attn",
        label: "Self-attention 与 causal mask",
        detail: "用 QK^T / sqrt(d) -> softmax -> V 解释注意力，说明 causal mask 如何避免看未来。",
      },
      {
        id: "w2-rope",
        label: "RoPE 与位置外推",
        detail: "理解旋转位置编码、YaRN/RoPE scaling、长上下文位置分布变化带来的风险。",
      },
      {
        id: "w2-kv",
        label: "KV cache / GQA / MLA / sparse attention",
        detail: "比较 MHA、MQA、GQA、MLA/压缩注意力如何降低显存和推理 FLOPs。",
      },
      {
        id: "w2-moe",
        label: "MoE 与 active parameters",
        detail: "理解 total params、activated params、router、expert load balance 和 serving 成本。",
      },
    ],
  },
  {
    id: "week-3",
    title: "第 3 周：Pretrain / SFT / RL 闭环",
    focus: "把数据、训练系统、post-training、agentic RL 和代码 verifier 串起来。",
    outcome: "能把 SWE 任务说成训练信号：数据从哪里来、环境怎么跑、reward 怎么给、失败怎么查。",
    tasks: [
      {
        id: "w3-data",
        label: "代码数据与仓库级样本",
        detail: "掌握去重、污染检测、packing、repo context、PR/issue/trajectory 数据的差异。",
      },
      {
        id: "w3-sft",
        label: "SFT 与 response masking",
        detail: "能解释 instruction tuning、conversation template、只对 assistant tokens 计 loss 的原因。",
      },
      {
        id: "w3-rl",
        label: "DPO / PPO / GRPO / RLVR",
        detail: "用 chosen/rejected、trajectory reward、group advantage 和 verifiable reward 区分几类 post-training。",
      },
      {
        id: "w3-agent",
        label: "Agentic code training",
        detail: "重点读 SWE-Gym、DeepSWE、Agent-RLVR、IQuest-Coder，把 execution feedback 和 verifier 讲成训练闭环。",
      },
    ],
  },
];

export const conceptCards: ConceptCard[] = [
  {
    id: "cross-entropy",
    track: "foundation",
    title: "Cross Entropy / Next-token Loss",
    oneLiner: "大模型预训练的核心目标是让正确下一个 token 的概率更高。",
    mechanism:
      "模型输出 vocabulary logits，softmax 得到概率分布；cross entropy 等价于最小化正确 token 的 negative log likelihood。训练 loss 每下降一点，都意味着模型给真实序列分配了更高概率。",
    interviewAnswer:
      "我会把 LM loss 看成 token 级别的 NLL；perplexity 是 exp(loss)，代表模型平均每一步的有效困惑度。代码模型里，低 loss 不一定等于强 agent，因为仓库修复还需要检索、执行、工具选择和长程信用分配。",
    checkpoints: ["能写出 CE = -log p(y)", "能解释 perplexity", "能说出 loss 与 pass rate 不完全一致"],
  },
  {
    id: "adamw",
    track: "foundation",
    title: "AdamW 与学习率调度",
    oneLiner: "AdamW 解决的是如何稳定、高效地沿着噪声梯度下降。",
    mechanism:
      "Adam 用一阶矩估计方向、二阶矩估计尺度；AdamW 将 weight decay 从梯度更新中解耦，避免正则项被自适应学习率扭曲。Warmup 用较小学习率度过早期不稳定区间，cosine/linear decay 则逐步降低更新幅度。",
    interviewAnswer:
      "如果训练初期 loss spike，我会先看学习率、warmup 长度、梯度范数、bf16/fp16 溢出、数据 batch 是否异常；如果中后期 spike，则更像数据分布、并行同步、optimizer state 或长序列样本导致的问题。",
    checkpoints: ["能区分 Adam 和 AdamW", "能解释 warmup", "能给出 loss spike 排查顺序"],
  },
  {
    id: "attention",
    track: "transformer",
    title: "Causal Self-attention",
    oneLiner: "Attention 让每个 token 基于前文动态选择信息来源。",
    mechanism:
      "Query 表示当前位置要找什么，Key 表示历史 token 提供什么索引，Value 表示可被聚合的内容。causal mask 限制模型只能看当前位置之前的信息，multi-head 则允许模型在多个子空间学习不同关系。",
    interviewAnswer:
      "代码场景里 attention 不只是记关键词，还要跨文件跟踪调用、变量、约束和测试反馈。长上下文模型的关键不是把所有东西塞进去，而是如何让注意力预算真正落在有用结构上。",
    checkpoints: ["能解释 Q/K/V", "能解释 mask", "能联系 repo context 和结构检索"],
  },
  {
    id: "kv-cache",
    track: "transformer",
    title: "KV Cache 与长上下文成本",
    oneLiner: "KV cache 是推理加速的关键，也是长上下文 serving 的显存瓶颈。",
    mechanism:
      "自回归推理时，新 token 只需要计算自己的 Q，但要复用历史 token 的 K/V。context 越长，KV cache 线性增长；当上下文到 128K、1M 级别时，注意力 FLOPs 和显存管理都成为核心系统问题。",
    interviewAnswer:
      "GLM-5.2、DeepSeek-V4 这类报告都把 1M context 的效率作为核心卖点，说明 agentic engineering 的瓶颈已经从单轮生成转向长会话、长仓库、长工具轨迹的经济性。",
    checkpoints: ["能估算 KV cache 组成", "能比较 GQA/MLA/稀疏注意力", "能解释为什么 agent 需要长上下文"],
  },
  {
    id: "data-mixture",
    track: "training",
    title: "Data Mixture / Dedup / Contamination",
    oneLiner: "基模能力很大程度上由数据配方决定，代码模型尤其怕 benchmark 污染。",
    mechanism:
      "预训练数据通常混合自然语言、代码、数学、仓库、合成数据与轨迹数据。去重减少记忆和泄漏，污染检测避免模型在评测集上靠见过答案取胜。代码模型还要考虑文件粒度、仓库粒度和 commit/PR 粒度。",
    interviewAnswer:
      "我的优势在这里很直接：我做过 repo-level benchmark、低泄漏任务构建和执行受控实验，能帮助把真实软件工程任务变成干净、可验证、可扩展的训练数据。",
    checkpoints: ["能解释 packing", "能解释 contamination", "能把 benchmark 构建转成 training data 语言"],
  },
  {
    id: "distributed",
    track: "training",
    title: "显存构成与分布式训练",
    oneLiner: "大模型训练的系统题，本质是参数、梯度、优化器状态、activation 怎么切。",
    mechanism:
      "显存主要来自 model weights、gradients、optimizer states、activations 和临时通信 buffer。Data parallel 复制模型切 batch，tensor parallel 切矩阵，pipeline parallel 切层，ZeRO/FSDP 切参数、梯度和优化器状态。",
    interviewAnswer:
      "我不需要假装自己已经训过千卡 pretrain，但我要能说清楚训练系统的瓶颈：activation checkpointing 用计算换显存，ZeRO/FSDP 用通信换显存，长序列还会放大 activation 和 attention 成本。",
    checkpoints: ["能列出显存四大块", "能区分 DP/TP/PP", "能解释 ZeRO/FSDP 的 trade-off"],
  },
  {
    id: "sft-dpo",
    track: "postTraining",
    title: "SFT / DPO / Preference Learning",
    oneLiner: "SFT 教格式和行为先验，偏好学习调整选择倾向。",
    mechanism:
      "SFT 对高质量示范轨迹做 teacher forcing；DPO 直接从 chosen/rejected pair 优化偏好，不显式训练 reward model；PPO/RLHF 则通常先训练 reward model，再让 policy 在约束下最大化 reward。",
    interviewAnswer:
      "代码模型不能只靠漂亮的 SFT 轨迹。SFT 可能学会风格，却没有学会在真实 repo 中试错；DPO 需要高质量对比样本，执行反馈和单测结果可以构造成更可靠的偏好来源。",
    checkpoints: ["能解释 response masking", "能说 DPO 和 RLHF 区别", "能联系 chosen/rejected patch"],
  },
  {
    id: "rlvr",
    track: "agentic",
    title: "RLVR / Verifiable Reward",
    oneLiner: "代码任务适合 RL 的原因是结果可以被测试和执行部分验证。",
    mechanism:
      "RLVR 用可验证环境给奖励，比如测试通过、程序输出正确、工具任务完成。SWE agent 的难点是 reward 稀疏、episode 长、环境贵、一次成功可能包含许多无关动作。",
    interviewAnswer:
      "我的 To Run or Not to Run 与 CodeAnchor 可以直接接到 RLVR：前者回答何时值得花执行成本拿 reward/observation，后者回答如何给 agent 稳定的结构锚点降低探索难度。",
    checkpoints: ["能解释 sparse reward", "能解释 credit assignment", "能把 unit test/verifier 说成 reward"],
  },
  {
    id: "agentic-trajectories",
    track: "agentic",
    title: "Agent Trajectory 作为训练数据",
    oneLiner: "trajectory 不是普通问答，而是 observation-action-reward 的长程序列。",
    mechanism:
      "一个 SWE trajectory 包含问题描述、repo 观察、搜索、打开文件、编辑、执行测试、失败日志、反思与提交。训练时要决定哪些 token 计 loss，哪些 observation mask 掉，以及如何处理超长失败轨迹。",
    interviewAnswer:
      "我会特别关注轨迹质量：成功轨迹是否真的因果有效，失败轨迹能否提供反例，测试日志是否泄漏答案，执行成本是否值得。这个正是 SE 背景能补到基模组的地方。",
    checkpoints: ["能区分 prompt 数据和 trajectory 数据", "能解释 observation masking", "能指出 reward hacking 风险"],
  },
  {
    id: "cv-translation",
    track: "narrative",
    title: "把 SE 成果翻译成基模语言",
    oneLiner: "你不是从软工转模型，而是站在 code model 最需要的任务与反馈侧。",
    mechanism:
      "基模组会关心数据、训练目标、reward、verifier、评测和系统吞吐。你的论文如果只按 SE 讲，是程序修复/静态分析/benchmark；按模型训练讲，则是 repo-level context、execution feedback、agent trajectory、verifiable reward 和 low-leakage training tasks。",
    interviewAnswer:
      "我的优势不是已经训过最大规模 pretrain，而是知道 code model 在真实仓库任务中为什么失败，以及怎样把这些失败转化成训练和评测信号。训练基础我正在补齐，目标是把 SE 场景资产接到 post-training 和 agent RL pipeline。",
    checkpoints: ["能把每篇论文映射到 training signal", "能避免说自己是 ML 新手", "能明确短期可贡献位置"],
  },
];

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "q-loss-pass",
    track: "foundation",
    question: "为什么 pretraining loss 下降，不一定代表 SWE-bench resolved rate 提升？",
    shortAnswer: "LM loss 衡量 token 分布拟合，SWE-bench 衡量真实仓库任务闭环；中间隔着检索、工具、执行、规划和 verifier。",
    deepAnswer: [
      "预训练 loss 是局部 token 预测目标，不直接优化多轮工具决策。",
      "SWE 任务需要跨文件定位、理解 issue、做编辑、跑测试、根据日志迭代。",
      "因此 code agent 能力通常还需要 repo-scale data、SFT/trajectory data、agent RL 和 inference-time search。",
    ],
    bridgeToCv: "CodeAnchor 和 To Run or Not to Run 研究的正是 loss 之外的闭环变量：上下文结构和执行反馈。",
  },
  {
    id: "q-long-context",
    track: "transformer",
    question: "1M context 对代码 agent 意味着什么？为什么不是越长越好？",
    shortAnswer: "长上下文让模型保留仓库、日志和长会话，但注意力预算、KV cache、噪声和定位能力都会成为瓶颈。",
    deepAnswer: [
      "代码仓库天然长，但真实任务只需要一小部分关键结构和证据。",
      "1M context 提升上限，同时增加 serving 成本和无关信息干扰。",
      "所以长上下文要和结构检索、anchor、memory compression、execution feedback 一起设计。",
    ],
    bridgeToCv: "CodeAnchor 可以被解释为长上下文时代的结构压缩与注意力引导，而不是传统静态分析小修小补。",
  },
  {
    id: "q-rlvr",
    track: "postTraining",
    question: "SWE agent 的 RL 和数学题 RL 最大区别是什么？",
    shortAnswer: "数学题通常单轮、答案可验证；SWE agent 是多轮、环境昂贵、reward 稀疏、信用分配困难。",
    deepAnswer: [
      "SWE agent 的 action 包括 bash、search、edit、finish，每一步都可能改变环境。",
      "一次最终测试通过并不能说明中间每个动作都有价值。",
      "训练系统还要承受 Docker/Kubernetes 环境、超时、 flaky tests 和大规模 rollout 成本。",
    ],
    bridgeToCv: "你的 execution feedback 论文可以作为 RL 环境设计的证据：不是所有执行都有正收益，反馈调度本身就是策略问题。",
  },
  {
    id: "q-sft-vs-rl",
    track: "postTraining",
    question: "为什么很多 agentic coding 报告强调 RL，而不只做 SFT？",
    shortAnswer: "SFT 能模仿轨迹，RL 能让模型通过环境反馈优化策略，尤其适合 hard-to-solve but easy-to-verify 的代码任务。",
    deepAnswer: [
      "SFT 质量依赖 teacher 和示范轨迹，容易学会表面格式。",
      "代码环境能提供测试通过/失败这样的可验证 reward。",
      "RL 可以让模型探索、修正、学习何时使用工具，但也会带来 reward hacking 和训练不稳定。",
    ],
    bridgeToCv: "RepoRescue、AtomicCommitBench、SWE-OpenHarmony 都可以被包装为可验证任务源或 post-training 环境。",
  },
  {
    id: "q-agentic-trajectory",
    track: "agentic",
    question: "一条 SWE agent trajectory 进入训练集之前，你会怎么审查？",
    shortAnswer: "先看它是否可复现、是否因果有效、是否有泄漏、是否包含可解释的 observation-action-reward 链。",
    deepAnswer: [
      "可复现：同一环境、同一测试、同一 patch 能否稳定通过。",
      "因果有效：成功是否来自关键修改，而不是随机改动或 flaky tests。",
      "训练可用：哪些 observation 不该计 loss，哪些动作值得模仿，失败轨迹是否可作为偏好反例。",
    ],
    bridgeToCv: "Chain-Tracking 和 To Run or Not to Run 可以自然解释为 trajectory 质量控制和执行反馈成本建模。",
  },
  {
    id: "q-data",
    track: "training",
    question: "如果让你给 code model 构造训练数据，你最担心什么？",
    shortAnswer: "污染、伪相关轨迹、不可复现环境、低质量合成数据、以及训练目标和真实 agent 成功率不对齐。",
    deepAnswer: [
      "先做 repository-level split 和 benchmark contamination 检查。",
      "再保证任务有可执行环境和稳定 verifier。",
      "最后记录 trajectory 的因果链，避免模型学到随机修改后侥幸通过的坏策略。",
    ],
    bridgeToCv: "这正是你简历里的 benchmark、verifier、执行受控实验和 OpenHarmony task pipeline 的强项。",
  },
  {
    id: "q-positioning",
    track: "narrative",
    question: "你不是传统 ML 背景，为什么适合基模组？",
    shortAnswer: "我不是来替代 pretrain infra 专家，而是补 code model 最缺的真实任务、数据、评测、verifier 和 agent feedback 闭环。",
    deepAnswer: [
      "代码基模的竞争已经从单点 HumanEval 转向 repo-level、tool-use、long-horizon agent。",
      "这些能力需要真实软件工程任务和执行反馈，而这正是我的论文主线。",
      "我正在补齐训练基础，目标是把 SE 资产接到 post-training / RL / evaluation pipeline。",
    ],
    bridgeToCv: "一句话定位：站在 code agent training 的任务与反馈侧，补齐模型训练侧共同语言。",
  },
];

export const frontierPapers: FrontierPaper[] = [
  {
    id: "glm-52",
    title: "GLM-5.2 / GLM-5: from Vibe Coding to Agentic Engineering",
    organization: "Z.ai / GLM Team",
    year: "2026",
    theme: "模型报告",
    priority: "必读",
    sourceLabel: "GLM-5 GitHub + arXiv 技术报告",
    sourceUrl: "https://github.com/zai-org/GLM-5",
    whyItMatters: "它把目标从 vibe coding 明确推进到 agentic engineering：长上下文、复杂系统工程、异步 RL、agent 长程任务。",
    keyIdeas: [
      "GLM-5 采用 744B total / 40B active MoE，并把预训练数据扩展到 28.5T tokens。",
      "GLM-5.2 强调 solid 1M-token context、flexible reasoning effort、IndexShare 稀疏注意力和更高效的 MTP speculative decoding。",
      "slime 异步 RL 基础设施把 generation 与 training 解耦，服务于更频繁的 post-training 迭代。",
    ],
    trainingLens: [
      "长上下文效率是 agentic engineering 的系统地基。",
      "异步 agent RL 说明训练瓶颈不只是算法，还有 rollout 吞吐、环境调度和训练更新解耦。",
      "coding benchmark 正在从单次生成转向终端任务、SWE Pro、长会话工程任务。",
    ],
    cvBridge: "你的执行反馈和 harness 调度研究可以直接对应 GLM-5 报告中的 long-horizon agentic tasks。",
    readFor: "读它时重点看：DSA/IndexShare 为什么降低长上下文成本，slime 为什么提高 RL throughput，agentic engineering 和普通 code generation 的差别。",
  },
  {
    id: "deepseek-v4",
    title: "DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence",
    organization: "DeepSeek-AI",
    year: "2026",
    theme: "模型报告",
    priority: "必读",
    sourceLabel: "DeepSeek-V4 technical report on Hugging Face",
    sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash/blob/main/DeepSeek_V4.pdf",
    whyItMatters: "它把 1M context 的核心问题讲成工程经济性：FLOPs、KV cache、压缩注意力和长程 agent serving 成本。",
    keyIdeas: [
      "公开卡片显示 V4-Pro 为 1.6T total / 49B active MoE，V4-Flash 为更轻量的 284B / 13B active 路线。",
      "报告主线是 hybrid attention：Compressed Sparse Attention 与 Heavily Compressed Attention 共同降低 1M context 成本。",
      "两类模型都在超过 32T tokens 上预训练，并引入 mHC residual mapping 与 Muon optimizer 来提升稳定性和收敛效率。",
      "NVIDIA NIM 卡片称 V4-Pro 在 1M context 下单 token inference FLOPs 约为 DeepSeek-V3.2 的 27%。",
    ],
    trainingLens: [
      "长上下文模型的胜负不只在训练 loss，还在 KV cache、attention pattern、memory hierarchy。",
      "Agentic code task 会把长上下文 serving 成本放大，因为一次任务可能有大量工具调用和日志。",
      "第三方评估提醒我们：官方 benchmark 与 held-out agent/cyber/reasoning 评测可能有差距。",
    ],
    cvBridge: "To Run or Not to Run 的成本收益分析可以接到 DeepSeek-V4 的长上下文经济性：每次执行、每段上下文、每个工具调用都有预算。",
    readFor: "读它时重点看：CSA/HCA 怎样处理历史信息，1M context 对 SWE agent 的实际收益边界，以及官方结果和第三方评测差异。",
  },
  {
    id: "iquest",
    title: "IQuest-Coder-V1 Technical Report",
    organization: "IQuest / 九坤相关方向",
    year: "2026",
    theme: "代码模型",
    priority: "必读",
    sourceLabel: "arXiv:2603.16733",
    sourceUrl: "https://arxiv.org/abs/2603.16733",
    whyItMatters: "这是最贴近你目标组的材料：code-flow multi-stage training、repo-scale 128K context、reasoning RL、agentic trajectories。",
    keyIdeas: [
      "IQuest-Coder-V1 包含 7B/14B/40B/40B-Loop 系列。",
      "训练路线从 code facts、repository、completion pretraining 到 32K reasoning/agentic mid-training，再到 128K repo-scale 训练。",
      "post-training 分 thinking path 和 instruct path：前者强调 reasoning-driven RL，后者强调通用助手能力。",
    ],
    trainingLens: [
      "代码模型训练正在显式建模软件逻辑随 pipeline 演化的 code-flow，而不是只看静态文件。",
      "repo-scale context 和 agentic trajectories 是你最应重点复述的关键词。",
      "40B-Loop 体现了性能与部署 footprint 的架构折中。",
    ],
    cvBridge: "CodeAnchor、RepoRescue、AtomicCommitBench 都可以被说成 code-flow/repo-scale/trajectory training 的任务资产。",
    readFor: "读它时重点看：每个训练阶段的数据是什么、上下文长度为什么从 32K 到 128K、thinking path 的 RL 和 instruct path 的目标差异。",
  },
  {
    id: "qwen3-coder",
    title: "Qwen3-Coder: Agentic Coding in the World",
    organization: "Qwen Team",
    year: "2025",
    theme: "代码模型",
    priority: "精读",
    sourceLabel: "Qwen official blog",
    sourceUrl: "https://qwenlm.github.io/blog/qwen3-coder/",
    whyItMatters: "它给出了一条清楚的开源 code model scaling 路线：token、context、synthetic data、code RL、long-horizon agent RL。",
    keyIdeas: [
      "Qwen3-Coder-480B-A35B-Instruct 是 480B total / 35B active MoE，原生 256K context，可通过 YaRN 扩展到 1M。",
      "预训练使用 7.5T tokens，其中代码占比 70%。",
      "post-training 强调 hard-to-solve, easy-to-verify 的 Code RL，并构建 20,000 并行环境做 long-horizon RL。",
    ],
    trainingLens: [
      "大规模 agent RL 的基础不是口号，而是能并行跑环境、收反馈、稳定训练。",
      "代码任务天然适合可验证 RL，但任务生成和测试用例质量是核心。",
      "CLI/scaffold 也是模型能力释放的一部分。",
    ],
    cvBridge: "你的 HomeTrans / SWE-OpenHarmony 可以被包装为垂域可验证 coding environments，与 Qwen 的 20K 环境思路同构。",
    readFor: "读它时重点看：为什么代码 RL 要从竞赛题扩展到真实任务，以及 long-horizon RL 的环境扩展问题。",
  },
  {
    id: "kimi-k2",
    title: "Kimi K2: Open Agentic Intelligence",
    organization: "Moonshot / Kimi Team",
    year: "2025-2026",
    theme: "模型报告",
    priority: "精读",
    sourceLabel: "arXiv:2507.20534",
    sourceUrl: "https://arxiv.org/abs/2507.20534",
    whyItMatters: "它把 agentic data synthesis、joint RL、optimizer stability 和开放 MoE 模型放在同一个报告里。",
    keyIdeas: [
      "K2 是 1T total / 32B active MoE。",
      "MuonClip 通过 QK-clip 缓解训练不稳定，并报告 15.5T token pretraining 中 zero loss spike。",
      "post-training 包含大规模 agentic data synthesis 和 joint RL，在真实/合成环境中交互提升能力。",
    ],
    trainingLens: [
      "优化器稳定性和 agentic post-training 是同一条产品线上的两端。",
      "agentic data synthesis 是解决真实环境数据稀缺的主流路径。",
      "报告中的 SWE-Bench Verified / Multilingual 结果适合和你的 repo-level benchmark 放在一起比较。",
    ],
    cvBridge: "AtomicCommitBench 这类合成但可验证的任务，可以作为 agentic data synthesis 的 SE 版本。",
    readFor: "读它时重点看：MuonClip 为什么解决 loss spike，合成 agentic 数据如何进入 multi-stage post-training。",
  },
  {
    id: "swe-gym",
    title: "Training Software Engineering Agents and Verifiers with SWE-Gym",
    organization: "SWE-Gym",
    year: "2024-2025",
    theme: "SWE Agent 训练",
    priority: "必读",
    sourceLabel: "arXiv:2412.21139",
    sourceUrl: "https://arxiv.org/abs/2412.21139",
    whyItMatters: "它把 SWE agent 训练环境、真实 Python 任务、unit tests 和 verifier 放在一起，是入门 agentic code training 的标准材料。",
    keyIdeas: [
      "包含 2,438 个真实 Python task instances，每个实例有 codebase、runtime、unit tests 和自然语言任务。",
      "用 SWE-Gym 训练 SWE agents，在 SWE-Bench Verified/Lite 上报告最高 19% absolute gain。",
      "还探索了 inference-time scaling 和 verifier。",
    ],
    trainingLens: [
      "环境可执行性比静态数据更重要。",
      "verifier 不只是评测器，也可以成为训练/搜索/重排信号。",
      "训练集、验证集和 SWE-Bench 之间的污染控制是核心。",
    ],
    cvBridge: "To Run or Not to Run 可以作为 SWE-Gym 之后的问题：即使有执行环境，也要问何时执行才划算。",
    readFor: "读它时重点看：task instance 由哪些部件组成，verifier 怎么训练，训练收益来自哪里。",
  },
  {
    id: "swe-smith",
    title: "SWE-smith: Scaling Data for Software Engineering Agents",
    organization: "SWE-smith",
    year: "2025",
    theme: "评测与数据",
    priority: "精读",
    sourceLabel: "arXiv:2504.21798",
    sourceUrl: "https://arxiv.org/abs/2504.21798",
    whyItMatters: "它正面处理 SWE agent 数据稀缺和环境昂贵问题，是理解 scalable task synthesis 的关键论文。",
    keyIdeas: [
      "指出现有 SWE 训练数据规模小、repo 数量少、人工构建成本高、环境存储重。",
      "目标是规模化构造软件工程 agent 训练数据。",
      "它适合作为 RepoRescue / AtomicCommitBench 的对照：都在问任务如何规模化且可验证。",
    ],
    trainingLens: [
      "SWE data scaling 不是简单抓 GitHub，而是构造任务、环境、测试和评估协议。",
      "数据规模、环境可复现性和 verifier 稳定性共同决定 RL/SFT 是否可用。",
      "合成任务必须防止学到模板痕迹。",
    ],
    cvBridge: "你的 benchmark 构造经验在这里非常值钱：能做出低泄漏、可执行、可回放的 repo 任务。",
    readFor: "读它时重点看：任务生成流程、环境存储策略、与真实 GitHub issue 的分布差异。",
  },
  {
    id: "agent-rlvr",
    title: "Agent-RLVR: Training Software Engineering Agents via Guidance and Environment Rewards",
    organization: "Agent-RLVR",
    year: "2025",
    theme: "Agent RL",
    priority: "必读",
    sourceLabel: "arXiv:2506.11425",
    sourceUrl: "https://arxiv.org/abs/2506.11425",
    whyItMatters: "它讨论为什么 RLVR 从数学题迁移到 agentic environments 会变难，以及如何用 guidance + environment reward 缓解。",
    keyIdeas: [
      "RLVR 在 math/competitive programming 中有效，但在多步 agent 环境里 reward 稀疏、失败率高。",
      "软件工程任务需要同时处理长程规划、环境观察和工具动作。",
      "论文核心是通过 guidance 与环境 reward 改善训练信号。",
    ],
    trainingLens: [
      "可验证 reward 不等于容易训练。",
      "agent 环境中的失败样本太多会导致有效梯度稀少。",
      "指导信号可以降低探索难度，但也可能限制策略多样性。",
    ],
    cvBridge: "CodeAnchor 就是一种降低探索空间的 guidance；execution feedback 则是环境 reward/observation。",
    readFor: "读它时重点看：guidance 的形式、reward 的来源、和纯 RLVR 相比解决了哪个 failure mode。",
  },
  {
    id: "ragen",
    title: "RAGEN: Understanding Self-Evolution in LLM Agents via Multi-Turn RL",
    organization: "RAGEN",
    year: "2025",
    theme: "Agent RL",
    priority: "精读",
    sourceLabel: "arXiv:2504.20073",
    sourceUrl: "https://arxiv.org/abs/2504.20073",
    whyItMatters: "它把 multi-turn RL 的训练病灶讲得比较清楚：长程交互、环境随机性、自我演化与训练崩塌。",
    keyIdeas: [
      "提出 StarPO 框架和 RAGEN 系统来训练/评估 LLM agents。",
      "关注 trajectory-level agent RL，而不是单轮问答 RL。",
      "讨论 Echo Trap 等多轮训练中的退化现象。",
    ],
    trainingLens: [
      "agent RL 的基本单位是 trajectory，不是单个答案。",
      "环境 feedback 会改变后续状态，导致 off-policy 和信用分配更复杂。",
      "训练稳定性需要同时看 reward、长度、工具使用和状态分布。",
    ],
    cvBridge: "MazeBreaker 的多智能体 RL、安全动态攻击策略也可以和 RAGEN 的 multi-turn agent RL 语言对齐。",
    readFor: "读它时重点看：StarPO 的状态-思考-动作-奖励建模，以及训练退化案例。",
  },
  {
    id: "deepswe",
    title: "DeepSWE: Training a Fully Open-sourced Coding Agent by Scaling RL",
    organization: "Together AI / Agentica",
    year: "2026",
    theme: "SWE Agent 训练",
    priority: "必读",
    sourceLabel: "Together AI blog",
    sourceUrl: "https://www.together.ai/blog/deepswe",
    whyItMatters: "它给出了非常工程化的 SWE agent RL recipe：环境、动作、稀疏 reward、Kubernetes rollout、GRPO++、TTS。",
    keyIdeas: [
      "从 Qwen3-32B 出发，用纯 RL 在 4.5K R2E-Gym tasks 上训练 6 天，使用 64 H100。",
      "action space 包括 bash、search、file editor、finish/submit。",
      "reward 是稀疏 0/1：选定测试在时限内通过为 1，否则为 0。",
      "报告 Pass@1 42.2%，hybrid test-time scaling 到约 59% SWE-Bench Verified。",
    ],
    trainingLens: [
      "SWE RL 是环境系统工程：Docker/Kubernetes 吞吐直接影响训练。",
      "Compact filtering 说明长轨迹和超时样本会造成 reward collapse。",
      "SFT teacher trajectory 不一定比 cold start RL 更好。",
    ],
    cvBridge: "你的 harness 调度、执行反馈成本、CI 因果链追踪都能直接接到 DeepSWE 的训练 recipe。",
    readFor: "读它时重点看：action/state/reward 定义，GRPO++ 改动，为什么 SWE-Gym/SWE-smith 在他们实验里不如 R2E-Gym。",
  },
  {
    id: "long-context-swe-rl",
    title: "Training Long-Context, Multi-Turn Software Engineering Agents with RL",
    organization: "OpenReview",
    year: "2025-2026",
    theme: "SWE Agent 训练",
    priority: "跟踪",
    sourceLabel: "OpenReview",
    sourceUrl: "https://openreview.net/forum?id=etyJ7WjAKu",
    whyItMatters: "它把 long-context 与 multi-turn SWE RL 放在同一个题目里，正好对应基模组会关心的长会话 coding agent。",
    keyIdeas: [
      "关注多轮软件工程 agent，而不是单次 patch generation。",
      "长上下文用于保留 repo 证据、历史动作、失败日志和策略修正。",
      "适合作为 GLM-5.2 / DeepSeek-V4 的长上下文模型能力在 SWE 训练侧的对应材料。",
    ],
    trainingLens: [
      "长上下文要和环境交互一起评估。",
      "训练目标需要覆盖多轮策略，而不只是最后 patch。",
      "面试时可用它串起 KV cache、agent trajectory 和 RL credit assignment。",
    ],
    cvBridge: "你的 Chain-Tracking 可以自然接到多轮轨迹的因果建模。",
    readFor: "读它时重点看：上下文长度、轮数、reward、工具动作和评测协议。",
  },
  {
    id: "swe-dev",
    title: "SWE-Dev: Building Software Engineering Agents with Training and Inference Scaling",
    organization: "THUDM / Z.ai",
    year: "2025",
    theme: "SWE Agent 训练",
    priority: "精读",
    sourceLabel: "arXiv:2506.07636",
    sourceUrl: "https://arxiv.org/abs/2506.07636",
    whyItMatters: "它把训练数据扩展和 inference scaling 一起讲，适合作为 agent 训练闭环的补充材料。",
    keyIdeas: [
      "用合成测试用例和扩展 agent trajectories 构建训练数据。",
      "7B 和 32B SWE-Dev 在 SWE-bench Verified 上分别报告 23.4% 和 36.6%。",
      "强调增加单次运行交互预算以实现 inference scaling。",
    ],
    trainingLens: [
      "测试用例生成是 verifier/reward 质量的关键。",
      "训练 scaling 与 inference scaling 不是二选一，而是相互补充。",
      "agent 预算增加后，如何调度执行与搜索变成核心问题。",
    ],
    cvBridge: "To Run or Not to Run 正好回答 inference scaling 中执行预算应该怎么花。",
    readFor: "读它时重点看：测试用例如何合成，轨迹如何扩展，inference budget 如何转化为 resolved rate。",
  },
];

export const incidentCards: IncidentCard[] = [
  {
    id: "loss-spike",
    title: "Pretraining loss spike",
    symptom: "训练 loss 突然飙升，随后恢复或直接发散。",
    likelyCauses: ["学习率或 warmup 设置不稳", "异常 batch / 数据污染 / 极长序列", "混合精度溢出", "并行同步或 optimizer state 异常"],
    diagnosis: ["先查 gradient norm 和 overflow 计数", "定位 spike 对应数据 shard", "回看 LR schedule 与 batch size 变更", "必要时从前一 checkpoint 重跑小窗口复现"],
    interviewLine: "我会把 loss spike 当成优化、数据、数值精度、分布式状态四类问题排查，而不是只盯模型结构。",
  },
  {
    id: "reward-collapse",
    title: "Agent RL reward collapse",
    symptom: "早期 reward 上升，之后 agent 开始超长思考、乱改文件或通过率下降。",
    likelyCauses: ["稀疏 reward 下误强化了无关动作", "超长/超时轨迹进入梯度", "测试 reward 不够区分因果有效 patch", "探索与 KL/entropy 约束失衡"],
    diagnosis: ["按成功轨迹回放动作链", "过滤 max length / timeout / late random edits", "对比 Pass2Pass 与 Fail2Pass", "监控每步 token 长度和工具调用分布"],
    interviewLine: "DeepSWE 的 compact filtering 就是在处理类似问题；我的 CI 因果链追踪可以帮助判断成功 patch 是不是因果有效。",
  },
  {
    id: "solve-none",
    title: "SWE RL solve-none rate 过高",
    symptom: "rollout 大量失败，几乎拿不到正 reward，RL 没有有效学习信号。",
    likelyCauses: ["任务太难或 curriculum 缺失", "工具接口不顺手", "初始模型不具备足够 repo navigation 能力", "环境/测试 flaky"],
    diagnosis: ["先用强模型跑同一环境确认任务可解", "降低任务难度构建 curriculum", "加入结构 anchor 或 guidance", "检查 scaffold 的 search/edit/finish 工具可用性"],
    interviewLine: "这就是 CodeAnchor 的价值：给 agent 更稳定的结构入口，减少 blind exploration。",
  },
  {
    id: "context-noise",
    title: "长上下文性能不升反降",
    symptom: "context 从 32K 增到 128K/1M，resolved rate 没明显提升甚至下降。",
    likelyCauses: ["无关文件和日志稀释注意力", "位置外推不稳", "模型缺乏长上下文训练分布", "关键信息没有被显式标注"],
    diagnosis: ["做 oracle context vs retrieved context 对比", "分析 attention/引用证据是否落到关键文件", "减少上下文并加入结构摘要", "测试 RoPE scaling / chunk order / anchor 格式"],
    interviewLine: "长上下文不是把仓库全塞进去；需要结构检索、deterministic anchors 和执行反馈来提高信噪比。",
  },
  {
    id: "sft-regress",
    title: "SFT 后通用能力或 agent 能力下降",
    symptom: "模型更听话了，但复杂 repo task、推理或工具使用反而变差。",
    likelyCauses: ["SFT 数据过窄", "示范轨迹质量低", "response masking 错误", "过度模仿 teacher 的冗长风格"],
    diagnosis: ["检查 loss mask 是否只覆盖 assistant response", "分 domain 做 eval", "加入 mixed instruction / code / reasoning 数据", "用 DPO/RL 纠正偏好和结果"],
    interviewLine: "SFT 是行为初始化，不是最终 agent 能力；真实 SWE 成功率还需要 verifier、RL 和 test-time scaling。",
  },
];

export const narrativeBullets = [
  "我已经有代码智能体、执行反馈、仓库级 benchmark、verifier 和低资源代码建模的一作成果；现在补的是模型训练共同语言。",
  "我能把真实软件工程任务转成训练数据、环境、reward 和评测协议，这正是 code model 从 HumanEval 走向 agentic engineering 的关键缺口。",
  "短期我可以贡献在 code data / agentic eval / post-training task construction；中期补齐训练系统后，可以参与更完整的 code model training loop。",
];
