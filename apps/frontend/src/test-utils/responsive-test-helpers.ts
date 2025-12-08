/**
 * Responsive Testing Utilities
 * 
 * This module provides utilities for testing responsive behavior across different
 * viewport sizes and device configurations.
 */

export interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  isLandscape: boolean;
}

export interface ResponsiveTestOptions {
  viewport: ViewportConfig;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface AssertionResult {
  passed: boolean;
  message: string;
  details?: Record<string, any>;
}

/**
 * Predefined viewport configurations for common device sizes
 */
export const VIEWPORTS = {
  mobile: {
    portrait: {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    landscape: {
      width: 667,
      height: 375,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true,
    },
    small: {
      width: 320,
      height: 568,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    large: {
      width: 414,
      height: 896,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  tablet: {
    portrait: {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    landscape: {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true,
    },
    ipadPro: {
      width: 1024,
      height: 1366,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  desktop: {
    standard: {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
    large: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
    ultrawide: {
      width: 2560,
      height: 1440,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
  },
} as const;

/**
 * Tailwind breakpoints for reference
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Set the viewport size for testing
 * @param config - Viewport configuration
 */
export function setViewport(config: ViewportConfig): void {
  // Set window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: config.width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: config.height,
  });

  // Set device pixel ratio
  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    configurable: true,
    value: config.deviceScaleFactor,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Get the current Tailwind breakpoint based on viewport width
 * @param width - Viewport width in pixels
 * @returns Current breakpoint name
 */
export function getCurrentBreakpoint(width: number): keyof typeof BREAKPOINTS | 'xs' {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Assert that an element meets minimum touch target size requirements
 * @param element - HTML element to check
 * @param minSize - Minimum size in pixels (default: 44)
 * @returns Assertion result
 */
export function assertTouchTargetSize(
  element: HTMLElement,
  minSize: number = 44
): AssertionResult {
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  const passed = width >= minSize && height >= minSize;

  return {
    passed,
    message: passed
      ? `Touch target meets minimum size requirement (${width}x${height}px >= ${minSize}px)`
      : `Touch target too small (${width}x${height}px < ${minSize}px)`,
    details: {
      width,
      height,
      minSize,
      element: element.tagName,
      className: element.className,
    },
  };
}

/**
 * Assert that there is no horizontal scroll in the document
 * @param container - Container element to check (default: document.documentElement)
 * @returns Assertion result
 */
export function assertNoHorizontalScroll(
  container: HTMLElement = document.documentElement
): AssertionResult {
  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;
  const hasHorizontalScroll = scrollWidth > clientWidth;

  const passed = !hasHorizontalScroll;

  return {
    passed,
    message: passed
      ? 'No horizontal scroll detected'
      : `Horizontal scroll detected (scrollWidth: ${scrollWidth}px > clientWidth: ${clientWidth}px)`,
    details: {
      scrollWidth,
      clientWidth,
      overflow: scrollWidth - clientWidth,
    },
  };
}

/**
 * Assert that an image is properly configured for responsive display
 * @param img - Image element to check
 * @param viewport - Current viewport configuration
 * @returns Assertion result
 */
export function assertResponsiveImage(
  img: HTMLImageElement,
  viewport: ViewportConfig
): AssertionResult {
  const hasSrcset = !!(img.srcset && img.srcset.length > 0);
  const hasSizes = !!(img.sizes && img.sizes.length > 0);
  const hasAlt = !!(img.alt && img.alt.length > 0);
  const hasLoading = img.loading === 'lazy' || img.loading === 'eager';

  const checks = {
    hasSrcset,
    hasSizes,
    hasAlt,
    hasLoading,
  };

  const passed = hasSrcset && hasAlt;

  return {
    passed,
    message: passed
      ? 'Image is properly configured for responsive display'
      : 'Image missing responsive attributes',
    details: {
      ...checks,
      src: img.src,
      currentSrc: img.currentSrc,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.width,
      displayHeight: img.height,
      viewport: `${viewport.width}x${viewport.height}`,
    },
  };
}

/**
 * Get all interactive elements on the page
 * @param container - Container to search within
 * @returns Array of interactive elements
 */
export function getInteractiveElements(container: HTMLElement = document.body): HTMLElement[] {
  const selectors = [
    'button',
    'a[href]',
    'input:not([type="hidden"])',
    'select',
    'textarea',
    '[role="button"]',
    '[role="link"]',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(', ')));
}

/**
 * Assert that all interactive elements meet touch target size requirements
 * @param container - Container to search within
 * @param minSize - Minimum size in pixels (default: 44)
 * @returns Array of assertion results
 */
export function assertAllTouchTargets(
  container: HTMLElement = document.body,
  minSize: number = 44
): AssertionResult[] {
  const interactiveElements = getInteractiveElements(container);
  return interactiveElements.map((element) => assertTouchTargetSize(element, minSize));
}

/**
 * Check if viewport meta tag is properly configured
 * @returns Assertion result
 */
export function assertViewportMetaTag(): AssertionResult {
  const metaTag = document.querySelector('meta[name="viewport"]');

  if (!metaTag) {
    return {
      passed: false,
      message: 'Viewport meta tag not found',
      details: {
        recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
      },
    };
  }

  const content = metaTag.getAttribute('content') || '';
  const hasWidthDevice = content.includes('width=device-width');
  const hasInitialScale = content.includes('initial-scale=1');

  const passed = hasWidthDevice && hasInitialScale;

  return {
    passed,
    message: passed
      ? 'Viewport meta tag is properly configured'
      : 'Viewport meta tag is missing required attributes',
    details: {
      content,
      hasWidthDevice,
      hasInitialScale,
      recommendation: passed
        ? undefined
        : 'Ensure viewport meta tag includes: width=device-width, initial-scale=1',
    },
  };
}

/**
 * Simulate a viewport change (e.g., device rotation)
 * @param from - Starting viewport configuration
 * @param to - Target viewport configuration
 */
export function simulateViewportChange(from: ViewportConfig, to: ViewportConfig): void {
  setViewport(to);

  // Simulate orientation change event if applicable
  if (from.isLandscape !== to.isLandscape) {
    window.dispatchEvent(new Event('orientationchange'));
  }
}

/**
 * Wait for images to load
 * @param container - Container to search within
 * @returns Promise that resolves when all images are loaded
 */
export function waitForImages(container: HTMLElement = document.body): Promise<void> {
  const images = Array.from(container.querySelectorAll<HTMLImageElement>('img'));

  const promises = images.map((img) => {
    if (img.complete) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      img.addEventListener('load', () => resolve());
      img.addEventListener('error', () => reject(new Error(`Failed to load image: ${img.src}`)));
    });
  });

  return Promise.all(promises).then(() => undefined);
}

/**
 * Get computed styles for responsive testing
 * @param element - Element to get styles for
 * @returns Computed style object with common responsive properties
 */
export function getResponsiveStyles(element: HTMLElement) {
  const computed = window.getComputedStyle(element);

  return {
    display: computed.display,
    width: computed.width,
    height: computed.height,
    padding: computed.padding,
    margin: computed.margin,
    fontSize: computed.fontSize,
    lineHeight: computed.lineHeight,
    gridTemplateColumns: computed.gridTemplateColumns,
    flexDirection: computed.flexDirection,
    gap: computed.gap,
  };
}

/**
 * Assert that text is readable (meets minimum font size)
 * @param element - Element to check
 * @param minFontSize - Minimum font size in pixels (default: 16)
 * @returns Assertion result
 */
export function assertReadableText(
  element: HTMLElement,
  minFontSize: number = 16
): AssertionResult {
  const computed = window.getComputedStyle(element);
  const fontSize = parseFloat(computed.fontSize);

  const passed = fontSize >= minFontSize;

  return {
    passed,
    message: passed
      ? `Text is readable (${fontSize}px >= ${minFontSize}px)`
      : `Text too small (${fontSize}px < ${minFontSize}px)`,
    details: {
      fontSize,
      minFontSize,
      element: element.tagName,
      className: element.className,
    },
  };
}
