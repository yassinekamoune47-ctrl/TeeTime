import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/features/auth/store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useChangePP } from '@/features/profile/hooks/useChangePP.ts';
import type { EUGender } from '@/api/types.ts';
import type { User } from '@/types/user.types';
import { useUpdateData } from '@/features/profile/hooks/useUpdateData.ts';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type ProfileErrors = {
  firstName?: string;
  lastName?: string;
  gender?: string;
  countryCallingCode?: string;
  phoneNumber?: string;
  birthDate?: string;
};

function ProfileForm({ user }: { user: User }) {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [countryCallingCode, setCountryCallingCode] = useState(user.countryCallingCode ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '');
  const [gender, setGender] = useState<EUGender | ''>(user.gender ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [birthDate, setBirthDate] = useState(user.birthDate ?? '');
  const [errors, setErrors] = useState<ProfileErrors>({});

  // Avatar Modal & Upload States
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const changeProfilePic = useChangePP();
  const changeData = useUpdateData();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setSelectedFile(file);
      setSelectedFilePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdatePP = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    changeProfilePic.mutate(selectedFile, {
      onSuccess: () => {
        setIsUploading(false);
        setAvatarModalOpen(false);
        setSelectedFile(null);
        setSelectedFilePreview(null);
      },
      onError: () => {
        setIsUploading(false);
      },
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: ProfileErrors = {};
    if (!firstName.trim()) nextErrors.firstName = t('profile.profileTab.errors.firstNameRequired');
    if (!lastName.trim()) nextErrors.lastName = t('profile.profileTab.errors.lastNameRequired');
    // Never assign a gender on the player's behalf: it has to be chosen explicitly.
    if (!gender) nextErrors.gender = t('profile.profileTab.errors.genderRequired');
    if (!countryCallingCode.trim()) nextErrors.countryCallingCode = t('profile.profileTab.errors.callingCodeRequired');
    if (!phoneNumber.trim()) nextErrors.phoneNumber = t('profile.profileTab.errors.phoneRequired');
    if (birthDate && Number.isNaN(new Date(birthDate).getTime())) {
      nextErrors.birthDate = t('profile.profileTab.errors.birthDateInvalid');
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    changeData.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      bio,
      phoneNumber: phoneNumber.trim(),
      countryCallingCode: countryCallingCode.trim(),
      birthDate: birthDate || null,
    });
  };

  const uploadModalContent = (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Avatar Preview */}
      <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-primary/20 bg-muted shadow-inner">
        {selectedFilePreview || user.avatarURL ? (
          <img
            src={selectedFilePreview || user.avatarURL || ''}
            alt="Avatar Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-primary">
            {(firstName?.charAt(0) || user.firstName?.charAt(0) || 'U').toUpperCase()}
            {(lastName?.charAt(0) || user.lastName?.charAt(0) || '').toUpperCase()}
          </span>
        )}
      </div>

      {/* File Input Card */}
      <div className="w-full space-y-2">
        <Label htmlFor="avatar-file" className="text-sm font-medium text-secondary">
          {t('profile.chooseImageLabel', 'Upload New Image')}
        </Label>
        <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 transition-colors hover:border-primary hover:bg-primary/5">
          <input
            id="avatar-file"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-secondary">
              {selectedFile ? selectedFile.name : t('profile.dropImage', 'Click or drag image file here')}
            </span>
            <span className="text-xs text-muted-foreground">Supports PNG, JPG, WEBP (Max 5MB)</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex w-full gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-border"
          onClick={() => {
            setSelectedFile(null);
            setSelectedFilePreview(null);
            setAvatarModalOpen(false);
          }}
        >
          {t('myClub.editForm.cancel', 'Cancel')}
        </Button>
        <Button
          type="button"
          disabled={!selectedFile || isUploading}
          onClick={handleUpdatePP}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isUploading ? t('common.uploading', 'Saving...') : t('myClub.editForm.save', 'Save')}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center sm:items-start gap-3">
          <div
            onClick={() => setAvatarModalOpen(true)}
            className="group relative flex h-28 w-28 md:h-32 md:w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-background bg-surface shadow-md transition-all hover:ring-4 hover:ring-primary/30"
          >
            {user.avatarURL ? (
              <img
                src={user.avatarURL}
                alt={firstName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Avatar className="h-full w-full">
                <AvatarFallback className="h-full w-full bg-primary/15 text-2xl font-bold text-primary">
                  {(firstName?.charAt(0) || user.firstName?.charAt(0) || 'U').toUpperCase()}
                  {(lastName?.charAt(0) || user.lastName?.charAt(0) || '').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Camera className="h-6 w-6 mb-1 text-white" />
              <span className="text-[11px] font-medium text-center px-2 leading-tight">
                {t('profile.updateAvatar', 'Update profile picture')}
              </span>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-secondary">{t('profile.profileTab.firstName')} *</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border-border"
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-secondary">{t('profile.profileTab.lastName')} *</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border-border"
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-secondary">{t('profile.profileTab.phone')} *</Label>
            <div className="flex items-start gap-2">
              <Input
                value={countryCallingCode}
                onChange={(e) => setCountryCallingCode(e.target.value)}
                maxLength={8}
                placeholder={t('profile.profileTab.countryCallingCode')}
                aria-label={t('profile.profileTab.countryCallingCode')}
                className="w-24 border-border"
                aria-invalid={!!errors.countryCallingCode}
              />
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 border-border"
                aria-invalid={!!errors.phoneNumber}
              />
            </div>
            {(errors.countryCallingCode || errors.phoneNumber) && (
              <p className="text-xs text-destructive">{errors.countryCallingCode ?? errors.phoneNumber}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-secondary">{t('profile.profileTab.gender')} *</Label>
            <Select value={gender} onValueChange={(v) => setGender((v ?? '') as EUGender | '')}>
              <SelectTrigger size="sm" className="w-full border-border" aria-invalid={!!errors.gender}>
                <SelectValue>
                  {gender ? t(`users.gender.${gender.toLocaleLowerCase()}`) : t('profile.profileTab.genderPlaceholder')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('profile.profileTab.genderPlaceholder')}</SelectItem>
                <SelectItem value="MALE">{t('users.gender.male')}</SelectItem>
                <SelectItem value="FEMALE">{t('users.gender.female')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-secondary">{t('profile.profileTab.birthDate')}</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="border-border"
              aria-invalid={!!errors.birthDate}
            />
            {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate}</p>}
          </div>
        </div>

        {/* Official tournament credentials: declared at sign-up, never editable here. */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/10 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{t('profile.profileTab.license')}</span>
              <span className="text-sm text-secondary">{user.frmglLicenseNumber || t('profile.profileTab.notProvided')}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{t('profile.profileTab.handicap')}</span>
              <span className="text-sm text-secondary">{user.currentHandicap || t('profile.profileTab.notProvided')}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t('profile.profileTab.frozenNotice')}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('profile.profileTab.bio')}</Label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="..."
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={changeData.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t('profile.profileTab.save')}
          </Button>
        </div>
      </form>

      {/* Responsive Avatar Upload Sub-Page (Modal / Drawer) */}
      {isDesktop ? (
        <Dialog open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
          <DialogContent className="sm:max-w-md bg-surface">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                {t('profile.updateAvatarTitle', 'Update Profile Picture')}
              </DialogTitle>
            </DialogHeader>
            {uploadModalContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
          <DrawerContent className="max-h-[85vh] bg-surface">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                {t('profile.updateAvatarTitle', 'Update Profile Picture')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">{uploadModalContent}</div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

export default function ProfileTab() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  // Remount the form whenever the stored profile changes (e.g. after a successful save)
  const formKey = [
    user.id,
    user.firstName,
    user.lastName,
    user.phoneNumber,
    user.countryCallingCode,
    user.gender,
    user.bio,
    user.birthDate,
  ].join('|');

  return <ProfileForm key={formKey} user={user} />;
}
