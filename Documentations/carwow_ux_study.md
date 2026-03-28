# CarWow UX Patterns, User Flows & Information Architecture
## Deep Study for Lebanon Platform Adaptation

---

# 1. GLOBAL NAVIGATION ARCHITECTURE

## 1.1 Primary Navigation (Top Bar)

CarWow uses a persistent top navigation bar with these primary items:

```
[Logo] [New] [Leasing] [Used] [Electric] [Vans] [Sell] [Reviews] [News] [🔍] [👤]
```

**Pattern observations:**
- Navigation is action-oriented, not category-oriented. Each item = a thing users want to DO
- "Sell" has a prominent colored CTA-style treatment — it's their highest-revenue feature
- "Electric" gets its own top-level nav item despite being a subcategory — signals strategic priority
- Search icon is minimal (magnifying glass) — they prefer guided browsing over free-text search
- User account icon is far-right with dropdown for logged-in features
- A persistent top banner promotes a key action: "Sell your car for what it's really worth" — always visible

**Lebanon adaptation:**
```
[Logo] [سيارات جديدة/New] [مستعملة/Used] [بيع سيارتك/Sell] [استيراد/Import] [مراجعات/Reviews] [مدونة/Blog] [🔍] [👤]
```
- Drop "Leasing" and "Vans" (not relevant for Lebanon MVP)
- Add "Import" (massive Lebanese market segment)
- Keep "Sell" as a highlighted CTA
- Bilingual labels or Arabic-primary based on language toggle

## 1.2 Mega Menu Structure

Each primary nav item opens a mega menu with a multi-column layout. CarWow organizes these consistently:

```
[Section Title]
├── By Make          → Grid of 10 popular brands + "All Makes" link
├── By Type          → Grid of 10 car types + "All Types" link  
├── By Popular Model → Grid of 10 models
├── By Location      → Grid of 10 cities + "All Locations" (used cars only)
└── Special Links    → e.g., "Car history checker", "How we test cars"
```

**Key pattern:** Every mega menu has the SAME organizational structure (by make, by type, by model, by location). This creates predictable navigation — users learn the pattern once and can navigate any section.

**Each section has its own URL suffix pattern applied to brand URLs:**
```
/toyota/           → Brand hub (reviews)
/toyota/deals      → New car deals
/toyota/used       → Used cars
/toyota/lease      → Lease deals
/toyota/yaris/     → Model review hub
/toyota/yaris/deals    → Model deals
/toyota/yaris/used     → Model used listings
/toyota/yaris/lease    → Model lease deals
```

**Lebanon adaptation:**
```
/toyota/              → Brand hub (reviews + all listings)
/toyota/new           → New car listings
/toyota/used          → Used car listings
/toyota/corolla/      → Model review hub
/toyota/corolla/new   → Model new listings
/toyota/corolla/used  → Model used listings
```
- Same pattern but without lease suffix
- Add /toyota/import for imported/salvage cars

## 1.3 Footer Architecture

The footer serves as a **secondary navigation for SEO-important pages** that don't fit in the main menu:

```
Footer Sections:
├── Buying          → Links to deals, finance guides, car types
├── Selling         → Sell my car, valuation, locations
├── Tools           → All calculators and checkers
├── Reviews         → Top reviewed brands
├── Company         → About, careers, press, T&C, privacy
├── Help            → FAQ, contact, how it works
└── Social          → YouTube, Instagram, Facebook, Twitter
```

**Key pattern:** Important SEO pages are in the footer, not the header. This keeps the header clean for UX while ensuring Google can crawl all important pages.

---

# 2. PAGE-BY-PAGE UX BREAKDOWN

## 2.1 Homepage

### Layout (Top to Bottom)

