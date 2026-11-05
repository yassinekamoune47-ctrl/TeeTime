import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Award } from 'lucide-react';
import { BiMaleFemale } from "react-icons/bi";
import { FaPhoneAlt } from "react-icons/fa";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignup } from "@/features/auth/hooks/useSignup.ts";
import type { SignUpDTO } from "@/features/auth/types.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type RegisterErrors = Partial<Record<keyof SignUpDTO, string>>;

export default function RegisterForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [user, setUser] = useState<SignUpDTO>({
    firstName: '',
    lastName: '',
    email: '',
    gender: null,
    countryCallingCode: '',
    phoneNumber: '',
    frmglLicenseNumber: '',
    currentHandicap: '',
    password: '',
  });
  const [errors, setErrors] = useState<RegisterErrors>({});

  const signupMutation = useSignup();

  const setValue = <K extends keyof SignUpDTO>(field: K, value: SignUpDTO[K]) => {
    setUser((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  /** APEX STEP 3 — every listed field is mandatory, and either a FRMG licence or a handicap must be declared. */
  const validate = (): RegisterErrors => {
    const next: RegisterErrors = {};

    if (!user.firstName.trim()) next.firstName = t('register.errors.firstNameRequired');
    if (!user.lastName.trim()) next.lastName = t('register.errors.lastNameRequired');
    if (!user.email.trim()) next.email = t('register.errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())) next.email = t('register.errors.emailInvalid');
    if (!user.gender) next.gender = t('register.errors.genderRequired');
    if (!user.countryCallingCode.trim()) next.countryCallingCode = t('register.errors.callingCodeRequired');
    if (!user.phoneNumber.trim()) next.phoneNumber = t('register.errors.phoneRequired');

    const hasLicense = !!user.frmglLicenseNumber.trim();
    const hasHandicap = user.currentHandicap.trim() !== '';

    if (!hasLicense && !hasHandicap) {
      next.frmglLicenseNumber = t('register.errors.licenseOrHandicapRequired');
    }

    if (hasHandicap) {
      const handicap = Number(user.currentHandicap);
      if (Number.isNaN(handicap)) next.currentHandicap = t('register.errors.handicapInvalid');
      else if (handicap < 0 || handicap > 18) next.currentHandicap = t('register.errors.handicapOutOfRange');
    }

    if (!user.password) next.password = t('register.errors.passwordRequired');
    else if (user.password.length < 6) next.password = t('register.errors.passwordTooShort');

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    signupMutation.mutate({
        firstName: user.firstName.trim(),
        lastName: user.lastName.trim(),
        email: user.email.trim(),
        gender: user.gender,
        countryCallingCode: user.countryCallingCode.trim(),
        phoneNumber: user.phoneNumber.trim(),
        frmglLicenseNumber: user.frmglLicenseNumber.trim(),
        currentHandicap: user.currentHandicap.trim(),
        password: user.password,
    },{
      onSuccess: (res) => {
        if (res.data.success) {
          toast.success(t('notification.signupSuccess'));
          navigate("/dashboard");
        }
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, t('notification.signupError')));
      }
    })
  }

  const genderItems = [
    { label: t('register.genderPlaceholder'), value: null },
    { label: t('register.male'), value: 'MALE' },
    { label: t('register.female'), value: 'FEMALE' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* First name + Last name — side by side on desktop */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium tracking-widest text-primary">{t('register.firstName')} *</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input
              type="text"
              value={user.firstName}
              onChange={(e) => setValue('firstName', e.target.value)}
              placeholder={t('register.firstNamePlaceholder')}
              className="pl-10 border-primary placeholder:text-secondary"
              aria-invalid={!!errors.firstName}
            />
          </div>
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium tracking-widest text-primary">{t('register.lastName')} *</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input
              type="text"
              value={user.lastName}
              onChange={(e) => setValue('lastName', e.target.value)}
              placeholder={t('register.lastNamePlaceholder')}
              className="pl-10 border-primary placeholder:text-secondary"
              aria-invalid={!!errors.lastName}
            />
          </div>
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('register.email')} *</label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="email"
            value={user.email}
            onChange={(e) => setValue('email', e.target.value)}
            placeholder={t('register.emailPlaceholder')}
            className="pl-10 border-primary placeholder:text-secondary"
            aria-invalid={!!errors.email}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium tracking-widest text-primary">{t('register.gender')} *</label>
          <div className="relative">
            <BiMaleFemale size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Select items={genderItems} value={user.gender} onValueChange={(value) => setValue('gender', value)}>
              <SelectTrigger className="w-full pl-10 border-primary placeholder:text-secondary" aria-invalid={!!errors.gender}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {genderItems.map((item) => (
                    <SelectItem key={String(item.value)} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <label className="w-[76px] text-xs font-medium tracking-widest text-primary">{t('register.countryCallingCode')} *</label>
            <label className="flex-1 text-xs font-medium tracking-widest text-primary">{t('register.phoneNumber')} *</label>
          </div>
          <div className="flex items-start gap-2">
            <Input
              type="text"
              inputMode="tel"
              value={user.countryCallingCode}
              onChange={(e) => setValue('countryCallingCode', e.target.value)}
              placeholder={t('register.countryCallingCodePlaceholder')}
              maxLength={8}
              className="w-[76px] border-primary placeholder:text-secondary"
              aria-invalid={!!errors.countryCallingCode}
            />
            <div className="relative flex-1">
              <FaPhoneAlt size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                type="tel"
                value={user.phoneNumber}
                onChange={(e) => setValue('phoneNumber', e.target.value)}
                placeholder={t('register.phoneNumberPlaceholder')}
                className="pl-10 border-primary placeholder:text-secondary"
                aria-invalid={!!errors.phoneNumber}
              />
            </div>
          </div>
          {(errors.countryCallingCode || errors.phoneNumber) && (
            <p className="text-xs text-destructive">{errors.countryCallingCode ?? errors.phoneNumber}</p>
          )}
        </div>
      </div>

      {/* FRMG licence OR current handicap — one of the two must be declared */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/10 p-3">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-medium tracking-widest text-primary">{t('register.license')}</label>
            <div className="relative">
              <Award size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                type="text"
                value={user.frmglLicenseNumber}
                onChange={(e) => setValue('frmglLicenseNumber', e.target.value)}
                placeholder={t('register.licensePlaceholder')}
                className="pl-10 border-primary placeholder:text-secondary"
                aria-invalid={!!errors.frmglLicenseNumber}
              />
            </div>
            {errors.frmglLicenseNumber && <p className="text-xs text-destructive">{errors.frmglLicenseNumber}</p>}
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-medium tracking-widest text-primary">{t('register.handicap')}</label>
            <Input
              type="number"
              min="0"
              max="18"
              step="0.1"
              value={user.currentHandicap}
              onChange={(e) => setValue('currentHandicap', e.target.value)}
              placeholder={t('register.handicapPlaceholder')}
              className="border-primary placeholder:text-secondary"
              aria-invalid={!!errors.currentHandicap}
            />
            {errors.currentHandicap && <p className="text-xs text-destructive">{errors.currentHandicap}</p>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{t('register.licenseOrHandicapHint')}</p>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('register.password')} *</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="password"
            value={user.password}
            onChange={(e) => setValue('password', e.target.value)}
            placeholder={t('register.passwordPlaceholder')}
            className="pl-10 border-primary placeholder:text-secondary"
            aria-invalid={!!errors.password}
          />
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      {/* Submit */}
      <Button type="submit" size="lg" className="w-full" disabled={signupMutation.isPending}>
        {t('register.button')}
      </Button>

      {/* Switch to login */}
      <div className="mt-2 text-center text-sm text-muted-foreground">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
          {t('register.login')}
        </Link>
      </div>
    </form>
  );
}
