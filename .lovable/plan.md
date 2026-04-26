
# Full Website Review & Cleanup Plan

আপনার পুরো website-টা scan করেছি। নিচে পেলাম: **ডুপ্লিকেট/অরফান ফাইল**, **incomplete features**, **UX issues**, **SEO**, এবং **performance** এর পূর্ণ রিপোর্ট — শেষে কী কী fix/cleanup করব সেটা।

---

## ১. Duplicate / Orphan Files (Dead Code)

### 🔴 Orphan Pages (কোনো route এ ব্যবহার হয় না)
| File | লাইন | Status |
|---|---|---|
| `src/pages/store/Account.tsx` | 924+ | পুরোনো mega account page। App.tsx এ আর route করা নেই। বর্তমানে `CustomerAccountLayout` + আলাদা page ব্যবহৃত |
| `src/pages/store/account/AccountPaymentMethods.tsx` | — | App.tsx এ commented out, কোথাও ব্যবহার হয় না |

### 🔴 Orphan Components (০ usage)
সবগুলো `src/components/account/` থেকে — শুধু legacy `Account.tsx` ব্যবহার করত:
- `AccountHeader.tsx`
- `AccountOverview.tsx`
- `AccountPageHeader.tsx`  *(`CustomerAccountLayout` এ ব্যবহার আছে — রাখব)*
- `AccountSidebar.tsx`  *(`CustomerAccountLayout` এ ব্যবহার আছে — রাখব)*
- `OrdersTab.tsx`
- `ProfileCompletion.tsx`
- `RecentlyViewedTab.tsx` *(কিন্তু `AccountRecentlyViewed` সরাসরি hook ব্যবহার করে)*
- `SecurityTab.tsx` *(`AccountSecurity` থেকে ব্যবহৃত — রাখব)*
- `ShoppingTab.tsx` *(`AccountShopping` থেকে ব্যবহৃত — রাখব)*
- `WishlistTab.tsx` *(`AccountWishlist` থেকে ব্যবহৃত — রাখব)*

> Real orphans: `AccountHeader`, `AccountOverview`, `OrdersTab`, `ProfileCompletion`, `RecentlyViewedTab`।

### 🟡 Functional Duplicates (দুটি একই কাজ করে)
| Pair | কারণ | সিদ্ধান্ত |
|---|---|---|
| `/track-order` (TrackOrder.tsx) vs `/order-tracking/:orderId` (OrderTracking.tsx) | প্রথমটা গেস্টদের লুকআপ ফর্ম, দ্বিতীয়টা ডিটেইল পেজ | **দুটোই দরকার** — কিন্তু overlap কমাব |
| `AccountSettings.tsx` (310 line) vs `profile/PersonalInfoPage.tsx` (334 line) | একটা কাস্টমার, একটা স্টাফ — schema আলাদা | **আলাদা রাখব** কিন্তু একই pattern বানাব |
| `AccountNotifications.tsx` vs `AccountNotificationPreferences.tsx` | প্রথমটা notification list, দ্বিতীয়টা settings | **আলাদা ঠিক আছে** |
| `Index.tsx` (admin dashboard) vs `RoleDashboard.tsx` (manager/support) | আলাদা role, আলাদা widget | **ঠিক আছে** |
| `ManagerSettings.tsx` vs `SupportSettings.tsx` vs admin system-settings | অনেকটা overlap | পরবর্তী ধাপে review |

### 🟡 Stale Redirect Link
- `src/pages/store/Returns.tsx:234` — link `/account/returns` → ভুল, হওয়া উচিত `/myaccount/returns`

---

## ২. Incomplete / Non-functional Features

| Feature | Status | কী করব |
|---|---|---|
| **Payment Methods** (`AccountPaymentMethods.tsx`) | route disabled, sidebar এ নেই | ফাইল delete করব (saved cards সিস্টেম নেই) |
| **AccountInvoice (PDF)** | কাজ করে কিন্তু sidebar/actions থেকে পৌঁছানো কঠিন | `AccountOrderTracking` এ "Download Invoice" button যোগ করব |
| **Returns from /returns page** | লিংক ভাঙা (`/account/returns`) | ঠিক করব |
| **Live Chat Widget** | UI আছে, backend আছে — verify করব | জ্যা |
| **Newsletter signup** | homepage এ আছে — backend hook নেই কিনা চেক করব | review only |

---

## ৩. UX Audit (User Experience)

### ✅ ভালো দিক
- Sticky header + mobile bottom nav + search suggestions আছে
- Breadcrumb, BackToTop, OfflineIndicator integrated
- Real-time notifications, cart drawer, wishlist counter
- Maintenance mode, dark/light theme toggle
- Customer account এ glassmorphic sidebar (mobile responsive)

### ⚠️ সমস্যা
1. **Breadcrumb labels missing**: `track-order`, `order-tracking`, `payment` — `pathLabels` map এ নেই → raw segment দেখায়
2. **404 page**: layout এ wrap করা আছে কিন্তু header e search এ গেলে redirect logic broken
3. **Search bar mobile**: focus suggestion close করা যায় না
4. **Mobile bottom nav vs CartDrawer overlap**: কিছু পেজে z-index conflict
5. **Returns page link broken** (উপরে উল্লেখিত)
6. **Account sidebar items**: "Personal Info" আর "Settings" route confusion (multiple redirects)

