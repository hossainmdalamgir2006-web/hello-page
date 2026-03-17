import { BackupSettings } from "@/components/settings/BackupSettings";

export default function BackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Backup & Restore</h2>
        <p className="text-sm text-muted-foreground">Create database backups and restore from previous snapshots</p>
      </div>
      <BackupSettings />
    </div>
  );
}
