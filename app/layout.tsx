// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { Toaster } from "react-hot-toast"; // 👈 add this
import { AuthProvider } from "@/components/auth/AuthProvider";  // 👈 add this

// ... (existing imports)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster position="top-center" />
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}