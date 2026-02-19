
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

export enum EmploymentType {
    PROBATION = 'PROBATION',
    CONTRACT = 'CONTRACT',
    INTERN = 'INTERN',
    PERMANENT = 'PERMANENT',
    TEMPORARY = 'TEMPORARY',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}

export enum MaritalStatus {
    SINGLE = 'SINGLE',
    MARRIED = 'MARRIED',
}

export enum AccrualFrequency {
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    HALF_YEARLY = 'HALF_YEARLY',
    YEARLY = 'YEARLY',
    CUSTOM = 'CUSTOM'
}

export enum EncashmentType {
    MULTIPLIER_BASED = 'MULTIPLIER_BASED',
    FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export enum AccrualMethod {
    PRO_RATA = 'PRO_RATA',           // Calculate based on remaining days in period
    FULL_UPFRONT = 'FULL_UPFRONT'    // Grant full amount at period start
}

export enum HolidayEarnCategory {
    PUBLIC = 'PUBLIC',
    MERCANTILE = 'MERCANTILE',
    BANK = 'BANK'
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
    attendance?: AttendanceConfig;
    salaryComponents?: SalaryComponentsConfig;
    payrollConfiguration?: PayrollSettingsConfig;
    workingDays?: WorkingDaysConfig;
    leaves?: LeavesConfig;
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

// Attendance Types
export enum GeofencingEnforcement {
    STRICT = 'STRICT',
    FLAG_ONLY = 'FLAG_ONLY',
    NONE = 'NONE'
}

export enum ApprovalPolicyMode {
    AUTO_APPROVE = 'AUTO_APPROVE',
    REQUIRE_APPROVAL_ALL = 'REQUIRE_APPROVAL_ALL',
    REQUIRE_APPROVAL_EXCEPTIONS = 'REQUIRE_APPROVAL_EXCEPTIONS'
}

export interface GeoZone {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    address: string;
}

export interface GeofencingConfig {
    enabled: boolean;
    enforcement: GeofencingEnforcement;
    zones: GeoZone[];
}

export interface ExceptionTriggers {
    outsideZone: boolean;
    deviceMismatch: boolean;
    unrecognizedIp?: boolean;
}

export interface ApprovalPolicyConfig {
    mode: ApprovalPolicyMode;
    exceptionTriggers: ExceptionTriggers;
}

export interface CompanyApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsedAt?: string;
}

export interface AttendanceConfig {
    allowSelfCheckIn: boolean;
    requireLocation: boolean;
    requireDeviceInfo: boolean;
    geofencing: GeofencingConfig;
    approvalPolicy: ApprovalPolicyConfig;
    apiKeys: CompanyApiKey[];
}

export interface LeaveType {
    id: string;
    name: string;
    code: string;
    color?: string;
    applicableGenders: Gender[];
    applicableEmploymentTypes: EmploymentType[];
    requiresApproval: boolean;
    approvalRequiredIfConsecutiveMoreThan?: number;

    // Short Leave
    isShortLeave: boolean;
    maxDurationMinutes?: number;

    // Payment Status
    isPaid: boolean;

    // Accrual
    baseAmount: number;
    accrualFrequency: AccrualFrequency;
    accrualMethod: AccrualMethod;
    customFrequencyDays?: number;

    // Rules
    minDelayBetweenRequestsDays?: number;
    minNoticeDays?: number;
    canApplyBackdated?: boolean;
    maxConsecutiveDays?: number;
    requireDocuments?: boolean;
    requireDocumentsIfConsecutiveMoreThan?: number;

    // Carry Over
    canCarryOver: boolean;
    maxCarryOverDays?: number;

    // Encashment
    isEncashable: boolean;
    encashmentType?: EncashmentType;
    encashmentMultiplier?: number;
    fixedAmount?: number;

    // Holiday Replacement
    isHolidayReplacement: boolean;
    earnedOnHolidayCategories?: HolidayEarnCategory[];
}

export interface LeavesConfig {
    leaveTypes: LeaveType[];
}

export interface Policy {
    id: string;
    companyId?: string;
    employeeId?: string;
    settings: PolicySettings;
    createdAt: string;
    updatedAt: string;
}
