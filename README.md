# Movie Recommendation App

[![CI/CD Pipeline](https://github.com/username/movie-recommendation-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/username/movie-recommendation-app/actions/workflows/ci-cd.yml)
[![Code Quality](https://github.com/username/movie-recommendation-app/actions/workflows/code-quality.yml/badge.svg)](https://github.com/username/movie-recommendation-app/actions/workflows/code-quality.yml)
[![E2E Tests](https://github.com/username/movie-recommendation-app/actions/workflows/e2e.yml/badge.svg)](https://github.com/username/movie-recommendation-app/actions/workflows/e2e.yml)

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

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   ├── movie/          # Movie-related components
│   └── auth/           # Authentication components
├── lib/                # Utilities and configuration
│   ├── config/         # Environment and constants
│   ├── services/       # API services
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript type definitions
│   └── utils.ts        # Utility functions
├── pages/              # Page components
├── hooks/              # Custom React hooks
└── utils/              # General utilities
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_TMDB_API_KEY` | The Movie Database API key | Yes |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication key | Yes |
| `VITE_TMDB_BASE_URL` | TMDB API base URL | No (has default) |
| `VITE_TMDB_IMAGE_BASE_URL` | TMDB image base URL | No (has default) |

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