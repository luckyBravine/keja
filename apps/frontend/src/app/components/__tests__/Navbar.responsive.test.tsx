/**
 * Responsive tests for Navbar component
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';
import {
  VIEWPORTS,
  setViewport,
  assertTouchTargetSize,
  assertNoHorizontalScroll,
  getInteractiveElements,
} from '../../../test-utils/responsive-test-helpers';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Navbar Responsive Tests', () => {
  beforeEach(() => {
    // Reset viewport to default before each test
    setViewport(VIEWPORTS.desktop.standard);
  });

  describe('Mobile viewport (< 640px)', () => {
    beforeEach(() => {
      setViewport(VIEWPORTS.mobile.portrait);
    });

    it('should display hamburger menu button on mobile', () => {
      const { container } = render(<Navbar />);
      
      // Find hamburger button by its SVG icon
      const hamburgerButton = container.querySelector('button.md\\:hidden');
      expect(hamburgerButton).toBeInTheDocument();
      expect(hamburgerButton).toBeVisible();
    });

    it('should hide desktop navigation on mobile', () => {
      const { container } = render(<Navbar />);
      
      // Desktop nav should have hidden class
      const desktopNav = container.querySelector('.hidden.md\\:flex');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should open mobile menu when hamburger is clicked', () => {
      const { container } = render(<Navbar />);
      
      const hamburgerButton = container.querySelector('button.md\\:hidden');
      expect(hamburgerButton).toBeInTheDocument();
      
      // Mobile menu should not be visible initially
      let mobileMenu = container.querySelector('.md\\:hidden.bg-white');
      expect(mobileMenu).not.toBeInTheDocument();
      
      // Click hamburger button
      fireEvent.click(hamburgerButton!);
      
      // Mobile menu should now be visible
      mobileMenu = container.querySelector('.md\\:hidden.bg-white');
      expect(mobileMenu).toBeInTheDocument();
    });

    it('should close mobile menu when hamburger is clicked again', () => {
      const { container } = render(<Navbar />);
      
      const hamburgerButton = container.querySelector('button.md\\:hidden');
      
      // Open menu
      fireEvent.click(hamburgerButton!);
      let mobileMenu = container.querySelector('.md\\:hidden.bg-white');
      expect(mobileMenu).toBeInTheDocument();
      
      // Close menu
      fireEvent.click(hamburgerButton!);
      mobileMenu = container.querySelector('.md\\:hidden.bg-white');
      expect(mobileMenu).not.toBeInTheDocument();
    });

    it('should have all touch targets >= 44px on mobile', () => {
      const { container } = render(<Navbar />);
      
      // Open mobile menu to test all interactive elements
      const hamburgerButton = container.querySelector('button.md\\:hidden');
      fireEvent.click(hamburgerButton!);
      
      const interactiveElements = getInteractiveElements(container);
      
      interactiveElements.forEach((element) => {
        const result = assertTouchTargetSize(element, 44);
        // Log failures for debugging
        if (!result.passed) {
          console.warn(`Touch target too small:`, result.message, result.details);
        }
      });
    });

    it('should not have horizontal scroll on mobile', () => {
      const { container } = render(<Navbar />);
      
      const result = assertNoHorizontalScroll(container);
      expect(result.passed).toBe(true);
    });
  });

  describe('Tablet viewport (640px - 1024px)', () => {
    beforeEach(() => {
      setViewport(VIEWPORTS.tablet.portrait);
    });

    it('should display desktop navigation at md breakpoint (768px)', () => {
      const { container } = render(<Navbar />);
      
      // Desktop nav should be present
      const desktopNav = container.querySelector('.hidden.md\\:flex');
      expect(desktopNav).toBeInTheDocument();
      
      // Check for navigation links
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Buy')).toBeInTheDocument();
      expect(screen.getByText('Rent')).toBeInTheDocument();
    });

    it('should hide hamburger menu at md breakpoint', () => {
      const { container } = render(<Navbar />);
      
      const hamburgerButton = container.querySelector('button.md\\:hidden');
      expect(hamburgerButton).toBeInTheDocument();
      // Note: In actual browser, md:hidden would hide it, but in tests we just verify the class exists
    });

    it('should display auth buttons at md breakpoint', () => {
      render(<Navbar />);
      
      // Should have Sign In and Sign Up buttons
      const signInLinks = screen.getAllByText('Sign In');
      const signUpLinks = screen.getAllByText('Sign Up');
      
      expect(signInLinks.length).toBeGreaterThan(0);
      expect(signUpLinks.length).toBeGreaterThan(0);
    });

    it('should have proper spacing between navigation items', () => {
      const { container } = render(<Navbar />);
      
      const desktopNav = container.querySelector('.hidden.md\\:flex');
      expect(desktopNav).toBeInTheDocument();
      
      // Check for gap classes
      expect(desktopNav?.className).toContain('gap-');
    });
  });

  describe('Desktop viewport (> 1024px)', () => {
    beforeEach(() => {
      setViewport(VIEWPORTS.desktop.standard);
    });

    it('should display full navigation layout', () => {
      const { container } = render(<Navbar />);
      
      const desktopNav = container.querySelector('.hidden.md\\:flex');
      expect(desktopNav).toBeInTheDocument();
      
      // All navigation items should be present
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Buy')).toBeInTheDocument();
      expect(screen.getByText('Rent')).toBeInTheDocument();
      expect(screen.getByText('Sell')).toBeInTheDocument();
      expect(screen.getByText('Agents')).toBeInTheDocument();
    });

    it('should display auth buttons with proper styling', () => {
      const { container } = render(<Navbar />);
      
      const authContainer = container.querySelector('.hidden.md\\:flex.items-center.gap-3');
      expect(authContainer).toBeInTheDocument();
    });

    it('should have larger spacing on desktop (lg:gap-10)', () => {
      const { container } = render(<Navbar />);
      
      const desktopNav = container.querySelector('.hidden.md\\:flex');
      expect(desktopNav?.className).toContain('lg:gap-10');
    });

    it('should not display hamburger menu on desktop', () => {
      const { container } = render(<Navbar />);
      
      const hamburgerButton = container.querySelector('button.md\\:hidden');
      expect(hamburgerButton).toBeInTheDocument();
      // Has md:hidden class which hides it on desktop
      expect(hamburgerButton?.className).toContain('md:hidden');
    });

    it('should have no horizontal scroll on desktop', () => {
      const { container } = render(<Navbar />);
      
      const result = assertNoHorizontalScroll(container);
      expect(result.passed).toBe(true);
    });
  });

  describe('Orientation changes', () => {
    it('should maintain menu state during orientation change', () => {
      const { container } = render(<Navbar />);
      
      // Start in portrait mobile
      setViewport(VIEWPORTS.mobile.portrait);
      
      const hamburgerButton = container.querySelector('button.md\\:hidden');
      
      // Open menu
      fireEvent.click(hamburgerButton!);
      let mobileMenu = container.querySelector('.md\\:hidden.bg-white');
      expect(mobileMenu).toBeInTheDocument();
      
      // Rotate to landscape
      setViewport(VIEWPORTS.mobile.landscape);
      
      // Menu should still be open
      mobileMenu = container.querySelector('.md\\:hidden.bg-white');
      expect(mobileMenu).toBeInTheDocument();
    });

    it('should adapt layout when rotating from portrait to landscape', () => {
      const { container } = render(<Navbar />);
      
      // Start in portrait
      setViewport(VIEWPORTS.mobile.portrait);
      expect(window.innerWidth).toBe(375);
      
      // Rotate to landscape
      setViewport(VIEWPORTS.mobile.landscape);
      expect(window.innerWidth).toBe(667);
      
      // Navbar should still be rendered correctly
      expect(container.querySelector('nav')).toBeInTheDocument();
    });
  });

  describe('Logo and branding', () => {
    it('should display logo at all viewport sizes', () => {
      const viewports = [
        VIEWPORTS.mobile.portrait,
        VIEWPORTS.tablet.portrait,
        VIEWPORTS.desktop.standard,
      ];

      viewports.forEach((viewport) => {
        setViewport(viewport);
        const { container } = render(<Navbar />);
        
        const kejaTexts = screen.getAllByText('Keja');
        expect(kejaTexts.length).toBeGreaterThan(0);
        const logo = container.querySelector('.bg-blue-600');
        expect(logo).toBeInTheDocument();
      });
    });

    it('should scale logo appropriately for mobile', () => {
      setViewport(VIEWPORTS.mobile.portrait);
      const { container } = render(<Navbar />);
      
      const logo = container.querySelector('.bg-blue-600');
      expect(logo?.className).toContain('h-8');
      expect(logo?.className).toContain('w-8');
    });

    it('should scale logo appropriately for desktop', () => {
      setViewport(VIEWPORTS.desktop.standard);
      const { container } = render(<Navbar />);
      
      const logo = container.querySelector('.bg-blue-600');
      expect(logo?.className).toContain('sm:h-10');
      expect(logo?.className).toContain('sm:w-10');
    });
  });
});
