import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PoliciesService } from '@/services/policy.service';
import { toast } from 'sonner';
import { PolicySettings } from '@/types/policy';

/**
 * Hook to fetch company policy
 */
export const useCompanyPolicy = (companyId: string) => {
    return useQuery({
        queryKey: ['policies', 'company', companyId],
        queryFn: async () => {
            if (!companyId) return null;
            const response = await PoliciesService.getCompanyPolicy(companyId);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            return data?.data || data || null;
        },
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook to fetch effective policy for an employee
 */
export const useEffectivePolicy = (employeeId: string | null) => {
    return useQuery({
        queryKey: ['policies', 'effective', employeeId],
        queryFn: async () => {
            if (!employeeId) return null;
            const response = await PoliciesService.getEffectivePolicy(employeeId);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = (response.data as any)?.data || response.data;
            // Return full orchestration object (effective, source, employeeOverride)
            return data || null;
        },
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook for policy mutations
 */
export const usePolicyMutations = () => {
    const queryClient = useQueryClient();

    const saveCompanyPolicy = useMutation({
        mutationFn: async ({ companyId, settings }: { companyId: string; settings: PolicySettings }) => {
            const response = await PoliciesService.saveCompanyPolicy(companyId, settings);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Saving company policy...') };
        },
        onSuccess: (_, { companyId }, context) => {
            queryClient.invalidateQueries({ queryKey: ['policies', 'company', companyId] });
            toast.success('Company policy saved successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to save company policy', { id: context?.toastId });
        },
    });

    const saveEmployeePolicy = useMutation({
        mutationFn: async ({ companyId, employeeId, settings }: { companyId: string; employeeId: string; settings: PolicySettings }) => {
            const response = await PoliciesService.saveEmployeePolicy(companyId, employeeId, settings);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Saving employee policy override...') };
        },
        onSuccess: (_, { employeeId }, context) => {
            queryClient.invalidateQueries({ queryKey: ['policies', 'effective', employeeId] });
            toast.success('Employee policy override saved successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to save employee policy override', { id: context?.toastId });
        },
    });

    const deleteEmployeePolicy = useMutation({
        mutationFn: async ({ employeeId, companyId }: { employeeId: string; companyId: string }) => {
            const response = await PoliciesService.deleteEmployeePolicy(employeeId, companyId);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Removing policy override...') };
        },
        onSuccess: (_, { employeeId }, context) => {
            queryClient.invalidateQueries({ queryKey: ['policies', 'effective', employeeId] });
            toast.success('Employee policy override removed', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to delete employee policy override', { id: context?.toastId });
        },
    });

    return {
        saveCompanyPolicy,
        saveEmployeePolicy,
        deleteEmployeePolicy
    };
};
