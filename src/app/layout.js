import "./globals.css";
import "@fontsource/outfit/300.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/outfit/800.css";
import Providers from "@/components/Providers"; // Client wrapper
import Image from "next/image";

import LayoutContent from "@/components/LayoutContent";

import { ScrollArea } from "@/components/ui/ScrollArea";

export const metadata = {
  title: "FinancePro - Personal Finance Manager",
  description: "Secure and modern finance management app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans h-screen w-full overflow-hidden antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}
      >
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
