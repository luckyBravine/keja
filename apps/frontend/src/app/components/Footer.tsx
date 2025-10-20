'use client';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-20">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 text-base">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">K</div>
            <span className="text-2xl font-bold text-gray-900">Keja</span>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed">Find your perfect rental home with our comprehensive platform.</p>
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-6">Company</h4>
          <ul className="space-y-4 text-lg text-gray-600">
            <li><button type="button" className="hover:text-blue-600 transition-colors">About Us</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Careers</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Press</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Contact</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-6">Services</h4>
          <ul className="space-y-4 text-lg text-gray-600">
            <li><button type="button" className="hover:text-blue-600 transition-colors">Rent</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Buy</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Sell</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Property Management</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-6">Support</h4>
          <ul className="space-y-4 text-lg text-gray-600">
            <li><button type="button" className="hover:text-blue-600 transition-colors">Help Center</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Privacy Policy</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Terms of Service</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">FAQ</button></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-8 text-base text-gray-500">© 2024 RentHub. All rights reserved.</div>
    </footer>
  );
};

export default Footer;


