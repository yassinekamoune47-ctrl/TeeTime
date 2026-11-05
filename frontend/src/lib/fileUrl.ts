import { getEnv } from '@/hooks/getEnv';

/**
 * Backend file URLs are relative (e.g. /storage/tournaments/xxx.png). The browser
 * would resolve them against the frontend origin, so we prefix them with the
 * backend server URL (without the /api suffix). Absolute URLs (http/https, data:,
 * blob:) pass through.
 */
export function resolveFileUrl(url?: string | null): string {
  if (!url) return '';
  if (/^(https?:|data:|blob:|\/\/)/i.test(url)) return url;
  const serverBase = (getEnv().dev.server ?? '').replace(/\/api\/?$/, '');
  return `${serverBase}${url.startsWith('/') ? url : `/${url}`}`;
}
