import type { TournamentStatus } from '@/api/endpoints/tournament.api';

export type { TournamentStatus };

export interface Tournament {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  clubName: string | null;
  status: TournamentStatus;
  image: string;
  entryFee: number;
  maxParticipants: number;
}

export interface TournamentFilterValues {
  date: string;
  location: string;
  status: string;
}
