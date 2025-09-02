import { Page } from '@playwright/test';

/**
 * Test utilities for E2E tests
 */

/**
 * Mock authentication state for testing protected routes
 */
export async function mockAuthentication(page: Page) {
  await page.route('**/clerk/**', (route) => {
    if (route.request().url().includes('/sessions')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: {
            id: 'test-session',
            user: {
              id: 'test-user',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
            },
          },
        }),
      });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock TMDB API responses with sample movie data
 */
export async function mockMovieAPI(page: Page) {
  // Mock popular movies
  await page.route('**/api.themoviedb.org/3/movie/popular*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        page: 1,
        results: [
          {
            id: 1,
            title: 'Test Movie 1',
            overview: 'A great test movie',
            poster_path: '/test-poster-1.jpg',
            backdrop_path: '/test-backdrop-1.jpg',
            release_date: '2023-01-01',
            vote_average: 8.5,
            vote_count: 1000,
            genre_ids: [28, 12],
          },
          {
            id: 2,
            title: 'Test Movie 2',
            overview: 'Another great test movie',
            poster_path: '/test-poster-2.jpg',
            backdrop_path: '/test-backdrop-2.jpg',
            release_date: '2023-02-01',
            vote_average: 7.8,
            vote_count: 800,
            genre_ids: [35, 18],
          },
        ],
        total_pages: 10,
        total_results: 200,
      }),
    });
  });

  // Mock movie details
  await page.route('**/api.themoviedb.org/3/movie/1*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        title: 'Test Movie 1',
        overview: 'A great test movie with detailed information',
        poster_path: '/test-poster-1.jpg',
        backdrop_path: '/test-backdrop-1.jpg',
        release_date: '2023-01-01',
        vote_average: 8.5,
        vote_count: 1000,
        runtime: 120,
        genres: [
          { id: 28, name: 'Action' },
          { id: 12, name: 'Adventure' },
        ],
        production_companies: [{ id: 1, name: 'Test Studios' }],
        budget: 100000000,
        revenue: 500000000,
      }),
    });
  });

  // Mock movie credits
  await page.route('**/api.themoviedb.org/3/movie/*/credits*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        cast: [
          {
            id: 1,
            name: 'Test Actor 1',
            character: 'Main Character',
            profile_path: '/test-actor-1.jpg',
          },
          {
            id: 2,
            name: 'Test Actor 2',
            character: 'Supporting Character',
            profile_path: '/test-actor-2.jpg',
          },
        ],
        crew: [
          {
            id: 3,
            name: 'Test Director',
            job: 'Director',
            profile_path: '/test-director.jpg',
          },
        ],
      }),
    });
  });

  // Mock search results
  await page.route('**/api.themoviedb.org/3/search/movie*', (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('query');

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        page: 1,
        results: query
          ? [
              {
                id: 101,
                title: `Search Result for "${query}"`,
                overview: 'A movie found through search',
                poster_path: '/search-result.jpg',
                release_date: '2023-03-01',
                vote_average: 7.5,
                vote_count: 500,
                genre_ids: [28, 35],
              },
            ]
          : [],
        total_pages: 1,
        total_results: query ? 1 : 0,
      }),
    });
  });
}

/**
 * Wait for the application to be fully loaded
 */
export async function waitForAppLoad(page: Page) {
  // Wait for the main content to be visible
  await page.waitForSelector('main, [data-testid="app-content"]', {
    timeout: 10000,
  });

  // Wait for any loading spinners to disappear
  await page
    .waitForFunction(
      () => {
        const spinners = document.querySelectorAll(
          '[data-testid="loading-spinner"], .loading, .spinner'
        );
        return (
          spinners.length === 0 ||
          Array.from(spinners).every(
            (spinner) => window.getComputedStyle(spinner).display === 'none'
          )
        );
      },
      { timeout: 5000 }
    )
    .catch(() => {
      // Ignore timeout - loading spinners might not be present
    });
}

/**
 * Common selectors used across tests
 */
export const selectors = {
  movieCard: '[data-testid="movie-card"], .movie-card',
  movieTitle: '[data-testid="movie-title"], .movie-title, h3',
  moviePoster: '[data-testid="movie-poster"], img',
  searchInput:
    'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
  loadingSpinner: '[data-testid="loading-spinner"], .loading, .spinner',
  errorMessage: '[data-testid="error-message"], .error, [role="alert"]',
  pagination: '[data-testid="pagination"], .pagination',
  header: 'header, nav, [data-testid="header"]',
  signInForm: '[data-testid="sign-in-form"], .cl-signIn-root',
  signUpForm: '[data-testid="sign-up-form"], .cl-signUp-root',
};

/**
 * Check if an element is visible and interactable
 */
export async function isElementInteractable(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout: 1000 });

    const box = await element.boundingBox();
    return box !== null && box.width > 0 && box.height > 0;
  } catch {
    return false;
  }
}
