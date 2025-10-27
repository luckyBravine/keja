'use client';
import React from 'react';
import Link from 'next/link';

const DashboardPage: React.FC = () => {
  const recentListings = [
    { id: 1, title: 'Bedsitter', price: 'Ksh 50,000', location: 'Kibera, Nairobi', date: '2 days ago' },
    { id: 2, title: 'Apartment', price: 'Ksh 120,000', location: 'Westlands, Nairobi', date: '5 days ago' },
  ];

  const upcomingAppointments = [
    { id: 1, property: '123 Main St, Nairobi', agent: 'John Doe Realtor', date: 'Oct 28', time: '10:00 AM' },
    { id: 2, property: '456 Oak Ave, Mombasa', agent: 'Jane Smith Realty', date: 'Nov 1', time: '02:00 PM' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="mt-2 text-gray-600">Here's a quick overview of your dashboard.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Saved Listings</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Appointments</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">My Agents</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
            <Link href="/dashboard/listings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentListings.map((listing) => (
              <div key={listing.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                    <p className="text-sm text-gray-600">{listing.location}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{listing.price}</p>
                  </div>
                  <span className="text-xs text-gray-500">{listing.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link href="/dashboard/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.property}</h3>
                    <p className="text-sm text-gray-600">with {appointment.agent}</p>
                    <p className="text-xs text-gray-500 mt-1">{appointment.date} at {appointment.time}</p>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/dashboard/appointments">
              <button className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Schedule New Appointment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;