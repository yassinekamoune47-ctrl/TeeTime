import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from "@/api/endpoints/dashboard.api.ts";

export function useManagerDashboard() {
    return useQuery({
        queryKey: ['manager-dashboard'],
        queryFn: async () => {
            const res = await dashboardApi.getManagerDashboard();
            return res.data.data;
        },
        staleTime: 60_000, // analytics don't change every second — avoid refetch storms
        retry: false,
    });
}