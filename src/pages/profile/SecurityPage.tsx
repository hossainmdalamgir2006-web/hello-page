import { TwoFactorSetup } from '@/components/profile/TwoFactorSetup';
import { RecoveryCodes } from '@/components/profile/RecoveryCodes';
import { TrustedDevices } from '@/components/profile/TrustedDevices';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Security</h1>
        <p className="text-sm text-muted-foreground">Manage two-factor authentication, recovery codes, and trusted devices</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <TwoFactorSetup />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RecoveryCodes />
          <TrustedDevices />
        </div>
      </div>
    </div>
  );
}
