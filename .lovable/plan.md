

## Checkout Page Header — Update Plan

### Current Issues (screenshots থেকে identified)

1. **"Title" literal text show করছে** — `t('checkout.title')` translation key properly resolve হচ্ছে না, raw label "Title" render হচ্ছে
2. **Header design outdated** — gradient banner থেকে decorative blur, কিন্তু content শুধু একটা back button + heading, খুব empty
3. **CheckoutSteps separately রয়েছে banner-এর নিচে** — visually disconnected, header section + steps আলাদা card মনে হয়
4. **No trust signals in header** — secure checkout, SSL, money-back guarantee — এগুলো শুধু button-এর নিচে ছোট্ট করে আছে
5. **Order count / progress context নেই** — user জানে না কত items checkout হচ্ছে, কোন step-এ আছে textually

### Proposed New Header Design

```text
┌─────────────────────────────────────────────────────────────┐
│  ← Back   Secure Checkout                    🔒 SSL Secured │
│           Complete your order in 4 quick steps              │
│                                                             │
│  ●━━━━━○━━━━━○━━━━━○                                        │
│ Contact Shipping Payment Review                             │
│  (current step highlighted with label below)                │
└─────────────────────────────────────────────────────────────┘
```

#### Specific changes:

**A. Title fix** — `checkout.title` translation key properly set করব (`"Secure Checkout"` / Bengali fallback), যাতে "Title" literal আর না দেখায়

**B. Unified header card** — Banner section + CheckoutSteps merge করে single rounded card-এ আনব (gradient bg, decorative blurs preserved):
- Left: Back button + Title + subtitle ("Complete your order in 4 quick steps")
- Right: Trust badge ("🔒 SSL Secured" / "100% Secure")
- Bottom: CheckoutSteps integrated inside same gradient container

**C. Item count badge** — Title-এর পাশে একটা small badge: `"5 items"` যাতে user confirm করতে পারে কি checkout করছে

**D. Free shipping progress integration** — যদি subtotal threshold-এর কাছাকাছি, header-এর নিচে compact progress bar: *"Add BDT 250 more for free shipping"* (uses `useFreeShippingConfig`)

**E. Mobile responsive** — Trust badge mobile-এ hide, subtitle smaller, back button larger touch target

**F. Visual polish**
- Gradient match storefront brand (purple → pink, current OK)
- Heading size: `text-2xl md:text-3xl`, semibold display font
- Subtitle: `text-sm text-store-primary-foreground/80`
- Trust pill: `bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs`

### Files to Edit

| File | Change |
|---|---|
| `src/pages/store/Checkout.tsx` | Replace header section (lines 497-514) with new unified design; integrate CheckoutSteps inside gradient |
| `src/lib/translations.ts` | Verify `checkout.title` key exists and returns "Secure Checkout" / "নিরাপদ চেকআউট"; add `checkout.subtitle`, `checkout.sslSecured`, `checkout.itemCount` keys |
| `src/components/store/CheckoutSteps.tsx` | Add optional `variant="onGradient"` prop — light text colors + translucent connectors when rendered on gradient bg |

### What stays the same
- Overall page structure, form sections, order summary card unchanged
- Step logic (`currentStep`) unchanged
- Breadcrumb (above header from StoreLayout) unchanged

### Expected Result
- "Title" literal gone → proper "Secure Checkout" heading
- Visually cohesive header — single gradient band containing title, trust signal, and steps
- Better information hierarchy: user instantly sees *where they are*, *what's safe*, *how many items*
- Mobile-optimized with proper touch targets and condensed trust signals

Approve করলে default mode-এ implement করব।

