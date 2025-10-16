'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';

const ListingDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || '1'; // Fallback for initial load
  const listing = {
    id: id,
    title: 'Cozy Apartment',
    price: '$500/mo',
    image: '/placeholder.jpg',
    description: 'A cozy 1-bedroom apartment in the heart of the city.',
    amenities: ['Wi-Fi', 'Parking', 'Gym'],
    availability: 'Available Now',
  };

  const handleRequestAppointment = () => {
    alert('Login required to book an appointment. Implement auth tomorrow!');
  };

  return (
    <div className="min-h-screen bg-neutral p-4">
      <button
        onClick={() => router.push('/')}
        className="mb-4 bg-gray-200 px-4 py-2 rounded"
      >
        Back to Listings
      </button>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <img src={listing.image} alt={listing.title} className="w-full h-64 object-cover rounded" />
        <h1 className="text-2xl font-bold text-primary mt-4">{listing.title}</h1>
        <p className="text-secondary text-xl mt-2">{listing.price}</p>
        <p className="mt-4">{listing.description}</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Amenities</h3>
          <ul className="list-disc list-inside">
            {listing.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))}
          </ul>
        </div>
        <p className="mt-4">Availability: {listing.availability}</p>
        <button
          onClick={handleRequestAppointment}
          className="mt-6 bg-accent text-white px-4 py-2 rounded"
        >
          Request Appointment
        </button>
      </div>
    </div>
  );
};

export default ListingDetails;
