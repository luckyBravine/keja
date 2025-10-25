'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MdOutlineRealEstateAgent } from "react-icons/md";
import { MdOutlineHome } from "react-icons/md";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { MdOutlinePayment } from "react-icons/md";
import { MdOutlineSettings } from "react-icons/md";
import { BiSolidDashboard } from "react-icons/bi";
import { GrNotification } from "react-icons/gr";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <BiSolidDashboard/> },
    { name: 'Listings', href: '/admin/listings', icon: <MdOutlineHome/> },
    { name: 'Appointments', href: '/admin/appointments', icon: <MdOutlineCalendarMonth/> },
    { name: 'Subscription', href: '/admin/subscription', icon: <MdOutlinePayment/> },
    { name: 'Settings', href: '/admin/settings', icon: <MdOutlineSettings/> },
  ];

  const mockNotifications = [
    { id: 1, message: 'New appointment request from John Smith', time: '2 min ago', type: 'appointment' },
    { id: 2, message: 'Property listing approved for 123 Main St', time: '1 hour ago', type: 'listing' },
    { id: 3, message: 'Payment received for Premium subscription', time: '3 hours ago', type: 'payment' },
  ];

  const handleProfileClick = () => {
    router.push('/admin/settings');
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  // Close notifications when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsOpen && !(event.target as Element).closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-screen flex flex-col`}>
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg"><MdOutlineRealEstateAgent/></span>
            </div>
            <span className="text-white font-bold text-xl">KejaAdmin</span>
          </div>
        </div>
        
        <nav className="mt-8 px-4 flex-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-full">
            {/* Left side - Mobile menu and page title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                {pathname === '/admin/dashboard' && 'Dashboard'}
                {pathname === '/admin/listings' && 'Listings'}
                {pathname === '/admin/appointments' && 'Appointments'}
                {pathname === '/admin/subscription' && 'Subscription'}
                {pathname === '/admin/settings' && 'Settings'}
              </h1>
            </div>

            {/* Center - Search bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search properties, clients..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const searchTerm = e.currentTarget.value;
                      console.log('Searching for:', searchTerm);
                      // Add your search functionality here
                    }
                  }}
                />
              </div>
            </div>

            {/* Right side - Notifications and profile */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative notifications-dropdown">
                <button 
                  onClick={handleNotificationClick}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative"
                >
                  <GrNotification className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">3</span>
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {mockNotifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div 
                onClick={handleProfileClick}
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">JD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}