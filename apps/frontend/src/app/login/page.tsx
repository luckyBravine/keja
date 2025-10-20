'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { CiMail } from "react-icons/ci";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Login successful! Redirecting to home...');
    router.push('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-800 items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">🏠</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Find Your Perfect Home</h2>
            <p className="text-gray-300 text-xl leading-relaxed">Join thousands of satisfied tenants who found their dream rental with Keja</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-16">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">K</span>
                </div>
                <span className="text-3xl font-bold text-blue-600">Keja</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome Back</h1>
              <p className="text-xl text-gray-600">Enter your credentials to access your account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Email / Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl"><CiMail /></span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-lg font-semibold text-gray-700">Password</label>
                  <Link href="#" className="text-lg text-blue-600 hover:text-blue-800">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl"><RiLockPasswordFill /></span>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 text-xl rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            </form>

            {/* Divider */}
            <div className="my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="px-3 bg-white text-gray-500">OR CONTINUE WITH</span>
                </div>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button className="flex items-center justify-center gap-3 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-xl"><FcGoogle /></span>
                <span className="text-base font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-xl"><FaApple /></span>
                <span className="text-base font-medium">Apple</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-xl"><FaFacebook /></span>
                <span className="text-base font-medium">Facebook</span>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-lg text-gray-600">
                Don't have an account?{' '}
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
