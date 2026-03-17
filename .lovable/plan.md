

# MyAccount Panel Professional Makeover

After reviewing the current implementation, here are the key areas to improve for a polished, professional customer account panel:

## Current Issues
- Sidebar has no user profile card (just brand logo)
- Header is basic — no page description shown
- Dashboard stats cards lack visual hierarchy
- No smooth page transitions between routes
- Notification page has no page header consistency
- Sidebar active state uses basic background — needs left accent indicator
- No subtle border/shadow separation between sidebar and content
- Content area padding inconsistent on different pages

## Plan

### 1. Sidebar: Add User Profile Card + Polish Active States
**File: `src/components/account/AccountSidebar.tsx`**
- Add a compact user avatar + name + email card below the brand logo (collapsed: show avatar only)
- Change active nav item style: add a left-3px primary-colored border indicator + slightly stronger background
- Add subtle `border-r border-sidebar-border` to the sidebar for cleaner separation
- Make section labels slightly more spaced and refined

### 2. Header: Show Page Description + Search
**File: `src/components/account/AccountHeader.tsx`**
- Pass and display `pageDescription` below the breadcrumb on desktop
- Add a subtle bottom shadow instead of just border for depth
- Improve mobile title area with description

### 3. Layout: Add Page Transitions + Better Spacing
**File: `src/layouts/CustomerAccountLayout.tsx`**
- Wrap `<Outlet>` content with a fade-in animation class
- Add `max-w-6xl` container to content area for better readability on wide screens
- Improve main padding to `p-4 sm:p-6 lg:p-8`

### 4. Dashboard: Visual Upgrade
**File: `src/pages/store/account/AccountDashboard.tsx`**
- Add gradient or subtle colored background to the welcome section
- Improve stat cards with border-l colored accent indicators instead of circular icons
- Add a "Quick Actions" row (View Orders, Track Package, Edit Profile, Contact Support)

### 5. Consistent Page Headers Across All Sub-pages
**Files: Multiple account pages**
- Remove individual `<h1>` + `<p>` headers from each page since the layout already shows the title via breadcrumb
- OR keep them but make them consistent with a shared component

### 6. CSS Polish
**File: `src/index.css`** (minor)
- Add an `animate-fade-in-up` keyframe for page content transitions

## Files to Change
1. `src/components/account/AccountSidebar.tsx` — user card, active indicator, border
2. `src/components/account/AccountHeader.tsx` — description display, shadow
3. `src/layouts/CustomerAccountLayout.tsx` — content container, animation, pass profile data
4. `src/pages/store/account/AccountDashboard.tsx` — welcome section upgrade, quick actions
5. `src/index.css` — add fade-in-up animation keyframe

## Scope
- No database changes needed
- No new dependencies
- Pure UI/UX polish across 5 files

