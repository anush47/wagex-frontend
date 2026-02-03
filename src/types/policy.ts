
export enum ShiftSelectionPolicy {
    FIXED = 'FIXED',
    CLOSEST_START_TIME = 'CLOSEST_START_TIME',
    MANUAL = 'MANUAL',
    EMPLOYEE_ROSTER = 'EMPLOYEE_ROSTER',
}

export enum PayrollComponentType {
    FLAT_AMOUNT = 'FLAT_AMOUNT',
    PERCENTAGE_BASIC = 'PERCENTAGE_BASIC',
    PERCENTAGE_GROSS = 'PERCENTAGE_GROSS',
}

export enum PayrollComponentCategory {
    ADDITION = 'ADDITION',
    DEDUCTION = 'DEDUCTION'
}

export interface Shift {
    id: string;
    name: string;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm

    // Optional settings
    minStartTime?: string;
    maxOutTime?: string;
    breakTime?: number; // minutes
    gracePeriodLate?: number; // minutes
    gracePeriodEarly?: number; // minutes

    useShiftStartAsClockIn?: boolean;
    autoClockOut?: boolean;
}

export interface ShiftsConfig {
    list?: Shift[];
    defaultShiftId?: string;
    selectionPolicy?: ShiftSelectionPolicy;
}

export interface PayrollComponent {
    id: string;
    name: string;
    category: PayrollComponentCategory;
    type: PayrollComponentType;
    value: number;
    isStatutory?: boolean;
    affectsTotalEarnings?: boolean;
    minCap?: number;
    maxCap?: number;
}

export interface SalaryComponentsConfig {
    components?: PayrollComponent[];
}

export interface PolicySettings {
    shifts?: ShiftsConfig;
    attendance?: any;
    salaryComponents?: SalaryComponentsConfig;
    payrollSettings?: any;
}

export interface Policy {
    id: string;
    companyId?: string;
    employeeId?: string;
    settings: PolicySettings;
    createdAt: string;
    updatedAt: string;
}
