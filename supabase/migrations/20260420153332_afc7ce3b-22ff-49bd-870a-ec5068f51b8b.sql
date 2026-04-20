-- Add phone and bio columns to profiles if not exist
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS bio text;

-- Create password change history table
CREATE TABLE IF NOT EXISTS public.password_change_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  device_info jsonb
);

CREATE INDEX IF NOT EXISTS idx_password_change_history_user_id 
  ON public.password_change_history(user_id, changed_at DESC);

ALTER TABLE public.password_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own password history"
  ON public.password_change_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own password history"
  ON public.password_change_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all password history"
  ON public.password_change_history
  FOR SELECT
  TO authenticated
  USING (has_admin_role(auth.uid()));