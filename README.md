# Bank X Suite

Full-stack homework delivery for the Bank Account Management System. The mono-repo includes a secure Node.js + Express + Prisma API and a Next.js + Tailwind CSS operations console.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, TanStack Query, Radix Toast, Zustand.
- **Backend:** Node.js 20, Express 4, Prisma ORM (PostgreSQL), Zod validation, Pino logging, rate limiting.
- **Shared:** Internal `@bank/types` package for API response/toast contracts.

## Project Structure

```
assignment/
├── backend/        # Express API + Prisma
├── frontend/       # Next.js app
├── packages/types/ # Reusable TypeScript contracts
├── package.json    # npm workspaces + root scripts
└── README.md
```

## Environment Setup

1. **Node.js:** Install v20.x via `nvm install 20 && nvm use 20`.
2. **Install deps:**
   ```bash
   npm install          # root dev dependencies
   npm install -w backend
   npm install -w frontend
   npm install -w packages/types
   ```
3. **Environment Setup:** Copy `backend/env.sample` to `backend/.env` and set:
   - `DATABASE_URL` – Postgres connection string.
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` – 32+ chars.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` – seed admin credentials.
   - `UI_ORIGIN` – e.g. `http://localhost:3000`.
4. **Database:**
   ```bash
   cd backend
   npx prisma migrate dev
   npm run seed
   ```

## Running Locally

In separate terminals (after `nvm use 20`):

```bash
# Backend API
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

The API listens on `http://localhost:4000`, the UI on `http://localhost:3000`. Configure `NEXT_PUBLIC_API_URL` inside `frontend/.env.local` to point at the API origin if it differs.

## User Guide

📖 **See [USAGE.md](./USAGE.md) for a comprehensive guide on how to use the application** as both a regular user and administrator, including step-by-step instructions for all features.

## Key Features

- **Authentication & RBAC:** User registration (pending by default), admin seeding, JWT-based guards, middleware-protected routes.
- **Account Management:** Admin CRUD, user self-service profile updates, Prisma schema with decimal balances, audit logging.
- **Transactions:** Admin-driven debit/credit with atomic DB transactions, insufficient-funds validation, yellow/green toasts per spec.
- **Dashboards:** User view for balances + histories; admin consoles for accounts, transactions, and logs. React Query keeps RPM low with caching.
- **Notifications & Logging:** Radix toasts (red/yellow/green) for UI actions plus `/api/logs/ui` endpoint to persist frontend logs alongside backend logs (type 1 = UI, type 2 = API).
- **Performance:** Express rate limiter capped at 250 RPM/server, Pino HTTP logging, structured Prisma access.

## Testing & Linting

```bash
npm run lint -w backend
npm run lint -w frontend
npm test -w backend   # placeholder (Vitest configured)
```

## Deployment Notes

- Recommend Vercel (frontend) and Render/Fly/Heroku (backend) with managed Postgres.
- Set `UI_ORIGIN` on the backend to the deployed frontend to keep CORS + credentialed requests aligned.
- Seed admin credentials during deployment via `npm run seed -w backend`.

