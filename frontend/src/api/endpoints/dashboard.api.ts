import { api } from "@/api/apiConfig.ts";
import type { ApiResponse } from "@/features/auth/types.ts";
import type { AdminDashboardData, ManagerDashboardData, PlayerDashboardData } from "@/features/dashboard/types.ts";

export const dashboardApi = {
    getAdminDashboard: () =>
        api.get<ApiResponse<AdminDashboardData>>('/dashboard/admin'),

    getManagerDashboard: () =>
        api.get<ApiResponse<ManagerDashboardData>>('/dashboard/manager'),

    getPlayerDashboard: () =>
        api.get<ApiResponse<PlayerDashboardData>>('/dashboard/player'),
};