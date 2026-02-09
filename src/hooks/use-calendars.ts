
import { useQuery } from '@tanstack/react-query';
import { CalendarService } from '@/services/calendar.service';
import { HolidayFilters } from '@/types/calendar';

/**
 * Hook to fetch all global calendars
 */
export const useCalendars = () => {
    return useQuery({
        queryKey: ['calendars', 'list'],
        queryFn: async () => {
            const response = await CalendarService.getCalendars();
            if (response.error) {
                throw new Error(response.error.message);
            }
            return (response.data as any)?.data || response.data || [];
        }
    });
};

/**
 * Hook to fetch holidays with filtering
 */
export const useHolidays = (filters: HolidayFilters = {}) => {
    return useQuery({
        queryKey: ['holidays', 'list', filters],
        queryFn: async () => {
            const response = await CalendarService.getHolidays(filters);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            return data?.data || data || { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
        },
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Hook to fetch a specific calendar details
 */
export const useCalendar = (id: string | null) => {
    return useQuery({
        queryKey: ['calendars', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await CalendarService.getCalendar(id);
            if (response.error) {
                throw new Error(response.error.message);
            }
            return (response.data as any)?.data || response.data || null;
        },
        enabled: !!id
    });
};
