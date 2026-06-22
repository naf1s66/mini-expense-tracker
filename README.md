# Mini Expense Tracker

Mini Expense Tracker is a small full-stack app for recording daily expenses, reviewing saved entries, and seeing spending totals by category. It uses a Next.js frontend, an Express API, Prisma, and PostgreSQL.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, shadcn/ui-style components
- Backend: Node.js, Express, Zod
- Database: PostgreSQL
- ORM: Prisma
- Containerization: Docker Compose

## Features

- Add, edit, delete, and list expenses.
- Store expense amounts as database decimals.
- Validate amount, category, note, and expense date on the backend.
- Seed fixed categories for consistent summaries.
- Show total spend and category breakdown.
- Filter the expense list and summary by month and year.
- Soft delete expenses so normal reads and summaries exclude deleted rows.

## Extra Feature

The extra feature is month/year filtering for the expense list and summary. It helps users focus on a specific spending period instead of scanning every saved expense manually. The summary and visible list use the same date filter, so the totals stay aligned with what the user is reviewing. The reset control gives users a quick path back to their full expense history.

## Run With Docker

Docker is the primary reviewer path. It starts PostgreSQL, applies Prisma migrations, seeds the fixed categories, starts the backend API, and serves the frontend.

```sh
docker-compose up
```

If your Docker installation uses the newer Compose plugin, this equivalent command also works:

```sh
docker compose up
```

Open these URLs after startup:

- Frontend: http://localhost:3000
- Backend health check: http://localhost:4000/api/health
- Categories API: http://localhost:4000/api/categories

Stop the containers with `Ctrl+C`, then run:

```sh
docker-compose down
```

App data persists in the named Docker volume `mini-expense-tracker_postgres_data`. To reset the database and rerun migrations/seeding from an empty volume:

```sh
docker-compose down -v
docker-compose up --build
```

## Environment

The committed `.env.example` files document the expected variables. Docker Compose works with the checked-in defaults, so copying an env file is optional for review.

- Root `.env.example` contains Docker Compose ports, PostgreSQL defaults, CORS origin, and the browser API URL.
- `apps/backend/.env.example` is for local non-Docker backend development.
- `apps/frontend/.env.example` is for local non-Docker frontend development.

Do not commit local `.env` or `.env.local` files.

## Local Development

Use local development only if you do not want Docker. You need Node.js, npm, and a local PostgreSQL database.

```sh
npm --prefix apps/backend install
npm --prefix apps/frontend install
```

Create `apps/backend/.env` from `apps/backend/.env.example` and point `DATABASE_URL` at your local PostgreSQL database. Create `apps/frontend/.env.local` from `apps/frontend/.env.example` if your backend URL differs from the default.

Prepare the database:

```sh
npm run backend:prisma:generate
npm run backend:prisma:migrate
npm run backend:prisma:seed
```

Run the apps in separate terminals:

```sh
npm run backend:dev
npm run frontend:dev
```

Useful checks:

```sh
npm run backend:typecheck
npm run backend:build
npm run frontend:lint
npm run frontend:build
```

## API Overview

All API routes are served from the backend at `/api`.

```text
GET    /api/health
GET    /api/categories
GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/summary
GET    /api/expenses/:id
PUT    /api/expenses/:id
DELETE /api/expenses/:id
```

Expense list and summary endpoints support optional date filters:

```text
GET /api/expenses?from=2026-06-01&to=2026-06-30
GET /api/expenses/summary?from=2026-06-01&to=2026-06-30
```

Create and update payloads use string amounts:

```json
{
  "amount": "12.50",
  "categoryId": "category-id",
  "note": "Lunch",
  "expenseDate": "2026-06-21"
}
```

## Categories And Persistence

Categories are seeded automatically during Docker backend startup and through `npm run backend:prisma:seed` for local development. The seed is idempotent: it inserts missing fixed categories, updates seeded category labels/order by slug, and avoids duplicates. Category management is intentionally not included in the UI; users choose from the fixed categories and can use `Other` when needed.

PostgreSQL data persists across container restarts through the Docker volume. Creating an expense, stopping containers, and starting them again should keep the saved list and summary intact. Use `docker-compose down -v` only when you intentionally want to reset all database data.
