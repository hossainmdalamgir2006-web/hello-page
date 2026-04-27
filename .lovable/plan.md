# বাংলা টেক্সট অডিট — পুরো সাইট

`/admin/appearance` পেজ সহ পুরো কোডবেজে `[\u0980-\u09FF]` রেঞ্জে স্ক্যান চালিয়ে **২৮টি ফাইলে ১৯৯টি বাংলা match** পাওয়া গেছে। নিচে ক্যাটাগরি অনুযায়ী সব লোকেশন।

---

## 🎯 ১. Admin Panel — Mixed Bangla/English (clean up করা দরকার)

### `src/pages/admin/AppearanceManager.tsx` (আপনি বর্তমানে এই পেজে আছেন)


| Line | বাংলা টেক্সট                                            |
| ---- | ------------------------------------------------------- |
| 198  | `সাইটের Light theme এর সব রঙ নিয়ন্ত্রণ করুন`           |
| 240  | `বাটনের রঙ, radius ও shadow কাস্টমাইজ করুন`             |
| 245  | `বাটনে shadow দেখাবে`                                   |
| 271  | `ফন্ট, সাইজ ও স্পেসিং নিয়ন্ত্রণ করুন`                  |
| 313  | `Admin, Manager, Support, Customer সব panel-এর sidebar` |
| 333  | `সব panel-এর header কাস্টমাইজ করুন`                     |
| 540  | `Chart color palette কাস্টমাইজ করুন`                    |
| 586  | `Advanced users-এর জন্য raw CSS inject করুন`            |


### Other admin components

- `src/components/admin/CarouselSlidesManager.tsx` — L152, 292, 312, 325, 345 (`আপলোড ব্যর্থ`, `আপলোড`, `অথবা নিচে আপলোড করুন`)
- `src/components/admin/ChatTransferDialog.tsx`
- `src/components/admin/QuickReplyPicker.tsx` — L47, 57, 70 (`কুইক রিপ্লাই`, `কুইক রিপ্লাই খুঁজুন...`)
- `src/components/admin/MobileMessageList.tsx` — L171, 188, 193, 238, 257, 262, 277, 290 (`জরুরি/উচ্চ/কম`, `উত্তর দিন`, `অপঠিত/পঠিত`, `আর্কাইভ`, `মুছে ফেলুন`)
- `src/components/admin/InternalNoteInput.tsx` — L13, 27, 30, 61 (`টিম নোট লিখুন...`, `ইন্টারনাল নোট`, `শুধু টিম দেখবে`, `Ctrl+Enter দিয়েও পাঠাতে পারেন`)
- `src/components/admin/GoalTracker.tsx` — L61, 150 (`unit: "৳"`)
- `src/components/admin/content-editors/ShippingRateListEditor.tsx` — L32 (`Cost (৳)`)
- `src/components/settings/ProductPageSettings.tsx` — L128, 173, 198 (`প্রোডাক্ট পেজে দেখানো ট্রাস্ট ব্যাজ...`, `প্রিভিউ:`, `সাইজ গাইড কাস্টমাইজ করুন`)
- `src/components/settings/EmailTemplatesTab.tsx` — L97, 100 (`৳2,500`, `৳500`)
- `src/components/settings/DocumentTemplateEditor.tsx` — L157 (`৳` placeholder)

---

## 💬 ২. Chat / Messaging — Toast & UI বাংলায় (intentional হতে পারে)

- `src/hooks/useLiveChat.ts` — L140–467 (১৬টি toast: `নতুন কথোপকথন তৈরি হয়েছে`, `স্ট্যাটাস আপডেট হয়েছে`, `এজেন্ট অ্যাসাইন হয়েছে`, ইত্যাদি, plus `name: "এজেন্ট"`)
- `src/hooks/useCustomerChat.ts` — L352 (`ফাইল আপলোড করতে সমস্যা হয়েছে`)
- `src/components/store/LiveChatWidget.tsx` — L501, 510 (`ইমোজি খুঁজুন...`, `মেসেজ লিখুন...`)
- `src/pages/store/account/AccountChat.tsx` — L151, 161, 275 (`চ্যাট বন্ধ করা হয়েছে`, `নতুন চ্যাট শুরু করতে...`)

---

## 💰 ৩. Currency Symbol (৳) — Mixed everywhere (acceptable, BDT symbol)

`৳` symbol অনেক জায়গায় আছে — এটা টেক্সট না, currency:

- `src/hooks/useCoupon.ts` — L74, 75, 100
- `src/hooks/useApprovalQueue.ts` — L37, 88
- `src/config/siteContentRegistry.ts` — L178, 432, 443
- `src/pages/Shipping.tsx` — L581, 640
- `src/pages/Analytics.tsx` — L339
- `src/components/products/ProductVariantsManager.tsx` — L251, 262, 452, 456
- `src/components/products/ProductModal.tsx` — L561, 583, 611, 630
- `src/components/orders/SendToCourierModal.tsx` — L472
- `src/components/orders/RefundProcessingModal.tsx` — L111

---

## 💳 ৪. Payment Methods — Bilingual (intentional design)

`src/data/paymentMethodDefinitions.ts` — **৮৭টি match**: প্রতিটি payment method এ `name_bn`, `description_bn`, `instructions_bn`, `label_bn` field আছে (bKash, Nagad, Rocket, Upay, SSLCommerz, ShurjoPay, aamarPay, Stripe, PayPal, 2Checkout, Payoneer, Bank Transfer, Cheque)। এগুলো ইচ্ছাকৃত bilingual data structure।

---

## 🗺️ ৫. Hardcoded Bengali Place Names (intentional — geo matching)

- `src/pages/store/OrderTracking.tsx` — L78, 84, 90 (ঢাকা, মিরপুর, গুলশান, চট্টগ্রাম, সিলেট, ইত্যাদি keyword matching এর জন্য)
- `src/pages/store/Checkout.tsx` — L206, 212 ( `সিটি`, `সারাদেশ` zone matching)
- `src/pages/store/Checkout.tsx` — L952 (`লগআউট`/`লগ ইন` — language switcher logic)

---

## ⚠️ ৬. Misc

- `src/hooks/useAgentMetrics.ts` — L102 (`~৫ মিনিট` — placeholder comment)
- `src/hooks/useLiveChat.ts` — L390, 411, 431 (`name: "এজেন্ট"` — fallback agent name)

---

## প্রস্তাবিত পরবর্তী ধাপ

আপনি কোনটা চান:

1. **Full English conversion**  
2.  payment method এ `name_bn` field remove