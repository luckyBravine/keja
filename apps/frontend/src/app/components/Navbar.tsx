'use client';
import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">K</div>
          <span className="text-3xl font-extrabold text-gray-900">Keja</span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-lg text-gray-800 font-semibold">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <button className="hover:text-blue-600 transition-colors" type="button">Buy</button>
          <button className="hover:text-blue-600 transition-colors" type="button">Rent</button>
          <button className="hover:text-blue-600 transition-colors" type="button">Sell</button>
          <button className="hover:text-blue-600 transition-colors" type="button">Agents</button>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login" className="px-5 py-3 text-lg text-gray-800 hover:text-blue-600 font-semibold transition-colors">Sign In</Link>
          <Link href="/register" className="px-7 py-3.5 text-lg rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold transition-colors">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


