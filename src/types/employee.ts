import { EmploymentType, Gender, MaritalStatus } from "./policy";

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
    departmentId?: string;
    userId?: string;

    // Split Details
    details?: {
        id: string;
        employeeId: string;

        // Bank Details
        bankName?: string;
        bankBranch?: string;
        accountNumber?: string;

        // Personal & Family Details
        mothersName?: string;
        fathersName?: string;
        maritalStatus: MaritalStatus;
        spouseName?: string;
        nationality?: string;

        // Emergency Contact
        emergencyContactName?: string;
        emergencyContactPhone?: string;
    };
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
    files?: CompanyFile[];
    createdAt?: string;
    updatedAt?: string;
}
