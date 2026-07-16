import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "باغ دیجیتال | Digital Garden",
  description:
    "باغ دیجیتال تعاملی مبتنی بر گراف دانش با پیوندهای دوسویه — پروژه کارشناسی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
