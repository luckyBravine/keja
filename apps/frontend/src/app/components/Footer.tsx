'use client';
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-12 sm:mt-16 lg:mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">K</div>
              <span className="text-xl font-bold text-gray-900">Keja</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              Kenya&apos;s rental marketplace. Find bedsitters, apartments, and more—verified agents, easy viewings.
            </p>
          </div>

          {/* Rent */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Rent</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#listings" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Browse rentals
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Account</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Legal & contact</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Terms of service
                </Link>
              </li>
              <li>
                <a href="mailto:support@keja.co" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© {currentYear} Keja. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
