

## Audit Log Page — Analysis & Update Plan

### Current State Summary

**Audit UI (AuditLogTab.tsx):** Fully functional — search, filters, pagination, detail dialog, staff activity summary, CSV export all work. No UI bugs.

**Audit Logging Coverage — What's Tracked vs Missing:**

| Tracked ✅ | Missing ❌ |
|------------|-----------|
| Order status/payment changes | Coupon CRUD |
| Product create/update/delete | Shipping zone/rate changes |
| Customer update/status/merge | Settings changes (store, payment, security, notifications) |
| Category create/update | Carousel/homepage section edits |
| Brand create/update | Support ticket actions |
| Role changes | Login/logout events |
| | Review moderation |
| | Backup creation |
| | Trash restore/permanent delete |

### Recommended Updates

#### 1. Expand Audit Logging Coverage (Priority)
Add `logAuditAction()` calls to these hooks/pages that currently have NO audit tracking:

- **Coupons** — admin coupon pages (create, update, delete, toggle active)
- **Shipping** — `useShippingData.ts`, `useShippingZones.ts`, `useShippingRates.ts` (zone/rate CRUD)
- **Settings** — store settings, payment method config, security rules, notification config changes
- **Homepage** — carousel slide CRUD, homepage section updates
- **Support** — ticket status changes, assignments
- **Reviews** — approve/reject/delete actions
- **Trash** — restore and permanent delete actions in `useGlobalTrash.ts`
- **Backup** — backup creation events

#### 2. Audit Log UI Enhancements (Nice-to-have)
- **Stats cards at top** — Total logs today, most active user, most common action, unique users active
- **CSV Export button** — Currently missing from the audit page itself (DataExport component exists but isn't used here)
- **"Clear All Filters" visual indicator** — Show active filter count on the Filters button
- **Resource filter dropdown** — Add missing resource types: `brand`, `coupon`, `carousel`, `shipping`, `review`, `backup`

### Technical Details

**Files to modify for logging coverage:**
- `src/pages/Coupons.tsx` or coupon hook — add logAuditAction for CRUD
- `src/hooks/useShippingData.ts` / `useShippingZones.ts` / `useShippingRates.ts`
- `src/components/settings/PaymentSettings.tsx` — payment method changes
- `src/components/settings/IPSecuritySettings.tsx` — security rule changes
- Store settings page — store config saves
- `src/hooks/useGlobalTrash.ts` — restore/permanent delete
- Homepage management pages — carousel/section CRUD
- Support ticket hooks — status/assignment changes

**Files to modify for UI enhancements:**
- `src/components/settings/AuditLogTab.tsx` — add stats cards, export button, update resource filter list

**No DB migrations needed** — the `audit_logs` table schema already supports all fields.

