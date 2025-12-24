'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LogOut, ChevronDown, Bell, Search, 
  LayoutDashboard, ReceiptText, Target, PieChart,
  User as UserIcon, Settings, CreditCard, HelpCircle
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/signin');
  };

  if (loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`pointer-events-auto transition-all duration-500 ease-in-out
          ${scrolled 
            ? 'w-full max-w-6xl rounded-[2.5rem] bg-[#030406]/60 backdrop-blur-2xl border border-white/10 shadow-2xl translate-y-2 py-1' 
            : 'w-full max-w-7xl rounded-none bg-transparent border-transparent translate-y-0 py-2'
          }`}
      >
        <div className="px-8 h-12 flex items-center justify-between">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-2xl bg-linear-to-br from-primary via-primary to-accent flex items-center justify-center transition-all duration-700 group-hover:rotate-360 shadow-xl shadow-primary/20`}>
              <span className="text-white text-xl font-black italic tracking-tighter">F</span>
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-xl font-black tracking-tight leading-none">
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
                          : 'text-muted-foreground/30 hover:text-foreground/80'
                        }`}
                    >
                      <div className="relative">
                        {/* Icon Indicator "Effect" */}
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
                      
                      {/* Sub-Indicator Effect (Discreet Dot) */}
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
                {/* Search & Notifs (Optional additions later) */}

                <div className="flex items-center gap-2 relative">
                  <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-3 group p-1 rounded-2xl hover:bg-white/5 transition-all active:scale-95 border border-transparent hover:border-white/5"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary text-sm font-black overflow-hidden shadow-inner uppercase transition-transform group-hover:scale-105">
                        {user.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#030406] rounded-full shadow-lg" />
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
                        className="absolute right-0 top-full mt-6 w-64 rounded-[2.5rem] bg-[#0c0e12]/98 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 z-60 overflow-hidden"
                      >
                        <div className="px-5 py-6 mb-2 border-b border-white/5 relative overflow-hidden group">
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
                              className="w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-4 group"
                            >
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-${item.color}/10 text-${item.color}`}>
                                <item.icon className="w-4 h-4" />
                              </div>
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/5">
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

                  <button 
                    onClick={() => {
                      setMobileMenuOpen(!mobileMenuOpen);
                      setProfileMenuOpen(false);
                    }} 
                    className="lg:hidden p-3 rounded-2xl bg-white/5 text-foreground hover:bg-white/10 transition-all active:scale-90 border border-white/5 shadow-inner"
                    aria-label="Toggle Menu"
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {!user && (
            <div className="flex gap-6 items-center">
              <Link href="/signin" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/signup" className="px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] bg-linear-to-r from-primary via-primary to-accent text-white rounded-[2rem] hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] transition-all font-black active:scale-95 shadow-2xl shadow-primary/20">
                Register Securely
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && user && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-[#030406]/90 backdrop-blur-xl z-55 lg:hidden"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="lg:hidden relative z-60 bg-[#0c0e12]/95 backdrop-blur-3xl border-t border-white/5 overflow-hidden shadow-2xl rounded-b-[3rem] p-6 pb-12"
              >
                <div className="grid grid-cols-1 gap-3">
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent opacity-50" />
                  
                  {navLinks.map(link => {
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        onClick={() => setMobileMenuOpen(false)}
                        className={`py-5 px-8 text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between group relative
                          ${pathname === link.href 
                            ? 'text-primary' 
                            : 'text-foreground/30 hover:text-foreground'
                          }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`transition-all duration-300 ${pathname === link.href ? 'text-primary scale-110' : 'opacity-40 group-hover:opacity-100'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="relative z-10">{link.label}</span>
                        </div>
                        
                        {pathname === link.href && (
                          <motion.div 
                            layoutId="mobile-indicator"
                            className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#14b8a6]" 
                          />
                        )}
                      </Link>
                    );
                  })}
                  
                  <div className="pt-6 mt-4 border-t border-white/5">
                    <button 
                      onClick={handleLogout}
                      className="w-full py-6 px-8 rounded-[2.5rem] bg-rose-500 shadow-2xl shadow-rose-500/20 text-white font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all group"
                    >
                      <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      Close Account Portal
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
