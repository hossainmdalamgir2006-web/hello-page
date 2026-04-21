

## Store Frontend QA Plan

### Scope
**শুধু storefront (public) pages** — Admin/Manager/Support এবং MyAccount (logged-in) এই round-এ skip করব। চাইলে পরে আলাদা round-এ MyAccount QA করব।

### Routes যা visit করব (১৭টি public storefront page)

| # | Route | Page |
|---|-------|------|
| 1 | `/` | Home |
| 2 | `/products` | Product Listing |
| 3 | `/product/:slug` | Product Detail (১টি sample) |
| 4 | `/cart` | Cart |
| 5 | `/checkout` | Checkout |
| 6 | `/wishlist` | Wishlist |
| 7 | `/track-order` | Track Order |
| 8 | `/contact` | Contact |
| 9 | `/faq` | FAQ |
| 10 | `/shipping-info` | Shipping Info |
| 11 | `/returns` | Returns |
| 12 | `/size-guide` | Size Guide |
| 13 | `/privacy` | Privacy Policy |
| 14 | `/terms` | Terms |
| 15 | `/login` | Login |
| 16 | `/random-invalid-url` | 404 NotFound |
| 17 | `/order-confirmation` (empty state) | Order Confirmation |

### Methodology
প্রতিটি page-এ ২টি viewport-এ visit:
- **Desktop:** `1366×768`
- **Mobile:** `390×844`

প্রতিটি page-এ check করব:
- ✅ Page properly load হচ্ছে (no blank screen, no crash)
- ✅ Console error / warning log
- ✅ Layout responsiveness — text overflow, broken grid, hidden buttons, horizontal scroll
- ✅ Header (search bar, cart icon, mega menu) ও Footer render হচ্ছে
- ✅ Mobile menu (hamburger) + mobile search বার কাজ করছে
- ✅ Image loading, sticky elements
- ✅ Critical interactive elements (buttons, links) clickable

### Skip করা হবে
- Destructive actions (place order, delete data)
- Logged-in MyAccount routes (আলাদা round-এ)
- Admin/Manager/Support panels

### Output Format

QA শেষে এই structured report দেব:

```
| Page | Desktop | Mobile | Issues |
|------|---------|--------|--------|
| /    | ✅       | ⚠️      | Hero CTA overflow @390px |
| ...  | ...     | ...    | ...    |
```

প্রতিটি issue-এর সাথে:
- কোন file fix দরকার
- Priority tag — **P0** (blocker/crash), **P1** (visible bug), **P2** (polish)

শেষে একটি **Prioritized Fix List** দেব — আপনি বললে সেগুলো implement করব।

### Notes
- Site-এ এখনও residual `removeChild` warning থাকলে সেটাও report করব এবং root cause trace করব
- কোনো page-এ যদি login required হয় (e.g., checkout redirect হলে), সেটা note করব but skip করব

