import type { Metadata } from "next";
import { Inter, Geist_Mono, Caprasimo } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ChainBooks - E-Books with Crypto Payments",
  description:
    "Buy high-quality e-books with cryptocurrency. Fast, secure, and decentralized payments via PingPay on NEAR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} ${caprasimo.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
