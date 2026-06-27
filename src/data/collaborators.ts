export type CollaboratorOrg = "Huawei" | "BTH" | "SMU";

export interface Collaborator {
  name: string;
  org: CollaboratorOrg;
  role?: { zh: string; en: string };
  acknowledgement?: { zh: string; en: string };
  links?: { label: string; href: string }[];
  works?: { zh: string; en: string }[];
}

export const collaborators: Collaborator[] = [
  {
    name: "Wei Ma",
    org: "BTH",
    role: {
      zh: "瑞典布莱金厄理工学院（BTH）助理高级讲师",
      en: "Associate Senior Lecturer, Blekinge Institute of Technology",
    },
    acknowledgement: {
      zh: "衷心感谢 Wei Ma 老师带我走上科研道路。刚开始接触科研时，是他在选题、论文阅读、实验设计和写作上给予了持续而耐心的帮助；我的许多早期科研训练都离不开他的指导与支持。",
      en: "Heartfelt thanks to Wei Ma for guiding me into research. When I first began, he patiently helped me with topic selection, paper reading, experiment design, and writing; much of my early research training was shaped by his guidance and support.",
    },
    links: [
      { label: "BTH", href: "https://www.bth.se/english/about-bth/departments/department-of-software-engineering/staff-at-the-department-of-software-engineering" },
      { label: "Google Scholar", href: "https://scholar.google.com/citations?user=ZubTNs0AAAAJ" },
    ],
    works: [
      {
        zh: "MazeBreaker：面向 LLM 越狱评测的多智能体强化学习框架",
        en: "MazeBreaker: multi-agent RL for LLM jailbreak evaluation",
      },
      {
        zh: "HapRepair：面向 OpenHarmony 应用的 LLM 辅助修复",
        en: "HapRepair: LLM-guided repair for OpenHarmony apps",
      },
      {
        zh: "Exploring Code Analysis：LLM 代码语法与语义理解评估",
        en: "Exploring Code Analysis: syntax and semantic probing with LLMs",
      },
      {
        zh: "Open-source AI-based SE Tools：AI4SE 开源生态综述",
        en: "Open-source AI-based SE tools survey",
      },
    ],
  },
  {
    name: "Zhensu Sun",
    org: "SMU",
    role: {
      zh: "新加坡管理大学（SMU）博士候选人",
      en: "PhD candidate, Singapore Management University",
    },
    acknowledgement: {
      zh: "也衷心感谢 Zhensu Sun。在我逐渐能够独立提出研究想法之后，他仍然在问题定义、实验设计、论文叙事和局限分析等方面给予了许多建设性的意见，帮助我学会把初步 idea 打磨成更完整、更扎实的研究工作。",
      en: "Heartfelt thanks also to Zhensu Sun. After I became able to develop research ideas more independently, he continued to offer constructive advice on problem framing, experiment design, paper narrative, and limitation analysis, helping me learn how to refine early ideas into more complete and solid research work.",
    },
    links: [
      { label: "Homepage", href: "https://v587su.github.io/" },
      { label: "Google Scholar", href: "https://scholar.google.com/citations?user=AlpdlkYAAAAJ" },
    ],
    works: [
      {
        zh: "EAGER：在 LLM 生成代码时并行执行以隐藏延迟",
        en: "EAGER: executing code as LLMs generate it",
      },
      {
        zh: "To Run or Not to Run：LLM 修复智能体中的执行成本收益分析",
        en: "To Run or Not to Run: execution cost-effectiveness in LLM repair agents",
      },
    ],
  },
  {
    name: "Chi Chen",
    org: "Huawei",
    works: [
      { zh: "HapRepair：OpenHarmony 应用修复", en: "HapRepair: OpenHarmony app repair" },
      { zh: "Cangjie：低资源编程语言微调", en: "Cangjie low-resource language fine-tuning" },
    ],
  },
  {
    name: "Han Hu",
    org: "Huawei",
    works: [
      { zh: "Phantom Rendering Detection：移动 UI 性能分析", en: "Phantom Rendering detection for mobile UI performance" },
    ],
  },
  {
    name: "Bo Sun",
    org: "Huawei",
    works: [
      { zh: "Phantom Rendering Detection：移动 UI 性能分析", en: "Phantom Rendering detection for mobile UI performance" },
    ],
  },
  {
    name: "Gang Fan",
    org: "Huawei",
    works: [
      { zh: "Phantom Rendering Detection：移动 UI 性能分析", en: "Phantom Rendering detection for mobile UI performance" },
    ],
  },
];
