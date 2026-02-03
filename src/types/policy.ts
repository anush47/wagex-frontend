
export enum ShiftSelectionPolicy {
    FIXED = 'FIXED',
    CLOSEST_START_TIME = 'CLOSEST_START_TIME',
    MANUAL = 'MANUAL',
    EMPLOYEE_ROSTER = 'EMPLOYEE_ROSTER',
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

export interface PolicySettings {
    shifts?: ShiftsConfig;
    attendance?: any;
    payroll?: any;
}

export interface Policy {
    id: string;
    companyId?: string;
    employeeId?: string;
    settings: PolicySettings;
    createdAt: string;
    updatedAt: string;
}
