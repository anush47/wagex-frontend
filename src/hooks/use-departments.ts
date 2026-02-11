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
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
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
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
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
        onMutate: () => {
            return { toastId: toast.loading('Creating department...') };
        },
        onSuccess: (_, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['departments', 'list', variables.companyId] });
            toast.success('Department created successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to create department', { id: context?.toastId });
        },
    });

    const updateDepartment = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateDepartmentDto }) => {
            const response = await DepartmentService.update(id, data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Updating department...') };
        },
        onSuccess: (data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['departments', 'detail', data.id] });
            }
            toast.success('Department updated successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to update department', { id: context?.toastId });
        },
    });

    const deleteDepartment = useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId?: string }) => {
            const response = await DepartmentService.delete(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Deleting department...') };
        },
        onSuccess: (_, { companyId }, context) => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            toast.success('Department deleted successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to delete department', { id: context?.toastId });
        },
    });

    return {
        createDepartment,
        updateDepartment,
        deleteDepartment
    };
};
