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
  <div className="space-y-1.5 text-left">
    <label className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
    <div className="relative group">
      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
          <Icon className={`w-5 h-5 transition-colors duration-200 ${error ? 'text-red-500' : 'text-slate-500 group-focus-within:text-[#00B4EB]'}`} />
      </div>
      <input 
        type={type}
        {...props}
        className={`w-full pl-10 pr-4 py-3.5 bg-slate-950 border rounded-lg text-sm font-medium text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all duration-300 ${
            error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
              : 'border-slate-800 focus:border-[#00B4EB] focus:ring-1 focus:ring-[#00B4EB]/20 hover:border-slate-700'
          }`}
      />
    </div>
    {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] text-red-500 font-medium ml-1">{error}</motion.p>}
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
      const response = await axios.post('/api/login', data);
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
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B4EB]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#008001]/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[420px] bg-[#0F172A] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-800 p-8 sm:p-10 relative z-10"
        >
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative w-[180px] h-[60px] mb-6">
                     <Image 
                        src="/icons/slt_digital_icon.png" 
                        alt="SLT Digital Logo" 
                        fill
                        className="object-contain brightness-0 invert" 
                        priority
                    />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Welcome Back
                </h1>
                <p className="text-sm text-slate-400 mt-2">
                    Sign in to your corporate account
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <InputField 
                    label="Email Address" 
                    icon={Mail} 
                    placeholder="name@company.com" 
                    {...register('email')} 
                    error={errors.email?.message} 
                />
                
                <div className="space-y-2">
                    <InputField 
                        label="Password" 
                        icon={Lock} 
                        type="password" 
                        placeholder="••••••••" 
                        {...register('password')} 
                        error={errors.password?.message} 
                    />
                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-[12px] font-semibold text-[#00B4EB] hover:text-[#009bc9] transition-colors">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] hover:from-[#00A0D1] hover:to-[#0089b3] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,180,235,0.15)] hover:shadow-[0_0_30px_rgba(0,180,235,0.3)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                <p className="text-sm text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-[#008001] font-bold hover:text-[#00B4EB] transition-colors ml-1 uppercase text-xs tracking-wide">
                        Register Now
                    </Link>
                </p>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">
                    Secured by SLT Digital
                </p>
            </div>
        </motion.div>
    </div>
  );
}