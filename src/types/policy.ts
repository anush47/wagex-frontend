
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

export enum PayCycleFrequency {
    MONTHLY = 'MONTHLY',
    SEMI_MONTHLY = 'SEMI_MONTHLY',
    BI_WEEKLY = 'BI_WEEKLY',
    WEEKLY = 'WEEKLY',
    DAILY = 'DAILY'
}

export enum PayrollCalculationMethod {
    HOURLY_ATTENDANCE_WITH_OT = 'HOURLY_ATTENDANCE_WITH_OT',
    SHIFT_ATTENDANCE_WITH_OT = 'SHIFT_ATTENDANCE_WITH_OT',
    SHIFT_ATTENDANCE_FLAT = 'SHIFT_ATTENDANCE_FLAT',
    DAILY_ATTENDANCE_FLAT = 'DAILY_ATTENDANCE_FLAT',
    FIXED_MONTHLY_SALARY = 'FIXED_MONTHLY_SALARY'
}

export enum UnpaidLeaveAction {
    DEDUCT_FROM_TOTAL = 'DEDUCT_FROM_TOTAL',
    ADD_AS_DEDUCTION = 'ADD_AS_DEDUCTION'
}

export interface PayrollSettingsConfig {
    frequency: PayCycleFrequency;
    runDay: string;
    runDayAnchor?: string;
    cutoffDaysBeforePayDay: number;
    calculationMethod: PayrollCalculationMethod;
    baseRateDivisor: number;

    // Deduction Rules
    autoDeductUnpaidLeaves: boolean;
    unpaidLeaveAction: UnpaidLeaveAction;
    lateDeductionType: LateDeductionType;
    lateDeductionValue: number;
}

export enum LateDeductionType {
    DIVISOR_BASED = 'DIVISOR_BASED',
    FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export interface PolicySettings {
    shifts?: ShiftsConfig;
    attendance?: any;
    salaryComponents?: SalaryComponentsConfig;
    payrollConfiguration?: PayrollSettingsConfig;
    workingDays?: WorkingDaysConfig;
}

export enum WorkDayType {
    FULL = 'FULL',
    HALF = 'HALF',
    OFF = 'OFF'
}

export enum HalfDayShift {
    FIRST = 'FIRST',
    LAST = 'LAST'
}

export interface DailyWorkConfig {
    type: WorkDayType;
    halfDayShift?: HalfDayShift;
}

export interface WorkingDaysConfig {
    defaultPattern?: Record<string, DailyWorkConfig>;
    isDynamic?: boolean;
    workingCalendar?: string;
    payrollCalendar?: string;
}

export interface Policy {
    id: string;
    companyId?: string;
    employeeId?: string;
    settings: PolicySettings;
    createdAt: string;
    updatedAt: string;
}
