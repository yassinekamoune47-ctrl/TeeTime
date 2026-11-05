import {useMutation, useQueryClient} from "@tanstack/react-query";
import {authApi} from "@/api/endpoints/auth.api.ts";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {useTranslation} from "react-i18next";
import {useAuthStore} from "@/features/auth/store.ts";

export function useLogout() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useTranslation('auth')
    const logoutStore = useAuthStore((state) => state.logout);
    const clearSession = () => {
        queryClient.clear();
        logoutStore();
        navigate('/login', { replace: true });
    };
    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            clearSession();
            toast.success(t('notification.logoutSuccess'));
        },
        onError: () => {
            clearSession();
        },
    })
}
