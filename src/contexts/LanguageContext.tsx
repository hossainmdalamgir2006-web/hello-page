import { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Explicit translation map for common UI strings.
// Falls back to a humanized version of the key if not found.
const translations: Record<string, string> = {
  // Order Confirmation
  'store.thankYouOrder': 'Thank You for Your Order!',
  'store.orderConfirmed': 'Order Confirmed!',
  'store.orderPlacedSuccess': 'Your order has been placed successfully',
  'store.orderNumber': 'Order Number',
  'store.estimatedDelivery': 'Estimated Delivery',
  'store.estimatedDeliveryLabel': 'Estimated Delivery',
  'store.whatsNext': "What's Next?",
  'store.confirmationEmail': "We've sent a confirmation email with your order details",
  'store.notifyShipment': "We'll notify you when your order ships",
  'store.trackInDashboard': 'Track your order anytime from your account dashboard',
  'store.trackOrder': 'Track Order',
  'store.continueShopping': 'Continue Shopping',
  'store.viewAllOrders': 'View all your orders in your',
  'store.accountDashboard': 'account dashboard',
  'store.orderItems': 'Order Items',
  'store.subtotal': 'Subtotal',
  'store.discount': 'Discount',
  'store.shipping': 'Shipping',
  'store.free': 'Free',
  'store.codCharge': 'COD Charge',
  'store.total': 'Total',
  'store.paymentMethod': 'Payment Method',
  'store.paymentOnDelivery': 'Pay when your order arrives',
  'store.paymentVerificationPending': 'Payment verification pending',
  'store.processing': 'Processing your payment',
  'store.notifyPaymentVerified': "We'll notify you once your payment is verified",
  'store.sentTo': 'Payment sent to',
  'store.account': 'account',
  // Confirmation extras
  'store.actionRequired': 'Action Required',
  'store.sendPaymentTo': 'Send payment to',
  'store.copyNumber': 'Copy Number',
  'store.howToPay': 'How to Pay',
  'store.verifiedWithin': 'Your order will be verified within 30 minutes',
  'store.secureOrder': 'Secure Order',
  'store.emailSent': 'Email Sent',
  'store.support247': '24/7 Support',
  'store.easyReturns': 'Easy Returns',
  'store.needHelp': 'Need Help?',
  'store.contactSupport': 'Our team is here to assist you',
  'store.callUs': 'Call Us',
  'store.emailUs': 'Email Us',
  'store.whatsapp': 'WhatsApp',
  'store.faq': 'FAQ',
  'store.orderTimeline': 'Order Progress',
  'store.timelinePlaced': 'Order Placed',
  'store.timelineVerified': 'Payment Verified',
  'store.timelinePacked': 'Order Packed',
  'store.timelineShipped': 'Out for Delivery',
  'store.timelineDelivered': 'Delivered',
  'store.now': 'Just now',
  'store.within30min': 'Within 30 minutes',
  'store.within24hrs': 'Within 24 hours',
  'store.downloadReceipt': 'Download Receipt',
  'store.createAccount': 'Create an Account',
  'store.createAccountDesc': 'Sign up to track this order and earn rewards on future purchases',
  'store.signUpNow': 'Sign Up Now',
  'store.copied': 'Copied!',
  'store.copyOrderId': 'Copy order ID',
};

// Convert translation key to readable text fallback
function keyToText(key: string): string {
  if (translations[key]) return translations[key];
  const segment = key.includes('.') ? key.split('.').pop()! : key;
  return segment
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageContext.Provider value={{ language: 'en', setLanguage: () => {}, t: keyToText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
