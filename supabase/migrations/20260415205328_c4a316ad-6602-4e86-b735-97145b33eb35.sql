
CREATE TABLE public.auto_assign_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rule_type text NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}',
  assign_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assign_to_email text,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.auto_assign_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage auto assign rules"
  ON public.auto_assign_rules FOR ALL TO authenticated
  USING (public.has_admin_role(auth.uid()));
