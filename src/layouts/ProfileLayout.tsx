import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { User, Lock, Shield, Monitor, ChevronDown, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function ProfileLayout() {
  const location = useLocation();

  // Detect base path (admin/manager/support)
  const basePath = location.pathname.match(/^\/(admin|manager|support)\/profile/)?.[0] || "/admin/profile";

  const profileNav = [
    { to: `${basePath}/personal`, label: "Personal Info", icon: User },
    { to: `${basePath}/password`, label: "Password", icon: Lock },
    { to: `${basePath}/security`, label: "Security", icon: Shield },
  ];

  const sessionsSubItems = [
    { to: `${basePath}/sessions/active`, label: "Active Sessions", icon: Monitor },
    { to: `${basePath}/sessions/activity`, label: "Login Activity", icon: History },
  ];

  const isSessionsActive = location.pathname.includes(`${basePath}/sessions`);

  if (location.pathname === basePath || location.pathname === `${basePath}/`) {
    return <Navigate to={`${basePath}/personal`} replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <ScrollArea className="lg:hidden w-full">
            <div className="flex gap-1 pb-2">
              {profileNav.map((item) => (
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
              {sessionsSubItems.map((item) => (
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

          <nav className="hidden lg:flex flex-col gap-1">
            {profileNav.map((item) => (
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

            <Collapsible defaultOpen={isSessionsActive}>
              <CollapsibleTrigger className={cn(
                "flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isSessionsActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <span className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 shrink-0" />
                  Sessions
                </span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 flex flex-col gap-0.5 mt-0.5">
                  {sessionsSubItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
