export type AiKnowledgeLang = "zh" | "en";

export type AiKnowledgeCategoryId =
  | "general"
  | "postTraining"
  | "architecture"
  | "generativeTheory"
  | "generationSystems"
  | "multimodal"
  | "agents";

export interface AiKnowledgeCategory {
  id: AiKnowledgeCategoryId;
  label: string;
  shortLabel: string;
  description: string;
}

export interface AiKnowledgeTopic {
  slug: string;
  category: AiKnowledgeCategoryId;
  level: "基础" | "进阶" | "系统" | "前沿";
  zhTitle: string;
  enTitle: string;
  summary: string;
  keywords: string[];
}

export const aiKnowledgeCategories: AiKnowledgeCategory[] = [
  {
    id: "general",
    label: "General / 基础",
    shortLabel: "基础",
    description: "Attention、归一化、优化器、KL 等训练与推理的底层概念。",
  },
  {
    id: "postTraining",
    label: "Post-Training & Reasoning",
    shortLabel: "后训练",
    description: "RLHF、DPO、GRPO、推理模型、OPD 与参数高效微调。",
  },
  {
    id: "architecture",
    label: "LLM Architecture & Systems",
    shortLabel: "架构系统",
    description: "MoE、长上下文、KV cache、量化、分布式训练和高效注意力。",
  },
  {
    id: "generativeTheory",
    label: "Generative Models — 理论 & Tokenizers",
    shortLabel: "生成理论",
    description: "Flow matching、diffusion、VAE/VQ 系列等生成模型基础。",
  },
  {
    id: "generationSystems",
    label: "Generation Systems",
    shortLabel: "生成系统",
    description: "图像、视频、3D 生成系统，以及 diffusion/flow 的后训练与蒸馏。",
  },
  {
    id: "multimodal",
    label: "Multimodal",
    shortLabel: "多模态",
    description: "CLIP、LLaVA、Qwen-VL、DeepSeek-VL 等 VLM 关键机制。",
  },
  {
    id: "agents",
    label: "Agents",
    shortLabel: "智能体",
    description: "Agent 基础、Agentic RL、多智能体、长期任务、自进化与 RAG 检索。",
  },
];

