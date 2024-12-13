import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DarkModeToggle from "@/components/DarkModeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workers AI Image Playground",
  description: "Playground for generating images with Cloudflare Workers AI models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DarkModeToggle />
        {children}
      </body>
    </html>
  );
}
