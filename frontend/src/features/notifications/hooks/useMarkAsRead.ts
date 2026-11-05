import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type { Notification } from '@/features/notifications/types.ts';
import {notificationsApi} from "@/api/endpoints/notification.api.ts";

export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationsApi.markAsRead(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });

            queryClient.setQueryData<InfiniteData<Notification[]>>(['notifications'], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) =>
                        page.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                    ),
                };
            });
            queryClient.setQueryData<number>(['notifications', 'unread-count'], (old) =>
                Math.max(0, (old ?? 1) - 1)
            );
        },
        onError: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
    });
}