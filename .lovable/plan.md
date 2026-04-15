## Plan: Invoice PDF Design — Professional Upgrade

### বর্তমান সমস্যাগুলো (Screenshot থেকে)

1. **Store info section** খালি — logo আছে কিন্তু address/email/phone দেখাচ্ছে না (data নেই হয়তো)  

fix .../admin/system-settings/store  Footer Settings  ei khane paba store info

1. **Overall spacing** কিছু জায়গায় cramped, কিছু জায়গায় অনেক empty space
2. **Bottom section** (Payment, Terms, Signature) পেজের মাঝে floating — footer-এর কাছে push করা ভালো হবে

### Proposed Professional Improvements

#### `src/utils/generateInvoicePDF.ts`

1. **Header upgrade**:
  - Store logo বড় করা (16→20mm)
  - INVOICE title-এর নিচে একটি subtle accent color line/bar
  - Store name font size একটু বড় (18→20)
2. **Bill To / Ship To section**:
  - Left accent border (2px accent color) যোগ করা each box-এ
  - Section label ("BILL TO", "SHIP TO") accent color-এ
3. **Items table polish**:
  - Header row height বাড়ানো (11→13)
  - Row height বাড়ানো (14→16) — আরও breathable
  - Alternate row colors আরও subtle
4. **Grand Total section**:
  - Grand total row-এ accent color background bar যোগ করা
  - White text on accent background — visually distinct
5. **Bottom section layout fix**:
  - Payment/Terms/Signature section-কে footer-এর ঠিক উপরে anchor করা
  - Thin accent line separator
6. **Overall spacing**: Margin ও section gaps fine-tune করা

### ফাইল

- **Edit**: `src/utils/generateInvoicePDF.ts` — Full design refresh