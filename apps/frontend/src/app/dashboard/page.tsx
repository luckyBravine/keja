'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/app/lib/api';

interface SavedItem {
  id: number;
  listing: {
    id: number;
    title: string;
    city: string;
    state: string;
    price: string;
    created_at: string;
  };
}

interface ApiAppointment {
  id: number;
  listing_title: string;
  listing_address: string;
  agent_name: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
}

const DashboardPage: React.FC = () => {
  const [savedCount, setSavedCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [recentSaved, setRecentSaved] = useState<SavedItem[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<ApiAppointment[]>([]);
  const [agentsCount, setAgentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [savedRes, appRes] = await Promise.all([
        apiFetch<{ count?: number; results?: SavedItem[] }>('listings/saved/?page_size=5'),
        apiFetch<{ count?: number; results?: ApiAppointment[] }>('appointments/?page_size=5'),
      ]);
      if (savedRes.ok && savedRes.data) {
        const results = savedRes.data.results ?? [];
        setSavedCount(savedRes.data.count ?? results.length);
        setRecentSaved(results);
        const agentIds = new Set(
          results.map((s) => (s.listing as { agent?: number })?.agent).filter(Boolean)
        );
        setAgentsCount(agentIds.size);
      }
      if (appRes.ok && appRes.data) {
        const results = appRes.data.results ?? [];
        setAppointmentsCount(appRes.data.count ?? results.length);
        setUpcomingAppointments(results);
      }
      setLoading(false);
    };
    load();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="mt-2 text-gray-600">Here&apos;s a quick overview of your dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Saved Listings</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : savedCount}</p>
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
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : appointmentsCount}</p>
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
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : agentsCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
            <Link href="/dashboard/listings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : recentSaved.length === 0 ? (
              <p className="text-sm text-gray-500">No saved listings yet.</p>
            ) : (
              recentSaved.map((s) => (
                <div key={s.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900">{s.listing?.title}</h3>
                  <p className="text-sm text-gray-600">{s.listing?.city}, {s.listing?.state}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    KES {s.listing?.price ? parseFloat(s.listing.price).toLocaleString() : '—'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link href="/dashboard/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming appointments.</p>
            ) : (
              upcomingAppointments.map((a) => (
                <div key={a.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900">{a.listing_address || a.listing_title}</h3>
                  <p className="text-sm text-gray-600">with {a.agent_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{a.scheduled_date} at {formatTime(a.scheduled_time)}</p>
                </div>
              ))
            )}
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
