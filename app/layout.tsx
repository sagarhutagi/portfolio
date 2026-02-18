import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutShell } from "@/components/layout-shell";
import { CustomCursor } from "@/components/custom-cursor";
import { Toaster } from "sonner";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: {
    default: "John Doe — Full Stack Developer",
    template: "%s — John Doe",
  },
  description:
    "Full Stack Developer building modern web experiences with clean code and thoughtful design.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "John Doe — Full Stack Developer",
    description:
      "Full Stack Developer building modern web experiences with clean code and thoughtful design.",
    url: siteUrl,
    siteName: "John Doe Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "John Doe — Full Stack Developer",
    description:
      "Full Stack Developer building modern web experiences with clean code and thoughtful design.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mono.variable} font-mono antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CustomCursor />
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
