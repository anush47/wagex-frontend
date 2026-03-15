import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeService, EmployeeQuery } from '@/services/employee.service';
import { toast } from 'sonner';
import { Employee } from '@/types/employee';

/**
 * Hook to fetch employees with pagination and searching
 */
export const useEmployees = (query: EmployeeQuery, enabled = true) => {
    return useQuery({
        queryKey: ['employees', 'list', query],
        queryFn: async () => {
            const response = await EmployeeService.getEmployees(query);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            return data || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
        },
        enabled: enabled && !!query.companyId,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
    });
};

/**
 * Hook to fetch a single employee by ID
 */
export const useEmployee = (id: string | null) => {
    return useQuery({
        queryKey: ['employees', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await EmployeeService.getEmployee(id);
            if (response.error) {
                throw new Error(response.error.message);
            }
            return response.data || null;
        },
        enabled: !!id,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
    });
};

/**
 * Hook to fetch current employee profile
 */
export const useMe = () => {
    return useQuery({
        queryKey: ['employees', 'me'],
        queryFn: async () => {
            const response = await EmployeeService.getMe();
            if (response.error) {
                throw new Error(response.error.message);
            }
            return response.data || null;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
    });
};

/**
 * Hook for employee mutations (create, update, delete, provision)
 */
export const useEmployeeMutations = () => {
    const queryClient = useQueryClient();

    const createEmployee = useMutation({
        mutationFn: async (data: Partial<Employee>) => {
            const response = await EmployeeService.createEmployee(data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Creating employee...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee created successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to create employee', { id: context?.toastId });
        },
    });

    const updateEmployee = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
            const response = await EmployeeService.updateEmployee(id, data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Updating employee...') };
        },
        onSuccess: (data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['employees', 'detail', data.id] });
            }
            toast.success('Employee updated successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to update employee', { id: context?.toastId });
        },
    });

    const deleteEmployee = useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId?: string }) => {
            const response = await EmployeeService.deleteEmployee(id, companyId);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Deleting employee...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee deleted successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to delete employee', { id: context?.toastId });
        },
    });

    const provisionUser = useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId?: string }) => {
            const response = await EmployeeService.provisionUser(id, companyId);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Provisioning user account...') };
        },
        onSuccess: (_, { id }, context) => {
            queryClient.invalidateQueries({ queryKey: ['employees', 'detail', id] });
            toast.success('User account provisioned successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to provision user', { id: context?.toastId });
        },
    });

    return {
        createEmployee,
        updateEmployee,
        deleteEmployee,
        provisionUser
    };
};
