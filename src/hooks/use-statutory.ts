import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EpfService } from "@/services/epf.service";
import { EtfService } from "@/services/etf.service";
import { toast } from "sonner";
import { EpfQuery, EtfQuery } from '@/types/statutory';

export function useEpf(params: EpfQuery) {
    const queryClient = useQueryClient();

    const epfRecordsQuery = useQuery({
        queryKey: ['epf-records', params],
        queryFn: async () => {
            const response = await EpfService.getRecords(params);
            if (response.error) throw new Error(response.error.message);
            return response.data || { items: [], total: 0 };
        },
        enabled: !!params.companyId,
    });

    const createEpfMutation = useMutation({
        mutationFn: async (dto: any) => {
            const response = await EpfService.createRecord(params.companyId!, dto);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['epf-records'] });
            toast.success('EPF record created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create EPF record');
        }
    });

    const updateEpfMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const response = await EpfService.updateRecord(params.companyId!, id, data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['epf-records'] });
            toast.success('EPF record updated successfully');
        },
    });

    const deleteEpfMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await EpfService.deleteRecord(params.companyId!, id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['epf-records'] });
        }
    });

    return {
        epfRecordsQuery,
        createEpfMutation,
        updateEpfMutation,
        deleteEpfMutation,
    };
}

export function useEtf(params: EtfQuery) {
    const queryClient = useQueryClient();

    const etfRecordsQuery = useQuery({
        queryKey: ['etf-records', params],
        queryFn: async () => {
            const response = await EtfService.getRecords(params);
            if (response.error) throw new Error(response.error.message);
            return response.data || { items: [], total: 0 };
        },
        enabled: !!params.companyId,
    });

    const createEtfMutation = useMutation({
        mutationFn: async (dto: any) => {
            const response = await EtfService.createRecord(params.companyId!, dto);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['etf-records'] });
            toast.success('ETF record created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create ETF record');
        }
    });

    const updateEtfMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const response = await EtfService.updateRecord(params.companyId!, id, data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['etf-records'] });
            toast.success('ETF record updated successfully');
        },
    });

    const deleteEtfMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await EtfService.deleteRecord(params.companyId!, id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['etf-records'] });
        }
    });

    return {
        etfRecordsQuery,
        createEtfMutation,
        updateEtfMutation,
        deleteEtfMutation,
    };
}
