'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppointmentForm from '@/app/components/AppointmentForm';
import { apiFetch, getApiUrl, getToken } from '@/app/lib/api';

interface ApiAppointment {
  id: number;
  agent_name: string;
  listing_address: string;
  listing_title: string;
  listing: number;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes?: string;
}

interface SavedItem {
  id: number;
  listing: { id: number; title: string; address: string; city: string; state: string; agent_name: string };
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

function getTodayYYYYMMDD(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCalendarDaysForMonth(year: number, month: number): { day: number | null; dateStr: string | null }[] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const firstWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const cells: { day: number | null; dateStr: string | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr });
  }
  return cells;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const UserAppointments: React.FC = () => {
  const router = useRouter();
  const todayStr = getTodayYYYYMMDD();
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [calendarView, setCalendarView] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [showForm, setShowForm] = useState(false);
  const [myAppointments, setMyAppointments] = useState<ApiAppointment[]>([]);
  const [savedListings, setSavedListings] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentContext, setAppointmentContext] = useState<{ listingId?: number; realtorName?: string; propertyAddress?: string } | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<ApiAppointment | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login?next=/dashboard/appointments');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      const [appRes, savedRes] = await Promise.all([
        apiFetch<{ results?: ApiAppointment[] }>('appointments/?page_size=20'),
        apiFetch<{ results?: SavedItem[] }>('listings/saved/?page_size=50'),
      ]);
      if (appRes.status === 401 || savedRes.status === 401) {
        router.replace('/login?next=/dashboard/appointments');
        return;
      }
      if (appRes.ok && appRes.data?.results) setMyAppointments(appRes.data.results);
      if (savedRes.ok && savedRes.data?.results) setSavedListings(savedRes.data.results);
      setLoading(false);
    };
    load();
  }, [router]);

  const calendarCells = getCalendarDaysForMonth(calendarView.year, calendarView.month);
  const appointmentsOnSelectedDate = selectedDate
    ? myAppointments.filter((a) => a.scheduled_date === selectedDate)
    : myAppointments;
  const datesWithAppointments = React.useMemo(
    () => new Set(myAppointments.map((a) => a.scheduled_date)),
    [myAppointments]
  );

  const goPrevMonth = () => {
    setCalendarView((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };
  const goNextMonth = () => {
    setCalendarView((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };
  const monthLabel = new Date(calendarView.year, calendarView.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const formatTime = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const am = hour < 12;
    const h12 = hour % 12 || 12;
    return `${h12}:${m || '00'} ${am ? 'AM' : 'PM'}`;
  };

  const backendTimeToDisplay = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const am = hour < 12;
    const h12 = hour % 12 || 12;
    return `${h12}:${(m || '00').padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
  };

  const handleAppointmentSubmit = async (data: {
    listingId?: number;
    date: string;
    time: string;
    notes?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    propertyAddress?: string;
    realtorName?: string;
    [key: string]: unknown;
  }) => {
    if (editingAppointment) {
      setSubmitting(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) {
          router.replace('/login?next=/dashboard/appointments');
          return;
        }
        const body = {
          scheduled_date: data.date,
          scheduled_time: timeToBackend(data.time as string),
          notes: data.notes || '',
        };
        const res = await fetch(getApiUrl(`appointments/${editingAppointment.id}/`), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/login?next=/dashboard/appointments');
            return;
          }
          const errData = await res.json().catch(() => ({}));
          const msg = (errData as { detail?: string }).detail
            || (errData as { error?: { message?: string } }).error?.message
            || (errData as { scheduled_date?: string[] }).scheduled_date?.[0]
            || (errData as { scheduled_time?: string[] }).scheduled_time?.[0]
            || 'Failed to update appointment';
          throw new Error(msg);
        }
        const updated = await res.json();
        setMyAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setShowForm(false);
        setEditingAppointment(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update appointment');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const listingId = data.listingId ?? appointmentContext?.listingId;
    if (!listingId || listingId === 0) {
      setError('Please select a listing from the dropdown. If you have no saved listings, go to the home page, save a property, then return here.');
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
        notes: data.notes || '',
      };
      const res = await fetch(getApiUrl('appointments/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.replace('/login?next=/dashboard/appointments');
          return;
        }
        const errData = await res.json().catch(() => ({}));
        const msg = (errData as { detail?: string; listing?: string[]; scheduled_date?: string[] }).detail
          || (errData as { listing?: string[] }).listing?.[0]
          || (errData as { scheduled_date?: string[] }).scheduled_date?.[0]
          || (errData as { error?: { message?: string } }).error?.message
          || 'Failed to create appointment';
        throw new Error(msg);
      }
      const created = await res.json();
      setMyAppointments((prev) => [created, ...prev]);
      setShowForm(false);
      setAppointmentContext(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const openFormWithListing = (listingId: number, realtorName: string, propertyAddress: string) => {
    setAppointmentContext({ listingId, realtorName, propertyAddress });
    setShowForm(true);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="mt-2 text-gray-600">View and manage your scheduled property viewings.</p>
          </div>
          <button
            onClick={() => { setAppointmentContext(null); setEditingAppointment(null); setShowForm(true); }}
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
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-2xl">📅</span>
                <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={goPrevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Previous month">‹</button>
                  <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">{monthLabel}</span>
                  <button type="button" onClick={goNextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Next month">›</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>
                ))}
                {calendarCells.map((cell, idx) => (
                  <div key={idx} className="min-h-[2rem] flex items-center justify-center">
                    {cell.day === null ? (
                      <span />
                    ) : (
                      <button
                        type="button"
                        onClick={() => cell.dateStr && setSelectedDate(cell.dateStr)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors flex flex-col items-center justify-center ${
                          selectedDate === cell.dateStr
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {cell.day}
                        {cell.dateStr && datesWithAppointments.has(cell.dateStr) && (
                          <span className={`w-1 h-1 rounded-full mt-0.5 ${selectedDate === cell.dateStr ? 'bg-white' : 'bg-blue-500'}`} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedDate ? `Appointments on ${formatDisplayDate(selectedDate)}` : 'My Appointments'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate(selectedDate ? null : todayStr)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {selectedDate ? 'Show all' : 'Show today'}
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : appointmentsOnSelectedDate.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {selectedDate ? `No appointments on this date.` : 'No appointments yet.'}
                  </p>
                ) : (
                  appointmentsOnSelectedDate.map((a) => (
                    <div key={a.id} className="p-4 bg-gray-50 rounded-lg flex flex-col gap-2">
                      <p className="font-medium text-gray-900">{a.listing_address || a.listing_title}</p>
                      <p className="text-sm text-gray-600">with {a.agent_name}</p>
                      <p className="text-xs text-gray-500">{a.scheduled_date} {formatTime(a.scheduled_time)}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          a.status === 'confirmed' ? 'bg-green-100 text-green-800' : a.status === 'cancelled' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-800'
                        }`}>{a.status}</span>
                        {(a.status === 'pending' || a.status === 'confirmed') && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAppointment(a);
                              setAppointmentContext({ listingId: a.listing, realtorName: a.agent_name, propertyAddress: a.listing_address || a.listing_title });
                              setShowForm(true);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowForm(false); setError(null); setAppointmentContext(null); setEditingAppointment(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {!editingAppointment && savedListings.length === 0 && !appointmentContext?.listingId && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  To book an appointment you need a saved listing. Go to the home page or Dashboard → My Listings, find a property and click the heart to save it, then return here and select it from the dropdown.
                </div>
              )}
              <AppointmentForm
                mode="user"
                realtorName={appointmentContext?.realtorName}
                propertyAddress={appointmentContext?.propertyAddress}
                listingId={appointmentContext?.listingId ?? editingAppointment?.listing}
                initialValues={editingAppointment ? {
                  date: editingAppointment.scheduled_date,
                  time: backendTimeToDisplay(editingAppointment.scheduled_time),
                  notes: editingAppointment.notes ?? '',
                  listingId: editingAppointment.listing,
                } : undefined}
                isEditMode={!!editingAppointment}
                listings={savedListings.map((s) => ({
                  id: s.listing.id,
                  title: s.listing.title,
                  address: `${s.listing.address}, ${s.listing.city}, ${s.listing.state}`,
                  realtorName: s.listing.agent_name,
                }))}
                onSubmit={handleAppointmentSubmit}
                onClose={() => { setShowForm(false); setError(null); setAppointmentContext(null); setEditingAppointment(null); }}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAppointments;
