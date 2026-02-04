import { backendApiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';
import { CreateDepartmentDto, Department, UpdateDepartmentDto } from "@/types/department";

export const DepartmentService = {
    create: (data: CreateDepartmentDto): Promise<ApiResponse<Department>> =>
        backendApiClient.post<Department>('/departments', data),

    getAll: (companyId: string): Promise<ApiResponse<Department[]>> =>
        backendApiClient.get<Department[]>(`/departments?companyId=${companyId}`),

    getOne: (id: string): Promise<ApiResponse<Department>> =>
        backendApiClient.get<Department>(`/departments/${id}`),

    update: (id: string, data: UpdateDepartmentDto): Promise<ApiResponse<Department>> =>
        backendApiClient.patch<Department>(`/departments/${id}`, data),

    delete: (id: string): Promise<ApiResponse<void>> =>
        backendApiClient.delete<void>(`/departments/${id}`),
};
