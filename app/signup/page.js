// app/signup/page.js

'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCsrf } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

// ... schema remains same ...
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
      enqueueSnackbar('Account created successfully! Welcome to the platform.', { variant: 'success' });
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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-2xl brand-gradient shadow-2xl shadow-primary/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-4xl font-black text-foreground tracking-tight">
          Create <span className="gradient-text">Account</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground font-medium tracking-wide">
          Join thousands managing their wealth smarter
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-primary/50 to-accent/50 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="glass-card relative py-10 px-8 sm:px-12">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <input
                    {...register('name')}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.name.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                />
                {errors.password && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 leading-tight">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Confirm</label>
                <input
                  {...register('password_confirmation')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                />
                {errors.password_confirmation && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.password_confirmation.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 brand-gradient rounded-2xl text-white font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 mt-6 shadow-2xl"
            >
              {isSubmitting ? 'Creating Secure Account...' : 'Sign Up Now'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              Already a member?{' '}
              <Link href="/signin" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
