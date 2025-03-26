"use client";

import type {} from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { initializeStorage } from "@/lib/init-storage";

// Track initialization to avoid duplicate calls
let storageInitialized = false;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only initialize storage once
    if (!storageInitialized) {
      const init = async () => {
        try {
          await initializeStorage();
          storageInitialized = true;
        } catch (error) {
          console.error("Failed to initialize storage:", error);
        }
      };

      init();
    }
  }, []);

  return (
    <html lang="en" className={GeistMono.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
