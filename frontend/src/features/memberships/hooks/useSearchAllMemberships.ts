import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { membershipApi } from '@/api/endpoints/membership.api';
import type { Membership, SearchAllMemberships } from '../types';

export function useSearchAllMemberships(filters: Omit<SearchAllMemberships, 'page' | 'size'>) {
    const { i18n } = useTranslation();

    return useInfiniteQuery<Membership[]>({
        queryKey: ['memberships', 'searchAll', filters, i18n.language],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await membershipApi.searchAllMemberships({
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
