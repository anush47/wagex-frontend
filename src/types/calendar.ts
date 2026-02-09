
export interface Calendar {
    id: string;
    name: string;
    description?: string;
    isGlobal: boolean;
    companyId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Holiday {
    id: string;
    calendarId: string;
    date: string;
    name: string;
    description?: string;
    isPublic: boolean;
    isMercantile: boolean;
    isBank: boolean;
    calendar?: Calendar;
    createdAt: string;
    updatedAt: string;
}

export interface HolidayFilters {
    calendarId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
    isMercantile?: boolean;
    isBank?: boolean;
    page?: number;
    limit?: number;
}
