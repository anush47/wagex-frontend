
import { backendApiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';
import { Calendar, Holiday, HolidayFilters } from '@/types/calendar';

export const CalendarService = {
    /**
     * Get all global calendars
     */
    async getCalendars(): Promise<ApiResponse<Calendar[]>> {
        return backendApiClient.get<Calendar[]>('/calendars');
    },

    /**
     * Get holidays with filtering and pagination
     */
    async getHolidays(filters: HolidayFilters): Promise<ApiResponse<any>> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        return backendApiClient.get<any>(`/calendars/holidays?${params.toString()}`);
    },

    /**
     * Get a specific calendar details
     */
    async getCalendar(id: string): Promise<ApiResponse<Calendar>> {
        return backendApiClient.get<Calendar>(`/calendars/${id}`);
    }
};
