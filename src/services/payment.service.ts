import { backendApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api/api.types';
import { Payment, PaymentQueryParams } from '@/types/salary';

export class PaymentService {
    static async getPayments(params: PaymentQueryParams): Promise<ApiResponse<Payment[]>> {
        return backendApiClient.get<Payment[]>(`/payments?companyId=${params.companyId}`);
    }

    static async getMyPayments(): Promise<ApiResponse<Payment[]>> {
        return backendApiClient.get<Payment[]>('/payments/me');
    }

    static async acknowledgePayment(id: string): Promise<ApiResponse<Payment>> {
        return backendApiClient.post<Payment>(`/payments/${id}/acknowledge`);
    }

    static async createPayment(dto: any): Promise<ApiResponse<Payment>> {
        return backendApiClient.post<Payment>('/payments', dto);
    }

    static async deletePayment(id: string): Promise<ApiResponse<void>> {
        return backendApiClient.delete<void>(`/payments/${id}`);
    }
}
