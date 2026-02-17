import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local"; // 1. Import localFont
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 2. KONFIGURASI FONT LPMQ
const lpmq = localFont({
  src: [
    {
      path: './fonts/LPMQ IsepMisbah.ttf', // Sesuaikan nama file Anda
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-lpmq', // Variabel CSS untuk Tailwind
  display: 'swap',
});

export const metadata: Metadata = {
  title: "5 Sukses Ramadhan",
  description: "Aplikasi monitoring ibadah Ramadhan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. MASUKKAN VARIABLE KE BODY */}
      <body className={`${inter.className} ${lpmq.variable}`}>
        {children}
      </body>
    </html>
  );
}