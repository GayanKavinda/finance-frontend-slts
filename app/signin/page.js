'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCsrf } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup.string().required('Password is required'),
});

const InputField = ({ label, icon: Icon, error, type = 'text', ...props }) => (
  <div className="space-y-1 text-left w-full">
    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
    <div className="relative group">
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none">
          <Icon className={`w-4 h-4 transition-colors duration-200 ${error ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-[#00B4EB]'}`} />
      </div>
      <input 
        type={type}
        {...props}
        className={`w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-950 border rounded-lg text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-all duration-300 ${
            error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
              : 'border-slate-200 dark:border-slate-800 focus:border-[#00B4EB] focus:ring-1 focus:ring-[#00B4EB]/20 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
      />
    </div>
    {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-medium ml-1">{error}</motion.p>}
  </div>
);

export default function Signin() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { refetch } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await fetchCsrf();
      await axios.post('/api/login', data);
      await refetch();
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      router.push('/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        enqueueSnackbar('Invalid email or password.', { variant: 'error' });
      } else {
        enqueueSnackbar('Login failed. Please try again.', { variant: 'error' });
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-white dark:bg-[#020617] overflow-hidden transition-colors duration-500">
        {/* Navigation Logo */}
        <Link href="/" className="absolute top-6 left-6 lg:top-8 lg:left-8 z-50 group flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
             <div className="relative w-[120px] h-[40px] lg:w-[140px] lg:h-[45px]">
                <Image 
                    src="/icons/slt_digital_icon.png" 
                    alt="SLT Digital Logo" 
                    fill
                    className="object-contain dark:brightness-0 dark:invert transition-all duration-300" 
                    priority
                />
            </div>
        </Link>

        {/* Left Side: Centered Form */}
        <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 lg:p-12 relative">
             {/* Ambient Glows for the form side */}
             <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#00B4EB]/5 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#008001]/5 rounded-full blur-[100px] pointer-events-none" />

             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[420px] relative z-20"
             >
                <div className="mb-10 text-left">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your corporate dashboard</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <InputField 
                        label="Work Email" 
                        icon={Mail} 
                        placeholder="name@company.com" 
                        {...register('email')} 
                        error={errors.email?.message} 
                    />

                    <div className="space-y-1">
                        <InputField 
                            label="Password" 
                            icon={Lock} 
                            type="password" 
                            placeholder="••••••••" 
                            {...register('password')} 
                            error={errors.password?.message} 
                        />
                        <div className="flex justify-end pt-1">
                            <Link href="/forgot-password" size="sm" className="text-[11px] font-bold text-[#00B4EB] hover:text-[#009bc9] transition-colors uppercase tracking-widest">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <div className="pt-4">
                         <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] hover:from-[#00A0D1] hover:to-[#0089b3] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,180,235,0.15)] hover:shadow-[0_0_30px_rgba(0,180,235,0.3)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
                         <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-[#008001] font-bold hover:text-[#00B4EB] transition-colors uppercase text-xs tracking-widest ml-1">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </form>

                <div className="mt-12 text-left opacity-30">
                    <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-[0.3em]">
                        Enterprise Secured by SLT Digital
                    </p>
                </div>
             </motion.div>
        </div>

        {/* Right Side: Immersive Image (Hidden on mobile) */}
        <div className="hidden lg:block w-1/2 relative bg-slate-900 overflow-hidden group">
            <Image 
                src="/images/signin.png" 
                alt="Signin Showcase" 
                fill
                className="object-cover transition-all duration-[1000ms] ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-[1.2]"
                priority
            />
            {/* Split Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-[#020617]/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 via-transparent to-transparent z-10" />
            
            {/* Branding on Image */}
            <div className="absolute bottom-12 left-12 right-12 z-20 transition-transform duration-700 ease-out group-hover:-translate-y-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                        Standardizing <br />
                        <span className="text-[#00B4EB]">Financial Intelligence</span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                        Access the most advanced corporate finance management suite. Secure, unified, and enterprise-ready.
                    </p>
                </motion.div>
            </div>
        </div>
    </div>
  );
}