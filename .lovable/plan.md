

# Fix: Products Not Showing — RPC Function Bug

## Root Cause
The `get_featured_products_lite` database function treats `images` as `jsonb`, but the column is actually `text[]` (PostgreSQL text array). This causes the function to error silently and return no products.

## Fix
Replace the migration with a corrected function that uses `unnest()` for `text[]` arrays instead of `jsonb_array_elements_text()`.

### Database Migration — Update `get_featured_products_lite`
```sql
CREATE OR REPLACE FUNCTION public.get_featured_products_lite(p_limit integer DEFAULT 8)
RETURNS TABLE(...)
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.slug, p.price, p.compare_at_price, p.category, p.created_at,
    (SELECT elem FROM unnest(p.images) AS elem
     WHERE elem NOT LIKE 'data:%' LIMIT 1
    ) AS first_image
  FROM public.products p
  WHERE p.is_active = true AND p.deleted_at IS NULL AND p.is_featured = true
  LIMIT p_limit;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT p.id, p.name, p.slug, p.price, p.compare_at_price, p.category, p.created_at,
      (SELECT elem FROM unnest(p.images) AS elem
       WHERE elem NOT LIKE 'data:%' LIMIT 1
      ) AS first_image
    FROM public.products p
    WHERE p.is_active = true AND p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT p_limit;
  END IF;
END;
$$;
```

## Files to modify
- **New migration**: Fix `get_featured_products_lite` to use `unnest()` instead of `jsonb_array_elements_text()`
- No code changes needed — `useFeaturedProducts.ts` already handles the response correctly

