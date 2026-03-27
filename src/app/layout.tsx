import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { ClientProviders } from "@/providers/ClientProviders";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClientProviders>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </ClientProviders>
      </body>
    </html>
  );
}
