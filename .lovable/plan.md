

# Sessions Sidebar — Expandable Sub-items (Active Sessions, Login Activity)

## What's Changing
Make the "Sessions" item in the Profile sidebar expandable with sub-items: **Active Sessions** and **Login Activity**, matching the collapsible group pattern used in the admin sidebar.

## Approach
- Convert Sessions from a single NavLink to a collapsible group in `ProfileLayout.tsx`
- Split into two sub-routes: `/profile/sessions/active` and `/profile/sessions/activity`
- Create two small sub-page components
- Update `App.tsx` routes accordingly

## Files to Modify

### 1. `src/layouts/ProfileLayout.tsx`
- Import `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` and `ChevronDown`
- Replace the Sessions NavLink with a collapsible section that expands on click
- Show two sub-items: "Active Sessions" (Monitor icon) and "Login Activity" (History icon)
- Auto-expand when current route matches `/profile/sessions/*`

### 2. `src/pages/profile/SessionsPage.tsx`
- Convert to a layout wrapper with `<Outlet />` and redirect `/sessions` → `/sessions/active`

### 3. `src/pages/profile/SessionsActivePage.tsx` (New)
- Renders `<SessionManagement />` only

### 4. `src/pages/profile/SessionsActivityPage.tsx` (New)
- Renders `<LoginActivity />` only

### 5. `src/App.tsx`
- Add nested routes under `profile/sessions`: `active` and `activity`
- Apply to all role prefixes (admin/manager/support)

