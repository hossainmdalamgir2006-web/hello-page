import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { AutoReplySettings } from "@/components/settings/AutoReplySettings";
import { CannedResponsesSettings } from "@/components/settings/CannedResponsesSettings";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><span className="text-primary">🔌</span></div>
          Integrations
        </h2>
        <p className="text-sm text-muted-foreground ml-12">Third-party integrations, auto-reply and quick response templates</p>
      </div>
      <IntegrationsSettings />
      <AutoReplySettings />
      <CannedResponsesSettings />
    </div>
  );
}
