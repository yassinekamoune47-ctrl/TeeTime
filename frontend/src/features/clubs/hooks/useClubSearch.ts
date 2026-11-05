import { useQuery } from '@tanstack/react-query';
import { clubApi } from '@/api/endpoints/club.api';
import { ECStatus } from '@/api/types';
import type { Club } from '../types';

export interface ClubSearchCriteria {
  city: string;
  clubName: string;
}

export function useClubSearch(criteria: ClubSearchCriteria) {
  return useQuery<Club[]>({
    queryKey: ['clubs', 'search', criteria],
    queryFn: async () => {
      const res = await clubApi.searchClubs({
        name: criteria.clubName.trim(),
        city: criteria.city.trim(),
        phone: '',
        email: '',
        status: ECStatus.ACTIVE,
        ownerFirstName: '',
        ownerLastName: '',
        page: 0,
        size: 100,
      });
      return res.data.data;
    },
    staleTime: 30_000,
    retry: false,
  });
}
