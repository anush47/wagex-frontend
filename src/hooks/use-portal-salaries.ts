import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SalaryService } from "@/services/salary.service";
import { PaymentService } from "@/services/payment.service";
import { AdvanceService } from "@/services/advance.service";
import { toast } from "sonner";
import { SalaryQueryParams } from '@/types/salary';

export function usePortalSalaries(params: SalaryQueryParams) {
    const queryClient = useQueryClient();

    const salariesQuery = useQuery({
        queryKey: ['portal-salaries', params],
        queryFn: async () => {
            const response = await SalaryService.getMySalaries(params);
            if (response.error) throw new Error(response.error.message);
            return response.data || { items: [], total: 0, page: 1, limit: 10 };
        },
    });

    return {
        salariesQuery,
    };
}

export function usePortalPayments() {
    const queryClient = useQueryClient();

    const paymentsQuery = useQuery({
        queryKey: ['portal-payments'],
        queryFn: async () => {
            const response = await PaymentService.getMyPayments();
            if (response.error) throw new Error(response.error.message);
            return response.data || [];
        },
    });

    const acknowledgeMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await PaymentService.acknowledgePayment(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-payments'] });
            toast.success('Payment acknowledged');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to acknowledge payment');
        }
    });

    return {
        paymentsQuery,
        acknowledgeMutation,
    };
}

export function usePortalAdvances() {
    const queryClient = useQueryClient();

    const advancesQuery = useQuery({
        queryKey: ['portal-advances'],
        queryFn: async () => {
            const response = await AdvanceService.getMyAdvances();
            if (response.error) throw new Error(response.error.message);
            return response.data || [];
        },
    });

    return {
        advancesQuery,
    };
}
