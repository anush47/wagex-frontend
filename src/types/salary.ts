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

export enum PaymentStatus {
    PENDING_ACKNOWLEDGEMENT = 'PENDING_ACKNOWLEDGEMENT',
    ACKNOWLEDGED = 'ACKNOWLEDGED',
}

export interface SalaryComponentResult {
    id: string;
    name: string;
    category: 'ADDITION' | 'DEDUCTION';
    type: 'FLAT' | 'PERCENTAGE' | 'FLAT_AMOUNT' | 'PERCENTAGE_TOTAL_EARNINGS';
    value: number;
    amount: number;
    affectsTotalEarnings?: boolean;
    isStatutory?: boolean;
    systemType?: string;
    employerAmount?: number;
}

export interface OTBreakdownItem {
    type: 'NORMAL' | 'DOUBLE' | 'TRIPLE';
    hours: number;
    amount: number;
}

export interface HolidayPayBreakdownItem {
    holidayName: string;
    holidayDate: string;
    hours: number;
    amount: number;
    affectTotalEarnings: boolean;
}

export interface NoPayBreakdownItem {
    type: 'ABSENCE' | 'UNPAID_LEAVE';
    count: number;
    amount: number;
}

export interface AdvanceRecoveryAdjustment {
    advanceId: string;
    amount: number;
    reason?: string;
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
    holidayPayAmount: number;
    holidayPayBreakdown: HolidayPayBreakdownItem[];
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
    lateDeduction?: number;
    lateAdjustment?: number;
    lateAdjustmentReason?: string;
    holidayPayAdjustment?: number;
    holidayPayAdjustmentReason?: string;
    recoveryAdjustment?: number;
    recoveryAdjustmentReason?: string;
    approvedById?: string;
    approvedAt?: string;
    approvedBy?: {
        fullName: string;
    };
    advanceAdjustments?: AdvanceRecoveryAdjustment[];
    sessions?: AttendanceSession[];
    employee?: {
        id: string;
        fullName: string;
        employeeNo: number;
        basicSalary: number;
        policy?: {
            name: string;
            settings: any;
        }
    };
    payments?: Payment[];
    epfRecords?: any[];
    etfRecords?: any[];
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
        id: string;
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
    status: PaymentStatus;
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
    excludeEpf?: boolean;
    excludeEtf?: boolean;
    search?: string;
    month?: number;
    year?: number;
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
    attendanceStartDate?: string;
    attendanceEndDate?: string;
    payDate?: string;
    employeeIds?: string[];
}
