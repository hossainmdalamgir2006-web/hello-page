

# PageSpeed 90+ Optimization Plan

## Current Scores
- **Performance: 36** | Accessibility: 83 | Best Practices: 96 | SEO: 100

## Critical Issues Found

### 1. HUGE Product API Responses (1,607 KiB each!)
Products table has base64-encoded images stored in `images` column. Two product queries (NewArrivals limit=4, BestSellers limit=8) both return **1.6MB each** because `images` contains full base64 data. This is the #1 bottleneck.

**Fix:** NewArrivalsSection calls `useFeaturedProducts(count)` which already uses the same queryKey as StoreHome's `useFeaturedProducts(8)`. But the fallback query fetches newest products with full image data. Need to truncate image data — only fetch the first image URL, not base64 blobs. Also need a DB-level fix for categories (Sunglasses category has massive base64 `image_url`).

### 2. LCP = 24.2s (Hero Image)
- Hero image loads after JS renders → massive delay
- Missing `fetchpriority="high"` 
- No `<link rel="preload">` for above-fold image

**Fix:** Add `fetchpriority="high"` to hero image, add preload link in `<head>` via SEOHead/Helmet for hero image.

### 3. CLS = 0.544 (Footer shift)
- Footer causes 0.496 layout shift — it renders late after data loads
- Hero section causes 0.049 shift

**Fix:** Set `min-height` on footer container to reserve space. Ensure hero section always has fixed height.

### 4. Accessibility = 83
- **11 buttons** without accessible names (carousel dots, header buttons, BackToTop)
- **1 link** without discernible name (Facebook social link)
- **14+ contrast failures** (badges, muted text, bottom nav labels)
- **Touch targets too small** (carousel dot buttons 8x8px, need 24x24px min)
- Heading order skip (`<h4>` in footer after `<h2>`)

### 5. Duplicate Font Loading
Two Google Fonts CSS requests loading — one from `index.html` (preload), another from SiteThemeProvider dynamically loading the same fonts.

### 6. Preconnect Mismatch
Supabase preconnect has `crossorigin=""` but API calls don't use CORS → preconnect is unused.

---

## Implementation Steps

### Step 1: Fix product image data bloat
**File:** `src/hooks/useFeaturedProducts.ts`
- Products with base64 images in `images[]` array cause 1.6MB responses
- After fetching, if any image string starts with `data:`, skip it from the response (can't fix DB data, but can avoid sending it)
- Actually the real fix: the `images` column stores URLs AND base64 — filter on client side is too late, data already transferred
- **Better approach:** Create a DB function or just accept this and add pagination. OR: select only first image with a transform

**Alternative (practical):** In `useFeaturedProducts`, after fetching, only keep the first image URL (not base64). But this doesn't fix transfer size. The real fix is to **not store base64 in the images column** — that's a data issue. For now, we can't fix stored data, but we can:
- Reduce product limits (already minimal)
- Ensure no duplicate product calls

### Step 2: Fix Hero LCP
**Files:** `src/components/store/HeroCarousel.tsx`, `src/pages/store/StoreHome.tsx`
- Add `fetchpriority="high"` and `loading="eager"` to the first hero image
- Add `<link rel="preload" as="image">` via Helmet for the default hero image
- Remove skeleton loading state that delays rendering — show default slide immediately

### Step 3: Fix CLS (Footer + Hero)
**Files:** `src/components/store/StoreFooter.tsx`, `src/layouts/StoreLayout.tsx`
- Add `min-height: 400px` to footer wrapper so it reserves space before content loads
- Ensure hero section has explicit height (already has `80vh`)

### Step 4: Fix Accessibility (83 → 90+)
**Files to modify:**
- `src/components/store/StoreHeader.tsx` — add `aria-label` to mobile menu, search, cart, wishlist, theme toggle buttons
- `src/components/store/HeroCarousel.tsx` — carousel dot buttons: increase size to 24x24px with padding, add `aria-label`
- `src/components/store/MobileBottomNav.tsx` — ensure labels meet contrast (use `text-foreground` for active)
- `src/components/store/StoreFooter.tsx` — change `<h4>` to `<h3>`, add `aria-label` to social links
- `src/components/store/BackToTop.tsx` — already has aria-label ✓
- `src/components/store/CategoryGrid.tsx` — fix contrast on subtitle text
- `src/components/store/NewArrivalsSection.tsx` — fix badge contrast
- `src/components/store/TestimonialsSection.tsx` — fix muted text contrast

### Step 5: Fix duplicate font loading
**File:** `index.html`
- The SiteThemeProvider likely loads fonts dynamically. Remove the duplicate `<link>` for Poppins in `index.html` since it's already loaded via the combined Inter+Poppins link.
- Fix: remove the second font link that loads only Poppins

### Step 6: Fix preconnect
**File:** `index.html`  
- Remove `crossorigin` from supabase preconnect (REST API calls don't use CORS mode with crossorigin)

---

## Expected Results
```
Performance:   36 → 80-90+ (LCP fix + payload reduction)
Accessibility: 83 → 95+ (aria-labels, contrast, touch targets)
Best Practices: 96 → 96 (already good)
SEO:           100 → 100 (already perfect)
```

## Files to modify
- `src/components/store/HeroCarousel.tsx` — fetchpriority, eager loading, preload
- `src/components/store/StoreHeader.tsx` — aria-labels on buttons
- `src/components/store/StoreFooter.tsx` — min-height, heading order, social aria-labels
- `src/components/store/MobileBottomNav.tsx` — contrast fix
- `src/components/store/CategoryGrid.tsx` — contrast fix
- `src/components/store/NewArrivalsSection.tsx` — contrast fix
- `src/components/store/TestimonialsSection.tsx` — contrast fix
- `src/pages/store/StoreHome.tsx` — preload hero image
- `index.html` — fix preconnect, remove duplicate font
- `src/hooks/useFeaturedProducts.ts` — optimize image data handling

