import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SalaryService } from "@/services/salary.service";
import { PaymentService } from "@/services/payment.service";
import { toast } from "sonner";
import { SalaryQueryParams, SalaryPreviewDto } from '@/types/salary';

export function useSalaries(params: SalaryQueryParams) {
    const queryClient = useQueryClient();

    const salariesQuery = useQuery({
        queryKey: ['salaries', params],
        queryFn: async () => {
            const response = await SalaryService.getSalaries(params);
            if (response.error) throw new Error(response.error.message);
            return response.data || { items: [], meta: {} };
        },
        enabled: !!params.companyId,
    });

    const salaryQuery = (id: string) => useQuery({
        queryKey: ['salary', id],
        queryFn: async () => {
            const response = await SalaryService.getSalaryById(id);
            if (response.error) throw new Error(response.error.message);
            return response.data || null;
        },
        enabled: !!id,
    });

    const generatePreviewsMutation = useMutation({
        mutationFn: async (dto: SalaryPreviewDto) => {
            const response = await SalaryService.generatePreviews(dto);
            if (response.error) throw new Error(response.error.message);
            return response.data || [];
        },
    });

    const saveDraftsMutation = useMutation({
        mutationFn: async ({ companyId, previews }: { companyId: string, previews: any[] }) => {
            const response = await SalaryService.saveDrafts(companyId, previews);
            if (response.error) throw new Error(response.error.message);
            return response.data || [];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salaries'] });
            toast.success('Salary drafts saved successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save drafts');
        }
    });

    const updateSalaryMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const response = await SalaryService.updateSalary(id, data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Saving salary changes...') };
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['salaries'] });
            toast.dismiss(context?.toastId);
            toast.success('Salary updated successfully');
        },
        onError: (error: any, variables, context) => {
            toast.dismiss(context?.toastId);
            toast.error(error.message || 'Failed to update salary');
        }
    });

    const approveSalaryMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await SalaryService.approveSalary(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Approving salary...') };
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['salaries'] });
            toast.dismiss(context?.toastId);
            toast.success('Salary approved successfully');
        },
        onError: (error: any, variables, context) => {
            toast.dismiss(context?.toastId);
            toast.error(error.message || 'Failed to approve salary');
        }
    });

    const deleteSalaryMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await SalaryService.deleteSalary(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Deleting salary...') };
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['salaries'] });
            toast.dismiss(context?.toastId);
            toast.success('Salary deleted successfully');
        },
        onError: (error: any, variables, context) => {
            toast.dismiss(context?.toastId);
            toast.error(error.message || 'Failed to delete salary');
        }
    });

    const createPaymentMutation = useMutation({
        mutationFn: async (dto: any) => {
            const response = await PaymentService.createPayment(dto);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Recording payment...') };
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['salaries'] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            toast.dismiss(context?.toastId);
            toast.success('Payment recorded successfully');
        },
        onError: (error: any, variables, context) => {
            toast.dismiss(context?.toastId);
            toast.error(error.message || 'Failed to record payment');
        }
    });

    return {
        salariesQuery,
        salaryQuery,
        generatePreviewsMutation,
        saveDraftsMutation,
        updateSalaryMutation,
        approveSalaryMutation,
        deleteSalaryMutation,
        createPaymentMutation,
    };
}
