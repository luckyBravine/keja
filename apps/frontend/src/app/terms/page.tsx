'use client';
import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F6F9FF]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-8">
          ← Back to home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-KE')}</p>
        <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
          <p>
            By using Keja, you agree to these terms. Our platform connects renters with verified agents and listings across Kenya.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">Using the platform</h2>
          <p>You must provide accurate information and use the service only for lawful purposes. Listing and booking through Keja are subject to agent and landlord policies.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:support@keja.co" className="text-blue-600 hover:underline">support@keja.co</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
