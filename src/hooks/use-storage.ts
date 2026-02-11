import { useQuery } from '@tanstack/react-query';
import { StorageService } from '@/services/storage.service';

/**
 * Hook to fetch storage URL with caching
 */
export const useStorageUrl = (storageKey?: string | null) => {
    return useQuery<string | null, Error>({
        queryKey: ['storage', 'url', storageKey],
        queryFn: async (): Promise<string | null> => {
            if (!storageKey) {
                return null;
            }

            // If it's already a URL, return it directly
            if (storageKey.startsWith('http') || storageKey.startsWith('blob:')) {
                return storageKey;
            }

            const response = await StorageService.getUrl(storageKey);
            if (response.error) {
                throw new Error(response.error.message || 'Failed to get storage URL');
            }

            // The API response structure is deterministic: { statusCode, message, data: { url }, timestamp, path }
            // So the URL is always at response.data.data.url
            return (response.data as any).data.url as string;
        },
        enabled: !!storageKey && !storageKey.startsWith('http') && !storageKey.startsWith('blob:'),
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 45 * 60 * 1000,    // 45 minutes
    });
};