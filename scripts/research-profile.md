# 研究画像 — 林智灏 (Zhihao Lin)

> 此文件供 Claude Code agent 做个性化 arXiv 推荐时参考。
> 最近更新：2026-04-22（去掉 AI*Security 主方向，按当前 12 篇论文的实际主线重写）

## 身份

- 北京航空航天大学博士生（硕转博第一年），SMAT 实验室
- 研究方向：AI for Software Engineering，目标工业界（AI Coding Agent / LLM for SE 方向）
- 研究哲学：**LLM/agent 边际价值的实证量化** + **新生语言 / 生态的完整工具链**

## 核心研究方向

### 1. LLM / Agent 方法论的实证评估
- Agent 工作流单个设计动作（test execution / structure injection / tangled patch splitting）的**边际价值量化**
- Benchmark 合理性、process quality vs outcome correctness、partition / ordering metrics
- 公开 agent trace（SWE-bench、OpenHands、Aider 日志）的大规模事后分析，而非端到端重跑
- 统计严谨性：McNemar、TOST 等价检验、Cohen κ / Gwet AC1 一致性

### 2. Program Repair & Compatibility Migration
- LLM-based fault localization + patch generation，**职责切分哲学**（static analysis 做定位，LLM 只负责修复）
- Whole-repository compatibility repair（Python 版本演化 / dependency API 演化）
- Cross-platform migration（Android → HarmonyOS app 迁移）
- 静态信号驱动的迭代修复

### 3. OpenHarmony / 新生语言生态工具链
- ArkTS 项目级静态分析 + 修复（HomeCheck 开源工具，已集成进 DevEco Studio）
- Cangjie 等低资源语言的 continued pretraining + transfer learning + decoding 干预
- ArkUI 渲染性能问题的形式化（phantom rendering 类新性能问题类别）
- 链条完整：修复 / 补全 / 性能 / 迁移

### 4. Small / Local LLM for Code
- 7B–14B 开源代码模型（DeepSeek-Coder / Qwen-Coder / CodeLlama / StarCoder）能否替代商业 API
- 预处理 / 静态分析 / rule-based filtering 把问题压到小模型能解的规模
- Fine-tuning / LoRA / continued pretraining / fill-in-the-middle / prefix-matching decoding
- LLM 作为"程序执行状态预测器"等非传统用法

### 5. Benchmark & Evaluation Methodology
- 自动 + 专家裁决 + 一致性校验三层评估协议
- 真实 vs 合成 benchmark 的偏差实证
- 被忽视的工程质量维度（tangled commit / atomic commit / bisect 可用性）

## 关注的 arXiv 分类

- **主要**：cs.SE, cs.CL, cs.LG, cs.AI
- **次要**：cs.PL

## 推荐偏好

### 强优先
- LLM × SE 交叉
- Agent 边际价值分析 / agent evaluation methodology / agent cost reduction
- Program repair、compatibility / migration
- 小模型代码能力、local inference 优化、distillation、LoRA
- Benchmark 设计与方法论批判

### 欢迎
- 即使应用领域不是 SE，只要方法论能迁移（如 trace 分析、evaluation rigor、local inference 技巧）

### 不再是重点
- **Jailbreak / LLM safety & robustness**：过往工作 MazeBreaker 已完成，**不再继续此方向**。相关论文除非方法论能直接迁移到 SE（极少），否则不推荐
- 纯理论 ML / 纯 NLP（非代码相关）
- 纯 attack / defense 无 SE 落地的安全论文

### 谨慎推荐
- 过度依赖商业 API 大规模 agent 端到端实验的工作（和用户资源约束不符，可参考但别作为主线借鉴方向）
- 纯 agent 框架工程论文（用户不再自己做 agent 框架，只做 agent 现象实证）

## 研究哲学摘要

- **边际价值量化**：当 LLM 已经 work，精确测每个设计动作的真实贡献——常常得出反直觉结论（如 test execution 只贡献 1.25pp）
- **打成一片**：新 idea 必须延续现有两条主线（OpenHarmony 工具链 或 agent marginal value）
- **不做学术 rubbish**：产出 benchmark / tool / guideline / dataset，真能被用上
- **Ship 速度 + 开源 star 潜力** > 押某个 vertical 3 年后还热
