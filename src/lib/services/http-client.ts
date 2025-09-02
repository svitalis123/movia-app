/* eslint-disable @typescript-eslint/no-explicit-any */
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
  private axiosInstance: any;
  private config: HttpClientConfig;

  constructor(config: Partial<HttpClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  private createAxiosInstance() {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (apiKey) {
          config.params = {
            ...config.params,
            api_key: apiKey,
          };
        }

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

    this.axiosInstance.interceptors.response.use(
      (response: any) => {
        const duration =
          Date.now() - (response.config.metadata?.startTime || 0);
        console.log(
          `[HTTP] ${response.status} ${response.config.url} (${duration}ms)`
        );
        return response;
      },
      async (error: any) => {
        return this.handleResponseError(error);
      }
    );
  }

  private handleRequestError(error: any): Error {
    if (error.code === 'ECONNABORTED') {
      return new NetworkError('Request timeout');
    }
    if (error.code === 'ERR_NETWORK') {
      return new NetworkError('Network error - please check your connection');
    }
    return new APIError('Request failed', 0, error.config?.url || 'unknown');
  }

  private async handleResponseError(error: any): Promise<any> {
    const { config, response } = error;

    console.error('[HTTP] Response error:', {
      status: response?.status,
      url: config?.url,
      message: error.message,
    });

    if (this.shouldRetry(error)) {
      return this.retryRequest(error);
    }

    throw this.transformError(error);
  }

  private shouldRetry(error: any): boolean {
    const { config, response } = error;

    if (!config || config.__retryCount >= this.config.retries) {
      return false;
    }

    if (
      !RETRY_CONFIG.retryableMethods.includes(
        config.method?.toUpperCase() || ''
      )
    ) {
      return false;
    }

    if (!response) {
      return true;
    }

    return RETRY_CONFIG.retryableStatuses.includes(response.status);
  }

  private async retryRequest(error: any): Promise<any> {
    const config = error.config;
    const retryCount = config.__retryCount || 0;

    config.__retryCount = retryCount + 1;

    const delay = this.config.retryDelay * Math.pow(2, retryCount);

    console.log(
      `[HTTP] Retrying request (${retryCount + 1}/${this.config.retries}) after ${delay}ms`
    );

    await new Promise((resolve) => setTimeout(resolve, delay));

    return this.axiosInstance.request(config);
  }

  private transformError(error: any): Error {
    const { response, config } = error;

    if (!response) {
      if (error.code === 'ECONNABORTED') {
        return new NetworkError('Request timeout');
      }
      return new NetworkError('Network error - please check your connection');
    }

    const status = response.status;
    const endpoint = config?.url || 'unknown';

    switch (status) {
      case 401:
        return new APIError(
          'Invalid API key',
          status,
          endpoint,
          'UNAUTHORIZED'
        );
      case 404:
        return new APIError(
          'Resource not found',
          status,
          endpoint,
          'NOT_FOUND'
        );
      case 429:
        return new APIError(
          'Rate limit exceeded',
          status,
          endpoint,
          'RATE_LIMITED'
        );
      case 500:
        return new APIError('Server error', status, endpoint, 'SERVER_ERROR');
      default:
        const message =
          response.data?.status_message || error.message || 'Request failed';
        return new APIError(message, status, endpoint);
    }
  }

  // Fixed the problematic method - line 180
  async request(config: any): Promise<any> {
    return this.axiosInstance.request(config);
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  getAxiosInstance() {
    return this.axiosInstance;
  }

  updateConfig(newConfig: Partial<HttpClientConfig>): void {
    this.config = { ...this.config, ...newConfig };

    this.axiosInstance.defaults.baseURL = this.config.baseURL;
    this.axiosInstance.defaults.timeout = this.config.timeout;
  }
}

export const httpClient = new HttpClient();
export { HttpClient };
export type { HttpClientConfig };