```
┌─────────────────────────────────────────────────┐
│ [Persistent top banner - "Sell your car..."]     │
├─────────────────────────────────────────────────┤
│ [Navigation bar]                                 │
├─────────────────────────────────────────────────┤
│ HERO SECTION                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ Headline: "The free, easy way to change      │ │
│ │           your car online"                    │ │
│ │                                               │ │
│ │ [Search Widget]                               │ │
│ │  ┌──────────┐ ┌───────────┐ ┌────────────┐  │ │
│ │  │ Buy New  │ │ Buy Used  │ │ Sell My Car│  │ │
│ │  └──────────┘ └───────────┘ └────────────┘  │ │
│ │                                               │ │
│ │  Make ▼  │  Model ▼  │  [Search Button]      │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ TRUST BAR                                        │
│ "4,000+ dealers" "£3B+ cars sold" "79K reviews"  │
├─────────────────────────────────────────────────┤
│ PROMOTED DEALS CAROUSEL                          │
│ [Spring Sale Banner] → [Deal Card] [Deal Card]   │
├─────────────────────────────────────────────────┤
│ BROWSE BY MAKE (Logo Grid)                       │
│ [Audi] [BMW] [Ford] [Hyundai] [Kia] [Mercedes]  │
│ [Nissan] [Tesla] [Toyota] [VW] → "All Makes"    │
├─────────────────────────────────────────────────┤
│ BROWSE BY TYPE (Visual Cards with Images)        │
│ [SUV] [Electric] [Hybrid] [Small] [Family]       │
├─────────────────────────────────────────────────┤
│ HOW IT WORKS (3-step visual)                     │
│ 1. Choose your car                               │
│ 2. Compare offers from dealers                   │
│ 3. Buy from a trusted dealer                     │
├─────────────────────────────────────────────────┤
│ LATEST REVIEWS CAROUSEL                          │
│ [Review Card] [Review Card] [Review Card]        │
├─────────────────────────────────────────────────┤
│ SELL MY CAR CTA SECTION                          │
│ "Get the best price for your car"                │
│ [Enter registration] [Get Valuation]             │
├─────────────────────────────────────────────────┤
│ [Footer]                                         │
└─────────────────────────────────────────────────┘
```

### UX Patterns to Note:

1. **Tab-based hero search** — Three tabs (Buy New / Buy Used / Sell) allow one search widget to serve three user intents. Reduces cognitive load.

2. **Progressive disclosure** — The search starts simple (Make → Model) then gets detailed after you engage. They don't show all filters upfront.

3. **Trust bar** — Immediately after the hero, social proof numbers anchor credibility. Uses large, bold numbers.

4. **Multiple browse paths** — Users can find cars by: search, by make, by type, by deal, or by editorial recommendation. No single "right" path — supports different mental models.

5. **Sell My Car CTA repetition** — Appears twice: once in the hero tabs and once as a dedicated section lower on the page. Their highest-revenue feature gets double exposure.

6. **Clean, generous whitespace** — CarWow uses significantly more whitespace than competitors. Sections breathe. Cards have padding. Nothing feels cramped.

### Lebanon Homepage Adaptation:

```
┌─────────────────────────────────────────────────┐
│ [Language toggle AR/EN] [Top banner - "بيع سيارتك"] │
├─────────────────────────────────────────────────┤
│ HERO SECTION                                     │
│ "أسهل طريقة لشراء وبيع السيارات في لبنان"       │
│                                                   │
│ Tabs: [شراء جديد] [شراء مستعمل] [بيع سيارتك]    │
│       [استيراد]                                   │
│                                                   │
│ [الماركة ▼] [الموديل ▼] [الميزانية ▼] [بحث]    │
├─────────────────────────────────────────────────┤
│ TRUST BAR                                        │
│ "200+ تاجر" "5000+ سيارة" "أسعار شفافة"        │
├─────────────────────────────────────────────────┤
│ BROWSE BY MAKE (logos popular in Lebanon)         │
│ [Toyota] [Kia] [Hyundai] [Mercedes] [BMW]        │
│ [Nissan] [Honda] [Range Rover] [BYD] [Chery]     │
├─────────────────────────────────────────────────┤
│ BROWSE BY TYPE                                    │
│ [SUV] [سيدان] [هاتشباك] [بيكأب] [كهربائية]     │
├─────────────────────────────────────────────────┤
│ BROWSE BY REGION                                  │
│ [بيروت] [جبل لبنان] [الشمال] [البقاع] [الجنوب]  │
├─────────────────────────────────────────────────┤
│ HOW IT WORKS                                     │
│ LATEST LISTINGS                                  │
│ SELL MY CAR CTA                                  │
│ IMPORT COST CALCULATOR CTA                       │
│ [Footer]                                         │
└─────────────────────────────────────────────────┘
```

Added: "Browse by Region" (Lebanon-specific, critical for local buyers) and "Import" tab.

