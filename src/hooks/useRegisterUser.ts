import { useMutation } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { logger } from '@/lib/utils/logger';
import type { RegisterUserRequest, RegisterUserResponse } from '@/types/api';

/**
 * React Query hook for user registration with backend
 */
export function useRegisterUser() {
    return useMutation({
        mutationFn: async (data: RegisterUserRequest) => {
            const response = await userService.register(data);

            if (response.error) {
                throw new Error(response.error.message);
            }

            if (!response.data) {
                throw new Error('No data returned from registration');
            }

            return response.data;
        },
        onSuccess: (data: RegisterUserResponse) => {
            logger.info('User registered with backend', { userId: data.id });
        },
        onError: (error: Error) => {
            logger.error('Backend registration failed', error);
        },
    });
}
