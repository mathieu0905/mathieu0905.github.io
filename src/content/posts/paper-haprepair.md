---
title: "HapRepair：让 AI 学会修复鸿蒙应用"
date: "2025-03-20"
description: "面向 OpenHarmony 生态的自动化程序修复工具，结合领域规则与 LLM，在华为真实项目中落地验证。被 FSE Industry 2025 接收。"
tags: ["论文解读", "程序修复", "OpenHarmony"]
coverColor: "from-green-500 to-emerald-600"
---

# HapRepair：让 AI 学会修复鸿蒙应用

> 📄 发表于 **FSE Industry 2025** | [PDF](/papers/_FSE_Industry2025__Learn_to_Repair_OpenHarmony_Apps.pdf)
>
> 作者：Zhihao Lin, Mingyi Zhou, Wei Ma, Chi Chen, Yun Yang, Jun Wang, Chunming Hu, Li Li

---

## 一句话概括

我们为鸿蒙（OpenHarmony）生态构建了第一个自动化应用修复工具，能自动检测 ArkTS 代码中的缺陷并生成修复补丁。

---

## 背景：为什么鸿蒙应用需要专门的修复工具？

鸿蒙生态正在高速发展，但开发者面临一个独特的挑战：**从 Android/Java 迁移到 ArkTS 时，大量的 API 差异和语言特性差异会引入新的 Bug**。

问题是：
- ArkTS 是一门相对新的语言，现有的代码分析工具对它支持有限
- OpenHarmony 的 API 和 Android 看似相似但又不完全一样，很容易写出"看起来对但实际上有问题"的代码
- 华为内部有大量 App 需要适配，人工逐一修复效率太低

## HapRepair 怎么做的？

### 1. 领域规则挖掘
我们首先从 OpenHarmony 官方文档、API 变更日志和真实 Bug 报告中挖掘出一系列**领域特定的缺陷模式**——比如"这个 Android API 在鸿蒙中的等价写法是什么"、"这种写法会触发哪些兼容性问题"。

### 2. 静态分析定位
利用 ArkAnalyzer（我们实验室构建的 OpenHarmony 静态分析框架）对代码进行扫描，精确定位潜在的缺陷位置。

### 3. LLM 补丁生成
将定位到的缺陷上下文、对应的修复规则和代码片段一起送给 LLM，让它生成修复补丁。这里的关键是**约束引导**——我们不是让 LLM 自由发挥，而是用领域知识约束它的输出，确保生成的补丁符合 ArkTS 语法和 OpenHarmony API 规范。

### 4. 验证闭环
生成的补丁会经过编译检查和规则验证，确保修复不会引入新问题。

## 实际效果

- 在华为内部的真实项目上做了验证
- 核心模块已开源为 [HomeCheck](https://gitcode.com/openharmony-sig/homecheck)，被纳入 OpenHarmony 社区工具链
- 这不只是一篇论文，而是一个真正在用的工程工具

## 学到了什么

做工业界论文和做学术论文最大的区别是：**你的方法必须在真实环境中跑起来**。不是在精心策划的 benchmark 上刷分数，而是要面对真实代码库中各种奇奇怪怪的情况。这段经历让我深刻理解了"from research to practice"的鸿沟有多大。

---

*感谢华为团队的合作和支持，这是一段非常宝贵的工业界研究经历。*
