import axios from 'axios';
import i18n from '@/i18n/config';
import { getEnv } from '@/hooks/getEnv.ts'
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/features/auth/store';

const { dev } = getEnv();

// Base URL without the /api suffix (needed for Sanctum's csrf-cookie endpoint)
const serverBaseUrl = dev.server?.replace(/\/api\/?$/, '') ?? '';

export const api = axios.create({
    baseURL:  dev.server,
    withCredentials: true,  // sends the httpOnly cookies automatically
    withXSRFToken: true,    // always forward the XSRF-TOKEN cookie as X-XSRF-TOKEN
});

// ── CSRF bootstrapper ────────────────────────────────────────────────────────
// Sanctum statefulApi() requires the XSRF-TOKEN cookie to be set before any
// state-mutating request (POST, PUT, PATCH, DELETE). We fetch it once and
// cache the promise so parallel calls share the same round-trip.
let csrfPromise: Promise<void> | null = null;

async function ensureCsrf(): Promise<void> {
    if (csrfPromise) return csrfPromise;
    csrfPromise = axios
        .get(`${serverBaseUrl}/sanctum/csrf-cookie`, { withCredentials: true })
        .then(() => { /* cookie is now set */ })
        .catch(() => {
            // Reset so the next call retries
            csrfPromise = null;
        });
    return csrfPromise;
}

const CSRF_METHODS = new Set(['post', 'put', 'patch', 'delete']);

api.interceptors.request.use(async (config) => {
    config.headers.set('Accept-Language', i18n.language || 'fr');

    if (CSRF_METHODS.has((config.method ?? '').toLowerCase())) {
        await ensureCsrf();
    }
    return config;
});

// Endpoints where a 401 is an expected answer (guest probe, wrong credentials)
// rather than an expired session.
const GUEST_ALLOWED_ENDPOINTS = new Set(['/auth/me', '/login', '/register', '/mfa/verify']);

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const originalRequest = err.config;
        const status = err.response?.status;

        // Laravel sessions are renewed by the server on every request, so there is
        // no refresh-token round-trip. A 401 elsewhere means the session is gone.
        if (status === 401 && !GUEST_ALLOWED_ENDPOINTS.has(originalRequest?.url)) {
            // Never let a previous account's cached data survive an expired session.
            queryClient.clear();
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }

        return Promise.reject(err);
    }
)
