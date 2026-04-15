

# Auto Discount Rules — আরও Rule Type ও Condition যোগ করা

## বর্তমান অবস্থা
- **UI-তে Rule Type অপশন**: শুধু 3টি — `Cart Value`, `First Order`, `Bulk Purchase`
- **Label map-এ আছে**: 6টি — `cart_total`, `first_order`, `birthday`, `loyalty_tier`, `abandoned_cart`, `bulk_purchase`
- **Backend logic (`useAutoDiscountRules.ts`)**: শুধু `cart_total` টাইপ প্রসেস করে, বাকিগুলো ignore হয়
- **Condition ফিল্ড**: শুধু একটা text input — কোনো dynamic/contextual UI নেই

## Plan

### Step 1: Rule Type dropdown-এ সব অপশন যোগ (Coupons.tsx)
`SelectContent`-এ নতুন অপশন যোগ:
- `cart_total` — Cart Value (আছে)
- `first_order` — First Order (আছে)
- `bulk_purchase` — Bulk Purchase (আছে)
- `item_quantity` — Item Quantity (নতুন)
- `category_based` — Category Based (নতুন)
- `time_based` — Time/Schedule Based (নতুন)

`ruleTypeLabels` map-এ `item_quantity`, `category_based`, `time_based` যোগ করা। `birthday`, `loyalty_tier`, `abandoned_cart` রিমুভ (কারণ এগুলো কার্যকরভাবে ব্যবহৃত হয় না)।

### Step 2: Dynamic Condition UI (Coupons.tsx)
Rule type অনুযায়ী condition ফিল্ড পরিবর্তন:
- **cart_total**: Min Purchase Amount (number input)
- **first_order**: No condition needed (auto-detect)
- **bulk_purchase**: Min Quantity (number input)
- **item_quantity**: Min Items in Cart (number input)
- **category_based**: Category select (existing categories থেকে)
- **time_based**: Start/End date pickers (already in DB schema)

`newRule` state-এ `min_purchase`, `max_discount`, `starts_at`, `expires_at`, `conditions` (jsonb) ফিল্ড যোগ।

### Step 3: Create mutation update (Coupons.tsx)
Insert logic-এ নতুন ফিল্ডগুলো map করা:
- `min_purchase` — cart_total, item_quantity থেকে
- `conditions` — category_based-এর জন্য `{ categories: [...] }`
- `starts_at`/`expires_at` — time_based-এর জন্য
- `max_discount` — সব টাইপে optional cap

### Step 4: calculateDiscount logic update (useAutoDiscountRules.ts)
`calculateDiscount` ফাংশনে নতুন rule types handle করা:
- **item_quantity**: cart items count চেক
- **first_order**: user-এর order count চেক (placeholder — requires order history)
- **bulk_purchase**: total quantity চেক
- **category_based**: cart items-এর category match চেক
- **time_based**: existing date validation (already works)

Function signature update: `calculateDiscount(cartTotal, cartItems?)` — items array optional parameter হিসেবে।

### Step 5: Cart/Checkout integration update
`CartDrawer.tsx`, `Cart.tsx`, `Checkout.tsx`-এ `calculateDiscount` call-এ `items` pass করা যেন নতুন rule types কাজ করে।

### Files to modify
1. `src/pages/Coupons.tsx` — UI form, mutation, labels
2. `src/hooks/useAutoDiscountRules.ts` — calculation logic
3. `src/components/store/CartDrawer.tsx` — pass items
4. `src/pages/store/Cart.tsx` — pass items
5. `src/pages/store/Checkout.tsx` — pass items

No database changes needed — existing `auto_discount_rules` table already has `conditions` (jsonb), `min_purchase`, `max_discount`, `starts_at`, `expires_at` columns.

