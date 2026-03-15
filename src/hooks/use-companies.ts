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
    status?: string;
} = {}) => {
    return useQuery({
        queryKey: ['companies', 'list', params],
        queryFn: async () => {
            const response = await CompanyService.getCompanies(params);
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response.data as any;
            return data || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
        },
        placeholderData: (previousData) => previousData,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
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
            return response.data || null;
        },
        enabled: !!id,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
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
        onMutate: () => {
            return { toastId: toast.loading('Creating company...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            toast.success('Company created successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to create company', { id: context?.toastId });
        },
    });

    const updateCompany = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyFormValues> }) => {
            const response = await CompanyService.updateCompany(id, data);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Updating company...') };
        },
        onSuccess: (data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['companies', 'detail', data.id] });
            }
            toast.success('Company updated successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to update company', { id: context?.toastId });
        },
    });

    const deleteCompany = useMutation({
        mutationFn: async (id: string) => {
            const response = await CompanyService.deleteCompany(id);
            if (response.error) throw new Error(response.error.message);
            return response.data;
        },
        onMutate: () => {
            return { toastId: toast.loading('Deleting company...') };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            toast.success('Company deleted successfully', { id: context?.toastId });
        },
        onError: (err: any, _variables, context) => {
            toast.error(err.message || 'Failed to delete company', { id: context?.toastId });
        },
    });

    return {
        createCompany,
        updateCompany,
        deleteCompany
    };
};
