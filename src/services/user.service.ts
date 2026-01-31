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
}

/**
 * Singleton instance of UserService
 */
export const userService = new UserService();
