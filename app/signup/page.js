'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import {
  ShieldCheck, User, Mail, Lock, Check, X, Loader2, ArrowRight
} from 'lucide-react';
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

const PasswordRequirement = ({ met, text }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${met ? 'bg-[#008001]' : 'bg-slate-200 dark:bg-slate-800'
      }`}>
      {met ? <Check className="w-1.5 h-1.5 text-white" /> : <X className="w-1.5 h-1.5 text-slate-400 dark:text-slate-500" />}
    </div>
    <span className={`text-[10px] font-medium transition-colors ${met ? 'text-[#008001]' : 'text-slate-500 dark:text-slate-400'
      }`}>
      {text}
    </span>
  </div>
);

const PasswordStrengthMeter = ({ password }) => {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const getColor = () => {
    if (strength === 0) return 'bg-slate-700';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-amber-500';
    if (strength <= 4) return 'bg-[#00B4EB]';
    return 'bg-[#008001]';
  };

  return (
    <div className="flex gap-1 h-0.5 mt-1.5">
      {[1, 2, 3, 4, 5].map((level) => (
        <div
          key={level}
          className={`flex-1 rounded-full transition-colors duration-300 ${level <= strength ? getColor() : 'bg-slate-200 dark:bg-slate-800'
            }`}
        />
      ))}
    </div>
  );
};

const InputField = ({ label, icon: Icon, error, type = 'text', isLoading, ...props }) => (
  <div className="space-y-1 text-left w-full">
    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
    <div className="relative group">
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none">
        <Icon className={`w-4 h-4 transition-colors duration-200 ${error ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-[#00B4EB]'}`} />
      </div>
      <input
        type={type}
        {...props}
        className={`w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-950 border rounded-lg text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-all duration-300 ${error
          ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
          : 'border-slate-200 dark:border-slate-800 focus:border-[#00B4EB] focus:ring-1 focus:ring-[#00B4EB]/20 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
      />
      {isLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-3.5 h-3.5 text-[#00B4EB] animate-spin" /></div>}
    </div>
    {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-medium ml-1">{error}</motion.p>}
  </div>
);

export default function Signup() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { refetch } = useAuth();
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const email = useWatch({ control, name: 'email', defaultValue: '' });

  // Real-time Email Validation
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setIsCheckingEmail(true);
        try {
          const response = await axios.post('/api/check-email', { email });
          if (response.data.exists) {
            setError('email', { type: 'manual', message: 'This email is already registered' });
          } else if (!response.data.valid_domain) {
            setError('email', { type: 'manual', message: 'Invalid email domain (no mail server)' });
          } else {
            clearErrors('email');
          }
        } catch (error) {
          // handled quietly
        } finally {
          setIsCheckingEmail(false);
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [email, setError, clearErrors]);

  const onSubmit = async (data) => {
    try {
      await fetchCsrf();
      await axios.post('/api/register', data);
      await refetch();
      enqueueSnackbar('Account created successfully!', { variant: 'success' });
      router.push('/dashboard');
    } catch (error) {
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((key) => {
          setError(key, { type: 'server', message: validationErrors[key][0] });
        });
        enqueueSnackbar('Please correct the highlighted errors.', { variant: 'error' });
      } else {
        enqueueSnackbar('Registration failed. Please try again.', { variant: 'error' });
      }
    }
  };

  const reqs = [
    { text: '8+ chars', met: password.length >= 8 },
    { text: 'Lowercase', met: /[a-z]/.test(password) },
    { text: 'Uppercase', met: /[A-Z]/.test(password) },
    { text: 'Number', met: /[0-9]/.test(password) },
    { text: 'Symbol', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-4 lg:p-6 overflow-hidden transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[1300px] h-full max-h-[800px] bg-white dark:bg-[#0F172A] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col lg:flex-row relative z-10 transition-colors duration-300"
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B4EB]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#008001]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Left Side: Modern Image Showcase */}
        <div className="hidden lg:block w-1/2 relative h-full bg-slate-900 overflow-hidden group">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/Signup.png"
              alt="SLT Digital Future"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              quality={100}
              priority
            />
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/80 via-slate-100/20 to-transparent dark:from-[#020617] dark:via-slate-900/50 dark:to-transparent z-10" />

          <div className="absolute bottom-0 left-0 right-0 p-10 z-20">
            <div className="relative w-[160px] h-[50px] mb-4 drop-shadow-lg">
              <Image
                src="/icons/slt_digital_icon.png"
                alt="SLT Digital Logo"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight drop-shadow-md">
              Powering Your Financial Future
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-md drop-shadow-md">
              Join the enterprise ecosystem trusted by professionals. Secure, fast, and unified digital services.
            </p>
          </div>
        </div>

        {/* Right Side: Dark Premium Form */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center relative z-20 p-6 sm:p-8 lg:p-12 overflow-y-auto lg:overflow-visible">
          <div className="mb-6 flex-shrink-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your details to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField label="Full Name" icon={User} placeholder="John Doe" {...register('name')} error={errors.name?.message} />

            <InputField
              label="Work Email"
              icon={Mail}
              placeholder="name@company.com"
              {...register('email')}
              error={errors.email?.message}
              isLoading={isCheckingEmail}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <InputField label="Password" icon={Lock} type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
                {password && <PasswordStrengthMeter password={password} />}
              </div>
              <div className="space-y-1">
                <InputField label="Confirm Password" icon={ShieldCheck} type="password" placeholder="••••••••" {...register('password_confirmation')} error={errors.password_confirmation?.message} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#020617]/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {reqs.map((req, i) => (
                <PasswordRequirement key={i} {...req} />
              ))}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isCheckingEmail}
                className="w-full py-3.5 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] hover:from-[#00A0D1] hover:to-[#0089b3] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,180,235,0.15)] hover:shadow-[0_0_30px_rgba(0,180,235,0.3)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-500 mt-4">
              By clicking "Create Account", you agree to our <a href="#" className="font-bold text-[#00B4EB] hover:underline">Terms</a> and <a href="#" className="font-bold text-[#00B4EB] hover:underline">Privacy Policy</a>.
            </p>

            <div className="mt-4 pt-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Already have an account?{' '}
                <Link href="/signin" className="text-[#008001] font-bold hover:text-[#00B4EB] transition-colors uppercase text-xs tracking-wide ml-1">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}