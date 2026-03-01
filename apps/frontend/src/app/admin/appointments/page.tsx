'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppointmentForm from '@/app/components/AppointmentForm';
import { apiFetch, getApiUrl, getToken } from '@/app/lib/api';

interface ApiAppointment {
  id: number;
  client_name: string;
  listing_address: string;
  listing_title: string;
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
}

function timeToBackend(timeStr: string): string {
  if (!timeStr) return '09:00:00';
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return timeStr.includes(':') ? timeStr : '09:00:00';
  let h = parseInt(match[1], 10);
  const m = match[2];
  if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}:00`;
}

const AdminAppointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => String(new Date().getDate()));
  const [showForm, setShowForm] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<ApiAppointment[]>([]);
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const [appRes, listRes] = await Promise.all([
        apiFetch<{ results?: ApiAppointment[] }>('appointments/?page_size=20'),
        apiFetch<{ results?: ApiListing[] }>('listings/?page_size=100'),
      ]);
      if (appRes.ok && appRes.data?.results) setUpcomingAppointments(appRes.data.results);
      if (listRes.ok && listRes.data?.results) setListings(listRes.data.results);
      setLoading(false);
    };
    load();
  }, []);

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const formatTime = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const am = hour < 12;
    const h12 = hour % 12 || 12;
    return `${h12}:${m || '00'} ${am ? 'AM' : 'PM'}`;
  };

  const handleAppointmentSubmit = async (data: {
    listingId?: number;
    date: string;
    time: string;
    notes?: string;
    clientName?: string;
    [key: string]: unknown;
  }) => {
    const listingId = data.listingId ?? (listings.length ? listings[0].id : null);
    if (!listingId) {
      setError('Please select a listing.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Please log in.');
        return;
      }
      const body = {
        listing: listingId,
        scheduled_date: data.date,
        scheduled_time: timeToBackend(data.time as string),
        notes: data.notes || (data.clientName ? `Client: ${data.clientName}` : ''),
      };
      const res = await fetch(getApiUrl('appointments/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: { message?: string } }).error?.message || 'Failed to create appointment');
      }
      const created = await res.json();
      setUpcomingAppointments((prev) => [created, ...prev]);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
            <p className="mt-2 text-gray-600">Manage your property viewing appointments.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Schedule New Appointment
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📅</span>
                <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
                ))}
                {calendarDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day.toString())}
                    className={`p-2 text-sm rounded-lg transition-colors ${
                      selectedDate === day.toString() ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl">📋</span>
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments.</p>
                ) : (
                  upcomingAppointments.map((a) => (
                    <div key={a.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{a.client_name}</p>
                      <p className="text-sm text-gray-600">{a.listing_address || a.listing_title}</p>
                      <p className="text-xs text-gray-500">{a.scheduled_date} {formatTime(a.scheduled_time)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                        a.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{a.status}</span>
                    </div>
                  ))
                )}
              </div>
              <Link href="/admin/appointments" className="block mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AppointmentForm
                mode="admin"
                listings={listings.map((l) => ({ id: l.id, title: l.title, address: `${l.address}, ${l.city}` }))}
                onSubmit={handleAppointmentSubmit}
                onClose={() => { setShowForm(false); setError(null); }}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAppointments;
