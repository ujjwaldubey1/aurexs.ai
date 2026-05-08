import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jewellery ERP",
  description: "Core ERP for jewellery stores"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
