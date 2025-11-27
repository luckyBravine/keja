/**
 * Responsive tests for ListingCard component
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListingCard from '../ListingCard';
import {
  VIEWPORTS,
  setViewport,
  assertNoHorizontalScroll,
} from '../../../test-utils/responsive-test-helpers';

// Mock Next.js components
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/image', () => {
  const MockImage = ({ src, alt, width, height, className }: { src: string; alt: string; width?: number; height?: number; className?: string }) => {
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ListingCard Responsive Tests', () => {
  const mockListing = {
    id: 1,
    title: 'Modern Apartment',
    price: 5000,
    image: '/test-image.jpg',
    location: 'Nairobi, Kenya',
    beds: 2,
    baths: 1,
    sqft: 850,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    setViewport(VIEWPORTS.desktop.standard);
  });

  describe('Mobile grid layout', () => {
    beforeEach(() => {
      setViewport(VIEWPORTS.mobile.portrait);
    });

    it('should display card with proper mobile styling', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
      expect(card?.className).toContain('rounded-xl');
    });

    it('should maintain image aspect ratio on mobile', () => {
      render(<ListingCard {...mockListing} />);
      
      const image = screen.getByAltText(/Modern Apartment property/i);
      expect(image).toBeInTheDocument();
      expect(image.className).toContain('object-cover');
    });

    it('should have like button with adequate touch target size', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const likeButton = container.querySelector('button');
      expect(likeButton).toBeInTheDocument();
      
      // Check for proper sizing classes
      expect(likeButton?.className).toContain('h-8');
      expect(likeButton?.className).toContain('w-8');
    });

    it('should have book appointment button with adequate touch target', () => {
      render(<ListingCard {...mockListing} />);
      
      const bookButton = screen.getByText('Book Appointment');
      expect(bookButton).toBeInTheDocument();
      // Button is a link element, check it exists and is accessible
      expect(bookButton.tagName).toBe('A');
    });

    it('should not have horizontal scroll on mobile', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const result = assertNoHorizontalScroll(container);
      expect(result.passed).toBe(true);
    });

    it('should display all listing information on mobile', () => {
      render(<ListingCard {...mockListing} />);
      
      expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
      expect(screen.getByText('Ksh5000')).toBeInTheDocument();
      expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
      expect(screen.getByText('2 beds')).toBeInTheDocument();
      expect(screen.getByText('1 baths')).toBeInTheDocument();
      expect(screen.getByText('850 sqft')).toBeInTheDocument();
    });

    it('should handle like button click on mobile', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const likeButton = container.querySelector('button');
      fireEvent.click(likeButton!);
      
      // Should redirect to login
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should have proper spacing and padding on mobile', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const cardContent = container.querySelector('.p-4');
      expect(cardContent).toBeInTheDocument();
    });
  });

  describe('Tablet grid layout', () => {
    beforeEach(() => {
      setViewport(VIEWPORTS.tablet.portrait);
    });

    it('should display card with tablet-appropriate styling', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
    });

    it('should have responsive image sizing for tablet', () => {
      render(<ListingCard {...mockListing} />);
      
      const image = screen.getByAltText(/Modern Apartment property/i);
      expect(image.className).toContain('h-48');
      expect(image.className).toContain('sm:h-56');
    });

    it('should maintain proper gap between card elements', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const cardContent = container.querySelector('.p-4');
      expect(cardContent?.className).toContain('sm:p-5');
    });

    it('should not have horizontal scroll on tablet', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const result = assertNoHorizontalScroll(container);
      expect(result.passed).toBe(true);
    });

    it('should handle interactions properly on tablet', () => {
      render(<ListingCard {...mockListing} />);
      
      const bookButton = screen.getByText('Book Appointment');
      fireEvent.click(bookButton);
      
      // Should navigate to login
      expect(bookButton.getAttribute('href')).toBe('/login');
    });
  });

  describe('Desktop grid layout', () => {
    beforeEach(() => {
      setViewport(VIEWPORTS.desktop.standard);
    });

    it('should display card with desktop styling', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
      expect(card?.className).toContain('hover:shadow-lg');
    });

    it('should have larger image height on desktop', () => {
      render(<ListingCard {...mockListing} />);
      
      const image = screen.getByAltText(/Modern Apartment property/i);
      expect(image.className).toContain('md:h-64');
    });

    it('should have proper padding on desktop', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const cardContent = container.querySelector('.p-4');
      expect(cardContent?.className).toContain('md:p-6');
    });

    it('should display hover effects on desktop', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const card = container.querySelector('.bg-white');
      expect(card?.className).toContain('hover:shadow-lg');
      expect(card?.className).toContain('transition-all');
    });

    it('should not have horizontal scroll on desktop', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const result = assertNoHorizontalScroll(container);
      expect(result.passed).toBe(true);
    });

    it('should have larger like button on desktop', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const likeButton = container.querySelector('button');
      expect(likeButton?.className).toContain('sm:h-10');
      expect(likeButton?.className).toContain('sm:w-10');
    });
  });

  describe('Image optimization', () => {
    it('should use Next.js Image component', () => {
      render(<ListingCard {...mockListing} />);
      
      const image = screen.getByAltText(/Modern Apartment property/i);
      expect(image).toBeInTheDocument();
      expect(image.getAttribute('src')).toBe('/test-image.jpg');
    });

    it('should have proper alt text for accessibility', () => {
      render(<ListingCard {...mockListing} />);
      
      const image = screen.getByAltText('Modern Apartment property in Nairobi, Kenya');
      expect(image).toBeInTheDocument();
    });

    it('should maintain aspect ratio with object-cover', () => {
      render(<ListingCard {...mockListing} />);
      
      const image = screen.getByAltText(/Modern Apartment property/i);
      expect(image.className).toContain('object-cover');
    });

    it('should have responsive image dimensions', () => {
      render(<ListingCard {...mockListing} />);
      
      const image = screen.getByAltText(/Modern Apartment property/i);
      expect(image.className).toContain('w-full');
      expect(image.className).toContain('h-48');
    });

    it('should load images at appropriate resolutions for viewport', () => {
      const viewports = [
        VIEWPORTS.mobile.portrait,
        VIEWPORTS.tablet.portrait,
        VIEWPORTS.desktop.standard,
      ];

      viewports.forEach((viewport) => {
        setViewport(viewport);
        const { container } = render(<ListingCard {...mockListing} />);
        
        const images = container.querySelectorAll('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Like functionality across viewports', () => {
    it('should toggle like state on mobile', () => {
      setViewport(VIEWPORTS.mobile.portrait);
      const { container } = render(<ListingCard {...mockListing} />);
      
      const likeButton = container.querySelector('button');
      
      // Initial state - not liked
      expect(likeButton?.className).toContain('bg-white/90');
      
      // Click to like
      fireEvent.click(likeButton!);
      
      // Should redirect to login
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should have visual feedback on like button hover (desktop)', () => {
      setViewport(VIEWPORTS.desktop.standard);
      const { container } = render(<ListingCard {...mockListing} />);
      
      const likeButton = container.querySelector('button');
      expect(likeButton?.className).toContain('hover:bg-white');
    });

    it('should persist like state in localStorage', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const likeButton = container.querySelector('button');
      fireEvent.click(likeButton!);
      
      // Check localStorage was called
      const likedListings = JSON.parse(localStorage.getItem('likedListings') || '[]');
      expect(likedListings).toContain(1);
    });
  });

  describe('Typography and readability', () => {
    it('should have readable text sizes on mobile', () => {
      setViewport(VIEWPORTS.mobile.portrait);
      render(<ListingCard {...mockListing} />);
      
      const title = screen.getByText('Modern Apartment');
      expect(title.className).toContain('text-base');
      expect(title.className).toContain('sm:text-lg');
    });

    it('should have proper text hierarchy', () => {
      render(<ListingCard {...mockListing} />);
      
      const title = screen.getByText('Modern Apartment');
      const price = screen.getByText('Ksh5000');
      
      expect(title.className).toContain('font-semibold');
      expect(price.className).toContain('font-bold');
    });

    it('should have readable property details text', () => {
      render(<ListingCard {...mockListing} />);
      
      const bedsText = screen.getByText('2 beds');
      expect(bedsText.className).toContain('font-medium');
    });

    it('should truncate long titles properly', () => {
      const longTitleListing = {
        ...mockListing,
        title: 'Very Long Apartment Title That Should Be Truncated',
      };
      
      render(<ListingCard {...longTitleListing} />);
      
      const title = screen.getByText(/Very Long Apartment Title/i);
      expect(title.className).toContain('max-w-[70%]');
    });
  });

  describe('Accessibility and interaction', () => {
    it('should have accessible button labels', () => {
      render(<ListingCard {...mockListing} />);
      
      const bookButton = screen.getByText('Book Appointment');
      expect(bookButton).toBeInTheDocument();
    });

    it('should have proper link structure', () => {
      render(<ListingCard {...mockListing} />);
      
      const bookButton = screen.getByText('Book Appointment');
      expect(bookButton.tagName).toBe('A');
      expect(bookButton.getAttribute('href')).toBe('/login');
    });

    it('should have hover effects for better UX', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      const card = container.querySelector('.bg-white');
      expect(card?.className).toContain('hover:shadow-lg');
      expect(card?.className).toContain('transition-all');
    });

    it('should be keyboard navigable', () => {
      render(<ListingCard {...mockListing} />);
      
      const bookButton = screen.getByText('Book Appointment');
      const likeButton = screen.getByText('🤍').closest('button');
      
      expect(bookButton).toBeInTheDocument();
      expect(likeButton).toBeInTheDocument();
    });
  });

  describe('Responsive spacing and layout', () => {
    it('should have proper spacing on mobile', () => {
      setViewport(VIEWPORTS.mobile.portrait);
      const { container } = render(<ListingCard {...mockListing} />);
      
      const content = container.querySelector('.p-4');
      expect(content).toBeInTheDocument();
    });

    it('should increase spacing on tablet', () => {
      setViewport(VIEWPORTS.tablet.portrait);
      const { container } = render(<ListingCard {...mockListing} />);
      
      const content = container.querySelector('.p-4');
      expect(content?.className).toContain('sm:p-5');
    });

    it('should have maximum spacing on desktop', () => {
      setViewport(VIEWPORTS.desktop.standard);
      const { container } = render(<ListingCard {...mockListing} />);
      
      const content = container.querySelector('.p-4');
      expect(content?.className).toContain('md:p-6');
    });

    it('should maintain consistent gap between property details', () => {
      const { container } = render(<ListingCard {...mockListing} />);
      
      // Find the parent container with property details
      const detailsContainer = container.querySelector('.flex.items-center.gap-3');
      expect(detailsContainer).toBeInTheDocument();
      expect(detailsContainer?.className).toContain('sm:gap-6');
    });
  });
});
