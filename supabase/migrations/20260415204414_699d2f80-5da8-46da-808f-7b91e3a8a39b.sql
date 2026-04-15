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