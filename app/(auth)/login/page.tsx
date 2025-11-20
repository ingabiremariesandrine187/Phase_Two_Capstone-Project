"use client";

import {useState} from 'react';
import {signIn} from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { APP_NAME } from '@/lib/constants';

const loginSchema =z.object({
 email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      } else {
        // Redirect to home page on success
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return(
   
    <div  className="min-h-screen flex items-center justify-center bg-[#faf9f6] py-12 px-4 sm:px-6 lg:px-8">

   <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <span className="text-3xl font-serif font-bold text-[#1a5f3f]">
              {APP_NAME}
            </span>
          </Link>
          <p className="text-sm text-gray-600 mb-6">
            Share your stories with the world.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <Link
              href="/login"
              className="flex-1 text-center pb-3 border-b-2 border-[#1a5f3f] font-medium text-gray-800"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center pb-3 text-gray-500 hover:text-gray-800 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Welcome Message */}
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] outline-none text-gray-700"
                placeholder="you@example.com"
                suppressHydrationWarning
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] outline-none"
                placeholder="••••••••"
                suppressHydrationWarning
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1a5f3f] hover:bg-[#155035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a5f3f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              suppressHydrationWarning
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <Link
              href="/login/forgot-password"
              className="text-sm text-gray-600 hover:text-[#1a5f3f] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </form>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-[#1a5f3f] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}