import { ApiResponse } from '@/types/api';
import { Company } from '@/types/company';
import { CompanyFormValues } from '@/schemas/company.schema';
import { backendApiClient } from '@/lib/api/client';

export const CompanyService = {
    /**
     * List all companies for the current user/employer
     */
    async getCompanies(params?: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<ApiResponse<{
        data: Company[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>> {
        const queryParams: any = {};
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.search) queryParams.search = params.search;
        if (params?.sortBy) queryParams.sortBy = params.sortBy;
        if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

        return backendApiClient.get<any>('companies', { params: queryParams });
    },

    /**
     * Get a single company by ID
     */
    async getCompany(id: string): Promise<ApiResponse<Company>> {
        return backendApiClient.get<Company>(`/companies/${id}`);
    },

    /**
     * Create a new company
     */
    async createCompany(data: CompanyFormValues): Promise<ApiResponse<Company>> {
        // Convert form data to API payload if needed (e.g. logo handling)
        return backendApiClient.post<Company>('/companies', data);
    },

    /**
     * Update an existing company
     */
    async updateCompany(id: string, data: Partial<CompanyFormValues>): Promise<ApiResponse<Company>> {
        return backendApiClient.put<Company>(`/companies/${id}`, data);
    },

    /**
     * Delete a company
     */
    async deleteCompany(id: string): Promise<ApiResponse<void>> {
        return backendApiClient.delete<void>(`/companies/${id}`);
    }
};
