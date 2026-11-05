import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiConfig';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';

export interface CreateReservationPayload {
  courseId: string;
  startTime: string;
  numberOfPlayers: number;
  reservationDate: string;
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReservationPayload) => api.post('/reservations/add', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      queryClient.invalidateQueries({ queryKey: ['courseSlots'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Reservation requested successfully');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });
}