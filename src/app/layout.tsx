import type { Metadata } from "next";
import "./globals.css";
import MusicPlayer from "./components/MusicPlayer";
import { Navbar } from "./components/Navbar";

const SITE_URL = "https://mathieu0905.github.io";
const SITE_NAME = "Zhihao Lin (林智灏)";
const SITE_DESCRIPTION =
  "Ph.D. student at Beihang University researching AI for Software Engineering: coding agents, program repair, and OpenHarmony toolchains.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Academic Homepage`,
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "Zhihao Lin", url: SITE_URL }],
  keywords: [
    "Zhihao Lin",
    "林智灏",
    "AI for Software Engineering",
    "AI4SE",
    "coding agents",
    "program repair",
    "OpenHarmony",
    "software engineering",
    "Beihang University",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    title: `${SITE_NAME} - Academic Homepage`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/avatar.jpg", width: 1280, height: 1920, alt: "Zhihao Lin" }],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} - Academic Homepage`,
    description: SITE_DESCRIPTION,
    images: ["/avatar.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Zhihao Lin",
  alternateName: "林智灏",
  url: SITE_URL,
  image: `${SITE_URL}/avatar.jpg`,
  jobTitle: "Ph.D. Student",
  affiliation: {
    "@type": "Organization",
    name: "Beihang University",
    url: "https://www.buaa.edu.cn/",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Beihang University",
  },
  knowsAbout: [
    "AI for Software Engineering",
    "Coding Agents",
    "Program Repair",
    "Static Analysis",
    "OpenHarmony",
  ],
  sameAs: [
    "https://github.com/mathieu0905",
    "https://scholar.google.co.uk/citations?user=iPrIsSUAAAAJ",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Navbar />
        {children}
        <MusicPlayer />
        <script
          type="application/ld+json"
          // Static structured data describing the site owner.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
