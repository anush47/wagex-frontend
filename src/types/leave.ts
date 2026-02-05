export enum LeaveStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export enum LeaveRequestType {
    FULL_DAY = 'FULL_DAY',
    HALF_DAY_FIRST = 'HALF_DAY_FIRST',
    HALF_DAY_LAST = 'HALF_DAY_LAST',
    SHORT_LEAVE = 'SHORT_LEAVE'
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    companyId: string;
    leaveTypeId: string;
    leaveTypeName?: string;
    type: LeaveRequestType;
    startDate: string; // ISO DateTime
    endDate: string;   // ISO DateTime
    days: number;
    minutes?: number;
    leaveNumber?: number;
    status: LeaveStatus;
    reason?: string;
    managerId?: string;
    responseReason?: string;
    documents?: any[];
    createdAt: string;
    updatedAt: string;
    employee?: {
        id: string;
        nameWithInitials: string;
        fullName: string;
        photo?: string;
    };
}

export interface LeaveBalance {
    leaveTypeId: string;
    leaveTypeName: string;
    leaveTypeCode: string;
    entitled: number;
    used: number;
    pending: number;
    available: number;
    period: {
        start: Date;
        end: Date;
    };
}

export interface CreateLeaveRequestDto {
    employeeId: string;
    companyId: string;
    leaveTypeId: string;
    type: LeaveRequestType;
    startDate: string; // ISO DateTime
    endDate: string;   // ISO DateTime
    reason?: string;
    documents?: any[];
}

export interface UpdateLeaveRequestDto {
    status?: LeaveStatus;
    responseReason?: string;
    managerId?: string;
}
