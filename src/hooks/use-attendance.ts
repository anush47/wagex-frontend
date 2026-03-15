import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AttendanceService } from '@/services/attendance.service';
import { toast } from 'sonner';
import type {
    SessionQueryParams,
    EventQueryParams,
    CreateEventDto,
    UpdateSessionDto,
    AttendanceEvent
} from '@/types/attendance';

/**
 * Hook to fetch attendance sessions (paginated)
 */
export const useAttendanceSessions = (params: SessionQueryParams, options: any = {}) => {
    return useQuery({
        queryKey: ['attendance', 'sessions', params],
        queryFn: async () => {
            const response = await AttendanceService.getSessions(params);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            return data || { items: [], meta: { total: 0, page: 1, lastPage: 1 } };
        },
        enabled: !!params.companyId,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
        ...options,
    });
};

/**
 * Hook to fetch a single attendance session
 */
export const useAttendanceSession = (id?: string) => {
    return useQuery({
        queryKey: ['attendance', 'session', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await AttendanceService.getSessionById(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        enabled: !!id,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
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
            return data || { items: [], meta: { total: 0, page: 1, lastPage: 1 } };
        },
        enabled: !!params.companyId,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
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
        onMutate: () => {
            return { toastId: toast.loading('Creating attendance event...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Attendance event created', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to create event', { id: context?.toastId });
        },
    });

    const createSession = useMutation({
        mutationFn: async (dto: { employeeId: string; date: string; shiftId?: string }) => {
            const response = await AttendanceService.createSession(dto);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Creating attendance session...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Session created', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to create session', { id: context?.toastId });
        },
    });

    const updateSession = useMutation({
        mutationFn: async ({ id, dto }: { id: string; dto: UpdateSessionDto }) => {
            const response = await AttendanceService.updateSession(id, dto);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Updating attendance session...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Session updated', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to update session', { id: context?.toastId });
        },
    });

    const deleteSession = useMutation({
        mutationFn: async (id: string) => {
            const response = await AttendanceService.deleteSession(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Deleting attendance session...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Session deleted', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to delete session', { id: context?.toastId });
        },
    });

    const linkEventToSession = useMutation({
        mutationFn: async ({ eventId, sessionId }: { eventId: string; sessionId: string }) => {
            const response = await AttendanceService.linkEventToSession(eventId, sessionId);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Linking event to session...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Event linked to session', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to link event', { id: context?.toastId });
        },
    });

    const unlinkEventFromSession = useMutation({
        mutationFn: async (eventId: string) => {
            const response = await AttendanceService.unlinkEventFromSession(eventId);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Unlinking event...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Event unlinked', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to unlink event', { id: context?.toastId });
        },
    });

    return {
        createEvent,
        createSession,
        updateSession,
        deleteSession,
        linkEventToSession,
        unlinkEventFromSession,
        updateEventType: useMutation({
            mutationFn: async ({ id, eventType }: { id: string; eventType: string }) => {
                const response = await AttendanceService.updateEventType(id, eventType);
                if (response.error) throw new Error(response.error.message);
                return response.data;
            },
            onMutate: () => {
                return { toastId: toast.loading('Updating event type...') };
            },
            onSuccess: (_data, _variables, context) => {
                queryClient.invalidateQueries({ queryKey: ['attendance'] });
                toast.success('Event type updated', { id: context?.toastId });
            },
            onError: (err: any, _variables, context) => {
                toast.error(err.message || 'Failed to update event type', { id: context?.toastId });
            },
        }),
    };
};

// Zustand store for session events
import { create } from 'zustand';

interface AttendanceState {
    events: Record<string, AttendanceEvent[]>; // sessionId -> events
    loading: Record<string, boolean>; // sessionId -> loading state
    error: Record<string, string | null>; // sessionId -> error
}

interface AttendanceActions {
    actions: {
        fetchSessionEvents: (sessionId: string) => Promise<void>;
    };
}

type AttendanceStore = AttendanceState & AttendanceActions;

export const useAttendance = create<AttendanceStore>((set, get) => ({
    events: {},
    loading: {},
    error: {},

    actions: {
        fetchSessionEvents: async (sessionId: string) => {
            if (get().loading[sessionId]) return; // Prevent duplicate requests

            set(state => ({
                loading: { ...state.loading, [sessionId]: true },
                error: { ...state.error, [sessionId]: null }
            }));

            try {
                const response = await AttendanceService.getSessionEvents(sessionId);

                if (response.error) {
                    throw new Error(response.error.message || 'Failed to fetch session events');
                }

                const result = response.data as any;
                const events = (result || []) as AttendanceEvent[];

                set(state => ({
                    events: { ...state.events, [sessionId]: events },
                    error: { ...state.error, [sessionId]: null },
                    loading: { ...state.loading, [sessionId]: false }
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                set(state => ({
                    error: { ...state.error, [sessionId]: errorMessage },
                    loading: { ...state.loading, [sessionId]: false }
                }));
            }
        }
    }
}));