'use client';
import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F6F9FF]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-8">
          ← Back to home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-KE')}</p>
        <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
          <p>
            Keja (&quot;we&quot;) respects your privacy. This policy describes how we collect, use, and protect your information when you use our rental marketplace.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">Information we collect</h2>
          <p>We collect information you provide when you register, search listings, book viewings, or contact agents—such as name, email, phone, and preferences.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">How we use it</h2>
          <p>We use this information to run the platform, match you with listings and agents, send booking confirmations, and improve our services.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">Contact</h2>
          <p>For privacy questions, contact us at <a href="mailto:privacy@keja.co" className="text-blue-600 hover:underline">privacy@keja.co</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
