import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/apiConfig';

export interface ManagerReservation {
  id: string;
  status: string; // PENDING | ACCEPTED | REJECTED
  playerName: string;
  playerPhone: string;
  courseId: string;
  courseName: string;
  startTime: string; // ISO LocalDateTime
  numberOfPlayers: number;
  greenFee: number | null;
  requestedAt: string; // ISO LocalDateTime
}

export interface ManagerReservationFilters {
  name?: string;       // player name search (server-side LIKE)
  status?: string;     // PENDING | ACCEPTED | REJECTED
  courseId?: string;
  date?: string;       // YYYY-MM-DD
}

interface ManagerReservationsPage {
  items: ManagerReservation[];
  hasMore: boolean;
}

export function useManagerReservations(filters: ManagerReservationFilters) {
  return useInfiniteQuery<ManagerReservationsPage>({
    queryKey: ['reservations', 'manager', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.get('/reservations/club', {
        params: {
          name: filters.name?.trim() || undefined,
          status: filters.status || undefined,
          courseId: filters.courseId || undefined,
          date: filters.date || undefined,
          page: pageParam as number,
          size: 10,
        },
      });
      const page = res.data.data;
      return { items: page.content as ManagerReservation[], hasMore: !page.last };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    retry: false,
  });
}
