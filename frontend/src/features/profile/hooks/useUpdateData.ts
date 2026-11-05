import {useTranslation} from "react-i18next";
import {useAuthStore} from "@/features/auth/store.ts";
import {useMutation} from "@tanstack/react-query";
import {userApi} from "@/api/endpoints/user.api.ts";
import {authApi} from "@/api/endpoints/auth.api.ts";
import {toast} from "sonner";
import {getApiErrorMessage} from "@/lib/apiError.ts";

export const useUpdateData = () => {
    const login = useAuthStore((state) => state.login);
    const {t} = useTranslation('app');

    return useMutation({
        mutationFn: userApi.updateMyData,
        onSuccess: async () => {
            try {
                const res = await authApi.me();
                if (res.data.success) {
                    login(res.data.data);
                }
                toast.success(t('profile.profileTab.saved'));
            } catch {
                toast.error(t('profile.profileTab.saveError'));
            }
        },
        onError: (err) => {
            toast.error(getApiErrorMessage(err, t('profile.profileTab.saveError')));
        }
    });
}
