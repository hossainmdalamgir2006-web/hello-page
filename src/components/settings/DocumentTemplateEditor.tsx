import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, FileText, Package, Eye, Loader2 } from "lucide-react";
import type { DocumentTemplate, InvoiceTemplateConfig, PackingSlipTemplateConfig } from "@/hooks/useDocumentTemplates";
import { generateInvoicePDF } from "@/utils/generateInvoicePDF";
import { generatePackingSlip } from "@/utils/generatePackingSlip";

interface Props {
  template: DocumentTemplate;
  onSave: (config: Record<string, any>) => Promise<boolean>;
}

export function DocumentTemplateEditor({ template, onSave }: Props) {
  const [config, setConfig] = useState<Record<string, any>>(template.config as any);
  const [saving, setSaving] = useState(false);

  const isInvoice = template.type === "invoice";
  const Icon = isInvoice ? FileText : Package;

  const updateField = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(config);
    setSaving(false);
  };

  const handlePreview = async () => {
    if (isInvoice) {
      const invoiceConfig = config as InvoiceTemplateConfig;
      await generateInvoicePDF({
        order_number: "SAMPLE-001",
        created_at: new Date().toISOString(),
        customer_name: "John Doe",
        customer_email: "john@example.com",
        customer_phone: "+880 1234 567890",
        shipping_address: "123 Main St, Dhaka 1200",
        items: [
          { product_name: "Sample Product A", quantity: 2, unit_price: 500, total_price: 1000 },
          { product_name: "Sample Product B", quantity: 1, unit_price: 750, total_price: 750 },
        ],
        subtotal: 1750,
        shipping_cost: 60,
        discount: 100,
        total: 1710,
        payment_method: "bKash",
        payment_status: "paid",
        store_name: invoiceConfig.store_name,
        store_address: invoiceConfig.store_address,
        store_phone: invoiceConfig.store_phone,
        store_email: invoiceConfig.store_email,
      }, invoiceConfig);
    } else {
      const slipConfig = config as PackingSlipTemplateConfig;
      generatePackingSlip({
        order_number: "SAMPLE-001",
        created_at: new Date().toISOString(),
        customer_name: "John Doe",
        customer_phone: "+880 1234 567890",
        shipping_address: "123 Main St, Dhaka 1200",
        items: [
          { product_name: "Sample Product A", quantity: 2, unit_price: 500 },
          { product_name: "Sample Product B", quantity: 1, unit_price: 750 },
        ],
        notes: "Handle with care",
        store_name: slipConfig.store_name,
      }, slipConfig);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <Badge variant="secondary" className="mt-1 text-xs">{template.type.replace("_", " ")}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePreview}>
              <Eye className="mr-1.5 h-4 w-4" /> Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Store Info */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Store Information</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Store Name</Label>
              <Input value={config.store_name || ""} onChange={e => updateField("store_name", e.target.value)} placeholder="Your Store" />
            </div>
            {isInvoice && (
              <>
                <div>
                  <Label className="text-xs">Store Email</Label>
                  <Input value={config.store_email || ""} onChange={e => updateField("store_email", e.target.value)} placeholder="store@email.com" />
                </div>
                <div>
                  <Label className="text-xs">Store Phone</Label>
                  <Input value={config.store_phone || ""} onChange={e => updateField("store_phone", e.target.value)} placeholder="+880..." />
                </div>
                <div>
                  <Label className="text-xs">Store Address</Label>
                  <Input value={config.store_address || ""} onChange={e => updateField("store_address", e.target.value)} placeholder="Address" />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <Label className="text-xs">Logo URL</Label>
              <Input value={config.store_logo_url || ""} onChange={e => updateField("store_logo_url", e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>

        <Separator />

        {/* Styling */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Styling</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.accent_color || "#3b82f6"}
                  onChange={e => updateField("accent_color", e.target.value)}
                  className="h-10 w-14 p-1 cursor-pointer"
                />
                <Input value={config.accent_color || "#3b82f6"} onChange={e => updateField("accent_color", e.target.value)} className="flex-1" />
              </div>
            </div>
            {isInvoice && (
              <div>
                <Label className="text-xs">Currency Symbol</Label>
                <Input value={config.currency_symbol || "৳"} onChange={e => updateField("currency_symbol", e.target.value)} placeholder="৳" />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div>
          <Label className="text-xs">Footer Text</Label>
          <Textarea
            value={config.footer_text || ""}
            onChange={e => updateField("footer_text", e.target.value)}
            placeholder="Thank you for your business!"
            rows={2}
          />
        </div>

        <Separator />

        {/* Toggle Options */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Options</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Store Info</Label>
              <Switch checked={config.show_store_info ?? true} onCheckedChange={v => updateField("show_store_info", v)} />
            </div>
            {isInvoice && (
              <>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Payment Info</Label>
                  <Switch checked={config.show_payment_info ?? true} onCheckedChange={v => updateField("show_payment_info", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show QR Code</Label>
                  <Switch checked={config.show_qr_code ?? false} onCheckedChange={v => updateField("show_qr_code", v)} />
                </div>
              </>
            )}
            {!isInvoice && (
              <>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Notes</Label>
                  <Switch checked={config.show_notes ?? true} onCheckedChange={v => updateField("show_notes", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Signature Section</Label>
                  <Switch checked={config.show_signature ?? true} onCheckedChange={v => updateField("show_signature", v)} />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
