

## Free Shipping — Admin Controlled System

### Goal
Hardcoded `2000 BDT` threshold-কে admin-managed dynamic system বানাব, যাতে admin **Store Settings** থেকে threshold change, banner toggle, এবং checkout-এর actual shipping calculation একসাথে control করতে পারে।

### Implementation

#### 1. Database — `store_settings` table-এ 2 keys add
- `free_shipping_threshold` → numeric value (default `2000`)
- `free_shipping_enabled` → `"true"` / `"false"` (default `"true"`)

(কোনো schema migration লাগবে না — `store_settings` table আগেই key/value structure-এ আছে।)

#### 2. New hook — `src/hooks/useFreeShippingConfig.ts`
- React Query দিয়ে `store_settings` থেকে দুটি key fetch করব (10 min cache)
- Return: `{ threshold: number, enabled: boolean, loading: boolean }`
- Default fallback: `{ threshold: 2000, enabled: true }` যদি settings missing হয়

#### 3. Admin UI — Store Settings-এ নতুন section
**File:** নতুন `src/components/settings/FreeShippingSettings.tsx`
- Card with:
  - Toggle switch — *"Show free shipping progress banner"*
  - Number input — *"Free shipping threshold (BDT)"*
  - Helper text — *"Customers with cart subtotal ≥ this value get free shipping"*
  - Save button → use `useStoreSettings.updateMultipleSettings`
- Register in `src/pages/system-settings/StorePage.tsx` sidebar (নতুন `{ type: "free_shipping" }` entry)

#### 4. Storefront — dynamic consumption
- **`src/components/store/FreeShippingProgress.tsx`** → threshold prop optional হবে; hook থেকে value pull করবে। `enabled === false` হলে component `null` return করবে।
- **`src/pages/store/Cart.tsx`** → hardcoded `threshold={2000}` remove
- **`src/components/store/CartDrawer.tsx`** → same

#### 5. Checkout sync — actual shipping calculation
- **`src/pages/store/Checkout.tsx`** (এবং shipping calc utility যদি থাকে) → hook থেকে threshold pull করব; subtotal ≥ threshold হলে shipping cost `0` set করব (existing logic যদি hardcoded থাকে, replace করব)
- Same threshold display হবে checkout summary-এ: *"Free shipping unlocked!"* badge

### Files to Edit/Create

| File | Change |
|---|---|
| `src/hooks/useFreeShippingConfig.ts` | **NEW** — fetch threshold + enabled from store_settings |
| `src/components/settings/FreeShippingSettings.tsx` | **NEW** — admin UI card |
| `src/pages/system-settings/StorePage.tsx` | Register new sidebar item |
| `src/components/store/FreeShippingProgress.tsx` | Use hook, respect `enabled` flag |
| `src/pages/store/Cart.tsx` | Remove hardcoded threshold |
| `src/components/store/CartDrawer.tsx` | Remove hardcoded threshold |
| `src/pages/store/Checkout.tsx` | Sync shipping calc with dynamic threshold |
| Migration | Insert default rows for 2 new setting keys |

### Expected Result
- Admin **Store Settings → Free Shipping** tab-এ গিয়ে threshold change করতে পারবে (e.g., 2000 → 3000)
- Toggle off করলে cart/drawer-এ banner hide হয়ে যাবে
- Checkout-এর shipping cost calculation same threshold follow করবে — banner আর actual charge mismatch হবে না
- React Query cache-এর জন্য change instant reflect হবে (10 min stale)

Approve করলে default mode-এ implement করব।

