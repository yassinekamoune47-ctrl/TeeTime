import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/apiConfig';

export interface PlanningPlayer {
  reservationId: string;
  playerName: string;
  phone?: string;
  players: number;
}

export interface ManagerPlanningSlot {
  id: string;
  startTime: string; // ISO LocalDateTime
  endTime: string;
  status: 'OPEN' | 'CLOSED' | 'RESERVED';
  bookedPlayers: number;
  courseId: string;
  courseName: string;
  greenFee?: number | null;
  players: PlanningPlayer[];
}

export interface ManagerPlanningFilters {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  courseId?: string;
  q?: string;
}

interface ManagerPlanningPage {
  content: ManagerPlanningSlot[];
  last: boolean;
}

export function useManagerPlanning(filters: ManagerPlanningFilters) {
  return useInfiniteQuery<ManagerPlanningPage>({
    queryKey: ['time-slots', 'planning', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.post('/time-slots/manager', {
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        courseId: filters.courseId || undefined,
        q: filters.q?.trim() || undefined,
        page: pageParam as number,
        size: 10000,
      });
      return { content: res.data.data.content as ManagerPlanningSlot[], last: res.data.data.last };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.last ? undefined : allPages.length,
    retry: false,
  });
}
