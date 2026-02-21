import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PoliciesService } from "@/services/policy.service";
import { Policy, PolicySettings } from "@/types/policy";
import { toast } from "sonner";

/**
 * Hook to fetch all policies for a company
 */
export const useCompanyPolicies = (companyId: string) => {
    return useQuery<Policy[]>({
        queryKey: ['policies', 'list', companyId],
        queryFn: async () => {
            if (!companyId) return [];
            const response = await PoliciesService.getCompanyPolicies(companyId);
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
 * Hook to fetch company default policy
 */
export const useCompanyPolicy = (companyId: string) => {
    return useQuery<Policy | null>({
        queryKey: ['policies', 'company', companyId, 'default'],
        queryFn: async () => {
            if (!companyId) return null;
            const response = await PoliciesService.getCompanyDefaultPolicy(companyId);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            return data?.data || data || null;
        },
        enabled: !!companyId,
    });
};

/**
 * Hook to fetch effective policy for an employee
 */
export const useEffectivePolicy = (employeeId: string | null) => {
    return useQuery<{
        effective: PolicySettings;
        source: any;
        companyDefault: PolicySettings;
        assignedTemplate: PolicySettings;
    } | null>({
        queryKey: ['policies', 'effective', employeeId],
        queryFn: async () => {
            if (!employeeId) return null;
            const response = await PoliciesService.getEffectivePolicy(employeeId);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = (response.data as any)?.data || response.data;
            return data || null;
        },
        enabled: !!employeeId,
    });
};

/**
 * Hook for policy mutations (Create/Update/Delete)
 */
export const usePolicyMutations = () => {
    const queryClient = useQueryClient();

    const savePolicy = useMutation({
        mutationFn: async (payload: {
            companyId: string;
            name: string;
            description?: string;
            isDefault?: boolean;
            settings: PolicySettings
        }) => {
            const response = await PoliciesService.savePolicy(payload);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Saving policy...') };
        },
        onSuccess: (_, { companyId }, context: any) => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            toast.success('Policy saved successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context: any) => {
            toast.error(err.message || 'Failed to save policy', { id: context?.toastId });
        },
    });

    const updatePolicy = useMutation({
        mutationFn: async ({ id, data, companyId }: { id: string; data: Partial<any>; companyId?: string }) => {
            const payload = { ...data };
            if (companyId) payload.companyId = companyId;
            const response = await PoliciesService.updatePolicy(id, payload);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Updating policy...') };
        },
        onSuccess: (_, variables, context: any) => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            toast.success('Policy updated successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context: any) => {
            toast.error(err.message || 'Failed to update policy', { id: context?.toastId });
        },
    });

    const deletePolicy = useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
            const response = await PoliciesService.deletePolicy(id, companyId);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Deleting policy...') };
        },
        onSuccess: (_, { companyId }, context: any) => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            toast.success('Policy deleted', { id: context?.toastId });
        },
        onError: (err: any, _variables, context: any) => {
            toast.error(err.message || 'Failed to delete policy', { id: context?.toastId });
        },
    });

    return {
        savePolicy,
        updatePolicy,
        deletePolicy
    };
};
