/**
 * Tests for responsive test helper utilities
 * @jest-environment jsdom
 */

import {
  VIEWPORTS,
  BREAKPOINTS,
  setViewport,
  getCurrentBreakpoint,
  assertTouchTargetSize,
  assertNoHorizontalScroll,
  assertResponsiveImage,
  assertViewportMetaTag,
  assertReadableText,
  getInteractiveElements,
} from '../responsive-test-helpers';

describe('Responsive Test Helpers', () => {
  describe('VIEWPORTS', () => {
    it('should have mobile viewport configurations', () => {
      expect(VIEWPORTS.mobile.portrait).toBeDefined();
      expect(VIEWPORTS.mobile.portrait.width).toBe(375);
      expect(VIEWPORTS.mobile.portrait.isMobile).toBe(true);
      expect(VIEWPORTS.mobile.portrait.hasTouch).toBe(true);
    });

    it('should have tablet viewport configurations', () => {
      expect(VIEWPORTS.tablet.portrait).toBeDefined();
      expect(VIEWPORTS.tablet.portrait.width).toBe(768);
      expect(VIEWPORTS.tablet.portrait.isMobile).toBe(true);
    });

    it('should have desktop viewport configurations', () => {
      expect(VIEWPORTS.desktop.standard).toBeDefined();
      expect(VIEWPORTS.desktop.standard.width).toBe(1280);
      expect(VIEWPORTS.desktop.standard.isMobile).toBe(false);
      expect(VIEWPORTS.desktop.standard.hasTouch).toBe(false);
    });
  });

  describe('setViewport', () => {
    it('should set window dimensions', () => {
      setViewport(VIEWPORTS.mobile.portrait);
      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);
    });

    it('should set device pixel ratio', () => {
      setViewport(VIEWPORTS.mobile.portrait);
      expect(window.devicePixelRatio).toBe(2);
    });

    it('should handle desktop viewport', () => {
      setViewport(VIEWPORTS.desktop.standard);
      expect(window.innerWidth).toBe(1280);
      expect(window.innerHeight).toBe(720);
      expect(window.devicePixelRatio).toBe(1);
    });
  });

  describe('getCurrentBreakpoint', () => {
    it('should return xs for widths below 640px', () => {
      expect(getCurrentBreakpoint(320)).toBe('xs');
      expect(getCurrentBreakpoint(639)).toBe('xs');
    });

    it('should return sm for widths 640-767px', () => {
      expect(getCurrentBreakpoint(640)).toBe('sm');
      expect(getCurrentBreakpoint(767)).toBe('sm');
    });

    it('should return md for widths 768-1023px', () => {
      expect(getCurrentBreakpoint(768)).toBe('md');
      expect(getCurrentBreakpoint(1023)).toBe('md');
    });

    it('should return lg for widths 1024-1279px', () => {
      expect(getCurrentBreakpoint(1024)).toBe('lg');
      expect(getCurrentBreakpoint(1279)).toBe('lg');
    });

    it('should return xl for widths 1280-1535px', () => {
      expect(getCurrentBreakpoint(1280)).toBe('xl');
      expect(getCurrentBreakpoint(1535)).toBe('xl');
    });

    it('should return 2xl for widths 1536px and above', () => {
      expect(getCurrentBreakpoint(1536)).toBe('2xl');
      expect(getCurrentBreakpoint(1920)).toBe('2xl');
    });
  });

  describe('assertTouchTargetSize', () => {
    it('should pass for elements meeting minimum size', () => {
      const button = document.createElement('button');
      button.style.width = '48px';
      button.style.height = '48px';
      document.body.appendChild(button);

      // Mock getBoundingClientRect
      button.getBoundingClientRect = jest.fn(() => ({
        width: 48,
        height: 48,
        top: 0,
        left: 0,
        bottom: 48,
        right: 48,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const result = assertTouchTargetSize(button);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('meets minimum size requirement');

      document.body.removeChild(button);
    });

    it('should fail for elements below minimum size', () => {
      const button = document.createElement('button');
      button.style.width = '30px';
      button.style.height = '30px';
      document.body.appendChild(button);

      button.getBoundingClientRect = jest.fn(() => ({
        width: 30,
        height: 30,
        top: 0,
        left: 0,
        bottom: 30,
        right: 30,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const result = assertTouchTargetSize(button);
      expect(result.passed).toBe(false);
      expect(result.message).toContain('too small');
      expect(result.details?.width).toBe(30);
      expect(result.details?.height).toBe(30);

      document.body.removeChild(button);
    });
  });

  describe('assertNoHorizontalScroll', () => {
    it('should pass when no horizontal scroll exists', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'scrollWidth', { value: 1000, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 1000, configurable: true });

      const result = assertNoHorizontalScroll(container);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('No horizontal scroll');
    });

    it('should fail when horizontal scroll exists', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'scrollWidth', { value: 1200, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 1000, configurable: true });

      const result = assertNoHorizontalScroll(container);
      expect(result.passed).toBe(false);
      expect(result.message).toContain('Horizontal scroll detected');
      expect(result.details?.overflow).toBe(200);
    });
  });

  describe('assertResponsiveImage', () => {
    it('should pass for properly configured images', () => {
      const img = document.createElement('img');
      img.srcset = 'image-320.jpg 320w, image-640.jpg 640w';
      img.sizes = '(max-width: 640px) 100vw, 640px';
      img.alt = 'Test image';
      img.loading = 'lazy';

      const result = assertResponsiveImage(img, VIEWPORTS.mobile.portrait);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('properly configured');
    });

    it('should fail for images without srcset', () => {
      const img = document.createElement('img');
      img.src = 'image.jpg';
      img.alt = 'Test image';

      const result = assertResponsiveImage(img, VIEWPORTS.mobile.portrait);
      expect(result.passed).toBe(false);
      expect(result.details?.hasSrcset).toBe(false);
    });

    it('should fail for images without alt text', () => {
      const img = document.createElement('img');
      img.srcset = 'image-320.jpg 320w';

      const result = assertResponsiveImage(img, VIEWPORTS.mobile.portrait);
      expect(result.passed).toBe(false);
      expect(result.details?.hasAlt).toBe(false);
    });
  });

  describe('assertReadableText', () => {
    it('should pass for text meeting minimum font size', () => {
      const div = document.createElement('div');
      div.style.fontSize = '16px';
      document.body.appendChild(div);

      const result = assertReadableText(div, 16);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('readable');

      document.body.removeChild(div);
    });

    it('should fail for text below minimum font size', () => {
      const div = document.createElement('div');
      div.style.fontSize = '12px';
      document.body.appendChild(div);

      const result = assertReadableText(div, 16);
      expect(result.passed).toBe(false);
      expect(result.message).toContain('too small');

      document.body.removeChild(div);
    });
  });

  describe('getInteractiveElements', () => {
    it('should find all interactive elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button</button>
        <a href="#">Link</a>
        <input type="text" />
        <select></select>
        <textarea></textarea>
      `;
      document.body.appendChild(container);

      const elements = getInteractiveElements(container);
      expect(elements.length).toBe(5);

      document.body.removeChild(container);
    });

    it('should exclude hidden inputs', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <input type="text" />
        <input type="hidden" />
      `;
      document.body.appendChild(container);

      const elements = getInteractiveElements(container);
      expect(elements.length).toBe(1);

      document.body.removeChild(container);
    });
  });

  describe('BREAKPOINTS', () => {
    it('should have correct Tailwind breakpoint values', () => {
      expect(BREAKPOINTS.sm).toBe(640);
      expect(BREAKPOINTS.md).toBe(768);
      expect(BREAKPOINTS.lg).toBe(1024);
      expect(BREAKPOINTS.xl).toBe(1280);
      expect(BREAKPOINTS['2xl']).toBe(1536);
    });
  });
});
