import { SecurityTab } from "@/components/account/SecurityTab";

export default function AccountSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Security</h1>
        <p className="text-sm text-muted-foreground">Manage your security settings and account protection</p>
      </div>
      <SecurityTab />
    </div>
  );
}
