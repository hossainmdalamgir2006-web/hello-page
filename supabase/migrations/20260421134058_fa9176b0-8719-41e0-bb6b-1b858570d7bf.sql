DROP FUNCTION IF EXISTS public.get_safe_payment_methods();

CREATE OR REPLACE FUNCTION public.get_safe_payment_methods()
RETURNS TABLE(
  id uuid,
  code text,
  name text,
  name_bn text,
  description text,
  instructions text,
  logo_url text,
  is_active boolean,
  supports_verification boolean,
  sort_order integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.enabled_payment_methods WHERE is_active = true LIMIT 1) THEN
    RETURN QUERY
    SELECT p.id, p.code, p.name, p.name_bn, p.description,
           p.instructions, p.logo_url, p.is_active,
           p.supports_verification, p.sort_order
    FROM public.enabled_payment_methods p
    WHERE p.is_active = true
    ORDER BY p.sort_order;
  ELSE
    RETURN QUERY
    SELECT p.id, p.code, p.name, p.name_bn, p.description,
           p.instructions, p.logo_url, p.is_active,
           p.supports_verification, p.sort_order
    FROM public.payment_methods p
    WHERE p.is_active = true
    ORDER BY p.sort_order;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_safe_payment_methods() TO anon, authenticated;