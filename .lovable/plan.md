

## Emails & Notifications Pages — Analysis & Update Plan

### Current State

**Emails Page (`/admin/system-settings/emails`):**
- Email template management with 5 categories (Order, Auth, Marketing, Security, Support)
- Template editor with HTML preview, variable system, default templates
- Create/edit/delete/toggle templates — all functional with DB
- **Issues:** No stats overview, no template preview thumbnails, no search/filter, Refresh button in EmailApiConfig needs removal

**Notifications Page (`/admin/system-settings/notifications`):**
- Email API config (Resend/Gmail) with test email
- 7 notification categories with 30+ toggle switches — all save to `store_settings`
- **Issues:** Refresh button in EmailApiConfig, no search across notifications, no "Enable All / Disable All" per category

### Recommended Updates

#### 1. Email Templates Page Enhancements
- **Add stats cards at top** — Total templates, Active, Inactive, Categories count
- **Add search bar** — Filter templates by name/subject across all categories
- **Add "Preview" button** alongside Edit — quick inline HTML preview without opening full editor
- **Template duplicate button** — Clone an existing template for quick creation

#### 2. Notifications Page Enhancements
- **Remove Refresh button** from EmailApiConfig (matches admin UI standard)
- **Add "Enable All / Disable All" toggle per category** — bulk toggle for each notification group
- **Add search/filter** — quickly find a specific notification across all categories
- **Add email delivery stats card** — Show last test email status, configured provider badge prominently at top

#### 3. Cross-Page Consistency
- Both pages already use `AdminPageHeader` with glassmorphic design — good
- Add consistent stat card styling matching other admin pages

### Technical Details

**Files to modify:**
- `src/components/settings/EmailApiConfig.tsx` — Remove Refresh button (line 222-224)
- `src/components/settings/EmailTemplatesTab.tsx` — Add stats cards, search bar, duplicate & preview buttons
- `src/components/settings/AllEmailNotifications.tsx` — Add search filter, per-category bulk toggle
- `src/pages/system-settings/EmailsPage.tsx` — Minor layout adjustments
- `src/pages/system-settings/NotificationsPage.tsx` — Add top-level provider status indicator

**No DB migrations needed** — all data already exists.

