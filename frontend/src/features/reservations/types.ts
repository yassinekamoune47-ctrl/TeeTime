export interface SlotPlayer {
  avatar?: string;
  name: string;
}

export interface Slot {
  time: string;
  available: boolean;
  totalSlots: number;
  players: SlotPlayer[];
}

export interface ReservationSummary {
  courseName: string;
  date: string;
  time: string;
  slotCount: number;
  pricePerPlayer: number;
  total: number;
}

// ─── Availability (from POST /time-slots/search) ───

export interface SlotAvailability {
  id: string;
  startTime: string; // ISO LocalDateTime
  endTime: string;
  bookedPlayers: number; // PENDING + ACCEPTED reservations
  status?: 'OPEN' | 'CLOSED' | 'RESERVED';
}

export interface CourseAvailability {
  id: string;
  name: string;
  holeCount: number;
  greenFee: number | null;
  greenFeeWeekday?: number | null;
  greenFeeWeekend?: number | null;
  priceOnRequest?: boolean;
  description: string;
  imagesUrl: string[];
  /** Weekly maintenance closures, Carbon dayOfWeekIso (1 = Monday … 7 = Sunday). */
  closedWeekdays?: number[];
  /** YYYY-MM-DD days inside the booking window that really carry a tee time. */
  availableDates?: string[];
  timeSlots: SlotAvailability[];
}

export interface BookingWindow {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  days: number;
}

export interface ClubAvailability {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  openTime: string; // HH:mm:ss
  closeTime: string;
  blockedForPlayer: boolean; // true → player already booked at this club on this date, whole club is blocked
  bookingWindow?: BookingWindow;
  courses: CourseAvailability[];
}

export interface SearchTimeSlots {
  clubName: string;
  city: string;
  address: string;
  date: string | null; // ISO date, null → tomorrow
  page: number;
  size: number;
}

// ─── Player Reservations ───

export type ReservationStatus = 'CONFIRMED' | 'ACCEPTED' | 'REJECTED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';

export interface PlayerReservation {
  reservationId: string;
  status: ReservationStatus;
  numberOfPlayers: number;
  reservationDate: string; // YYYY-MM-DD
  clubId: string;
  clubName: string;
  clubLogoURL: string | null;
  courseId: string;
  courseName: string;
  timeSlotId: string;
  startTime: string; // ISO LocalDateTime
  endTime: string; // ISO LocalDateTime
  createdAt: string; // ISO LocalDateTime
}

export interface SearchPlayerReservations {
  search: string;
  status: ReservationStatus | null;
  page: number;
  size: number;
}