export const aiKnowledgeTopics: AiKnowledgeTopic[] = [
  {
    slug: "attention",
    category: "general",
    level: "基础",
    zhTitle: "Attention 面试 Cheat Sheet",
    enTitle: "Attention Interview Cheat Sheet",
    summary: "从 scaled dot-product 到 MHA、mask、复杂度、数值稳定性和 PyTorch 实现。",
    keywords: ["attention", "MHA", "cross attention", "mask", "FlashAttention"],
  },
  {
    slug: "normalization-init",
    category: "general",
    level: "基础",
    zhTitle: "归一化 / 残差 / 初始化",
    enTitle: "Normalization, Residuals, and Initialization",
    summary: "BatchNorm、LayerNorm、RMSNorm、Pre/Post-LN、DeepNorm、初始化与残差缩放。",
    keywords: ["LayerNorm", "RMSNorm", "Pre-LN", "Kaiming", "muP"],
  },
  {
    slug: "optimizer-lr-schedule",
    category: "general",
    level: "基础",
    zhTitle: "优化器 & LR Schedule",
    enTitle: "Optimizers and LR Schedules",
    summary: "SGD、Momentum、Adam、AdamW、Muon/Lion/Shampoo，以及 warmup、cosine、WSD。",
    keywords: ["AdamW", "warmup", "cosine", "weight decay", "gradient clipping"],
  },
  {
    slug: "kl-divergence-rlhf",
    category: "general",
    level: "进阶",
    zhTitle: "KL Divergence in RLHF",
    enTitle: "KL Divergence in RLHF",
    summary: "KL 估计、k1/k2/k3、placement bias，以及 RLHF 中 KL 惩罚的实现细节。",
    keywords: ["KL", "RLHF", "k1", "k2", "k3", "PPO"],
  },
  {
    slug: "rlhf-dpo-grpo-ppo",
    category: "postTraining",
    level: "进阶",
    zhTitle: "RLHF / DPO / GRPO / PPO",
    enTitle: "RLHF, DPO, GRPO, and PPO",
    summary: "从偏好数据到 policy optimization，比较 DPO、PPO、GRPO 的目标与工程取舍。",
    keywords: ["RLHF", "DPO", "GRPO", "PPO", "preference"],
  },
  {
    slug: "reasoning-models",
    category: "postTraining",
    level: "前沿",
    zhTitle: "Reasoning Models",
    enTitle: "Reasoning Models",
    summary: "o1/R1、test-time compute、PRM、verifiable reward 与推理模型训练范式。",
    keywords: ["reasoning", "o1", "R1", "PRM", "test-time compute"],
  },
  {
    slug: "llm-opd",
    category: "postTraining",
    level: "前沿",
    zhTitle: "LLM On-Policy Distillation",
    enTitle: "LLM On-Policy Distillation",
    summary: "MiniLLM、GKD、Qwen3、Tinker 等 on-policy distillation 机制和训练信号。",
    keywords: ["OPD", "distillation", "MiniLLM", "GKD", "Qwen3"],
  },
  {
    slug: "lora-peft",
    category: "postTraining",
    level: "系统",
    zhTitle: "LoRA / PEFT",
    enTitle: "LoRA and PEFT",
    summary: "LoRA、QLoRA、DoRA、rsLoRA、PiSSA、AdaLoRA、Adapter 与 Prompt tuning。",
    keywords: ["LoRA", "QLoRA", "DoRA", "PEFT", "adapter"],
  },
  {
    slug: "moe",
    category: "architecture",
    level: "系统",
    zhTitle: "MoE (Mixture-of-Experts)",
    enTitle: "Mixture-of-Experts",
    summary: "Router、expert load balance、capacity、DeepSeek-V3、Mixtral、Llama 4 等架构要点。",
    keywords: ["MoE", "router", "expert", "DeepSeek", "Mixtral"],
  },
  {
    slug: "long-context-rope-yarn-mla",
    category: "architecture",
    level: "系统",
    zhTitle: "Long Context: RoPE / YaRN / NTK / MLA",
    enTitle: "Long Context: RoPE, YaRN, NTK, and MLA",
    summary: "位置编码外推、RoPE scaling、YaRN、NTK、MLA、sliding window 与长上下文成本。",
    keywords: ["RoPE", "YaRN", "NTK", "MLA", "long context"],
  },
  {
    slug: "linear-sparse-attention",
    category: "architecture",
    level: "前沿",
    zhTitle: "线性 / 稀疏注意力",
    enTitle: "Linear and Sparse Attention",
    summary: "线性注意力、SSM/Mamba、Mamba-2/SSD、DeltaNet、NSA、MoBA 与混合架构。",
    keywords: ["linear attention", "Mamba", "SSD", "DeltaNet", "NSA"],
  },
  {
    slug: "kv-cache-speculative-decoding",
    category: "architecture",
    level: "系统",
    zhTitle: "KV Cache + Speculative Decoding",
    enTitle: "KV Cache and Speculative Decoding",
    summary: "KV cache 显存、GQA/MLA、Medusa、EAGLE、speculative decoding 与推理吞吐。",
    keywords: ["KV cache", "speculative decoding", "Medusa", "EAGLE", "GQA"],
  },
  {
    slug: "quantization",
    category: "architecture",
    level: "系统",
    zhTitle: "Quantization",
    enTitle: "Quantization",
    summary: "GPTQ、AWQ、FP8、NVFP4、SmoothQuant 与部署中的精度/速度权衡。",
    keywords: ["quantization", "GPTQ", "AWQ", "FP8", "SmoothQuant"],
  },
  {
    slug: "distributed-training",
    category: "architecture",
    level: "系统",
    zhTitle: "Distributed Training",
    enTitle: "Distributed Training",
    summary: "DDP、FSDP2、ZeRO、TP、PP、SP、CP、EP 等大模型训练并行策略。",
    keywords: ["DDP", "FSDP", "ZeRO", "tensor parallel", "pipeline parallel"],
  },
  {
    slug: "flow-matching",
    category: "generativeTheory",
    level: "进阶",
    zhTitle: "Flow Matching Quick Reference",
    enTitle: "Flow Matching Quick Reference",
    summary: "Conditional Flow Matching、Rectified Flow、VP/VE、训练目标与采样 ODE。",
    keywords: ["flow matching", "rectified flow", "ODE", "SD3", "FLUX"],
  },
  {
    slug: "diffusion-foundations",
    category: "generativeTheory",
    level: "基础",
    zhTitle: "Diffusion Foundations",
    enTitle: "Diffusion Foundations",
    summary: "DDPM、score matching、DDIM、EDM、CFG、consistency models 与从零代码。",
    keywords: ["DDPM", "score", "DDIM", "EDM", "CFG"],
  },
  {
    slug: "vae-vqvae-vqgan",
    category: "generativeTheory",
    level: "进阶",
    zhTitle: "VAE / VQ-VAE / VQ-GAN / FSQ",
    enTitle: "VAE, VQ-VAE, VQ-GAN, and FSQ",
    summary: "连续/离散 latent、codebook、commitment loss、GAN 感知损失与 tokenizer 设计。",
    keywords: ["VAE", "VQ-VAE", "VQ-GAN", "FSQ", "tokenizer"],
  },
  {
    slug: "image-generation-systems",
    category: "generationSystems",
    level: "系统",
    zhTitle: "Image Generation Systems",
    enTitle: "Image Generation Systems",
    summary: "LDM、Stable Diffusion、SDXL、SD3、FLUX、ControlNet 与图像生成系统工程。",
    keywords: ["LDM", "Stable Diffusion", "SDXL", "SD3", "ControlNet"],
  },
  {
    slug: "video-generation",
    category: "generationSystems",
    level: "前沿",
    zhTitle: "Video Generation",
    enTitle: "Video Generation",
    summary: "Sora、Hunyuan-Video、Kling、Wan、Movie Gen 与视频生成训练/推理机制。",
    keywords: ["Sora", "Hunyuan", "Kling", "Wan", "Movie Gen"],
  },
  {
    slug: "3d-generation",
    category: "generationSystems",
    level: "前沿",
    zhTitle: "3D Generation",
    enTitle: "3D Generation",
    summary: "NeRF、Instant-NGP、3DGS、SDS、DreamFusion、Trellis 与 3D 生成面试题。",
    keywords: ["NeRF", "3DGS", "SDS", "DreamFusion", "Trellis"],
  },
  {
    slug: "diffusion-post-training",
    category: "generationSystems",
    level: "前沿",
    zhTitle: "Diffusion Post-Training",
    enTitle: "Diffusion Post-Training",
    summary: "DDPO、DPOK、DRaFT、AlignProp、Diffusion-DPO、Flow-GRPO 等生成后训练。",
    keywords: ["DDPO", "DPOK", "DRaFT", "AlignProp", "Flow-GRPO"],
  },
  {
    slug: "diffusion-distillation",
    category: "generationSystems",
    level: "前沿",
    zhTitle: "Diffusion / Flow Distillation",
    enTitle: "Diffusion and Flow Distillation",
    summary: "Consistency Models、iCT、sCM、CTM、LCM、DMD/DMD2、ADD/LADD 与加速采样。",
    keywords: ["consistency", "LCM", "DMD", "distillation", "sampling"],
  },
  {
    slug: "vlm-multimodal",
    category: "multimodal",
    level: "系统",
    zhTitle: "VLM / Multimodal",
    enTitle: "VLM and Multimodal Models",
    summary: "CLIP、LLaVA、Qwen-VL、DeepSeek-VL、视觉编码器、投影器和多模态训练。",
    keywords: ["VLM", "CLIP", "LLaVA", "Qwen-VL", "DeepSeek-VL"],
  },
  {
    slug: "agent-foundations",
    category: "agents",
    level: "系统",
    zhTitle: "Agent Foundations",
    enTitle: "Agent Foundations",
    summary: "ReAct、tool use、MCP、A2A、SWE-bench、GAIA、OSWorld 与 agent 架构基础。",
    keywords: ["agent", "ReAct", "MCP", "SWE-bench", "GAIA"],
  },
  {
    slug: "agentic-rl",
    category: "agents",
    level: "前沿",
    zhTitle: "Agentic RL",
    enTitle: "Agentic RL",
    summary: "AgentTuning、ToolRL、RAGEN、WebRL、SWE-RL、tool-use GRPO 与轨迹奖励。",
    keywords: ["Agentic RL", "ToolRL", "RAGEN", "WebRL", "SWE-RL"],
  },
  {
    slug: "multi-agent-long-horizon",
    category: "agents",
    level: "前沿",
    zhTitle: "Multi-Agent & Long-Horizon",
    enTitle: "Multi-Agent and Long-Horizon Systems",
    summary: "CAMEL、AutoGen、MetaGPT、MoA、Debate、MemGPT、LATS 与长程任务规划。",
    keywords: ["multi-agent", "AutoGen", "MetaGPT", "MoA", "LATS"],
  },
  {
    slug: "self-evolving-agents",
    category: "agents",
    level: "前沿",
    zhTitle: "Self-Evolving Agents",
    enTitle: "Self-Evolving Agents",
    summary: "Ctx2Skill、Native Evolution、A2RD、Voyager、Reflexion、STaR 等自进化机制。",
    keywords: ["self-evolving", "Voyager", "Reflexion", "STaR", "skills"],
  },
  {
    slug: "rag-embedding-retrieval",
    category: "agents",
    level: "系统",
    zhTitle: "RAG + 文本嵌入 / 检索",
    enTitle: "RAG, Embeddings, and Retrieval",
    summary: "InfoNCE、hard negatives、BM25、HNSW、RRF、ColBERT、HyDE、GraphRAG 与 RAGAS。",
    keywords: ["RAG", "embedding", "BM25", "HNSW", "ColBERT"],
  },
];

export function getTopicTitle(topic: AiKnowledgeTopic, lang: AiKnowledgeLang) {
  return lang === "en" ? topic.enTitle : topic.zhTitle;
}
