'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface ListingCardProps {
  id: string | number;
  title: string;
  price: string | number;
  image: string;
  location?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
}

const ListingCard: React.FC<ListingCardProps> = ({ id, title, price, image, location, beds, baths, sqft }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/listings/${id}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={handleClick}>
      <div className="relative">
        <img src={image} alt={title} className="w-full h-56 object-cover" />
        <span className="absolute top-4 left-4 text-sm px-3 py-1 rounded-full bg-blue-600 text-white font-medium">Featured</span>
        <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 grid place-items-center hover:bg-white transition-colors">
          <span className="text-lg">♡</span>
        </button>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 max-w-[70%] leading-tight">{title}</h3>
          <span className="text-blue-600 font-bold text-lg">Ksh{String(price)}</span>
        </div>
        <p className="text-base text-gray-600 mb-4">{location ?? '—'}</p>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1"><span>🛏️</span><span className="font-medium">{beds ?? '-'} beds</span></span>
          <span className="flex items-center gap-1"><span>🛁</span><span className="font-medium">{baths ?? '-'} baths</span></span>
          <span className="flex items-center gap-1"><span>📐</span><span className="font-medium">{sqft ?? '-'} sqft</span></span>
        </div>
        <button className="mt-5 w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700" onClick={(e) => { e.stopPropagation(); alert('Appointment booking coming soon'); }}>Book Appointment</button>
      </div>
    </div>
  );
};

export default ListingCard;
