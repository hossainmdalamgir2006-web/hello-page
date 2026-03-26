

# Performance Score Optimization Plan

## Current Scores (Mobile)
- **Performance: 39** | LCP: 8.0s | CLS: 0.526 | FCP: 3.8s | SI: 8.2s

## Root Causes

### 1. MASSIVE Product API Response — 1,607 KiB per call (THE #1 KILLER)
The `images` column in `products` table stores **base64-encoded images** inline. The `useFeaturedProducts` hook selects `images` — even though we filter base64 client-side, the **1.6MB is already transferred**. Two separate product queries fire (limit=8 and limit=4), totaling **3.2MB** of wasted transfer.

### 2. Duplicate Product Queries
- `StoreHome` calls `useFeaturedProducts(8)` → queryKey `["featured-products", 8]`
- `NewArrivalsSection` calls `useFeaturedProducts(8)` → same key (shared)
- `FlashSaleSection` calls `useFeaturedProducts(4)` → queryKey `["featured-products", 4]` → **separate API call**

### 3. CLS 0.526 — Footer Layout Shift
Footer has `minHeight: 380px` but the **inner content** re-renders when `useStoreSettingsCache` and `usePageContent("footer")` data arrives, causing 0.471 shift. The skeleton structure doesn't match the final layout.

### 4. LCP 8.0s — Hero Image Chain
Critical path: `index.js` → `homepage_carousel_slides` API (5s) → then image loads. The fallback slide renders immediately but the API response takes 5s before the real slide appears. PageSpeed also reports `fetchpriority=high` is NOT applied on the final rendered image.

## Fix Plan

### Step 1: Create DB function to return products WITHOUT base64 images
Create a database function `get_featured_products_lite(p_limit int)` that:
- Selects products with `is_featured = true`, falls back to newest
- Returns `id, name, slug, price, compare_at_price, category, created_at`
- For `images`: uses a SQL expression to extract only the first URL-based image (filter out `data:` prefix strings)
- This cuts transfer from **1,607 KiB → ~2 KiB**

### Step 2: Update `useFeaturedProducts` to use the DB function
- Call `supabase.rpc('get_featured_products_lite', { p_limit: limit })` instead of `.from('products').select(...)`
- Remove client-side base64 filtering (no longer needed)

### Step 3: Eliminate duplicate product query
- Change `FlashSaleSection` to use `useFeaturedProducts(8)` instead of `useFeaturedProducts(4)`, then `.slice(0, count)` in the component
- This makes all 3 components share the same React Query cache key

### Step 4: Fix CLS — Render footer with defaults immediately
- In `StoreFooter`, render the full layout structure with default/fallback values **before** data loads
- Don't conditionally render sections based on data — always render the structure, replace content when data arrives
- This eliminates the 0.471 layout shift

### Step 5: Fix LCP — Ensure fetchpriority on hero image
- The loaded state image at line 192 uses `fetchPriority={current === 0 ? "high" : undefined}` but JSX prop needs to be the exact string
- Also add `<link rel="preload">` in `index.html` for the default hero image with `fetchpriority="high"`
- Ensure the fallback hero (loading state) and the real hero don't cause a re-render shift

### Step 6: Fix categories base64 image
- The `Sunglasses` category has a massive base64 `image_url` (visible in network response)
- In `useCategoriesCache`, filter out base64 image_urls client-side (already transferred but prevents re-render bloat)
- Long-term: clean the DB data

## Files to modify
- **New migration**: Create `get_featured_products_lite` DB function
- `src/hooks/useFeaturedProducts.ts` — use RPC function
- `src/components/store/FlashSaleSection.tsx` — use limit=8, slice locally
- `src/components/store/StoreFooter.tsx` — render structure with defaults immediately
- `src/components/store/HeroCarousel.tsx` — ensure fetchpriority applied correctly
- `index.html` — add preload for hero image
- `src/hooks/useCategoriesCache.ts` — filter base64 image_urls

## Expected Results
```text
Transfer size:  3.2MB → ~10KB (products)
API calls:      2 product queries → 1 shared query
CLS:            0.526 → <0.1
LCP:            8.0s → ~3-4s  
Performance:    39 → 70-85+
```

