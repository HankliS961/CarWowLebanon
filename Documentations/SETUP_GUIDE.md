# CarSouk — Developer Setup Guide

How to set up, run, and continue development on the CarSouk platform.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Node.js** | v18+ (v22 recommended) | https://nodejs.org |
| **npm** | v9+ (comes with Node) | Included with Node |
| **Git** | Latest | https://git-scm.com |
| **Docker Desktop** | Latest (optional, for local Postgres) | https://docker.com |

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd CarWowLebanon
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script.

---

## 2. Database Setup

### Option A: Neon (Recommended — Cloud, Free Tier)

The fastest way. No Docker or local Postgres needed.

1. Sign up at **neon.tech** (free, no credit card)
2. Create a project named `carsouk`
3. Copy the connection string from the dashboard
4. It looks like: `postgresql://neondb_owner:xxx@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

### Option B: Docker (Local Postgres)

> Note: Prisma's native engine has known authentication issues with Docker Desktop on Windows. Neon is the safer bet on Windows. On macOS/Linux, Docker works fine.

```bash
docker run --name carsouk-db \
  -e POSTGRES_PASSWORD=carsouk123 \
  -e POSTGRES_DB=carsouk \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Connection string: `postgresql://postgres:carsouk123@localhost:5432/carsouk`

### Option C: Local Postgres Install

Install PostgreSQL natively, create a database named `carsouk`, and use your local credentials.

---

## 3. Environment Variables

Create **two** env files in the project root (both are needed):

### `.env` (read by Prisma CLI)

```env
DATABASE_URL="<your-connection-string>"
```

### `.env.local` (read by Next.js at runtime)

```env
# Database
DATABASE_URL="<your-connection-string>"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-string-here"

# Google OAuth (optional for dev)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Twilio — Phone OTP (optional for dev)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Resend — Email notifications (optional for dev)
RESEND_API_KEY=""

# Sentry — Error monitoring (optional for dev)
SENTRY_DSN=""

# Google Maps (optional for dev)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=""

# Meilisearch — Search engine (optional for dev)
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY=""

# Cloudflare R2 — Image storage (optional for dev)
CLOUDFLARE_R2_ACCESS_KEY=""
CLOUDFLARE_R2_SECRET_KEY=""
CLOUDFLARE_R2_BUCKET=""

# Stripe — Payments (optional for dev)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

> A `.env.example` file with all variables is included in the repo for reference.

To generate a `NEXTAUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Run Database Migration & Seed

```bash
# Create all database tables
npx prisma migrate dev --name init

# Seed with initial data (30 makes, 93 models, sample listings, admin user)
npx prisma db seed
```

### Seeded Data

| Data | Count | Notes |
|---|---|---|
| Car Makes | 30 | Toyota, Kia, Hyundai, BMW, etc. with Arabic names |
| Car Models | 93 | 3-5 models per make with Arabic names |
| Admin User | 1 | `admin@carsouk.com` / `Admin123!` |
| Sample Dealers | 2 | With full profiles |
| Sample Listings | 5 | Various makes/conditions |
| Blog Posts | 2 | Sample content |
| Car Review | 1 | Sample editorial review |

---

## 5. Start Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

The app defaults to Arabic (`/ar/`). Switch to English at `/en/`.

---

## 6. Useful Commands

