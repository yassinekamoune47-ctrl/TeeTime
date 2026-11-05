import { useQuery } from '@tanstack/react-query';
import {notificationsApi} from "@/api/endpoints/notification.api.ts";

export function useUnreadCount() {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => (await notificationsApi.getUnreadCount()).data.data,
        retry: false,
        refetchInterval: 15_000,
        refetchOnWindowFocus: true,
    });
}
