'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getApiUrl, getAuthHeaders, getMediaUrl } from '@/app/lib/api';

interface ListingCardProps {
  id: string | number;
  title: string;
  price: string | number;
  image: string;
  location?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  is_saved?: boolean;
  onSavedChange?: (saved: boolean) => void;
  /** When provided (e.g. on dashboard), use button instead of Link to login */
  onBookAppointment?: (e: React.MouseEvent) => void;
  /** When provided, clicking the card (except like/CTA) goes to this URL */
  detailUrl?: string;
}

const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  price,
  image,
  location,
  beds,
  baths,
  sqft,
  is_saved: isSavedProp,
  onSavedChange,
  onBookAppointment,
  detailUrl,
}) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(Boolean(isSavedProp));
  const [saving, setSaving] = useState(false);

  const isLoggedIn =
    typeof window !== 'undefined' && !!localStorage.getItem('access_token');

  useEffect(() => {
    if (isSavedProp !== undefined) setIsLiked(isSavedProp);
    else if (!isLoggedIn) {
      const likedListings = JSON.parse(localStorage.getItem('likedListings') || '[]');
      setIsLiked(likedListings.includes(id));
    }
  }, [id, isSavedProp, isLoggedIn]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggedIn) {
      setSaving(true);
      try {
        if (isLiked) {
          const url = getApiUrl(`listings/saved/unsave/?listing_id=${id}`);
          const res = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            setIsLiked(false);
            onSavedChange?.(false);
          }
        } else {
          const url = getApiUrl('listings/saved/');
          const res = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ listing_id: id }),
          });
          if (res.ok) {
            setIsLiked(true);
            onSavedChange?.(true);
          }
        }
      } finally {
        setSaving(false);
      }
      return;
    }

    // Not logged in: remember which listing they want to save, then send to login
    if (isLiked) {
      const likedListings = JSON.parse(localStorage.getItem('likedListings') || '[]');
      const updated = likedListings.filter((listingId: number) => listingId !== id);
      localStorage.setItem('likedListings', JSON.stringify(updated));
      setIsLiked(false);
      return;
    }
    localStorage.setItem('keja_pending_save_listing_id', String(id));
    router.push('/login?next=/dashboard');
  };

  const handleCardClick = () => {
    if (detailUrl) router.push(detailUrl);
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 ${detailUrl ? 'cursor-pointer' : ''}`}
      onClick={detailUrl ? handleCardClick : undefined}
      onKeyDown={detailUrl ? (e) => { if (e.key === 'Enter') handleCardClick(); } : undefined}
      role={detailUrl ? 'button' : undefined}
      tabIndex={detailUrl ? 0 : undefined}
    >
      <div className="relative">
        <Image 
          src={getMediaUrl(image) || image} 
          alt={`${title} property in ${location}`} 
          width={400}
          height={256}
          className="w-full h-48 sm:h-56 md:h-64 object-cover"
        />
        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-blue-600 text-white font-medium">Featured</span>
        <button
          type="button"
          onClick={handleLike}
          disabled={saving}
          className={`absolute top-3 right-3 sm:top-4 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 rounded-full grid place-items-center transition-colors disabled:opacity-70 ${
            isLiked
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/90 hover:bg-white'
          }`}
        >
          <span className={`text-sm sm:text-lg ${isLiked ? '❤️' : '🤍'}`}>
            {isLiked ? '❤️' : '🤍'}
          </span>
        </button>
      </div>
      <div className="p-4 sm:p-5 md:p-6">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 max-w-[70%] leading-tight">{title}</h3>
          <span className="text-blue-600 font-bold text-base sm:text-lg">Ksh{String(price)}</span>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{location ?? '—'}</p>
        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
          <span className="flex items-center gap-1"><span>🛏️</span><span className="font-medium">{beds ?? '-'} beds</span></span>
          <span className="flex items-center gap-1"><span>🛁</span><span className="font-medium">{baths ?? '-'} baths</span></span>
          <span className="flex items-center gap-1"><span>📐</span><span className="font-medium">{sqft ?? '-'} sqft</span></span>
        </div>
        {onBookAppointment ? (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookAppointment(e); }}
            className="mt-4 sm:mt-5 w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors block text-center"
          >
            Book Appointment
          </button>
        ) : (
          <Link href="/login" onClick={(e) => e.stopPropagation()} className="mt-4 sm:mt-5 w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors block text-center">
            Book Appointment
          </Link>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
