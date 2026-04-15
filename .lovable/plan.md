

## Plan: Invoice PDF — Status Badge Center Fix ও Due Date / Terms Remove

### সমস্যা

1. **Status badge text centered না**: Badge-এর মধ্যে text vertically/horizontally ঠিকমতো center হচ্ছে না। কারণ: `doc.getTextWidth(statusLabel)` call হচ্ছে কিন্তু তখন font size সেট করা হয়নি (6.5)। Font size সেট হওয়ার আগে width মাপলে ভুল width আসে, ফলে badge ও text misalign হয়।

2. **Due Date সরানো**: Header meta section-এ "Due Date: 23 April 2026" hardcoded দেখাচ্ছে — user এটা চান না।

3. **"Payment due within 7 days" সরানো**: Terms & Conditions section-এ এই line hardcoded — user এটা রাখেননি।

### পরিবর্তন

#### `src/utils/generateInvoicePDF.ts`

1. **Status badge fix** (lines 206-224):
   - Font size (6.5) আগে সেট করা, তারপর `getTextWidth()` call — এতে badge width সঠিক হবে এবং text center-এ আসবে।

2. **Due Date remove** (lines 197-203):
   - পুরো "Due Date" block মুছে ফেলা (metaY += 6, text "Due Date:", dueDate calculation সব)।

3. **Terms "Payment due within 7 days" remove** (line 431):
   - এই line মুছে ফেলা, বাকি দুটি term (Returns, Damaged items) রাখা, Y offset adjust করা।

### ফাইল
- **Edit**: `src/utils/generateInvoicePDF.ts` — ৩টি fix

