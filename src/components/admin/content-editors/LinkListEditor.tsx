import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface LinkItem { label?: string; href?: string; name?: string; logo?: string; }

interface Props {
  label: string;
  value: LinkItem[];
  onChange: (val: LinkItem[]) => void;
  type?: "link" | "courier";
}

export function LinkListEditor({ label, value, onChange, type = "link" }: Props) {
  const items: LinkItem[] = Array.isArray(value) ? value : [];

  const update = (i: number, patch: Partial<LinkItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, type === "courier" ? { name: "", logo: "" } : { label: "", href: "" }]);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {type === "courier" ? (
            <>
              <Input value={item.name || ""} onChange={(e) => update(i, { name: e.target.value })} placeholder="Name" className="text-sm" />
              <Input value={item.logo || ""} onChange={(e) => update(i, { logo: e.target.value })} placeholder="Logo URL" className="text-sm" />
            </>
          ) : (
            <>
              <Input value={item.label || ""} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" className="text-sm" />
              <Input value={item.href || ""} onChange={(e) => update(i, { href: e.target.value })} placeholder="URL" className="text-sm" />
            </>
          )}
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => remove(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" />Add {type === "courier" ? "Partner" : "Link"}</Button>
    </div>
  );
}
