import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import {
  Store, CreditCard, Mail, Bell, Shield, ClipboardList, HardDrive, Plug, Globe, Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const settingsNav = [
  { to: "/admin/settings/store", label: "Store", icon: Store },
  { to: "/admin/settings/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/settings/emails", label: "Email Templates", icon: Mail },
  { to: "/admin/settings/notifications", label: "Alerts & Email", icon: Bell },
  { to: "/admin/settings/security", label: "Security", icon: Shield },
  { to: "/admin/settings/audit", label: "Audit Log", icon: ClipboardList },
  { to: "/admin/settings/backup", label: "Backup", icon: HardDrive },
  { to: "/admin/settings/integrations", label: "Integrations", icon: Plug },
  { to: "/admin/settings/languages", label: "Languages", icon: Globe },
];

export default function SettingsLayout() {
  const location = useLocation();

  // Redirect /admin/settings to /admin/settings/store
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
        {/* Sidebar nav — horizontal scroll on mobile, vertical on desktop */}
        <div className="lg:w-56 shrink-0">
          {/* Mobile: horizontal scroll */}
          <ScrollArea className="lg:hidden w-full">
            <div className="flex gap-1 pb-2">
              {settingsNav.map((item) => (
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

          {/* Desktop: vertical sidebar */}
          <nav className="hidden lg:flex flex-col gap-1">
            {settingsNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
