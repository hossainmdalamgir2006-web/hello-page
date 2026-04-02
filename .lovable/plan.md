

## Problem

DB-তে পুরোনো migrated data আছে (`site_content_overrides` টেবিলে) যেটা registry-র নতুন `defaultContent` কে override করে দিচ্ছে। যেমন FAQ-এর DB override-এ `faqs` array আছে কিন্তু `category` field নেই — তাই category filter কাজ করছে না। অন্যান্য পেজেও একই সমস্যা।

Merge logic `{ ...defaultContent, ...overrideContent }` — এখানে DB-র `faqs` array পুরো default array-কে replace করে দেয় (JavaScript spread doesn't deep-merge arrays)।

## Solution

### 1. Delete old migrated overrides from DB
`site_content_overrides` টেবিল থেকে পুরোনো migrated rows ডিলিট করতে হবে যেগুলো `page_contents` / `homepage_sections` থেকে এসেছিল। এগুলো এখন আর দরকার নেই কারণ registry-তে সব default data আছে।

**Delete these rows** (non-homepage overrides that came from old migration):
- `faq / main_content`
- `contact / main_content` 
- `footer / main_content`
- `header / main_content`

Homepage overrides রাখা যেতে পারে কারণ সেগুলো admin-এর manually configured।

### 2. No code changes needed
Registry defaults + merge logic ঠিকই আছে। শুধু DB-র পুরোনো data conflict করছে। সেটা clean করলেই নতুন default data আসবে।

### Files to modify: 0
### DB operation: DELETE old override rows using insert tool

