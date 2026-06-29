import type { Metadata } from "next";
import { AiKnowledgeHub } from "@/app/components/AiKnowledgeHub";
import { getAiKnowledgeSourceMeta, getAiKnowledgeTopics } from "@/lib/aiKnowledge";

export const metadata: Metadata = {
  title: "AI 知识库 | Zhihao Lin",
  description: "A searchable bilingual AI knowledge base integrated from ARIS-in-AI-Offer.",
};

export default function AiKnowledgePage() {
  return <AiKnowledgeHub topics={getAiKnowledgeTopics()} sourceMeta={getAiKnowledgeSourceMeta()} />;
}
