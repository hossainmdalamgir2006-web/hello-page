import { Outlet, Navigate, useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User, Lock, Shield, History } from "lucide-react";

const navItems = [
  { label: "Personal Info", path: "personal-info", icon: User },
  { label: "Password", path: "password", icon: Lock },
  { label: "Security", path: "security", icon: Shield },
  { label: "Login Activity", path: "login-activity", icon: History },
];

export default function ProfileLayout() {
  const location = useLocation();
  const basePath = location.pathname.match(/^\/(admin|manager|support)\/account-settings/)?.[0] || "/admin/account-settings";

  if (location.pathname === basePath || location.pathname === `${basePath}/`) {
    return <Navigate to={`${basePath}/personal-info`} replace />;
  }

  const currentPath = location.pathname.split("/").pop();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, password, and security preferences</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Nav */}
        <nav className="rounded-xl border border-border/50 bg-card p-3 h-fit space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={`${basePath}/${item.path}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
