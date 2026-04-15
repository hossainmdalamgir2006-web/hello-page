

## Plan: Payment Method Logo in Invoice PDF

### সমস্যা
Invoice PDF-এ Payment Method section-এ শুধু method name দেখায় (e.g., "payoneer"), কিন্তু method-এর logo দেখায় না।

### পরিবর্তন

#### 1. `src/utils/generateInvoicePDF.ts`
- `InvoiceData` interface-এ `payment_method_logo?: string` ফিল্ড যোগ করা
- Payment Method section-এ logo image render করা (name-এর উপরে বা পাশে ছোট icon হিসেবে ~10x10mm)
- `loadImageAsBase64` ব্যবহার করে logo fetch করা
- `generateSingleInvoice`-এ নতুন `paymentLogoData` parameter নেওয়া

#### 2. `src/pages/store/account/AccountInvoice.tsx`
- Order-এর `payment_method` name দিয়ে `payment_methods` table থেকে matching method-এর `logo_url` fetch করা
- `generateInvoicePDF`-এ `payment_method_logo` pass করা

#### 3. `src/pages/Orders.tsx` ও `src/components/account/OrdersTab.tsx`
- একইভাবে payment method logo URL pass করা (যদি invoice download এখান থেকেও হয়)

### ফাইল
- **Edit**: `src/utils/generateInvoicePDF.ts` — logo rendering in payment section
- **Edit**: `src/pages/store/account/AccountInvoice.tsx` — fetch & pass payment logo
- **Edit**: `src/pages/Orders.tsx` — pass payment logo
- **Edit**: `src/components/account/OrdersTab.tsx` — pass payment logo

