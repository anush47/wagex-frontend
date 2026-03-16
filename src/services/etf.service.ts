import { backendApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api/api.types';
import { EtfRecord, EtfQuery, EtfPreview } from '@/types/statutory';
import { PaginatedResponse } from '@/types/salary';

export class EtfService {
  static async getRecords(params: EtfQuery): Promise<ApiResponse<PaginatedResponse<EtfRecord>>> {
    const searchParams = new URLSearchParams();
    if (params.companyId) searchParams.append('companyId', params.companyId);
    if (params.month) searchParams.append('month', params.month.toString());
    if (params.year) searchParams.append('year', params.year.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);

    return backendApiClient.get<PaginatedResponse<EtfRecord>>(`/companies/${params.companyId}/etf?${searchParams.toString()}`);
  }

  static async getRecordById(companyId: string, id: string): Promise<ApiResponse<EtfRecord>> {
    return backendApiClient.get<EtfRecord>(`/companies/${companyId}/etf/${id}`);
  }

  static async generatePreview(companyId: string, dto: any): Promise<ApiResponse<EtfPreview>> {
    return backendApiClient.post<EtfPreview>(`/companies/${companyId}/etf/preview`, dto);
  }

  static async createRecord(companyId: string, dto: any): Promise<ApiResponse<EtfRecord>> {
    return backendApiClient.post<EtfRecord>(`/companies/${companyId}/etf`, dto);
  }

  static async updateRecord(companyId: string, id: string, data: any): Promise<ApiResponse<EtfRecord>> {
    return backendApiClient.patch<EtfRecord>(`/companies/${companyId}/etf/${id}`, data);
  }

  static async deleteRecord(companyId: string, id: string): Promise<ApiResponse<void>> {
    return backendApiClient.delete<void>(`/companies/${companyId}/etf/${id}`);
  }
}
