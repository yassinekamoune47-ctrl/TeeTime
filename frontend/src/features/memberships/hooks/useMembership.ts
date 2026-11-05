import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { membershipApi } from '@/api/endpoints/membership.api';
import type { Membership } from '../types';

export function useMembership(membershipId?: string) {
  const { i18n } = useTranslation();

  return useQuery<Membership>({
    queryKey: ['memberships', 'detail', membershipId, i18n.language],
    queryFn: async () => {
      const res = await membershipApi.getMembership(membershipId as string);
      return res.data.data as Membership;
    },
    enabled: Boolean(membershipId),
    retry: false,
  });
}
