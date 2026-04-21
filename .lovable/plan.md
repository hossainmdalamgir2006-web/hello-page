
## Cart Selection Mismatch Bug — Fix Plan

### Root Cause
দুই জায়গায় **আলাদা key format** ব্যবহার হচ্ছে:

| File | Key formula | Example output |
|---|---|---|
| `src/contexts/CartContext.tsx` | `${id}-${size \|\| ''}-${color \|\| ''}` | `"abc--"` |
| `src/pages/store/Cart.tsx` (local) | `${id}-${size}-${color}` | `"abc-undefined-undefined"` |
| `src/components/store/CartDrawer.tsx` | `${id}-${size \|\| ''}-${color \|\| ''}` | `"abc--"` ✅ |

ফলে Cart page-এ checkbox check করলে context-এ wrong key save হয়, আর reverse direction-এ context-এর সঠিক keys cart page UI-তে match করে না। তাই:

- Header count ঠিক ("2 of 2 selected") কারণ `selectedKeys.size` directly read হয়
- কিন্তু item-এর `selectedKeys.has(localKey)` সবসময় `false` → checkbox empty + "Not in checkout" badge + order summary "2 items not selected"

### Fix

**`src/pages/store/Cart.tsx`** — line 119:
```tsx
const getItemKey = (item: { id: string; size?: string; color?: string }) =>
  `${item.id}-${item.size || ''}-${item.color || ''}`;
```
এই এক line fix করলে সব mismatch resolve হয়ে যাবে — Context, Drawer, এবং Cart page সবাই same key format use করবে।

### Additional Hardening
1. Single source of truth — একটা shared utility export করব `CartContext.tsx` থেকে: `export const getCartItemKey = (item) => ...`, যাতে future-এ আবার এই bug না হয়।
2. Cart.tsx এবং CartDrawer.tsx উভয়েই এই shared utility import করবে।

### Files to Edit
| File | Change |
|---|---|
| `src/contexts/CartContext.tsx` | Export `getCartItemKey` helper publicly |
| `src/pages/store/Cart.tsx` | Remove local `getItemKey`, import shared one |
| `src/components/store/CartDrawer.tsx` | Replace local `getKey` with shared import |

### Expected Result
- Click checkbox → checkbox fills ✅
- "Not in checkout" badge disappears for ticked items ✅
- Order Summary correctly shows "Subtotal (2 of 2 items) BDT 4,950" without "items not selected" line ✅
- Drawer ↔ Cart Page ↔ Checkout সবাই consistent state দেখাবে ✅

Approve করলে default mode-এ গিয়ে এই 3 file fix করে দেব।
