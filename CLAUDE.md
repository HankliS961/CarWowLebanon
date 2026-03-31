# CarSouk — Lebanese Reverse Car Marketplace

## What This Is

A reverse car marketplace for Lebanon where dealers compete for buyers. Built with Next.js 14 App Router, Prisma/PostgreSQL, tRPC, NextAuth v5, Tailwind CSS, and shadcn/ui. Bilingual (Arabic RTL + English LTR).

## Quick Commands

```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npx prisma generate      # Regenerate Prisma client (STOP dev server first on Windows)
npx prisma db push       # Push schema changes to DB
npm run db:seed          # Seed database with test data
npx prisma studio        # Visual DB browser
```

## Architecture

```
src/
  app/[locale]/           # Next.js App Router (131 page files)
    admin/                # Admin panel (10 routes)
    dealer/               # Dealer portal (13 routes)
    dashboard/            # Buyer dashboard (6 routes)
    cars/                 # Public car search/detail
    dealers/              # Dealer directory
    get-offers/           # Reverse marketplace flow
    sell-my-car/          # Sell auction flow
    auth/                 # Login, register, forgot-password
    blog/, reviews/, guides/, tools/  # Content pages
  components/             # 63 React components
    ui/                   # shadcn/ui base (18 components)
    shared/               # Reusable cross-domain components
    cars/                 # CarCard, FilterSidebar, SaveCarButton, CompareButton
    layout/               # Header, Footer, MegaMenu, MobileNav
  server/
    routers/              # 18 tRPC routers, 137 procedures
    auth/                 # NextAuth v5 config + 3 providers
    trpc.ts               # Root tRPC setup (public/protected/admin/dealer procedures)
  lib/
    notifications/        # In-app, email (Resend), WhatsApp (Twilio)
    market-data/          # Silent price collection from transactions
    meilisearch.ts        # Search client with Prisma fallback
    r2.ts                 # Cloudflare R2 upload/delete
    seo/, tools/, valuation/  # Utilities
  i18n/messages/          # ar.json + en.json translations
  stores/                 # Zustand (app-store, sell-form-store)
prisma/
  schema.prisma           # 24 models, 25 enums
  seed.ts                 # Test data seeder
```

## Agent System (9 Agents)

Agents are in `.claude/agents/`. Layer-based agents own specific files with zero overlap. Cross-cutting agents operate across layers.

### Layer Agents (file ownership)

| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| **database-architect** | `prisma/`, `src/server/db/` | Any frontend or router files |
| **api-backend** | `src/server/routers/`, `src/lib/validations/`, `src/lib/notifications/`, `src/lib/market-data/`, `src/types/` | Prisma schema, auth config, frontend |
| **auth-middleware** | `src/server/auth/`, `src/app/api/`, `src/middleware.ts`, `src/env.ts`, `src/app/[locale]/auth/` | Routers, frontend pages |
| **ui-design-system** | `src/components/ui/`, `src/components/shared/`, `src/components/layout/`, `src/hooks/`, `src/stores/`, `tailwind.config.ts` | Page files, server code |
| **marketplace-frontend** | `src/app/[locale]/cars/`, `/dealers/`, `/get-offers/`, `/[make]/`, homepage, `src/components/cars/`, `src/components/dealers/` | Portals, backend |
| **portal-frontend** | `src/app/[locale]/dealer/`, `/admin/`, `/dashboard/`, `/sell-my-car/`, `src/components/dealer/`, `src/components/admin/` | Marketplace pages, backend |
| **content-seo** | `src/app/[locale]/blog/`, `/reviews/`, `/guides/`, `/tools/`, `/about/`, `/legal/`, `src/i18n/`, `src/lib/seo/`, `src/components/seo/` | Other pages, backend |

### Cross-Cutting Agents (domain expertise, read everything)

| Agent | Purpose | Key Files |
|-------|---------|-----------|
| **quality-guard** | Catches TS errors, Prisma type mismatches (Decimal fields), dead references, runtime bugs. Run proactively after changes. | Reads all `src/`, `prisma/` |
| **subscription-payments** | Tier management, feature gating, Stripe integration, upgrade flows, billing. Owns the commercial layer. | `src/lib/constants.ts`, `src/app/[locale]/dealer/subscription/`, enforcement in routers |

## Key Conventions

### tRPC
- 4 procedure types: `publicProcedure`, `protectedProcedure`, `adminProcedure`, `dealerProcedure`
- All errors use `TRPCError` from `@trpc/server` (NOT generic `throw new Error`)
- All inputs validated with Zod
- Routers aggregated in `src/server/routers/_app.ts`
- Client: `import { trpc } from "@/lib/trpc/client"`

### Database
- PostgreSQL on Neon (connection string in DATABASE_URL)
- Prisma client singleton in `src/server/db/client.ts`
- `npx prisma generate` requires dev server stopped (Windows DLL lock)
- Use `prisma db push --skip-generate` when dev server is running, then generate after

### Auth
- NextAuth v5 with JWT strategy
- 3 providers: Credentials (email OR phone + password), Google OAuth, Phone OTP (WhatsApp via Twilio)
- Registration requires WhatsApp OTP phone verification (3-step flow)
- Session contains: `id`, `role` (BUYER/SELLER/DEALER/ADMIN), `languagePref`
- Login accepts email or phone number in the same field
- Password reset via WhatsApp OTP

### Images
- Uploaded to Cloudflare R2 via `POST /api/upload` (auth required)
- Only URLs stored in DB, never base64
- `src/lib/r2.ts` handles upload + delete
- Dev fallback: returns data URL when R2 credentials are missing
- `deleteFromR2(url)` cleans up R2 when images are removed

