'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  Menu, X, LogOut, ChevronDown, 
  LayoutDashboard, ReceiptText, Target, PieChart,
  User as UserIcon, CreditCard, HelpCircle,
  Sun, Moon, Laptop
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ReceiptText },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/reports', label: 'Reports', icon: PieChart },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setThemeMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/signin');
  };

  // Hide Navbar on auth pages
  if (['/signup', '/signin', '/forgot-password', '/reset-password'].includes(pathname)) return null;

  // Render minimal navbar during loading to avoid layout jump
  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
        <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md transition-colors duration-300 pl-4 pr-6">
          <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
            <div className="relative w-[140px] h-[45px]">
                <Image 
                    src="/icons/slt_digital_icon.png" 
                    alt="SLT Digital Logo" 
                    fill
                    className="object-contain dark:brightness-0 dark:invert"
                    priority
                />
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
        <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md transition-colors duration-300 pl-4 pr-6">
          <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative w-[140px] h-[45px]">
                <Image 
                    src="/icons/slt_digital_icon.png" 
                    alt="SLT Digital Logo" 
                    fill
                    className="object-contain dark:brightness-0 dark:invert transition-all duration-300"
                    priority
                />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
                {user && pathname !== '/' && (
                  <div className="flex items-center gap-1 mr-4">
                    {navLinks.map(link => {
                      const isActive = pathname === link.href;
                      const Icon = link.icon;
                      return (
                        <Link 
                          key={link.href} 
                          href={link.href} 
                          className={`px-3 py-2 text-sm font-medium transition-all flex items-center gap-2 rounded-md
                            ${isActive 
                              ? 'text-[#00B4EB] bg-[#00B4EB]/5' 
                              : 'text-slate-600 dark:text-slate-400 hover:text-[#00B4EB] dark:hover:text-[#00B4EB] hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                           <Icon className={`w-4 h-4 ${isActive ? 'text-[#00B4EB]' : 'text-slate-400'}`} />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Theme Toggle */}
                {mounted && (
                    <div className="relative">
                      <button 
                        onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                        className="p-2 rounded-full text-slate-500 hover:text-[#00B4EB] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle Theme"
                      >
                        {theme === 'dark' ? <Moon size={20} /> : theme === 'light' ? <Sun size={20} /> : <Laptop size={20} />}
                      </button>
                      
                      <AnimatePresence>
                        {themeMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1 z-50 overflow-hidden"
                          >
                            {[
                              { name: 'light', icon: Sun, label: 'Light' },
                              { name: 'dark', icon: Moon, label: 'Dark' },
                              { name: 'system', icon: Laptop, label: 'System' }
                            ].map((t) => (
                              <button
                                key={t.name}
                                onClick={() => {
                                  setTheme(t.name);
                                  setThemeMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors
                                  ${theme === t.name 
                                    ? 'bg-[#00B4EB]/10 text-[#00B4EB]' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                                  }`}
                              >
                                <t.icon size={14} />
                                {t.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                )}

                {/* User Actions */}
                {user ? (
                   <div className="flex items-center gap-4">
                     {pathname === '/' && (
                        <Link 
                          href="/dashboard" 
                          className="px-5 py-2.5 text-sm font-bold text-white bg-[#00B4EB] rounded-lg hover:bg-[#009bc9] transition-all shadow-[0_0_15px_rgba(0,180,235,0.3)] flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                     )}
                     <div className="relative">
                       <button 
                         onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                         className="flex items-center gap-3 pl-2 pr-1 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent"
                       >
                         <div className="w-8 h-8 rounded-full bg-[#00B4EB]/10 flex items-center justify-center text-[#00B4EB] text-sm font-bold uppercase">
                           {user.name.charAt(0)}
                         </div>
                         <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                       </button>

                     <AnimatePresence>
                       {profileMenuOpen && (
                         <motion.div
                           initial={{ opacity: 0, scale: 0.95, y: 10 }}
                           animate={{ opacity: 1, scale: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95, y: 10 }}
                           className="absolute right-0 top-full mt-4 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-60"
                         >
                           <div className="px-4 py-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                             <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                           </div>
                           
                           {[
                             { label: 'Profile', icon: UserIcon, href: '/profile' },
                             { label: 'Billing', icon: CreditCard, href: '/billing' },
                             { label: 'Help & Support', icon: HelpCircle, href: '/help' },
                           ].map((item, i) => (
                             <Link 
                               key={i}
                               href={item.href} 
                               onClick={() => setProfileMenuOpen(false)} 
                               className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 hover:text-[#00B4EB] dark:hover:text-[#00B4EB] hover:bg-[#00B4EB]/5 transition-all"
                             >
                               <item.icon className="w-4 h-4" />
                               {item.label}
                             </Link>
                           ))}

                           <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                             <button 
                               onClick={handleLogout}
                               className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                             >
                               <LogOut className="w-4 h-4" />
                               Sign Out
                             </button>
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                   </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link href="/signin" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#00B4EB] transition-colors">
                      Sign In
                    </Link>
                    <Link href="/signup" className="px-5 py-2.5 text-sm font-bold text-white bg-[#00B4EB] rounded-lg hover:bg-[#009bc9] transition-all shadow-[0_0_15px_rgba(0,180,235,0.3)]">
                      Get Started
                    </Link>
                  </div>
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-4">
                {mounted && (
                    <button 
                        onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                        className="p-2 text-slate-500 hover:text-[#00B4EB]"
                    >
                        {theme === 'dark' ? <Moon size={20} /> : theme === 'light' ? <Sun size={20} /> : <Laptop size={20} />}
                    </button>
                )}
                <button 
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 text-slate-600 dark:text-slate-300"
                >
                    <Menu size={24} />
                </button>
            </div>
          </div>
        </nav>
      </div>

       {/* theme drawer for mobile is integrated above or handled similarly, simplifying for brevity/focus on desktop fix first */}
       <AnimatePresence>
        {mobileMenuOpen && (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 flex flex-col p-6"
             >
                <div className="flex items-center justify-between mb-8">
                     <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                        <Image src="/icons/slt_digital_icon.png" alt="Logo" width={120} height={40} className="object-contain dark:brightness-0 dark:invert" />
                     </Link>
                     <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6 text-slate-500" /></button>
                </div>
                
                <div className="space-y-6 flex-1">
                    {user ? navLinks.map(link => (
                         <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-lg font-bold text-slate-700 dark:text-slate-300">
                             <link.icon className="w-5 h-5" /> {link.label}
                         </Link>
                    )) : (
                        <>
                             <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-700 dark:text-slate-300">Sign In</Link>
                             <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-[#00B4EB]">Get Started</Link>
                        </>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                     <div className="grid grid-cols-3 gap-2">
                         {['light', 'dark', 'system'].map(mode => (
                             <button 
                                key={mode}
                                onClick={() => setTheme(mode)}
                                className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 text-xs font-bold uppercase ${theme === mode ? 'bg-[#00B4EB]/10 text-[#00B4EB]' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}
                             >
                                 {mode === 'light' ? <Sun size={16} /> : mode === 'dark' ? <Moon size={16} /> : <Laptop size={16} />}
                                 {mode}
                             </button>
                         ))}
                     </div>
                </div>
             </motion.div>
        )}
       </AnimatePresence>
    </>
  );
}