

## Plan: Invoice PDF ফিক্স — Currency ও Layout

### পরিবর্তনসমূহ (শুধু `src/utils/generateInvoicePDF.ts`)

#### 1. Currency Fix
- `fmt` function আপডেট: `toLocaleString("en-IN")` থেকে plain number formatting করা
- Default symbol `"Tk"` থেকে `"BDT "` করা
- Format: `BDT 2,050` (space সহ)

#### 2. PAID Badge Overlap Fix
- Badge কে Invoice No এর পাশে না রেখে আলাদা line-এ নিচে সরানো
- Invoice No, Date, Due Date এর meta section এর spacing বাড়ানো

#### 3. Bill To / Ship To Box Height
- Fixed 38px height থেকে dynamic height করা — content অনুযায়ী adjust হবে

#### 4. Table-to-Totals Gap
- Items শেষ হওয়ার পর extra gap কমানো (8 → 4)

#### 5. Footer Dynamic Position  
- Footer কে page bottom-এ fixed না রেখে content শেষের পরে রাখা (তবে minimum position maintain করা)

### ফাইল
- **এডিট**: `src/utils/generateInvoicePDF.ts`

