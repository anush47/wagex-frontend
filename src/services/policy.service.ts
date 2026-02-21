
import { backendApiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';
import { Policy, PolicySettings } from '@/types/policy';

export const PoliciesService = {
    /**
     * Get all company policies
     */
    async getCompanyPolicies(companyId: string): Promise<ApiResponse<Policy[]>> {
        return backendApiClient.get<Policy[]>(`/policies/company/${companyId}`);
    },

    /**
     * Get company default policy
     */
    async getCompanyDefaultPolicy(companyId: string): Promise<ApiResponse<Policy>> {
        return backendApiClient.get<Policy>(`/policies/company/${companyId}/default`);
    },

    /**
     * Create/Save policy template
     */
    async savePolicy(data: {
        companyId: string;
        name: string;
        description?: string;
        isDefault?: boolean;
        settings: PolicySettings;
    }): Promise<ApiResponse<Policy>> {
        return backendApiClient.post<Policy>('/policies', data);
    },

    /**
     * Update existing policy
     */
    async updatePolicy(id: string, data: Partial<Policy>): Promise<ApiResponse<Policy>> {
        return backendApiClient.patch<Policy>(`/policies/${id}`, data);
    },

    /**
     * Delete a policy
     */
    async deletePolicy(id: string, companyId?: string): Promise<ApiResponse<void>> {
        const url = companyId ? `/policies/${id}?companyId=${companyId}` : `/policies/${id}`;
        return backendApiClient.delete<void>(url);
    },

    /**
     * Get effective policy for an employee (merged default + assigned)
     */
    async getEffectivePolicy(employeeId: string): Promise<ApiResponse<any>> {
        return backendApiClient.get<any>(`/policies/effective/${employeeId}`);
    }
};
