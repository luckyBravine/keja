'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { getApiUrl, getMediaUrl } from '@/app/lib/api';

const PropertyLocationMap = dynamic(
  () => import('@/app/components/PropertyLocationMap'),
  { ssr: false, loading: () => <div className="rounded-lg bg-gray-100 h-[280px] animate-pulse" /> }
);

const MapWithDirections = dynamic(
  () => import('@/app/components/MapWithDirections'),
  { ssr: false, loading: () => <div className="rounded-lg bg-gray-100 h-[320px] animate-pulse" /> }
);

interface ListingDetail {
  id: number;
  title: string;
  description: string;
  property_type: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
  price: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size: number | null;
  year_built: number | null;
  parking_spaces: number;
  has_garage: boolean;
  has_pool: boolean;
  has_garden: boolean;
  agent_name: string;
  agent_email?: string;
  agent_phone?: string;
  images: Array<{ id: number; image: string; caption?: string; is_primary: boolean; order: number }>;
  created_at: string;
}

function formatAddress(listing: ListingDetail): string {
  const parts = [listing.address, listing.city, listing.state, listing.zip_code].filter(Boolean);
  return parts.join(', ') || listing.city || 'Address not set';
}

const ListingDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directionsOrigin, setDirectionsOrigin] = useState('');
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(getApiUrl(`listings/${id}/`));
        if (!res.ok) {
          if (res.status === 404) setError('Listing not found');
          else setError('Failed to load listing');
          return;
        }
        const data = await res.json();
        setListing(data);
        const primary = data.images?.find((img: { is_primary: boolean }) => img.is_primary) || data.images?.[0];
        setPrimaryImage(primary?.image ? getMediaUrl(primary.image) : null);
      } catch {
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleRequestAppointment = () => {
    router.push('/login?next=' + encodeURIComponent(`/listings/${id}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
          <div className="aspect-video bg-gray-200 rounded-xl mb-8" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-6">{error || 'Listing not found'}</p>
          <Link href="/" className="text-blue-600 font-semibold hover:underline">Back to listings</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const fullAddress = formatAddress(listing);
  const imageUrl = primaryImage || getMediaUrl(listing.images?.[0]?.image) || '/luxury-one.webp';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium mb-6">
          ← Back to listings
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative w-full aspect-video sm:aspect-[2/1] bg-gray-200">
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              unoptimized={imageUrl.startsWith('http')}
            />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <span className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm font-medium capitalize">
                {listing.property_type}
              </span>
              <span className="text-2xl font-bold text-white drop-shadow-md">
                KES {parseFloat(listing.price).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
            <p className="text-gray-600 mb-6">
              {[listing.address, listing.city, listing.state].filter(Boolean).join(', ')}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-8">
              <span>🛏️ {listing.bedrooms} beds</span>
              <span>🛁 {listing.bathrooms} baths</span>
              <span>📐 {listing.square_feet} sq ft</span>
              {listing.lot_size != null && <span>📏 Lot: {listing.lot_size} sq ft</span>}
              {listing.year_built != null && <span>🏠 Built {listing.year_built}</span>}
              {listing.parking_spaces > 0 && <span>🚗 {listing.parking_spaces} parking</span>}
            </div>

            {listing.has_garage || listing.has_pool || listing.has_garden ? (
              <div className="flex flex-wrap gap-2 mb-8">
                {listing.has_garage && <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-sm">Garage</span>}
                {listing.has_pool && <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-sm">Pool</span>}
                {listing.has_garden && <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-sm">Garden</span>}
              </div>
            ) : null}

            {listing.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {listing.agent_name && (
              <div className="mb-8 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Agent</h2>
                <p className="font-medium text-gray-800">{listing.agent_name}</p>
                {listing.agent_email && (
                  <a href={`mailto:${listing.agent_email}`} className="text-blue-600 text-sm hover:underline block mt-1">
                    {listing.agent_email}
                  </a>
                )}
                {listing.agent_phone && (
                  <a href={`tel:${listing.agent_phone}`} className="text-blue-600 text-sm hover:underline block mt-1">
                    {listing.agent_phone}
                  </a>
                )}
              </div>
            )}

            {/* Location map */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📍</span> Location
              </h2>
              <PropertyLocationMap
                latitude={listing.latitude != null ? Number(listing.latitude) : null}
                longitude={listing.longitude != null ? Number(listing.longitude) : null}
                address={fullAddress}
                title={listing.title}
                height="280px"
              />
            </section>

            {/* Get directions */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🔄</span> Get directions
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Enter your starting address to see a driving route to this property.
              </p>
              <MapWithDirections
                origin={directionsOrigin}
                destination={fullAddress}
                onOriginChange={setDirectionsOrigin}
                height="320px"
                showForm={true}
              />
            </section>

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleRequestAppointment}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Request appointment
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ListingDetailPage;
