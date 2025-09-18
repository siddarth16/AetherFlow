import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AetherFlow - AI-Powered Mind Mapping",
  description: "Transform ideas into actionable tasks with AI-powered mind mapping and task boards",
  keywords: ["mind mapping", "AI", "productivity", "task management", "brainstorming"],
  authors: [{ name: "AetherFlow Team" }],
  openGraph: {
    title: "AetherFlow - AI-Powered Mind Mapping",
    description: "Transform ideas into actionable tasks with AI-powered mind mapping",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          {children}
        </div>
      </body>
    </html>
  );
}