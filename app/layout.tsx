import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";



export const metadata: Metadata = {
  title: "Personal Finance Tracker",
  description: "Help you track your spendings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
