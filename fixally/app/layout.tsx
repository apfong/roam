import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixA11y — Free Accessibility Scanner & Fixer",
  description: "Scan any website for WCAG accessibility violations. Get instant code fixes, platform-specific instructions, and live previews.",
  openGraph: {
    title: "FixA11y — Free Accessibility Scanner & Fixer",
    description: "Find and fix accessibility issues in seconds. Free WCAG compliance audit.",
    type: "website",
    siteName: "FixA11y",
  },
  twitter: {
    card: "summary_large_image",
    title: "FixA11y — Free Accessibility Scanner & Fixer",
    description: "Find and fix accessibility issues in seconds.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
