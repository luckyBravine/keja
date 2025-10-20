'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [isLiked, setIsLiked] = useState(false);

  // Check if this listing is already liked on component mount
  useEffect(() => {
    const likedListings = JSON.parse(localStorage.getItem('likedListings') || '[]');
    setIsLiked(likedListings.includes(id));
  }, [id]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get current liked listings
    const likedListings = JSON.parse(localStorage.getItem('likedListings') || '[]');
    
    if (isLiked) {
      // Remove from likes
      const updatedLikes = likedListings.filter((listingId: number) => listingId !== id);
      localStorage.setItem('likedListings', JSON.stringify(updatedLikes));
      setIsLiked(false);
    } else {
      // Add to likes and store listing data for dashboard
      const listingData = {
        id,
        title,
        price,
        image,
        location,
        beds,
        baths,
        sqft,
        likedAt: new Date().toISOString()
      };
      
      // Store the liked listing data
      const likedListingsData = JSON.parse(localStorage.getItem('likedListingsData') || '[]');
      likedListingsData.push(listingData);
      localStorage.setItem('likedListingsData', JSON.stringify(likedListingsData));
      
      // Update likes array
      likedListings.push(id);
      localStorage.setItem('likedListings', JSON.stringify(likedListings));
      setIsLiked(true);
      
      // Redirect to login with the liked listing info
      localStorage.setItem('pendingLike', JSON.stringify(listingData));
      router.push('/login');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative">
        <img src={image} alt={title} className="w-full h-56 object-cover" />
        <span className="absolute top-4 left-4 text-sm px-3 py-1 rounded-full bg-blue-600 text-white font-medium">Featured</span>
        <button 
          onClick={handleLike}
          className={`absolute top-4 right-4 h-10 w-10 rounded-full grid place-items-center transition-colors ${
            isLiked 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white/90 hover:bg-white'
          }`}
        >
          <span className={`text-lg ${isLiked ? '❤️' : '🤍'}`}>
            {isLiked ? '❤️' : '🤍'}
          </span>
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
        <Link href="/login" className="mt-5 w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center">
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default ListingCard;
