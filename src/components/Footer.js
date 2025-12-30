'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer on auth pages to maintain full-screen immersion
  if (['/signup', '/signin', '/forgot-password'].includes(pathname)) return null;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] py-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Company Name */}
          <div className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide text-center md:text-left">
              Sri Lanka Telecom Services
          </div>

          {/* Center: Copyright */}
          <div className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
              &copy; 2025 Finance Pro
          </div>

          {/* Right: SLT Logo */}
          <div className="relative w-[120px] h-[30px] md:w-[140px] md:h-[40px]">
               <Image
                  src="/icons/slt_digital_icon.png"
                  alt="SLT Digital"
                  fill
                  className="object-contain dark:brightness-0 dark:invert transition-all duration-300"
              />
          </div>
      </div>
    </footer>
  );
}
