import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileEdit, AlertTriangle, Package } from "lucide-react";

interface ProductStatusBarProps {
  products: Array<{
    status: "active" | "draft";
    stock: number;
    low_stock_threshold?: number;
  }>;
}

export function ProductStatusBar({ products }: ProductStatusBarProps) {
  const active = products.filter(p => p.status === "active").length;
  const draft = products.filter(p => p.status === "draft").length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 10)).length;

  const items = [
    { label: "Active", count: active, icon: CheckCircle2, className: "bg-success/10 text-success border-success/20" },
    { label: "Draft", count: draft, icon: FileEdit, className: "bg-muted text-muted-foreground border-border" },
    { label: "Out of Stock", count: outOfStock, icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/20" },
    { label: "Low Stock", count: lowStock, icon: Package, className: "bg-warning/10 text-warning border-warning/20" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(item => (
        <Badge key={item.label} variant="outline" className={`gap-1.5 px-3 py-1.5 text-xs font-medium ${item.className}`}>
          <item.icon className="h-3.5 w-3.5" />
          {item.count} {item.label}
        </Badge>
      ))}
    </div>
  );
}
