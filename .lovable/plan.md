

## Security Vulnerability Fix Plan

### সমস্যা
Security scan-এ **15টি vulnerability** পাওয়া গেছে। মূল কারণ — অনেক table-এর RLS policy শুধু `auth.uid() IS NOT NULL` বা `true` check করে, admin role check করে না।

### সমাধান — Database Migration

একটি single migration-এ সব vulnerable RLS policy fix করা হবে:

#### 1. `store_settings` — SELECT policy fix
- বর্তমান: `USING (true)` (সবাই পড়তে পারে)
- নতুন: সাধারণ settings (store name, currency etc.) সবাই পড়তে পারবে, কিন্তু API keys/secrets শুধু admin

#### 2. `live_chat_conversations` — SELECT/UPDATE policy fix
- SELECT: Customer শুধু নিজের conversation দেখবে (`user_id = auth.uid()`)
- UPDATE: Customer শুধু নিজের conversation update করতে পারবে
- Admin/staff সব দেখতে পারবে

#### 3. `live_chat_messages` — SELECT/UPDATE policy fix
- SELECT: শুধু নিজের conversation-এর messages
- UPDATE: শুধু নিজের পাঠানো messages

#### 4. `abandoned_carts` — SELECT policy fix
- `user_id IS NULL` clause remove
- শুধু নিজের carts দেখতে পারবে

#### 5. `database-backups` storage bucket — policy fix
- SELECT/INSERT/DELETE: শুধু admin (`has_admin_role(auth.uid())`)

#### 6. `page_contents` — INSERT/UPDATE/DELETE policy fix
- Write operations: শুধু admin

#### 7. `brands` — INSERT/UPDATE/DELETE policy fix
- Write operations: শুধু admin

#### 8. `activated_licenses` — full policy fix
- SELECT: শুধু admin
- INSERT/UPDATE: শুধু admin

#### 9. `customer_communication_log` — SELECT policy fix
- শুধু admin পড়তে পারবে

#### 10. `chat-attachments` storage — policy fix
- File path-based access control

#### 11. `store-assets` storage — write policy fix
- Upload/update/delete: শুধু admin

#### 12. Leaked Password Protection
- Enable HIBP check via auth settings

### Files Changed
- 1 database migration (RLS policy updates)
- Auth config update (HIBP)

### Technical Details
- ~15 DROP POLICY + CREATE POLICY statements
- `has_admin_role()` function already exists, reuse করা হবে
- No frontend code changes needed
- No table structure changes

