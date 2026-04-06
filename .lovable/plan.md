

## Header/Footer তথ্য আপডেট ও Upload সিস্টেম

### সমস্যা
1. Header-এ `store_logo` ও `store_favicon` ফিল্ডে plain text input আছে — এগুলোতে image upload system দরকার
2. Footer-এও logo-type ফিল্ড থাকলে upload দরকার
3. Screenshot অনুযায়ী store info (Demo Clothing, address, phone, email, social links) দিয়ে default values সেট করতে হবে

### পরিবর্তন

#### 1. `src/config/siteContentRegistry.ts` — নতুন schema type ও default values

**নতুন content schema type যোগ:** `"image_upload"` — contentSchema-তে এই type দিলে file upload UI render হবে।

**Header section** — `store_logo` ও `store_favicon` type পরিবর্তন:
```
store_logo: "image_upload"    // আগে "text" ছিল
store_favicon: "image_upload" // আগে "text" ছিল
```

Default values যোগ (defaultContent):
- `store_name`: "Demo Clothing"
- `store_phone`: "+880 1700-000000"
- `announcement_text`: "🔥 Up to 50% OFF on selected items!"
- `announcement_link`: "/products?filter=sale"

**Footer section** — default values যোগ:
- `store_description`: "Premium fashion for the modern Bangladeshi. Quality meets style at affordable prices."
- `store_email`: "contact@democlothing.com"
- `store_phone`: "+880 1700-000000"
- `store_address`: "123 Fashion Street, Gulshan"
- `store_city`: "Dhaka"
- `store_postal_code`: "1212"
- `facebook_url`: "https://facebook.com/"

**SectionDef interface** — contentSchema type-এ `"image_upload"` যোগ

#### 2. `src/pages/system-settings/StorePage.tsx` — Image Upload Editor

`renderFieldEditor` function-এ `"image_upload"` type handle করব:
- File input (accept="image/*") + preview
- Upload logic: `supabase.storage.from("store-assets").upload(...)` 
- Upload হলে public URL generate করে field-এ set করবে
- Current image থাকলে thumbnail preview দেখাবে
- Remove button দিয়ে clear করা যাবে

#### 3. Storage bucket — `store-assets`

Database migration দিয়ে `store-assets` bucket তৈরি করব (public bucket) — logo ও favicon upload-এর জন্য।

### Technical Details
- 2 files modified: `siteContentRegistry.ts`, `StorePage.tsx`
- 1 storage bucket তৈরি: `store-assets` (public)
- `image_upload` schema type সব content editor-এ reusable হবে

