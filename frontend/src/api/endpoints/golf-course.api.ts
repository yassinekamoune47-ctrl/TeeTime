
import { api } from '@/api/apiConfig';
import type { ApiResponse } from '@/features/auth/types';

export interface GolfCourseApi {
  id: number;
  club_id: number | null;
  name: string;
  description: string | null;
  location: string;
  price_per_player: string | number | null;
  number_of_holes: number;
  image: string | null;
  is_active: boolean;
}

export interface ClubApi {
  id: number;
  name: string;
  city: string;
  address: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  cover_url: string | null;
  owner_id: number | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
  golf_courses: GolfCourseApi[];
}

export interface GolfCourseDto {
  id: string;
  name: string;
  description: string;
  holeCount: number;
  greenFee: number | null;
  greenFeeWeekend?: number | null;
  priceOnRequest?: boolean;
  imagesUrls?: string[];
  /** Weekly maintenance closures, Carbon dayOfWeekIso (1 = Monday … 7 = Sunday). */
  closedWeekdays?: number[];
}

export const golfCourseApi = {
  getClubs: () => api.get<ClubApi[]>('/clubs'),

  getGolfCourses: () => api.get<GolfCourseApi[]>('/golf-courses'),

  getGolfCourse: (id: string) => api.get<ApiResponse<GolfCourseDto>>(`/golf-courses/${id}`),
};
