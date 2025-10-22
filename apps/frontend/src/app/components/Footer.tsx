'use client';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-12 sm:mt-16 lg:mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 text-sm sm:text-base">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg">K</div>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Keja</span>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">Find your perfect rental home with our comprehensive platform.</p>
        </div>
        <div>
          <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Company</h4>
          <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-sm sm:text-base lg:text-lg text-gray-600">
            <li><button type="button" className="hover:text-blue-600 transition-colors">About Us</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Careers</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Press</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Contact</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Services</h4>
          <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-sm sm:text-base lg:text-lg text-gray-600">
            <li><button type="button" className="hover:text-blue-600 transition-colors">Rent</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Buy</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Sell</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Property Management</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Support</h4>
          <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-sm sm:text-base lg:text-lg text-gray-600">
            <li><button type="button" className="hover:text-blue-600 transition-colors">Help Center</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Privacy Policy</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">Terms of Service</button></li>
            <li><button type="button" className="hover:text-blue-600 transition-colors">FAQ</button></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 text-xs sm:text-sm lg:text-base text-gray-500">© 2024 Keja. All rights reserved.</div>
    </footer>
  );
};

export default Footer;


