import { EmailTemplatesTab } from "@/components/settings/EmailTemplatesTab";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";

export default function EmailsPage() {
  const { templates, loading, updateTemplate, toggleTemplate, createTemplate, deleteTemplate } = useEmailTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Email Templates</h2>
        <p className="text-sm text-muted-foreground">Manage email templates for order confirmations, notifications and more</p>
      </div>
      <EmailTemplatesTab
        templates={templates}
        loading={loading}
        onUpdateTemplate={updateTemplate}
        onToggleTemplate={toggleTemplate}
        onCreateTemplate={createTemplate}
        onDeleteTemplate={deleteTemplate}
      />
    </div>
  );
}
