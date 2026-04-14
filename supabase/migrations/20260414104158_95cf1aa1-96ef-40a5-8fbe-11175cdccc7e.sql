
-- Create the helper function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create document_templates table
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage document templates"
ON public.document_templates FOR ALL
USING (has_admin_role(auth.uid()));

CREATE POLICY "Authenticated users can view active document templates"
ON public.document_templates FOR SELECT TO authenticated
USING (is_active = true);

CREATE TRIGGER update_document_templates_updated_at
BEFORE UPDATE ON public.document_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.document_templates (type, name, config) VALUES
('invoice', 'Default Invoice', '{"store_name":"Your Store","store_address":"","store_phone":"","store_email":"","store_logo_url":"","accent_color":"#3b82f6","show_payment_info":true,"footer_text":"Thank you for your business!","show_qr_code":false,"currency_symbol":"৳","show_store_info":true}'),
('packing_slip', 'Default Packing Slip', '{"store_name":"Your Store","accent_color":"#0f172a","show_notes":true,"show_signature":true,"footer_text":"","store_logo_url":"","show_store_info":true}');
