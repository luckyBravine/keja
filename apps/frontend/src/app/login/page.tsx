'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Login successful! Redirecting to home...');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-400 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="w-full bg-accent text-white p-2 rounded hover:bg-green-600">
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don’t have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
