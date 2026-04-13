import { backendApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api/api.types';
import {
    AttendanceEvent,
    AttendanceSession,
    CreateEventDto,
    UpdateSessionDto,
    SessionQueryParams,
    EventQueryParams,
    PaginatedResponse
} from '@/types/attendance';

export class AttendanceService {
    /**
     * Get attendance sessions (paginated)
     */
    static async getSessions(params: SessionQueryParams): Promise<ApiResponse<PaginatedResponse<AttendanceSession>>> {
        const searchParams = new URLSearchParams();
        if (params.companyId) searchParams.append('companyId', params.companyId);
        if (params.employeeId) searchParams.append('employeeId', params.employeeId);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.isPending) searchParams.append('isPending', 'true');

        return backendApiClient.get<PaginatedResponse<AttendanceSession>>(
            `/attendance/manual/sessions?${searchParams.toString()}`
        );
    }

    /**
     * Get a single attendance session
     */
    static async getSessionById(id: string): Promise<ApiResponse<AttendanceSession>> {
        return backendApiClient.get<AttendanceSession>(`/attendance/manual/sessions/${id}`);
    }

    /**
     * Get attendance events (paginated)
     */
    static async getEvents(params: EventQueryParams): Promise<ApiResponse<PaginatedResponse<AttendanceEvent>>> {
        const searchParams = new URLSearchParams();
        if (params.companyId) searchParams.append('companyId', params.companyId);
        if (params.employeeId) searchParams.append('employeeId', params.employeeId);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.status) searchParams.append('status', params.status);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.onlyUnlinked) searchParams.append('onlyUnlinked', 'true');

        return backendApiClient.get<PaginatedResponse<AttendanceEvent>>(
            `/attendance/manual/events?${searchParams.toString()}`
        );
    }

    /**
     * Create a manual attendance session
     */
    static async createSession(dto: { employeeId: string; date: string; shiftId?: string }): Promise<ApiResponse<AttendanceSession>> {
        return backendApiClient.post<AttendanceSession>('/attendance/manual/sessions', dto);
    }

    /**
     * Create a manual attendance event
     */
    static async createEvent(dto: CreateEventDto): Promise<ApiResponse<AttendanceEvent>> {
        return backendApiClient.post<AttendanceEvent>('/attendance/manual/events', dto);
    }

    /**
     * Update an attendance session
     */
    static async updateSession(id: string, dto: UpdateSessionDto): Promise<ApiResponse<AttendanceSession>> {
        return backendApiClient.patch<AttendanceSession>(`/attendance/manual/sessions/${id}`, dto);
    }

    /**
     * Delete an attendance session
     */
    static async deleteSession(id: string): Promise<ApiResponse<{ message: string }>> {
        return backendApiClient.delete<{ message: string }>(`/attendance/manual/sessions/${id}`);
    }

    /**
     * Get events for a specific session
     */
    static async getSessionEvents(sessionId: string): Promise<ApiResponse<AttendanceEvent[]>> {
        return backendApiClient.get<AttendanceEvent[]>(`/attendance/manual/sessions/${sessionId}/events`);
    }

    /**
     * Link an event to a session
     */
    static async linkEventToSession(eventId: string, sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
        return backendApiClient.post<{ success: boolean }>(`/attendance/manual/events/${eventId}/link/${sessionId}`, {});
    }

    /**
     * Unlink an event from its session
     */
    static async unlinkEventFromSession(eventId: string): Promise<ApiResponse<{ success: boolean }>> {
        return backendApiClient.delete<{ success: boolean }>(`/attendance/manual/events/${eventId}/link`);
    }

    /**
     * Update an event type
     */
    static async updateEventType(id: string, eventType: string): Promise<ApiResponse<{ success: boolean }>> {
        return backendApiClient.patch<{ success: boolean }>(`/attendance/manual/events/${id}/type`, { eventType });
    }

    /**
     * --- Portal Portal Endpoints ---
     */

    static async getPortalSessions(params: SessionQueryParams): Promise<ApiResponse<PaginatedResponse<AttendanceSession>>> {
        const searchParams = new URLSearchParams();
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());

        return backendApiClient.get<PaginatedResponse<AttendanceSession>>(
            `/attendance/portal/sessions?${searchParams.toString()}`
        );
    }

    static async getPortalSessionEvents(sessionId: string): Promise<ApiResponse<AttendanceEvent[]>> {
        return backendApiClient.get<AttendanceEvent[]>(`/attendance/portal/sessions/${sessionId}/events`);
    }

    static async getPortalStatus(): Promise<ApiResponse<any>> {
        return backendApiClient.get<any>('/attendance/portal/status');
    }

    static async markPortalAttendance(body: { latitude?: number; longitude?: number; remark?: string }): Promise<ApiResponse<any>> {
        return backendApiClient.post<any>('/attendance/portal/mark', body);
    }
}
