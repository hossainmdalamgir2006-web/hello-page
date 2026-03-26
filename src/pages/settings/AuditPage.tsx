import { AuditLogTab } from "@/components/settings/AuditLogTab";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><span className="text-primary">📋</span></div>
          Audit Log
        </h2>
        <p className="text-sm text-muted-foreground ml-12">Track all admin actions and system changes</p>
      </div>
      <AuditLogTab />
    </div>
  );
}
