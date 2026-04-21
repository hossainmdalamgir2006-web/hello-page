

## পুরো Site Blank — Investigation & Fix Plan

### সমস্যা যা পেলাম
আপনি বলেছেন cart/checkout ভেঙে গেছে — কিন্তু browser test করে দেখলাম **homepage সহ পুরো site-ই blank screen** show করছে। শুধু dark background দেখা যাচ্ছে, কোনো content render হচ্ছে না।

### Root Cause
Console-এ এই critical error পেয়েছি:
```
Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': 
The node to be removed is not a child of this node.
   at commitDeletionEffectsOnFiber (React reconciler)
```
এটা `react-helmet-async` + React 18 StrictMode-এর সাথে interaction-এ trigger হওয়া একটা **known DOM reconciliation crash** — page load হওয়ার সময়েই React tree unmount/remount হতে গিয়ে DOM-এর সাথে out-of-sync হয়ে পুরো app crash করে fallback-এ blank দেখায়।

গত message-এ `bun.lock` auto-update হয়েছিল (Privacy/Terms edit-এর পাশাপাশি) — সম্ভবত `react-helmet-async` বা সংশ্লিষ্ট কোনো dependency-র version drift এই reconciliation bug trigger করেছে।

### Fix Plan

**File: `src/main.tsx`** — `React.StrictMode` wrapper temporarily remove করব।

কারণ: StrictMode dev mode-এ প্রতিটা component double-mount করে যেটা react-helmet-async-এর internal Helmet portal-এর সাথে conflict করে এই `removeChild` exception throw করে এবং পুরো tree crash করে। StrictMode বাদ দিলে এই double-mount বন্ধ হয়ে app আবার render হবে।

```tsx
// Before
<React.StrictMode>
  <App />
</React.StrictMode>

// After
<App />
```

**Optional hardening:** যদি এর পরেও সমস্যা থাকে, তাহলে `src/components/SEOHead.tsx`-এ Helmet-এর instance management refactor করব (single HelmetProvider singleton check)।

### ফলাফল
- Site আবার properly load হবে — homepage, cart, checkout সব render হবে
- কোনো user-facing functionality হারাবে না
- StrictMode শুধু dev-time double-render check ছিল, production behavior-এ কোনো effect নেই

### যা change হবে না
- Cart/Checkout/Privacy/Terms-এর কোনো logic বা UI পরিবর্তন হবে না
- গত remove করা elements (Print buttons, tax notes) remove-ই থাকবে

