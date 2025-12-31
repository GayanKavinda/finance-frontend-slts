'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  User, Mail, Lock, ShieldCheck, Camera, 
  Loader2, Shield, Sparkles, ArrowRight
} from 'lucide-react';
import { fetchCsrf } from '@/lib/auth';

const profileSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Too short'),
  email: yup.string().email('Invalid email').required('Email is required'),
});

const passwordSchema = yup.object({
  current_password: yup.string().required('Current password is required'),
  password: yup
    .string()
    .required('New password is required')
    .min(8, 'At least 8 characters')
    .matches(/[a-z]/, 'Must contain lowercase')
    .matches(/[A-Z]/, 'Must contain uppercase')
    .matches(/[0-9]/, 'Must contain a number'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm password required'),
});

const InputField = ({ label, icon: Icon, error, type = 'text', ...props }) => (
  <div className="space-y-1.5 text-left w-full group">
    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-[#00B4EB]">{label}</label>
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
          <Icon className={`w-4 h-4 transition-colors duration-200 ${error ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-[#00B4EB]'}`} />
      </div>
      <input 
        type={type}
        {...props}
        className={`w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border rounded-2xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-all duration-300 ${
            error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/5' 
              : 'border-slate-100 dark:border-slate-800 focus:border-[#00B4EB] focus:ring-4 focus:ring-[#00B4EB]/5 hover:border-slate-200 dark:hover:border-slate-700'
          }`}
      />
    </div>
    {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-medium ml-1">{error}</motion.p>}
  </div>
);

export default function ProfilePage() {
  const { user, loading, refetch } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  // Parallax Scroll Tracking
  const { scrollY } = useScroll();
  
  // Header Transforms: Shrink and move to top-left
  const headerY = useTransform(scrollY, [0, 150], [0, -60]);
  const avatarScale = useTransform(scrollY, [0, 150], [1, 0.4]);
  const avatarX = useTransform(scrollY, [0, 150], [0, -420]); // Adjust based on max-width
  const avatarY = useTransform(scrollY, [0, 150], [0, 10]);
  
  // Text Transforms: Scale down and move next to avatar
  const textScale = useTransform(scrollY, [0, 150], [1, 0.8]);
  const textX = useTransform(scrollY, [0, 150], [0, -290]);
  const textY = useTransform(scrollY, [0, 150], [0, -35]);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: user?.name, email: user?.email }
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name, email: user.email });
    }
  }, [user, resetProfile]);

  const onProfileUpdate = async (data) => {
    try {
      await fetchCsrf();
      const response = await axios.post('/api/update-profile', data);
      await refetch();
      enqueueSnackbar(response.data.message, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Update failed', { variant: 'error' });
    }
  };

  const onPasswordUpdate = async (data) => {
    try {
      await fetchCsrf();
      const response = await axios.post('/api/update-password', data);
      resetPassword();
      enqueueSnackbar(response.data.message, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Security update failed', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#020617]">
        <Loader2 className="w-10 h-10 animate-spin text-[#00B4EB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-500 overflow-x-hidden pt-20">
      
      {/* 1. Header Hero Area with Parallax */}
      <motion.div 
        style={{ y: headerY }}
        className="fixed top-20 left-0 right-0 z-50 pointer-events-none h-64 flex flex-col items-center justify-center"
      >
        <div className="max-w-5xl w-full flex flex-col items-center relative">
          
          {/* Centered Broken Line Decoration (Visible when at top) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 dark:bg-slate-800 -translate-y-1/2 hidden lg:flex items-center px-4"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
            <div className="w-48" /> {/* Gap for Avatar */}
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
          </motion.div>

          {/* User Avatar */}
          <motion.div 
            style={{ scale: avatarScale, x: avatarX, y: avatarY }}
            className="w-32 h-32 rounded-full border-8 border-white dark:border-[#020617] bg-white dark:bg-[#020617] shadow-2xl relative z-10 overflow-hidden pointer-events-auto group"
          >
             <div className="w-full h-full rounded-full bg-gradient-to-br from-[#00B4EB] to-[#008001] flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                {user?.name?.charAt(0)}
             </div>
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={24} />
             </div>
          </motion.div>

          {/* User Name & Info */}
          <motion.div 
             style={{ x: textX, y: textY, scale: textScale }}
             className="mt-6 text-center"
          >
             <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{user?.name}</h1>
             <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1.5 opacity-60">Identity OS</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Spacer to push content down below the fixed header */}
      <div className="h-80" />

      {/* 2. Full View Main Content Card */}
      <div className="relative w-full z-40">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="w-full bg-white dark:bg-slate-950/50 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800/50 rounded-t-[60px] min-h-screen shadow-[0_-40px_100px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_-40px_100px_-20px_rgba(0,0,0,0.4)]"
        >
          <div className="max-w-4xl mx-auto py-20 px-10 space-y-24">
            
            {/* PERSONAL DATA GROUP */}
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#00B4EB]/10 flex items-center justify-center text-[#00B4EB]">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Public Protocol</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Verification & Presence</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 items-end">
                <InputField label="Entity Designation" icon={User} placeholder="Full Name" {...registerProfile('name')} error={profileErrors.name?.message} />
                <InputField label="Transmission Address" icon={Mail} placeholder="Email Address" {...registerProfile('email')} error={profileErrors.email?.message} />
                <div className="md:col-span-2 flex justify-end">
                   <button 
                     type="submit" 
                     disabled={isProfileSubmitting}
                     className="px-10 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 group"
                   >
                     {isProfileSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sync Identity <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>}
                   </button>
                </div>
              </form>
            </div>

            <div className="h-px w-full bg-slate-50 dark:bg-slate-900" />

            {/* SECURITY GROUP */}
            <div className="space-y-10 pb-20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Shield size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Access Control</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Security & Encryption</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit(onPasswordUpdate)} className="space-y-10">
                <div className="max-w-sm">
                   <InputField label="Primary Key (Current)" icon={Lock} type="password" placeholder="Verify Current Password" {...registerPassword('current_password')} error={passwordErrors.current_password?.message} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <InputField label="Secondary Key (New)" icon={Lock} type="password" placeholder="New Password" {...registerPassword('password')} error={passwordErrors.password?.message} />
                  <InputField label="Redundant Verification" icon={ShieldCheck} type="password" placeholder="Confirm New Password" {...registerPassword('password_confirmation')} error={passwordErrors.password_confirmation?.message} />
                </div>

                <div className="flex justify-end">
                   <button 
                     type="submit" 
                     disabled={isPasswordSubmitting}
                     className="px-10 py-3.5 bg-gradient-to-r from-[#00B4EB] to-[#008001] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                   >
                     {isPasswordSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Upgrade Encryption</>}
                   </button>
                </div>
              </form>
            </div>

            {/* Branding Signature */}
            <div className="pt-10 flex flex-col items-center gap-4 text-slate-200 dark:text-slate-800 opacity-20 select-none">
               <Sparkles size={32} />
               <div className="text-[60px] font-black leading-none tracking-tighter">SLT DIGITAL</div>
            </div>

          </div>
        </motion.div>
      </div>

    </div>
  );
}