---

## ৪. SEO Score (Per Page)

| Page | SEO Status | Issue |
|---|---|---|
| `/` Homepage | ✅ Good | SEOHead + JSON-LD আছে |
| `/products` | ✅ Good | canonical + description |
| `/product/:slug` | ✅ Excellent | Product JSON-LD, og:image, og:type |
| `/contact`, `/faq`, `/shipping-info`, `/returns`, `/size-guide`, `/privacy`, `/terms` | ✅ canonical সহ ঠিক আছে |
| `/track-order` | ✅ canonical আছে |
| `/cart`, `/checkout`, `/wishlist`, `/order-confirmation`, `/order-tracking`, `/payment-*` | ✅ noIndex ঠিকঠাক |
| `/login` | ⚠️ noIndex নেই |
| `/admin/*`, `/manager/*`, `/support/*`, `/myaccount/*` | ✅ robots.txt এ Disallow করা |

**Sitemap**: `generate-sitemap` edge function deployed আছে। URL: `/sitemap.xml`  
**robots.txt**: ✅ ভালোভাবে configured

### Missing for higher score:
- Homepage এ Organization JSON-LD (logo, sameAs)
- Login page এ noIndex
- LCP image preload (hero carousel first image)

---

## ৫. Performance / Page Speed (Estimated)

বাস্তব Lighthouse run করতে browser tool লাগবে (এক্সপেনসিভ)। কোড থেকে estimate:

| Page | Estimated Score | কারণ |
|---|---|---|
| `/` Home | 80–88 | Hero carousel + multiple sections, কিন্তু lazy-loaded |
| `/products` | 75–85 | অনেক product card, OptimizedImage ব্যবহৃত ✅ |
| `/product/:slug` | 75–82 | Gallery + Reviews + Related + QA — সব lazy |
| `/cart`, `/checkout` | 90+ | লাইট পেজ |
| Account pages | 85–92 | lazyWithRetry + skeletons ✅ |

### ✅ ইতিমধ্যে আছে
- Route-level code splitting (`lazyWithRetry`)
- React Query caching (5 min stale, 15 min gc)
- OptimizedImage component
- Font preconnect + preload
- Supabase preconnect
- DelayedLoader (300ms threshold)
- TopProgressBar

### ⚠️ Improvement potential
1. Hero image **no `fetchpriority="high"`** — LCP বুস্ট করা যায়
2. Total source: ~96k লাইন — কিছু component split করা যায়
3. ProductReviews (498 line) — pagination/virtualization যোগ করা যায়
4. Some images missing explicit width/height → CLS risk

---

## ৬. কী কী Fix করব (Action Items)

### Phase A — Cleanup (Dead Code Removal)
1. Delete: `src/pages/store/Account.tsx` (legacy mega page)
2. Delete: `src/pages/store/account/AccountPaymentMethods.tsx` + commented import
3. Delete unused components: `AccountHeader.tsx`, `AccountOverview.tsx`, `OrdersTab.tsx`, `ProfileCompletion.tsx`, `RecentlyViewedTab.tsx`

### Phase B — Bug Fixes
4. `Returns.tsx`: `/account/returns` → `/myaccount/returns`
5. `StoreBreadcrumb.tsx`: `track-order`, `order-tracking`, `payment-processing`, `payment` labels যোগ
6. `Login.tsx`: `<SEOHead noIndex />` যোগ
7. `AccountOrderTracking`: "Download Invoice" button যোগ → `/myaccount/orders/:id/invoice`

### Phase C — UX Polish
8. `AccountSettings` + `PersonalInfoPage` কে একটি common pattern এ নামানো (optional, future)
9. Mobile search suggestion এ outside-click close

### Phase D — SEO Boost
10. Homepage এ Organization JSON-LD (store name + logo + URL)
11. HeroCarousel first slide এ `fetchpriority="high"` + `loading="eager"`

### Phase E — Performance
12. Hero image LCP optimization
13. Add explicit width/height to product card images (CLS fix)

---

## ৭. Summary Report

```text
TOTAL PAGES        : 60+ (Store 19, Account 18, Admin 30+)
ORPHAN FILES       : 7 (5 components + 2 pages)
BROKEN LINKS       : 1 (Returns → /account/returns)
SEO COVERAGE       : 95% (1 page missing noIndex)
PERFORMANCE        : Good baseline, 3 quick wins available
INCOMPLETE FEATURES: Payment Methods (saved cards) — recommend remove
DUPLICATES         : 0 functional, 5 dead-code groups
```

### Cleanup এর সুবিধা
- ~1500+ line dead code কমবে
- Bundle size কমবে (~50KB)
- Sidebar/Routes পরিষ্কার হবে
- নতুন developer/AI confusion এড়াবে

---

**Approve করলে Phase A–D একসাথে implement করব** (Phase E আলাদা message এ — কারণ image asset adjustment সহ)। কিছু বাদ দিতে চাইলে বলুন (যেমন: শুধু Phase A + B)।
