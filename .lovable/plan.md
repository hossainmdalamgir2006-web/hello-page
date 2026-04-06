

## MyAccount Panel — Page Header ও Mobile Responsive Fix

### সমস্যা
- Admin panel-এ প্রতিটি পেজে `AdminPageHeader` (glassmorphic, gradient, title+description) দেখায়
- Customer account (myaccount) panel-এ কোনো page header নেই — content সরাসরি শুরু হয়
- Mobile-এ content area-র padding/spacing ঠিকমতো কাজ করছে না

### পরিবর্তন

#### 1. `src/components/account/AccountPageHeader.tsx` — নতুন component তৈরি
- `AdminPageHeader`-এর মতো glassmorphic page header, কিন্তু customer account-এর জন্য
- Props: `title`, `description`, `actions`
- Styling: `rounded-xl`, gradient background, decorative blur elements
- Mobile responsive: smaller text sizes on sm screens

#### 2. `src/layouts/CustomerAccountLayout.tsx` — Page header render
- `<main>` section-এ `AccountPageHeader` add করব `pageTitle` ও `pageDescription` দিয়ে
- Content area padding adjust: mobile-এ `p-3`, tablet-এ `p-4`, desktop-এ `p-6` (existing — verify)

#### 3. `src/pages/store/account/AccountSettings.tsx` — Mobile responsive improvements
- `lg:grid-cols-2` grid mobile-এ single column হবে (already আছে)
- Cards-এর padding mobile-এ `p-4` করব (currently `p-5`)
- Form fields mobile-এ full width stack করবে

#### 4. অন্যান্য myaccount পেজগুলোতে — Consistency
- যেসব পেজে নিজস্ব title/header আছে সেগুলো remove করব (layout-এর header handle করবে)
- `pageTitles` map-এ `/myaccount/personal-info` title "Settings" → "Personal Info" fix

### Technical Details
- 1 new file: `AccountPageHeader.tsx`
- ~3-4 files modified
- No DB changes
- `AdminPageHeader` pattern follow করা হবে কিন্তু আলাদা component (customer vs admin separation)

