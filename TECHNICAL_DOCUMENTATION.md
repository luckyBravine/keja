# Keja Frontend - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Routing](#routing)
7. [Styling](#styling)
8. [Performance Optimizations](#performance-optimizations)
9. [Testing Strategy](#testing-strategy)
10. [Build & Deployment](#build--deployment)
11. [Development Guidelines](#development-guidelines)

## Architecture Overview

Keja is a modern real estate rental platform built with Next.js 15 and React 19, following a component-based architecture with server-side rendering capabilities. The application uses a monorepo structure managed by Nx.

### Key Architectural Decisions

- **Next.js App Router**: Utilizing the latest App Router for file-based routing and server components
- **Component-First Design**: Reusable, testable components with clear separation of concerns
- **Performance-First**: Image optimization, lazy loading, and performance monitoring
- **Accessibility-First**: WCAG 2.1 compliant with proper ARIA labels and keyboard navigation
- **Mobile-First**: Responsive design with Tailwind CSS breakpoints

## Technology Stack

### Core Technologies
- **Next.js 15.2.4**: React framework with App Router
- **React 19.0.0**: UI library with latest features
- **TypeScript 5.9.2**: Type safety and developer experience
- **Tailwind CSS 3.4.3**: Utility-first CSS framework

### Development Tools
- **Nx 21.6.5**: Monorepo management and build system
- **ESLint**: Code linting and formatting
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing

### Performance & Monitoring
- **Next.js Image**: Optimized image loading
- **Performance Observer API**: Core Web Vitals monitoring
- **Custom animations**: Smooth micro-interactions

## Project Structure

```
keja/apps/frontend/
├── src/app/
│   ├── components/          # Reusable UI components
│   │   ├── __tests__/      # Component tests
│   │   ├── ErrorBoundary.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ListingCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PerformanceMonitor.tsx
│   │   └── Toast.tsx
│   ├── admin/              # Admin dashboard
│   │   ├── dashboard/
│   │   ├── listings/
│   │   ├── appointments/
│   │   ├── subscription/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── dashboard/          # User dashboard
│   │   ├── appointments/
│   │   ├── clients/
│   │   ├── listings/
│   │   ├── notifications/
│   │   └── layout.tsx
│   ├── login/              # Authentication
│   ├── register/
│   ├── listings/           # Property listings
│   ├── global.css          # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── public/                 # Static assets
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Test setup
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Component Architecture

### Component Categories

1. **Layout Components**: Navbar, Footer, Layouts
2. **UI Components**: Buttons, Forms, Cards, Modals
3. **Feature Components**: FilterBar, ListingCard, Dashboard widgets
4. **Utility Components**: ErrorBoundary, LoadingSpinner, PerformanceMonitor

### Component Design Principles

```typescript
// Example: Well-structured component
interface ComponentProps {
  // Required props first
  title: string;
  onAction: () => void;
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  className?: string;
}

const Component: React.FC<ComponentProps> = ({
  title,
  onAction,
  variant = 'primary',
  isLoading = false,
  className = '',
}) => {
  // Component logic here
  return (
    <div className={`base-styles ${className}`}>
      {/* Component JSX */}
    </div>
  );
};
```

### Key Components

#### ListingCard
- **Purpose**: Display property information with interactive features
- **Features**: Like functionality, responsive design, accessibility
- **Props**: Property data, interaction handlers
- **Testing**: Comprehensive unit tests for all interactions

#### FilterBar
- **Purpose**: Property search and filtering interface
- **Features**: Location search, type filtering, price range selection
- **State**: Controlled components with parent state management
- **Performance**: Debounced search, loading states

#### ErrorBoundary
- **Purpose**: Graceful error handling and recovery
- **Features**: Error logging, user-friendly fallbacks, retry mechanisms
- **Implementation**: Class component with error boundaries

## State Management

### Local State Strategy
- **React useState**: Component-level state
- **localStorage**: Persistent user preferences and liked listings
- **URL State**: Search parameters and filters

### State Patterns

```typescript
// Loading states pattern
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAsyncAction = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    await performAction();
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Data Flow
1. User interactions trigger state updates
2. State changes re-render affected components
3. Side effects (localStorage, navigation) handled in useEffect
4. Error states managed with ErrorBoundary

## Routing

### App Router Structure
- **File-based routing**: Each folder represents a route segment
- **Layouts**: Shared UI across route groups
- **Loading**: Loading UI for async route segments
- **Error**: Error handling for route segments

### Route Protection
```typescript
// Example: Protected route pattern
useEffect(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    router.push('/login');
  }
}, [router]);
```

### Navigation Patterns
- **Programmatic**: `useRouter` hook for navigation
- **Declarative**: `Link` component for client-side routing
- **External**: Regular `<a>` tags for external links

## Styling

### Tailwind CSS Architecture

#### Design System
```css
/* Custom CSS variables */
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --spacing-unit: 0.25rem;
}

/* Custom component classes */
.btn-primary {
  @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg 
         transition-all duration-200 hover:bg-blue-700 hover:shadow-lg 
         hover:scale-105 focus-ring;
}
```

#### Responsive Design
- **Mobile-first**: Base styles for mobile, scale up
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid and Flexbox for layouts

#### Animation System
```css
/* Custom animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0;
}
```

## Performance Optimizations

### Image Optimization
```typescript
import Image from 'next/image';

<Image 
  src="/property-image.jpg"
  alt="Property description"
  width={400}
  height={300}
  className="object-cover"
  priority={isAboveFold}
/>
```

### Code Splitting
- **Route-based**: Automatic with Next.js App Router
- **Component-based**: Dynamic imports for heavy components
- **Library splitting**: Separate vendor bundles

### Performance Monitoring
```typescript
// Core Web Vitals tracking
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    // Track LCP, FID, CLS metrics
    console.log(`${entry.name}:`, entry.startTime);
  });
});
```

### Loading Strategies
1. **Skeleton Loading**: Visual placeholders during data fetch
2. **Progressive Loading**: Load critical content first
3. **Lazy Loading**: Load images and components on demand
4. **Prefetching**: Preload likely next pages

## Testing Strategy

### Testing Pyramid
1. **Unit Tests (70%)**: Component logic and utilities
2. **Integration Tests (20%)**: Component interactions
3. **E2E Tests (10%)**: Critical user journeys

### Testing Tools
```typescript
// Component testing example
import { render, screen, fireEvent } from '@testing-library/react';

describe('ListingCard', () => {
  it('handles like functionality', async () => {
    render(<ListingCard {...mockProps} />);
    
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });
});
```

### Coverage Requirements
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## Build & Deployment

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run tests
npm run test

# E2E tests
npm run e2e
```

### Environment Configuration
```typescript
// Environment variables
NEXT_PUBLIC_API_URL=https://api.keja.com
NEXT_PUBLIC_ANALYTICS_ID=GA_TRACKING_ID
NODE_ENV=production
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Build passes without errors
- [ ] Tests pass with required coverage
- [ ] Performance metrics within targets
- [ ] Accessibility audit passes
- [ ] SEO metadata complete

## Development Guidelines

### Code Standards
1. **TypeScript**: Strict mode enabled, no `any` types
2. **ESLint**: Enforced code style and best practices
3. **Prettier**: Consistent code formatting
4. **Naming**: Descriptive, consistent naming conventions

### Component Guidelines
```typescript
// Component file structure
import React from 'react';
import { ComponentProps } from './types';

// Component implementation
const Component: React.FC<ComponentProps> = (props) => {
  // Hooks at the top
  // Event handlers
  // Render logic
  
  return (
    // JSX with proper accessibility
  );
};

export default Component;
```

### Git Workflow
1. **Feature branches**: `feature/component-name`
2. **Commit messages**: Conventional commits format
3. **Pull requests**: Required for main branch
4. **Code review**: Mandatory before merge

### Performance Guidelines
- Keep components under 200 lines
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets
- Monitor bundle size

### Accessibility Guidelines
- Use semantic HTML elements
- Provide ARIA labels and roles
- Ensure keyboard navigation
- Maintain color contrast ratios
- Test with screen readers

## API Integration (Future)

### API Client Structure
```typescript
// API client example
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  async getListings(filters: ListingFilters): Promise<Listing[]> {
    const response = await fetch(`${this.baseURL}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }
    
    return response.json();
  }
}
```

### Error Handling
- Network errors with retry logic
- User-friendly error messages
- Fallback UI states
- Error boundary integration

## Security Considerations

### Client-Side Security
- Input validation and sanitization
- XSS prevention with proper escaping
- CSRF protection for forms
- Secure localStorage usage

### Authentication Flow
- JWT token management
- Automatic token refresh
- Secure route protection
- Session timeout handling

## Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Error rate monitoring
- User interaction analytics
- Page load performance

### User Analytics
- Page view tracking
- User journey analysis
- Conversion funnel monitoring
- A/B testing framework

---

This technical documentation provides a comprehensive overview of the Keja frontend architecture, implementation details, and development guidelines. For specific implementation questions or contributions, please refer to the component-specific documentation and test files.