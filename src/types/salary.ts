import { AttendanceSession } from './attendance';

export enum SalaryStatus {
    DRAFT = 'DRAFT',
    APPROVED = 'APPROVED',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    PAID = 'PAID',
}

export enum AdvanceStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    PAID = 'PAID',
    RECOVERED = 'RECOVERED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CHEQUE = 'CHEQUE',
    OTHER = 'OTHER',
}

export interface SalaryComponentResult {
    id: string;
    name: string;
    category: 'ADDITION' | 'DEDUCTION';
    type: 'FLAT' | 'PERCENTAGE';
    value: number;
    amount: number;
}

export interface OTBreakdownItem {
    type: 'NORMAL' | 'DOUBLE' | 'TRIPLE';
    hours: number;
    amount: number;
}

export interface NoPayBreakdownItem {
    type: 'ABSENCE' | 'UNPAID_LEAVE';
    count: number;
    amount: number;
}

export interface Salary {
    id: string;
    employeeId: string;
    companyId: string;
    periodStartDate: string;
    periodEndDate: string;
    payDate: string;
    basicSalary: number;
    otAmount: number;
    otBreakdown: OTBreakdownItem[];
    noPayAmount: number;
    noPayBreakdown: NoPayBreakdownItem[];
    taxAmount: number;
    components: SalaryComponentResult[];
    advanceDeduction: number;
    netSalary: number;
    status: SalaryStatus;
    remarks?: string;
    otAdjustment?: number;
    otAdjustmentReason?: string;
    recoveryAdjustment?: number;
    recoveryAdjustmentReason?: string;
    sessions?: AttendanceSession[];
    employee?: {
        fullName: string;
        employeeNo: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface DeductionScheduleItem {
    periodStartDate: string;
    periodEndDate: string;
    amount: number;
    isDeducted: boolean;
}

export interface SalaryAdvance {
    id: string;
    employeeId: string;
    companyId: string;
    totalAmount: number;
    date: string;
    reason?: string;
    deductionSchedule: DeductionScheduleItem[];
    remainingAmount: number;
    status: AdvanceStatus;
    remarks?: string;
    employee?: {
        fullName: string;
        employeeNo: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: string;
    companyId: string;
    salaryId?: string;
    advanceId?: string;
    amount: number;
    date: string;
    paymentMethod: PaymentMethod;
    referenceNo?: string;
    remarks?: string;
    salary?: Salary;
    advance?: SalaryAdvance;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export interface SalaryQueryParams {
    companyId?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: SalaryStatus;
    page?: number;
    limit?: number;
}

export interface AdvanceQueryParams {
    companyId: string;
}

export interface PaymentQueryParams {
    companyId: string;
}

export interface SalaryPreviewDto {
    companyId: string;
    periodStartDate: string;
    periodEndDate: string;
    employeeIds?: string[];
}
