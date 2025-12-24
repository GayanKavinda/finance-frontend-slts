import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from '@/components/Providers';  // Client wrapper
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'FinancePro - Personal Finance Manager',
  description: 'Secure and modern finance management app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          {/* Optional: Add Footer later */}
          <footer className="border-t border-white/5 bg-transparent py-8 mt-auto text-center">
            <p className="text-sm text-muted-foreground opacity-50 tracking-widest uppercase font-bold">
              &copy; 2025 Finance<span className="text-primary">Pro</span>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}