---

## 2.2 Car Listing Search/Results Page

### Layout

```
┌─────────────────────────────────────────────────┐
│ SEARCH BAR (sticky on scroll)                    │
│ [Make ▼] [Model ▼] [Location ▼]                │
├──────────────┬──────────────────────────────────┤
│ LEFT SIDEBAR │ RESULTS AREA                      │
│              │                                    │
│ FILTERS:     │ [Sort: Relevance ▼] [XX results] │
│              │                                    │
│ □ Price      │ ┌──────────────────────────────┐ │
│   Min-Max    │ │ [IMG]  Make Model Year        │ │
│              │ │        Trim / Variant          │ │
│ □ Body type  │ │        ⭐ Dealer Rating        │ │
│   ☐ SUV     │ │        📍 Location             │ │
│   ☐ Sedan   │ │        ⚙️ Specs summary        │ │
│   ☐ Hatch   │ │        💰 £XX,XXX  was £XX,XXX │ │
│              │ │        [View Deal] [Save ♡]    │ │
│ □ Fuel type  │ └──────────────────────────────┘ │
│   ☐ Petrol  │                                    │
│   ☐ Diesel  │ ┌──────────────────────────────┐ │
│   ☐ Hybrid  │ │ [Next listing card...]        │ │
│   ☐ Electric│ └──────────────────────────────┘ │
│              │                                    │
│ □ Gearbox    │ [Load More / Pagination]          │
│ □ Mileage    │                                    │
│ □ Year       │                                    │
│ □ Doors      │                                    │
│ □ Color      │                                    │
│              │                                    │
│ [Clear all]  │                                    │
└──────────────┴──────────────────────────────────┘
```

### UX Patterns to Note:

1. **Sticky search bar** — The make/model/location bar stays visible on scroll so users can quickly refine without scrolling back up.

2. **Left sidebar filters** — Desktop uses persistent sidebar filters (not modal/overlay). All filters visible at once, checkboxes for multi-select, sliders for ranges.

3. **Mobile: Bottom sheet filters** — On mobile, filters collapse into a bottom sheet accessed via a "Filter" button. Results take full screen.

4. **Listing card information hierarchy:**
   ```
   1. Image (largest element, ~40% of card)
   2. Make + Model + Year (primary text)
   3. Price (bold, large, with savings highlighted)
   4. Key specs line (fuel, transmission, mileage)
   5. Dealer info + rating
   6. Location
   7. CTA button
   ```

5. **Savings callout** — Price shows both the RRP and the CarWow price, with a highlighted "Save £X,XXX" badge. This is a core value proposition visualized.

6. **Sort options** — Relevance (default), Price low→high, Price high→low, Newest first, Mileage low→high.

7. **No infinite scroll** — CarWow uses "Show more" button pagination, not infinite scroll. Better for SEO (crawlable pages) and performance.

8. **Save/Wishlist** — Heart icon on each card, requires login. Saves persist across sessions.

### Lebanon Adaptation:
- Add "Source" filter (Local / Imported / Salvage)
- Add "Region" filter prominently (more important than postcode in Lebanon)
- Price in USD primary, LBP secondary
- Add WhatsApp icon on each listing card for quick contact
- Mobile-first: listing cards should be designed for thumb scrolling

---

## 2.3 Individual Car Detail Page

### Layout

