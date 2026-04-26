## Page Title (Browser Tab) — Bug Fix + Dynamic CMS Sync

### সমস্যা যা পেলাম

আপনি ঠিকই ধরেছেন — Contact page এর browser tab title-এ **"Contact Title | demo"** literally দেখাচ্ছে। কারণ:

```tsx
// src/pages/store/Contact.tsx (line 149)
<SEOHead title={t('store.contactTitle')} ... />
```

`store.contactTitle` translation key-টি `LanguageContext.tsx`-এ **define করা নেই**, তাই `t()` function key-এর string-টাই (literally "Contact Title") fallback হিসেবে return করছে। এটাই tab-এ চলে আসছে।

### বাকি page গুলোর state (sob page review korlam)

| Page | বর্তমান tab title | CMS data fetch করে? | Dynamic title use করে? |
|---|---|---|---|
| **Contact** | ❌ "Contact Title \| demo" (broken key) | ✅ হ্যাঁ | ❌ broken translation key |
| **FAQ** | "FAQ \| demo" | ✅ হ্যাঁ | ❌ hardcoded `"FAQ"` |
| **Shipping Info** | "Shipping Information \| demo" | ✅ হ্যাঁ | ❌ hardcoded |
| **Returns** | "Returns & Exchange \| demo" | ✅ হ্যাঁ | ❌ hardcoded |
| **Size Guide** | "Size Guide \| demo" | ✅ হ্যাঁ | ❌ hardcoded |
| **Track Order** | "Track Order \| demo" | ❌ নাই | ❌ hardcoded |
| Privacy / Terms | works | ✅ হ্যাঁ | check করতে হবে |

### Important observation

প্রতিটি page-এই hero section-এ admin-editable dynamic title (`data?.title`) use হচ্ছে — কিন্তু সেই same dynamic title browser tab-এ pass হচ্ছে না। ফলে admin Content Manager থেকে FAQ-এর title "Frequently Asked Questions" করলে hero-তে দেখা গেলেও tab-এ পুরোনো hardcoded "FAQ" থেকে যায়। **Inconsistent UX।**

### সমাধান

সব store info pages-এ একই pattern apply করব:

```tsx
const title = data?.title || "Fallback Title";
// ...
<SEOHead title={title} ... />  // hero এর same dynamic title pass করব
```

### কী কী change হবে

1. **`src/pages/store/Contact.tsx`** — `<SEOHead title={t('store.contactTitle')}>` → `<SEOHead title={title}>` (already-computed `title` variable use করব, broken translation key bypass)

2. **`src/pages/store/FAQ.tsx`** — `<SEOHead title="FAQ">` → `<SEOHead title={title}>`

3. **`src/pages/store/ShippingInfo.tsx`** — `<SEOHead title="Shipping Information">` → `<SEOHead title={title}>`

4. **`src/pages/store/Returns.tsx`** — `<SEOHead title="Returns & Exchange">` → `<SEOHead title={title}>` + Returns-এর confusing nested-ternary fallback logic (line 77-78) clean করব:
   ```tsx
   const title = data?.title || "Returns & Exchange Policy";
   const subtitle = data?.subtitle || "Easy returns and exchanges within 7 days...";
   ```

5. **`src/pages/store/SizeGuide.tsx`** — `<SEOHead title="Size Guide">` → `<SEOHead title={title}>`

6. **`src/pages/store/TrackOrder.tsx`** — Track Order CMS data fetch করে না, তাই **hardcoded রাখা ঠিকই আছে** ("Track Order" appropriate title, no dynamic content needed)। তবে চাইলে এটাও CMS-driven করতে পারি — by default করছি না scope সংক্ষেপ রাখতে।

7. **`src/contexts/LanguageContext.tsx`** — `store.contactTitle` এবং `store.contactSubtitle` translation keys add করব (defensive — যাতে CMS data না থাকলে fallback proper text দেখায়, key না)। সাথে অন্য missing keys check করব: `store.faqTitle`, `store.shippingInfoTitle`, `store.returnsTitle` ইত্যাদি।

### Result (after fix)

| Page | Tab title (with CMS data) | Tab title (no CMS data, fallback) |
|---|---|---|
| Contact | "Contact Us \| demo" (admin যা দিবে) | "Contact Us \| demo" |
| FAQ | "Frequently Asked Questions \| demo" | "FAQ \| demo" |
| Shipping Info | "Shipping Information \| demo" | "Shipping Information \| demo" |
| Returns | "Returns & Exchange Policy \| demo" | "Returns & Exchange Policy \| demo" |
| Size Guide | "Size Guide \| demo" | "Size Guide \| demo" |
| Track Order | "Track Order \| demo" | "Track Order \| demo" |

এখন admin Content Manager থেকে title edit করলে browser tab-এও সাথে সাথে reflect হবে। Bug-fix + consistency দুটোই।

### Files Edited

- `src/pages/store/Contact.tsx`
- `src/pages/store/FAQ.tsx`
- `src/pages/store/ShippingInfo.tsx`
- `src/pages/store/Returns.tsx`
- `src/pages/store/SizeGuide.tsx`
- `src/contexts/LanguageContext.tsx` (add missing translation keys)
