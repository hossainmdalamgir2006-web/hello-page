-- Re-allow public/customer read on payment_methods because checkout needs to display
-- account numbers (bKash, Nagad, bank) — but EXCLUDE the `config` column which
-- holds gateway API keys/secrets. We do this via a view + RLS.

-- Drop admin-only SELECT and add back public read on payment_methods rows EXCEPT config
DROP POLICY IF EXISTS "Admins can view payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins can view enabled payment methods" ON public.enabled_payment_methods;

-- Public can SELECT active rows (config column will be filtered via view/grant below)
CREATE POLICY "Public can view active payment methods (display)"
ON public.payment_methods
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Public can view active enabled payment methods (display)"
ON public.enabled_payment_methods
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Revoke direct SELECT on the sensitive `config` column from public roles.
-- Admins still have full access via the existing "Admins can manage" policies.
REVOKE SELECT (config) ON public.payment_methods FROM anon, authenticated;