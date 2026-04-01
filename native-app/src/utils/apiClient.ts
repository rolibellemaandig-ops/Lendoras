import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://your-backend-url.com'; // Update this with your actual backend URL

interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private requestCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor(config: ApiConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: config.headers,
    });

    // Add request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle token expiry
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  private getCacheKey(method: string, url: string, params?: any): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  private getCachedResponse(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.requestCache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.requestCache.get(key) || null;
  }

  private setCachedResponse(key: string, data: any, ttlMs: number = 300000): void {
    this.requestCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttlMs);
  }

  async get<T = any>(
    url: string,
    config?: { params?: any; useCache?: boolean; cacheTtl?: number }
  ): Promise<T> {
    const cacheKey = this.getCacheKey('GET', url, config?.params);

    if (config?.useCache !== false) {
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.axiosInstance.get<T>(url, {
        params: config?.params,
      });

      if (config?.useCache !== false) {
        this.setCachedResponse(cacheKey, response.data, config?.cacheTtl);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  clearCache(): void {
    this.requestCache.clear();
    this.cacheExpiry.clear();
  }
}

export const apiClient = new ApiClient({
  baseURL: API_URL,
  timeout: 10000,
});

export default apiClient;
