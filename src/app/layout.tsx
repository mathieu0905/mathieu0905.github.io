import type { Metadata } from "next";
import "./globals.css";
import MusicPlayer from "./components/MusicPlayer";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "Zhihao Lin (林智灏) - Academic Homepage",
  description: "Ph.D. student at Beihang University, researching AI for Software Engineering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
