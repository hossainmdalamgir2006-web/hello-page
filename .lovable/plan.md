

## Social Links — Default Icon দেখানো ও Pinterest যোগ

### সমস্যা
Social Links-এ custom logo upload না থাকলে generic image upload icon দেখায়। Screenshot অনুযায়ী label-based default Lucide icon (Facebook, Pinterest, Twitter, YouTube) দেখাতে হবে।

### পরিবর্তন

#### 1. `src/components/admin/content-editors/LinkListEditor.tsx`
- Social type-এর জন্য label-based default icon map যোগ: `{ facebook: Facebook, instagram: Instagram, twitter: Twitter, youtube: Youtube, pinterest: Pin }` (Lucide icons)
- যখন `item.logo` empty এবং label match করে → default Lucide icon দেখাবে (upload button-এর বদলে)
- Icon-এর উপর click করলে upload trigger হবে (icon replace করতে পারবে)
- Logo uploaded থাকলে আগের মতোই uploaded image দেখাবে

#### 2. `src/config/siteContentRegistry.ts`
- Default social_links-এ `Instagram` → `Pinterest` replace (screenshot অনুযায়ী)
- Pinterest URL: `https://pinterest.com/`

### Technical Details
- 2 files modified
- No DB changes
- Lucide icons import: `Facebook, Instagram, Twitter, Youtube` থেকে `Facebook, Twitter, Youtube` + নতুন Pinterest icon (`Pin` from lucide-react) যোগ

