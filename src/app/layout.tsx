import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarLayout } from "@/components/SidebarLayout";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DorionAnima SaaS - Pet Boarding & Breeding",
  description: "A multi-tenant management system for animal boarding and breeding businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans h-full bg-slate-50 antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>
            <SidebarLayout>{children}</SidebarLayout>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
