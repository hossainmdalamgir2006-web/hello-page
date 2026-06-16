
GRANT SELECT, INSERT ON public.coupon_usage TO authenticated;
GRANT ALL ON public.coupon_usage TO service_role;

DROP POLICY IF EXISTS "Users can view their own coupon usage" ON public.coupon_usage;
CREATE POLICY "Users can view their own coupon usage"
ON public.coupon_usage FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own coupon usage" ON public.coupon_usage;
CREATE POLICY "Users can insert their own coupon usage"
ON public.coupon_usage FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_user
  ON public.coupon_usage (coupon_id, user_id);
