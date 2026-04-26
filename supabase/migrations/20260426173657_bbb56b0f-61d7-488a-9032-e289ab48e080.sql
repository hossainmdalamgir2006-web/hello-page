ALTER TABLE public.product_questions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_questions;