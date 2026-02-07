export enum AttendanceSource {
    WEB = 'WEB',
    API_KEY = 'API_KEY',
    MANUAL = 'MANUAL',
}

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    LATE = 'LATE',
    EARLY_LEAVE = 'EARLY_LEAVE',
    ABSENT = 'ABSENT',
    ON_LEAVE = 'ON_LEAVE',
    HALF_DAY = 'HALF_DAY',
}

export enum AttendanceApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}


export interface AttendanceLog {
    id: string;
    employeeId: string;
    companyId: string;
    timestamp: string;
    source: AttendanceSource;
    apiKeyName?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    metadata?: any;
    createdAt: string;
}

export interface AttendanceSession {
    id: string;
    employeeId: string;
    companyId: string;
    date: string;
    shiftId?: string;
    shiftName?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    checkInTime?: string;
    checkOutTime?: string;
    checkInLocation?: string;
    checkInLatitude?: number;
    checkInLongitude?: number;
    checkOutLocation?: string;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
    status: AttendanceStatus;
    totalMinutes?: number;
    breakMinutes?: number;
    remarks?: string;
    inApprovalStatus: AttendanceApprovalStatus;
    outApprovalStatus: AttendanceApprovalStatus;
    approvedById?: string;

    approvedAt?: string;
    metadata?: any;

    employee?: {
        employeeNo: number;
        fullName: string;
        nameWithInitials: string;
        photo?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceSyncRecord {
    employeeNo: number;
    timestamp: string;
    deviceId?: string;
    location?: string;
}

export interface AttendanceSyncResponse {
    employeeNo: number;
    employeeName: string;
    timestamp: string;
    shiftName: string;
    status: AttendanceStatus;
    type: 'IN' | 'OUT';
}
