"use client";
import {useState} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { APP_NAME } from '../../../../lib/constants';
import { authAPI } from '../../../../lib/api';

//form validation schema 
const signupSchema = z   
    .object({
      name:z.string().min(2, 'Name must be at least 2 characters'),
       email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    })
     .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

  type SignupFormData = z.infer<typeof signupSchema>;

  export default function SignupPage() {
  const router = useRouter();
  const [error,setError]= useState<string | null>(null);
   const [isLoading,setLoading] = useState(false);
   
   const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError(null);
     

try {
      // Call signup API
      const signupResponse = await authAPI.signup(data.name, data.email, data.password);

      // Automatically sign in after successful signup
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but sign in failed. Please try logging in.');
        setLoading(false);
      } else {
        // Fetch user profile to update session
        try {
          await authAPI.getProfile();
        } catch (profileError) {
          console.error('Failed to fetch profile:', profileError);
          // Continue even if profile fetch fails
        }
        
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };
  
   return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] py-12 px-4 sm:px-6 lg:px-8">
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
              className="flex-1 text-center pb-3 text-gray-500 hover:text-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login/signup"
              className="flex-1 text-center pb-3 border-b-2 border-[#1a5f3f] font-medium text-gray-800"
            >
              Sign Up
            </Link>
          </div>

          {/* Welcome Message */}
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
              Create your account
            </h2>
            <p className="text-sm text-gray-600">
              Join our community of writers and readers
            </p>
          </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                autoComplete="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] outline-none text-gray-700"
                placeholder="John Doe"
                suppressHydrationWarning
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

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
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] outline-none text-gray-700"
                placeholder="••••••••"
                suppressHydrationWarning
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] outline-none text-gray-700"
                placeholder="••••••••"
                suppressHydrationWarning
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
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
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
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
  );
}