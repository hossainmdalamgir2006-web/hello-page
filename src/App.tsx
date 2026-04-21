import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Providers } from "@/components/Providers";
import { ProtectedRoute, AdminRoute, ManagerRoute, SupportRoute } from "@/components/ProtectedRoute";
import { AutoPageTitle } from "@/components/AutoPageTitle";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import { AdminLayout } from "@/layouts/AdminLayout";
import { StoreLayout } from "@/layouts/StoreLayout";

// Minimal fallback — TopProgressBar handles visual feedback
const PageLoader = () => <div className="min-h-screen" />;

// Helper to wrap a lazy element in its own Suspense boundary so that
// lazy-loading a page does NOT unmount the surrounding layout (which causes
// a `removeChild` race in React 18 + Radix portals during commit).
const L = (El: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <El />
  </Suspense>
);

// Store Pages (lazy)
const StoreHome = lazy(() => import("./pages/store/StoreHome"));
const StoreProducts = lazy(() => import("./pages/store/StoreProducts"));
const ProductDetail = lazy(() => import("./pages/store/ProductDetail"));
const Cart = lazy(() => import("./pages/store/Cart"));
const TrackOrder = lazy(() => import("./pages/store/TrackOrder"));
const Checkout = lazy(() => import("./pages/store/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/store/OrderConfirmation"));
const PaymentProcessing = lazy(() => import("./pages/store/PaymentProcessing"));
const PaymentCallback = lazy(() => import("./pages/store/PaymentCallback"));
const OrderTracking = lazy(() => import("./pages/store/OrderTracking"));
const Wishlist = lazy(() => import("./pages/store/Wishlist"));
const Contact = lazy(() => import("./pages/store/Contact"));
const FAQ = lazy(() => import("./pages/store/FAQ"));
const ShippingInfo = lazy(() => import("./pages/store/ShippingInfo"));
const Returns = lazy(() => import("./pages/store/Returns"));
const SizeGuide = lazy(() => import("./pages/store/SizeGuide"));
const Privacy = lazy(() => import("./pages/store/Privacy"));
const Terms = lazy(() => import("./pages/store/Terms"));

// Customer Account (lazy)
const AccountDashboard = lazy(() => import("./pages/store/account/AccountDashboard"));
const AccountOrders = lazy(() => import("./pages/store/account/AccountOrders"));
const AccountWishlist = lazy(() => import("./pages/store/account/AccountWishlist"));
const AccountShopping = lazy(() => import("./pages/store/account/AccountShopping"));
const AccountRecentlyViewed = lazy(() => import("./pages/store/account/AccountRecentlyViewed"));
const AccountAddresses = lazy(() => import("./pages/store/account/AccountAddresses"));
const AccountSecurity = lazy(() => import("./pages/store/account/AccountSecurity"));
const AccountSupport = lazy(() => import("./pages/store/account/AccountSupport"));
const AccountSettings = lazy(() => import("./pages/store/account/AccountSettings"));
const AccountOrderTracking = lazy(() => import("./pages/store/account/AccountOrderTracking"));
const AccountInvoice = lazy(() => import("./pages/store/account/AccountInvoice"));
const AccountReturns = lazy(() => import("./pages/store/account/AccountReturns"));
const AccountReviews = lazy(() => import("./pages/store/account/AccountReviews"));
const AccountNotifications = lazy(() => import("./pages/store/account/AccountNotifications"));
const AccountNotificationPreferences = lazy(() => import("./pages/store/account/AccountNotificationPreferences"));
const AccountPasswordPage = lazy(() => import("./pages/store/account/AccountPasswordPage"));
// const AccountPaymentMethods = lazy(() => import("./pages/store/account/AccountPaymentMethods"));

const AccountChat = lazy(() => import("./pages/store/account/AccountChat"));
import { CustomerAccountLayout } from "./layouts/CustomerAccountLayout";

