import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  FileText,
  ShoppingCart,
  Package,
  CheckCircle2,
  XCircle,
  ClipboardList,
  DollarSign,
  RotateCcw,
  UserCheck,
  RefreshCw,
  KeyRound,
  Send,
  Clock,
  Tag,
  TrendingDown,
  PackageCheck,
  Shield,
  AlertCircle,
  MessageSquareReply,
} from "lucide-react";
import { EmailTemplateEditor } from "@/components/settings/EmailTemplateEditor";
import { CreateTemplateModal } from "@/components/settings/CreateTemplateModal";
import { type EmailTemplate } from "@/hooks/useEmailTemplates";

interface EmailTemplatesTabProps {
  templates: EmailTemplate[];
  loading: boolean;
  onUpdateTemplate: (template: EmailTemplate) => Promise<any>;
  onToggleTemplate: (id: string, active: boolean) => void;
  onCreateTemplate: (template: any) => Promise<any>;
  onDeleteTemplate: (id: string) => Promise<any>;
}

const templateCategoryMap: Record<string, string[]> = {
  order: ["order_confirmation", "shipping_notification", "delivery_confirmation", "order_cancelled", "order_status_update", "refund_confirmation", "return_request", "payment_verified"],
  auth: ["password_reset", "welcome_email", "email_verification_otp"],
  marketing: ["abandoned_cart", "review_request", "coupon_promo", "wishlist_price_drop", "back_in_stock"],
  security: ["lockout_alert", "unlock_alert", "login_alert"],
  support: ["contact_reply"],
};

const categoryIcons: Record<string, Record<string, React.ElementType>> = {
  order: { order_confirmation: ShoppingCart, shipping_notification: Package, delivery_confirmation: CheckCircle2, order_cancelled: XCircle, order_status_update: ClipboardList, refund_confirmation: DollarSign, return_request: RotateCcw, payment_verified: CheckCircle2 },
  auth: { password_reset: RefreshCw, welcome_email: UserCheck, email_verification_otp: KeyRound },
  marketing: { abandoned_cart: Clock, review_request: Send, coupon_promo: Tag, wishlist_price_drop: TrendingDown, back_in_stock: PackageCheck },
  security: { lockout_alert: AlertCircle, unlock_alert: CheckCircle2, login_alert: Shield },
  support: { contact_reply: MessageSquareReply },
};

const categories = [
  { key: "order", label: "Order Templates", description: "Email templates for order lifecycle", icon: ShoppingCart },
  { key: "auth", label: "Authentication Templates", description: "Email templates for user authentication", icon: UserCheck },
  { key: "marketing", label: "Marketing Templates", description: "Email templates for customer engagement", icon: Send },
  { key: "security", label: "Security Templates", description: "Email templates for security alerts", icon: Shield },
  { key: "support", label: "Support Templates", description: "Email templates for customer support", icon: MessageSquareReply },
];

export function EmailTemplatesTab({
  templates,
  loading,
  onUpdateTemplate,
  onToggleTemplate,
  onCreateTemplate,
  onDeleteTemplate,
}: EmailTemplatesTabProps) {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);

  const getTemplatesByCategory = (category: string) => {
    const slugs = templateCategoryMap[category];
    if (!slugs) {
      const allMappedSlugs = Object.values(templateCategoryMap).flat();
      return templates.filter((t) => !allMappedSlugs.includes(t.slug));
    }
    return templates.filter((t) => slugs.includes(t.slug));
  };

  const renderTemplateList = (categoryKey: string, templateList: EmailTemplate[]) => (
    <div className="space-y-4">
      {templateList.map((template) => {
        const Icon = categoryIcons[categoryKey]?.[template.slug] || Mail;
        return (
          <div key={template.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{template.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Modified: {new Date(template.updated_at).toLocaleDateString()}
              </span>
              <Button variant="outline" size="sm" onClick={() => { setEditingTemplate(template); setTemplateEditorOpen(true); }}>
                Edit
              </Button>
              <Switch checked={template.is_active} onCheckedChange={(checked) => onToggleTemplate(template.id, checked)} />
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading email templates...
        </CardContent>
      </Card>
    );
  }

  const customTemplates = getTemplatesByCategory("custom");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setCreateTemplateOpen(true)} className="gap-2">
          <FileText className="h-4 w-4" />
          Create Custom Template
        </Button>
      </div>

      {categories.map((cat) => {
        const catTemplates = getTemplatesByCategory(cat.key);
        if (catTemplates.length === 0) return null;
        return (
          <Card key={cat.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <cat.icon className="h-5 w-5 text-accent" />
                {cat.label}
              </CardTitle>
              <CardDescription>{cat.description}</CardDescription>
            </CardHeader>
            <CardContent>{renderTemplateList(cat.key, catTemplates)}</CardContent>
          </Card>
        );
      })}

      {customTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Custom Templates
            </CardTitle>
            <CardDescription>Your custom email templates</CardDescription>
          </CardHeader>
          <CardContent>{renderTemplateList("custom", customTemplates)}</CardContent>
        </Card>
      )}

      <EmailTemplateEditor
        template={editingTemplate}
        open={templateEditorOpen}
        onOpenChange={setTemplateEditorOpen}
        onSave={onUpdateTemplate}
        onDelete={onDeleteTemplate}
      />

      <CreateTemplateModal
        open={createTemplateOpen}
        onOpenChange={setCreateTemplateOpen}
        onSave={onCreateTemplate}
      />
    </div>
  );
}
