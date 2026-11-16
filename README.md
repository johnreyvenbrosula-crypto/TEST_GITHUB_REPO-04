# Neon Arena — Full-stack gaming hub

A deployable starter for a gaming community website:
- React + Vite frontend
- Node.js + Express REST API
- PostgreSQL + Prisma ORM
- Password hashing, JWT authentication, role-based admin access
- Game catalogue, game management, leaderboard, player profiles

## Requirements
- Node.js 20+
- PostgreSQL 15+

## 1. Configure the backend
```bash
cd server
cp .env.example .env
# Set DATABASE_URL and JWT_SECRET in .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```
The API runs at `http://localhost:4000`.

Seed admin:
- Email: `admin@neonarena.local`
- Password: `ChangeMe123!`

Change this password immediately and never use seed credentials in production.

## 2. Configure the frontend
In another terminal:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173`.

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (authenticated)
- `GET /api/games`
- `GET /api/games/:id`
- `POST /api/games` (admin)
- `PATCH /api/games/:id` (admin)
- `DELETE /api/games/:id` (admin)
- `POST /api/scores` (authenticated score submission)\n- `GET /api/leaderboard`
- `GET /api/players/:id`

## Production checklist
1. Set a long, unique `JWT_SECRET`; use HTTPS.
2. Set `CLIENT_ORIGIN` to your deployed frontend origin.
3. Change/remove the seeded admin account and disable public admin creation.
4. Use managed PostgreSQL, automated backups, and database migrations.
5. Add email verification, password reset, moderation, audit logs, and anti-cheat validation before accepting real users or competitive scores.
6. Deploy frontend and API separately, or configure a reverse proxy to route `/api` to the server.

This is a functional foundation, not a hosted live service. You must supply hosting and a PostgreSQL database.