| Command | What It Does |
|---|---|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build (type-checks everything) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Create + apply a new migration |
| `npm run db:push` | Push schema to DB without creating migration file |
| `npm run db:seed` | Run the seed script |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npx prisma studio` | Browse your database visually in the browser |

---

## 7. Project Structure

```
CarWowLebanon/
├── Documentations/              ← Planning docs, master plan, UX study
├── prisma/
│   ├── schema.prisma            ← Database schema (20 models, 24 enums)
│   ├── seed.ts                  ← Seed script
│   └── migrations/              ← SQL migration files
├── src/
│   ├── app/
│   │   ├── [locale]/            ← All pages (79 routes)
│   │   │   ├── page.tsx         ← Homepage
│   │   │   ├── cars/            ← Search, listings, detail
│   │   │   ├── [make]/          ← Brand hub, model review hub
│   │   │   ├── dealers/         ← Dealer directory, profiles
│   │   │   ├── sell-my-car/     ← Sell flow
│   │   │   ├── get-offers/      ← Reverse marketplace
│   │   │   ├── blog/            ← Blog system
│   │   │   ├── reviews/         ← Editorial reviews
│   │   │   ├── tools/           ← Calculators & tools
│   │   │   ├── guides/          ← Evergreen guides
│   │   │   ├── dashboard/       ← Buyer dashboard (auth)
│   │   │   ├── dealer/          ← Dealer portal (auth)
│   │   │   ├── admin/           ← Admin panel (auth)
│   │   │   └── auth/            ← Login, register
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  ← NextAuth API
│   │   │   └── trpc/[trpc]/        ← tRPC API
│   │   ├── sitemap.ts           ← Dynamic XML sitemap
│   │   └── robots.ts            ← robots.txt
│   ├── components/
│   │   ├── ui/                  ← shadcn/ui base components
│   │   ├── layout/              ← Header, Footer, MobileNav, MegaMenu
│   │   ├── cars/                ← CarCard, FilterSidebar, FilterSheet
│   │   ├── dealers/             ← DealerCard
│   │   ├── shared/              ← PriceDisplay, WhatsAppButton, TrustBar, etc.
│   │   ├── forms/               ← StepWizard, PhotoUploader
│   │   ├── blog/                ← BlogPostCard, TableOfContents, SocialShare
│   │   ├── reviews/             ← ReviewLayout
│   │   ├── tools/               ← Calculator form components
│   │   ├── seo/                 ← JsonLd component
│   │   ├── dealer/              ← Dealer portal sidebar/topbar
│   │   └── admin/               ← Admin sidebar
│   ├── server/
│   │   ├── auth/                ← NextAuth config + providers
│   │   ├── routers/             ← 17 tRPC routers
│   │   └── trpc.ts              ← tRPC init, middleware, procedures
│   ├── lib/
│   │   ├── prisma.ts            ← Prisma client singleton
│   │   ├── trpc/                ← tRPC client, server caller, provider
│   │   ├── seo/                 ← Metadata + JSON-LD generators
│   │   ├── tools/               ← Calculator logic
│   │   ├── notifications/       ← Email, WhatsApp, in-app notifications
│   │   ├── alerts/              ← Search alert matcher
│   │   ├── valuation/           ← Car valuation estimator
│   │   ├── validations/         ← Zod schemas
│   │   ├── constants.ts         ← Enums, labels, config
│   │   ├── utils.ts             ← Utility functions
│   │   └── fonts.ts             ← Google Fonts setup
│   ├── i18n/
│   │   ├── messages/
│   │   │   ├── ar.json          ← Arabic translations (~750 keys)
│   │   │   └── en.json          ← English translations (~750 keys)
│   │   ├── config.ts            ← Locale config
│   │   ├── routing.ts           ← next-intl routing + navigation exports
│   │   └── request.ts           ← Server request config
│   ├── store/                   ← Zustand stores
│   ├── hooks/                   ← Custom React hooks
│   ├── types/                   ← TypeScript types
│   └── middleware.ts            ← i18n + auth middleware
├── .claude/
│   └── agents/                  ← 6 specialized Claude Code agents
├── .env                         ← Prisma reads this
├── .env.local                   ← Next.js reads this
├── .env.example                 ← Template with all variables
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 8. Route Architecture (Important)

The app uses `[locale]` prefix routing (`/ar/...`, `/en/...`).

### Route conflict rules (Next.js App Router)

Two dynamic folders (`[paramA]` and `[paramB]`) **cannot** be siblings in the same directory. To avoid conflicts, some routes use a static prefix:

| Route | Path | Why |
|---|---|---|
| Blog post | `/blog/[slug]/` | Dynamic slug |
| Blog category | `/blog/category/[category]/` | Nested under `category/` to avoid conflict with `[slug]` |
| Dealer profile | `/dealers/[slug]/` | Dynamic slug |
| Dealers by region | `/dealers/region/[region]/` | Nested under `region/` to avoid conflict with `[slug]` |
| Cars by region | `/cars/region/[region]/` | Nested under `region/` to avoid conflict with `[make]` |
| Review roundup | `/reviews/[slug]/` | e.g., `/reviews/best-suv/` |
| Review comparison | `/reviews/comparison/[slug]/` | Under static `comparison/` prefix |

