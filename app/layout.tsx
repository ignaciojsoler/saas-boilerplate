import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "SaaS Boilerplate - Plataforma Completa",
  description: "Plataforma SaaS completa con autenticación, facturación y gestión de usuarios",
  keywords: ["SaaS", "Next.js", "Supabase", "MercadoPago", "autenticación", "facturación"],
  authors: [{ name: "SaaS Boilerplate Team" }],
  openGraph: {
    title: "SaaS Boilerplate - Plataforma Completa",
    description: "Plataforma SaaS completa con autenticación, facturación y gestión de usuarios",
    type: "website",
    url: defaultUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Boilerplate - Plataforma Completa",
    description: "Plataforma SaaS completa con autenticación, facturación y gestión de usuarios",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
