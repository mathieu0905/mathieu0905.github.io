import Image from "next/image";
import { FaEnvelope, FaGithub, FaGoogleScholar } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-16">
          <Image
            src="/avatar.jpg"
            alt="Zhihao Lin"
            width={180}
            height={180}
            className="rounded-full"
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              林智灏 (Zhihao Lin)
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Ph.D. Student
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              SMAT Laboratory<br />
              Beihang University (北京航空航天大学)
            </p>
            <div className="flex gap-4 justify-center md:justify-start text-2xl">
              <a href="mailto:mathieulin@buaa.edu.cn" className="text-gray-600 hover:text-blue-600 dark:text-gray-400" aria-label="Email">
                <FaEnvelope />
              </a>
              <a href="https://github.com/mathieu0905" className="text-gray-600 hover:text-gray-900 dark:text-gray-400" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="https://scholar.google.co.uk/citations?user=iPrIsSUAAAAJ" className="text-gray-600 hover:text-green-600 dark:text-gray-400" aria-label="Google Scholar">
                <FaGoogleScholar />
              </a>
            </div>
          </div>
        </header>

        {/* About */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
            About Me
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            I am a first-year Ph.D. student at <strong>Beihang University</strong>, working in the SMAT Laboratory under the supervision of Prof. <strong>Li Li (黎立)</strong>.
            My research focuses on <strong>AI for Software Engineering (AI4SE)</strong>, combining Large Language Models (LLMs) with static analysis techniques to solve complex problems in software engineering.
          </p>
        </section>

        {/* Research Interests */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
            Research Interests
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Automated Program Repair & Code Analysis</strong> - LLM-based code localization, repair, and impact analysis using code knowledge graphs</li>
            <li><strong>LLM Security & Optimization</strong> - Jailbreaking defense and prompt optimization techniques</li>
            <li><strong>Domain-Specific SE Applications</strong> - OpenHarmony app repair, low-resource language LLM applications (e.g., Cangjie)</li>
          </ul>
        </section>

        {/* News */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
            What&apos;s New
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li><span className="text-blue-600 font-medium">[2025.12]</span> Paper accepted at <strong>FSE 2026</strong></li>
            <li><span className="text-blue-600 font-medium">[2025.10]</span> Paper accepted at <strong>FORGE, Chinasoft 2025</strong></li>
            <li><span className="text-blue-600 font-medium">[2025.06]</span> Paper accepted at <strong>ICSE 2026</strong></li>
            <li><span className="text-blue-600 font-medium">[2025.03]</span> Paper accepted at <strong>FSE Industry 2025</strong></li>
            <li><span className="text-blue-600 font-medium">[2024.12]</span> Paper accepted at <strong>TOSEM</strong></li>
          </ul>
        </section>

        {/* Publications */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
            Publications
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Phantom Rendering Detection: Identifying and Analyzing Unnecessary UI Computations
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm">FSE 2026</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                MazeBreaker: Multi-Agent Reinforcement Learning for Dynamic Jailbreaking of LLM Security Defenses
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm">ICSE 2026</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Effective Fine-tuning for Low-resource Languages: A Case Study of Cangjie
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm">FORGE, Chinasoft 2025</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                HapRepair: Learn to Repair OpenHarmony Apps
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm">FSE Industry 2025</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Open Source AI-based SE Tools: Opportunities and Challenges of Collaborative Software Learning
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm">TOSEM 2024</p>
            </div>
          </div>
        </section>

        {/* Collaborations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
            Collaborations
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            I collaborate closely with researchers from <strong>Huawei</strong> and <strong>Singapore Management University (SMU)</strong>.
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 dark:text-gray-500 text-sm pt-8 border-t">
          <p>&copy; 2024 Zhihao Lin. Built with Next.js.</p>
        </footer>
      </main>
    </div>
  );
}
