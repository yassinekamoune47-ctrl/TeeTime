import { useQuery } from '@tanstack/react-query';
import { timeSlotApi } from '@/api/endpoints/timeSlot.api';
import type { BookingWindow } from '../types';

export interface CourseAvailableDates {
  bookingWindow: BookingWindow;
  closedWeekdays: number[];
  availableDates: string[]; // YYYY-MM-DD the course really publishes
}

export function useCourseAvailableDates(courseId: string) {
  return useQuery<CourseAvailableDates>({
    queryKey: ['courseDates', courseId],
    queryFn: async () => (await timeSlotApi.getCourseAvailableDates(courseId)).data.data,
    enabled: Boolean(courseId),
    staleTime: 30_000,
    retry: false,
  });
}
