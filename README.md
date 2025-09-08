# Movie Recommendation App

[![CI/CD Pipeline](https://github.com/svitalis123/movia-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/username/movie-recommendation-app/actions/workflows/ci-cd.yml)
[![Code Quality](https://github.com/svitalis123/movia-app/actions/workflows/code-quality.yml/badge.svg)](https://github.com/svitalis123/movia-app/actions/workflows/code-quality.yml)
[![E2E Tests](https://github.com/svitalis123/movia-app/actions/workflows/e2e.yml/badge.svg)](https://github.com/svitalis123/movia-app/actions/workflows/e2e.yml)

A modern React application built with TypeScript, Tailwind CSS, and shadcn/ui for browsing and discovering movies using The Movie Database (TMDB) API.

## Features

- 🎬 Browse popular movies
- 🔍 Search for movies by title
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern UI components with shadcn/ui
- 🔐 Authentication with Clerk
- ⚡ Fast development with Vite
- 📦 State management with Zustand
- 🧪 Type-safe development with TypeScript
- 🔔 **NEW**: Comprehensive notification system with toast messages
- ⏳ **NEW**: Enhanced loading states for all async operations
- 🚨 **NEW**: User-friendly error handling and recovery

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Authentication**: Clerk
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier + Husky

## Prerequisites

- Node.js 18+ and npm
- TMDB API key (get one at [themoviedb.org](https://www.themoviedb.org/settings/api))
- Clerk account for authentication (sign up at [clerk.com](https://clerk.com))

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd movie-recommendation-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your API keys in the `.env` file:

   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run ci` - Run all quality checks
- `npm run audit:security` - Run security audit

## 📚 Documentation

- **[Changelog](./CHANGELOG.md)** - Recent updates and changes
- **[Notification System](./docs/NOTIFICATIONS.md)** - Complete guide to the notification system
- **[CI/CD Setup](./docs/CI-CD.md)** - Continuous integration and deployment guide
- **[GitHub Setup](./.github/SETUP.md)** - GitHub Actions configuration

## 🆕 Recent Updates

### Notification System (Task 13.2) ✅

We've implemented a comprehensive notification system that provides users with immediate feedback for all actions:

#### Key Features:

- **Toast Notifications**: Success, error, warning, and info messages with smooth animations
- **Loading States**: Global and operation-specific loading indicators for all async operations
- **Enhanced Error Handling**: User-friendly error messages with actionable guidance
- **Async Operation Hooks**: Simplified hooks for handling async operations with automatic notifications

#### Quick Example:

```typescript
import { useToast } from './lib/stores/toast-store';
import { useAsyncOperation } from './lib/hooks/use-async-operation';

function MyComponent() {
  const { showSuccess, showError } = useToast();

  const { execute, loading } = useAsyncOperation(
    movieService.getMovieDetails,
    {
      showSuccessToast: true,
      successMessage: 'Movie loaded successfully!',
    }
  );

  return (
    <button onClick={() => execute(movieId)} disabled={loading}>
      {loading ? 'Loading...' : 'Load Movie'}
    </button>
  );
}
```

#### Authentication Fixes:

- ✅ Fixed redirect loop after login/signup
- ✅ Proper navigation to home page after authentication
- ✅ Improved Clerk integration with React Router

For complete documentation, see [NOTIFICATIONS.md](./docs/NOTIFICATIONS.md).

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # UI components (including new notification system)
│   │   ├── toast.tsx           # Toast notification components
│   │   ├── global-loading.tsx  # Global loading overlay
│   │   └── ...                 # Other UI components
│   ├── layout/         # Layout components
│   ├── movie/          # Movie-related components
│   ├── auth/           # Authentication components
│   └── search/         # Search components
├── lib/                # Utilities and configuration
│   ├── config/         # Environment and constants
│   ├── services/       # API services (enhanced with user-friendly errors)
│   ├── stores/         # Zustand stores (including toast and enhanced UI store)
│   ├── hooks/          # Custom hooks (including async operation hooks)
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── pages/              # Page components
├── docs/               # Documentation
│   ├── NOTIFICATIONS.md    # Notification system guide
│   └── CI-CD.md           # CI/CD documentation
└── __tests__/          # Test files (35+ new tests for notifications)
```

## Environment Variables

| Variable                     | Description                | Required         |
| ---------------------------- | -------------------------- | ---------------- |
| `VITE_TMDB_API_KEY`          | The Movie Database API key | Yes              |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication key   | Yes              |
| `VITE_TMDB_BASE_URL`         | TMDB API base URL          | No (has default) |
| `VITE_TMDB_IMAGE_BASE_URL`   | TMDB image base URL        | No (has default) |

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

- **Automated Testing**: Unit tests, E2E tests, and code quality checks
- **Code Quality**: ESLint, Prettier, and TypeScript checks
- **Security**: Dependency vulnerability scanning
- **Deployment**: Automatic deployment to Vercel on main branch
- **Preview Deployments**: Automatic preview deployments for pull requests

### Required Secrets

For the CI/CD pipeline to work, configure these secrets in your GitHub repository:

- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk authentication key
- `VITE_TMDB_API_KEY`: TMDB API key
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and ensure all tests pass locally:
   ```bash
   npm run ci
   ```
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

The CI/CD pipeline will automatically run tests and create a preview deployment for your PR.

## License

This project is licensed under the MIT License.
