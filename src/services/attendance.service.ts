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

        return backendApiClient.get<PaginatedResponse<AttendanceEvent>>(
            `/attendance/manual/events?${searchParams.toString()}`
        );
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
}
