

## Security Scan Results — 7 Issues Found

### 🔴 Critical (4টি)

| # | Issue | Risk |
|---|-------|------|
| 1 | **store_settings API credentials publicly readable** | PATHAO_CLIENT_SECRET, PATHAO_PASSWORD uppercase হওয়ায় lowercase LIKE filter (`%secret%`) bypass করছে |
| 2 | **chat-attachments readable by any authenticated user** | যেকোনো logged-in user অন্যের private chat files দেখতে পারে |
| 3 | **Realtime channels have no access control** | notifications, live_chat — যেকোনো user subscribe করে অন্যের data পেতে পারে |
| 4 | **abandoned_carts UPDATE has no ownership check** | যেকোনো anonymous user অন্যের cart modify করতে পারে |

### 🟡 Warning (3টি)

| # | Issue | Risk |
|---|-------|------|
| 5 | **avatars/product-images/brand-logos storage** — any authenticated user can delete/overwrite | |
| 6 | **orders INSERT** — no user_id = auth.uid() check | অন্যের নামে order create করা যায় |
| 7 | **support_tickets INSERT** — no user_id check | অন্যের নামে ticket create করা যায় |

---

### Fix Plan — Single Database Migration

#### Fix 1: store_settings — Case-insensitive filter + allowlist approach
```sql
DROP POLICY "Public can read non-sensitive settings" ON store_settings;
CREATE POLICY "Public can read non-sensitive settings" ON store_settings
  FOR SELECT USING (
    has_admin_role(auth.uid()) OR
    (key NOT ILIKE '%api%' AND key NOT ILIKE '%secret%' 
     AND key NOT ILIKE '%token%' AND key NOT ILIKE '%password%'
     AND key NOT ILIKE '%client_id%' AND key NOT ILIKE '%username%')
  );
```

#### Fix 2: chat-attachments — Owner-only access
```sql
-- Drop existing SELECT policy, create path-based one
-- Only allow if file path starts with user's conversation folder
```

#### Fix 3: Realtime — Enable RLS on realtime channels
- Add authorization checks via Supabase Realtime RLS (channel-level auth policies)

#### Fix 4: abandoned_carts UPDATE — Add ownership check
```sql
DROP POLICY "Anyone can update abandoned carts" ON abandoned_carts;
CREATE POLICY "Users can update own abandoned carts" ON abandoned_carts
  FOR UPDATE USING (
    has_admin_role(auth.uid()) OR 
    (user_id = auth.uid() AND user_id IS NOT NULL)
  );
```

#### Fix 5: Storage buckets — Admin-only write for media buckets, path-based for avatars
- `avatars`: write restricted to `auth.uid()` path
- `product-images`, `product-videos`, `brand-logos`, `category-images`: admin-only write

#### Fix 6: orders INSERT — Add user_id ownership check
```sql
-- Update INSERT policy to include: user_id IS NULL OR auth.uid() = user_id
```

#### Fix 7: support_tickets INSERT — Add user_id check
```sql
-- Update INSERT policy to include: user_id IS NULL OR auth.uid() = user_id
```

### Technical Details
- 1 database migration file
- ~15 DROP/CREATE POLICY statements
- No frontend code changes
- No table structure changes
- `ILIKE` used instead of `LIKE` for case-insensitive matching

