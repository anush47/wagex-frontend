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
            // Handle NestJS wrapper: data.data is the paginated object { data: [], meta: {} }
            return data?.data || data || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
        },
        enabled: enabled && !!query.companyId,
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
            return (response.data as any)?.data || response.data || null;
        },
        enabled: !!id,
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
            return (response.data as any)?.data || response.data || null;
        },
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee created successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to create employee'),
    });

    const updateEmployee = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
            const response = await EmployeeService.updateEmployee(id, data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['employees', 'detail', data.id] });
            }
            toast.success('Employee updated successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to update employee'),
    });

    const deleteEmployee = useMutation({
        mutationFn: async (id: string) => {
            const response = await EmployeeService.deleteEmployee(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee deleted successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to delete employee'),
    });

    const provisionUser = useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId?: string }) => {
            const response = await EmployeeService.provisionUser(id, companyId);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['employees', 'detail', id] });
            toast.success('User account provisioned successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to provision user'),
    });

    return {
        createEmployee,
        updateEmployee,
        deleteEmployee,
        provisionUser
    };
};
