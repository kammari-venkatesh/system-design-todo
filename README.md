# System Design Study Plan — Frontend

React + Vite app for a 120-day system design study plan: dashboard (graph, calendar, tasks), roadmap, progress analytics, and knowledge notes with per-subtopic editing.

> Deploy **this repo on Render (Static Site)** or Vercel. The API runs on [system-design-todobackend](https://github.com/kammari-venkatesh/system-design-todobackend) — see [DEPLOY.md](./DEPLOY.md).

## Requirements

- Node.js 20+

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

**Local dev:** leave `VITE_API_URL` empty — Vite proxies `/api` and `/uploads`.

**Production:** `https://system-design-todobackend-1.onrender.com`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm start` | Serve `dist/` (Render Web Service only) |

## Deploy on Render (recommended)

See **[DEPLOY.md](./DEPLOY.md)** for full steps.

**Quick setup — Static Site:**

1. Render → **New** → **Static Site** → repo `system-design-todo`
2. Build: `npm ci && npm run build` · Publish: `dist`
3. Env: `VITE_API_URL=https://system-design-todobackend-1.onrender.com`
4. Rewrite: `/*` → `/index.html`

**Web Service** (if already created): Build `npm ci && npm run build` · Start `npm start`

## Deploy on Vercel (alternative)

1. Import [system-design-todo](https://github.com/kammari-venkatesh/system-design-todo) on Vercel
2. `VITE_API_URL` is already in `vercel.json`

## Production checklist

| Service | Variable | Value |
|---------|----------|-------|
| Frontend (Render) | `VITE_API_URL` | `https://system-design-todobackend-1.onrender.com` |
| Backend (Render) | `FRONTEND_URL` | Your frontend URL, e.g. `https://system-design-todo.onrender.com` |
| Backend | `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production` | Required |

Run `npm run seed` once on the backend after first deploy.

## Features

- **Dashboard** — progress graph, calendar, daily tasks, knowledge notes
- **Roadmap / Progress** — separate pages with study plan and analytics
- **Knowledge notes** — per-day summary + one note per study subtopic, auto-saved to MongoDB
