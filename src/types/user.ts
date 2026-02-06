export enum Role {
    ADMIN = 'ADMIN',
    EMPLOYER = 'EMPLOYER',
    EMPLOYEE = 'EMPLOYEE',
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface UserProfile {
    id: string;
    email: string;
    role?: Role;
    active?: boolean;
    nameWithInitials?: string;
    fullName?: string;
    address?: string;
    phone?: string;
    created_at?: string;
}

export interface RegisterData {
    nameWithInitials: string;
    fullName: string;
    address?: string;
    phone?: string;
}
