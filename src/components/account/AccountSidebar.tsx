import {
  LayoutDashboard, Package, Heart, ShoppingBag, Clock, MapPin, Shield,
  HelpCircle, Settings, LogOut, ChevronsLeft, ChevronsRight, Store, X,
  Navigation, FileText, RotateCcw, Star, Bell, CreditCard, MessageCircle,
} from "lucide-react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AccountSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  avatarUrl?: string | null;
  fullName?: string;
  email?: string;
  onCloseMobile?: () => void;
}

const menuSections = [
  {
    label: "OVERVIEW",
    items: [
      { title: "Dashboard", url: "/myaccount", icon: LayoutDashboard, end: true },
      { title: "Notifications", url: "/myaccount/notifications", icon: Bell },
    ],
  },
  {
    label: "ORDERS",
    items: [
      { title: "My Orders", url: "/myaccount/orders", icon: Package },
      { title: "Returns", url: "/myaccount/returns", icon: RotateCcw },
    ],
  },
  {
    label: "SHOPPING",
    items: [
      { title: "Wishlist", url: "/myaccount/wishlist", icon: Heart },
      { title: "Shopping", url: "/myaccount/shopping", icon: ShoppingBag },
      { title: "Recently Viewed", url: "/myaccount/recently-viewed", icon: Clock },
      { title: "My Reviews", url: "/myaccount/reviews", icon: Star },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { title: "Addresses", url: "/myaccount/addresses", icon: MapPin },
      { title: "Payment Methods", url: "/myaccount/payment-methods", icon: CreditCard },
      { title: "Security", url: "/myaccount/security", icon: Shield },
      { title: "Settings", url: "/myaccount/settings", icon: Settings },
    ],
  },
  {
    label: "HELP",
    items: [
      { title: "Support", url: "/myaccount/support", icon: HelpCircle },
      { title: "Live Chat", url: "/myaccount/chat", icon: MessageCircle },
    ],
  },
];

export function AccountSidebar({ collapsed = false, onToggleCollapse, onCloseMobile }: AccountSidebarProps) {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useRealtimeNotifications();

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Signed Out", description: "You have been signed out successfully." });
    navigate("/");
  };

  const isActive = (url: string) => location.pathname === url;

  const handleNav = (url: string) => {
    navigate(url);
    onCloseMobile?.();
  };

  const renderNavItem = (item: { title: string; url: string; icon: React.ElementType; end?: boolean }) => {
    const active = isActive(item.url);
    const showBadge = item.url === "/myaccount/notifications" && unreadCount > 0;
    const content = (
      <button
        key={item.url}
        onClick={() => handleNav(item.url)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          collapsed && "justify-center px-2",
          active
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="flex-1 text-left">{item.title}</span>}
        {!collapsed && showBadge && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-[10px] font-bold px-1">
            {unreadCount}
          </span>
        )}
        {collapsed && showBadge && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-sidebar-primary" />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.url} delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{item.title}</TooltipContent>
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300",
      collapsed ? "w-[68px]" : "w-64"
    )}>
      <div className="flex h-full flex-col overflow-y-auto px-3 py-6">
        {/* Logo / Brand */}
        <div className={cn("mb-8 flex items-center gap-3 px-2", collapsed && "justify-center px-0")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
            <span className="font-display text-lg font-bold text-sidebar-primary-foreground">E</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-lg font-bold text-sidebar-foreground">Ekta</h1>
              <p className="text-xs text-sidebar-muted">My Account</p>
            </div>
          )}
          {/* Mobile close */}
          {onCloseMobile && !collapsed && (
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground" onClick={onCloseMobile}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
                  {section.label}
                </p>
              )}
              {collapsed && idx > 0 && <div className="my-3 border-t border-sidebar-border" />}
              <div className="space-y-1">{section.items.map(renderNavItem)}</div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-1 border-t border-sidebar-border pt-4">
          {/* Back to Store */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={() => handleNav("/")} className="flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground">
                  <Store className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">Back to Store</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={() => handleNav("/")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <Store className="h-5 w-5" /><span>Back to Store</span>
            </button>
          )}

          {/* Logout */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={handleLogout} className="flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">Sign Out</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-5 w-5" /><span>Sign Out</span>
            </button>
          )}

          {/* Collapse toggle */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn(
                "w-full mt-2 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex",
                collapsed ? "justify-center px-2" : "justify-start px-3 gap-3"
              )}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /><span className="text-xs">Collapse</span></>}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
