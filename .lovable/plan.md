

## Goal Tracker: Target সেট করা ও Monthly History দেখা

### সমস্যা
- Goal edit বাটন hover-এ লুকানো থাকে, সহজে পাওয়া যায় না
- Target সেট করলে refresh-এ হারিয়ে যায় (শুধু local state)
- আগের মাসগুলোতে target কতটুকু পূরণ হয়েছিল সেটা দেখার উপায় নেই

### পরিকল্পনা

#### 1. Database table তৈরি করা — `monthly_goals`
- Columns: `id`, `month` (date, month start), `sales_target`, `orders_target`, `customers_target`, `sales_actual`, `orders_actual`, `customers_actual`, `created_at`, `updated_at`
- প্রতি মাসে একটি row থাকবে
- RLS: authenticated users only

#### 2. Goal Tracker UI উন্নত করা
- **Edit বাটন সবসময় visible** রাখা (hover dependency সরানো)
- Target edit করলে database-এ save হবে (upsert by current month)
- **"History" ট্যাব/বাটন যোগ করা** — ক্লিক করলে গত ৬-১২ মাসের goal performance দেখাবে:
  - প্রতি মাসের target vs actual
  - ✅ achieved বা ❌ missed badge
  - Progress percentage

#### 3. Hook তৈরি — `useGoalTracker.ts`
- Current month এর goals fetch করা
- Goals upsert করা (target change এ)
- Monthly history fetch করা (last 12 months)
- Month end এ actual values auto-update (dashboard data থেকে)

#### 4. Index.tsx আপডেট
- GoalTracker-এ database-backed goals pass করা (hardcoded 100000/50/20 সরানো)

### Technical Details

**Migration SQL:**
```sql
CREATE TABLE public.monthly_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL UNIQUE,
  sales_target numeric DEFAULT 100000,
  orders_target integer DEFAULT 50,
  customers_target integer DEFAULT 20,
  sales_actual numeric DEFAULT 0,
  orders_actual integer DEFAULT 0,
  customers_actual integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage goals" ON public.monthly_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

**Files to modify:**
- `src/components/admin/GoalTracker.tsx` — Edit button always visible, history view, DB integration
- `src/hooks/useGoalTracker.ts` — New hook for CRUD
- `src/pages/Index.tsx` — Use hook, remove hardcoded goals

