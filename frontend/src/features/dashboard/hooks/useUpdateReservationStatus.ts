import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiConfig';

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; status: 'ACCEPTED' | 'REJECTED'; reason?: string }) =>
      api.put('/reservations/update-status', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reservations', 'manager'] });
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      queryClient.invalidateQueries({ queryKey: ['courseSlots'] });
      // the player's bell is a different session, but the admin's own view refreshes at once
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
