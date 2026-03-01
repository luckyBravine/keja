'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ListingCard from '@/app/components/ListingCard';
import AppointmentForm from '@/app/components/AppointmentForm';
import { apiFetch, getApiUrl, getAuthHeaders, getToken, getMediaUrl } from '@/app/lib/api';

interface ApiListing {
  id: number;
  title: string;
  property_type: string;
  status: string;
  address?: string;
  city: string;
  state: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  agent_name: string;
  primary_image: string | null;
  is_saved?: boolean;
}

interface SavedItem {
  id: number;
  listing: {
    id: number;
    title: string;
    address: string;
    city: string;
    state: string;
    price: string;
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    agent_name: string;
    primary_image: string | null;
  };
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

const UserListings: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'browse' | 'saved'>('browse');
  const [browseListings, setBrowseListings] = useState<ApiListing[]>([]);
  const [savedListings, setSavedListings] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<ApiListing | (SavedItem['listing']) | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentListingId, setAppointmentListingId] = useState<number | null>(null);
  const [appointmentContext, setAppointmentContext] = useState<{ realtorName?: string; propertyAddress?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      router.replace('/login?next=/dashboard/listings');
      return;
    }
    setLoading(true);
    setError(null);
    const [browseRes, savedRes] = await Promise.all([
      apiFetch<{ results?: ApiListing[] }>('listings/?page_size=24'),
      apiFetch<{ results?: SavedItem[] }>('listings/saved/?page_size=100'),
    ]);
    if (browseRes.status === 401 || savedRes.status === 401) {
      router.replace('/login?next=/dashboard/listings');
      return;
    }
    if (browseRes.ok && browseRes.data?.results) setBrowseListings(browseRes.data.results);
    if (savedRes.ok && savedRes.data?.results) setSavedListings(savedRes.data.results);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const savedIds = new Set(savedListings.map((s) => s.listing.id));
  const browseWithSaved = browseListings.map((l) => ({ ...l, is_saved: savedIds.has(l.id) || l.is_saved }));

  const handleSavedChange = (listingId: number, saved: boolean) => {
    if (saved) {
      setBrowseListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, is_saved: true } : l))
      );
      loadData();
    } else {
      setBrowseListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, is_saved: false } : l))
      );
      setSavedListings((prev) => prev.filter((s) => s.listing.id !== listingId));
    }
  };

  const openDetails = (listing: ApiListing | SavedItem['listing']) => {
    setSelectedListing(listing);
    setShowDetails(true);
  };

  const openBookAppointment = (listing: ApiListing | SavedItem['listing']) => {
    setAppointmentListingId(listing.id);
    setAppointmentContext({
      realtorName: listing.agent_name,
      propertyAddress: [listing.address, listing.city, listing.state].filter(Boolean).join(', '),
    });
    setShowDetails(false);
    setShowAppointmentForm(true);
  };

  const handleAppointmentSubmit = async (data: {
    listingId?: number;
    date: string;
    time: string;
    notes?: string;
    [key: string]: unknown;
  }) => {
    const listingId = data.listingId ?? appointmentListingId;
    if (!listingId || listingId === 0) {
      setError('Please select a listing.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        router.replace('/login?next=/dashboard/listings');
        return;
      }
      const res = await fetch(getApiUrl('appointments/'), {
        method: 'POST',
        headers: { ...getAuthHeaders(), Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          listing: listingId,
          scheduled_date: data.date,
          scheduled_time: timeToBackend(data.time as string),
          notes: data.notes || '',
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.replace('/login?next=/dashboard/listings');
          return;
        }
        const errData = await res.json().catch(() => ({}));
        const msg = (errData as { detail?: string }).detail || (errData as { listing?: string[] }).listing?.[0] || 'Failed to create appointment';
        throw new Error(msg);
      }
      setShowAppointmentForm(false);
      setAppointmentListingId(null);
      setAppointmentContext(null);
      router.push('/dashboard/appointments');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const displayBrowse = activeTab === 'browse';
  const list = displayBrowse ? browseWithSaved : savedListings.map((s) => ({ ...s.listing, is_saved: true }));

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="mt-2 text-gray-600">Browse properties and manage your saved listings. Save any listing to book an appointment.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'browse' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Browse all
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'saved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Saved ({savedListings.length})
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">
              {activeTab === 'saved'
                ? 'You have no saved listings. Use “Browse all” to find properties and click the heart to save.'
                : 'No listings found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((listing) => (
              <div key={listing.id}>
                <ListingCard
                  id={listing.id}
                  title={listing.title}
                  price={listing.price}
                  image={getMediaUrl(listing.primary_image) || '/luxury-one.webp'}
                  location={[listing.address, listing.city, listing.state].filter(Boolean).join(', ') || '—'}
                  beds={listing.bedrooms}
                  baths={listing.bathrooms}
                  sqft={listing.square_feet}
                  is_saved={listing.is_saved ?? savedIds.has(listing.id)}
                  onSavedChange={(saved) => handleSavedChange(listing.id, saved)}
                  onBookAppointment={(e) => { e.stopPropagation(); openDetails(listing); }}
                  detailUrl={`/listings/${listing.id}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetails && selectedListing && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
                <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600 p-2" aria-label="Close">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <img
                src={getMediaUrl(selectedListing.primary_image) || '/luxury-one.webp'}
                alt={selectedListing.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedListing.title}</h3>
              <p className="text-gray-600 mb-4">{[selectedListing.address, selectedListing.city, selectedListing.state].filter(Boolean).join(', ')}</p>
              <div className="flex gap-6 text-sm text-gray-600 mb-4">
                <span>{selectedListing.bedrooms} bed</span>
                <span>{selectedListing.bathrooms} bath</span>
                <span>{selectedListing.square_feet} sqft</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">Ksh {selectedListing.price}</p>
              <p className="text-sm text-gray-600 mb-4">Agent: {selectedListing.agent_name}</p>
              <button
                onClick={() => openBookAppointment(selectedListing)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AppointmentForm
                mode="user"
                listingId={appointmentListingId ?? undefined}
                realtorName={appointmentContext?.realtorName}
                propertyAddress={appointmentContext?.propertyAddress}
                listings={savedListings.map((s) => ({
                  id: s.listing.id,
                  title: s.listing.title,
                  address: [s.listing.address, s.listing.city, s.listing.state].filter(Boolean).join(', '),
                  realtorName: s.listing.agent_name,
                }))}
                onSubmit={handleAppointmentSubmit}
                onClose={() => { setShowAppointmentForm(false); setAppointmentListingId(null); setAppointmentContext(null); setError(null); }}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserListings;
