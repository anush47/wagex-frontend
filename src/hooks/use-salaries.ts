import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SalaryService } from '@/services/salary.service';
import { SalaryQueryParams, SalaryPreviewDto } from '@/types/salary';
import { toast } from 'sonner';

export function useSalaries(params: SalaryQueryParams) {
    const queryClient = useQueryClient();

    const salariesQuery = useQuery({
        queryKey: ['salaries', params],
        queryFn: async () => {
            const response = await SalaryService.getSalaries(params);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || { items: [], meta: {} };
        },
        enabled: !!params.companyId,
    });

    const salaryQuery = (id: string) => useQuery({
        queryKey: ['salary', id],
        queryFn: async () => {
            const response = await SalaryService.getSalaryById(id);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || null;
        },
        enabled: !!id,
    });

    const generatePreviewsMutation = useMutation({
        mutationFn: async (dto: SalaryPreviewDto) => {
            const response = await SalaryService.generatePreviews(dto);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || [];
        },
    });

    const saveDraftsMutation = useMutation({
        mutationFn: async ({ companyId, previews }: { companyId: string, previews: any[] }) => {
            const response = await SalaryService.saveDrafts(companyId, previews);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || [];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salaries'] });
            toast.success('Salary drafts saved successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save drafts');
        }
    });

    return {
        salariesQuery,
        salaryQuery,
        generatePreviewsMutation,
        saveDraftsMutation,
    };
}
