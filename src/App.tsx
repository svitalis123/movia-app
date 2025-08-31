
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { ClerkAuthProvider } from './lib/providers/clerk-provider';
import { ProtectedRoute, SignedIn, SignedOut } from './components/auth';
import { Header } from './components/layout/header';
import { ErrorBoundary, LoadingSpinner } from './components/ui';
import { createLazyRoute } from './lib/utils/lazy-loading';

// Lazy load page components for code splitting with route-specific loading messages
const HomePage = createLazyRoute(() => import('./pages/home-page'), 'Home');
const MovieDetailsPage = createLazyRoute(() => import('./pages/movie-details-page'), 'Movie Details');
const SearchPage = createLazyRoute(() => import('./pages/search-page'), 'Search');
const NotFoundPage = createLazyRoute(() => import('./pages/not-found-page'), 'Page');
const SignInPage = createLazyRoute(() => import('./pages/sign-in-page'), 'Sign In');
const SignUpPage = createLazyRoute(() => import('./pages/sign-up-page'), 'Sign Up');

/**
 * Loading fallback component for lazy-loaded routes
 */
function RouteLoadingFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <LoadingSpinner size="large" message="Loading page..." />
    </div>
  );
}

/**
 * Main App component with routing and authentication
 * Provides comprehensive routing setup with protected routes and proper navigation
 * Implements code splitting with lazy loading for better performance
 */
function App() {
  return (
    <ErrorBoundary>
      <ClerkAuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Header - only show when signed in */}
            <SignedIn>
              <Header />
            </SignedIn>

            <main>
              <Suspense fallback={<RouteLoadingFallback />}>
                <Routes>
                  {/* Public routes - only accessible when signed out */}
                  <Route 
                    path="/sign-in/*" 
                    element={
                      <SignedOut>
                        <SignInPage />
                      </SignedOut>
                    } 
                  />
                  <Route 
                    path="/sign-up/*" 
                    element={
                      <SignedOut>
                        <SignUpPage />
                      </SignedOut>
                    } 
                  />

                  {/* Protected routes - only accessible when signed in */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/search" 
                    element={
                      <ProtectedRoute>
                        <SearchPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/movie/:id" 
                    element={
                      <ProtectedRoute>
                        <MovieDetailsPage />
                      </ProtectedRoute>
                    } 
                  />

                  {/* 404 Not Found page */}
                  <Route 
                    path="/404" 
                    element={<NotFoundPage />} 
                  />

                  {/* Catch-all route for unknown paths */}
                  <Route 
                    path="*" 
                    element={
                      <>
                        <SignedIn>
                          <Navigate to="/404" replace />
                        </SignedIn>
                        <SignedOut>
                          <Navigate to="/sign-in" replace />
                        </SignedOut>
                      </>
                    } 
                  />
                </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
      </ClerkAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
