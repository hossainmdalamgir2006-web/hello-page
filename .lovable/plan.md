

## সমস্যা

দুটো আলাদা জায়গায় banner render হচ্ছে — একটা `StoreLayout.tsx`-এ (Announcement Bar, line 64-78) এবং আরেকটা `StoreHeader.tsx`-এ (Top Banner, line 71-82)। দুটোই একই ধরনের promo text দেখাচ্ছে, তাই ডুপ্লিকেট banner দেখা যাচ্ছে।

## সমাধান

`StoreLayout.tsx` থেকে Announcement Bar সম্পূর্ণ remove করব। `StoreHeader`-এর banner-ই একমাত্র banner থাকবে — এটা already dismissible, gradient styled, এবং content manager থেকে configurable।

### Changes

**File: `src/layouts/StoreLayout.tsx`**
- Line 64-78 এর Announcement Bar JSX block remove
- `announcementDismissed` state, `getSectionConfig`, `useSiteContent`, `announcementSection` variables remove (আর দরকার নেই)
- `Link` import remove (যদি আর ব্যবহার না হয়)
- `X` icon import remove (যদি আর ব্যবহার না হয়)

### Technical Details
- 1 file modified: `src/layouts/StoreLayout.tsx`
- No DB changes
- StoreHeader banner remains as the single source of truth for promotional banners

