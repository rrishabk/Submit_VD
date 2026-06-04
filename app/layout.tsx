import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verseodin Trial",
  description: "Senior frontend take-home: AI Traffic + Action Centre",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
