'use client';
import React from 'react';

interface FilterBarProps {
  location: string;
  onLocationChange: (v: string) => void;
  propertyType: string;
  onPropertyTypeChange: (v: string) => void;
  priceRange: string;
  onPriceRangeChange: (v: string) => void;
  onSearch?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ location, onLocationChange, propertyType, onPropertyTypeChange, priceRange, onPriceRangeChange, onSearch }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4">
      <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 min-w-[200px]">
        <span className="text-gray-500 text-lg">📍</span>
        <input value={location} onChange={(e) => onLocationChange(e.target.value)} className="outline-none w-full text-base" placeholder="Location" />
      </div>
      <select value={propertyType} onChange={(e) => onPropertyTypeChange(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-4 py-3 w-56 text-base">
        <option value="">Type</option>
        <option value="Bedsitter">Bedsitter</option>
        <option value="Singles">Singles</option>
        <option value="Apartment">Apartment</option>
        <option value="Condo">Condo</option>
      </select>
      <select value={priceRange} onChange={(e) => onPriceRangeChange(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-4 py-3 w-48 text-base">
        <option value="">Price Range</option>
        <option value="0-1000">Under 1000</option>
        <option value="1000-2000">1000 - 2000</option>
        <option value="2000-3000">2000 - 3000</option>
        <option value="3000+">3000+</option>
      </select>
      <button onClick={onSearch} className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors">Search</button>
    </div>
  );
};

export default FilterBar;


