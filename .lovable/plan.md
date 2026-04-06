

## Security Scan Results — 12টি Issue পাওয়া গেছে

### 🔴 Critical (6টি)

| # | Issue | Risk |
|---|-------|------|
| 1 | **password_history** — admin-রা password hashes পড়তে পারে | Password hash leak → offline attack |
| 2 | **two_factor_auth** — TOTP secrets ও backup codes admin API-তে accessible | Admin compromise = সব account takeover |
| 3 | **recovery_codes** — plaintext recovery codes admin-রা পড়তে পারে | Recovery code = password equivalent |
| 4 | **pathao_settings / steadfast_settings** — API credentials DB-তে readable | Third-party API abuse |
| 5 | **enabled_payment_methods** — `account_details` JSONB publicly readable | Payment credentials leak |
| 6 | **user_sessions** — `session_token` column users ও admins দেখতে পারে | Session hijacking |

### 🟡 Warning (6টি)

| # | Issue | Risk |
|---|-------|------|
| 7 | **chat-attachments** SELECT — যেকোনো authenticated user সব attachment দেখতে পারে | |
| 8 | **chat-attachments** INSERT — ownership check নেই | |
| 9 | **avatars** UPDATE/DELETE — যেকোনো user অন্যের avatar মুছতে পারে | |
| 10 | **Realtime channels** — subscription-এ কোনো restriction নেই | |
| 11 | **review-media** INSERT — path-based ownership check নেই | |
| 12 | **coupons** — internal fields (max_uses, used_count) publicly visible | |

---

### Fix Plan — Database Migration

#### Fix 1-3: Sensitive auth tables — Remove admin SELECT, add security definer functions

```sql
-- password_history: Remove admin read, create function for password check only
-- two_factor_auth: Remove admin SELECT on secret/backup_codes, create safe status function
-- recovery_codes: Remove admin SELECT, only owner can read at generation time
```

- Admin-দের `secret`, `backup_codes`, `password_hash` columns সরাসরি দেখার দরকার নেই
- SECURITY DEFINER function দিয়ে শুধু verify/status check করা যাবে

#### Fix 4: Courier API credentials — Restrict to admin-only (already are, but should move to vault)

- Short-term: policy ঠিক আছে, কিন্তু note রাখা হবে যে এগুলো vault-এ যাওয়া উচিত
- এই tables শুধু admin read/write — current risk হলো admin account compromise

#### Fix 5: enabled_payment_methods — Hide account_details from public

```sql
-- Public SELECT policy: account_details column exclude করা যাবে না RLS দিয়ে
-- Solution: SECURITY DEFINER function যেটা account_details ছাড়া return করে
-- অথবা: public SELECT-এ condition add: auth.uid() IS NOT NULL
```

#### Fix 6: user_sessions — session_token hide

```sql
-- Create a view/function that returns sessions WITHOUT session_token
-- Or: remove session_token from SELECT columns via a security definer function
```

#### Fix 7-8: chat-attachments — Conversation-based access

```sql
-- SELECT: user must be participant of the conversation (path-based check)
-- INSERT: file path must include auth.uid()
```

#### Fix 9: avatars — Path-based ownership

```sql
DROP POLICY "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY "Users can delete own avatar" ON storage.objects;  
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Fix 10: Realtime — Note only (cannot add RLS to realtime.messages via migration)

- Realtime channel security Supabase internally manage করে — RLS on source tables already covers data
- Table-level RLS already enforced, so realtime only delivers what RLS allows

#### Fix 11: review-media — Path-based INSERT

```sql
DROP POLICY "Authenticated users can upload review media" ON storage.objects;
CREATE POLICY "Users can upload own review media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-media' AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

#### Fix 12: coupons — Restrict public fields

```sql
-- Create a security definer function that returns only safe coupon fields
-- Or update SELECT policy to require authentication
```

### Technical Details
- 1 database migration
- ~20 DROP/CREATE POLICY statements
- 2-3 SECURITY DEFINER functions (safe_payment_methods, safe_user_sessions, check_2fa_status)
- No frontend code changes needed (functions return same shape minus sensitive columns)
- No table structure changes

### Files Changed
- 1 new migration file

