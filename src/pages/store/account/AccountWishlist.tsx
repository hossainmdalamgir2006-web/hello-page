import { WishlistTab } from "@/components/account/WishlistTab";
import { SEOHead } from "@/components/SEOHead";

export default function AccountWishlist() {
  return (
    <>
      <SEOHead title="My Wishlist" noIndex />
      <WishlistTab />
    </>
  );
}