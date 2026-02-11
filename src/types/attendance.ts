// Enums
export enum EventType {
    IN = 'IN',
    OUT = 'OUT'
}

export enum EventSource {
    WEB = 'WEB',
    API_KEY = 'API_KEY',
    MANUAL = 'MANUAL'
}

export enum EventStatus {
    ACTIVE = 'ACTIVE',
    REJECTED = 'REJECTED',
    IGNORED = 'IGNORED'
}

export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export enum SessionWorkDayStatus {
    FULL = 'FULL',
    HALF_FIRST = 'HALF_FIRST',
    HALF_LAST = 'HALF_LAST',
    OFF = 'OFF'
}

// Attendance Event (Raw Log)
export interface AttendanceEvent {
    id: string;
    employeeId: string;
    companyId: string;
    eventTime: string; // ISO DateTime
    eventType: EventType;
    source: EventSource;
    apiKeyName?: string;
    device?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    status: EventStatus;
    sessionId?: string;
    manualOverride: boolean;
    remark?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    employee?: {
        id: string;
        employeeNo: number;
        nameWithInitials: string;
        fullName: string;
        photo?: string;
    };
}

// Attendance Session (Processed Daily Record)
export interface AttendanceSession {
    id: string;
    employeeId: string;
    companyId: string;
    date: string; // ISO Date
    // Shift snapshot
    shiftId?: string;
    shiftName?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    shiftBreakMinutes?: number;
    // Times
    checkInTime?: string;
    checkOutTime?: string;
    // Location snapshots
    checkInLocation?: string;
    checkInLatitude?: number;
    checkInLongitude?: number;
    checkOutLocation?: string;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
    // Calculations
    totalMinutes?: number;
    breakMinutes?: number;
    workMinutes?: number;
    overtimeMinutes?: number;
    // Status flags
    isLate: boolean;
    isEarlyLeave: boolean;
    isOnLeave: boolean;
    isHalfDay: boolean;
    hasShortLeave: boolean;
    // Additional flags
    manuallyEdited: boolean;
    autoCheckout: boolean;
    additionalInOutCount?: number;
    isBreakOverrideActive: boolean;
    workDayStatus: SessionWorkDayStatus;
    // Approval
    inApprovalStatus: ApprovalStatus;
    outApprovalStatus: ApprovalStatus;
    approvedById?: string;
    approvedAt?: string;
    // Notes
    remarks?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    employee?: {
        id: string;
        employeeNo: number;
        nameWithInitials: string;
        fullName: string;
        photo?: string;
    };
    workHolidayId?: string;
    workHoliday?: {
        id: string;
        name: string;
        date: string;
        isPublic: boolean;
        isMercantile: boolean;
        isBank: boolean;
    };
    payrollHolidayId?: string;
    payrollHoliday?: {
        id: string;
        name: string;
        date: string;
        isPublic: boolean;
        isMercantile: boolean;
        isBank: boolean;
    };
}

// DTOs
export interface CreateEventDto {
    employeeId?: string;
    employeeNo?: number;
    eventTime: string; // ISO DateTime
    eventType: EventType;
    device?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    remark?: string;
}

export interface UpdateSessionDto {
    checkInTime?: string | null;
    checkOutTime?: string | null;
    totalMinutes?: number;
    breakMinutes?: number;
    workMinutes?: number;
    overtimeMinutes?: number;
    isLate?: boolean;
    isEarlyLeave?: boolean;
    remarks?: string;
    inApprovalStatus?: ApprovalStatus;
    outApprovalStatus?: ApprovalStatus;
    workDayStatus?: SessionWorkDayStatus;
    shiftId?: string | null;
    isBreakOverrideActive?: boolean;
}

// Query params
export interface SessionQueryParams {
    companyId?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    isPending?: boolean;
}

export interface EventQueryParams {
    companyId?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: EventStatus;
    page?: number;
    limit?: number;
}

// API Responses
export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}
