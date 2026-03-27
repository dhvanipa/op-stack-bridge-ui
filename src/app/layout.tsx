import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "@/providers/ClientProviders";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DUST Bridge",
  description: "Bridge assets between Ethereum and DUST",
  icons: {
    icon: "/dust.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClientProviders>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </ClientProviders>
      </body>
    </html>
  );
}
