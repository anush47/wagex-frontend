import { backendApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api/api.types';
import type {
    LeaveRequest,
    LeaveBalance,
    CreateLeaveRequestDto,
    UpdateLeaveRequestDto,
    LeaveStatus
} from '@/types/leave';

export class LeavesService {
    /**
     * Get leave balances for an employee
     */
    static async getBalances(employeeId: string): Promise<ApiResponse<LeaveBalance[]>> {
        return backendApiClient.get<LeaveBalance[]>(
            `/leaves/balances/${employeeId}`
        );
    }

    /**
     * Get all leave requests for a company
     */
    static async getCompanyRequests(
        companyId: string,
        filters?: { status?: LeaveStatus; employeeId?: string }
    ): Promise<ApiResponse<LeaveRequest[]>> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.employeeId) params.append('employeeId', filters.employeeId);

        return backendApiClient.get<LeaveRequest[]>(
            `/leaves/company/${companyId}?${params.toString()}`
        );
    }

    /**
     * Get a single leave request
     */
    static async getRequest(id: string): Promise<ApiResponse<LeaveRequest>> {
        return backendApiClient.get<LeaveRequest>(`/leaves/${id}`);
    }

    /**
     * Create a new leave request
     */
    static async createRequest(dto: CreateLeaveRequestDto): Promise<ApiResponse<LeaveRequest>> {
        return backendApiClient.post<LeaveRequest>('/leaves', dto);
    }

    /**
     * Update leave request (approve/reject)
     */
    static async updateRequest(id: string, dto: UpdateLeaveRequestDto): Promise<ApiResponse<LeaveRequest>> {
        return backendApiClient.patch<LeaveRequest>(`/leaves/${id}`, dto);
    }

    /**
     * Approve a leave request
     */
    static async approveRequest(id: string, managerId: string, responseReason?: string): Promise<ApiResponse<LeaveRequest>> {
        return this.updateRequest(id, {
            status: 'APPROVED',
            managerId,
            responseReason
        });
    }

    /**
     * Reject a leave request
     */
    static async rejectRequest(id: string, managerId: string, responseReason: string): Promise<ApiResponse<LeaveRequest>> {
        return this.updateRequest(id, {
            status: 'REJECTED',
            managerId,
            responseReason
        });
    }

    /**
     * Delete a leave request (only pending requests)
     */
    static async deleteRequest(id: string): Promise<ApiResponse<{ message: string }>> {
        return backendApiClient.delete<{ message: string }>(`/leaves/${id}`);
    }
}
