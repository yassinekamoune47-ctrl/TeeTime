import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from "@/api/endpoints/dashboard.api.ts";
import { useAuthStore } from '@/features/auth/store';

export function usePlayerDashboard() {
    const userId = useAuthStore((state) => state.user?.id);

    return useQuery({
        // Scoping the cache by user id prevents one account's dashboard from
        // being served to the next account on the same browser.
        queryKey: ['player-dashboard', userId],
        queryFn: async () => {
            const res = await dashboardApi.getPlayerDashboard();
            return res.data.data;
        },
        enabled: !!userId,
        staleTime: 60_000, // avoid refetch storms when navigating back to the dashboard
        retry: false,
    });
}
