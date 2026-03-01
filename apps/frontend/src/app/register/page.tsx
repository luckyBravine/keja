'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiUrl } from '@/app/lib/api';

import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { CiMail } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";

const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user' // 'user' or 'realtor'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const names = formData.fullName.trim().split(/\s+/);
      const first_name = names[0] || '';
      const last_name = names.slice(1).join(' ') || '';

      const res = await fetch(getApiUrl('auth/register/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email.trim(),
          email: formData.email.trim(),
          password: formData.password,
          password2: formData.confirmPassword,
          first_name,
          last_name,
          role: formData.userType === 'realtor' ? 'agent' : 'client',
          phone: '',
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const d = data as Record<string, unknown>;
        let msg = '';
        const err = d?.error as { message?: string; details?: Record<string, string | string[]> } | undefined;
        if (err?.details && typeof err.details === 'object') {
          const first = Object.values(err.details)[0];
          msg = Array.isArray(first) ? first[0] : typeof first === 'string' ? first : '';
        }
        if (!msg && err?.message) msg = err.message;
        if (!msg && d && !d.error) {
          const firstKey = Object.keys(d)[0];
          const val = firstKey ? (d[firstKey] as unknown) : undefined;
          msg = Array.isArray(val) ? (val[0] as string) : typeof val === 'string' ? val : '';
        }
        setError(msg || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      const tokens = (data as { tokens?: { access?: string; refresh?: string } }).tokens;
      const access = tokens?.access;
      if (access) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('isLoggedIn', 'true');
        if (tokens.refresh) localStorage.setItem('refresh_token', tokens.refresh);
      }

      // If new client tried to save a listing before registering, save it now
      if (formData.userType === 'user' && access) {
        const pendingSaveId = typeof window !== 'undefined' ? localStorage.getItem('keja_pending_save_listing_id') : null;
        if (pendingSaveId) {
          try {
            await fetch(getApiUrl('listings/saved/'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
              body: JSON.stringify({ listing_id: Number(pendingSaveId) }),
            });
          } catch (_) { /* ignore */ }
          localStorage.removeItem('keja_pending_save_listing_id');
        }
      }

      if (formData.userType === 'realtor') {
        router.push('/admin/dashboard');
      } else {
        const safe = nextUrl && nextUrl.startsWith('/dashboard');
        router.push(safe ? nextUrl : '/dashboard');
      }
      // Keep loading true until navigation completes
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Is the backend running?');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl grid lg:grid-cols-[35%_65%] gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Panel - Illustration */}
        <div className="hidden lg:flex bg-gray-800 items-center justify-center p-6 lg:p-8">
          <div className="text-center">
            <div className="mb-6 lg:mb-8">
              <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 lg:mb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-2xl lg:text-3xl font-bold text-gray-800">✨</span>
                </div>
              </div>
              <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4 lg:mb-6">Start Your Journey</h2>
              <p className="text-gray-300 text-base lg:text-xl leading-relaxed">Join Keja today and discover amazing rental properties tailored to your needs</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Register Form */}
        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 lg:mb-10">
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl">K</span>
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-blue-600">Keja</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Create Account</h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">Sign up to start finding your perfect rental home</p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              {/* Full Name Field */}
              <div>
                <label className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-base sm:text-lg lg:text-xl"><CgProfile /></span>
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-base sm:text-lg lg:text-xl"><CiMail /></span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* User Type Field */}
              <div>
                <label className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Account Type</label>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${formData.userType === 'user'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}>
                    <input
                      type="radio"
                      name="userType"
                      value="user"
                      checked={formData.userType === 'user'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-xl">�</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Regular User</p>
                      <p className="text-xs text-gray-600">Browse and book properties</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${formData.userType === 'realtor'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}>
                    <input
                      type="radio"
                      name="userType"
                      value="realtor"
                      checked={formData.userType === 'realtor'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-xl">🏠</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Realtor</p>
                      <p className="text-xs text-gray-600">Manage properties & clients</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-base sm:text-lg lg:text-xl"><RiLockPasswordFill /></span>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              {formData.password && (
                <div>
                  <label className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-base sm:text-lg lg:text-xl"><RiLockPasswordFill /></span>
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 sm:py-4 text-sm sm:text-base lg:text-xl rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 sm:my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm lg:text-base">
                  <span className="px-2 sm:px-3 bg-white text-gray-500">OR CONTINUE WITH</span>
                </div>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
              <button className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-base sm:text-lg lg:text-xl"><FcGoogle /></span>
                <span className="text-xs sm:text-sm lg:text-base font-medium hidden sm:inline">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-base sm:text-lg lg:text-xl"><FaApple /></span>
                <span className="text-xs sm:text-sm lg:text-base font-medium hidden sm:inline">Apple</span>
              </button>
              <button className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-base sm:text-lg lg:text-xl"><FaFacebook /></span>
                <span className="text-xs sm:text-sm lg:text-base font-medium hidden sm:inline">Facebook</span>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
