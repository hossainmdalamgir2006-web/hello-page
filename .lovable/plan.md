

# Product Image — Base64 থেকে Supabase Storage URL-এ মাইগ্রেট করা

## সমস্যা
Product Modal-এ image আপলোড করলে সেটা `FileReader.readAsDataURL()` দিয়ে **base64 string** হিসেবে সরাসরি database-এ save হচ্ছে। এটাই page slow হওয়ার মূল কারণ — প্রতিটা image 500KB-2MB text হিসেবে database response-এ আসছে।

Categories page আগেই ঠিকমতো Supabase Storage ব্যবহার করছে — সেই pattern-ই product image-এ apply করবো।

## কী করবো

### Step 1: Product Image Upload — Storage-এ পাঠাবে
`ProductModal.tsx`-এর `handleImageUpload` ফাংশন পরিবর্তন:
- `readAsDataURL()` বাদ দিয়ে `supabase.storage.from('product-images').upload()` ব্যবহার
- Upload সফল হলে `getPublicUrl()` দিয়ে URL পেয়ে সেই URL array-তে রাখবে
- Loading state দেখাবে upload চলাকালে

### Step 2: Existing Base64 Images মাইগ্রেশন Script
একটা admin-accessible button/feature যেটা:
- Database থেকে যেসব product-এ base64 image আছে সেগুলো খুঁজবে
- প্রতিটা base64 image decode করে Storage-এ upload করবে
- Database-এ base64 string replace করবে URL দিয়ে
- Edge function হিসেবে তৈরি করবো যাতে server-side এ চলে

### Step 3: Image Size Validation
- Max 5MB per image
- Accepted formats: jpg, png, webp, gif

## Files to modify
- `src/components/products/ProductModal.tsx` — upload to Storage instead of base64
- New edge function: `supabase/functions/migrate-product-images/index.ts` — batch migrate existing base64 images
- Admin UI-তে একটা "Migrate Images" button (Settings or Products page)

## Expected Results
```text
Before: Each product image = 500KB-2MB in DB column (text)
After:  Each product image = ~50 byte URL string in DB column
        Actual image served from CDN via Supabase Storage

Page speed improvement: 3.2MB transfer → ~10KB for product listings
```

