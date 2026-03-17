import { IPSecuritySettings } from "@/components/settings/IPSecuritySettings";
import { AccountLockouts } from "@/components/admin/AccountLockouts";
import { BlockedLoginAttempts } from "@/components/admin/BlockedLoginAttempts";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">IP blocking, rate limiting, account lockouts and login monitoring</p>
      </div>
      <IPSecuritySettings />
      <AccountLockouts />
      <BlockedLoginAttempts />
    </div>
  );
}
