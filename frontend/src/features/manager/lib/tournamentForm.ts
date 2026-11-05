export interface TournamentFormValues {
  name: string;
  description: string;
  date: string;
  location: string;
  entryFee: string;
  maxParticipants: string;
}

export type TournamentFormErrors = Partial<Record<keyof TournamentFormValues, string>>;

export interface TournamentFormImage {
  imageUrl?: string;
  imageFile?: File;
}

export const EMPTY_TOURNAMENT_FORM_VALUES: TournamentFormValues = {
  name: '',
  description: '',
  date: '',
  location: '',
  entryFee: '',
  maxParticipants: '',
};

/** APEX STEP 5.1 — name, date, golf course, fees and capacity are all mandatory. */
export function validateTournamentForm(values: TournamentFormValues): TournamentFormErrors {
  const errors: TournamentFormErrors = {};

  if (!values.name.trim()) errors.name = 'Le nom du tournoi est requis.';
  if (!values.location.trim()) errors.location = 'Le parcours ou le lieu est requis.';

  if (!values.date) {
    errors.date = 'La date du tournoi est requise.';
  } else if (Number.isNaN(new Date(values.date).getTime())) {
    errors.date = 'La date du tournoi est invalide.';
  }

  const entryFee = Number(values.entryFee);
  if (!values.entryFee.trim() || Number.isNaN(entryFee)) {
    errors.entryFee = "Les frais d'inscription sont requis.";
  } else if (entryFee < 0) {
    errors.entryFee = "Les frais d'inscription ne peuvent pas être négatifs.";
  }

  const capacity = Number(values.maxParticipants);
  if (!values.maxParticipants.trim() || Number.isNaN(capacity)) {
    errors.maxParticipants = 'La capacité est requise.';
  } else if (!Number.isInteger(capacity) || capacity < 1) {
    errors.maxParticipants = 'La capacité doit être un entier supérieur ou égal à 1.';
  }

  return errors;
}
