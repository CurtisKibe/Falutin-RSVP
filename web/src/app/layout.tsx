import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PublicChatWrapper from "@/components/publicchatwrapper"; 
import NavBarWrapper from "@/components/navbarwrapper";
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
  title: "Falutin Fam",
  description: "Exclusive Film Experience in Nairobi.",
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
        <NavBarWrapper />
        <main>
          {children}
        </main>
        
        <PublicChatWrapper />
        
      </body>
    </html>
  );
}