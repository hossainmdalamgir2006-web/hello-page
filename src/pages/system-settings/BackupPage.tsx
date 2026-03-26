import { BackupSettings } from "@/components/settings/BackupSettings";

export default function BackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><span className="text-primary">💾</span></div>
          Backup & Restore
        </h2>
        <p className="text-sm text-muted-foreground ml-12">Create database backups and restore from previous snapshots</p>
      </div>
      <BackupSettings />
    </div>
  );
}
