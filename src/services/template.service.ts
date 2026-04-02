import { backendApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import { DocumentType, DocumentTemplate } from '@/types/template';

export class TemplateService {
    static async getTemplates(filters: { companyId?: string; type?: DocumentType; isActive?: boolean }): Promise<ApiResponse<DocumentTemplate[]>> {
        const params: Record<string, string> = {};
        if (filters.companyId) params.companyId = filters.companyId;
        if (filters.type) params.type = filters.type;
        // Omit isActive from server query as backend rejects stringified booleans
        
        const response = await backendApiClient.get<DocumentTemplate[]>('/templates', { params });
        
        // Apply client-side filtering for isActive if requested
        if (!response.error && response.data && filters.isActive !== undefined) {
            response.data = response.data.filter(t => t.isActive === filters.isActive);
        }
        
        return response;
    }

    static async getTemplateById(id: string): Promise<ApiResponse<DocumentTemplate>> {
        return backendApiClient.get<DocumentTemplate>(`/templates/${id}`);
    }

    static async createTemplate(data: Partial<DocumentTemplate>): Promise<ApiResponse<DocumentTemplate>> {
        return backendApiClient.post<DocumentTemplate>('/templates', data);
    }

    static async updateTemplate(id: string, data: Partial<DocumentTemplate>): Promise<ApiResponse<DocumentTemplate>> {
        return backendApiClient.patch<DocumentTemplate>(`/templates/${id}`, data);
    }

    static async deleteTemplate(id: string): Promise<ApiResponse<void>> {
        return backendApiClient.delete<void>(`/templates/${id}`);
    }

    static async getTemplateVariables(type: DocumentType): Promise<ApiResponse<any>> {
        return backendApiClient.get<any>(`/templates/variables/${type}`);
    }

    static async getTemplateLiveData(type: DocumentType, resourceId?: string): Promise<ApiResponse<any>> {
        const params = resourceId ? { resourceId } : {};
        return backendApiClient.get<any>(`/templates/live-data/${type}`, { params });
    }
}
