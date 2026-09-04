import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/clerk";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "StockTrade - Social Trading Platform",
    description: "Share insights, discover trends, and trade smarter.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const shell = (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>{children}</body>
        </html>
    );

    // Without a Clerk publishable key the provider throws on boot, so the app
    // renders read-only instead. Used by the static build and keyless deploys.
    if (!clerkEnabled) return shell;

    return <ClerkProvider>{shell}</ClerkProvider>;
}
