import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechZone - Siêu thị Thiết bị Công nghệ & Phụ kiện Chính Hãng",
  description: "Chuyên cung cấp Laptop, Smartphone, Phụ kiện, Gaming Gear chính hãng hàng đầu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
