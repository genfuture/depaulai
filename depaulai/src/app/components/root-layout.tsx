'use client';

import { useEffect, useState } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";  
import Navbar from "./navbar/navbar";
import Sidebar from "./sidebar";
import { ThemeProvider } from 'next-themes';
import ThemeToggle from './themetoggle'; // Client-side component import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensure the component only renders after client mount
  }, []);

  if (!mounted) {
    return null; // Prevent rendering before mounting
  }

  return (
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="system">
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>

          {/* Footer with conditional styling based on theme */}
          <footer
            className="p-4 flex justify-between"
            style={{
              backgroundColor: "var(--bg-color)", // Dynamic background color for footer
              color: "var(--text-color)", // Dynamic text color for footer
            }}
          >
            <p className="m-2">DepaulAi Team | 2025 PROpel Hackathon</p>
            <ThemeToggle />
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
