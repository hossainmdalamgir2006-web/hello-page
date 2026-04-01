

## Footer Update Plan

Screenshot দেখে footer টা functional কিন্তু বেশ plain। এগুলো improve করা যায়:

### 1. Newsletter Section (Top)
- Footer-এর উপরে একটা full-width newsletter subscription bar যোগ করা
- Gradient background with title "Join the {storeName} Family" + email input + subscribe button
- এটা already code-এ আছে (`NewsletterForm`) কিন্তু render হচ্ছে না — enable করতে হবে

### 2. Visual Improvements
- Social icons-এ hover-এ brand color glow effect
- Link items-এ hover-এ subtle arrow/slide animation
- Headings-এ accent underline bar
- Payment method icons row (Visa, Mastercard, bKash, Nagad etc.) bottom bar-এ

### 3. "Back to Top" in Footer
- Footer bottom-এ copyright-এর পাশে scroll-to-top link

### 4. App Download Badges (Optional)
- Google Play / App Store badges যদি applicable হয়

### 5. Privacy/Terms Links Fix
- `t('store.privacyPolicy')` → hardcoded "Privacy Policy" (marker text issue fix)
- `t('store.termsOfService')` → hardcoded "Terms of Service"

### 6. Trust Badges
- "Secure Payment", "Fast Delivery", "24/7 Support" mini badges row

---

### Files to Modify
- `src/components/store/StoreFooter.tsx` — all changes in this single file

### Technical Details
- Enable NewsletterForm rendering above the 4-column grid
- Add payment icons as inline SVGs or text badges
- Add trust badge row between newsletter and main grid
- Fix `t()` calls to hardcoded strings
- Add hover animations via Tailwind `group-hover` and `transition` classes

