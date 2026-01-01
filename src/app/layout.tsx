import type { Metadata } from "next";
import "./globals.css";

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
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
