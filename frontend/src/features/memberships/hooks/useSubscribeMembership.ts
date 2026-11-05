import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipRequestApi } from '@/api/endpoints/membershipRequest.api';
import type { SubscribeMembershipPayload } from '../types';

export function useSubscribeMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscribeMembershipPayload) => membershipRequestApi.request(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipRequests'] });
    },
  });
}
