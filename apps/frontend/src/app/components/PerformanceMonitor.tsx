'use client';
import { useEffect } from 'react';

const PerformanceMonitor = () => {
    useEffect(() => {
        // Only run in production
        if (process.env.NODE_ENV !== 'production') return;

        // Monitor Core Web Vitals
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'navigation') {
                    const navEntry = entry as PerformanceNavigationTiming;
                    console.log('Page Load Time:', navEntry.loadEventEnd - navEntry.fetchStart);
                }

                if (entry.entryType === 'paint') {
                    console.log(`${entry.name}:`, entry.startTime);
                }
            });
        });

        observer.observe({ entryTypes: ['navigation', 'paint'] });

        // Monitor Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                // Cast to PerformanceEventTiming for first-input entries
                const fidEntry = entry as PerformanceEventTiming;
                if (fidEntry.processingStart) {
                    console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
                }
            });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });

        return () => {
            observer.disconnect();
            lcpObserver.disconnect();
            fidObserver.disconnect();
        };
    }, []);

    return null;
};

export default PerformanceMonitor;