import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IdeaArchive — Peer-Reviewed Startup Ideas",
    template: "%s | IdeaArchive",
  },
  description:
    "A peer-reviewed platform connecting Founders and Investors. Submit structured pitches, get community ratings, and surface top ideas to investors.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ideaarchive.vercel.app"
  ),
  openGraph: {
    type: "website",
    title: "IdeaArchive",
    description: "Peer-reviewed startup ideas for Founders and Investors.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#0a0a0a] text-white font-sans">
        <Nav />
        <main className="min-h-[calc(100dvh-3.5rem)]">{children}</main>
      </body>
    </html>
  );
}
