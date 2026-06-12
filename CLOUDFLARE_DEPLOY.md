Cloudflare Pages deployment checklist

1. Push repository to GitHub

- Ensure your repo is on a branch (e.g. `main`).

2. Cloudflare Pages: create a new project

- Connect your GitHub repository to Cloudflare Pages.
- Branch: `main` (or your production branch).
- Build command: `npm install && npm run build`
- Build output directory: `dist`
- Node version: use the default or set to a modern LTS (18+).
- Do not use a custom deploy command such as `npx wrangler deploy`.

3. SPA routing

- A `_redirects` file is present at `public/_redirects` with the line:

  /*    /index.html    200

  This ensures client-side routing works for direct links.

4. Assets & manifest

- Favicons and `site.webmanifest` are in `public/` and referenced from `index.html`.

5. Environment & secrets

- This project supports setting admin credentials via environment variables. In Cloudflare Pages set the following Environment variables (Pages → Settings → Environment variables):

  - `VITE_ADMIN_EMAIL` — admin email (e.g. admin@nexerocapital.gh)
  - `VITE_ADMIN_PASSWORD` — admin password

- Rotate or remove the default dev credential in `src/config.ts` before sharing widely; do not commit production secrets to the repo.

6. Custom domain (optional)

- Register or transfer your domain to Cloudflare Registrar or use Namecheap and point nameservers to Cloudflare.
- In Cloudflare Pages, add a custom domain and follow the prompt to enable HTTPS.

7. Post-deploy checks

- Visit your site at the provided `.pages.dev` URL to verify routing and assets.
- Test a few SPA routes (e.g. `/dashboard/invest`, `/admin/support`) to ensure they load.

8. Troubleshooting

- If builds fail, run locally:

```bash
npm install
npm run build
```

- Inspect build logs in Cloudflare Pages UI for missing modules or environment variables.
