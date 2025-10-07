import type { Metadata } from "next";
import { Suspense } from "react";
import "../styles/globals.css";
import Header from "../components/Header";
import ScrollToTop from '../components/ScrollToTop';
import ChangePage from "../components/ChangePage";
import Footer from "../components/Footer";
import Scrollbar from "../components/Scrollbar";

export const metadata: Metadata = {
    title: "ViegPhunt",
    description: "ViegPhunt's personal website",
    icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
    children,
    }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <body className="antialiased" suppressHydrationWarning>
                <ChangePage />
                <Scrollbar />
                <div className="min-h-screen flex flex-col">
                    <Suspense fallback={<div style={{ height: '80px' }} />}>
                        <Header />
                    </Suspense>
                    <main className="flex-1 w-full site-main">
                        {children}
                    </main>
                    <ScrollToTop />
                    <Footer />
                </div>
            </body>
        </html>
    );
}