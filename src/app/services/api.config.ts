import { environment } from '../../environments/environment';

/** Base URL without trailing slash. Empty string = relative (dev proxy). */
export const API_BASE = (environment.apiBaseUrl || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

/** Wipe legacy mock / localStorage catalog keys used before API integration. */
export function clearLegacyLocalStorage(): void {
  const keys = [
    'arin_admin_products',
    'arin_admin_submissions',
    'arin_admin_categories',
  ];
  for (const key of keys) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
