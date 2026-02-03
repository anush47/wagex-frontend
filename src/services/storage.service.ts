import { backendApiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';

export interface UploadResponse {
    key: string;
    contentType: string;
    originalName: string;
    size: number;
}

export interface StorageUrlResponse {
    url: string;
}

export const StorageService = {
    /**
     * Upload a file to storage
     */
    async upload(params: {
        file: File;
        companyId: string;
        folder?: string;
        employeeId?: string;
        customFilename?: string;
    }): Promise<ApiResponse<UploadResponse>> {
        const formData = new FormData();
        formData.append('file', params.file);
        formData.append('folder', params.folder || 'general');
        formData.append('companyId', params.companyId);
        if (params.employeeId) formData.append('employeeId', params.employeeId);
        if (params.customFilename) formData.append('customFilename', params.customFilename);

        // We need to use a special request for multipart/form-data because 
        // backendApiClient.post stringifies the body by default.
        // However, fetch with FormData automatically sets the correct Content-Type.

        return backendApiClient.postRaw<UploadResponse>(
            `storage/upload?companyId=${params.companyId}`,
            formData
        );
    },

    /**
     * Get a temporary signed URL for a storage key
     */
    async getUrl(key: string): Promise<ApiResponse<StorageUrlResponse>> {
        return backendApiClient.get<StorageUrlResponse>(`storage/url`, {
            params: { key }
        });
    }
};
