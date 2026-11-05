import type {Course} from "@/features/courses/types.ts";

export interface Club {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  logoURL: string;
  coverURL: string;
  status: ECStatus;
  ownerId: string | null;
  ownerName: string | null;
  memberCount: number;
  courseCount: number;
  createdAt: string;
  courses: Array<Course>;
}

export interface CreateClub {
  name: string;
  city: string;
  address: string;
  ownerId: string | null;
}

export interface ClubFormData {
  id: string | undefined;
  name: string | undefined;
  city: string | undefined;
  description: string | undefined;
  phone: string | undefined;
  email: string | undefined;
  address: string | undefined;
  logo?: File | null;
  cover?: File | null;
}

export const ECStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  ARCHIVED: "ARCHIVED",
  ALL: ""
}
export type ECStatus = (typeof ECStatus)[keyof typeof ECStatus];

export interface UpdateClub {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  logoURL: string;
  coverURL: string;
  galleryURL: string;
  ddNSNumber: string;
  ddEWNumber: string;
}