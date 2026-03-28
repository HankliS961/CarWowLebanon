# MASTER PLAN A-Z: Lebanese Car Marketplace Platform
## Complete Blueprint — Brand, Design, Frontend, Backend, Content, SEO, Launch & Scale

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Brand Identity & Design System](#2-brand-identity--design-system)
3. [Information Architecture & Sitemap](#3-information-architecture--sitemap)
4. [Database Schema](#4-database-schema)
5. [Tech Stack](#5-tech-stack)
6. [Frontend — Pages & Components](#6-frontend--pages--components)
7. [Backend — API & Services](#7-backend--api--services)
8. [User Flows](#8-user-flows)
9. [Reverse Marketplace Engine](#9-reverse-marketplace-engine)
10. [Sell My Car — Auction System](#10-sell-my-car--auction-system)
11. [Dealer Portal](#11-dealer-portal)
12. [Admin Panel](#12-admin-panel)
13. [Search & Discovery](#13-search--discovery)
14. [Content Engine — Reviews, Blog, Guides](#14-content-engine--reviews-blog-guides)
15. [Interactive Tools](#15-interactive-tools)
16. [SEO Strategy](#16-seo-strategy)
17. [Internationalization (i18n) & RTL](#17-internationalization-i18n--rtl)
18. [Notifications & Messaging](#18-notifications--messaging)
19. [Monetization & Revenue Model](#19-monetization--revenue-model)
20. [Performance, Security & Infrastructure](#20-performance-security--infrastructure)
21. [Mobile Strategy (PWA & Native)](#21-mobile-strategy-pwa--native)
22. [AI & Advanced Features](#22-ai--advanced-features)
23. [Launch Strategy](#23-launch-strategy)
24. [KPIs & Success Metrics](#24-kpis--success-metrics)
25. [Development Phases & Timeline](#25-development-phases--timeline)

---

# 1. EXECUTIVE SUMMARY

## What We're Building

A **reverse car marketplace** for Lebanon where **dealers compete for buyers** instead of buyers haggling with dealers. The platform combines a transactional marketplace with an SEO-powered content engine (reviews, guides, tools) to capture organic traffic and convert it into dealer leads.

## Core Value Proposition

- **For Buyers:** Specify the car you want, receive competing offers from dealers. Price transparency, dealer ratings, no haggling.
- **For Sellers:** List your car, dealers bid to buy it. Get the best price without visiting multiple dealerships.
- **For Dealers:** Qualified leads delivered to your dashboard. Analytics, reputation building, and access to a pool of motivated buyers and sellers.

## Why Lebanon, Why Now

| Gap | Opportunity |
|---|---|
| No reverse marketplace exists in Lebanon | First mover advantage |
| Car pricing is opaque and trust is low | Transparency as a differentiator |
| Arabic automotive content is severely underserved | Content moat via SEO |
| Existing platforms (OLX, OpenSooq) are generic classifieds | Specialized, car-focused experience |
| WhatsApp is the de facto business channel | Native WhatsApp integration |
| Massive import/salvage car market | Lebanon-specific tools (import calculator, customs estimator) |

## Revenue Model (Summary)

| Stream | How It Works |
|---|---|
| Dealer lead fee | $5-15 per qualified inquiry |
| Featured listings | Dealers pay for premium placement |
| Dealer subscriptions | Monthly tiers for listing quotas and analytics |
| "Sell My Car" buyer fee | Dealer pays $50-150 per car acquired via auction |
| Finance/insurance referrals | Referral fee per completed deal |
| Advertising | OEM and brand advertising on platform |
| Data products | Market reports for dealers, banks, insurers |

---

# 2. BRAND IDENTITY & DESIGN SYSTEM

## 2.1 Brand Name Options

| Name | Arabic | Meaning | Notes |
|---|---|---|---|
| **Sayarti** | سيارتي | "My Car" | Personal, warm, Arabic-native |
| **Dalalni** | دلّلني | "Guide me / Hook me up" | Colloquial Lebanese, memorable |
| **CarSouk** | — | Car + Marketplace | Bilingual, universally understood |
| **Mashini** | ماشيني | Plays on "mashi" / car | Fun, modern |

**Domain:** Must be `.com` (not `.com.lb`) for regional expansion potential.

## 2.2 Color Palette

| Role | Color | Hex | Usage |
|---|---|---|---|
| **Primary** | Deep Teal | `#0A7E8C` | Brand color, headers, primary buttons |
| **Secondary** | Warm Amber | `#F59E0B` | CTAs, deal highlights, energy elements |
| **Dark** | Charcoal | `#1A1A2E` | Text, headers, dark mode base |
| **Light** | Off-White | `#F8F9FA` | Backgrounds, cards |
| **Success** | Emerald | `#10B981` | Good deals, confirmations, savings |
| **Error** | Coral | `#EF4444` | Warnings, errors, price drops |
| **Accent** | Soft Sky | `#E0F2FE` | Card backgrounds, subtle highlights |

## 2.3 Typography

| Use | Font | Fallback |
|---|---|---|
| Headlines | IBM Plex Sans Arabic | system-ui |
| Body Text | Noto Sans Arabic / Noto Sans | system-ui |
| Prices & Numbers | DM Sans / Space Mono | monospace |

## 2.4 Design Principles

1. **Mobile-first** — 80%+ of Lebanese internet traffic is mobile
2. **Bilingual by default** — Arabic primary, English secondary, seamless toggle
3. **WhatsApp-native** — Every dealer contact point includes WhatsApp
4. **Price transparency** — Big, bold pricing in USD (with LBP toggle)
5. **Trust signals everywhere** — Ratings, verification badges, photo requirements
6. **Fast & lightweight** — Lebanese internet can be slow; optimize aggressively
7. **One primary action per screen** — Each page has ONE clear CTA
8. **Progressive disclosure** — Start simple, add complexity behind clicks
9. **Content leads to commerce** — Every piece of content has a path to the marketplace
10. **Consistency creates confidence** — Same card design, rating display, and CTA styles everywhere

## 2.5 Component Library (shadcn/ui + Custom)

All UI components built on top of `shadcn/ui` with Tailwind CSS, extended with:

| Component | Description |
|---|---|
| `CarCard` | Listing card (image, make/model, specs, price, CTA) |
| `DealerCard` | Dealer profile mini-card (logo, name, rating, location) |
| `ReviewRating` | Star rating + bar chart breakdowns |
| `PriceDisplay` | USD/LBP dual currency with savings badge |
| `SpecsGrid` | Icon-based 4-column specs summary |
| `ProsCons` | Two-column green/red list |
| `StepWizard` | Multi-step form with progress indicator |
| `FilterSidebar` | Desktop sidebar filters with checkboxes/sliders |
| `FilterSheet` | Mobile bottom sheet filter overlay |
| `MegaMenu` | Multi-column dropdown navigation |
| `StickyContactSidebar` | Sticky dealer CTA on car detail pages |
| `OfferCard` | Dealer offer comparison card with badges |
| `PhotoUploader` | Guided multi-angle photo upload with templates |
| `LanguageToggle` | AR/EN language switcher |
| `CurrencyToggle` | USD/LBP price display switcher |
| `WhatsAppButton` | Deep-link WhatsApp CTA with pre-filled message |
| `TrustBar` | Social proof stats bar |
| `BreadcrumbNav` | SEO-friendly breadcrumbs with schema |
| `TabNavigation` | Client-side tabs for review hub sub-pages |

---

# 3. INFORMATION ARCHITECTURE & SITEMAP

## 3.1 Primary Navigation

### Desktop
```
[Logo] [New Cars] [Used Cars] [Sell Your Car*] [Import] [Reviews] [Blog] [Tools] [🔍] [👤 Account]
```
*"Sell Your Car" gets highlighted CTA treatment (highest-revenue feature)

### Mobile
```
Top:    [☰ Menu]  [LOGO]  [🔍 Search]
Bottom: [🏠 Home] [🔍 Search] [💰 Sell] [♡ Saved] [👤 Me]
```

### Mega Menu Structure (Per Section)
```
[Section Title]
├── By Make          → Grid of 10 popular brands + "All Makes"
├── By Type          → Grid of body types + "All Types"
├── By Popular Model → Grid of 10 top models
├── By Region        → Beirut, Mount Lebanon, North, South, Bekaa, Nabatieh
└── Special Links    → Tools, guides, how-it-works
```

## 3.2 Full URL Taxonomy

```
/                                      ← Homepage
│
├── /cars/                             ← All car listings (search)
│   ├── /cars/new/                     ← New cars
│   ├── /cars/used/                    ← Used cars
│   └── /cars/import/                  ← Imported/salvage cars (Lebanon-specific)
│
├── /[make]/                           ← Brand hub (e.g., /toyota/)
│   ├── /[make]/new/                   ← Brand new listings
│   ├── /[make]/used/                  ← Brand used listings
│   ├── /[make]/[model]/              ← Model review hub (pillar page)
│   │   ├── /[make]/[model]/review/   ← Full editorial review
│   │   ├── /[make]/[model]/interior/ ← Interior sub-review
│   │   ├── /[make]/[model]/specs/    ← Full specifications
│   │   ├── /[make]/[model]/colours/  ← Available colors
│   │   ├── /[make]/[model]/prices/   ← Price guide + deals
│   │   ├── /[make]/[model]/new/      ← Model new listings
│   │   └── /[make]/[model]/used/     ← Model used listings
│   └── ...more models
│
├── /[type]/                           ← Car type pages (SEO)
│   ├── /suv/
│   ├── /sedan/
│   ├── /hatchback/
│   ├── /pickup/
│   ├── /electric-cars/
│   ├── /hybrid-cars/
│   ├── /family-cars/
│   ├── /cheap-cars/
│   └── /luxury-cars/
│
├── /cars/[region]/                    ← Cars by region (Lebanon-specific)
│   ├── /cars/beirut/
│   ├── /cars/mount-lebanon/
│   ├── /cars/north/
│   ├── /cars/south/
│   ├── /cars/bekaa/
│   └── /cars/nabatieh/
│
├── /sell-my-car/                      ← Sell flow landing
│   ├── /sell-my-car/valuation/        ← Valuation tool
│   ├── /sell-my-car/how-it-works/     ← Explainer
│   └── /sell-my-car/[region]/         ← Location-specific sell pages (SEO)
│
├── /get-offers/                       ← Reverse marketplace flow
│   ├── /get-offers/configure/         ← Car configuration wizard
│   └── /get-offers/dashboard/         ← Offer comparison (auth required)
│
├── /dealers/                          ← Dealer directory
│   ├── /dealers/[slug]/              ← Individual dealer profile
│   ├── /dealers/[region]/            ← Dealers by region
│   └── /dealers/join/                ← Dealer registration
│
├── /reviews/                          ← Review index
│   ├── /reviews/best-[type]/         ← Roundup articles (e.g., /reviews/best-suv/)
│   └── /reviews/comparison/[slug]    ← Comparison articles
│
├── /blog/                             ← Blog index
│   ├── /blog/buying-guides/
│   ├── /blog/import-guides/          ← Lebanon-specific
│   ├── /blog/market-news/
│   ├── /blog/maintenance/
│   └── /blog/[slug]/                 ← Individual post
│
├── /guides/                           ← Evergreen guides
│   ├── /guides/how-to-import-car-lebanon/
│   ├── /guides/customs-duty-calculator/
│   ├── /guides/car-insurance-lebanon/
│   └── /guides/car-loan-guide/
│
├── /tools/                            ← Interactive tools
│   ├── /tools/import-calculator/
│   ├── /tools/loan-calculator/
│   ├── /tools/fuel-calculator/
│   ├── /tools/compare/               ← Side-by-side comparison
│   └── /tools/valuation/             ← Car value estimator
│
├── /about/
│   ├── /about/how-it-works/
│   ├── /about/contact/
│   └── /about/careers/
│
└── /legal/
    ├── /legal/terms/
    ├── /legal/privacy/
    └── /legal/cookie-policy/
```

## 3.3 Footer Architecture (SEO-Important Pages)

```
Footer Sections:
├── Buying          → New cars, used cars, imported cars, car types, finance guides
├── Selling         → Sell my car, valuation, sell by region
├── Tools           → All calculators, comparison tool, valuation estimator
├── Reviews         → Top reviewed brands, best-of roundups
├── Dealers         → Dealer directory, join as dealer, dealer by region
├── Company         → About, how it works, careers, contact
├── Legal           → Terms, privacy, cookie policy
└── Social          → Instagram, YouTube, TikTok, Facebook, WhatsApp
```

## 3.4 Internal Linking Strategy

```
Homepage
  ↓ links to ↓
Brand Hubs (/toyota/)
  ↓ links to ↓
Model Hubs (/toyota/corolla/) — pillar page
  ↓ links to ↓                  ↗ links back up ↗
Sub-reviews (/toyota/corolla/interior/)
  ↓ links to ↓
Deals (/toyota/corolla/prices/)

Blog Posts ("Best Family Cars 2026")
  → links to → Multiple model hubs
  → links to → Comparison tool
  → links to → Deals/listing pages

Roundup Articles ("10 Best SUVs")
  → links to → Individual model reviews
  → links to → Type pages (/suv/)

Every page → CTA to "Sell My Car" (sidebar/footer)
Every page → CTA to "Get Offers" (header)
Every listing page → Link to model review hub
Every review page → Link to marketplace listings
```

**Rule:** Every page links DOWN to more specific pages, UP to category pages, and SIDEWAYS to related content. Dense link web distributes authority.

---

# 4. DATABASE SCHEMA

## 4.1 Core Tables

### Users
```sql
users
├── id (UUID, PK)
├── email (unique, indexed)
├── phone (unique, indexed)
├── password_hash
├── name
├── role (enum: buyer | seller | dealer | admin)
├── avatar_url
├── location_region (enum: beirut | mount_lebanon | north | south | bekaa | nabatieh)
├── location_city
├── language_pref (enum: ar | en)
├── is_verified (boolean)
├── google_id (nullable — OAuth)
├── created_at
├── updated_at
├── last_login_at
```

### Dealers
```sql
dealers
├── id (UUID, PK)
├── user_id (FK → users, unique)
├── company_name
├── company_name_ar
├── slug (unique, indexed — for URL)
├── trade_license_url
├── logo_url
├── cover_image_url
├── description_en
├── description_ar
├── address
├── region (enum)
├── city
├── lat, lng (decimal — for map)
├── phone
├── whatsapp_number
├── email
├── website_url
├── instagram_url
├── working_hours (JSON)
├── brands_carried (JSON array — e.g., ["toyota", "kia"])
├── is_verified (boolean — admin-approved documents)
├── is_featured (boolean — paid placement)
├── subscription_tier (enum: free | bronze | silver | gold)
├── subscription_expires_at
├── rating_avg (decimal, computed)
├── review_count (integer, computed)
├── status (enum: pending | active | suspended)
├── created_at
├── updated_at
```

### Car Listings
```sql
cars
├── id (UUID, PK)
├── dealer_id (FK → dealers)
├── status (enum: draft | active | sold | expired)
├── condition (enum: new | used | certified_preowned)
├── source (enum: local | imported_usa | imported_gulf | imported_europe | salvage_rebuilt)
├── make (indexed)
├── model (indexed)
├── year (integer, indexed)
├── trim
├── body_type (enum: sedan | suv | hatchback | pickup | coupe | convertible | van | wagon)
├── mileage_km (integer)
├── fuel_type (enum: gasoline | diesel | hybrid | electric | plug_in_hybrid)
├── transmission (enum: automatic | manual | cvt)
├── drivetrain (enum: fwd | rwd | awd | 4wd)
├── engine_size (varchar — e.g., "2.0L")
├── horsepower (integer)
├── color_exterior
├── color_interior
├── features (JSON array — e.g., ["sunroof", "leather_seats", "backup_camera"])
├── description_en
├── description_ar
├── price_usd (decimal, indexed)
├── price_lbp (decimal)
├── original_price_usd (nullable — for showing savings)
├── is_negotiable (boolean)
├── images (JSON array of URLs — ordered)
├── thumbnail_url
├── views_count (integer, default 0)
├── inquiries_count (integer, default 0)
├── is_featured (boolean)
├── location_region (enum)
├── location_city
├── customs_paid (boolean, nullable — for imports)
├── accident_history (boolean, nullable)
├── created_at (indexed)
├── updated_at
├── expires_at
```

### Inquiries (Buyer → Dealer Lead)
```sql
inquiries
├── id (UUID, PK)
├── car_id (FK → cars)
├── buyer_id (FK → users)
├── dealer_id (FK → dealers)
├── message
├── preferred_contact (enum: whatsapp | call | email | in_app)
├── status (enum: new | viewed | responded | converted | closed)
├── created_at
├── viewed_at
├── responded_at
```

### Car Configurations (Reverse Marketplace — Buyer Requests)
```sql
car_configurations
├── id (UUID, PK)
├── buyer_id (FK → users)
├── make
├── model
├── year
├── trim
├── body_type
├── preferred_color
├── budget_min_usd (decimal)
├── budget_max_usd (decimal)
├── finance_preference (enum: cash | finance | not_sure)
├── features_wanted (JSON array)
├── notes
├── location_region (enum)
├── status (enum: open | matched | closed | expired)
├── created_at
├── expires_at (default: created_at + 30 days)
```

### Dealer Offers (Dealers Bid on Buyer Configurations)
```sql
dealer_offers
├── id (UUID, PK)
├── configuration_id (FK → car_configurations)
├── dealer_id (FK → dealers)
├── price_offered_usd (decimal)
├── delivery_time_days (integer)
├── notes
├── included_extras (JSON array — e.g., ["free_mats", "tinted_windows", "extended_warranty"])
├── status (enum: pending | viewed | accepted | rejected | expired)
├── created_at
├── viewed_at
```

### Sell My Car Listings (Auction)
```sql
sell_listings
├── id (UUID, PK)
├── seller_id (FK → users)
├── make, model, year, trim
├── mileage_km
├── condition_description
├── condition_checkboxes (JSON — scratches, dents, mechanical_issues, etc.)
├── source (enum: local | imported_usa | imported_gulf | imported_europe | salvage)
├── accident_history (boolean)
├── asking_price_usd (nullable — or "let dealers bid")
├── estimated_value_min_usd (decimal — platform estimate)
├── estimated_value_max_usd (decimal)
├── images (JSON array — guided photo angles)
├── status (enum: pending_review | live | sold | expired | cancelled)
├── auction_ends_at
├── created_at
```

### Sell Bids (Dealer Bids on Sell Listings)
```sql
sell_bids
├── id (UUID, PK)
├── sell_listing_id (FK → sell_listings)
├── dealer_id (FK → dealers)
├── bid_amount_usd (decimal)
├── notes
├── status (enum: pending | winning | outbid | accepted | rejected | expired)
├── created_at
```

### Dealer Reviews
```sql
dealer_reviews
├── id (UUID, PK)
├── dealer_id (FK → dealers, indexed)
├── buyer_id (FK → users)
├── inquiry_id (FK → inquiries, nullable)
├── rating_overall (integer 1-5)
├── rating_price_fairness (integer 1-5)
├── rating_communication (integer 1-5)
├── rating_honesty (integer 1-5)
├── title
├── body
├── is_verified_purchase (boolean)
├── dealer_response (text, nullable)
├── dealer_responded_at
├── status (enum: pending | approved | rejected)
├── created_at
```

### Editorial Car Reviews
```sql
car_reviews
├── id (UUID, PK)
├── slug (unique, indexed)
├── make, model, year
├── title_en, title_ar
├── content_en (rich text / MDX)
├── content_ar (rich text / MDX)
├── excerpt_en, excerpt_ar
├── pros_en (JSON array), pros_ar (JSON array)
├── cons_en (JSON array), cons_ar (JSON array)
├── verdict_en, verdict_ar
├── rating_overall (decimal 1-10)
├── rating_value (decimal 1-10)
├── rating_interior (decimal 1-10)
├── rating_performance (decimal 1-10)
├── rating_reliability (decimal 1-10)
├── rating_safety (decimal 1-10)
├── author_id (FK → users)
├── featured_image_url
├── gallery (JSON array)
├── youtube_video_id (nullable)
├── seo_title_en, seo_title_ar
├── seo_description_en, seo_description_ar
├── seo_keywords (JSON array)
├── status (enum: draft | published)
├── published_at
├── views_count
├── created_at, updated_at
```

### Blog Posts
```sql
blog_posts
├── id (UUID, PK)
├── slug (unique, indexed)
├── title_en, title_ar
├── content_en, content_ar (rich text / MDX)
├── excerpt_en, excerpt_ar
├── category (enum: buying_guide | selling_tips | car_news | import_customs | finance_insurance | maintenance | market_analysis)
├── tags (JSON array)
├── author_id (FK → users)
├── featured_image_url
├── seo_title_en, seo_title_ar
├── seo_description_en, seo_description_ar
├── status (enum: draft | published)
├── published_at
├── views_count
├── created_at, updated_at
```

### Supporting Tables
```sql
saved_cars
├── id (UUID, PK)
├── user_id (FK → users)
├── car_id (FK → cars)
├── created_at

search_alerts
├── id (UUID, PK)
├── user_id (FK → users)
├── filters (JSON — make, model, price range, region, etc.)
├── frequency (enum: instant | daily | weekly)
├── is_active (boolean)
├── last_triggered_at
├── created_at

notifications
├── id (UUID, PK)
├── user_id (FK → users)
├── type (enum: new_offer | new_inquiry | price_drop | new_bid | review_received | listing_match)
├── title, body
├── data (JSON — links, IDs)
├── is_read (boolean)
├── created_at

car_makes
├── id (PK)
├── name_en, name_ar
├── slug, logo_url
├── is_popular (boolean)

car_models
├── id (PK)
├── make_id (FK → car_makes)
├── name_en, name_ar
├── slug
├── body_type
├── years_available (JSON array)

admin_logs
├── id (UUID, PK)
├── admin_id (FK → users)
├── action (varchar)
├── target_type, target_id
├── details (JSON)
├── created_at
```

## 4.2 Key Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_cars_make_model ON cars(make, model);
CREATE INDEX idx_cars_price ON cars(price_usd);
CREATE INDEX idx_cars_status_condition ON cars(status, condition);
CREATE INDEX idx_cars_region ON cars(location_region);
CREATE INDEX idx_cars_created ON cars(created_at DESC);
CREATE INDEX idx_cars_dealer ON cars(dealer_id);
CREATE INDEX idx_inquiries_dealer_status ON inquiries(dealer_id, status);
CREATE INDEX idx_configurations_status ON car_configurations(status);
CREATE INDEX idx_dealer_offers_config ON dealer_offers(configuration_id);
CREATE INDEX idx_sell_listings_status ON sell_listings(status);
CREATE INDEX idx_sell_bids_listing ON sell_bids(sell_listing_id);
CREATE INDEX idx_dealer_reviews_dealer ON dealer_reviews(dealer_id);
```

---

# 5. TECH STACK

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 14+ (App Router, RSC) | SSR for SEO, React Server Components, fast |
| **Language** | TypeScript (full stack) | Type safety, fewer bugs, better DX |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, consistent design system |
| **Client State** | Zustand | Lightweight, simple global state |
| **Server State** | React Query (TanStack Query) | Caching, background refetch, optimistic updates |
| **API** | tRPC (or Next.js API Routes) | End-to-end type safety between client and server |
| **Database** | PostgreSQL (via Supabase or self-hosted) | Relational, robust, JSON support for flexible fields |
| **ORM** | Prisma | Type-safe queries, migrations, schema management |
| **Search** | Meilisearch | Fast full-text search, Arabic support, typo-tolerant |
| **Auth** | NextAuth.js v5 (Auth.js) | Email/password, Google OAuth, phone OTP |
| **File Storage** | Cloudflare R2 (or AWS S3) | Cheap object storage for images |
| **CDN** | Cloudflare | Global CDN, DDoS protection, edge caching |
| **Email** | Resend (or SendGrid) | Transactional emails (verification, notifications) |
| **SMS/OTP** | Twilio | Phone number verification |
| **CMS** | Payload CMS (headless, self-hosted) | Blog/review content management, bilingual support |
| **i18n** | next-intl | Arabic + English, RTL support |
| **Maps** | Google Maps API | Dealer locations, region browsing |
| **Payments** | Stripe (or manual invoicing initially) | Dealer subscriptions, featured listings |
| **Image Processing** | Sharp (via Next.js Image) | WebP conversion, resizing, optimization |
| **Testing** | Vitest (unit) + Playwright (e2e) | Fast testing, browser automation |
| **Error Monitoring** | Sentry | Error tracking, performance monitoring |
| **Analytics** | Google Analytics 4 + Mixpanel | Traffic analytics + event/funnel tracking |
| **CI/CD** | GitHub Actions | Automated testing, deployment |
| **Hosting** | Vercel (frontend) + DigitalOcean/AWS (backend/DB) | Scalable, cost-effective |

---

# 6. FRONTEND — PAGES & COMPONENTS

## 6.1 Complete Page List

### Public Pages

| # | Page | Route | Description |
|---|---|---|---|
| 1 | **Homepage** | `/` | Hero search, browse by make/type/region, trust bar, featured listings, how-it-works, latest reviews, sell CTA |
| 2 | **Search / Listings** | `/cars/` | Filter sidebar (desktop) / bottom sheet (mobile), listing card grid, sort, pagination |
| 3 | **New Cars** | `/cars/new/` | Search filtered to new cars |
| 4 | **Used Cars** | `/cars/used/` | Search filtered to used cars |
| 5 | **Imported Cars** | `/cars/import/` | Search filtered to imported/salvage (Lebanon-specific) |
| 6 | **Cars by Region** | `/cars/[region]/` | Search filtered to region (6 pages) |
| 7 | **Brand Hub** | `/[make]/` | Brand overview, popular models, reviews, listings CTA |
| 8 | **Model Review Hub** | `/[make]/[model]/` | Pillar page — overview, verdict, specs, pros/cons, video, deals CTA |
| 9 | **Model Sub-Pages** | `/[make]/[model]/review/` | Full editorial review |
| 10 | | `/[make]/[model]/interior/` | Interior sub-review |
| 11 | | `/[make]/[model]/specs/` | Full specifications table |
| 12 | | `/[make]/[model]/colours/` | Available colors with images |
| 13 | | `/[make]/[model]/prices/` | Price guide and current deals |
| 14 | **Car Type Pages** | `/[type]/` | SEO pages — e.g., /suv/, /electric-cars/ |
| 15 | **Car Detail / Listing** | `/cars/[make]/[model]/[id]` | Full gallery, specs, price, dealer info, WhatsApp/call/message, similar cars |
| 16 | **Dealer Directory** | `/dealers/` | Searchable dealer list with map |
| 17 | **Dealer Profile** | `/dealers/[slug]/` | Dealer info, all listings, reviews, contact buttons |
| 18 | **Dealers by Region** | `/dealers/[region]/` | Directory filtered by region |
| 19 | **Sell My Car** | `/sell-my-car/` | Landing page with CTA and explainer |
| 20 | **Sell Flow** | `/sell-my-car/valuation/` | Multi-step form: details → condition → photos → valuation → list |
| 21 | **Get Offers** | `/get-offers/` | Landing page explaining reverse marketplace |
| 22 | **Get Offers Configure** | `/get-offers/configure/` | Multi-step wizard: make → model → config → budget → submit |
| 23 | **Reviews Index** | `/reviews/` | All reviews, browse by brand/type |
| 24 | **Roundup Articles** | `/reviews/best-[type]/` | "Best SUVs 2026", "Best Family Cars" etc. |
| 25 | **Comparison Articles** | `/reviews/comparison/[slug]` | Head-to-head comparisons |
| 26 | **Blog Index** | `/blog/` | Blog listing with categories |
| 27 | **Blog Category** | `/blog/[category]/` | Filtered blog listing |
| 28 | **Blog Post** | `/blog/[slug]/` | Full article with TOC, author, related posts |
| 29 | **Guides Hub** | `/guides/` | Evergreen guides listing |
| 30 | **Guide Page** | `/guides/[slug]/` | Individual guide (long-form content) |
| 31 | **Tools Hub** | `/tools/` | All interactive tools |
| 32 | **Import Calculator** | `/tools/import-calculator/` | Customs duty + total landed cost |
| 33 | **Loan Calculator** | `/tools/loan-calculator/` | Monthly payments, total cost |
| 34 | **Fuel Calculator** | `/tools/fuel-calculator/` | Monthly/yearly fuel cost |
| 35 | **Comparison Tool** | `/tools/compare/` | Side-by-side car comparison |
| 36 | **Valuation Tool** | `/tools/valuation/` | Market value estimator |
| 37 | **How It Works** | `/about/how-it-works/` | Platform explainer |
| 38 | **About** | `/about/` | Company info |
| 39 | **Contact** | `/about/contact/` | Contact form + info |
| 40 | **Terms** | `/legal/terms/` | Terms of service |
| 41 | **Privacy** | `/legal/privacy/` | Privacy policy |
| 42 | **Login** | `/auth/login/` | Email + Google + phone OTP |
| 43 | **Register** | `/auth/register/` | Registration with role selection |
| 44 | **Dealer Registration** | `/dealers/join/` | Dealer signup flow |

### Authenticated Pages (Buyer)

| # | Page | Route | Description |
|---|---|---|---|
| 45 | **My Dashboard** | `/dashboard/` | Overview — saved cars, active inquiries, offers |
| 46 | **Saved Cars** | `/dashboard/saved/` | Wishlist |
| 47 | **My Inquiries** | `/dashboard/inquiries/` | Inquiry history + status |
| 48 | **Offer Dashboard** | `/get-offers/dashboard/` | Compare dealer offers on your configurations |
| 49 | **My Sell Listings** | `/dashboard/selling/` | Manage sell listings, view bids |
| 50 | **Search Alerts** | `/dashboard/alerts/` | Manage saved search notifications |
| 51 | **Profile Settings** | `/dashboard/settings/` | Name, photo, password, language, notifications |

### Authenticated Pages (Dealer)

| # | Page | Route | Description |
|---|---|---|---|
| 52 | **Dealer Dashboard** | `/dealer/` | Key metrics, recent inquiries, action items |
| 53 | **My Listings** | `/dealer/listings/` | All listings with status, add/edit/remove |
| 54 | **Add Listing** | `/dealer/listings/new/` | Full car listing form |
| 55 | **Edit Listing** | `/dealer/listings/[id]/edit/` | Edit existing listing |
| 56 | **Inquiry Inbox** | `/dealer/inquiries/` | All buyer inquiries with status |
| 57 | **Buyer Requests** | `/dealer/requests/` | Incoming reverse marketplace requests |
| 58 | **Submit Offer** | `/dealer/requests/[id]/offer/` | Respond to a buyer configuration |
| 59 | **Sell Auctions** | `/dealer/auctions/` | Available cars to buy (sell-my-car bids) |
| 60 | **My Reviews** | `/dealer/reviews/` | View + respond to dealer reviews |
| 61 | **Analytics** | `/dealer/analytics/` | Views, inquiries, conversion rates, market insights |
| 62 | **Profile Settings** | `/dealer/settings/` | Company info, logo, working hours, WhatsApp |
| 63 | **Subscription** | `/dealer/subscription/` | Manage plan, billing, invoices |
| 64 | **Team Management** | `/dealer/team/` | Add/manage sales rep accounts |

### Admin Pages

| # | Page | Route | Description |
|---|---|---|---|
| 65 | **Admin Dashboard** | `/admin/` | Key metrics, pending actions |
| 66 | **User Management** | `/admin/users/` | View, edit, suspend users |
| 67 | **Dealer Approval Queue** | `/admin/dealers/` | Approve/reject dealer applications |
| 68 | **Listing Moderation** | `/admin/listings/` | Review flagged/reported listings |
| 69 | **Content Management** | `/admin/content/` | Blog posts, reviews, guides (CMS) |
| 70 | **Featured Management** | `/admin/featured/` | Manage promoted listings and dealers |
| 71 | **System Settings** | `/admin/settings/` | Regions, car makes/models DB, pricing config |
| 72 | **Analytics** | `/admin/analytics/` | Platform-wide analytics overview |
| 73 | **Audit Log** | `/admin/logs/` | Admin action history |

**Total: ~73 distinct pages/routes**

## 6.2 Page-by-Page Layout Specifications

### Homepage Layout

```
┌─────────────────────────────────────────────────────┐
│ [Language Toggle AR/EN] [Top Banner - "Sell Your Car"] │
├─────────────────────────────────────────────────────┤
│ [Navigation Bar]                                      │
├─────────────────────────────────────────────────────┤
│ HERO SECTION                                          │
│ Headline: "The easiest way to buy and sell cars       │
│            in Lebanon"                                │
│                                                       │
│ Tabs: [Buy New] [Buy Used] [Sell Your Car] [Import]  │
│ [Make ▼] [Model ▼] [Budget ▼] [Search Button]       │
├─────────────────────────────────────────────────────┤
│ TRUST BAR                                             │
│ "200+ Dealers"  "5,000+ Cars"  "Transparent Prices"  │
├─────────────────────────────────────────────────────┤
│ FEATURED LISTINGS CAROUSEL                            │
│ [Listing Card] [Listing Card] [Listing Card] →       │
├─────────────────────────────────────────────────────┤
│ BROWSE BY MAKE (Logo Grid — 10 popular + "All Makes")│
│ [Toyota] [Kia] [Hyundai] [Mercedes] [BMW]            │
│ [Nissan] [Honda] [Range Rover] [BYD] [Chery]         │
├─────────────────────────────────────────────────────┤
│ BROWSE BY TYPE (Visual Cards with Images)             │
│ [SUV] [Sedan] [Hatchback] [Pickup] [Electric]        │
├─────────────────────────────────────────────────────┤
│ BROWSE BY REGION (Lebanon-specific)                   │
│ [Beirut] [Mount Lebanon] [North] [Bekaa] [South]     │
├─────────────────────────────────────────────────────┤
│ HOW IT WORKS (3-step visual)                          │
│ 1. Choose your car → 2. Compare dealer offers         │
│ → 3. Buy from a trusted dealer                        │
├─────────────────────────────────────────────────────┤
│ LATEST REVIEWS CAROUSEL                               │
│ [Review Card] [Review Card] [Review Card] →           │
├─────────────────────────────────────────────────────┤
│ SELL MY CAR CTA SECTION                               │
│ "Get the best price for your car"                     │
│ [Start Selling →]                                     │
├─────────────────────────────────────────────────────┤
│ IMPORT COST CALCULATOR CTA                            │
│ "Calculate your import costs"                         │
│ [Calculate →]                                         │
├─────────────────────────────────────────────────────┤
│ [Footer]                                              │
└─────────────────────────────────────────────────────┘
```

### Search / Listings Page Layout

```
┌─────────────────────────────────────────────────────┐
│ STICKY SEARCH BAR                                     │
│ [Make ▼] [Model ▼] [Region ▼] [Price Range]         │
├────────────────┬────────────────────────────────────┤
│ LEFT SIDEBAR   │ RESULTS AREA                         │
│ (Desktop)      │                                      │
│                │ [Sort ▼] [XX results] [Map View]    │
│ FILTERS:       │                                      │
│                │ ┌──────────────────────────────────┐│
│ □ Price Range  │ │ [IMG]  Make Model Year            ││
│   (slider)     │ │        Trim / Variant             ││
│                │ │        ⭐ Dealer Rating • 📍 City ││
│ □ Condition    │ │        ⚙️ Auto · ⛽ Hybrid · 📏 KM ││
│   ☐ New       │ │        💰 $XX,XXX  was $XX,XXX    ││
│   ☐ Used      │ │        [View Details] [WhatsApp]  ││
│   ☐ Certified │ └──────────────────────────────────┘│
│                │                                      │
│ □ Source       │ [Next card...]                       │
│   ☐ Local     │ [Next card...]                       │
│   ☐ Imported  │                                      │
│   ☐ Salvage   │ [Show More] (button pagination)     │
│                │                                      │
│ □ Body Type   │                                      │
│ □ Fuel Type   │                                      │
│ □ Transmission│                                      │
│ □ Year Range  │                                      │
│ □ Mileage     │                                      │
│ □ Region      │                                      │
│ □ Color       │                                      │
│                │                                      │
│ [Clear All]   │                                      │
└────────────────┴────────────────────────────────────┘

MOBILE VERSION:
┌──────────────────────────────┐
│ [Sort ▼] [Filter 🔽]         │
│ Applied: SUV, <$30K ✕        │
├──────────────────────────────┤
│ [Full-width Card]             │
│ [Full-width Card]             │
│ [Full-width Card]             │
│ [Show More]                   │
└──────────────────────────────┘
```

### Car Detail Page Layout

```
┌─────────────────────────────────────────────────────┐
│ BREADCRUMB: Home > Toyota > Corolla > 2026           │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────────┬──────────────────────┐ │
│ │                          │ STICKY SIDEBAR        │ │
│ │ IMAGE GALLERY            │                       │ │
│ │ [Main Image — swipeable] │ 2026 Toyota Corolla  │ │
│ │ [thumb][thumb][thumb]    │ 1.8 Hybrid LE        │ │
│ │                          │                       │ │
│ │                          │ $24,500               │ │
│ │                          │ was $26,000           │ │
│ │                          │ 🟢 Save $1,500       │ │
│ │                          │                       │ │
│ │                          │ [Get Offers] (CTA)   │ │
│ │                          │ [WhatsApp Dealer]    │ │
│ │                          │ [Call Dealer]        │ │
│ │                          │                       │ │
│ │                          │ ─── Dealer Info ───  │ │
│ │                          │ [Logo] ABC Motors    │ │
│ │                          │ ⭐ 4.7 (128 reviews) │ │
│ │                          │ 📍 Beirut, Achrafieh │ │
│ │                          │ ✅ Verified           │ │
│ │                          │ [View Dealer Profile]│ │
│ │                          │                       │ │
│ │                          │ [♡ Save] [📤 Share]  │ │
│ └──────────────────────────┴──────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ SPECS GRID (icon-based, 4 columns)                   │
│ ┌────────┬────────┬────────┬────────┐               │
│ │⚙️ Auto │⛽ Hybrid│📏 15K km│🏁 120hp│               │
│ └────────┴────────┴────────┴────────┘               │
├─────────────────────────────────────────────────────┤
│ FULL SPECIFICATIONS TABLE                            │
│ Engine: 1.8L Hybrid | Transmission: CVT | ...        │
├─────────────────────────────────────────────────────┤
│ FEATURES LIST                                        │
│ ✓ Sunroof ✓ Leather ✓ Backup Camera ✓ Nav          │
├─────────────────────────────────────────────────────┤
│ DESCRIPTION (from dealer)                            │
├─────────────────────────────────────────────────────┤
│ IMPORT INFO (if imported)                            │
│ Source: USA | Customs: Paid | Accident: None         │
├─────────────────────────────────────────────────────┤
│ SIMILAR CARS CAROUSEL                                │
│ [Card] [Card] [Card] →                               │
├─────────────────────────────────────────────────────┤
│ DEALER REVIEWS (for this dealer)                     │
│ [Review] [Review] → "See All XX Reviews"             │
├─────────────────────────────────────────────────────┤
│ [Report Listing]                                     │
│ [Footer]                                             │
└─────────────────────────────────────────────────────┘
```

### Model Review Hub Layout (Tabbed)

```
┌─────────────────────────────────────────────────────┐
│ BREADCRUMB: Home > Toyota > Corolla > Review         │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────────┬──────────────────────┐ │
│ │ HERO IMAGE               │ STICKY SIDEBAR        │ │
│ │ [Car Photo]              │ OUR RATING: 8/10      │ │
│ │                          │ Price from: $22,000    │ │
│ │                          │ [Get Offers →]         │ │
│ │                          │ [View XX Deals →]      │ │
│ └──────────────────────────┴──────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ TAB NAVIGATION (client-side, each has own URL)       │
│ [Overview] [Review] [Interior] [Specs] [Colours]     │
│ [Prices] [Deals]                                     │
├─────────────────────────────────────────────────────┤
│ VERDICT BOX (highlighted)                            │
│ "The Toyota Corolla is..." + star rating             │
├─────────────────────────────────────────────────────┤
│ PROS & CONS (two columns)                            │
│ ✅ Great fuel economy    ❌ Small boot               │
│ ✅ Reliable              ❌ Basic infotainment       │
├─────────────────────────────────────────────────────┤
│ RATING BREAKDOWN (horizontal bar charts)             │
│ Performance    ████████░░  8/10                      │
│ Interior       ███████░░░  7/10                      │
│ Running Costs  █████████░  9/10                      │
│ Reliability    ████████░░  8/10                      │
│ Safety         █████████░  9/10                      │
├─────────────────────────────────────────────────────┤
│ SPECS GRID (quick summary — 4 columns)               │
├─────────────────────────────────────────────────────┤
│ WRITTEN REVIEW CONTENT                               │
│ (sections with images, embedded YouTube video)        │
├─────────────────────────────────────────────────────┤
│ ALTERNATIVE CARS                                     │
│ "If you like this, also consider..."                 │
│ [Card] [Card] [Card]                                 │
├─────────────────────────────────────────────────────┤
│ RELATED DEALS (link to marketplace listings)         │
├─────────────────────────────────────────────────────┤
│ [Footer]                                             │
└─────────────────────────────────────────────────────┘
```

## 6.3 Component Specifications

### CarCard Component
```
┌────────────────────────────────────┐
│ [CAR IMAGE — 16:9]         [♡ Save]│
│                                     │
│ 2024 Toyota Corolla 1.8 Hybrid     │
│ ⭐ 4.7 (128 reviews) · Beirut      │
│                                     │
│ 🔄 Auto · ⛽ Hybrid · 📏 15,000km  │
│                                     │
│ $23,500                             │
│ was $25,000 — Save $1,500          │
│                                     │
│ [View Details] [WhatsApp]          │
└────────────────────────────────────┘

Design rules:
- Image takes ~40% of vertical card space
- Max 2 lines for title (make + model + variant)
- Specs use icons, not text labels
- Price is the largest text after the title
- Savings in a colored badge (green)
- CTA button is full-width at card bottom
- Uniform card heights (images cropped to same aspect ratio)
- Full-width on mobile, grid on desktop (2-3 columns)
```

### DealerCard Component
```
┌────────────────────────────────┐
│ [DEALER LOGO]                   │
│ ABC Motors                      │
│ ⭐⭐⭐⭐⭐ 4.7 (234 reviews)  │
│ 📍 Beirut, Achrafieh           │
│ ✅ Verified Dealer              │
│                                 │
│ "Authorized Toyota Dealer"      │
│                                 │
│ [View All 45 Listings]          │
│ [WhatsApp] [Call] [Message]    │
└────────────────────────────────┘
```

### OfferCard Component (Reverse Marketplace)
```
┌─────────────────────────────────────────┐
│ OFFER 1                    BEST PRICE   │
│ ABC Toyota Beirut          ⭐ 4.7       │
│ Price: $24,500                          │
│ Delivery: 2 weeks                       │
│ Extras: Free mats, tinted windows       │
│ [Message Dealer] [WhatsApp] [Details]   │
└─────────────────────────────────────────┘

Badges: "Best Price", "Fastest Delivery", "Top Rated", "Best Value"
```

### PriceDisplay Component
```
$24,500               ← Primary (large, bold)
was $26,000           ← Original (strikethrough, muted)
Save $1,500           ← Savings (green badge)
≈ 2,205,000,000 LBP  ← LBP toggle (smaller, muted)
```

---

# 7. BACKEND — API & SERVICES

## 7.1 API Endpoints (tRPC Routers or REST)

### Auth
```
POST   /api/auth/register          → Register (email + phone OTP)
POST   /api/auth/login             → Login (email/pass | Google | phone OTP)
POST   /api/auth/verify-otp        → Verify phone OTP
POST   /api/auth/forgot-password   → Send password reset email
POST   /api/auth/reset-password    → Reset password with token
GET    /api/auth/session           → Get current session
POST   /api/auth/logout            → Logout
```

### Cars (Listings)
```
GET    /api/cars                    → Search/filter listings (public)
GET    /api/cars/:id                → Get single listing (public)
POST   /api/cars                    → Create listing (dealer auth)
PUT    /api/cars/:id                → Update listing (dealer auth)
DELETE /api/cars/:id                → Delete listing (dealer auth)
POST   /api/cars/:id/report        → Report a listing (auth)
POST   /api/cars/bulk-import       → CSV bulk import (dealer auth)
GET    /api/cars/similar/:id        → Get similar cars
GET    /api/cars/featured           → Get featured/promoted listings
```

### Dealers
```
GET    /api/dealers                 → List/search dealers (public)
GET    /api/dealers/:slug           → Get dealer profile (public)
POST   /api/dealers/register        → Apply as dealer (auth)
PUT    /api/dealers/:id             → Update dealer profile (dealer auth)
GET    /api/dealers/:id/listings    → Get dealer's listings (public)
GET    /api/dealers/:id/reviews     → Get dealer's reviews (public)
```

### Inquiries
```
POST   /api/inquiries               → Send inquiry (buyer auth)
GET    /api/inquiries/mine          → Get my inquiries (buyer auth)
GET    /api/inquiries/dealer        → Get dealer's inquiries (dealer auth)
PUT    /api/inquiries/:id/status    → Update inquiry status (dealer auth)
POST   /api/inquiries/:id/respond   → Respond to inquiry (dealer auth)
```

### Reverse Marketplace (Configurations & Offers)
```
POST   /api/configurations          → Create car configuration (buyer auth)
GET    /api/configurations/mine     → Get my configurations (buyer auth)
GET    /api/configurations/dealer   → Get matching requests (dealer auth)
POST   /api/offers                  → Submit dealer offer (dealer auth)
GET    /api/offers/config/:id       → Get all offers for a configuration (buyer auth)
PUT    /api/offers/:id/status       → Accept/reject offer (buyer auth)
```

### Sell My Car (Auctions)
```
POST   /api/sell-listings           → Create sell listing (auth)
GET    /api/sell-listings/mine      → Get my sell listings (seller auth)
GET    /api/sell-listings/available → Get available listings to bid on (dealer auth)
GET    /api/sell-listings/:id       → Get sell listing details
POST   /api/sell-bids               → Place bid (dealer auth)
GET    /api/sell-bids/listing/:id   → Get bids for a listing (seller auth)
PUT    /api/sell-bids/:id/accept    → Accept bid (seller auth)
```

### Reviews
```
POST   /api/reviews                 → Submit dealer review (buyer auth)
GET    /api/reviews/dealer/:id      → Get reviews for dealer (public)
POST   /api/reviews/:id/respond     → Dealer response (dealer auth)
PUT    /api/reviews/:id/moderate    → Approve/reject (admin auth)
```

### Content (CMS-driven, read-only API)
```
GET    /api/car-reviews             → List editorial reviews
GET    /api/car-reviews/:slug       → Get single car review
GET    /api/blog                    → List blog posts
GET    /api/blog/:slug              → Get single blog post
GET    /api/guides                  → List guides
GET    /api/guides/:slug            → Get single guide
```

### Saved & Alerts
```
POST   /api/saved-cars              → Save a car (auth)
DELETE /api/saved-cars/:id          → Unsave a car (auth)
GET    /api/saved-cars              → Get saved cars (auth)
POST   /api/search-alerts           → Create search alert (auth)
GET    /api/search-alerts           → Get my alerts (auth)
PUT    /api/search-alerts/:id       → Update alert (auth)
DELETE /api/search-alerts/:id       → Delete alert (auth)
```

### Notifications
```
GET    /api/notifications           → Get notifications (auth)
PUT    /api/notifications/:id/read  → Mark as read (auth)
PUT    /api/notifications/read-all  → Mark all as read (auth)
GET    /api/notifications/prefs     → Get notification preferences (auth)
PUT    /api/notifications/prefs     → Update preferences (auth)
```

### Admin
```
GET    /api/admin/dashboard         → Dashboard metrics
GET    /api/admin/users             → List users (paginated, searchable)
PUT    /api/admin/users/:id         → Edit user (suspend, change role)
GET    /api/admin/dealers/pending   → Pending dealer applications
PUT    /api/admin/dealers/:id/approve → Approve dealer
PUT    /api/admin/dealers/:id/reject  → Reject dealer
GET    /api/admin/listings/flagged  → Flagged listings
PUT    /api/admin/listings/:id      → Moderate listing
GET    /api/admin/logs              → Audit log
GET    /api/admin/analytics         → Platform analytics
```

### Tools / Utilities
```
GET    /api/makes                   → Get all car makes
GET    /api/makes/:id/models        → Get models for a make
GET    /api/exchange-rate           → Current USD/LBP rate
POST   /api/tools/import-calculator → Calculate import costs
POST   /api/tools/loan-calculator   → Calculate loan payments
POST   /api/tools/valuation         → Estimate car value
POST   /api/upload/image            → Upload image to R2/S3
```

## 7.2 Background Services

| Service | Description |
|---|---|
| **Listing Expiry** | Cron job to expire listings after 60 days |
| **Auction Timer** | Process sell-my-car auction endings |
| **Offer Expiry** | Expire dealer offers after 7 days |
| **Configuration Expiry** | Expire buyer configurations after 30 days |
| **Search Alert Matcher** | Match new listings against saved searches, trigger notifications |
| **Notification Dispatcher** | Send email/WhatsApp/push notifications |
| **Sitemap Generator** | Regenerate XML sitemaps daily |
| **Analytics Aggregator** | Roll up daily metrics for dashboards |
| **Image Processor** | Generate thumbnails, WebP versions, optimize uploads |
| **Review Moderation Queue** | Flag reviews for admin approval |

---

# 8. USER FLOWS

## 8.1 Flow A: Buying a New Car (Reverse Marketplace)

```
1. User visits homepage
2. Selects "Buy New" tab
3. Chooses Make → Model
4. Clicks "Get Offers"
5. Configures preferences (trim, color, features, budget)
6. Enters location (region)
7. Creates account (or logs in)
8. System matches with relevant dealers
9. Dealers receive notification → submit competing offers
10. User sees offers in comparison dashboard
11. Compares: price, delivery time, dealer rating, extras
12. Contacts preferred dealer via WhatsApp / Call / Message
13. Finalizes purchase offline with dealer
14. Gets prompted to leave a review
```

## 8.2 Flow B: Buying a Used Car

```
1. User visits homepage or /cars/used/
2. Uses search/filters (make, model, price, mileage, region, source)
3. Browses listing cards
4. Clicks on a listing → car detail page
5. Views gallery, specs, dealer info
6. Clicks "WhatsApp" or "Call" to contact dealer
7. Arranges viewing/purchase with dealer
8. Gets prompted to leave a review
```

## 8.3 Flow C: Selling a Car

```
1. User visits /sell-my-car/
2. Enters car details (make, model, year, mileage)
3. Selects source (local, imported USA, imported Gulf, imported Europe)
4. Describes condition (checkboxes: scratches, dents, mechanical issues)
5. Declares accident history
6. Uploads photos (guided — specific angles required)
7. Platform shows estimated valuation range
8. User chooses: set asking price OR "let dealers bid" (auction)
9. Creates account (or logs in)
10. Car goes live → dealers can see and bid
11. User views bids in dashboard, accepts best offer
12. Winning dealer arranges collection and payment
```

## 8.4 Flow D: Dealer Onboarding

```
1. Dealer visits /dealers/join/
2. Fills registration form (company name, trade license upload, location, brands carried)
3. Creates account with business email + phone
4. Application goes into admin approval queue
5. Admin reviews documents → approves/rejects
6. Dealer gets notified → accesses dealer dashboard
7. Adds first car listings
8. Starts receiving inquiries and buyer configuration requests
```

## 8.5 Flow E: Content → Commerce (SEO Funnel)

```
1. User searches Google: "best family car Lebanon 2026"
2. Lands on blog post: /reviews/best-family-car/
3. Reads roundup → clicks on "Toyota RAV4"
4. Lands on model review hub: /toyota/rav4/
5. Reads review, checks specs, watches video
6. Clicks "View Deals" → sees marketplace listings
7. OR clicks "Get Offers" → enters reverse marketplace flow
8. Converts from organic reader to marketplace user
```

---

# 9. REVERSE MARKETPLACE ENGINE

## 9.1 How It Works (Technical)

The reverse marketplace is the core differentiator. Here's the complete flow:

### Buyer Side

1. **Configuration submission:**
   - Buyer fills multi-step wizard (make, model, trim, color, features, budget, region)
   - System creates `car_configuration` record with status `open`
   - Configuration expires after 30 days

2. **Dealer matching:**
   - System queries dealers where:
     - `brands_carried` includes the requested make
     - `region` matches buyer region OR dealer is national
     - `status` = active
     - `subscription_tier` allows reverse marketplace access
   - Matched dealers receive notification (in-app + WhatsApp)

3. **Offer comparison:**
   - Buyer sees dashboard with all received offers
   - Each offer card shows: dealer name, rating, price, delivery time, extras, badge
   - Badges auto-assigned: "Best Price" (lowest), "Fastest" (shortest delivery), "Top Rated" (highest rating)
   - Live counter: "X of Y dealers have responded"

4. **Contact & convert:**
   - Buyer contacts preferred dealer(s) via WhatsApp / call / in-app message
   - Transaction happens offline
   - System prompts review after reasonable time

### Dealer Side

1. **Incoming request notification:**
   - Dealer sees new buyer request in dashboard with details (make, model, budget, region)
   - Deadline shown (7 days to respond)

2. **Submit offer:**
   - Price offered (USD)
   - Delivery timeline (in stock / X weeks)
   - Included extras (free text + common checkboxes)
   - Notes to buyer

3. **Track offers:**
   - See status: pending / viewed / accepted / rejected
   - Lead quality indicator (based on buyer engagement)

## 9.2 Matching Algorithm

```
Score each dealer for a configuration:

brand_match     = dealer carries requested brand? (required — no match = skip)
region_score    = same region (+3) | adjacent region (+1) | national (+2)
rating_score    = dealer_rating_avg * weight
response_score  = avg_response_time_hours (lower = better)
tier_score      = gold (+3) | silver (+2) | bronze (+1) | free (0)

final_score = region_score + rating_score + response_score + tier_score

→ Send to top N dealers (N = 8-12, configurable)
→ Higher-tier dealers get earlier notification (30min head start for gold)
```

---

# 10. SELL MY CAR — AUCTION SYSTEM

## 10.1 Seller Flow (Detailed)

```
Step 1: ENTER CAR DETAILS
┌─────────────────────────────────────────┐
│ "Sell your car the smart way"           │
│                                          │
│ Make: [Toyota ▼]  Model: [Corolla ▼]   │
│ Year: [2020 ▼]   Trim: [LE ▼]         │
│ Mileage: [45,000 km]                    │
│                                          │
│ Source:                                  │
│ ○ Local  ○ USA Import  ○ Gulf Import   │
│ ○ European Import  ○ Salvage/Rebuilt    │
│                                          │
│ [Continue →]                             │
└─────────────────────────────────────────┘

Step 2: CONDITION ASSESSMENT
┌─────────────────────────────────────────┐
│ "Tell us about your car's condition"     │
│                                          │
│ Accident history: ○ Yes ○ No            │
│ Service records:  ○ Full ○ Partial ○ No │
│ Number of keys:   ○ 1 ○ 2              │
│ Any damage?       ○ Yes ○ No           │
│   → If yes: ☐ Scratches ☐ Dents        │
│             ☐ Mechanical ☐ Interior     │
│                                          │
│ [Continue →]                             │
└─────────────────────────────────────────┘

Step 3: UPLOAD PHOTOS (Guided)
┌─────────────────────────────────────────┐
│ Required angles (template overlay):      │
│ [Front ✓] [Rear ✓] [Left ○] [Right ○] │
│ [Dashboard ○] [Mileage ○] [Damage ○]  │
│                                          │
│ Photo guide overlay shows exactly what   │
│ angle/framing is needed                  │
│                                          │
│ [Upload] or [Take Photo]                │
│ [Continue →]                             │
└─────────────────────────────────────────┘

Step 4: VALUATION & LISTING
┌─────────────────────────────────────────┐
│ "Your estimated value"                   │
│ $12,500 - $14,000                        │
│                                          │
│ How do you want to sell?                 │
│ ○ Auction (dealers bid — usually best $) │
│ ○ Set my own price: [$_______]           │
│                                          │
│ [List My Car →]                          │
└─────────────────────────────────────────┘

Step 5: AUCTION DASHBOARD
┌─────────────────────────────────────────┐
│ "Your car is live!"                      │
│ Current highest bid: $13,800             │
│ Number of bids: 5                        │
│ Auction ends: 24hrs                      │
│                                          │
│ [Bid 1: $13,800 - ABC Motors ⭐4.5]    │
│ [Bid 2: $13,500 - XYZ Autos ⭐4.2]    │
│ [Bid 3: $13,200 - 123 Cars ⭐4.8]     │
│                                          │
│ [Accept Best Offer]                      │
│ [Wait for More Bids]                     │
└─────────────────────────────────────────┘

Step 6: SALE CONFIRMED
┌─────────────────────────────────────────┐
│ "Sale agreed!"                           │
│ Buyer: ABC Motors                        │
│ Price: $13,800                           │
│ Collection: Arranged via WhatsApp        │
│ Payment: Cash or bank transfer           │
└─────────────────────────────────────────┘
```

## 10.2 Auction Rules

- Auction duration: 24 hours (configurable by admin)
- Bids are blind (dealers don't see other bids — only seller sees all)
- Minimum bid increment: $100
- Seller can accept any bid at any time (doesn't have to wait)
- Seller can reject all bids and re-list
- Winning dealer pays platform fee ($50-150 based on car value)
- WhatsApp notifications sent to seller on each new bid

---

# 11. DEALER PORTAL

## 11.1 Dashboard Overview

```
┌─────────────────────────────────────────────────────┐
│ DEALER DASHBOARD — ABC Motors                        │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│ │ Active   │ │ Inquiries│ │ Views    │ │ Rating │ │
│ │ Listings │ │ This Week│ │ This Week│ │        │ │
│ │   45     │ │   12     │ │  2,340   │ │ ⭐ 4.7 │ │
│ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────┤
│ RECENT INQUIRIES                                     │
│ [Inquiry Card] [Inquiry Card] [Inquiry Card]         │
│ → View All Inquiries                                 │
├─────────────────────────────────────────────────────┤
│ BUYER REQUESTS (Reverse Marketplace)                 │
│ [Request Card] [Request Card]                        │
│ → View All Requests                                  │
├─────────────────────────────────────────────────────┤
│ SELL AUCTIONS (Cars Available to Buy)                │
│ [Auction Card] [Auction Card]                        │
│ → View Available Cars                                │
├─────────────────────────────────────────────────────┤
│ QUICK ACTIONS                                        │
│ [+ Add Listing] [View Analytics] [Edit Profile]      │
└─────────────────────────────────────────────────────┘
```

## 11.2 Dealer Features by Subscription Tier

| Feature | Free | Bronze ($49/mo) | Silver ($99/mo) | Gold ($199/mo) |
|---|---|---|---|---|
| Active listings | 5 | 25 | 75 | Unlimited |
| Reverse marketplace access | ❌ | ✅ | ✅ | ✅ |
| Sell auctions bidding | ❌ | ✅ | ✅ | ✅ |
| Featured placement | ❌ | ❌ | ✅ (3/mo) | ✅ (Unlimited) |
| Analytics dashboard | Basic | Standard | Advanced | Premium |
| Priority in matching | — | +1 | +2 | +3 (+ 30min head start) |
| Team accounts | 1 | 2 | 5 | Unlimited |
| Bulk CSV upload | ❌ | ✅ | ✅ | ✅ |
| Dedicated support | ❌ | ❌ | ❌ | ✅ |

---

# 12. ADMIN PANEL

## 12.1 Admin Dashboard Metrics

- Total users (buyers, sellers, dealers)
- New registrations (today, this week, this month)
- Active listings count
- Total inquiries (today, this week)
- Pending dealer applications
- Flagged/reported listings
- Revenue (lead fees, subscriptions, featured)
- Top performing dealers
- Platform health (uptime, error rate, page speed)

## 12.2 Admin Workflows

| Workflow | Description |
|---|---|
| **Dealer Approval** | Review application → check trade license → approve/reject → notify dealer |
| **Listing Moderation** | View reported listings → review → remove/warn dealer → notify reporter |
| **Review Moderation** | View pending reviews → approve/reject → notify parties |
| **Content Publishing** | Create/edit blog posts & reviews in CMS → preview → publish |
| **Featured Management** | Select listings/dealers for homepage promotion |
| **Make/Model Database** | Add new car makes and models as they become available |
| **Exchange Rate Update** | Update USD/LBP rate for currency conversion |

---

# 13. SEARCH & DISCOVERY

## 13.1 Search Engine (Meilisearch)

### Indexed Documents
- Car listings (make, model, year, trim, description, location, price)
- Dealers (name, description, location, brands)
- Car reviews (title, content, make, model)
- Blog posts (title, content, tags)

### Search Features
- **Instant search** — Results appear as user types (< 50ms response)
- **Typo-tolerant** — "toyata" finds "Toyota"
- **Arabic support** — Full Arabic text search and tokenization
- **Faceted search** — Filter counts update in real-time per filter
- **Synonyms** — "SUV" = "4x4" = "crossover"; "automatic" = "auto" = "أوتوماتيك"
- **Geo search** — Sort/filter by distance from user's region

### Filter Configuration
```
Filterable attributes:
  - condition (new, used, certified)
  - source (local, imported, salvage)
  - make, model, year
  - body_type
  - fuel_type
  - transmission
  - price_usd (range)
  - mileage_km (range)
  - location_region
  - color_exterior
  - is_featured

Sortable attributes:
  - price_usd (asc/desc)
  - created_at (desc)
  - mileage_km (asc)
  - views_count (desc)
```

## 13.2 Recommendation Engine

| Feature | Logic |
|---|---|
| **Similar cars** | Same make + similar price range + same body type |
| **Recently viewed** | Client-side localStorage + server-side for logged-in users |
| **Price drop alerts** | Track price changes on saved cars, notify user |
| **Search alerts** | Match new listings against saved filter combinations |
| **"You might like"** | Based on browsing history: same body type, similar price range |

---

# 14. CONTENT ENGINE — REVIEWS, BLOG, GUIDES

## 14.1 Content Architecture

### Car Review Hub Structure (Per Model)

Each car model gets a **mini-site** with 6-7 sub-pages:

```
/toyota/corolla/           → Overview (pillar page) — verdict, pros/cons, quick specs, CTA
/toyota/corolla/review/    → Full editorial review (detailed writeup + video)
/toyota/corolla/interior/  → Interior review (photos, materials, tech)
/toyota/corolla/specs/     → Full specifications table
/toyota/corolla/colours/   → Available colors with images
/toyota/corolla/prices/    → Price guide, current deals, price history
/toyota/corolla/new/       → Link to new listings on marketplace
/toyota/corolla/used/      → Link to used listings on marketplace
```

This hub ranks for dozens of keywords per model:
- "toyota corolla" (brand keyword)
- "toyota corolla review" (review intent)
- "toyota corolla interior" (feature intent)
- "toyota corolla colours" (shopping intent)
- "toyota corolla price lebanon" (buying intent)

### Blog Categories

| Category | Example Topics |
|---|---|
| Buying Guides | How to choose your first car, new vs used, what to check |
| Import & Customs | How to import from USA, customs duty breakdown, Copart guide |
| Finance & Insurance | Car loan guide, insurance comparison, bank rates |
| Market News | New model launches, price trends, industry updates |
| Maintenance | Oil change schedules, tire guides, summer/winter prep |
| Market Analysis | Average prices by make, most popular cars, depreciation rates |

### Roundup & Comparison Content

- "Best SUVs Under $25,000 in Lebanon 2026"
- "Best Family Cars for Lebanese Roads"
- "Toyota RAV4 vs Kia Sportage: Which Should You Buy?"
- "10 Most Fuel-Efficient Cars in Lebanon"
- "Safest Cars Available in Lebanon 2026"

## 14.2 Content Production Roadmap

### Months 1-2: Foundation (40 pieces)
- 15 car review hubs (top sellers: Corolla, Camry, RAV4, Sportage, Tucson, Civic, CR-V, X-Trail, Elantra, Creta, Fortuner, Hilux, Prado, Outlander, MG ZS)
- 10 buying guides
- 10 blog posts (market news, tips)
- 5 tool/calculator pages

### Months 3-4: Growth (60 pieces)
- 20 more car review hubs
- 15 comparison articles
- 10 roundup articles ("Best SUVs Under $25K in Lebanon")
- 10 guides (customs, salvage titles, inspection)
- 5 region-specific guides ("Best Dealers in Beirut")

### Months 5-6: Authority (80 pieces)
- 30 more car review hubs (covering all major models)
- 20 long-tail blog posts
- 15 video scripts + YouTube uploads
- 10 comparison/roundup articles
- 5 data-driven articles ("Average Car Prices in Lebanon 2026")

### Ongoing Monthly Targets
- 4 new car reviews
- 8 blog posts
- 4 YouTube videos
- 2 comparison articles
- 2 tool/calculator updates
- 1 market report

---

# 15. INTERACTIVE TOOLS

## 15.1 Import Cost Calculator (Lebanon-Specific Killer Feature)

```
INPUT:
- Car origin country (USA, Gulf, Europe, Asia)
- Car value (USD)
- Car year
- Engine size
- Fuel type
- Condition (new, used, salvage)

OUTPUT:
- Customs duty (% based on engine size and age)
- VAT
- Registration fees
- Inspection fees
- Shipping estimate (by origin)
- Total landed cost in Lebanon
- Comparison: import vs buy locally
```

## 15.2 Car Loan Calculator

```
INPUT:
- Car price (USD)
- Down payment ($)
- Loan term (years)
- Interest rate (%) — pre-populated with Lebanese bank rates

OUTPUT:
- Monthly payment
- Total interest paid
- Total cost of ownership
- Amortization table
- Comparison across different terms
```

## 15.3 Car Valuation Estimator

```
INPUT:
- Make, model, year
- Mileage (km)
- Condition (excellent, good, fair, poor)
- Source (local, imported, salvage)
- Region

OUTPUT:
- Estimated market value range (low / mid / high)
- Price trend (up/down/stable)
- "Based on X similar cars on our platform"
- CTA: "List your car" or "Browse similar cars"
```

## 15.4 Fuel Cost Calculator

```
INPUT:
- Car model (or manual km/L entry)
- Daily commute distance (km)
- Current fuel price (auto-fetched or manual)
- Fuel type (gasoline 95, 98, diesel)

OUTPUT:
- Monthly fuel cost (USD)
- Yearly fuel cost (USD)
- Comparison vs other fuel types
- Comparison vs electric (estimated)
```

## 15.5 Side-by-Side Comparison Tool

```
- Select 2-3 cars (from listings or review database)
- Side-by-side table: specs, features, price, rating
- Highlight differences (green = winner per category)
- CTA: "View Deals" per car
```

---

# 16. SEO STRATEGY

## 16.1 Technical SEO Checklist

- [ ] Dynamic meta tags per page (title, description, OG image)
- [ ] JSON-LD structured data:
  - `Vehicle` schema for car listings (price, availability, make, model)
  - `AutoDealer` schema for dealer profiles
  - `Review` schema for editorial reviews (rating)
  - `Article` schema for blog posts
  - `BreadcrumbList` schema for navigation
  - `FAQPage` schema for guide pages
- [ ] XML sitemaps (auto-generated, split by type: listings, reviews, blog, dealers)
- [ ] robots.txt (allow all public pages, block dashboard/admin)
- [ ] Canonical URLs (prevent duplicate content across filter combinations)
- [ ] Hreflang tags (ar-LB, en-LB) for bilingual pages
- [ ] Breadcrumb navigation (with schema markup)
- [ ] Clean URL structure (no query params for primary pages)
- [ ] Page speed target: < 2s LCP
- [ ] Image optimization: WebP, lazy loading, srcset responsive
- [ ] Mobile-first responsive (Google mobile-first indexing)
- [ ] Core Web Vitals optimization (LCP, FID, CLS)
- [ ] Internal linking (every page links to related pages in all directions)
- [ ] 404 page with search and popular links
- [ ] 301 redirects for any URL changes

## 16.2 Keyword Strategy

### High-Volume Arabic Keywords
| Keyword | Translation | Monthly Volume (est.) |
|---|---|---|
| سيارات للبيع في لبنان | cars for sale in Lebanon | 10K+ |
| اسعار السيارات في لبنان | car prices in Lebanon | 8K+ |
| سيارات مستعملة لبنان | used cars Lebanon | 5K+ |
| افضل سيارة عائلية | best family car | 3K+ |
| سيارات كهربائية | electric cars | 3K+ |
| شراء سيارة لبنان | buy car Lebanon | 2K+ |

### High-Volume English Keywords
| Keyword | Monthly Volume (est.) |
|---|---|
| cars for sale Lebanon | 5K+ |
| buy car Lebanon | 3K+ |
| used cars Beirut | 2K+ |
| best cars Lebanon 2026 | 1K+ |
| car loan Lebanon | 1K+ |
| import car Lebanon | 2K+ |

### Long-Tail Content Opportunities (Huge Search Demand)
| Keyword | Content Type |
|---|---|
| how to import a car to Lebanon | Guide |
| customs duty calculator Lebanon cars | Tool |
| best fuel-efficient cars for Lebanon | Roundup |
| car insurance Lebanon comparison | Guide |
| sell my car Lebanon best price | Landing page |
| Copart cars Lebanon | Guide + Import tool |
| Lebanon car prices 2026 | Data article |
| best dealers in Beirut | Directory page |

## 16.3 On-Page SEO Templates

### Car Listing Page
```
Title: {Year} {Make} {Model} {Trim} for Sale — ${Price} | [BrandName]
Description: Buy a {year} {make} {model} in {city}, Lebanon. {mileage}km, {fuel_type}, {transmission}. Contact verified dealer. ${price}.
```

### Model Review Hub
```
Title: {Make} {Model} Review {Year} — Price, Specs & Deals | [BrandName]
Description: Read our full {make} {model} review. Interior, performance, specs, colours, and the best deals in Lebanon. Rating: {rating}/10.
```

### Blog Post
```
Title: {Post Title} | [BrandName]
Description: {Excerpt — 150 chars}
```

### Brand Hub
```
Title: {Make} Cars for Sale in Lebanon — New & Used | [BrandName]
Description: Browse {make} cars for sale in Lebanon. New and used {make} listings from verified dealers. Compare prices and get the best deal.
```

---

# 17. INTERNATIONALIZATION (i18n) & RTL

## 17.1 Language Support

| Aspect | Implementation |
|---|---|
| **Framework** | `next-intl` for translations, route-based locale |
| **Languages** | Arabic (primary), English (secondary) |
| **URL strategy** | `/ar/` prefix for Arabic, `/en/` for English, default = Arabic |
| **Storage** | Language preference in cookie + user profile |
| **Toggle** | Persistent toggle in top nav, instant switch |

## 17.2 RTL Implementation

| Element | LTR (English) | RTL (Arabic) |
|---|---|---|
| Text direction | left-to-right | right-to-left |
| Layout mirroring | Normal | Mirrored (sidebar swaps, alignment flips) |
| Navigation | Left-aligned logo, right-aligned menu | Right-aligned logo, left-aligned menu |
| Icons | Normal | Direction-sensitive icons mirrored (arrows, etc.) |
| Numbers | Western numerals | Western numerals (standard in Lebanese Arabic) |
| Currency | $24,500 | $24,500 (same format, Arabic context) |

### Tailwind RTL Setup
```css
/* Use logical properties */
margin-inline-start instead of margin-left
padding-inline-end instead of padding-right
/* Or use Tailwind RTL plugin */
dir="rtl" on <html> + rtl: variant
```

## 17.3 Bilingual Content

| Content Type | Strategy |
|---|---|
| UI strings | Translation files (JSON) — all UI text in both languages |
| Car listings | Dealer enters in one language; auto-translate optional |
| Reviews | Written in both languages by editorial team |
| Blog posts | Written in both languages (or auto-translate + human review) |
| SEO metadata | Separate title/description per language |
| URL slugs | English slugs for both (Arabic slugs cause encoding issues) |
| Car makes/models | Store both `name_en` and `name_ar` |

## 17.4 Currency & Formatting

| Data | Format |
|---|---|
| **Price USD** | $24,500 (comma thousands separator) |
| **Price LBP** | 2,205,000,000 ل.ل (with Arabic label) |
| **Exchange rate** | Fetched daily, admin-configurable override |
| **Dates** | Gregorian (with Hijri option for formality) |
| **Phone numbers** | +961 XX XXX XXX (Lebanese format) |

---

# 18. NOTIFICATIONS & MESSAGING

## 18.1 Notification Types

| Event | Channels | Recipient |
|---|---|---|
| New inquiry on listing | In-app, WhatsApp, Email | Dealer |
| New offer on configuration | In-app, WhatsApp, Email | Buyer |
| New bid on sell listing | In-app, WhatsApp | Seller |
| Offer accepted/rejected | In-app, WhatsApp | Dealer |
| Bid won (auction) | In-app, WhatsApp, Email | Dealer |
| Price drop on saved car | In-app, Email | Buyer |
| New listing matches search alert | In-app, Email | Buyer |
| Dealer review received | In-app, Email | Dealer |
| Dealer application approved | In-app, Email | Dealer |
| Listing about to expire (3 days) | In-app, Email | Dealer |

## 18.2 WhatsApp Integration

- **WhatsApp Business API** for dealer notifications
- **Deep link buttons** on every listing: `https://wa.me/961XXXXXXXX?text=...`
- Pre-filled messages include car details: "Hi, I'm interested in the {year} {make} {model} listed at ${price} on [BrandName]. Ref: {listing_id}"
- Click-to-WhatsApp is the **primary CTA** on all listing and dealer cards

## 18.3 In-App Messaging

- Real-time chat between buyer and dealer (within the platform)
- Message thread per inquiry
- Supports text + image attachments
- Read receipts
- Quick-reply templates for dealers
- Fallback: if dealer doesn't respond in-app within 24h, prompt buyer to use WhatsApp

---

# 19. MONETIZATION & REVENUE MODEL

## 19.1 Revenue Streams (Detailed)

### Stream 1: Dealer Lead Fee (Core Revenue)
- Dealer pays $5-15 per qualified inquiry
- "Qualified" = buyer sends message, calls, or WhatsApps through platform
- Charged when inquiry status changes from "new" to "viewed" or "responded"
- Tracked via platform-generated contact links

### Stream 2: Featured Listings
- Dealers pay to boost a listing to homepage/top of search results
- Pricing: $5-20 per listing per week
- Visually marked as "Featured" or "Promoted"
- Limited slots per region to maintain value

### Stream 3: Dealer Subscriptions
| Tier | Price | Listings | Features |
|---|---|---|---|
| Free | $0 | 5 | Basic profile, basic analytics |
| Bronze | $49/mo | 25 | Reverse marketplace, sell auctions, standard analytics |
| Silver | $99/mo | 75 | Featured placement (3/mo), advanced analytics, team (5) |
| Gold | $199/mo | Unlimited | Unlimited featured, premium analytics, priority matching |

### Stream 4: Sell My Car Buyer Fee
- Winning dealer pays $50-150 per car acquired via auction
- Fee based on car value (percentage or tiered flat fee)

### Stream 5: Finance/Insurance Referrals (Phase 3+)
- Referral fee when buyer completes a car loan or insurance through partner
- Estimated $50-200 per completed referral

### Stream 6: Advertising (Phase 4+)
- Display ads on high-traffic content pages
- OEM-sponsored reviews or placements
- Banner ads on search results

### Stream 7: Data Products (Phase 4+)
- Market reports sold to dealers, banks, insurance companies
- Pricing: $50-200 per report
- Data: average prices by make/model, demand trends, regional insights

## 19.2 Revenue Projections

| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|---|---|---|---|---|
| Active Dealers | 20 | 75 | 200 | 500 |
| Listings | 200 | 1,000 | 5,000 | 15,000 |
| Monthly Inquiries | 100 | 750 | 3,000 | 15,000 |
| Revenue | $0 (free period) | $500 | $3,000 | $15,000 |

---

# 20. PERFORMANCE, SECURITY & INFRASTRUCTURE

## 20.1 Performance Targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.0s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTFB (Time to First Byte) | < 200ms |
| Search API response | < 50ms |
| Image loading | Lazy load below fold, WebP, srcset |
| Bundle size | < 200KB initial JS |

### Optimization Strategy
- Next.js App Router with RSC (minimal client JS)
- Image optimization pipeline (Sharp → WebP → Cloudflare CDN)
- Meilisearch for instant search (not database queries)
- Redis caching for hot queries (popular makes/models, featured listings)
- Edge caching via Cloudflare (static pages, API responses)
- Database query optimization (proper indexes, query analysis)
- Lazy loading for below-fold components
- Code splitting per route

## 20.2 Security

| Concern | Solution |
|---|---|
| **Authentication** | NextAuth.js with JWT + refresh tokens, bcrypt password hashing |
| **Authorization** | Role-based access control (buyer, dealer, admin) |
| **Input validation** | Zod schemas on all API inputs (tRPC built-in) |
| **SQL injection** | Prisma ORM (parameterized queries) |
| **XSS** | React auto-escaping + CSP headers |
| **CSRF** | SameSite cookies + CSRF tokens |
| **Rate limiting** | API rate limiting per IP and per user |
| **File uploads** | Type validation, size limits, virus scanning |
| **DDoS** | Cloudflare protection |
| **Secrets** | Environment variables, never in code |
| **HTTPS** | Enforced everywhere via Cloudflare |
| **Data privacy** | User data deletion on request, minimal data collection |

## 20.3 Infrastructure Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLOUDFLARE                         │
│              (CDN + DDoS + Edge Cache)                │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────┐    ┌─────────────────────────────┐  │
│  │   VERCEL    │    │    DIGITALOCEAN / AWS        │  │
│  │  (Frontend) │    │       (Backend)              │  │
│  │             │    │                              │  │
│  │  Next.js    │───→│  ┌──────────┐  ┌─────────┐ │  │
│  │  App        │    │  │PostgreSQL│  │Meilisearch│ │  │
│  │  (SSR/RSC)  │    │  │ Database │  │ (Search) │ │  │
│  │             │    │  └──────────┘  └─────────┘ │  │
│  └─────────────┘    │  ┌──────────┐  ┌─────────┐ │  │
│                      │  │  Redis   │  │ Payload │ │  │
│                      │  │ (Cache)  │  │  CMS    │ │  │
│                      │  └──────────┘  └─────────┘ │  │
│                      └─────────────────────────────┘  │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Cloudflare   │  │    Twilio     │  │   Resend   │ │
│  │ R2 (Images)  │  │  (SMS/OTP)   │  │  (Email)   │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Sentry      │  │  GA4 +       │  │  GitHub    │ │
│  │ (Errors)     │  │  Mixpanel    │  │  Actions   │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────┘
```

## 20.4 Monitoring & Alerting

| Tool | Purpose |
|---|---|
| Sentry | Error tracking + performance monitoring |
| Vercel Analytics | Frontend performance, Core Web Vitals |
| DigitalOcean Monitoring | Server health, CPU, memory, disk |
| UptimeRobot (or Better Uptime) | Uptime monitoring + alerting |
| Cloudflare Analytics | CDN performance, traffic, threats |

---

# 21. MOBILE STRATEGY (PWA & NATIVE)

## 21.1 Phase 1-3: Progressive Web App (PWA)

- Installable on home screen ("Add to Home Screen" prompt)
- Offline-capable car detail pages (cached)
- App-like bottom navigation bar
- Swipe gestures for photo galleries
- Pull-to-refresh
- Mobile-optimized photo upload (camera access, compression)
- Push notifications (web push)
- Fast, lightweight, no app store required

## 21.2 Phase 5: Native Mobile App

- **Framework:** React Native (or Flutter)
- **Core features:** Search, listings, saved, messaging, notifications, sell-my-car
- Camera integration for listing photos
- Push notifications (Firebase Cloud Messaging)
- Biometric login (fingerprint / face)
- App Store + Play Store submission
- Deep linking (web <-> app)
- Target: 50,000 downloads by month 12

---

# 22. AI & ADVANCED FEATURES (Phase 5)

| Feature | Description |
|---|---|
| **AI Car Recommender** | Chatbot that recommends cars based on needs + budget ("I need a family car under $20K") |
| **AI Listing Generator** | Auto-generate car descriptions from uploaded photos (for dealers) |
| **Image Recognition** | Auto-detect make/model from photos (fill form automatically) |
| **Price Prediction** | ML model predicting depreciation curves for Lebanese market |
| **Demand Forecasting** | Help dealers stock cars that are trending in demand |
| **Smart Pricing** | Suggest optimal pricing for sellers based on market data |
| **Photo Quality Detection** | Reject blurry/dark photos, suggest better angles |

---

# 23. LAUNCH STRATEGY

## 23.1 Pre-Launch (4 Weeks Before)

- [ ] Recruit 15-20 founding dealers (offer 6 months free)
- [ ] Seed 200+ car listings from founding dealers
- [ ] Publish 20+ content pieces (reviews + guides + 5 tool pages)
- [ ] Set up social media: Instagram, Facebook, TikTok, YouTube
- [ ] Teaser campaign on Instagram: "Something new is coming to Lebanese car buying"
- [ ] Build email + WhatsApp waiting list
- [ ] Beta test with 50 invite-only users
- [ ] Submit to Google Search Console, request indexing

## 23.2 Launch Week

- [ ] Soft launch: invite-only for first 48 hours
- [ ] Public launch with PR push
- [ ] Instagram campaign (reels, stories, influencer partnerships)
- [ ] Lebanese car Instagram accounts partnerships
- [ ] WhatsApp broadcast to waiting list
- [ ] Facebook/Instagram ads targeting car buyers in Lebanon
- [ ] Google Ads on high-intent keywords ("cars for sale Lebanon", "buy car Beirut")

## 23.3 Post-Launch (First 90 Days)

- [ ] **Weekly:** Monitor analytics, fix bugs, gather user feedback
- [ ] **Bi-weekly:** New feature release
- [ ] **Monthly:** Market report / content milestone
- [ ] **Ongoing:** Dealer onboarding (target: 100 dealers by month 3)
- [ ] **Ongoing:** Content production (follow SEO roadmap)
- [ ] **Ongoing:** Community building on social media

## 23.4 Regional Expansion Path (Phase 5)

1. Jordan
2. Iraq
3. Kuwait (large Lebanese diaspora)
4. UAE (Lebanese expat market)
5. Syria (when market recovers)

---

# 24. KPIs & SUCCESS METRICS

| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|---|---|---|---|---|
| **Active Dealers** | 20 | 75 | 200 | 500 |
| **Car Listings** | 200 | 1,000 | 5,000 | 15,000 |
| **Monthly Visits** | 5,000 | 25,000 | 100,000 | 500,000 |
| **Monthly Inquiries** | 100 | 750 | 3,000 | 15,000 |
| **Organic Traffic** | 500 | 5,000 | 30,000 | 150,000 |
| **Content Pieces** | 40 | 100 | 200 | 400 |
| **App Downloads (PWA)** | — | — | 5,000 | 50,000 |
| **Monthly Revenue** | $0 | $500 | $3,000 | $15,000 |
| **Avg. Inquiry Response Time** | — | < 4hrs | < 2hrs | < 1hr |
| **Dealer Satisfaction (NPS)** | — | 30+ | 50+ | 60+ |
| **Buyer Satisfaction (NPS)** | — | 40+ | 50+ | 60+ |

---

# 25. DEVELOPMENT PHASES & TIMELINE

## Phase 0: Foundation & Planning — Weeks 1-3

**Deliverables:**
- [ ] Domain registered
- [ ] GitHub monorepo set up
- [ ] Tech stack configured (Next.js, Prisma, PostgreSQL, Meilisearch, Tailwind)
- [ ] CI/CD pipeline (GitHub Actions → Vercel)
- [ ] Dev, staging, production environments
- [ ] Error monitoring (Sentry)
- [ ] Analytics (GA4 + Mixpanel)
- [ ] Database schema designed and migrated
- [ ] Auth system working (email/password, Google, phone OTP)
- [ ] Design system + component library started (shadcn/ui + custom)
- [ ] i18n framework set up (next-intl, AR/EN)
- [ ] Market research complete (dealer list, top models, competitor audit)

## Phase 1: Core Platform MVP — Weeks 4-10

**Deliverables:**
- [ ] Homepage (hero search, browse by make/type/region, trust bar, featured)
- [ ] Search/listings page (filters, sorting, pagination, map view)
- [ ] Car detail page (gallery, specs, price, dealer info, contact CTAs)
- [ ] Dealer registration + admin approval workflow
- [ ] Dealer dashboard (add/edit listings, view inquiries, basic metrics)
- [ ] Dealer profile page (listings, reviews, contact)
- [ ] User registration + login
- [ ] User dashboard (saved cars, inquiries)
- [ ] Inquiry system (buyer → dealer messaging, WhatsApp, call)
- [ ] Admin panel (users, dealers, listings, moderation)
- [ ] SEO foundation (meta tags, JSON-LD, sitemaps, canonical, hreflang)
- [ ] Full RTL Arabic support
- [ ] Currency display (USD + LBP)
- [ ] Mobile-responsive design (all pages)
- [ ] 5-10 car review content hubs
- [ ] 20+ blog/guide articles for initial SEO

**MVP Launch: End of Week 10**

## Phase 2: Reverse Marketplace & Content Engine — Weeks 11-18

**Deliverables:**
- [ ] "Get Offers" flow (buyer configures → dealers bid → comparison dashboard)
- [ ] Dealer matching algorithm
- [ ] Dealer offer submission and tracking
- [ ] Offer comparison dashboard with badges
- [ ] Dealer rating & review system (post-purchase reviews)
- [ ] Car review content hubs (full sub-pages: interior, specs, colours, prices)
- [ ] Review index + roundup articles + comparisons
- [ ] Blog CMS integration (Payload CMS)
- [ ] Blog categories, author profiles, related posts
- [ ] Interactive tools:
  - Import cost calculator
  - Car loan calculator
  - Car valuation estimator
  - Fuel cost calculator
  - Side-by-side comparison tool
- [ ] Notification system (in-app, email, WhatsApp)
- [ ] Search alerts (saved searches with notifications)
- [ ] 35 car review hubs total
- [ ] 50+ additional content pieces

## Phase 3: Sell My Car & Advanced Features — Weeks 19-26

**Deliverables:**
- [ ] "Sell My Car" landing page + multi-step form
- [ ] Guided photo upload with angle templates
- [ ] Car valuation tool (instant estimate)
- [ ] Dealer auction/bidding system for sell listings
- [ ] Seller dashboard (view bids, accept, track)
- [ ] Dealer subscription system (free/bronze/silver/gold)
- [ ] Payment processing (Stripe or local gateway)
- [ ] Dealer analytics dashboard (premium features by tier)
- [ ] Advanced search (AI recommendations, price drop alerts)
- [ ] Finance & insurance hub (bank partners, comparison)
- [ ] PWA enhancements (installable, offline, push notifications)
- [ ] Team accounts for dealers (multi-user)
- [ ] Bulk CSV listing import for dealers
- [ ] 65 car review hubs total
- [ ] 100+ total content pieces

## Phase 4: Community, Scale & Monetization — Weeks 27-36

**Deliverables:**
- [ ] Community features (forums, Q&A, user car reviews)
- [ ] YouTube channel launch (Arabic car reviews, comparisons)
- [ ] Video embeds in review pages
- [ ] Advanced monetization (display ads, sponsored content, data licensing)
- [ ] Inspection/certification partnerships
- [ ] **Import Tracking Feature** (track Copart/IAAI purchases, shipping status, customs clearance)
- [ ] Performance scaling (Redis cache, read replicas, load testing)
- [ ] API rate limiting
- [ ] Monitoring & alerting (Grafana, uptime checks)
- [ ] 200+ total content pieces

## Phase 5: Native App & Regional Expansion — Weeks 37-52

**Deliverables:**
- [ ] React Native / Flutter mobile app
- [ ] Push notifications (Firebase)
- [ ] Biometric login
- [ ] App Store + Play Store launch
- [ ] AI features (car recommender, listing generator, image recognition, price prediction)
- [ ] Multi-country support in DB schema
- [ ] Regional expansion prep (Jordan, Iraq, Kuwait, UAE)
- [ ] 400+ total content pieces

## Summary Timeline

| Phase | Duration | What You Have |
|---|---|---|
| Phase 0: Foundation | Weeks 1-3 | Tech stack, DB, auth, design system, research |
| Phase 1: MVP | Weeks 4-10 | Working marketplace with search, listings, dealers, inquiries |
| Phase 2: Reverse Marketplace + Content | Weeks 11-18 | "Dealers compete for you" + reviews + blog + tools |
| Phase 3: Sell My Car + Advanced | Weeks 19-26 | Sell feature, subscriptions, finance hub, PWA |
| Phase 4: Community + Scale | Weeks 27-36 | Forums, video, monetization, import tracking |
| Phase 5: Mobile App + Regional | Weeks 37-52 | Native apps, AI features, expansion |

**Total: ~12 months to full platform**
**MVP launch: ~10 weeks from start**

---

*This is your complete A-Z master plan. Every page, component, API endpoint, database table, and milestone is documented. Start with Phase 0 and work through each phase sequentially. Each checkbox is a trackable task.*
