import { EmailApiConfig } from "@/components/settings/EmailApiConfig";
import { AllEmailNotifications } from "@/components/settings/AllEmailNotifications";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Alerts & Email API</h2>
        <p className="text-sm text-muted-foreground">Configure email API and manage notification preferences</p>
      </div>
      <EmailApiConfig />
      <AllEmailNotifications />
    </div>
  );
}