```
┌─────────────────────────────────────────────────┐
│ BREADCRUMB                                       │
│ Home > Toyota > Yaris > 2026 Review              │
├─────────────────────────────────────────────────┤
│ ┌───────────────────────┬─────────────────────┐ │
│ │                       │ SIDEBAR (STICKY)     │ │
│ │ IMAGE GALLERY         │                      │ │
│ │ [Main Image]          │ Make Model Year      │ │
│ │ [thumb] [thumb] [thumb]│ Price: £XX,XXX      │ │
│ │                       │ RRP: £XX,XXX         │ │
│ │                       │ Save: £X,XXX         │ │
│ │                       │                      │ │
│ │                       │ [Get Offers] (CTA)   │ │
│ │                       │ [View XX Deals]      │ │
│ │                       │                      │ │
│ │                       │ Dealer Info:         │ │
│ │                       │ ⭐ 4.7 (234 reviews) │ │
│ │                       │ 📍 Location          │ │
│ │                       │ [Contact Dealer]     │ │
│ │                       │ [Save ♡]             │ │
│ └───────────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────┤
│ TAB NAVIGATION (for review hubs)                 │
│ [Overview] [Interior] [Performance] [Specs]      │
│ [Colours] [Running Costs] [Deals]                │
├─────────────────────────────────────────────────┤
│ CONTENT AREA                                     │
│                                                   │
│ Verdict Box (highlighted)                         │
│ "The Toyota Yaris is..." + star rating           │
│                                                   │
│ Pros & Cons (two columns)                        │
│ ✅ Great fuel economy    ❌ Small boot           │
│ ✅ Reliable              ❌ Basic infotainment   │
│                                                   │
│ Quick Specs Grid                                  │
│ ┌──────────┬──────────┬──────────┬────────────┐ │
│ │ CO2      │ MPG      │ 0-62    │ Insurance  │ │
│ │ 92 g/km  │ 68.8     │ 9.7s   │ Group 8    │ │
│ └──────────┴──────────┴──────────┴────────────┘ │
│                                                   │
│ Written Review Content                            │
│ (sections with images, embedded YouTube video)    │
│                                                   │
│ Alternative Cars Section                          │
│ "If you like this, also consider..."             │
│ [Card] [Card] [Card]                             │
│                                                   │
│ User Reviews Section                              │
│                                                   │
│ Related Deals                                     │
├─────────────────────────────────────────────────┤
│ [Footer]                                         │
└─────────────────────────────────────────────────┘
```

### UX Patterns to Note:

1. **Sticky sidebar CTA** — The price and "Get Offers" button stay visible as you scroll through the review. This is critical for conversion — the call to action is always accessible.

2. **Tab navigation for content hubs** — Each car review is a mini-site with subpages (Interior, Performance, etc.). Tabs switch between them WITHOUT page reload (client-side navigation). This:
   - Keeps users engaged (no loading wait)
   - Each tab has its own URL (SEO benefit)
   - Creates topical authority per car model

3. **Verdict-first content** — The review leads with the verdict and rating, then goes into details. Respects that many users just want the bottom line.

4. **Pros/Cons box** — Always visible, always standardized. Two-column layout, green checkmarks and red X marks. Quick scannable format.

5. **Quick specs grid** — Key numbers in a 4-column grid with icons. Designed for scanning, not reading.

6. **Video embed** — YouTube review is embedded within the page, usually after the opening paragraph. Creates a multi-media experience.

7. **Cross-linking to deals** — Every review page has multiple CTAs linking to the deals/marketplace. Content converts to commerce.

### Lebanon Adaptation:
- Sticky sidebar shows: Price (USD), WhatsApp button, Call button, Save button
- For listings (not reviews): show dealer's WhatsApp and phone prominently
- Specs grid adapted: remove CO2/insurance group, add import status, customs paid status, accident history
- Add "Is this car available in Lebanon?" section for models not officially sold

---

## 2.4 "Sell My Car" Flow

### Step-by-Step User Flow:

