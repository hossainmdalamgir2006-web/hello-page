UPDATE public.document_templates 
SET config = jsonb_set(config::jsonb, '{footer_text}', '"Thank you for your purchase!"'::jsonb)
WHERE type = 'invoice';