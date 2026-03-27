import { TwoFactorSetup } from '@/components/profile/TwoFactorSetup';
import { RecoveryCodes } from '@/components/profile/RecoveryCodes';
import { TrustedDevices } from '@/components/profile/TrustedDevices';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <TwoFactorSetup />
      <RecoveryCodes />
      <TrustedDevices />
    </div>
  );
}
