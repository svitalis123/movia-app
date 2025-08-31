import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock all the components and providers
vi.mock('../lib/providers/clerk-provider', () => ({
  ClerkAuthProvider: vi.fn(({ children }) => (
    <div data-testid="clerk-auth-provider">{children}</div>
  )),
}));

vi.mock('../components/auth', () => ({
  ProtectedRoute: vi.fn(({ children }) => (
    <div data-testid="protected-route">{children}</div>
  )),
  SignedIn: vi.fn(({ children }) => (
    <div data-testid="signed-in">{children}</div>
  )),
  SignedOut: vi.fn(({ children }) => (
    <div data-testid="signed-out">{children}</div>
  )),
}));

vi.mock('../pages', () => ({
  HomePage: vi.fn(() => <div data-testid="home-page">Home Page</div>),
  MovieDetailsPage: vi.fn(() => <div data-testid="movie-details-page">Movie Details Page</div>),
  SearchPage: vi.fn(() => <div data-testid="search-page">Search Page</div>),
  NotFoundPage: vi.fn(() => <div data-testid="not-found-page">Not Found Page</div>),
  SignInPage: vi.fn(() => <div data-testid="sign-in-page">Sign In Page</div>),
  SignUpPage: vi.fn(() => <div data-testid="sign-up-page">Sign Up Page</div>),
}));

vi.mock('../components/layout/header', () => ({
  Header: vi.fn(() => <div data-testid="header">Header</div>),
}));

vi.mock('../components/ui', () => ({
  ErrorBoundary: vi.fn(({ children }) => (
    <div data-testid="error-boundary">{children}</div>
  )),
  LoadingSpinner: vi.fn(({ message, size }) => (
    <div data-testid="loading-spinner" data-size={size}>
      {message || 'Loading...'}
    </div>
  )),
}));

// Mock react-router-dom to control routing in tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: vi.fn(({ children }) => <div data-testid="browser-router">{children}</div>),
    Routes: vi.fn(({ children }) => <div data-testid="routes">{children}</div>),
    Route: vi.fn(({ element }) => <div data-testid="route">{element}</div>),
    Navigate: vi.fn(() => <div data-testid="navigate">Navigate</div>),
    useParams: vi.fn(() => ({ id: '123' })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// Helper function to render App
const renderApp = () => {
  return render(<App />);
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with ClerkAuthProvider wrapper', () => {
    renderApp();
    
    expect(screen.getByTestId('clerk-auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('renders router components', () => {
    renderApp();
    
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('renders SignedIn and SignedOut components', () => {
    renderApp();
    
    expect(screen.getAllByTestId('signed-in').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('signed-out').length).toBeGreaterThan(0);
  });

  it('renders route components', () => {
    renderApp();
    
    // Should render multiple Route components
    const routes = screen.getAllByTestId('route');
    expect(routes.length).toBeGreaterThan(0);
  });

  it('has proper app structure with min-h-screen', () => {
    renderApp();
    
    const appContainer = screen.getByTestId('browser-router').querySelector('.min-h-screen');
    expect(appContainer).toBeInTheDocument();
    expect(appContainer).toHaveClass('bg-gray-50');
  });
});