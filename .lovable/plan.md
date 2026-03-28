

# Move "Visit Store" to Header Dropdown & Remove "Settings"

## Changes

### 1. `src/components/admin/AdminHeader.tsx`
- Add `ExternalLink` icon import from lucide-react
- Replace the Settings menu item (line 178-181) with a "Visit Store" link that opens in a new tab
- Keep Profile and Logout items as-is

### 2. `src/components/admin/AdminSidebar.tsx`
- Remove the "Visit Store" section from the bottom menu (lines 261-276)

