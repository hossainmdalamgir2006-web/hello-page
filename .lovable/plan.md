

## Footer Settings — Default Link Values দেখানো

### সমস্যা
Footer Settings editor-এ Social Links, Shop Links, Help Links empty দেখাচ্ছে কারণ database-এ empty array `[]` save আছে, যা registry defaults-কে override করে ফেলছে।

### পরিবর্তন

**File: `src/hooks/useSiteContent.ts`** — `mergeSection` function update
- Content merge logic-এ array fields-এর জন্য check যোগ: যদি override-এ empty array থাকে এবং default-এ populated array থাকে, তাহলে default ব্যবহার করব
- এতে editor-এ default values pre-populated দেখাবে

### Technical Details
- 1 file modified
- No DB changes
- Fix applies globally — যেকোনো section-এর empty array override default-এ fallback করবে

