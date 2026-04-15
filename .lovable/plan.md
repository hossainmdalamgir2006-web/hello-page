

## Invoice PDF — সমস্যা ও সমাধান

### চিহ্নিত সমস্যাগুলো:

1. **Currency Symbol ভাঙা** — "৳" (BDT Taka) সাইন "ó" হিসেবে দেখাচ্ছে। jsPDF-এর default Helvetica ফন্ট বাংলা/ইউনিকোড ক্যারেক্টার সাপোর্ট করে না। ফিক্স: `৳` এর বদলে `BDT ` বা `Tk` ব্যবহার করতে হবে, অথবা `toLocaleString("en-BD")` formatting ঠিক করতে হবে।

2. **"INVOICE" ও "Invoice No:" টেক্সট ওভারল্যাপ** — হেডারে INVOICE title এবং Invoice No লেবেল একে অপরের উপর পড়ছে। Position coordinates adjust করতে হবে।

3. **"Your Store" ও "Premium E-Commerce"** — এগুলো হার্ডকোডেড ডিফল্ট। Admin যদি Document Templates সেটিংসে store name সেট করে তাহলে আসবে, তবে "Premium E-Commerce" সাবটাইটেল সম্পূর্ণ হার্ডকোডেড — এটি রিমুভ করতে হবে বা configurable করতে হবে।

4. **"Thank you for your business!"** — ডিফল্ট ফুটার টেক্সট, Admin template settings থেকে কাস্টমাইজ করা যায়।

5. **Bill To / Ship To তে email দেখাচ্ছে** — Customer email order data তে pass হচ্ছে না (empty string), কিন্তু তারপরও দেখাচ্ছে — এটা ঠিক করতে হবে।

6. **Paid Badge দেখাচ্ছে না** — payment_status check করতে হবে।

### পরিবর্তন

#### ফাইল: `src/utils/generateInvoicePDF.ts`

1. **Currency fix**: `৳` কে `Tk` দিয়ে replace করা (jsPDF helvetica ফন্টে ৳ রেন্ডার হয় না)
2. **"Premium E-Commerce" রিমুভ** করা
3. **INVOICE ও Invoice No: এর positioning fix** — INVOICE title কে উপরে এবং meta info কে নিচে সরানো যাতে overlap না হয়
4. **Empty email/phone skip** — শুধু non-empty values দেখানো
5. **`toLocaleString` fix** — `"en-BD"` locale কাজ নাও করতে পারে, `"en-IN"` বা manual formatting ব্যবহার

#### ফাইল: `src/hooks/useDocumentTemplates.ts` / `src/pages/store/account/AccountInvoice.tsx`
- কোনো পরিবর্তন লাগবে না, এগুলো ঠিকই config pass করছে

### সারাংশ
মূলত PDF rendering engine-এ ৪-৫টা ফিক্স দরকার — currency encoding, layout overlap, hardcoded subtitle removal, এবং empty field handling।

