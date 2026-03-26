import { useState } from "react";
import { 
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, LogOut,
  Tag, Award, Truck, MessageSquare, FileText, Ticket, UserCog, User,
  ShoppingBasket, ChevronsLeft, ChevronsRight, Trash2, Paintbrush, Home, Star,
  ChevronDown, ExternalLink, HardDrive, Plug, Shield, ClipboardList, Mail, Bell,
  Store, CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteTitle } from "@/components/DynamicTitleProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: string[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export function AdminSidebar({ collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const { t } = useLanguage();
  const { storeName } = useSiteTitle();
  const { signOut, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getSettingValue } = useStoreSettings();
  const storeLogo = getSettingValue('STORE_LOGO');

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    content: true,
    operations: true,
    communication: true,
    'system settings': true,
    account: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: t('logout'), description: 'You have been logged out successfully.' });
    navigate('/login');
  };

  const getBasePath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'manager') return '/manager';
    if (role === 'support') return '/support';
    return '/admin';
  };

  const basePath = getBasePath();

  const getPanelName = () => {
    if (role === 'admin') return 'Admin Panel';
    if (role === 'manager') return 'Manager Panel';
    if (role === 'support') return 'Support Panel';
    return 'Dashboard';
  };

  // Main menu items
  const menuItems: MenuItem[] = [
    { title: t('nav.dashboard'), url: `${basePath}/dashboard`, icon: LayoutDashboard, roles: ['admin', 'manager', 'support'] },
    { title: t('nav.products'), url: `${basePath}/products`, icon: Package, roles: ['admin', 'manager'] },
    { title: t('nav.orders'), url: `${basePath}/orders`, icon: ShoppingCart, roles: ['admin', 'manager', 'support'] },
    { title: t('nav.customers'), url: `${basePath}/customers`, icon: Users, roles: ['admin', 'manager', 'support'] },
    { title: t('nav.categories'), url: "/admin/categories", icon: Tag, roles: ['admin'] },
    { title: "Brands", url: "/admin/brands", icon: Award, roles: ['admin'] },
    { title: t('nav.analytics'), url: `${basePath}/analytics`, icon: BarChart3, roles: ['admin', 'manager'] },
  ].filter(item => role && item.roles.includes(role));

  // Management sub-groups (admin only gets collapsible groups)
  const managementGroups: MenuGroup[] = [
    {
      label: "Content",
      items: [
        { title: "Homepage", url: "/admin/homepage", icon: Home, roles: ['admin'] },
        { title: "Page Content", url: "/admin/page-content", icon: FileText, roles: ['admin'] },
        { title: "Appearance", url: "/admin/appearance", icon: Paintbrush, roles: ['admin'] },
        { title: "Reviews", url: "/admin/reviews", icon: Star, roles: ['admin'] },
      ],
    },
    {
      label: "Operations",
      items: [
        { title: t('nav.shipping'), url: `${role === 'admin' ? '/admin' : '/manager'}/shipping`, icon: Truck, roles: ['admin', 'manager'] },
        { title: t('nav.coupons'), url: `${role === 'admin' ? '/admin' : '/manager'}/coupons`, icon: Ticket, roles: ['admin', 'manager'] },
        { title: "Abandoned Carts", url: "/admin/abandoned-carts", icon: ShoppingBasket, roles: ['admin'] },
        { title: "Trash", url: `${role === 'admin' ? '/admin' : '/manager'}/trash`, icon: Trash2, roles: ['admin', 'manager'] },
      ],
    },
    {
      label: "Communication",
      items: [
        { title: t('nav.messages'), url: `${basePath}/messages`, icon: MessageSquare, roles: ['admin', 'manager', 'support'] },
        { title: t('nav.reports'), url: `${role === 'manager' ? '/manager' : '/admin'}/reports`, icon: FileText, roles: ['admin', 'manager'] },
      ],
    },
    {
      label: "System Settings",
      items: [
        { title: t('nav.roles'), url: "/admin/role-management", icon: UserCog, roles: ['admin'] },
        { title: "Store", url: "/admin/settings/store", icon: Store, roles: ['admin'] },
        { title: "Payments", url: "/admin/settings/payments", icon: CreditCard, roles: ['admin'] },
        { title: "Security", url: "/admin/settings/security", icon: Shield, roles: ['admin'] },
        { title: "Audit Log", url: "/admin/settings/audit", icon: ClipboardList, roles: ['admin'] },
        { title: "Email Templates", url: "/admin/settings/emails", icon: Mail, roles: ['admin'] },
        { title: "Alerts & Email", url: "/admin/settings/notifications", icon: Bell, roles: ['admin'] },
        { title: "Backup", url: "/admin/settings/backup", icon: HardDrive, roles: ['admin'] },
        { title: "Integrations", url: "/admin/settings/integrations", icon: Plug, roles: ['admin'] },
      ],
    },
  ];

  // Filter groups by role
  const filteredGroups = managementGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => role && item.roles.includes(role)),
    }))
    .filter(group => group.items.length > 0);

  const bottomMenuItems = [
    { title: t('nav.profile'), url: `${basePath}/profile`, icon: User, roles: ['admin', 'manager', 'support'] },
  ].filter(item => role && item.roles.includes(role));

  const renderNavItem = (item: MenuItem, isEnd?: boolean) => {
    const linkContent = (
      <NavLink
        key={item.url}
        to={item.url}
        end={isEnd}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
          collapsed && "justify-center px-2"
        )}
        activeClassName="bg-sidebar-accent text-sidebar-foreground"
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.title}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.url} delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{item.title}</TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300",
      collapsed ? "w-[68px]" : "w-64"
    )}>
      <div className="flex h-full flex-col overflow-y-auto px-3 py-6">
        {/* Logo */}
        <div className={cn("mb-8 flex items-center gap-3 px-2", collapsed && "justify-center px-0")}>
          {storeLogo ? (
            <img src={storeLogo} alt={storeName} className="h-10 w-10 rounded-lg object-contain shrink-0" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
              <span className="font-display text-lg font-bold text-sidebar-primary-foreground">{storeName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          {!collapsed && (
            <div>
              <h1 className="font-display text-lg font-bold text-sidebar-foreground">{storeName}</h1>
              <p className="text-xs text-sidebar-muted">{getPanelName()}</p>
            </div>
          )}
        </div>

        {/* Main Menu */}
        <nav className="flex-1 space-y-4">
          <div>
            {!collapsed && (
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">{t('nav.menu')}</p>
            )}
            <div className="space-y-1">
              {menuItems.map((item) => renderNavItem(item, item.url.endsWith('/dashboard')))}
            </div>
          </div>

          {/* Management Groups */}
          {filteredGroups.length > 0 && (
            <div>
              {!collapsed && (
                <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">{t('nav.management')}</p>
              )}
              {collapsed && <div className="my-3 border-t border-sidebar-border" />}
              
              {collapsed ? (
                <div className="space-y-1">
                  {filteredGroups.flatMap(g => g.items).map((item) => renderNavItem(item))}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredGroups.map((group) => (
                    <Collapsible
                      key={group.label}
                      open={openGroups[group.label.toLowerCase()]}
                      onOpenChange={() => toggleGroup(group.label.toLowerCase())}
                    >
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted hover:bg-sidebar-accent/50 transition-colors">
                        <span>{group.label}</span>
                        <ChevronDown className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          openGroups[group.label.toLowerCase()] && "rotate-180"
                        )} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 pt-1">
                        {group.items.map((item) => renderNavItem(item))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Bottom Menu */}
        <div className="mt-auto space-y-1 border-t border-sidebar-border pt-4">
          {/* Visit Store */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <a href="/" target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground">
                  <ExternalLink className="h-5 w-5 shrink-0" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">Visit Store</TooltipContent>
            </Tooltip>
          ) : (
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <ExternalLink className="h-5 w-5 shrink-0" />
              <span>Visit Store</span>
            </a>
          )}

          {/* Account Group */}
          {collapsed ? (
            <>
              {bottomMenuItems.map((item) => renderNavItem(item))}
            </>
          ) : (
            <Collapsible
              open={openGroups['account']}
              onOpenChange={() => toggleGroup('account')}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted hover:bg-sidebar-accent/50 transition-colors">
                <span className="flex items-center gap-3">
                  <User className="h-4 w-4 shrink-0" />
                  Account
                </span>
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  openGroups['account'] && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-1">
                {bottomMenuItems.map((item) => renderNavItem(item))}
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Logout */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={handleLogout} className="flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-5 w-5 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">{t('nav.logout')}</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-5 w-5" />
              <span>{t('nav.logout')}</span>
            </button>
          )}

          {/* Collapse toggle */}
          {onToggleCollapse && (
            <Button variant="ghost" size="sm" onClick={onToggleCollapse} className={cn("w-full mt-2 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex", collapsed ? "justify-center px-2" : "justify-start px-3 gap-3")}>
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /><span className="text-xs">Collapse Sidebar</span></>}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
