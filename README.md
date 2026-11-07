# TaskFlow API

![CI](https://github.com/sciamanamarcio/taskflow-api/actions/workflows/ci.yml/badge.svg)

A production-style REST API for task management, built with **Node.js, TypeScript, Express, PostgreSQL and Prisma**. It features JWT authentication, schema validation, ownership-based authorization, integration tests against a real database, Docker, and a CI pipeline.

> Frontend companion: **TaskFlow Dashboard** (React + TypeScript), coming soon.

## Features

- Email/password authentication with bcrypt-hashed passwords and JWT access tokens
- Task CRUD with pagination and status filtering
- Per-user data isolation (users can only access their own tasks)
- Request validation with Zod and a consistent error format
- Security middlewares: Helmet, CORS, rate limiting on auth routes
- Integration tests (Vitest + Supertest) running against PostgreSQL
- Multi-stage Docker build and GitHub Actions CI (lint, typecheck, test, build, docker build)
- Automated dependency updates with Dependabot

## Tech stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 22 |
| Language | TypeScript (strict) |
| Framework | Express 4 |
| Database | PostgreSQL 16 + Prisma ORM |
| Validation | Zod |
| Auth | JWT + bcryptjs |
| Testing | Vitest + Supertest |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Architecture

Feature-based modules, each split into `routes → controller → service`:

```
src/
├── config/        # validated environment variables
├── lib/           # prisma client, AppError, async handler
├── middlewares/   # authenticate, validate, error handler
└── modules/
    ├── auth/
    └── tasks/
```

- **Controllers** handle HTTP; **services** hold business logic and talk to the database.
- All errors flow through a single handler and return `{ "error": { "code", "message", "details" } }`.

## Getting started

### Option A: everything in Docker

```bash
docker compose up --build
# API on http://localhost:3333
```

### Option B: local development

```bash
cp .env.example .env
docker compose up -d db
npm install
npx prisma migrate dev
npm run dev
```

### Tests

```bash
docker compose up -d db
docker compose exec db createdb -U taskflow taskflow_test
npm run test:migrate
npm test
```

## API reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Log in, returns JWT |
| GET | `/auth/me` | Yes | Current user |
| GET | `/tasks?status=&page=&limit=` | Yes | List tasks (paginated) |
| POST | `/tasks` | Yes | Create task |
| GET | `/tasks/:id` | Yes | Get task |
| PATCH | `/tasks/:id` | Yes | Update task |
| DELETE | `/tasks/:id` | Yes | Delete task |

### Example

```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"password123"}'

curl -X POST http://localhost:3333/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship the portfolio","status":"IN_PROGRESS"}'
```

## Design decisions

- **Real database in tests** instead of mocks, so queries, constraints and migrations are actually exercised.
- **404 instead of 403** for other users' resources, to avoid leaking their existence.
- **Generic login error** to prevent user enumeration.
- **Env validation at startup**: the app fails fast on a bad configuration.

## Roadmap

- [ ] Refresh tokens
- [ ] OpenAPI/Swagger docs
- [ ] Deploy with Terraform on AWS

## License

MIT
