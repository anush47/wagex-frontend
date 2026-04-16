import { backendApiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import {
    registerUserSchema,
    registerUserResponseSchema,
    type RegisterUserRequest,
    type RegisterUserResponse,
    type ApiResponse,
} from '@/types/api';

/**
 * User service for backend API operations
 * Handles user registration and profile management
 */
export class UserService {
    /**
     * Register a new user with the backend
     */
    async register(data: RegisterUserRequest): Promise<ApiResponse<RegisterUserResponse>> {
        try {
            // Validate request data
            const validatedData = registerUserSchema.parse(data);

            logger.info('Registering user', { role: validatedData.role });

            const response = await backendApiClient.post<RegisterUserResponse>(
                '/auth/register',
                validatedData
            );

            if (response.error) {
                return response;
            }

            // Validate response data
            if (response.data) {
                const validatedResponse = registerUserResponseSchema.parse(response.data);
                logger.info('User registered successfully', { userId: validatedResponse.id });
                return { data: validatedResponse };
            }

            return response;
        } catch (error) {
            logger.error('User registration failed', error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Registration failed',
                    statusCode: 400,
                },
            };
        }
    }

    /**
     * Get a list of users based on query parameters (Admin only mostly)
     */
    async getUsers(query: Record<string, string | number | boolean> = {}): Promise<ApiResponse<any>> {
        try {
            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });

            return await backendApiClient.get<any>(`/users?${params.toString()}`);
        } catch (error) {
            logger.error('Failed to get users', error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    statusCode: 500,
                },
            };
        }
    }

    /**
     * Update any user (Admin only)
     */
    async updateUser(id: string, data: any): Promise<ApiResponse<any>> {
        try {
            return await backendApiClient.put<any>(`/users/${id}`, data);
        } catch (error) {
            logger.error('Failed to update user', error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    statusCode: 500,
                },
            };
        }
    }
}

/**
 * Singleton instance of UserService
 */
export const userService = new UserService();
