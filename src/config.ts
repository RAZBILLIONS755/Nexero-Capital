// Admin credentials for local/dev admin login. For production, set environment variables
// and rotate these defaults. Cloudflare Pages environment variables should be set
// as `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD`.
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@nexerocapital.gh';
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'NexAdmin@2025!';

// Web Push removed — no VAPID or push server configured
