
CREATE TABLE public.blocked_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT,
  device_name TEXT,
  user_agent TEXT,
  reason TEXT,
  blocked_by UUID,
  is_permanent BOOLEAN NOT NULL DEFAULT true,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocked devices"
ON public.blocked_devices
FOR ALL
USING (has_admin_role(auth.uid()));
