import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AttendanceService } from '@/services/attendance.service';
import { toast } from 'sonner';
import type {
    SessionQueryParams,
    EventQueryParams,
    CreateEventDto,
    UpdateSessionDto
} from '@/types/attendance';

/**
 * Hook to fetch attendance sessions (paginated)
 */
export const useAttendanceSessions = (params: SessionQueryParams) => {
    return useQuery({
        queryKey: ['attendance', 'sessions', params],
        queryFn: async () => {
            const response = await AttendanceService.getSessions(params);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            // Handle nested response structure from backend
            return data?.data || data || { items: [], meta: { total: 0, page: 1, lastPage: 1 } };
        },
        enabled: !!params.companyId,
    });
};

/**
 * Hook to fetch attendance events (paginated)
 */
export const useAttendanceEvents = (params: EventQueryParams) => {
    return useQuery({
        queryKey: ['attendance', 'events', params],
        queryFn: async () => {
            const response = await AttendanceService.getEvents(params);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            // Handle nested response structure from backend
            return data?.data || data || { items: [], meta: { total: 0, page: 1, lastPage: 1 } };
        },
        enabled: !!params.companyId,
    });
};

/**
 * Hook for attendance mutations (create event, update/delete session)
 */
export const useAttendanceMutations = () => {
    const queryClient = useQueryClient();

    const createEvent = useMutation({
        mutationFn: async (dto: CreateEventDto) => {
            const response = await AttendanceService.createEvent(dto);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Attendance event created');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to create event'),
    });

    const updateSession = useMutation({
        mutationFn: async ({ id, dto }: { id: string; dto: UpdateSessionDto }) => {
            const response = await AttendanceService.updateSession(id, dto);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Session updated');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to update session'),
    });

    const deleteSession = useMutation({
        mutationFn: async (id: string) => {
            const response = await AttendanceService.deleteSession(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Session deleted');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to delete session'),
    });

    return {
        createEvent,
        updateSession,
        deleteSession
    };
};
