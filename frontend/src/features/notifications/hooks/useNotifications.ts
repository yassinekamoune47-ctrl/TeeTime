import { useInfiniteQuery } from '@tanstack/react-query';
import {notificationsApi} from "@/api/endpoints/notification.api.ts";

const PAGE_SIZE = 20;

export function useNotifications() {
    return useInfiniteQuery({
        queryKey: ['notifications'],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await notificationsApi.getNotifications({ page: pageParam, size: PAGE_SIZE });
            return res.data.data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < PAGE_SIZE ? undefined : allPages.length,
        retry: false,
        refetchInterval: 20_000,
        refetchOnWindowFocus: true,
    });
}
