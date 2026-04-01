/**
 * Enhanced API Client with comprehensive error handling
 * Includes request logging, retry logic, caching, and timeout handling
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from './logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Custom error class
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public originalError?: AxiosError
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface RequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _retryDelay?: number;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private hasActiveNetwork: boolean = true;
  private requestInterceptorId?: number;
  private responseInterceptorId?: number;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupNetworkListener();
  }

  private setupInterceptors() {
    // Request interceptor
    this.requestInterceptorId = this.axiosInstance.interceptors.request.use(
      async (config: RequestConfig) => {
        log.debug('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
        });

        // Add auth token
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        config._retryCount = config._retryCount || 0;
        config._retryDelay = config._retryDelay || 1000;

        return config;
      },
      (error) => {
        log.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.responseInterceptorId = this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        log.debug('API Response:', {
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data).length,
        });
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as RequestConfig;

        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
          log.warn('Unauthorized (401) - clearing auth token');
          await AsyncStorage.removeItem('authToken');
          // Could navigate to login here
        }

        // Retry logic for network errors and 5xx errors
        if (
          config &&
          (error.code === 'ECONNABORTED' ||
            !error.response ||
            (error.response?.status >= 500 &&
              error.response?.status < 600))
        ) {
          config._retryCount = (config._retryCount || 0) + 1;

          if (config._retryCount <= 3) {
            const delay = config._retryDelay! * Math.pow(2, config._retryCount - 1);
            log.warn(`Retrying request (attempt ${config._retryCount}):`, {
              url: config.url,
              delay,
            });

            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.axiosInstance(config);
          }
        }

        // Log error details
        const errorMessage =
          error.response?.data?.message || error.message || 'Unknown error';
        log.error('API Error:', {
          status: error.response?.status,
          message: errorMessage,
          url: config?.url,
          data: error.response?.data,
        });

        throw new ApiError(
          error.response?.status || 0,
          errorMessage,
          error
        );
      }
    );
  }

  private setupNetworkListener() {
    // TODO: Integrate with @react-native-community/netinfo
    // This is a placeholder
    this.hasActiveNetwork = true;
  }

  private getCacheKey(method: string, url: string, params?: any): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  async get<T = any>(
    url: string,
    config?: {
      params?: any;
      useCache?: boolean;
      cacheTtl?: number;
    }
  ): Promise<T> {
    const cacheKey = this.getCacheKey('GET', url, config?.params);

    // Check cache
    if (config?.useCache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        log.debug('Cache hit:', { url });
        return cached.data;
      }
    }

    // Deduplicate requests
    if (this.pendingRequests.has(cacheKey)) {
      log.debug('Returning pending request:', { url });
      return this.pendingRequests.get(cacheKey)!;
    }

    const promise = this.axiosInstance
      .get<T>(url, { params: config?.params })
      .then((response) => {
        // Cache the response
        if (config?.useCache !== false) {
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
            ttl: config?.cacheTtl || 5 * 60 * 1000, // 5 minutes default
          });
        }
        return response.data;
      })
      .finally(() => {
        this.pendingRequests.delete(cacheKey);
      });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Request failed', error as AxiosError);
    }
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Request failed', error as AxiosError);
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Request failed', error as AxiosError);
    }
  }

  async delete<T = any>(
    url: string,
    config?: any
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Request failed', error as AxiosError);
    }
  }

  clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      log.debug('Cache cleared');
      return;
    }

    // Clear cache entries matching pattern
    const entries = Array.from(this.cache.keys()).filter((key) =>
      key.includes(pattern)
    );
    entries.forEach((key) => this.cache.delete(key));
    log.debug('Cache cleared for pattern:', { pattern, count: entries.length });
  }

  getCacheStats() {
    return {
      totalEntries: this.cache.size,
      cacheSize: JSON.stringify(Array.from(this.cache.values())).length,
    };
  }

  setBaseURL(url: string) {
    this.axiosInstance.defaults.baseURL = url;
    log.info('API base URL changed:', { url });
  }

  getBaseURL(): string {
    return this.axiosInstance.defaults.baseURL || API_URL;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
