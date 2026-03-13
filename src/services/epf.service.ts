import { backendApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api/api.types';
import { EpfRecord, EpfQuery, EpfPreview } from '@/types/statutory';
import { PaginatedResponse } from '@/types/salary';

export class EpfService {
  static async getRecords(params: EpfQuery): Promise<ApiResponse<PaginatedResponse<EpfRecord>>> {
    const searchParams = new URLSearchParams();
    if (params.companyId) searchParams.append('companyId', params.companyId);
    if (params.month) searchParams.append('month', params.month.toString());
    if (params.year) searchParams.append('year', params.year.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    return backendApiClient.get<PaginatedResponse<EpfRecord>>(`/companies/${params.companyId}/epf?${searchParams.toString()}`);
  }

  static async getRecordById(companyId: string, id: string): Promise<ApiResponse<EpfRecord>> {
    return backendApiClient.get<EpfRecord>(`/companies/${companyId}/epf/${id}`);
  }

  static async generatePreview(companyId: string, dto: any): Promise<ApiResponse<EpfPreview>> {
    return backendApiClient.post<EpfPreview>(`/companies/${companyId}/epf/preview`, dto);
  }

  static async createRecord(companyId: string, dto: any): Promise<ApiResponse<EpfRecord>> {
    return backendApiClient.post<EpfRecord>(`/companies/${companyId}/epf`, dto);
  }

  static async updateRecord(companyId: string, id: string, data: any): Promise<ApiResponse<EpfRecord>> {
    return backendApiClient.patch<EpfRecord>(`/companies/${companyId}/epf/${id}`, data);
  }

  static async deleteRecord(companyId: string, id: string): Promise<ApiResponse<void>> {
    return backendApiClient.delete<void>(`/companies/${companyId}/epf/${id}`);
  }
}
