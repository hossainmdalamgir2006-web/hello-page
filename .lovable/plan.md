

## Plan

### 1. Remove Inventory page
- **`src/App.tsx`**: Remove the lazy import for `Inventory` and the `<Route>` for `/admin/inventory`
- **`src/pages/Inventory.tsx`**: Delete the file
- **`src/components/admin/AdminSidebar.tsx`**: Remove the Inventory entry from `allManagementItems`
- **`src/components/admin/CommandPalette.tsx`**: Remove the Inventory entry from routes and the `"Inventory"` string from the management filter
- **`src/components/admin/AdminBreadcrumb.tsx`**: Remove the `inventory` breadcrumb mapping
- **`src/contexts/LanguageContext.tsx`**: Remove the `'nav.inventory'` translation entry

### 2. Translate Bengali sidebar text to English
- **`src/components/admin/AdminSidebar.tsx`** (line 240): Change `"সাইডবার গুটিয়ে রাখুন"` → `"Collapse Sidebar"`

