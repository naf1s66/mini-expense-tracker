# Mini Expense Tracker

A full-stack expense tracker where users can add, edit, delete, categorize, filter, and summarize daily expenses. The app uses Next.js, Express, Prisma, PostgreSQL, and Docker Compose.

## Prerequisites

- Docker Desktop with Docker Compose.
- If running commands inside WSL, enable Docker Desktop WSL integration for this distro first. Otherwise run the Docker commands from PowerShell, Command Prompt, or a terminal where `docker` is available.

## Run The App

The reviewer path is Docker. This starts PostgreSQL, applies Prisma migrations, seeds categories, starts the backend, and serves the frontend.

```sh
docker-compose up
```

If your Docker install uses the newer Compose plugin, this also works:

```sh
docker compose up
```

Open:

- Frontend: http://localhost:3000
- Backend health check: http://localhost:4000/api/health

Stop the app with `Ctrl+C`, then run:

```sh
docker-compose down
```

To reset all database data:

```sh
docker-compose down -v
docker-compose up --build
```

## Environment

The root `.env.example` lists the Docker Compose variables for ports, PostgreSQL, CORS, and the frontend API URL. Docker Compose works with the checked-in defaults, so creating a local `.env` file is optional for review.

Do not commit `.env` or `.env.local` files.

## Local Development

Use this only if you want to run without Docker. You need Node.js, npm, and a local PostgreSQL database.

```sh
npm --prefix apps/backend install
npm --prefix apps/frontend install
```

Create `apps/backend/.env` from `apps/backend/.env.example` and set `DATABASE_URL` for your local PostgreSQL database. Create `apps/frontend/.env.local` from `apps/frontend/.env.example` only if the backend API is not running at `http://localhost:4000/api`.

Prepare the database:

```sh
npm run backend:prisma:generate
npm run backend:prisma:migrate
npm run backend:prisma:seed
```

Run the backend and frontend in separate terminals:

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

## Extra Feature

The extra feature is month/year filtering for both the expense list and summary. I chose it because expense tracking is usually reviewed by period, not as one long lifetime list. Applying the same filter to the summary and visible expenses keeps the totals aligned with what the user is currently reviewing. A reset control lets the user quickly return to the full expense history.
