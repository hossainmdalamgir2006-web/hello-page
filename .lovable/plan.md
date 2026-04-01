

## Track Order Button 404 Fix

### Problem
OrdersTab.tsx-এ "Track Order" button click করলে `/track/ORD-XXXXXXXX-XXXX` path-এ navigate করে, কিন্তু App.tsx-এ এই route নেই। শুধু `/track-order` route আছে।

### Solution
দুইটা কাজ করতে হবে:

1. **OrdersTab.tsx** — Button-এর navigate path পরিবর্তন করে `/track-order?order=${order_number}` করতে হবে
2. **TrackOrder.tsx** — URL query parameter থেকে order number auto-fill করার logic যোগ করতে হবে, যাতে page load হলেই order tracking শুরু হয়

### Files to Modify
- `src/components/account/OrdersTab.tsx` — navigate path fix
- `src/pages/store/TrackOrder.tsx` — accept `?order=` query param and auto-search

### Technical Details
- OrdersTab line 516: change `navigate(\`/track/${selectedOrder.order_number}\`)` to `navigate(\`/track-order?order=${selectedOrder.order_number}\`)`
- TrackOrder: use `useSearchParams()` to read `order` param on mount, pre-fill the order number input, and auto-trigger search

