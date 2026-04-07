

## SQL Schema Export — নতুন ফাইলে যা Missing আছে

### তুলনা: পুরাতন (126 KB, 3969 lines) vs নতুন (72.6 KB, 1770 lines)

নতুন ফাইলটি `database-schema-export` edge function দিয়ে generate হয়েছে, কিন্তু এই function অনেক কিছু export করে না। পুরাতন ফাইলটি আলাদা (আরও complete) function দিয়ে তৈরি হয়েছিল।

### ❌ নতুন SQL-এ যা নেই (7টি বড় সমস্যা):

| # | Missing Item | Impact |
|---|-------------|--------|
| 1 | **PRIMARY KEY** constraints | Tables-এ কোনো primary key নেই — data integrity ভাঙবে |
| 2 | **FOREIGN KEY** constraints | Table relationships নেই — orders→customers, order_items→orders ইত্যাদি |
| 3 | **UNIQUE constraints** | Duplicate data ঢুকবে — email, slug, order_number ইত্যাদিতে |
| 4 | **INDEXES** | Queries অত্যন্ত slow হবে — ~50+ indexes missing |
| 5 | **Storage buckets + policies** | File upload/download কাজ করবে না — 12টি bucket ও ~40+ storage policies missing |
| 6 | **Extensions** (uuid-ossp, pgcrypto) | `gen_random_uuid()` কাজ নাও করতে পারে |
| 7 | **Realtime publication** | Live chat, notifications realtime update হবে না |
| 8 | **DROP POLICY IF EXISTS** | Re-run করলে duplicate policy error আসবে |
| 9 | **IF NOT EXISTS for enums** | Re-run করলে "type already exists" error আসবে |
| 10 | **Security definer functions** (get_2fa_status, get_safe_payment_methods, get_safe_user_sessions, validate_coupon) | নতুন ফাইলে আছে, কিন্তু `has_admin_role` function tables-এর আগে create হয়নি |

### ✅ নতুন SQL-এ যা আছে:
- সব tables (columns সহ) ✅
- RLS policies ✅ (কিন্তু DROP IF EXISTS ছাড়া)
- Functions ✅
- Triggers ✅
- Enums ✅

### সমাধান: Edge Function সম্পূর্ণভাবে Rewrite করতে হবে

`database-schema-export` edge function-এ নিচের sections যোগ করতে হবে:

1. **Extensions** — `CREATE EXTENSION IF NOT EXISTS`
2. **Enum types** — `DO $$ BEGIN IF NOT EXISTS...` wrapper সহ
3. **Helper functions** — `has_admin_role` tables-এর আগে
4. **Tables** — PRIMARY KEY সহ (বর্তমানে PK missing)
5. **Foreign keys** — `get_table_constraints` থেকে FK filter করে, `IF NOT EXISTS` wrapper সহ
6. **Unique constraints** — same constraint data থেকে UNIQUE filter
7. **Indexes** — `get_table_indexes` data ব্যবহার করে `CREATE INDEX IF NOT EXISTS`
8. **RLS enable** — সব tables-এ
9. **RLS policies** — `DROP POLICY IF EXISTS` + `CREATE POLICY` 
10. **Storage buckets** — `get_storage_policies` RPC + bucket creation SQL
11. **Storage policies** — storage.objects-এ policies
12. **Realtime** — `ALTER PUBLICATION supabase_realtime ADD TABLE`

### Technical Plan

**File:** `supabase/functions/database-schema-export/index.ts` — complete rewrite

The edge function will generate SQL in this order (matching the old file structure):
1. Extensions section
2. Enum types with `IF NOT EXISTS` guards  
3. Helper functions (has_admin_role first, then others)
4. Tables with PRIMARY KEY in CREATE TABLE
5. Foreign key constraints with `IF NOT EXISTS` guards
6. Unique constraints with `IF NOT EXISTS` guards
7. Indexes with `IF NOT EXISTS`
8. Enable RLS on all tables
9. RLS policies with `DROP POLICY IF EXISTS` before each `CREATE POLICY`
10. Storage bucket creation
11. Storage policies with `DROP POLICY IF EXISTS`
12. Realtime publication

New RPC needed: `get_storage_buckets` — to list storage buckets (or query directly via service role).

Key changes in SQL generation logic:
- Parse `constraint_type = 'PRIMARY KEY'` from `get_table_constraints` to add PKs inside CREATE TABLE
- Parse `constraint_type = 'FOREIGN KEY'` for FK section
- Parse `constraint_type = 'UNIQUE'` for unique constraints section  
- Use `get_table_indexes` for indexes section
- Use `get_storage_policies` for storage policies
- Add hardcoded realtime tables list (live_chat_conversations, live_chat_messages, notifications, admin_presence)

### Files Changed
- `supabase/functions/database-schema-export/index.ts` — complete rewrite
- 1 database migration — add `get_storage_buckets` RPC function

