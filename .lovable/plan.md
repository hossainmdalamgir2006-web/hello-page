
## Cart Selection — Current Behavior + UX Improvement Plan

### এখন কিভাবে কাজ করছে (Current Logic)

**Source:** `src/contexts/CartContext.tsx` + `src/pages/store/Cart.tsx`

1. **Selection state** — `selectedKeys: Set<string>` (key = `id-size-color`)
2. **Auto-select on add** — নতুন item add করলে auto-selected হয় (`addItem`-এ `setSelectedKeys(prev => new Set([...prev, key]))`)
3. **Initial load** — page load-এ যদি কোনো selection না থাকে, সব item auto-select হয় (`useEffect` on `items.length`)
4. **Checkout** — শুধু `selectedItems`-এর subtotal/discount/total calculate হয়; unselected items checkout-এ যায় না
5. **UI** — unselected card faded (`opacity-80`), header-এ "X of Y selected" + select-all checkbox
6. **CartDrawer** — drawer-এ কোনো selection UI নাই; পুরো `subtotal` দেখায় (mismatch with cart page)

### বর্তমান সমস্যা (Issues visible in screenshots)

| # | Issue | Evidence |
|---|---|---|
| 1 | **"3 of 2 selected" bug** — selectedKeys-এ stale/orphan key থেকে যাচ্ছে যখন item remove হয় | Screenshot 2 |
| 2 | **Unclear purpose** — user বুঝে না কেন item "select" করতে হবে; checkout-এ কী impact | Both screenshots |
| 3 | **Faded look = "disabled" perception** — unselected item দেখে মনে হয় out-of-stock/broken | Screenshot 1 |
| 4 | **Drawer ↔ Page mismatch** — drawer পুরো subtotal দেখায়, cart page শুধু selected | CartDrawer.tsx |
| 5 | **Bulk actions নেই** — selected items একসাথে wishlist/delete করা যায় না | Cart.tsx |
| 6 | **Mobile-এ checkbox tiny** — touch target ছোট | — |
| 7 | **Floating context নেই** — scroll করলে "X selected" header হারায়, user track করতে পারে না | — |

### Proposed Improvements

#### A. Bug fixes (must)
- **Orphan key cleanup** — `CartContext`-এ `removeItem` / `clearCart` / quantity-zero এ `selectedKeys` থেকে key remove করব। `items` change-এ orphan keys filter out করার sync `useEffect` add করব।
- **Selection count accuracy** — count computed হবে শুধু valid `items`-এর intersection থেকে (already partially done, fix sync)।

#### B. UX clarity (high impact)
1. **Explanatory hint** — header-এ subtle helper text:
   *"Select items to checkout — unselected items stay in cart for later"*
   একটা small `(?)` tooltip দিয়ে first-time user জানবে।
2. **Visual differentiation, not "disabled"** — unselected card-এ:
   - opacity remove (full visibility)
   - subtle dashed border + muted background tint
   - ছোট badge: *"Not in checkout"* (top-right corner)
3. **Checkbox upgrade** — বড় checkbox (h-5 w-5), card-এর top-left corner-এ prominent placement; পুরো card click → toggle (image/title link বাদে)।
4. **Sticky selection bar** — scroll করলে top-এ floating bar:
   *`✓ 2 selected · BDT 4,950` — [Checkout] [Select All] [Clear]*
5. **Bulk actions toolbar** — যখন `selected > 0`, header replace হবে action toolbar-এ:
   *[Move to Wishlist] [Save for Later] [Remove Selected]*

#### C. Drawer consistency
- `CartDrawer`-এ same selection model দেখাবো: প্রতি item-এ checkbox + footer-এ "Checkout (X selected · BDT Y)"।
- বা drawer-এ selection hide করে শুধু "View Cart to manage selection" message — choice need.

#### D. Smart defaults
- নতুন user / খালি selection state-এ **all items auto-selected** (already), কিন্তু user explicitly deselect করলে preference respect করব (localStorage persist)।
- Out-of-stock item auto-deselect + visible reason badge: *"Out of stock — excluded from checkout"*।

#### E. Order summary feedback
- Order Summary-তে clearly দেখাবো:
  *"Subtotal (2 of 3 items selected)"*
  সাথে muted line: *"1 item not selected — BDT 1,950"*
  → user-কে confirm করায় কী checkout হচ্ছে।

### Implementation Scope

| File | Change |
|---|---|
| `src/contexts/CartContext.tsx` | Orphan key cleanup, persist selection to localStorage, auto-deselect out-of-stock |
| `src/pages/store/Cart.tsx` | Sticky selection bar, bulk action toolbar, redesigned card states, helper hint, summary breakdown |
| `src/components/store/CartDrawer.tsx` | Add per-item checkbox + selected-only checkout total (consistency) |
| `src/lib/translations.ts` (or t-keys) | New strings: `selectionHint`, `notInCheckout`, `bulkRemove` etc. |

### Decisions needed (pick before build)

1. **Drawer-এ selection দেখাবো কিনা?** (consistency vs. simplicity)
2. **Default behavior:** সব auto-select থাকবে, নাকি user-কে explicitly select করতে হবে?
3. **Out-of-stock items:** auto-deselect + locked, নাকি user-কে warning দিয়ে allow করব?
4. **Sticky bar** — সব time visible, নাকি scroll করলে appear?

উত্তর দিলে আমি default mode-এ গিয়ে implementation করে দেব।
