import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CertPrep — AZ-500, SC-401 and SC-200 exam preparation",
    template: "%s · CertPrep",
  },
  description:
    "Practice quizzes, flashcards, timed mock exams, study paths, and curated free resources for the Microsoft AZ-500, SC-401, and SC-200 security certifications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line py-8">
            <div className="mx-auto max-w-6xl px-4 text-sm text-muted">
              <p>
                Study material is summarised from official Microsoft Learn documentation. External
                resources are linked, not hosted. Always confirm exam scope against the official
                study guide.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
