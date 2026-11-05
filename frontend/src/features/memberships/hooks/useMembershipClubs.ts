import { useQuery } from '@tanstack/react-query';
import { clubApi } from '@/api/endpoints/club.api';
import { ECStatus } from '@/api/types';
import type { Club } from '@/features/clubs/types';

export function useMembershipClubs() {
  return useQuery<Club[]>({
    queryKey: ['memberships', 'clubs'],
    queryFn: async () => {
      const res = await clubApi.searchClubs({
        name: '',
        city: '',
        phone: '',
        email: '',
        status: ECStatus.ACTIVE,
        ownerFirstName: '',
        ownerLastName: '',
        page: 0,
        size: 50,
      });
      return res.data.data;
    },
    staleTime: 60_000,
    retry: false,
  });
}
