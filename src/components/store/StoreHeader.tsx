import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, User, Heart, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { CartDrawer } from "./CartDrawer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MegaMenuNav, MobileMegaMenu } from "./MegaMenuNav";
import { usePageContent } from "@/hooks/usePageContents";
import { useStoreSettingsCache } from "@/hooks/useStoreSettingsCache";
import { OptimizedImage } from "@/components/ui/optimized-image";

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: settings } = useStoreSettingsCache();
  const { data: headerContent } = usePageContent("header");
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const storeName = settings?.STORE_NAME || "Your Store";
  const storeLogo = settings?.STORE_LOGO || null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-store-card/95 backdrop-blur-md border-b border-store-muted">
      {/* Top Banner */}
      {(headerContent?.content as any)?.banner_enabled !== false && (
        <div className="bg-gradient-to-r from-store-primary via-store-secondary to-store-accent text-store-primary-foreground py-2 text-center text-sm font-medium">
          {(headerContent?.content as any)?.banner_text || "🔥 Free Shipping on Orders Over ৳2,000!"}
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <div className="mt-6 mb-4">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <span className="font-display font-bold text-xl bg-gradient-to-r from-store-primary to-store-secondary bg-clip-text text-transparent">
                    {storeName}
                  </span>
                </Link>
              </div>
              <MobileMegaMenu onClose={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {storeLogo ? (
              <OptimizedImage
                src={storeLogo}
                alt={storeName}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-store-primary/20"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-store-primary to-store-secondary flex items-center justify-center">
                <span className="text-store-primary-foreground font-display font-bold text-lg md:text-xl">
                  {storeName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-display font-bold text-xl md:text-2xl bg-gradient-to-r from-store-primary to-store-secondary bg-clip-text text-transparent">
              {storeName}
            </span>
          </Link>

          {/* Desktop Navigation — Mega Menu */}
          <MegaMenuNav />

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {searchOpen ? (
              <div className="absolute left-0 right-0 top-full bg-store-card p-4 border-b border-store-muted shadow-lg md:relative md:top-0 md:shadow-none md:border-none md:p-0">
                <div className="flex items-center gap-2 max-w-md mx-auto md:mx-0">
                  <Input placeholder="Search products..." className="flex-1" autoFocus />
                  <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="hidden md:flex">
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden md:flex relative" onClick={() => navigate('/wishlist')}>
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-store-primary text-store-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Button>

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {(role === 'admin' || role === 'manager' || role === 'support') && (
                    <>
                      <DropdownMenuItem onClick={() => navigate(
                        role === 'admin' ? '/admin/dashboard' :
                        role === 'manager' ? '/manager/dashboard' : '/support/dashboard'
                      )}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/myaccount')}>
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/myaccount/orders')}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => navigate('/login')}>
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-store-secondary text-store-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <CartDrawer />
    </header>
  );
}
