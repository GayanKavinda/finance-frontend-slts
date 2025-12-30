'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, KeyRound, Lock, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Validation Schemas ---
const emailSchema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email address'),
});

const otpSchema = yup.object({
  otp: yup.string().required('Code is required').length(6, 'Must be 6 digits'),
});

const passwordSchema = yup.object({
  password: yup.string().required('Password is required').min(8, 'At least 8 characters'),
  password_confirmation: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password'),
});

// --- UI Components ---
const InputField = ({ label, icon: Icon, error, type = 'text', ...props }) => (
  <div className="space-y-1.5 text-left w-full">
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

export default function ForgotPassword() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Step 1: Email Form ---
  const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: errorsEmail } } = useForm({
    resolver: yupResolver(emailSchema)
  });

  const onSubmitEmail = async (data) => {
    try {
      setIsLoading(true);
      await axios.post('/api/forgot-password-otp', { email: data.email });
      setEmail(data.email);
      setStep(2);
      enqueueSnackbar('Verification code sent!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to send code', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: OTP Form ---
  const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: errorsOtp } } = useForm({
    resolver: yupResolver(otpSchema)
  });

  const onSubmitOtp = async (data) => {
    try {
      setIsLoading(true);
      await axios.post('/api/verify-otp', { email, otp: data.otp });
      setOtp(data.otp);
      setStep(3);
      enqueueSnackbar('Code verified!', { variant: 'success' });
    } catch (error) {
       enqueueSnackbar('Invalid or expired code', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3: Password Form ---
  const { register: registerPass, handleSubmit: handleSubmitPass, formState: { errors: errorsPass } } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const onSubmitPassword = async (data) => {
    try {
      setIsLoading(true);
      await axios.post('/api/reset-password-otp', { 
        email, 
        otp, 
        password: data.password,
        password_confirmation: data.password_confirmation 
      });
      enqueueSnackbar('Password reset successfully!', { variant: 'success' });
      router.push('/signin');
    } catch (error) {
      enqueueSnackbar('Failed to reset password', { variant: 'error' });
    } finally {
      setIsLoading(false);
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
        className="w-full max-w-[420px] bg-[#0F172A] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-800 p-8 sm:p-10 relative z-10"
      >
        <Link href="/signin" className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-300">
           <ChevronLeft className="w-5 h-5" />
        </Link>

        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8 pt-4">
             <div className="relative w-[150px] h-[50px] mb-6">
                 <Image 
                    src="/icons/slt_digital_icon.png" 
                    alt="SLT Digital Logo" 
                    fill
                    className="object-contain brightness-0 invert" 
                />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight text-center">
                {step === 1 && 'Reset Password'}
                {step === 2 && 'Verification Code'}
                {step === 3 && 'New Password'}
            </h1>
            <p className="text-sm text-slate-400 mt-2 text-center max-w-[280px]">
                {step === 1 && 'Enter your registered email address to receive a verification code.'}
                {step === 2 && `We've sent a 6-digit code to ${email}. Please enter it below.`}
                {step === 3 && 'Secure your account with a strong new password.'}
            </p>
        </div>

        <div className="relative overflow-hidden min-h-[220px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleSubmitEmail(onSubmitEmail)} 
                className="space-y-6"
              >
                <InputField label="Email Address" icon={Mail} placeholder="name@company.com" {...registerEmail('email')} error={errorsEmail.email?.message} />
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] hover:from-[#00A0D1] hover:to-[#0089b3] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,180,235,0.15)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Code <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleSubmitOtp(onSubmitOtp)} 
                className="space-y-6"
              >
                <div className="space-y-1.5 text-center">
                   <input 
                    {...registerOtp('otp')}
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 bg-slate-950 border border-slate-700 rounded-lg focus:border-[#00B4EB] focus:text-white text-slate-200 transition-all outline-none placeholder:tracking-normal placeholder:font-sans placeholder:text-lg placeholder:text-slate-600" 
                  />
                  {errorsOtp.otp && <p className="text-xs text-red-500 font-medium">{errorsOtp.otp.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#008001] hover:bg-[#006e01] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,128,1,0.2)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                   {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-xs font-semibold text-slate-500 hover:text-[#00B4EB]">Wrong email? Go back</button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form 
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleSubmitPass(onSubmitPassword)} 
                className="space-y-5"
              >
                <InputField label="New Password" icon={Lock} type="password" placeholder="••••••••" {...registerPass('password')} error={errorsPass.password?.message} />
                <InputField label="Confirm Password" icon={ShieldCheck} type="password" placeholder="••••••••" {...registerPass('password_confirmation')} error={errorsPass.password_confirmation?.message} />
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] hover:from-[#00A0D1] hover:to-[#0089b3] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,180,235,0.15)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                   {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password <CheckCircle2 className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}