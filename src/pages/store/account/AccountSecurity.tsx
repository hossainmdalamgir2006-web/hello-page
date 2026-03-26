import { SecurityTab } from "@/components/account/SecurityTab";
import { SEOHead } from "@/components/SEOHead";

export default function AccountSecurity() {
  return (
    <>
      <SEOHead title="Security" noIndex />
      <SecurityTab />
    </>
  );
}