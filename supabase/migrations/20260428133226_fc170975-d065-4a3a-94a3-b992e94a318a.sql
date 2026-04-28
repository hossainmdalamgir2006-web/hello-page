DROP FUNCTION IF EXISTS public.get_table_constraints();

CREATE OR REPLACE FUNCTION public.get_table_constraints()
 RETURNS TABLE(constraint_name text, table_name text, column_name text, constraint_type text, foreign_table_schema text, foreign_table_name text, foreign_column_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    tc.constraint_name::text,
    tc.table_name::text,
    kcu.column_name::text,
    tc.constraint_type::text,
    ccu.table_schema::text,
    ccu.table_name::text,
    ccu.column_name::text
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
   AND tc.table_schema = ccu.table_schema
  WHERE tc.table_schema = 'public'
  ORDER BY tc.table_name, tc.constraint_type;
END;
$function$;