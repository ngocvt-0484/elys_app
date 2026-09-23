# ELYSIDERM / Eirlys' Website

Static, trilingual (vi/en/ko) marketing + product website for ELYSIDERM, built with Next.js
(static export).

## Environment note (Windows + WSL)

This project lives inside WSL. Always run Node/npm from inside WSL, on the native Linux path —
running the Windows Node.exe against the `\\wsl.localhost\...` UNC path fails to build (webpack
can't resolve Next's internal loaders over UNC paths):

```bash
wsl.exe -- bash -lc 'source ~/.nvm/nvm.sh && cd /home/<user>/Projects/elys_app && npm run dev'
```

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in NEXT_PUBLIC_LEAD_FORM_ENDPOINT
npm run dev
npm run test                 # unit tests (vitest)
```

## Build

```bash
npm run build   # outputs static files to out/
```

## Deploy to Cloudflare Pages

1. Push this repository to GitHub.
2. In the Cloudflare dashboard, create a Pages project connected to the GitHub repo.
3. Build settings:
   - Framework preset: `Next.js (Static HTML Export)`
   - Build command: `next build`
   - Build output directory: `out`
4. Environment variables (Production and Preview): `NEXT_PUBLIC_LEAD_FORM_ENDPOINT` set to the
   deployed Google Apps Script Web App URL.
5. Trigger a deploy — every push to the connected branch redeploys automatically.

## Internationalization

- 3 locales: `vi` (default), `en`, `ko`, all under `/vi`, `/en`, `/ko`.
- `/` is a client-side redirect based on browser language (no Middleware, since static export
  doesn't run it) — see `src/app/page.tsx`.
- UI copy lives in `src/i18n/dictionaries/{vi,en,ko}.json`. Product copy is localized inline in
  `src/data/products.json` (`{ vi, en, ko }` per field).
- EN/KO copy in this repo was AI-translated — have a native speaker review it (especially Korean)
  before launch.

## Lead form data

Every "Tư vấn & Đặt mua ngay" / "Add to Cart" submission posts directly from the browser to the
Google Apps Script Web App URL above, which appends a row to a Google Sheet. See
`src/lib/leadForm.ts` for the payload shape.
