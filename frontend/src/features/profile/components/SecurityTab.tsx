import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/features/auth/store';
import {useActivateMfa} from "@/features/auth/hooks/useActivateMfa.ts";
import {useChangePassword} from "@/features/profile/hooks/useChangePassword.ts";

export default function SecurityTab() {
  const { t } = useTranslation('app');
  const { user } = useAuthStore();

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changePassword = useChangePassword();
  const activateMfa = useActivateMfa();


  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    changePassword.mutate({ password, newPassword });
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Change password */}
      <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
        <h3 className="font-serif text-base font-bold text-secondary">
          {t('profile.securityTab.changePassword')}
        </h3>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">
            {t('profile.securityTab.currentPassword')}
          </Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-border"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('profile.securityTab.newPassword')}</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border-border"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">
            {t('profile.securityTab.confirmPassword')}
          </Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border-border"
          />
        </div>
        <Button type="submit" className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
          {t('profile.securityTab.changePasswordBtn')}
        </Button>
      </form>

      <Separator />

      {/* MFA */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-serif text-base font-bold text-secondary">
            {t('profile.securityTab.mfa')}
          </span>
          <span className="text-sm text-muted-foreground">
            {t('profile.securityTab.mfaDesc')}
          </span>
        </div>
        {!user?.isTotpEnabled
        ? (<Button
                onClick={() => activateMfa.mutate()}
                disabled={activateMfa.isPending}
                className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {activateMfa.isPending
                  ? t('profile.securityTab.mfaActivating')
                  : t('profile.securityTab.mfaActivate')}
            </Button>)
        : (<Button
                onClick={() => activateMfa.mutate()}
                disabled
                className="w-fit bg-secondary text-primary-foreground"
            >
              {
                   t('profile.securityTab.mfaEnabled')}
            </Button>)}

      </div>
    </div>
  );
}