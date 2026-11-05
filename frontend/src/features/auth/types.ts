import type { User, Role } from '@/types/user.types';
import type {EUGender} from "@/api/types.ts";

export interface AuthUserDTO {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: string | null;
  bio: string | null;
  avatarURL: string | null;
  role: string;
}

/** Raw user payload coming from the API; profile fields are optional. */
export interface RawAuthUser extends AuthUserDTO {
  status?: string;
  birthDate?: string | null;
  countryCallingCode?: string | null;
  frmglLicenseNumber?: string | null;
  currentHandicap?: number | null;
  registerAt?: string;
  clubId?: string;
  clubName?: string;
  isTotpEnabled?: boolean;
}

/** Mirrors the API's canonical role form so hand-written values ('Admin APEX') reach the guards. */
function normalizeRole(value: string): Role {
  const role = value
    .trim()
    .replace(/^ROLE_/i, '')
    .replace(/[-\s]/g, '_')
    .toUpperCase();

  if (role === 'APEX_ADMIN') return 'ADMIN_APEX';

  return (role || 'PLAYER') as Role;
}

export function toUser(raw: RawAuthUser): User {
    return {
        id: raw.id,
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: raw.email,
        phoneNumber: raw.phoneNumber ?? '',
        countryCallingCode: raw.countryCallingCode ?? '',
        frmglLicenseNumber: raw.frmglLicenseNumber ?? '',
        currentHandicap: raw.currentHandicap === null || raw.currentHandicap === undefined ? '' : String(raw.currentHandicap),

        status: raw.status ?? '',
        gender: (raw.gender ?? '') as EUGender,
        avatarURL: raw.avatarURL ?? '',
        bio: raw.bio ?? '',
        birthDate: raw.birthDate ?? null,

        role: normalizeRole(raw.role ?? ''),
        registerAt: raw.registerAt ?? '',
        clubId: raw.clubId ?? '',
        clubName: raw.clubName ?? '',

        isTotpEnabled: !!raw.isTotpEnabled,
    };
}

export interface ApiResponse<T> {
  length: number;
  success?: boolean;
  availableMethods?: string[];
  message: string;
  data: T;
}


export interface LoginDTO {
  email: string;
  password: string;
}

export interface SignUpDTO {
    firstName: string;
    lastName: string;
    email: string;
    gender: string | null;
    countryCallingCode: string;
    phoneNumber: string;
    frmglLicenseNumber: string;
    currentHandicap: string;
    password: string;
}