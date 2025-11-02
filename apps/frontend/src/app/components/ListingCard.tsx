'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        <Image 
          src={image} 
          alt={`${title} property in ${location}`} 
          width={400}
          height={256}
          className="w-full h-48 sm:h-56 md:h-64 object-cover"
        />
        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-blue-600 text-white font-medium">Featured</span>
        <button 
          onClick={handleLike}
          className={`absolute top-3 right-3 sm:top-4 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 rounded-full grid place-items-center transition-colors ${
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
        <Link href="/login" className="mt-4 sm:mt-5 w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors block text-center">
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default ListingCard;
