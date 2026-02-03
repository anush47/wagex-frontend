import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompanyService } from '@/services/company.service';
import { CompanyFormValues } from '@/schemas/company.schema';
import { logger } from '@/lib/utils/logger';

export const useCompanies = (params: {
    page?: number;
    limit?: number;
    search?: string;
} = {}) => {
    return useQuery({
        queryKey: ['companies', params],
        queryFn: async () => {
            const response = await CompanyService.getCompanies(params);
            if (response.error) {
                throw new Error(response.error.message);
            }
            return response.data;
        },
    });
};

export const useCreateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CompanyFormValues) => {
            const response = await CompanyService.createCompany(data);
            if (response.error) {
                throw new Error(response.error.message);
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            logger.info('Company created successfully');
        },
        onError: (error) => {
            logger.error('Failed to create company', error);
        },
    });
};
