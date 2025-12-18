// app/reset-password/page.js

'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchCsrf } from '@/lib/auth';

const schema = yup.object({
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

export default function ResetPassword() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!token || !email) {
      enqueueSnackbar('Invalid reset link.', { variant: 'error' });
      return;
    }

    try {
      await fetchCsrf();
      await axios.post('/api/reset-password', { ...data, token, email });
      enqueueSnackbar('Password reset successfully! Please sign in.', { variant: 'success' });
      router.push('/signin');
    } catch (error) {
      enqueueSnackbar(error.response?.data?.email || 'Failed to reset password.', { variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Set a new password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" value={email || ''} {...register('email')} />
            <input type="hidden" value={token || ''} {...register('token')} />

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                {...register('password_confirmation')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600"
              />
              {errors.password_confirmation && (
                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}