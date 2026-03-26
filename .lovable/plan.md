

# MyAccount Layout — Admin Panel Style Redesign

## What's Changing
Redesign the customer account sidebar and header to match the admin panel's professional design pattern exactly — same styling, spacing, typography, and interaction patterns.

## Changes

### 1. AccountSidebar.tsx — Match Admin Sidebar Design
- Use `NavLink` component with `activeClassName` instead of manual `isActive` logic (same as admin)
- Add collapsible groups: **Overview**, **Orders**, **Shopping**, **Account**, **Help** (with `Collapsible` component like admin)
- Match admin styling: `bg-sidebar`, `text-sidebar-muted`, `hover:bg-sidebar-accent`, `rounded-lg px-3 py-2.5`
- Store logo/brand at top (fetch from store settings like admin does)
- Remove left-border active indicator → use `bg-sidebar-accent` fill like admin
- Same collapse toggle button styling

### 2. AccountHeader.tsx — Match Admin Header Design
- Add search/command palette button with ⌘K hint (same as admin)
- Professional pill-shaped profile trigger with masked email, role badge ("Customer"), chevron icon
- Dropdown with rich user info header (avatar + name + email)
- Same `sticky top-0 z-30 border-b bg-card` styling
- Remove breadcrumb (admin doesn't have one in header)
- Keep notification bell, theme toggle, store link

### 3. CustomerAccountLayout.tsx — Minor Alignment
- Match admin layout's spacing (`py-6` padding in sidebar, `px-3 sm:px-6` in header)
- Ensure same transition timing and overlay behavior

## SEO & Performance
- No new API calls — reuse existing profile/settings data
- `NavLink` is already imported in project — no new dependencies
- Lazy-loaded pages remain unchanged
- No impact on LCP/CLS — layout structure stays the same

## Files to Modify
- `src/components/account/AccountSidebar.tsx` — full redesign to match admin sidebar
- `src/components/account/AccountHeader.tsx` — redesign to match admin header
- `src/layouts/CustomerAccountLayout.tsx` — minor spacing adjustments

