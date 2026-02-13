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
        if (params.status) searchParams.append('status', params.status);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());

        return backendApiClient.get<PaginatedResponse<Salary>>(`/salaries?${searchParams.toString()}`);
    }

    static async getSalaryById(id: string): Promise<ApiResponse<Salary>> {
        return backendApiClient.get<Salary>(`/salaries/${id}`);
    }

    static async generatePreviews(dto: SalaryPreviewDto): Promise<ApiResponse<any[]>> {
        return backendApiClient.post<any[]>('/salaries/generate-preview', dto);
    }

    static async saveDrafts(drafts: any[]): Promise<ApiResponse<Salary[]>> {
        return backendApiClient.post<Salary[]>('/salaries/save-drafts', drafts);
    }
}
