import { CustomerSupportTickets } from "@/components/store/CustomerSupportTickets";
import { SEOHead } from "@/components/SEOHead";

export default function AccountSupport() {
  return (
    <>
      <SEOHead title="Support" noIndex />
      <CustomerSupportTickets />
    </>
  );
}