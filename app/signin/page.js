'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from '@/lib/axios';  // ← Custom axios
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCsrf } from '@/lib/auth';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup.string().required('Password is required'),
});

export default function Signin() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
  try {
    console.log('Step 1: Fetching CSRF cookie...');
    await fetchCsrf(); // This MUST succeed

    console.log('Step 2: Attempting login...');
    const response = await axios.post('/api/login', data);
    console.log('Login response:', response.data);

    enqueueSnackbar('Welcome back! Login successful.', { variant: 'success' });
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}