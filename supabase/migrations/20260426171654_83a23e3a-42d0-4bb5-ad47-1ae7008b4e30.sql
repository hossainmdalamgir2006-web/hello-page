-- Add foreign key from product_questions to products so PostgREST can join them
ALTER TABLE public.product_questions
  ADD CONSTRAINT product_questions_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Index for faster admin lookups by status
CREATE INDEX IF NOT EXISTS idx_product_questions_answered_at
  ON public.product_questions(answered_at);
CREATE INDEX IF NOT EXISTS idx_product_questions_product_id
  ON public.product_questions(product_id);
