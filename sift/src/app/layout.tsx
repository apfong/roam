import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sift — See exactly what changed between two spreadsheets",
  description:
    "Drop two spreadsheets and get a cell-by-cell diff with formula tracking, AI change summaries, and multi-sheet support. 100% client-side — your files never leave your browser.",
  keywords: [
    "spreadsheet diff",
    "compare spreadsheets",
    "excel diff",
    "xlsx compare",
    "spreadsheet version control",
    "formula tracking",
  ],
  openGraph: {
    title: "Sift — Spreadsheet Diff Tool",
    description:
      "Cell-by-cell spreadsheet comparison with formula tracking and AI summaries. Free, private, instant.",
    url: "https://sift-nine.vercel.app",
    siteName: "Sift",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sift — See exactly what changed between two spreadsheets",
    description:
      "Drop two files. Get a color-coded diff with formula tracking and AI summaries. 100% in your browser.",
  },
  metadataBase: new URL("https://sift-nine.vercel.app"),
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
        {children}
      </body>
    </html>
  );
}
