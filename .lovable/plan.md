

## Reports Page — Phase Analysis & Next Steps

### Phase 1 — Real Report Generation ✅ COMPLETE
সব ৬টি রিপোর্ট (Sales, Inventory, Customer, Order, Product, Financial) রিয়েল DB query করে CSV ডাউনলোড করতে পারছে। Stats cards রিয়েল count দেখাচ্ছে। Date filtering কাজ করছে।

### Phase 2 — Persist Reports History (TODO)
**Problem:** Reports শুধু React state-এ থাকে — পেজ রিফ্রেশ করলে সব হারিয়ে যায়।

**Plan:**
- `generated_reports` টেবিল তৈরি করা (id, user_id, name, type, row_count, status, file_url, created_at)
- রিপোর্ট generate হলে metadata DB-তে save করা
- CSV ফাইল `database-backups` storage bucket-এ upload করা (বা নতুন `reports` bucket)
- পেজ লোডে DB থেকে report history fetch করা
- Download বাটন storage থেকে ফাইল আনবে

### Phase 3 — Scheduled Reports (TODO)
**Problem:** Schedule create হয় কিন্তু local state-এ থাকে, কোনো email পাঠায় না।

**Email Integration অলরেডি আছে** — `admin/system-settings/notifications` পেজে Resend/Gmail কনফিগ করা যায় এবং `send-contact-reply` Edge Function দিয়ে email পাঠানো হচ্ছে।

**Plan:**
- `scheduled_reports` টেবিল তৈরি করা (id, user_id, name, type, frequency, recipients, is_active, next_run_at)
- Schedule CRUD DB-তে persist করা
- নতুন Edge Function `send-scheduled-report` তৈরি করা — যেটা:
  1. DB query করে রিপোর্ট generate করবে
  2. CSV attach করে বা link দিয়ে email পাঠাবে (existing email config ব্যবহার করে)
- pg_cron দিয়ে daily check করবে কোন schedule due আছে
- "Coming Soon" badge সরিয়ে functional করা

### Recommended Order
1. **Phase 2 আগে** — কারণ এটা simpler এবং Phase 3-এর জন্যও দরকার
2. **Phase 3 পরে** — email config already আছে, শুধু scheduled execution logic দরকার

### Technical Details
- **New DB table:** `generated_reports` (Phase 2), `scheduled_reports` (Phase 3)
- **New storage bucket:** `reports` (for CSV files)
- **New Edge Function:** `send-scheduled-report` (Phase 3)
- **Modified file:** `src/pages/Reports.tsx`
- **Existing email infra reuse:** `store_settings.email_api_config` থেকে Resend/Gmail credentials পড়া

