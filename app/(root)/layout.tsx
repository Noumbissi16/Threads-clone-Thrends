import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import {
  BottomBar,
  LeftSideBar,
  RightSideBar,
  TopBar,
} from "@/components/shared";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thrends",
  description: "A threads clone made in NextJs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <TopBar />
            <main className="flex flex-row">
              <LeftSideBar />
              <section className="main-container">
                <div className="w-full max-w-4xl">{children}</div>
              </section>
              <RightSideBar />
            </main>
            <BottomBar />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
