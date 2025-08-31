import {
  createSearchUrl,
  createMovieUrl,
  parseSearchParams,
  NavigationHistory,
  isValidMovieId,
  validateSearchQuery,
  validatePageNumber,
} from '../navigation';

describe('Navigation Utilities', () => {
  describe('createSearchUrl', () => {
    it('creates search URL with query only', () => {
      expect(createSearchUrl('action movies')).toBe('/search?q=action+movies');
    });

    it('creates search URL with query and page', () => {
      expect(createSearchUrl('comedy', 2)).toBe('/search?q=comedy&page=2');
    });

    it('omits page parameter when page is 1', () => {
      expect(createSearchUrl('drama', 1)).toBe('/search?q=drama');
    });
  });

  describe('createMovieUrl', () => {
    it('creates movie URL with ID', () => {
      expect(createMovieUrl(123)).toBe('/movie/123');
    });
  });

  describe('parseSearchParams', () => {
    it('parses search parameters correctly', () => {
      const params = new URLSearchParams('?q=test&page=2');
      const result = parseSearchParams(params);
      
      expect(result).toEqual({
        query: 'test',
        page: 2,
      });
    });

    it('returns defaults for missing parameters', () => {
      const params = new URLSearchParams('');
      const result = parseSearchParams(params);
      
      expect(result).toEqual({
        query: '',
        page: 1,
      });
    });

    it('handles invalid page number', () => {
      const params = new URLSearchParams('?q=test&page=invalid');
      const result = parseSearchParams(params);
      
      expect(result).toEqual({
        query: 'test',
        page: 1,
      });
    });
  });

  describe('NavigationHistory', () => {
    beforeEach(() => {
      NavigationHistory.clear();
    });

    it('pushes and pops history entries', () => {
      NavigationHistory.push('/page1');
      NavigationHistory.push('/page2');
      
      expect(NavigationHistory.pop()).toBe('/page2');
      expect(NavigationHistory.pop()).toBe('/page1');
    });

    it('gets previous entry without removing it', () => {
      NavigationHistory.push('/page1');
      NavigationHistory.push('/page2');
      
      expect(NavigationHistory.getPrevious()).toBe('/page2');
      expect(NavigationHistory.getHistory()).toHaveLength(2);
    });

    it('limits history size', () => {
      // Push more than max history
      for (let i = 0; i < 15; i++) {
        NavigationHistory.push(`/page${i}`);
      }
      
      const history = NavigationHistory.getHistory();
      expect(history).toHaveLength(10);
      expect(history[0]).toBe('/page5'); // First 5 should be removed
    });

    it('clears history', () => {
      NavigationHistory.push('/page1');
      NavigationHistory.clear();
      
      expect(NavigationHistory.getHistory()).toHaveLength(0);
    });
  });

  describe('isValidMovieId', () => {
    it('validates valid movie IDs', () => {
      expect(isValidMovieId('123')).toBe(true);
      expect(isValidMovieId('1')).toBe(true);
    });

    it('rejects invalid movie IDs', () => {
      expect(isValidMovieId(undefined)).toBe(false);
      expect(isValidMovieId('')).toBe(false);
      expect(isValidMovieId('abc')).toBe(false);
      expect(isValidMovieId('0')).toBe(false);
      expect(isValidMovieId('-1')).toBe(false);
    });
  });

  describe('validateSearchQuery', () => {
    it('validates and trims search queries', () => {
      expect(validateSearchQuery('  test query  ')).toBe('test query');
      expect(validateSearchQuery('valid')).toBe('valid');
    });

    it('handles invalid queries', () => {
      expect(validateSearchQuery(null)).toBe('');
      expect(validateSearchQuery('')).toBe('');
      expect(validateSearchQuery('   ')).toBe('');
    });

    it('limits query length', () => {
      const longQuery = 'a'.repeat(150);
      const result = validateSearchQuery(longQuery);
      expect(result).toHaveLength(100);
    });
  });

  describe('validatePageNumber', () => {
    it('validates valid page numbers', () => {
      expect(validatePageNumber('1')).toBe(1);
      expect(validatePageNumber('5')).toBe(5);
      expect(validatePageNumber('100')).toBe(100);
    });

    it('handles invalid page numbers', () => {
      expect(validatePageNumber(null)).toBe(1);
      expect(validatePageNumber('')).toBe(1);
      expect(validatePageNumber('abc')).toBe(1);
      expect(validatePageNumber('0')).toBe(1);
      expect(validatePageNumber('-1')).toBe(1);
    });

    it('limits maximum page number', () => {
      expect(validatePageNumber('2000')).toBe(1000);
    });
  });
});