import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import Navbar from "@/components/layout/Navbar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyShop",
  description: "Your online store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className={geist.className}>
          <div className="grid grid-rows-[64px_1fr] min-h-svh">
            <Navbar />
            <main className="max-w-6xl mx-auto w-full">{children}</main>
          </div>
        </body>
      </SessionProvider>
    </html>
  );
}
