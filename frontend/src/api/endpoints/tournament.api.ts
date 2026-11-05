import { api } from '@/api/apiConfig';

/** The eight official APEX tournament statuses. */
export type TournamentStatus =
  | 'BROUILLON'
  | 'INSCRIPTIONS_OUVERTES'
  | 'INSCRIPTIONS_FERMEES'
  | 'AVANT_TOURNOI'
  | 'EN_DIRECT'
  | 'TERMINE'
  | 'RESULTATS_PUBLIES'
  | 'ARCHIVE';

export interface TournamentResponse {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  clubName: string | null;
  status: TournamentStatus;
  imageUrl?: string;
  entryFee: number;
  maxParticipants: number;
  /** Statuses the APEX lifecycle authorises from the current one. */
  nextStatuses: TournamentStatus[];
}

export type TournamentPayload = FormData | Record<string, unknown>;

export type TournamentSearchParams = {
  q?: string;
  status?: string;
  location?: string;
  date?: string;
  page?: number;
  size?: number;
};

export const tournamentApi = {
  // APEX Admin only: lists every tournament, drafts included.
  search: (params: TournamentSearchParams) =>
    api.post('/tournaments/search', params).then(res => res.data?.data as TournamentResponse[]),
  // Public search — works for unauthenticated visitors; drafts are never returned.
  publicSearch: (params: TournamentSearchParams) =>
    api.post('/tournaments/public-search', params).then(res => res.data?.data as TournamentResponse[]),
  create: (data: TournamentPayload) => api.post('/tournaments', data).then(res => res.data?.data),
  update: (data: TournamentPayload) => api.put('/tournaments', data).then(res => res.data?.data),
  delete: (id: string) => api.delete(`/tournaments/${id}`).then(res => res.data?.data),
};
