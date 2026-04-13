import { backendApiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';

export interface EmployerDashboardStats {
    companiesCount: number;
    employeesCount: number;
    pendingLeavesCount: number;
    attendance: {
        present: number;
        late: number;
        absent: number;
        total: number;
    };
    recentActivity: Array<{
        id: string;
        action: string;
        details: string;
        createdAt: string;
        type: 'COMPANY' | 'EMPLOYEE' | 'LEAVE' | 'PAYROLL';
    }>;
}

export const DashboardService = {
    /**
     * Get dashboard stats for employer
     */
    async getEmployerStats(): Promise<ApiResponse<EmployerDashboardStats>> {
        return backendApiClient.get<EmployerDashboardStats>('/dashboard/employer');
    }
};
