-- Fix RLS policy on orders to clearly allow both authenticated and guest checkouts.
-- The previous single policy had a WITH CHECK clause that failed inconsistently.
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Allow authenticated users to create their own orders (or guest-style with no user_id)
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  order_number IS NOT NULL
  AND total_amount >= 0
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Allow anonymous (guest) checkouts to create orders without a user_id
CREATE POLICY "Guests can create orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (
  order_number IS NOT NULL
  AND total_amount >= 0
  AND user_id IS NULL
);

-- Make sure SELECT after insert works for the inserting user
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);