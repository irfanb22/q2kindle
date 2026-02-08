import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kindle Sender",
  description: "Send articles to your Kindle as formatted ebooks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