### Search
- Meilisearch for full-text search with faceted filtering
- `src/lib/meilisearch.ts` — client with graceful Prisma fallback
- Cars auto-indexed on create/update/delete (fire-and-forget)
- `cars.search` tries Meilisearch first, catches errors, falls back to Prisma
- If MEILISEARCH_HOST is set but Meilisearch isn't running, falls back silently

### Notifications
- In-app: `Notification` model, bell dropdown in header
- Email: Resend SDK (`src/lib/notifications/email.ts`)
- WhatsApp: Twilio API (`src/lib/notifications/whatsapp.ts`)
- All notification triggers are fire-and-forget (`.catch(console.error)`)
- Clickable: `src/lib/notifications/href.ts` maps type → route (role-aware)

### i18n
- Arabic (ar) = primary, English (en) = secondary
- next-intl with `[locale]` prefix on all routes
- Translations in `src/i18n/messages/{ar,en}.json`
- RTL: use `text-start`/`text-end`, `ms-`/`me-`, `start-`/`end-` (not left/right)

### Frontend Patterns
- Server components by default, `"use client"` only when hooks/interactivity needed
- `window.location.href` for post-auth redirects (not router.push — ensures session pickup)
- Cache invalidation: `const utils = trpc.useUtils()` → `utils.routerName.invalidate()`
- Toast: `import { toast } from "sonner"` → `toast.success()` / `toast.error()`
- Loading states: `disabled={mutation.isPending}` on buttons
- Session: `useSession()` from `next-auth/react` in client components

## Test Accounts (from seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@carsouk.com | Admin123! |
| Dealer 1 | beirut.motors@example.com | Dealer123! |
| Dealer 2 | mount.lebanon.auto@example.com | Dealer123! |
| Buyer 1 | sara@example.com | Buyer123! |
| Buyer 2 | mike@example.com | Buyer123! |

## Features by Status

### Fully Working
- User registration (WhatsApp OTP) + login (email/phone + password) + password reset
- Car search with filters, sorting, pagination (Meilisearch with Prisma fallback)
- Car detail pages with image gallery, specs, contact sidebar
- Save cars (heart button, persisted in DB)
- Compare cars (up to 3, persisted in DB, replace flow when full)
- Dealer registration + admin approval/reject/suspend
- Dealer portal: listings CRUD, inquiry inbox with respond, buyer requests, auctions with bidding
- Admin panel: users, dealers, listings moderation (warn/remove/approve), content publish, featured, settings, logs, analytics
- Sell My Car: 5-step form with DB-persisted drafts, goes live immediately
- Get Offers: configure car → dealers submit competing offers → comparison dashboard
- Notifications: in-app + email + WhatsApp, clickable with role-aware routing
- Blog + reviews + guides + tools (import/loan/fuel calculators, car comparison)
- Site images admin (make logos, body type images, general banners → R2)
- Market data silently collecting real prices from transactions

### Intentionally Disabled
- Car valuation estimates (unreliable data — see `Documentations/VALUATION_ROADMAP.md`)
- Tools/Valuation page shows "Coming Soon"

### Not Yet Built
- Stripe payment (subscription upgrades, featured listing fees)
- Team management (no Team model — shows "Coming Soon")
- Analytics charts (KPIs work, chart visualizations need a charting library)
- CI/CD pipeline (GitHub Actions → Vercel)
- GA4/Mixpanel analytics tracking
- PWA enhancements
- Native mobile app

## Environment Variables

Critical ones in `.env.local`:
```
DATABASE_URL              # Neon PostgreSQL
NEXTAUTH_URL              # http://localhost:3000
NEXTAUTH_SECRET           # JWT secret
TWILIO_ACCOUNT_SID        # WhatsApp OTP
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER       # Must be WhatsApp-enabled
CLOUDFLARE_R2_ACCESS_KEY  # Image storage
CLOUDFLARE_R2_SECRET_KEY
CLOUDFLARE_R2_BUCKET
CLOUDFLARE_R2_ACCOUNT_ID
CLOUDFLARE_R2_ENDPOINT
CLOUDFLARE_R2_PUBLIC_URL  # https://pub-xxx.r2.dev
RESEND_API_KEY            # Email notifications
MEILISEARCH_HOST          # Optional — falls back to Prisma
MEILISEARCH_API_KEY
```

## Important Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Source of truth for all data models |
| `src/server/trpc.ts` | tRPC context, middleware, procedure types |
| `src/server/routers/_app.ts` | Router registry |
| `src/middleware.ts` | Route protection + locale detection |
| `src/server/auth/config.ts` | NextAuth config with all providers |
| `src/lib/r2.ts` | R2 upload + delete |
| `src/lib/meilisearch.ts` | Search client |
| `src/lib/notifications/href.ts` | Notification type → route mapping |
| `src/lib/market-data/log-price.ts` | Silent price data collection |
| `Documentations/MASTER_PLAN.md` | Full product specification |
| `Documentations/VALUATION_ROADMAP.md` | Valuation Phases B & C plan |

## TypeScript Notes
- Strict mode enabled
- Path alias: `@/*` → `./src/*`
- Prisma `Decimal` fields: use `Number(field)` for comparisons
- ListingStatus enum includes: DRAFT, ACTIVE, WARNED, SOLD, EXPIRED
- SellListingStatus includes: DRAFT, PENDING_REVIEW, LIVE, SOLD, EXPIRED, CANCELLED
- When Prisma schema changes: always `prisma db push` then `prisma generate` (stop dev server first on Windows)
