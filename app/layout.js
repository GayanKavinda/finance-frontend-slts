import "./globals.css";
import { Outfit } from "next/font/google";
import Providers from '@/components/Providers';  // Client wrapper
import Navbar from '@/components/Navbar';

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
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans min-h-screen flex flex-col antialiased`}>
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