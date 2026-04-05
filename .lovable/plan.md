## Renaming ও Sidebar Tab Split

### পরিবর্তন সমূহ

#### 1. `src/components/admin/AdminSidebar.tsx`

- "Site Settings" → "Store Settings"

#### 2. `src/config/siteContentRegistry.ts`

- `label: "Store Header"` → `"Header"`
- `label: "Store Footer"` → `"Footer"`

#### 3. `src/pages/system-settings/StorePage.tsx`

- Page title: "Site Settings" → "Store Settings"
- Description: "Store header, footer, uploads, and maintenance"
- Sidebar-এ "Site Settings" tab-কে দুটো আলাদা tab-এ ভাগ করব:
  - **Upload Settings** (icon: Upload) — শুধু `<UploadSettings />`
  - **Maintenance Mode** (icon: Construction) — শুধু `<MaintenanceMode />`
- Sidebar items: Header, Footer, Upload Settings, Maintenance Mode (4টি)
- `SidebarItem` type-এ `{ type: "upload" }` ও `{ type: "maintenance" }` যোগ

### Technical Details

- 3 files modified
- No DB changes
- `StoreSettingsTab.tsx` আর ব্যবহার হবে না (import remove)