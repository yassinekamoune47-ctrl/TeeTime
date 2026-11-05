import type { SearchTimeSlots } from '@/features/reservations/types';
import { api } from '@/api/apiConfig';

export const timeSlotApi = {
    searchTimeSlots: (data: SearchTimeSlots) =>
        api.post('/time-slots/search', data),
    getCourseTimeSlots: (courseId: string, date: string) =>
        api.get('/time-slots/course', { params: { courseId, date } }),
    getCourseAvailableDates: (courseId: string) =>
        api.get('/time-slots/available-dates', { params: { courseId } }),
    createTimeSlot: (data: { startTime: string; endTime: string; status?: 'OPEN' | 'CLOSED' | 'RESERVED'; courseId: string }) =>
        api.post('/time-slots/add', data),
    updateTimeSlotStatus: (data: { id: string; status: 'OPEN' | 'CLOSED' | 'RESERVED' }) =>
        api.put('/time-slots/update-status', data),
};