import { backendApiClient } from "@/lib/api/client";
import { AttendanceSession, AttendanceSyncRecord, AttendanceSyncResponse } from "@/types/attendance";
import { PaginatedResponse } from "@/types/api";

export class AttendanceService {
    static async getSessions(params: {
        companyId: string;
        page?: number;
        limit?: number;
        employeeId?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
        approvalStatus?: string;
    }) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) query.append(key, value.toString());
        });
        return backendApiClient.get<PaginatedResponse<AttendanceSession>>(`/attendance/sessions?${query.toString()}`);
    }

    static async syncManual(companyId: string, records: AttendanceSyncRecord[]) {
        return backendApiClient.post<AttendanceSyncResponse[]>(`/attendance/manual?companyId=${companyId}`, { records });
    }

    static async verifyApiKey(companyId: string, apiKey: string) {
        return backendApiClient.post(`/attendance/verify?companyId=${companyId}`, { apiKey });
    }

    static async updateSession(companyId: string, sessionId: string, data: any) {
        return backendApiClient.patch(`/attendance/sessions/${sessionId}?companyId=${data.companyId}`, data);
    }

    static async deleteSession(companyId: string, sessionId: string) {
        return backendApiClient.delete(`/attendance/sessions/${sessionId}?companyId=${companyId}`);
    }

    static async approveSession(companyId: string, sessionId: string, status: string) {


        return backendApiClient.patch(`/attendance/sessions/${sessionId}/approve?companyId=${companyId}`, { status });
    }
}


