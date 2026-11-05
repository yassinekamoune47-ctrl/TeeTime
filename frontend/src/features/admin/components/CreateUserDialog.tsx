import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {useCreateManager} from "@/features/admin/hooks/useCreateManager.ts";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { t } = useTranslation('app');
  const createManager = useCreateManager();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
      setPrevOpen(open);
      if (open) {
          setFirstName('');
          setLastName('');
          setGender('');
          setEmail('');
          setPhoneNumber('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createManager.mutate({ firstName, lastName, gender, email, phoneNumber, username, password },
        {
          onSuccess: () => {
            onOpenChange(false); // close dialog
          },
        }
        );
  };

  const formFields = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('user.createForm.firstName')}</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t('user.createForm.firstNamePlaceholder')}
          className="border-border"
          required
        />
          <Label className="text-sm text-secondary">{t('user.createForm.lastName')}</Label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t('user.createForm.lastNamePlaceholder')}
            className="border-border"
            required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('user.createForm.role')}</Label>
        <Select value={gender} onValueChange={(v) => setGender(v as 'MALE' | 'FEMALE')}>
          <SelectTrigger className="w-full border-border">
            {/* Base UI's SelectValue renders the raw value (e.g. "MALE"),
                so we render the translated label explicitly */}
            <SelectValue>
              {gender === 'MALE'
                ? t('user.gender.male')
                : gender === 'FEMALE'
                  ? t('user.gender.female')
                  : t('user.createForm.rolePlaceholder')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">{t('user.gender.male')}</SelectItem>
            <SelectItem value="FEMALE">{t('user.gender.female')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('user.createForm.email')}</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('user.createForm.emailPlaceholder')}
          className="border-border"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('user.createForm.phone')}</Label>
        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder={t('user.createForm.phonePlaceholder')}
          className="border-border"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('user.createForm.username')}</Label>
        <Input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('user.createForm.usernamePlaceholder')}
            className="border-border"
            required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('user.createForm.password')}</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('user.createForm.passwordPlaceholder')}
          className="border-border"
          required
        />
      </div>
        <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-secondary">{t('user.createForm.confirmPassword')}</Label>
            <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('user.createForm.confirmPasswordPlaceholder')}
                className="border-border"
                required
            />
        </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1 border-border" onClick={() => onOpenChange(false)}>
          {t('user.createForm.cancel')}
        </Button>
        <Button type="submit" disabled={createManager.isPending} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {createManager.isPending ? 'Saving...' : t('user.createForm.save')}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-surface max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-secondary">
              {t('user.createForm.title')}
            </DialogTitle>
          </DialogHeader>
          {formFields}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-surface">
        <DrawerHeader>
          <DrawerTitle className="font-serif text-lg font-bold text-secondary">
            {t('user.createForm.title')}
          </DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6 max-h-[75vh]">{formFields}</div>
      </DrawerContent>
    </Drawer>
  );
}