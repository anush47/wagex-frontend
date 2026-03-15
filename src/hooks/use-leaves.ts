import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeavesService } from '@/services/leaves.service';
import { EmployeeService, EmployeeQuery } from '@/services/employee.service';
import { toast } from 'sonner';
import type { LeaveStatus, CreateLeaveRequestDto } from '@/types/leave';

/**
 * Hook to fetch leave requests for a company
 */
export const useLeaveRequests = (companyId: string, filters?: { status?: LeaveStatus; employeeId?: string; startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ['leaves', 'requests', companyId, filters],
        queryFn: async () => {
            const response = await LeavesService.getCompanyRequests(companyId, filters);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            const unwrapped = data || [];
            return Array.isArray(unwrapped) ? unwrapped : (unwrapped?.data || []);
        },
        enabled: !!companyId,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
    });
};

/**
 * Hook to fetch leave balances for an employee
 */
export const useLeaveBalances = (employeeId: string | null) => {
    return useQuery({
        queryKey: ['leaves', 'balances', employeeId],
        queryFn: async () => {
            if (!employeeId) return [];
            const response = await LeavesService.getBalances(employeeId);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            return data || [];
        },
        enabled: !!employeeId,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
    });
};

/**
 * Hook to search employees
 */
export const useEmployees = (query: EmployeeQuery, enabled = true) => {
    return useQuery({
        queryKey: ['employees', 'search', query],
        queryFn: async () => {
            const response = await EmployeeService.getEmployees(query);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data || [];
            return Array.isArray(data) ? data : [];
        },
        enabled: enabled && !!query.companyId,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
    });
};

/**
 * Hook for leave actions (approve, reject, create)
 */
export const useLeaveMutations = () => {
    const queryClient = useQueryClient();

    const approveRequest = useMutation({
        mutationFn: async ({ id, managerId, reason }: { id: string; managerId: string; reason?: string }) => {
            const response = await LeavesService.approveRequest(id, managerId, reason);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Approving leave request...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave request approved', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to approve request', { id: context?.toastId });
        },
    });

    const rejectRequest = useMutation({
        mutationFn: async ({ id, managerId, reason }: { id: string; managerId: string; reason: string }) => {
            const response = await LeavesService.rejectRequest(id, managerId, reason);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Rejecting leave request...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave request rejected', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to reject request', { id: context?.toastId });
        },
    });

    const createRequest = useMutation({
        mutationFn: async (dto: CreateLeaveRequestDto) => {
            const response = await LeavesService.createRequest(dto);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Creating leave request...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave request created', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to create request', { id: context?.toastId });
        },
    });

    const deleteRequest = useMutation({
        mutationFn: async (id: string) => {
            const response = await LeavesService.deleteRequest(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Deleting leave request...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave request deleted', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to delete request', { id: context?.toastId });
        },
    });

    return {
        approveRequest,
        rejectRequest,
        createRequest,
        deleteRequest
    };
};
