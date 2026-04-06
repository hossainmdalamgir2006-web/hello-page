

## Default Store Name/Logo/Favicon সরানো — শুধু Header Settings থেকে আপডেট করলে দেখাবে

### সমস্যা
বর্তমানে "Demo Clothing" default value হিসেবে registry-তে আছে, তাই Header Settings-এ কিছু save না করলেও সব জায়গায় "Demo Clothing" দেখায়। User চায় — default-এ কিছু না থাকুক, শুধু Header Settings থেকে save করলে তবেই store name, logo, favicon আপডেট হোক।

### পরিবর্তন

#### 1. `src/config/siteContentRegistry.ts` — Header section
- `defaultContent` থেকে `store_name: "Demo Clothing"` **remove** করব
- `store_logo` ও `store_favicon` এমনিতেই default নেই (image_upload), কোনো change নেই

#### 2. `src/config/siteContentRegistry.ts` — Footer section
- `defaultContent` থেকে `store_name: "Demo Clothing"` **remove** করব
- Footer-এ store name header content থেকে আসবে (পরবর্তী step)

#### 3. `src/components/store/StoreHeader.tsx`
- Fallback chain: `headerCont.store_name || settings?.STORE_NAME || "Your Store"` → শুধু `headerCont.store_name || ""` রাখব
- Logo: `headerCont.store_logo || settings?.STORE_LOGO || null` → শুধু `headerCont.store_logo || null`
- Store name empty হলে logo-র পাশে text দেখাবে না, আর initial-letter circle-ও দেখাবে না

#### 4. `src/components/store/StoreFooter.tsx`
- `storeName`: header content থেকে পড়বে — `usePageContent("header")` import করে `headerContent.store_name` ব্যবহার করব
- Empty হলে fallback হবে empty string, footer-এ name/logo দেখাবে না
- Logo-ও header content থেকে নেবে

#### 5. `src/components/DynamicTitleProvider.tsx`
- Default store name `"Store"` → empty/generic ব্রাউজার title রাখব
- Header content (`usePageContent("header")`) থেকে store_name পড়ব
- Name পাওয়া গেলে document.title সেট করব, না পেলে generic title

#### 6. `src/components/admin/AdminSidebar.tsx`
- `storeName` ও `storeLogo` — header content থেকে নেবে (`usePageContent("header")`)
- Empty হলে sidebar-এ generic text দেখাবে (e.g., "Admin Panel") এবং কোনো logo/initial দেখাবে না

### Technical Details
- 5 files modified: `siteContentRegistry.ts`, `StoreHeader.tsx`, `StoreFooter.tsx`, `DynamicTitleProvider.tsx`, `AdminSidebar.tsx`
- No DB changes
- সব জায়গায় single source of truth: Header Settings-এর `store_name`, `store_logo`, `store_favicon`
- Header Settings-এ save না করলে সব জায়গায় empty/generic fallback

