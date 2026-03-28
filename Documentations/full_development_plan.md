# Full Development Plan — Lebanese Car Marketplace
## "CarWow for Lebanon" — Complete Build Phases

---

# PART 1: DESIGN & BRAND IDENTITY

## Why You Should NOT Copy CarWow's Design

Copying their exact design creates three risks:

**Legal:** CarWow's specific combination of layout, color palette, typography, and UI patterns constitutes "trade dress." Even across borders, if they ever expand to MENA (they're already in Germany and Spain), you'd face takedown requests or lawsuits. Their brand assets are trademarked.

**Practical:** Their design solves for UK users — English-only, left-to-right, GBP currency, DVLA integration. Your platform needs RTL Arabic, dual currency (USD/LBP), WhatsApp integration, and mobile-first design for a Lebanese audience that behaves differently online.

**Strategic:** If you look like a knockoff, you lose trust. Lebanese consumers are savvy — they'll Google CarWow, see it's a copy, and lose confidence. Having your own identity makes you a "local original" not a "foreign clone."

## What You CAN Take From CarWow

| Copy This (Legal) | Don't Copy This (Risky) |
|---|---|
| Page structure & information architecture | Their exact colors (#hex values) |
| User flow patterns (configure → compare → contact) | Their logo or brand mark |
| Feature set (what tools/pages exist) | Their specific illustrations/icons |
| Content hub approach for reviews | Their exact layout pixel-for-pixel |
| Reverse marketplace business model | Their copywriting/tone of voice |
| SEO URL structure patterns | Their specific component designs |

## Recommended Brand Direction

### Name Ideas (Pick one that has .com available)
- **Sayarti** (سيارتي — "My Car") — Personal, warm, Arabic-native
- **Dalalni** (دلّلني — "Guide me / Hook me up") — Colloquial Lebanese, memorable
- **CarSouk** — Bilingual, "souk" is universally understood, marketplace feel
- **Mashini** (ماشيني — plays on "mashi" / car) — Fun, modern
- **Siyarat.com** — Direct, Arabic for "cars"

### Color Palette (Your Own)

**Primary:** Deep Teal `#0A7E8C` — Trust, modernity, stands out from red/blue competitors
**Secondary:** Warm Amber `#F59E0B` — Energy, deals, CTAs, Middle Eastern warmth
**Dark:** Charcoal `#1A1A2E` — Text, headers, dark mode base
**Light:** Off-White `#F8F9FA` — Backgrounds, clean feel
**Success:** Emerald `#10B981` — Good deals, confirmations
**Error:** Coral `#EF4444` — Warnings, errors
**Accent:** Soft Sky `#E0F2FE` — Cards, subtle backgrounds

### Typography
- **Headlines:** "IBM Plex Sans Arabic" (supports Arabic + English beautifully)
- **Body:** "Noto Sans Arabic" / "Noto Sans" (Google font, free, excellent RTL)
- **Numbers/Prices:** "DM Sans" or "Space Mono" (makes prices pop)

### Design Principles
1. **Mobile-first** — 80%+ of Lebanese internet traffic is mobile
2. **Bilingual by default** — Arabic primary, English secondary, seamless toggle
3. **WhatsApp-native** — Every dealer contact point includes WhatsApp
4. **Price transparency** — Big, bold pricing in USD (with LBP toggle)
5. **Trust signals everywhere** — Ratings, verification badges, photo requirements
6. **Fast & lightweight** — Lebanese internet can be slow; optimize aggressively

---

# PART 2: COMPLETE DEVELOPMENT PHASES

---

## PHASE 0: Foundation & Planning (Weeks 1-3)

### 0.1 Project Setup
- [ ] Register domain name (.com)
- [ ] Set up GitHub repository (monorepo recommended)
- [ ] Set up project management (Linear, Notion, or GitHub Projects)
- [ ] Choose and configure hosting (Vercel + DigitalOcean/AWS)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure development, staging, and production environments
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (GA4 + Mixpanel)

### 0.2 Tech Stack Setup
```
Frontend:       Next.js 14+ (App Router, RSC)
Language:       TypeScript (entire stack)
Styling:        Tailwind CSS + shadcn/ui components
State:          Zustand (client) + React Query (server)
Backend:        Next.js API Routes + tRPC (or separate NestJS if preferred)
Database:       PostgreSQL (via Supabase or self-hosted)
ORM:            Prisma
Search:         Meilisearch (fast, lightweight, Arabic support)
Auth:           NextAuth.js v5 (or Clerk)
File Storage:   Cloudflare R2 or AWS S3
CDN:            Cloudflare
Email:          Resend or SendGrid
SMS:            Twilio (for OTP verification)
CMS:            Payload CMS (headless, self-hosted) for blog/reviews
i18n:           next-intl (Arabic + English)
Maps:           Google Maps API (dealer locations)
Payments:       Stripe (when available) or manual invoicing initially
Testing:        Vitest + Playwright (e2e)
```

### 0.3 Database Schema Design (Core Tables)

```
users
├── id, email, phone, name, role (buyer|seller|dealer|admin)
├── location (region, city), language_pref
├── created_at, updated_at, last_login

dealers
├── id, user_id (FK), company_name, trade_license
├── logo, cover_image, description
├── address, region, city, lat, lng
├── phone, whatsapp_number, email, website
├── is_verified, is_featured, subscription_tier
├── rating_avg, review_count
├── created_at, status (pending|active|suspended)

cars (listings — both new and used)
├── id, dealer_id (FK), status (draft|active|sold|expired)
├── condition (new|used|certified_preowned)
├── make, model, year, trim, body_type
├── mileage_km, fuel_type, transmission, drivetrain
├── engine_size, horsepower, color_exterior, color_interior
├── features (JSON array), description
├── price_usd, price_lbp, is_negotiable
├── source (local|imported|salvage)
├── images (JSON array of URLs), thumbnail
├── views_count, inquiries_count
├── location_region, location_city
├── created_at, updated_at, expires_at

inquiries (buyer → dealer lead)
├── id, car_id (FK), buyer_id (FK), dealer_id (FK)
├── message, preferred_contact (whatsapp|call|email)
├── status (new|viewed|responded|converted|closed)
├── created_at, responded_at

car_configurations (reverse marketplace — buyer specifies what they want)
├── id, buyer_id (FK)
├── make, model, year, trim, preferred_color
├── budget_min, budget_max, finance_preference
├── features_wanted (JSON), notes
├── location_region
├── status (open|matched|closed)
├── created_at, expires_at

dealer_offers (dealers bid on buyer configurations)
├── id, configuration_id (FK), dealer_id (FK)
├── price_offered, delivery_time_days
├── notes, included_extras
├── status (pending|accepted|rejected|expired)
├── created_at

reviews (buyer reviews dealer)
├── id, dealer_id (FK), buyer_id (FK), inquiry_id (FK)
├── rating (1-5), title, body
├── is_verified_purchase
├── created_at

car_reviews (editorial content)
├── id, slug, make, model, year
├── title_en, title_ar, content_en, content_ar
├── pros (JSON), cons (JSON), verdict
├── rating_overall, rating_value, rating_interior, rating_performance
├── author_id, featured_image, gallery (JSON)
├── seo_title, seo_description, seo_keywords
├── status (draft|published), published_at
├── views_count

blog_posts
├── id, slug, title_en, title_ar
├── content_en, content_ar, excerpt_en, excerpt_ar
├── category, tags (JSON array)
├── author_id, featured_image
├── seo_title, seo_description
├── status (draft|published), published_at

saved_cars (wishlist)
├── id, user_id (FK), car_id (FK), created_at

search_alerts
├── id, user_id (FK), filters (JSON)
├── frequency (instant|daily|weekly)
├── is_active, created_at

admin_logs
├── id, admin_id, action, target_type, target_id
├── details (JSON), created_at
```

### 0.4 Market Research Deliverables
- [ ] List every car dealer in Lebanon (name, location, size, brands they carry)
- [ ] Map out regions: Beirut, Mount Lebanon, North, South, Bekaa, Nabatieh
- [ ] Identify top 20 target dealers for launch
- [ ] Research most-sold car brands/models in Lebanon
- [ ] Survey 20-30 car buyers about their pain points
- [ ] Document competitor features (OLX, Wheelers, Autotrader LB)

---

## PHASE 1: Core Platform MVP (Weeks 4-10)

### 1.1 Authentication & User System
- [ ] User registration (email + phone OTP)
- [ ] Login (email/password + Google OAuth + phone OTP)
- [ ] User roles: Buyer, Dealer, Admin
- [ ] Profile management (name, photo, location, preferences)
- [ ] Language preference (AR/EN) stored per user
- [ ] Password reset flow
- [ ] Session management with refresh tokens

### 1.2 Dealer Portal
- [ ] Dealer registration form (company info, trade license upload, location)
- [ ] Admin approval workflow for new dealers
- [ ] Dealer dashboard:
  - Listing management (add/edit/remove cars)
  - Inquiry inbox (view buyer messages, respond)
  - Performance metrics (views, inquiries, conversion)
  - Profile settings (logo, description, working hours)
- [ ] Dealer verification badge system (verified = admin-approved documents)
- [ ] Multi-user dealer accounts (owner + sales reps)

### 1.3 Car Listings System
- [ ] Add car listing form:
  - Make/Model/Year selector (hierarchical dropdown)
  - Specs entry (mileage, fuel, transmission, features)
  - Photo upload (multi-image, drag & drop, compression)
  - Photo guidelines overlay (what angles to photograph)
  - Price entry (USD primary, auto-convert LBP)
  - Location selector (region + city)
  - Condition: New / Used / Certified Pre-Owned
  - Source: Local / Imported / Salvage-Rebuilt
- [ ] Listing status management (draft → active → sold/expired)
- [ ] Auto-expiry after 60 days (renewable)
- [ ] Featured listing capability (paid placement)
- [ ] Bulk listing upload for dealers (CSV import)

### 1.4 Search & Discovery
- [ ] Main search page with filters:
  - Make, Model, Year range
  - Price range (USD)
  - Mileage range
  - Body type (sedan, SUV, hatchback, pickup, etc.)
  - Fuel type (gasoline, diesel, hybrid, electric)
  - Transmission (automatic, manual)
  - Location/Region
  - Condition (new, used, certified)
  - Source (local, imported, salvage)
  - Color
- [ ] Sort options: price low/high, newest, mileage, most popular
- [ ] Search results page with card grid layout
- [ ] Map view (see listings on a map)
- [ ] Save search / search alerts
- [ ] Recently viewed cars
- [ ] Similar cars recommendations

### 1.5 Car Detail Page
- [ ] Full image gallery with zoom/lightbox
- [ ] Specs table (all car details)
- [ ] Price display (USD + LBP toggle)
- [ ] Dealer info card (name, rating, location, verified badge)
- [ ] Contact buttons: WhatsApp (primary), Call, Message in-app
- [ ] "Make Offer" button (for negotiable listings)
- [ ] Similar cars carousel
- [ ] Share to social media / copy link
- [ ] Report listing button
- [ ] Save to wishlist

### 1.6 Inquiry & Messaging System
- [ ] In-app messaging between buyer and dealer
- [ ] WhatsApp deep link integration (pre-filled message with car details)
- [ ] Email notification for new inquiries
- [ ] SMS notification option for dealers
- [ ] Inquiry tracking (new → viewed → responded)
- [ ] Quick response templates for dealers

### 1.7 Homepage
- [ ] Hero section: Search bar with make/model/budget quick search
- [ ] "How it works" explainer section
- [ ] Featured/promoted listings carousel
- [ ] Browse by body type (visual category cards)
- [ ] Browse by brand (logo grid)
- [ ] Browse by region
- [ ] Latest listings feed
- [ ] Trust indicators (verified dealers count, total listings, happy buyers)
- [ ] App download prompt (for later phases)

### 1.8 Admin Panel
- [ ] Dashboard: key metrics (users, dealers, listings, inquiries)
- [ ] User management (view, edit, suspend, delete)
- [ ] Dealer approval queue
- [ ] Listing moderation queue (flagged/reported listings)
- [ ] Content management (blog posts, reviews)
- [ ] Featured listing management
- [ ] System settings (pricing, regions, car makes/models database)
- [ ] Analytics overview

### 1.9 SEO Foundation
- [ ] Dynamic meta tags per page (title, description, OG tags)
- [ ] Structured data (JSON-LD) for car listings (Vehicle schema)
- [ ] XML sitemap generation (auto-updated)
- [ ] robots.txt configuration
- [ ] Clean URL structure matching planned architecture:
  ```
  /                           → Homepage
  /cars/                      → All listings (search)
  /cars/[make]/               → Brand page
  /cars/[make]/[model]/       → Model page
  /cars/[make]/[model]/[id]   → Individual listing
  /dealers/                   → Dealer directory
  /dealers/[slug]             → Dealer profile
  /sell-my-car/               → Sell flow
  /reviews/                   → All reviews
  /reviews/[make]/[model]/    → Car review hub
  /blog/                      → Blog listing
  /blog/[slug]                → Blog post
  /guides/                    → Guides hub
  /guides/[slug]              → Individual guide
  /tools/[tool-name]          → Calculator/tool
  ```
- [ ] Canonical URLs
- [ ] Hreflang tags (ar/en)
- [ ] Breadcrumb navigation (with schema)
- [ ] Internal linking strategy implementation
- [ ] Page speed optimization (target < 2s LCP)
- [ ] Image optimization pipeline (WebP, lazy loading, srcset)

### 1.10 Internationalization (i18n)
- [ ] Full RTL support for Arabic
- [ ] Language toggle (persisted in cookie + user preference)
- [ ] All UI strings in translation files
- [ ] Arabic URL slugs for SEO
- [ ] Currency formatting (USD and LBP with proper separators)
- [ ] Date formatting (both Gregorian and Hijri option)
- [ ] Phone number formatting (Lebanese format)

---

## PHASE 2: Reverse Marketplace & Content Engine (Weeks 11-18)

### 2.1 Reverse Marketplace ("Dealers Compete For You")
This is the CarWow core feature — the key differentiator.

- [ ] "Get Offers" flow:
  1. Buyer selects: Make → Model → Year → Trim
  2. Buyer configures preferences (color, features, budget range)
  3. Buyer enters location + contact preference
  4. System matches with relevant dealers (by brand + location)
  5. Matched dealers get notification
  6. Dealers submit competing offers (price, delivery time, extras)
  7. Buyer sees offers in comparison dashboard
  8. Buyer contacts preferred dealer
- [ ] Buyer offer dashboard:
  - Side-by-side offer comparison
  - Dealer rating visible per offer
  - Sort by price, rating, delivery time
  - Accept/decline/message per offer
- [ ] Dealer side:
  - Incoming request notifications
  - Request details view
  - Submit offer form
  - Track offer status (pending/viewed/accepted/declined)
- [ ] Offer expiry system (offers valid for 7 days)
- [ ] Lead quality scoring (for dealer analytics)

### 2.2 Dealer Rating & Review System
- [ ] Post-purchase review flow (triggered after inquiry marked "converted")
- [ ] Rating categories: Price fairness, Communication, Honesty, Overall
- [ ] Text review with optional photos
- [ ] Verified purchase badge
- [ ] Dealer response to reviews
- [ ] Review moderation (admin approval)
- [ ] Aggregate ratings displayed on dealer profile + listing cards
- [ ] "Top Rated Dealers" badge for 4.5+ with 10+ reviews

### 2.3 Car Review Content Hubs (Editorial)
- [ ] Review hub page per car model:
  - Overview + verdict
  - Subpages: Interior, Exterior, Performance, Specs, Colors, Pricing
  - Pros & cons summary
  - Rating breakdown (visual)
  - Embedded video review (YouTube)
  - "View Deals" CTA linking to marketplace listings
  - Related reviews (similar cars)
  - User comments/discussion
- [ ] Review index pages:
  - By brand (/reviews/toyota/)
  - By type (/reviews/suv/, /reviews/electric/)
  - By year (/reviews/2026/)
- [ ] Author profiles for reviewers
- [ ] Review comparison tool (compare 2-3 car reviews side by side)

### 2.4 Blog & Guides CMS
- [ ] Blog listing page with categories:
  - Buying Guides
  - Selling Tips
  - Car News
  - Import & Customs
  - Finance & Insurance
  - Maintenance & Tips
  - Market Analysis
- [ ] Individual blog post template:
  - Featured image
  - Author + date
  - Table of contents (auto-generated)
  - Social share buttons
  - Related posts
  - CTA to marketplace
- [ ] Guide pages (longer-form, evergreen):
  - "How to Import a Car to Lebanon"
  - "Complete Guide to Car Insurance in Lebanon"
  - "Understanding Customs Duties on Cars"
  - "New vs Used: What's Better in Lebanon?"
  - "Best Cars for Lebanese Roads"
- [ ] SEO fields per post (custom title, description, keywords)
- [ ] RSS feed
- [ ] Newsletter signup integration

### 2.5 Interactive Tools
- [ ] **Import Cost Calculator**
  - Select car origin country, value, year
  - Calculate customs duty, VAT, registration fees
  - Show total landed cost in Lebanon
- [ ] **Car Loan Calculator**
  - Enter car price, down payment, loan term, interest rate
  - Show monthly payment, total interest, total cost
  - Pre-populated with Lebanese bank rates
- [ ] **Car Valuation Estimator**
  - Enter make, model, year, mileage, condition
  - Show estimated market value range
  - Based on platform data + market analysis
- [ ] **Fuel Cost Calculator**
  - Enter car model (or manual MPG), daily commute distance
  - Calculate monthly/yearly fuel cost at current Lebanese fuel prices
- [ ] **Comparison Tool**
  - Select 2-3 cars
  - Side-by-side specs comparison table
  - Price comparison
  - Feature highlight differences

### 2.6 Notification System
- [ ] In-app notifications (bell icon + dropdown)
- [ ] Email notifications (customizable preferences):
  - New offers on your configuration
  - New inquiry on your listing
  - Price drops on saved cars
  - New listings matching saved search
  - Review received
- [ ] WhatsApp notifications for critical events (new inquiry for dealers)
- [ ] Push notifications (web + mobile later)
- [ ] Notification preferences page

---

## PHASE 3: "Sell My Car" & Advanced Features (Weeks 19-26)

### 3.1 "Sell My Car" Feature
- [ ] Seller flow:
  1. Enter car details (make, model, year, mileage)
  2. Upload photos (guided — specific angles required)
  3. Describe condition (checkboxes: scratches, dents, mechanical issues)
  4. Set asking price or "let dealers bid"
  5. Car goes into dealer auction / direct offer system
- [ ] Dealer bidding:
  - Dealers see available cars to buy
  - Place bids (blind auction or timed auction)
  - Highest bid wins after auction period
  - Buyer's fee charged to winning dealer
- [ ] Seller dashboard:
  - View bids/offers
  - Accept best offer
  - Track pickup/payment status
- [ ] Instant valuation (estimated price based on market data)
- [ ] Photo quality validation (blurry/dark photo rejection)

### 3.2 Dealer Subscription System
- [ ] Subscription tiers:
  - **Free:** 5 active listings, basic profile
  - **Bronze ($49/mo):** 25 listings, priority support, analytics
  - **Silver ($99/mo):** 75 listings, featured placement, advanced analytics
  - **Gold ($199/mo):** Unlimited listings, top placement, dedicated account manager
- [ ] Subscription management dashboard
- [ ] Payment processing (Stripe or local payment gateway)
- [ ] Invoice generation
- [ ] Auto-renewal + cancellation flow
- [ ] Usage tracking (listings used / available)

### 3.3 Advanced Search & Recommendations
- [ ] AI-powered recommendations ("Cars you might like")
- [ ] Recently viewed + browsing history
- [ ] Price drop alerts
- [ ] "Back in stock" alerts for popular models
- [ ] Saved searches with email/push notifications
- [ ] Smart filters (e.g., "under $10K", "low mileage luxury")
- [ ] Voice search (experimental)

### 3.4 Finance & Insurance Hub
- [ ] Bank partner listings (which banks offer car loans)
- [ ] Pre-qualification form (check eligibility without credit hit)
- [ ] Insurance quote comparison (partner with insurance providers)
- [ ] Lease vs buy calculator
- [ ] Finance FAQ and guides
- [ ] Revenue model: referral fee per completed loan/insurance

### 3.5 Dealer Analytics Dashboard (Premium)
- [ ] Listing performance (views, inquiries, conversion rate per car)
- [ ] Competitive pricing insights ("your car is priced 15% above market")
- [ ] Buyer demographic insights
- [ ] Response time metrics
- [ ] Best performing listing tips
- [ ] Market trend data (what's hot, what's not)
- [ ] Export reports (PDF/CSV)

### 3.6 Mobile Optimization & PWA
- [ ] Progressive Web App (installable, offline browsing of saved cars)
- [ ] App-like bottom navigation
- [ ] Swipe gestures for photo galleries
- [ ] Pull-to-refresh
- [ ] Offline-capable car detail pages (cached)
- [ ] "Add to Home Screen" prompt
- [ ] Mobile-optimized photo upload (camera access, compression)

---

## PHASE 4: Community, Scale & Monetization (Weeks 27-36)

### 4.1 Community Features
- [ ] User forums / discussion boards (by brand, by topic)
- [ ] Q&A section (ask the community about a specific car)
- [ ] Dealer community (private area for dealer-to-dealer discussion)
- [ ] Event listings (car shows, meetups in Lebanon)
- [ ] User-generated reviews of cars they own

### 4.2 Video Content Platform
- [ ] YouTube channel setup (Arabic car reviews, comparisons, market updates)
- [ ] Video embed in car review pages
- [ ] TikTok/Reels content strategy (short car reviews, dealer visits)
- [ ] Video production workflow:
  - 2 reviews per week (most popular models in Lebanon)
  - 1 comparison video per week
  - 1 market update per month
  - Quick dealer spotlight videos

### 4.3 Advanced Monetization
- [ ] Display advertising (Google AdSense / direct ad sales)
- [ ] Sponsored content (OEM-sponsored reviews/articles)
- [ ] Premium dealer features (boost listings, homepage placement)
- [ ] Data licensing (market reports for dealers/banks/insurers)
- [ ] Affiliate revenue (insurance, accessories, aftermarket parts)
- [ ] Event sponsorship

### 4.4 Inspection & Certification Partnership
- [ ] Partner with inspection services (pre-purchase inspection)
- [ ] "Certified" badge for inspected cars
- [ ] Inspection report viewable on listing
- [ ] Book inspection directly through platform
- [ ] Revenue: referral fee per inspection booked

### 4.5 Import Tracking Feature (Lebanon-Specific Killer Feature)
- [ ] Track cars bought from Copart/IAAI/Manheim auctions
- [ ] Shipping status tracker (port to port)
- [ ] Customs clearance status
- [ ] Estimated arrival date
- [ ] Cost breakdown (auction price + shipping + customs + repairs)
- [ ] Integration with shipping companies operating Lebanon routes
- [ ] This could be a major differentiator in the Lebanese market

### 4.6 Performance & Scaling
- [ ] Database optimization (indexing, query optimization)
- [ ] Caching layer (Redis for hot queries)
- [ ] Image CDN with on-the-fly resizing
- [ ] Load testing (handle 10K concurrent users)
- [ ] Database read replicas if needed
- [ ] API rate limiting
- [ ] DDoS protection (Cloudflare)
- [ ] Monitoring & alerting (Grafana, PagerDuty)

---

## PHASE 5: Native Mobile App & Regional Expansion (Weeks 37-52)

### 5.1 Native Mobile App
- [ ] React Native or Flutter app
- [ ] Core features: Search, listings, saved, messaging, notifications
- [ ] Camera integration for listing photos
- [ ] Push notifications
- [ ] Biometric login (fingerprint / face)
- [ ] App Store + Play Store submission
- [ ] Deep linking (web ↔ app)

### 5.2 Regional Expansion Prep
- [ ] Multi-country support in database schema
- [ ] Country-specific pricing and currency
- [ ] Local dealer onboarding for:
  - Jordan
  - Iraq
  - Syria (when market recovers)
  - Kuwait (large Lebanese diaspora)
  - UAE (Lebanese expat market)
- [ ] Region-specific content
- [ ] Local payment gateway integrations

### 5.3 AI & Advanced Features
- [ ] AI chatbot (car recommendation based on needs + budget)
- [ ] AI-generated car descriptions for dealers (from photos)
- [ ] Image recognition (auto-detect make/model from photos)
- [ ] Price prediction model (will this car's value go up or down?)
- [ ] Demand forecasting for dealers
- [ ] Smart pricing suggestions for sellers

---

# PART 3: SEO CONTENT ROADMAP

## Month 1-2: Foundation Content (40 pieces)
- 15 car review hubs (top sellers: Toyota Corolla, Camry, RAV4, Kia Sportage, Hyundai Tucson, etc.)
- 10 buying guides (how to buy, finance, import, insure)
- 10 blog posts (car market news, tips)
- 5 tool/calculator pages

## Month 3-4: Growth Content (60 pieces)
- 20 more car review hubs
- 15 comparison articles ("Toyota RAV4 vs Kia Sportage")
- 10 roundup articles ("Best SUVs Under $25K in Lebanon")
- 10 guides (customs, salvage titles, inspection)
- 5 region-specific guides ("Best Dealers in Beirut")

## Month 5-6: Authority Content (80 pieces)
- 30 more car review hubs (covering all major models)
- 20 long-tail blog posts (answering specific questions)
- 15 video scripts + YouTube uploads
- 10 comparison/roundup articles
- 5 data-driven articles ("Average Car Prices in Lebanon 2026")

## Ongoing Monthly Content Targets
- 4 new car reviews
- 8 blog posts
- 4 YouTube videos
- 2 comparison articles
- 2 tool/calculator updates
- 1 market report

---

# PART 4: LAUNCH STRATEGY

## Pre-Launch (4 weeks before)
- [ ] Recruit 15-20 founding dealers (offer 6 months free)
- [ ] Seed 200+ car listings (from founding dealers)
- [ ] Publish 20+ content pieces (reviews + guides)
- [ ] Set up social media accounts (Instagram, Facebook, TikTok, YouTube)
- [ ] Teaser campaign on Instagram ("Something new is coming to Lebanese car buying")
- [ ] Build email waiting list
- [ ] Beta test with 50 invite-only users

## Launch Week
- [ ] Soft launch: invite-only for first 48 hours
- [ ] Public launch with PR push
- [ ] Instagram campaign (reels, stories)
- [ ] Influencer partnerships (Lebanese car Instagram accounts)
- [ ] WhatsApp broadcast to waiting list
- [ ] Facebook/Instagram ads targeting car buyers in Lebanon
- [ ] Google Ads on high-intent keywords

## Post-Launch (First 90 days)
- [ ] Weekly: Monitor analytics, fix bugs, gather feedback
- [ ] Bi-weekly: New feature release
- [ ] Monthly: Market report / content milestone
- [ ] Ongoing: Dealer onboarding (target: 100 dealers by month 3)
- [ ] Ongoing: Content production (follow SEO roadmap)
- [ ] Ongoing: Community building on social media

---

# PART 5: KPIs & SUCCESS METRICS

| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|---|---|---|---|---|
| Active Dealers | 20 | 75 | 200 | 500 |
| Car Listings | 200 | 1,000 | 5,000 | 15,000 |
| Monthly Visits | 5,000 | 25,000 | 100,000 | 500,000 |
| Monthly Inquiries | 100 | 750 | 3,000 | 15,000 |
| Organic Traffic | 500 | 5,000 | 30,000 | 150,000 |
| Content Pieces | 40 | 100 | 200 | 400 |
| App Downloads | — | — | 5,000 | 50,000 |
| Monthly Revenue | $0 | $500 | $3,000 | $15,000 |

---

# PART 6: ESTIMATED TIMELINE

| Phase | Duration | What You'll Have |
|---|---|---|
| Phase 0: Foundation | Weeks 1-3 | Tech stack, DB schema, project setup, research |
| Phase 1: MVP | Weeks 4-10 | Working marketplace with search, listings, dealer portal |
| Phase 2: Reverse Marketplace + Content | Weeks 11-18 | "Dealers compete for you" + reviews + blog + tools |
| Phase 3: Sell My Car + Advanced | Weeks 19-26 | Sell feature, subscriptions, finance hub, mobile PWA |
| Phase 4: Community + Scale | Weeks 27-36 | Forums, video, monetization, import tracking |
| Phase 5: Mobile App + Regional | Weeks 37-52 | Native apps, AI features, expansion prep |

**Total: ~12 months to full platform**
**MVP launch: ~10 weeks from start**

---

*This is your complete playbook. Every checkbox is a task you can track. Every phase builds on the last. Let's start with Phase 0.*
