import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import ListingCard from '../ListingCard';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
});

const mockListing = {
  id: 1,
  title: 'Modern Apartment',
  price: 50000,
  image: '/test-image.jpg',
  location: 'Nairobi, Kenya',
  beds: 2,
  baths: 1,
  sqft: 800,
};

describe('ListingCard', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders listing information correctly', () => {
    render(<ListingCard {...mockListing} />);
    
    expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
    expect(screen.getByText('Ksh50000')).toBeInTheDocument();
    expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
    expect(screen.getByText('2 beds')).toBeInTheDocument();
    expect(screen.getByText('1 baths')).toBeInTheDocument();
    expect(screen.getByText('800 sqft')).toBeInTheDocument();
  });

  it('displays featured badge', () => {
    render(<ListingCard {...mockListing} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('handles like functionality', async () => {
    render(<ListingCard {...mockListing} />);
    
    const likeButton = screen.getByRole('button', { name: /🤍/ });
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    // Check if listing data is stored in localStorage
    const storedData = JSON.parse(localStorage.getItem('likedListingsData') || '[]');
    expect(storedData).toHaveLength(1);
    expect(storedData[0].id).toBe(1);
  });

  it('shows book appointment button', () => {
    render(<ListingCard {...mockListing} />);
    
    const bookButton = screen.getByRole('link', { name: /book appointment/i });
    expect(bookButton).toHaveAttribute('href', '/login');
  });

  it('handles missing optional props gracefully', () => {
    const minimalListing = {
      id: 1,
      title: 'Basic Listing',
      price: 30000,
      image: '/test.jpg',
    };

    render(<ListingCard {...minimalListing} />);
    
    expect(screen.getByText('Basic Listing')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument(); // location fallback
    expect(screen.getByText('- beds')).toBeInTheDocument(); // beds fallback
  });
});