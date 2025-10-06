import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { LanguageProvider } from "@/contexts/language-context"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://perf.svcfusion.com/'),
  title: {
    default: "GPU Performance Leaderboard | Real-World Benchmark Data & Comparison",
    template: "%s | GPU Performance Leaderboard"
  },
  description: "Compare GPU performance benchmarks with real-world data. FP32, FP16, and BF16 TFLOPS ratings for NVIDIA, AMD GPUs across platforms like GCP, Colab, Docker, and more. Community-driven benchmark database.",
  keywords: [
    "GPU benchmark",
    "GPU performance",
    "GPU comparison",
    "NVIDIA GPU",
    "AMD GPU",
    "RTX 4090",
    "RTX 3090",
    "A100",
    "H100",
    "FP32 performance",
    "FP16 benchmark",
    "BF16 TFLOPS",
    "AI GPU",
    "deep learning GPU",
    "machine learning hardware",
    "GPU database",
    "PyTorch GPU",
    "CUDA performance",
    "Google Colab GPU",
    "Docker GPU",
    "cloud GPU comparison"
  ],
  authors: [{ name: "GPU Performance Leaderboard Community" }],
  creator: "GPU Performance Leaderboard",
  publisher: "GPU Performance Leaderboard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    url: "/",
    siteName: "GPU Performance Leaderboard",
    title: "GPU Performance Leaderboard - Real-World GPU Benchmark Database",
    description: "Compare GPU performance with community-driven benchmark data. FP32, FP16, and BF16 ratings for NVIDIA & AMD GPUs across multiple platforms.",
    images: [
      {
        url: "/sharelink_img.png",
        width: 1200,
        height: 630,
        alt: "GPU Performance Leaderboard - Benchmark Comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GPU Performance Leaderboard - Real-World GPU Benchmarks",
    description: "Compare GPU performance with community-driven benchmark data. FP32, FP16, and BF16 ratings across multiple platforms.",
    images: ["/sharelink_img.png"],
    creator: "@gpu_leaderboard",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'zh-CN': '/?lang=zh',
    },
  },
  verification: {
    google: 'your-google-verification-code', // 需要在 Google Search Console 获取
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'GPU Performance Leaderboard',
    description: 'Community-driven GPU performance benchmark database with real-world data',
    applicationCategory: 'TechnologyApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    featureList: [
      'GPU Performance Comparison',
      'FP32, FP16, BF16 Benchmarks',
      'Multi-platform Support',
      'Community Contributions',
      'Real-time Data Updates',
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-M0NKXFEBXC"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-M0NKXFEBXC');
        `}} />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <LanguageProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
