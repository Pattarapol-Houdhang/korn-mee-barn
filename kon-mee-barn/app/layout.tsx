import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/shared/SessionProvider";
import { LanguageProvider } from "@/components/shared/LanguageProvider";
import { CompareProvider } from "@/components/shared/CompareProvider";
import { CompareTray } from "@/components/shared/CompareTray";

export const metadata: Metadata = {
  title: "Kon Mee Barn | Thailand Real Estate",
  description: "Buy, sell, and rent properties across Thailand. Find your perfect home in Bangkok, Chiang Mai, and Phuket.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <SessionProvider>
          <LanguageProvider>
            <CompareProvider>
              <Navbar />
              <main className="min-h-[calc(100vh-64px)]">{children}</main>
              <CompareTray />
              <Toaster richColors position="bottom-right" />
            </CompareProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
