'use client';
import React from 'react';
import Image from 'next/image';
import ListingCard from './components/ListingCard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FilterBar from './components/FilterBar';
import './global.css';


const IndexPage = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  
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

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    // Simulate loading more properties
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingMore(false);
  };

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
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src="/luxury-one.webp" 
                alt="Modern luxury apartment with city view" 
                width={600}
                height={500}
                className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover"
                priority={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Available Rentals header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Available Rentals</h2>
        <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="tablist" aria-label="Property type filters">
            <button 
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-blue-600 text-white focus-ring"
              role="tab"
              aria-selected="true"
              aria-label="Show all property types"
            >
              All Types
            </button>
            <button 
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-white border border-gray-300 hover:border-blue-600 focus-ring"
              role="tab"
              aria-selected="false"
              aria-label="Filter by bedsitter properties"
            >
              Bedsitter
            </button>
            <button 
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-white border border-gray-300 hover:border-blue-600 focus-ring"
              role="tab"
              aria-selected="false"
              aria-label="Filter by single room properties"
            >
              Singles
            </button>
            <button 
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-white border border-gray-300 hover:border-blue-600 focus-ring"
              role="tab"
              aria-selected="false"
              aria-label="Filter by apartment properties"
            >
              Apartments
            </button>
            <button 
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-white border border-gray-300 hover:border-blue-600 focus-ring"
              role="tab"
              aria-selected="false"
              aria-label="Filter by condo properties"
            >
              Condos
            </button>
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
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
              <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-300"></div>
              <div className="p-4 sm:p-5 md:p-6">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-3 sm:mb-4"></div>
                <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-5">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          listings.map((listing, index) => (
            <div 
              key={listing.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ListingCard {...listing} />
            </div>
          ))
        )}
      </div>

        <div className="flex justify-center mt-8 sm:mt-12">
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Loading More...
              </>
            ) : (
              'Load More Properties'
            )}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndexPage;
