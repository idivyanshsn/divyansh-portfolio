import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Divyansh Kumar Srivastava — Software Developer",
  description: "Portfolio of Divyansh Kumar Srivastava, B.Tech CSE student at VIT Bhopal University.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1e1e1e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
