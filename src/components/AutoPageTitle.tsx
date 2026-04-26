import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteTitle } from "@/components/DynamicTitleProvider";

// Page title mapping
const pageTitles: Record<string, string> = {
  // Store pages
  "/": "Home",
  "/products": "Products",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/order-confirmation": "Order Confirmed",
  "/track-order": "Track Order",
  "/myaccount": "My Account",
  "/wishlist": "Wishlist",
  "/contact": "Contact Us",
  "/faq": "FAQ",
  "/shipping-info": "Shipping Info",
  "/returns": "Returns & Refunds",
  "/size-guide": "Size Guide",
  "/privacy": "Privacy Policy",
  "/terms": "Terms & Conditions",
  "/login": "Login",
  
  // Admin pages
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/brands": "Brands",
  "/admin/orders": "Orders",
  "/admin/analytics": "Analytics",
  "/admin/customers": "Customers",
  "/admin/shipping": "Shipping",
  "/admin/messages": "Messages",
  "/admin/reports": "Reports",
  "/admin/coupons": "Coupons",
  "/admin/abandoned-carts": "Abandoned Carts",
  "/admin/role-management": "Role Management",
  "/admin/content": "Content Manager",
  "/admin/appearance": "Appearance",
  "/admin/reviews": "Reviews",
  "/admin/product-questions": "Product Q&A",
  "/manager/product-questions": "Product Q&A",
  "/support/product-questions": "Product Q&A",
  "/admin/trash": "Trash",
  "/admin/account-deletion-requests": "Deletion Requests",
  "/admin/support-settings": "Support Settings",

  // Admin — System Settings sub-routes
  "/admin/settings": "Settings",
  "/admin/system-settings": "System Settings",
  "/admin/system-settings/store": "Store Settings",
  "/admin/system-settings/payments": "Payments",
  "/admin/system-settings/emails": "Emails",
  "/admin/system-settings/notifications": "Notifications",
  "/admin/system-settings/security": "Security",
  "/admin/system-settings/audit": "Audit Log",
  "/admin/system-settings/backup": "Backup",
  "/admin/system-settings/integrations": "Integrations",
  "/admin/system-settings/edge-functions": "Edge Functions",
  "/admin/system-settings/documents": "Document Templates",

  // Admin — Account Settings sub-routes
  "/admin/account-settings": "Account Settings",
  "/admin/account-settings/personal-info": "Personal Info",
  "/admin/account-settings/password": "Change Password",
  "/admin/account-settings/security": "Security",
  "/admin/account-settings/login-activity": "Login Activity",

  // Manager pages
  "/manager/dashboard": "Dashboard",
  "/manager/orders": "Orders",
  "/manager/products": "Products",
  "/manager/customers": "Customers",
  "/manager/messages": "Messages",
  "/manager/shipping": "Shipping",
  "/manager/coupons": "Coupons",
  "/manager/reports": "Reports",
  "/manager/analytics": "Analytics",
  "/manager/trash": "Trash",
  "/manager/settings": "Settings",
  "/manager/account-settings": "Account Settings",
  "/manager/account-settings/personal-info": "Personal Info",
  "/manager/account-settings/password": "Change Password",
  "/manager/account-settings/security": "Security",
  "/manager/account-settings/login-activity": "Login Activity",

  // Support pages
  "/support/dashboard": "Dashboard",
  "/support/orders": "Orders",
  "/support/customers": "Customers",
  "/support/messages": "Messages",
  "/support/settings": "Settings",
  "/support/account-settings": "Account Settings",
  "/support/account-settings/personal-info": "Personal Info",
  "/support/account-settings/password": "Change Password",
  "/support/account-settings/security": "Security",
  "/support/account-settings/login-activity": "Login Activity",
};

export function AutoPageTitle() {
  const location = useLocation();
  const { setPageTitle } = useSiteTitle();

  useEffect(() => {
    const path = location.pathname;
    let title = pageTitles[path];

    // Handle dynamic routes
    if (!title) {
      if (path.startsWith("/product/")) {
        title = "Product Details";
      } else if (path.startsWith("/track/") || path.startsWith("/order-tracking/")) {
        title = "Order Tracking";
      } else if (path.startsWith("/myaccount/orders/") && path.endsWith("/invoice")) {
        title = "Invoice";
      } else if (path.startsWith("/myaccount/orders/")) {
        title = "Order Details";
      }
    }

    // Fallback: longest matching prefix from the map (for unmapped sub-routes)
    if (!title) {
      const match = Object.keys(pageTitles)
        .filter((p) => p !== "/" && path.startsWith(p + "/"))
        .sort((a, b) => b.length - a.length)[0];
      if (match) title = pageTitles[match];
    }

    if (title) {
      setPageTitle(title);
    } else {
      setPageTitle();
    }
  }, [location.pathname, setPageTitle]);

  return null;
}
