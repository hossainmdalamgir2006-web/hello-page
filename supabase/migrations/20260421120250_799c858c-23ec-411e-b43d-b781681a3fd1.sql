CREATE POLICY "Public can read activated licenses"
ON public.activated_licenses
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert activated licenses"
ON public.activated_licenses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can update activated licenses"
ON public.activated_licenses
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);