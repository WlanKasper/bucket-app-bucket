import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bucket",
  description: "Telegram-first note and checklist sharing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
