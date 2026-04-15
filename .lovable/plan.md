## Plan: Invoice PDF — Currency, Store Name ও Payment Status Fix

### সমস্যা

1. **Currency ভাঙা**: Database-এ `currency_symbol` = `"৳"` সেভ আছে, যেটা jsPDF Helvetica ফন্টে `ó` হিসেবে রেন্ডার হয়। Code-এ fallback `"BDT"` ঠিক আছে, কিন্তু DB config এটাকে override করছে।

fix koro ..Database-এ currency_symbol = "BDT"  TE UPDATE KORO

1. **Store Name static**: DB-তে `"Your Store"` হার্ডকোডেড — Admin যদি আপডেট না করে তাহলে এটাই থাকে।

fix.../admin/system-settings/store  Header Settings theke Store Name Store Logo niba

1. **Payment Status Badge**: শুধু `"paid"` হলে দেখায়, অন্য status (pending, failed, unpaid) দেখায় না।
2. Payment Method e  method name + logo dekhaba    

### পরিবর্তন

#### 1. Database Migration

- `document_templates` টেবিলে invoice config-এর `currency_symbol` কে `"৳"` থেকে `"BDT"` আপডেট করা।

#### 2. `src/utils/generateInvoicePDF.ts`

- **Payment Status Badge**: সব status-এর জন্য badge দেখানো:
  - `paid` → Green badge
  - `pending` → Orange/Yellow badge
  - `failed`/`cancelled` → Red badge
  - অন্য যেকোনো → Gray badge
- Badge text হবে status এর uppercase version।

#### 3. Store Name Dynamic

- Store name ইতোমধ্যে config থেকে আসে (`cfg?.store_name`)। Admin panel-এ Document Templates সেটিংসে store name আপডেট করলেই dynamic হবে। কোড পরিবর্তন লাগবে না — শুধু DB seed fix।

### ফাইল

- **Migration**: `currency_symbol` update
- **Edit**: `src/utils/generateInvoicePDF.ts` — payment badge সব status-এ দেখানো