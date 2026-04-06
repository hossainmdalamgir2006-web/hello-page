

## আপনার Setup-এ যে সমস্যাগুলো আছে

### 🔴 CRITICAL — SERVICE_ROLE_KEY GitHub-এ Exposed

আপনার `.env` ফাইল GitHub-এ push হয়ে গেছে এবং সেখানে `SUPABASE_SERVICE_ROLE_KEY` আছে। এটি **অত্যন্ত বিপজ্জনক**। এই key দিয়ে যে কেউ আপনার সব data read/write/delete করতে পারবে, RLS bypass করে। 

**এখনই করতে হবে:**
1. Supabase Dashboard → Settings → API Keys → service_role key **regenerate** করুন
2. GitHub repo থেকে `.env` ফাইল **মুছে ফেলুন**
3. `.gitignore`-এ `.env` যোগ করুন (বর্তমানে `.env` gitignore-এ নেই!)
4. Vercel-এ Environment Variables হিসেবে set করুন, `.env` ফাইলে না রেখে

### 🟡 সমস্যা ১: শুধু ৩টি Edge Function Deploy হয়েছে

আপনার codebase-এ **26টি** edge function আছে কিন্তু Supabase-এ মাত্র **3টি** deploy করা হয়েছে (database-backup, database-restore, delete-user-account)। বাকি 23টি deploy না হওয়ায় সেগুলো call করলে error আসবে।

**সমাধান:** Supabase CLI দিয়ে সব function deploy করতে হবে:
```bash
supabase functions deploy --project-ref yjubybsqtnwirlqtacdn
```

### 🟡 সমস্যা ২: Database Migrations চালানো হয়নি

Dashboard-এ "No migrations" দেখাচ্ছে। এর মানে আপনার database-এ কোনো table, RLS policy, function তৈরি হয়নি। এজন্য edge functions কাজ করলেও data-related operations fail করবে।

**সমাধান:**
```bash
supabase db push --project-ref yjubybsqtnwirlqtacdn
```

### 🟡 সমস্যা ৩: `.gitignore`-এ `.env` নেই

বর্তমান `.gitignore` ফাইলে `.env` entry নেই। তাই `.env` ফাইল Git-এ track হচ্ছে এবং GitHub-এ push হয়ে যাচ্ছে।

**Fix:** `.gitignore`-এ `.env` লাইন যোগ করতে হবে।

### 🟢 Vercel Environment Variables Setup

Vercel-এ এই variables গুলো Environment Variables হিসেবে set করুন (`.env` ফাইলে রাখবেন না):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Note: `SUPABASE_SERVICE_ROLE_KEY` শুধু Edge Functions-এর Secrets-এ থাকবে, Vercel বা frontend-এ কখনো না।

---

### সারাংশ — যা করতে হবে (ক্রমানুসারে)

| # | কাজ | Priority |
|---|------|----------|
| 1 | GitHub থেকে `.env` মুছুন, `.gitignore`-এ `.env` যোগ করুন | URGENT |
| 2 | Supabase service_role key regenerate করুন | URGENT |
| 3 | `supabase db push` চালিয়ে migrations apply করুন | High |
| 4 | `supabase functions deploy` চালিয়ে সব edge function deploy করুন | High |
| 5 | Vercel Environment Variables configure করুন | High |

### আমি কী করতে পারি

- `.gitignore`-এ `.env` যোগ করে দিতে পারি
- এটুকুই — বাকি কাজগুলো (deploy, push, key regenerate) আপনাকে আপনার terminal বা Supabase dashboard থেকে করতে হবে

