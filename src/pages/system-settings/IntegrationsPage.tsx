import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { AutoReplySettings } from "@/components/settings/AutoReplySettings";
import { CannedResponsesSettings } from "@/components/settings/CannedResponsesSettings";
import { SLASettings } from "@/components/settings/SLASettings";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="🔌 Integrations"
        description="Third-party integrations, auto-reply, quick responses and SLA configuration"
      />
      <IntegrationsSettings />
      <SLASettings />
      <AutoReplySettings />
      <CannedResponsesSettings />
    </div>
  );
}
