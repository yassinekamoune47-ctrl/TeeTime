import type {SearchRole} from "@/types/user.types.ts";

export interface mfaRequest {
    code: string;
}

export interface SearchUsers {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: EUGender;
    status: EUStatus;
    role: SearchRole;
    page: number;
    size: number;
}

export interface SearchClubs {
    name: string;
    city: string;
    phone: string;
    email: string;
    status: ECStatus;
    ownerFirstName: string;
    ownerLastName: string;
    size: number;
    page: number;
}

export const EUGender = {
    MALE: "MALE",
    FEMALE: "FEMALE",
    ALL: "",
} as const;

export type EUGender = (typeof EUGender)[keyof typeof EUGender];

export const EUStatus = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    ALL: ""
} as const;

export type EUStatus = (typeof EUStatus)[keyof typeof EUStatus];

export const ECStatus = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    ARCHIVED: "ARCHIVED",
    ALL: ""
} as const;

export type ECStatus = (typeof ECStatus)[keyof typeof ECStatus];

export interface ReassignClub {
    clubId: string | undefined;
    managerId: string | null;
}