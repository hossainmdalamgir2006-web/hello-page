import { EmailApiConfig } from "@/components/settings/EmailApiConfig";
import { AllEmailNotifications } from "@/components/settings/AllEmailNotifications";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><span className="text-primary">🔔</span></div>
          Alerts & Email API
        </h2>
        <p className="text-sm text-muted-foreground ml-12">Configure email API and manage notification preferences</p>
      </div>
      <EmailApiConfig />
      <AllEmailNotifications />
    </div>
  );
}
