-- Drop old admin-only policy
DROP POLICY IF EXISTS "Admins can manage product questions" ON public.product_questions;

-- Allow admin, manager, and support roles to fully manage product questions
CREATE POLICY "Staff can manage product questions"
ON public.product_questions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin'::app_role, 'manager'::app_role, 'support'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin'::app_role, 'manager'::app_role, 'support'::app_role)
  )
);