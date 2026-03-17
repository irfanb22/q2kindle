import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import { PostHogProvider } from "@/lib/posthog";
import { PostHogPageView } from "@/lib/posthog-pageview";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "q2kindle",
  description: "Queue articles. Get a beautiful ebook, delivered to your Kindle.",
  metadataBase: new URL("https://q2kindle.com"),
  openGraph: {
    title: "q2kindle",
    description: "Queue articles. Get a beautiful ebook, delivered to your Kindle.",
    url: "https://q2kindle.com",
    siteName: "q2kindle",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "q2kindle",
    description: "Queue articles. Get a beautiful ebook, delivered to your Kindle.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen">
        <PostHogProvider>
          <PostHogPageView />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
