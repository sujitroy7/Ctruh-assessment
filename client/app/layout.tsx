import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Provider from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TShirt.com",
  description: "Your online store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="[scrollbar-gutter:stable]">
      <Provider>
        <body className={geist.className}>
          <div className="grid grid-rows-[64px_1fr] min-h-svh">
            <Navbar />
            <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </body>
      </Provider>
    </html>
  );
}
