/**
 * Navigation utilities for better browser history management
 * Provides helper functions for common navigation patterns
 */

/**
 * Creates a URL with search parameters
 */
export function createSearchUrl(query: string, page?: number): string {
  const params = new URLSearchParams();
  params.set('q', query);
  if (page && page > 1) {
    params.set('page', page.toString());
  }
  return `/search?${params.toString()}`;
}

/**
 * Creates a movie details URL
 */
export function createMovieUrl(movieId: number): string {
  return `/movie/${movieId}`;
}

/**
 * Parses search parameters from URL
 */
export function parseSearchParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10);
  return {
    query: searchParams.get('q') || '',
    page: isNaN(page) ? 1 : page,
  };
}

/**
 * Navigation history management
 */
export class NavigationHistory {
  private static history: string[] = [];
  private static maxHistory = 10;

  static push(path: string) {
    this.history.push(path);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  static pop(): string | undefined {
    return this.history.pop();
  }

  static getPrevious(): string | undefined {
    return this.history[this.history.length - 1];
  }

  static clear() {
    this.history = [];
  }

  static getHistory(): string[] {
    return [...this.history];
  }
}

/**
 * Route validation utilities
 */
export function isValidMovieId(id: string | undefined): boolean {
  if (!id) return false;
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0;
}

/**
 * URL parameter validation
 */
export function validateSearchQuery(query: string | null): string {
  if (!query || typeof query !== 'string') return '';
  return query.trim().slice(0, 100); // Limit query length
}

/**
 * Page number validation
 */
export function validatePageNumber(page: string | null): number {
  if (!page) return 1;
  const numPage = parseInt(page, 10);
  return isNaN(numPage) || numPage < 1 ? 1 : Math.min(numPage, 1000); // Reasonable max page
}
