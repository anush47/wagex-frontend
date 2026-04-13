import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.service";

export function useEmployerDashboard() {
    return useQuery({
        queryKey: ["employer-dashboard"],
        queryFn: async () => {
            const response = await DashboardService.getEmployerStats();
            return response.data;
        },
        refetchInterval: 30000, // Refresh every 30s
    });
}
