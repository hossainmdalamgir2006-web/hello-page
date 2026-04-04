

## Notifications → Email Templates — Gap Analysis & Creation Plan

### Current State

**Notifications পেজে ৩৫টি notification type আছে। Email Templates পেজে ২০টি template আছে।**

### Mapping — কোনটা আছে, কোনটা নেই:

| Notification | Template Slug | Status |
|---|---|---|
| **Security (11)** | | |
| Login Alerts | login_alert | ✅ |
| Suspicious Login | — | ❌ Missing |
| New Device Login | — | ❌ Missing |
| Account Locked | lockout_alert | ✅ |
| Account Unlocked | unlock_alert | ✅ |
| Password Changed | — | ❌ Missing (password_reset is different) |
| 2FA Enabled | — | ❌ Missing |
| 2FA Disabled | — | ❌ Missing |
| Session Terminated | — | ❌ Missing |
| IP Blocked | — | ❌ Missing |
| Geo-Block Attempt | — | ❌ Missing |
| **Orders (7)** | | |
| New Order (Admin) | — | ❌ Missing |
| Order Confirmation | order_confirmation | ✅ |
| Order Status Changed | order_status_update | ✅ |
| Order Cancelled | order_cancelled | ✅ |
| Order Refunded | refund_confirmation | ✅ |
| Payment Received | payment_verified | ✅ |
| Payment Failed | — | ❌ Missing |
| **Shipping (4)** | | |
| Order Shipped | shipping_notification | ✅ |
| Order Delivered | delivery_confirmation | ✅ |
| Shipping Delayed | — | ❌ Missing |
| Tracking Updated | — | ❌ Missing |
| **Customers (3)** | | |
| New Customer (Admin) | — | ❌ Missing |
| Welcome Email | welcome_email | ✅ |
| Abandoned Cart | abandoned_cart | ✅ |
| **Reviews (3)** | | |
| New Review (Admin) | — | ❌ Missing |
| Review Approved | — | ❌ Missing |
| Low Rating Alert | — | ❌ Missing |
| **Inventory (3)** | | |
| Low Stock Alert | — | ❌ Missing |
| Out of Stock | — | ❌ Missing |
| Stock Replenished | back_in_stock | ✅ (reuse) |
| **Reports (3)** | | |
| Daily Sales Report | — | ❌ Missing |
| Weekly Summary | — | ❌ Missing |
| Monthly Report | — | ❌ Missing |

### Summary: ২০টি template missing

### Plan

**Step 1 — Create 20 missing email templates via DB insert**

Each template will have:
- Proper slug matching notification ID convention
- Professional HTML body with gradient header (matching existing template style)
- Relevant template variables
- Correct category placement in `EmailTemplatesTab`

**Step 2 — Update `templateCategoryMap` in `EmailTemplatesTab.tsx`**

Add new slugs to correct categories so they appear properly organized.

**Step 3 — Update `categoryIcons` in `EmailTemplatesTab.tsx`**

Map new template slugs to appropriate icons.

### New Templates to Create (20):

**Security (8):** suspicious_login, new_device_login, password_changed, two_factor_enabled, two_factor_disabled, session_terminated, ip_blocked, geo_blocked

**Orders (2):** new_order_admin, payment_failed

**Shipping (2):** shipping_delayed, tracking_updated

**Customers (1):** new_customer_admin

**Reviews (3):** new_review_admin, review_approved, low_rating_alert

**Inventory (2):** low_stock_alert, out_of_stock

**Reports (3):** daily_sales_report, weekly_summary, monthly_report

### Technical Details
- **DB migration:** Insert 20 rows into `email_templates` table
- **Modified file:** `src/components/settings/EmailTemplatesTab.tsx` — update category maps
- All templates follow existing HTML style (gradient header, card layout, responsive)

