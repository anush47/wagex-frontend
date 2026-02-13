import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdvanceService } from '@/services/advance.service';
import { AdvanceQueryParams } from '@/types/salary';
import { toast } from 'sonner';

export function useAdvances(params: AdvanceQueryParams) {
    const queryClient = useQueryClient();

    const advancesQuery = useQuery({
        queryKey: ['advances', params],
        queryFn: async () => {
            const response = await AdvanceService.getAdvances(params);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || { items: [], meta: {} };
        },
        enabled: !!params.companyId,
    });

    const advanceQuery = (id: string) => useQuery({
        queryKey: ['advance', id],
        queryFn: async () => {
            const response = await AdvanceService.getAdvanceById(id);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || null;
        },
        enabled: !!id,
    });

    const createAdvanceMutation = useMutation({
        mutationFn: async (dto: any) => {
            const response = await AdvanceService.createAdvance(dto);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || null;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['advances'] });
            toast.success('Advance created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create advance');
        }
    });

    const approveAdvanceMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await AdvanceService.approveAdvance(id);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || null;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['advances'] });
            toast.success('Advance approved successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to approve advance');
        }
    });

    return {
        advancesQuery,
        advanceQuery,
        createAdvanceMutation,
        approveAdvanceMutation,
    };
}
