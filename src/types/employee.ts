import { EmploymentType, Gender, MaritalStatus } from "./policy";
import { CompanyFile } from "./company";

export enum EmployeeStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    DELETED = 'DELETED'
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
    policyId?: string | null;

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
    department?: {
        id: string;
        name: string;
    };
    manager?: {
        id: string;
        fullName: string;
        employeeNo: number;
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
