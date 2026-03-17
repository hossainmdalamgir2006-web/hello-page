import { CustomerSupportTickets } from "@/components/store/CustomerSupportTickets";

export default function AccountSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground">Get help from our support team</p>
      </div>
      <CustomerSupportTickets />
    </div>
  );
}
