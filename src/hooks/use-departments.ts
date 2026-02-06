import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DepartmentService } from '@/services/department.service';
import { toast } from 'sonner';
import { CreateDepartmentDto, UpdateDepartmentDto, Department } from "@/types/department";

/**
 * Hook to fetch all departments for a company
 */
export const useDepartments = (companyId: string) => {
    return useQuery({
        queryKey: ['departments', 'list', companyId],
        queryFn: async () => {
            if (!companyId) return [];
            const response = await DepartmentService.getAll(companyId);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            return data?.data || data || [];
        },
        enabled: !!companyId,
    });
};

/**
 * Hook to fetch a single department by ID
 */
export const useDepartment = (id: string | null) => {
    return useQuery({
        queryKey: ['departments', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await DepartmentService.getOne(id);
            if (response.error) {
                throw new Error(response.error.message);
            }
            return (response.data as any)?.data || response.data || null;
        },
        enabled: !!id,
    });
};

/**
 * Hook for department mutations
 */
export const useDepartmentMutations = () => {
    const queryClient = useQueryClient();

    const createDepartment = useMutation({
        mutationFn: async (data: CreateDepartmentDto) => {
            const response = await DepartmentService.create(data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['departments', 'list', variables.companyId] });
            toast.success('Department created successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to create department'),
    });

    const updateDepartment = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateDepartmentDto }) => {
            const response = await DepartmentService.update(id, data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['departments', 'detail', data.id] });
            }
            toast.success('Department updated successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to update department'),
    });

    const deleteDepartment = useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId?: string }) => {
            const response = await DepartmentService.delete(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: (_, { companyId }) => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            toast.success('Department deleted successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to delete department'),
    });

    return {
        createDepartment,
        updateDepartment,
        deleteDepartment
    };
};
