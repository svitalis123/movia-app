import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { APIError, NetworkError } from '../../types';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

describe('HttpClient', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock axios.create
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      request: vi.fn(),
      defaults: {
        baseURL: '',
        timeout: 0,
      },
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should create axios instance with default configuration', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.themoviedb.org/3',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    });

    it('should setup request and response interceptors', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();
      
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should accept custom configuration', async () => {
      const { HttpClient } = await import('../http-client');
      const customConfig = {
        baseURL: 'https://custom-api.com',
        timeout: 5000,
      };

      new HttpClient(customConfig);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://custom-api.com',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    });
  });

  describe('HTTP methods', () => {
    it('should make GET requests', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const mockData = { id: 1, title: 'Test Movie' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await httpClient.get('/movies/1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movies/1', undefined);
      expect(result).toEqual(mockData);
    });

    it('should make POST requests', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const mockData = { success: true };
      const postData = { title: 'New Movie' };
      mockAxiosInstance.post.mockResolvedValue({ data: mockData });

      const result = await httpClient.post('/movies', postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/movies', postData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should make PUT requests', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const mockData = { success: true };
      const putData = { title: 'Updated Movie' };
      mockAxiosInstance.put.mockResolvedValue({ data: mockData });

      const result = await httpClient.put('/movies/1', putData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/movies/1', putData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should make DELETE requests', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const mockData = { success: true };
      mockAxiosInstance.delete.mockResolvedValue({ data: mockData });

      const result = await httpClient.delete('/movies/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/movies/1', undefined);
      expect(result).toEqual(mockData);
    });

    it('should make PATCH requests', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const mockData = { success: true };
      const patchData = { title: 'Patched Movie' };
      mockAxiosInstance.patch.mockResolvedValue({ data: mockData });

      const result = await httpClient.patch('/movies/1', patchData);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/movies/1', patchData, undefined);
      expect(result).toEqual(mockData);
    });
  });

  describe('configuration updates', () => {
    it('should update configuration', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const newConfig = {
        baseURL: 'https://new-api.com',
        timeout: 15000,
      };

      httpClient.updateConfig(newConfig);

      expect(mockAxiosInstance.defaults.baseURL).toBe('https://new-api.com');
      expect(mockAxiosInstance.defaults.timeout).toBe(15000);
    });
  });

  describe('axios instance access', () => {
    it('should provide access to underlying axios instance', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const instance = httpClient.getAxiosInstance();
      expect(instance).toBe(mockAxiosInstance);
    });
  });

  describe('request interceptors', () => {
    it('should add API key to requests', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();

      // Verify request interceptor was set up
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Test the request interceptor function
      const mockConfig = {
        params: {},
        headers: {},
      };

      // Mock environment variable
      const originalEnv = process.env.VITE_TMDB_API_KEY;
      process.env.VITE_TMDB_API_KEY = 'test-api-key';

      const modifiedConfig = requestInterceptor(mockConfig);

      expect(modifiedConfig.params.api_key).toBe('test-api-key');

      // Restore environment
      process.env.VITE_TMDB_API_KEY = originalEnv;
    });

    it('should handle missing API key', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      const mockConfig = {
        params: {},
        headers: {},
      };

      // Mock missing API key
      const originalEnv = process.env.VITE_TMDB_API_KEY;
      delete process.env.VITE_TMDB_API_KEY;

      const modifiedConfig = requestInterceptor(mockConfig);

      expect(modifiedConfig.params.api_key).toBeUndefined();

      // Restore environment
      process.env.VITE_TMDB_API_KEY = originalEnv;
    });
  });

  describe('response interceptors', () => {
    it('should handle successful responses', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();

      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
      
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        config: {
          url: '/test',
          metadata: { startTime: Date.now() - 100 }
        }
      };

      const result = responseInterceptor(mockResponse);
      expect(result).toBe(mockResponse);
    });

    it('should handle API errors', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();

      const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const mockError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' },
        },
        config: {
          url: '/test-endpoint',
        },
      };

      await expect(errorInterceptor(mockError)).rejects.toThrow(APIError);
    });

    it('should handle network errors', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();

      const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const mockNetworkError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR',
        config: {
          url: '/test-endpoint',
        },
      };

      await expect(errorInterceptor(mockNetworkError)).rejects.toThrow(NetworkError);
    });

    it('should handle timeout errors', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();

      const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const mockTimeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
        config: {
          url: '/test-endpoint',
        },
      };

      await expect(errorInterceptor(mockTimeoutError)).rejects.toThrow(NetworkError);
    });
  });

  describe('request configuration', () => {
    it('should merge custom config with defaults', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const customConfig = {
        headers: {
          'Custom-Header': 'custom-value',
        },
        timeout: 5000,
      };

      mockAxiosInstance.get.mockResolvedValue({ data: { success: true } });

      await httpClient.get('/test', customConfig);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', customConfig);
    });

    it('should handle requests with query parameters', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const config = {
        params: {
          page: 1,
          limit: 20,
        },
      };

      mockAxiosInstance.get.mockResolvedValue({ data: { results: [] } });

      await httpClient.get('/test', config);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', config);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle errors without response object', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();

      const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const mockError = {
        message: 'Unknown error',
        config: {
          url: '/test-endpoint',
        },
      };

      await expect(errorInterceptor(mockError)).rejects.toThrow();
    });

    it('should handle errors without config object', async () => {
      const { HttpClient } = await import('../http-client');
      new HttpClient();

      const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const mockError = {
        message: 'Error without config',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };

      await expect(errorInterceptor(mockError)).rejects.toThrow();
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const { HttpClient } = await import('../http-client');
      const httpClient = new HttpClient();
      
      const mockResponses = [
        { data: { id: 1 } },
        { data: { id: 2 } },
        { data: { id: 3 } },
      ];

      mockAxiosInstance.get
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      const promises = [
        httpClient.get('/endpoint1'),
        httpClient.get('/endpoint2'),
        httpClient.get('/endpoint3'),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
    });
  });
});