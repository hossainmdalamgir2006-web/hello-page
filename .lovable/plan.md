## Footer Registry আপডেট — Duplicate Remove ও Default Values যোগ

### সমস্যা

1. Footer registry-তে `facebook_url`, `instagram_url`, `twitter_url`, `youtube_url` আলাদা ফিল্ড আছে, আবার `social_links` নামে একটা `link_list`-ও আছে — duplicate
2. `shop_links` ও `help_links`-এ কোনো default value নেই
3. `newsletter_title`, `newsletter_button`, `copyright_text`, `store_name` footer content-এ ব্যবহৃত হয় কিন্তু registry-তে নেই

### পরিবর্তন

**File: `src/config/siteContentRegistry.ts**` — Footer section update

**contentSchema থেকে remove:**

- ``  individual URL fields  remove koro— duplicate, কারণ `social_links: "link_list"`  আছে এবং `StoreFooter.tsx` সেগুলোই ব্যবহার করে

**contentSchema-তে যোগ:**

- `store_name: "text"` — footer-এ store name দেখায়
- `newsletter_title: "text"`
- `newsletter_button: "text"`
- `copyright_text: "text"`

**defaultContent-এ যোগ:**

- `store_name: "Demo Clothing"`
- `shop_links` — default links array: All Products, New Arrivals, Sale
- `help_links` — default links array: Contact Us, Track Order, FAQs, Shipping Info, Returns & Exchange, Size Guide
- `newsletter_title: "Join the {storeName} Family"`
- `newsletter_button: "Subscribe"`
- `copyright_text: "All rights reserved."`

### Technical Details

- 1 file modified: `siteContentRegistry.ts`
- No DB changes
- `StoreFooter.tsx` already reads these fields from content — defaults will now show properly in editor