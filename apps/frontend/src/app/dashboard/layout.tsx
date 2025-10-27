'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { MdOutlineHome } from "react-icons/md";
import { MdOutlinePeople } from "react-icons/md";
import { GrNotification } from "react-icons/gr";
import { MdOutlinePowerSettingsNew } from "react-icons/md";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: <BiSolidDashboard/> },
    { name: 'My Listings', href: '/dashboard/listings', icon: <MdOutlineHome/> },
    { name: 'Appointments', href: '/dashboard/appointments', icon: <MdOutlineCalendarMonth/> },
    { name: 'My Agents', href: '/dashboard/clients', icon: <MdOutlinePeople/> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    router.push('/');
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-screen flex flex-col`}>
        
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">K</span>
            </div>
            <span className="text-white font-bold text-xl">Keja User</span>
          </div>
        </div>
        
        {/* Navigation */}
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

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600 w-full"
          >
            <MdOutlinePowerSettingsNew className="text-lg" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <nav className="bg-white border-b border-gray-200 h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Left - Mobile menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Center - Search */}
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search properties, agents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right - Notifications, Messages, Profile */}
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
                      <div className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-gray-900">New appointment confirmed for 123 Main St</p>
                        <p className="text-xs text-gray-500 mt-1">2 min ago</p>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <Link href="/dashboard/notifications" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div 
                onClick={() => router.push('/dashboard/settings')}
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">U</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
