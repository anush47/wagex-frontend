import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeavesService } from '@/services/leaves.service';
import { EmployeeService, EmployeeQuery } from '@/services/employee.service';
import { toast } from 'sonner';
import type { LeaveStatus, CreateLeaveRequestDto } from '@/types/leave';

/**
 * Hook to fetch leave requests for a company
 */
export const useLeaveRequests = (companyId: string, filters?: { status?: LeaveStatus; employeeId?: string }) => {
    return useQuery({
        queryKey: ['leaves', 'requests', companyId, filters],
        queryFn: async () => {
            const response = await LeavesService.getCompanyRequests(companyId, filters);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            // Handle double/triple nesting from NestJS
            const unwrapped = data?.data?.data || data?.data || data || [];
            return Array.isArray(unwrapped) ? unwrapped : (unwrapped?.data || []);
        },
        enabled: !!companyId,
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
            return data?.data || data || [];
        },
        enabled: !!employeeId,
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
            const data = response.data?.data || [];
            return Array.isArray(data) ? data : (data as any)?.data || [];
        },
        enabled: enabled && !!query.companyId,
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave request approved');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to approve request'),
    });

    const rejectRequest = useMutation({
        mutationFn: async ({ id, managerId, reason }: { id: string; managerId: string; reason: string }) => {
            const response = await LeavesService.rejectRequest(id, managerId, reason);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave request rejected');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to reject request'),
    });

    const createRequest = useMutation({
        mutationFn: async (dto: CreateLeaveRequestDto) => {
            const response = await LeavesService.createRequest(dto);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave request created');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to create request'),
    });

    const deleteRequest = useMutation({
        mutationFn: async (id: string) => {
            const response = await LeavesService.deleteRequest(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave request deleted');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to delete request'),
    });

    return {
        approveRequest,
        rejectRequest,
        createRequest,
        deleteRequest
    };
};
