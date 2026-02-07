import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceSyncRecord } from "@/types/attendance";
import { toast } from "sonner";

export const useAttendance = (companyId: string) => {
    const queryClient = useQueryClient();

    const useSessions = (filters: {
        page?: number;
        limit?: number;
        employeeId?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
        approvalStatus?: string;
    }) => {
        return useQuery({
            queryKey: ["attendance-sessions", companyId, filters],
            queryFn: async () => {
                const response = await AttendanceService.getSessions({
                    companyId,
                    ...filters,
                });
                if (response.error) {
                    throw new Error(response.error.message);
                }
                const data = response.data as any;
                // Handle NestJS wrapper: data.data is the actual payload
                return data?.data || data;
            },
            enabled: !!companyId,

        });
    };

    const manualSyncMutation = useMutation({
        mutationFn: (records: AttendanceSyncRecord[]) =>
            AttendanceService.syncManual(companyId, records),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance-sessions", companyId] });
            toast.success("Attendance records updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update attendance");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: string; data: any }) =>
            AttendanceService.updateSession(companyId, sessionId, { ...data, companyId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance-sessions", companyId] });
            toast.success("Attendance session updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update record");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (sessionId: string) =>
            AttendanceService.deleteSession(companyId, sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance-sessions", companyId] });
            toast.success("Attendance session deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete record");
        },
    });

    const approveMutation = useMutation({


        mutationFn: ({ sessionId, status }: { sessionId: string; status: string }) =>
            AttendanceService.approveSession(companyId, sessionId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance-sessions", companyId] });
            toast.success("Attendance session updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status");
        },
    });

    return {
        useSessions,
        syncManual: manualSyncMutation.mutate,
        isSyncing: manualSyncMutation.isPending,
        update: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        remove: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        approve: approveMutation.mutate,
        isApproving: approveMutation.isPending,
    };
};



