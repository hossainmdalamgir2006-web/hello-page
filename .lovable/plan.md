

## Admin Pages — Unified Glassmorphic Header Design

### Problem
Products পেজে যে glassmorphic header আছে (gradient background, blur elements, rounded border) — সেটা শুধু Products পেজেই আছে। বাকি ২৩+ admin পেজে plain header ব্যবহার হচ্ছে।

### Solution
`AdminPageHeader` কম্পোনেন্টে glassmorphic styling যোগ করে সব পেজে একই ডিজাইন আনা।

### Step 1 — Update `AdminPageHeader` component
`src/components/admin/AdminPageHeader.tsx` এ Products পেজের মতো styling যোগ করা:
- `rounded-xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-6`
- Decorative blur circles (top-right, bottom-left)
- `relative overflow-hidden` wrapper

### Step 2 — Replace inline headers across all admin pages
এই ২৩টি পেজে inline header markup সরিয়ে `AdminPageHeader` ব্যবহার করা:
- `Index.tsx` (Dashboard)
- `Products.tsx` (already has design, switch to component)
- `Orders.tsx`, `Customers.tsx`, `Coupons.tsx`, `Messages.tsx`
- `Shipping.tsx`, `AbandonedCarts.tsx`, `RoleManagement.tsx`
- `Reports.tsx`, `Analytics.tsx`, `Categories.tsx`
- `AppearanceManager.tsx`, `ManagerSettings.tsx`
- `RoleDashboard.tsx`, `Brands.tsx`
- Settings sub-pages: `SecurityPage.tsx`, etc.
- Any other admin pages with inline headers

### Technical Details
- **Modified:** `src/components/admin/AdminPageHeader.tsx` — add glassmorphic wrapper + blur elements
- **Modified:** ~20+ page files — replace inline `<h1>` headers with `<AdminPageHeader>` component
- Products পেজ থেকে custom header markup সরিয়ে `AdminPageHeader` ব্যবহার করা
- No DB changes needed