**When adding new routes:** always check existing siblings for dynamic segments first.

---

## 9. Authentication

### Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@carsouk.com` | `Admin123!` |

### Auth Providers Configured

| Provider | Status | Notes |
|---|---|---|
| Email/Password | Working | bcrypt hashing |
| Google OAuth | Needs config | Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |
| Phone OTP | Needs config | Set Twilio credentials |

### Protected Routes

| Route Pattern | Required Role |
|---|---|
| `/dashboard/*` | Any authenticated user |
| `/dealer/*` | DEALER role |
| `/admin/*` | ADMIN role |

---

## 10. Working with Agents (Claude Code)

The project has 6 specialized agents in `.claude/agents/`:

| Agent | Scope |
|---|---|
| `nextjs-project-scaffolder` | Project config, Prisma schema, auth, i18n, tRPC infrastructure |
| `component-library-builder` | `src/components/`, design system, Tailwind config, globals.css |
| `marketplace-frontend-builder` | Homepage, search, car detail, dealers, get-offers pages |
| `dealer-admin-portal-builder` | `/dealer/*` and `/admin/*` pages |
| `seller-auction-notifications-builder` | Sell flow, buyer dashboard, notifications |
| `content-seo-architect` | Blog, reviews, guides, tools, SEO infrastructure |

Each agent has **scope boundaries** — it knows which files it owns and which it must not touch. This prevents conflicts when multiple agents work in parallel.

---

## 11. Common Development Tasks

### Add a new page
1. Create `src/app/[locale]/your-route/page.tsx`
2. Add translations to `src/i18n/messages/ar.json` and `en.json`
3. Add SEO metadata via `generateMetadata()` export

### Add a new tRPC endpoint
1. Open the relevant router in `src/server/routers/`
2. Add your procedure (use `publicProcedure` or `protectedProcedure`)
3. Call it from the client with `trpc.routerName.procedureName.useQuery()` or `.useMutation()`

### Add a new Prisma model
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe-your-change`
3. The Prisma client regenerates automatically

### Add a shadcn/ui component
```bash
npx shadcn@latest add <component-name>
```
Example: `npx shadcn@latest add accordion`

### Add translation keys
Edit both files:
- `src/i18n/messages/en.json`
- `src/i18n/messages/ar.json`

Use in components:
```tsx
const t = useTranslations("namespace");
return <p>{t("key")}</p>;
```

### View the database visually
```bash
npx prisma studio
```
Opens at http://localhost:5555

---

## 12. Tech Stack Quick Reference

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, RSC) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Neon cloud) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| API | tRPC (17 routers) |
| i18n | next-intl (Arabic + English) |
| Client State | Zustand |
| Server State | TanStack Query (via tRPC) |
| Email | Resend |
| Icons | Lucide React |
| Fonts | IBM Plex Sans Arabic, Noto Sans, DM Sans |

---

## 13. Troubleshooting

### "Authentication failed against database server"
- Check your `DATABASE_URL` in both `.env` AND `.env.local`
- If using Docker on Windows, use Neon instead (known Prisma + Docker Desktop issue)
- Make sure the password has no special characters that need URL encoding

### "Module not found" after pulling changes
```bash
npm install
npx prisma generate
```

### Prisma schema out of sync
```bash
npx prisma migrate dev
```

### Translation key not found
- Make sure the key exists in **both** `ar.json` and `en.json`
- Check the namespace matches your `useTranslations("namespace")` call

### Build fails with type errors
```bash
npm run build
```
Fix all TypeScript errors shown. Common patterns:
- Use `Array.from(new Set(...))` not `[...new Set(...)]`
- Use `as Prisma.InputJsonValue` for dynamic objects in JSON fields
- Access `.items` or `.posts` etc. on paginated tRPC responses, not the top-level object