```
Step 1: ENTER REGISTRATION
┌─────────────────────────────────────────┐
│ "Sell your car the smart way"           │
│                                          │
│ Enter your reg: [________] [Get Value]  │
│                                          │
│ Trust signals:                           │
│ "160,000 cars sold"                      │
│ "Free, no obligation"                    │
│ "Collection included"                    │
└─────────────────────────────────────────┘
         │
         ▼
Step 2: CONFIRM CAR DETAILS
┌─────────────────────────────────────────┐
│ "We found your car"                      │
│                                          │
│ [Car Image]                              │
│ Make: Toyota  Model: Yaris  Year: 2020  │
│ Colour: White  Fuel: Hybrid             │
│                                          │
│ Current mileage: [________]             │
│                                          │
│ [Yes, this is my car →]                 │
└─────────────────────────────────────────┘
         │
         ▼
Step 3: CONDITION ASSESSMENT
┌─────────────────────────────────────────┐
│ "Tell us about your car's condition"     │
│                                          │
│ Service history: ○ Full ○ Partial ○ None│
│ Number of keys:  ○ 1 ○ 2               │
│ Any damage?      ○ Yes ○ No            │
│   → If yes: checkboxes for type          │
│                                          │
│ [Continue →]                             │
└─────────────────────────────────────────┘
         │
         ▼
Step 4: UPLOAD PHOTOS
┌─────────────────────────────────────────┐
│ "Take photos of your car"                │
│                                          │
│ Required angles (guided):                │
│ [Front ✓] [Rear ✓] [Left ○] [Right ○]  │
│ [Dashboard ○] [Mileage ○] [Damage ○]   │
│                                          │
│ Photo guide overlay showing exactly      │
│ what angle/framing is needed             │
│                                          │
│ [Upload] or [Take Photo]                │
│ [Continue →]                             │
└─────────────────────────────────────────┘
         │
         ▼
Step 5: SET EXPECTATIONS
┌─────────────────────────────────────────┐
│ "Your estimated valuation"               │
│                                          │
│ £8,500 - £9,200                          │
│                                          │
│ "Based on similar cars sold recently"    │
│                                          │
│ How do you want to sell?                 │
│ ○ Auction (dealers bid — usually best £) │
│ ○ Instant offer (lower but guaranteed)   │
│                                          │
│ [List my car →]                          │
└─────────────────────────────────────────┘
         │
         ▼
Step 6: AUCTION / OFFERS DASHBOARD
┌─────────────────────────────────────────┐
│ "Your car is live!"                      │
│                                          │
│ Current highest bid: £9,100              │
│ Number of bids: 7                        │
│ Auction ends: 24hrs                      │
│                                          │
│ [Bid 1: £9,100 - ABC Motors ⭐4.5]     │
│ [Bid 2: £8,900 - XYZ Autos ⭐4.2]     │
│ [Bid 3: £8,750 - 123 Cars ⭐4.8]      │
│                                          │
│ [Accept Best Offer]                      │
│ [Wait for More Bids]                     │
└─────────────────────────────────────────┘
         │
         ▼
Step 7: COLLECTION & PAYMENT
┌─────────────────────────────────────────┐
│ "Congratulations! Sale agreed."          │
│                                          │
│ Buyer: ABC Motors                        │
│ Price: £9,100                            │
│ Collection date: March 30                │
│                                          │
│ What to prepare:                         │
│ ✅ V5C logbook                           │
│ ✅ Both keys                             │
│ ✅ Service history                       │
│                                          │
│ Payment: Same day bank transfer          │
└─────────────────────────────────────────┘
```

### UX Patterns to Note:

1. **Single-input start** — The flow begins with ONE field (registration number). This is the lowest possible barrier to entry. Everything else is auto-filled from DVLA data.

2. **Guided photo upload** — Template overlays show exactly what photo is needed from what angle. This ensures quality and reduces rejections.

3. **Progress indicator** — A step progress bar (Step 2 of 6) is visible throughout, so users know how far along they are.

4. **Valuation anchoring** — Showing an estimated range BEFORE auction creates expectation. Users who see "£8,500-£9,200" feel confident when bids come in at £9,100.

5. **Notification-driven engagement** — After listing, users get SMS/email when new bids arrive. Creates urgency and excitement.

### Lebanon Adaptation:
- Step 1: No registration database in Lebanon, so start with Make/Model/Year selectors instead
- Add: Import source question (local, imported USA, imported Gulf, imported Europe)
- Add: Accident history declaration with checkbox
- Payment: cash or bank transfer (both common in Lebanon)
- WhatsApp notifications instead of SMS (cheaper, more reliable)

---

## 2.5 "Get Offers" / Reverse Marketplace Flow

### Step-by-Step:

