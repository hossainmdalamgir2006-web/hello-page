

## Header Settings থেকে Announcement Text/Link Remove

### সমস্যা
Header Settings-এ `announcement_text` ও `announcement_link` ফিল্ড আছে যেগুলো অপ্রয়োজনীয় — কারণ Content Manager-এ আলাদা **Announcement Bar** section আছে।

### পরিবর্তন

#### 1. `src/config/siteContentRegistry.ts` — Header section
- `contentSchema` থেকে remove:
  - `announcement_text: "text"`
  - `announcement_link: "text"`
- `defaultContent` থেকে remove:
  - `announcement_text: "🔥 Up to 50% OFF on selected items!"`
  - `announcement_link: "/products?filter=sale"`

#### 2. `src/components/store/StoreHeader.tsx` — Banner fallback cleanup
- Line 74: `headerCont.announcement_text` fallback সরিয়ে দেব
- শুধু `headerCont.banner_text` রাখব, না থাকলে Announcement Bar section-এর content ব্যবহার হবে

### Technical Details
- 2 files modified
- No DB changes
- Announcement Bar আলাদা section হিসেবে Content Manager-এ manage হবে

