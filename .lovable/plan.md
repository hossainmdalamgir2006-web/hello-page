

## Frontend Full QA — Plan

### বর্তমান অবস্থা
Site-এ এখনও একটা **runtime error active** আছে: `Component is not a function` (forwardRef-এ undefined component pass হচ্ছে)। এই crash fix না করলে কোনো page properly test করা যাবে না — সব blank/broken দেখাবে।

### Plan (২ ধাপে)

**Phase 1 — Runtime Error Fix (আগে এটা করতে হবে)**
- `src/components/store/FeaturedProductCard.tsx`-এ লুকিয়ে থাকা stale import বা export mismatch trace করব (file ঠিক দেখাচ্ছে কিন্তু error stack `updateForwardRef` দেখাচ্ছে — মানে অন্য কোথাও forwardRef child হিসেবে undefined component render হচ্ছে)
- সম্ভাব্য সন্দেহভাজন: `Providers.tsx`, `StoreLayout`, `MegaMenuNav`, কোনো recently-edited file-এ broken default export
- HMR cache clear-এর জন্য Vite dep pre-bundle invalidate করব (suspect: stale `chunk-IU4C4UG4.js`)
- Site fully load হচ্ছে কিনা confirm করব

**Phase 2 — Full Frontend QA (Browser Testing)**

নিচের ১৭টা public storefront route এবং ১৪টা MyAccount route — প্রতিটা **Desktop (1366×768)** + **Mobile (390×844)** viewport-এ visit করব:

**Storefront pages:**
1. `/` — Home
2. `/products` — Product Listing
3. `/product/:slug` — Product Detail (১টা sample)
4. `/cart` — Cart
5. `/checkout` — Checkout
6. `/wishlist`
7. `/track-order`
8. `/contact`, `/faq`
9. `/shipping-info`, `/returns`, `/size-guide`
10. `/privacy`, `/terms`
11. `/login`
12. `/404` (random invalid URL)

**MyAccount pages (logged-in needed):**
- `/myaccount` (Dashboard), `/orders`, `/wishlist`, `/shopping`, `/recently-viewed`, `/addresses`, `/security`, `/personal-info`, `/password`, `/notification-preferences`, `/reviews`, `/returns`, `/support`, `/chat`

### প্রতিটা page-এ যা check করব
- ✅ Page load হচ্ছে কিনা (no blank screen / no crash)
- ✅ Console error / warning
- ✅ Layout responsiveness (text overflow, broken grid, hidden buttons, horizontal scroll)
- ✅ Critical interactive elements (header search, cart button, mega menu, footer links) clickable
- ✅ Image loading & sticky elements
- ✅ Mobile menu (hamburger) + mobile search bar

### Output Format
QA শেষে এই structured report দেব:

```
| Page | Desktop | Mobile | Issues Found |
|------|---------|--------|--------------|
| /    | ✅       | ⚠️      | Hero CTA overflow on 390px |
...
```

প্রতিটা issue-এর সাথে: কী file, কী fix দরকার — এবং একটা **prioritized fix list** (P0 = blocker, P1 = visible bug, P2 = polish)।

### Note
- MyAccount pages test করতে preview-তে login state দরকার হবে — login screen দেখলে আপনাকে জানাব
- Admin/Manager/Support panel এই QA scope-এ নেই (আপনি বললেন "frontend") — শুধু storefront + customer account
- Destructive actions (delete address, place order ইত্যাদি) skip করব

