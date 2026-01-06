'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from '@/lib/axios';
import { fetchCsrf } from '@/lib/auth';
import { useSnackbar } from 'notistack';
import { Loader2, User, Mail, Lock, ShieldCheck, Trash2, Save, Camera } from 'lucide-react';
import Image from 'next/image';
import PasswordStrength from './PasswordStrength';

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
  const [loginHistory, setLoginHistory] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

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

  useLayoutEffect(() => {
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

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
    
    return { score, label: labels[score-1] || 'Weak', color: colors[score-1] || 'bg-red-500' };
  };

  const fetchSecurityData = async () => {
    try {
      const [historyRes, sessionsRes] = await Promise.all([
        axios.get('/api/login-history'),
        axios.get('/api/active-sessions')
      ]);
      setLoginHistory(historyRes.data);
      setActiveSessions(sessionsRes.data);
    } catch (err) {
      console.error('Failed to fetch security data', err);
    }
  };

  const onRevokeSession = async (id) => {
    try {
      await axios.delete(`/api/revoke-session/${id}`);
      enqueueSnackbar('Session revoked successfully', { variant: 'success' });
      fetchSecurityData();
    } catch (err) {
      enqueueSnackbar('Failed to revoke session', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (tab === 'security') {
      fetchSecurityData();
    }
  }, [tab]);


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
              className={`px-4 py-3 text-sm font-semibold -mb-px border-b-2 ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-slate-500'} whitespace-nowrap`}
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
                  <div className="relative w-20 h-20 shrink-0">
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Security Settings</h3>
                  <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)}>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                        <input
                          type="password"
                          {...passwordForm.register('current_password')}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                          placeholder="••••••••"
                        />
                        {passwordForm.formState.errors.current_password && (
                          <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.current_password.message}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                        <div className="relative">
                          <input
                            type="password"
                            {...passwordForm.register('password')}
                            onChange={(e) => {
                              passwordForm.setValue('password', e.target.value);
                              setPasswordStrength(calculatePasswordStrength(e.target.value));
                            }}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                            placeholder="Min. 8 characters"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Lock size={18} />
                          </div>
                        </div>
                        <PasswordStrength control={passwordForm.control} />
                        {passwordForm.formState.errors.password && (
                          <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                        <input
                          type="password"
                          {...passwordForm.register('password_confirmation')}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder="Repeat new password"
                        />
                        {passwordForm.formState.errors.password_confirmation && (
                          <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.password_confirmation.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={passwordForm.formState.isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {passwordForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40">
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-sm text-slate-500 mb-6">Once you deactivate your account, you will have 30 days to request restoration.</p>
                  <button
                    onClick={onDeactivate}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                  >
                    <Trash2 size={16} /> Deactivate Account
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Active Sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSessions.length > 0 ? (
                  activeSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                          <ShieldCheck size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <span className="truncate max-w-[120px] font-mono text-[11px]">{session.ip_address}</span>
                            {session.is_current && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">Active Now</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Last active: {new Date(session.last_active).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {!session.is_current && (
                        <button
                          onClick={() => onRevokeSession(session.id)}
                          className="px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-red-200 dark:border-red-500/20"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6 text-slate-500 text-sm">No active sessions found</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Login History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider">Device / OS</th>
                      <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider">IP Address</th>
                      <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider">Date & Time</th>
                      <th className="pb-4 uppercase text-[10px] tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {loginHistory.map((login) => (
                      <tr key={login.id} className="group">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{login.platform} ({login.browser})</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-slate-500 font-mono text-xs">{login.ip_address}</td>
                        <td className="py-4 pr-4 text-slate-500">{new Date(login.created_at).toLocaleString()}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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


