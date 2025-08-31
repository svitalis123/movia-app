import axios from 'axios';
import { APIError, NetworkError } from '../types';

// Simple configuration interface
interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

// Default configuration
const DEFAULT_CONFIG: HttpClientConfig = {
  baseURL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};

// Retry configuration for different HTTP methods
const RETRY_CONFIG = {
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableMethods: ['GET', 'HEAD', 'OPTIONS'],
};

/**
 * HTTP Client class that provides a configured Axios instance with:
 * - Request/response interceptors
 * - Error handling
 * - Retry logic
 * - Timeout configuration
 */
class HttpClient {
  private axiosInstance: any; // Using any to avoid type issues
  private config: HttpClientConfig;

  constructor(config: Partial<HttpClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Creates and configures the Axios instance
   */
  private createAxiosInstance() {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Sets up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - adds API key to all requests
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        // Add API key to all requests
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (apiKey) {
          config.params = {
            ...config.params,
            api_key: apiKey,
          };
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: Date.now() };

        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          timeout: config.timeout,
        });

        return config;
      },
      (error: any) => {
        console.error('[HTTP] Request error:', error);
        return Promise.reject(this.handleRequestError(error));
      }
    );

    // Response interceptor - handles responses and errors
    this.axiosInstance.interceptors.response.use(
      (response: any) => {
        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        console.log(`[HTTP] ${response.status} ${response.config.url} (${duration}ms)`);
        return response;
      },
      async (error: any) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Handles request errors
   */
  private handleRequestError(error: any): Error {
    if (error.code === 'ECONNABORTED') {
      return new NetworkError('Request timeout');
    }
    if (error.code === 'ERR_NETWORK') {
      return new NetworkError('Network error - please check your connection');
    }
    return new APIError('Request failed', 0, error.config?.url || 'unknown');
  }

  /**
   * Handles response errors with retry logic
   */
  private async handleResponseError(error: any): Promise<never> {
    const { config, response } = error;
    
    // Log the error
    console.error('[HTTP] Response error:', {
      status: response?.status,
      url: config?.url,
      message: error.message,
    });

    // Check if we should retry the request
    if (this.shouldRetry(error)) {
      return this.retryRequest(error);
    }

    // Transform error to our custom error types
    throw this.transformError(error);
  }

  /**
   * Determines if a request should be retried
   */
  private shouldRetry(error: any): boolean {
    const { config, response } = error;
    
    // Don't retry if no config or already exceeded max retries
    if (!config || config.__retryCount >= this.config.retries) {
      return false;
    }

    // Only retry specific HTTP methods
    if (!RETRY_CONFIG.retryableMethods.includes(config.method?.toUpperCase() || '')) {
      return false;
    }

    // Retry on network errors
    if (!response) {
      return true;
    }

    // Retry on specific status codes
    return RETRY_CONFIG.retryableStatuses.includes(response.status);
  }

  /**
   * Retries a failed request with exponential backoff
   */
  private async retryRequest(error: any): Promise<never> {
    const config = error.config;
    const retryCount = config.__retryCount || 0;
    
    config.__retryCount = retryCount + 1;

    // Calculate delay with exponential backoff
    const delay = this.config.retryDelay * Math.pow(2, retryCount);
    
    console.log(`[HTTP] Retrying request (${retryCount + 1}/${this.config.retries}) after ${delay}ms`);

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));

    // Retry the request
    return this.axiosInstance.request(config);
  }

  /**
   * Transforms Axios errors to our custom error types
   */
  private transformError(error: any): Error {
    const { response, config } = error;

    if (!response) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        return new NetworkError('Request timeout');
      }
      return new NetworkError('Network error - please check your connection');
    }

    // API error with response
    const status = response.status;
    const endpoint = config?.url || 'unknown';
    
    // Handle specific status codes
    switch (status) {
      case 401:
        return new APIError('Invalid API key', status, endpoint, 'UNAUTHORIZED');
      case 404:
        return new APIError('Resource not found', status, endpoint, 'NOT_FOUND');
      case 429:
        return new APIError('Rate limit exceeded', status, endpoint, 'RATE_LIMITED');
      case 500:
        return new APIError('Server error', status, endpoint, 'SERVER_ERROR');
      default:
        const message = response.data?.status_message || error.message || 'Request failed';
        return new APIError(message, status, endpoint);
    }
  }

  /**
   * Public methods for making HTTP requests
   */
  
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Gets the underlying Axios instance for advanced usage
   */
  getAxiosInstance() {
    return this.axiosInstance;
  }

  /**
   * Updates the configuration
   */
  updateConfig(newConfig: Partial<HttpClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update Axios instance configuration
    this.axiosInstance.defaults.baseURL = this.config.baseURL;
    this.axiosInstance.defaults.timeout = this.config.timeout;
  }
}

// Create and export a singleton instance
export const httpClient = new HttpClient();

// Export the class for testing and custom instances
export { HttpClient };
export type { HttpClientConfig };
