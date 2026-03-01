'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/app/lib/api';

interface ApiAppointment {
  id: number;
  client_name: string;
  listing_address: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
}

interface ApiListing {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  price: string;
  status: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [listingsCount, setListingsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [recentAppointments, setRecentAppointments] = useState<ApiAppointment[]>([]);
  const [recentListings, setRecentListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [listRes, appRes] = await Promise.all([
        apiFetch<{ count?: number; results?: ApiListing[] }>('listings/?page_size=5'),
        apiFetch<{ count?: number; results?: ApiAppointment[] }>('appointments/?page_size=5'),
      ]);
      if (listRes.ok && listRes.data) {
        const listData = listRes.data;
        setListingsCount(listData.count ?? (listData.results?.length ?? 0));
        setRecentListings(listData.results ?? []);
      }
      if (appRes.ok && appRes.data) {
        const appData = appRes.data;
        setAppointmentsCount(appData.count ?? (appData.results?.length ?? 0));
        setRecentAppointments(appData.results ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const stats = [
    { title: 'Active Listings', value: String(listingsCount), icon: '🏠', color: 'blue', change: 'Your properties' },
    { title: 'Upcoming Appointments', value: String(appointmentsCount), icon: '📅', color: 'green', change: 'View in Appointments' },
    { title: 'Next Payment Due', value: '—', icon: '💳', color: 'red', change: 'See Subscription' },
    { title: 'Quick Links', value: '—', icon: '👁️', color: 'purple', change: 'Below' },
  ];

  const formatTime = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const am = hour < 12;
    const h12 = hour % 12 || 12;
    return `${h12}:${m || '00'} ${am ? 'AM' : 'PM'}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your properties.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'red' ? 'text-red-600' : 'text-purple-600'
                    }`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
                <Link href="/admin/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
              </div>
              <div className="space-y-4">
                {recentAppointments.length === 0 ? (
                  <p className="text-sm text-gray-500">No appointments yet.</p>
                ) : (
                  recentAppointments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{a.client_name}</p>
                        <p className="text-sm text-gray-600">{a.listing_address}</p>
                        <p className="text-xs text-gray-500">{a.scheduled_date} {formatTime(a.scheduled_time)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{a.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
                <Link href="/admin/listings" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
              </div>
              <div className="space-y-4">
                {recentListings.length === 0 ? (
                  <p className="text-sm text-gray-500">No listings yet.</p>
                ) : (
                  recentListings.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{l.address}, {l.city}</p>
                        <p className="text-sm text-gray-600">KES {parseFloat(l.price).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{l.title}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        l.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{l.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admin/listings')}
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <span className="text-2xl">🏠</span>
            <div>
              <p className="font-medium text-blue-900">Add New Listing</p>
              <p className="text-sm text-blue-700">Create a new property listing</p>
            </div>
          </button>
          <button
            onClick={() => router.push('/admin/appointments')}
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-medium text-green-900">Schedule Appointment</p>
              <p className="text-sm text-green-700">Book a property viewing</p>
            </div>
          </button>
          <button
            onClick={() => router.push('/admin/subscription')}
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium text-purple-900">Subscription</p>
              <p className="text-sm text-purple-700">Plans and billing</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
