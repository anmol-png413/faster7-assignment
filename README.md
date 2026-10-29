# Full Stack Developer Assignment

This repo contains both assignments:

| Assignment | Folder | Live link |
|---|---|---|
| **Backend** (Node.js CRM REST API) | repo root (`src/`) | https://faster7-assignment.vercel.app/ |
| **Frontend** (React, phone OTP login + restaurants list) | [react-task/](react-task) | https://react-task-gamma-seven.vercel.app/ |

The Node.js live link also serves a small demo page (`public/index.html`) to try the API in the browser. Both live pages have a tab to switch to the other app.

## Frontend (React)
Vite + React app that follows the Postman collection: register/send OTP -> login with OTP (JWT) -> fetch restaurants with the token. See [react-task/README.md](react-task/README.md) for details. Run it with:
```bash
cd react-task
npm install
npm run dev      # http://localhost:5173
```
Sample login: phone `9818979450`, OTP `123456`.

---

# Backend: CRM (Node.js + Express + JWT + Postgres/Supabase)

## Setup
1. Create a Supabase project, open **SQL Editor**, paste and run [schema.sql](schema.sql).
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (Supabase: Project Settings -> Database -> Connection string) and `JWT_SECRET`.
3. `npm install`
4. `npm start` (runs on http://localhost:3000)

## API

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | No | `name, email, password` |
| POST | `/api/auth/login` | No | `email, password` -> returns `token` |
| POST | `/api/enquiries` | **No** (public form) | `name, email, course_interest, phone?, message?` |
| GET | `/api/leads/unclaimed` | Bearer JWT | - |
| POST | `/api/leads/:id/claim` | Bearer JWT | - |
| GET | `/api/leads/mine` | Bearer JWT | - |

Send the token as `Authorization: Bearer <token>`.

Claiming is atomic (`update ... where claimed_by is null`): the first counselor wins, anyone else gets `409 Lead already claimed`. Once claimed, the lead disappears from `/api/leads/unclaimed` for everyone.

## Quick test (curl)
```bash
curl -X POST localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Anmol","email":"a@x.com","password":"secret123"}'
curl -X POST localhost:3000/api/enquiries -H "Content-Type: application/json" -d '{"name":"Ravi","email":"ravi@x.com","course_interest":"Data Science"}'
curl localhost:3000/api/leads/unclaimed -H "Authorization: Bearer <token>"
curl -X POST localhost:3000/api/leads/1/claim -H "Authorization: Bearer <token>"
curl localhost:3000/api/leads/mine -H "Authorization: Bearer <token>"
```
