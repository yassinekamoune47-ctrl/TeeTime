import { useInfiniteQuery } from '@tanstack/react-query';
import { membershipRequestApi } from '@/api/endpoints/membershipRequest.api';
import type { MembershipRequest, SearchMembershipRequests } from '@/features/memberships/types';

export function useSearchMembershipRequests(filters: Omit<SearchMembershipRequests, 'page' | 'size'>) {
  return useInfiniteQuery<MembershipRequest[]>({
    queryKey: ['membershipRequests', 'search', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await membershipRequestApi.searchAll({
        ...filters,
        page: pageParam as number,
        size: 10,
      });
      return res.data.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length < 10 ? undefined : allPages.length),
    retry: false,
  });
}
