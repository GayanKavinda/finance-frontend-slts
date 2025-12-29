// app/signin/page.js

'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCsrf } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup.string().required('Password is required'),
});

export default function Signin() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { refetch } = useAuth();  // <-- Add this

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
      console.log('Login response:', response.data);

      enqueueSnackbar('Welcome back! Login successful.', { variant: 'success' });

      await refetch();  // <-- This will now succeed
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);

      if (error.response?.status === 401) {
        enqueueSnackbar('Invalid email or password.', { variant: 'error' });
      } else if (error.response?.status === 422) {
        enqueueSnackbar('Validation error. Check your input.', { variant: 'error' });
      } else {
        enqueueSnackbar('Login failed. Check console for details.', { variant: 'error' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-2xl brand-gradient shadow-2xl shadow-primary/20">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-4xl font-black text-foreground tracking-tight">
          Welcome <span className="gradient-text">Back</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground font-medium tracking-wide">
          Enter your credentials to access your portal
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-primary/50 to-accent/50 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="glass-card relative py-10 px-8 sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold text-rose-500 ml-1">
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" size="sm" className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-tighter">
                  Forgot?
                </Link>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono"
              />
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold text-rose-500 ml-1">
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 brand-gradient rounded-2xl text-white font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-2xl"
            >
              {isSubmitting ? 'Verifying...' : 'Sign In Now'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              New to the platform?{' '}
              <Link href="/signup" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}