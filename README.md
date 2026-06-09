# System Design Study Plan — Frontend

React + Vite dashboard for tracking a 120-day system design study plan: progress graph, calendar, roadmap, analytics, and Apple Notes-style knowledge notes with TipTap.

## Requirements

- Node.js 18+

## Setup

```bash
npm ci
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`. In development, API requests are proxied to `http://localhost:5000`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Production | Backend URL without trailing slash |

**Local dev:** leave `VITE_API_URL` empty — the Vite dev server proxies `/api` and `/uploads`.

**Production:** set to your deployed backend, e.g. `https://system-design-todobackend.onrender.com`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

## Deploy (Vercel)

1. Import this repo in [Vercel](https://vercel.com).
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` = your backend URL (e.g. `https://system-design-todobackend.onrender.com`)
6. Deploy

`vercel.json` is included for SPA client-side routing.

## Deploy (Netlify)

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set `VITE_API_URL` in Netlify environment variables
4. `netlify.toml` handles SPA redirects

## Backend

Pair with the [system-design-todobackend](https://github.com/kammari-venkatesh/system-design-todobackend) API. After deploying both, set:

- Backend `FRONTEND_URL` → your frontend URL
- Backend `PUBLIC_URL` → your backend URL
- Frontend `VITE_API_URL` → your backend URL
