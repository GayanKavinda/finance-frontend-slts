'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCsrf } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const schema = yup.object({
  name: yup.string().required('Name is required').max(255),
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'At least 8 characters')
    .matches(/[a-z]/, 'Must contain lowercase')
    .matches(/[A-Z]/, 'Must contain uppercase')
    .matches(/[0-9]/, 'Must contain a number')
    .matches(/[^a-zA-Z0-9]/, 'Must contain a symbol'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm password required'),
});

export default function Signup() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { refetch } = useAuth();

  const onSubmit = async (data) => {
    try {
      await fetchCsrf();
      await axios.post('/api/register', data);
      enqueueSnackbar('Account created successfully!', { variant: 'success' });
      await refetch();
      router.push('/dashboard');
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).flat().forEach((msg) => {
          enqueueSnackbar(msg, { variant: 'error' });
        });
      } else if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Registration failed. Please try again.', { variant: 'error' });
      }
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] flex items-center justify-center relative">
      {/* Subtle Background Mesh */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #E2E8F0 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col p-8 md:p-10 z-10"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
            <Link href="/" className="mb-4 hover:opacity-80 transition-opacity">
                <div className="relative w-40 h-12">
                    <Image src="/icons/slt_digital_icon.png" alt="SLT Logo" fill className="object-contain" priority />
                </div>
            </Link>
            <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Create Professional ID</h1>
                <p className="text-xs text-slate-500 font-medium">Secure access to SLT Digital Services</p>
            </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#0056B3] transition-colors" />
                        <input 
                            {...register('name')}
                            placeholder="John Doe"
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0056B3] focus:ring-4 focus:ring-[#0056B3]/5 transition-all"
                        />
                    </div>
                    {errors.name && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Work Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#0056B3] transition-colors" />
                        <input 
                            {...register('email')}
                            type="email"
                            placeholder="name@company.com"
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0056B3] focus:ring-4 focus:ring-[#0056B3]/5 transition-all"
                        />
                    </div>
                    {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#0056B3] transition-colors" />
                        <input 
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0056B3] focus:ring-4 focus:ring-[#0056B3]/5 transition-all font-mono"
                        />
                    </div>
                    {errors.password && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm</label>
                    <div className="relative group">
                        <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#0056B3] transition-colors" />
                        <input 
                            {...register('password_confirmation')}
                            type="password"
                            placeholder="••••••••"
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0056B3] focus:ring-4 focus:ring-[#0056B3]/5 transition-all font-mono"
                        />
                    </div>
                    {errors.password_confirmation && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.password_confirmation.message}</p>}
                </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <CheckCircle2 className="w-4 h-4 text-[#0056B3] mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-snug">
                    By accessing this service, you agree to comply with SLT's <a href="#" className="font-bold text-[#0056B3] hover:underline">Acceptable Use Policy</a>. Unauthorized access is prohibited.
                </p>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#0056B3] hover:bg-[#004494] text-white font-bold rounded-lg shadow-lg shadow-[#0056B3]/20 hover:shadow-xl hover:shadow-[#0056B3]/30 hover:-translate-y-0.5 active:scale-[0.99] transition-all disabled:opacity-70 disabled:hover:translate-y-0 text-sm uppercase tracking-wider"
            >
                {isSubmitting ? 'Authenticating...' : 'Create Secure ID'}
            </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">© 2025 SLT Digital</span>
            <div className="flex items-center gap-1 text-slate-500 font-medium">
                Already registered? 
                <Link href="/signin" className="text-[#F58220] hover:text-[#d36a11] font-bold ml-1">
                    Sign In
                </Link>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
