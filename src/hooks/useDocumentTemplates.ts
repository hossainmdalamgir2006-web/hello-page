import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvoiceTemplateConfig {
  store_name: string;
  store_address: string;
  store_phone: string;
  store_email: string;
  store_logo_url: string;
  accent_color: string;
  show_payment_info: boolean;
  footer_text: string;
  show_qr_code: boolean;
  currency_symbol: string;
  show_store_info: boolean;
}

export interface PackingSlipTemplateConfig {
  store_name: string;
  accent_color: string;
  show_notes: boolean;
  show_signature: boolean;
  footer_text: string;
  store_logo_url: string;
  show_store_info: boolean;
}

export interface DocumentTemplate {
  id: string;
  type: string;
  name: string;
  is_active: boolean;
  config: InvoiceTemplateConfig | PackingSlipTemplateConfig;
  created_at: string;
  updated_at: string;
}

export function useDocumentTemplates() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .order("type");
    if (error) {
      console.error("Error fetching document templates:", error);
    } else {
      setTemplates((data || []).map(d => ({ ...d, config: d.config as any })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const updateTemplate = async (id: string, config: Record<string, any>) => {
    const { error } = await supabase
      .from("document_templates")
      .update({ config: config as any })
      .eq("id", id);
    if (error) {
      toast.error("Failed to save template");
      return false;
    }
    toast.success("Template saved successfully");
    await fetchTemplates();
    return true;
  };

  const getTemplateConfig = (type: "invoice" | "packing_slip") => {
    const t = templates.find(t => t.type === type);
    return t?.config || null;
  };

  return { templates, loading, updateTemplate, getTemplateConfig, refetch: fetchTemplates };
}
