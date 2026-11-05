import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipRequestApi } from '@/api/endpoints/membershipRequest.api';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';

export function useRejectMembershipRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => membershipRequestApi.reject(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipRequests'] });
      toast.success('Request rejected');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });
}
