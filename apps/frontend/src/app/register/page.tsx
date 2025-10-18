'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Registration successful! Redirecting to login...');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border rounded"
            required
          />
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
            Register
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
