# Arise and Build for Christ Ministries — Website

Official website for **Arise and Build for Christ Ministries International (ABCMI)**, built with Next.js 15, Supabase, and Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + verification) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Language | TypeScript |
| Deployment | Vercel |

---

## Features

### Public Pages
- **Home** — Hero, ministries preview, testimony, verse of the day, announcements
- **About** — Church history, vision, mission, leadership (dynamic from DB)
- **Ministries** — All active ministries with icons and descriptions
- **Events** — Upcoming church events
- **Feedback** — Submit testimonies and general feedback

### Member Portal (`/member`)
- Protected dashboard (requires verified email)
- Prayer request submission and management
- Personal settings (name, phone, address)
- Account security

### Admin Portal (`/admin`)
- Content management — edit hero, about, contact sections
- Announcement management
- Testimony approval
- Counseling request review
- Site settings

### Auth Flow
- Register with email → verification email sent
- Click verification link → email confirmed → access granted
- Forgot password → reset email → `/reset-password`
- Unverified users blocked by middleware

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/joelgabatin/abcmi-website.git
cd abcmi-website
npm install
```

### 2. Set up environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up the database

Run the migration scripts in order against your Supabase project:

```bash
# Via Supabase dashboard → SQL editor, or using the Supabase CLI:
supabase db push

# Or run manually in this order:
scripts/001_create_schema.sql     # All tables
scripts/002_create_policies.sql   # Row Level Security policies
scripts/003_profile_trigger.sql   # Auto-create profile on signup
scripts/004_seed_data.sql         # Site settings, ministries, events, verses
scripts/006_insert_sample_data.sql # Sample testimonies, prayer requests
```

### 4. Configure Supabase Auth redirect URLs

In your Supabase project → **Authentication → URL Configuration**, add:

```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Extended user data (name, role, phone, address) |
| `site_settings` | JSONB key-value store for editable page content |
| `ministries` | Ministry cards shown on home and ministries page |
| `events` | Upcoming church events |
| `announcements` | Church announcements shown on home page |
| `testimonies` | Member testimonies (approval workflow) |
| `daily_verses` | Verse of the day by date |
| `prayer_requests` | Member prayer requests |
| `feedback` | General feedback submissions |
| `counseling_requests` | Pastoral counseling request forms |

### User Roles

| Role | Access |
|------|--------|
| `member` | `/member/*` — personal dashboard |
| `admin` | `/admin/*` — full content management |

---

## Default Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@abcmi.com` |
| Password | `Admin@ABCMI2026` |

> **Change this password** after first login.

---

## Project Structure

```
abcmi-website/
├── app/
│   ├── (public pages)
│   │   ├── about/
│   │   ├── ministries/
│   │   ├── events/
│   │   └── feedback/
│   ├── auth/
│   │   ├── callback/        # Supabase auth code exchange
│   │   └── error/           # Expired link page
│   ├── login/
│   ├── register/
│   ├── verify-email/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── member/              # Protected member portal
│   └── admin/               # Protected admin portal
├── components/
│   ├── home/                # Homepage sections
│   ├── layout/              # Header, footer, site layout
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth-context.tsx     # Auth state and actions
│   └── supabase/            # Supabase client (server + client)
├── middleware.ts             # Route protection + role checks
└── scripts/                 # SQL migration scripts
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

---

## Deployment

The project is configured for [Vercel](https://vercel.com) deployment:

1. Push to `main` branch
2. Add environment variables in Vercel project settings
3. Add your production domain to Supabase Auth redirect URLs

---

## License

Private — All rights reserved. Arise and Build for Christ Ministries International.
