import type {ApiResponse, AuthUserDTO, LoginDTO, SignUpDTO} from '@/features/auth/types';
import { api } from "../apiConfig";
import type {mfaRequest} from "@/api/types.ts";

export const authApi = {
    login: (data: LoginDTO) =>
        api.post<ApiResponse<AuthUserDTO>>('/login', data),

    signup: (data: SignUpDTO) =>
        api.post<ApiResponse<AuthUserDTO>>('/auth/sign-up', data),

    me: () =>
        api.get<ApiResponse<AuthUserDTO>>('/auth/me'),

    logout: () =>
        api.post('/auth/logout'),

    activateMfa: () =>
        api.post<ApiResponse<string>>('/mfa/activate'),

    mfaVerification: (code: mfaRequest) => {
        return api.post<ApiResponse<AuthUserDTO>>('/mfa/verify', code);
    },
};