import { WishlistTab } from "@/components/account/WishlistTab";

export default function AccountWishlist() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">My Wishlist</h1>
        <p className="text-sm text-muted-foreground">Products you've saved for later</p>
      </div>
      <WishlistTab />
    </div>
  );
}
