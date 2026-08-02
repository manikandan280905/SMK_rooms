# SMK Rooms – Digital Arrival & Departure Register

A production-ready hotel register management system.

## Structure

```
frontend/   — Next.js 15 + Shadcn UI
backend/    — Express.js + Prisma + PostgreSQL
shared/     — Shared TypeScript types
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase / Neon / Railway)
- Cloudinary account (for file uploads)

### Backend
```bash
cd backend
cp .env.example .env   # Fill in your credentials
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env.local   # Set API URL
npm install
npm run dev
```

## Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories.
