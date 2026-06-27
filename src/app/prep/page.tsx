import type { Metadata } from "next";
import { BaseModelPrepClient } from "@/app/components/BaseModelPrepClient";

export const metadata: Metadata = {
  title: "基模组备战学习台 | Zhihao Lin",
  description: "ML foundations, model training, and agentic code model reading plan for base-model interviews.",
};

export default function PrepPage() {
  return <BaseModelPrepClient />;
}
