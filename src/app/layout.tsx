import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { Providers } from "./providers";
import dynamic from 'next/dynamic';

// Properly configure the fonts with all weights needed
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

const lexend = Lexend({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-lexend',
  weight: ['300', '400', '500', '600', '700'],
});

// Dynamically import providers with loading fallbacks
const ThemeProvider = dynamic(() => import('@/providers/ThemeProvider').then(mod => mod.ThemeProvider), {
  ssr: true,
  loading: () => <div className="bg-gradient-primary min-h-screen"></div>
});

const PreferencesProviderWrapper = dynamic(() => 
  import('@/providers/PreferencesProvider').then(mod => {
    // Make sure we're returning the component itself
    return { default: mod.PreferencesProvider };
  }), {
  ssr: true,
});

export const metadata: Metadata = {
  title: "LocalCDN - Image Management Platform",
  description: "Professional image management with metadata control",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts to speed up font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.variable} ${lexend.variable} antialiased h-full`}>
        <Providers>
          <ThemeProvider>
            <PreferencesProviderWrapper>
              <MainLayout>{children}</MainLayout>
            </PreferencesProviderWrapper>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
