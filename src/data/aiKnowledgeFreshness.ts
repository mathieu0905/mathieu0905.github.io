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
    status: "needsUpdate",
    priority: "P0",
    zhNote: "推理模型方向变化最快，原文中的模型格局、test-time scaling 和 PRM/RLVR 叙事需要优先复审。",
    enNote: "Reasoning models are moving quickly; model landscape, test-time scaling, and PRM/RLVR framing should be reviewed first.",
    zhActions: ["补最新 reasoning 模型报告", "复核 PRM/RM/verifier 表述", "更新 test-time compute 与 agentic RL 的关系"],
    enActions: ["Add recent reasoning model reports", "Review PRM/RM/verifier claims", "Update the test-time compute and agentic RL connection"],
  },
  {
    slug: "agentic-rl",
    status: "needsUpdate",
    priority: "P0",
    zhNote: "Agentic RL、SWE 环境和 tool-use 训练仍在快速迭代，建议把 2026 的 SWE agent 训练工作作为本地补充重点。",
    enNote: "Agentic RL, SWE environments, and tool-use training are still changing fast; 2026 SWE-agent training work should be added locally.",
    zhActions: ["补 SWE agent 训练/评测新工作", "区分 RLVR、GRPO、trajectory reward", "补 verifier 与 sandbox 成本讨论"],
    enActions: ["Add new SWE-agent training/evaluation work", "Separate RLVR, GRPO, and trajectory reward", "Add verifier and sandbox cost notes"],
  },
  {
    slug: "linear-sparse-attention",
    status: "needsUpdate",
    priority: "P0",
    zhNote: "高效注意力和混合架构更新频繁，Mamba/linear attention/sparse attention 的前沿模型清单需要持续校准。",
    enNote: "Efficient attention and hybrid architectures move quickly; the Mamba/linear/sparse attention model list needs continuous calibration.",
    zhActions: ["更新新混合架构", "复核复杂度与 KV cache 说法", "补工业模型采用情况"],
    enActions: ["Update hybrid architectures", "Review complexity and KV-cache statements", "Add production model adoption notes"],
  },
  {
    slug: "long-context-rope-yarn-mla",
    status: "needsUpdate",
    priority: "P0",
    zhNote: "长上下文、RoPE scaling、MLA/压缩 KV 是 2026 仍在高速变化的系统方向，需要优先补最新模型报告。",
    enNote: "Long context, RoPE scaling, and MLA/compressed KV remain fast-moving systems topics in 2026; recent model reports should be added first.",
    zhActions: ["补 1M context 相关报告", "更新 MLA/压缩 KV 机制", "标注训练外推与检索增强边界"],
    enActions: ["Add 1M-context reports", "Update MLA/compressed-KV mechanisms", "Clarify extrapolation versus retrieval augmentation"],
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
    status: "needsUpdate",
    priority: "P1",
    zhNote: "量化格式、硬件支持和部署工具更新很快，需要把 FP8/NVFP4/低比特推理与最新框架支持重新对齐。",
    enNote: "Quantization formats, hardware support, and deployment tooling are changing fast; FP8/NVFP4/low-bit inference should be realigned with current frameworks.",
    zhActions: ["核对硬件支持矩阵", "更新低比特推理工具", "补训练量化与推理量化边界"],
    enActions: ["Check hardware support matrix", "Update low-bit inference tools", "Clarify training versus inference quantization"],
  },
  {
    slug: "vlm-multimodal",
    status: "needsUpdate",
    priority: "P1",
    zhNote: "多模态模型和视觉编码器选择变化很快，建议补最新 VLM、omni 模型和视频理解进展。",
    enNote: "Multimodal models and vision encoder choices change quickly; add recent VLM, omni-model, and video-understanding progress.",
    zhActions: ["补最新 VLM/omni 模型", "复核视觉塔与 projector 说法", "加入视频/GUI/agent 多模态场景"],
    enActions: ["Add recent VLM/omni models", "Review vision tower and projector claims", "Add video/GUI/agent multimodal scenarios"],
  },
  {
    slug: "video-generation",
    status: "needsUpdate",
    priority: "P1",
    zhNote: "视频生成模型、数据配方和推理系统更新频繁，原文需要按最新公开报告补充。",
    enNote: "Video generation models, data recipes, and inference systems change frequently; update with recent public reports.",
    zhActions: ["补最新视频生成模型", "复核 DiT/时空注意力描述", "加入长视频一致性与评测"],
    enActions: ["Add recent video generation models", "Review DiT/spatiotemporal attention descriptions", "Add long-video consistency and evaluation"],
  },
  {
    slug: "image-generation-systems",
    status: "watch",
    priority: "P1",
    zhNote: "图像生成系统整体结构仍有参考价值，但模型清单、Control/编辑/蒸馏部分需要定期更新。",
    enNote: "The image-generation systems overview remains useful, but model lists and control/editing/distillation sections should be refreshed regularly.",
    zhActions: ["更新模型清单", "补编辑/控制新方法", "复核 SD/FLUX 生态工具"],
    enActions: ["Refresh model list", "Add editing/control methods", "Review SD/FLUX ecosystem tooling"],
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
    priority: "P1",
    zhNote: "RAG 基础仍然有用，但 embedding、reranker、GraphRAG、agentic retrieval 的近期实践需要补充。",
    enNote: "RAG fundamentals remain useful, but recent embedding, reranker, GraphRAG, and agentic retrieval practices should be added.",
    zhActions: ["补最新 embedding/reranker", "更新 GraphRAG/agentic retrieval", "加入评测和失败模式"],
    enActions: ["Add recent embedding/reranker updates", "Refresh GraphRAG/agentic retrieval", "Add evaluation and failure modes"],
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
