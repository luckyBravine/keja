'use client';
import React, { useState } from 'react';
import ListingCard from './components/ListingCard';
import './global.css';


const IndexPage = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const listings = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Property ${i + 1}`,
    price: `Ksh${(5000 + i * 200).toFixed(2)}/mo`,
    image: '/luxury-one.webp',
    // image: i % 2 === 0 ? '/bedsitter-one.webp' : '/luxury-one.webp',// Use imported images as string URLs
  }));

  return (
    <div className="min-h-screen bg-neutral">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-primary text-white">
        <div className="text-2xl font-bold">Keja</div>
        <div>
          <button className="mr-4">Login</button>
          <button className="bg-accent text-white px-4 py-2 rounded">Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="text-center py-12 bg-gray-100">
        <h1 className="text-4xl font-bold text-primary">Find Your Perfect Home</h1>
        <div className="mt-4 flex justify-center">
          <input
            type="text"
            placeholder="Search by location or keyword..."
            className="p-2 w-1/2 border rounded"
          />
          <button className="ml-2 bg-secondary text-white px-4 py-2 rounded">Search</button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
        {filtersOpen && (
          <div className="mt-2 space-x-4">
            <select className="p-2 border rounded">
              <option>Price: Any</option>
              <option>Ksh0 - Ksh5000</option>
              <option>Ksh5000 - Ksh10000</option>
            </select>
            <select className="p-2 border rounded">
              <option>Type: Any</option>
              <option>Apartment</option>
              <option>House</option>
            </select>
          </div>
        )}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
    </div>
  );
};

export default IndexPage;
