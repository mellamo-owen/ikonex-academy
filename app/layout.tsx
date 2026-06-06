import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Layout/Sidebar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IKONEX Academy - Student Management System",
  description: "Comprehensive student management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-gray-100 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}