import { EmploymentType, Gender } from "./policy";

export enum EmployeeStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface Employee {
    id: string;
    employeeNo: string;
    name: string;
    email?: string;
    basicSalary: number;
    status: EmployeeStatus;
    gender: Gender;
    employmentType: EmploymentType;
    companyId: string;
    managerId?: string;
    userId?: string;
    createdAt: string;
    updatedAt: string;

    // Optional joined data
    company?: {
        id: string;
        name: string;
    };
}
