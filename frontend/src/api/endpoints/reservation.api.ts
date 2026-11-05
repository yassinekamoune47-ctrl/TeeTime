import type { SearchPlayerReservations } from "@/features/reservations/types";
import { api } from "@/api/apiConfig.ts";

export const reservationApi = {
    searchPlayerReservations: (searchPlayerReservations: SearchPlayerReservations) =>
        api.post('/reservations/player/list', searchPlayerReservations),
    cancel: (id: string) =>
        api.patch(`/reservations/${id}/cancel`),
};
