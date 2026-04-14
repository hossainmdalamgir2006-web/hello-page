import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DocumentTemplateEditor } from "@/components/settings/DocumentTemplateEditor";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/SEOHead";

export default function DocumentTemplatesPage() {
  const { templates, loading, updateTemplate } = useDocumentTemplates();

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Document Templates" description="Customize Invoice and Packing Slip templates" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Document Templates" noIndex />
      <div className="space-y-6">
        <AdminPageHeader title="Document Templates" description="Customize your Invoice and Packing Slip PDF layouts, branding, and content" />
        <div className="grid gap-6 lg:grid-cols-2">
          {templates.map((template) => (
            <DocumentTemplateEditor
              key={template.id}
              template={template}
              onSave={(config) => updateTemplate(template.id, config)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
