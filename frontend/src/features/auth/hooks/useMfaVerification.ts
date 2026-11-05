import {useMutation} from "@tanstack/react-query";
import {authApi} from "@/api/endpoints/auth.api.ts";
import {toast} from "sonner";
import { useTranslation } from "react-i18next";
import {useAuthStore} from "@/features/auth/store.ts";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "@/lib/apiError.ts";

export function useMfaVerification() {
    const { t } = useTranslation('auth');
    const loginStore = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.mfaVerification,
        onSuccess: (response) => {
            if (response.data.success) {
                loginStore(response.data.data);
                toast.success(t('notification.loginSuccess'));
                navigate('/dashboard', { replace: true });
            }
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, t('notification.mfaVerificationError')));
        }
    })
}