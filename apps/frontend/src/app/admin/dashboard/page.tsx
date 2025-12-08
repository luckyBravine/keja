'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const stats = [
    {
      title: 'Active Listings',
      value: '15',
      icon: '🏠',
      color: 'blue',
      change: '+2 this month'
    },
    {
      title: 'Upcoming Appointments',
      value: '3',
      icon: '📅',
      color: 'green',
      change: 'Next: Tomorrow 10:00 AM'
    },
    {
      title: 'Next Payment Due',
      value: 'Jan 1, 2024',
      icon: '💳',
      color: 'red',
      change: 'Premium Plan - $99.99'
    },
    {
      title: 'Total Views',
      value: '1,247',
      icon: '👁️',
      color: 'purple',
      change: '+156 this week'
    }
  ];

  const recentAppointments = [
    { id: 1, client: 'Alice Johnson', property: '123 Ocean View Dr', time: '2024-01-10, 10:00 AM', status: 'confirmed' },
    { id: 2, client: 'Bob Williams', property: '789 Elm Street', time: '2024-01-11, 02:30 PM', status: 'pending' },
    { id: 3, client: 'Carol Davis', property: '456 Riverfront Ave', time: '2024-01-12, 09:00 AM', status: 'confirmed' }
  ];

  const recentListings = [
    { id: 1, address: '123 Ocean View Dr, Miami, FL', price: '$1,250,000', status: 'Active', views: 45 },
    { id: 2, address: '456 Riverfront Ave, Chicago, IL', price: '$780,000', status: 'Pending', views: 23 },
    { id: 3, address: '789 Elm Street, Austin, TX', price: '$520,000', status: 'Active', views: 67 }
  ];

  return (
    <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your properties.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    'text-purple-600'
                  }`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.client}</p>
                    <p className="text-sm text-gray-600">{appointment.property}</p>
                    <p className="text-xs text-gray-500">{appointment.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{listing.address}</p>
                    <p className="text-sm text-gray-600">{listing.price}</p>
                    <p className="text-xs text-gray-500">{listing.views} views</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {listing.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/admin/listings')}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl">🏠</span>
              <div className="text-left">
                <p className="font-medium text-blue-900">Add New Listing</p>
                <p className="text-sm text-blue-700">Create a new property listing</p>
              </div>
            </button>
            <button 
              onClick={() => router.push('/admin/appointments')}
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl">📅</span>
              <div className="text-left">
                <p className="font-medium text-green-900">Schedule Appointment</p>
                <p className="text-sm text-green-700">Book a property viewing</p>
              </div>
            </button>
            <button 
              onClick={() => router.push('/admin/subscription')}
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <p className="font-medium text-purple-900">View Analytics</p>
                <p className="text-sm text-purple-700">Check listing performance</p>
              </div>
            </button>
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard;