```
Step 1: SELECT CAR
┌───────────────────────────────────┐
│ "What car are you looking for?"   │
│                                    │
│ Make: [Toyota ▼]                  │
│ Model: [Corolla ▼]               │
│ Body type: [Sedan ▼]             │
│                                    │
│ [Continue →]                      │
└───────────────────────────────────┘
         │
         ▼
Step 2: CONFIGURE PREFERENCES
┌───────────────────────────────────┐
│ "Customize your perfect car"      │
│                                    │
│ Trim: ○ Base ○ Mid ○ Top        │
│ Engine: ○ 1.6L ○ 2.0L ○ Hybrid │
│ Gearbox: ○ Auto ○ Manual        │
│ Color preference: [Any ▼]        │
│                                    │
│ Must-have features:               │
│ ☐ Sunroof  ☐ Leather  ☐ Nav    │
│ ☐ Parking sensors  ☐ Camera     │
│                                    │
│ [Continue →]                      │
└───────────────────────────────────┘
         │
         ▼
Step 3: BUDGET & LOCATION
┌───────────────────────────────────┐
│ "Almost there!"                   │
│                                    │
│ Budget: £[min] to £[max]          │
│ How will you pay?                 │
│ ○ Cash ○ Finance ○ Not sure yet │
│ Postcode: [_______]              │
│                                    │
│ [Get Offers →]                    │
└───────────────────────────────────┘
         │
         ▼
Step 4: CREATE ACCOUNT (if not logged in)
┌───────────────────────────────────┐
│ "Create your account to see"      │
│ "offers from local dealers"       │
│                                    │
│ Email: [____________]             │
│ Phone: [____________]             │
│ Password: [____________]          │
│                                    │
│ [Create Account & See Offers →]   │
└───────────────────────────────────┘
         │
         ▼
Step 5: OFFER COMPARISON DASHBOARD
┌─────────────────────────────────────────────┐
│ YOUR OFFERS FOR: Toyota Corolla 2026        │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ OFFER 1                    BEST PRICE   │ │
│ │ ABC Toyota Beirut          ⭐ 4.7       │ │
│ │ Price: $24,500                          │ │
│ │ Delivery: 2 weeks                       │ │
│ │ Extras: Free mats, tinted windows       │ │
│ │ [Message Dealer] [WhatsApp] [Details]   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ OFFER 2                    FASTEST      │ │
│ │ XYZ Motors Jounieh         ⭐ 4.3       │ │
│ │ Price: $25,100                          │ │
│ │ Delivery: In stock — immediate          │ │
│ │ Extras: 3yr warranty                    │ │
│ │ [Message Dealer] [WhatsApp] [Details]   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ OFFER 3                    TOP RATED    │ │
│ │ 123 Auto Zahle             ⭐ 4.9       │ │
│ │ Price: $25,800                          │ │
│ │ Delivery: 3 weeks                       │ │
│ │ Extras: Free service for 1yr            │ │
│ │ [Message Dealer] [WhatsApp] [Details]   │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ [Request More Offers]                        │
│ "3 dealers have responded out of 8 invited"  │
└─────────────────────────────────────────────┘
```

### UX Patterns to Note:

1. **Progressive form** — Never shows all fields at once. Each step has 3-5 fields max. Reduces abandonment.

2. **Account creation is deferred** — Users configure their car FIRST, then are asked to create an account. By this point, they're invested (sunk cost principle).

3. **Offer badges** — Each offer gets a contextual badge: "Best Price", "Fastest Delivery", "Top Rated", "Best Value". Helps users compare without reading every detail.

4. **Dealer transparency** — Each offer shows dealer name, rating, review count, and location. Users know exactly who they're dealing with.

5. **Multiple contact options** — Each offer has: in-app message, phone call, and (in our case) WhatsApp. User chooses their preferred channel.

6. **Live status** — "3 of 8 dealers have responded" creates anticipation and shows the feature is working.

---

# 3. COMPONENT-LEVEL UX PATTERNS

## 3.1 Car Listing Card

```
┌────────────────────────────────────┐
│ [CAR IMAGE]           [♡ Save]    │
│                                    │
│ 2024 Toyota Corolla 1.8 Hybrid    │
│ ⭐ 4.7 (128 reviews) · Beirut     │
│                                    │
│ 🔄 Auto · ⛽ Hybrid · 📏 15,000km │
│                                    │
│ $23,500                            │
│ was $25,000 — Save $1,500         │
│                                    │
│ [View Details] [WhatsApp]         │
└────────────────────────────────────┘
```

**Design rules observed:**
- Image takes ~40% of vertical card space
- Maximum 2 lines for title (make + model + variant)
- Specs use icons, not text labels — saves space, scans faster
- Price is the largest text after the title
- Savings/discount is in a colored badge (green or orange)
- CTA button is full-width at card bottom
- Cards are uniform height (images cropped to same aspect ratio)

## 3.2 Dealer Profile Card (in sidebar)

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

## 3.3 Review Rating Component

