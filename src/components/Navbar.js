// src/components/Navbar.js
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, ChevronDown, Bell, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/budgets', label: 'Budgets' },
  { href: '/reports', label: 'Reports' },
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

  const handleLogout = async () => {
    await logout();
    router.push('/signin');
  };

  if (loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`pointer-events-auto transition-all duration-300 ease-in-out
          ${scrolled 
            ? 'w-full max-w-5xl rounded-2xl glass-card border border-white/10 shadow-2xl' 
            : 'w-full max-w-7xl rounded-none bg-transparent border-transparent'
          }`}
      >
        <div className="px-6 h-16 flex items-center justify-between">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-primary/20`}>
              <span className="text-white text-lg font-bold">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Finance<span className="gradient-text">Pro</span>
            </span>
          </Link>

          {user && (
            <>
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map(link => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative group
                        ${isActive 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div 
                          layoutId="nav-active"
                          className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-full px-4 py-1.5 transition-all focus-within:bg-white/10 focus-within:ring-1 focus-within:ring-primary/30">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none text-xs focus:ring-0 w-28 placeholder:text-muted-foreground/50 text-foreground outline-none"
                  />
                </div>

                <button className="p-2.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                </button>

                <div className="h-5 w-px bg-white/10 mx-1 hidden xs:block" />

                <div className="flex items-center gap-2 relative">
                  <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2.5 group p-1.5 rounded-xl hover:bg-white/5 transition-all active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold overflow-hidden shadow-inner uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-foreground/90 group-hover:text-foreground">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-full mt-3 w-48 rounded-2xl bg-card border border-white/10 shadow-2xl p-2 z-60 overflow-hidden"
                      >
                        <div className="px-3 py-2.5 border-b border-white/5 mb-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account</p>
                          <p className="text-sm font-semibold truncate text-foreground mt-0.5">{user.email}</p>
                        </div>
                        <button className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-white/5 transition-colors flex items-center gap-2.5 group">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Search className="w-4 h-4" />
                          </div>
                          Profile Settings
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2.5 mt-1 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                            <LogOut className="w-4 h-4" />
                          </div>
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={() => {
                      setMobileMenuOpen(!mobileMenuOpen);
                      setProfileMenuOpen(false);
                    }} 
                    className="lg:hidden p-2.5 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-all active:scale-90"
                    aria-label="Toggle Menu"
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {!user && (
            <div className="flex gap-4 items-center">
              <Link href="/signin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">Sign In</Link>
              <Link href="/signup" className="px-6 py-2.5 text-sm bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-bold active:scale-95 shadow-lg shadow-primary/20">
                Get Started
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
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-55 lg:hidden"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="lg:hidden relative z-60 bg-card border-t border-white/5 overflow-hidden shadow-2xl rounded-b-3xl"
              >
                <div className="px-6 py-8 space-y-4">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
                  {navLinks.map(link => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`py-4 px-6 rounded-2xl text-lg font-bold transition-all flex items-center justify-between
                        ${pathname === link.href 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-foreground/70 hover:bg-white/5 shadow-sm'
                        }`}
                    >
                      {link.label}
                      <ChevronDown className="-rotate-90 w-5 h-5 opacity-50" />
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-white/5">
                    <button 
                      onClick={handleLogout}
                      className="w-full py-5 px-6 rounded-2xl bg-rose-500/10 text-rose-500 font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all group"
                    >
                      <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                      Sign Out
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
