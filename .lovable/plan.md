

## Plan: Invoice ও Packing Slip এর জন্য Dynamic Template System

### সমস্যা
বর্তমানে Invoice এবং Packing Slip এর ডিজাইন হার্ডকোডেড (`generateInvoicePDF.ts`, `generatePackingSlip.ts`)। Admin panel থেকে এগুলো কাস্টমাইজ করার কোনো উপায় নেই।

### সমাধান
একটি নতুন `document_templates` টেবিল তৈরি করে admin panel-এ একটি ম্যানেজমেন্ট পেজ যোগ করা, যেখান থেকে Invoice ও Packing Slip এর layout, colors, store info, footer text ইত্যাদি কাস্টমাইজ করা যাবে। Template data JSON হিসেবে সেভ হবে এবং PDF generation সময় সেই config ব্যবহার হবে।

### পরিবর্তনসমূহ

#### 1. Database: `document_templates` টেবিল তৈরি
```sql
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE, -- 'invoice' | 'packing_slip'
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
Config JSON-এ থাকবে:
- **Invoice**: `store_name`, `store_address`, `store_phone`, `store_email`, `store_logo_url`, `accent_color`, `show_payment_info`, `footer_text`, `show_qr_code`, `currency_symbol`
- **Packing Slip**: `store_name`, `accent_color`, `show_notes`, `show_signature`, `footer_text`

Default seed data insert করা হবে দুটো template-এর জন্য।

RLS: Admin-only access (read/write via `has_admin_role`).

#### 2. নতুন Hook: `src/hooks/useDocumentTemplates.ts`
- `document_templates` থেকে CRUD operations
- `getTemplateConfig(type)` — Invoice/Packing Slip config ফেচ করবে

#### 3. নতুন Admin Page: Document Templates Settings
- Sidebar-এ "Document Templates" লিংক যোগ (`/admin/system-settings/documents`)
- Route যোগ `App.tsx`-এ
- পেজে দুটো template card: Invoice ও Packing Slip
- প্রতিটিতে config editor (store info, colors, footer text ইত্যাদি)
- Live preview button (sample data দিয়ে PDF generate করে দেখাবে)

#### 4. PDF Generators আপডেট
- **`generateInvoicePDF.ts`**: config parameter accept করবে; store info, colors, footer সব config থেকে নেবে
- **`generatePackingSlip.ts`**: একইভাবে config থেকে dynamic values নেবে
- **`AccountInvoice.tsx`**: template config ফেচ করে PDF generation-এ পাঠাবে

#### 5. Orders Page আপডেট
- `Orders.tsx`-এ Invoice/Packing Slip generation-এ document template config ব্যবহার করবে

### ফাইল পরিবর্তন
- **নতুন**: `src/hooks/useDocumentTemplates.ts`, `src/pages/system-settings/DocumentTemplatesPage.tsx`, `src/components/settings/DocumentTemplateEditor.tsx`
- **এডিট**: `src/utils/generateInvoicePDF.ts`, `src/utils/generatePackingSlip.ts`, `src/pages/Orders.tsx`, `src/pages/store/account/AccountInvoice.tsx`, `src/App.tsx`, `src/components/admin/AdminSidebar.tsx`
- **Migration**: `document_templates` টেবিল + seed data + RLS

