import "./globals.css";
import { Outfit } from "next/font/google";
import Providers from "@/components/Providers"; // Client wrapper
import Image from "next/image";

import LayoutContent from "@/components/LayoutContent";

import { ScrollArea } from "@/components/ui/scroll-area";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "FinancePro - Personal Finance Manager",
  description: "Secure and modern finance management app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans h-screen w-full overflow-hidden antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}
      >
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