```
┌────────────────────────────────────┐
│ CARWOW RATING                      │
│ ★★★★☆  8/10                      │
│                                     │
│ Performance    ████████░░  8/10    │
│ Interior       ███████░░░  7/10    │
│ Running costs  █████████░  9/10    │
│ Reliability    ████████░░  8/10    │
│ Safety         █████████░  9/10    │
│                                     │
│ Pros:              Cons:            │
│ ✅ Fuel economy    ❌ Small boot   │
│ ✅ Smooth ride     ❌ Basic tech   │
│ ✅ Reliability     ❌ Dull styling │
└────────────────────────────────────┘
```

**Pattern:** Horizontal bar charts for sub-ratings. Instantly visual. No need to read numbers — bar length tells the story.

---

# 4. MOBILE UX PATTERNS

## 4.1 Mobile Navigation
```
┌──────────────────────────┐
│ [☰ Menu]  [LOGO]  [🔍]  │
├──────────────────────────┤
│ Content area              │
├──────────────────────────┤
│ Bottom Nav (fixed):       │
│ [🏠Home] [🔍Search]      │
│ [💰Sell] [♡Saved] [👤Me] │
└──────────────────────────┘
```

**Patterns:**
- Hamburger menu replaces full nav on mobile
- Bottom tab bar for core actions (like a native app)
- "Sell" gets a prominent position in bottom nav (revenue priority)
- Search is accessible from both top icon AND bottom nav
- Sticky bottom bar stays visible while scrolling

## 4.2 Mobile Filter Pattern
```
┌──────────────────────────┐
│ [Sort ▼] [Filter 🔽]     │
│ Applied: SUV, <$30K ✕    │
├──────────────────────────┤
│ Results (full width)      │
│ [Card] [Card] [Card]     │
└──────────────────────────┘

When "Filter" tapped:
┌──────────────────────────┐
│ ✕ FILTERS                │
│                           │
│ Price ────────●───── $50K │
│ Body: [SUV✓] [Sedan]     │
│ Fuel: [Any] [Petrol]     │
│ ...                       │
│                           │
│ [Show 42 Results]         │
└──────────────────────────┘
```

**Pattern:** Full-screen bottom sheet for filters on mobile. Shows result count on the apply button so users know what they'll see.

## 4.3 Mobile Listing Card
```
┌──────────────────────────┐
│ [FULL-WIDTH IMAGE]  [♡]  │
│ 2024 Toyota Corolla      │
│ ⭐ 4.7 · Beirut          │
│ Auto · Hybrid · 15K km   │
│ $23,500  Save $1,500     │
│ [View] [WhatsApp]        │
└──────────────────────────┘
```

**Pattern:** Cards go full-width on mobile. Image takes ~50% of card height. Horizontal scroll for spec chips. Two CTA buttons side by side.

---

# 5. INFORMATION ARCHITECTURE (COMPLETE SITEMAP)

## 5.1 Full URL Taxonomy

```
/                                      ← Homepage
│
├── /cars/                             ← All car listings (search)
│   ├── /cars/new/                     ← New cars
│   ├── /cars/used/                    ← Used cars
│   └── /cars/import/                  ← Imported cars (Lebanon-specific)
│
├── /[make]/                           ← Brand hub (e.g., /toyota/)
│   ├── /[make]/new/                   ← Brand new listings
│   ├── /[make]/used/                  ← Brand used listings
│   ├── /[make]/[model]/              ← Model review hub
│   │   ├── /[make]/[model]/review/   ← Full review
│   │   ├── /[make]/[model]/interior/ ← Interior sub-review
│   │   ├── /[make]/[model]/specs/    ← Specifications
│   │   ├── /[make]/[model]/colours/  ← Available colors
│   │   ├── /[make]/[model]/prices/   ← Price guide
│   │   ├── /[make]/[model]/new/      ← Model new listings
│   │   └── /[make]/[model]/used/     ← Model used listings
│   └── ...more models
│
├── /[type]/                           ← Car type pages
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
│   ├── /sell-my-car/beirut/           ← Location-specific sell pages
│   └── /sell-my-car/how-it-works/     ← Explainer
│
├── /get-offers/                       ← Reverse marketplace flow
│   ├── /get-offers/configure/         ← Car configuration wizard
│   └── /get-offers/dashboard/         ← Offer comparison (auth required)
│
├── /dealers/                          ← Dealer directory
│   ├── /dealers/[slug]/              ← Individual dealer profile
│   ├── /dealers/beirut/              ← Dealers by region
│   └── /dealers/join/                ← Dealer registration
│
├── /reviews/                          ← Review index
│   ├── /reviews/best-suv/            ← Roundup articles
│   ├── /reviews/best-family-car/     
│   └── /reviews/comparison/[slug]    ← Comparison articles
│
├── /blog/                             ← Blog
│   ├── /blog/buying-guides/          ← Category
│   ├── /blog/import-guides/          ← Category (Lebanon-specific)
│   ├── /blog/market-news/            ← Category
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
├── /about/                            ← Company pages
│   ├── /about/how-it-works/          
│   ├── /about/contact/               
│   └── /about/careers/               
│
└── /legal/                            
    ├── /legal/terms/                  
    ├── /legal/privacy/                
    └── /legal/cookie-policy/          
```

