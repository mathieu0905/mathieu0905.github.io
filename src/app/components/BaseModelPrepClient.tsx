"use client";

import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBookOpen,
  FaBrain,
  FaBullseye,
  FaChartLine,
  FaCircleCheck,
  FaCode,
  FaDatabase,
  FaFlask,
  FaGear,
  FaLayerGroup,
  FaMicrochip,
  FaRegLightbulb,
  FaTerminal,
} from "react-icons/fa6";
import {
  conceptCards,
  frontierPapers,
  incidentCards,
  interviewQuestions,
  narrativeBullets,
  prepWeeks,
  type FrontierPaper,
  type PrepTrackId,
} from "@/data/baseModelPrep";

const trackMeta: Record<
  PrepTrackId,
  {
    label: string;
    short: string;
    icon: typeof FaBrain;
    color: string;
    bg: string;
  }
> = {
  foundation: {
    label: "ML 地基",
    short: "loss / gradient / optimizer",
    icon: FaBrain,
    color: "text-rose-600 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900",
  },
  transformer: {
    label: "Transformer",
    short: "attention / RoPE / KV cache",
    icon: FaLayerGroup,
    color: "text-sky-600 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900",
  },
  training: {
    label: "训练系统",
    short: "data / memory / distributed",
    icon: FaMicrochip,
    color: "text-emerald-600 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900",
  },
  postTraining: {
    label: "Post-training",
    short: "SFT / DPO / RLHF",
    icon: FaGear,
    color: "text-indigo-600 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900",
  },
  agentic: {
    label: "Agentic RL",
    short: "verifier / trajectory / SWE env",
    icon: FaTerminal,
    color: "text-amber-600 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900",
  },
  narrative: {
    label: "面试叙事",
    short: "把 SE 优势翻译成基模语言",
    icon: FaBullseye,
    color: "text-violet-600 dark:text-violet-300",
    bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900",
  },
};

const themes: FrontierPaper["theme"][] = ["模型报告", "代码模型", "SWE Agent 训练", "Agent RL", "评测与数据"];

function priorityClass(priority: FrontierPaper["priority"]) {
  if (priority === "必读") return "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200";
  if (priority === "精读") return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200";
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
}

