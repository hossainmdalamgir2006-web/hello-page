import { RecentlyViewedTab } from "@/components/account/RecentlyViewedTab";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";

export default function AccountRecentlyViewed() {
  return (
    <>
      <SEOHead title="Recently Viewed" noIndex />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
        <RecentlyViewedTab />
      </motion.div>
    </>
  );
}
