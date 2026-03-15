import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import type { ApiError, ApiResponse } from '@/types/api';

/**
 * HTTP client configuration
 */
interface RequestConfig extends RequestInit {
    params?: Record<string, string>;
}

type ErrorInterceptor = (error: ApiError) => void | Promise<void>;
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * Base API client class with interceptors and error handling
 */
class ApiClient {
    private baseURL: string;
    private defaultHeaders: HeadersInit;
    private errorInterceptors: ErrorInterceptor[] = [];
    private requestInterceptors: RequestInterceptor[] = [];

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
     * Add an error interceptor
     */
    addErrorInterceptor(interceptor: ErrorInterceptor): void {
        this.errorInterceptors.push(interceptor);
    }

    /**
     * Add a request interceptor
     */
    addRequestInterceptor(interceptor: RequestInterceptor): void {
        this.requestInterceptors.push(interceptor);
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
        const { params, headers: configHeaders, ...restConfig } = config;
        const url = this.buildURL(endpoint, params);

        // Merge headers properly. If configHeaders is provided, it should take precedence.
        // Special care for properties we want to OMIT (set as undefined in configHeaders)
        const mergedHeaders = {
            ...this.defaultHeaders,
            ...configHeaders,
        };

        // Filter out any undefined headers (this allows us to omit Content-Type in postRaw)
        const finalHeaders = Object.fromEntries(
            Object.entries(mergedHeaders).filter(([_, v]) => v !== undefined)
        );

        try {
            logger.debug('API Request', { url, method: config.method || 'GET' });

            let finalConfig = { ...restConfig };
            for (const interceptor of this.requestInterceptors) {
                const result = await interceptor({ ...finalConfig, headers: finalHeaders } as any);
                finalConfig = { ...result };
            }

            const response = await fetch(url, {
                ...finalConfig,
                headers: finalHeaders as HeadersInit,
            });

            const jsonData = await response.json();

            if (!response.ok) {
                const error: ApiError = {
                    message: jsonData.message || 'An error occurred',
                    statusCode: response.status,
                    error: jsonData.error,
                };

                // Run error interceptors
                for (const interceptor of this.errorInterceptors) {
                    await interceptor(error);
                }

                // Don't log expected registration-required flow as an error
                if (!(response.status === 403 && jsonData.message === 'User registration required')) {
                    logger.error('API Error', error);
                }

                return { error };
            }

            logger.debug('API Response', { url, status: response.status });

            // Unwrap backend's { statusCode, data } response if present
            const finalData = (jsonData && typeof jsonData === 'object' && 'data' in jsonData && 'statusCode' in jsonData)
                ? jsonData.data
                : jsonData;

            return { data: finalData };
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
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        body?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    /**
     * POST request for raw data (like FormData)
     */
    async postRaw<T>(
        endpoint: string,
        body: FormData,
        config: RequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const { headers, ...restConfig } = config;

        return this.request<T>(endpoint, {
            ...restConfig,
            method: 'POST',
            body,
            headers: {
                ...headers,
                'Content-Type': undefined, // Explicitly omit to let fetch/browser handle it for FormData
            } as any,
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
