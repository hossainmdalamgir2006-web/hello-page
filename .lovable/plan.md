

## Privacy & Terms Page — সম্ভাব্য Updates

বর্তমানে দুইটা page-ই খুব basic — plain title, subtitle, আর flat sections। অন্য store pages (FAQ, Shipping, Returns, Size Guide) সব modernized হয়ে গেছে কিন্তু Privacy আর Terms এখনো পুরানো design-এ আছে।

### 1. Gradient Hero Banner
- অন্য pages-এর মতো gradient hero section with decorative blur elements
- Shield/Lock icon badge (Privacy), FileText/Scale icon badge (Terms)

### 2. Title/Subtitle Fix
- `t('store.privacyTitle')` → hardcoded "Privacy Policy"
- `t('store.termsTitle')` → hardcoded "Terms of Service"
- Proper subtitle text instead of generic "Last updated" placeholder

### 3. Default Fallback Content
- Database-এ content না থাকলে meaningful default sections — Information Collection, Data Usage, Cookies, Your Rights, Contact (Privacy) এবং Account Terms, Orders & Payments, Shipping, Returns, Intellectual Property (Terms)

### 4. Table of Contents / Quick Navigation
- Page-এর শুরুতে clickable section list — click করলে সেই section-এ scroll হবে

### 5. Animated Entry
- Framer Motion দিয়ে hero ও sections-এ staggered animations

### 6. Section Cards Styling
- Plain sections-এর বদলে numbered cards with icons, rounded borders, shadows, hover effects

### 7. "Last Updated" Badge
- Hero-তে date badge দেখানো (e.g., "Last updated: January 2024")

### 8. Contact CTA
- Page-এর নিচে "Questions about our policy?" section with Contact page link

### 9. Print/Download Button
- Policy print করার button

---

### Files to Modify
- `src/pages/store/Privacy.tsx` — full redesign
- `src/pages/store/Terms.tsx` — full redesign

### Technical Details
- Import `motion` from framer-motion, icons from lucide-react
- Add default sections arrays with heading, body, list, icon fields
- Gradient hero pattern matching other store pages
- Numbered section cards with `border rounded-xl bg-card shadow-sm` styling
- Smooth scroll ToC using `id` anchors and `scrollIntoView`
- Hardcode titles replacing `t()` calls

কোন কোন update চাও বলো, implement করে দিচ্ছি।

