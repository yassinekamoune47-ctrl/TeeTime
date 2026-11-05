import type { TournamentStatus } from '@/api/endpoints/tournament.api';

/** The eight official APEX tournament statuses, in lifecycle order. */
export const TOURNAMENT_STATUSES: TournamentStatus[] = [
  'BROUILLON',
  'INSCRIPTIONS_OUVERTES',
  'INSCRIPTIONS_FERMEES',
  'AVANT_TOURNOI',
  'EN_DIRECT',
  'TERMINE',
  'RESULTATS_PUBLIES',
  'ARCHIVE',
];

/** i18n key suffix, e.g. t(`status.${TOURNAMENT_STATUS_KEYS.BROUILLON}`) */
export const TOURNAMENT_STATUS_KEYS: Record<TournamentStatus, string> = {
  BROUILLON: 'brouillon',
  INSCRIPTIONS_OUVERTES: 'inscriptions_ouvertes',
  INSCRIPTIONS_FERMEES: 'inscriptions_fermees',
  AVANT_TOURNOI: 'avant_tournoi',
  EN_DIRECT: 'en_direct',
  TERMINE: 'termine',
  RESULTATS_PUBLIES: 'resultats_publies',
  ARCHIVE: 'archive',
};

export const TOURNAMENT_STATUS_BADGES: Record<TournamentStatus, string> = {
  BROUILLON: 'bg-secondary text-primary border-secondary',
  INSCRIPTIONS_OUVERTES: 'bg-primary text-secondary border-primary',
  INSCRIPTIONS_FERMEES: 'bg-primary/70 text-secondary border-primary',
  AVANT_TOURNOI: 'bg-secondary text-secondary-foreground border-secondary',
  EN_DIRECT: 'bg-success text-white border-success',
  TERMINE: 'bg-blue-600 text-white border-blue-600',
  RESULTATS_PUBLIES: 'bg-blue-500/15 text-blue-600 border-blue-500',
  ARCHIVE: 'bg-muted text-muted-foreground border-border',
};

/** Tinted variant used inside the admin management surfaces. */
export const TOURNAMENT_STATUS_BADGES_TINTED: Record<TournamentStatus, string> = {
  BROUILLON: 'border-primary bg-primary/15 text-primary',
  INSCRIPTIONS_OUVERTES: 'border-secondary bg-secondary/15 text-secondary',
  INSCRIPTIONS_FERMEES: 'border-secondary bg-secondary/25 text-secondary',
  AVANT_TOURNOI: 'border-secondary bg-secondary/15 text-secondary',
  EN_DIRECT: 'border-success bg-success/15 text-success',
  TERMINE: 'border-blue-500 bg-blue-500/15 text-blue-600',
  RESULTATS_PUBLIES: 'border-blue-500 bg-blue-500/15 text-blue-600',
  ARCHIVE: 'border-border bg-muted text-muted-foreground',
};
