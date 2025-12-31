import Image from "next/image";
import { FaEnvelope, FaGithub, FaLinkedin, FaGoogleScholar } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-16">
          <Image
            src="/avatar.jpg"
            alt="Profile photo"
            width={180}
            height={180}
            className="rounded-full"
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Your Name
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Ph.D. Student / Researcher
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Department of Computer Science<br />
              University Name
            </p>
            <div className="flex gap-4 justify-center md:justify-start text-2xl">
              <a href="mailto:your@email.com" className="text-gray-600 hover:text-blue-600 dark:text-gray-400">
                <FaEnvelope />
              </a>
              <a href="https://github.com/mathieu0905" className="text-gray-600 hover:text-gray-900 dark:text-gray-400">
                <FaGithub />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-700 dark:text-gray-400">
                <FaLinkedin />
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600 dark:text-gray-400">
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
            I am a Ph.D. student at [University Name], advised by [Advisor Name].
            My research interests include [Research Area 1], [Research Area 2], and [Research Area 3].
          </p>
        </section>

        {/* Research Interests */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
            Research Interests
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>Machine Learning</li>
            <li>Natural Language Processing</li>
            <li>Computer Vision</li>
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
                Paper Title Here
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                <span className="font-medium">Your Name</span>, Co-author Name
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Conference/Journal Name, 2024
              </p>
              <div className="mt-2 flex gap-2">
                <a href="#" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  PDF
                </a>
                <a href="#" className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  Code
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
            Education
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Ph.D. in Computer Science
              </h3>
              <p className="text-gray-600 dark:text-gray-400">University Name, 2022 - Present</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                B.S. in Computer Science
              </h3>
              <p className="text-gray-600 dark:text-gray-400">University Name, 2018 - 2022</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 dark:text-gray-500 text-sm pt-8 border-t">
          <p>&copy; 2024 Your Name. Built with Next.js.</p>
        </footer>
      </main>
    </div>
  );
}
