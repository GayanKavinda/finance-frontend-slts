'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, PieChart, Target, ArrowRight, CheckCircle2 } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8 text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-[#00B4EB] text-xs font-bold uppercase tracking-widest shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B4EB] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B4EB]"></span>
              </span>
              Enterprise Ready
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4EB] to-[#008001]">Corporate Finance</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Secure, intelligent, and unified financial management for the digital enterprise. Powered by SLT Digital Services.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
               <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#008001]" /> Enterprise Grade</div>
               <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#008001]" /> ISO 27001 Secure</div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
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
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0F172A]/30 group">
        <div className="max-w-7xl mx-auto px-6">
             <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-10 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Trusted by Industry Leaders</p>
             <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                {[
                  { src: '/icons/Daraz-logo.png', alt: 'Daraz Logo' },
                  { src: '/icons/PickMe-Logo_Two-tone_Transparent-400x172.png', alt: 'PickMe Logo' },
                  { src: '/icons/boc.png', alt: 'BOC Logo' },
                  { src: '/icons/cida_logo.png', alt: 'CIDA Logo' },
                  { src: '/icons/hnb.png', alt: 'HNB Logo' },
                  { src: '/icons/lassana.svg', alt: 'Lassana Logo' },
                  { src: '/icons/lgc Transparent.png', alt: 'LGC Logo' },
                  { src: '/icons/mbsl logo.png', alt: 'MBSL Logo' },
                  { src: '/icons/p&slogo.svg', alt: 'P&S Logo' },
                  { src: '/icons/pickme.png', alt: 'PickMe Alt Logo' },
                  { src: '/icons/sanasa logo.png', alt: 'Sanasa Logo' },
                  { src: '/icons/sliit-campus-seeklogo.png', alt: 'SLIIT Logo' },
                  { src: '/icons/slt_digital_icon.png', alt: 'SLT Digital Logo' }
                ].map((icon, index) => (
                  <div key={index} className="relative w-24 h-10 md:w-32 md:h-12 group/icon transition-transform duration-300 hover:scale-110">
                      <Image 
                        src={icon.src} 
                        alt={icon.alt} 
                        fill
                        className="object-contain" 
                      />
                  </div>
                ))}
             </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative bg-white dark:bg-[#020617]">
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
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="p-8 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#00B4EB]/50 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-[#00B4EB]/10 flex items-center justify-center mb-6 group-hover:bg-[#00B4EB] transition-colors duration-300">
                             <feature.icon className="w-6 h-6 text-[#00B4EB] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
         </div>
      </section>
    </div>
  );
}
