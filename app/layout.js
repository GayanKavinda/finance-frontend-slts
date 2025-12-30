import "./globals.css";
import { Outfit } from "next/font/google";
import Providers from '@/components/Providers';  // Client wrapper
import Navbar from '@/components/Navbar';
import Image from 'next/image';

import Footer from '@/components/Footer';

import { ScrollArea } from "@/components/ui/scroll-area";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: 'FinancePro - Personal Finance Manager',
  description: 'Secure and modern finance management app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans h-screen w-full overflow-hidden flex flex-col antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
        <Providers>
          <ScrollArea className="h-screen w-full">
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ScrollArea>
        </Providers>
      </body>
    </html>
  );
}