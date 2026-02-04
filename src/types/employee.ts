import { EmploymentType, Gender } from "./policy";

export enum EmployeeStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

export interface Employee {
    id: string;
    employeeNo: number;
    nic: string;
    nameWithInitials: string;
    fullName: string;
    designation?: string;
    joinedDate: string;
    resignedDate?: string;
    remark?: string;
    address?: string;
    phone?: string;
    email?: string;
    basicSalary: number;
    status: EmployeeStatus;
    gender: Gender;
    employmentType: EmploymentType;
    companyId: string;
    managerId?: string;
    userId?: string;
    // Optional joined data
    company?: {
        id: string;
        name: string;
    };
    user?: {
        id: string;
        email: string;
        active: boolean;
    };
    canSelfEdit?: boolean;
    photo?: string;
    files?: any[];
}
