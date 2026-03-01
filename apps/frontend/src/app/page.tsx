'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import ListingCard from './components/ListingCard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FilterBar from './components/FilterBar';
import { apiFetch, getApiUrl, getMediaUrl, mapPropertyTypeToApi, parsePriceRange } from './lib/api';
import './global.css';

interface ApiListing {
  id: number;
  title: string;
  property_type: string;
  status: string;
  city: string;
  state: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  agent_name: string;
  primary_image: string | null;
  image_count: number;
  is_saved?: boolean;
  created_at: string;
}

interface ListingsResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: ApiListing[];
}

function buildListingsParams(
  location: string,
  propertyType: string,
  priceRange: string
): string {
  const params = new URLSearchParams();
  if (location?.trim()) params.set('search', location.trim());
  const apiType = mapPropertyTypeToApi(propertyType);
  if (apiType) params.set('property_type', apiType);
  const { min_price, max_price } = parsePriceRange(priceRange);
  if (min_price != null) params.set('min_price', String(min_price));
  if (max_price != null) params.set('max_price', String(max_price));
  params.set('page_size', '24');
  return params.toString();
}

function mapApiListingToCard(listing: ApiListing) {
  const location = [listing.city, listing.state].filter(Boolean).join(', ');
  return {
    id: listing.id,
    title: listing.title,
    price: parseFloat(listing.price),
    image: getMediaUrl(listing.primary_image) || '/luxury-one.webp',
    location: location || '—',
    beds: listing.bedrooms,
    baths: listing.bathrooms,
    sqft: listing.square_feet,
    is_saved: listing.is_saved ?? false,
  };
}

