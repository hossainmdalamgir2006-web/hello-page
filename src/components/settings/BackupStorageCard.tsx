import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, Database, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { BackupRecord } from "@/hooks/useBackupData";

interface Props {
  backups: BackupRecord[];
}

const SOFT_LIMIT_BYTES = 100 * 1024 * 1024; // 100 MB visual reference

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function BackupStorageCard({ backups }: Props) {
  const completed = backups.filter(b => b.status === "completed");
  const totalSize = completed.reduce((sum, b) => sum + (b.file_size || 0), 0);
  const oldest = completed.length > 0
    ? completed.reduce((o, b) => new Date(b.created_at) < new Date(o.created_at) ? b : o)
    : null;

  const usagePercent = Math.min(100, (totalSize / SOFT_LIMIT_BYTES) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          Storage Usage
        </CardTitle>
        <CardDescription>Backup storage overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Database className="h-3.5 w-3.5" /> Total Backups
            </div>
            <p className="text-2xl font-bold mt-1">{completed.length}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5" /> Total Size
            </div>
            <p className="text-2xl font-bold mt-1">{formatSize(totalSize)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Oldest
            </div>
            <p className="text-sm font-medium mt-2">
              {oldest ? formatDistanceToNow(new Date(oldest.created_at), { addSuffix: true }) : "—"}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Storage Used (vs 100 MB reference)</span>
            <span className="font-medium tabular-nums">{usagePercent.toFixed(1)}%</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
