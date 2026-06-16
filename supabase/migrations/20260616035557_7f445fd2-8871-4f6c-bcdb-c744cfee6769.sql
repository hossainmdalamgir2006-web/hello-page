
ALTER TABLE public.shipping_zones
  ADD COLUMN IF NOT EXISTS shipping_methods text[] NOT NULL DEFAULT ARRAY['Standard','Express','Cash on Delivery']::text[];

ALTER TABLE public.shipping_rates
  ADD COLUMN IF NOT EXISTS shipping_method text;

-- Backfill rate methods using existing name heuristics
UPDATE public.shipping_rates SET shipping_method = 'Express'
  WHERE shipping_method IS NULL AND name ILIKE '%express%';
UPDATE public.shipping_rates SET shipping_method = 'Cash on Delivery'
  WHERE shipping_method IS NULL AND (name ILIKE '%cash%' OR name ILIKE '%cod%');
UPDATE public.shipping_rates SET shipping_method = 'Standard'
  WHERE shipping_method IS NULL;
