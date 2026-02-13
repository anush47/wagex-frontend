import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService } from '@/services/payment.service';
import { PaymentQueryParams } from '@/types/salary';
import { toast } from 'sonner';

export function usePayments(params: PaymentQueryParams) {
    const queryClient = useQueryClient();

    const paymentsQuery = useQuery({
        queryKey: ['payments', params],
        queryFn: async () => {
            const response = await PaymentService.getPayments(params);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || { items: [], meta: {} };
        },
        enabled: !!params.companyId,
    });

    const createPaymentMutation = useMutation({
        mutationFn: async (dto: any) => {
            const response = await PaymentService.createPayment(dto);
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data || null;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['salaries'] });
            queryClient.invalidateQueries({ queryKey: ['advances'] });
            toast.success('Payment recorded successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to record payment');
        }
    });

    return {
        paymentsQuery,
        createPaymentMutation,
    };
}
