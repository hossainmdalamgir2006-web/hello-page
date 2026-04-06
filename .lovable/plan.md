

## Favicon ও Logo — সব জায়গায় Header Settings থেকে আপডেট

### সমস্যা
1. **Favicon**: `StoreLayout.tsx`-এ `settings?.STORE_FAVICON` (পুরাতন store_settings table) থেকে পড়ছে — Header Settings-এর `store_favicon` ব্যবহার করছে না
2. **Login Page Logo**: `Login.tsx`-এ `getSettingValue('STORE_LOGO')` ও `getSettingValue('store_name')` থেকে পড়ছে — Header Settings-এর content ব্যবহার করছে না। তাই "32" initial দেখাচ্ছে

### পরিবর্তন

#### 1. `src/layouts/StoreLayout.tsx` — Favicon update
- `settings?.STORE_FAVICON` বদলে `usePageContent("header")` থেকে `store_favicon` পড়ব
- Header Settings-এ favicon সেট না থাকলে কোনো favicon apply করব না (default browser behavior)

#### 2. `src/pages/Login.tsx` — Logo/Name update
- `useStoreSettings()` / `getSettingValue()` সরিয়ে `usePageContent("header")` ব্যবহার করব
- `storeName = headerCont.store_name || ""`
- `storeLogo = headerCont.store_logo || null`
- Name empty হলে initial দেখাবে না

#### 3. `src/components/auth/LoginSignupView.tsx` — Empty fallback
- `storeLogo` ও `storeName` দুটোই empty হলে logo/initial section পুরোটাই hide করব
- Heading "Welcome" থাকবে, কিন্তু initial circle দেখাবে না

### Technical Details
- 3 files modified
- No DB changes
- Single source of truth: Header Settings (`usePageContent("header")`)

