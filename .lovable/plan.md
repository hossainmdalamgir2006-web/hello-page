

## Footer Registry আপডেট — Newsletter Remove, Link Values Fix, Social Logo Upload

### সমস্যা
1. `newsletter_title` ও `newsletter_button` ফিল্ড footer registry-তে আছে — remove করতে হবে
2. `LinkListEditor` `href` ফিল্ড ব্যবহার করে, কিন্তু registry defaults ও `StoreFooter.tsx` `url` ফিল্ড ব্যবহার করে — mismatch
3. Social Links-এ logo/icon upload সাপোর্ট নেই

### পরিবর্তন

#### 1. `src/config/siteContentRegistry.ts`
- **Remove**: `newsletter_title` ও `newsletter_button` — contentSchema ও defaultContent উভয় থেকে
- **Fix link field names**: সব default link values-এ `url` → `href` পরিবর্তন (কারণ LinkListEditor `href` ব্যবহার করে)
- **Social links type change**: `social_links: "link_list"` → `social_links: "social_link_list"` (নতুন type — logo upload সহ)

#### 2. `src/components/store/StoreFooter.tsx`
- Social links reading: `url` → `href` (LinkListEditor-এর format match করতে)
- Shop/help links reading: `link.url` → `link.href` 
- Newsletter references remove (newsletter_title, newsletter_button usage)
- `NewsletterForm` component remove
- Social icon rendering: custom logo image থাকলে সেটা দেখাবে, না থাকলে default Lucide icon

#### 3. `src/components/admin/content-editors/LinkListEditor.tsx`
- নতুন `type: "social"` সাপোর্ট যোগ — label + href + logo (image upload button সহ)
- Logo upload: `supabase.storage.from("store-assets").upload(...)` ব্যবহার করবে
- Preview: ছোট thumbnail দেখাবে uploaded logo-র

#### 4. `src/pages/system-settings/StorePage.tsx`
- `social_link_list` schema type handle করব — `LinkListEditor` কে `type="social"` দিয়ে render

### Technical Details
- 4 files modified
- No DB changes (store-assets bucket already exists)
- LinkListEditor-এ নতুন "social" type যোগ হবে — label, URL, ও logo upload সহ

