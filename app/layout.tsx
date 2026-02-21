import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutShell } from "@/components/layout-shell";
import { CustomCursor } from "@/components/custom-cursor";
import { PageViewTracker } from "@/components/page-view-tracker";
import { getSettings } from "@/lib/data";
import { Toaster } from "sonner";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const fullTitle = `${s.name} — ${s.title}`;

  return {
    title: {
      default: fullTitle,
      template: `%s — ${s.name}`,
    },
    description: s.intro,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: fullTitle,
      description: s.intro,
      url: siteUrl,
      siteName: `${s.name} Portfolio`,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: s.intro,
      images: ["/twitter-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mono.variable} ${sans.variable} font-mono antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CustomCursor />
          <PageViewTracker />
          <LayoutShell>{children}</LayoutShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "none",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
