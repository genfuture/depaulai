import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar/navbar";
import Sidebar from "./sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Depaul Friend",
  description: "Ask your depaul friend anything",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />

        <div className="flex flex-1">
          <Sidebar />


          <main className="flex-1 p-6 bg-black">
            {children}
          </main>
        </div>

        <footer className="p-4 text-white mt-4">
          DepaulAi Team | 2025 PROpel Hackathon
        </footer>
      </body>
    </html>
  );
}
