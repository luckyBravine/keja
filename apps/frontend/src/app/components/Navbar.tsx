'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3" onClick={closeMenu}>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm sm:text-xl">K</span>
          </div>
          <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">Keja</span>
        </Link>

        {/* Desktop: Home, Rent, Sign In, Sign Up */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-base text-gray-800 font-semibold">
          <Link href="/" className={isHome ? 'text-blue-600' : 'hover:text-blue-600 transition-colors'}>Home</Link>
          <Link href="/#listings" className="hover:text-blue-600 transition-colors">Rent</Link>
        </div>
        <div className="hidden md:flex items-center gap-3 lg:gap-5">
          <Link href="/login" className="px-3 lg:px-5 py-2 lg:py-3 text-sm lg:text-lg text-gray-800 hover:text-blue-600 font-semibold transition-colors">Sign In</Link>
          <Link href="/register" className="px-4 lg:px-7 py-2 lg:py-3 text-sm lg:text-lg rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold transition-colors">Sign Up</Link>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-1">
            <Link href="/" onClick={closeMenu} className={`block py-3 text-base font-semibold ${isHome ? 'text-blue-600' : 'text-gray-800 hover:text-blue-600'}`}>Home</Link>
            <Link href="/#listings" onClick={closeMenu} className="block py-3 text-base font-semibold text-gray-800 hover:text-blue-600">Rent</Link>
            <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
              <Link href="/login" onClick={closeMenu} className="block py-3 text-base font-semibold text-gray-800 hover:text-blue-600">Sign In</Link>
              <Link href="/register" onClick={closeMenu} className="block py-3 text-base font-bold text-center rounded-lg bg-blue-600 text-white hover:bg-blue-700">Sign Up</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


