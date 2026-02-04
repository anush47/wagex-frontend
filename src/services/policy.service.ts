
import { backendApiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';
import { Policy, PolicySettings } from '@/types/policy';

export const PoliciesService = {
    /**
     * Get company default policy
     */
    async getCompanyPolicy(companyId: string): Promise<ApiResponse<Policy>> {
        return backendApiClient.get<Policy>(`/policies/company/${companyId}`);
    },

    /**
     * Create or Upsert policy
     * Note: The backend uses one endpoint for create (upsert), but requires different payloads
     * for company vs employee.
     */
    async saveCompanyPolicy(companyId: string, settings: PolicySettings): Promise<ApiResponse<Policy>> {
        // First try to find if it exists to know if we should POST or PATCH?
        // Actually backend 'create' does upsert, but 'update' PATCH is also available.
        // The safest "Save" logic for a settings object is often just to use the CREATE endpoint
        // because the backend logic explicitly handles "SCENARIO 2: Company Default Policy ... upsert".

        return backendApiClient.post<Policy>('/policies', {
            companyId,
            settings
        });
    },

    /**
     * Create or Update policy via PATCH if we have the ID
     */
    async updatePolicy(id: string, companyId: string, settings: PolicySettings): Promise<ApiResponse<Policy>> {
        return backendApiClient.patch<Policy>(`/policies/${id}?companyId=${companyId}`, {
            settings
        });
    },

    /**
     * Get effective policy for an employee (merged default + override)
     */
    async getEffectivePolicy(employeeId: string): Promise<ApiResponse<any>> {
        return backendApiClient.get<any>(`/policies/effective/${employeeId}`);
    },

    /**
     * Save/Create employee specific override
     */
    async saveEmployeePolicy(companyId: string, employeeId: string, settings: PolicySettings): Promise<ApiResponse<Policy>> {
        return backendApiClient.post<Policy>('/policies', {
            companyId,
            employeeId,
            settings
        });
    }
};
