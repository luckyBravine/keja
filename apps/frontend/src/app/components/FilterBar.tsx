'use client';
import React from 'react';

import { ImLocation } from "react-icons/im";


interface FilterBarProps {
  location: string;
  onLocationChange: (v: string) => void;
  propertyType: string;
  onPropertyTypeChange: (v: string) => void;
  priceRange: string;
  onPriceRangeChange: (v: string) => void;
  onSearch?: () => void;
  isLoading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ location, onLocationChange, propertyType, onPropertyTypeChange, priceRange, onPriceRangeChange, onSearch, isLoading = false }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 min-w-0 sm:min-w-[200px]">
        <span className="text-gray-500 text-base sm:text-lg"><ImLocation /></span>
        <input value={location} onChange={(e) => onLocationChange(e.target.value)} className="outline-none w-full text-sm sm:text-base" placeholder="Location" />
      </div>
      <select value={propertyType} onChange={(e) => onPropertyTypeChange(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-48 text-sm sm:text-base">
        <option value="">Type</option>
        <option value="Bedsitter">Bedsitter</option>
        <option value="Singles">Singles</option>
        <option value="Apartment">Apartment</option>
        <option value="Condo">Condo</option>
      </select>
      <select value={priceRange} onChange={(e) => onPriceRangeChange(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-48 text-sm sm:text-base">
        <option value="">Price Range</option>
        <option value="0-1000">Under 1000</option>
        <option value="1000-2000">1000 - 2000</option>
        <option value="2000-3000">2000 - 3000</option>
        <option value="3000+">3000+</option>
      </select>
      <button 
        onClick={onSearch} 
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Searching...
          </>
        ) : (
          'Search'
        )}
      </button>
    </div>
  );
};

export default FilterBar;


