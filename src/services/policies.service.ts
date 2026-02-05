import { backendApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api/api.types';

export class PoliciesService {
    /**
     * Get effective policy for an employee
     */
    static async getEffectivePolicy(employeeId: string): Promise<ApiResponse<any>> {
        return backendApiClient.get(`/policies/effective/${employeeId}`);
    }

    /**
     * Get company policy
     */
    static async getCompanyPolicy(companyId: string): Promise<ApiResponse<any>> {
        return backendApiClient.get(`/policies/company/${companyId}`);
    }

    /**
     * Update company policy
     */
    static async updateCompanyPolicy(companyId: string, policy: any): Promise<ApiResponse<any>> {
        return backendApiClient.put(`/policies/company/${companyId}`, policy);
    }

    /**
     * Update employee policy override
     */
    static async updateEmployeePolicy(employeeId: string, policy: any): Promise<ApiResponse<any>> {
        return backendApiClient.put(`/policies/employee/${employeeId}`, policy);
    }
}