// Admin Pages (lazy)
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const Categories = lazy(() => import("./pages/Categories"));
const Orders = lazy(() => import("./pages/Orders"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Customers = lazy(() => import("./pages/Customers"));

const SettingsStore = lazy(() => import("./pages/system-settings/StorePage"));
const SettingsPayments = lazy(() => import("./pages/system-settings/PaymentsPage"));
const SettingsEmails = lazy(() => import("./pages/system-settings/EmailsPage"));
const SettingsNotifications = lazy(() => import("./pages/system-settings/NotificationsPage"));
const SettingsSecurity = lazy(() => import("./pages/system-settings/SecurityPage"));
const SettingsAudit = lazy(() => import("./pages/system-settings/AuditPage"));
const SettingsBackup = lazy(() => import("./pages/system-settings/BackupPage"));
const SettingsIntegrations = lazy(() => import("./pages/system-settings/IntegrationsPage"));

const Shipping = lazy(() => import("./pages/Shipping"));
const Messages = lazy(() => import("./pages/Messages"));
const Reports = lazy(() => import("./pages/Reports"));
const Coupons = lazy(() => import("./pages/Coupons"));
const ProfileLayout = lazy(() => import("./layouts/ProfileLayout"));
const ProfilePersonal = lazy(() => import("./pages/profile/PersonalInfoPage"));
const ProfilePassword = lazy(() => import("./pages/profile/PasswordPage"));
const ProfileSecurity = lazy(() => import("./pages/profile/SecurityPage"));
const ProfileSessions = lazy(() => import("./pages/profile/SessionsPage"));
const Brands = lazy(() => import("./pages/Brands"));
const Login = lazy(() => import("./pages/Login"));

const AbandonedCarts = lazy(() => import("./pages/AbandonedCarts"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const RoleDashboard = lazy(() => import("./pages/RoleDashboard"));
const ManagerSettings = lazy(() => import("./pages/ManagerSettings"));
const GlobalTrash = lazy(() => import("./pages/GlobalTrash"));
const ContentManager = lazy(() => import("./pages/admin/ContentManager"));
const AppearanceManager = lazy(() => import("./pages/admin/AppearanceManager"));
const ReviewsManager = lazy(() => import("./pages/admin/ReviewsManager"));
const AccountDeletionRequests = lazy(() => import("./pages/admin/AccountDeletionRequests"));
const EdgeFunctionHealth = lazy(() => import("./pages/admin/EdgeFunctionHealth"));
const SupportSettings = lazy(() => import("./pages/SupportSettings"));
const DocumentTemplatesPage = lazy(() => import("./pages/system-settings/DocumentTemplatesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <RootErrorBoundary>
    <Providers>
      <BrowserRouter>
        <TopProgressBar />
        <AutoPageTitle />
        <Routes>
          {/* Store Frontend Routes */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={L(StoreHome)} />
            <Route path="/products" element={L(StoreProducts)} />
            <Route path="/product/:slug" element={L(ProductDetail)} />
            <Route path="/cart" element={L(Cart)} />
            <Route path="/track-order" element={L(TrackOrder)} />
            <Route path="/checkout" element={L(Checkout)} />
            <Route path="/order-confirmation" element={L(OrderConfirmation)} />
            <Route path="/payment-processing" element={L(PaymentProcessing)} />
            <Route path="/payment/callback" element={L(PaymentCallback)} />
            <Route path="/order-tracking/:orderId" element={L(OrderTracking)} />
            <Route path="/wishlist" element={L(Wishlist)} />
            <Route path="/contact" element={L(Contact)} />
            <Route path="/faq" element={L(FAQ)} />
            <Route path="/shipping-info" element={L(ShippingInfo)} />
            <Route path="/returns" element={L(Returns)} />
            <Route path="/size-guide" element={L(SizeGuide)} />
            <Route path="/privacy" element={L(Privacy)} />
            <Route path="/terms" element={L(Terms)} />
            <Route path="/login" element={L(Login)} />
          </Route>

          {/* Customer Account Routes */}
          <Route path="/myaccount" element={<ProtectedRoute><CustomerAccountLayout /></ProtectedRoute>}>
            <Route index element={L(AccountDashboard)} />
            <Route path="orders" element={L(AccountOrders)} />
            <Route path="orders/:orderId" element={L(AccountOrderTracking)} />
            <Route path="orders/:orderId/invoice" element={L(AccountInvoice)} />
            <Route path="wishlist" element={L(AccountWishlist)} />
            <Route path="shopping" element={L(AccountShopping)} />
            <Route path="recently-viewed" element={L(AccountRecentlyViewed)} />
            <Route path="addresses" element={L(AccountAddresses)} />
            <Route path="security" element={L(AccountSecurity)} />
            <Route path="support" element={L(AccountSupport)} />
            <Route path="settings" element={<Navigate to="/myaccount/personal-info" replace />} />
            <Route path="personal-info" element={L(AccountSettings)} />
            <Route path="password" element={L(AccountPasswordPage)} />
            <Route path="settings/personal-info" element={<Navigate to="/myaccount/personal-info" replace />} />
            <Route path="settings/password" element={<Navigate to="/myaccount/password" replace />} />
            <Route path="returns" element={L(AccountReturns)} />
            <Route path="reviews" element={L(AccountReviews)} />
            <Route path="notifications" element={L(AccountNotifications)} />
            <Route path="notification-preferences" element={L(AccountNotificationPreferences)} />
            <Route path="chat" element={L(AccountChat)} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin/dashboard" element={L(Index)} />
            <Route path="/admin/products" element={L(Products)} />
            <Route path="/admin/categories" element={L(Categories)} />
            <Route path="/admin/brands" element={L(Brands)} />
            <Route path="/admin/orders" element={L(Orders)} />
            <Route path="/admin/analytics" element={L(Analytics)} />
            <Route path="/admin/customers" element={L(Customers)} />
            <Route path="/admin/settings" element={<Navigate to="/admin/system-settings/store" replace />} />
            <Route path="/admin/system-settings" element={<Navigate to="/admin/system-settings/store" replace />} />
            <Route path="/admin/system-settings/store" element={L(SettingsStore)} />
            <Route path="/admin/system-settings/payments" element={L(SettingsPayments)} />
            <Route path="/admin/system-settings/emails" element={L(SettingsEmails)} />
            <Route path="/admin/system-settings/notifications" element={L(SettingsNotifications)} />
            <Route path="/admin/system-settings/security" element={L(SettingsSecurity)} />
            <Route path="/admin/system-settings/audit" element={L(SettingsAudit)} />
            <Route path="/admin/system-settings/backup" element={L(SettingsBackup)} />
            <Route path="/admin/system-settings/integrations" element={L(SettingsIntegrations)} />
            <Route path="/admin/shipping" element={L(Shipping)} />
            <Route path="/admin/messages" element={L(Messages)} />
            <Route path="/admin/reports" element={L(Reports)} />
            <Route path="/admin/coupons" element={L(Coupons)} />
            <Route path="/admin/account-settings" element={L(ProfileLayout)}>
              <Route index element={L(ProfilePersonal)} />
              <Route path="personal-info" element={L(ProfilePersonal)} />
              <Route path="password" element={L(ProfilePassword)} />
              <Route path="security" element={L(ProfileSecurity)} />
              <Route path="login-activity" element={L(ProfileSessions)} />
            </Route>
            <Route path="/admin/abandoned-carts" element={L(AbandonedCarts)} />
            <Route path="/admin/role-management" element={L(RoleManagement)} />
            <Route path="/admin/content" element={L(ContentManager)} />
            <Route path="/admin/homepage" element={<Navigate to="/admin/content" replace />} />
            <Route path="/admin/page-content" element={<Navigate to="/admin/content" replace />} />
            <Route path="/admin/appearance" element={L(AppearanceManager)} />
            <Route path="/admin/reviews" element={L(ReviewsManager)} />
            <Route path="/admin/trash" element={L(GlobalTrash)} />
            <Route path="/admin/account-deletion-requests" element={L(AccountDeletionRequests)} />
            <Route path="/admin/system-settings/edge-functions" element={L(EdgeFunctionHealth)} />
            <Route path="/admin/system-settings/documents" element={L(DocumentTemplatesPage)} />
            <Route path="/admin/support-settings" element={L(SupportSettings)} />
          </Route>

          {/* Manager Routes */}
          <Route element={<ManagerRoute><AdminLayout /></ManagerRoute>}>
            <Route path="/manager/dashboard" element={L(RoleDashboard)} />
            <Route path="/manager/orders" element={L(Orders)} />
            <Route path="/manager/products" element={L(Products)} />
            <Route path="/manager/customers" element={L(Customers)} />
            <Route path="/manager/analytics" element={L(Analytics)} />
            <Route path="/manager/shipping" element={L(Shipping)} />
            <Route path="/manager/coupons" element={L(Coupons)} />
            <Route path="/manager/reports" element={L(Reports)} />
            <Route path="/manager/trash" element={L(GlobalTrash)} />
            <Route path="/manager/settings" element={L(ManagerSettings)} />
            <Route path="/manager/messages" element={L(Messages)} />
            <Route path="/manager/account-settings" element={L(ProfileLayout)}>
              <Route index element={L(ProfilePersonal)} />
              <Route path="personal-info" element={L(ProfilePersonal)} />
              <Route path="password" element={L(ProfilePassword)} />
              <Route path="security" element={L(ProfileSecurity)} />
              <Route path="login-activity" element={L(ProfileSessions)} />
            </Route>
          </Route>

          {/* Support Routes */}
          <Route element={<SupportRoute><AdminLayout /></SupportRoute>}>
            <Route path="/support/dashboard" element={L(RoleDashboard)} />
            <Route path="/support/orders" element={L(Orders)} />
            <Route path="/support/customers" element={L(Customers)} />
            <Route path="/support/messages" element={L(Messages)} />
            <Route path="/support/settings" element={L(SupportSettings)} />
            <Route path="/support/account-settings" element={L(ProfileLayout)}>
              <Route index element={L(ProfilePersonal)} />
              <Route path="personal-info" element={L(ProfilePersonal)} />
              <Route path="password" element={L(ProfilePassword)} />
              <Route path="security" element={L(ProfileSecurity)} />
              <Route path="login-activity" element={L(ProfileSessions)} />
            </Route>
          </Route>

          <Route element={<StoreLayout />}>
            <Route path="*" element={L(NotFound)} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  </RootErrorBoundary>
);

export default App;
