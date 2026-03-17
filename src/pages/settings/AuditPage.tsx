import { AuditLogTab } from "@/components/settings/AuditLogTab";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Audit Log</h2>
        <p className="text-sm text-muted-foreground">Track all admin actions and system changes</p>
      </div>
      <AuditLogTab />
    </div>
  );
}
