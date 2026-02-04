export enum Role {
    ADMIN = 'ADMIN',
    EMPLOYER = 'EMPLOYER',
    EMPLOYEE = 'EMPLOYEE',
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    nameWithInitials: string;
    fullName: string;
    address?: string;
    phone?: string;
    role: Role;
}
