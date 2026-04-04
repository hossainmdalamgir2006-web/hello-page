

## Email Templates — Professional Design Upgrade

### Problem
৪০টি ইমেইল টেমপ্লেটের মধ্যে মাত্র ১১টি professional design-এ আছে। বাকি ২৯টি হয় basic (`<h2>emoji</h2><p>text</p>`) অথবা semi-professional (gradient header আছে কিন্তু full structure নেই)।

### Design Levels Found

| Level | Count | Templates |
|-------|-------|-----------|
| **Professional** ✅ | 11 | abandoned_cart, contact_reply, delivery_confirmation, lockout_alert, login_alert, order_confirmation, password_reset, review_request, shipping_notification, unlock_alert, welcome_email |
| **Semi** (gradient header only) | 20 | daily_sales_report, geo_blocked, ip_blocked, low_rating_alert, low_stock_alert, monthly_report, new_customer_admin, new_device_login, new_order_admin, new_review_admin, out_of_stock, password_changed, payment_failed, review_approved, session_terminated, shipping_delayed, suspicious_login, tracking_updated, two_factor_disabled, two_factor_enabled, weekly_summary |
| **Basic** (no styling) | 9 | back_in_stock, coupon_promo, email_verification_otp, order_cancelled, order_status_update, payment_verified, refund_confirmation, return_request, wishlist_price_drop |

### Unified Professional Template Structure

Every template will follow this consistent structure:

```text
┌─────────────────────────────────────┐
│  #f3f4f6 background                │
│  ┌───────────────────────────────┐  │
│  │  Store Logo (centered)        │  │
│  ├───────────────────────────────┤  │
│  │  Gradient Header Banner       │  │
│  │  (category-specific color)    │  │
│  │  Title + Subtitle             │  │
│  ├───────────────────────────────┤  │
│  │  White Card Body              │  │
│  │  - Greeting                   │  │
│  │  - Content with styled info   │  │
│  │    boxes (light bg, border)   │  │
│  │  - CTA Button (if needed)    │  │
│  ├───────────────────────────────┤  │
│  │  Footer: store name, year,    │  │
│  │  unsubscribe link             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Category Color Scheme (consistent gradients)

- **Order/Shipping:** `#10b981 → #059669` (emerald)
- **Auth:** `#6366f1 → #4f46e5` (indigo)
- **Security:** `#ef4444 → #dc2626` (red)
- **Marketing:** `#8b5cf6 → #7c3aed` (purple)
- **Reports:** `#6366f1 → #4f46e5` (indigo)
- **Inventory:** `#f59e0b → #d97706` (amber)
- **Support:** `#3b82f6 → #2563eb` (blue)

### Plan

**Step 1 — Update 9 basic templates** via DB migration
Rewrite with full professional HTML: DOCTYPE, meta viewport, outer container, white card with box-shadow, gradient header, styled content with info boxes, footer.

**Step 2 — Update 20 semi templates** via DB migration
Upgrade from simple `<div>` wrapper to full professional structure: add DOCTYPE, meta tags, outer background container, box-shadow, proper padding, styled info sections (replacing plain `<ul><li>`), CTA buttons where relevant, consistent footer.

### Templates to Update (29 total)

**Basic → Professional (9):**
back_in_stock, coupon_promo, email_verification_otp, order_cancelled, order_status_update, payment_verified, refund_confirmation, return_request, wishlist_price_drop

**Semi → Professional (20):**
daily_sales_report, geo_blocked, ip_blocked, low_rating_alert, low_stock_alert, monthly_report, new_customer_admin, new_device_login, new_order_admin, new_review_admin, out_of_stock, password_changed, payment_failed, review_approved, session_terminated, shipping_delayed, suspicious_login, tracking_updated, two_factor_disabled, two_factor_enabled, weekly_summary

### Technical Details
- **DB migration only** — 29 UPDATE statements to `email_templates.body_html`
- Each template ~1200-1800 chars of professional HTML
- No code file changes needed
- Consistent inline CSS (email-safe, no external stylesheets)
- All existing `{{variables}}` preserved exactly

