

# Website Loading Speed Optimization

## বর্তমান সমস্যা

Page load হতে দেরি হচ্ছে কারণ অনেকগুলো API call **একটার পর একটা (waterfall)** হচ্ছে — সব শেষ না হওয়া পর্যন্ত কিছুই দেখায় না:

```text
AppInitializer (license verify - EXTERNAL API call with 3 retries)
  └─ SiteThemeProvider (DB: site_theme_settings)
       └─ LanguageProvider (DB: translations - ~120 rows)
            └─ AuthProvider (DB: user_roles, profiles)
                 └─ GA4Provider (DB: store_settings x4)
                      └─ DynamicTitleProvider (DB: store_settings)
                           └─ StoreLayout (DB: favicon, homepage_sections, maintenance)
                                └─ StoreHome (DB: featured products, homepage_sections AGAIN)
```

প্রতিটি step আগেরটা শেষ হওয়ার জন্য wait করছে। Total ~10-15 sequential DB calls + 1 external API call।

## Plan

### 1. AppInitializer — License check non-blocking করা
- License verify result **localStorage-এ cache** করা (24hr TTL)
- Cache valid থাকলে সাথে সাথে children render, background-এ re-verify
- প্রথমবার ছাড়া কোনো blocking wait নেই

### 2. Translations — localStorage cache
- `useTranslations` hook-এ translations localStorage-এ cache করা
- প্রথমে cached data দিয়ে render, তারপর background-এ fresh fetch
- ~120 rows মাত্র, localStorage-এ ভালো fit করবে

### 3. SiteThemeProvider — non-blocking করা
- `loaded` state সরানো, children সাথে সাথে render
- Theme apply হবে background-এ (CSS injection async)

### 4. Duplicate query সরানো
- `useHomepageSections()` **StoreLayout** এবং **StoreHome** দুইবার call হচ্ছে — StoreLayout থেকে সরাবো (শুধু announcement bar-এর জন্য আলাদা query)

### 5. DynamicTitleProvider — cache
- Store name localStorage-এ cache করা, instant render

### 6. StoreLayout favicon — cache
- Favicon URL localStorage-এ cache

## Technical detail

### Files to modify:
- **`src/components/AppInitializer.tsx`** — add 24hr localStorage cache for license, render children immediately if cached, verify in background
- **`src/hooks/useTranslations.ts`** — add `initialData` from localStorage, save to localStorage on fetch
- **`src/components/SiteThemeProvider.tsx`** — remove `loaded` state gate, just render children immediately
- **`src/components/DynamicTitleProvider.tsx`** — read storeName from localStorage first, update on fetch
- **`src/layouts/StoreLayout.tsx`** — remove `useHomepageSections()` call, fetch only announcement separately or get it from StoreHome's data
- **`src/layouts/StoreLayout.tsx`** — cache favicon URL in localStorage

### Expected improvement:
- First paint: from ~3-5s to **<1s** (cached data renders instantly)
- Full interactive: from ~5-8s to **~2s** (background fetches complete)

