'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, PieChart, Target, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const root = useRef();
  const heroRef = useRef();
  const featuresRef = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.fromTo('.hero-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      gsap.fromTo('.hero-subtitle', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
      gsap.fromTo('.hero-buttons', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.4 });
      gsap.fromTo('.hero-image', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out', delay: 0.6 });

      // Parallax Hero
      gsap.to('.hero-image', {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Features Animation
      const featureCards = gsap.utils.toArray('.feature-card');
      featureCards.forEach((card) => {
        gsap.fromTo(card, { opacity: 0, y: 50 }, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div
            className="space-y-8 text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] hero-title">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4EB] to-[#008001]">Corporate Finance</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed hero-subtitle">
              Secure, intelligent, and unified financial management for the digital enterprise. Powered by SLT Digital Services.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start hero-buttons">
              <Link href="/signup">
                <button className="px-8 py-4 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] hover:from-[#00A0D1] hover:to-[#0089b3] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,180,235,0.2)] hover:shadow-[0_0_30px_rgba(0,180,235,0.4)] active:scale-[0.98] transition-all flex items-center gap-2 justify-center w-full sm:w-auto">
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/signin">
                <button className="px-8 py-4 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-white font-semibold rounded-xl active:scale-[0.98] transition-all w-full sm:w-auto shadow-sm">
                  Sign In
                </button>
              </Link>
            </div>
          </div>

          <div
            className="relative hidden lg:block hero-image"
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-[#00B4EB]/10 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00B4EB]/20 to-transparent mix-blend-overlay z-10 pointer-events-none" />
                <Image 
                    src="/images/Signup.png" 
                    alt="Dashboard Preview" 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                 {/* Floating Card Element */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-700 z-20 flex items-center justify-between shadow-lg">
                     <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Total Assets</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$12,450,900.00</p>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-[#008001]/10 dark:bg-[#008001]/20 flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-[#008001] -rotate-45" />
                     </div>
                </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Grid */}
      <section ref={featuresRef} className="py-24 px-6 relative bg-white dark:bg-[#020617]">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                 <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">Enterprise-Ready Features</h2>
                 <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to manage corporate finances with precision and security.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: ShieldCheck, title: 'Bank-Grade Security', desc: 'End-to-end encryption and multi-factor authentication protecting your assets.' },
                    { icon: PieChart, title: 'Real-Time Analytics', desc: 'Live dashboards providing instant insights into cash flow and expenditure.' },
                    { icon: Target, title: 'Budget Control', desc: 'Advanced tools to set, monitor, and enforce departmental spending limits.' }
                ].map((feature, idx) => (
                    <div
                        key={idx}
                        className="p-8 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#00B4EB]/50 transition-colors group feature-card"
                    >
                        <div className="w-12 h-12 rounded-lg bg-[#00B4EB]/10 flex items-center justify-center mb-6 group-hover:bg-[#00B4EB] transition-colors duration-300">
                             <feature.icon className="w-6 h-6 text-[#00B4EB] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
         </div>
      </section>
    </div>
  );
}
