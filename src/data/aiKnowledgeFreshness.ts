import type { AiKnowledgeLang } from "@/data/aiKnowledgeCatalog";

export type AiKnowledgeFreshnessStatus = "current" | "watch" | "needsUpdate";

export interface AiKnowledgeFreshnessNote {
  slug: string;
  status: AiKnowledgeFreshnessStatus;
  reviewedAt?: string;
  priority: "P0" | "P1" | "P2";
  zhNote: string;
  enNote: string;
  zhActions: string[];
  enActions: string[];
}

export const defaultFreshnessNote: Omit<AiKnowledgeFreshnessNote, "slug"> = {
  status: "watch",
  priority: "P2",
  zhNote: "原文来自 ARIS 导入版本，尚未做本地逐段复审。建议阅读时优先核对最新论文、模型报告和库 API。",
  enNote: "Imported from ARIS and not yet locally reviewed section by section. Cross-check recent papers, model reports, and library APIs while reading.",
  zhActions: ["核对最新引用", "补充 2026 后续进展", "标注可能过时的模型/API 名称"],
  enActions: ["Check recent citations", "Add post-2026 updates", "Flag possibly stale model/API names"],
};

export const aiKnowledgeFreshnessNotes: AiKnowledgeFreshnessNote[] = [
  {
    slug: "reasoning-models",
    status: "watch",
    reviewedAt: "2026-06-29",
    priority: "P0",
    zhNote: "已在原文开头补 2026-06-29 SOTA 快照，覆盖 GPT-5.5、Claude Fable/Opus、Gemini 3.1、DeepSeek-V3.2 与 Qwen3-Next。该方向仍需持续跟踪。",
    enNote: "Added a 2026-06-29 SOTA snapshot to the article covering GPT-5.5, Claude Fable/Opus, Gemini 3.1, DeepSeek-V3.2, and Qwen3-Next. This area still needs continuous tracking.",
    zhActions: ["持续更新 frontier 模型清单", "复核 PRM/RM/verifier 表述", "跟踪 reasoning + agent + serving 的组合"],
    enActions: ["Keep frontier model list current", "Review PRM/RM/verifier claims", "Track reasoning + agent + serving interactions"],
  },
  {
    slug: "agentic-rl",
    status: "watch",
    reviewedAt: "2026-06-29",
    priority: "P0",
    zhNote: "已在原文补 2026-06-29 SOTA 快照，强调闭源模型 agent 能力、训练 recipe 不可反推，以及环境/验证器瓶颈。",
    enNote: "Added a 2026-06-29 SOTA snapshot emphasizing closed-model agent capabilities, the limits of inferring training recipes, and environment/verifier bottlenecks.",
    zhActions: ["跟踪 SWE/Web/GUI agent 评测", "区分 RLVR、GRPO、trajectory reward", "补 verifier 与 sandbox 成本讨论"],
    enActions: ["Track SWE/Web/GUI agent evals", "Separate RLVR, GRPO, and trajectory reward", "Add verifier and sandbox cost notes"],
  },
  {
    slug: "linear-sparse-attention",
    status: "watch",
    reviewedAt: "2026-06-29",
    priority: "P0",
    zhNote: "已在原文补 DeepSeek DSA、Qwen3-Next hybrid attention 与 serving 支持的 2026 快照。该方向仍会随 kernel/serving 栈快速变化。",
    enNote: "Added a 2026 snapshot covering DeepSeek DSA, Qwen3-Next hybrid attention, and serving support. This area will keep changing with kernels and serving stacks.",
    zhActions: ["持续跟踪 hybrid attention", "复核复杂度与 KV cache 说法", "补工业模型采用情况"],
    enActions: ["Keep tracking hybrid attention", "Review complexity and KV-cache statements", "Add production model adoption notes"],
  },
  {
    slug: "long-context-rope-yarn-mla",
    status: "watch",
    reviewedAt: "2026-06-29",
    priority: "P0",
    zhNote: "已在原文补 1M context、DSA、hybrid attention 与长上下文读法的 2026 快照。仍建议持续复核新模型窗口和 recall 质量。",
    enNote: "Added a 2026 snapshot covering 1M context, DSA, hybrid attention, and how to read long-context reports. Continue reviewing new model windows and recall quality.",
    zhActions: ["跟踪 1M context 实测质量", "更新 MLA/压缩 KV 机制", "标注训练外推与检索增强边界"],
    enActions: ["Track measured 1M-context quality", "Update MLA/compressed-KV mechanisms", "Clarify extrapolation versus retrieval augmentation"],
  },
  {
    slug: "kv-cache-speculative-decoding",
    status: "needsUpdate",
    priority: "P1",
    zhNote: "推理系统进展很快，speculative decoding、KV 压缩和 serving trade-off 需要结合最新部署经验更新。",
    enNote: "Inference systems are moving quickly; speculative decoding, KV compression, and serving trade-offs need recent deployment context.",
    zhActions: ["补最新 speculative decoding 变体", "复核 KV cache 显存公式", "加入 serving 场景取舍"],
    enActions: ["Add recent speculative decoding variants", "Review KV-cache memory formulas", "Add serving trade-offs"],
  },
  {
    slug: "quantization",
    status: "watch",
    reviewedAt: "2026-06-29",
    priority: "P1",
    zhNote: "已在原文补 FP8、MXFP8、NVFP4、Blackwell 与端到端量化工具链的 2026 快照。",
    enNote: "Added a 2026 snapshot covering FP8, MXFP8, NVFP4, Blackwell, and end-to-end quantization toolchains.",
    zhActions: ["持续核对硬件支持矩阵", "更新低比特推理工具", "补训练量化与推理量化边界"],
    enActions: ["Keep checking hardware support matrix", "Update low-bit inference tools", "Clarify training versus inference quantization"],
  },
  {
    slug: "vlm-multimodal",
    status: "watch",
    reviewedAt: "2026-06-29",
    priority: "P1",
    zhNote: "已在原文补统一多模态输入、闭源架构不可见、多模态 embedding/RAG 的 2026 快照。",
    enNote: "Added a 2026 snapshot covering unified multimodal input, undisclosed closed architectures, and multimodal embedding/RAG.",
    zhActions: ["持续跟踪 VLM/omni 模型", "复核视觉塔与 projector 说法", "加入视频/GUI/agent 多模态场景"],
    enActions: ["Keep tracking VLM/omni models", "Review vision tower and projector claims", "Add video/GUI/agent multimodal scenarios"],
  },
  {
    slug: "video-generation",
    status: "watch",
    reviewedAt: "2026-06-29",
    priority: "P1",
    zhNote: "已在原文补 Sora 2、Veo 3.1、Runway Gen-4/4.5 与音频/可控编辑/产品可用性的 2026 快照。",
    enNote: "Added a 2026 snapshot covering Sora 2, Veo 3.1, Runway Gen-4/4.5, audio, controllable editing, and product availability.",
    zhActions: ["持续跟踪视频生成模型", "复核 DiT/时空注意力描述", "加入长视频一致性与评测"],
    enActions: ["Keep tracking video generation models", "Review DiT/spatiotemporal attention descriptions", "Add long-video consistency and evaluation"],
  },
  {
    slug: "image-generation-systems",
    status: "watch",
    reviewedAt: "2026-06-29",
    priority: "P1",
    zhNote: "已在原文补 GPT Image、Gemini/Nano Banana、编辑能力、provenance 与安全层的 2026 快照。",
    enNote: "Added a 2026 snapshot covering GPT Image, Gemini/Nano Banana, editing capability, provenance, and safety layers.",
    zhActions: ["持续更新模型清单", "补编辑/控制新方法", "复核 SD/FLUX 生态工具"],
    enActions: ["Keep refreshing model list", "Add editing/control methods", "Review SD/FLUX ecosystem tooling"],
  },
  {
    slug: "diffusion-post-training",
    status: "watch",
    priority: "P1",
    zhNote: "Diffusion/flow 后训练仍在发展，奖励建模、偏好优化和高效微调部分适合做本地更新。",
    enNote: "Diffusion/flow post-training is still evolving; reward modeling, preference optimization, and efficient finetuning need local updates.",
    zhActions: ["补 flow/diffusion RL 新工作", "复核 DDPO/DPOK/Flow-GRPO 边界", "加入图像/视频偏好数据讨论"],
    enActions: ["Add new flow/diffusion RL work", "Review DDPO/DPOK/Flow-GRPO boundaries", "Add image/video preference-data notes"],
  },
  {
    slug: "rag-embedding-retrieval",
    status: "watch",
    reviewedAt: "2026-06-29",
    priority: "P1",
    zhNote: "已在原文补多模态 embedding、Cohere/Qwen3/Gemini embedding、GraphRAG 与 hybrid retrieval 的 2026 快照。",
    enNote: "Added a 2026 snapshot covering multimodal embeddings, Cohere/Qwen3/Gemini embeddings, GraphRAG, and hybrid retrieval.",
    zhActions: ["持续跟踪 embedding/reranker", "更新 GraphRAG/agentic retrieval", "加入评测和失败模式"],
    enActions: ["Keep tracking embedding/reranker updates", "Refresh GraphRAG/agentic retrieval", "Add evaluation and failure modes"],
  },
  {
    slug: "attention",
    status: "current",
    reviewedAt: "2026-06-29",
    priority: "P2",
    zhNote: "基础机制相对稳定。后续可补 FlashAttention/SDPA API 与实际框架差异。",
    enNote: "Core mechanisms are stable. Future local notes can add FlashAttention/SDPA API and framework differences.",
    zhActions: ["补框架 API 差异", "加入长上下文实现注意事项"],
    enActions: ["Add framework API differences", "Add long-context implementation caveats"],
  },
];

const noteBySlug = new Map(aiKnowledgeFreshnessNotes.map((note) => [note.slug, note]));

export function getAiKnowledgeFreshnessNote(slug: string): AiKnowledgeFreshnessNote {
  return noteBySlug.get(slug) ?? { ...defaultFreshnessNote, slug };
}

export function getAiKnowledgeFreshnessText(note: AiKnowledgeFreshnessNote, lang: AiKnowledgeLang) {
  return {
    note: lang === "en" ? note.enNote : note.zhNote,
    actions: lang === "en" ? note.enActions : note.zhActions,
  };
}

export function getFreshnessStatusLabel(status: AiKnowledgeFreshnessStatus, lang: AiKnowledgeLang) {
  const labels: Record<AiKnowledgeFreshnessStatus, Record<AiKnowledgeLang, string>> = {
    current: { zh: "相对稳定", en: "Stable" },
    watch: { zh: "建议关注", en: "Watch" },
    needsUpdate: { zh: "优先更新", en: "Needs update" },
  };

  return labels[status][lang];
}
