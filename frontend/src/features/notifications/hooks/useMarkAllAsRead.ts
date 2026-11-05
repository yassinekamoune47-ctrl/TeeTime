import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type { Notification } from '@/features/notifications/types.ts';
import {notificationsApi} from "@/api/endpoints/notification.api.ts";

export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });

            queryClient.setQueryData<InfiniteData<Notification[]>>(['notifications'], (old) => {
                if (!old) return old;
                return { ...old, pages: old.pages.map((page) => page.map((n) => ({ ...n, isRead: true }))) };
            });
            queryClient.setQueryData<number>(['notifications', 'unread-count'], 0);
        },
        onError: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
    });
}