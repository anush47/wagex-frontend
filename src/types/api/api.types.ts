import { z } from 'zod';

/**
 * User role enumeration
 */
export enum UserRole {
    EMPLOYER = 'EMPLOYER',
    EMPLOYEE = 'EMPLOYEE',
    ADMIN = 'ADMIN',
}

/**
 * Backend user registration request schema
 */
export const registerUserSchema = z.object({
    nameWithInitials: z.string().min(1, 'Name with initials is required'),
    fullName: z.string().min(1, 'Full name is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    role: z.nativeEnum(UserRole),
});

/**
 * Backend user registration request type
 */
export type RegisterUserRequest = z.infer<typeof registerUserSchema>;

/**
 * Backend user registration response schema
 */
export const registerUserResponseSchema = z.object({
    id: z.string(),
    nameWithInitials: z.string(),
    fullName: z.string(),
    address: z.string(),
    phone: z.string(),
    role: z.nativeEnum(UserRole),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

/**
 * Backend user registration response type
 */
export type RegisterUserResponse = z.infer<typeof registerUserResponseSchema>;

/**
 * API error response schema
 */
export const apiErrorSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    error: z.string().optional(),
});

/**
 * API error response type
 */
export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}
