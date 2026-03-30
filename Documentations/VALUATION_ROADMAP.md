# Car Valuation Roadmap — Phases B & C

## Current State (Phase A — Done)
- Visible valuation estimates **removed** (unreliable hardcoded base prices)
- **MarketPriceData** model silently collecting real prices from:
  - `SELL_AUCTION_ACCEPTED` — bid accepted = real transaction price
  - `DEALER_LISTING_CREATED` — dealer lists car = asking price data point
  - `DEALER_LISTING_SOLD` — dealer marks sold = confirmed sale price
- Admin analytics shows collection stats at `/admin/analytics`
- Old valuation engine kept at `src/lib/valuation/estimate.ts` (unused)

---

## Phase B: Data Enrichment (When ~200+ data points)

### Goal
Improve data quality and coverage before building the model.

### Tasks
1. **Normalize make/model strings** — Enforce consistent naming via CarMake/CarModel reference tables. Map free-text entries to canonical slugs.

2. **Add manual data import** — Admin tool to bulk-import historical prices from external sources (dealer surveys, OLX scrapes, auction results). Use the same MarketPriceData model with a new source: `MANUAL_IMPORT`.

3. **Weight by data quality**:
   - `SELL_AUCTION_ACCEPTED` = highest weight (real transaction)
   - `DEALER_LISTING_SOLD` = high weight (confirmed sale)
   - `DEALER_LISTING_CREATED` = lower weight (asking price, not final)
   - `MANUAL_IMPORT` = configurable weight

4. **Track price trends** — Query market data over time to detect appreciation/depreciation per make+model.

---

## Phase C: Re-activate Valuation (When ~500+ data points)

### Approach
Percentile-based estimation grouped by **make + model + year + mileage bucket**.

### Algorithm
```
1. Query MarketPriceData WHERE make = X AND model = Y AND year = Z
2. Filter by mileage bucket: ±20% of target mileage
3. Apply weights by source type
4. Calculate P25, P50 (median), P75 of weighted finalPriceUsd
5. Return: { low: P25, mid: P50, high: P75, confidence, dataPoints }
```

### Confidence Levels
| Data Points | Confidence | Display |
|-------------|-----------|---------|
| 20+ | HIGH | Show range with green badge |
| 10-19 | MEDIUM | Show range with amber badge + disclaimer |
| 5-9 | LOW | Show range with red badge + strong disclaimer |
| <5 | HIDDEN | Don't show — use "Let the Market Decide" |

### Adjustments
- **Recency bias**: Weight transactions from last 6 months 2x, last 12 months 1.5x, older 1x
- **Source adjustment**: Imported cars (USA/Gulf) typically -10-15% vs local; salvage -30-40%
- **Condition**: Accident history = -15% adjustment
- **Region**: Beirut premium ~5% over other regions (if data supports)

### Implementation Plan
1. Create `src/lib/valuation/market-valuation.ts` — new engine using MarketPriceData
2. Add `getMarketValuation` tRPC procedure — public query
3. Re-enable on sell form Step 4 — show estimate with confidence badge
4. Re-enable `/tools/valuation` page — full tool with make/model/year/mileage inputs
5. Remove "Coming Soon" badge from tools hub

### Files to Touch
- `src/lib/valuation/market-valuation.ts` (new)
- `src/server/routers/sell-listings.ts` (replace getValuation)
- `src/server/routers/tools.ts` (replace calculateValuation)
- `src/app/[locale]/sell-my-car/valuation/page.tsx` (restore estimate display)
- `src/app/[locale]/tools/valuation/page.tsx` (restore form)
- `src/app/[locale]/tools/page.tsx` (remove Coming Soon badge)

---

## Monitoring
Check progress at `/admin/analytics` → "Market Data Collection" section.
Target: 500 data points with good make/model diversity before Phase C.
