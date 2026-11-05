import { api } from '@/api/apiConfig.ts';
import type { ApiResponse } from '@/features/auth/types.ts';
import type { Notification } from '@/features/notifications/types.ts';

export const notificationsApi = {
    getNotifications: ({ page = 0, size = 20 }) =>
        api.get<ApiResponse<Notification[]>>('/notifications', { params: { page, size } }),

    getUnreadCount: () =>
        api.get<ApiResponse<number>>('/notifications/unread-count'),

    markAsRead: (id: string) =>
        api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

    markAllAsRead: () =>
        api.patch<ApiResponse<string>>('/notifications/read-all'),
};