    import { useInfiniteQuery } from '@tanstack/react-query';
import { membershipApi } from '@/api/endpoints/membership.api.ts';
import type { Membership, SearchMyMemberships } from '../../memberships/types.ts';

export function useSearchMyMemberships(filters: Omit<SearchMyMemberships, 'page' | 'size'>) {
    return useInfiniteQuery<Membership[]>({
        queryKey: ['memberships', 'searchMy', filters],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await membershipApi.searchMyMemberships({
                ...filters,
                page: pageParam as number,
                size: 10,
            });
            return res.data.data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            lastPage && lastPage.length < 10 ? undefined : allPages.length,
        retry: false,
    });
}
