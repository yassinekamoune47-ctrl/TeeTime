import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp.tsx"
import { useMfaVerification } from "@/features/auth/hooks/useMfaVerification.ts";
import { useAuthStore } from "@/features/auth/store.ts";
import { Button } from "@/components/ui/button";

export default function MfaVerificationPage() {
    const { t } = useTranslation('auth');
    const mfaPending = useAuthStore((s) => s.mfaPending);
    const [code, setCode] = useState('');
    const mfaVerificationMutation = useMfaVerification();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length === 6) {
            mfaVerificationMutation.mutate({ code });
        }
    };

    // Users who did not come from the login flow never see this page
    if (!mfaPending) return <Navigate to="/login" replace />;

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-md">
                <div className="rounded-lg border border-border bg-surface p-6 shadow-sm md:p-8">

                    {/* Back to login */}
                    <Link
                        to="/login"
                        className="mb-4 flex items-center gap-1.5 text-xs font-medium tracking-widest text-primary hover:text-primary-hover transition-colors"
                    >
                        <ArrowLeft size={14} />
                        {t('mfa.backToLogin', 'BACK TO LOGIN')}
                    </Link>

                    {/* Shield icon */}
                    <div className="mb-2 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck size={28} className="text-primary" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-6 text-center">
                        <h1 className="font-serif text-2xl font-bold text-secondary md:text-3xl">
                            {t('mfa.title', 'Two-Factor Authentication')}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('mfa.subtitle', 'Enter the 6-digit code sent to your email address')}
                        </p>
                    </div>

                    {/* OTP Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
                        <InputOTP
                            maxLength={6}
                            onChange={(value) => setCode(value)}
                            value={code}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={code.length !== 6 || mfaVerificationMutation.isPending}
                        >
                            {mfaVerificationMutation.isPending
                                ? t('mfa.verifying', 'Verifying...')
                                : t('mfa.verify', 'Verify Code')}
                        </Button>
                    </form>

                    {/* Resend hint */}
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        {t('mfa.resendHint', "Didn't receive the code? Check your spam folder or try logging in again.")}
                    </p>
                </div>
            </div>
        </div>
    );
}