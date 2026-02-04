
import { backendApiClient } from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { Employee } from '@/types/employee';

export interface EmployeeQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    companyId?: string;
}

export const EmployeeService = {
    /**
     * Get employees list
     */
    async getEmployees(query: EmployeeQuery = {}): Promise<ApiResponse<PaginatedResponse<Employee>>> {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });
        return backendApiClient.get<PaginatedResponse<Employee>>(`/employees?${params.toString()}`);
    },

    /**
     * Get employee by ID
     */
    async getEmployee(id: string): Promise<ApiResponse<Employee>> {
        return backendApiClient.get<Employee>(`/employees/${id}`);
    },

    /**
     * Create employee
     */
    async createEmployee(data: Partial<Employee>): Promise<ApiResponse<Employee>> {
        return backendApiClient.post<Employee>('/employees', data);
    },

    /**
     * Update employee
     */
    async updateEmployee(id: string, data: Partial<Employee>): Promise<ApiResponse<Employee>> {
        return backendApiClient.put<Employee>(`/employees/${id}`, data);
    },

    /**
     * Delete employee
     */
    async deleteEmployee(id: string): Promise<ApiResponse<void>> {
        return backendApiClient.delete<void>(`/employees/${id}`);
    }
};
