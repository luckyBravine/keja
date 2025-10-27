'use client';
import React from 'react';
import ListingCard from './components/ListingCard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FilterBar from './components/FilterBar';
import './global.css';


const IndexPage = () => {
  const allListings = Array.from({ length: 12 }, (_, i) => {
    const types = ['Bedsitter', 'Singles', 'Apartment', 'Condo'];
    const locations = ['Kibera, Nairobi', 'Kitengela, Kajiado', 'Mlolongo, Machakos'];
    const type = types[i % types.length];
    const location = locations[i % locations.length];
    return {
    id: i + 1,
      title: type, // use type as title
      price: 5000 + i * 500, // numeric Ksh for filtering/formatting
      currency: 'Ksh',
    image: '/luxury-one.webp',
      type,
      location,
      beds: (i % 4) + 1,
      baths: (i % 3) + 1,
      sqft: 800 + i * 50,
    };
  });

  const [location, setLocation] = React.useState('');
  const [propertyType, setPropertyType] = React.useState('');
  const [priceRange, setPriceRange] = React.useState('');

  const filterByControls = React.useCallback(() => {
    return allListings.filter((l) => {
      const matchLocation = location ? l.location.toLowerCase().includes(location.toLowerCase()) : true;
      const matchType = propertyType ? l.type === propertyType : true;
      const matchPrice = (() => {
        if (!priceRange) return true;
        if (priceRange === '3000+') return l.price >= 3000;
        const [minStr, maxStr] = priceRange.split('-');
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        return l.price >= min && l.price <= max;
      })();
      return matchLocation && matchType && matchPrice;
    });
  }, [allListings, location, propertyType, priceRange]);

  const listings = filterByControls();

  return (
    <div className="min-h-screen bg-[#F6F9FF]">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8">
        <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Find Your Perfect Home <span className="text-blue-600">In 3 Clicks</span> 
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Discover thousands of verified rental properties in your desired location with our advanced search platform.
              </p>
        </div>
            <div className="mt-6 sm:mt-8">
              <FilterBar
                location={location}
                onLocationChange={setLocation}
                propertyType={propertyType}
                onPropertyTypeChange={setPropertyType}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                onSearch={() => { /* already filters live; could trigger analytics */ }}
              />
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src="/luxury-one.webp" alt="hero" className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Available Rentals header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Available Rentals</h2>
        <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-blue-600 text-white">All Types</button>
            <button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-white border border-gray-300 hover:border-blue-600">Bedsitter</button>
            <button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-white border border-gray-300 hover:border-blue-600">Singles</button>
            <button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-white border border-gray-300 hover:border-blue-600">Apartments</button>
            <button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-white border border-gray-300 hover:border-blue-600">Condos</button>
      </div>
          <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base lg:text-lg text-gray-700">
            <span className="font-medium text-xs sm:text-sm lg:text-base">1,247 properties found</span>
            <select className="bg-white border border-gray-300 rounded-lg px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base font-medium">
              <option>Sort by: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
      </div>

      {/* Listings Grid */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {listings.map((listing) => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>

        <div className="flex justify-center mt-8 sm:mt-12">
          <button className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">Load More Properties</button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndexPage;
