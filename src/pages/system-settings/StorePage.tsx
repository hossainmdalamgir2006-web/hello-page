import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StoreSettingsTab } from "@/components/settings/StoreSettingsTab";

export default function StorePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site Settings"
        description="Upload limits and maintenance mode"
      />
      <StoreSettingsTab />
    </div>
  );
}
