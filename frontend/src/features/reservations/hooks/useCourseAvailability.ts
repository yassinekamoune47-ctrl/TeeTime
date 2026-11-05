import { useQuery } from '@tanstack/react-query';
import { timeSlotApi } from '@/api/endpoints/timeSlot.api';
import type { SlotAvailability } from '../types';

export function useCourseAvailability(courseId: string, date: string, enabled: boolean) {
  return useQuery<SlotAvailability[]>({
    queryKey: ['courseSlots', courseId, date],
    queryFn: async () => {
      const res = await timeSlotApi.getCourseTimeSlots(courseId, date);
      return res.data.data;
    },
    enabled: enabled && Boolean(courseId) && Boolean(date),
    staleTime: 15_000,
    retry: false,
  });
}
