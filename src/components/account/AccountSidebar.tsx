import {
  LayoutDashboard, Package, Heart, ShoppingBag, Clock, MapPin, Shield,
  HelpCircle, Settings, LogOut, ChevronsLeft, ChevronsRight, Store, X,
  RotateCcw, Star, Bell, CreditCard, MessageCircle,
} from "lucide-react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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

// Menu sections with translation keys
const menuSectionsConfig = [
  {
    labelKey: "account.overview",
    items: [
      { titleKey: "account.dashboard", url: "/myaccount", icon: LayoutDashboard, end: true },
      { titleKey: "account.notifications", url: "/myaccount/notifications", icon: Bell },
    ],
  },
  {
    labelKey: "account.orders",
    items: [
      { titleKey: "account.myOrders", url: "/myaccount/orders", icon: Package },
      { titleKey: "account.returns", url: "/myaccount/returns", icon: RotateCcw },
    ],
  },
  {
    labelKey: "account.shopping",
    items: [
      { titleKey: "account.wishlist", url: "/myaccount/wishlist", icon: Heart },
      { titleKey: "account.shoppingLink", url: "/myaccount/shopping", icon: ShoppingBag },
      { titleKey: "account.recentlyViewed", url: "/myaccount/recently-viewed", icon: Clock },
      { titleKey: "account.myReviews", url: "/myaccount/reviews", icon: Star },
    ],
  },
  {
    labelKey: "account.accountSection",
    items: [
      { titleKey: "account.addresses", url: "/myaccount/addresses", icon: MapPin },
      { titleKey: "account.paymentMethods", url: "/myaccount/payment-methods", icon: CreditCard },
      { titleKey: "account.security", url: "/myaccount/security", icon: Shield },
      { titleKey: "account.settings", url: "/myaccount/settings", icon: Settings },
    ],
  },
  {
    labelKey: "account.help",
    items: [
      { titleKey: "account.support", url: "/myaccount/support", icon: HelpCircle },
      { titleKey: "account.liveChat", url: "/myaccount/chat", icon: MessageCircle },
    ],
  },
];

export function AccountSidebar({ collapsed = false, onToggleCollapse, avatarUrl, fullName, email, onCloseMobile }: AccountSidebarProps) {
  const { signOut } = useAuth();
  const { t } = useLanguage();
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

  const renderNavItem = (item: { titleKey: string; url: string; icon: React.ElementType; end?: boolean }) => {
    const active = isActive(item.url);
    const title = t(item.titleKey);
    const showBadge = item.url === "/myaccount/notifications" && unreadCount > 0;
    const content = (
      <button
        key={item.url}
        onClick={() => handleNav(item.url)}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-r-lg py-2.5 text-sm font-medium transition-all",
          collapsed ? "justify-center px-2 rounded-lg" : "px-3",
          active
            ? "bg-sidebar-accent text-sidebar-primary-foreground border-l-[3px] border-sidebar-primary"
            : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-[3px] border-transparent"
        )}
      >
        <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-sidebar-primary")} />
        {!collapsed && <span className="flex-1 text-left">{title}</span>}
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
          <TooltipContent side="right" className="font-medium">{title}</TooltipContent>
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-[68px]" : "w-64"
    )}>
      <div className="flex h-full flex-col overflow-y-auto px-3 py-5">
        {/* Logo / Brand */}
        <div className={cn("flex items-center gap-3 px-2", collapsed && "justify-center px-0")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
            <span className="font-display text-base font-bold text-sidebar-primary-foreground">E</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-base font-bold text-sidebar-foreground leading-tight">Ekta</h1>
            </div>
          )}
          {onCloseMobile && !collapsed && (
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground" onClick={onCloseMobile}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Spacer */}
        <div className="mt-5 mb-6" />

        {/* Navigation */}
        <nav className="flex-1 space-y-5">
          {menuSectionsConfig.map((section, idx) => (
            <div key={section.labelKey}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-sidebar-muted/70">
                  {t(section.labelKey)}
                </p>
              )}
              {collapsed && idx > 0 && <div className="my-3 border-t border-sidebar-border" />}
              <div className="space-y-0.5">{section.items.map(renderNavItem)}</div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-0.5 border-t border-sidebar-border pt-4">
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={() => handleNav("/")} className="flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground">
                  <Store className="h-[18px] w-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">{t('account.backToStore')}</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={() => handleNav("/")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <Store className="h-[18px] w-[18px]" /><span>{t('account.backToStore')}</span>
            </button>
          )}

          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={handleLogout} className="flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-[18px] w-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">{t('account.signOut')}</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-[18px] w-[18px]" /><span>Sign Out</span>
            </button>
          )}

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
