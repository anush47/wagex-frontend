import { backendApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api/api.types';
import {
    Salary,
    SalaryQueryParams,
    SalaryPreviewDto,
    PaginatedResponse
} from '@/types/salary';

export class SalaryService {
    static async getSalaries(params: SalaryQueryParams): Promise<ApiResponse<PaginatedResponse<Salary>>> {
        const searchParams = new URLSearchParams();
        if (params.companyId) searchParams.append('companyId', params.companyId);
        if (params.employeeId) searchParams.append('employeeId', params.employeeId);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.status) {
            if (Array.isArray(params.status)) {
                searchParams.append('status', params.status.join(','));
            } else {
                searchParams.append('status', params.status);
            }
        }
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.excludeEpf) searchParams.append('excludeEpf', 'true');
        if (params.excludeEtf) searchParams.append('excludeEtf', 'true');
        if (params.search) searchParams.append('search', params.search);
        if (params.month && params.month !== 'ALL') searchParams.append('month', params.month.toString());
        if (params.year) searchParams.append('year', params.year.toString());
        if (params.policyIds) searchParams.append('policyIds', params.policyIds);

        return backendApiClient.get<PaginatedResponse<Salary>>(`/salaries?${searchParams.toString()}`);
    }

    static async getMySalaries(params: SalaryQueryParams): Promise<ApiResponse<PaginatedResponse<Salary>>> {
        const searchParams = new URLSearchParams();
        if (params.month && params.month !== 'ALL') searchParams.append('month', params.month.toString());
        if (params.year) searchParams.append('year', params.year.toString());
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());

        return backendApiClient.get<PaginatedResponse<Salary>>(`/salaries/me?${searchParams.toString()}`);
    }

    static async getSalaryById(id: string): Promise<ApiResponse<Salary>> {
        return backendApiClient.get<Salary>(`/salaries/${id}`);
    }

    static async generatePreviews(dto: SalaryPreviewDto): Promise<ApiResponse<any[]>> {
        return backendApiClient.post<any[]>('/salaries/generate-preview', dto);
    }

    static async saveDrafts(companyId: string, previews: any[]): Promise<ApiResponse<any>> {
        return backendApiClient.post<any>(`/salaries/save-drafts/${companyId}`, previews);
    }

    static async updateSalary(id: string, data: any): Promise<ApiResponse<Salary>> {
        return backendApiClient.post<Salary>(`/salaries/${id}`, data);
    }

    static async approveSalary(id: string): Promise<ApiResponse<Salary>> {
        return backendApiClient.post<Salary>(`/salaries/${id}/approve`);
    }

    static async deleteSalary(id: string): Promise<ApiResponse<void>> {
        return backendApiClient.delete<void>(`/salaries/${id}`);
    }
}
