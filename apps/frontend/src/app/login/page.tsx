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

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next');
  const [formData, setFormData] = useState({
    email: '',  // used as username (backend expects username)
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl('auth/login/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email.trim(),
          password: formData.password,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const d = data as { detail?: string; error?: { message?: string; details?: unknown } };
        const msg = d?.error?.message
          || (d?.error?.details && typeof d.error.details === 'object' && (d.error.details as { message?: string }).message)
          || d?.detail;
        setError(msg || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      const access = (data as { access?: string }).access;
      const refresh = (data as { refresh?: string }).refresh;
      if (access) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('isLoggedIn', 'true');
      }
      if (refresh) localStorage.setItem('refresh_token', refresh);

      // If user tried to save a listing before login, save it now
      const pendingSaveId = typeof window !== 'undefined' ? localStorage.getItem('keja_pending_save_listing_id') : null;
      if (pendingSaveId && access) {
        try {
          await fetch(getApiUrl('listings/saved/'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
            body: JSON.stringify({ listing_id: Number(pendingSaveId) }),
          });
        } catch (_) { /* ignore */ }
        localStorage.removeItem('keja_pending_save_listing_id');
      }

      // Redirect by role: get profile to know if agent or client
      const profileRes = await fetch(getApiUrl('auth/profile/'), {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        const role = (profile as { role?: string }).role;
        if (role === 'agent' || role === 'admin') {
          router.push('/admin/dashboard');
          return;
        }
      }
      // Client: redirect to ?next= if safe (starts with /dashboard), else dashboard
      const safe = nextUrl && nextUrl.startsWith('/dashboard');
      router.push(safe ? nextUrl : '/dashboard');
      // Keep loading true until navigation completes
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Is the backend running?');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 lg:mb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-2xl lg:text-3xl font-bold text-gray-800">🏠</span>
                </div>
              </div>
              <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4 lg:mb-6">Find Your Perfect Home</h2>
              <p className="text-gray-300 text-base lg:text-xl leading-relaxed">Join thousands of satisfied tenants who found their dream rental with Keja</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Welcome Back</h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">Enter your credentials to access your account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Email / Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-base sm:text-lg lg:text-xl"><CiMail /></span>
                  </div>
                  <input
                    id="email"
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

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <label htmlFor="password" className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700">Password</label>
                  <Link href="#" className="text-sm sm:text-base lg:text-lg text-blue-600 hover:text-blue-800">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-base sm:text-lg lg:text-xl"><RiLockPasswordFill /></span>
                  </div>
                  <input
                    id="password"
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 sm:py-4 text-sm sm:text-base lg:text-xl rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Signing In...
                  </>
                ) : (
                  'Login'
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
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
