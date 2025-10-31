/**
 * HTTP client wrapper for backend API
 * Handles CSRF token management, request/response transformation, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  CsrfTokenError,
  RateLimitError,
  DuplicateOrderError,
  NotFoundError,
  ValidationError,
  ApiClientError,
} from '@/types/errors';
import { logger } from '@/utils/logger';
import { getConfig } from '@/utils/config';

/**
 * Backend API client
 * Wraps the legacy PHP endpoints with a clean TypeScript interface
 */
export class BackendApiClient {
  private axiosInstance: AxiosInstance;
  private csrfToken: string | null = null;
  private csrfTokenRefreshTimer: NodeJS.Timeout | null = null;
  private readonly config = getConfig();

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.config.backendApi.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.startCsrfTokenRefresh();
  }

  /**
   * Setup axios interceptors for error handling
   */
  private setupInterceptors(): void {
    // Request interceptor - add CSRF token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.csrfToken && config.headers) {
          config.headers['X-CSRF-Token'] = this.csrfToken;
        }
        return config;
      },
      (error) => {
        logger.error('Request error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        return this.handleError(error);
      }
    );
  }

  /**
   * Handle API errors and transform to custom error types
   */
  private handleError(error: unknown): Promise<never> {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 403) {
        if (message?.includes('1 Order per minute') || message?.includes('Maximum')) {
          throw new RateLimitError(message);
        }
        throw new CsrfTokenError();
      }

      if (status === 409) {
        throw new DuplicateOrderError(message);
      }

      if (status === 404) {
        throw new NotFoundError(message);
      }

      if (status === 400) {
        throw new ValidationError(message, error.response?.data);
      }

      throw new ApiClientError(
        message || 'API request failed',
        'API_ERROR',
        status,
        error.response?.data
      );
    }

    throw new ApiClientError('Unknown error occurred', 'UNKNOWN_ERROR');
  }

  /**
   * Refresh CSRF token
   */
  private async refreshCsrfToken(): Promise<void> {
    try {
      const response = await axios.get(`${this.config.backendApi.baseUrl}/ajax/refresh_token.php`);
      this.csrfToken = response.data.csrf_token;
      logger.debug('CSRF token refreshed');
    } catch (error) {
      logger.error('Failed to refresh CSRF token', error);
      throw new CsrfTokenError('Failed to refresh CSRF token');
    }
  }

  /**
   * Start periodic CSRF token refresh
   */
  private startCsrfTokenRefresh(): void {
    this.refreshCsrfToken().catch((error) => {
      logger.error('Initial CSRF token refresh failed', error);
    });

    this.csrfTokenRefreshTimer = setInterval(() => {
      this.refreshCsrfToken().catch((error) => {
        logger.error('Periodic CSRF token refresh failed', error);
      });
    }, this.config.backendApi.csrfTokenRefreshInterval);
  }

  /**
   * Stop CSRF token refresh timer
   */
  public stop(): void {
    if (this.csrfTokenRefreshTimer) {
      clearInterval(this.csrfTokenRefreshTimer);
      this.csrfTokenRefreshTimer = null;
    }
  }

  /**
   * Set CSRF token manually (e.g., from page source)
   */
  public setCsrfToken(token: string): void {
    this.csrfToken = token;
  }

  /**
   * Make GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * Make POST request with URL-encoded form data
   */
  public async postForm<T>(
    url: string,
    data: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, String(item)));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await this.axiosInstance.post<T>(url, formData.toString(), {
      ...config,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...config?.headers,
      },
    });
    return response.data;
  }

  /**
   * Make POST request with JSON data
   */
  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make POST request with FormData (multipart)
   */
  public async postFormData<T>(
    url: string,
    data: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  }
}

/**
 * Singleton instance
 */
let apiClientInstance: BackendApiClient | null = null;

/**
 * Get the backend API client instance
 */
export function getApiClient(): BackendApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new BackendApiClient();
  }
  return apiClientInstance;
}
