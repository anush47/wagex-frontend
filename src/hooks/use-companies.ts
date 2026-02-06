import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompanyService } from '@/services/company.service';
import { CompanyFormValues } from '@/schemas/company.schema';
import { toast } from 'sonner';
import { Company } from '@/types/company';

/**
 * Hook to fetch companies with pagination and searching
 */
export const useCompanies = (params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
} = {}) => {
    return useQuery({
        queryKey: ['companies', 'list', params],
        queryFn: async () => {
            const response = await CompanyService.getCompanies(params);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            // Handle NestJS wrapper: data.data is the paginated object { data: [], meta: {} }
            return data?.data || data || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
        },
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Hook to fetch a single company by ID
 */
export const useCompany = (id: string | null) => {
    return useQuery({
        queryKey: ['companies', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await CompanyService.getCompany(id);
            if (response.error) {
                throw new Error(response.error.message);
            }
            return (response.data as any)?.data || response.data || null;
        },
        enabled: !!id,
    });
};

/**
 * Hook for company mutations
 */
export const useCompanyMutations = () => {
    const queryClient = useQueryClient();

    const createCompany = useMutation({
        mutationFn: async (data: CompanyFormValues) => {
            const response = await CompanyService.createCompany(data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            toast.success('Company created successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to create company'),
    });

    const updateCompany = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyFormValues> }) => {
            const response = await CompanyService.updateCompany(id, data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['companies', 'detail', data.id] });
            }
            toast.success('Company updated successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to update company'),
    });

    const deleteCompany = useMutation({
        mutationFn: async (id: string) => {
            const response = await CompanyService.deleteCompany(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            toast.success('Company deleted successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to delete company'),
    });

    return {
        createCompany,
        updateCompany,
        deleteCompany
    };
};
