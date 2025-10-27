'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const UserListings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'popular' | 'new' | 'bookmarked'>('bookmarked');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const popularListings = [
    { id: 1, image: '/luxury-one.webp', title: 'Bedsitter', address: '123 Main St, Nairobi', price: 'Ksh 50,000', type: 'Bedsitter', beds: '1', baths: '1', sqft: '350', status: 'Available', savedDate: 'Oct 1, 2024', isBookmarked: true, description: 'Beautiful bedsitter with modern amenities in a prime location. Perfect for students or professionals.', realtor: { name: 'John Doe Realtor', phone: '+254 712 345 678', email: 'john.doe@keja.com' } },
    { id: 2, image: '/luxury-one.webp', title: 'Apartment', address: '456 Oak Ave, Westlands', price: 'Ksh 120,000', type: 'Apartment', beds: '2', baths: '2', sqft: '850', status: 'Available', savedDate: 'Oct 3, 2024', isBookmarked: true, description: 'Spacious 2-bedroom apartment with modern kitchen and living area. Located in Westlands.', realtor: { name: 'Jane Smith Realty', phone: '+254 723 456 789', email: 'jane.smith@keja.com' } },
  ];

  const newListings = [
    { id: 3, image: '/luxury-one.webp', title: 'Condo', address: '789 Pine Rd, Karen', price: 'Ksh 200,000', type: 'Condo', beds: '3', baths: '2', sqft: '1200', status: 'Available', savedDate: 'Oct 5, 2024', isBookmarked: false, description: 'Luxury condo with 3 bedrooms and modern amenities. Perfect for families.', realtor: { name: 'Mike Johnson Properties', phone: '+254 734 567 890', email: 'mike.johnson@keja.com' } },
  ];

  const bookmarkedListings = [
    ...popularListings.filter(l => l.isBookmarked),
    ...newListings.filter(l => l.isBookmarked)
  ];

  const displayListings = activeTab === 'popular' ? popularListings : activeTab === 'new' ? newListings : bookmarkedListings;

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'nairobi', label: 'Nairobi' },
    { value: 'mombasa', label: 'Mombasa' },
    { value: 'kisumu', label: 'Kisumu' },
  ];

  const handleViewDetails = (listing: any) => {
    setSelectedListing(listing);
    setShowDetails(true);
  };

  const handleBookAppointment = () => {
    setShowDetails(false);
    router.push('/dashboard/appointments');
  };

  return (
    <>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="mt-2 text-gray-600">Explore available properties in your area.</p>
        </div>

        {/* Filters in One Line */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'popular'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'new'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setActiveTab('bookmarked')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'bookmarked'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bookmarked
            </button>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-2"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Listings */}
          <div className="col-span-2 space-y-4">
            {displayListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden group">
                <div className="grid grid-cols-12">
                  <div className="col-span-5 h-64">
                    <img 
                      src={listing.image} 
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="col-span-7 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.title}</h3>
                        <p className="text-sm text-gray-600">{listing.address}</p>
                      </div>
                      <button className="text-red-500 hover:text-red-600 transition-colors p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>{listing.beds} bed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.53 5.97l3-3 3 3M9 8h6" />
                        </svg>
                        <span>{listing.baths} bath</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span>{listing.sqft} sqft</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{listing.price}</p>
                        <p className="text-xs text-gray-500 mt-1">Saved on {listing.savedDate}</p>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                        listing.status === 'Available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {listing.status}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleViewDetails(listing)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Map */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-[800px]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Map</h2>
              <p className="text-sm text-gray-600 mb-4">Locations of available properties.</p>
              
              {/* Google Maps Embed */}
              <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8905!2d36.821946!3d-1.29206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f109b32c7e22d%3A0x8c83d1a8f8f8f8f8!2sNairobi!5e0!3m2!1sen!2ske!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
              </div>

              {/* Map Legend */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Property Location</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Your Location</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listing Details Modal */}
      {showDetails && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
                <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Property Image */}
              <img 
                src={selectedListing.image} 
                alt={selectedListing.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />

              {/* Property Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedListing.title}</h3>
                  <p className="text-lg text-gray-600">{selectedListing.address}</p>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{selectedListing.beds} bed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.53 5.97l3-3 3 3M9 8h6" />
                    </svg>
                    <span>{selectedListing.baths} bath</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>{selectedListing.sqft} sqft</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">{selectedListing.price}</span>
                  <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${
                    selectedListing.status === 'Available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedListing.status}
                  </span>
                </div>

                <p className="text-gray-700">{selectedListing.description}</p>
              </div>

              {/* Realtor Info */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Realtor</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedListing.realtor.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedListing.realtor.name}</p>
                      <p className="text-sm text-gray-600">{selectedListing.realtor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium">{selectedListing.realtor.phone}</span>
                  </div>
                  <button 
                    onClick={handleBookAppointment}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserListings;