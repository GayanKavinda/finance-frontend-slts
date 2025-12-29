'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  Menu, X, LogOut, ChevronDown, Bell, Search, 
  LayoutDashboard, ReceiptText, Target, PieChart,
  User as UserIcon, Settings, CreditCard, HelpCircle,
  Sun, Moon, Laptop, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

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
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/signin');
  };

  if (loading) return null;

  // Hide Navbar on auth pages
  if (['/signup', '/signin'].includes(pathname)) return null;

  return (
    <>
      {/* Desktop/Tablet Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center p-4 pointer-events-none">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`pointer-events-auto transition-all duration-500 ease-in-out
            ${scrolled 
              ? 'w-full max-w-6xl rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-border/50 shadow-2xl translate-y-2 py-1' 
              : 'w-full max-w-7xl rounded-none bg-transparent border-transparent translate-y-0 py-2'
            }`}
        >
          <div className="px-8 h-12 flex items-center justify-between">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-2xl bg-linear-to-br from-primary via-primary to-accent flex items-center justify-center transition-all duration-700 group-hover:rotate-360 shadow-xl shadow-primary/20`}>
                <span className="text-white text-xl font-black italic tracking-tighter">F</span>
              </div>
              <div className="flex flex-col -gap-1">
                <span className="text-xl font-black tracking-tight leading-none text-foreground">
                  Finance<span className="gradient-text">Pro</span>
                </span>
              </div>
            </Link>

            {user && (
              <>
                <div className="hidden lg:flex items-center gap-2">
                  {navLinks.map(link => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        className={`px-4 py-2 text-xs font-black transition-all flex items-center gap-3 relative group uppercase tracking-widest
                          ${isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        <div className="relative">
                          {isActive && (
                            <motion.div 
                              layoutId="nav-icon-aura"
                              className="absolute inset-0 bg-primary/40 blur-xl rounded-full scale-[2.5] -z-10"
                              animate={{ opacity: [0.3, 0.7, 0.3] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          
                          <Icon className={`w-4 h-4 transition-all duration-500 relative z-10
                            ${isActive 
                              ? 'text-primary drop-shadow-[0_0_8px_rgba(20,184,166,0.8)] scale-110' 
                              : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'
                            }`} 
                          />
                        </div>

                        <span className="relative z-10 transition-all duration-500 group-hover:tracking-wider">{link.label}</span>
                        
                        {isActive && (
                          <motion.div 
                            layoutId="nav-minimal-indicator"
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_#14b8a6]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4">
                  {/* Theme Toggle */}
                  {mounted && (
                    <div className="relative">
                      <button 
                        onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Laptop size={18} />}
                      </button>
                      
                      <AnimatePresence>
                        {themeMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-card/95 backdrop-blur-xl border border-border shadow-xl p-1.5 z-50 overflow-hidden"
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
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors
                                  ${theme === t.name 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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

                  <div className="flex items-center gap-2 relative">
                    <button 
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-3 group p-1 rounded-2xl hover:bg-muted/50 transition-all active:scale-95 border border-transparent hover:border-border/50"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary text-sm font-black overflow-hidden shadow-inner uppercase transition-transform group-hover:scale-105">
                          {user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-background rounded-full shadow-lg" />
                      </div>
                      <div className="hidden sm:flex flex-col items-start leading-none gap-1">
                        <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                          {user.name.split(' ')[0]}
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-700 ${profileMenuOpen ? 'rotate-180' : 'opacity-40'}`} />
                    </button>

                    <AnimatePresence>
                      {profileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          className="absolute right-0 top-full mt-6 w-64 rounded-[2.5rem] bg-card/98 backdrop-blur-3xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 z-60 overflow-hidden"
                        >
                          <div className="px-5 py-6 mb-2 border-b border-border/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                              <Settings className="w-16 h-16" />
                            </div>
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mb-1.5">Active Account</p>
                            <p className="text-sm font-black truncate text-foreground tracking-tight">{user.email}</p>
                          </div>
                          
                          <div className="space-y-1.5">
                            {[
                              { label: 'Cloud Profile', icon: UserIcon, href: '/profile', color: 'primary' },
                              { label: 'Subscription', icon: CreditCard, href: '/billing', color: 'accent' },
                              { label: 'App Insights', icon: HelpCircle, href: '/help', color: 'primary' },
                            ].map((item, i) => (
                              <Link 
                                key={i}
                                href={item.href} 
                                onClick={() => setProfileMenuOpen(false)} 
                                className="w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex items-center gap-4 group"
                              >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-${item.color}/10 text-${item.color}`}>
                                  <item.icon className="w-4 h-4" />
                                </div>
                                {item.label}
                              </Link>
                            ))}
                          </div>

                          <div className="mt-3 pt-3 border-t border-border/50">
                            <button 
                              onClick={handleLogout}
                              className="w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-500/10 transition-all flex items-center gap-4 group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-rose-500/20 to-rose-600/20 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                <LogOut className="w-4 h-4" />
                              </div>
                              Terminate Session
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center gap-4">
                <Link 
                  href="/signin" 
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/10 rounded-full"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-6 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </motion.nav>
      </div>

      {/* Mobile Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`transition-all duration-300 ${
            scrolled 
              ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg' 
              : 'bg-background/40 backdrop-blur-md border-b border-transparent'
          }`}
        >
          <div className="px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary via-primary to-accent flex items-center justify-center transition-transform group-active:scale-90 shadow-lg shadow-primary/20">
                <span className="text-white text-lg font-black italic tracking-tighter">F</span>
              </div>
              <span className="text-lg font-black tracking-tight text-foreground">
                Finance<span className="gradient-text">Pro</span>
              </span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {user && (
                <>
                  {/* User Avatar (Mobile) */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg bg-linear-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary text-sm font-black uppercase shadow-inner">
                      {user.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                  </div>
                </>
              )}

              {/* Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2.5 rounded-xl bg-muted/30 text-foreground hover:bg-muted/50 active:scale-95 transition-all border border-border/30"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Menu - Full Screen Slide-in */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-background z-[70] md:hidden shadow-2xl overflow-y-auto"
            >
              {user ? (
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 px-6 py-5 z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Navigation</h2>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-muted/50 active:scale-95 transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-lg bg-linear-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary text-base font-black uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex-1 px-6 py-6 space-y-2">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all active:scale-98 ${
                            isActive
                              ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg transition-all ${
                              isActive 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-muted/50 text-muted-foreground'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm">{link.label}</span>
                          </div>
                          {isActive && (
                            <motion.div 
                              layoutId="mobile-active-indicator"
                              className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                            />
                          )}
                        </Link>
                      );
                    })}

                    {/* Divider */}
                    <div className="py-4">
                      <div className="h-px bg-border/30" />
                    </div>

                    {/* Profile Menu Items */}
                    {[
                      { label: 'Profile', icon: UserIcon, href: '/profile' },
                      { label: 'Billing', icon: CreditCard, href: '/billing' },
                      { label: 'Help', icon: HelpCircle, href: '/help' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-sm">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>

                  {/* Footer - Theme & Logout */}
                  <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/50 px-6 py-6 space-y-3">
                    {/* Theme Selector */}
                    {mounted && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30">
                        {[
                          { name: 'light', icon: Sun },
                          { name: 'dark', icon: Moon },
                          { name: 'system', icon: Laptop }
                        ].map((t) => (
                          <button
                            key={t.name}
                            onClick={() => setTheme(t.name)}
                            className={`flex-1 p-3 rounded-lg transition-all active:scale-95 ${
                              theme === t.name
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:bg-muted/50'
                            }`}
                          >
                            <t.icon className="w-5 h-5 mx-auto" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold text-sm transition-all active:scale-98 border border-rose-500/20"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                // Guest Menu
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 px-6 py-5 flex items-center justify-between">
                    <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Menu</h2>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-muted/50 active:scale-95 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary via-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20">
                      <span className="text-white text-3xl font-black italic tracking-tighter">F</span>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black tracking-tight">Welcome!</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Sign in to access your financial dashboard and start managing your money better.
                      </p>
                    </div>

                    <div className="w-full space-y-3 pt-4">
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 active:scale-98 transition-all"
                      >
                        Get Started
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      
                      <Link
                        href="/signin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full py-4 rounded-xl bg-muted/30 border border-border/50 text-foreground font-bold hover:bg-muted/50 active:scale-98 transition-all"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>

                  {/* Footer */}
                  {mounted && (
                    <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/50 px-6 py-6">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30">
                        {[
                          { name: 'light', icon: Sun },
                          { name: 'dark', icon: Moon },
                          { name: 'system', icon: Laptop }
                        ].map((t) => (
                          <button
                            key={t.name}
                            onClick={() => setTheme(t.name)}
                            className={`flex-1 p-3 rounded-lg transition-all active:scale-95 ${
                              theme === t.name
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:bg-muted/50'
                            }`}
                          >
                            <t.icon className="w-5 h-5 mx-auto" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}