# Swaraj Gram Soft

Production-ready Next.js fullstack starter for Gram Panchayat tax tracking.

## Tech

- Next.js (App Router) + TypeScript
- Ant Design (SSR via `@ant-design/nextjs-registry`)
- MongoDB (Mongoose)
- Zod validation
- JWT auth in httpOnly cookie
- RBAC: `SUPER_ADMIN`, `ADMIN`, `USER`
- Village-level access scoping

## Setup

1) Install deps

```bash
npm install
```

2) Configure env

```bash
cp .env.example .env.local
```

Set:

- `MONGODB_URI`
- `JWT_SECRET` (min 16 chars)

3) Seed database

```bash
npm run seed
```

Creates:

- SUPER_ADMIN: `admin` / `admin123`
- One sample village

4) Run

```bash
npm run dev
```

Open:

- `http://localhost:3000/login`

## Pages

- `/login`
- `/superadmin/dashboard`
- `/village/[villageId]/dashboard`

## APIs

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- CRUD `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/[id]`
- CRUD `GET/POST /api/villages`, `GET/PATCH/DELETE /api/villages/[id]`
- `GET /api/dashboard/superadmin/stats`
- `GET /api/village/[villageId]/stats`
