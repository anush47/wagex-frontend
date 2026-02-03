import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import type { ApiError, ApiResponse } from '@/types/api';

/**
 * HTTP client configuration
 */
interface RequestConfig extends RequestInit {
    params?: Record<string, string>;
}

/**
 * Base API client class with interceptors and error handling
 */
class ApiClient {
    private baseURL: string;
    private defaultHeaders: HeadersInit;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
        };
    }

    /**
     * Set authorization token for authenticated requests
     */
    setAuthToken(token: string | null): void {
        if (token) {
            this.defaultHeaders = {
                ...this.defaultHeaders,
                'Authorization': `Bearer ${token}`,
            };
        } else {
            const { Authorization, ...rest } = this.defaultHeaders as Record<string, string>;
            this.defaultHeaders = rest;
        }
    }

    /**
     * Build URL with query parameters
     */
    private buildURL(endpoint: string, params?: Record<string, string>): string {
        // Ensure endpoint doesn't start with / to avoid resetting baseUrl if it's absolute-looking
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        const url = new URL(cleanEndpoint, this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.append(key, value);
                }
            });
        }
        return url.toString();
    }

    /**
     * Generic request handler with error handling
     */
    private async request<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const { params, headers, ...restConfig } = config;
        const url = this.buildURL(endpoint, params);

        try {
            logger.debug('API Request', { url, method: config.method || 'GET' });

            const response = await fetch(url, {
                ...restConfig,
                headers: {
                    ...this.defaultHeaders,
                    ...headers,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                const error: ApiError = {
                    message: data.message || 'An error occurred',
                    statusCode: response.status,
                    error: data.error,
                };
                logger.error('API Error', error);
                return { error };
            }

            logger.debug('API Response', { url, status: response.status });
            return { data };
        } catch (error) {
            logger.error('Network Error', error);
            return {
                error: {
                    message: 'Network error occurred',
                    statusCode: 0,
                },
            };
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        body?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        body?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }
}

/**
 * Singleton instance of API client for backend
 */
export const backendApiClient = new ApiClient(env.backend.apiUrl);