const IndexPage = () => {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const loadListings = useCallback(
    async (nextUrl?: string | null, append = false) => {
      const path = nextUrl
        ? nextUrl.replace(/^.*\/api\/?/, '') || `listings/?${buildListingsParams(location, propertyType, priceRange)}`
        : `listings/?${buildListingsParams(location, propertyType, priceRange)}`;
      const res = await apiFetch<ListingsResponse>(path, { method: 'GET' });
      if (!res.ok) {
        setFetchError(res.error || 'Failed to load listings');
        if (!append) setListings([]);
        return;
      }
      setFetchError(null);
      const data = res.data;
      const results = data?.results ?? (Array.isArray(data) ? data : []);
      const count = data?.count ?? results.length;
      setTotalCount(count);
      setListings((prev) => (append ? [...prev, ...results] : results));
      setNextPage(data?.next ?? null);
    },
    [location, propertyType, priceRange]
  );

  useEffect(() => {
    setListings([]);
    setTotalCount(0);
    setNextPage(null);
    setIsLoading(true);
    loadListings(null, false).finally(() => setIsLoading(false));
  }, [loadListings]);

  const handleSearch = async () => {
    setIsLoading(true);
    setSearchModalOpen(false);
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
    await loadListings(null, false);
    setIsLoading(false);
  };

  const handleLoadMore = async () => {
    if (!nextPage) return;
    setLoadingMore(true);
    await loadListings(nextPage, true);
    setLoadingMore(false);
  };

  const handleSavedChange = (listingId: number, saved: boolean) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, is_saved: saved } : l))
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F9FF]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center lg:items-start">
          <div className="space-y-6 sm:space-y-8 min-w-0 order-2 lg:order-1">
            <div>
              <p className="text-blue-600 font-semibold text-sm sm:text-base uppercase tracking-wide mb-2 sm:mb-3">
                Kenya&apos;s rental marketplace
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Find Your Perfect <span className="text-blue-600">Home</span> In 3 Clicks
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Bedsitters, singles, apartments, and more—all in one place. Search by location, filter by type and price, and book viewings with verified agents.
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Verified listings • Trusted agents • Free to search
              </p>
            </div>
            <div className="mt-6 sm:mt-8">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="w-full sm:w-auto flex items-center gap-3 bg-white border-2 border-gray-300 hover:border-blue-500 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-left shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Open search filters"
              >
                <span className="text-gray-500 text-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>
                <span className="flex-1 text-gray-600 text-sm sm:text-base">
                  {location || propertyType || priceRange
                    ? [location || 'Any location', propertyType || 'Any type', priceRange ? `KES ${priceRange}` : 'Any price'].filter(Boolean).join(' · ')
                    : 'Location, type & price — tap to search'}
                </span>
                <span className="text-blue-600 font-semibold text-sm sm:text-base">Search</span>
              </button>
            </div>
          </div>
          <div className="relative min-w-0 order-1 lg:order-2">
            <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-auto lg:h-[420px] xl:h-[500px] bg-gray-100">
              <Image
                src="/luxury-one.webp"
                alt="Modern luxury apartment with city view"
                width={600}
                height={500}
                className="w-full h-full object-cover"
                priority={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search filters modal */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-modal-title"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 id="search-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900">Search rentals</h2>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="Close search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
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
        </div>
      )}

      {/* Value props */}
      <section className="bg-white border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 text-blue-600 mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Verified Listings</h3>
              <p className="text-gray-600 text-sm sm:text-base">Every property is listed by verified agents. No scams, no fake ads.</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 text-blue-600 mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Book Viewings Easy</h3>
              <p className="text-gray-600 text-sm sm:text-base">Request appointments with one click. Agents respond and you view at your convenience.</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 text-blue-600 mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Search by Location</h3>
              <p className="text-gray-600 text-sm sm:text-base">Filter by city and area. See listings on the map and get directions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12" id="listings">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Available Rentals
        </h2>
        <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl">
          Browse bedsitters, singles, apartments, houses, and land. Use the search above or filter by type below.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="tablist" aria-label="Property type filters">
            <button
              onClick={() => setPropertyType('')}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-blue-600 text-white focus-ring"
              role="tab"
              aria-selected={!propertyType}
              aria-label="Show all property types"
            >
              All Types
            </button>
            <button
              onClick={() => setPropertyType('Bedsitter')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full border focus-ring ${propertyType === 'Bedsitter' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-blue-600'}`}
              role="tab"
              aria-selected="false"
              aria-label="Filter by bedsitter properties"
            >
              Bedsitter
            </button>
            <button
              onClick={() => setPropertyType('Singles')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full border focus-ring ${propertyType === 'Singles' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-blue-600'}`}
              role="tab"
              aria-selected="false"
              aria-label="Filter by single room properties"
            >
              Singles
            </button>
            <button
              onClick={() => setPropertyType('Apartment')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full border focus-ring ${propertyType === 'Apartment' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-blue-600'}`}
              role="tab"
              aria-selected="false"
              aria-label="Filter by apartment properties"
            >
              Apartments
            </button>
            <button
              onClick={() => setPropertyType('Condo')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full border focus-ring ${propertyType === 'Condo' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-blue-600'}`}
              role="tab"
              aria-selected="false"
              aria-label="Filter by condo properties"
            >
              Condos
            </button>
            <button
              onClick={() => setPropertyType('House')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full border focus-ring ${propertyType === 'House' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-blue-600'}`}
              role="tab"
              aria-selected="false"
              aria-label="Filter by house properties"
            >
              Houses
            </button>
            <button
              onClick={() => setPropertyType('Land')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-full border focus-ring ${propertyType === 'Land' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-blue-600'}`}
              role="tab"
              aria-selected="false"
              aria-label="Filter by land"
            >
              Land
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base lg:text-lg text-gray-700">
            <span className="font-medium text-xs sm:text-sm lg:text-base">
              {totalCount} properties found
            </span>
            <select className="bg-white border border-gray-300 rounded-lg px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base font-medium">
              <option>Sort by: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {fetchError}
          </div>
        )}

        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {isLoading ? (
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
            listings.map((listing, index) => {
              const card = mapApiListingToCard(listing);
              return (
                <div
                  key={listing.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ListingCard
                    {...card}
                    onSavedChange={(saved) => handleSavedChange(listing.id, saved)}
                    detailUrl={`/listings/${listing.id}`}
                  />
                </div>
              );
            })
          )}
        </div>

        {nextPage && !isLoading && (
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
        )}
      </section>

      {/* CTA before footer */}
      <section className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to find your home?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Create a free account to save listings, book viewings, and message agents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/register" className="w-full sm:w-auto inline-block px-8 py-3.5 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors text-center">
              Sign up free
            </a>
            <a href="/login" className="w-full sm:w-auto inline-block px-8 py-3.5 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors text-center">
              Sign in
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndexPage;