export function BaseModelPrepClient() {
  const [activeTrack, setActiveTrack] = useState<PrepTrackId>("foundation");
  const [activeConcept, setActiveConcept] = useState(conceptCards[0].id);
  const [activeQuestion, setActiveQuestion] = useState(interviewQuestions[0].id);
  const [theme, setTheme] = useState<FrontierPaper["theme"] | "全部">("全部");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const visibleConcepts = conceptCards.filter((card) => card.track === activeTrack);
  const currentConcept = conceptCards.find((card) => card.id === activeConcept) ?? visibleConcepts[0] ?? conceptCards[0];
  const visibleQuestions = interviewQuestions.filter((question) => question.track === activeTrack || activeTrack === "narrative");
  const currentQuestion = interviewQuestions.find((question) => question.id === activeQuestion) ?? visibleQuestions[0] ?? interviewQuestions[0];
  const filteredPapers = useMemo(
    () => (theme === "全部" ? frontierPapers : frontierPapers.filter((paper) => paper.theme === theme)),
    [theme],
  );

  const taskIds = prepWeeks.flatMap((week) => week.tasks.map((task) => task.id));
  const completed = taskIds.filter((id) => done[id]).length;
  const completion = Math.round((completed / taskIds.length) * 100);

  function switchTrack(track: PrepTrackId) {
    setActiveTrack(track);
    const nextConcept = conceptCards.find((card) => card.track === track);
    const nextQuestion = interviewQuestions.find((question) => question.track === track);
    if (nextConcept) setActiveConcept(nextConcept.id);
    if (nextQuestion) setActiveQuestion(nextQuestion.id);
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-gray-900 dark:bg-gray-950 dark:text-white">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8 overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-900">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-7 md:p-9">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                  代码基模训练备战
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  ML 地基 + Agentic Training
                </span>
              </div>
              <h1 className="mb-4 text-3xl font-bold tracking-normal text-gray-950 dark:text-white md:text-5xl">
                从 SE 强简历到 Code Model Training 共同语言
              </h1>
              <p className="max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg">
                这不是泛泛的机器学习课，而是一套面向基模组面试和入组工作的学习台：先把 loss、Transformer、训练系统讲稳，再把 SWE agent、verifier、execution feedback 和前沿模型报告串成你的主线。
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["3 周", "完成第一轮高密度复习"],
                  ["10+ 篇", "前沿模型与 agentic training 材料"],
                  ["6 条线", "覆盖基础、训练、RL 与面试叙事"],
                ].map(([value, label]) => (
                  <div key={value} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
                    <div className="text-2xl font-bold text-gray-950 dark:text-white">{value}</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-950 p-7 text-white dark:border-gray-800 lg:border-l lg:border-t-0">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-200">
                <FaChartLine />
                复习进度
              </div>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold">{completion}%</div>
                  <div className="text-sm text-gray-300">本机浏览器状态，不写入服务器</div>
                </div>
                <div className="text-sm text-gray-300">
                  {completed}/{taskIds.length}
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${completion}%` }} />
              </div>
              <div className="mt-6 space-y-3">
                {narrativeBullets.map((bullet) => (
                  <div key={bullet} className="flex gap-3 rounded-xl bg-white/5 p-3 text-sm leading-6 text-gray-200">
                    <FaCircleCheck className="mt-1 flex-shrink-0 text-blue-300" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(trackMeta) as PrepTrackId[]).map((track) => {
            const meta = trackMeta[track];
            const Icon = meta.icon;
            const active = track === activeTrack;
            return (
              <button
                key={track}
                onClick={() => switchTrack(track)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  active
                    ? `${meta.bg} shadow-md ring-2 ring-blue-500/30`
                    : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800 ${meta.color}`}>
                    <Icon />
                  </div>
                  <FaArrowRight className={active ? meta.color : "text-gray-300 dark:text-gray-600"} />
                </div>
                <div className="font-semibold text-gray-950 dark:text-white">{meta.label}</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{meta.short}</div>
              </button>
            );
          })}
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <FaBookOpen className={trackMeta[activeTrack].color} />
              <h2 className="text-xl font-bold">知识卡片</h2>
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {visibleConcepts.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setActiveConcept(card.id)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    currentConcept.id === card.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {card.title}
                </button>
              ))}
            </div>
            <div className={`rounded-xl border p-5 ${trackMeta[currentConcept.track].bg}`}>
              <div className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">一句话</div>
              <h3 className="mb-4 text-2xl font-bold text-gray-950 dark:text-white">{currentConcept.oneLiner}</h3>
              <div className="space-y-4 text-sm leading-7 text-gray-700 dark:text-gray-300">
                <div>
                  <div className="mb-1 font-semibold text-gray-950 dark:text-white">机制</div>
                  <p>{currentConcept.mechanism}</p>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-gray-950 dark:text-white">面试说法</div>
                  <p>{currentConcept.interviewAnswer}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentConcept.checkpoints.map((checkpoint) => (
                  <span key={checkpoint} className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                    {checkpoint}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <FaRegLightbulb className="text-amber-500" />
              <h2 className="text-xl font-bold">面试问答训练</h2>
            </div>
            <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-2">
                {visibleQuestions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => setActiveQuestion(question.id)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                      currentQuestion.id === question.id
                        ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                        : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 dark:border-gray-800 dark:bg-gray-800/70 dark:text-gray-300"
                    }`}
                  >
                    {question.question}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/70">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Short answer</div>
                <p className="text-base font-semibold leading-7 text-gray-950 dark:text-white">{currentQuestion.shortAnswer}</p>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Deep answer</div>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {currentQuestion.deepAnswer.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-lg bg-white p-3 text-sm leading-6 text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300">
                  <span className="font-semibold text-gray-950 dark:text-white">接回简历：</span>
                  {currentQuestion.bridgeToCv}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-300">
                <FaDatabase />
                <span className="text-sm font-semibold">复习路线</span>
              </div>
              <h2 className="text-2xl font-bold">三周地基计划</h2>
            </div>
            <button
              onClick={() => setDone({})}
              className="self-start rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              重置进度
            </button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {prepWeeks.map((week) => (
              <div key={week.id} className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/60">
                <h3 className="text-lg font-bold text-gray-950 dark:text-white">{week.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{week.focus}</p>
                <div className="mt-3 rounded-lg bg-white p-3 text-sm text-gray-600 shadow-sm dark:bg-gray-900 dark:text-gray-300">
                  <span className="font-semibold text-gray-950 dark:text-white">产出：</span>
                  {week.outcome}
                </div>
                <div className="mt-4 space-y-2">
                  {week.tasks.map((task) => (
                    <label
                      key={task.id}
                      className={`block cursor-pointer rounded-lg border p-3 transition-colors ${
                        done[task.id]
                          ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
                          : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(done[task.id])}
                          onChange={() => setDone((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        <div>
                          <div className="font-semibold text-gray-950 dark:text-white">{task.label}</div>
                          <div className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">{task.detail}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                <FaFlask />
                <span className="text-sm font-semibold">Frontier Radar</span>
              </div>
              <h2 className="text-2xl font-bold">前沿论文与技术报告雷达</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                只放和基模组面试、code model training、agentic SWE 直接相关的材料。读的时候不要追完整细节，先抓训练目标、数据来源、环境、reward 和你的 CV 连接。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["全部", ...themes] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setTheme(item)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    theme === item
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredPapers.map((paper) => (
              <article key={paper.id} className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/60">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(paper.priority)}`}>{paper.priority}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">{paper.theme}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{paper.organization} · {paper.year}</span>
                </div>
                <h3 className="text-lg font-bold leading-7 text-gray-950 dark:text-white">{paper.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{paper.whyItMatters}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
                      <FaCode />
                      Key ideas
                    </div>
                    <ul className="space-y-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {paper.keyIdeas.map((idea) => (
                        <li key={idea} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
                      <FaBrain />
                      Training lens
                    </div>
                    <ul className="space-y-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {paper.trainingLens.map((lens) => (
                        <li key={lens} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                          <span>{lens}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-white p-3 text-sm leading-6 text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300">
                  <span className="font-semibold text-gray-950 dark:text-white">接回你的简历：</span>
                  {paper.cvBridge}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">{paper.readFor}</p>
                  <a
                    href={paper.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-950 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
                  >
                    {paper.sourceLabel}
                    <FaArrowRight className="text-xs" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
          <div className="mb-5 flex items-center gap-2">
            <FaChartLine className="text-rose-500" />
            <h2 className="text-2xl font-bold">训练事故排查卡</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {incidentCards.map((incident) => (
              <div key={incident.id} className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/60">
                <h3 className="text-lg font-bold text-gray-950 dark:text-white">{incident.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-950 dark:text-white">症状：</span>
                  {incident.symptom}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-950 dark:text-white">可能原因</div>
                    <ul className="space-y-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {incident.likelyCauses.map((cause) => (
                        <li key={cause}>- {cause}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-950 dark:text-white">排查顺序</div>
                    <ul className="space-y-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {incident.diagnosis.map((step) => (
                        <li key={step}>- {step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-white p-3 text-sm leading-6 text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300">
                  <span className="font-semibold text-gray-950 dark:text-white">面试金句：</span>
                  {incident.interviewLine}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
