import { cn } from "@/lib/utils";

interface JsonDiffViewProps {
  oldValue: any;
  newValue: any;
}

type DiffKind = "added" | "removed" | "changed" | "unchanged";

interface DiffRow {
  key: string;
  kind: DiffKind;
  oldVal?: any;
  newVal?: any;
}

function formatVal(v: any): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function buildDiff(oldVal: any, newVal: any): DiffRow[] {
  const oldObj = (oldVal && typeof oldVal === "object" && !Array.isArray(oldVal)) ? oldVal : { value: oldVal };
  const newObj = (newVal && typeof newVal === "object" && !Array.isArray(newVal)) ? newVal : { value: newVal };

  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {}),
  ]);

  const rows: DiffRow[] = [];
  allKeys.forEach((key) => {
    const oV = oldObj?.[key];
    const nV = newObj?.[key];
    const oExists = oldObj && key in oldObj;
    const nExists = newObj && key in newObj;

    if (!oExists && nExists) rows.push({ key, kind: "added", newVal: nV });
    else if (oExists && !nExists) rows.push({ key, kind: "removed", oldVal: oV });
    else if (JSON.stringify(oV) !== JSON.stringify(nV)) rows.push({ key, kind: "changed", oldVal: oV, newVal: nV });
    else rows.push({ key, kind: "unchanged", oldVal: oV, newVal: nV });
  });

  return rows.sort((a, b) => {
    const order = { changed: 0, added: 1, removed: 2, unchanged: 3 };
    return order[a.kind] - order[b.kind];
  });
}

export function JsonDiffView({ oldValue, newValue }: JsonDiffViewProps) {
  if (!oldValue && !newValue) return null;

  const rows = buildDiff(oldValue, newValue);
  const hasChanges = rows.some(r => r.kind !== "unchanged");

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="grid grid-cols-[1fr,1fr] text-xs font-medium bg-muted/50 px-3 py-2 border-b">
        <div>Old Value</div>
        <div>New Value</div>
      </div>
      <div className="divide-y divide-border max-h-64 overflow-auto">
        {!hasChanges && (
          <div className="px-3 py-4 text-center text-xs text-muted-foreground">
            No field-level changes detected
          </div>
        )}
        {rows.filter(r => r.kind !== "unchanged").map((row) => (
          <div key={row.key} className="grid grid-cols-[1fr,1fr] gap-2 px-3 py-2 text-xs">
            <div className={cn(
              "font-mono break-all",
              row.kind === "removed" && "bg-destructive/10 text-destructive p-1.5 rounded",
              row.kind === "changed" && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 p-1.5 rounded",
              row.kind === "added" && "text-muted-foreground/50 italic p-1.5"
            )}>
              <span className="font-semibold">{row.key}:</span>{" "}
              {row.kind === "added" ? "—" : formatVal(row.oldVal)}
            </div>
            <div className={cn(
              "font-mono break-all",
              row.kind === "added" && "bg-success/10 text-success p-1.5 rounded",
              row.kind === "changed" && "bg-success/10 text-success p-1.5 rounded",
              row.kind === "removed" && "text-muted-foreground/50 italic p-1.5"
            )}>
              <span className="font-semibold">{row.key}:</span>{" "}
              {row.kind === "removed" ? "—" : formatVal(row.newVal)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
