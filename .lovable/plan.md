

## Footer Settings থেকে Store Name ফিল্ড Remove

### সমস্যা
Footer Settings-এ `Store Name` ফিল্ড আছে যেটা অপ্রয়োজনীয় — কারণ Store Name ইতিমধ্যে Header Settings থেকে পড়া হচ্ছে।

### পরিবর্তন

#### `src/config/siteContentRegistry.ts` — Footer section
- `contentSchema` থেকে `store_name: "text"` line remove
- `defaultContent`-এ `store_name` নেই তাই আর কিছু করতে হবে না

### Technical Details
- 1 file, 1 line remove
- Footer-এ store name আগে থেকেই Header Settings-এর content থেকে পড়া হচ্ছে (`StoreFooter.tsx`-এ `usePageContent("header")`)

