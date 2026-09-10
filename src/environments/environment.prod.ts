export const environment = {
  production: true,
  /**
   * Same-origin `/api` on Vercel → rewritten to https://arin.somee.com
   * (avoids browser CORS; backend stays on Somee — Vercel cannot host ASP.NET).
   */
  apiBaseUrl: '',
};
