# Keja - Find Your Perfect Home 🏠

Keja is Kenya's premier property rental platform that helps you find your perfect home in just 3 clicks. Built with modern web technologies for a fast, reliable, and user-friendly experience.

## 🚀 Features

- **Smart Property Search**: Advanced filtering by location, type, and price
- **User Dashboard**: Manage saved properties and appointments
- **Admin Dashboard**: Complete property management for realtors
- **Mobile-First Design**: Optimized for all devices
- **Real-time Updates**: Live property availability
- **Performance Optimized**: Fast loading with image optimization
- **Accessibility Compliant**: WCAG 2.1 standards

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Django 5.2.7, Django REST Framework
- **Styling**: Tailwind CSS
- **Database**: SQLite (development), PostgreSQL (production)
- **Testing**: Jest, React Testing Library, Playwright
- **Monorepo**: Nx workspace

## 📁 Project Structure

```
keja/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   ├── backend/           # Django backend API
│   └── frontend-e2e/      # End-to-end tests
├── docs/                  # Documentation
├── TECHNICAL_DOCUMENTATION.md
├── USER_GUIDE.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm 9+
- Python 3.9+ (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd keja
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   # or
   npx nx dev frontend
   ```

4. **Start the backend (separate terminal)**
   ```bash
   cd apps/backend
   python manage.py runserver
   ```

### Available Scripts

```bash
# Development
npm run dev              # Start frontend dev server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run e2e             # Run end-to-end tests

# Code Quality
npm run lint            # Run ESLint
npx nx graph           # View project dependency graph
```

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/next:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 🧪 Testing

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Comprehensive component testing
- **E2E Tests**: Playwright for user journey testing
- **Coverage**: 70%+ coverage requirement

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run e2e
```

### Test Files Location
- Unit tests: `src/**/__tests__/*.test.tsx`
- E2E tests: `apps/frontend-e2e/`
- Test setup: `jest.setup.js`

## 📱 Features Overview

### For Renters
- Browse thousands of verified properties
- Advanced search and filtering
- Save favorite properties
- Book property viewings
- User dashboard with appointment management

### For Realtors
- Property management dashboard
- Appointment scheduling system
- Analytics and insights
- Subscription management
- Client communication tools

## 🎨 Design System

### Colors
- Primary: Blue (#2563eb)
- Secondary: Gray (#64748b)
- Success: Green (#059669)
- Warning: Yellow (#d97706)
- Error: Red (#dc2626)

### Typography
- Font Family: Inter, system fonts
- Responsive typography with Tailwind CSS
- Accessibility-compliant contrast ratios

### Components
- Reusable UI components
- Consistent design patterns
- Mobile-first responsive design

## 🔧 Development

### Code Standards
- TypeScript strict mode
- ESLint + Prettier for code formatting
- Conventional commits
- Component-driven development

### Performance
- Next.js Image optimization
- Lazy loading and code splitting
- Performance monitoring with Core Web Vitals
- Responsive images and assets

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Semantic HTML structure

## 📚 Documentation

- **[Technical Documentation](./TECHNICAL_DOCUMENTATION.md)**: For developers
- **[User Guide](./USER_GUIDE.md)**: For end users
- **Component Documentation**: In-code documentation
- **API Documentation**: Coming with backend implementation

## 🚀 Deployment

### Frontend Deployment
- Optimized for Vercel, Netlify, or similar platforms
- Static site generation support
- Environment variable configuration
- Performance monitoring integration

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Maintain accessibility standards
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our comprehensive guides
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@keja.com
- **Community**: Join our developer community

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Frontend application with core features
- ✅ User authentication and dashboards
- ✅ Property search and filtering
- ✅ Responsive design and accessibility

### Phase 2 (Next)
- 🔄 Backend API implementation
- 🔄 Database integration
- 🔄 Real-time features
- 🔄 Payment integration

### Phase 3 (Future)
- 📱 Mobile applications
- 🤖 AI-powered recommendations
- 📊 Advanced analytics
- 🌍 Multi-language support

---

**Built with ❤️ for the Kenyan real estate market**

*Keja - Where finding your perfect home is just 3 clicks away!* 🏠✨