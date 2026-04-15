

# Trash Activity Log Fix — `trash_log` টেবিল তৈরি

## সমস্যা
`trash_log` টেবিল ডাটাবেসে নেই। কোড (`useGlobalTrash.ts`, `auto-clean-trash` edge function) এই টেবিলে read/write করার চেষ্টা করে কিন্তু 404 পায়।

## সমাধান

### Step 1: Database Migration — `trash_log` টেবিল তৈরি
```sql
CREATE TABLE public.trash_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  entity_name text NOT NULL,
  action text NOT NULL,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_by_email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.trash_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view trash log"
  ON public.trash_log FOR SELECT TO authenticated
  USING (public.has_admin_role(auth.uid()));

CREATE POLICY "Authenticated can insert trash log"
  ON public.trash_log FOR INSERT TO authenticated
  WITH CHECK (true);
```

### Step 2: No code changes needed
`useGlobalTrash.ts` already has correct `logTrashAction` and `fetchActivityLog` functions that use `trash_log`. Once the table exists, everything will work automatically.

### Files to modify
- Database migration only (1 new table + RLS policies)

