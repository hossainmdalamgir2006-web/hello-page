import { CustomerSupportTickets } from "@/components/store/CustomerSupportTickets";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";

export default function AccountSupport() {
  return (
    <>
      <SEOHead title="Support" noIndex />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
        <CustomerSupportTickets />
      </motion.div>
    </>
  );
}
