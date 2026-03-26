

# Website Super Fast Loading — Comprehensive Optimization Plan

## বর্তমান সমস্যা (Network Analysis)

Homepage load-এ **16+ API calls** হচ্ছে। এগুলো কমিয়ে **4-5 টায়** আনা সম্ভব।

```text
Current API calls on homepage:
1.  verify-license (external — already cached ✓)
2.  currency_settings ← REMOVE (currency feature removed!)
3.  auth/v1/user
4.  homepage_sections (full table)
5.  page_contents?slug=lookbook
6.  page_contents?slug=testimonials  
7.  page_contents?slug=promo-banners
8.  page_contents?slug=header
9.  page_contents?slug=footer
10. auto_discount_rules
11. products (featured, limit=4) ← DUPLICATE
12. products (featured, limit=8)
13. homepage_carousel_slides
14. store_settings?key=live_chat_auto_reply
15. store_settings?key=MAINTENANCE_MODE
16. store_settings?key=STORE_FAVICON
17. categories (mega menu)
18. categories (category grid) ← DUPLICATE
19. site_theme_settings
```

## Plan (6 Steps)

### Step 1: Remove currency_settings call
**File:** `src/lib/formatPrice.ts`
- `ensureLoaded()` এখনও `currency_settings` table query করছে — currency feature remove করা হয়েছে কিন্তু এই call থেকে যাচ্ছে
- সরাসরি BDT format করবে, DB call বাদ

### Step 2: Merge duplicate page_contents calls into one batch query
**File:** `src/hooks/usePageContents.ts` — new `usePageContentsBatch` hook
- StoreLayout-এ header, footer, announcement একসাথে একটা query-তে আনা
- `page_contents?page_slug=in.(header,footer)` — 3 calls → 1 call
- Individual section components (Testimonials, PromoBanner, Lookbook) নিজেদের page_contents call বাদ দিয়ে homepage_sections data থেকে নেবে (already আছে `content` field-এ)

### Step 3: Remove duplicate product & category queries
**Files:** `src/hooks/useFeaturedProducts.ts`, `src/components/store/CategoryGrid.tsx`, `src/components/store/MegaMenuNav.tsx`
- Products: `limit=4` call remove, শুধু `limit=8` রাখা
- Categories: MegaMenuNav ও CategoryGrid দুটোই categories fetch করে — একটা shared `useQuery` দিয়ে merge

### Step 4: Merge store_settings into single query  
**Current:** 3 separate calls (MAINTENANCE_MODE, STORE_FAVICON, live_chat_auto_reply) + `useStoreSettingsCache` (fetches ALL settings)
- `useStoreSettingsCache` already সব settings আনে — MAINTENANCE_MODE, FAVICON, live_chat_auto_reply সব এখান থেকে read করবে
- **Files:** `src/layouts/StoreLayout.tsx`, `src/hooks/useMaintenanceMode.ts`, `src/components/store/LiveChatWidget.tsx`

### Step 5: Cache homepage_sections with React Query  
**File:** `src/hooks/useHomepageSections.ts`
- Currently `useState + useEffect` — React Query-তে migrate করা with `staleTime: 10min`
- StoreHome ও admin pages দুটোই same cached data use করবে

### Step 6: Preload critical data & add resource hints
**File:** `index.html`
- Add `<link rel="preconnect">` for Supabase domain
- Add `<link rel="dns-prefetch">` for font domains
- Consider adding `<meta>` tags for SEO (description, viewport already আছে কিনা check)

## Expected Results

```text
Before: 16-19 API calls, ~3-5s load
After:  5-6 API calls, <1.5s load

Calls remaining:
1. verify-license (cached, background only)
2. auth/v1/user (Supabase auto)
3. site_theme_settings (non-blocking)
4. store_settings (ALL in one query)
5. homepage_sections (React Query cached)
6. categories (one shared query)
7. products (one query, limit=8)
```

## Files to modify
- `src/lib/formatPrice.ts` — remove DB call
- `src/hooks/useHomepageSections.ts` — React Query migration
- `src/hooks/useMaintenanceMode.ts` — use shared store settings
- `src/layouts/StoreLayout.tsx` — use batch page_contents + shared settings
- `src/components/store/StoreHeader.tsx` — use shared page_contents
- `src/components/store/StoreFooter.tsx` — use shared page_contents  
- `src/components/store/TestimonialsSection.tsx` — remove individual page_contents call
- `src/components/store/PromoBannerSection.tsx` — remove individual page_contents call
- `src/components/store/LookbookSection.tsx` — remove individual page_contents call
- `src/components/store/LiveChatWidget.tsx` — use shared store settings
- `src/components/store/MegaMenuNav.tsx` — shared categories query
- `src/components/store/CategoryGrid.tsx` — shared categories query
- `src/hooks/useFeaturedProducts.ts` — remove duplicate query
- `index.html` — preconnect hints

