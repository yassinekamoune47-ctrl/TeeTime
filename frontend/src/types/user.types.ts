import type {EUGender} from "@/api/types.ts";

export type Role = 'PLAYER' | 'MANAGER' | 'ADMIN' | 'ADMIN_APEX' | '';

export type SearchRole = 'ROLE_PLAYER' | 'ROLE_MANAGER' | '';

export interface User {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  countryCallingCode: string,
  frmglLicenseNumber: string,
  currentHandicap: string,
  status: string,
  gender: EUGender,
  avatarURL: string,
  bio: string,
  birthDate: string | null,
  role: Role,
  registerAt: string,
  clubId: string,
  clubName: string,
  isTotpEnabled: boolean,
}

export type updateUserDataRequest = {
  firstName: string,
  lastName: string,
  gender: EUGender,
  bio: string,
  phoneNumber: string,
  countryCallingCode: string,
  birthDate: string | null
}

export type updateUserPasswordRequest = {
  password: string,
  newPassword: string
}
