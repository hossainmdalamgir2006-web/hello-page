

# Product Description — Image Size Fix & Video Support Check

## সমস্যা
1. **Description-এ image অনেক বড় দেখাচ্ছে** — prose classes আছে কিন্তু `max-width` constraint যথেষ্ট না
2. **Description-এ video দেখা যাচ্ছে না** — Rich text editor-এ video insert feature আছে (YouTube/URL), কিন্তু user হয়তো ব্যবহার করছে না অথবা rendering-এ সমস্যা

## Plan

### 1. Description-এর image size সুন্দর ও standard করা
`src/pages/store/ProductDetail.tsx` — line 540-553 এর prose classes update:
- Image max-width `max-w-2xl` (672px) সেট করা — centered
- Image `object-contain` দিয়ে aspect ratio রক্ষা
- Better spacing ও rounded corners
- ছোট images ছোটই থাকবে, বড় images max-width-এ clip হবে

### 2. Video rendering নিশ্চিত করা
- Rich text editor ইতিমধ্যে video embed করে `<iframe>` দিয়ে (YouTube) এবং responsive wrapper (`padding-bottom: 56.25%`) দিয়ে
- Description render-এ `[&_iframe]` CSS rules আছে, কিন্তু inline style wrapper (`position:relative;padding-bottom:56.25%`) কে সঠিকভাবে handle করা দরকার
- `[&_div[style]]` CSS rule যোগ করে inline-style video containers ঠিক করা

### Technical detail
**File**: `src/pages/store/ProductDetail.tsx` (line ~541-552)

Image CSS changes:
- Add `prose-img:max-w-2xl` (max 672px width)
- Keep `prose-img:mx-auto prose-img:block` for centering
- Add `prose-img:object-contain` for proper scaling

Video CSS changes:  
- Ensure `[&_div]:has(iframe)` or the existing inline-style video wrappers render properly
- Keep existing `[&_iframe]` rules, add `[&_div[style*="padding-bottom"]]:max-w-2xl [&_div[style*="padding-bottom"]]:mx-auto` for video container centering

**Also update** `src/components/products/ProductViewModal.tsx` — same prose classes for admin preview consistency

