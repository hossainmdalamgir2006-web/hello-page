

# Admin Header Profile Area — Professional Redesign

## Current State
The profile section (circled in screenshot) shows avatar + name + email as a plain ghost button. It looks basic and lacks visual hierarchy.

## Changes

### Profile Trigger Button (lines 118-135)
- Add a subtle rounded-full pill container with a light border and background
- Add role badge (e.g., "Admin") as a small colored badge
- Improve typography: name bolder, email lighter and smaller
- Add a chevron-down icon to indicate dropdown
- Add hover ring effect for interactivity feedback

### Dropdown Menu (lines 137-154)
- Add user info header inside dropdown with avatar, name, email, and role badge
- Add subtle separators and hover states
- Style the logout item with destructive color

## Files to modify
- `src/components/admin/AdminHeader.tsx` — redesign profile trigger and dropdown content

