

## Replace ৳ with BDT

### Problem
সব জায়গায় price format `৳1,234` দেখাচ্ছে, user চায় `BDT 1,234`।

### Solution
শুধু `src/lib/formatPrice.ts` এর `formatPrice` function update করলেই সব জায়গায় automatically পরিবর্তন হয়ে যাবে, কারণ পুরো project এই single function ব্যবহার করে।

### Change
**`src/lib/formatPrice.ts`** — `৳${amount}` → `BDT ${amount}`

