

## Admin Panel UI/UX Audit & Settings Page Restructure

### Findings

#### A. Page Header Inconsistency
Every admin page has a slightly different header pattern:

| Page | Pattern | Issue |
|------|---------|-------|
| Products, Orders, Settings, Customers, Categories, Brands, GlobalTrash, Reviews | `font-display text-2xl font-bold text-foreground` | Correct baseline |
| Messages | `text-xl sm:text-2xl md:text-3xl font-bold` | Missing `font-display`, different sizing |
| HomepageManager | `text-2xl font-bold` | Missing `font-display`, `text-foreground` |
| PageContentManager | `text-2xl font-bold` | Missing `font-display`, `text-foreground`, has inline icon |
| AppearanceManager | `text-2xl font-display font-bold` | Bengali subtitle text mixed in |
| AbandonedCarts, GlobalTrash | Has inline icon in h1 | Inconsistent with others |

#### B. Settings Page — Currently 8 Tabs in One Page
The current tab-based approach is cramped on mobile (8 tabs in a grid) and makes the URL non-bookmarkable. Converting to **separate sub-pages with a sidebar/nav** is the professional pattern (like Shopify, WordPress admin settings).

#### C. Wrapper Spacing Inconsistency
- Some pages use `space-y-6`, others `space-y-4 sm:space-y-6`
- Some headers use `flex items-center justify-between`, others `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`

---

### Implementation Plan

#### Phase 1: Convert Settings into Sub-Pages (Biggest Impact)

**New route structure:**
```
/admin/settings          → Redirect to /admin/settings/store
/admin/settings/store    → StoreSettingsTab
/admin/settings/payments → PaymentSettings
/admin/settings/emails   → EmailTemplatesTab
/admin/settings/notifications → EmailApiConfig + AllEmailNotifications
/admin/settings/security → IPSecuritySettings + AccountLockouts + BlockedLoginAttempts
/admin/settings/audit    → AuditLogTab
/admin/settings/backup   → BackupSettings
/admin/settings/integrations → IntegrationsSettings + AutoReply + CannedResponses
```

**New `SettingsLayout.tsx`** — a nested layout with:
- Left sidebar navigation (icons + labels, vertical list)
- Active state highlighting
- Collapses to horizontal scroll on mobile
- Each sub-page wrapped in consistent Card with title/description
- Save button stays in the Store settings page only (where it's needed)

**Files:**
- Create `src/layouts/SettingsLayout.tsx` — sidebar + Outlet
- Create 8 page files in `src/pages/settings/` (one per section)
- Refactor `src/pages/Settings.tsx` → thin redirect
- Update `src/App.tsx` — nested routes under `/admin/settings`
- Update `AdminSidebar.tsx` — Settings link stays the same (points to `/admin/settings`)

#### Phase 2: Standardize All Page Headers

Create a reusable `AdminPageHeader` component:
```tsx
// src/components/admin/AdminPageHeader.tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
  {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
</div>
```

Apply to all 15+ admin pages for consistent headers.

**Pages to update:** Messages, HomepageManager, PageContentManager, AppearanceManager, AbandonedCarts, GlobalTrash (remove inline icons from h1)

#### Phase 3: Standardize Page Wrapper Spacing

All admin pages should use the same root wrapper:
```tsx
<div className="space-y-6">
  <AdminPageHeader ... />
  {/* content */}
</div>
```

Fix pages that use `space-y-4` or inconsistent gap patterns.

#### Phase 4: Fix Specific Issues
- Remove Bengali text from AppearanceManager subtitle
- Ensure all table pages have consistent search bar + filter + action button layout
- Ensure all stat cards use the same Card pattern (some use bare divs, others use Card components)

### Files Changed Summary
- **New:** `src/layouts/SettingsLayout.tsx`, `src/components/admin/AdminPageHeader.tsx`
- **New:** 8 files in `src/pages/settings/` (StorePage, PaymentsPage, EmailsPage, NotificationsPage, SecurityPage, AuditPage, BackupPage, IntegrationsPage)
- **Updated:** `src/App.tsx` (settings sub-routes)
- **Updated:** `src/pages/Settings.tsx` (redirect only)
- **Updated:** ~8 admin pages for header consistency (Messages, HomepageManager, PageContentManager, AppearanceManager, AbandonedCarts, GlobalTrash, etc.)

