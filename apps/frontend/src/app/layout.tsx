import './global.css';
import PerformanceMonitor from './components/PerformanceMonitor';

export const metadata = {
  title: 'Keja - Find Your Perfect Home',
  description: 'Discover thousands of verified rental properties in Kenya with our advanced search platform. Find bedsitters, apartments, and condos in Nairobi, Mombasa, and beyond.',
  keywords: 'Kenya rentals, Nairobi apartments, bedsitters, property rental, real estate Kenya, Mombasa rentals',
  authors: [{ name: 'Keja Team' }],
  creator: 'Keja',
  publisher: 'Keja',
  openGraph: {
    title: 'Keja - Find Your Perfect Home',
    description: 'Discover thousands of verified rental properties in Kenya',
    url: 'https://keja.com',
    siteName: 'Keja',
    images: [
      {
        url: '/luxury-one.webp',
        width: 1200,
        height: 630,
        alt: 'Keja - Property Rental Platform',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keja - Find Your Perfect Home',
    description: 'Discover thousands of verified rental properties in Kenya',
    images: ['/luxury-one.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PerformanceMonitor />
        {children}
      </body>
    </html>
  );
}
