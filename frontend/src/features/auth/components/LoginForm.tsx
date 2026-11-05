import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {Link, useNavigate} from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from "@/features/auth/hooks/useLogin.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

export default function LoginForm() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const navigate = useNavigate();

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Email address + password only: a username can never sign in.
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = t('login.emailRequired');
    if (!password) nextErrors.password = t('login.passwordRequired');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    loginMutation.mutate(
        { email: email.trim(), password },
        {
          onSuccess: (res) => {
            if (res.data.success) {
              toast.success(t('notification.loginSuccess'));
              navigate("/dashboard");
            }
          },
          onError: (err) => {
            const status = axios.isAxiosError(err) ? err.response?.status : undefined;
            setErrors({
              form: status === 401 || status === 422
                ? t('login.invalidCredentials')
                : getApiErrorMessage(err, t('notification.loginError')),
            });
          }
        }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('login.email')}</label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
            className="pl-10 border-primary placeholder:text-secondary"
            aria-invalid={!!errors.email}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('login.password')}</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            className="pl-10 border-primary placeholder:text-secondary"
            aria-invalid={!!errors.password}
          />
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      {errors.form && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-center text-sm text-destructive">
          {errors.form}
        </p>
      )}

      {/* Submit */}
      <Button type="submit" size="lg" className="w-full" disabled={loginMutation.isPending}>
        {t('login.button')}
      </Button>

      <div className="mt-2 text-center text-sm text-muted-foreground">
        {t('login.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary hover:text-primary-hover">
          {t('login.register')}
        </Link>
      </div>
    </form>
  );
}