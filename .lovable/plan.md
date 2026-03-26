

# Profile Page — Settings-Style Sidebar Layout Redesign

## What's Changing
Restructure the Profile page from a single long page with a 2-column card grid into a **sidebar + sub-pages layout** matching the Settings page pattern exactly (like `SettingsLayout.tsx`).

## Current State
- Profile page is one monolithic 639-line file with 8 cards in a 2-column grid: Avatar, Personal Info, Change Email, Change Password, 2FA, Recovery Codes, Trusted Devices, Session Management, Login Activity
- All content loads at once on a single scroll

## New Structure

```text
/admin/profile          → redirects to /admin/profile/personal
/admin/profile/personal → Avatar + Personal Info + Change Email
/admin/profile/password → Change Password (with strength indicator)
/admin/profile/security → 2FA + Recovery Codes + Trusted Devices
/admin/profile/sessions → Session Management + Login Activity
```

### Sidebar Navigation (matches Settings pattern)
| Route | Label | Icon |
|-------|-------|------|
| /admin/profile/personal | Personal Info | User |
| /admin/profile/password | Password | Lock |
| /admin/profile/security | Security | Shield |
| /admin/profile/sessions | Sessions | Monitor |

## Files to Create
1. **`src/layouts/ProfileLayout.tsx`** — Sidebar layout with NavLink navigation (copy SettingsLayout.tsx pattern exactly: horizontal scroll on mobile, vertical sidebar on desktop)
2. **`src/pages/profile/PersonalInfoPage.tsx`** — Avatar + Personal Info + Change Email cards
3. **`src/pages/profile/PasswordPage.tsx`** — Change Password card with strength indicator
4. **`src/pages/profile/SecurityPage.tsx`** — 2FA + Recovery Codes + Trusted Devices
5. **`src/pages/profile/SessionsPage.tsx`** — Session Management + Login Activity

## Files to Modify
1. **`src/pages/Profile.tsx`** — Keep as a thin wrapper or remove (redirect handled by layout)
2. **`src/App.tsx`** — Add nested routes under `/admin/profile/*` using ProfileLayout

## Technical Details
- Extract existing code sections from Profile.tsx into sub-page components (no logic changes, just splitting)
- ProfileLayout.tsx will be nearly identical to SettingsLayout.tsx structure
- Each sub-page gets its own header title (e.g., "Personal Information" / "Manage your profile details")
- Mobile: horizontal scrolling nav tabs, Desktop: vertical sidebar — same as Settings

