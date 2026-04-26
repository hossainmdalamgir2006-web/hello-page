## Admin Panel — Browser Tab Title Audit & Fix

### সমস্যার সারাংশ

`AutoPageTitle.tsx` কম্পোনেন্টের static `pageTitles` map অনুসারে প্রতিটি route এর জন্য browser tab title set হয়। কিন্তু **অনেক admin/manager/support routes এই map-এ নেই** — ফলে সেই pages-এ tab title শুধু store name (যেমন "demo") দেখায়, কোনো page-specific title ছাড়াই।

কিছু route এর path ভুল লেখা হয়েছে (যেমন `/admin/roles` লেখা আছে কিন্তু actual route `/admin/role-management`), আবার কিছু route পুরোনো/deprecated যেগুলো এখন আর exist করে না (যেমন `/admin/inventory`)।

### Audit Result — Admin Pages

| Route | বর্তমান Tab Title | Status |
|---|---|---|
| `/admin/dashboard` | Dashboard \| demo | ✅ আছে |
| `/admin/products` | Products \| demo | ✅ আছে |
| `/admin/categories` | Categories \| demo | ✅ আছে |
| `/admin/brands` | demo (no page name) | ❌ Missing |
| `/admin/orders` | Orders \| demo | ✅ আছে |
| `/admin/analytics` | Analytics \| demo | ✅ আছে |
| `/admin/customers` | Customers \| demo | ✅ আছে |
| `/admin/shipping` | Shipping \| demo | ✅ আছে |
| `/admin/messages` | Messages \| demo | ✅ আছে |
| `/admin/reports` | Reports \| demo | ✅ আছে |
| `/admin/coupons` | Coupons \| demo | ✅ আছে |
| `/admin/abandoned-carts` | Abandoned Carts \| demo | ✅ আছে |
| `/admin/role-management` | demo | ❌ Wrong key (`/admin/roles` mapped, not `/admin/role-management`) |
| `/admin/content` | demo | ❌ Missing |
| `/admin/appearance` | demo | ❌ Missing |
| `/admin/reviews` | demo | ❌ Missing |
| `/admin/trash` | demo | ❌ Missing |
| `/admin/account-deletion-requests` | demo | ❌ Missing |
| `/admin/support-settings` | demo | ❌ Missing |
| `/admin/account-settings` | Account Settings \| demo | ✅ আছে (parent only — sub-routes missing) |
| `/admin/account-settings/personal-info` | demo | ❌ Missing (sub-route) |
| `/admin/account-settings/password` | demo | ❌ Missing |
| `/admin/account-settings/security` | demo | ❌ Missing |
| `/admin/account-settings/login-activity` | demo | ❌ Missing |
| `/admin/system-settings` (parent) | System Settings \| demo | ✅ আছে (redirects, but has key) |
| `/admin/system-settings/store` | demo | ❌ Missing |
| `/admin/system-settings/payments` | demo | ❌ Missing |
| `/admin/system-settings/emails` | demo | ❌ Missing |
| `/admin/system-settings/notifications` | demo | ❌ Missing |
| `/admin/system-settings/security` | demo | ❌ Missing |
| `/admin/system-settings/audit` | demo | ❌ Missing |
| `/admin/system-settings/backup` | demo | ❌ Missing |
| `/admin/system-settings/integrations` | demo | ❌ Missing |
| `/admin/system-settings/edge-functions` | demo | ❌ Missing |
| `/admin/system-settings/documents` | demo | ❌ Missing (এটার শুধু `SEOHead` direct ব্যবহার আছে — kintu admin page গুলো `noIndex` থাকা উচিত, AutoPageTitle এই pattern follow করছে) |

### Audit Result — Manager Pages

| Route | Status |
|---|---|
| `/manager/dashboard`, `/orders`, `/products`, `/customers`, `/messages`, `/account-settings`, `/shipping`, `/coupons`, `/reports`, `/analytics` | ✅ আছে |
| `/manager/trash` | ❌ Missing |
| `/manager/settings` | ❌ Missing |
| `/manager/account-settings/*` (sub-routes) | ❌ Missing |

### Audit Result — Support Pages

| Route | Status |
|---|---|
| `/support/dashboard`, `/orders`, `/customers`, `/messages`, `/account-settings`, `/settings` | ✅ আছে |
| `/support/account-settings/*` (sub-routes) | ❌ Missing |

### Stale / Wrong Entries (cleanup)

- `/admin/inventory`, `/manager/inventory` → route exist করে না, map থেকে remove
- `/admin/roles` → wrong path, replace with `/admin/role-management`

### Solution Approach

**Approach: Static Map Update (recommended)**
`AutoPageTitle.tsx` এর `pageTitles` map-এ সব missing routes add করা + wrong/stale entries fix করা। এটাই simplest, predictable এবং existing pattern follow করে। Sub-routes-এর জন্য path matching logic সামান্য enhance করব যাতে nested routes (যেমন `/admin/account-settings/security`) properly resolve হয়।

**Sub-route handling logic**: প্রথমে exact path match try করব, না পেলে sub-route prefixes check করব (longest match wins) — এতে dynamic future routes-ও gracefully handle হবে।

### কী কী Change হবে

**File: `src/components/AutoPageTitle.tsx`**

1. **Admin section-এ যোগ করব:**
   - `/admin/brands` → "Brands"
   - `/admin/role-management` → "Role Management" (replace wrong `/admin/roles`)
   - `/admin/content` → "Content Manager"
   - `/admin/appearance` → "Appearance"
   - `/admin/reviews` → "Reviews"
   - `/admin/trash` → "Trash"
   - `/admin/account-deletion-requests` → "Deletion Requests"
   - `/admin/support-settings` → "Support Settings"
   - সব `/admin/system-settings/*` sub-routes → "Store Settings", "Payments", "Emails", "Notifications", "Security", "Audit Log", "Backup", "Integrations", "Edge Functions", "Document Templates"
   - সব `/admin/account-settings/*` sub-routes → "Personal Info", "Password", "Security", "Login Activity"

2. **Manager section-এ যোগ করব:**
   - `/manager/trash` → "Trash"
   - `/manager/settings` → "Settings"
   - `/manager/account-settings/*` sub-routes (same as admin)

3. **Support section-এ যোগ করব:**
   - `/support/account-settings/*` sub-routes (same as admin)

4. **Cleanup:**
   - Remove `/admin/inventory`, `/manager/inventory` (deprecated)
   - Replace `/admin/roles` → `/admin/role-management`

5. **Logic enhancement (small):** sub-route prefix matching যোগ করব যাতে map-এ পরে কোনো dynamic admin sub-route আসলেও parent title fallback হয়। তবে exact match সর্বদা priority পাবে।

### Result (after fix)

প্রত্যেকটি admin/manager/support page এ proper browser tab title দেখাবে যেমন:
- "Brands | demo"
- "Content Manager | demo"
- "Store Settings | demo"
- "Personal Info | demo" (account-settings sub-route)
- "Edge Functions | demo"

### Files Edited

- `src/components/AutoPageTitle.tsx` (single file, additive changes — কোনো breaking change নেই)
