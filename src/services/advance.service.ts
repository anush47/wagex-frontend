import { backendApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api/api.types';
import { SalaryAdvance, AdvanceQueryParams } from '@/types/salary';

export class AdvanceService {
    static async getAdvances(params: AdvanceQueryParams): Promise<ApiResponse<SalaryAdvance[]>> {
        return backendApiClient.get<SalaryAdvance[]>(`/advances?companyId=${params.companyId}`);
    }

    static async getMyAdvances(): Promise<ApiResponse<SalaryAdvance[]>> {
        return backendApiClient.get<SalaryAdvance[]>('/advances/me');
    }

    static async getAdvanceById(id: string): Promise<ApiResponse<SalaryAdvance>> {
        return backendApiClient.get<SalaryAdvance>(`/advances/${id}`);
    }

    static async createAdvance(dto: any): Promise<ApiResponse<SalaryAdvance>> {
        return backendApiClient.post<SalaryAdvance>('/advances', dto);
    }

    static async approveAdvance(id: string): Promise<ApiResponse<SalaryAdvance>> {
        return backendApiClient.patch<SalaryAdvance>(`/advances/${id}/approve`, {});
    }

    static async deleteAdvance(id: string): Promise<ApiResponse<void>> {
        return backendApiClient.delete<void>(`/advances/${id}`);
    }

    static async deleteAdvances(ids: string[]): Promise<ApiResponse<void>> {
        return backendApiClient.delete<void>('/advances', { body: JSON.stringify({ ids }) });
    }
}