## 5.2 Internal Linking Strategy (Copied from CarWow)

CarWow uses a deliberate internal linking web:

```
Homepage
  ↓ links to ↓
Brand Hubs (/toyota/)
  ↓ links to ↓
Model Hubs (/toyota/corolla/)
  ↓ links to ↓                    ↗ links back up to ↗
Sub-reviews (/toyota/corolla/interior/)
  ↓ links to ↓
Deals (/toyota/corolla/deals/)

Blog Posts ("Best Family Cars 2026")
  → links to → Multiple model hubs
  → links to → Comparison tool
  → links to → Deals pages

Roundup Articles ("10 Best SUVs")
  → links to → Individual model reviews
  → links to → Type pages (/suv/)

Every page → links to → "Sell My Car" (CTA in sidebar/footer)
Every page → links to → "Get Offers" (CTA in header)
```

**Rule:** Every page links DOWN to more specific pages AND UP to category pages AND SIDEWAYS to related content. This creates a dense link web that distributes authority.

---

# 6. KEY UX PRINCIPLES EXTRACTED

## 6.1 The 10 UX Rules CarWow Follows

1. **One primary action per screen** — Each page has ONE clear CTA. Detail page = "Get Offers". Search = "View Deal". Sell = "Get Valuation". Never competing CTAs.

2. **Progressive disclosure** — Start simple, add complexity. Search starts with 2 fields. Configuration starts with make/model. Details are behind clicks, not upfront.

3. **Transparency builds trust** — Show dealer names, ratings, reviews, prices, savings. Hide nothing. The more transparent, the more conversions.

4. **Content leads to commerce** — Every piece of content (review, guide, tool) has a path to the marketplace. The content educates; the marketplace monetizes.

5. **Reduce decisions** — Smart defaults, "recommended" badges, "best price" labels. Don't make users think about every choice.

6. **Show don't tell** — Savings shown as numbers (£1,500 off), not words ("great deal"). Ratings shown as stars + bar charts. Specs shown as icons + numbers.

7. **Mobile is not a smaller desktop** — Different navigation, different card layouts, different filter patterns. Redesigned for thumb zones and small screens.

8. **Every page earns its keep** — No page exists without an SEO keyword target or conversion purpose. If a page can't rank or convert, it doesn't exist.

9. **Consistency creates confidence** — Same card design everywhere. Same rating display. Same CTA button style. Users learn the interface once.

10. **Speed over perfection** — Fast page loads, instant search results, no unnecessary animations. Lebanese internet is even slower than UK — optimize aggressively.

---

# 7. WIREFRAME REFERENCE FOR YOUR DEVELOPER

## Priority Pages to Build (in order):

1. **Homepage** — Hero search + browse sections
2. **Search/Results** — Filters + listing cards
3. **Car Detail** — Gallery + specs + dealer contact
4. **Dealer Profile** — Listings + reviews + contact
5. **Sell My Car** — Multi-step form flow
6. **Get Offers** — Configuration wizard + offer dashboard
7. **Car Review Hub** — Tabbed content + deals CTA
8. **Blog Post** — Article template + related content
9. **Tool Pages** — Calculator/estimator interfaces
10. **Dealer Dashboard** — Listing management + analytics

For each page, use the ASCII wireframes above as your layout reference and adapt the content/language for Lebanon.

---

*This document maps every UX pattern, user flow, and information architecture decision CarWow has made. Use it as your blueprint — adapt the patterns, not the pixels.*
