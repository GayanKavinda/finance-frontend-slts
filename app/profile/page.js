'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from '@/lib/axios';
import { fetchCsrf } from '@/lib/auth';
import { useSnackbar } from 'notistack';
import { Loader2, User, Mail, Lock, ShieldCheck, Trash2, Save, Camera } from 'lucide-react';
import Image from 'next/image';

// Validation Schemas
const profileSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Too short'),
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

const emailChangeSchema = yup.object({
  new_email: yup.string().email('Invalid email').required('New email is required'),
  current_password: yup.string().required('Current password is required'),
  otp: yup.string().length(6, 'Code must be 6 digits').optional(),
});

function Field({ label, error, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
        {Icon && <Icon size={14} className="text-slate-400" />} {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading, refetch } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Tabs
  const [tab, setTab] = useState('personal'); // 'personal' | 'security'

  // Forms
  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
    mode: 'onTouched',
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    mode: 'onTouched',
  });

  const emailForm = useForm({
    resolver: yupResolver(emailChangeSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name || '' });
      setAvatarPreview(user?.avatar_url || null);
    }
  }, [user, profileForm]);

  // Handlers
  const onUpdateProfile = async (data) => {
    try {
      await fetchCsrf();
      const res = await axios.post('/api/update-profile', data);
      await refetch();
      enqueueSnackbar(res.data.message || 'Profile updated', { variant: 'success' });
    } catch (e) {
      const msg = e.response?.data?.errors?.name?.[0] || e.response?.data?.message || 'Update failed';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) return;
    const form = new FormData();
    form.append('avatar', avatarFile);
    try {
      await fetchCsrf();
      const res = await axios.post('/api/upload-avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      enqueueSnackbar(res.data.message || 'Avatar updated', { variant: 'success' });
      setAvatarFile(null);
      await refetch();
    } catch (e) {
      const msg = e.response?.data?.errors?.avatar?.[0] || e.response?.data?.message || 'Upload failed';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const onUpdatePassword = async (data) => {
    try {
      await fetchCsrf();
      const res = await axios.post('/api/update-password', data);
      enqueueSnackbar(res.data.message || 'Password updated', { variant: 'success' });
      passwordForm.reset();
    } catch (e) {
      const msg = e.response?.data?.errors?.current_password?.[0]
        || e.response?.data?.errors?.password?.[0]
        || e.response?.data?.message
        || 'Security update failed';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const onRequestEmailOtp = async () => {
    const values = emailForm.getValues();
    try {
      await fetchCsrf();
      await axios.post('/api/request-email-change', {
        new_email: values.new_email,
        current_password: values.current_password,
      });
      enqueueSnackbar('Verification code sent to your new email', { variant: 'success' });
    } catch (e) {
      const msg = e.response?.data?.errors?.new_email?.[0]
        || e.response?.data?.errors?.current_password?.[0]
        || e.response?.data?.message
        || 'Failed to send OTP';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const onConfirmEmailChange = async (data) => {
    try {
      await fetchCsrf();
      const res = await axios.post('/api/confirm-email-change', {
        new_email: data.new_email,
        otp: data.otp,
      });
      enqueueSnackbar(res.data.message || 'Email updated', { variant: 'success' });
      emailForm.reset();
      await refetch();
    } catch (e) {
      const msg = e.response?.data?.errors?.otp?.[0]
        || e.response?.data?.errors?.new_email?.[0]
        || e.response?.data?.message
        || 'Email update failed';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const onDeactivate = async () => {
    if (!confirm('Deactivate your account? You can request restore within 30 days.')) return;
    try {
      await fetchCsrf();
      const res = await axios.post('/api/deactivate-account');
      enqueueSnackbar(res.data.message || 'Account deactivated', { variant: 'success' });
      try { await axios.post('/api/logout'); } catch {}
      window.location.href = '/signin';
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Failed to deactivate', { variant: 'error' });
    }
  };

  // No functional changes here, just preparing for movement


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#020617]">
        <Loader2 className="w-10 h-10 animate-spin text-[#00B4EB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] pt-24">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <User size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
              <p className="text-xs text-slate-500">Manage your personal information and security settings</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
          {[
            { key: 'personal', label: 'Personal' },
            { key: 'security', label: 'Security' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-semibold -mb-[1px] border-b-2 ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-slate-500'} whitespace-nowrap`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'personal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Avatar + Meta */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Profile Photo</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={avatarPreview || '/images/Signup.png'}
                      alt="avatar"
                      fill
                      className="rounded-full object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-full shadow z-10"
                      title="Change photo"
                    >
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-slate-600 dark:text-slate-300">JPG, PNG, WEBP up to 2MB</div>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 2 * 1024 * 1024) {
                            enqueueSnackbar('File too large (max 2MB)', { variant: 'error' });
                            return;
                          }
                          setAvatarFile(f);
                          const url = URL.createObjectURL(f);
                          setAvatarPreview(url);
                        }}
                      />
                      <button
                        type="button"
                        disabled={!avatarFile}
                        onClick={onUploadAvatar}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white shadow-md shadow-primary/10 disabled:opacity-40 hover:bg-primary/90 transition-all"
                      >
                        Upload
                      </button>
                      {avatarFile && (
                        <button
                          type="button"
                          onClick={() => { setAvatarFile(null); setAvatarPreview(user?.avatar_url || null); }}
                          className="px-3 py-2 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-xs text-slate-500 space-y-1">
                  <div>Last updated: {user?.profile_updated_at ? new Date(user.profile_updated_at).toLocaleString() : '—'}</div>
                  <div>Updated by: {user?.profile_updated_by || '—'}</div>
                </div>
              </div>
            </div>

            {/* Right: Personal Info and Email Change */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Personal Info</h3>
                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full name" icon={User} error={profileForm.formState.errors.name?.message}>
                    <input
                      {...profileForm.register('name')}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                      placeholder="Your name"
                    />
                  </Field>
                  <Field label="Email (read-only)" icon={Mail}>
                    <input
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-sm"
                    />
                  </Field>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" disabled={profileForm.formState.isSubmitting} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-40">
                      {profileForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />} Save changes
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Change Email</h3>
                <form onSubmit={emailForm.handleSubmit(onConfirmEmailChange)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="New email" icon={Mail} error={emailForm.formState.errors.new_email?.message}>
                    <input {...emailForm.register('new_email')} placeholder="name@example.com" className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-sm" />
                  </Field>
                  <Field label="Current password" icon={Lock} error={emailForm.formState.errors.current_password?.message}>
                    <input type="password" {...emailForm.register('current_password')} placeholder="Your password" className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-sm" />
                  </Field>
                  <div className="flex items-end">
                    <button type="button" onClick={onRequestEmailOtp} className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-800 text-xs font-semibold w-full">Send Code</button>
                  </div>
                  <Field label="Verification code" icon={ShieldCheck} error={emailForm.formState.errors.otp?.message}>
                    <input {...emailForm.register('otp')} placeholder="6-digit code" className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-sm" />
                  </Field>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" disabled={emailForm.formState.isSubmitting} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all disabled:opacity-40">Confirm email change</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Change Password</h3>
                <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Current password" icon={Lock} error={passwordForm.formState.errors.current_password?.message}>
                    <input type="password" {...passwordForm.register('current_password')} className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-sm" placeholder="••••••••" />
                  </Field>
                  <Field label="New password" icon={Lock} error={passwordForm.formState.errors.password?.message}>
                    <input type="password" {...passwordForm.register('password')} className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-sm" placeholder="At least 8 characters" />
                  </Field>
                  <Field label="Confirm new password" icon={ShieldCheck} error={passwordForm.formState.errors.password_confirmation?.message}>
                    <input type="password" {...passwordForm.register('password_confirmation')} className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-sm" placeholder="Repeat password" />
                  </Field>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" disabled={passwordForm.formState.isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold disabled:opacity-40">
                      {passwordForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />} Update password
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Danger Zone</h3>
                <p className="text-xs text-slate-500 mb-4">Deactivate your account. Your data will be preserved for 30 days and can be restored by support.</p>
                <button onClick={onDeactivate} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-xs font-semibold">
                  <Trash2 size={14} /> Deactivate account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer meta */}
        <div className="py-10 text-center text-[11px] text-slate-400">SLT DIGITAL</div>
      </div>
    </div>
  );
}
