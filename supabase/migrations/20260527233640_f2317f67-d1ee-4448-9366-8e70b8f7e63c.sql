
DROP POLICY IF EXISTS "Public can insert activated licenses" ON public.activated_licenses;
DROP POLICY IF EXISTS "Public can read activated licenses" ON public.activated_licenses;
DROP POLICY IF EXISTS "Public can update activated licenses" ON public.activated_licenses;

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Conversation tags viewable by everyone" ON public.conversation_tags;
CREATE POLICY "Conversation tags viewable by authenticated"
  ON public.conversation_tags FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Quick replies viewable by everyone" ON public.quick_replies;
CREATE POLICY "Quick replies viewable by authenticated"
  ON public.quick_replies FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view own chat attachments" ON storage.objects;

-- payment_methods: revoke SELECT on sensitive `config` (API keys/secrets) column
REVOKE SELECT (config) ON public.payment_methods FROM anon, authenticated;
