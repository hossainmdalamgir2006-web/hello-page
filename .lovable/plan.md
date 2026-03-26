

# Remaining Speed Optimization — Eliminate Duplicate API Calls

## Current Problem (from network requests)

Even after previous optimizations, the homepage still makes **~14 separate API calls**. Several are duplicates of data already fetched by `useStoreSettingsCache`:

```text
DUPLICATE/UNNECESSARY CALLS:
1. store_settings?key=eq.STORE_NAME          ← DynamicTitleProvider (already in shared cache)
2. store_settings?key=eq.STORE_FAVICON       ← StoreLayout already reads from cache but network shows separate call
3. store_settings?key=eq.live_chat_auto_reply ← useAutoReplySettings (already in shared cache)
4. store_settings (GA4/GTM/Pixel keys)       ← useGA4Config separate call (already in shared cache)
5. page_contents?slug=header                 ← StoreHeader individual call
6. page_contents?slug=footer                 ← StoreFooter individual call
7. auto_discount_rules                       ← CartContext loads on every page (should be lazy)
8. homepage_sections (announcement)           ← StoreLayout separate query (homepage_sections already cached)
```

## Plan (5 Steps)

### Step 1: DynamicTitleProvider — use shared store settings cache
- Replace the separate `store_settings?key=STORE_NAME` query with `useStoreSettingsCache()`
- Keep localStorage fallback for instant render
- **Saves 1 API call**

### Step 2: useGA4Config — use shared store settings cache
- Rewrite to read GA4/GTM/Pixel keys from `useStoreSettingsCache()` instead of separate query
- **Saves 1 API call**

### Step 3: usePageContent — migrate to React Query with batching
- Convert `usePageContent(slug)` from `useState+useEffect` to React Query with shared queryKey
- Both header and footer use same `useQuery` key pattern → React Query deduplication handles it
- Add `staleTime: 10min` to prevent re-fetching
- **Saves 0 calls but adds caching**

### Step 4: StoreLayout announcement — use homepage_sections cache
- Remove separate `homepage-announcement` query
- Read announcement from the already-cached `homepage-sections` React Query data
- **Saves 1 API call**

### Step 5: useAutoReplySettings — use shared store settings for storefront
- In `useCustomerChat`, read `live_chat_auto_reply` from `useStoreSettingsCache()` instead of separate query
- Keep `useAutoReplySettings` for admin settings page (needs mutation)
- **Saves 1 API call**

## Files to modify
- `src/components/DynamicTitleProvider.tsx` — use shared cache
- `src/hooks/useGA4Config.ts` — use shared cache  
- `src/hooks/usePageContents.ts` — add React Query caching
- `src/layouts/StoreLayout.tsx` — use homepage_sections cache for announcement
- `src/hooks/useCustomerChat.ts` — use shared cache for auto-reply

## Expected Results
```text
Before: ~14 API calls on homepage
After:  ~8 API calls (auth, license, theme, store_settings, homepage_sections, 
         categories, products, page_contents×2)
```

Combined with previous optimizations: **16+ calls → ~8 calls**, all cached after first visit.

