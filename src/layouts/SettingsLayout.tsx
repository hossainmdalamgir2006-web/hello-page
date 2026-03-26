import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import {
  Store, CreditCard, Mail, Bell, Shield, ClipboardList, HardDrive, Plug,
  ChevronDown, Settings2, MessageSquareMore, Lock, Cog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const settingsGroups: NavGroup[] = [
  {
    label: "General",
    icon: Settings2,
    items: [
      { to: "/admin/settings/store", label: "Store", icon: Store },
      { to: "/admin/settings/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquareMore,
    items: [
      { to: "/admin/settings/emails", label: "Email Templates", icon: Mail },
      { to: "/admin/settings/notifications", label: "Alerts & Email", icon: Bell },
    ],
  },
  {
    label: "Security",
    icon: Lock,
    items: [
      { to: "/admin/settings/security", label: "Security", icon: Shield },
      { to: "/admin/settings/audit", label: "Audit Log", icon: ClipboardList },
    ],
  },
  {
    label: "System",
    icon: Cog,
    items: [
      { to: "/admin/settings/backup", label: "Backup", icon: HardDrive },
      { to: "/admin/settings/integrations", label: "Integrations", icon: Plug },
    ],
  },
];

const allItems = settingsGroups.flatMap((g) => g.items);

export default function SettingsLayout() {
  const location = useLocation();

  if (location.pathname === "/admin/settings" || location.pathname === "/admin/settings/") {
    return <Navigate to="/admin/settings/store" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your store configuration and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          {/* Mobile: horizontal scroll (flat) */}
          <ScrollArea className="lg:hidden w-full">
            <div className="flex gap-1 pb-2">
              {allItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Desktop: collapsible groups */}
          <nav className="hidden lg:flex flex-col gap-1">
            {settingsGroups.map((group) => {
              const isGroupActive = group.items.some((item) => location.pathname.startsWith(item.to));

              return (
                <Collapsible key={group.label} defaultOpen={isGroupActive}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 transition-colors">
                    <span className="flex items-center gap-2">
                      <group.icon className="h-3.5 w-3.5" />
                      {group.label}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 pt-1 pb-2">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ml-2",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </NavLink>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
