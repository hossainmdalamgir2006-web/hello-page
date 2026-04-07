

## SQL Schema Export Analysis — Error Testing Results

### ✅ Structure is Complete
The edge function now exports:
- **83 tables** with PRIMARY KEY
- **36 Foreign Keys** with `IF NOT EXISTS` guards
- **16 Unique Constraints** with `IF NOT EXISTS` guards
- **57 Indexes** (non-PK) with `IF NOT EXISTS`
- **179 RLS Policies** with `DROP POLICY IF EXISTS`
- **16 DB Functions** (has_admin_role first)
- **12 Storage Buckets** with `ON CONFLICT DO NOTHING`
- **45 Storage Policies** with `DROP POLICY IF EXISTS`
- **6 Realtime tables**

### ⚠️ 3টি Error পাবে নতুন Project-এ SQL Run করলে

| # | Error | কেন হবে | Fix |
|---|-------|---------|-----|
| 1 | **Functions created before tables** — `log_order_status_change()` references `order_activity_log` table, `get_featured_products_lite()` references `products` table, `validate_coupon()` references `coupons` table | Functions section (step 3) runs BEFORE tables (step 4), কিন্তু কিছু function table reference করে | Functions-কে 2 ভাগে ভাগ করতে হবে: helper functions (has_admin_role, get_2fa_status, etc.) BEFORE tables, আর table-dependent functions (log_order_status_change, get_featured_products_lite, validate_coupon, get_safe_payment_methods, get_safe_user_sessions) AFTER tables |
| 2 | **Helper RPC functions exported** — `get_table_columns`, `get_db_functions`, `get_storage_buckets`, etc. (10টি RPC) নতুন project-এ unnecessary | এগুলো শুধু backup export-এর জন্য, নতুন project-এ দরকার নেই | `get_` prefix ওয়ালা helper RPCs filter out করতে হবে (except `get_2fa_status`, `get_featured_products_lite`, `get_safe_*`) |
| 3 | **`_text` array type** — columns like `tags _text`, `images _text` might not restore correctly as `_text` instead of `text[]` | PostgreSQL internal type name `_text` = `text[]`, কিন্তু `CREATE TABLE` statement-এ `_text` ব্যবহার করলে কাজ করবে, তবে readability issue |  Minor — `_text` → `text[]`, `_uuid` → `uuid[]` mapping add করলে ভালো হয় |

### 🟢 যা ঠিক আছে (আগে Error ছিল, এখন Fix)
- `orders.coupon_id` column এখন exist করে — FK error আসবে না ✅
- `has_admin_role` function tables-এর আগে create হয় ✅
- Enums-এ `IF NOT EXISTS` guard আছে ✅
- Policies-এ `DROP IF EXISTS` আছে ✅

### Fix Plan

**File:** `supabase/functions/database-schema-export/index.ts`

1. **Split functions into 2 groups:**
   - **Pre-table functions** (no table dependencies): `has_admin_role`, `get_2fa_status`
   - **Post-table functions** (reference tables): `log_order_status_change`, `get_featured_products_lite`, `validate_coupon`, `get_safe_payment_methods`, `get_safe_user_sessions`

2. **Filter out helper RPCs** from export:
   - Exclude: `get_table_columns`, `get_table_constraints`, `get_table_indexes`, `get_rls_policies`, `get_db_functions`, `get_db_triggers`, `get_enum_types`, `get_storage_policies`, `get_storage_buckets`

3. **Map internal array types:**
   - `_text` → `text[]`
   - `_uuid` → `uuid[]`
   - `_int4` → `integer[]`
   - `_bool` → `boolean[]`

### SQL Generation Order (Updated)
1. Extensions
2. Enum types (with IF NOT EXISTS)
3. **Pre-table helper functions** (has_admin_role, get_2fa_status only)
4. Tables (with PRIMARY KEY)
5. Unique constraints
6. Foreign key constraints
7. **Post-table functions** (log_order_status_change, validate_coupon, etc.)
8. Indexes
9. Enable RLS
10. RLS Policies
11. Storage Buckets
12. Storage Policies
13. Triggers
14. Realtime Publication

### Files Changed
- `supabase/functions/database-schema-export/index.ts` — function splitting + RPC filtering + array type mapping

