import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blue Whale AI — Level Up Your Life",
  description: "A gamified AI self-improvement chatbot powered by RAG and Claude AI. Complete challenges, earn XP, and level up your life.",
  icons: {
    icon: "/whale.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
